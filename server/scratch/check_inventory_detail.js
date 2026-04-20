import pool from '../src/config/connectDatabase.js';

async function checkInventoryDetail() {
    try {
        // Get the latest inventory check
        const [checks] = await pool.query('SELECT MaKiemKe FROM kiem_ke_kho ORDER BY MaKiemKe DESC LIMIT 1');
        if (checks.length === 0) {
            console.log('No inventory checks found.');
            process.exit(0);
        }
        const MaKiemKe = checks[0].MaKiemKe;
        console.log(`Checking inventory #${MaKiemKe}...`);

        const [items] = await pool.query(`
            SELECT ctk.*, sp.TenSP 
            FROM chi_tiet_kiem_ke ctk 
            JOIN sanpham sp ON ctk.MaSP = sp.MaSP 
            WHERE ctk.MaKiemKe = ?
        `, [MaKiemKe]);

        console.log(`Total items found in DB for this check: ${items.length}`);
        const discrepancies = items.filter(i => i.ChenhLech !== 0);
        console.log(`Discrepant items in DB: ${discrepancies.length}`);
        
        discrepancies.forEach(i => {
            console.log(` - SP: ${i.TenSP} (ID: ${i.MaSP}) | System: ${i.SoLuongHeThong} | Actual: ${i.SoLuongThucTe} | Diff: ${i.ChenhLech}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkInventoryDetail();
