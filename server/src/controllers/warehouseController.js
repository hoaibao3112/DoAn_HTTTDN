import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

// ========================= HELPER: Nhập thẳng vào kho (mỗi kho độc lập) =========================
/**
 * Phân bổ số lượng sản phẩm vào một kho cụ thể (MaKho).
 * @returns {Array} [{MaKho, TenKho, SoLuong}]
 */
async function allocateToWarehouse(conn, MaKho, MaSP, soLuong) {
    const [warehouses] = await conn.query(`
        SELECT kc.MaKho, kc.TenKho, kc.Capacity,
               COALESCE(tkct.SoLuongTon, 0) AS TonHienTai
        FROM kho_con kc
        LEFT JOIN ton_kho_chi_tiet tkct ON tkct.MaKho = kc.MaKho AND tkct.MaSP = ?
        WHERE kc.MaKho = ? AND kc.TinhTrang = 1
        FOR UPDATE
    `, [MaSP, MaKho]);

    if (warehouses.length === 0) return []; // Kho không tồn tại → bỏ qua

    const wh = warehouses[0];
    const space = wh.Capacity - wh.TonHienTai;
    const qty = Math.min(soLuong, Math.max(space, 0));

    if (qty > 0) {
        await conn.query(`
            INSERT INTO ton_kho_chi_tiet (MaKho, MaSP, SoLuongTon)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE SoLuongTon = SoLuongTon + ?
        `, [wh.MaKho, MaSP, qty, qty]);
    }

    if (qty < soLuong) {
        throw Object.assign(
            new Error(`Kho "${wh.TenKho}" đầy. Còn ${soLuong - qty}/${soLuong} chưa phân bổ được.`),
            { code: 'WAREHOUSE_FULL', unallocated: soLuong - qty }
        );
    }

    return [{ MaKho: wh.MaKho, TenKho: wh.TenKho, SoLuong: qty }];
}

