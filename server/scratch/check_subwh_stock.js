import pool from '../src/config/connectDatabase.js';

async function checkStock() {
    try {
        const [rows] = await pool.query(`
            SELECT kc.MaKho, kc.TenKho, kc.Capacity,
                   (SELECT SUM(SoLuongTon) FROM ton_kho_chi_tiet WHERE MaKho = kc.MaKho) AS RawSum,
                   COALESCE((SELECT SUM(SoLuongTon) FROM ton_kho_chi_tiet WHERE MaKho = kc.MaKho), 0) AS SoLuongHienTai
            FROM kho_con kc
        `);
        console.log('--- Sub Warehouse Status ---');
        rows.forEach(row => {
            console.log(`Kho: ${row.TenKho} | RawSum Type: ${typeof row.RawSum} | RawSum: ${row.RawSum} | Current: ${row.SoLuongHienTai}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStock();
