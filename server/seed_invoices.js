import pool from './src/config/connectDatabase.js';

async function seed() {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Delete old sample data
        await conn.query('DELETE FROM chitiethoadon WHERE MaHD IN (SELECT MaHD FROM hoadon WHERE GhiChu LIKE "Hóa đơn mẫu %")');
        await conn.query('DELETE FROM hoadon WHERE GhiChu LIKE "Hóa đơn mẫu %"');

        const [products] = await conn.query('SELECT MaSP, DonGia FROM sanpham LIMIT 5');
        const [customers] = await conn.query('SELECT MaKH FROM khachhang LIMIT 1');
        const [staff] = await conn.query('SELECT MaNV FROM nhanvien LIMIT 1');
        const [branches] = await conn.query('SELECT MaCH FROM cua_hang LIMIT 1');

        if (products.length === 0 || staff.length === 0 || branches.length === 0) {
            throw new Error('Need products, staff, and branches in DB to seed invoices');
        }

        const maSP = products[0].MaSP;
        const price = products[0].DonGia;
        const maKH = customers.length > 0 ? customers[0].MaKH : null;
        const maNV = staff[0].MaNV;
        const maCH = branches[0].MaCH;

        // Invoice 1: Hoan_thanh
        const [res1] = await conn.query(
            'INSERT INTO hoadon (MaKH, MaNV, MaCH, NgayBan, TongTien, GiamGia, ThanhToan, PhuongThucTT, TrangThai, GhiChu) VALUES (?, ?, ?, NOW(), ?, 0, ?, "Tien_mat", "Hoan_thanh", "Hóa đơn mẫu POS 1")',
            [maKH, maNV, maCH, price * 2, price * 2]
        );
        await conn.query(
            'INSERT INTO chitiethoadon (MaHD, MaSP, SoLuong, DonGia, GiamGia) VALUES (?, ?, 2, ?, 0)',
            [res1.insertId, maSP, price]
        );

        // Invoice 2: Hoan_thanh
        const [res2] = await conn.query(
            'INSERT INTO hoadon (MaKH, MaNV, MaCH, NgayBan, TongTien, GiamGia, ThanhToan, PhuongThucTT, TrangThai, GhiChu) VALUES (?, ?, ?, NOW(), ?, 0, ?, "Chuyen_khoan", "Hoan_thanh", "Hóa đơn mẫu POS 2")',
            [null, maNV, maCH, price, price]
        );
        await conn.query(
            'INSERT INTO chitiethoadon (MaHD, MaSP, SoLuong, DonGia, GiamGia) VALUES (?, ?, 1, ?, 0)',
            [res2.insertId, maSP, price]
        );

        // Invoice 3: Da_huy
        const [res3] = await conn.query(
            'INSERT INTO hoadon (MaKH, MaNV, MaCH, NgayBan, TongTien, GiamGia, ThanhToan, PhuongThucTT, TrangThai, GhiChu) VALUES (?, ?, ?, NOW(), ?, 0, ?, "Tien_mat", "Da_huy", "Hóa đơn mẫu POS 3")',
            [maKH, maNV, maCH, price * 3, price * 3]
        );
        await conn.query(
            'INSERT INTO chitiethoadon (MaHD, MaSP, SoLuong, DonGia, GiamGia) VALUES (?, ?, 3, ?, 0)',
            [res3.insertId, maSP, price]
        );

        await conn.commit();
        console.log('Successfully updated 3 sample POS invoices');
        process.exit(0);
    } catch (err) {
        await conn.rollback();
        console.error(err);
        process.exit(1);
    } finally {
        conn.release();
    }
}

seed();
