/**
 * RBAC Permission System Constants - Frontend
 * 
 * File này chứa tất cả constants liên quan đến hệ thống phân quyền.
 * ĐỒNG BỘ với backend: server/src/constants/permissions.js
 * 
 * @module constants/permissions
 */

/**
 * Danh sách các chức năng (features) trong hệ thống
 * Mapping với bảng `chucnang` - Cột `MaCN`
 * 
 * @constant {Object} FEATURES
 */
export const FEATURES = {
    // ============ HỆ THỐNG (System Management) ============
    SYSTEM: 1,                    // Quản lý hệ thống
    USERS: 2,                     // Quản lý người dùng
    ROLES: 3,                     // Quản lý phân quyền
    AUDIT_LOGS: 4,                // Nhật ký hoạt động

    // ============ NHÂN SỰ (Human Resources) ============
    HR: 5,                        // Quản lý nhân sự
    EMPLOYEES: 6,                 // Danh sách nhân viên
    ATTENDANCE: 7,                // Chấm công
    SCHEDULE: 8,                  // Phân ca làm việc
    LEAVE: 9,                     // Xin nghỉ phép
    SALARY: 10,                   // Tính lương
    BONUS_PENALTY: 11,            // Thưởng phạt

    // ============ KHO (Warehouse) ============
    WAREHOUSE: 12,                // Quản lý kho
    PRODUCTS: 13,                 // Danh sách sản phẩm
    SUPPLIERS: 14,                // Nhà cung cấp
    PURCHASE_ORDERS: 15,          // Phiếu nhập
    STOCK: 16,                    // Tồn kho
    INVENTORY_CHECK: 17,          // Kiểm kê

    // ============ BÁN HÀNG (Sales) ============
    SALES: 18,                    // Quản lý bán hàng
    POS: 19,                      // Bán hàng (POS)
    INVOICES: 20,                 // Quản lý hóa đơn
    CUSTOMERS: 21,                // Quản lý khách hàng
    RETURNS: 22,                  // Trả hàng

    // ============ BÁO CÁO (Reports) ============
    REPORTS: 23,                  // Báo cáo thống kê
    REVENUE_REPORT: 24,           // Báo cáo doanh thu
    PROFIT_REPORT: 25,            // Báo cáo lợi nhuận
    STOCK_REPORT: 26,             // Báo cáo tồn kho
    HR_REPORT: 27,                // Báo cáo nhân sự

    // ============ KHÁC (Others) ============
    CATEGORIES: 28,               // Thể loại (Database: Thể loại)
    AUTHORS: 29,                  // Tác Giả (Database: Tác Giả)
    PROMOTIONS: 30                // Khuyến mãi (Database: Khuyến mãi)
};

/**
 * Các loại hành động (actions) trong hệ thống RBAC
 * Mapping với các cột trong bảng `phanquyen_chitiet`
 * 
 * @constant {Object} PERMISSIONS
 */
export const PERMISSIONS = {
    VIEW: 'Xem',           // Read permission
    CREATE: 'Them',        // Create permission
    UPDATE: 'Sua',         // Update permission
    DELETE: 'Xoa',         // Delete permission
    EXPORT: 'XuatFile',    // Export to Excel/PDF
    APPROVE: 'Duyet'       // Approve documents/requests
};

/**
 * Mapping tên hiển thị (tiếng Việt) cho frontend
 * Dùng để hiển thị trong UI - ĐỒNG BỘ VỚI DATABASE
 */
export const FEATURE_NAMES = {
    1: 'Quản lý hệ thống',
    2: 'Quản lý người dùng',
    3: 'Quản lý phân quyền',
    4: 'Nhật ký hoạt động',
    5: 'Quản lý nhân sự',
    6: 'Danh sách nhân viên',
    7: 'Chấm công',
    8: 'Phân ca làm việc',
    9: 'Xin nghỉ phép',
    10: 'Tính lương',
    11: 'Thưởng phạt',
    12: 'Quản lý kho',
    13: 'Danh sách sản phẩm',
    14: 'Nhà cung cấp',
    15: 'Phiếu nhập',
    16: 'Tồn kho',
    17: 'Kiểm kê',
    18: 'Quản lý bán hàng',
    19: 'Bán hàng (POS)',
    20: 'Quản lý hóa đơn',
    21: 'Quản lý khách hàng',
    22: 'Trả hàng',
    23: 'Báo cáo thống kê',
    24: 'Báo cáo doanh thu',
    25: 'Báo cáo lợi nhuận',
    26: 'Báo cáo tồn kho',
    27: 'Báo cáo nhân sự',
    28: 'Thể loại',           // Database: Thể loại
    29: 'Tác Giả',            // Database: Tác Giả  
    30: 'Khuyến mãi'          // Database: Khuyến mãi
};

/**
 * Helper function: Lấy tên feature từ ID
 * @param {number} featureId - ID của feature
 * @returns {string} Tên feature hoặc "Unknown Feature"
 */
export function getFeatureName(featureId) {
    return FEATURE_NAMES[featureId] || `Unknown Feature (${featureId})`;
}

/**
 * Action mapping cho normalize
 */
export const ACTION_MAPPING = {
    'xem': PERMISSIONS.VIEW,
    'doc': PERMISSIONS.VIEW,
    'them': PERMISSIONS.CREATE,
    'tao': PERMISSIONS.CREATE,
    'sua': PERMISSIONS.UPDATE,
    'cap_nhat': PERMISSIONS.UPDATE,
    'xoa': PERMISSIONS.DELETE,
    'xuat_file': PERMISSIONS.EXPORT,
    'xuat': PERMISSIONS.EXPORT,
    'duyet': PERMISSIONS.APPROVE,
    'phe_duyet': PERMISSIONS.APPROVE
};
