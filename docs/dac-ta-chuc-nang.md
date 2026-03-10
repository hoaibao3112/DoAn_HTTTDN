# ĐẶC TẢ CHỨC NĂNG HỆ THỐNG QUẢN LÝ NHÀ SÁCH

## THÔNG TIN TÀI LIỆU

| **Trường thông tin** | **Nội dung** |
|---------------------|--------------|
| Tên đề tài | Hệ thống quản lý nhà sách |
| Loại tài liệu | Đặc tả chức năng (SRS - Software Requirement Specification) |
| Phiên bản | 1.0 |
| Ngày | 09/03/2026 |
| Trạng thái | Đã phê duyệt |

---

## MỤC LỤC

**PHẦN I: TỔNG QUAN HỆ THỐNG**
- 1.1. Giới thiệu
- 1.2. Phạm vi ứng dụng
- 1.3. Đối tượng sử dụng

**PHẦN II: CÁC MODULE CHỨC NĂNG**
- 2.1. Nhóm quản lý hệ thống
- 2.2. Nhóm quản lý nhân sự
- 2.3. Nhóm quản lý kho hàng
- 2.4. Nhóm quản lý bán hàng
- 2.5. Nhóm quản lý khách hàng
- 2.6. Nhóm báo cáo thống kê

**PHẦN III: MA TRẬN PHÂN QUYỀN**

---

## PHẦN I: TỔNG QUAN HỆ THỐNG

### 1.1. Giới thiệu

Hệ thống quản lý nhà sách là một ứng dụng phần mềm toàn diện, được thiết kế nhằm số hóa và tối ưu hóa quy trình vận hành của cửa hàng sách. Hệ thống bao gồm các module chức năng từ quản lý nhân sự, quản lý kho hàng, bán hàng tại quầy (POS), đến quản lý khách hàng và chương trình khách hàng thân thiết.

### 1.2. Phạm vi ứng dụng

Hệ thống phục vụ các nghiệp vụ chính sau:
- Quản lý tài khoản, phân quyền và bảo mật
- Quản lý nhân sự: chấm công, lương, nghỉ phép
- Quản lý kho: sản phẩm, nhập hàng, tồn kho, chuyển kho, kiểm kê
- Bán hàng: POS, hóa đơn, trả hàng, khuyến mãi
- Quản lý khách hàng và chương trình khách hàng thân thiết
- Quản lý tài chính: công nợ nhà cung cấp, chi phí, thanh toán
- Báo cáo và thống kê đa chiều

### 1.3. Đối tượng sử dụng

Hệ thống phục vụ bốn nhóm người dùng chính:
- **Quản trị viên (Admin):** Toàn quyền quản lý hệ thống
- **Nhân viên kho:** Quản lý sản phẩm, nhập hàng, chuyển kho, kiểm kê
- **Nhân viên bán hàng:** Sử dụng POS, tạo hóa đơn, xử lý trả hàng
- **Nhân viên thường:** Chấm công, xin nghỉ phép, xem lương

---

## PHẦN II: CÁC MODULE CHỨC NĂNG

### 2.1. NHÓM QUẢN LÝ HỆ THỐNG

#### 2.1.1. Module Quản lý Tài khoản

**Mô tả:** Quản lý thông tin tài khoản người dùng và xác thực truy cập hệ thống.

**Đường dẫn API:** `/api/accounts`

| STT | Chức năng | Phương thức | Endpoint | Phân quyền |
|-----|-----------|-------------|----------|------------|
| 1 | Xem danh sách tài khoản | GET | `/api/accounts` | VIEW |
| 2 | Thêm tài khoản mới | POST | `/api/accounts` | CREATE |
| 3 | Cập nhật tài khoản | PUT | `/api/accounts/:id` | UPDATE |
| 4 | Đổi mật khẩu cá nhân | PUT | `/api/accounts/change-password` | - |
| 5 | Đặt lại mật khẩu | PUT | `/api/accounts/:id/reset-password` | UPDATE |

**Lưu ý:** Không hỗ trợ xóa tài khoản để đảm bảo tính toàn vẹn dữ liệu và phục vụ kiểm toán.

---

#### 2.1.2. Module Quản lý Vai trò

**Mô tả:** Định nghĩa và quản lý các vai trò người dùng trong hệ thống.

**Đường dẫn API:** `/api/roles`

| STT | Chức năng | Phương thức | Endpoint | Phân quyền |
|-----|-----------|-------------|----------|------------|
| 1 | Xem danh sách vai trò | GET | `/api/roles` | VIEW |
| 2 | Xem chi tiết vai trò | GET | `/api/roles/:id` | - |
| 3 | Xem quyền của vai trò | GET | `/api/roles/:id/permissions` | VIEW |
| 4 | Xem vai trò đang hoạt động | GET | `/api/roles/list/active` | - |
| 5 | Thêm/cập nhật vai trò | POST | `/api/roles/save` | UPDATE |
| 6 | Xóa vai trò | DELETE | `/api/roles/:id` | DELETE |

