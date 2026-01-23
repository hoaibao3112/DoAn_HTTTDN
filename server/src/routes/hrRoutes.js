import express from 'express';
import hrController from '../controllers/hrController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All HR routes require authentication
router.use(authenticateToken);

// ======================= MODULE 2.1: EMPLOYEE SELF-SERVICE =======================

// Profile - Không cần check permission vì mỗi user chỉ xem/sửa profile của mình
router.get('/profile', hrController.getProfile);
router.put('/profile', hrController.updateProfile);

// Leave Requests (Self) - Nhân viên tự nộp đơn xin nghỉ
router.post('/xin-nghi-phep', hrController.submitLeave);
router.get('/my-leave', hrController.getMyLeave);

// Salary (Self) - Nhân viên xem lương của mình
router.get('/my-salary', hrController.getMySalary);

// ======================= MODULE 2.2: HR MANAGER =======================

// Employee Management
router.get('/employees',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.VIEW),
    hrController.getAllEmployees
);

router.post('/employees',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.CREATE),
    hrController.addEmployee
);

router.put('/employees/:id',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.UPDATE),
    hrController.updateEmployee
);

router.delete('/employees/:id',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.DELETE),
    hrController.deleteEmployee
);

// Position & Salary Changes (History)
router.post('/change-position',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.UPDATE),
    hrController.changePosition
);

// Leave Approval
router.get('/leave-requests',
    checkPermission(FEATURES.LEAVE, PERMISSIONS.VIEW),
    hrController.getAllLeaveRequests
);

router.put('/leave-requests/:id/approve',
    checkPermission(FEATURES.LEAVE, PERMISSIONS.APPROVE),
    hrController.approveLeave
);

// Salary Calculation
router.post('/salary/calculate',
    checkPermission(FEATURES.SALARY, PERMISSIONS.CREATE),
    hrController.calculateMonthlySalary
);

export default router;
