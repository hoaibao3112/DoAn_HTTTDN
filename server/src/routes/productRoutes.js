import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.get('/', warehouseController.getAllProducts);
router.post('/', authenticateToken, checkPermission(11, 'Them'), warehouseController.upsertProduct);
router.put('/:id', authenticateToken, checkPermission(11, 'Sua'), warehouseController.upsertProduct);

export default router;