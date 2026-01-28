import pool from '../config/connectDatabase.js';

const updates = [
    { MaSP: '1', HinhAnh: '/uploads/images/Toi_Thay_Hoa_Vang_Tren_Co_Xanh.jpg' },
    { MaSP: '2', HinhAnh: '/uploads/images/Nha_Gia_Kim.jpg' },
    { MaSP: '3', HinhAnh: '/uploads/images/Dac_Nhan_Tam.jpg' },
    { MaSP: '4', HinhAnh: '/uploads/images/Harry_Potter_va_Hon_Đa_Phu_Thuy.jpg' },
    { MaSP: '5', HinhAnh: '/uploads/images/Cho_toi_tro_ve_tuoi_Tho.jpg' },
    { MaSP: '6', HinhAnh: '/uploads/images/Rung_Na_Uy.jpg' },
    { MaSP: '7', HinhAnh: '/uploads/images/De_Men_Thieu_luu_ky.jpg' },
    { MaSP: '8', HinhAnh: '/uploads/images/Lao_Hac.jpg' },
    { MaSP: '9', HinhAnh: '/uploads/images/Truyen_Kieu.jpg' },
    { MaSP: '10', HinhAnh: '/uploads/images/Đuong_Xua_May_Trang.jpg' },
    { MaSP: '11', HinhAnh: '/uploads/images/Len_Duong_Bang.png' },
    { MaSP: '12', HinhAnh: '/product-images/sp12.jpg' },
    { MaSP: '13', HinhAnh: '/product-images/sp13.jpg' },
    { MaSP: '14', HinhAnh: '/product-images/sp14.jpg' },
    { MaSP: '15', HinhAnh: '/product-images/sp15.jpg' },
    { MaSP: '16', HinhAnh: '/product-images/sp16.jpg' },
    { MaSP: '17', HinhAnh: '/product-images/sp17.jpg' },
    { MaSP: '18', HinhAnh: '/product-images/sp18.jpg' },
    { MaSP: '19', HinhAnh: '/product-images/sp19.jpg' },
    { MaSP: '20', HinhAnh: '/product-images/sp20.jpg' },
];

async function run() {
    console.log('Starting image path updates...');
    for (const item of updates) {
        try {
            await pool.query('UPDATE sanpham SET HinhAnh = ? WHERE MaSP = ?', [item.HinhAnh, item.MaSP]);
            console.log(`Updated MaSP ${item.MaSP} -> ${item.HinhAnh}`);
        } catch (e) {
            console.error(`Failed to update MaSP ${item.MaSP}:`, e.message);
        }
    }
    console.log('Finished updates.');
    process.exit(0);
}

run();
