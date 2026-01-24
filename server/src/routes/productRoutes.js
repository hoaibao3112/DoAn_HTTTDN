import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

router.get('/', authenticateToken, checkPermission(FEATURES.PRODUCTS, PERMISSIONS.VIEW), warehouseController.getAllProducts);
router.post('/', authenticateToken, checkPermission(FEATURES.PRODUCTS, PERMISSIONS.CREATE), warehouseController.upsertProduct);
router.put('/:id', authenticateToken, checkPermission(FEATURES.PRODUCTS, PERMISSIONS.UPDATE), warehouseController.upsertProduct);

export default router;