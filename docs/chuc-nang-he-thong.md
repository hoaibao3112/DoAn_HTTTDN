# DANH SÁCH CHỨC NĂNG HỆ THỐNG QUẢN LÝ NHÀ SÁCH

> **Mục đích**: Tài liệu này liệt kê tất cả các chức năng trong hệ thống để vẽ sơ đồ DFD (Data Flow Diagram)

---

## 1. MODULE HỆ THỐNG (SYSTEM MANAGEMENT)

### 1.1. Quản lý Đăng nhập & Xác thực
- **Đăng nhập** - Login với tài khoản và mật khẩu
- **Đăng xuất** - Logout khỏi hệ thống
- **Quên mật khẩu** - Gửi OTP qua email
- **Xác thực OTP** - Verify OTP để reset password
- **Đặt lại mật khẩu** - Reset password sau khi xác thực OTP
- **Đổi mật khẩu** - Change password cho user đã đăng nhập

### 1.2. Quản lý Tài khoản (User Management)
- **Xem danh sách tài khoản** - Lấy tất cả tài khoản
- **Tạo tài khoản mới** - Thêm user mới
- **Cập nhật tài khoản** - Sửa thông tin user
- **Reset mật khẩu tài khoản** - Admin reset password cho user khác
- **Xem thông tin profile** - Lấy thông tin cá nhân
- **Cập nhật profile** - Sửa thông tin cá nhân

### 1.3. Quản lý Vai trò (Role Management)
- **Xem danh sách vai trò** - Lấy tất cả roles
- **Xem vai trò theo ID** - Chi tiết một role
- **Tạo/Lưu vai trò** - Thêm hoặc cập nhật role
- **Xóa vai trò** - Delete role
- **Xem quyền của vai trò** - Lấy permissions của một role
- **Xem danh sách vai trò active** - Lấy roles đang hoạt động
- **Xem functions** - Lấy danh sách các chức năng hệ thống

### 1.4. Quản lý Quyền (Permission Management)
- **Xem tất cả quyền** - Lấy danh sách permissions
- **Xem quyền theo vai trò** - Lấy permissions của một role
- **Xem features** - Lấy danh sách các features
- **Tạo quyền** - Thêm permission mới
- **Cập nhật quyền** - Sửa permission
- **Xóa quyền** - Delete permission
- **Xem quyền của user hiện tại** - Lấy permissions của user đang login

### 1.5. Audit Logs (Nhật ký hoạt động)
- **Xem nhật ký hoạt động** - Lấy audit logs của hệ thống

---

## 2. MODULE QUẢN LÝ NHÂN SỰ (HR MANAGEMENT)

### 2.1. Quản lý Nhân viên (Employee Management)
- **Xem danh sách nhân viên** - Lấy tất cả employees
- **Thêm nhân viên mới** - Create employee
- **Cập nhật thông tin nhân viên** - Update employee
- **Xóa nhân viên** - Delete employee
- **Thay đổi chức vụ** - Change position của nhân viên
- **Thống kê nhân viên** - Báo cáo thống kê employees

### 2.2. Quản lý Chấm công (Attendance Management)
- **Xem chấm công của tôi** - Lấy attendance của user hiện tại
- **Check-in** - Điểm danh vào ca
- **Check-out** - Điểm danh ra ca
- **Xem danh sách chấm công** - Lấy tất cả attendance records
- **Thêm bản ghi chấm công** - Create attendance record (admin)
- **Cập nhật chấm công** - Update attendance record
- **Xóa bản ghi chấm công** - Delete attendance record
- **Xem tổng hợp chấm công** - Summary attendance
- **Xem chấm công theo tháng** - Monthly attendance
- **Xem lịch sử chấm công nhân viên** - History by employee ID
- **Báo cáo chấm công bất thường** - Abnormal attendance report
- **Đánh dấu vắng mặt** - Mark absent

### 2.3. Quản lý Nghỉ phép (Leave Management)
- **Xin nghỉ phép** - Employee tạo leave request
- **Xem đơn nghỉ của tôi** - Lấy my leave requests
- **Xem danh sách đơn nghỉ** - Lấy tất cả leave requests (admin)
- **Duyệt đơn nghỉ** - Approve/reject leave request

### 2.4. Quản lý Lương (Salary Management)
- **Xem lương của tôi** - Lấy my salary info
- **Xem lịch sử lương của tôi** - My salary history
- **Tính lương** - Calculate salary cho tháng
- **Xem lương theo tháng** - Monthly salary details
- **Xem lương theo năm** - Yearly salary details
- **Xem chi tiết lương nhân viên** - Salary detail by employee
- **Thanh toán lương** - Pay salary cho một nhân viên
- **Thanh toán lương hàng loạt** - Pay all salaries
- **In phiếu lương tháng** - Print monthly salary slip
- **In phiếu lương năm** - Print yearly salary slip
- **Báo cáo lương** - Salary report
- **Báo cáo thưởng** - Bonus report

