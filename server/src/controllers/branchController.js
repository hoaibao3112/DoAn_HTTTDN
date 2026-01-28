import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const branchController = {
    // ======================= GET ALL BRANCHES =======================
    getAllBranches: async (req, res) => {
        console.log('GET /api/branches - Fetching all branches...');
        try {
            const [rows] = await pool.query('SELECT * FROM cua_hang ORDER BY TenCH');
            console.log(`Successfully fetched ${rows.length} branches`);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('❌ Error in getAllBranches:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= GET BRANCH BY ID =======================
    getBranchById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query('SELECT * FROM cua_hang WHERE MaCH = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Chi nhánh không tồn tại' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= CREATE BRANCH =======================
    createBranch: async (req, res) => {
        const { TenCH, DiaChi, SDT, Email } = req.body;

        if (!TenCH) {
            return res.status(400).json({ success: false, message: 'Tên chi nhánh là bắt buộc' });
        }

        try {
            const [result] = await pool.query(
                'INSERT INTO cua_hang (TenCH, DiaChi, SDT, Email) VALUES (?, ?, ?, ?)',
                [TenCH, DiaChi, SDT, Email]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'cua_hang',
                MaBanGhi: result.insertId,
                DuLieuMoi: { TenCH, DiaChi },
                DiaChi_IP: req.ip
            });

            res.status(201).json({ success: true, MaCH: result.insertId, message: 'Thêm chi nhánh thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= UPDATE BRANCH =======================
    updateBranch: async (req, res) => {
        const { id } = req.params;
        const { TenCH, DiaChi, SDT, Email } = req.body;

        try {
            const [oldData] = await pool.query('SELECT * FROM cua_hang WHERE MaCH = ?', [id]);
            if (oldData.length === 0) {
                return res.status(404).json({ success: false, message: 'Chi nhánh không tồn tại' });
            }

            await pool.query(
                `UPDATE cua_hang 
                 SET TenCH = ?, DiaChi = ?, SDT = ?, Email = ?
                 WHERE MaCH = ?`,
                [TenCH, DiaChi, SDT, Email, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'cua_hang',
                MaBanGhi: id,
                DuLieuCu: JSON.stringify(oldData[0]),
                DuLieuMoi: JSON.stringify({ TenCH, DiaChi }),
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật thông tin chi nhánh thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= DELETE BRANCH =======================
    deleteBranch: async (req, res) => {
        const { id } = req.params;
        try {
            // Check if branch has associated staff or invoices
            const [staff] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaCH = ? LIMIT 1', [id]);
            const [invoices] = await pool.query('SELECT MaHD FROM hoadon WHERE MaCH = ? LIMIT 1', [id]);

            if (staff.length > 0 || invoices.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa chi nhánh có nhân viên hoặc hóa đơn liên quan.'
                });
            }

            const [result] = await pool.query('DELETE FROM cua_hang WHERE MaCH = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Chi nhánh không tồn tại' });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'cua_hang',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Xóa chi nhánh thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default branchController;
