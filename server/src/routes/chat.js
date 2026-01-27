import express from 'express';
import chatController from '../controllers/chatController.js';
import { authenticateToken } from '../utils/generateToken.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/admin/unread-count', chatController.getUnreadCount);
router.get('/admin/unread-rooms', chatController.getUnreadRooms);

export default router;
