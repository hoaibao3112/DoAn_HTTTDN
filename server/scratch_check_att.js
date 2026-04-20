import pool from './src/config/connectDatabase.js';

async function checkTodayAttendance() {
    try {
        const today = '2026-04-20';
        const [rows] = await pool.query(
            `SELECT cc.*, nv.HoTen 
             FROM cham_cong cc 
             JOIN nhanvien nv ON cc.MaNV = nv.MaNV 
             WHERE cc.Ngay = ?`, 
            [today]
        );
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTodayAttendance();
