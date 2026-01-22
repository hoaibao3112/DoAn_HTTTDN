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
    }
};

export default salesController;
