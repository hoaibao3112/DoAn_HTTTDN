import express from 'express';
import pool from '../config/connectDatabase.js';
import { authenticateToken } from '../utils/generateToken.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/branches - Lấy danh sách kho (thay thế chi nhánh)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT MaKho AS MaCH, TenKho AS TenCH, ViTri AS DiaChi, NULL AS SDT, NULL AS Email, TinhTrang AS TrangThai, NgayTao AS NgayMo FROM kho_con ORDER BY Priority ASC, TenKho'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/branches/:id - Cập nhật kho (redirect to kho_con)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { TenCH, DiaChi, TrangThai } = req.body;

    if (!TenCH) {
        return res.status(400).json({ success: false, message: 'Tên kho là bắt buộc' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE kho_con SET TenKho = ?, ViTri = ?, TinhTrang = ? WHERE MaKho = ?',
            [TenCH, DiaChi || null, TrangThai ?? 1, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy kho' });
        }

        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
