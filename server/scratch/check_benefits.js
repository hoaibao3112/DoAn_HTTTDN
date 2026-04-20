
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'kimloan12345',
    database: 'bansach_offline'
});

async function checkTable() {
    try {
        const [rows] = await pool.query("DESCRIBE uu_dai_hang_thanh_vien");
        console.log("COLUMNS:", JSON.stringify(rows, null, 2));
        
        const [data] = await pool.query("SELECT * FROM uu_dai_hang_thanh_vien");
        console.log("DATA:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("ERROR:", e.message);
    } finally {
        process.exit();
    }
}

checkTable();