---

#### 2.1.3. Module Quản lý Quyền

**Mô tả:** Phân quyền chi tiết cho từng vai trò, kiểm soát truy cập vào các chức năng.

**Đường dẫn API:** `/api/permissions`

| STT | Chức năng | Phương thức | Endpoint | Phân quyền |
|-----|-----------|-------------|----------|------------|
| 1 | Xem danh sách quyền | GET | `/api/permissions` | - |
| 2 | Xem danh sách features | GET | `/api/permissions/features` | - |
| 3 | Xem quyền theo vai trò | GET | `/api/permissions/roles/:id` | - |
| 4 | Thêm quyền | POST | `/api/permissions` | CREATE |
| 5 | Cập nhật quyền | PUT | `/api/permissions/:id` | UPDATE |
| 6 | Xóa quyền | DELETE | `/api/permissions/:id` | DELETE |

---

### 2.2. NHÓM QUẢN LÝ NHÂN SỰ

#### 2.2.1. Module Quản lý Nhân viên

**Mô tả:** Quản lý hồ sơ, thông tin cá nhân và chức vụ của nhân viên.

**Đường dẫn API:** `/api/hr/employees`

| STT | Chức năng | Phương thức | Endpoint | CRUD | Phân quyền |
|-----|-----------|-------------|----------|------|------------|
| 1 | Xem danh sách nhân viên | GET | `/api/hr/employees` | R | VIEW |
| 2 | Thêm nhân viên mới | POST | `/api/hr/employees` | C | CREATE |
| 3 | Cập nhật nhân viên | PUT | `/api/hr/employees/:id` | U | UPDATE |
| 4 | Xóa nhân viên | DELETE | `/api/hr/employees/:id` | D | DELETE |
| 5 | Thay đổi chức vụ | POST | `/api/hr/change-position` | U | UPDATE |
| 6 | Thống kê nhân viên | GET | `/api/hr/reports/employees/stats` | R | VIEW |

---

#### 2.2.2. Module Chấm công

**Mô tả:** Ghi nhận thời gian làm việc, điểm danh vào/ra ca của nhân viên.

**Đường dẫn API:** `/api/hr/attendance`

| STT | Chức năng | Phương thức | Endpoint | Người dùng |
|-----|-----------|-------------|----------|------------|
| 1 | Check-in (điểm danh vào) | POST | `/api/hr/checkin` | Nhân viên |
| 2 | Check-out (điểm danh ra) | POST | `/api/hr/checkout` | Nhân viên |
| 3 | Xem chấm công của tôi | GET | `/api/hr/my-attendance` | Nhân viên |
| 4 | Xem danh sách chấm công | GET | `/api/hr/attendance` | Admin |
| 5 | Thêm bản ghi chấm công | POST | `/api/hr/attendance` | Admin |
| 6 | Cập nhật chấm công | PUT | `/api/hr/attendance/:id` | Admin |
| 7 | Xóa bản ghi chấm công | DELETE | `/api/hr/attendance/:id` | Admin |
| 8 | Tổng hợp chấm công | GET | `/api/hr/attendance/summary` | Admin |
| 9 | Chấm công theo tháng | GET | `/api/hr/attendance/monthly` | Admin |
| 10 | Lịch sử chấm công NV | GET | `/api/hr/attendance/:id/history` | Admin |
| 11 | Báo cáo bất thường | GET | `/api/hr/attendance/report/abnormal` | Admin |
| 12 | Đánh dấu vắng mặt | POST | `/api/hr/attendance/mark-absent` | Admin |

---

#### 2.2.3. Module Nghỉ phép

**Mô tả:** Quản lý đơn xin nghỉ phép và quá trình phê duyệt.

**Đường dẫn API:** `/api/hr/leave-requests`

| STT | Chức năng | Phương thức | Endpoint | Người dùng |
|-----|-----------|-------------|----------|------------|
| 1 | Xin nghỉ phép | POST | `/api/hr/xin-nghi-phep` | Nhân viên |
| 2 | Xem đơn nghỉ của tôi | GET | `/api/hr/my-leave` | Nhân viên |
| 3 | Xem tất cả đơn nghỉ | GET | `/api/hr/leave-requests` | Admin |
| 4 | Duyệt/từ chối đơn | PUT | `/api/hr/leave-requests/:id/approve` | Admin |

**Ghi chú:** Không hỗ trợ xóa đơn nghỉ phép để đảm bảo tính minh bạch và kiểm toán.

---

#### 2.2.4. Module Lương

**Mô tả:** Tính toán, quản lý và thanh toán lương cho nhân viên.

**Đường dẫn API:** `/api/salary` hoặc `/api/hr`

