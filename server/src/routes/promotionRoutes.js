import express from 'express';
import promotionController from '../controllers/promotionController.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Tạm thời không dùng permission check, dùng sau khi có MaCN
// Bạn có thể thêm permission sau: checkPermission(FEATURES.PROMOTION, 'Xem')

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

// ======================= ÁP DỤNG KHUYẾN MÃI (POS) =======================

// Kiểm tra khuyến mãi có thể áp dụng cho đơn hàng
router.post('/check-available', promotionController.checkAvailablePromotions);

// Kiểm tra và áp dụng mã giảm giá
router.post('/validate-voucher', promotionController.validateVoucher);

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
