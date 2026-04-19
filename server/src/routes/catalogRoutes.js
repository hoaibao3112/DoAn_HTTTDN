import express from 'express';
import warehouseController from '../controllers/warehouseController.js';
import { authenticateToken } from '../utils/generateToken.js';

const router = express.Router();

// ======================= PUBLIC CATALOG ENDPOINTS =======================

// Authors (Tác giả)
router.get('/authors', warehouseController.getAuthors);

// Categories (Thể loại) - full CRUD
// Dùng được cả qua /api/catalog/categories lẫn /api/category (alias)
router.get('/categories', warehouseController.getCategories);
router.post('/categories', authenticateToken, warehouseController.createCategory);
router.put('/categories/:id', authenticateToken, warehouseController.updateCategory);
router.delete('/categories/:id', authenticateToken, warehouseController.deleteCategory);

// Root-level routes để tương thích với frontend gọi /api/category
router.get('/', warehouseController.getCategories);
router.post('/', authenticateToken, warehouseController.createCategory);
router.put('/:id', authenticateToken, warehouseController.updateCategory);
router.delete('/:id', authenticateToken, warehouseController.deleteCategory);

export default router;
