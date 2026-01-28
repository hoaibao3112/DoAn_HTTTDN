/**
 * RBAC Middleware - Role-Based Access Control
 * 
 * Middleware này kiểm tra quyền truy cập dựa trên:
 * - Nhóm quyền (MaNQ) của user
 * - Chức năng (MaCN) đang truy cập
 * - Hành động (action) muốn thực hiện
 * 
 * @module middlewares/rbacMiddleware
 */

import pool from '../config/connectDatabase.js';
import { VALID_ACTIONS, getFeatureName } from '../constants/permissions.js';

/**
 * Middleware kiểm tra quyền truy cập RBAC
 * 
 * User phải đã được authenticate (có req.user) trước khi gọi middleware này.
 * Middleware sẽ kiểm tra xem user có quyền thực hiện action trên feature không.
 * 
 * @param {number} featureId - ID chức năng từ bảng `chucnang` (MaCN)
 * @param {string} action - Hành động: 'Xem', 'Them', 'Sua', 'Xoa', 'XuatFile', 'Duyet'
 * @returns {Function} Express middleware function
 * 
 * @throws {Error} Nếu action không hợp lệ
 * 
 * @example
 * // Import constants
 * import { FEATURES, PERMISSIONS } from '../constants/permissions.js';
 * 
 * // Sử dụng trong routes
 * router.get('/employees', 
 *   authenticateToken,
 *   checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.VIEW),
 *   hrController.getAllEmployees
 * );
 * 
 * router.post('/employees',
 *   authenticateToken, 
 *   checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.CREATE),
 *   hrController.createEmployee
 * );
 */
export const checkPermission = (featureId, action) => {
    // ========== VALIDATION TẠI THỜI ĐIỂM ĐỊNH NGHĨA ROUTE ==========
    // Validate ngay khi route được định nghĩa (không phải lúc runtime)

    if (!featureId || typeof featureId !== 'number') {
        throw new Error(
            `Invalid featureId: ${featureId}. Must be a number from FEATURES constants.`
        );
    }

    if (!VALID_ACTIONS.includes(action)) {
        throw new Error(
            `Invalid action: "${action}". Must be one of: ${VALID_ACTIONS.join(', ')}`
        );
    }

    // ========== TRẢ VỀ MIDDLEWARE FUNCTION ==========
    return async (req, res, next) => {
        try {
            // Kiểm tra user đã được authenticate chưa
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
                    requireAuth: true
                });
            }

            const { MaNQ, MaTK, TenDangNhap } = req.user;

            // Kiểm tra user có nhóm quyền chưa
            if (!MaNQ) {
                return res.status(403).json({
                    success: false,
                    message: 'Tài khoản chưa được gán nhóm quyền. Vui lòng liên hệ quản trị viên.',
                    details: {
                        user: TenDangNhap || MaTK,
                        issue: 'NO_ROLE_ASSIGNED'
                    }
                });
            }

            // ========== KIỂM TRA QUYỀN TRONG DATABASE ==========
            const query = `
        SELECT ${action} AS hasPermission 
        FROM phanquyen_chitiet 
        WHERE MaNQ = ? AND MaCN = ?
      `;

            const [rows] = await pool.query(query, [MaNQ, featureId]);
            const hasPermission = rows.length > 0 && rows[0].hasPermission === 1;

            if (!hasPermission) {
                // User không có quyền
                const featureName = getFeatureName(featureId);

                return res.status(403).json({
                    success: false,
                    message: `Bạn không có quyền "${action}" cho chức năng "${featureName}"`,
                    details: {
                        user: TenDangNhap || MaTK,
                        role: MaNQ,
                        feature: featureName,
                        featureId: featureId,
                        action: action,
                        issue: 'PERMISSION_DENIED'
                    }
                });
            }

            // ========== CÓ QUYỀN - CHO PHÉP TIẾP TỤC ==========
            // Log để audit (optional - có thể bật/tắt)
            if (process.env.LOG_PERMISSIONS === 'true') {
                console.log(`✅ Permission granted: User ${TenDangNhap} (Role ${MaNQ}) - ${action} on Feature ${featureId}`);
            }

            next();

        } catch (error) {
            // Xử lý lỗi hệ thống
            console.error('❌ Permission check error:', {
                featureId,
                action,
                error: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                success: false,
                message: 'Lỗi hệ thống khi kiểm tra quyền truy cập',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