| STT | Chức năng | Phương thức | Endpoint | Người dùng |
|-----|-----------|-------------|----------|------------|
| 1 | Xem lương của tôi | GET | `/api/hr/my-salary` | Nhân viên |
| 2 | Lịch sử lương của tôi | GET | `/api/hr/my-salary-history` | Nhân viên |
| 3 | In phiếu lương tháng | GET | `/api/hr/my-salary/print/monthly` | Nhân viên |
| 4 | In phiếu lương năm | GET | `/api/hr/my-salary/print/yearly` | Nhân viên |
| 5 | Xem lương theo năm | GET | `/api/salary/monthly/:year` | Admin |
| 6 | Xem lương theo tháng | GET | `/api/salary/per-month/:year/:month` | Admin |
| 7 | Tính lương | POST | `/api/salary/compute/:year/:month` | Admin |
| 8 | Chi tiết lương NV | GET | `/api/salary/salary-detail` | Admin |
| 9 | Thanh toán lương | PUT | `/api/salary/salary-pay` | Admin |
| 10 | Thanh toán hàng loạt | PUT | `/api/salary/salary-pay-all` | Admin |
| 11 | Báo cáo lương | GET | `/api/hr/reports/salary` | Admin |
| 12 | Báo cáo thưởng | GET | `/api/hr/reports/bonus` | Admin |

---

#### 2.2.5. Module Quản lý Ngày lễ

**Mô tả:** Quản lý danh sách các ngày nghỉ lễ, tết trong năm.

**Đường dẫn API:** `/api/hr/holidays`

| STT | Chức năng | Phương thức | Endpoint | CRUD |
|-----|-----------|-------------|----------|------|
| 1 | Xem danh sách ngày lễ | GET | `/api/hr/holidays` | R |
| 2 | Thêm ngày lễ | POST | `/api/hr/holidays` | C |
| 3 | Cập nhật ngày lễ | PUT | `/api/hr/holidays/:id` | U |
| 4 | Xóa ngày lễ | DELETE | `/api/hr/holidays/:id` | D |

---

### 2.3. NHÓM QUẢN LÝ KHO HÀNG

#### 2.3.1. Module Quản lý Sản phẩm

**Mô tả:** Quản lý thông tin sách, bao gồm tác giả, thể loại, giá bán và hình ảnh.

**Đường dẫn API:** `/api/warehouse/products`

| STT | Chức năng | Phương thức | Endpoint | CRUD | Phân quyền |
|-----|-----------|-------------|----------|------|------------|
| 1 | Xem danh sách sản phẩm | GET | `/api/warehouse/products` | R | - |
| 2 | Xem chi tiết sản phẩm | GET | `/api/warehouse/products/:id` | R | VIEW |
| 3 | Thêm sản phẩm | POST | `/api/warehouse/products` | C | CREATE |
| 4 | Cập nhật sản phẩm | PUT | `/api/warehouse/products/:id` | U | UPDATE |
| 5 | Xóa sản phẩm | DELETE | `/api/warehouse/products/:id` | D | DELETE |

---

#### 2.3.2. Module Quản lý Danh mục

**Bảng 1: Tác giả**

**Đường dẫn API:** `/api/warehouse/authors`

| STT | Chức năng | Phương thức | Endpoint | CRUD |
|-----|-----------|-------------|----------|------|
| 1 | Xem danh sách tác giả | GET | `/api/warehouse/authors` | R |
| 2 | Thêm tác giả | POST | `/api/warehouse/authors` | C |
| 3 | Cập nhật tác giả | PUT | `/api/warehouse/authors/:id` | U |
| 4 | Xóa tác giả | DELETE | `/api/warehouse/authors/:id` | D |

**Bảng 2: Thể loại**

**Đường dẫn API:** `/api/warehouse/categories` hoặc `/api/category`

| STT | Chức năng | Phương thức | Endpoint | CRUD |
|-----|-----------|-------------|----------|------|
| 1 | Xem danh sách thể loại | GET | `/api/warehouse/categories` | R |
| 2 | Thêm thể loại | POST | `/api/warehouse/categories` | C |
| 3 | Cập nhật thể loại | PUT | `/api/warehouse/categories/:id` | U |
| 4 | Xóa thể loại | DELETE | `/api/warehouse/categories/:id` | D |

---

#### 2.3.3. Module Quản lý Kho con

**Mô tả:** Quản lý các kho nhỏ, phân vùng lưu trữ trong hệ thống kho.

**Đường dẫn API:** `/api/warehouse/sub-warehouses`

