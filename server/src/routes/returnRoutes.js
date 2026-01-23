import express from 'express';
import returnController from '../controllers/returnController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All return routes require authentication
router.use(authenticateToken);

// ======================= RETURN/REFUND MANAGEMENT =======================
router.get('/returns', checkPermission(FEATURES.RETURNS, PERMISSIONS.VIEW), returnController.getAllReturns);
router.get('/returns/:id', checkPermission(FEATURES.RETURNS, PERMISSIONS.VIEW), returnController.getReturnById);
router.post('/returns', checkPermission(FEATURES.RETURNS, PERMISSIONS.CREATE), returnController.createReturn);
router.put('/returns/:id/approve', checkPermission(FEATURES.RETURNS, PERMISSIONS.APPROVE), returnController.approveReturn);

export default router;
