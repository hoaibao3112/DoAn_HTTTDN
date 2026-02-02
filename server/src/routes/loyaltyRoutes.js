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
import { verifyToken } from '../middlewares/authMiddleware.js';
// import { checkPermission } from '../middlewares/rbacMiddleware.js';

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
router.get('/customer/:customerId', verifyToken, getCustomerLoyaltyInfo);
router.get('/customers', verifyToken, getAllCustomersLoyalty);

// Lịch sử điểm
router.get('/history/:customerId', verifyToken, getPointsHistory);

// Tích điểm & sử dụng điểm (cho POS)
router.post('/add-points', verifyToken, addPoints);
router.post('/use-points', verifyToken, usePoints);

// Điều chỉnh điểm thủ công (admin only - sau này thêm permission)
router.post('/adjust-points', verifyToken, adjustPoints);

// Thống kê
router.get('/statistics', verifyToken, getLoyaltyStatistics);

export default router;