### 2.5. Quản lý Ngày nghỉ lễ (Holidays Management)
- **Xem danh sách ngày lễ** - Lấy tất cả holidays
- **Thêm ngày lễ** - Create holiday
- **Cập nhật ngày lễ** - Update holiday
- **Xóa ngày lễ** - Delete holiday

---

## 3. MODULE QUẢN LÝ KHO (WAREHOUSE MANAGEMENT)

### 3.1. Quản lý Sản phẩm (Product Management)
- **Xem danh sách sản phẩm** - Lấy tất cả products
- **Xem chi tiết sản phẩm** - Get product by ID
- **Thêm sản phẩm mới** - Create product
- **Cập nhật sản phẩm** - Update product
- **Xóa sản phẩm** - Delete product
- **Tạo mã vạch** - Generate barcode cho sản phẩm

### 3.2. Quản lý Tác giả (Author Management)
- **Xem danh sách tác giả** - Lấy tất cả authors
- **Thêm tác giả** - Create author
- **Cập nhật tác giả** - Update author
- **Xóa tác giả** - Delete author

### 3.3. Quản lý Thể loại (Category Management)
- **Xem danh sách thể loại** - Lấy tất cả categories
- **Thêm thể loại** - Create category
- **Cập nhật thể loại** - Update category
- **Xóa thể loại** - Delete category

### 3.4. Quản lý Nhà xuất bản (Publisher Management)
- **Xem danh sách nhà xuất bản** - Lấy tất cả publishers

### 3.5. Quản lý Nhập hàng (Purchase Order Management)
- **Xem danh sách phiếu nhập** - Lấy tất cả purchase orders
- **Xem chi tiết phiếu nhập** - Get purchase order by ID
- **Tạo phiếu nhập hàng** - Create purchase order

### 3.6. Quản lý Tồn kho (Stock Management)
- **Xem tồn kho** - Lấy stock hiện tại
- **Xem tồn kho quầy** - Counter stock
- **Cảnh báo tồn kho** - Stock alerts (sản phẩm sắp hết)
- **Xem tồn kho theo kho con** - Stock by sub-warehouse

### 3.7. Quản lý Kho con (Sub-Warehouse Management)
- **Xem danh sách kho con** - Lấy tất cả sub-warehouses
- **Thêm kho con** - Create sub-warehouse
- **Cập nhật kho con** - Update sub-warehouse
- **Xóa kho con** - Delete sub-warehouse

### 3.8. Quản lý Chuyển kho (Stock Transfer)
- **Xem danh sách chuyển kho** - Lấy tất cả transfers
- **Xem chi tiết chuyển kho** - Get transfer by ID
- **Tạo phiếu chuyển kho** - Create transfer
- **Duyệt chuyển kho** - Approve transfer
- **Hủy chuyển kho** - Cancel transfer

### 3.9. Kiểm kê (Inventory Check)
- **Xem danh sách phiếu kiểm kê** - Lấy tất cả inventory checks
- **Xem chi tiết kiểm kê** - Get inventory check by ID
- **Tạo phiếu kiểm kê** - Create inventory check
- **Hoàn thành kiểm kê** - Complete inventory check

---

## 4. MODULE QUẢN LÝ NHÀ CUNG CẤP (SUPPLIER MANAGEMENT)

### 4.1. Quản lý Nhà cung cấp
- **Xem danh sách nhà cung cấp** - Lấy tất cả suppliers
- **Xem chi tiết nhà cung cấp** - Get supplier by ID
- **Thêm nhà cung cấp** - Create supplier
- **Cập nhật nhà cung cấp** - Update supplier
- **Xóa nhà cung cấp** - Delete supplier

### 4.2. Quản lý Công nợ NCC (Supplier Debts)
- **Xem tất cả công nợ** - Lấy all debts
- **Xem công nợ theo NCC** - Get debts by supplier
- **Ghi nhận thanh toán công nợ** - Record debt payment

---

## 5. MODULE BÁN HÀNG (SALES MANAGEMENT)

### 5.1. Quản lý Ca làm việc (Session Management)
- **Mở ca** - Open session
- **Đóng ca** - Close session