| STT | Chức năng | Phương thức | Endpoint | CRUD |
|-----|-----------|-------------|----------|------|
| 1 | Xem danh sách kho con | GET | `/api/warehouse/sub-warehouses` | R |
| 2 | Thêm kho con | POST | `/api/warehouse/sub-warehouses` | C |
| 3 | Cập nhật kho con | PUT | `/api/warehouse/sub-warehouses/:id` | U |
| 4 | Xóa kho con | DELETE | `/api/warehouse/sub-warehouses/:id` | D |
| 5 | Xem tồn kho theo kho con | GET | `/api/warehouse/stock-by-subwarehouse` | R |

---

#### 2.3.4. Module Nhập hàng

**Mô tả:** Lập phiếu nhập hàng từ nhà cung cấp, cập nhật tồn kho.

**Đường dẫn API:** `/api/warehouse/purchase-orders`

| STT | Chức năng | Phương thức | Endpoint | Phân quyền |
|-----|-----------|-------------|----------|------------|
| 1 | Xem danh sách phiếu nhập | GET | `/api/warehouse/purchase-orders` | VIEW |
| 2 | Xem chi tiết phiếu nhập | GET | `/api/warehouse/purchase-orders/:id` | VIEW |
| 3 | Tạo phiếu nhập hàng | POST | `/api/warehouse/purchase-orders` | CREATE |

**Ghi chú:** Không hỗ trợ sửa/xóa phiếu nhập để đảm bảo tính toàn vẹn và kiểm toán.

---

#### 2.3.5. Module Tồn kho

**Mô tả:** Theo dõi số lượng hàng tồn kho theo thời gian thực.

**Đường dẫn API:** `/api/warehouse/stock`

| STT | Chức năng | Phương thức | Endpoint | Mô tả |
|-----|-----------|-------------|----------|-------|
| 1 | Xem tồn kho | GET | `/api/warehouse/stock` | Tồn kho tất cả sản phẩm |
| 2 | Xem tồn quầy | GET | `/api/warehouse/counter-stock` | Tồn kho tại quầy bán |
| 3 | Cảnh báo tồn kho | GET | `/api/warehouse/stock/alerts` | Sản phẩm sắp hết |
| 4 | Tồn kho theo kho con | GET | `/api/warehouse/stock-by-subwarehouse` | Phân theo từng kho |

**Ghi chú:** Tồn kho tự động cập nhật qua: nhập hàng, bán hàng, chuyển kho, kiểm kê.

---

#### 2.3.6. Module Chuyển kho

**Mô tả:** Quản lý việc di chuyển hàng hóa giữa các kho con.

**Đường dẫn API:** `/api/warehouse/transfers`

| STT | Chức năng | Phương thức | Endpoint | Phân quyền |
|-----|-----------|-------------|----------|------------|
| 1 | Xem danh sách chuyển kho | GET | `/api/warehouse/transfers` | VIEW |
| 2 | Xem chi tiết phiếu chuyển | GET | `/api/warehouse/transfers/:id` | VIEW |
| 3 | Tạo phiếu chuyển kho | POST | `/api/warehouse/transfers` | CREATE |
| 4 | Duyệt chuyển kho | PUT | `/api/warehouse/transfers/:id/approve` | APPROVE |
| 5 | Hủy phiếu chuyển | PUT | `/api/warehouse/transfers/:id/cancel` | UPDATE |

---

#### 2.3.7. Module Kiểm kê

**Mô tả:** Thực hiện kiểm tra, đối chiếu số lượng thực tế với sổ sách.

**Đường dẫn API:** `/api/warehouse/inventory-checks`

| STT | Chức năng | Phương thức | Endpoint | Phân quyền |
|-----|-----------|-------------|----------|------------|
| 1 | Xem danh sách kiểm kê | GET | `/api/warehouse/inventory-checks` | VIEW |
| 2 | Xem chi tiết kiểm kê | GET | `/api/warehouse/inventory-checks/:id` | VIEW |
| 3 | Tạo phiếu kiểm kê | POST | `/api/warehouse/inventory-checks` | CREATE |
| 4 | Hoàn thành kiểm kê | PUT | `/api/warehouse/inventory-checks/:id/complete` | APPROVE |

**Ghi chú:** Khi hoàn thành, hệ thống tự động điều chỉnh tồn kho theo số liệu thực tế.

---

### 2.4. NHÓM QUẢN LÝ NHÀ CUNG CẤP

#### 2.4.1. Module Nhà cung cấp

**Mô tả:** Quản lý thông tin các nhà cung cấp sách.

**Đường dẫn API:** `/api/suppliers`

| STT | Chức năng | Phương thức | Endpoint | CRUD |
|-----|-----------|-------------|----------|------|
| 1 | Xem danh sách NCC | GET | `/api/suppliers` | R |
| 2 | Xem chi tiết NCC | GET | `/api/suppliers/:id` | R |
| 3 | Thêm NCC | POST | `/api/suppliers` | C |
| 4 | Cập nhật NCC | PUT | `/api/suppliers/:id` | U |
| 5 | Xóa NCC | DELETE | `/api/suppliers/:id` | D |

