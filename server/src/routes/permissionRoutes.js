import express from 'express';
import pool from '../config/connectDatabase.js';
import { authenticateToken } from '../utils/generateToken.js';
import { VALID_ACTIONS } from '../constants/permissions.js';

const router = express.Router();

// GET /api/permissions - summary endpoint (features + actions)
router.get('/', async (req, res) => {
  try {
    const [features] = await pool.query('SELECT MaCN, TenCN, URL, Icon, MaCha FROM chucnang ORDER BY MaCN');
    return res.status(200).json({ success: true, features, actions: VALID_ACTIONS });
  } catch (error) {
    console.error('Error fetching permission summary:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy dữ liệu phân quyền', error: error.message });
  }
});

// GET /api/permissions/features (public - used by frontend to populate forms)
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
router.get('/roles/:id', authenticateToken, async (req, res) => {
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

// 4. POST /api/permissions - Add a new permission record
router.post('/', authenticateToken, async (req, res) => {
  const { MaNQ, MaCN, Xem, Them, Sua, Xoa, XuatFile, Duyet } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO phanquyen_chitiet (MaNQ, MaCN, Xem, Them, Sua, Xoa, XuatFile, Duyet) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [MaNQ, MaCN, Xem || 0, Them || 0, Sua || 0, Xoa || 0, XuatFile || 0, Duyet || 0]
    );
    res.status(201).json({ success: true, MaCTQ: result.insertId });
  } catch (error) {
    console.error('Error adding permission:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi khi thêm quyền', error: error.message });
  }
});

// 5. DELETE /api/permissions/:id - Remove a permission record
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM phanquyen_chitiet WHERE MaCTQ = ?', [id]);
    res.status(200).json({ success: true, message: 'Xóa quyền thành công' });
  } catch (error) {
    console.error('Error deleting permission:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa quyền', error: error.message });
  }
});

// 6. PUT /api/permissions/:id - Update an existing permission record
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { Xem, Them, Sua, Xoa, XuatFile, Duyet } = req.body;
  try {
    await pool.query(
      `UPDATE phanquyen_chitiet 
       SET Xem = ?, Them = ?, Sua = ?, Xoa = ?, XuatFile = ?, Duyet = ?
       WHERE MaCTQ = ?`,
      [Xem, Them, Sua, Xoa, XuatFile, Duyet, id]
    );
    res.status(200).json({ success: true, message: 'Cập nhật quyền thành công' });
  } catch (error) {
    console.error('Error updating permission:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật quyền', error: error.message });
  }
});

export default router;