### 5.2. Quản lý Bán hàng POS
- **Tạo hóa đơn** - Create invoice (POS)
- **Tìm kiếm khách hàng** - Search customers
- **Thêm khách hàng nhanh** - Quick add customer

### 5.3. Quản lý Hóa đơn (Invoice Management)
- **Xem danh sách hóa đơn** - Lấy tất cả invoices
- **Xem chi tiết hóa đơn** - Get invoice by ID
- **Cập nhật trạng thái hóa đơn** - Update invoice status
- **Hủy hóa đơn** - Cancel invoice

### 5.4. Quản lý Trả hàng (Return Management)
- **Xem danh sách phiếu trả** - Lấy tất cả returns
- **Xem chi tiết phiếu trả** - Get return by ID
- **Tạo phiếu trả hàng** - Create return
- **Duyệt trả hàng** - Approve return

---

## 6. MODULE QUẢN LÝ KHÁCH HÀNG (CUSTOMER MANAGEMENT)

### 6.1. Quản lý Khách hàng
- **Xem danh sách khách hàng** - Lấy tất cả customers
- **Xem chi tiết khách hàng** - Get customer by ID
- **Thêm khách hàng** - Create customer
- **Cập nhật khách hàng** - Update customer
- **Xóa khách hàng** - Delete customer
- **Thống kê khách hàng** - Customer statistics

### 6.2. Chương trình Khách hàng thân thiết (Loyalty Program)
- **Xem thông tin loyalty khách hàng** - Get customer loyalty info
- **Xem tất cả khách hàng loyalty** - Get all customers loyalty
- **Xem lịch sử điểm** - Points history
- **Tính điểm tích lũy** - Calculate points
- **Xem quy tắc tích điểm** - Get points rules
- **Xem cấp bậc thành viên** - Get membership tiers
- **Xem lợi ích theo cấp** - Get tier benefits
- **Thêm điểm** - Add points
- **Sử dụng điểm** - Use points (redeem)
- **Điều chỉnh điểm** - Adjust points (admin)
- **Thống kê loyalty** - Loyalty statistics
- **Tìm khách hàng theo SĐT** - Find customer by phone

---

## 7. MODULE KHUYẾN MÃI (PROMOTION MANAGEMENT)

### 7.1. Quản lý Chương trình khuyến mãi
- **Xem danh sách khuyến mãi** - Lấy tất cả promotions
- **Xem chi tiết khuyến mãi** - Get promotion by ID
- **Thêm khuyến mãi** - Create promotion
- **Cập nhật khuyến mãi** - Update promotion
- **Xóa khuyến mãi** - Delete promotion
- **Kiểm tra khuyến mãi khả dụng** - Check available promotions
- **Lưu lịch sử sử dụng khuyến mãi** - Save promotion usage

### 7.2. Quản lý Voucher
- **Xem danh sách voucher** - Lấy tất cả vouchers
- **Tạo voucher** - Create voucher
- **Xóa voucher** - Delete voucher
- **Xác thực voucher** - Validate voucher

### 7.3. Báo cáo Khuyến mãi
- **Thống kê khuyến mãi** - Promotion statistics
- **Lịch sử sử dụng khuyến mãi** - Promotion history
- **Top khách hàng sử dụng** - Top customers using promotions

---

## 8. MODULE BÁO CÁO & THỐNG KÊ (REPORTS)

### 8.1. Báo cáo Doanh thu
- **Doanh thu theo năm** - Revenue by year
- **Doanh thu theo tháng** - Revenue by month
- **Doanh thu theo ngày** - Revenue by day
- **Doanh thu theo khoảng thời gian** - Revenue by date range

### 8.2. Báo cáo Bán hàng
- **Báo cáo bán hàng theo sản phẩm** - Sales report by product
- **Báo cáo bán hàng theo thể loại** - Sales report by category

### 8.3. Báo cáo Khách hàng
- **Báo cáo khách hàng theo khoảng thời gian** - Customer report by date range

---

## 9. MODULE TÀI CHÍNH (FINANCE MANAGEMENT)

### 9.1. Quản lý Chi phí
- **Xem danh sách chi phí** - Lấy tất cả expenses
- **Xem chi tiết chi phí** - Get expense by ID
- **Thêm chi phí** - Create expense
- **Cập nhật chi phí** - Update expense
- **Xóa chi phí** - Delete expense
- **Tóm tắt chi phí** - Expense summary

### 9.2. Quản lý Danh mục chi phí
- **Xem danh mục chi phí** - Lấy expense categories
- **Thêm danh mục chi phí** - Create expense category
- **Cập nhật danh mục chi phí** - Update expense category

---

