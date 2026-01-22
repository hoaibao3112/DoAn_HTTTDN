import express from 'express';
import salesController from '../controllers/salesController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import pool from '../config/connectDatabase.js';

const router = express.Router();

router.use(authenticateToken);

// ======================= 4.1 POS SESSIONS =======================
router.post('/sessions/open', checkPermission(15, 'Them'), salesController.openSession);
router.post('/sessions/close', checkPermission(15, 'Sua'), salesController.closeSession);

// ======================= 4.2 INVOICING =======================
router.post('/invoices', checkPermission(16, 'Them'), salesController.createInvoice);

// ======================= 4.2 CUSTOMER MANAGEMENT (Sales Context) =======================
router.get('/customers/search', async (req, res) => {
    const { sdt } = req.query;
    try {
        const [rows] = await pool.query('SELECT * FROM khachhang WHERE sdt = ?', [sdt]);
        res.json({ success: true, data: rows[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/customers', async (req, res) => {
    const { TenKH, SDT, Email, DiaChi } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO khachhang (tenkh, sdt, email, diachi) VALUES (?, ?, ?, ?)',
            [TenKH, SDT, Email, DiaChi]
        );
        res.json({ success: true, MaKH: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
