import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/connectDatabase.js';
import { generateOTP, sendOTPEmail } from '../utils/emailService.js';

const router = express.Router();

// In-memory stores (cleared on server restart – acceptable for OTP/reset flows)
const otpStore = new Map();    // email → { otp, expiry }
const tokenStore = new Map();  // resetToken → { email, expiry }

const OTP_TTL_MS = 5 * 60 * 1000;    // 5 phút
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 phút

// ── Helper: tìm tài khoản theo email (taikhoan.Email hoặc nhanvien.Email) ──
async function findAccountByEmail(email) {
    // Ưu tiên email trên taikhoan
    const [rows] = await pool.query(
        `SELECT tk.MaTK, tk.TenTK, tk.Email
         FROM taikhoan tk
         WHERE tk.Email = ? AND tk.TinhTrang = 1
         LIMIT 1`,
        [email]
    );
    if (rows.length > 0) return rows[0];

    // Fallback: email trên bảng nhanvien
    const [rows2] = await pool.query(
        `SELECT tk.MaTK, tk.TenTK, nv.Email
         FROM nhanvien nv
         JOIN taikhoan tk ON nv.MaTK = tk.MaTK
         WHERE nv.Email = ? AND tk.TinhTrang = 1
         LIMIT 1`,
        [email]
    );
    return rows2.length > 0 ? rows2[0] : null;
}

// ── STEP 1: Gửi OTP về email ──────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập email.' });

    try {
        const account = await findAccountByEmail(email.trim().toLowerCase());
        if (!account) {
            // Trả về thông báo chung để không lộ thông tin tài khoản
            return res.status(404).json({ success: false, message: 'Email không tồn tại trong hệ thống.' });
        }

        const otp = generateOTP();
        const expiry = Date.now() + OTP_TTL_MS;
        otpStore.set(email.trim().toLowerCase(), { otp, expiry });

        const sent = await sendOTPEmail(email.trim(), otp);
        if (!sent) {
            return res.status(500).json({ success: false, message: 'Không gửi được email. Vui lòng thử lại sau.' });
        }

        return res.json({ success: true, message: 'Mã OTP đã được gửi đến email của bạn. Mã có hiệu lực 5 phút.' });
    } catch (err) {
        console.error('send-otp error:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

// ── STEP 2: Xác thực OTP ─────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Thiếu email hoặc mã OTP.' });

    const key = email.trim().toLowerCase();
    const record = otpStore.get(key);

    if (!record) {
        return res.status(400).json({ success: false, message: 'OTP không tồn tại hoặc đã hết hạn. Vui lòng gửi lại.' });
    }
    if (Date.now() > record.expiry) {
        otpStore.delete(key);
        return res.status(400).json({ success: false, message: 'OTP đã hết hạn. Vui lòng gửi lại.' });
    }
    if (record.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Mã OTP không đúng.' });
    }

    // OTP hợp lệ → tạo resetToken
    otpStore.delete(key);
    const resetToken = crypto.randomBytes(32).toString('hex');
    tokenStore.set(resetToken, { email: key, expiry: Date.now() + TOKEN_TTL_MS });

    return res.json({ success: true, message: 'Xác thực OTP thành công.', resetToken });
});

// ── STEP 3: Đặt lại mật khẩu ─────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
    const { email, resetToken, newPassword, confirmPassword } = req.body;
    if (!resetToken || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin.' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const record = tokenStore.get(resetToken);
    if (!record) {
        return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng bắt đầu lại.' });
    }
    if (Date.now() > record.expiry) {
        tokenStore.delete(resetToken);
        return res.status(400).json({ success: false, message: 'Token đã hết hạn. Vui lòng bắt đầu lại.' });
    }
    // Nếu FE truyền email, kiểm tra khớp với token
    if (email && record.email !== email.trim().toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Token không khớp với email.' });
    }

    try {
        const account = await findAccountByEmail(record.email);
        if (!account) {
            return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại.' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE taikhoan SET MatKhau = ? WHERE MaTK = ?', [hashed, account.MaTK]);

        tokenStore.delete(resetToken);
        return res.json({ success: true, message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.' });
    } catch (err) {
        console.error('reset-password error:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
});

export default router;