---

#### 2.4.2. Module Công nợ NCC

**Mô tả:** Theo dõi và quản lý công nợ với các nhà cung cấp.

**Đường dẫn API:** `/api/suppliers/debts`

| STT | Chức năng | Phương thức | Endpoint | Mô tả |
|-----|-----------|-------------|----------|-------|
| 1 | Xem tất cả công nợ | GET | `/api/suppliers/debts/all` | Công nợ tất cả NCC |
| 2 | Công nợ theo NCC | GET | `/api/suppliers/:id/debts` | Công nợ một NCC |
| 3 | Thanh toán công nợ | POST | `/api/suppliers/debts/pay` | Ghi nhận thanh toán |

---

### 2.5. NHÓM QUẢN LÝ BÁN HÀNG

#### 2.5.1. Module Ca làm việc

**Mô tả:** Quản lý ca làm việc tại quầy bán hàng.

**Đường dẫn API:** `/api/sales/sessions`

| STT | Chức năng | Phương thức | Endpoint | Mô tả |
|-----|-----------|-------------|----------|-------|
| 1 | Mở ca | POST | `/api/sales/sessions/open` | Mở ca với số tiền đầu ca |
| 2 | Đóng ca | POST | `/api/sales/sessions/close` | Đóng ca và đối soát tiền |

---

#### 2.5.2. Module Hóa đơn bán hàng (POS)

**Mô tả:** Quản lý hóa đơn bán hàng tại điểm bán (Point of Sale).

**Đường dẫn API:** `/api/sales`

| STT | Chức năng | Phương thức | Endpoint | Phân quyền |
|-----|-----------|-------------|----------|------------|
| 1 | Tạo hóa đơn | POST | `/api/sales/invoices` | CREATE |
| 2 | Xem danh sách hóa đơn | GET | `/api/sales/hoadon` | VIEW |
| 3 | Xem chi tiết hóa đơn | GET | `/api/sales/hoadon/:id` | VIEW |
| 4 | Cập nhật trạng thái | PUT | `/api/sales/hoadon/:id/trangthai` | UPDATE |
| 5 | Hủy hóa đơn | PUT | `/api/sales/hoadon/:id/huy` | UPDATE |
| 6 | Tìm kiếm khách hàng | GET | `/api/sales/customers/search` | - |
| 7 | Thêm KH nhanh | POST | `/api/sales/customers` | CREATE |

**Ghi chú:** Không hỗ trợ xóa hóa đơn để đảm bảo tuân thủ pháp lý và kiểm toán.

---

#### 2.5.3. Module Trả hàng

**Mô tả:** Xử lý các yêu cầu trả hàng và hoàn tiền.

**Đường dẫn API:** `/api/returns`

| STT | Chức năng | Phương thức | Endpoint | Phân quyền |
|-----|-----------|-------------|----------|------------|
| 1 | Xem danh sách trả hàng | GET | `/api/returns` | VIEW |
| 2 | Xem chi tiết phiếu trả | GET | `/api/returns/:id` | VIEW |
| 3 | Tạo phiếu trả hàng | POST | `/api/returns` | CREATE |
| 4 | Duyệt trả hàng | PUT | `/api/returns/:id/approve` | APPROVE |

---

### 2.6. NHÓM QUẢN LÝ KHÁCH HÀNG

#### 2.6.1. Module Khách hàng

**Mô tả:** Quản lý thông tin khách hàng, lịch sử mua hàng.

**Đường dẫn API:** `/api/customers`

| STT | Chức năng | Phương thức | Endpoint | CRUD |
|-----|-----------|-------------|----------|------|
| 1 | Xem danh sách KH | GET | `/api/customers` | R |
| 2 | Xem chi tiết KH | GET | `/api/customers/:id` | R |
| 3 | Thêm khách hàng | POST | `/api/customers` | C |
| 4 | Cập nhật KH | PUT | `/api/customers/:id` | U |
| 5 | Xóa KH | DELETE | `/api/customers/:id` | D |
| 6 | Thống kê KH | GET | `/api/customers/statistics` | R |

---

#### 2.6.2. Module Khách hàng thân thiết (Loyalty)

**Mô tả:** Quản lý chương trình tích điểm và cấp bậc thành viên.

**Đường dẫn API:** `/api/loyalty`

