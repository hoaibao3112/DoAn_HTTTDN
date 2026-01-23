import express from 'express';
import attendanceController from '../controllers/attendanceController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// All attendance routes require authentication
router.use(authenticateToken);

// ======================= EMPLOYEE SELF-SERVICE =======================
router.get('/my-attendance', attendanceController.getMyAttendance);
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

// ======================= HR MANAGER - ATTENDANCE MANAGEMENT =======================
// Feature 7: 'Chấm công'
router.get('/attendance', checkPermission(7, 'Xem'), attendanceController.getAllAttendance);
router.post('/attendance', checkPermission(7, 'Them'), attendanceController.createAttendance);
router.put('/attendance/:id', checkPermission(7, 'Sua'), attendanceController.updateAttendance);
router.delete('/attendance/:id', checkPermission(7, 'Xoa'), attendanceController.deleteAttendance);

// ======================= ATTENDANCE REPORTS =======================
router.get('/attendance/summary', checkPermission(7, 'Xem'), attendanceController.getAttendanceSummary);

export default router;
