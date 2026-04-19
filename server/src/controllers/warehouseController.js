import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

// ========================= HELPER 1: Nhập thẳng vào kho (mỗi kho độc lập) =========================
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

// ========================= HELPER 2: Bán hàng thông minh (tự động lấy từ các kho theo Priority) =========================
/**
 * TỰ ĐỘNG chia hàng từ nhiều kho theo Priority (ưu tiên quầy trước, kho phụ sau).
 * Nếu quầy (Priority=1) không đủ → tự động lấy từ Priority=2, 3...
 * @param {Connection} conn - Database connection
 * @param {number} MaSP - Product ID
 * @param {number} MaCH - Store ID
 * @param {number} soLuong - Quantity to sell
 * @returns {object} { total: n, allocations: [{MaKho, TenKho, SoLuong}, ...] }
 * @throws Error nếu tổng cửa hàng không đủ hàng
 */
async function smartAllocateFromWarehouses(conn, MaSP, MaCH, soLuong) {
    // Lấy tất cả kho của cửa hàng này, sắp xếp theo Priority
    const [warehouses] = await conn.query(`
        SELECT kc.MaKho, kc.TenKho, kc.Priority,
               COALESCE(tkct.SoLuongTon, 0) AS TonHienTai
        FROM kho_con kc
        LEFT JOIN ton_kho_chi_tiet tkct ON tkct.MaKho = kc.MaKho AND tkct.MaSP = ?
        WHERE kc.MaCH = ? AND kc.TinhTrang = 1
        ORDER BY kc.Priority ASC
        FOR UPDATE
    `, [MaSP, MaCH]);

    if (warehouses.length === 0) {
        throw new Error(`Không tìm thấy kho hoạt động nào trong cửa hàng này.`);
    }

    // Tính tổng tồn kho toàn cửa hàng
    const totalAvailable = warehouses.reduce((sum, wh) => sum + wh.TonHienTai, 0);
    if (totalAvailable < soLuong) {
        throw new Error(`Sản phẩm MaSP=${MaSP} không đủ. Tồn: ${totalAvailable}, yêu cầu: ${soLuong}.`);
    }

    // Phân bổ từ các kho theo Priority (nhỏ → lớn, nghĩa là quầy trước)
    const allocations = [];
    let remaining = soLuong;

    for (const wh of warehouses) {
        if (remaining <= 0) break;

        const toTake = Math.min(remaining, wh.TonHienTai);
        if (toTake > 0) {
            // Trừ từ kho này
            await conn.query(
                'UPDATE ton_kho_chi_tiet SET SoLuongTon = SoLuongTon - ? WHERE MaKho = ? AND MaSP = ?',
                [toTake, wh.MaKho, MaSP]
            );

            allocations.push({
                MaKho: wh.MaKho,
                TenKho: wh.TenKho,
                Priority: wh.Priority,
                SoLuong: toTake
            });

            remaining -= toTake;
        }
    }

    return {
        total: soLuong,
        allocations
    };
}

