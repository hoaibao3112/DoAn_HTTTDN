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

async function describeTables() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log('--- Table: phanquyen_chitiet ---');
        const [phanquyen] = await connection.query('DESCRIBE phanquyen_chitiet');
        console.table(phanquyen);

        console.log('\n--- Table: chucnang ---');
        const [chucnang] = await connection.query('DESCRIBE chucnang');
        console.table(chucnang);

        console.log('\n--- Sample Data: phanquyen_chitiet for MaNQ=1 ---');
        const [data] = await connection.query('SELECT ct.*, cn.TenCN FROM phanquyen_chitiet ct JOIN chucnang cn ON ct.MaCN = cn.MaCN WHERE ct.MaNQ = 1 LIMIT 5');
        console.log(JSON.stringify(data, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

describeTables();
