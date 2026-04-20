import pool from './src/config/connectDatabase.js';

async function auditAttendanceData() {
    try {
        console.log('Checking for attendance records on Ca 2 and Ca 3...');
        const [rows] = await pool.query(
            `SELECT MaCa, COUNT(*) as record_count 
             FROM cham_cong 
             GROUP BY MaCa`
        );
        console.log('Record counts by Shift:');
        console.log(JSON.stringify(rows, null, 2));

        console.log('\nChecking for employees with multiple records on the same day...');
        const [duplicates] = await pool.query(
            `SELECT MaNV, Ngay, COUNT(*) as shift_count 
             FROM cham_cong 
             GROUP BY MaNV, Ngay 
             HAVING shift_count > 1
             LIMIT 20`
        );
        console.log('Daily duplicate records (possible double-pay issue):');
        console.log(JSON.stringify(duplicates, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

auditAttendanceData();
