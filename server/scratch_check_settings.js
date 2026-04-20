import pool from './src/config/connectDatabase.js';

async function checkHrSettings() {
    try {
        const [rows] = await pool.query('SELECT * FROM hr_settings');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkHrSettings();
