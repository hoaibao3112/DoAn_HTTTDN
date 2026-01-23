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

async function checkFunctions() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log('--- Table: chucnang ---');
        const [rows] = await connection.query('SELECT * FROM chucnang');
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkFunctions();
