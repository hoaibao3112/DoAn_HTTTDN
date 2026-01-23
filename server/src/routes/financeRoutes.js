import express from 'express';
import financeController from '../controllers/financeController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// All finance routes require authentication
router.use(authenticateToken);

// ======================= EXPENSE MANAGEMENT =======================
// You may need to create a new chucnang entry for Finance module
// For now, using permission ID that makes sense (adjust as needed)
router.get('/expenses', checkPermission(23, 'Xem'), financeController.getAllExpenses);
router.get('/expenses/:id', checkPermission(23, 'Xem'), financeController.getExpenseById);
router.post('/expenses', checkPermission(23, 'Them'), financeController.createExpense);
router.put('/expenses/:id', checkPermission(23, 'Sua'), financeController.updateExpense);
router.delete('/expenses/:id', checkPermission(23, 'Xoa'), financeController.deleteExpense);

// ======================= EXPENSE CATEGORIES =======================
router.get('/expense-categories', checkPermission(23, 'Xem'), financeController.getAllExpenseCategories);
router.post('/expense-categories', checkPermission(23, 'Them'), financeController.createExpenseCategory);
router.put('/expense-categories/:id', checkPermission(23, 'Sua'), financeController.updateExpenseCategory);

// ======================= FINANCIAL REPORTS =======================
router.get('/summary', checkPermission(23, 'Xem'), financeController.getExpenseSummary);

export default router;
