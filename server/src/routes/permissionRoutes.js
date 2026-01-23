import express from 'express';
import pool from '../config/connectDatabase.js';
import { authenticateToken } from '../utils/generateToken.js';

const router = express.Router();

// Require authentication for these endpoints
router.use(authenticateToken);

// GET /api/permissions/features
router.get('/features', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT MaCN, TenCN, URL, Icon, MaCha FROM chucnang ORDER BY MaCN');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching permission features:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách chức năng', error: error.message });
  }
});

// GET /api/permissions/roles/:id - permissions for a specific role
router.get('/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [permissions] = await pool.query(
      `SELECT ct.*, cn.TenCN
       FROM phanquyen_chitiet ct
       JOIN chucnang cn ON ct.MaCN = cn.MaCN
       WHERE ct.MaNQ = ?`,
      [id]
    );
    res.status(200).json(permissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy quyền của nhóm', error: error.message });
  }
});

export default router;
