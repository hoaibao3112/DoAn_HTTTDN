import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// All warehouse routes require authentication
router.use(authenticateToken);

// ======================= PRODUCT MANAGEMENT =======================
// Feature 13: 'Danh sách sản phẩm'
router.get('/products', checkPermission(13, 'Xem'), warehouseController.getAllProducts);
router.post('/products', checkPermission(13, 'Them'), warehouseController.upsertProduct);
router.put('/products', checkPermission(13, 'Sua'), warehouseController.upsertProduct);

// ======================= PURCHASE ORDERS =======================
// Feature 15: 'Phiếu nhập'
router.get('/purchase-orders', checkPermission(15, 'Xem'), warehouseController.getAllPurchaseOrders);
router.get('/purchase-orders/:id', checkPermission(15, 'Xem'), warehouseController.getPurchaseOrderById);
router.post('/purchase-orders', checkPermission(15, 'Them'), warehouseController.createPurchaseOrder);

// ======================= STOCK MANAGEMENT =======================
// Feature 16: 'Tồn kho'
router.get('/stock', checkPermission(16, 'Xem'), warehouseController.getStockByBranch);
router.get('/stock/alerts', checkPermission(16, 'Xem'), warehouseController.getLowStockAlerts);

// ======================= STOCK TRANSFER =======================
router.post('/transfers', checkPermission(16, 'Them'), warehouseController.transferStock);
router.put('/transfers/:id/approve', checkPermission(16, 'Duyet'), warehouseController.approveTransfer);

// ======================= INVENTORY CHECK =======================
// Feature 17: 'Kiểm kê'
router.post('/inventory-check', checkPermission(17, 'Them'), warehouseController.performInventoryCheck);

export default router;