## 10. MODULE QUẢN LÝ CHI NHÁNH (BRANCH MANAGEMENT)

- **Xem danh sách chi nhánh** - Lấy tất cả branches
- **Cập nhật chi nhánh** - Update branch

---

## 11. MODULE THANH TOÁN (PAYMENT GATEWAY)

### 11.1. Thanh toán trực tuyến
- **Tạo URL thanh toán VNPay** - Create VNPay payment URL
- **Tạo thanh toán MoMo** - Create MoMo payment
- **Tạo thanh toán ZaloPay** - Create ZaloPay payment

---

## 12. MODULE CHAT (CUSTOMER SUPPORT)

- **Xem số tin nhắn chưa đọc** - Get unread message count (admin)
- **Xem phòng chat chưa đọc** - Get unread chat rooms (admin)

---

## PHÂN LOẠI THEO VAI TRÒ NGƯỜI DÙNG

### Admin / Quản lý
- Quản lý toàn bộ hệ thống
- Quản lý tài khoản, vai trò, quyền
- Xem tất cả báo cáo, thống kê
- Duyệt các phiếu (chuyển kho, trả hàng, nghỉ phép)
- Quản lý nhân sự, lương, chấm công

### Nhân viên kho
- Quản lý sản phẩm
- Nhập hàng
- Kiểm kê
- Chuyển kho
- Xem tồn kho

### Nhân viên bán hàng
- Bán hàng POS
- Tạo hóa đơn
- Trả hàng
- Quản lý khách hàng
- Áp dụng khuyến mãi

### Nhân viên thường
- Xem profile cá nhân
- Chấm công (check-in/check-out)
- Xin nghỉ phép
- Xem lương của mình

---

## CÁC THỰC THỂ CHÍNH (ENTITIES) TRONG HỆ THỐNG

1. **Tài khoản** (Accounts/Users)
2. **Vai trò** (Roles)
3. **Quyền** (Permissions)
4. **Nhân viên** (Employees)
5. **Chấm công** (Attendance)
6. **Nghỉ phép** (Leave Requests)
7. **Lương** (Salary)
8. **Sản phẩm** (Products)
9. **Tác giả** (Authors)
10. **Thể loại** (Categories)
11. **Nhà xuất bản** (Publishers)
12. **Kho** (Warehouses)
13. **Kho con** (Sub-Warehouses)
14. **Tồn kho** (Stock)
15. **Phiếu nhập** (Purchase Orders)
16. **Chuyển kho** (Transfers)
17. **Kiểm kê** (Inventory Checks)
18. **Nhà cung cấp** (Suppliers)
19. **Công nợ NCC** (Supplier Debts)
20. **Khách hàng** (Customers)
21. **Hóa đơn** (Invoices)
22. **Chi tiết hóa đơn** (Invoice Details)
23. **Trả hàng** (Returns)
24. **Chi tiết trả hàng** (Return Details)
25. **Khuyến mãi** (Promotions)
26. **Voucher** (Vouchers)
27. **Điểm tích lũy** (Loyalty Points)
28. **Cấp bậc thành viên** (Membership Tiers)
29. **Chi phí** (Expenses)
30. **Danh mục chi phí** (Expense Categories)
31. **Chi nhánh** (Branches)
32. **Ca làm việc** (Sessions)
33. **Nhật ký hoạt động** (Audit Logs)

---

## GHI CHÚ VẼ DFD

### Mức 0 (Context Diagram)
- Hệ thống ở trung tâm
- Các actor: Admin, Nhân viên kho, Nhân viên bán hàng, Nhân viên thường, Khách hàng
- Luồng dữ liệu chính giữa actors và hệ thống

### Mức 1 (Level 1 DFD)
Chia thành các process chính:
1. Quản lý hệ thống (Tài khoản, Vai trò, Quyền)
2. Quản lý nhân sự (Nhân viên, Chấm công, Lương, Nghỉ phép)
3. Quản lý kho (Sản phẩm, Tồn kho, Nhập hàng, Chuyển kho)
4. Quản lý bán hàng (POS, Hóa đơn, Trả hàng)
5. Quản lý khách hàng (Khách hàng, Loyalty)
6. Quản lý khuyến mãi (Promotion, Voucher)
7. Quản lý nhà cung cấp (Suppliers, Công nợ)
8. Báo cáo & Thống kê
9. Quản lý tài chính (Chi phí)

### Mức 2 (Level 2 DFD)
Chi tiết hóa từng process ở mức 1 thành các sub-process cụ thể (theo danh sách chức năng ở trên)

---

**Ngày tạo**: 09/03/2026  
**Phiên bản**: 1.0
