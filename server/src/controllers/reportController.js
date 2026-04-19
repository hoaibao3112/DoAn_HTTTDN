import pool from '../config/connectDatabase.js';

const reportController = {
    // Lấy doanh thu theo năm
    getRevenueByYear: async (req, res) => {
        try {
            const query = `
                SELECT 
                    YEAR(NgayBan) as Nam,
                    SUM(ThanhToan) as TongDoanhThu,
                    COUNT(*) as SoHoaDon
                FROM hoadon
                WHERE TrangThai = 'Hoan_thanh'
                GROUP BY YEAR(NgayBan)
                ORDER BY Nam DESC
            `;
            const [results] = await pool.query(query);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching revenue by year:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy doanh thu theo tháng trong năm
    getRevenueByMonth: async (req, res) => {
        try {
            const { year } = req.params;
            const query = `
                SELECT 
                    MONTH(NgayBan) as Thang,
                    SUM(ThanhToan) as TongDoanhThu,
                    COUNT(*) as SoHoaDon
                FROM hoadon
                WHERE YEAR(NgayBan) = ? AND TrangThai = 'Hoan_thanh'
                GROUP BY MONTH(NgayBan)
                ORDER BY Thang
            `;
            const [results] = await pool.query(query, [year]);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching revenue by month:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy doanh thu theo ngày trong tháng
    getRevenueByDay: async (req, res) => {
        try {
            const { year, month } = req.params;
            const query = `
                SELECT 
                    DAY(NgayBan) as Ngay,
                    SUM(ThanhToan) as TongDoanhThu,
                    COUNT(*) as SoHoaDon
                FROM hoadon
                WHERE YEAR(NgayBan) = ? AND MONTH(NgayBan) = ? AND TrangThai = 'Hoan_thanh'
                GROUP BY DAY(NgayBan)
                ORDER BY Ngay
            `;
            const [results] = await pool.query(query, [year, month]);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching revenue by day:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy doanh thu theo khoảng thời gian
    getRevenueByDateRange: async (req, res) => {
        try {
            const { tuNgay, denNgay } = req.body;
            const query = `
                SELECT 
                    DATE(NgayBan) as Ngay,
                    SUM(ThanhToan) as TongDoanhThu,
                    COUNT(*) as SoHoaDon
                FROM hoadon
                WHERE DATE(NgayBan) BETWEEN ? AND ? AND TrangThai = 'Hoan_thanh'
                GROUP BY DATE(NgayBan)
                ORDER BY Ngay
            `;
            const [results] = await pool.query(query, [tuNgay, denNgay]);
            res.json({ success: true, data: results });
        } catch (error) {
            console.error('Error fetching revenue by date range:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Helper: build WHERE clause theo timePeriod
    _buildTimeWhere(timePeriod, tuNgay, denNgay, col = 'hd.NgayBan') {
        switch (timePeriod) {
            case 'today':  return `DATE(${col}) = CURDATE()`;
            case 'week':   return `DATE(${col}) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
            case 'month':  return `YEAR(${col}) = YEAR(CURDATE()) AND MONTH(${col}) = MONTH(CURDATE())`;
            case 'year':   return `YEAR(${col}) = YEAR(CURDATE())`;
            case 'custom': return `DATE(${col}) BETWEEN '${tuNgay}' AND '${denNgay}'`;
            default:       return `YEAR(${col}) = YEAR(CURDATE()) AND MONTH(${col}) = MONTH(CURDATE())`;
        }
    },

    // Bán hàng theo sản phẩm
    getSalesByProduct: async (req, res) => {
        try {
            const { timePeriod = 'month', tuNgay, denNgay } = req.body;
            const timeWhere = reportController._buildTimeWhere(timePeriod, tuNgay, denNgay);
            // FIX Bug 8: Calculate revenue by distributing ThanhToan proportionally to each item
            // Revenue = (Item subtotal / Total TongTien) * ThanhToan for each invoice
            const [results] = await pool.query(`
                SELECT 
                    sp.MaSP,
                    sp.TenSP,
                    sp.HinhAnh,
                    SUM(ct.SoLuong) AS SoLuongBan,
                    SUM(
                        (ct.SoLuong * ct.DonGia - IFNULL(ct.GiamGia,0)) * 
                        hd.ThanhToan / NULLIF(hd.TongTien, 1)
                    ) AS DoanhThu,
                    COUNT(DISTINCT hd.MaHD) AS SoHoaDon
                FROM chitiethoadon ct
                JOIN hoadon hd ON ct.MaHD = hd.MaHD
                JOIN sanpham sp ON ct.MaSP = sp.MaSP
                WHERE hd.TrangThai = 'Hoan_thanh' AND ${timeWhere}
                GROUP BY sp.MaSP, sp.TenSP, sp.HinhAnh
                ORDER BY SoLuongBan DESC
                LIMIT 50
            `);
            res.json({ success: true, data: results });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Bán hàng theo thể loại
    getSalesByCategory: async (req, res) => {
        try {
            const { timePeriod = 'month', tuNgay, denNgay } = req.body;
            const timeWhere = reportController._buildTimeWhere(timePeriod, tuNgay, denNgay);
            // FIX Bug 9: Calculate revenue by distributing ThanhToan proportionally to each item
            // Revenue = (Item subtotal / Total TongTien) * ThanhToan for each invoice
            const [results] = await pool.query(`
                SELECT 
                    tl.MaTL,
                    tl.TenTL,
                    SUM(ct.SoLuong) AS SoLuongBan,
                    SUM(
                        (ct.SoLuong * ct.DonGia - IFNULL(ct.GiamGia,0)) * 
                        hd.ThanhToan / NULLIF(hd.TongTien, 1)
                    ) AS DoanhThu,
                    COUNT(DISTINCT sp.MaSP) AS SoSanPham
                FROM chitiethoadon ct
                JOIN hoadon hd ON ct.MaHD = hd.MaHD
                JOIN sanpham sp ON ct.MaSP = sp.MaSP
                JOIN theloai tl ON sp.MaTL = tl.MaTL
                WHERE hd.TrangThai = 'Hoan_thanh' AND ${timeWhere}
                GROUP BY tl.MaTL, tl.TenTL
                ORDER BY SoLuongBan DESC
            `);
            res.json({ success: true, data: results });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Thống kê khách hàng
    getCustomerReport: async (req, res) => {
        try {
            const { timePeriod = 'month', tuNgay, denNgay } = req.body;
            const timeWhere = reportController._buildTimeWhere(timePeriod, tuNgay, denNgay);
            const [results] = await pool.query(`
                SELECT 
                    kh.MaKH,
                    kh.HoTen,
                    kh.SDT,
                    kh.Email,
                    kh.DiemTichLuy,
                    kh.TongChiTieu,
                    COUNT(hd.MaHD) AS SoHoaDon,
                    SUM(hd.ThanhToan) AS TongMua,
                    MAX(hd.NgayBan) AS LanMuaGanNhat
                FROM khachhang kh
                JOIN hoadon hd ON kh.MaKH = hd.MaKH
                WHERE hd.TrangThai = 'Hoan_thanh' AND ${timeWhere}
                GROUP BY kh.MaKH, kh.HoTen, kh.SDT, kh.Email, kh.DiemTichLuy, kh.TongChiTieu
                ORDER BY TongMua DESC
                LIMIT 100
            `);
            res.json({ success: true, data: results });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Lấy nhật ký hoạt động (Audit Logs)
    getAuditLogs: async (req, res) => {
        try {
            const { startDate, endDate, user, action, module, page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Map frontend action (CREATE/UPDATE/DELETE) sang HanhDong trong DB
            const ACTION_MAP = {
                CREATE: ['Them', 'Dang_nhap', 'Dang_nhap_that_bai', 'CheckIn'],
                UPDATE: ['Sua', 'CapNhat', 'VoHieuHoa', 'KichHoat', 'CheckOut', 'Kiem_Ke'],
                DELETE: ['Xoa', 'XoaHD'],
            };

            const conditions = [];
            const params = [];

            // Lọc ngày bắt đầu
            if (startDate) {
                conditions.push('DATE(n.ThoiGian) >= ?');
                params.push(startDate);
            }
            // Lọc ngày kết thúc
            if (endDate) {
                conditions.push('DATE(n.ThoiGian) <= ?');
                params.push(endDate);
            }
            // Lọc người dùng
            if (user && user !== 'all') {
                conditions.push('tk.TenTK LIKE ?');
                params.push(`%${user}%`);
            }
            // Lọc hành động
            if (action && action !== 'all' && ACTION_MAP[action]) {
                const actionList = ACTION_MAP[action];
                const placeholders = actionList.map(() => '?').join(', ');
                conditions.push(`n.HanhDong IN (${placeholders})`);
                params.push(...actionList);
            }
            // Lọc module (bảng dữ liệu)
            if (module && module !== 'all') {
                conditions.push('n.BangDuLieu = ?');
                params.push(module);
            }

            const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

            // Đếm tổng số bản ghi
            const countQuery = `
                SELECT COUNT(*) as total
                FROM nhat_ky_hoat_dong n
                LEFT JOIN taikhoan tk ON n.MaTK = tk.MaTK
                ${whereClause}
            `;
            const [countResult] = await pool.query(countQuery, params);
            const total = countResult[0].total;

            // Lấy dữ liệu phân trang
            const dataQuery = `
                SELECT 
                    n.MaNK,
                    n.ThoiGian,
                    tk.TenTK,
                    n.HanhDong,
                    n.BangDuLieu,
                    n.MaBanGhi,
                    n.DuLieuCu,
                    n.DuLieuMoi,
                    n.DiaChi_IP,
                    n.GhiChu,
                    CASE
                        WHEN n.HanhDong IN ('Them', 'Dang_nhap', 'Dang_nhap_that_bai', 'CheckIn') THEN 'CREATE'
                        WHEN n.HanhDong IN ('Sua', 'CapNhat', 'VoHieuHoa', 'KichHoat', 'CheckOut', 'Kiem_Ke') THEN 'UPDATE'
                        WHEN n.HanhDong IN ('Xoa', 'XoaHD') THEN 'DELETE'
                        ELSE 'CREATE'
                    END AS ActionType
                FROM nhat_ky_hoat_dong n
                LEFT JOIN taikhoan tk ON n.MaTK = tk.MaTK
                ${whereClause}
                ORDER BY n.ThoiGian DESC
                LIMIT ? OFFSET ?
            `;
            const dataParams = [...params, parseInt(limit), offset];
            const [rows] = await pool.query(dataQuery, dataParams);

            // Normalize dữ liệu JSON
            const data = rows.map(row => ({
                ...row,
                HanhDong: row.ActionType,         // Trả về CREATE/UPDATE/DELETE
                HanhDongGoc: row.HanhDong,        // Giữ nguyên tiếng Việt để hiển thị
                DuLieuCu: row.DuLieuCu
                    ? (typeof row.DuLieuCu === 'string' ? JSON.parse(row.DuLieuCu) : row.DuLieuCu)
                    : null,
                DuLieuMoi: row.DuLieuMoi
                    ? (typeof row.DuLieuMoi === 'string' ? JSON.parse(row.DuLieuMoi) : row.DuLieuMoi)
                    : null,
            }));

            res.json({
                success: true,
                data,
                pagination: { total, page: parseInt(page), limit: parseInt(limit) }
            });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // Lấy thông tin metadata cho bộ lọc Audit Logs
    getAuditLogMetadata: async (req, res) => {
        try {
            // Lấy danh sách duy nhất các bảng dữ liệu đã có log
            const [modules] = await pool.query(
                `SELECT DISTINCT BangDuLieu FROM nhat_ky_hoat_dong WHERE BangDuLieu IS NOT NULL`
            );

            // Lấy danh sách duy nhất các người dùng đã thực hiện hành động
            const [users] = await pool.query(
                `SELECT DISTINCT tk.TenTK 
                 FROM nhat_ky_hoat_dong n 
                 JOIN taikhoan tk ON n.MaTK = tk.MaTK 
                 WHERE tk.TenTK IS NOT NULL`
            );

            res.json({
                success: true,
                data: {
                    modules: modules.map(m => m.BangDuLieu),
                    users: users.map(u => u.TenTK)
                }
            });
        } catch (error) {
            console.error('Error fetching audit log metadata:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

export default reportController;
