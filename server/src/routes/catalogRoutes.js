import express from 'express';
import warehouseController from '../controllers/warehouseController.js';

const router = express.Router();

// ======================= PUBLIC CATALOG ENDPOINTS =======================

// Authors (Tác giả)
router.get('/authors', warehouseController.getAuthors);

// Categories (Thể loại) - full CRUD
// Dùng được cả qua /api/catalog/categories lẫn /api/category (alias)
router.get('/categories', warehouseController.getCategories);
router.post('/categories', warehouseController.createCategory);
router.put('/categories/:id', warehouseController.updateCategory);
router.delete('/categories/:id', warehouseController.deleteCategory);

// Root-level routes để tương thích với frontend gọi /api/category
router.get('/', warehouseController.getCategories);
router.post('/', warehouseController.createCategory);
router.put('/:id', warehouseController.updateCategory);
router.delete('/:id', warehouseController.deleteCategory);

export default router;
