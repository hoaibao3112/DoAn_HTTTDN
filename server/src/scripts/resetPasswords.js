import bcrypt from 'bcryptjs';
import pool from '../config/connectDatabase.js';

/**
 * Password Reset Utility
 * This script resets all user passwords to test/default values
 *
 * Default passwords:
 * - admin → admin123
 * - quanly01 → quanly123
 * - thungan01 → thungan123
 * - kho01 → kho123
 * - hr01 → hr123
 */

const testPasswords = {
  admin: 'admin123',
  quanly01: 'quanly123',
  thungan01: 'thungan123',
  kho01: 'kho123',
  hr01: 'hr123'
};

async function resetPasswords() {
  try {
    console.log('🔄 Starting password reset...');
    
    for (const [username, plainPassword] of Object.entries(testPasswords)) {
      try {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        const [result] = await pool.query(
          'UPDATE taikhoan SET MatKhau = ? WHERE TenTK = ?',
          [hashedPassword, username]
        );
        
        if (result.affectedRows > 0) {
          console.log(`✅ ${username}: Password reset to "${plainPassword}"`);
        } else {
          console.log(`⚠️  ${username}: User not found in database`);
        }
      } catch (err) {
        console.error(`❌ ${username}: Error resetting password:`, err.message);
      }
    }
    
    console.log('\n🎉 Password reset complete!');
    console.log('\nTest Credentials:');
    Object.entries(testPasswords).forEach(([user, pass]) => {
      console.log(`  ${user}: ${pass}`);
    });
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    try {
      await pool.end();
    } catch (e) {
      // ignore
    }
  }
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetPasswords();
}

export default resetPasswords;
