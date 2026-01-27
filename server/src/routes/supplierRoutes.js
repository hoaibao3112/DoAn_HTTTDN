import express from 'express';
import supplierController from '../controllers/supplierController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All supplier routes require authentication
router.use(authenticateToken);

// ======================= SUPPLIER CRUD =======================
router.get('/', checkPermission(FEATURES.SUPPLIERS, PERMISSIONS.VIEW), supplierController.getAllSuppliers);
router.get('/:id', checkPermission(FEATURES.SUPPLIERS, PERMISSIONS.VIEW), supplierController.getSupplierById);
router.post('/', checkPermission(FEATURES.SUPPLIERS, PERMISSIONS.CREATE), supplierController.createSupplier);
router.put('/:id', checkPermission(FEATURES.SUPPLIERS, PERMISSIONS.UPDATE), supplierController.updateSupplier);
router.delete('/:id', checkPermission(FEATURES.SUPPLIERS, PERMISSIONS.DELETE), supplierController.deleteSupplier);

// ======================= SUPPLIER DEBTS =======================
router.get('/debts/all', checkPermission(FEATURES.SUPPLIERS, PERMISSIONS.VIEW), supplierController.getAllDebts);
router.get('/:id/debts', checkPermission(FEATURES.SUPPLIERS, PERMISSIONS.VIEW), supplierController.getSupplierDebts);
router.post('/debts/pay', checkPermission(FEATURES.SUPPLIERS, PERMISSIONS.CREATE), supplierController.recordDebtPayment);

export default router;
