import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Module 3.3: Imports
router.post('/import', checkPermission(12, 'Them'), warehouseController.createPurchaseOrder);

// Module 3.5: Transfers
router.post('/transfer', checkPermission(13, 'Them'), warehouseController.transferStock);
router.put('/transfer/:id/approve', checkPermission(13, 'Duyet'), warehouseController.approveTransfer);

// Module 3.6: Stocktake
router.post('/stocktake', checkPermission(14, 'Them'), warehouseController.performInventoryCheck);

export default router;