| STT | Chức năng | Phương thức | Endpoint | Mô tả |
|-----|-----------|-------------|----------|-------|
| 1 | Tìm KH theo SĐT | GET | `/api/loyalty/customer/phone/:phone` | Tra cứu nhanh |
| 2 | Xem thông tin loyalty | GET | `/api/loyalty/customer/:customerId` | Điểm, cấp bậc |
| 3 | Xem tất cả KH loyalty | GET | `/api/loyalty/customers` | Danh sách |
| 4 | Lịch sử điểm | GET | `/api/loyalty/history/:customerId` | Lịch sử tích/dùng |
| 5 | Tính điểm | POST | `/api/loyalty/calculate-points` | Tính từ đơn hàng |
| 6 | Thêm điểm | POST | `/api/loyalty/add-points` | Cộng điểm |
| 7 | Sử dụng điểm | POST | `/api/loyalty/use-points` | Quy đổi điểm |
| 8 | Điều chỉnh điểm | POST | `/api/loyalty/adjust-points` | Admin điều chỉnh |
| 9 | Xem quy tắc | GET | `/api/loyalty/rules` | Quy tắc tích điểm |
| 10 | Xem cấp bậc | GET | `/api/loyalty/tiers` | Membership tiers |
| 11 | Lợi ích cấp bậc | GET | `/api/loyalty/tier/:tierName` | Quyền lợi |
| 12 | Thống kê loyalty | GET | `/api/loyalty/statistics` | Báo cáo chương trình |

---

#### 2.6.3. Module Khuyến mãi

**Mô tả:** Quản lý các chương trình khuyến mãi, giảm giá.

**Đường dẫn API:** `/api/promotions`

| STT | Chức năng | Phương thức | Endpoint | CRUD |
|-----|-----------|-------------|----------|------|
| 1 | Xem danh sách KM | GET | `/api/promotions/promotions` | R |
| 2 | Xem chi tiết KM | GET | `/api/promotions/promotions/:id` | R |
| 3 | Thêm khuyến mãi | POST | `/api/promotions/promotions` | C |
| 4 | Cập nhật KM | PUT | `/api/promotions/promotions/:id` | U |
| 5 | Xóa KM | DELETE | `/api/promotions/promotions/:id` | D |
| 6 | Kiểm tra KM khả dụng | POST | `/api/promotions/check-available` | - |
| 7 | Lưu lịch sử sử dụng | POST | `/api/promotions/save-usage` | C |
| 8 | Thống kê KM | GET | `/api/promotions/statistics` | R |
| 9 | Lịch sử KM | GET | `/api/promotions/history` | R |
| 10 | Top khách hàng | GET | `/api/promotions/top-customers` | R |

---

#### 2.6.4. Module Voucher

**Mô tả:** Quản lý mã giảm giá (voucher code).

**Đường dẫn API:** `/api/promotions/vouchers`

| STT | Chức năng | Phương thức | Endpoint | CRUD |
|-----|-----------|-------------|----------|------|
| 1 | Xem danh sách voucher | GET | `/api/promotions/vouchers` | R |
| 2 | Tạo voucher | POST | `/api/promotions/vouchers` | C |
| 3 | Xóa voucher | DELETE | `/api/promotions/vouchers/:id` | D |
| 4 | Xác thực voucher | POST | `/api/promotions/validate-voucher` | - |

**Ghi chú:** Voucher không hỗ trợ cập nhật sau khi tạo để đảm bảo tính nhất quán.

---

### 2.7. NHÓM TÀI CHÍNH

#### 2.7.1. Module Chi phí

**Mô tả:** Quản lý các khoản chi phí vận hành.

**Đường dẫn API:** `/api/finance/expenses`

| STT | Chức năng | Phương thức | Endpoint | CRUD |
|-----|-----------|-------------|----------|------|
| 1 | Xem danh sách chi phí | GET | `/api/finance/expenses` | R |
| 2 | Xem chi tiết | GET | `/api/finance/expenses/:id` | R |
| 3 | Thêm chi phí | POST | `/api/finance/expenses` | C |
| 4 | Cập nhật chi phí | PUT | `/api/finance/expenses/:id` | U |
| 5 | Xóa chi phí | DELETE | `/api/finance/expenses/:id` | D |
| 6 | Tóm tắt chi phí | GET | `/api/finance/summary` | R |
| 7 | Xem danh mục chi phí | GET | `/api/finance/expense-categories` | R |
| 8 | Thêm danh mục | POST | `/api/finance/expense-categories` | C |
| 9 | Cập nhật danh mục | PUT | `/api/finance/expense-categories/:id` | U |

---

#### 2.7.2. Module Thanh toán trực tuyến

**Mô tả:** Tích hợp các cổng thanh toán điện tử.

**Đường dẫn API:** `/api/payments`

| STT | Chức năng | Phương thức | Endpoint | Cổng thanh toán |
|-----|-----------|-------------|----------|-----------------|
| 1 | Tạo URL VNPay | POST | `/api/payments/vnpay/create` | VNPay |
| 2 | Tạo thanh toán MoMo | POST | `/api/payments/momo/create` | MoMo |
| 3 | Tạo thanh toán ZaloPay | POST | `/api/payments/zalopay/create` | ZaloPay |

---

### 2.8. NHÓM BÁO CÁO & THỐNG KÊ

