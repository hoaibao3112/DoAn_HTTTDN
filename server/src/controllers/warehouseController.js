import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const warehouseController = {
    // ======================= 3.1 & 3.2: PRODUCT & SUPPLIER =======================

    getAllProducts: async (req, res) => {
        const { search, category, author } = req.query;
        try {
            let sql = 'SELECT * FROM sanpham WHERE TinhTrang = 1';
            const params = [];
            if (search) { sql += ' AND TenSP LIKE ?'; params.push(`%${search}%`); }
            if (category) { sql += ' AND MaTL = ?'; params.push(category); }
            if (author) { sql += ' AND MaTG = ?'; params.push(author); }

            const [rows] = await pool.query(sql, params);
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    upsertProduct: async (req, res) => {
        const data = req.body;
        const isUpdate = !!data.MaSP;
        try {
            if (isUpdate) {
                await pool.query(
                    `UPDATE sanpham SET TenSP=?, MaTG=?, MaTL=?, MaNXB=?, DonGia=?, NamXB=?, SoTrang=?, ISBN=?, MoTa=?, GiaNhap=? WHERE MaSP=?`,
                    [data.TenSP, data.MaTG, data.MaTL, data.MaNXB, data.DonGia, data.NamXB, data.SoTrang, data.ISBN, data.MoTa, data.GiaNhap, data.MaSP]
                );
            } else {
                await pool.query(
                    `INSERT INTO sanpham (TenSP, MaTG, MaTL, MaNXB, DonGia, NamXB, SoTrang, ISBN, MoTa, GiaNhap) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [data.TenSP, data.MaTG, data.MaTL, data.MaNXB, data.DonGia, data.NamXB, data.SoTrang, data.ISBN, data.MoTa, data.GiaNhap || 0]
                );
            }
            res.json({ success: true, message: 'Product saved' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= 3.3: PURCHASE ORDERS (Nhập hàng) =======================

    createPurchaseOrder: async (req, res) => {
        const { MaNCC, MaCH, ChiTiet, DaThanhToan, GhiChu } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [totalTien] = [ChiTiet.reduce((acc, item) => acc + (item.SoLuong * item.DonGiaNhap), 0)];
            const conNo = totalTien - (DaThanhToan || 0);

            // 1. Create phieunhap
            const [pnResult] = await conn.query(
                'INSERT INTO phieunhap (MaNCC, MaCH, TongTien, DaThanhToan, ConNo, MaNV) VALUES (?, ?, ?, ?, ?, ?)',
                [MaNCC, MaCH, totalTien, DaThanhToan || 0, conNo, req.user.MaTK]
            );
            const MaPN = pnResult.insertId;

            for (const item of ChiTiet) {
                // 2. Insert chitietphieunhap
                await conn.query(
                    'INSERT INTO chitietphieunhap (MaPN, MaSP, DonGiaNhap, SoLuong) VALUES (?, ?, ?, ?)',
                    [MaPN, item.MaSP, item.DonGiaNhap, item.SoLuong]
                );

                // 3. Update ton_kho
                await conn.query(
                    'INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE SoLuongTon = SoLuongTon + ?',
                    [item.MaSP, MaCH, item.SoLuong, item.SoLuong]
                );

                // 4. Update latest GiaNhap in sanpham
                await conn.query('UPDATE sanpham SET GiaNhap = ? WHERE MaSP = ?', [item.DonGiaNhap, item.MaSP]);
            }

            // 5. Create cong_no_ncc if debt exists
            if (conNo > 0) {
                await conn.query(
                    'INSERT INTO cong_no_ncc (MaNCC, MaPN, SoTienNo) VALUES (?, ?, ?)',
                    [MaNCC, MaPN, conNo]
                );
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'phieunhap',
                MaBanGhi: MaPN,
                DuLieuMoi: { MaNCC, MaCH, TongTien: totalTien },
                DiaChi_IP: req.ip
            });

            await conn.commit();
            res.json({ success: true, MaPN });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    // ======================= 3.5: TRANSFERS =======================

    transferStock: async (req, res) => {
        const { MaCHNguon, MaCHDich, MaSP, SoLuong } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Check source stock
            const [source] = await conn.query('SELECT SoLuongTon FROM ton_kho WHERE MaSP = ? AND MaCH = ?', [MaSP, MaCHNguon]);
            if (!source.length || source[0].SoLuongTon < SoLuong) {
                throw new Error('Không đủ hàng trong kho nguồn');
            }

            // Create transfer record
            const [ckResult] = await conn.query(
                'INSERT INTO chuyen_kho (MaCHNguon, MaCHDich, MaSP, SoLuong, TrangThai) VALUES (?, ?, ?, ?, ?)',
                [MaCHNguon, MaCHDich, MaSP, SoLuong, 'Cho_duyet']
            );

            await conn.commit();
            res.json({ success: true, MaCK: ckResult.insertId });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    approveTransfer: async (req, res) => {
        const { id } = req.params;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [transfer] = await conn.query('SELECT * FROM chuyen_kho WHERE MaCK = ?', [id]);
            if (!transfer.length || transfer[0].TrangThai !== 'Cho_duyet') throw new Error('Yêu cầu không hợp lệ');

            const { MaCHNguon, MaCHDich, MaSP, SoLuong } = transfer[0];

            // Deduct from source
            await conn.query('UPDATE ton_kho SET SoLuongTon = SoLuongTon - ? WHERE MaSP = ? AND MaCH = ?', [SoLuong, MaSP, MaCHNguon]);

            // Add to destination
            await conn.query(
                'INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE SoLuongTon = SoLuongTon + ?',
                [MaSP, MaCHDich, SoLuong, SoLuong]
            );

            await conn.query('UPDATE chuyen_kho SET TrangThai = "Da_nhan", NgayNhan = NOW() WHERE MaCK = ?', [id]);

            await conn.commit();
            res.json({ success: true, message: 'Transfer completed' });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    // ======================= 3.6: STOCKTAKE (Kiểm kê) =======================

    performInventoryCheck: async (req, res) => {
        const { MaCH, ChiTiet } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            for (const item of ChiTiet) {
                // Force update ton_kho to match physical reality
                await conn.query(
                    'INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE SoLuongTon = ?',
                    [item.MaSP, MaCH, item.SoLuongThucTe, item.SoLuongThucTe]
                );

                // Log the discrepancy (could be a separate table 'kiem_ke' if desired, here we just audit)
                await logActivity({
                    MaTK: req.user.MaTK,
                    HanhDong: 'Kiem_Ke',
                    BangDuLieu: 'ton_kho',
                    MaBanGhi: item.MaSP,
                    GhiChu: `Cửa hàng ${MaCH}: Thực tế ${item.SoLuongThucTe} vs Hệ thống ${item.SoLuongHeThong}. Lý do: ${item.LyDo}`,
                    DiaChi_IP: req.ip
                });
            }

            await conn.commit();
            res.json({ success: true, message: 'Inventory sync complete' });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    }
};

export default warehouseController;
