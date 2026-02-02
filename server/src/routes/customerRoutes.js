import express from 'express';
import customerController from '../controllers/customerController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All customer routes require authentication
router.use(authenticateToken);

// Thống kê khách hàng
router.get('/statistics',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.VIEW),
    customerController.getCustomerStatistics
);

// Lấy danh sách khách hàng (có filter theo hạng, trạng thái, điểm)
router.get('/',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.VIEW),
    customerController.getAllCustomers
);

// Lấy chi tiết khách hàng (bao gồm lịch sử mua hàng)
router.get('/:id',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.VIEW),
    customerController.getCustomerById
);

// Tạo khách hàng mới
router.post('/',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.CREATE),
    customerController.createCustomer
);

// Cập nhật thông tin khách hàng (không bao gồm điểm)
router.put('/:id',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.UPDATE),
    customerController.updateCustomer
);

// Bật/tắt trạng thái khách hàng
router.patch('/:id/toggle-status',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.UPDATE),
    customerController.toggleCustomerStatus
);

// Xóa khách hàng (chỉ khi chưa có lịch sử)
router.delete('/:id',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.DELETE),
    customerController.deleteCustomer
);

export default router;
