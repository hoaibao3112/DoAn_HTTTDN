import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const returnController = {
    // ======================= GET ALL RETURNS =======================
    getAllReturns: async (req, res) => {
        const { page = 1, pageSize = 20, TrangThai, startDate, endDate } = req.query;
        const offset = (page - 1) * pageSize;

        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (TrangThai) {
                whereClause += ' AND th.TrangThai = ?';
                params.push(TrangThai);
            }
            if (startDate) {
                whereClause += ' AND th.NgayTra >= ?';
                params.push(startDate);
            }
            if (endDate) {
                whereClause += ' AND th.NgayTra <= ?';
                params.push(endDate);
            }

            const [rows] = await pool.query(
                `SELECT th.*, 
                        kh.HoTen as TenKH, kh.SDT as SDTKH,
                        hd.NgayBan, hd.TongTien as TongTienHD,
                        nv.HoTen as NguoiDuyetTen
                 FROM tra_hang th
                 LEFT JOIN khachhang kh ON th.MaKH = kh.MaKH
                 LEFT JOIN hoadon hd ON th.MaHD = hd.MaHD
                 LEFT JOIN nhanvien nv ON th.NguoiDuyet = nv.MaNV
                 ${whereClause}
                 ORDER BY th.NgayTra DESC
                 LIMIT ? OFFSET ?`,
                [...params, parseInt(pageSize), offset]
            );

            const [total] = await pool.query(
                `SELECT COUNT(*) as total FROM tra_hang th ${whereClause}`,
                params
            );

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: total[0].total
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= GET RETURN BY ID =======================
    getReturnById: async (req, res) => {
        const { id } = req.params;
        try {
            // Get return header
            const [header] = await pool.query(
                `SELECT th.*, 
                        kh.HoTen as TenKH, kh.SDT as SDTKH, kh.Email as EmailKH,
                        hd.NgayBan, hd.TongTien as TongTienHD, hd.MaNV as MaNVBan,
                        nv.HoTen as NguoiDuyetTen
                 FROM tra_hang th
                 LEFT JOIN khachhang kh ON th.MaKH = kh.MaKH
                 LEFT JOIN hoadon hd ON th.MaHD = hd.MaHD
                 LEFT JOIN nhanvien nv ON th.NguoiDuyet = nv.MaNV
                 WHERE th.MaTraHang = ?`,
                [id]
            );

            if (header.length === 0) {
                return res.status(404).json({ success: false, message: 'Phiếu trả hàng không tồn tại' });
            }

            // Get return details
            const [details] = await pool.query(
                `SELECT cth.*, sp.TenSP, sp.HinhAnh
                 FROM chi_tiet_tra_hang cth
                 JOIN sanpham sp ON cth.MaSP = sp.MaSP
                 WHERE cth.MaTraHang = ?`,
                [id]
            );

            res.json({
                success: true,
                data: {
                    ...header[0],
                    ChiTiet: details
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= CREATE RETURN =======================
    createReturn: async (req, res) => {
        const { MaHD, MaKH, LyDo, ChiTiet, HinhThucHoanTien, GhiChu } = req.body;

        // Validation
        if (!MaHD || !ChiTiet || ChiTiet.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin: MaHD và ChiTiet là bắt buộc'
            });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Verify invoice exists
            const [invoice] = await conn.query('SELECT * FROM hoadon WHERE MaHD = ?', [MaHD]);
            if (invoice.length === 0) {
                throw new Error('Hóa đơn không tồn tại');
            }

            // Calculate total return amount
            let tongTienTra = 0;
            for (const item of ChiTiet) {
                tongTienTra += (item.SoLuong * item.DonGia);
            }

            // Create return record
            const [returnResult] = await conn.query(
                `INSERT INTO tra_hang (MaHD, MaKH, LyDo, TongTienTra, HinhThucHoanTien, TrangThai, GhiChu)
                 VALUES (?, ?, ?, ?, ?, 'Cho_duyet', ?)`,
                [MaHD, MaKH, LyDo, tongTienTra, HinhThucHoanTien || 'Tien_mat', GhiChu]
            );

            const MaTraHang = returnResult.insertId;

            // Insert return details and restore inventory
            for (const item of ChiTiet) {
                // Insert detail
                await conn.query(
                    'INSERT INTO chi_tiet_tra_hang (MaTraHang, MaSP, SoLuong, DonGia) VALUES (?, ?, ?, ?)',
                    [MaTraHang, item.MaSP, item.SoLuong, item.DonGia]
                );

                // Restore inventory (return to stock)
                const MaCH = invoice[0].MaCH;
                await conn.query(
                    'UPDATE ton_kho SET SoLuongTon = SoLuongTon + ? WHERE MaSP = ? AND MaCH = ?',
                    [item.SoLuong, item.MaSP, MaCH]
                );
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'tra_hang',
                MaBanGhi: MaTraHang,
                DuLieuMoi: { MaHD, TongTienTra: tongTienTra },
                DiaChi_IP: req.ip
            });

            await conn.commit();
            res.json({
                success: true,
                MaTraHang,
                message: 'Tạo phiếu trả hàng thành công. Chờ duyệt.'
            });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    // ======================= APPROVE/REJECT RETURN =======================
    approveReturn: async (req, res) => {
        const { id } = req.params;
        const { TrangThai, GhiChu } = req.body; // 'Da_duyet' or 'Tu_choi'

        if (!['Da_duyet', 'Tu_choi'].includes(TrangThai)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: Da_duyet hoặc Tu_choi'
            });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Get return info
            const [returnData] = await conn.query('SELECT * FROM tra_hang WHERE MaTraHang = ?', [id]);
            if (returnData.length === 0) {
                throw new Error('Phiếu trả hàng không tồn tại');
            }

            if (returnData[0].TrangThai !== 'Cho_duyet') {
                throw new Error('Phiếu trả hàng đã được xử lý');
            }

            // Get reviewer MaNV
            const [reviewer] = await conn.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            const NguoiDuyet = reviewer.length > 0 ? reviewer[0].MaNV : null;

            // If rejected, restore inventory back
            if (TrangThai === 'Tu_choi') {
                const [invoice] = await conn.query('SELECT MaCH FROM hoadon WHERE MaHD = ?', [returnData[0].MaHD]);
                const MaCH = invoice[0].MaCH;

                const [details] = await conn.query('SELECT * FROM chi_tiet_tra_hang WHERE MaTraHang = ?', [id]);
                for (const item of details) {
                    // Reverse the inventory restoration from creation
                    await conn.query(
                        'UPDATE ton_kho SET SoLuongTon = SoLuongTon - ? WHERE MaSP = ? AND MaCH = ?',
                        [item.SoLuong, item.MaSP, MaCH]
                    );
                }
            } else {
                // If approved, update customer points if applicable
                if (returnData[0].MaKH) {
                    const tongTienTra = parseFloat(returnData[0].TongTienTra);
                    const diemTru = Math.floor(tongTienTra * 0.01); // Deduct 1% as points

                    await conn.query(
                        'UPDATE khachhang SET DiemTichLuy = GREATEST(DiemTichLuy - ?, 0), TongChiTieu = TongChiTieu - ? WHERE MaKH = ?',
                        [diemTru, tongTienTra, returnData[0].MaKH]
                    );
                }
            }

            // Update return status
            await conn.query(
                `UPDATE tra_hang 
                 SET TrangThai = ?, NguoiDuyet = ?, NgayDuyet = NOW(), GhiChu = ?
                 WHERE MaTraHang = ?`,
                [TrangThai, NguoiDuyet, GhiChu, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Duyet',
                BangDuLieu: 'tra_hang',
                MaBanGhi: id,
                DuLieuMoi: { TrangThai, NguoiDuyet },
                DiaChi_IP: req.ip
            });

            await conn.commit();
            res.json({
                success: true,
                message: TrangThai === 'Da_duyet' ? 'Duyệt trả hàng thành công' : 'Từ chối trả hàng'
            });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    }
};

export default returnController;
