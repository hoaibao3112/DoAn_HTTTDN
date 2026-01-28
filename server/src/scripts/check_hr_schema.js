import pool from './config/connectDatabase.js';

async function checkSchema() {
    try {
        const tables = ['nhanvien', 'xin_nghi_phep', 'luong', 'bang_luong', 'cham_cong', 'taikhoan'];
        for (const table of tables) {
            console.log(`\n--- TABLE: ${table} ---`);
            try {
                const [cols] = await pool.query(`DESCRIBE ${table}`);
                cols.forEach(c => console.log(`${c.Field} - ${c.Type} - ${c.Null} - ${c.Key}`));
            } catch (e) {
                console.log(`Table ${table} does not exist.`);
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkSchema();