#### 2.8.1. Module Báo cáo Doanh thu

**Đường dẫn API:** `/api/reports`

| STT | Chức năng | Phương thức | Endpoint | Mô tả |
|-----|-----------|-------------|----------|-------|
| 1 | Doanh thu theo năm | GET | `/api/reports/doanhthu/nam` | Tổng DT các năm |
| 2 | Doanh thu theo tháng | GET | `/api/reports/doanhthu/thang/:year` | DT 12 tháng |
| 3 | Doanh thu theo ngày | GET | `/api/reports/doanhthu/ngay/:year/:month` | DT hàng ngày |
| 4 | Doanh thu khoảng TG | POST | `/api/reports/doanhthu/khoangtg` | DT tùy chỉnh |

---

#### 2.8.2. Module Báo cáo Bán hàng

**Đường dẫn API:** `/api/reports`

| STT | Chức năng | Phương thức | Endpoint | Mô tả |
|-----|-----------|-------------|----------|-------|
| 1 | Báo cáo theo sản phẩm | POST | `/api/reports/banhang/sanpham` | Top sản phẩm bán chạy |
| 2 | Báo cáo theo thể loại | POST | `/api/reports/banhang/theloai` | Doanh số theo thể loại |

---

#### 2.8.3. Module Báo cáo Khách hàng

**Đường dẫn API:** `/api/reports`

| STT | Chức năng | Phương thức | Endpoint | Mô tả |
|-----|-----------|-------------|----------|-------|
| 1 | Báo cáo khách hàng | POST | `/api/reports/khachhang/khoangtg` | Khách hàng mới, trung thành |

---

#### 2.8.4. Module Nhật ký hệ thống

**Đường dẫn API:** `/api/reports`

| STT | Chức năng | Phương thức | Endpoint | Mô tả |
|-----|-----------|-------------|----------|-------|
| 1 | Xem audit logs | GET | `/api/reports/audit-logs` | Nhật ký hoạt động |

---

### 2.9. CÁC MODULE HỖ TRỢ

#### 2.9.1. Module Chi nhánh

**Đường dẫn API:** `/api/branches`

| STT | Chức năng | Phương thức | Endpoint |
|-----|-----------|-------------|----------|
| 1 | Xem danh sách chi nhánh | GET | `/api/branches` |
| 2 | Cập nhật chi nhánh | PUT | `/api/branches/:id` |

---

#### 2.9.2. Module Chat hỗ trợ

**Đường dẫn API:** `/api/chat`

| STT | Chức năng | Phương thức | Endpoint |
|-----|-----------|-------------|----------|
| 1 | Số tin nhắn chưa đọc | GET | `/api/chat/admin/unread-count` |
| 2 | Phòng chat chưa đọc | GET | `/api/chat/admin/unread-rooms` |

---

## PHẦN III: MA TRẬN PHÂN QUYỀN

### 3.1. Bảng tổng hợp chức năng CRUD

| **Module** | **C** | **R** | **U** | **D** | **Đặc biệt** |
|------------|-------|-------|-------|-------|--------------|
| Tài khoản | ✓ | ✓ | ✓ | ✗ | Reset mật khẩu |
| Vai trò | ✓ | ✓ | ✓ | ✓ | - |
| Quyền | ✓ | ✓ | ✓ | ✓ | - |
| Nhân viên | ✓ | ✓ | ✓ | ✓ | Đổi chức vụ |
| Chấm công | ✓ | ✓ | ✓ | ✓ | Check-in/out |
| Nghỉ phép | ✓ | ✓ | ✓ | ✗ | Duyệt đơn |
| Lương | ✓ | ✓ | ✓ | ✗ | Tính, thanh toán |
| Ngày lễ | ✓ | ✓ | ✓ | ✓ | - |
| Sản phẩm | ✓ | ✓ | ✓ | ✓ | - |
| Tác giả | ✓ | ✓ | ✓ | ✓ | - |
| Thể loại | ✓ | ✓ | ✓ | ✓ | - |
| Kho con | ✓ | ✓ | ✓ | ✓ | - |
| Nhập hàng | ✓ | ✓ | ✗ | ✗ | Không sửa/xóa |
| Tồn kho | ✗ | ✓ | ✗ | ✗ | Tự động cập nhật |
| Chuyển kho | ✓ | ✓ | ✓ | ✗ | Duyệt, hủy |
| Kiểm kê | ✓ | ✓ | ✓ | ✗ | Hoàn thành |
| Nhà cung cấp | ✓ | ✓ | ✓ | ✓ | - |
| Công nợ NCC | ✓ | ✓ | ✗ | ✗ | Thanh toán |
| Khách hàng | ✓ | ✓ | ✓ | ✓ | Tìm kiếm |
| Hóa đơn | ✓ | ✓ | ✓ | ✗ | Hủy |
| Trả hàng | ✓ | ✓ | ✓ | ✗ | Duyệt |
| Khuyến mãi | ✓ | ✓ | ✓ | ✓ | Validate |
| Voucher | ✓ | ✓ | ✗ | ✓ | Xác thực |
| Loyalty | ✓ | ✓ | ✓ | ✗ | Tích/dùng điểm |
| Chi phí | ✓ | ✓ | ✓ | ✓ | Danh mục |
| Chi nhánh | ✗ | ✓ | ✓ | ✗ | Cố định |
| Ca làm việc | ✓ | ✓ | ✓ | ✗ | Mở/đóng |
| Báo cáo | ✗ | ✓ | ✗ | ✗ | Chỉ xem |

