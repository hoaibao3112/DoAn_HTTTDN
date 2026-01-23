import express from 'express';
import supplierController from '../controllers/supplierController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// All supplier routes require authentication
router.use(authenticateToken);

// ======================= SUPPLIER CRUD =======================
// Feature 14: 'Nhà cung cấp'
router.get('/suppliers', checkPermission(14, 'Xem'), supplierController.getAllSuppliers);
router.get('/suppliers/:id', checkPermission(14, 'Xem'), supplierController.getSupplierById);
router.post('/suppliers', checkPermission(14, 'Them'), supplierController.createSupplier);
router.put('/suppliers/:id', checkPermission(14, 'Sua'), supplierController.updateSupplier);
router.delete('/suppliers/:id', checkPermission(14, 'Xoa'), supplierController.deleteSupplier);

// ======================= SUPPLIER DEBTS =======================
router.get('/suppliers/:id/debts', checkPermission(14, 'Xem'), supplierController.getSupplierDebts);
router.post('/debts/pay', checkPermission(14, 'Them'), supplierController.recordDebtPayment);

export default router;
