import express from 'express';
import financeController from '../controllers/financeController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All finance routes require authentication
router.use(authenticateToken);

// ======================= EXPENSE MANAGEMENT =======================
// Uses REPORTS feature for financial operations
router.get('/expenses', checkPermission(FEATURES.REPORTS, PERMISSIONS.VIEW), financeController.getAllExpenses);
router.get('/expenses/:id', checkPermission(FEATURES.REPORTS, PERMISSIONS.VIEW), financeController.getExpenseById);
router.post('/expenses', checkPermission(FEATURES.REPORTS, PERMISSIONS.CREATE), financeController.createExpense);
router.put('/expenses/:id', checkPermission(FEATURES.REPORTS, PERMISSIONS.UPDATE), financeController.updateExpense);
router.delete('/expenses/:id', checkPermission(FEATURES.REPORTS, PERMISSIONS.DELETE), financeController.deleteExpense);

// ======================= EXPENSE CATEGORIES =======================
router.get('/expense-categories', checkPermission(FEATURES.REPORTS, PERMISSIONS.VIEW), financeController.getAllExpenseCategories);
router.post('/expense-categories', checkPermission(FEATURES.REPORTS, PERMISSIONS.CREATE), financeController.createExpenseCategory);
router.put('/expense-categories/:id', checkPermission(FEATURES.REPORTS, PERMISSIONS.UPDATE), financeController.updateExpenseCategory);

// ======================= FINANCIAL REPORTS =======================
router.get('/summary', checkPermission(FEATURES.REPORTS, PERMISSIONS.VIEW), financeController.getExpenseSummary);

export default router;
