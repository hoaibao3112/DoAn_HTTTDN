import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'kimloan12345',
    database: process.env.DB_NAME || 'bansach_offline',
    port: parseInt(process.env.DB_PORT) || 3306,
};

async function verify() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log('--- Checking table: taikhoan ---');
        const [rows] = await connection.query('SELECT MaTK, TenTK, MatKhau, MaNQ, TinhTrang FROM taikhoan');
        console.log(`Found ${rows.length} accounts.`);
        rows.forEach(r => console.log(JSON.stringify(r)));
    } catch (err) {
        console.error('Error verifying taikhoan:', err.message);
    } finally {
        await connection.end();
    }
}

verify();
