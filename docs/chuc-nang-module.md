# BÁO CÁO ĐẶC TẢ CHỨC NĂNG HỆ THỐNG

## THÔNG TIN TÀI LIỆU

| Thuộc tính | Nội dung |
|-----------|----------|
| **Tên đề tài** | Hệ thống quản lý nhà sách |
| **Loại tài liệu** | Đặc tả chức năng hệ thống (System Functional Specification) |
| **Phiên bản** | 1.0 |
| **Ngày ban hành** | 09 tháng 3 năm 2026 |
| **Người thực hiện** | Nhóm phát triển |
| **Trạng thái** | Đã phê duyệt |

---

## LỜI MỞ ĐẦU

Tài liệu này được biên soạn nhằm mục đích mô tả chi tiết toàn bộ các chức năng nghiệp vụ của hệ thống quản lý nhà sách. Tài liệu bao gồm 28 module chức năng chính với hơn 200 chức năng cụ thể, được phân loại theo các nhóm nghiệp vụ: quản lý hệ thống, quản lý nhân sự, quản lý kho hàng, quản lý bán hàng, quản lý khách hàng và báo cáo thống kê.

Mỗi module được trình bày theo cấu trúc chuẩn, bao gồm: mô tả mục đích, đường dẫn API, các chức năng CRUD (Create - Read - Update - Delete), các chức năng nghiệp vụ đặc thù, và yêu cầu phân quyền truy cập. Tài liệu này là cơ sở quan trọng cho việc phát triển, kiểm thử và bảo trì hệ thống.

---

## 📋 MỤC LỤC

