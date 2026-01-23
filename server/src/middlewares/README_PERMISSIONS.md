# RBAC Permission System - Documentation

## Tổng quan

Hệ thống phân quyền dựa trên vai trò (RBAC - Role-Based Access Control) cho phép quản lý quyền truy cập chi tiết đến các chức năng của hệ thống.

### Kiến trúc

```
┌─────────────────┐
│   User/Account  │
│   (taikhoan)    │
└────────┬────────┘
         │ MaNQ
         ▼
┌─────────────────┐
│   Role/Group    │
│  (nhomquyen)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Permission Details     │
│  (phanquyen_chitiet)    │
│  ┌───────────────────┐  │
│  │ Xem     (View)    │  │
│  │ Them    (Create)  │  │
│  │ Sua     (Update)  │  │
│  │ Xoa     (Delete)  │  │
│  │ XuatFile(Export)  │  │
│  │ Duyet   (Approve) │  │
│  └───────────────────┘  │
└────────┬────────────────┘
         │ MaCN
         ▼
┌─────────────────┐
│    Features     │
│   (chucnang)    │
└─────────────────┘
```

## Cách sử dụng

### 1. Import Constants

```javascript
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
```

### 2. Áp dụng middleware trong routes

```javascript
// Xem danh sách nhân viên
router.get('/employees', 
  authenticateToken,  // Bắt buộc: Kiểm tra đăng nhập
  checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.VIEW),  // Kiểm tra quyền
  hrController.getAllEmployees
);

// Thêm nhân viên mới
router.post('/employees', 
  authenticateToken,
  checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.CREATE),
  hrController.createEmployee
);

// Cập nhật nhân viên
router.put('/employees/:id', 
  authenticateToken,
  checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.UPDATE),
  hrController.updateEmployee
);

// Xóa nhân viên
router.delete('/employees/:id', 
  authenticateToken,
  checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.DELETE),
  hrController.deleteEmployee
);

// Duyệt đơn nghỉ phép
router.put('/leave/:id/approve', 
  authenticateToken,
  checkPermission(FEATURES.LEAVE, PERMISSIONS.APPROVE),
  hrController.approveLeave
);
```

### 3. Sử dụng Helper Functions

```javascript
import { 
  getUserPermissions, 
  hasPermission,
  getMenuByRole 
} from '../utils/permissionHelpers.js';

// Lấy tất cả quyền của user
const permissions = await getUserPermissions(userRoleId);

// Kiểm tra quyền cụ thể
const canEdit = await hasPermission(userRoleId, FEATURES.EMPLOYEES, PERMISSIONS.UPDATE);
if (canEdit) {
  // Cho phép chỉnh sửa
}

// Lấy menu theo quyền
const menu = await getMenuByRole(userRoleId);
// menu là cấu trúc tree với parent-children
```

## Danh sách Features

| ID | Constant | Tên chức năng |
|----|----------|---------------|
| 1 | `FEATURES.SYSTEM` | Quản lý hệ thống |
| 2 | `FEATURES.USERS` | Quản lý người dùng |
| 3 | `FEATURES.ROLES` | Quản lý phân quyền |
| 4 | `FEATURES.AUDIT_LOGS` | Nhật ký hoạt động |
| 5 | `FEATURES.HR` | Quản lý nhân sự |
| 6 | `FEATURES.EMPLOYEES` | Danh sách nhân viên |
| 7 | `FEATURES.ATTENDANCE` | Chấm công |
| 8 | `FEATURES.SCHEDULE` | Phân ca làm việc |
| 9 | `FEATURES.LEAVE` | Xin nghỉ phép |
| 10 | `FEATURES.SALARY` | Tính lương |
| 11 | `FEATURES.BONUS_PENALTY` | Thưởng phạt |
| 12 | `FEATURES.WAREHOUSE` | Quản lý kho |
| 13 | `FEATURES.PRODUCTS` | Danh sách sản phẩm |
| 14 | `FEATURES.SUPPLIERS` | Nhà cung cấp |
| 15 | `FEATURES.PURCHASE_ORDERS` | Phiếu nhập |
| 16 | `FEATURES.STOCK` | Tồn kho |
| 17 | `FEATURES.INVENTORY_CHECK` | Kiểm kê |
| 18 | `FEATURES.SALES` | Quản lý bán hàng |
| 19 | `FEATURES.POS` | Bán hàng (POS) |
| 20 | `FEATURES.INVOICES` | Quản lý hóa đơn |
| 21 | `FEATURES.CUSTOMERS` | Quản lý khách hàng |
| 22 | `FEATURES.RETURNS` | Trả hàng |
| 23 | `FEATURES.REPORTS` | Báo cáo thống kê |
| 24 | `FEATURES.REVENUE_REPORT` | Báo cáo doanh thu |
| 25 | `FEATURES.PROFIT_REPORT` | Báo cáo lợi nhuận |
| 26 | `FEATURES.STOCK_REPORT` | Báo cáo tồn kho |
| 27 | `FEATURES.HR_REPORT` | Báo cáo nhân sự |

## Danh sách Permissions

| Constant | Database Column | Mô tả |
|----------|----------------|-------|
| `PERMISSIONS.VIEW` | `Xem` | Quyền xem/đọc dữ liệu |
| `PERMISSIONS.CREATE` | `Them` | Quyền thêm mới |
| `PERMISSIONS.UPDATE` | `Sua` | Quyền chỉnh sửa |
| `PERMISSIONS.DELETE` | `Xoa` | Quyền xóa |
| `PERMISSIONS.EXPORT` | `XuatFile` | Quyền xuất Excel/PDF |
| `PERMISSIONS.APPROVE` | `Duyet` | Quyền duyệt đơn/phiếu |

