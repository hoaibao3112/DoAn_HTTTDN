import express from 'express';
import promotionController from '../controllers/promotionController.js';
import { authenticateToken } from '../utils/generateToken.js';

const router = express.Router();

// ======================= PUBLIC ROUTES (No Auth) =======================
// Kiểm tra và áp dụng mã giảm giá (POS không cần auth)
router.post('/validate-voucher', promotionController.validateVoucher);

// Kiểm tra khuyến mãi có thể áp dụng (POS không cần auth)
router.post('/check-available', promotionController.checkAvailablePromotions);

// Apply auth to remaining promotion routes
router.use(authenticateToken);

// ======================= QUẢN LÝ CHƯƠNG TRÌNH KHUYẾN MÃI =======================

// Lấy danh sách tất cả khuyến mãi
router.get('/promotions', promotionController.getAllPromotions);

// Lấy chi tiết một khuyến mãi
router.get('/promotions/:id', promotionController.getPromotionById);

// Tạo chương trình khuyến mãi mới
router.post('/promotions', promotionController.createPromotion);

// Cập nhật khuyến mãi
router.put('/promotions/:id', promotionController.updatePromotion);

// Xóa khuyến mãi
router.delete('/promotions/:id', promotionController.deletePromotion);

// Bật/Tắt khuyến mãi
router.patch('/promotions/:id/toggle', promotionController.togglePromotion);

// ======================= QUẢN LÝ MÃ GIẢM GIÁ =======================

// Lấy tất cả mã giảm giá
router.get('/vouchers', promotionController.getAllVouchers);

// Tạo mã giảm giá mới
router.post('/vouchers', promotionController.createVoucher);

// Xóa mã giảm giá
router.delete('/vouchers/:id', promotionController.deleteVoucher);

// ======================= LƯUHISTORY ÁP DỤNG KHUYẾN MÃI =======================

// Lưu lịch sử sử dụng khuyến mãi (sau khi tạo hóa đơn)
router.post('/save-usage', promotionController.savePromotionUsage);

// ======================= BÁO CÁO & THỐNG KÊ =======================

// Thống kê hiệu quả khuyến mãi
router.get('/statistics', promotionController.getPromotionStatistics);

// Lịch sử sử dụng khuyến mãi
router.get('/history', promotionController.getPromotionHistory);

// Top khách hàng sử dụng khuyến mãi nhiều nhất
router.get('/top-customers', promotionController.getTopCustomers);

export default router;
