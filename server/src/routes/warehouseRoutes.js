import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// ========================= MULTER: Product Images =========================
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.resolve('uploads/images');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Sanitize original name: bỏ dấu, ký tự đặc biệt, giữ lại alphanumeric và dấu gạch ngang
        const originalName = path.parse(file.originalname).name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-');
        
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e4);
        cb(null, `${originalName}-${unique}${path.extname(file.originalname)}`);
    }
});

const uploadProduct = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = /jpeg|jpg|png|gif|webp/.test(
            path.extname(file.originalname).toLowerCase()
        );
        cb(ok ? null : new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'), ok);
    }
});

// ========================= Require auth on ALL routes =========================
router.use(authenticateToken);

// ========================= PRODUCTS (sanpham) =========================
router.get('/products', warehouseController.getAllProducts);

router.get('/products/:id',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.VIEW),
    warehouseController.getProductById
);

router.post('/products',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.CREATE),
    uploadProduct.fields([{ name: 'HinhAnh', maxCount: 1 }]),
    warehouseController.createProduct
);

router.put('/products/:id',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.UPDATE),
    uploadProduct.fields([{ name: 'HinhAnh', maxCount: 1 }]),
    warehouseController.updateProduct
);

router.delete('/products/:id',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.DELETE),
    warehouseController.deleteProduct
);

router.patch('/products/:id/min-stock',
    checkPermission(FEATURES.PRODUCTS, PERMISSIONS.UPDATE),
    warehouseController.updateMinStock
);

// ========================= CATALOG HELPERS =========================
router.get('/publishers', warehouseController.getPublishers);
router.get('/categories', warehouseController.getCategories);
router.get('/authors', warehouseController.getAuthors);
router.get('/suppliers', warehouseController.getSuppliers);
router.get('/stores', warehouseController.getStores);

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

// ========================= PURCHASE ORDERS (phieunhap) =========================
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

// ========================= STOCK (ton_kho) =========================
router.get('/stock',
    checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW),
    warehouseController.getStock
);
// Tồn kho kho quầy (Priority=1) dùng cho POS
router.get('/counter-stock',
    checkPermission(FEATURES.POS, PERMISSIONS.VIEW),
    warehouseController.getCounterStock
);
router.get('/stock/alerts',
    checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW),
    warehouseController.getLowStockAlerts
);

// ========================= SUB-WAREHOUSES (kho_con) =========================
router.get('/sub-warehouses',
    checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW),
    warehouseController.getSubWarehouses
);
router.post('/sub-warehouses',
    checkPermission(FEATURES.STOCK, PERMISSIONS.CREATE),
    warehouseController.createSubWarehouse
);
router.put('/sub-warehouses/:id',
    checkPermission(FEATURES.STOCK, PERMISSIONS.UPDATE),
    warehouseController.updateSubWarehouse
);
router.delete('/sub-warehouses/:id',
    checkPermission(FEATURES.STOCK, PERMISSIONS.DELETE),
    warehouseController.deleteSubWarehouse
);
router.get('/stock-by-subwarehouse',
    checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW),
    warehouseController.getStockBySubWarehouse
);

// ========================= STOCK TRANSFERS (chuyen_kho) =========================
router.get('/transfers',
    checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW),
    warehouseController.getTransfers
);
router.get('/transfers/:id',
    checkPermission(FEATURES.STOCK, PERMISSIONS.VIEW),
    warehouseController.getTransferById
);
router.post('/transfers',
    checkPermission(FEATURES.STOCK, PERMISSIONS.CREATE),
    warehouseController.createTransfer
);
router.put('/transfers/:id/approve',
    checkPermission(FEATURES.STOCK, PERMISSIONS.APPROVE),
    warehouseController.approveTransfer
);
router.put('/transfers/:id/cancel',
    checkPermission(FEATURES.STOCK, PERMISSIONS.UPDATE),
    warehouseController.cancelTransfer
);

// ========================= INVENTORY CHECK (kiem_ke_kho) =========================
router.get('/inventory-checks',
    checkPermission(FEATURES.INVENTORY_CHECK, PERMISSIONS.VIEW),
    warehouseController.getAllInventoryChecks
);
router.get('/inventory-checks/:id',
    checkPermission(FEATURES.INVENTORY_CHECK, PERMISSIONS.VIEW),
    warehouseController.getInventoryCheckById
);
router.post('/inventory-checks',
    checkPermission(FEATURES.INVENTORY_CHECK, PERMISSIONS.CREATE),
    warehouseController.createInventoryCheck
);
router.put('/inventory-checks/:id/complete',
    checkPermission(FEATURES.INVENTORY_CHECK, PERMISSIONS.UPDATE),
    warehouseController.completeInventoryCheck
);

export default router;
