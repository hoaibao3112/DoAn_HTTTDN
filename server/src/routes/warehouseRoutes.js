import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// ======================= MULTER SETUP FOR PRODUCT IMAGES =======================
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = file.fieldname === 'HinhAnh' ? 'backend/product' : 'backend/anh_phu';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadProduct = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'));
        }
    }
});

// ======================= AUTHENTICATED ROUTES =======================
// All routes require authentication
router.use(authenticateToken);

// ======================= PRODUCT MANAGEMENT =======================
router.get('/products',
    // checkPermission(FEATURES.PRODUCTS, PERMISSIONS.VIEW), // Cho phép xem list sản phẩm rộng rãi cho POS/Warehouse
    warehouseController.getAllProducts
);

router.get('/products/:id',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.VIEW),
    warehouseController.getProductById
);

router.post('/products',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.CREATE),
    uploadProduct.fields([
        { name: 'HinhAnh', maxCount: 1 },
        { name: 'ExtraImages', maxCount: 10 }
    ]),
    warehouseController.upsertProduct
);

router.put('/products/:id',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.UPDATE),
    uploadProduct.fields([
        { name: 'HinhAnh', maxCount: 1 },
        { name: 'ExtraImages', maxCount: 10 }
    ]),
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
router.get('/transfers/:id', checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW), warehouseController.getTransferById);

export default router;
