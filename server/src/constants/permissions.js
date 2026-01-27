/**
 * RBAC Permission System Constants
 * 
 * File này chứa tất cả constants liên quan đến hệ thống phân quyền.
 * Sử dụng constants này thay vì hardcode numbers/strings để code dễ đọc và maintain hơn.
 * 
 * @module constants/permissions
 */

/**
 * Các loại hành động (actions) trong hệ thống RBAC
 * Mapping với các cột trong bảng `phanquyen_chitiet`
 * 
 * @constant {Object} PERMISSIONS
 * @property {string} VIEW - Quyền xem/đọc dữ liệu (column: Xem)
 * @property {string} CREATE - Quyền thêm mới (column: Them)
 * @property {string} UPDATE - Quyền chỉnh sửa (column: Sua)
 * @property {string} DELETE - Quyền xóa (column: Xoa)
 * @property {string} EXPORT - Quyền xuất file Excel/PDF (column: XuatFile)
 * @property {string} APPROVE - Quyền duyệt đơn/phiếu (column: Duyet)
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
 * Danh sách tất cả actions hợp lệ
 * Dùng để validate input
 */
export const VALID_ACTIONS = Object.values(PERMISSIONS);

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
    BRANCHES: 28,                 // Quản lý chi nhánh

    // ============ BÁO CÁO (Reports) ============
    REPORTS: 23,                  // Báo cáo thống kê
    REVENUE_REPORT: 24,           // Báo cáo doanh thu
    PROFIT_REPORT: 25,            // Báo cáo lợi nhuận
    STOCK_REPORT: 26,             // Báo cáo tồn kho
    HR_REPORT: 27,                // Báo cáo nhân sự

    // ============ CATALOG (Reference Data) ============
    AUTHORS: 29,                 // Quản lý tác giả
    CATEGORIES: 30               // Quản lý thể loại
};

/**
 * Mapping tên hiển thị (tiếng Việt) sang tên action trong database
 * Sử dụng khi cần convert từ frontend
 * 
 * @constant {Object} ACTION_MAPPING
 */
export const ACTION_MAPPING = {
    'Đọc': PERMISSIONS.VIEW,
    'Xem': PERMISSIONS.VIEW,
    'Thêm': PERMISSIONS.CREATE,
    'Tạo mới': PERMISSIONS.CREATE,
    'Sửa': PERMISSIONS.UPDATE,
    'Cập nhật': PERMISSIONS.UPDATE,
    'Xóa': PERMISSIONS.DELETE,
    'Xuất file': PERMISSIONS.EXPORT,
    'Export': PERMISSIONS.EXPORT,
    'Duyệt': PERMISSIONS.APPROVE,
    'Phê duyệt': PERMISSIONS.APPROVE
};

/**
 * Mapping ngược: Feature ID -> Feature Name
 * Dùng để hiển thị tên feature trong logs/errors
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
    28: 'Quản lý chi nhánh',
    23: 'Báo cáo thống kê',
    24: 'Báo cáo doanh thu',
    25: 'Báo cáo lợi nhuận',
    26: 'Báo cáo tồn kho',
    27: 'Báo cáo nhân sự',
    28: 'Quản lý chi nhánh',
    29: 'Quản lý tác giả',
    30: 'Quản lý thể loại'
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
 * Helper function: Validate action hợp lệ
 * @param {string} action - Action cần validate
 * @returns {boolean} True nếu action hợp lệ
 */
export function isValidAction(action) {
    return VALID_ACTIONS.includes(action);
}

/**
 * Helper function: Convert action từ frontend sang database format
 * @param {string} displayName - Tên hiển thị (VD: "Đọc", "Thêm")
 * @returns {string|null} Action tương ứng hoặc null nếu không tìm thấy
 */
export function mapActionFromDisplay(displayName) {
    return ACTION_MAPPING[displayName] || null;
}
