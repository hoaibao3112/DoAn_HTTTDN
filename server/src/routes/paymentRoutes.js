import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { authenticateToken } from '../utils/generateToken.js';

const router = express.Router();

// All payment routes require authentication (for staff/POS)
router.use(authenticateToken);

// VNPay
router.post('/vnpay/create', paymentController.createVNPayUrl);

// MoMo
router.post('/momo/create', paymentController.createMoMoPayment);

// ZaloPay
router.post('/zalopay/create', paymentController.createZaloPayPayment);

export default router;
