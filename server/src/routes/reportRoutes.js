import express from 'express';
import pool from '../config/connectDatabase.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// Middleware to apply to all report routes
router.use(authenticateToken);

// ======================= MODULE 1.3: AUDIT LOGS =======================

// View audit logs (Feature 4 in chucnang: 'Nhật ký hoạt động')
router.get('/audit-logs', checkPermission(FEATURES.AUDIT_LOGS, PERMISSIONS.VIEW), async (req, res) => {
  const { page = 1, pageSize = 20, Action, Table } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (Action) {
      whereClause += ' AND HanhDong = ?';
      params.push(Action);
    }
    if (Table) {
      whereClause += ' AND BangDuLieu = ?';
      params.push(Table);
    }

    const [logs] = await pool.query(
      `SELECT nk.*, tk.TenTK 
       FROM nhat_ky_hoat_dong nk 
       LEFT JOIN taikhoan tk ON nk.MaTK = tk.MaTK 
       ${whereClause} 
       ORDER BY nk.ThoiGian DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    const [total] = await pool.query(`SELECT COUNT(*) as total FROM nhat_ky_hoat_dong ${whereClause}`, params);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        total: total[0].total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy nhật ký hoạt động', error: error.message });
  }
});

// ======================= MODULE 1.4: ADMINISTRATIVE REPORTS =======================

// Revenue by Month (from v_doanh_thu_thang)
router.get('/revenue/monthly', checkPermission(FEATURES.REVENUE_REPORT, PERMISSIONS.VIEW), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_doanh_thu_thang');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo doanh thu', error: error.message });
  }
});

// Profit by Month (from v_loi_nhuan)
router.get('/profit/monthly', checkPermission(FEATURES.PROFIT_REPORT, PERMISSIONS.VIEW), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_loi_nhuan');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo lợi nhuận', error: error.message });
  }
});

// Revenue by Quarter (NEW)
router.get('/revenue/quarterly', checkPermission(FEATURES.REVENUE_REPORT, PERMISSIONS.VIEW), async (req, res) => {
  const { year } = req.query;
  try {
    const query = year
      ? `SELECT 
          YEAR(hd.NgayLap) as Nam,
          QUARTER(hd.NgayLap) as Quy,
          SUM(hd.ThanhToan) as TongDoanhThu,
          COUNT(hd.MaHD) as SoHoaDon
        FROM hoadon hd
        WHERE YEAR(hd.NgayLap) = ? AND hd.TrangThai = 'Hoan_thanh'
        GROUP BY Nam, Quy
        ORDER BY Nam, Quy`
      : `SELECT 
          YEAR(hd.NgayLap) as Nam,
          QUARTER(hd.NgayLap) as Quy,
          SUM(hd.ThanhToan) as TongDoanhThu,
          COUNT(hd.MaHD) as SoHoaDon
        FROM hoadon hd
        WHERE hd.TrangThai = 'Hoan_thanh'
        GROUP BY Nam, Quy
        ORDER BY Nam DESC, Quy DESC
        LIMIT 8`;

    const [rows] = year ? await pool.query(query, [year]) : await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo doanh thu theo quý', error: error.message });
  }
});

// Revenue by Year (NEW)
router.get('/revenue/yearly', checkPermission(FEATURES.REVENUE_REPORT, PERMISSIONS.VIEW), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        YEAR(hd.NgayLap) as Nam,
        SUM(hd.ThanhToan) as TongDoanhThu,
        COUNT(hd.MaHD) as SoHoaDon,
        AVG(hd.ThanhToan) as DoanhThuTrungBinh
      FROM hoadon hd
      WHERE hd.TrangThai = 'Hoan_thanh'
      GROUP BY Nam
      ORDER BY Nam DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo doanh thu theo năm', error: error.message });
  }
});

// Profit by Quarter (NEW)
router.get('/profit/quarterly', checkPermission(FEATURES.PROFIT_REPORT, PERMISSIONS.VIEW), async (req, res) => {
  const { year } = req.query;
  try {
    const query = year
      ? `SELECT 
          YEAR(hd.NgayLap) as Nam,
          QUARTER(hd.NgayLap) as Quy,
          SUM(hd.ThanhToan) as TongDoanhThu,
          SUM((cthd.DonGia - sp.GiaNhap) * cthd.SoLuong) as LoiNhuan,
          COUNT(DISTINCT hd.MaHD) as SoHoaDon
        FROM hoadon hd
        JOIN chitiethoadon cthd ON hd.MaHD = cthd.MaHD
        JOIN sanpham sp ON cthd.MaSP = sp.MaSP
        WHERE YEAR(hd.NgayLap) = ? AND hd.TrangThai = 'Hoan_thanh'
        GROUP BY Nam, Quy
        ORDER BY Nam, Quy`
      : `SELECT 
          YEAR(hd.NgayLap) as Nam,
          QUARTER(hd.NgayLap) as Quy,
          SUM(hd.ThanhToan) as TongDoanhThu,
          SUM((cthd.DonGia - sp.GiaNhap) * cthd.SoLuong) as LoiNhuan,
          COUNT(DISTINCT hd.MaHD) as SoHoaDon
        FROM hoadon hd
        JOIN chitiethoadon cthd ON hd.MaHD = cthd.MaHD
        JOIN sanpham sp ON cthd.MaSP = sp.MaSP
        WHERE hd.TrangThai = 'Hoan_thanh'
        GROUP BY Nam, Quy
        ORDER BY Nam DESC, Quy DESC
        LIMIT 8`;

    const [rows] = year ? await pool.query(query, [year]) : await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo lợi nhuận theo quý', error: error.message });
  }
});

// Profit by Year (NEW)
router.get('/profit/yearly', checkPermission(FEATURES.PROFIT_REPORT, PERMISSIONS.VIEW), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        YEAR(hd.NgayLap) as Nam,
        SUM(hd.ThanhToan) as TongDoanhThu,
        SUM((cthd.DonGia - sp.GiaNhap) * cthd.SoLuong) as LoiNhuan,
        COUNT(DISTINCT hd.MaHD) as SoHoaDon
      FROM hoadon hd
      JOIN chitiethoadon cthd ON hd.MaHD = cthd.MaHD
      JOIN sanpham sp ON cthd.MaSP = sp.MaSP
      WHERE hd.TrangThai = 'Hoan_thanh'
      GROUP BY Nam
      ORDER BY Nam DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo lợi nhuận theo năm', error: error.message });
  }
});

// Product Sales Statistics (NEW) - Thống kê sản phẩm xuất theo thời gian
router.get('/sales/products', checkPermission(FEATURES.REPORTS, PERMISSIONS.VIEW), async (req, res) => {
  const { period = 'monthly', year, quarter, month } = req.query;

  try {
    let query = '';
    let params = [];

    if (period === 'monthly') {
      query = `
        SELECT 
          YEAR(hd.NgayLap) as Nam,
          MONTH(hd.NgayLap) as Thang,
          sp.MaSP, sp.TenSP, sp.TheLoai,
          SUM(cthd.SoLuong) as TongSoLuongBan,
          SUM(cthd.SoLuong * cthd.DonGia) as TongDoanhThu
        FROM hoadon hd
        JOIN chitiethoadon cthd ON hd.MaHD = cthd.MaHD
        JOIN sanpham sp ON cthd.MaSP = sp.MaSP
        WHERE hd.TrangThai = 'Hoan_thanh'
        ${year ? 'AND YEAR(hd.NgayLap) = ?' : ''}
        ${month ? 'AND MONTH(hd.NgayLap) = ?' : ''}
        GROUP BY Nam, Thang, sp.MaSP
        ORDER BY Nam DESC, Thang DESC, TongSoLuongBan DESC
      `;
      if (year) params.push(year);
      if (month) params.push(month);
    } else if (period === 'quarterly') {
      query = `
        SELECT 
          YEAR(hd.NgayLap) as Nam,
          QUARTER(hd.NgayLap) as Quy,
          sp.MaSP, sp.TenSP, sp.TheLoai,
          SUM(cthd.SoLuong) as TongSoLuongBan,
          SUM(cthd.SoLuong * cthd.DonGia) as TongDoanhThu
        FROM hoadon hd
        JOIN chitiethoadon cthd ON hd.MaHD = cthd.MaHD
        JOIN sanpham sp ON cthd.MaSP = sp.MaSP
        WHERE hd.TrangThai = 'Hoan_thanh'
        ${year ? 'AND YEAR(hd.NgayLap) = ?' : ''}
        ${quarter ? 'AND QUARTER(hd.NgayLap) = ?' : ''}
        GROUP BY Nam, Quy, sp.MaSP
        ORDER BY Nam DESC, Quy DESC, TongSoLuongBan DESC
      `;
      if (year) params.push(year);
      if (quarter) params.push(quarter);
    } else if (period === 'yearly') {
      query = `
        SELECT 
          YEAR(hd.NgayLap) as Nam,
          sp.MaSP, sp.TenSP, sp.TheLoai,
          SUM(cthd.SoLuong) as TongSoLuongBan,
          SUM(cthd.SoLuong * cthd.DonGia) as TongDoanhThu
        FROM hoadon hd
        JOIN chitiethoadon cthd ON hd.MaHD = cthd.MaHD
        JOIN sanpham sp ON cthd.MaSP = sp.MaSP
        WHERE hd.TrangThai = 'Hoan_thanh'
        ${year ? 'AND YEAR(hd.NgayLap) = ?' : ''}
        GROUP BY Nam, sp.MaSP
        ORDER BY Nam DESC, TongSoLuongBan DESC
      `;
      if (year) params.push(year);
    }

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows, period });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê sản phẩm xuất', error: error.message });
  }
});

// Best Selling Products (from v_san_pham_ban_chay)
router.get('/best-sellers', checkPermission(FEATURES.REPORTS, PERMISSIONS.VIEW), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_san_pham_ban_chay LIMIT 20');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách sản phẩm bán chạy', error: error.message });
  }
});

// Branch Stock Report (Module 3 requirement for Admin)
router.get('/stock/branches', checkPermission(FEATURES.STOCK_REPORT, PERMISSIONS.VIEW), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ch.TenCH, sp.TenSP, tk.SoLuongTon, tk.SoLuongToiThieu 
       FROM ton_kho tk 
       JOIN cua_hang ch ON tk.MaCH = ch.MaCH 
       JOIN sanpham sp ON tk.MaSP = sp.MaSP`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo tồn kho', error: error.message });
  }
});

export default router;