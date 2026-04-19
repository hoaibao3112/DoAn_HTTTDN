import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';
import ExcelJS from 'exceljs';

const salesController = {
    // ======================= 4.1 POS SESSIONS (Phiên bán hàng) =======================

    openSession: async (req, res) => {
        const { MaCH, TienBanDau } = req.body;
        try {
            const [result] = await pool.query(
                'INSERT INTO phien_ban_hang (MaNV, MaCH, TienBanDau) VALUES (?, ?, ?)',
                [req.user.MaTK, MaCH, TienBanDau]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'phien_ban_hang',
                MaBanGhi: result.insertId,
                DuLieuMoi: { MaCH, TienBanDau },
                DiaChi_IP: req.ip,
                GhiChu: 'Mở phiên bán hàng mới'
            });

            res.json({ success: true, MaPhien: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    closeSession: async (req, res) => {
        const { MaPhien, TienKetThuc } = req.body;
        try {
            const [session] = await pool.query('SELECT TienBanDau, TongTienMat FROM phien_ban_hang WHERE MaPhien = ?', [MaPhien]);
            if (!session.length) throw new Error('Phiên không tồn tại');

            const expectedCash = parseFloat(session[0].TienBanDau) + parseFloat(session[0].TongTienMat);
            const chenhLech = parseFloat(TienKetThuc) - expectedCash;

            await pool.query(
                'UPDATE phien_ban_hang SET ThoiGianDong = NOW(), TienKetThuc = ?, GhiChu = ? WHERE MaPhien = ?',
                [TienKetThuc, `Chênh lệch: ${chenhLech}`, MaPhien]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'phien_ban_hang',
                MaBanGhi: MaPhien,
                DuLieuCu: { TienBanDau: session[0].TienBanDau, TongTienMat: session[0].TongTienMat },
                DuLieuMoi: { TienKetThuc, ChenhLech: chenhLech },
                DiaChi_IP: req.ip,
                GhiChu: 'Đóng phiên bán hàng'
            });

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

            const productIds = ChiTiet.map(item => item.MaSP);
            const [products] = await conn.query(
                'SELECT MaSP FROM sanpham WHERE MaSP IN (?) AND TinhTrang = 1',
                [productIds]
            );
            const validProductIds = products.map(p => p.MaSP);
            for (const id of productIds) {
                if (!validProductIds.includes(id)) {
                    throw new Error(`Sản phẩm MaSP=${id} không tồn tại hoặc đã bị vô hiệu hóa`);
                }
            }
            
            let TongTienGoc = 0;
            let TongGiamChiTiet = 0;
            
            for (const item of ChiTiet) {
                const itemTotal = item.DonGia * item.SoLuong;
                TongTienGoc += itemTotal;
                TongGiamChiTiet += (item.GiamGia || 0);
            }

            let remaining = TongTienGoc - TongGiamChiTiet;
            
            if (GiamGia > remaining) {
                throw new Error(
                    `Chiết khấu cửa hàng (${GiamGia.toLocaleString('vi-VN')}) ` +
                    `vượt quá số tiền còn lại (${remaining.toLocaleString('vi-VN')})`
                );
            }
            remaining -= GiamGia;
            
            let pointDeduction = 0;
            if (MaKH && DiemSuDung && DiemSuDung > 0) {
                const [customer] = await conn.query(
                    'SELECT MaKH, DiemTichLuy FROM khachhang WHERE MaKH = ? FOR UPDATE',
                    [MaKH]
                );
                if (!customer.length) {
                    throw new Error(`Khách hàng MaKH=${MaKH} không tồn tại`);
                }
                
                pointDeduction = DiemSuDung * 1000;
                if (customer[0].DiemTichLuy < DiemSuDung) {
                    throw new Error(
                        `Khách hàng chỉ có ${customer[0].DiemTichLuy} điểm, ` +
                        `nhưng cố dùng ${DiemSuDung} điểm (${pointDeduction.toLocaleString('vi-VN')}đ)`
                    );
                }
            }
            
            if (pointDeduction > remaining) {
                throw new Error(
                    `Điểm sử dụng (${pointDeduction.toLocaleString('vi-VN')}đ) ` +
                    `vượt quá số tiền còn lại (${remaining.toLocaleString('vi-VN')}đ)`
                );
            }
            remaining -= pointDeduction;
            
            if (remaining < 0) {
                throw new Error(`Tổng thanh toán âm (${remaining.toLocaleString('vi-VN')}đ). Vui lòng kiểm tra lại.`);
            }
            
            const tongThanhToan = remaining;
            const diemTichLuyMoi = Math.floor(TongTienGoc * 0.01);

            // Dynamic status based on payment method
            const initialStatus = ['VNPay', 'MoMo', 'ZaloPay'].includes(PhuongThucTT) ? 'Chua_thanh_toan' : 'Hoan_thanh';

            const [hdResult] = await conn.query(
                `INSERT INTO hoadon (MaKH, MaNV, MaCH, TongTien, GiamGia, DiemSuDung, DiemTichLuy, ThanhToan, PhuongThucTT, TrangThai) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [MaKH || null, req.user.MaTK, MaCH, TongTienGoc, GiamGia || 0, DiemSuDung || 0, diemTichLuyMoi, tongThanhToan, PhuongThucTT, initialStatus]
            );
            const MaHD = hdResult.insertId;

            if (ChiTiet.length > 0) {
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

                const [allWarehouses] = await conn.query(`
                    SELECT kc.MaKho, kc.TenKho, kc.Priority,
                           COALESCE(tkct.SoLuongTon, 0) AS TonHienTai,
                           tkct.MaSP
                    FROM kho_con kc
                    LEFT JOIN ton_kho_chi_tiet tkct ON tkct.MaKho = kc.MaKho
                    WHERE kc.MaCH = ? AND kc.TinhTrang = 1
                    ORDER BY kc.Priority ASC
                    FOR UPDATE
                `, [MaCH]);
                
                for (const item of ChiTiet) {
                    const warehouses = allWarehouses
                        .filter(w => w.MaSP === item.MaSP || w.MaSP === null)
                        .sort((a, b) => a.Priority - b.Priority);

                    if (warehouses.length === 0) {
                        throw new Error(`Không tìm thấy kho hoạt động nào trong cửa hàng.`);
                    }

                    const totalAvailable = warehouses.reduce((sum, wh) => sum + wh.TonHienTai, 0);
                    if (totalAvailable < item.SoLuong) {
                        throw new Error(
                            `Sản phẩm MaSP=${item.MaSP} tồn: ${totalAvailable}, yêu cầu: ${item.SoLuong}.`
                        );
                    }

                    let remaining = item.SoLuong;
                    for (const wh of warehouses) {
                        if (remaining <= 0) break;
                        const toTake = Math.min(remaining, wh.TonHienTai);
                        if (toTake > 0) {
                            await conn.query(
                                'UPDATE ton_kho_chi_tiet SET SoLuongTon = SoLuongTon - ? WHERE MaKho = ? AND MaSP = ?',
                                [toTake, wh.MaKho, item.MaSP]
                            );
                            remaining -= toTake;
                        }
                    }
                }

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

            if (MaKH) {
                await conn.query(
                    'UPDATE khachhang SET DiemTichLuy = DiemTichLuy - ? + ?, TongChiTieu = TongChiTieu + ? WHERE MaKH = ?',
                    [DiemSuDung || 0, diemTichLuyMoi, tongThanhToan, MaKH]
                );
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'hoadon',
                MaBanGhi: MaHD,
                DuLieuMoi: { MaKH, TongTien: TongTienGoc, ThanhToan: tongThanhToan },
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

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'hoadon',
                MaBanGhi: id,
                DuLieuMoi: { TrangThai: trangthai, GhiChu: ghichu },
                DiaChi_IP: req.ip,
                GhiChu: 'Cập nhật trạng thái hóa đơn'
            });

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

            const [details] = await conn.query('SELECT MaSP, SoLuong, MaCH FROM chitiethoadon JOIN hoadon ON chitiethoadon.MaHD = hoadon.MaHD WHERE hoadon.MaHD = ?', [id]);
            if (details.length > 0) {
                const caseClauses = details
                    .map(item => `WHEN MaSP = ${conn.escape(item.MaSP)} AND MaCH = ${conn.escape(item.MaCH)} THEN SoLuongTon + ${item.SoLuong}`)
                    .join(' ');
                
                await conn.query(`
                    UPDATE ton_kho 
                    SET SoLuongTon = CASE ${caseClauses} ELSE SoLuongTon END
                    WHERE (MaSP, MaCH) IN (${details.map(() => '(?,?)').join(',')})
                `, details.flatMap(item => [item.MaSP, item.MaCH]));
            }

            await conn.query(
                'UPDATE hoadon SET TrangThai = "Da_huy", GhiChu = ? WHERE MaHD = ?',
                [lyDo || 'Hủy bởi quản trị viên', id]
            );

            if (hd[0].MaKH) {
                await conn.query(
                    'UPDATE khachhang SET TongChiTieu = TongChiTieu - ? WHERE MaKH = ?',
                    [hd[0].ThanhToan, hd[0].MaKH]
                );
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'hoadon',
                MaBanGhi: id,
                DuLieuCu: { TrangThai: hd[0].TrangThai },
                DuLieuMoi: { TrangThai: 'Da_huy', LyDo: lyDo },
                DiaChi_IP: req.ip,
                GhiChu: 'Hủy hóa đơn và hoàn kho'
            });

            await conn.commit();
            res.json({ success: true, message: 'Hủy hóa đơn thành công và đã hoàn kho' });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    exportLatestInvoices: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const [rows] = await pool.query(
                `SELECT hd.MaHD, hd.MaKH, kh.HoTen as TenKH, kh.SDT as SDTKH, hd.NgayBan, hd.TongTien, hd.GiamGia, hd.DiemSuDung, hd.ThanhToan, hd.TrangThai, nv.HoTen as TenNV, ch.TenCH as TenCH
                 FROM hoadon hd
                 LEFT JOIN khachhang kh ON hd.MaKH = kh.MaKH
                 LEFT JOIN nhanvien nv ON hd.MaNV = nv.MaNV
                 LEFT JOIN cua_hang ch ON hd.MaCH = ch.MaCH
                 ORDER BY hd.NgayBan DESC
                 LIMIT ?`, [limit]
            );

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Bansach System';
            workbook.created = new Date();
            const sheet = workbook.addWorksheet('Invoices');

            sheet.columns = [
                { header: 'Mã HĐ', key: 'MaHD', width: 10 },
                { header: 'Mã KH', key: 'MaKH', width: 10 },
                { header: 'Tên KH', key: 'TenKH', width: 30 },
                { header: 'SĐT KH', key: 'SDTKH', width: 18 },
                { header: 'Ngày bán', key: 'NgayBan', width: 20 },
                { header: 'Tổng tiền', key: 'TongTien', width: 14 },
                { header: 'Giảm giá', key: 'GiamGia', width: 12 },
                { header: 'Điểm sử dụng', key: 'DiemSuDung', width: 12 },
                { header: 'Thanh toán', key: 'ThanhToan', width: 14 },
                { header: 'Trạng thái', key: 'TrangThai', width: 14 },
                { header: 'Nhân viên', key: 'TenNV', width: 25 },
                { header: 'Cửa hàng', key: 'TenCH', width: 25 }
            ];

            sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F75FE' } };

            rows.forEach(r => {
                sheet.addRow({
                    MaHD: r.MaHD,
                    MaKH: r.MaKH || '',
                    TenKH: r.TenKH || '',
                    SDTKH: r.SDTKH || '',
                    NgayBan: r.NgayBan ? new Date(r.NgayBan) : null,
                    TongTien: r.TongTien ?? null,
                    GiamGia: r.GiamGia ?? null,
                    DiemSuDung: r.DiemSuDung ?? null,
                    ThanhToan: r.ThanhToan ?? null,
                    TrangThai: r.TrangThai || '',
                    TenNV: r.TenNV || '',
                    TenCH: r.TenCH || ''
                });
            });

            sheet.getColumn('NgayBan').numFmt = 'dd/mm/yyyy hh:mm';
            ['TongTien','GiamGia','ThanhToan'].forEach(key => {
                sheet.getColumn(key).numFmt = '#,##0';
                sheet.getColumn(key).alignment = { horizontal: 'right' };
            });

            sheet.autoFilter = { from: 'A1', to: 'L1' };
            sheet.views = [{ state: 'frozen', ySplit: 1 }];

            const buffer = await workbook.xlsx.writeBuffer();
            const filename = `invoices_latest_${limit}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default salesController;
