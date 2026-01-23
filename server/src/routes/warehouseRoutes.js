import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All warehouse routes require authentication
router.use(authenticateToken);

// ======================= PRODUCT MANAGEMENT =======================
router.get('/products',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.VIEW),
    warehouseController.getAllProducts
);

router.post('/products',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.CREATE),
    warehouseController.upsertProduct
);

router.put('/products',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.UPDATE),
    warehouseController.upsertProduct
);

// ======================= PURCHASE ORDERS =======================
router.get('/purchase-orders',
    checkPermission(FEATURES.PURCHASE_ORDERS, PERMISSIONS.VIEW),
    warehouseController.getAllPurchaseOrders
);

router.get('/purchase-orders/:id',
    checkPermission(FEATURES.PURCHASE_ORDERS, PERMISSIONS.VIEW),
    warehouseController.getPurchaseOrderById
);

router.post('/purchase-orders',
    checkPermission(FEATURES.PURCHASE_ORDERS, PERMISSIONS.CREATE),
    warehouseController.createPurchaseOrder
);

// ======================= STOCK MANAGEMENT =======================
router.get('/stock',
    checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW),
    warehouseController.getStockByBranch
);

router.get('/stock/alerts',
    checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW),
    warehouseController.getLowStockAlerts
);

// ======================= STOCK TRANSFER =======================
router.post('/transfers',
    checkPermission(FEATURES.STOCK, PERMISSIONS.CREATE),
    warehouseController.transferStock
);

router.put('/transfers/:id/approve',
    checkPermission(FEATURES.STOCK, PERMISSIONS.APPROVE),
    warehouseController.approveTransfer
);

// ======================= INVENTORY CHECK =======================
router.post('/inventory-check',
    checkPermission(FEATURES.INVENTORY_CHECK, PERMISSIONS.CREATE),
    warehouseController.performInventoryCheck
);

export default router;
