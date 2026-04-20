import pool from './src/config/connectDatabase.js';

async function updateShifts() {
    try {
        console.log('Updating Ca 1 to Administrative Shift (8 hours)...');
        await pool.query(
            `UPDATE ca_lam_viec 
             SET TenCa = ?, GioBatDau = ?, GioKetThuc = ?, PhutNghi = ?, MoTa = ?
             WHERE MaCa = 1`,
            [
                'Ca Hành Chính', 
                '08:00:00', 
                '17:00:00', 
                60, 
                'Làm việc hành chính 8 tiếng (nghỉ trưa 12:00-13:00)'
            ]
        );
        
        console.log('Syncing all active employees to Ca 1...');
        // All 6 were already on Ca 1, but this ensures everyone is synchronized.
        await pool.query('UPDATE nhanvien SET MaCa = 1 WHERE TinhTrang = 1');

        console.log('Shift update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating shifts:', err);
        process.exit(1);
    }
}

updateShifts();
