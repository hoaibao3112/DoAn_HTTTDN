import express from 'express';
import hrController from '../controllers/hrController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// All HR routes require authentication
router.use(authenticateToken);

// ======================= MODULE 2.1: EMPLOYEE SELF-SERVICE =======================

// Profile
router.get('/profile', hrController.getProfile);
router.put('/profile', hrController.updateProfile);

// Leave Requests (Self)
router.post('/xin-nghi-phep', hrController.submitLeave);
router.get('/my-leave', hrController.getMyLeave);

// Salary (Self)
router.get('/my-salary', hrController.getMySalary);

// ======================= MODULE 2.2: HR MANAGER =======================

// Employee Management (Feature 6: 'Danh sách nhân viên')
router.get('/employees', checkPermission(6, 'Xem'), hrController.getAllEmployees);
router.post('/employees', checkPermission(6, 'Them'), hrController.addEmployee);
router.put('/employees/:id', checkPermission(6, 'Sua'), hrController.updateEmployee);
router.delete('/employees/:id', checkPermission(6, 'Xoa'), hrController.deleteEmployee);

// Position & Salary Changes (History)
router.post('/change-position', checkPermission(6, 'Sua'), hrController.changePosition);

// Leave Approval (Feature 9: 'Xin nghỉ phép' - but for admin it's approval)
router.get('/leave-requests', checkPermission(9, 'Xem'), hrController.getAllLeaveRequests);
router.put('/leave-requests/:id/approve', checkPermission(9, 'Duyet'), hrController.approveLeave);

// Salary Calculation (Feature 10: 'Tính lương')
router.post('/salary/calculate', checkPermission(10, 'Them'), hrController.calculateMonthlySalary);

export default router;
