import express from 'express';
import branchController from '../controllers/branchController.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All branch routes require authentication
router.use(authenticateToken);

// Debug log for route hit
router.use((req, res, next) => {
    console.log(`[BranchRoutes] Request: ${req.method} ${req.url}`);
    next();
});

router.get('/',
    // checkPermission(FEATURES.BRANCHES, PERMISSIONS.VIEW),
    branchController.getAllBranches
);

router.get('/:id',
    checkPermission(FEATURES.BRANCHES, PERMISSIONS.VIEW),
    branchController.getBranchById
);

router.post('/',
    checkPermission(FEATURES.BRANCHES, PERMISSIONS.CREATE),
    branchController.createBranch
);

router.put('/:id',
    checkPermission(FEATURES.BRANCHES, PERMISSIONS.UPDATE),
    branchController.updateBranch
);

router.delete('/:id',
    checkPermission(FEATURES.BRANCHES, PERMISSIONS.DELETE),
    branchController.deleteBranch
);

export default router;
