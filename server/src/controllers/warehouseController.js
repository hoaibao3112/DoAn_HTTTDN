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
    },

    // ======================= STOCK QUERIES =======================

    getStockByBranch: async (req, res) => {
        const { MaCH, MaSP, search, lowStock, page = 1, pageSize = 50 } = req.query;
        const offset = (page - 1) * pageSize;

        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (MaCH) {
                whereClause += ' AND tk.MaCH = ?';
                params.push(MaCH);
            }
            if (MaSP) {
                whereClause += ' AND tk.MaSP = ?';
                params.push(MaSP);
            }
            if (search) {
                whereClause += ' AND sp.TenSP LIKE ?';
                params.push(`%${search}%`);
            }
            if (lowStock === 'true') {
                whereClause += ' AND tk.SoLuongTon < tk.SoLuongToiThieu';
            }

            const [rows] = await pool.query(
                `SELECT tk.*, sp.TenSP, sp.DonGia, sp.GiaNhap, sp.HinhAnh, 
                        ch.TenCH, ch.DiaChi as DiaChiCH,
                        (tk.SoLuongTon * sp.DonGia) as GiaTriTonKho
                 FROM ton_kho tk
                 JOIN sanpham sp ON tk.MaSP = sp.MaSP
                 JOIN cua_hang ch ON tk.MaCH = ch.MaCH
                 ${whereClause}
                 ORDER BY ch.TenCH, sp.TenSP
                 LIMIT ? OFFSET ?`,
                [...params, parseInt(pageSize), offset]
            );

            const [total] = await pool.query(
                `SELECT COUNT(*) as total FROM ton_kho tk 
                 JOIN sanpham sp ON tk.MaSP = sp.MaSP
                 ${whereClause}`,
                params
            );

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: total[0].total
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getLowStockAlerts: async (req, res) => {
        const { MaCH } = req.query;
        try {
            let whereClause = 'WHERE tk.SoLuongTon < tk.SoLuongToiThieu';
            const params = [];

            if (MaCH) {
                whereClause += ' AND tk.MaCH = ?';
                params.push(MaCH);
            }

            const [alerts] = await pool.query(
                `SELECT tk.*, sp.TenSP, sp.DonGia, ch.TenCH,
                        (tk.SoLuongToiThieu - tk.SoLuongTon) as SoLuongCanNhap
                 FROM ton_kho tk
                 JOIN sanpham sp ON tk.MaSP = sp.MaSP
                 JOIN cua_hang ch ON tk.MaCH = ch.MaCH
                 ${whereClause}
                 ORDER BY (tk.SoLuongToiThieu - tk.SoLuongTon) DESC`,
                params
            );

            res.json({ success: true, data: alerts, count: alerts.length });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= PURCHASE ORDER QUERIES =======================

    getAllPurchaseOrders: async (req, res) => {
        const { page = 1, pageSize = 20, MaNCC, MaCH, startDate, endDate } = req.query;
        const offset = (page - 1) * pageSize;

        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (MaNCC) {
                whereClause += ' AND pn.MaNCC = ?';
                params.push(MaNCC);
            }
            if (MaCH) {
                whereClause += ' AND pn.MaCH = ?';
                params.push(MaCH);
            }
            if (startDate) {
                whereClause += ' AND pn.NgayNhap >= ?';
                params.push(startDate);
            }
            if (endDate) {
                whereClause += ' AND pn.NgayNhap <= ?';
                params.push(endDate);
            }

            const [rows] = await pool.query(
                `SELECT pn.*, ncc.TenNCC, ch.TenCH, tk.TenTK as NguoiLap
                 FROM phieunhap pn
                 JOIN nhacungcap ncc ON pn.MaNCC = ncc.MaNCC
                 JOIN cua_hang ch ON pn.MaCH = ch.MaCH
                 LEFT JOIN taikhoan tk ON pn.MaTK = tk.MaTK
                 ${whereClause}
                 ORDER BY pn.NgayNhap DESC
                 LIMIT ? OFFSET ?`,
                [...params, parseInt(pageSize), offset]
            );

            const [total] = await pool.query(
                `SELECT COUNT(*) as total FROM phieunhap pn ${whereClause}`,
                params
            );

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: total[0].total
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getPurchaseOrderById: async (req, res) => {
        const { id } = req.params;
        try {
            // Get PO header
            const [header] = await pool.query(
                `SELECT pn.*, ncc.TenNCC, ncc.DiaChi as DiaChiNCC, ncc.SDT as SDTNCC,
                        ch.TenCH, ch.DiaChi as DiaChiCH, tk.TenTK as NguoiLap
                 FROM phieunhap pn
                 JOIN nhacungcap ncc ON pn.MaNCC = ncc.MaNCC
                 JOIN cua_hang ch ON pn.MaCH = ch.MaCH
                 LEFT JOIN taikhoan tk ON pn.MaTK = tk.MaTK
                 WHERE pn.MaPN = ?`,
                [id]
            );

            if (header.length === 0) {
                return res.status(404).json({ success: false, message: 'Phiếu nhập không tồn tại' });
            }

            // Get PO details
            const [details] = await pool.query(
                `SELECT ctp.*, sp.TenSP, sp.HinhAnh
                 FROM chitietphieunhap ctp
                 JOIN sanpham sp ON ctp.MaSP = sp.MaSP
                 WHERE ctp.MaPN = ?`,
                [id]
            );

            res.json({
                success: true,
                data: {
                    ...header[0],
                    ChiTiet: details
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default warehouseController;
