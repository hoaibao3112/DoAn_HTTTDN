import express from 'express';
import pool from '../config/connectDatabase.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { logActivity } from '../utils/auditLogger.js';
import bcrypt from 'bcryptjs';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// Middleware to apply to all account routes
router.use(authenticateToken);

// 1. Get all accounts (Admin/Manager with 'Xem' permission on feature 2)
router.get('/', checkPermission(FEATURES.USERS, PERMISSIONS.VIEW), async (req, res) => {
  try {
    const [accounts] = await pool.query(
      `SELECT MaTK, TenTK, Email, TinhTrang, MaNQ, NgayTao FROM taikhoan`
    );
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách tài khoản', error: error.message });
  }
});

// 2. Create new account (Admin with 'Them' permission)
router.post('/', checkPermission(FEATURES.USERS, PERMISSIONS.CREATE), async (req, res) => {
  const { TenTK, MatKhau, Email, MaNQ } = req.body;

  if (!TenTK || !MatKhau) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
  }

  try {
    // Check uniqueness
    const [existing] = await pool.query('SELECT MaTK FROM taikhoan WHERE TenTK = ? OR Email = ?', [TenTK, Email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên tài khoản hoặc Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(MatKhau, 10);
    const [result] = await pool.query(
      'INSERT INTO taikhoan (TenTK, MatKhau, Email, MaNQ) VALUES (?, ?, ?, ?)',
      [TenTK, hashedPassword, Email, MaNQ]
    );

    await logActivity({
      MaTK: req.user.MaTK,
      HanhDong: 'Them',
      BangDuLieu: 'taikhoan',
      MaBanGhi: result.insertId,
      DuLieuMoi: { TenTK, Email, MaNQ },
      DiaChi_IP: req.ip
    });

    res.status(201).json({ success: true, message: 'Tạo tài khoản thành công', MaTK: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo tài khoản', error: error.message });
  }
});

// 3. Update account / Inactivate (Admin with 'Sua' permission)
router.put('/:id', checkPermission(FEATURES.USERS, PERMISSIONS.UPDATE), async (req, res) => {
  const { id } = req.params;
  const { Email, MaNQ, TinhTrang } = req.body;

  try {
    const [current] = await pool.query('SELECT * FROM taikhoan WHERE MaTK = ?', [id]);
    if (current.length === 0) return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });

    await pool.query(
      'UPDATE taikhoan SET Email = ?, MaNQ = ?, TinhTrang = ? WHERE MaTK = ?',
      [Email, MaNQ, TinhTrang, id]
    );

    await logActivity({
      MaTK: req.user.MaTK,
      HanhDong: 'Sua',
      BangDuLieu: 'taikhoan',
      MaBanGhi: id,
      DuLieuCu: current[0],
      DuLieuMoi: { Email, MaNQ, TinhTrang },
      DiaChi_IP: req.ip
    });

    res.json({ success: true, message: 'Cập nhật tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật tài khoản', error: error.message });
  }
});

// 4. Admin Reset Password
router.put('/:id/reset-password', checkPermission(FEATURES.USERS, PERMISSIONS.UPDATE), async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Mật khẩu phải tối thiểu 8 ký tự' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE taikhoan SET MatKhau = ? WHERE MaTK = ?', [hashedPassword, id]);

    await logActivity({
      MaTK: req.user.MaTK,
      HanhDong: 'Reset_Mat_Khau',
      BangDuLieu: 'taikhoan',
      MaBanGhi: id,
      DiaChi_IP: req.ip,
      GhiChu: 'Admin đặt lại mật khẩu'
    });

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi đặt lại mật khẩu', error: error.message });
  }
});

export default router;