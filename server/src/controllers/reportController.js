import pool from '../config/connectDatabase.js';

const reportController = {
    // Lấy doanh thu theo năm
    getRevenueByYear: async (req, res) => {
        try {
            const query = `
                SELECT 
                    YEAR(NgayBan) as Nam,
                    SUM(TongTien) as TongDoanhThu,
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
                    SUM(TongTien) as TongDoanhThu,
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
                    SUM(TongTien) as TongDoanhThu,
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
                    SUM(TongTien) as TongDoanhThu,
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
    }
};

export default reportController;