## Error Handling

Middleware sẽ trả về các HTTP status codes:

- **401 Unauthorized**: User chưa đăng nhập
- **403 Forbidden**: User không có quyền
- **500 Internal Server Error**: Lỗi hệ thống

### Response format khi không có quyền:

```json
{
  "success": false,
  "message": "Bạn không có quyền \"Them\" cho chức năng \"Danh sách nhân viên\"",
  "details": {
    "user": "admin",
    "role": 1,
    "feature": "Danh sách nhân viên",
    "featureId": 6,
    "action": "Them",
    "issue": "PERMISSION_DENIED"
  }
}
```

## Best Practices

### ✅ DO:

```javascript
// Sử dụng constants
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';
router.get('/data', checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.VIEW), controller.getData);

// Sử dụng helper functions
const permissions = await getUserPermissions(roleId);

// Luôn check authenticateToken trước
router.get('/api', authenticateToken, checkPermission(...), controller.method);
```

### ❌ DON'T:

```javascript
// KHÔNG dùng magic numbers
router.get('/data', checkPermission(6, 'Xem'), controller.getData);

// KHÔNG hardcode strings
router.get('/data', checkPermission(FEATURES.EMPLOYEES, 'Xem'), controller.getData);

// KHÔNG skip authenticateToken
router.get('/api', checkPermission(...), controller.method);  // BAD!
```

## Thêm Feature mới

### 1. Thêm vào database

```sql
INSERT INTO chucnang (TenCN, MaCha, URL, Icon, ThuTu, TinhTrang) 
VALUES ('Tên chức năng mới', NULL, '/path/to/feature', 'icon-name', 10, 1);
```

### 2. Cập nhật constants

```javascript
// Trong constants/permissions.js
export const FEATURES = {
  // ... existing features
  NEW_FEATURE: 28,  // ID từ database
};

export const FEATURE_NAMES = {
  // ... existing names
  28: 'Tên chức năng mới',
};
```

### 3. Sử dụng trong routes

```javascript
router.get('/new-feature', 
  authenticateToken,
  checkPermission(FEATURES.NEW_FEATURE, PERMISSIONS.VIEW),
  controller.getNewFeature
);
```

## Logging & Debugging

Bật logging để debug permissions:

```bash
# Trong .env
LOG_PERMISSIONS=true
```

Khi bật, console sẽ hiển thị:

```
✅ Permission granted: User admin (Role 1) - Xem on Feature 6
```

## Troubleshooting

### Lỗi: "Invalid action"

**Nguyên nhân**: Dùng sai tên action

**Giải pháp**: Dùng `PERMISSIONS` constants thay vì hardcode string

```javascript
// ❌ SAI
checkPermission(FEATURES.EMPLOYEES, 'View')

// ✅ ĐÚNG
checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.VIEW)
```

### Lỗi: "Invalid featureId"

**Nguyên nhân**: Dùng sai feature ID hoặc dùng string thay vì number

**Giải pháp**: Dùng `FEATURES` constants

```javascript
// ❌ SAI
checkPermission('EMPLOYEES', PERMISSIONS.VIEW)

// ✅ ĐÚNG
checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.VIEW)
```

### Lỗi 403: "Permission denied"

**Nguyên nhân**: User thực sự không có quyền

** Giải pháp**:
1. Kiểm tra role của user trong database
2. Kiểm tra `phanquyen_chitiet` có record cho role + feature đó không
3. Kiểm tra cột action (Xem, Them, Sua, Xoa...) có giá trị = 1 không

```sql
-- Kiểm tra quyền của user
SELECT 
  nq.TenNQ,
  cn.TenCN,
  pq.*
FROM taikhoan tk
JOIN nhomquyen nq ON tk.MaNQ = nq.MaNQ
JOIN phanquyen_chitiet pq ON nq.MaNQ = pq.MaNQ
JOIN chucnang cn ON pq.MaCN = cn.MaCN
WHERE tk.MaTK = ?;
```

## Security Notes

1. **Luôn validate input**: Middleware chỉ kiểm tra quyền, không validate input data
2. **Defense in depth**: Sử dụng cả `authenticateToken` và `checkPermission`
3. **Least privilege**: Chỉ gán quyền tối thiểu cần thiết cho mỗi role
4. **Audit logging**: Tất cả thay đổi quan trọng nên được log vào `nhat_ky_hoat_dong`

## Performance Tips

1. **Cache permissions**: Có thể cache permissions của user sau khi login
2. **Batch queries**: Helper functions đã optimize queries
3. **Index database**: Đảm bảo có index trên `MaNQ`, `MaCN` trong `phanquyen_chitiet`

## Migration từ code cũ

Nếu bạn có code cũ sử dụng magic numbers:

```javascript
// Cũ
router.get('/employees', checkPermission(6, 'Xem'), controller.get);

// Mới  
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';
router.get('/employees', checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.VIEW), controller.get);
```

## Support

Nếu gặp vấn đề, kiểm tra:

1. File [`constants/permissions.js`](file:///d:/CNPM_WebSach/server/src/constants/permissions.js) - Constants definitions
2. File [`middlewares/rbacMiddleware.js`](file:///d:/CNPM_WebSach/server/src/middlewares/rbacMiddleware.js) - Middleware logic
3. File [`utils/permissionHelpers.js`](file:///d:/CNPM_WebSach/server/src/utils/permissionHelpers.js) - Helper functions
