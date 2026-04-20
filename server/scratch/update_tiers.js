
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'kimloan12345',
    database: 'bansach_offline'
});

async function updateTiers() {
    try {
        // Update customer #6 to Diamond
        const [res1] = await pool.query("UPDATE khachhang SET HangTV = 'KimCuong' WHERE MaKH = 6");
        console.log(`Updated MaKH #6: ${res1.affectedRows} row(s)`);

        // Update customer #5 to Gold
        const [res2] = await pool.query("UPDATE khachhang SET HangTV = 'Vang' WHERE MaKH = 5");
        console.log(`Updated MaKH #5: ${res2.affectedRows} row(s)`);

    } catch (e) {
        console.error("ERROR:", e.message);
    } finally {
        process.exit();
    }
}

updateTiers();
