import pool from './src/config/connectDatabase.js';

async function check() {
    try {
        const [sp] = await pool.query('SELECT MaSP, TenSP, DonGia FROM sanpham LIMIT 5');
        console.log('--- Products ---');
        console.log(sp);

        const [kh] = await pool.query('SELECT MaKH, HoTen FROM khachhang LIMIT 3');
        console.log('--- Customers ---');
        console.log(kh);

        const [nv] = await pool.query('SELECT MaNV FROM nhanvien LIMIT 3');
        console.log('--- Employees ---');
        console.log(nv);

        const [ch] = await pool.query('SELECT MaCH FROM cua_hang LIMIT 2');
        console.log('--- Branches ---');
        console.log(ch);

        const [phien] = await pool.query('SELECT MaPhien FROM phien_ban_hang LIMIT 2');
        console.log('--- Sessions ---');
        console.log(phien);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