1. [Quản lý Tài khoản](#1-quản-lý-tài-khoản)
2. [Quản lý Vai trò](#2-quản-lý-vai-trò)
3. [Quản lý Quyền](#3-quản-lý-quyền)
4. [Quản lý Nhân viên](#4-quản-lý-nhân-viên)
5. [Quản lý Chấm công](#5-quản-lý-chấm-công)
6. [Quản lý Nghỉ phép](#6-quản-lý-nghỉ-phép)
7. [Quản lý Lương](#7-quản-lý-lương)
8. [Quản lý Ngày lễ](#8-quản-lý-ngày-lễ)
9. [Quản lý Sản phẩm](#9-quản-lý-sản-phẩm)
10. [Quản lý Tác giả](#10-quản-lý-tác-giả)
11. [Quản lý Thể loại](#11-quản-lý-thể-loại)
12. [Quản lý Kho con](#12-quản-lý-kho-con)
13. [Quản lý Nhập hàng](#13-quản-lý-nhập-hàng)
14. [Quản lý Tồn kho](#14-quản-lý-tồn-kho)
15. [Quản lý Chuyển kho](#15-quản-lý-chuyển-kho)
16. [Quản lý Kiểm kê](#16-quản-lý-kiểm-kê)
17. [Quản lý Nhà cung cấp](#17-quản-lý-nhà-cung-cấp)
18. [Quản lý Công nợ NCC](#18-quản-lý-công-nợ-ncc)
19. [Quản lý Khách hàng](#19-quản-lý-khách-hàng)
20. [Quản lý Hóa đơn](#20-quản-lý-hóa-đơn)
21. [Quản lý Trả hàng](#21-quản-lý-trả-hàng)
22. [Quản lý Khuyến mãi](#22-quản-lý-khuyến-mãi)
23. [Quản lý Voucher](#23-quản-lý-voucher)
24. [Quản lý Loyalty](#24-quản-lý-loyalty)
25. [Quản lý Chi phí](#25-quản-lý-chi-phí)
26. [Quản lý Chi nhánh](#26-quản-lý-chi-nhánh)
27. [Quản lý Ca làm việc](#27-quản-lý-ca-làm-việc)
28. [Báo cáo & Thống kê](#28-báo-cáo--thống-kê)

---

## PHẦN I: CÁC MODULE QUẢN LÝ HỆ THỐNG

### 1. MODULE QUẢN LÝ TÀI KHOẢN

**Mô tả:** Module này thực hiện các nghiệp vụ liên quan đến quản lý tài khoản người dùng trong hệ thống, bao gồm việc tạo mới, cập nhật thông tin và quản lý mật khẩu.

**a) Xem danh sách tài khoản (READ)**
- Phương thức: GET `/api/accounts`
- Mô tả: Truy xuất danh sách toàn bộ tài khoản người dùng trong hệ thống
- Phân quyền: Yêu cầu quyền VIEW
- Dữ liệu trả về: Danh sách tài khoản bao gồm thông tin cơ bản

**b) Thêm tài khoản mới (CREATE)**
- Phương thức: POST `/api/accounts`
- Mô tả: Tạo mới một tài khoản người dùng
- Dữ liệu đầu vào: Tên đăng nhập, mật khẩu, vai trò, email, số điện thoại
- Phân quyền: Yêu cầu quyền CREATE
- Ràng buộc: Tên đăng nhập không được trùng lặp

**c) Cập nhật tài khoản (UPDATE)**
- Phương thức: PUT `/api/accounts/:id`
- Mô tả: Cập nhật thông tin tài khoản đã tồn tại
- Dữ liệu có thể cập nhật: Email, số điện thoại, vai trò, trạng thái
- Phân quyền: Yêu cầu quyền UPDATE

**d) Đổi mật khẩu cá nhân**
- Phương thức: PUT `/api/accounts/change-password`
- Mô tả: Người dùng tự thay đổi mật khẩu của mình
- Yêu cầu: Xác thực mật khẩu cũ

**e) Đặt lại mật khẩu**
- Phương thức: PUT `/api/accounts/:id/reset-password`
- Mô tả: Quản trị viên đặt lại mật khẩu cho người dùng khác
- Phân quyền: Yêu cầu quyền UPDATE

**Lưu ý:** Chức năng xóa tài khoản không được triển khai nhằm đảm bảo tính toàn vẹn dữ liệu và phục vụ mục đích kiểm toán (audit trail).
✅ **Reset mật khẩu**
- PUT `/api/accounts/:id/reset-password`
- Admin reset password cho user khác
- Phân quyền: UPDATE
# 2. MODULE QUẢN LÝ VAI TRÒ

**Mô tả:** Module này quản lý các vai trò (role) trong hệ thống, xác định phân cấp quyền hạn và trách nhiệm của từng nhóm người dùng.

**Đường dẫn API:** `/api/roles`

**a) Xem danh sách vai trò (READ)**
- Phương thức: GET `/api/roles`
- Mô tả: Truy xuất toàn bộ danh sách vai trò trong hệ thống
- Phân quyền: Yêu cầu quyền VIEW

**b) Xem thông tin chi tiết vai trò (READ)**
- Phương thức: GET `/api/roles/:id`
- Mô tả: Lấy thông tin chi tiết của một vai trò cụ thể
- Tham số: Mã định danh vai trò

**c) Xem danh sách quyền của vai trò**
- Phương thức: GET `/api/roles/:id/permissions`
- Mô tả: Truy xuất tập hợp các quyền được gán cho một vai trò
- Phân quyền: Yêu cầu quyền VIEW

**d) Xem danh sách vai trò đang hoạt động**
- Phương thức: GET `/api/roles/list/active`
- Mô tả: Lọc các vai trò có trạng thái hoạt động

**e) Thêm mới hoặc cập nhật vai trò (CREATE/UPDATE)**
- Phương thức: POST `/api/roles/save`
- Mô tả: Tạo mới hoặc cập nhật thông tin vai trò
- Phân quyền: Yêu cầu quyền UPDATE
- Logic: Nếu ID tồn tại thì cập nhật, ngược lại tạo mới

**f) Xóa vai trò (DELETE)**
- Phương thức: DELETE `/api/roles/:id`
- Mô tả: Loại bỏ vai trò khỏi hệ thống
- Phân quyền: Yêu cầu quyền DELETE
- Ràng buộc: Không được xóa vai trò đang được sử dụng
✅ **Thêm/Sửa vai trò** (CREATE/UPDATE)
- POST `/api/roles/save`
- Tạo mới hoặc cập nhật role
- Phân quyền: UPDATE

✅ # 3. MODULE QUẢN LÝ QUYỀN

**Mô tả:** Module này quản lý các quyền hạn (permission) và thực hiện phân quyền cho các vai trò trong hệ thống.

**Đường dẫn API:** `/api/permissions`

**Mục đích:** Kiểm soát chi tiết quyền truy cập vào từng chức năng của hệ thống, đảm bảo an ninh và bảo mật thông tin.

#### 3.1. Các chức năng chính
---

## 3. QUẢN LÝ QUYỀN

**Endpoint**: `/api/permissions`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/permissions`
- Lấy tất cả permissions

✅ **Xem features**
- GET `/api/permissions/features`
- Lấy danh sách các features/modules

✅ **Xem quyền theo vai trò**
- GET `/api/permissions/roles/:id`
- Lấy permissions của một role cụ thể

✅ **Thêm quyền** (CREATE)
- POST `/api/permissions`
- Gán permission cho role

✅ **Sửa quyền** (UPDATE)
- PUT `/api/permissions/:id`
- Cập nhật permission

✅ **Xóa quyền** (DELETE)
- DELETE `/api/permissions/:id`
- Xóa permission khỏi role

---

## 4. QUẢN LÝ NHÂN VIÊN

**Endpoint**: `/api/hr/employees`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/hr/employees`
- Lấy tất cả nhân viên
- Phân quyền: VIEW

✅ **Thêm nhân viên** (CREATE)
- POST `/api/hr/employees`
- Tạo nhân viên mới với đầy đủ thông tin
- Phân quyền: CREATE

✅ **Sửa nhân viên** (UPDATE)
- PUT `/api/hr/employees/:id`
- Cập nhật thông tin nhân viên
- Phân quyền: UPDATE

✅ **Xóa nhân viên** (DELETE)
- DELETE `/api/hr/employees/:id`
- Xóa nhân viên
- Phân quyền: DELETE

✅ **Thay đổi chức vụ**
- POST `/api/hr/change-position`
- Chuyển chức vụ/vị trí của nhân viên
- Phân quyền: UPDATE

✅ **Thống kê nhân viên**
- GET `/api/hr/reports/employees/stats`
- Báo cáo thống kê nhân viên theo phòng ban, vị trí

---

## 5. QUẢN LÝ CHẤM CÔNG

**Endpoint**: `/api/hr/attendance`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/hr/attendance`
- Xem tất cả bản ghi chấm công
- Phân quyền: VIEW

✅ **Thêm bản ghi chấm công** (CREATE)
- POST `/api/hr/attendance`
- Tạo bản ghi chấm công (admin)
- Phân quyền: CREATE

✅ **Sửa bản ghi chấm công** (UPDATE)
- PUT `/api/hr/attendance/:id`
- Cập nhật bản ghi chấm công
- Phân quyền: UPDATE

✅ **Xóa bản ghi chấm công** (DELETE)
- DELETE `/api/hr/attendance/:id`
- Xóa bản ghi chấm công
- Phân quyền: DELETE

✅ **Check-in** (Nhân viên)
- POST `/api/hr/checkin`
- Nhân viên điểm danh vào ca

✅ **Check-out** (Nhân viên)
- POST `/api/hr/checkout`
- Nhân viên điểm danh ra ca

✅ **Xem chấm công của tôi**
- GET `/api/hr/my-attendance`
- Nhân viên xem chấm công của mình

✅ **Xem tổng hợp chấm công**
- GET `/api/hr/attendance/summary`
- Báo cáo tổng hợp theo tháng

✅ **Xem chấm công theo tháng**
- GET `/api/hr/attendance/monthly`
- Danh sách chấm công theo tháng/năm

✅ **Xem lịch sử chấm công nhân viên**
- GET `/api/hr/attendance/:MaCC/history`
- Lịch sử chấm công của một nhân viên

✅ **Báo cáo chấm công bất thường**
- GET `/api/hr/attendance/report/abnormal`
- Danh sách chấm công muộn, thiếu giờ

✅ **Đánh dấu vắng mặt**
- POST `/api/hr/attendance/mark-absent`
- Đánh dấu nhân viên vắng mặt

---

## 6. QUẢN LÝ NGHỈ PHÉP

**Endpoint**: `/api/hr/leave-requests`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/hr/leave-requests`
- Xem tất cả đơn nghỉ phép (admin)
- Phân quyền: VIEW

✅ **Xin nghỉ phép** (CREATE)
- POST `/api/hr/xin-nghi-phep`
- Nhân viên tạo đơn xin nghỉ phép

✅ **Xem đơn nghỉ của tôi** (READ)
- GET `/api/hr/my-leave`
- Nhân viên xem đơn nghỉ của mình

✅ **Duyệt đơn nghỉ** (UPDATE)
- PUT `/api/hr/leave-requests/:id/approve`
- Admin duyệt/từ chối đơn nghỉ phép
- Phân quyền: APPROVE

❌ **Không có XÓA** (lý do audit)

---

## 7. QUẢN LÝ LƯƠNG

**Endpoint**: `/api/hr/salary` hoặc `/api/salary`

### Chức năng:

✅ **Xem lương của tôi** (READ)
- GET `/api/hr/my-salary`
- Nhân viên xem lương hiện tại

✅ **Xem lịch sử lương của tôi** (READ)
- GET `/api/hr/my-salary-history`
- Nhân viên xem lịch sử lương các tháng

✅ **Xem lương theo tháng** (READ)
- GET `/api/salary/monthly/:year`
- Admin xem lương tất cả NV theo năm
- Phân quyền: VIEW

✅ **Xem lương chi tiết tháng** (READ)
- GET `/api/salary/per-month/:year/:month`
- Chi tiết lương từng nhân viên theo tháng
- Phân quyền: VIEW

✅ **Tính lương** (CREATE/UPDATE)
- POST `/api/salary/compute/:year/:month`
- Tính toán lương cho tháng
- Phân quyền: CREATE

✅ **Xem chi tiết lương nhân viên**
- GET `/api/salary/salary-detail`
- Chi tiết lương của một nhân viên

✅ **Thanh toán lương** (UPDATE)
- PUT `/api/salary/salary-pay`
- Đánh dấu đã thanh toán lương cho một NV
- Phân quyền: UPDATE

✅ **Thanh toán lương hàng loạt** (UPDATE)
- PUT `/api/salary/salary-pay-all`
- Thanh toán lương cho tất cả NV
- Phân quyền: UPDATE

✅ **In phiếu lương tháng**
- GET `/api/hr/my-salary/print/monthly`
- Nhân viên in phiếu lương tháng

✅ **In phiếu lương năm**
- GET `/api/hr/my-salary/print/yearly`
- Nhân viên in phiếu lương năm

✅ **Báo cáo lương**
- GET `/api/hr/reports/salary`
- Báo cáo tổng hợp lương

✅ **Báo cáo thưởng**
- GET `/api/hr/reports/bonus`
- Báo cáo thưởng các nhân viên

---

## 8. QUẢN LÝ NGÀY LỄ

**Endpoint**: `/api/hr/holidays`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/hr/holidays`
- Lấy tất cả ngày lễ
- Phân quyền: VIEW

✅ **Thêm ngày lễ** (CREATE)
- POST `/api/hr/holidays`
- Tạo ngày lễ mới
- Phân quyền: CREATE

✅ **Sửa ngày lễ** (UPDATE)
- PUT `/api/hr/holidays/:id`
- Cập nhật ngày lễ
- Phân quyền: UPDATE

✅ **Xóa ngày lễ** (DELETE)
- DELETE `/api/hr/holidays/:id`
- Xóa ngày lễ
- Phân quyền: DELETE

---

## 9. QUẢN LÝ SẢN PHẨM

**Endpoint**: `/api/warehouse/products` hoặc `/api/products`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/warehouse/products`
- Lấy tất cả sản phẩm

✅ **Xem chi tiết** (READ)
- GET `/api/warehouse/products/:id`
- Lấy thông tin chi tiết một sản phẩm
- Phân quyền: VIEW

✅ **Thêm sản phẩm** (CREATE)
- POST `/api/warehouse/products`
- Tạo sản phẩm mới với đầy đủ thông tin
- Phân quyền: CREATE

✅ **Sửa sản phẩm** (UPDATE)
- PUT `/api/warehouse/products/:id`
- Cập nhật thông tin sản phẩm
- Phân quyền: UPDATE

✅ **Xóa sản phẩm** (DELETE)
- DELETE `/api/warehouse/products/:id`
- Xóa sản phẩm
- Phân quyền: DELETE

---

## 10. QUẢN LÝ TÁC GIẢ

**Endpoint**: `/api/warehouse/authors` hoặc `/api/catalog/authors`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/warehouse/authors`
- Lấy tất cả tác giả

✅ **Thêm tác giả** (CREATE)
- POST `/api/warehouse/authors`
- Tạo tác giả mới
- Phân quyền: CREATE

✅ **Sửa tác giả** (UPDATE)
- PUT `/api/warehouse/authors/:id`
- Cập nhật thông tin tác giả
- Phân quyền: UPDATE

✅ **Xóa tác giả** (DELETE)
- DELETE `/api/warehouse/authors/:id`
- Xóa tác giả
- Phân quyền: DELETE

---

## 11. QUẢN LÝ THỂ LOẠI

**Endpoint**: `/api/warehouse/categories` hoặc `/api/catalog/categories` hoặc `/api/category`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/warehouse/categories`
- Lấy tất cả thể loại

✅ **Thêm thể loại** (CREATE)
- POST `/api/warehouse/categories`
- Tạo thể loại mới
- Phân quyền: CREATE

✅ **Sửa thể loại** (UPDATE)
- PUT `/api/warehouse/categories/:id`
- Cập nhật thể loại
- Phân quyền: UPDATE

✅ **Xóa thể loại** (DELETE)
- DELETE `/api/warehouse/categories/:id`
- Xóa thể loại
- Phân quyền: DELETE

---

## 12. QUẢN LÝ KHO CON

**Endpoint**: `/api/warehouse/sub-warehouses`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/warehouse/sub-warehouses`
- Lấy tất cả kho con
- Phân quyền: VIEW

✅ **Thêm kho con** (CREATE)
- POST `/api/warehouse/sub-warehouses`
- Tạo kho con mới
- Phân quyền: CREATE

✅ **Sửa kho con** (UPDATE)
- PUT `/api/warehouse/sub-warehouses/:id`
- Cập nhật thông tin kho con
- Phân quyền: UPDATE

✅ **Xóa kho con** (DELETE)
- DELETE `/api/warehouse/sub-warehouses/:id`
- Xóa kho con
- Phân quyền: DELETE

✅ **Xem tồn kho theo kho con**
- GET `/api/warehouse/stock-by-subwarehouse`
- Xem số lượng tồn kho của từng kho con

---

## 13. QUẢN LÝ NHẬP HÀNG

**Endpoint**: `/api/warehouse/purchase-orders`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/warehouse/purchase-orders`
- Lấy tất cả phiếu nhập hàng
- Phân quyền: VIEW

✅ **Xem chi tiết** (READ)
- GET `/api/warehouse/purchase-orders/:id`
- Chi tiết một phiếu nhập
- Phân quyền: VIEW

✅ **Tạo phiếu nhập** (CREATE)
- POST `/api/warehouse/purchase-orders`
- Tạo phiếu nhập hàng mới từ NCC
- Phân quyền: CREATE

❌ **Không có UPDATE/DELETE** (lý do audit và tính toàn vẹn dữ liệu)

---

## 14. QUẢN LÝ TỒN KHO

**Endpoint**: `/api/warehouse/stock`

### Chức năng:

✅ **Xem tồn kho** (READ)
- GET `/api/warehouse/stock`
- Xem số lượng tồn kho tất cả sản phẩm
- Phân quyền: VIEW

✅ **Xem tồn kho quầy**
- GET `/api/warehouse/counter-stock`
- Xem tồn kho tại quầy bán hàng
- Phân quyền: VIEW

✅ **Cảnh báo tồn kho**
- GET `/api/warehouse/stock/alerts`
- Danh sách sản phẩm sắp hết hàng
- Phân quyền: VIEW

✅ **Tồn kho theo kho con**
- GET `/api/warehouse/stock-by-subwarehouse`
- Xem tồn kho phân theo từng kho con

❌ **Không có CREATE/UPDATE/DELETE trực tiếp** (tồn kho thay đổi thông qua nhập hàng, bán hàng, chuyển kho)

---

## 15. QUẢN LÝ CHUYỂN KHO

**Endpoint**: `/api/warehouse/transfers`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/warehouse/transfers`
- Lấy tất cả phiếu chuyển kho
- Phân quyền: VIEW

✅ **Xem chi tiết** (READ)
- GET `/api/warehouse/transfers/:id`
- Chi tiết một phiếu chuyển kho
- Phân quyền: VIEW

✅ **Tạo phiếu chuyển** (CREATE)
- POST `/api/warehouse/transfers`
- Tạo phiếu chuyển kho giữa các kho con
- Phân quyền: CREATE

✅ **Duyệt chuyển kho** (UPDATE)
- PUT `/api/warehouse/transfers/:id/approve`
- Duyệt phiếu chuyển kho (thực thi chuyển)
- Phân quyền: APPROVE

✅ **Hủy chuyển kho** (UPDATE)
- PUT `/api/warehouse/transfers/:id/cancel`
- Hủy phiếu chuyển kho
- Phân quyền: UPDATE

❌ **Không có DELETE** (lý do audit)

---

## 16. QUẢN LÝ KIỂM KÊ

**Endpoint**: `/api/warehouse/inventory-checks`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/warehouse/inventory-checks`
- Lấy tất cả phiếu kiểm kê
- Phân quyền: VIEW

✅ **Xem chi tiết** (READ)
- GET `/api/warehouse/inventory-checks/:id`
- Chi tiết một phiếu kiểm kê
- Phân quyền: VIEW

✅ **Tạo phiếu kiểm kê** (CREATE)
- POST `/api/warehouse/inventory-checks`
- Tạo phiếu kiểm kê mới
- Phân quyền: CREATE

✅ **Hoàn thành kiểm kê** (UPDATE)
- PUT `/api/warehouse/inventory-checks/:id/complete`
- Đánh dấu hoàn thành và cập nhật tồn kho thực tế
- Phân quyền: APPROVE

❌ **Không có DELETE** (lý do audit)

---

## 17. QUẢN LÝ NHÀ CUNG CẤP

**Endpoint**: `/api/suppliers`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/suppliers`
- Lấy tất cả nhà cung cấp
- Phân quyền: VIEW

✅ **Xem chi tiết** (READ)
- GET `/api/suppliers/:id`
- Chi tiết một nhà cung cấp
- Phân quyền: VIEW

✅ **Thêm NCC** (CREATE)
- POST `/api/suppliers`
- Tạo nhà cung cấp mới
- Phân quyền: CREATE

✅ **Sửa NCC** (UPDATE)
- PUT `/api/suppliers/:id`
- Cập nhật thông tin NCC
- Phân quyền: UPDATE

✅ **Xóa NCC** (DELETE)
- DELETE `/api/suppliers/:id`
- Xóa nhà cung cấp
- Phân quyền: DELETE

---

## 18. QUẢN LÝ CÔNG NỢ NCC

**Endpoint**: `/api/suppliers/debts`

### Chức năng:

✅ **Xem tất cả công nợ** (READ)
- GET `/api/suppliers/debts/all`
- Lấy công nợ của tất cả NCC
- Phân quyền: VIEW

✅ **Xem công nợ theo NCC** (READ)
- GET `/api/suppliers/:id/debts`
- Xem công nợ của một NCC cụ thể
- Phân quyền: VIEW

✅ **Ghi nhận thanh toán** (CREATE)
- POST `/api/suppliers/debts/pay`
- Thanh toán công nợ cho NCC
- Phân quyền: CREATE

❌ **Không có UPDATE/DELETE** (công nợ chỉ tạo và thanh toán)

---

## 19. QUẢN LÝ KHÁCH HÀNG

**Endpoint**: `/api/customers`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/customers`
- Lấy tất cả khách hàng
- Phân quyền: VIEW

✅ **Xem chi tiết** (READ)
- GET `/api/customers/:id`
- Chi tiết một khách hàng
- Phân quyền: VIEW

✅ **Thêm khách hàng** (CREATE)
- POST `/api/customers`
- Tạo khách hàng mới
- Phân quyền: CREATE

✅ **Sửa khách hàng** (UPDATE)
- PUT `/api/customers/:id`
- Cập nhật thông tin KH
- Phân quyền: UPDATE

✅ **Xóa khách hàng** (DELETE)
- DELETE `/api/customers/:id`
- Xóa khách hàng
- Phân quyền: DELETE

✅ **Thống kê khách hàng**
- GET `/api/customers/statistics`
- Thống kê về khách hàng

✅ **Tìm kiếm khách hàng**
- GET `/api/sales/customers/search`
- Tìm kiếm nhanh khách hàng trong POS

---

## 20. QUẢN LÝ HÓA ĐƠN

**Endpoint**: `/api/sales/hoadon` hoặc `/api/orders`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/sales/hoadon`
- Lấy tất cả hóa đơn
- Phân quyền: VIEW

✅ **Xem chi tiết** (READ)
- GET `/api/sales/hoadon/:id`
- Chi tiết một hóa đơn
- Phân quyền: VIEW

✅ **Tạo hóa đơn** (CREATE)
- POST `/api/sales/invoices`
- Tạo hóa đơn bán hàng (POS)
- Phân quyền: CREATE

✅ **Cập nhật trạng thái** (UPDATE)
- PUT `/api/sales/hoadon/:id/trangthai`
- Cập nhật trạng thái hóa đơn
- Phân quyền: UPDATE

✅ **Hủy hóa đơn** (UPDATE)
- PUT `/api/sales/hoadon/:id/huy`
- Hủy hóa đơn
- Phân quyền: UPDATE

❌ **Không có DELETE** (lý do audit và pháp lý)

---

## 21. QUẢN LÝ TRẢ HÀNG

**Endpoint**: `/api/returns`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/returns`
- Lấy tất cả phiếu trả hàng
- Phân quyền: VIEW

✅ **Xem chi tiết** (READ)
- GET `/api/returns/:id`
- Chi tiết một phiếu trả
- Phân quyền: VIEW

✅ **Tạo phiếu trả** (CREATE)
- POST `/api/returns`
- Tạo phiếu trả hàng
- Phân quyền: CREATE

✅ **Duyệt trả hàng** (UPDATE)
- PUT `/api/returns/:id/approve`
- Duyệt phiếu trả hàng và hoàn tiền
- Phân quyền: APPROVE

❌ **Không có DELETE** (lý do audit)

---

## 22. QUẢN LÝ KHUYẾN MÃI

**Endpoint**: `/api/promotions/promotions`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/promotions/promotions`
- Lấy tất cả chương trình khuyến mãi

✅ **Xem chi tiết** (READ)
- GET `/api/promotions/promotions/:id`
- Chi tiết một CT khuyến mãi

✅ **Thêm khuyến mãi** (CREATE)
- POST `/api/promotions/promotions`
- Tạo chương trình khuyến mãi mới

✅ **Sửa khuyến mãi** (UPDATE)
- PUT `/api/promotions/promotions/:id`
- Cập nhật khuyến mãi

✅ **Xóa khuyến mãi** (DELETE)
- DELETE `/api/promotions/promotions/:id`
- Xóa khuyến mãi

✅ **Kiểm tra khuyến mãi khả dụng**
- POST `/api/promotions/check-available`
- Kiểm tra các KM áp dụng cho đơn hàng

✅ **Lưu lịch sử sử dụng**
- POST `/api/promotions/save-usage`
- Lưu log sử dụng khuyến mãi

✅ **Thống kê khuyến mãi**
- GET `/api/promotions/statistics`
- Báo cáo thống kê hiệu quả KM

✅ **Lịch sử sử dụng**
- GET `/api/promotions/history`
- Lịch sử sử dụng khuyến mãi

✅ **Top khách hàng**
- GET `/api/promotions/top-customers`
- Khách hàng sử dụng KM nhiều nhất

---

## 23. QUẢN LÝ VOUCHER

**Endpoint**: `/api/promotions/vouchers`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/promotions/vouchers`
- Lấy tất cả voucher

✅ **Tạo voucher** (CREATE)
- POST `/api/promotions/vouchers`
- Tạo mã voucher mới

✅ **Xóa voucher** (DELETE)
- DELETE `/api/promotions/vouchers/:id`
- Xóa voucher

✅ **Xác thực voucher**
- POST `/api/promotions/validate-voucher`
- Kiểm tra voucher có hợp lệ không

❌ **Không có UPDATE** (voucher không sửa sau khi tạo)

---

## 24. QUẢN LÝ LOYALTY

**Endpoint**: `/api/loyalty`

### Chức năng:

✅ **Xem thông tin KH loyalty** (READ)
- GET `/api/loyalty/customer/:customerId`
- Xem điểm, cấp bậc của khách hàng

✅ **Xem tất cả KH loyalty** (READ)
- GET `/api/loyalty/customers`
- Danh sách tất cả khách hàng với điểm

✅ **Xem lịch sử điểm** (READ)
- GET `/api/loyalty/history/:customerId`
- Lịch sử tích/dùng điểm

✅ **Tìm KH theo SĐT**
- GET `/api/loyalty/customer/phone/:phone`
- Tìm khách hàng bằng số điện thoại

✅ **Tính điểm**
- POST `/api/loyalty/calculate-points`
- Tính điểm tích lũy từ đơn hàng

✅ **Thêm điểm** (CREATE)
- POST `/api/loyalty/add-points`
- Cộng điểm cho khách hàng

✅ **Sử dụng điểm** (UPDATE)
- POST `/api/loyalty/use-points`
- Trừ điểm khi khách quy đổi

✅ **Điều chỉnh điểm** (UPDATE)
- POST `/api/loyalty/adjust-points`
- Admin điều chỉnh điểm thủ công
- Phân quyền: UPDATE

✅ **Xem quy tắc tích điểm**
- GET `/api/loyalty/rules`
- Xem cấu hình rules

✅ **Xem cấp bậc**
- GET `/api/loyalty/tiers`
- Danh sách membership tiers

✅ **Xem lợi ích cấp bậc**
- GET `/api/loyalty/tier/:tierName`
- Quyền lợi của từng tier

✅ **Thống kê loyalty**
- GET `/api/loyalty/statistics`
- Báo cáo thống kê chương trình

---

## 25. QUẢN LÝ CHI PHÍ

**Endpoint**: `/api/finance/expenses`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/finance/expenses`
- Lấy tất cả chi phí
- Phân quyền: VIEW

✅ **Xem chi tiết** (READ)
- GET `/api/finance/expenses/:id`
- Chi tiết một khoản chi
- Phân quyền: VIEW

✅ **Thêm chi phí** (CREATE)
- POST `/api/finance/expenses`
- Ghi nhận chi phí mới
- Phân quyền: CREATE

✅ **Sửa chi phí** (UPDATE)
- PUT `/api/finance/expenses/:id`
- Cập nhật chi phí
- Phân quyền: UPDATE

✅ **Xóa chi phí** (DELETE)
- DELETE `/api/finance/expenses/:id`
- Xóa chi phí
- Phân quyền: DELETE

✅ **Tóm tắt chi phí**
- GET `/api/finance/summary`
- Báo cáo tổng hợp chi phí

### Quản lý Danh mục chi phí:

✅ **Xem danh mục** (READ)
- GET `/api/finance/expense-categories`

✅ **Thêm danh mục** (CREATE)
- POST `/api/finance/expense-categories`

✅ **Sửa danh mục** (UPDATE)
- PUT `/api/finance/expense-categories/:id`

---

## 26. QUẢN LÝ CHI NHÁNH

**Endpoint**: `/api/branches`

### Chức năng:

✅ **Xem danh sách** (READ)
- GET `/api/branches`
- Lấy tất cả chi nhánh

✅ **Cập nhật chi nhánh** (UPDATE)
- PUT `/api/branches/:id`
- Cập nhật thông tin chi nhánh

❌ **Không có CREATE/DELETE** (chi nhánh cố định trong hệ thống)

---

## 27. QUẢN LÝ CA LÀM VIỆC

**Endpoint**: `/api/sales/sessions`

### Chức năng:

✅ **Mở ca** (CREATE)
- POST `/api/sales/sessions/open`
- Mở ca làm việc với số tiền đầu ca
- Phân quyền: CREATE

✅ **Đóng ca** (UPDATE)
- POST `/api/sales/sessions/close`
- Đóng ca và đối soát tiền
- Phân quyền: UPDATE

❌ **Không có READ/DELETE riêng** (thông tin ca trong báo cáo)

---

## 28. BÁO CÁO & THỐNG KÊ

**Endpoint**: `/api/reports`

### Chức năng:

### Báo cáo Doanh thu:

✅ **Doanh thu theo năm**
- GET `/api/reports/doanhthu/nam`

✅ **Doanh thu theo tháng**
- GET `/api/reports/doanhthu/thang/:year`

✅ **Doanh thu theo ngày**
- GET `/api/reports/doanhthu/ngay/:year/:month`

✅ **Doanh thu theo khoảng thời gian**
- POST `/api/reports/doanhthu/khoangtg`

### Báo cáo Bán hàng:

✅ **Báo cáo theo sản phẩm**
- POST `/api/reports/banhang/sanpham`

✅ **Báo cáo theo thể loại**
- POST `/api/reports/banhang/theloai`

### Báo cáo Khách hàng:

✅ **Báo cáo khách hàng**
- POST `/api/reports/khachhang/khoangtg`

### Audit Logs:

✅ **Xem nhật ký hoạt động**
- GET `/api/reports/audit-logs`

---

## 📊 TỔNG KẾT

### Phân loại theo chức năng CRUD:

| Module | CREATE | READ | UPDATE | DELETE | Đặc biệt |
|--------|--------|------|--------|--------|----------|
| **Tài khoản** | ✅ | ✅ | ✅ | ❌ | Reset PW |
| **Vai trò** | ✅ | ✅ | ✅ | ✅ | - |
| **Quyền** | ✅ | ✅ | ✅ | ✅ | - |
| **Nhân viên** | ✅ | ✅ | ✅ | ✅ | Đổi chức vụ |
| **Chấm công** | ✅ | ✅ | ✅ | ✅ | Check-in/out |
| **Nghỉ phép** | ✅ | ✅ | ✅ | ❌ | Duyệt |
| **Lương** | ✅ | ✅ | ✅ | ❌ | Tính, thanh toán |
| **Ngày lễ** | ✅ | ✅ | ✅ | ✅ | - |
| **Sản phẩm** | ✅ | ✅ | ✅ | ✅ | - |
| **Tác giả** | ✅ | ✅ | ✅ | ✅ | - |
| **Thể loại** | ✅ | ✅ | ✅ | ✅ | - |
| **Kho con** | ✅ | ✅ | ✅ | ✅ | - |
| **Nhập hàng** | ✅ | ✅ | ❌ | ❌ | Audit |
| **Tồn kho** | ❌ | ✅ | ❌ | ❌ | Tự động |
| **Chuyển kho** | ✅ | ✅ | ✅ | ❌ | Duyệt, hủy |
| **Kiểm kê** | ✅ | ✅ | ✅ | ❌ | Hoàn thành |
| **NCC** | ✅ | ✅ | ✅ | ✅ | - |
| **Công nợ NCC** | ✅ | ✅ | ❌ | ❌ | Thanh toán |
| **Khách hàng** | ✅ | ✅ | ✅ | ✅ | Tìm kiếm |
| **Hóa đơn** | ✅ | ✅ | ✅ | ❌ | Hủy |
| **Trả hàng** | ✅ | ✅ | ✅ | ❌ | Duyệt |
| **Khuyến mãi** | ✅ | ✅ | ✅ | ✅ | Validate |
| **Voucher** | ✅ | ✅ | ❌ | ✅ | Validate |
| **Loyalty** | ✅ | ✅ | ✅ | ❌ | Tích/dùng điểm |
| **Chi phí** | ✅ | ✅ | ✅ | ✅ | - |
| **Chi nhánh** | ❌ | ✅ | ✅ | ❌ | Cố định |
| **Ca làm việc** | ✅ | ✅ | ✅ | ❌ | Mở/đóng |

---

**Ngày tạo**: 09/03/2026  
**Phiên bản**: 1.0  
**Tổng số module**: 28 modules  
**Tổng số chức năng**: 200+ chức năng
