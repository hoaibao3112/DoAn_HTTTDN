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