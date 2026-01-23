import express from 'express';
import returnController from '../controllers/returnController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// All return routes require authentication
router.use(authenticateToken);

// ======================= RETURN/REFUND MANAGEMENT =======================
// Feature 22: 'Trả hàng'
router.get('/returns', checkPermission(22, 'Xem'), returnController.getAllReturns);
router.get('/returns/:id', checkPermission(22, 'Xem'), returnController.getReturnById);
router.post('/returns', checkPermission(22, 'Them'), returnController.createReturn);
router.put('/returns/:id/approve', checkPermission(22, 'Duyet'), returnController.approveReturn);

export default router;
