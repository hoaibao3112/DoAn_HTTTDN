import express from 'express';
import pool from '../config/connectDatabase.js';
import { authenticateToken } from '../utils/generateToken.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/branches - Lấy danh sách chi nhánh
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT MaCH, TenCH, DiaChi, SDT, Email, TrangThai, NgayMo FROM cua_hang ORDER BY TenCH'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/branches/:id - Cập nhật thông tin chi nhánh
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { TenCH, DiaChi, SDT, Email, TrangThai, NgayMo } = req.body;

    if (!TenCH) {
        return res.status(400).json({ success: false, message: 'Tên cửa hàng là bắt buộc' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE cua_hang SET TenCH = ?, DiaChi = ?, SDT = ?, Email = ?, TrangThai = ?, NgayMo = ? WHERE MaCH = ?',
            [TenCH, DiaChi || null, SDT || null, Email || null, TrangThai ?? 1, NgayMo || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy chi nhánh' });
        }

        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
