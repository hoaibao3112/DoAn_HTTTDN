import express from 'express';
import warehouseController from '../controllers/warehouseController.js';

const router = express.Router();

// ======================= PUBLIC CATALOG ENDPOINTS (No Auth Required) =======================
// These are read-only reference data for dropdowns and product browsing

// Authors (Tác giả)
router.get('/authors', warehouseController.getAuthors);

// Categories (Thể loại)
router.get('/categories', warehouseController.getCategories);

// Publishers (Nhà xuất bản) - if you have this endpoint
// router.get('/publishers', warehouseController.getPublishers);

export default router;
