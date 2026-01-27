import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// ======================= AUTHENTICATED ROUTES =======================
// All routes require authentication
router.use(authenticateToken);

// ======================= PRODUCT MANAGEMENT =======================
router.get('/products',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.VIEW),
    warehouseController.getAllProducts
);

router.get('/products/:id',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.VIEW),
    warehouseController.getProductById
);

router.post('/products',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.CREATE),
    warehouseController.upsertProduct
);

router.put('/products/:id',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.UPDATE),
    warehouseController.upsertProduct
);

router.delete('/products/:id',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.DELETE),
    warehouseController.deleteProduct
);

router.patch('/products/:id/min-stock',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.UPDATE),
    warehouseController.updateMinStock
);

// ======================= CATALOG HELPERS = ::::: AUTHENTICATED CATALOG MANAGEMENT =======================
router.get('/publishers', warehouseController.getPublishers);

router.post('/authors',
    checkPermission(FEATURES.AUTHORS, PERMISSIONS.CREATE),
    warehouseController.addAuthor
);

router.put('/authors/:id',
    checkPermission(FEATURES.AUTHORS, PERMISSIONS.UPDATE),
    warehouseController.updateAuthor
);

router.delete('/authors/:id',
    checkPermission(FEATURES.AUTHORS, PERMISSIONS.DELETE),
    warehouseController.deleteAuthor
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

// Stock Transfers
router.get('/transfers', checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW), warehouseController.getTransfers);

export default router;
