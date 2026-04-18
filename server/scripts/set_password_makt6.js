import pool from '../src/config/connectDatabase.js';
import bcrypt from 'bcryptjs';

const MA_TK = 6;
const NEW_PLAIN = '123456';

(async () => {
  try {
    const hashed = await bcrypt.hash(NEW_PLAIN, 10);
    const [result] = await pool.query('UPDATE taikhoan SET MatKhau = ? WHERE MaTK = ?', [hashed, MA_TK]);
    console.log(`Updated MaTK=${MA_TK}, affectedRows=${result.affectedRows}`);
    process.exit(0);
  } catch (err) {
    console.error('Error setting password:', err);
    process.exit(1);
  }
})();
