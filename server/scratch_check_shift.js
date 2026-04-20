import pool from './src/config/connectDatabase.js';

async function checkShiftInfo() {
    try {
        const [rows] = await pool.query('SELECT * FROM ca_lam_viec');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkShiftInfo();