const warehouseController = {
    // =======================Chức năng quản lý kho======================
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
            if (category) { where += ' AND sp.MaTL = ?'; params.push(category); }
            if (author) { where += ' AND sp.MaTG = ?'; params.push(author); }
            if (publisher) { where += ' AND sp.MaNXB = ?'; params.push(publisher); }
            if (minPrice) { where += ' AND sp.DonGia >= ?'; params.push(minPrice); }
            if (maxPrice) { where += ' AND sp.DonGia <= ?'; params.push(maxPrice); }

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
                     NamXB, SoTrang, TrongLuong, KichThuoc, ISBN, HinhThuc, TinhTrang, MinSoLuong)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
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
                data.HinhThuc || null,
                parseInt(data.MinSoLuong) || 0
            ]);

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'sanpham',
                MaBanGhi: result.insertId,
                DuLieuMoi: { 
                    TenSP: data.TenSP, 
                    DonGia: parseFloat(data.DonGia) || 0,
                    MaTL: data.MaTL,
                    MaTG: data.MaTG
                },
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

            let hinhAnh = existing[0].HinhAnh;
            if (files?.HinhAnh?.[0]?.filename) {
                hinhAnh = `/uploads/images/${files.HinhAnh[0].filename}`;
            } else if (data.HinhAnh) {
                hinhAnh = data.HinhAnh;
            }

            const fields = [];
            const values = [];

            const setField = (col, val) => { 
                if (val !== undefined) { 
                    // Sanitize: convert string "null" or "undefined" back to null
                    const sanitized = (val === 'null' || val === 'undefined') ? null : val;
                    fields.push(`${col} = ?`); 
                    values.push(sanitized); 
                } 
            };

            setField('TenSP', data.TenSP);
            setField('MoTa', data.MoTa ?? undefined); // Chỉ update nếu có giá trị (không tự động gán null nếu undefined)
            if (data.DonGia !== undefined) setField('DonGia', parseFloat(data.DonGia) || 0);
            if (data.GiaNhap !== undefined) setField('GiaNhap', parseFloat(data.GiaNhap) || 0);
            setField('HinhAnh', hinhAnh);
            setField('MaTL', data.MaTL || undefined);
            setField('MaTG', data.MaTG || undefined);
            setField('MaNXB', data.MaNXB || undefined);
            setField('NamXB', data.NamXB || undefined);
            setField('SoTrang', data.SoTrang || undefined);
            setField('TrongLuong', data.TrongLuong || undefined);
            setField('KichThuoc', data.KichThuoc || undefined);
            setField('ISBN', data.ISBN || undefined);
            setField('HinhThuc', data.HinhThuc || undefined);
            if (data.MinSoLuong !== undefined) setField('MinSoLuong', parseInt(data.MinSoLuong) || 0);
            if (data.TinhTrang !== undefined) setField('TinhTrang', data.TinhTrang);

            if (!fields.length) return res.status(400).json({ success: false, message: 'Không có dữ liệu cần cập nhật' });

            values.push(id);
            await pool.query(`UPDATE sanpham SET ${fields.join(', ')} WHERE MaSP = ?`, values);

            // Thu thập dữ liệu mới để ghi log
            const changes = {};
            fields.forEach((f, index) => {
                const col = f.split(' =')[0];
                changes[col] = values[index];
            });

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'sanpham',
                MaBanGhi: id,
                DuLieuCu: existing[0],
                DuLieuMoi: changes,
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
            // ✅ LẤY THÔNG TIN SẢN PHẨM
            const [product] = await pool.query(
                'SELECT TenSP FROM sanpham WHERE MaSP = ?',
                [id]
            );

            if (!product.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            const tenSP = product[0].TenSP;

            // ✅ KIỂM TRA TỒN KHO TRƯỚC KHI XÓA
            const [stock] = await pool.query(
                'SELECT COALESCE(SUM(SoLuongTon), 0) AS total FROM ton_kho WHERE MaSP = ?',
                [id]
            );

            if (stock[0].total > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${tenSP}" còn ${stock[0].total} cuốn trong kho — không thể xóa. Vui lòng xuất hết hàng trước khi xóa.`
                });
            }

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
            const [oldData] = await pool.query('SELECT MinSoLuong, TenSP FROM sanpham WHERE MaSP = ?', [id]);
            await pool.query('UPDATE sanpham SET MinSoLuong = ? WHERE MaSP = ?', [parseInt(MinSoLuong) || 0, id]);

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'sanpham',
                MaBanGhi: id,
                DuLieuCu: { MinSoLuong: oldData[0]?.MinSoLuong },
                DuLieuMoi: { MinSoLuong: parseInt(MinSoLuong) },
                DiaChi_IP: req.ip,
                GhiChu: `Cập nhật ngưỡng tồn tối thiểu cho: ${oldData[0]?.TenSP}`
            });

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
            if (MaNCC) { where += ' AND pn.MaNCC = ?'; params.push(MaNCC); }
            if (MaCH) { where += ' AND pn.MaCH = ?'; params.push(MaCH); }
            if (TrangThai) { where += ' AND pn.TrangThai = ?'; params.push(TrangThai); }
            if (startDate) { where += ' AND DATE(pn.NgayNhap) >= ?'; params.push(startDate); }
            if (endDate) { where += ' AND DATE(pn.NgayNhap) <= ?'; params.push(endDate); }

            const [rows] = await pool.query(`
                SELECT pn.MaPN, pn.NgayNhap, pn.TongTien, pn.DaThanhToan, pn.ConNo,
                       pn.TrangThai, pn.GhiChu,
                       ncc.MaNCC, ncc.TenNCC,
                       pn.MaCH, 
                       COALESCE(kc.TenKho, 'N/A') AS TenCH,
                       COALESCE(tk.TenTK, 'Unknown') AS NguoiLap
                FROM phieunhap pn
                JOIN nhacungcap ncc ON pn.MaNCC = ncc.MaNCC
                LEFT JOIN kho_con kc ON pn.MaCH = kc.MaKho
                LEFT JOIN taikhoan tk ON pn.MaTK = tk.MaTK
                ${where}
                ORDER BY pn.NgayNhap DESC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(pageSize), offset]);

            // Get total count
            const countResults = await pool.query(
                `SELECT COUNT(*) AS total FROM phieunhap pn ${where}`, params
            );
            const total = countResults[0][0]?.total || 0;

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
            console.error('Error in getAllPurchaseOrders:', error);
            res.status(500).json({
                success: false,
                message: error.message,
                details: error.stack
            });
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
        // MaCH có thể là: 
        // - Store ID (cửa hàng) nếu autoDistribute=true → chia hàng đến tất cả kho của cửa hàng
        // - Warehouse ID (kho cụ thể) nếu autoDistribute=false → nhập vào kho cụ thể
        const { MaNCC, MaCH, ChiTiet, DaThanhToan = 0, GhiChu, TyLeLoi, autoDistribute = true } = req.body;

        if (!MaNCC || !MaCH || !Array.isArray(ChiTiet) || !ChiTiet.length) {
            return res.status(400).json({ success: false, message: 'Thiếu MaNCC, MaCH hoặc danh sách sản phẩm' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [ncc] = await conn.query('SELECT MaNCC FROM nhacungcap WHERE MaNCC = ? AND TinhTrang = 1', [MaNCC]);
            if (!ncc.length) throw new Error('Nhà cung cấp không tồn tại hoặc đã ngưng hoạt động');

            // ✅ BUG FIX 6: Validate tất cả sản phẩm tồn tại
            const productIds = ChiTiet.map(item => item.MaSP);
            const [products] = await conn.query(
                'SELECT MaSP FROM sanpham WHERE MaSP IN (?) AND TinhTrang = 1',
                [productIds]
            );
            const validProductIds = products.map(p => p.MaSP);
            for (const id of productIds) {
                if (!validProductIds.includes(id)) {
                    throw new Error(`Sản phẩm MaSP=${id} không tồn tại hoặc đã bị vô hiệu hóa`);
                }
            }

            // Kiểm tra dữ liệu cửa hàng/kho
            let MaCHStore = MaCH; // Store ID
            if (!autoDistribute) {
                // Nếu không auto-distribute, MaCH là warehouse ID → lấy store ID từ kho
                const [whData] = await conn.query('SELECT MaKho, MaCH FROM kho_con WHERE MaKho = ? AND TinhTrang = 1', [MaCH]);
                if (!whData.length) throw new Error('Kho không tồn tại hoặc đã ngưng hoạt động');
                MaCHStore = whData[0].MaCH; // Store ID
            } else {
                // Nếu auto-distribute, MaCH là store ID → kiểm tra store tồn tại
                const [storeData] = await conn.query('SELECT MaCH FROM cua_hang WHERE MaCH = ? AND TrangThai = 1', [MaCH]);
                if (!storeData.length) throw new Error('Cửa hàng không tồn tại');
            }

            const tongTien = ChiTiet.reduce((sum, item) => sum + Number(item.SoLuong) * Number(item.DonGiaNhap), 0);
            const conNo = Math.max(0, tongTien - Number(DaThanhToan));

            // 1. Tạo phiếu nhập (lưu store ID, không warehouse ID)
            const [pnResult] = await conn.query(`
                INSERT INTO phieunhap (MaNCC, MaCH, MaTK, TongTien, DaThanhToan, ConNo, TrangThai, GhiChu)
                VALUES (?, ?, ?, ?, ?, ?, 'Cho_thanh_toan', ?)
            `, [MaNCC, MaCHStore, req.user.MaTK, tongTien, Number(DaThanhToan), conNo, GhiChu || null]);

            const MaPN = pnResult.insertId;

            // 2. Chi tiết phiếu nhập (batch)
            const detailValues = ChiTiet.map(item => [MaPN, item.MaSP, Number(item.DonGiaNhap), Number(item.SoLuong)]);
            await conn.query('INSERT INTO chitietphieunhap (MaPN, MaSP, DonGiaNhap, SoLuong) VALUES ?', [detailValues]);

            // 3. Cập nhật giá sản phẩm - ✅ FIX N+1: Batch update thay vì loop
            if (ChiTiet.length > 0) {
                const priceUpdates = ChiTiet.map(item => ({
                    MaSP: item.MaSP,
                    GiaNhap: Number(item.DonGiaNhap),
                    DonGia: TyLeLoi && Number(TyLeLoi) > 0
                        ? Math.round(Number(item.DonGiaNhap) * (1 + Number(TyLeLoi) / 100))
                        : Number(item.DonGiaNhap)
                }));

                // Build CASE statements
                let caseGiaNhap = 'CASE';
                let caseDonGia = 'CASE';
                for (const update of priceUpdates) {
                    caseGiaNhap += ` WHEN MaSP = ${conn.escape(update.MaSP)} THEN ${conn.escape(update.GiaNhap)}`;
                    caseDonGia += ` WHEN MaSP = ${conn.escape(update.MaSP)} THEN ${conn.escape(update.DonGia)}`;
                }
                caseGiaNhap += ' ELSE GiaNhap END';
                caseDonGia += ' ELSE DonGia END';

                await conn.query(`
                    UPDATE sanpham 
                    SET GiaNhap = ${caseGiaNhap}, 
                        DonGia = ${caseDonGia}, 
                        TinhTrang = 1 
                    WHERE MaSP IN (?)
                `, [productIds]);
            }

            // 4. Công nợ NCC
            if (conNo > 0) {
                await conn.query(
                    'INSERT INTO cong_no_ncc (MaNCC, MaPN, SoTienNo, TrangThai) VALUES (?, ?, ?, ?)',
                    [MaNCC, MaPN, conNo, 'Chua_thanh_toan']
                );
            }

            await logActivity({
                MaTK: req.user.MaTK, HanhDong: 'Them',
                BangDuLieu: 'phieunhap', MaBanGhi: MaPN,
                DuLieuMoi: JSON.stringify({ MaNCC, MaCH: MaCHStore, TongTien: tongTien, ConNo: conNo, autoDistribute }),
                DiaChi_IP: req.ip
            });

            await conn.commit();

            res.status(201).json({
                success: true,
                message: 'Đã lập phiếu nhập (Chờ thanh toán). Hàng sẽ được cộng vào kho sau khi thanh toán đủ 100% công nợ.',
                MaPN, TongTien: tongTien, ConNo: conNo
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
            if (MaCH) { where += ' AND tk.MaCH = ?'; params.push(MaCH); }
            if (MaSP) { where += ' AND tk.MaSP = ?'; params.push(MaSP); }
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
                LEFT JOIN kho_con kc ON tk.MaCH = kc.MaCH
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
            // Logic kiểm tra sức chứa (Capacity) khi cập nhật
            if (Capacity) {
                const [[{ currentTotal }]] = await pool.query(
                    'SELECT COALESCE(SUM(SoLuongTon), 0) AS currentTotal FROM ton_kho_chi_tiet WHERE MaKho = ?',
                    [id]
                );
                if (Number(Capacity) < currentTotal) {
                    return res.status(400).json({
                        success: false,
                        message: `Sức chứa mới (${Capacity}) không thể nhỏ hơn lượng tồn hiện tại (${currentTotal}).`
                    });
                }
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
            if (MaCH) { where += ' AND tkct.MaKho = ?'; params.push(MaCH); } // MaCH now treated as MaKho
            if (MaKho) { where += ' AND tkct.MaKho = ?'; params.push(MaKho); }
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
            if (MaKhoDich) { where += ' AND ck.MaKhoDich = ?'; params.push(MaKhoDich); }
            if (TrangThai) { where += ' AND ck.TrangThai = ?'; params.push(TrangThai); }

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
            const [[khoDich]] = await conn.query('SELECT MaKho, TenKho FROM kho_con WHERE MaKho = ? AND TinhTrang = 1', [MaKhoDich]);
            if (!khoNguon) throw new Error('Kho nguồn không tồn tại hoặc đã ngưng hoạt động');
            if (!khoDich) throw new Error('Kho đích không tồn tại hoặc đã ngưng hoạt động');

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

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'chuyen_kho',
                MaBanGhi: created[0], // Log first ID as reference
                DuLieuMoi: { MaKhoNguon, MaKhoDich, count: created.length, items },
                DiaChi_IP: req.ip,
                GhiChu: `Tạo ${created.length} yêu cầu chuyển kho`
            });

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
            const [[khoDich]] = await conn.query('SELECT MaCH FROM kho_con WHERE MaKho = ?', [MaKhoDich]);

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

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'chuyen_kho',
                MaBanGhi: id,
                DuLieuMoi: { TrangThai: 'Da_nhan', NguoiNhan: nguoiNhan },
                DiaChi_IP: req.ip,
                GhiChu: `Duyệt hoàn tất chuyển kho ID=${id}`
            });

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

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'chuyen_kho',
                MaBanGhi: id,
                DuLieuMoi: { TrangThai: 'Huy', LyDo },
                DiaChi_IP: req.ip,
                GhiChu: `Hủy yêu cầu chuyển kho ID=${id}`
            });

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
            if (MaCH) { where += ' AND kk.MaCH = ?'; params.push(MaCH); }
            if (TrangThai) { where += ' AND kk.TrangThai = ?'; params.push(TrangThai); }

            const [rows] = await pool.query(`
                SELECT kk.*,
                       kc.TenKho AS TenCH,
                       nv.HoTen AS TenNguoiKiemKe,
                       (SELECT COUNT(*) FROM chi_tiet_kiem_ke ctk WHERE ctk.MaKiemKe = kk.MaKiemKe) AS SoSanPham,
                       (SELECT COUNT(*) FROM chi_tiet_kiem_ke ctk WHERE ctk.MaKiemKe = kk.MaKiemKe AND ctk.ChenhLech != 0) AS SoChenhLech
                FROM kiem_ke_kho kk
                LEFT JOIN kho_con kc ON kk.MaCH = kc.MaKho
                LEFT JOIN nhanvien nv ON kk.NguoiKiemKe = nv.MaNV
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
                LEFT JOIN nhanvien nv ON kk.NguoiKiemKe = nv.MaNV
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

                // Delete existing record if any, then insert new one
                await conn.query(
                    'DELETE FROM chi_tiet_kiem_ke WHERE MaKiemKe = ? AND MaSP = ?',
                    [MaKiemKe, item.MaSP]
                );

                await conn.query(
                    'INSERT INTO chi_tiet_kiem_ke (MaKiemKe, MaSP, SoLuongHeThong, SoLuongThucTe, LyDo) VALUES (?, ?, ?, ?, ?)',
                    [MaKiemKe, item.MaSP, soLuongHeThong, Number(item.SoLuongThucTe), item.LyDo || null]
                );
            }

            await conn.commit();

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'kiem_ke_kho',
                MaBanGhi: MaKiemKe,
                DuLieuMoi: { MaCH, NgayKiemKe: ngay, count: items.length },
                DiaChi_IP: req.ip,
                GhiChu: `Tạo phiếu kiểm kê kho tại MaCH=${MaCH}`
            });

            res.status(201).json({ success: true, message: 'Tạo phiếu kiểm kê thành công', MaKiemKe });
        } catch (error) {
            await conn.rollback();
            console.error('createInventoryCheck:', error);
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    updateInventoryCheck: async (req, res) => {
        const { id } = req.params;
        const { items, GhiChu } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Danh sách sản phẩm không hợp lệ' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [kk] = await conn.query('SELECT TrangThai FROM kiem_ke_kho WHERE MaKiemKe = ?', [id]);
            if (!kk.length) throw new Error('Phiếu kiểm kê không tồn tại');
            if (kk[0].TrangThai !== 'Dang_kiem') throw new Error('Chỉ có thể cập nhật phiếu đang trong trạng thái kiểm kê');

            for (const item of items) {
                // Cập nhật số lượng thực tế và lý do cho từng sản phẩm
                await conn.query(`
                    UPDATE chi_tiet_kiem_ke 
                    SET SoLuongThucTe = ?, LyDo = ?
                    WHERE MaKiemKe = ? AND MaSP = ?
                `, [Number(item.SoLuongThucTe), item.LyDo || null, id, item.MaSP]);
            }

            if (GhiChu !== undefined) {
                await conn.query('UPDATE kiem_ke_kho SET GhiChu = ? WHERE MaKiemKe = ?', [GhiChu, id]);
            }

            await conn.commit();
            res.json({ success: true, message: 'Đã lưu tạm tiến độ kiểm kê' });
        } catch (error) {
            await conn.rollback();
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
                const targetMaKho = kk[0].MaCH; // Trong DB, cột MaCH của kiem_ke_kho thực chất chứa MaKho
                
                // Lấy MaCH (Store ID) thực sự của kho con này
                const [[khoInfo]] = await conn.query('SELECT MaCH FROM kho_con WHERE MaKho = ?', [targetMaKho]);
                const realMaCH = khoInfo?.MaCH;

                for (const item of items) {
                    // 1. Cập nhật tồn kho chi tiết (đúng kho đang kiểm kê)
                    await conn.query(`
                        INSERT INTO ton_kho_chi_tiet (MaKho, MaSP, SoLuongTon)
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE SoLuongTon = ?
                    `, [targetMaKho, item.MaSP, item.SoLuongThucTe, item.SoLuongThucTe]);

                    // 2. Đồng bộ lại tổng tồn kho (ton_kho) của cửa hàng
                    if (realMaCH) {
                        const [[newTotalRow]] = await conn.query(`
                            SELECT SUM(SoLuongTon) AS total 
                            FROM ton_kho_chi_tiet tkct
                            JOIN kho_con kc ON tkct.MaKho = kc.MaKho
                            WHERE tkct.MaSP = ? AND kc.MaCH = ?
                        `, [item.MaSP, realMaCH]);
                        
                        const newTotal = newTotalRow?.total || 0;

                        await conn.query(`
                            INSERT INTO ton_kho (MaSP, MaCH, SoLuongTon)
                            VALUES (?, ?, ?)
                            ON DUPLICATE KEY UPDATE SoLuongTon = ?
                        `, [item.MaSP, realMaCH, newTotal, newTotal]);
                    }
                }

                await logActivity({
                    MaTK: req.user.MaTK,
                    HanhDong: 'KiemKe',
                    BangDuLieu: 'ton_kho',
                    MaBanGhi: id,
                    DuLieuMoi: { MaKho: targetMaKho, soSanPham: items.length },
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
        // Frontend gửi: TenTG, NgaySinh, QuocTich, TieuSu (=MoTa), AnhTG (file qua multer)
        const { TenTG, NgaySinh, QuocTich, TieuSu, MoTa, HinhAnh } = req.body;
        const moTa = TieuSu || MoTa || null;
        const hinhAnh = req.file
            ? `/uploads/tacgia/${req.file.filename}`
            : (HinhAnh || null);

        if (!TenTG) return res.status(400).json({ success: false, message: 'TenTG là bắt buộc' });
        try {
            const [result] = await pool.query(
                'INSERT INTO tacgia (TenTG, NgaySinh, QuocTich, MoTa, HinhAnh) VALUES (?, ?, ?, ?, ?)',
                [TenTG, NgaySinh || null, QuocTich || null, moTa, hinhAnh]
            );
            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'tacgia',
                MaBanGhi: result.insertId,
                DuLieuMoi: { TenTG, QuocTich },
                DiaChi_IP: req.ip
            });
            res.status(201).json({ success: true, message: 'Thêm tác giả thành công', MaTG: result.insertId });
        } catch (error) {
            console.error('addAuthor:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateAuthor: async (req, res) => {
        const { id } = req.params;
        // Frontend gửi: TenTG, NgaySinh, QuocTich, TieuSu (=MoTa), AnhTG (file qua multer hoặc đường dẫn cũ)
        const { TenTG, NgaySinh, QuocTich, TieuSu, MoTa, HinhAnh, AnhTG } = req.body;
        const moTa = TieuSu || MoTa || null;
        try {
            const [oldTG] = await pool.query('SELECT * FROM tacgia WHERE MaTG = ?', [id]);
            if (oldTG.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy tác giả' });

            // Xử lý ảnh: ưu tiên file upload mới, rồi đến đường dẫn cũ từ body, cuối cùng giữ ảnh cũ trong DB
            let hinhAnh = oldTG[0].HinhAnh;
            if (req.file) {
                hinhAnh = `/uploads/tacgia/${req.file.filename}`;
            } else if (HinhAnh || AnhTG) {
                const rawPath = HinhAnh || AnhTG;
                // Strip base URL nếu frontend gửi full URL
                hinhAnh = rawPath.replace(/^https?:\/\/[^/]+/, '');
            }

            if (!TenTG?.trim()) return res.status(400).json({ success: false, message: 'Tên tác giả là bắt buộc' });

            await pool.query(
                'UPDATE tacgia SET TenTG = ?, NgaySinh = ?, QuocTich = ?, MoTa = ?, HinhAnh = ? WHERE MaTG = ?',
                [TenTG.trim(), NgaySinh || null, QuocTich || null, moTa, hinhAnh, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'tacgia',
                MaBanGhi: id,
                DuLieuCu: oldTG[0],
                DuLieuMoi: { TenTG, QuocTich, MoTa: moTa },
                DiaChi_IP: req.ip
            });
            res.json({ success: true, message: 'Cập nhật tác giả thành công' });
        } catch (error) {
            console.error('updateAuthor:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteAuthor: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('UPDATE tacgia SET TinhTrang = 0 WHERE MaTG = ?', [id]);
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy tác giả' });
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
        const trimmedTen = (TenTL || '').trim();
        const trimmedMoTa = (MoTa || '').trim();

        // Validation
        if (!trimmedTen) {
            return res.status(400).json({ success: false, message: 'Tên thể loại không được để trống' });
        }
        if (trimmedTen.length < 2 || trimmedTen.length > 50) {
            return res.status(400).json({ success: false, message: 'Tên thể loại phải từ 2 đến 50 ký tự' });
        }
        // Chỉ cho phép chữ cái, số, khoảng trắng và một số ký tự cơ bản
        if (!/^[\p{L}\d\s&.'-]+$/u.test(trimmedTen)) {
            return res.status(400).json({ success: false, message: 'Tên thể loại chứa ký tự không hợp lệ' });
        }
        if (trimmedMoTa.length > 500) {
            return res.status(400).json({ success: false, message: 'Mô tả không được vượt quá 500 ký tự' });
        }

        try {
            const [dup] = await pool.query('SELECT MaTL FROM theloai WHERE TenTL = ?', [trimmedTen]);
            if (dup.length > 0) return res.status(400).json({ success: false, message: 'Thể loại này đã tồn tại' });
            
            const [result] = await pool.query(
                'INSERT INTO theloai (TenTL, MoTa, TinhTrang) VALUES (?, ?, 1)',
                [trimmedTen, trimmedMoTa || null]
            );
            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'theloai',
                MaBanGhi: result.insertId,
                DuLieuMoi: { TenTL, MoTa },
                DiaChi_IP: req.ip
            });

            res.status(201).json({ success: true, message: 'Thêm thể loại thành công', MaTL: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateCategory: async (req, res) => {
        const { id } = req.params;
        const { TenTL, MoTa, TinhTrang } = req.body;
        const trimmedTen = (TenTL || '').trim();
        const trimmedMoTa = (MoTa || '').trim();

        // Validation
        if (!trimmedTen) {
            return res.status(400).json({ success: false, message: 'Tên thể loại không được để trống' });
        }
        if (trimmedTen.length < 2 || trimmedTen.length > 50) {
            return res.status(400).json({ success: false, message: 'Tên thể loại phải từ 2 đến 50 ký tự' });
        }
        if (!/^[\p{L}\d\s&.'-]+$/u.test(trimmedTen)) {
            return res.status(400).json({ success: false, message: 'Tên thể loại chứa ký tự không hợp lệ' });
        }
        if (trimmedMoTa.length > 500) {
            return res.status(400).json({ success: false, message: 'Mô tả không được vượt quá 500 ký tự' });
        }

        try {
            const [dup] = await pool.query('SELECT MaTL FROM theloai WHERE TenTL = ? AND MaTL != ?', [trimmedTen, id]);
            if (dup.length > 0) return res.status(400).json({ success: false, message: 'Tên thể loại đã tồn tại' });
            
            const [oldTL] = await pool.query('SELECT * FROM theloai WHERE MaTL = ?', [id]);
            const [result] = await pool.query(
                'UPDATE theloai SET TenTL = ?, MoTa = ?, TinhTrang = ? WHERE MaTL = ?',
                [trimmedTen, trimmedMoTa || null, TinhTrang ?? 1, id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại' });

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'theloai',
                MaBanGhi: id,
                DuLieuCu: oldTL[0],
                DuLieuMoi: { TenTL, MoTa, TinhTrang },
                DiaChi_IP: req.ip
            });

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

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'theloai',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

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
    },

    // ========================= TỔNG QUAN TỒN KHO (Inventory Summary) =========================
    // Hiển thị: Tổng cộng toàn cửa hàng + Chi tiết từng kho
    getInventorySummary: async (req, res) => {
        try {
            const { MaCH, MaSP, TenSP, pageSize = 20, page = 1 } = req.query;

            let sqlFilter = 'WHERE 1=1';
            const params = [];

            if (MaCH) {
                sqlFilter += ' AND kc.MaCH = ?';
                params.push(MaCH);
            }
            if (MaSP) {
                sqlFilter += ' AND tkct.MaSP = ?';
                params.push(MaSP);
            }
            if (TenSP) {
                sqlFilter += ' AND sp.TenSP LIKE ?';
                params.push(`%${TenSP}%`);
            }

            const offset = (parseInt(page) - 1) * parseInt(pageSize);

            // 1. Tính tổng tồn kho toàn cửa hàng (tổng cộng)
            const [summary] = await pool.query(`
                SELECT 
                    sp.MaSP, sp.TenSP, sp.DonGia, sp.HinhAnh,
                    SUM(tkct.SoLuongTon) AS TongTonKho
                FROM sanpham sp
                LEFT JOIN ton_kho_chi_tiet tkct ON sp.MaSP = tkct.MaSP
                LEFT JOIN kho_con kc ON tkct.MaKho = kc.MaKho
                ${sqlFilter}
                GROUP BY sp.MaSP, sp.TenSP, sp.DonGia, sp.HinhAnh
                ORDER BY sp.TenSP ASC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(pageSize), offset]);

            // 2. Lấy chi tiết từng kho cho mỗi sản phẩm
            const detailedInventory = [];
            for (const product of summary) {
                const [warehouses] = await pool.query(`
                    SELECT 
                        kc.MaKho, kc.TenKho, kc.Priority, kc.Capacity,
                        COALESCE(tkct.SoLuongTon, 0) AS SoLuongTon,
                        ROUND((COALESCE(tkct.SoLuongTon, 0) / kc.Capacity) * 100, 1) AS UsagePercent
                    FROM kho_con kc
                    LEFT JOIN ton_kho_chi_tiet tkct ON kc.MaKho = tkct.MaKho AND tkct.MaSP = ?
                    WHERE kc.Capacity > 0 AND kc.TinhTrang = 1
                    ${MaCH ? 'AND kc.MaCH = ?' : ''}
                    ORDER BY kc.Priority ASC
                `, MaCH ? [product.MaSP, MaCH] : [product.MaSP]);

                detailedInventory.push({
                    ...product,
                    warehouses
                });
            }

            // 3. Thống kê tổng quát cửa hàng (Sửa lỗi: Sử dụng Subquery để tính TongCapacity chính xác)
            const [storeStats] = await pool.query(`
                SELECT 
                    ch.MaCH, ch.TenCH,
                    (SELECT COUNT(*) FROM kho_con WHERE MaCH = ch.MaCH AND TinhTrang = 1) AS SoKho,
                    (SELECT SUM(Capacity) FROM kho_con WHERE MaCH = ch.MaCH AND TinhTrang = 1) AS TongCapacity,
                    (
                        SELECT SUM(tkct.SoLuongTon) 
                        FROM ton_kho_chi_tiet tkct
                        JOIN kho_con kc ON tkct.MaKho = kc.MaKho
                        WHERE kc.MaCH = ch.MaCH AND kc.TinhTrang = 1
                    ) AS TongTonKho,
                    (
                        SELECT COUNT(DISTINCT tkct.MaSP)
                        FROM ton_kho_chi_tiet tkct
                        JOIN kho_con kc ON tkct.MaKho = kc.MaKho
                        WHERE kc.MaCH = ch.MaCH AND kc.TinhTrang = 1
                    ) AS SoSanPham
                FROM cua_hang ch
                ${MaCH ? 'WHERE ch.MaCH = ?' : ''}
                GROUP BY ch.MaCH, ch.TenCH
            `, MaCH ? [MaCH] : []);

            const [[{ total }]] = await pool.query(`
                SELECT COUNT(DISTINCT sp.MaSP) AS total
                FROM sanpham sp
                LEFT JOIN ton_kho_chi_tiet tkct ON sp.MaSP = tkct.MaSP
                LEFT JOIN kho_con kc ON tkct.MaKho = kc.MaKho
                ${sqlFilter}
            `, params);

            res.json({
                success: true,
                data: detailedInventory,
                storeStats: storeStats[0] || null,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total,
                    totalPages: Math.ceil(total / parseInt(pageSize))
                }
            });
        } catch (error) {
            console.error('getInventorySummary:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default warehouseController;
