import express from 'express';
import customerController from '../controllers/customerController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All customer routes require authentication
router.use(authenticateToken);

router.get('/',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.VIEW),
    customerController.getAllCustomers
);

router.get('/:id',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.VIEW),
    customerController.getCustomerById
);

router.post('/',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.CREATE),
    customerController.createCustomer
);

router.put('/:id',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.UPDATE),
    customerController.updateCustomer
);

router.delete('/:id',
    checkPermission(FEATURES.CUSTOMERS, PERMISSIONS.DELETE),
    customerController.deleteCustomer
);

export default router;
