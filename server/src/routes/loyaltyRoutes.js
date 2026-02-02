import express from 'express';
import {
  getCustomerLoyaltyInfo,
  getAllCustomersLoyalty,
  getPointsHistory,
  calculatePoints,
  addPoints,
  usePoints,
  getPointsRules,
  getMembershipTiers,
  getTierBenefits,
  getLoyaltyStatistics,
  adjustPoints
} from '../controllers/loyaltyController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// =====================================================
// PUBLIC ROUTES (không cần auth - cho POS)
// =====================================================

// Lấy thông tin hội viên theo số điện thoại (cho POS tra cứu)
router.get('/customer/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const pool = (await import('../config/database.js')).default;
    
    const [customers] = await pool.query(
      `SELECT * FROM v_ThongTinHoiVien WHERE SDT = ?`,
      [phone]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    res.json({
      success: true,
      data: customers[0]
    });
  } catch (error) {
    console.error('Error getting customer by phone:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tra cứu khách hàng',
      error: error.message
    });
  }
});

// Tính điểm sẽ được cộng
router.post('/calculate-points', calculatePoints);

// Lấy quy tắc tích điểm (public để POS hiển thị)
router.get('/rules', getPointsRules);

// Lấy các hạng thành viên (public)
router.get('/tiers', getMembershipTiers);

// Lấy ưu đãi của một hạng cụ thể
router.get('/tier/:tierName', getTierBenefits);

// =====================================================
// PROTECTED ROUTES (cần auth)
// =====================================================

// Thông tin hội viên
router.get('/customer/:customerId', authenticateToken, getCustomerLoyaltyInfo);
router.get('/customers', authenticateToken, getAllCustomersLoyalty);

// Lịch sử điểm
router.get('/history/:customerId', authenticateToken, getPointsHistory);

// Tích điểm & sử dụng điểm (cho POS)
router.post('/add-points', authenticateToken, addPoints);
router.post('/use-points', authenticateToken, usePoints);

// Điều chỉnh điểm thủ công (admin only)
router.post('/adjust-points', authenticateToken, checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.UPDATE), adjustPoints);

// Thống kê
router.get('/statistics', authenticateToken, getLoyaltyStatistics);

export default router;
