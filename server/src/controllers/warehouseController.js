import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const warehouseController = {
    // ======================= 3.1 & 3.2: PRODUCT & SUPPLIER =======================

    getAllProducts: async (req, res) => {
        const {
            search,
            category,
            author,
            minPrice,
            maxPrice,
            sortBy = 'MaSP',
            sortOrder = 'ASC',
            page = 1,
            pageSize = 20
        } = req.query;

        try {
            let sql = `
                SELECT sp.*, tg.TenTG as TacGia, 
                       IFNULL((SELECT SUM(SoLuongTon) FROM ton_kho WHERE MaSP = sp.MaSP), 0) as SoLuong
                FROM sanpham sp
                LEFT JOIN tacgia tg ON sp.MaTG = tg.MaTG
                WHERE sp.TinhTrang = 1
            `;
            const params = [];

            // Advanced search filters
            if (search) {
                sql += ' AND (sp.TenSP LIKE ? OR sp.ISBN LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }
            if (category) {
                sql += ' AND sp.MaTL = ?';
                params.push(category);
            }
            if (author) {
                sql += ' AND sp.MaTG = ?';
                params.push(author);
            }
            if (minPrice) {
                sql += ' AND sp.DonGia >= ?';
                params.push(minPrice);
            }
            if (maxPrice) {
                sql += ' AND sp.DonGia <= ?';
                params.push(maxPrice);
            }

            // Sorting
            const allowedSortFields = ['MaSP', 'TenSP', 'DonGia', 'GiaNhap', 'NamXB'];
            const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'MaSP';
            const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            sql += ` ORDER BY ${sortField} ${order}`;

            // Pagination
            const offset = (page - 1) * pageSize;
            sql += ` LIMIT ? OFFSET ?`;
            params.push(parseInt(pageSize), offset);

            const [rows] = await pool.query(sql, params);

            // Get total count for pagination
            let countSql = 'SELECT COUNT(*) as total FROM sanpham WHERE TinhTrang = 1';
            const countParams = [];
            if (search) {
                countSql += ' AND (TenSP LIKE ? OR ISBN LIKE ?)';
                countParams.push(`%${search}%`, `%${search}%`);
            }
            if (category) { countSql += ' AND MaTL = ?'; countParams.push(category); }
            if (author) { countSql += ' AND MaTG = ?'; countParams.push(author); }
            if (minPrice) { countSql += ' AND DonGia >= ?'; countParams.push(minPrice); }
            if (maxPrice) { countSql += ' AND DonGia <= ?'; countParams.push(maxPrice); }

            const [countResult] = await pool.query(countSql, countParams);

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / pageSize)
                },
                filters: { search, category, author, minPrice, maxPrice },
                sort: { sortBy: sortField, sortOrder: order }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    upsertProduct: async (req, res) => {
        const data = req.body;
        const isUpdate = !!data.MaSP;
        try {
            if (isUpdate) {
                await pool.query(
                    `UPDATE sanpham SET TenSP=?, MaTG=?, MaTL=?, MaNXB=?, DonGia=?, NamXB=?, SoTrang=?, ISBN=?, MoTa=?, GiaNhap=?, MinSoLuong=? WHERE MaSP=?`,
                    [data.TenSP, data.MaTG, data.MaTL, data.MaNXB, data.DonGia, data.NamXB, data.SoTrang, data.ISBN, data.MoTa, data.GiaNhap, data.MinSoLuong || 0, data.MaSP]
                );
            } else {
                await pool.query(
                    `INSERT INTO sanpham (TenSP, MaTG, MaTL, MaNXB, DonGia, NamXB, SoTrang, ISBN, MoTa, GiaNhap, MinSoLuong) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [data.TenSP, data.MaTG, data.MaTL, data.MaNXB, data.DonGia, data.NamXB, data.SoTrang, data.ISBN, data.MoTa, data.GiaNhap || 0, data.MinSoLuong || 0]
                );
            }
            res.json({ success: true, message: 'Product saved' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= 3.3: PURCHASE ORDERS (Nhập hàng) =======================

    createPurchaseOrder: async (req, res) => {
        const { MaNCC, MaCH, ChiTiet, DaThanhToan, GhiChu, TyLeLoi } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Validate Branch exists
            const [branch] = await conn.query('SELECT MaCH FROM cua_hang WHERE MaCH = ?', [MaCH]);
            if (branch.length === 0) {
                throw new Error('Cửa hàng/Chi nhánh không tồn tại');
            }

            const totalTien = ChiTiet.reduce((acc, item) => acc + (Number(item.SoLuong) * Number(item.DonGiaNhap)), 0);
            const conNo = totalTien - (Number(DaThanhToan) || 0);

            // 1. Create phieunhap
            const [pnResult] = await conn.query(
                'INSERT INTO phieunhap (MaNCC, MaCH, TongTien, DaThanhToan, ConNo, MaTK, GhiChu) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [MaNCC, MaCH, totalTien, Number(DaThanhToan) || 0, conNo, req.user.MaTK, GhiChu || null]
            );
            const MaPN = pnResult.insertId;

            for (const item of ChiTiet) {
                const soLuong = Number(item.SoLuong);
                const giaNhap = Number(item.DonGiaNhap);

                // 2. Insert chitietphieunhap
                await conn.query(
                    'INSERT INTO chitietphieunhap (MaPN, MaSP, DonGiaNhap, SoLuong) VALUES (?, ?, ?, ?)',
                    [MaPN, item.MaSP, giaNhap, soLuong]
                );

                // 3. Update ton_kho
                await conn.query(
                    'INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE SoLuongTon = SoLuongTon + ?',
                    [item.MaSP, MaCH, soLuong, soLuong]
                );

                // 4. Update product cost and status
                // If TyLeLoi is provided, also update selling price (DonGia)
                if (TyLeLoi && Number(TyLeLoi) > 0) {
                    const newDonGia = Math.round(giaNhap * (1 + Number(TyLeLoi) / 100));
                    await conn.query(
                        'UPDATE sanpham SET GiaNhap = ?, DonGia = ?, TinhTrang = 1 WHERE MaSP = ?',
                        [giaNhap, newDonGia, item.MaSP]
                    );
                } else {
                    await conn.query(
                        'UPDATE sanpham SET GiaNhap = ?, TinhTrang = 1 WHERE MaSP = ?',
                        [giaNhap, item.MaSP]
                    );
                }
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
                DuLieuMoi: { MaNCC, MaCH, TongTien: totalTien, ConNo: conNo },
                DiaChi_IP: req.ip
            });

            await conn.commit();
            res.json({ success: true, MaPN, TongTien: totalTien, ConNo: conNo });
        } catch (error) {
            await conn.rollback();
            console.error('Error creating purchase order:', error);
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
                    items: details
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= HELPER ENDPOINTS FOR PRODUCT MANAGEMENT =======================

    getAuthors: async (req, res) => {
        const { search } = req.query;
        try {
            let sql = 'SELECT * FROM tacgia WHERE TinhTrang = 1';
            const params = [];
            if (search) {
                sql += ' AND TenTG LIKE ?';
                params.push(`%${search}%`);
            }
            sql += ' ORDER BY TenTG';
            const [rows] = await pool.query(sql, params);
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    addAuthor: async (req, res) => {
        const data = req.body;
        try {
            const [result] = await pool.query(
                'INSERT INTO tacgia (TenTG, NgaySinh, QuocTich, MoTa, HinhAnh) VALUES (?, ?, ?, ?, ?)',
                [data.TenTG, data.NgaySinh || null, data.QuocTich || null, data.TieuSu || data.MoTa || null, data.AnhTG || data.HinhAnh || null]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'tacgia',
                MaBanGhi: result.insertId,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Thêm tác giả thành công', MaTG: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateAuthor: async (req, res) => {
        const { id } = req.params;
        const data = req.body;
        try {
            await pool.query(
                'UPDATE tacgia SET TenTG=?, NgaySinh=?, QuocTich=?, MoTa=?, HinhAnh=? WHERE MaTG=?',
                [data.TenTG, data.NgaySinh || null, data.QuocTich || null, data.TieuSu || data.MoTa || null, data.AnhTG || data.HinhAnh || null, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'tacgia',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật tác giả thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteAuthor: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('UPDATE tacgia SET TinhTrang = 0 WHERE MaTG = ?', [id]);

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'tacgia',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Xóa tác giả thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getCategories: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT MaTL, TenTL FROM theloai WHERE TinhTrang = 1 ORDER BY TenTL');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getSuppliers: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT MaNCC, TenNCC, DiaChi, SDT FROM nhacungcap ORDER BY TenNCC');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getPublishers: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT MaNXB, TenNXB FROM nhaxuatban WHERE TinhTrang = 1 ORDER BY TenNXB');
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getProductById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query(
                `SELECT sp.*, tg.TenTG as TacGia, tl.TenTL as TheLoai, nxb.TenNXB as NhaXuatBan
                 FROM sanpham sp
                 LEFT JOIN tacgia tg ON sp.MaTG = tg.MaTG
                 LEFT JOIN theloai tl ON sp.MaTL = tl.MaTL
                 LEFT JOIN nhaxuatban nxb ON sp.MaNXB = nxb.MaNXB
                 WHERE sp.MaSP = ?`,
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
            }

            res.json(rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteProduct: async (req, res) => {
        const { id } = req.params;
        try {
            // Soft delete by setting TinhTrang = 0
            const [result] = await pool.query('UPDATE sanpham SET TinhTrang = 0 WHERE MaSP = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'sanpham',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ message: 'Xóa sản phẩm thành công' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateMinStock: async (req, res) => {
        const { id } = req.params;
        const { MinSoLuong } = req.body;
        try {
            const [result] = await pool.query(
                'UPDATE sanpham SET MinSoLuong = ? WHERE MaSP = ?',
                [MinSoLuong, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
            }

            res.json({ message: 'Cập nhật ngưỡng tồn thành công' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // ======================= STOCK TRANSFERS =======================

    getTransfers: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT ck.*, sp.TenSP, ch1.TenCH as TenCHNguon, ch2.TenCH as TenCHDich, nv1.HoTen as TenNguoiChuyen, nv2.HoTen as TenNguoiNhan
                FROM chuyen_kho ck
                JOIN sanpham sp ON ck.MaSP = sp.MaSP
                JOIN cua_hang ch1 ON ck.MaCHNguon = ch1.MaCH
                JOIN cua_hang ch2 ON ck.MaCHDich = ch2.MaCH
                LEFT JOIN nhanvien nv1 ON ck.NguoiChuyen = nv1.MaNV
                LEFT JOIN nhanvien nv2 ON ck.NguoiNhan = nv2.MaNV
                ORDER BY ck.NgayChuyen DESC
            `);
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default warehouseController;
