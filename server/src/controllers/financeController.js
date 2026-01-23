import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const financeController = {
    // ======================= EXPENSE MANAGEMENT =======================

    getAllExpenses: async (req, res) => {
        const { page = 1, pageSize = 20, MaLoai, MaCH, TrangThai, startDate, endDate } = req.query;
        const offset = (page - 1) * pageSize;

        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (MaLoai) {
                whereClause += ' AND cp.MaLoai = ?';
                params.push(MaLoai);
            }
            if (MaCH) {
                whereClause += ' AND cp.MaCH = ?';
                params.push(MaCH);
            }
            if (TrangThai) {
                whereClause += ' AND cp.TrangThai = ?';
                params.push(TrangThai);
            }
            if (startDate) {
                whereClause += ' AND cp.NgayPhatSinh >= ?';
                params.push(startDate);
            }
            if (endDate) {
                whereClause += ' AND cp.NgayPhatSinh <= ?';
                params.push(endDate);
            }

            const [rows] = await pool.query(
                `SELECT cp.*, lcp.TenLoai, ch.TenCH, nv.HoTen as NguoiLapTen
                 FROM chi_phi cp
                 LEFT JOIN loai_chi_phi lcp ON cp.MaLoai = lcp.MaLoai
                 LEFT JOIN cua_hang ch ON cp.MaCH = ch.MaCH
                 LEFT JOIN nhanvien nv ON cp.NguoiLap = nv.MaNV
                 ${whereClause}
                 ORDER BY cp.NgayPhatSinh DESC
                 LIMIT ? OFFSET ?`,
                [...params, parseInt(pageSize), offset]
            );

            const [total] = await pool.query(
                `SELECT COUNT(*) as total FROM chi_phi cp ${whereClause}`,
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

    getExpenseById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query(
                `SELECT cp.*, lcp.TenLoai, ch.TenCH, nv.HoTen as NguoiLapTen
                 FROM chi_phi cp
                 LEFT JOIN loai_chi_phi lcp ON cp.MaLoai = lcp.MaLoai
                 LEFT JOIN cua_hang ch ON cp.MaCH = ch.MaCH
                 LEFT JOIN nhanvien nv ON cp.NguoiLap = nv.MaNV
                 WHERE cp.MaCP = ?`,
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Chi phí không tồn tại' });
            }

            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createExpense: async (req, res) => {
        const { MaLoai, MaCH, TenChiPhi, SoTien, NgayPhatSinh, TrangThai, FileDinhKem, GhiChu } = req.body;

        // Validation
        if (!MaLoai || !TenChiPhi || !SoTien || !NgayPhatSinh) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: MaLoai, TenChiPhi, SoTien, NgayPhatSinh'
            });
        }

        if (SoTien <= 0) {
            return res.status(400).json({ success: false, message: 'Số tiền phải lớn hơn 0' });
        }

        try {
            // Get employee MaNV from MaTK
            const [emp] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            const NguoiLap = emp.length > 0 ? emp[0].MaNV : null;

            const [result] = await pool.query(
                `INSERT INTO chi_phi (MaLoai, MaCH, TenChiPhi, SoTien, NgayPhatSinh, NguoiLap, TrangThai, FileDinhKem, GhiChu)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [MaLoai, MaCH, TenChiPhi, SoTien, NgayPhatSinh, NguoiLap, TrangThai || 'Chua_thanh_toan', FileDinhKem, GhiChu]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'chi_phi',
                MaBanGhi: result.insertId,
                DuLieuMoi: { TenChiPhi, SoTien, NgayPhatSinh },
                DiaChi_IP: req.ip
            });

            res.json({ success: true, MaCP: result.insertId, message: 'Tạo chi phí thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateExpense: async (req, res) => {
        const { id } = req.params;
        const { MaLoai, MaCH, TenChiPhi, SoTien, NgayPhatSinh, TrangThai, FileDinhKem, GhiChu } = req.body;

        try {
            // Get old data for audit
            const [oldData] = await pool.query('SELECT * FROM chi_phi WHERE MaCP = ?', [id]);
            if (oldData.length === 0) {
                return res.status(404).json({ success: false, message: 'Chi phí không tồn tại' });
            }

            await pool.query(
                `UPDATE chi_phi 
                 SET MaLoai = ?, MaCH = ?, TenChiPhi = ?, SoTien = ?, NgayPhatSinh = ?, 
                     TrangThai = ?, FileDinhKem = ?, GhiChu = ?
                 WHERE MaCP = ?`,
                [MaLoai, MaCH, TenChiPhi, SoTien, NgayPhatSinh, TrangThai, FileDinhKem, GhiChu, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'chi_phi',
                MaBanGhi: id,
                DuLieuCu: JSON.stringify(oldData[0]),
                DuLieuMoi: JSON.stringify({ TenChiPhi, SoTien }),
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật chi phí thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteExpense: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('DELETE FROM chi_phi WHERE MaCP = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Chi phí không tồn tại' });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'chi_phi',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Xóa chi phí thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= EXPENSE CATEGORIES =======================

    getAllExpenseCategories: async (req, res) => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM loai_chi_phi WHERE TinhTrang = 1 ORDER BY TenLoai'
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createExpenseCategory: async (req, res) => {
        const { TenLoai, MoTa } = req.body;

        if (!TenLoai) {
            return res.status(400).json({ success: false, message: 'Tên loại chi phí là bắt buộc' });
        }

        try {
            const [result] = await pool.query(
                'INSERT INTO loai_chi_phi (TenLoai, MoTa) VALUES (?, ?)',
                [TenLoai, MoTa]
            );

            res.json({ success: true, MaLoai: result.insertId, message: 'Tạo loại chi phí thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateExpenseCategory: async (req, res) => {
        const { id } = req.params;
        const { TenLoai, MoTa, TinhTrang } = req.body;

        try {
            await pool.query(
                'UPDATE loai_chi_phi SET TenLoai = ?, MoTa = ?, TinhTrang = ? WHERE MaLoai = ?',
                [TenLoai, MoTa, TinhTrang ?? 1, id]
            );

            res.json({ success: true, message: 'Cập nhật loại chi phí thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= FINANCIAL REPORTS =======================

    getExpenseSummary: async (req, res) => {
        const { startDate, endDate, MaCH } = req.query;

        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (startDate) {
                whereClause += ' AND NgayPhatSinh >= ?';
                params.push(startDate);
            }
            if (endDate) {
                whereClause += ' AND NgayPhatSinh <= ?';
                params.push(endDate);
            }
            if (MaCH) {
                whereClause += ' AND MaCH = ?';
                params.push(MaCH);
            }

            const [summary] = await pool.query(
                `SELECT 
                    COUNT(*) as TongSoChiPhi,
                    SUM(SoTien) as TongChiPhi,
                    SUM(CASE WHEN TrangThai = 'Da_thanh_toan' THEN SoTien ELSE 0 END) as DaThanhToan,
                    SUM(CASE WHEN TrangThai = 'Chua_thanh_toan' THEN SoTien ELSE 0 END) as ChuaThanhToan
                 FROM chi_phi ${whereClause}`,
                params
            );

            const [byCategory] = await pool.query(
                `SELECT lcp.TenLoai, SUM(cp.SoTien) as TongTien, COUNT(*) as SoLuong
                 FROM chi_phi cp
                 JOIN loai_chi_phi lcp ON cp.MaLoai = lcp.MaLoai
                 ${whereClause}
                 GROUP BY cp.MaLoai, lcp.TenLoai
                 ORDER BY TongTien DESC`,
                params
            );

            res.json({
                success: true,
                summary: summary[0],
                byCategory
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default financeController;