const warehouseController = {

    // ========================= SẢN PHẨM (sanpham) =========================

    getAllProducts: async (req, res) => {
        const {
            search, category, author, publisher,
            minPrice, maxPrice, tinhTrang,
            sortBy = 'sp.MaSP', sortOrder = 'ASC',
            page = 1, pageSize = 20
        } = req.query;

        try {
            const params = [];
            let where = 'WHERE 1=1';

            if (tinhTrang !== undefined && tinhTrang !== '') {
                where += ' AND sp.TinhTrang = ?'; params.push(tinhTrang);
            } else {
                where += ' AND sp.TinhTrang = 1';
            }
            if (search) {
                where += ' AND (sp.TenSP LIKE ? OR sp.ISBN LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }
            if (category)  { where += ' AND sp.MaTL = ?';   params.push(category); }
            if (author)    { where += ' AND sp.MaTG = ?';   params.push(author); }
            if (publisher) { where += ' AND sp.MaNXB = ?';  params.push(publisher); }
            if (minPrice)  { where += ' AND sp.DonGia >= ?'; params.push(minPrice); }
            if (maxPrice)  { where += ' AND sp.DonGia <= ?'; params.push(maxPrice); }

            const allowedSort = ['sp.MaSP', 'sp.TenSP', 'sp.DonGia', 'sp.GiaNhap', 'sp.NamXB', 'sp.NgayTao'];
            const safeSort = allowedSort.includes(sortBy) ? sortBy : 'sp.MaSP';
            const safeOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

            const offset = (parseInt(page) - 1) * parseInt(pageSize);

            const [rows] = await pool.query(`
                SELECT sp.*,
                       tg.TenTG, tl.TenTL, nxb.TenNXB,
                       IFNULL((SELECT SUM(SoLuongTon) FROM ton_kho WHERE MaSP = sp.MaSP), 0) AS TongTonKho
                FROM sanpham sp
                LEFT JOIN tacgia tg ON sp.MaTG = tg.MaTG
                LEFT JOIN theloai tl ON sp.MaTL = tl.MaTL
                LEFT JOIN nhaxuatban nxb ON sp.MaNXB = nxb.MaNXB
                ${where}
                ORDER BY ${safeSort} ${safeOrder}
                LIMIT ? OFFSET ?
            `, [...params, parseInt(pageSize), offset]);

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) AS total FROM sanpham sp ${where}`, params
            );

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total,
                    totalPages: Math.ceil(total / parseInt(pageSize))
                }
            });
        } catch (error) {
            console.error('getAllProducts:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getProductById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query(`
                SELECT sp.*,
                       tg.TenTG, tl.TenTL, nxb.TenNXB,
                       IFNULL((SELECT SUM(SoLuongTon) FROM ton_kho WHERE MaSP = sp.MaSP), 0) AS TongTonKho
                FROM sanpham sp
                LEFT JOIN tacgia tg ON sp.MaTG = tg.MaTG
                LEFT JOIN theloai tl ON sp.MaTL = tl.MaTL
                LEFT JOIN nhaxuatban nxb ON sp.MaNXB = nxb.MaNXB
                WHERE sp.MaSP = ?
            `, [id]);

            if (!rows.length) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });

            const [stock] = await pool.query(`
                SELECT tk.MaCH, tk.SoLuongTon, tk.SoLuongToiThieu, tk.ViTri, kc.TenKho AS TenCH
                FROM ton_kho tk
                LEFT JOIN kho_con kc ON tk.MaCH = kc.MaKho
                WHERE tk.MaSP = ?
            `, [id]);

            res.json({ success: true, data: { ...rows[0], TonKhoBranch: stock } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createProduct: async (req, res) => {
        const data = req.body;
        const files = req.files;
        try {
            const hinhAnh = files?.HinhAnh?.[0]?.filename
                ? `/uploads/images/${files.HinhAnh[0].filename}`
                : (data.HinhAnh || null);

            const [result] = await pool.query(`
                INSERT INTO sanpham
                    (TenSP, MoTa, DonGia, GiaNhap, HinhAnh, MaTL, MaTG, MaNXB,
                     NamXB, SoTrang, TrongLuong, KichThuoc, ISBN, TinhTrang, MinSoLuong)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            `, [
                data.TenSP,
                data.MoTa || null,
                parseFloat(data.DonGia) || 0,
                parseFloat(data.GiaNhap) || 0,
                hinhAnh,
                data.MaTL || null,
                data.MaTG || null,
                data.MaNXB || null,
                data.NamXB || null,
                data.SoTrang || null,
                data.TrongLuong || null,
                data.KichThuoc || null,
                data.ISBN || null,
                parseInt(data.MinSoLuong) || 0
            ]);

            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Them',
                BangDuLieu: 'sanpham', MaBanGhi: result.insertId,
                DuLieuMoi: JSON.stringify({ TenSP: data.TenSP }),
                DiaChi_IP: req.ip
            });

            res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', MaSP: result.insertId });
        } catch (error) {
            console.error('createProduct:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateProduct: async (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const files = req.files;
        try {
            const [existing] = await pool.query('SELECT * FROM sanpham WHERE MaSP = ?', [id]);
            if (!existing.length) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });

            const hinhAnh = files?.HinhAnh?.[0]?.filename
                ? `/uploads/images/${files.HinhAnh[0].filename}`
                : (data.HinhAnh || existing[0].HinhAnh);

            const fields = [];
            const values = [];

            const setField = (col, val) => { if (val !== undefined) { fields.push(`${col} = ?`); values.push(val); } };

            setField('TenSP', data.TenSP);
            setField('MoTa', data.MoTa ?? null);
            if (data.DonGia !== undefined) setField('DonGia', parseFloat(data.DonGia) || 0);
            if (data.GiaNhap !== undefined) setField('GiaNhap', parseFloat(data.GiaNhap) || 0);
            setField('HinhAnh', hinhAnh);
            setField('MaTL', data.MaTL || null);
            setField('MaTG', data.MaTG || null);
            setField('MaNXB', data.MaNXB || null);
            setField('NamXB', data.NamXB || null);
            setField('SoTrang', data.SoTrang || null);
            setField('TrongLuong', data.TrongLuong || null);
            setField('KichThuoc', data.KichThuoc || null);
            setField('ISBN', data.ISBN || null);
            if (data.MinSoLuong !== undefined) setField('MinSoLuong', parseInt(data.MinSoLuong) || 0);
            if (data.TinhTrang !== undefined) setField('TinhTrang', data.TinhTrang);

            if (!fields.length) return res.status(400).json({ success: false, message: 'Không có dữ liệu cần cập nhật' });

            values.push(id);
            await pool.query(`UPDATE sanpham SET ${fields.join(', ')} WHERE MaSP = ?`, values);

            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Sua',
                BangDuLieu: 'sanpham', MaBanGhi: id,
                DuLieuCu: JSON.stringify(existing[0]),
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
        } catch (error) {
            console.error('updateProduct:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteProduct: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('UPDATE sanpham SET TinhTrang = 0 WHERE MaSP = ?', [id]);
            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Xoa',
                BangDuLieu: 'sanpham', MaBanGhi: id, DiaChi_IP: req.ip
            });
            res.json({ success: true, message: 'Đã ẩn sản phẩm' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateMinStock: async (req, res) => {
        const { id } = req.params;
        const { MinSoLuong } = req.body;
        try {
            await pool.query('UPDATE sanpham SET MinSoLuong = ? WHERE MaSP = ?', [parseInt(MinSoLuong) || 0, id]);
            res.json({ success: true, message: 'Cập nhật ngưỡng tồn thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ========================= PHIẾU NHẬP (phieunhap + chitietphieunhap) =========================

    getAllPurchaseOrders: async (req, res) => {
        const { page = 1, pageSize = 20, MaNCC, MaCH, startDate, endDate, TrangThai } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);

        try {
            const params = [];
            let where = 'WHERE 1=1';
            if (MaNCC)     { where += ' AND pn.MaNCC = ?';           params.push(MaNCC); }
            if (MaCH)      { where += ' AND pn.MaCH = ?';            params.push(MaCH); }
            if (TrangThai) { where += ' AND pn.TrangThai = ?';        params.push(TrangThai); }
            if (startDate) { where += ' AND DATE(pn.NgayNhap) >= ?';  params.push(startDate); }
            if (endDate)   { where += ' AND DATE(pn.NgayNhap) <= ?';  params.push(endDate); }

            const [rows] = await pool.query(`
                SELECT pn.MaPN, pn.NgayNhap, pn.TongTien, pn.DaThanhToan, pn.ConNo,
                       pn.TrangThai, pn.GhiChu,
                       ncc.MaNCC, ncc.TenNCC,
                       pn.MaCH, kc.TenKho AS TenCH,
                       tk.TenTK AS NguoiLap
                FROM phieunhap pn
                JOIN nhacungcap ncc ON pn.MaNCC = ncc.MaNCC
                LEFT JOIN kho_con kc ON pn.MaCH = kc.MaKho
                LEFT JOIN taikhoan tk ON pn.MaTK = tk.MaTK
                ${where}
                ORDER BY pn.NgayNhap DESC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(pageSize), offset]);

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) AS total FROM phieunhap pn ${where}`, params
            );

            res.json({
                success: true, data: rows,
                pagination: {
                    page: parseInt(page), pageSize: parseInt(pageSize),
                    total, totalPages: Math.ceil(total / parseInt(pageSize))
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getPurchaseOrderById: async (req, res) => {
        const { id } = req.params;
        try {
            const [header] = await pool.query(`
                SELECT pn.*,
                       ncc.TenNCC, ncc.DiaChi AS DiaChiNCC, ncc.SDT AS SDTNCC, ncc.Email AS EmailNCC,
                       kc.TenKho AS TenCH, kc.ViTri AS DiaChiCH,
                       tk.TenTK AS NguoiLap
                FROM phieunhap pn
                JOIN nhacungcap ncc ON pn.MaNCC = ncc.MaNCC
                LEFT JOIN kho_con kc ON pn.MaCH = kc.MaKho
                LEFT JOIN taikhoan tk ON pn.MaTK = tk.MaTK
                WHERE pn.MaPN = ?
            `, [id]);

            if (!header.length) return res.status(404).json({ success: false, message: 'Phiếu nhập không tồn tại' });

            const [items] = await pool.query(`
                SELECT ctp.MaSP, ctp.DonGiaNhap, ctp.SoLuong, ctp.ThanhTien,
                       sp.TenSP, sp.HinhAnh, sp.ISBN, sp.DonGia
                FROM chitietphieunhap ctp
                JOIN sanpham sp ON ctp.MaSP = sp.MaSP
                WHERE ctp.MaPN = ?
            `, [id]);

            const [allocations] = await pool.query(`
                SELECT pb.MaSP, pb.MaKho, pb.SoLuong, pb.ThoiGian,
                       kc.TenKho, sp.TenSP
                FROM chitiet_phanbokho pb
                JOIN kho_con kc ON pb.MaKho = kc.MaKho
                JOIN sanpham sp ON pb.MaSP = sp.MaSP
                WHERE pb.MaPN = ?
            `, [id]);

            res.json({ success: true, data: { ...header[0], items, allocations } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createPurchaseOrder: async (req, res) => {
        const { MaNCC, MaCH, ChiTiet, DaThanhToan = 0, GhiChu, TyLeLoi } = req.body;

        if (!MaNCC || !MaCH || !Array.isArray(ChiTiet) || !ChiTiet.length) {
            return res.status(400).json({ success: false, message: 'Thiếu MaNCC, MaCH hoặc danh sách sản phẩm' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [ncc] = await conn.query('SELECT MaNCC FROM nhacungcap WHERE MaNCC = ? AND TinhTrang = 1', [MaNCC]);
            if (!ncc.length) throw new Error('Nhà cung cấp không tồn tại hoặc đã ngưng hoạt động');

            const [ch] = await conn.query('SELECT MaKho FROM kho_con WHERE MaKho = ? AND TinhTrang = 1', [MaCH]);
            if (!ch.length) throw new Error('Kho không tồn tại hoặc đã ngưng hoạt động');

            const tongTien = ChiTiet.reduce((sum, item) => sum + Number(item.SoLuong) * Number(item.DonGiaNhap), 0);
            const conNo = Math.max(0, tongTien - Number(DaThanhToan));

            // 1. Tạo phiếu nhập
            const [pnResult] = await conn.query(`
                INSERT INTO phieunhap (MaNCC, MaCH, MaTK, TongTien, DaThanhToan, ConNo, TrangThai, GhiChu)
                VALUES (?, ?, ?, ?, ?, ?, 'Hoan_thanh', ?)
            `, [MaNCC, MaCH, req.user.MaTK, tongTien, Number(DaThanhToan), conNo, GhiChu || null]);

            const MaPN = pnResult.insertId;

            // 2. Chi tiết phiếu nhập (batch)
            const detailValues = ChiTiet.map(item => [MaPN, item.MaSP, Number(item.DonGiaNhap), Number(item.SoLuong)]);
            await conn.query('INSERT INTO chitietphieunhap (MaPN, MaSP, DonGiaNhap, SoLuong) VALUES ?', [detailValues]);

            // 3. Cập nhật tồn kho + phân bổ kho con
            const allocationLogs = [];
            for (const item of ChiTiet) {
                const qty  = Number(item.SoLuong);
                const maSP = Number(item.MaSP);

                await conn.query(`
                    INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE SoLuongTon = SoLuongTon + ?
                `, [maSP, MaCH, qty, qty]);

                try {
                    const allocation = await allocateToWarehouse(conn, MaCH, maSP, qty);
                    allocationLogs.push({ MaSP: maSP, allocation });
                    for (const a of allocation) {
                        await conn.query(
                            'INSERT INTO chitiet_phanbokho (MaPN, MaSP, MaKho, SoLuong) VALUES (?, ?, ?, ?)',
                            [MaPN, maSP, a.MaKho, a.SoLuong]
                        );
                    }
                } catch (allocErr) {
                    if (allocErr.code !== 'WAREHOUSE_FULL') throw allocErr;
                    console.warn(`Kho con đầy cho SP ${maSP}:`, allocErr.message);
                }
            }

            // 4. Cập nhật giá
            for (const item of ChiTiet) {
                const giaNhap = Number(item.DonGiaNhap);
                if (TyLeLoi && Number(TyLeLoi) > 0) {
                    const donGia = Math.round(giaNhap * (1 + Number(TyLeLoi) / 100));
                    await conn.query(
                        'UPDATE sanpham SET GiaNhap = ?, DonGia = ?, TinhTrang = 1 WHERE MaSP = ?',
                        [giaNhap, donGia, item.MaSP]
                    );
                } else {
                    await conn.query(
                        'UPDATE sanpham SET GiaNhap = ?, TinhTrang = 1 WHERE MaSP = ?',
                        [giaNhap, item.MaSP]
                    );
                }
            }

            // 5. Công nợ NCC
            if (conNo > 0) {
                await conn.query(
                    'INSERT INTO cong_no_ncc (MaNCC, MaPN, SoTienNo, TrangThai) VALUES (?, ?, ?, ?)',
                    [MaNCC, MaPN, conNo, 'Chua_thanh_toan']
                );
            }

            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Them',
                BangDuLieu: 'phieunhap', MaBanGhi: MaPN,
                DuLieuMoi: JSON.stringify({ MaNCC, MaCH, TongTien: tongTien, ConNo: conNo }),
                DiaChi_IP: req.ip
            });

            await conn.commit();
            res.status(201).json({
                success: true, message: 'Tạo phiếu nhập thành công',
                MaPN, TongTien: tongTien, ConNo: conNo, allocationLogs
            });
        } catch (error) {
            await conn.rollback();
            console.error('createPurchaseOrder:', error);
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    // ========================= TỒN KHO (ton_kho) =========================

    getStock: async (req, res) => {
        const { MaCH, MaSP, search, lowStock, page = 1, pageSize = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);

        try {
            const params = [];
            let where = 'WHERE sp.TinhTrang = 1';
            if (MaCH)  { where += ' AND tk.MaCH = ?';  params.push(MaCH); }
            if (MaSP)  { where += ' AND tk.MaSP = ?';  params.push(MaSP); }
            if (search) { where += ' AND sp.TenSP LIKE ?'; params.push(`%${search}%`); }
            if (lowStock === 'true') { where += ' AND tk.SoLuongTon <= tk.SoLuongToiThieu'; }

            const [rows] = await pool.query(`
                SELECT tk.id, tk.MaSP, tk.MaCH, tk.SoLuongTon, tk.SoLuongToiThieu, tk.ViTri, tk.NgayCapNhat,
                       sp.TenSP, sp.DonGia, sp.GiaNhap, sp.HinhAnh, sp.ISBN,
                       kc.TenKho AS TenCH,
                       (tk.SoLuongTon * sp.DonGia) AS GiaTriTonKho,
                       CASE
                           WHEN tk.SoLuongTon = 0             THEN 'Het_hang'
                           WHEN tk.SoLuongTon <= tk.SoLuongToiThieu THEN 'Can_nhap_them'
                           ELSE 'Binh_thuong'
                       END AS TrangThaiTon
                FROM ton_kho tk
                JOIN sanpham sp ON tk.MaSP = sp.MaSP
                LEFT JOIN kho_con kc ON tk.MaCH = kc.MaKho
                ${where}
                ORDER BY kc.TenKho, sp.TenSP
                LIMIT ? OFFSET ?
            `, [...params, parseInt(pageSize), offset]);

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) AS total
                 FROM ton_kho tk
                 JOIN sanpham sp ON tk.MaSP = sp.MaSP
                 ${where}`, params
            );

            res.json({
                success: true, data: rows,
                pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy tồn kho Kho quầy (Priority=1) cho POS
    getCounterStock: async (req, res) => {
        const { MaCH, pageSize = 1000 } = req.query;
        try {
            const params = [];
            let where = 'WHERE sp.TinhTrang = 1 AND kc.Priority = 1';
            if (MaCH) { where += ' AND kc.MaCH = ?'; params.push(MaCH); }

            const [rows] = await pool.query(`
                SELECT tkct.MaSP, tkct.MaKho, tkct.SoLuongTon,
                       kc.TenKho, kc.MaCH, kc.Priority
                FROM ton_kho_chi_tiet tkct
                JOIN kho_con kc ON tkct.MaKho = kc.MaKho
                JOIN sanpham sp ON tkct.MaSP = sp.MaSP
                ${where}
                LIMIT ?
            `, [...params, parseInt(pageSize)]);

            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getLowStockAlerts: async (req, res) => {
        const { MaCH } = req.query;
        try {
            const params = [];
            let where = 'WHERE tk.SoLuongTon <= tk.SoLuongToiThieu AND sp.TinhTrang = 1';
            if (MaCH) { where += ' AND tk.MaCH = ?'; params.push(MaCH); }

            const [rows] = await pool.query(`
                SELECT tk.MaSP, tk.MaCH, tk.SoLuongTon, tk.SoLuongToiThieu,
                       (tk.SoLuongToiThieu - tk.SoLuongTon) AS SoLuongCanNhap,
                       sp.TenSP, sp.DonGia, sp.HinhAnh,
                       kc.TenKho AS TenCH
                FROM ton_kho tk
                JOIN sanpham sp ON tk.MaSP = sp.MaSP
                LEFT JOIN kho_con kc ON tk.MaCH = kc.MaKho
                ${where}
                ORDER BY (tk.SoLuongToiThieu - tk.SoLuongTon) DESC
            `, params);

            res.json({ success: true, data: rows, count: rows.length });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ========================= KHO CON (kho_con) =========================

    getSubWarehouses: async (req, res) => {
        const { MaCH } = req.query;
        try {
            const params = [];
            let where = 'WHERE 1=1';
            if (MaCH) { where += ' AND kc.MaCH = ?'; params.push(MaCH); }

            const [rows] = await pool.query(`
                SELECT kc.*,
                       COALESCE((SELECT SUM(SoLuongTon) FROM ton_kho_chi_tiet WHERE MaKho = kc.MaKho), 0) AS SoLuongHienTai,
                       ROUND(
                           COALESCE((SELECT SUM(SoLuongTon) FROM ton_kho_chi_tiet WHERE MaKho = kc.MaKho), 0)
                           * 100.0 / NULLIF(kc.Capacity, 0), 1
                       ) AS PhanTramLapDay
                FROM kho_con kc
                ${where}
                ORDER BY kc.Priority ASC
            `, params);

            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createSubWarehouse: async (req, res) => {
        const { TenKho, Capacity, Priority, ViTri, GhiChu } = req.body;
        if (!TenKho || !Capacity || !Priority) {
            return res.status(400).json({ success: false, message: 'Thiếu: TenKho, Capacity, Priority' });
        }
        try {
            const [dupName] = await pool.query(
                'SELECT MaKho FROM kho_con WHERE TenKho = ?',
                [TenKho]
            );
            if (dupName.length) return res.status(400).json({ success: false, message: `Tên kho "${TenKho}" đã tồn tại trong hệ thống` });

            const [result] = await pool.query(
                'INSERT INTO kho_con (TenKho, Capacity, Priority, ViTri, GhiChu) VALUES (?, ?, ?, ?, ?)',
                [TenKho, Number(Capacity), Number(Priority), ViTri || null, GhiChu || null]
            );

            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Them',
                BangDuLieu: 'kho_con', MaBanGhi: result.insertId,
                DuLieuMoi: JSON.stringify({ TenKho, Capacity, Priority }),
                DiaChi_IP: req.ip
            });

            res.status(201).json({ success: true, message: 'Tạo kho con thành công', MaKho: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateSubWarehouse: async (req, res) => {
        const { id } = req.params;
        const { TenKho, Capacity, Priority, ViTri, GhiChu, TinhTrang } = req.body;
        try {
            const [existing] = await pool.query('SELECT * FROM kho_con WHERE MaKho = ?', [id]);
            if (!existing.length) return res.status(404).json({ success: false, message: 'Kho con không tồn tại' });

            if (TenKho && TenKho !== existing[0].TenKho) {
                const [dupName] = await pool.query(
                    'SELECT MaKho FROM kho_con WHERE TenKho = ? AND MaKho != ?',
                    [TenKho, id]
                );
                if (dupName.length) return res.status(400).json({ success: false, message: `Tên kho "${TenKho}" đã tồn tại trong hệ thống` });
            }

            // Priority uniqueness check removed (warehouses are now independent)

            if (Number(TinhTrang) === 0) {
                const [[{ total }]] = await pool.query(
                    'SELECT COALESCE(SUM(SoLuongTon), 0) AS total FROM ton_kho_chi_tiet WHERE MaKho = ?', [id]
                );
                if (total > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Kho còn ${total} sản phẩm. Hãy chuyển hàng ra trước khi vô hiệu hóa.`
                    });
                }
            }

            await pool.query(`
                UPDATE kho_con SET
                    TenKho    = COALESCE(?, TenKho),
                    Capacity  = COALESCE(?, Capacity),
                    Priority  = COALESCE(?, Priority),
                    ViTri     = COALESCE(?, ViTri),
                    GhiChu    = COALESCE(?, GhiChu),
                    TinhTrang = COALESCE(?, TinhTrang)
                WHERE MaKho = ?
            `, [TenKho || null, Capacity ? Number(Capacity) : null,
                Priority ? Number(Priority) : null, ViTri ?? null,
                GhiChu ?? null, TinhTrang != null ? Number(TinhTrang) : null, id]);

            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Sua',
                BangDuLieu: 'kho_con', MaBanGhi: id,
                DuLieuCu: JSON.stringify(existing[0]),
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật kho con thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteSubWarehouse: async (req, res) => {
        const { id } = req.params;
        try {
            const [existing] = await pool.query('SELECT * FROM kho_con WHERE MaKho = ?', [id]);
            if (!existing.length) return res.status(404).json({ success: false, message: 'Kho con không tồn tại' });

            const [[{ total }]] = await pool.query(
                'SELECT COALESCE(SUM(SoLuongTon), 0) AS total FROM ton_kho_chi_tiet WHERE MaKho = ?', [id]
            );
            if (total > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Không thể xóa — kho còn ${total} sản phẩm. Hãy chuyển hàng ra trước.`
                });
            }

            await pool.query('UPDATE kho_con SET TinhTrang = 0 WHERE MaKho = ?', [id]);

            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Xoa',
                BangDuLieu: 'kho_con', MaBanGhi: id, DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Đã vô hiệu hóa kho con' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getStockBySubWarehouse: async (req, res) => {
        const { MaCH, MaKho, search, page = 1, pageSize = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        try {
            const params = [];
            let where = 'WHERE 1=1';
            if (MaCH)   { where += ' AND tkct.MaKho = ?'; params.push(MaCH); } // MaCH now treated as MaKho
            if (MaKho)  { where += ' AND tkct.MaKho = ?'; params.push(MaKho); }
            if (search) { where += ' AND sp.TenSP LIKE ?'; params.push(`%${search}%`); }

            const [rows] = await pool.query(`
                SELECT tkct.MaKho, tkct.MaSP, tkct.SoLuongTon, tkct.CapNhatLuc,
                       kc.TenKho, kc.Capacity, kc.Priority,
                       sp.TenSP, sp.DonGia, sp.HinhAnh, sp.ISBN,
                       ROUND(tkct.SoLuongTon * 100.0 / NULLIF(kc.Capacity, 0), 1) AS PhanTramSuDung
                FROM ton_kho_chi_tiet tkct
                JOIN kho_con kc ON tkct.MaKho = kc.MaKho
                JOIN sanpham sp ON tkct.MaSP = sp.MaSP
                ${where}
                ORDER BY kc.Priority ASC, sp.TenSP ASC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(pageSize), offset]);

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) AS total
                 FROM ton_kho_chi_tiet tkct
                 JOIN kho_con kc ON tkct.MaKho = kc.MaKho
                 JOIN sanpham sp ON tkct.MaSP = sp.MaSP
                 ${where}`, params
            );

            res.json({
                success: true, data: rows,
                pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ========================= CHUYỂN KHO (chuyen_kho) =========================

    getTransfers: async (req, res) => {
        const { MaKhoNguon, MaKhoDich, TrangThai, page = 1, pageSize = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        try {
            const params = [];
            let where = 'WHERE 1=1';
            if (MaKhoNguon) { where += ' AND ck.MaKhoNguon = ?'; params.push(MaKhoNguon); }
            if (MaKhoDich)  { where += ' AND ck.MaKhoDich = ?';  params.push(MaKhoDich); }
            if (TrangThai)  { where += ' AND ck.TrangThai = ?';   params.push(TrangThai); }

            const [rows] = await pool.query(`
                SELECT ck.*,
                       sp.TenSP, sp.HinhAnh,
                       kc1.TenKho AS TenKhoNguon, kc1.Priority AS PriorityNguon,
                       kc2.TenKho AS TenKhoDich,  kc2.Priority AS PriorityDich,
                       nv1.HoTen AS TenNguoiChuyen,
                       nv2.HoTen AS TenNguoiNhan
                FROM chuyen_kho ck
                JOIN sanpham sp ON ck.MaSP = sp.MaSP
                LEFT JOIN kho_con kc1 ON ck.MaKhoNguon = kc1.MaKho
                LEFT JOIN kho_con kc2 ON ck.MaKhoDich  = kc2.MaKho
                LEFT JOIN nhanvien nv1 ON ck.NguoiChuyen = nv1.MaNV
                LEFT JOIN nhanvien nv2 ON ck.NguoiNhan   = nv2.MaNV
                ${where}
                ORDER BY ck.NgayChuyen DESC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(pageSize), offset]);

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) AS total FROM chuyen_kho ck ${where}`, params
            );

            res.json({
                success: true, data: rows,
                pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getTransferById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query(`
                SELECT ck.*,
                       sp.TenSP, sp.HinhAnh, sp.ISBN,
                       kc1.TenKho AS TenKhoNguon, kc1.Priority AS PriorityNguon,
                       kc2.TenKho AS TenKhoDich,  kc2.Priority AS PriorityDich,
                       nv1.HoTen AS TenNguoiChuyen,
                       nv2.HoTen AS TenNguoiNhan
                FROM chuyen_kho ck
                JOIN sanpham sp ON ck.MaSP = sp.MaSP
                LEFT JOIN kho_con kc1 ON ck.MaKhoNguon = kc1.MaKho
                LEFT JOIN kho_con kc2 ON ck.MaKhoDich  = kc2.MaKho
                LEFT JOIN nhanvien nv1 ON ck.NguoiChuyen = nv1.MaNV
                LEFT JOIN nhanvien nv2 ON ck.NguoiNhan   = nv2.MaNV
                WHERE ck.MaCK = ?
            `, [id]);

            if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu chuyển kho' });
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createTransfer: async (req, res) => {
        const { MaKhoNguon, MaKhoDich, items, GhiChu } = req.body;

        if (!MaKhoNguon || !MaKhoDich) {
            return res.status(400).json({ success: false, message: 'Thiếu kho nguồn hoặc kho đích' });
        }
        if (String(MaKhoNguon) === String(MaKhoDich)) {
            return res.status(400).json({ success: false, message: 'Kho nguồn và kho đích không được trùng nhau' });
        }
        if (!Array.isArray(items) || !items.length) {
            return res.status(400).json({ success: false, message: 'Danh sách sản phẩm không hợp lệ' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Kiểm tra kho nguồn và kho đích tồn tại
            const [[khoNguon]] = await conn.query('SELECT MaKho, TenKho FROM kho_con WHERE MaKho = ? AND TinhTrang = 1', [MaKhoNguon]);
            const [[khoDich]]  = await conn.query('SELECT MaKho, TenKho FROM kho_con WHERE MaKho = ? AND TinhTrang = 1', [MaKhoDich]);
            if (!khoNguon) throw new Error('Kho nguồn không tồn tại hoặc đã ngưng hoạt động');
            if (!khoDich)  throw new Error('Kho đích không tồn tại hoặc đã ngưng hoạt động');

            const [emp] = await conn.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            const nguoiChuyen = emp[0]?.MaNV || null;

            const created = [];
            for (const item of items) {
                const { MaSP, SoLuong } = item;
                if (!MaSP || !SoLuong || SoLuong <= 0) throw new Error('Sản phẩm hoặc số lượng không hợp lệ');

                // Kiểm tra tồn kho tại kho nguồn (ton_kho_chi_tiet)
                const [[stock]] = await conn.query(
                    'SELECT SoLuongTon FROM ton_kho_chi_tiet WHERE MaKho = ? AND MaSP = ?', [MaKhoNguon, MaSP]
                );
                if (!stock || stock.SoLuongTon < SoLuong) {
                    throw new Error(`Kho "${khoNguon.TenKho}" không đủ hàng SP ${MaSP}. Tồn: ${stock?.SoLuongTon || 0}, yêu cầu: ${SoLuong}`);
                }

                const [ck] = await conn.query(`
                    INSERT INTO chuyen_kho (MaKhoNguon, MaKhoDich, MaSP, SoLuong, NguoiChuyen, TrangThai, GhiChu)
                    VALUES (?, ?, ?, ?, ?, 'Cho_duyet', ?)
                `, [MaKhoNguon, MaKhoDich, MaSP, SoLuong, nguoiChuyen, GhiChu || null]);

                created.push(ck.insertId);
            }

            await conn.commit();
            res.status(201).json({
                success: true,
                message: `Đã tạo ${created.length} yêu cầu chuyển kho (đang chờ duyệt)`,
                MaCKList: created
            });
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

            const [rows] = await conn.query('SELECT * FROM chuyen_kho WHERE MaCK = ? FOR UPDATE', [id]);
            if (!rows.length) throw new Error('Yêu cầu chuyển kho không tồn tại');
            if (rows[0].TrangThai !== 'Cho_duyet') {
                throw new Error(`Không thể duyệt — trạng thái hiện tại: ${rows[0].TrangThai}`);
            }

            const { MaKhoNguon, MaKhoDich, MaSP, SoLuong } = rows[0];

            // Kiểm tra tồn kho tại kho nguồn (ton_kho_chi_tiet)
            const [[stockSrc]] = await conn.query(
                'SELECT SoLuongTon FROM ton_kho_chi_tiet WHERE MaKho = ? AND MaSP = ? FOR UPDATE',
                [MaKhoNguon, MaSP]
            );
            if (!stockSrc || stockSrc.SoLuongTon < SoLuong) {
                throw new Error(`Không đủ hàng tại kho nguồn. Tồn: ${stockSrc?.SoLuongTon || 0}, yêu cầu: ${SoLuong}`);
            }

            const [emp] = await conn.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            const nguoiNhan = emp[0]?.MaNV || null;

            // Lấy MaCH của kho nguồn và kho đích để cập nhật ton_kho (tổng)
            const [[khoNguon]] = await conn.query('SELECT MaCH FROM kho_con WHERE MaKho = ?', [MaKhoNguon]);
            const [[khoDich]]  = await conn.query('SELECT MaCH FROM kho_con WHERE MaKho = ?', [MaKhoDich]);

            // 1. Cập nhật ton_kho_chi_tiet (kho con cụ thể)
            await conn.query(
                'UPDATE ton_kho_chi_tiet SET SoLuongTon = SoLuongTon - ? WHERE MaKho = ? AND MaSP = ?',
                [SoLuong, MaKhoNguon, MaSP]
            );
            await conn.query(`
                INSERT INTO ton_kho_chi_tiet (MaKho, MaSP, SoLuongTon)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE SoLuongTon = SoLuongTon + ?
            `, [MaKhoDich, MaSP, SoLuong, SoLuong]);

            // 2. Cập nhật ton_kho (tổng chi nhánh) — chỉ cập nhật nếu khác chi nhánh
            if (khoNguon && khoDich) {
                if (String(khoNguon.MaCH) !== String(khoDich.MaCH)) {
                    await conn.query(
                        'UPDATE ton_kho SET SoLuongTon = SoLuongTon - ? WHERE MaSP = ? AND MaCH = ?',
                        [SoLuong, MaSP, khoNguon.MaCH]
                    );
                    await conn.query(`
                        INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon)
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE SoLuongTon = SoLuongTon + ?
                    `, [MaSP, khoDich.MaCH, SoLuong, SoLuong]);
                }
                // Nếu cùng chi nhánh: ton_kho không đổi (chỉ di chuyển nội bộ giữa kho con)
            }

            await conn.query(
                'UPDATE chuyen_kho SET TrangThai = ?, NguoiNhan = ?, NgayNhan = NOW() WHERE MaCK = ?',
                ['Da_nhan', nguoiNhan, id]
            );

            await conn.commit();
            res.json({ success: true, message: 'Đã duyệt và hoàn tất chuyển kho' });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    cancelTransfer: async (req, res) => {
        const { id } = req.params;
        const { LyDo } = req.body;
        try {
            const [rows] = await pool.query('SELECT TrangThai FROM chuyen_kho WHERE MaCK = ?', [id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu' });
            if (rows[0].TrangThai !== 'Cho_duyet') {
                return res.status(400).json({ success: false, message: 'Chỉ có thể hủy yêu cầu đang chờ duyệt' });
            }

            await pool.query(
                "UPDATE chuyen_kho SET TrangThai = 'Huy', GhiChu = CONCAT(COALESCE(GhiChu,''), ' | Hủy: ', ?) WHERE MaCK = ?",
                [LyDo || 'Không có lý do', id]
            );

            res.json({ success: true, message: 'Đã hủy yêu cầu chuyển kho' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ========================= KIỂM KÊ KHO =========================

    getAllInventoryChecks: async (req, res) => {
        const { MaCH, TrangThai, page = 1, pageSize = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        try {
            const params = [];
            let where = 'WHERE 1=1';
            if (MaCH)      { where += ' AND kk.MaCH = ?';      params.push(MaCH); }
            if (TrangThai) { where += ' AND kk.TrangThai = ?';  params.push(TrangThai); }

            const [rows] = await pool.query(`
                SELECT kk.*,
                       kc.TenKho AS TenCH,
                       nv.HoTen AS TenNguoiKiemKe,
                       (SELECT COUNT(*) FROM chi_tiet_kiem_ke ctk WHERE ctk.MaKiemKe = kk.MaKiemKe) AS SoSanPham,
                       (SELECT COUNT(*) FROM chi_tiet_kiem_ke ctk WHERE ctk.MaKiemKe = kk.MaKiemKe AND ctk.ChenhLech != 0) AS SoChenhLech
                FROM kiem_ke_kho kk
                LEFT JOIN kho_con kc ON kk.MaCH = kc.MaKho
                JOIN nhanvien nv ON kk.NguoiKiemKe = nv.MaNV
                ${where}
                ORDER BY kk.NgayKiemKe DESC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(pageSize), offset]);

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) AS total FROM kiem_ke_kho kk ${where}`, params
            );

            res.json({
                success: true, data: rows,
                pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getInventoryCheckById: async (req, res) => {
        const { id } = req.params;
        try {
            const [header] = await pool.query(`
                SELECT kk.*, kc.TenKho AS TenCH, nv.HoTen AS TenNguoiKiemKe
                FROM kiem_ke_kho kk
                LEFT JOIN kho_con kc ON kk.MaCH = kc.MaKho
                JOIN nhanvien nv ON kk.NguoiKiemKe = nv.MaNV
                WHERE kk.MaKiemKe = ?
            `, [id]);

            if (!header.length) return res.status(404).json({ success: false, message: 'Phiếu kiểm kê không tồn tại' });

            const [items] = await pool.query(`
                SELECT ctk.MaSP, ctk.SoLuongHeThong, ctk.SoLuongThucTe, ctk.ChenhLech, ctk.LyDo,
                       sp.TenSP, sp.HinhAnh, sp.ISBN
                FROM chi_tiet_kiem_ke ctk
                JOIN sanpham sp ON ctk.MaSP = sp.MaSP
                WHERE ctk.MaKiemKe = ?
                ORDER BY sp.TenSP
            `, [id]);

            res.json({ success: true, data: { ...header[0], items } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createInventoryCheck: async (req, res) => {
        const { MaCH, NgayKiemKe, items, GhiChu } = req.body;

        if (!MaCH || !Array.isArray(items) || !items.length) {
            return res.status(400).json({ success: false, message: 'Thiếu MaCH hoặc danh sách sản phẩm' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [emp] = await conn.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            if (!emp.length) throw new Error('Tài khoản không liên kết với nhân viên nào');
            const MaNV = emp[0].MaNV;

            const ngay = NgayKiemKe || new Date().toISOString().split('T')[0];

            const [kkResult] = await conn.query(
                'INSERT INTO kiem_ke_kho (MaCH, NgayKiemKe, NguoiKiemKe, TrangThai, GhiChu) VALUES (?, ?, ?, ?, ?)',
                [MaCH, ngay, MaNV, 'Dang_kiem', GhiChu || null]
            );
            const MaKiemKe = kkResult.insertId;

            for (const item of items) {
                const [[stockRow]] = await conn.query(
                    'SELECT COALESCE(SoLuongTon, 0) AS SoLuong FROM ton_kho WHERE MaSP = ? AND MaCH = ?',
                    [item.MaSP, MaCH]
                );
                const soLuongHeThong = stockRow?.SoLuong ?? 0;

                await conn.query(
                    'INSERT INTO chi_tiet_kiem_ke (MaKiemKe, MaSP, SoLuongHeThong, SoLuongThucTe, LyDo) VALUES (?, ?, ?, ?, ?)',
                    [MaKiemKe, item.MaSP, soLuongHeThong, Number(item.SoLuongThucTe), item.LyDo || null]
                );
            }

            await conn.commit();
            res.status(201).json({ success: true, message: 'Tạo phiếu kiểm kê thành công', MaKiemKe });
        } catch (error) {
            await conn.rollback();
            console.error('createInventoryCheck:', error);
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    completeInventoryCheck: async (req, res) => {
        const { id } = req.params;
        const { apDungChenhLech = true } = req.body;

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [kk] = await conn.query('SELECT * FROM kiem_ke_kho WHERE MaKiemKe = ?', [id]);
            if (!kk.length) throw new Error('Phiếu kiểm kê không tồn tại');
            if (kk[0].TrangThai === 'Hoan_thanh') throw new Error('Phiếu kiểm kê đã hoàn thành');

            const [items] = await conn.query('SELECT * FROM chi_tiet_kiem_ke WHERE MaKiemKe = ?', [id]);

            if (apDungChenhLech) {
                // Lấy MaKho của kho quầy (Priority=1) để cập nhật chi tiết
                const [[counterKho]] = await conn.query(
                    'SELECT MaKho FROM kho_con WHERE MaCH = ? AND TinhTrang = 1 ORDER BY Priority ASC LIMIT 1',
                    [kk[0].MaCH]
                );

                for (const item of items) {
                    // Cập nhật ton_kho (tổng)
                    await conn.query(`
                        INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon)
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE SoLuongTon = ?
                    `, [item.MaSP, kk[0].MaCH, item.SoLuongThucTe, item.SoLuongThucTe]);

                    // Cập nhật ton_kho_chi_tiet (kho quầy)
                    if (counterKho) {
                        await conn.query(`
                            INSERT INTO ton_kho_chi_tiet (MaKho, MaSP, SoLuongTon)
                            VALUES (?, ?, ?)
                            ON DUPLICATE KEY UPDATE SoLuongTon = ?
                        `, [counterKho.MaKho, item.MaSP, item.SoLuongThucTe, item.SoLuongThucTe]);
                    }
                }

                await logActivity({
                    MaTK: req.user.MaTK, HanhDong: 'KiemKe',
                    BangDuLieu: 'ton_kho', MaBanGhi: id,
                    DuLieuMoi: JSON.stringify({ MaCH: kk[0].MaCH, soSanPham: items.length }),
                    DiaChi_IP: req.ip
                });
            }

            await conn.query(
                "UPDATE kiem_ke_kho SET TrangThai = 'Hoan_thanh' WHERE MaKiemKe = ?", [id]
            );

            await conn.commit();
            const chenhLechCount = items.filter(i => i.ChenhLech !== 0).length;
            res.json({
                success: true,
                message: apDungChenhLech
                    ? `Hoàn thành kiểm kê. Đã đồng bộ ${chenhLechCount} sản phẩm có chênh lệch.`
                    : 'Hoàn thành kiểm kê. Không đồng bộ tồn kho.',
                chenhLechCount
            });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    // ========================= CATALOG HELPERS =========================

    getPublishers: async (req, res) => {
        try {
            const [rows] = await pool.query(
                'SELECT MaNXB, TenNXB FROM nhaxuatban WHERE TinhTrang = 1 ORDER BY TenNXB'
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAuthors: async (req, res) => {
        const { search } = req.query;
        try {
            let sql = 'SELECT * FROM tacgia WHERE TinhTrang = 1';
            const params = [];
            if (search) { sql += ' AND TenTG LIKE ?'; params.push(`%${search}%`); }
            sql += ' ORDER BY TenTG';
            const [rows] = await pool.query(sql, params);
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    addAuthor: async (req, res) => {
        const { TenTG, NgaySinh, QuocTich, MoTa, HinhAnh } = req.body;
        if (!TenTG) return res.status(400).json({ success: false, message: 'TenTG là bắt buộc' });
        try {
            const [result] = await pool.query(
                'INSERT INTO tacgia (TenTG, NgaySinh, QuocTich, MoTa, HinhAnh) VALUES (?, ?, ?, ?, ?)',
                [TenTG, NgaySinh || null, QuocTich || null, MoTa || null, HinhAnh || null]
            );
            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Them',
                BangDuLieu: 'tacgia', MaBanGhi: result.insertId, DiaChi_IP: req.ip
            });
            res.status(201).json({ success: true, message: 'Thêm tác giả thành công', MaTG: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateAuthor: async (req, res) => {
        const { id } = req.params;
        const { TenTG, NgaySinh, QuocTich, MoTa, HinhAnh } = req.body;
        try {
            await pool.query(
                'UPDATE tacgia SET TenTG = ?, NgaySinh = ?, QuocTich = ?, MoTa = ?, HinhAnh = ? WHERE MaTG = ?',
                [TenTG, NgaySinh || null, QuocTich || null, MoTa || null, HinhAnh || null, id]
            );
            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Sua',
                BangDuLieu: 'tacgia', MaBanGhi: id, DiaChi_IP: req.ip
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
                MaTK: req.user.MaTK, HanhDong: 'Xoa',
                BangDuLieu: 'tacgia', MaBanGhi: id, DiaChi_IP: req.ip
            });
            res.json({ success: true, message: 'Đã xóa tác giả' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getSuppliers: async (req, res) => {
        const { search, TinhTrang } = req.query;
        try {
            const params = [];
            let sql = 'SELECT * FROM nhacungcap WHERE 1=1';
            if (TinhTrang !== undefined) { sql += ' AND TinhTrang = ?'; params.push(TinhTrang); }
            else { sql += ' AND TinhTrang = 1'; }
            if (search) { sql += ' AND (TenNCC LIKE ? OR SDT LIKE ? OR Email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
            sql += ' ORDER BY TenNCC';
            const [rows] = await pool.query(sql, params);
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getCategories: async (req, res) => {
        try {
            const [rows] = await pool.query(
                'SELECT MaTL, TenTL, MoTa, TinhTrang FROM theloai ORDER BY TenTL'
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createCategory: async (req, res) => {
        const { TenTL, MoTa } = req.body;
        if (!TenTL?.trim()) return res.status(400).json({ success: false, message: 'Tên thể loại là bắt buộc' });
        try {
            const [dup] = await pool.query('SELECT MaTL FROM theloai WHERE TenTL = ?', [TenTL.trim()]);
            if (dup.length > 0) return res.status(400).json({ success: false, message: 'Thể loại này đã tồn tại' });
            const [result] = await pool.query(
                'INSERT INTO theloai (TenTL, MoTa, TinhTrang) VALUES (?, ?, 1)',
                [TenTL.trim(), MoTa || null]
            );
            res.status(201).json({ success: true, message: 'Thêm thể loại thành công', MaTL: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateCategory: async (req, res) => {
        const { id } = req.params;
        const { TenTL, MoTa, TinhTrang } = req.body;
        if (!TenTL?.trim()) return res.status(400).json({ success: false, message: 'Tên thể loại là bắt buộc' });
        try {
            const [dup] = await pool.query('SELECT MaTL FROM theloai WHERE TenTL = ? AND MaTL != ?', [TenTL.trim(), id]);
            if (dup.length > 0) return res.status(400).json({ success: false, message: 'Tên thể loại đã tồn tại' });
            const [result] = await pool.query(
                'UPDATE theloai SET TenTL = ?, MoTa = ?, TinhTrang = ? WHERE MaTL = ?',
                [TenTL.trim(), MoTa || null, TinhTrang ?? 1, id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại' });
            res.json({ success: true, message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteCategory: async (req, res) => {
        const { id } = req.params;
        try {
            const [used] = await pool.query('SELECT COUNT(*) AS cnt FROM sanpham WHERE MaTL = ?', [id]);
            if (used[0].cnt > 0) return res.status(400).json({ success: false, message: `Không thể xóa: có ${used[0].cnt} sản phẩm thuộc thể loại này` });
            const [result] = await pool.query('DELETE FROM theloai WHERE MaTL = ?', [id]);
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại' });
            res.json({ success: true, message: 'Xóa thể loại thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getStores: async (req, res) => {
        try {
            // Trả về danh sách kho (mỗi kho là độc lập, thay thế chi nhánh)
            // Dùng alias MaCH/TenCH để tương thích với frontend cũ
            const [rows] = await pool.query(
                'SELECT MaKho AS MaCH, TenKho AS TenCH, ViTri AS DiaChi, TinhTrang FROM kho_con WHERE TinhTrang = 1 ORDER BY Priority ASC, TenKho'
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default warehouseController;
