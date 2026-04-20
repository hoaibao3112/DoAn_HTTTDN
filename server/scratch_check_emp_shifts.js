import pool from './src/config/connectDatabase.js';

async function checkEmployeeShifts() {
    try {
        const [rows] = await pool.query(
            `SELECT MaCa, COUNT(*) as count 
             FROM nhanvien 
             GROUP BY MaCa`
        );
        console.log('Employee Shift Distribution:');
        console.log(JSON.stringify(rows, null, 2));

        const [shiftData] = await pool.query('SELECT * FROM ca_lam_viec');
        console.log('Current Shift Data:');
        console.log(JSON.stringify(shiftData, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEmployeeShifts();
