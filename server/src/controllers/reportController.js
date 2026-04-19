import pool from '../config/connectDatabase.js';

const reportController = {
    // =======================Chức năng báo cáo======================
    // Lấy doanh thu theo năm
    getRevenueByYear: async (req, res) => {
        try {
            const query = `
                SELECT 
                    YEAR(hd.NgayBan) as Nam,
                    SUM(hd.ThanhToan) as DoanhThu,
                    COUNT(DISTINCT hd.MaHD) as SoHoaDon,
                    SUM(cost_table.TotalCost) as Von
                FROM hoadon hd
                LEFT JOIN (
                    SELECT ct.MaHD, SUM(ct.SoLuong * sp.GiaNhap) as TotalCost
                    FROM chitiethoadon ct
                    JOIN sanpham sp ON ct.MaSP = sp.MaSP
                    GROUP BY ct.MaHD
                ) as cost_table ON hd.MaHD = cost_table.MaHD
                WHERE hd.TrangThai = 'Hoan_thanh'
                GROUP BY YEAR(hd.NgayBan)
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
                    MONTH(hd.NgayBan) as Thang,
                    SUM(hd.ThanhToan) as DoanhThu,
                    COUNT(DISTINCT hd.MaHD) as SoHoaDon,
                    SUM(cost_table.TotalCost) as Von
                FROM hoadon hd
                LEFT JOIN (
                    SELECT ct.MaHD, SUM(ct.SoLuong * sp.GiaNhap) as TotalCost
                    FROM chitiethoadon ct
                    JOIN sanpham sp ON ct.MaSP = sp.MaSP
                    GROUP BY ct.MaHD
                ) as cost_table ON hd.MaHD = cost_table.MaHD
                WHERE YEAR(hd.NgayBan) = ? AND hd.TrangThai = 'Hoan_thanh'
                GROUP BY MONTH(hd.NgayBan)
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
                    DAY(hd.NgayBan) as Ngay,
                    SUM(hd.ThanhToan) as DoanhThu,
                    COUNT(DISTINCT hd.MaHD) as SoHoaDon,
                    SUM(cost_table.TotalCost) as Von
                FROM hoadon hd
                LEFT JOIN (
                    SELECT ct.MaHD, SUM(ct.SoLuong * sp.GiaNhap) as TotalCost
                    FROM chitiethoadon ct
                    JOIN sanpham sp ON ct.MaSP = sp.MaSP
                    GROUP BY ct.MaHD
                ) as cost_table ON hd.MaHD = cost_table.MaHD
                WHERE YEAR(hd.NgayBan) = ? AND MONTH(hd.NgayBan) = ? AND hd.TrangThai = 'Hoan_thanh'
                GROUP BY DAY(hd.NgayBan)
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
                    DATE(hd.NgayBan) as Ngay,
                    SUM(hd.ThanhToan) as DoanhThu,
                    COUNT(DISTINCT hd.MaHD) as SoHoaDon,
                    SUM(cost_table.TotalCost) as Von
                FROM hoadon hd
                LEFT JOIN (
                    SELECT ct.MaHD, SUM(ct.SoLuong * sp.GiaNhap) as TotalCost
                    FROM chitiethoadon ct
                    JOIN sanpham sp ON ct.MaSP = sp.MaSP
                    GROUP BY ct.MaHD
                ) as cost_table ON hd.MaHD = cost_table.MaHD
                WHERE DATE(hd.NgayBan) BETWEEN ? AND ? AND hd.TrangThai = 'Hoan_thanh'
                GROUP BY DATE(hd.NgayBan)
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
                    COUNT(DISTINCT hd.MaHD) AS SoLuongDon
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

            const [results] = await pool.query(`
                SELECT 
                    tl.TenTL AS TheLoai,
                    SUM(ct.SoLuong) AS TongSoLuong,
                    SUM(
                        (ct.SoLuong * ct.DonGia - IFNULL(ct.GiamGia,0)) * 
                        hd.ThanhToan / NULLIF(hd.TongTien, 1)
                    ) AS DoanhThu,
                    COUNT(DISTINCT hd.MaHD) AS TongDon,
                    COUNT(DISTINCT sp.MaSP) AS SoSanPham
                FROM chitiethoadon ct
                JOIN hoadon hd ON ct.MaHD = hd.MaHD
                JOIN sanpham sp ON ct.MaSP = sp.MaSP
                JOIN theloai tl ON sp.MaTL = tl.MaTL
                WHERE hd.TrangThai = 'Hoan_thanh' AND ${timeWhere}
                GROUP BY tl.MaTL, tl.TenTL
                ORDER BY TongSoLuong DESC
            `);
            res.json({ success: true, data: results });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Thống kê khách hàng (Tổng quát & Chi tiết)
    getCustomerReport: async (req, res) => {
        try {
            const { timePeriod = 'month', tuNgay, denNgay } = req.body;
            const timeWhere = reportController._buildTimeWhere(timePeriod, tuNgay, denNgay);

            // 1. Thống kê tổng quát (Summary)
            const [summaryResults] = await pool.query(`
                SELECT 
                    COUNT(*) as TotalCustomers,
                    SUM(CASE WHEN NgayThamGia >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) as NewCustomersThisMonth,
                    SUM(CASE WHEN HangTV IN ('Vang', 'Kim_cuong') THEN 1 ELSE 0 END) as VipCount,
                    AVG(TongChiTieu) as AvgSpent
                FROM khachhang
                WHERE TinhTrang = 1
            `);

            // 2. Phân bố theo hạng (Tiers)
            const [tierResults] = await pool.query(`
                SELECT HangTV as name, COUNT(*) as value
                FROM khachhang
                WHERE TinhTrang = 1
                GROUP BY HangTV
            `);

            // 3. Top khách hàng chi tiêu (VIPs)
            const [vipResults] = await pool.query(`
                SELECT HoTen, SDT, HangTV, TongChiTieu, DiemTichLuy
                FROM khachhang
                WHERE TinhTrang = 1
                ORDER BY TongChiTieu DESC
                LIMIT 10
            `);

            // 4. Xu hướng giao dịch (Trends - existing logic)
            const [trendResults] = await pool.query(`
                SELECT 
                    DATE(hd.NgayBan) AS ThoiGian,
                    COUNT(DISTINCT hd.MaHD) AS SoLuongDon,
                    COUNT(DISTINCT hd.MaKH) AS SoLuongKhachHang,
                    COUNT(DISTINCT ct.MaSP) AS SoLoaiSanPham
                FROM hoadon hd
                JOIN chitiethoadon ct ON hd.MaHD = ct.MaHD
                WHERE hd.TrangThai = 'Hoan_thanh' AND ${timeWhere}
                GROUP BY DATE(hd.NgayBan)
                ORDER BY ThoiGian DESC
            `);

            res.json({ 
                success: true, 
                data: {
                    summary: summaryResults[0],
                    tiers: tierResults,
                    vips: vipResults,
                    trends: trendResults
                }
            });
        } catch (error) {
            console.error('Error fetching customer report:', error);
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
