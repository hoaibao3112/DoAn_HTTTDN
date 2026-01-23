import express from 'express';
import pool from '../config/connectDatabase.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { logActivity } from '../utils/auditLogger.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// Middleware to apply to all role routes
router.use(authenticateToken);

// New: Get permissions for the current user
router.get('/user/permissions', async (req, res) => {
  try {
    const { MaNQ } = req.user;
    if (!MaNQ) {
      return res.status(403).json({ success: false, message: 'No role assigned to user' });
    }

    const [permissions] = await pool.query(
      `SELECT ct.*, cn.TenCN 
       FROM phanquyen_chitiet ct 
       JOIN chucnang cn ON ct.MaCN = cn.MaCN 
       WHERE ct.MaNQ = ?`,
      [MaNQ]
    );

    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    console.error('Error fetching user permissions:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy quyền người dùng', error: error.message });
  }
});

// Return active roles (simple list) - used by frontend dropdowns
router.get('/list/active', authenticateToken, async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT MaNQ, TenNQ FROM nhomquyen WHERE TinhTrang = 1');
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách nhóm quyền active', error: error.message });
  }
});

// 1. Get all Roles
router.get('/', checkPermission(FEATURES.ROLES, PERMISSIONS.VIEW), async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM nhomquyen');
    // Return in consistent shape expected by frontend
    return res.status(200).json({
      success: true,
      data: {
        items: roles,
        pagination: {
          page: 1,
          pageSize: roles.length || 0,
          total: roles.length || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách nhóm quyền', error: error.message });
  }
});

// 2. Get permissions of a specific Role
router.get('/:id/permissions', checkPermission(FEATURES.ROLES, PERMISSIONS.VIEW), async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Lỗi khi lấy chi tiết quyền', error: error.message });
  }
});

// 1.5 Get all functions (chucnang) - used by frontend to map MaCN => TenCN
router.get('/functions', async (req, res) => {
  try {
    const [functions] = await pool.query('SELECT MaCN, TenCN, URL, Icon, MaCha FROM chucnang ORDER BY MaCN');
    res.status(200).json(functions);
  } catch (error) {
    console.error('Error in /api/roles/functions:', error.message);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách chức năng', error: error.message });
  }
});

// GET single role + its permissions (frontend expects /api/roles/:id)
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [[role]] = await pool.query('SELECT MaNQ, TenNQ, MoTa, TinhTrang FROM nhomquyen WHERE MaNQ = ?', [id]);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    const [permissions] = await pool.query(
      `SELECT ct.*, cn.TenCN 
       FROM phanquyen_chitiet ct 
       JOIN chucnang cn ON ct.MaCN = cn.MaCN 
       WHERE ct.MaNQ = ?`,
      [id]
    );
    res.status(200).json({ success: true, data: { role, permissions } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy role', error: error.message });
  }
});

// 3. Create or Update Role with permissions
router.post('/save', checkPermission(FEATURES.ROLES, PERMISSIONS.UPDATE), async (req, res) => {
  const { MaNQ, TenNQ, MoTa, permissions } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let targetMaNQ = MaNQ;

    // 1. Upsert Role
    if (MaNQ) {
      await connection.query(
        'UPDATE nhomquyen SET TenNQ = ?, MoTa = ? WHERE MaNQ = ?',
        [TenNQ, MoTa, MaNQ]
      );
    } else {
      const [result] = await connection.query(
        'INSERT INTO nhomquyen (TenNQ, MoTa) VALUES (?, ?)',
        [TenNQ, MoTa]
      );
      targetMaNQ = result.insertId;
    }

    // 2. Update permissions (Delete old, Insert new)
    await connection.query('DELETE FROM phanquyen_chitiet WHERE MaNQ = ?', [targetMaNQ]);

    if (permissions && permissions.length > 0) {
      for (const p of permissions) {
        await connection.query(
          `INSERT INTO phanquyen_chitiet (MaNQ, MaCN, Xem, Them, Sua, Xoa, XuatFile, Duyet) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [targetMaNQ, p.MaCN, p.Xem || 0, p.Them || 0, p.Sua || 0, p.Xoa || 0, p.XuatFile || 0, p.Duyet || 0]
        );
      }
    }

    await logActivity({
      MaTK: req.user.MaTK,
      HanhDong: MaNQ ? 'Sua' : 'Them',
      BangDuLieu: 'nhomquyen',
      MaBanGhi: targetMaNQ,
      DuLieuMoi: { TenNQ, permissions },
      DiaChi_IP: req.ip
    });

    await connection.commit();
    res.status(200).json({ success: true, message: 'Lưu nhóm quyền thành công', MaNQ: targetMaNQ });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Lỗi khi lưu nhóm quyền', error: error.message });
  } finally {
    connection.release();
  }
});

// 4. Soft Delete Role
router.delete('/:id', checkPermission(FEATURES.ROLES, PERMISSIONS.DELETE), async (req, res) => {
  const { id } = req.params;
  try {
    // Check if any user is using this role
    const [users] = await pool.query('SELECT MaTK FROM taikhoan WHERE MaNQ = ? AND TinhTrang = 1', [id]);
    if (users.length > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa nhóm quyền đang được gán cho người dùng' });
    }

    await pool.query('UPDATE nhomquyen SET TinhTrang = 0 WHERE MaNQ = ?', [id]);

    await logActivity({
      MaTK: req.user.MaTK,
      HanhDong: 'Xoa',
      BangDuLieu: 'nhomquyen',
      MaBanGhi: id,
      DiaChi_IP: req.ip,
      GhiChu: 'Soft delete role'
    });

    res.json({ success: true, message: 'Xóa nhóm quyền thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa nhóm quyền', error: error.message });
  }
});

export default router;