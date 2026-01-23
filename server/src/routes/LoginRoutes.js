import express from 'express';
import pool from '../config/connectDatabase.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // dùng bcrypt để so sánh mật khẩu đã hash

const router = express.Router();

// API đăng nhập
router.post('/', async (req, res) => {
  const { TenTK, MatKhau } = req.body;

  if (!TenTK || !MatKhau) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp tên tài khoản và mật khẩu'
    });
  }

  try {
    // 1. Tìm tài khoản theo tên đăng nhập
    console.log(`Login attempt for user: ${TenTK}`);
    const [accounts] = await pool.query(
      'SELECT MaTK, TenTK, MatKhau, MaNQ, TinhTrang FROM taikhoan WHERE TenTK = ?',
      [TenTK]
    );

    if (accounts.length === 0) {
      console.log(`User ${TenTK} not found in database`);
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại'
      });
    }

    const account = accounts[0];

    // Check account status
    if (!account.TinhTrang) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // 2. Kiểm tra mật khẩu
    console.log(`Comparing password for user: ${account.TenTK}`);
    console.log(`Stored hash: ${account.MatKhau}`);
    const passwordMatch = await bcrypt.compare(MatKhau, account.MatKhau);
    console.log(`Password match result: ${passwordMatch}`);

    if (!passwordMatch) {
      // Log failed attempt (optional but good for security)
      await logActivity({
        MaTK: account.MaTK,
        HanhDong: 'Dang_nhap_that_bai',
        BangDuLieu: 'taikhoan',
        MaBanGhi: account.MaTK,
        DiaChi_IP: req.ip,
        GhiChu: 'Sai mật khẩu'
      });

      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác'
      });
    }

    // 3. Tạo JWT token
    const token = jwt.sign(
      {
        MaTK: account.MaTK,
        TenTK: account.TenTK,
        MaNQ: account.MaNQ // Using MaNQ as per new schema
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' } // Increased to 8h for offline POS shift
    );

    // 4. Log successful login
    await logActivity({
      MaTK: account.MaTK,
      HanhDong: 'Dang_nhap',
      BangDuLieu: 'taikhoan',
      MaBanGhi: account.MaTK,
      DiaChi_IP: req.ip
    });

    // 5. Success response
    const { MatKhau: _, ...userWithoutPassword } = account;
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xử lý yêu cầu đăng nhập'
    });
  }
});

import { logActivity } from '../utils/auditLogger.js';

export default router;