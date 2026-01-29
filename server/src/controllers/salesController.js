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
                `INSERT INTO hoadon (MaKH, MaNV, MaCH, MaPhien, TongTien, GiamGia, DiemSuDung, DiemTichLuy, ThanhToan, PhuongThucTT, TrangThai) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Hoan_thanh')`,
                [MaKH || null, req.user.MaTK, MaCH, MaPhien, subTotal, GiamGia, DiemSuDung || 0, diemTichLuyMoi, tongThanhToan, PhuongThucTT]
            );
            const MaHD = hdResult.insertId;

            // 3. Process items
            for (const item of ChiTiet) {
                // Insert detail
                await conn.query(
                    'INSERT INTO chitiethoadon (MaHD, MaSP, DonGia, SoLuong, GiamGia) VALUES (?, ?, ?, ?, ?)',
                    [MaHD, item.MaSP, item.DonGia, item.SoLuong, item.GiamGia || 0]
                );

                // Deduct from ton_kho
                await conn.query(
                    'UPDATE ton_kho SET SoLuongTon = SoLuongTon - ? WHERE MaSP = ? AND MaCH = ?',
                    [item.SoLuong, item.MaSP, MaCH]
                );
            }

            // 4. Update Customer Points & Loyalty
            if (MaKH) {
                await conn.query(
                    'UPDATE khachhang SET DiemTichLuy = DiemTichLuy - ? + ?, TongChiTieu = TongChiTieu + ? WHERE MaKH = ?',
                    [DiemSuDung || 0, diemTichLuyMoi, tongThanhToan, MaKH]
                );
            }

            // 5. Update POS Session Totals
            const isCash = PhuongThucTT === 'Tien_mat';
            await conn.query(
                `UPDATE phien_ban_hang SET 
          TongTienMat = TongTienMat + ?, 
          TongDoanhThu = TongDoanhThu + ?, 
          SoHoaDon = SoHoaDon + 1 
         WHERE MaPhien = ?`,
                [isCash ? tongThanhToan : 0, tongThanhToan, MaPhien]
            );

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
                SELECT hd.*, kh.HoTen as TenKH, kh.SDT as SDTKH, nv.HoTen as TenNV, ch.TenCH
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
                SELECT hd.*, kh.HoTen as TenKH, kh.SDT as SDTKH, kh.Email as EmailKH, nv.HoTen as TenNV, ch.TenCH, ch.DiaChi as DiaChiCH, ch.SDT as SDTCH
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
