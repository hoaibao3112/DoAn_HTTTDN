import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

// ========================= HELPER: Phân bổ vào kho con =========================
/**
 * Phân bổ số lượng sản phẩm vào các kho con theo priority.
 * Mỗi kho con có Capacity giới hạn; ưu tiên kho Priority nhỏ trước.
 * @returns {Array} [{MaKho, TenKho, SoLuong}]
 */
async function allocateToSubWarehouses(conn, MaCH, MaSP, soLuong) {
    const [warehouses] = await conn.query(`
        SELECT kc.MaKho, kc.TenKho, kc.Capacity,
               COALESCE(tkct.SoLuongTon, 0) AS TonHienTai
        FROM kho_con kc
        LEFT JOIN ton_kho_chi_tiet tkct ON tkct.MaKho = kc.MaKho AND tkct.MaSP = ?
        WHERE kc.MaCH = ? AND kc.TinhTrang = 1
        ORDER BY kc.Priority ASC
        FOR UPDATE
    `, [MaSP, MaCH]);

    if (warehouses.length === 0) return []; // Không có kho con → bỏ qua phân bổ chi tiết

    let remaining = soLuong;
    const result = [];

    for (const wh of warehouses) {
        if (remaining <= 0) break;
        const space = wh.Capacity - wh.TonHienTai;
        if (space <= 0) continue;
        const qty = Math.min(remaining, space);

        await conn.query(`
            INSERT INTO ton_kho_chi_tiet (MaKho, MaSP, SoLuongTon)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE SoLuongTon = SoLuongTon + ?
        `, [wh.MaKho, MaSP, qty, qty]);

        result.push({ MaKho: wh.MaKho, TenKho: wh.TenKho, SoLuong: qty });
        remaining -= qty;
    }

    if (remaining > 0) {
        throw Object.assign(
            new Error(`Tất cả kho đều đầy. Còn ${remaining}/${soLuong} chưa phân bổ được.`),
            { code: 'WAREHOUSE_FULL', unallocated: remaining }
        );
    }

    return result;
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
                SELECT tk.MaCH, tk.SoLuongTon, tk.SoLuongToiThieu, tk.ViTri, ch.TenCH
                FROM ton_kho tk
                JOIN cua_hang ch ON tk.MaCH = ch.MaCH
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
                       ch.MaCH, ch.TenCH,
                       tk.TenTK AS NguoiLap
                FROM phieunhap pn
                JOIN nhacungcap ncc ON pn.MaNCC = ncc.MaNCC
                JOIN cua_hang ch ON pn.MaCH = ch.MaCH
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
                       ch.TenCH, ch.DiaChi AS DiaChiCH,
                       tk.TenTK AS NguoiLap
                FROM phieunhap pn
                JOIN nhacungcap ncc ON pn.MaNCC = ncc.MaNCC
                JOIN cua_hang ch ON pn.MaCH = ch.MaCH
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

            const [ch] = await conn.query('SELECT MaCH FROM cua_hang WHERE MaCH = ?', [MaCH]);
            if (!ch.length) throw new Error('Cửa hàng không tồn tại');

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
                    const allocation = await allocateToSubWarehouses(conn, MaCH, maSP, qty);
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
                       ch.TenCH,
                       (tk.SoLuongTon * sp.DonGia) AS GiaTriTonKho,
                       CASE
                           WHEN tk.SoLuongTon = 0             THEN 'Het_hang'
                           WHEN tk.SoLuongTon <= tk.SoLuongToiThieu THEN 'Can_nhap_them'
                           ELSE 'Binh_thuong'
                       END AS TrangThaiTon
                FROM ton_kho tk
                JOIN sanpham sp ON tk.MaSP = sp.MaSP
                JOIN cua_hang ch ON tk.MaCH = ch.MaCH
                ${where}
                ORDER BY ch.TenCH, sp.TenSP
                LIMIT ? OFFSET ?
            `, [...params, parseInt(pageSize), offset]);

            const [[{ total }]] = await pool.query(
                `SELECT COUNT(*) AS total
                 FROM ton_kho tk
                 JOIN sanpham sp ON tk.MaSP = sp.MaSP
                 JOIN cua_hang ch ON tk.MaCH = ch.MaCH
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
                       ch.TenCH
                FROM ton_kho tk
                JOIN sanpham sp ON tk.MaSP = sp.MaSP
                JOIN cua_hang ch ON tk.MaCH = ch.MaCH
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
                       ch.TenCH,
                       COALESCE((SELECT SUM(SoLuongTon) FROM ton_kho_chi_tiet WHERE MaKho = kc.MaKho), 0) AS SoLuongHienTai,
                       ROUND(
                           COALESCE((SELECT SUM(SoLuongTon) FROM ton_kho_chi_tiet WHERE MaKho = kc.MaKho), 0)
                           * 100.0 / NULLIF(kc.Capacity, 0), 1
                       ) AS PhanTramLapDay
                FROM kho_con kc
                JOIN cua_hang ch ON kc.MaCH = ch.MaCH
                ${where}
                ORDER BY kc.MaCH, kc.Priority ASC
            `, params);

            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createSubWarehouse: async (req, res) => {
        const { MaCH, TenKho, Capacity, Priority, ViTri, GhiChu } = req.body;
        if (!MaCH || !TenKho || !Capacity || !Priority) {
            return res.status(400).json({ success: false, message: 'Thiếu: MaCH, TenKho, Capacity, Priority' });
        }
        try {
            const [dup] = await pool.query(
                'SELECT MaKho FROM kho_con WHERE MaCH = ? AND Priority = ? AND TinhTrang = 1',
                [MaCH, Priority]
            );
            if (dup.length) return res.status(400).json({ success: false, message: `Priority ${Priority} đã tồn tại trong cửa hàng này` });

            const [result] = await pool.query(
                'INSERT INTO kho_con (MaCH, TenKho, Capacity, Priority, ViTri, GhiChu) VALUES (?, ?, ?, ?, ?, ?)',
                [MaCH, TenKho, Number(Capacity), Number(Priority), ViTri || null, GhiChu || null]
            );

            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Them',
                BangDuLieu: 'kho_con', MaBanGhi: result.insertId,
                DuLieuMoi: JSON.stringify({ MaCH, TenKho, Capacity, Priority }),
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

            if (Priority && Number(Priority) !== existing[0].Priority) {
                const [dup] = await pool.query(
                    'SELECT MaKho FROM kho_con WHERE MaCH = ? AND Priority = ? AND MaKho != ? AND TinhTrang = 1',
                    [existing[0].MaCH, Priority, id]
                );
                if (dup.length) return res.status(400).json({ success: false, message: `Priority ${Priority} đã tồn tại` });
            }

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
            if (MaCH)   { where += ' AND kc.MaCH = ?';    params.push(MaCH); }
            if (MaKho)  { where += ' AND tkct.MaKho = ?'; params.push(MaKho); }
            if (search) { where += ' AND sp.TenSP LIKE ?'; params.push(`%${search}%`); }

            const [rows] = await pool.query(`
                SELECT tkct.MaKho, tkct.MaSP, tkct.SoLuongTon, tkct.CapNhatLuc,
                       kc.TenKho, kc.Capacity, kc.Priority,
                       sp.TenSP, sp.DonGia, sp.HinhAnh, sp.ISBN,
                       ch.MaCH, ch.TenCH,
                       ROUND(tkct.SoLuongTon * 100.0 / NULLIF(kc.Capacity, 0), 1) AS PhanTramSuDung
                FROM ton_kho_chi_tiet tkct
                JOIN kho_con kc ON tkct.MaKho = kc.MaKho
                JOIN sanpham sp ON tkct.MaSP = sp.MaSP
                JOIN cua_hang ch ON kc.MaCH = ch.MaCH
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
        const { MaCHNguon, MaCHDich, TrangThai, page = 1, pageSize = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        try {
            const params = [];
            let where = 'WHERE 1=1';
            if (MaCHNguon) { where += ' AND ck.MaCHNguon = ?'; params.push(MaCHNguon); }
            if (MaCHDich)  { where += ' AND ck.MaCHDich = ?';  params.push(MaCHDich); }
            if (TrangThai) { where += ' AND ck.TrangThai = ?';  params.push(TrangThai); }

            const [rows] = await pool.query(`
                SELECT ck.*,
                       sp.TenSP, sp.HinhAnh,
                       ch1.TenCH AS TenCHNguon,
                       ch2.TenCH AS TenCHDich,
                       nv1.HoTen AS TenNguoiChuyen,
                       nv2.HoTen AS TenNguoiNhan
                FROM chuyen_kho ck
                JOIN sanpham sp ON ck.MaSP = sp.MaSP
                JOIN cua_hang ch1 ON ck.MaCHNguon = ch1.MaCH
                JOIN cua_hang ch2 ON ck.MaCHDich = ch2.MaCH
                LEFT JOIN nhanvien nv1 ON ck.NguoiChuyen = nv1.MaNV
                LEFT JOIN nhanvien nv2 ON ck.NguoiNhan = nv2.MaNV
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
                       ch1.TenCH AS TenCHNguon,
                       ch2.TenCH AS TenCHDich,
                       nv1.HoTen AS TenNguoiChuyen,
                       nv2.HoTen AS TenNguoiNhan
                FROM chuyen_kho ck
                JOIN sanpham sp ON ck.MaSP = sp.MaSP
                JOIN cua_hang ch1 ON ck.MaCHNguon = ch1.MaCH
                JOIN cua_hang ch2 ON ck.MaCHDich = ch2.MaCH
                LEFT JOIN nhanvien nv1 ON ck.NguoiChuyen = nv1.MaNV
                LEFT JOIN nhanvien nv2 ON ck.NguoiNhan = nv2.MaNV
                WHERE ck.MaCK = ?
            `, [id]);

            if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu chuyển kho' });
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createTransfer: async (req, res) => {
        const { MaCHNguon, MaCHDich, items, GhiChu } = req.body;

        if (MaCHNguon === MaCHDich) {
            return res.status(400).json({ success: false, message: 'Kho nguồn và kho đích không được trùng nhau' });
        }
        if (!Array.isArray(items) || !items.length) {
            return res.status(400).json({ success: false, message: 'Danh sách sản phẩm không hợp lệ' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [emp] = await conn.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            const nguoiChuyen = emp[0]?.MaNV || null;

            const created = [];
            for (const item of items) {
                const { MaSP, SoLuong } = item;
                if (!MaSP || !SoLuong || SoLuong <= 0) throw new Error('Sản phẩm hoặc số lượng không hợp lệ');

                const [stock] = await conn.query(
                    'SELECT SoLuongTon FROM ton_kho WHERE MaSP = ? AND MaCH = ?', [MaSP, MaCHNguon]
                );
                if (!stock.length || stock[0].SoLuongTon < SoLuong) {
                    throw new Error(`Không đủ hàng cho SP ${MaSP}. Tồn: ${stock[0]?.SoLuongTon || 0}, Yêu cầu: ${SoLuong}`);
                }

                const [ck] = await conn.query(`
                    INSERT INTO chuyen_kho (MaCHNguon, MaCHDich, MaSP, SoLuong, NguoiChuyen, TrangThai, GhiChu)
                    VALUES (?, ?, ?, ?, ?, 'Cho_duyet', ?)
                `, [MaCHNguon, MaCHDich, MaSP, SoLuong, nguoiChuyen, GhiChu || null]);

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

            const { MaCHNguon, MaCHDich, MaSP, SoLuong } = rows[0];

            const [stock] = await conn.query(
                'SELECT SoLuongTon FROM ton_kho WHERE MaSP = ? AND MaCH = ? FOR UPDATE', [MaSP, MaCHNguon]
            );
            if (!stock.length || stock[0].SoLuongTon < SoLuong) {
                throw new Error(`Không đủ hàng. Tồn kho nguồn: ${stock[0]?.SoLuongTon || 0}`);
            }

            const [emp] = await conn.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            const nguoiNhan = emp[0]?.MaNV || null;

            await conn.query(
                'UPDATE ton_kho SET SoLuongTon = SoLuongTon - ? WHERE MaSP = ? AND MaCH = ?',
                [SoLuong, MaSP, MaCHNguon]
            );

            await conn.query(`
                INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE SoLuongTon = SoLuongTon + ?
            `, [MaSP, MaCHDich, SoLuong, SoLuong]);

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
                       ch.TenCH,
                       nv.HoTen AS TenNguoiKiemKe,
                       (SELECT COUNT(*) FROM chi_tiet_kiem_ke ctk WHERE ctk.MaKiemKe = kk.MaKiemKe) AS SoSanPham,
                       (SELECT COUNT(*) FROM chi_tiet_kiem_ke ctk WHERE ctk.MaKiemKe = kk.MaKiemKe AND ctk.ChenhLech != 0) AS SoChenhLech
                FROM kiem_ke_kho kk
                JOIN cua_hang ch ON kk.MaCH = ch.MaCH
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
                SELECT kk.*, ch.TenCH, nv.HoTen AS TenNguoiKiemKe
                FROM kiem_ke_kho kk
                JOIN cua_hang ch ON kk.MaCH = ch.MaCH
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
                for (const item of items) {
                    await conn.query(`
                        INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon)
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE SoLuongTon = ?
                    `, [item.MaSP, kk[0].MaCH, item.SoLuongThucTe, item.SoLuongThucTe]);
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
                'SELECT MaTL, TenTL, MoTa FROM theloai WHERE TinhTrang = 1 ORDER BY TenTL'
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getStores: async (req, res) => {
        try {
            const [rows] = await pool.query(
                'SELECT MaCH, TenCH, DiaChi, SDT, Email, TrangThai FROM cua_hang ORDER BY TenCH'
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default warehouseController;
