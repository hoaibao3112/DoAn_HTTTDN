import express from 'express';
import salesController from '../controllers/salesController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import pool from '../config/connectDatabase.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

router.use(authenticateToken);

// ======================= 4.1 POS SESSIONS =======================
router.post('/sessions/open', checkPermission(FEATURES.POS, PERMISSIONS.CREATE), salesController.openSession);
router.post('/sessions/close', checkPermission(FEATURES.POS, PERMISSIONS.UPDATE), salesController.closeSession);

// ======================= 4.2 INVOICING =======================
router.post('/invoices', checkPermission(FEATURES.INVOICES, PERMISSIONS.CREATE), salesController.createInvoice);

// ======================= 4.2 CUSTOMER MANAGEMENT (Sales Context) =======================
router.get('/customers/search', checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.VIEW), async (req, res) => {
    const { sdt } = req.query;
    try {
        const [rows] = await pool.query('SELECT * FROM khachhang WHERE sdt = ?', [sdt]);
        res.json({ success: true, data: rows[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/customers', checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.CREATE), async (req, res) => {
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

// ======================= 4.4 INVOICE MANAGEMENT =======================
router.get('/hoadon', checkPermission(FEATURES.INVOICES, PERMISSIONS.VIEW), salesController.getAllInvoices);
router.get('/hoadon/:id', checkPermission(FEATURES.INVOICES, PERMISSIONS.VIEW), salesController.getInvoiceById);
router.put('/hoadon/:id/trangthai', checkPermission(FEATURES.INVOICES, PERMISSIONS.UPDATE), salesController.updateInvoiceStatus);
router.put('/hoadon/:id/huy', checkPermission(FEATURES.INVOICES, PERMISSIONS.UPDATE), salesController.cancelInvoice);

export default router;