**Chú thích:**
- ✓ : Có hỗ trợ
- ✗ : Không hỗ trợ
- **C** (Create): Thêm mới
- **R** (Read): Xem/Đọc
- **U** (Update): Cập nhật
- **D** (Delete): Xóa

---

### 3.2. Phân quyền theo vai trò

| **Chức năng** | **Admin** | **NV Kho** | **NV Bán hàng** | **NV Thường** |
|---------------|-----------|-----------|----------------|---------------|
| Quản lý hệ thống | ✓ | ✗ | ✗ | ✗ |
| Quản lý nhân sự | ✓ | ✗ | ✗ | Chỉ xem của mình |
| Chấm công cá nhân | ✓ | ✓ | ✓ | ✓ |
| Quản lý chấm công | ✓ | ✗ | ✗ | ✗ |
| Xin nghỉ phép | ✓ | ✓ | ✓ | ✓ |
| Duyệt nghỉ phép | ✓ | ✗ | ✗ | ✗ |
| Xem lương cá nhân | ✓ | ✓ | ✓ | ✓ |
| Quản lý lương | ✓ | ✗ | ✗ | ✗ |
| Quản lý sản phẩm | ✓ | ✓ | Chỉ xem | ✗ |
| Nhập hàng | ✓ | ✓ | ✗ | ✗ |
| Chuyển kho | ✓ | ✓ | ✗ | ✗ |
| Kiểm kê | ✓ | ✓ | ✗ | ✗ |
| Bán hàng POS | ✓ | ✗ | ✓ | ✗ |
| Trả hàng | ✓ | ✗ | ✓ | ✗ |
| Quản lý KH | ✓ | ✗ | ✓ | ✗ |
| Khuyến mãi | ✓ | ✗ | Áp dụng | ✗ |
| Báo cáo | ✓ | Một số | Một số | ✗ |

---

## PHẦN IV: KẾT LUẬN

### 4.1. Tổng hợp số liệu

- **Tổng số module:** 28 modules
- **Tổng số chức năng:** Hơn 200 chức năng
- **Số vai trò chính:** 4 vai trò (Admin, NV Kho, NV Bán hàng, NV Thường)
- **Số nhóm nghiệp vụ:** 8 nhóm chính

### 4.2. Đặc điểm hệ thống

**Ưu điểm:**
- Phân quyền chi tiết, rõ ràng theo vai trò
- Đảm bảo tính toàn vẹn dữ liệu (không xóa các phiếu quan trọng)
- Hỗ trợ kiểm toán qua audit logs
- Tích hợp đa dạng: thanh toán online, loyalty, khuyến mãi

**Nguyên tắc thiết kế:**
- Tuân thủ chuẩn RESTful API
- Áp dụng mô hình CRUD chuẩn
- Phân tách rõ ràng giữa các module nghiệp vụ
- Bảo mật thông qua phân quyền đa cấp

### 4.3. Hướng phát triển

- Mở rộng tích hợp thêm cổng thanh toán
- Phát triển ứng dụng mobile cho nhân viên
- Tích hợp AI để dự báo nhu cầu, tồn kho
- Xây dựng dashboard realtime

---

## PHỤ LỤC

### A. Danh sách Endpoint đầy đủ

Chi tiết 200+ endpoints được liệt kê trong tài liệu kỹ thuật API.

### B. Sơ đồ cơ sở dữ liệu

Xem file ERD kèm theo.

### C. Workflow các nghiệp vụ chính

1. **Quy trình bán hàng:** Mở ca → Tạo hóa đơn → Thanh toán → Đóng ca
2. **Quy trình nhập hàng:** Lập phiếu → Nhập kho → Cập nhật tồn kho
3. **Quy trình chuyển kho:** Tạo phiếu → Duyệt → Xuất/Nhập kho
4. **Quy trình kiểm kê:** Tạo phiếu → Kiểm đếm → Đối chiếu → Hoàn thành

---

**HẾT**

---

*Tài liệu này thuộc quyền sở hữu của nhóm phát triển hệ thống quản lý nhà sách. Mọi sao chép, phân phối cần được phép.*
