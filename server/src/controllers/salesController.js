import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const salesController = {
    // ======================= 4.1 POS SESSIONS (Phiên bán hàng) =======================

    openSession: async (req, res) => {
        const { MaCH, TienBanDau } = req.body;
        try {
            const [result] = await pool.query(
                'INSERT INTO phien_ban_hang (MaNV, MaCH, TienBanDau) VALUES (?, ?, ?)',
                [req.user.MaTK, MaCH, TienBanDau]
            );
            res.json({ success: true, MaPhien: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    closeSession: async (req, res) => {
        const { MaPhien, TienKetThuc } = req.body;
        try {
            // Fetch current session totals
            const [session] = await pool.query('SELECT TienBanDau, TongTienMat FROM phien_ban_hang WHERE MaPhien = ?', [MaPhien]);
            if (!session.length) throw new Error('Phiên không tồn tại');

            const expectedCash = parseFloat(session[0].TienBanDau) + parseFloat(session[0].TongTienMat);
            const chenhLech = parseFloat(TienKetThuc) - expectedCash;

            await pool.query(
                'UPDATE phien_ban_hang SET ThoiGianDong = NOW(), TienKetThuc = ?, GhiChu = ? WHERE MaPhien = ?',
                [TienKetThuc, `Chênh lệch: ${chenhLech}`, MaPhien]
            );

            res.json({ success: true, chenhLech });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= 4.2 INVOICING (Lập hóa đơn) =======================

    createInvoice: async (req, res) => {
        const { MaKH, MaCH, MaPhien, ChiTiet, GiamGia, DiemSuDung, PhuongThucTT } = req.body;
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 1. Calculate totals
            let subTotal = 0;
            for (const item of ChiTiet) {
                subTotal += (item.DonGia * item.SoLuong) - (item.GiamGia || 0);
            }

            const tongThanhToan = subTotal - GiamGia - (DiemSuDung ? DiemSuDung * 1000 : 0);
            const diemTichLuyMoi = Math.floor(tongThanhToan * 0.01); // 1% value

            // 2. Create hoadon record
            const [hdResult] = await conn.query(
                `INSERT INTO hoadon (MaKH, MaNV, MaCH, TongTien, GiamGia, DiemSuDung, DiemTichLuy, ThanhToan, PhuongThucTT, TrangThai) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Hoan_thanh')`,
                [MaKH || null, req.user.MaTK, MaCH, subTotal, GiamGia, DiemSuDung || 0, diemTichLuyMoi, tongThanhToan, PhuongThucTT]
            );
            const MaHD = hdResult.insertId;

            // 3. Process items - Batch operations để tránh N+1 query
            if (ChiTiet.length > 0) {
                // 3a. Batch INSERT chi tiết hóa đơn
                const detailValues = ChiTiet.map(item => [
                    MaHD, 
                    item.MaSP, 
                    item.DonGia, 
                    item.SoLuong, 
                    item.GiamGia || 0
                ]);
                await conn.query(
                    'INSERT INTO chitiethoadon (MaHD, MaSP, DonGia, SoLuong, GiamGia) VALUES ?',
                    [detailValues]
                );

                // 3b. ✅ TỰ ĐỘNG LẤY HÀNG TỪ NHIỀU KHO THEO PRIORITY
                // - Ưu tiên lấy từ kho quầy (Priority=1) trước
                // - Nếu quầy không đủ → tự động lấy từ kho phụ (Priority=2,3...)
                // - Nếu toàn cửa hàng không đủ → báo lỗi
                const warehouseAllocations = [];
                
                for (const item of ChiTiet) {
                    // Lấy tất cả kho của cửa hàng này, sắp xếp theo Priority
                    const [warehouses] = await conn.query(`
                        SELECT kc.MaKho, kc.TenKho, kc.Priority,
                               COALESCE(tkct.SoLuongTon, 0) AS TonHienTai
                        FROM kho_con kc
                        LEFT JOIN ton_kho_chi_tiet tkct ON tkct.MaKho = kc.MaKho AND tkct.MaSP = ?
                        WHERE kc.MaCH = ? AND kc.TinhTrang = 1
                        ORDER BY kc.Priority ASC
                        FOR UPDATE
                    `, [item.MaSP, MaCH]);

                    if (warehouses.length === 0) {
                        throw new Error(`Không tìm thấy kho hoạt động nào trong cửa hàng.`);
                    }

                    // Tính tổng tồn kho toàn cửa hàng
                    const totalAvailable = warehouses.reduce((sum, wh) => sum + wh.TonHienTai, 0);
                    if (totalAvailable < item.SoLuong) {
                        throw new Error(
                            `Sản phẩm MaSP=${item.MaSP} ` +
                            `tồn: ${totalAvailable}, yêu cầu: ${item.SoLuong}.`
                        );
                    }

                    // Phân bổ từ các kho theo Priority (nhỏ → lớn, nghĩa là quầy trước)
                    let remaining = item.SoLuong;
                    const itemAllocations = [];

                    for (const wh of warehouses) {
                        if (remaining <= 0) break;

                        const toTake = Math.min(remaining, wh.TonHienTai);
                        if (toTake > 0) {
                            // Trừ từ kho này
                            await conn.query(
                                'UPDATE ton_kho_chi_tiet SET SoLuongTon = SoLuongTon - ? WHERE MaKho = ? AND MaSP = ?',
                                [toTake, wh.MaKho, item.MaSP]
                            );

                            itemAllocations.push({
                                MaKho: wh.MaKho,
                                TenKho: wh.TenKho,
                                Priority: wh.Priority,
                                SoLuong: toTake
                            });

                            remaining -= toTake;
                        }
                    }

                    warehouseAllocations.push({
                        MaSP: item.MaSP,
                        allocations: itemAllocations
                    });
                }

                // 3c. Cập nhật tồn kho tổng quát (ton_kho) để tương thích với hệ thống cũ
                const productIds = ChiTiet.map(item => item.MaSP);
                const caseClauses = ChiTiet.map(item => 
                    `WHEN MaSP = ${conn.escape(item.MaSP)} THEN SoLuongTon - ${item.SoLuong}`
                ).join(' ');

                await conn.query(`
                    UPDATE ton_kho 
                    SET SoLuongTon = CASE ${caseClauses} END
                    WHERE MaSP IN (?) AND MaCH = ?
                `, [productIds, MaCH]);
            }

            // 4. Update Customer Points & Loyalty
            if (MaKH) {
                await conn.query(
                    'UPDATE khachhang SET DiemTichLuy = DiemTichLuy - ? + ?, TongChiTieu = TongChiTieu + ? WHERE MaKH = ?',
                    [DiemSuDung || 0, diemTichLuyMoi, tongThanhToan, MaKH]
                );
            }

            // 5. (phien_ban_hang chưa có trong DB - bỏ qua)

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'hoadon',
                MaBanGhi: MaHD,
                DuLieuMoi: { MaKH, TongThanhToan: tongThanhToan },
                DiaChi_IP: req.ip
            });

            await conn.commit();
            res.json({ success: true, MaHD, message: 'Hóa đơn đã được tạo thành công' });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    // ======================= 4.3 INVOICE MANAGEMENT =======================

    getAllInvoices: async (req, res) => {
        try {
            const { search, MaCH, fromDate, toDate } = req.query;
            let sql = `
                SELECT hd.*, kh.HoTen as TenKH, kh.SDT as SDTKH, nv.HoTen as TenNV, ch.TenCH AS TenCH
                FROM hoadon hd
                LEFT JOIN khachhang kh ON hd.MaKH = kh.MaKH
                LEFT JOIN nhanvien nv ON hd.MaNV = nv.MaNV
                LEFT JOIN cua_hang ch ON hd.MaCH = ch.MaCH
                WHERE 1=1
            `;
            const params = [];

            if (search) {
                sql += ' AND (hd.MaHD = ? OR kh.HoTen LIKE ? OR kh.SDT LIKE ?)';
                params.push(search, `%${search}%`, `%${search}%`);
            }
            if (MaCH) {
                sql += ' AND hd.MaCH = ?';
                params.push(MaCH);
            }
            if (fromDate) {
                sql += ' AND hd.NgayBan >= ?';
                params.push(fromDate);
            }
            if (toDate) {
                sql += ' AND hd.NgayBan <= ?';
                params.push(toDate);
            }

            sql += ' ORDER BY hd.NgayBan DESC';

            const [rows] = await pool.query(sql, params);
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getInvoiceById: async (req, res) => {
        const { id } = req.params;
        try {
            // Get invoice header
            const [hd] = await pool.query(`
                SELECT hd.*, kh.HoTen as TenKH, kh.SDT as SDTKH, kh.Email as EmailKH, nv.HoTen as TenNV, ch.TenCH AS TenCH, ch.DiaChi as DiaChiCH, ch.SDT as SDTCH
                FROM hoadon hd
                LEFT JOIN khachhang kh ON hd.MaKH = kh.MaKH
                LEFT JOIN nhanvien nv ON hd.MaNV = nv.MaNV
                LEFT JOIN cua_hang ch ON hd.MaCH = ch.MaCH
                WHERE hd.MaHD = ?
            `, [id]);

            if (hd.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
            }

            // Get invoice details
            const [details] = await pool.query(`
                SELECT ct.*, sp.TenSP, sp.HinhAnh
                FROM chitiethoadon ct
                JOIN sanpham sp ON ct.MaSP = sp.MaSP
                WHERE ct.MaHD = ?
            `, [id]);

            res.json({
                success: true,
                data: {
                    ...hd[0],
                    ChiTiet: details
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateInvoiceStatus: async (req, res) => {
        const { id } = req.params;
        const { trangthai, ghichu } = req.body;
        try {
            await pool.query(
                'UPDATE hoadon SET TrangThai = ?, GhiChu = ? WHERE MaHD = ?',
                [trangthai, ghichu, id]
            );
            res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    cancelInvoice: async (req, res) => {
        const { id } = req.params;
        const { lyDo } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [hd] = await conn.query('SELECT MaKH, ThanhToan, TrangThai FROM hoadon WHERE MaHD = ?', [id]);
            if (!hd.length) throw new Error('Hóa đơn không tồn tại');
            if (hd[0].TrangThai === 'Da_huy') throw new Error('Hóa đơn đã bị hủy');

            // 1. Restore stock
            const [details] = await conn.query('SELECT MaSP, SoLuong, MaCH FROM chitiethoadon JOIN hoadon ON chitiethoadon.MaHD = hoadon.MaHD WHERE hoadon.MaHD = ?', [id]);
            for (const item of details) {
                await conn.query(
                    'UPDATE ton_kho SET SoLuongTon = SoLuongTon + ? WHERE MaSP = ? AND MaCH = ?',
                    [item.SoLuong, item.MaSP, item.MaCH]
                );
            }

            // 2. Update status
            await conn.query(
                'UPDATE hoadon SET TrangThai = "Da_huy", GhiChu = ? WHERE MaHD = ?',
                [lyDo || 'Hủy bởi quản trị viên', id]
            );

            // 3. Revert loyalty
            if (hd[0].MaKH) {
                await conn.query(
                    'UPDATE khachhang SET TongChiTieu = TongChiTieu - ? WHERE MaKH = ?',
                    [hd[0].ThanhToan, hd[0].MaKH]
                );
            }

            await conn.commit();
            res.json({ success: true, message: 'Hủy hóa đơn thành công và đã hoàn kho' });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    }
};

export default salesController;
