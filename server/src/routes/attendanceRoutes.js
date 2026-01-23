import express from 'express';
import attendanceController from '../controllers/attendanceController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All attendance routes require authentication
router.use(authenticateToken);

// ======================= EMPLOYEE SELF-SERVICE =======================
router.get('/my-attendance', attendanceController.getMyAttendance);
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

// ======================= HR MANAGER - ATTENDANCE MANAGEMENT =======================
router.get('/attendance', checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.VIEW), attendanceController.getAllAttendance);
router.post('/attendance', checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.CREATE), attendanceController.createAttendance);
router.put('/attendance/:id', checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.UPDATE), attendanceController.updateAttendance);
router.delete('/attendance/:id', checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.DELETE), attendanceController.deleteAttendance);

// ======================= ATTENDANCE REPORTS =======================
router.get('/attendance/summary', checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.VIEW), attendanceController.getAttendanceSummary);

export default router;
