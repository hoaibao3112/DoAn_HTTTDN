import express from 'express';
import reportController from '../controllers/reportController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// Tất cả các route đều yêu cầu authentication
router.use(authenticateToken);

// Báo cáo doanh thu
router.get('/doanhthu/nam', 
    checkPermission(FEATURES.REVENUE_REPORT, PERMISSIONS.VIEW),
    reportController.getRevenueByYear
);

router.get('/doanhthu/thang/:year', 
    checkPermission(FEATURES.REVENUE_REPORT, PERMISSIONS.VIEW),
    reportController.getRevenueByMonth
);

router.get('/doanhthu/ngay/:year/:month', 
    checkPermission(FEATURES.REVENUE_REPORT, PERMISSIONS.VIEW),
    reportController.getRevenueByDay
);

router.post('/doanhthu/khoangtg', 
    checkPermission(FEATURES.REVENUE_REPORT, PERMISSIONS.VIEW),
    reportController.getRevenueByDateRange
);

export default router;
