# TÀI LIỆU QUY TRÌNH NGHIỆP VỤ HỆ THỐNG WEBSACH
> **Phiên bản:** 2.0 — Cập nhật toàn diện dựa trên source code thực tế  
> **Ngày cập nhật:** 19/04/2026  
> **Hệ thống:** WebSach ERP — Quản trị cửa hàng sách đa chi nhánh

---

## MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Hệ thống phân quyền & bảo mật (RBAC)](#2-hệ-thống-phân-quyền--bảo-mật-rbac)
3. [Quản lý danh mục & tác giả](#3-quản-lý-danh-mục--tác-giả)
4. [Quản lý sản phẩm (Sách)](#4-quản-lý-sản-phẩm-sách)
5. [Quản lý kho & nhập hàng](#5-quản-lý-kho--nhập-hàng)
6. [Chuyển kho & kiểm kê](#6-chuyển-kho--kiểm-kê)
7. [Bán hàng & POS](#7-bán-hàng--pos)
8. [Quản lý hóa đơn](#8-quản-lý-hóa-đơn)
9. [Nhà cung cấp & công nợ](#9-nhà-cung-cấp--công-nợ)
10. [Quản lý nhân sự (HRM)](#10-quản-lý-nhân-sự-hrm)
11. [Chấm công](#11-chấm-công)
12. [Tính lương & lương tháng 13](#12-tính-lương--lương-tháng-13)
13. [Khách hàng & Loyalty](#13-khách-hàng--loyalty)
14. [Khuyến mãi & Voucher](#14-khuyến-mãi--voucher)
15. [Tài chính & chi phí](#15-tài-chính--chi-phí)
16. [Báo cáo & Audit Log](#16-báo-cáo--audit-log)

---

## 1. Tổng quan hệ thống

**WebSach** là hệ thống ERP (Enterprise Resource Planning) thu nhỏ dành riêng cho mô hình cửa hàng sách. Hệ thống tích hợp đầy đủ các luồng nghiệp vụ từ:

- **Frontend Admin** (React.js, port 3000): Giao diện quản trị nội bộ
- **Backend API** (Node.js + Express, port 5000): REST API + WebSocket
- **Database** (MySQL): Lưu trữ toàn bộ dữ liệu
- **Real-time Chat** (WebSocket): Giao tiếp nội bộ giữa nhân viên

### Kiến trúc module

```
WebSach ERP
├── Phân quyền RBAC         
├── Kho hàng (2 lớp: Kho chính → Kho con)
├── POS Bán hàng
├── Nhập hàng & NCC
├── Nhân sự (HRM)
├── Chấm công (+ Tự động hóa Cron)
├── Tính lương + T13
├── Khuyến mãi & Voucher
├── Khách hàng & Loyalty
├── Thanh toán (VNPay)
├── Báo cáo & Thống kê
└── Audit Log
```

---

## 2. Hệ thống phân quyền & bảo mật (RBAC)

### 2.1 Mô hình xác thực

- **JWT (JSON Web Token):** Mọi request đến API đều cần header `Authorization: Bearer <token>`
- **Token hết hạn:** Tự động yêu cầu đăng nhập lại
- **Global 403 Interceptor:** Frontend tự động hiển thị notification khi bị từ chối quyền

### 2.2 Quy trình đăng nhập

```
Nhân viên nhập TenTK/Email + Mật khẩu
  ↓
Server kiểm tra bcrypt hash
  ↓
Kiểm tra tài khoản có bị khóa không (TrangThai)
  ↓
Tạo JWT token (chứa MaTK, TenTK, vai trò)
  ↓
Trả về token → Frontend lưu vào localStorage
  ↓
Tải danh sách quyền theo nhóm tài khoản
```

### 2.3 Quên mật khẩu

```
Nhập email → Gửi mã OTP qua email (6 chữ số, hết hạn 10 phút)
  ↓
Nhập OTP xác thực
  ↓
Đặt mật khẩu mới → Hash bcrypt → Lưu DB
  ↓
Token OTP bị hủy sau khi sử dụng
```

### 2.4 Cấu trúc phân quyền

| Đối tượng | Mô tả |
|-----------|-------|
| **Tài khoản (taikhoan)** | Thông tin đăng nhập |
| **Nhóm Tài khoản (nhom_taikhoan)** | Vai trò: Admin, Kho, Bán hàng, HR, Kế toán |
| **Chức năng (chuc_nang)** | Feature ID: PRODUCTS, POS, SALARY, ATTENDANCE |
| **Quyền (quyen)** | Hành động: Xem, Thêm, Sửa, Xóa, Xuất file, Duyệt |

### 2.5 Ma trận quyền

| Quyền | Mô tả | Áp dụng cho |
|-------|-------|------------|
| **Xem** | Đọc dữ liệu, xem danh sách | Tất cả module |
| **Thêm** | Tạo bản ghi mới | Tất cả module |
| **Sửa** | Cập nhật thông tin | Tất cả module |
| **Xóa** | Xóa/vô hiệu hóa bản ghi | Tất cả module |
| **Xuất File** | Xuất báo cáo Excel/PDF | Báo cáo |
| **Duyệt** | Phê duyệt chứng từ | Nghỉ phép, Lương T13 |

### 2.6 Quản lý tài khoản

- Admin tạo tài khoản → gán nhóm → nhóm có sẵn bộ quyền
- Có thể tùy chỉnh quyền riêng lẻ cho từng tài khoản (ghi đè nhóm)
- Dropdown chức năng trong form sửa quyền chỉ hiển thị chức năng chưa được gán (tránh trùng lặp)

---

## 3. Quản lý danh mục & tác giả

### 3.1 Danh mục sách (Category)

- CRUD: Thêm/Sửa/Xóa danh mục
- Danh mục được dùng để phân loại sản phẩm
- URL: `/admin/category`

### 3.2 Tác giả (Author)

- CRUD: Thêm/Sửa/Xóa tác giả
- Thông tin: Tên, Ngày sinh, Quốc tịch, Tiểu sử, Hình ảnh
- **Upload ảnh:** File ảnh được lưu vào `server/uploads/tacgia/`
- **Hiển thị ảnh:** URL dạng `http://localhost:5000/uploads/tacgia/filename.jpg`
- DB lưu đường dẫn tương đối: `/uploads/tacgia/filename.jpg`
- URL: `/admin/authorities`

---

## 4. Quản lý sản phẩm (Sách)

### 4.1 Thông tin sản phẩm

| Trường | Mô tả |
|--------|-------|
| Mã sách | Tự động sinh hoặc nhập tay |
| Tên sách | Bắt buộc |
| Tác giả, Danh mục, NXB | Liên kết bảng tham chiếu |
| Giá nhập | Dùng để tính lợi nhuận |
| Giá bán | Giá bán lẻ thực tế |
| Tỷ lệ lợi nhuận | Giá bán = Giá nhập × (1 + %) |
| Trạng thái | Bình thường / Cần nhập thêm / Hết hàng |
| Hình ảnh | Upload lên server |

### 4.2 Trạng thái tồn kho

```
SoLuong > NgưỡngTốiThiểu  → "Bình thường"
SoLuong <= NgưỡngTốiThiểu  → "Cần nhập thêm"
SoLuong = 0               → "Hết hàng"
```

### 4.3 Tạo mã vạch (Barcode)

- Chức năng tạo và in barcode cho từng sản phẩm
- Hỗ trợ quét barcode tại POS để tìm sản phẩm nhanh
- URL: `/admin/barcode-generator`

---

## 5. Quản lý kho & nhập hàng

### 5.1 Cấu trúc kho 2 lớp

```
Cửa hàng (Chi nhánh)
  └── Kho con 1 (Priority=1: Kho Quầy - hàng bán trực tiếp)
  └── Kho con 2 (Priority=2: Kho Dự trữ)
  └── Kho con N (Priority=N: Kho phụ thêm)
```

### 5.2 Logic khấu trừ tồn kho khi bán

```
Bán sản phẩm X tại POS
  ↓
Kiểm tra Kho Quầy (Priority=1)
  ├── Còn đủ hàng → Trừ tại Kho Quầy
  └── Không đủ   → Tìm Kho Dự trữ theo Priority tăng dần
```

### 5.3 Quy trình nhập hàng (Phiếu nhập)

```
Nhân viên kho chọn nhà cung cấp
  ↓
Thêm sản phẩm + số lượng vào phiếu
  ↓
Chọn phân bổ kho: Tự động (theo Priority) hoặc Thủ công (chọn kho cụ thể)
  ↓
Cập nhật giá nhập mới (nếu thay đổi) → Tính lại giá bán
  ↓
Xác nhận nhập → Cập nhật số lượng tồn kho
  ↓
Ghi nhận công nợ với NCC
  ↓
Lưu Audit Log
```

**Nghiệp vụ quan trọng:**
- Mỗi phiếu nhập tăng `SoLuong` trong bảng `ton_kho`
- Giá nhập mới → Giá bán mới = `Giá nhập × (1 + TyLeLoiNhuan)`
- Công nợ NCC tăng theo giá trị phiếu nhập

---

## 6. Chuyển kho & kiểm kê

### 6.1 Chuyển kho (Stock Transfer)

```
Tạo phiếu chuyển kho:
  - Chọn kho nguồn, kho đích
  - Chọn sản phẩm + số lượng
  ↓
Hệ thống kiểm tra kho nguồn có đủ số lượng không
  ├── Không đủ → Báo lỗi
  └── Đủ → Trừ SoLuong tại kho nguồn + Cộng tại kho đích
  ↓
Lưu lịch sử + Ghi Audit Log
```

- URL: `/admin/stock-transfer`

### 6.2 Kiểm kê kho (Inventory Check)

```
Tạo phiếu kiểm kê:
  1. Chọn kho cần kiểm kê
  2. Hệ thống liệt kê sản phẩm với SoLuong_SoSach
  3. Nhân viên nhập SoLuong_ThucTe từng mặt hàng
  ↓
Hệ thống tính: Chenh_Lech = ThucTe - SoSach
  ↓
Xác nhận → Cập nhật SoLuong về số thực tế + Ghi nhận điều chỉnh
```

- URL: `/admin/inventory-check`

---

## 7. Bán hàng & POS

### 7.1 Quản lý phiên bán hàng (POS Session)

| Bước | Hành động | Mô tả |
|------|-----------|-------|
| Mở phiên | Khai báo tiền mặt đầu ca | Ghi nhận TienDauCa |
| Trong phiên | Thực hiện bán hàng | Cộng dồn tự động |
| Đóng phiên | Kiểm đếm tiền thực tế | So sánh LyThuyet vs ThucTe |
| Chênh lệch | Hệ thống tự tính | Chenh_Lech = ThucTe - LyThuyet |

### 7.2 Quy trình lập hóa đơn tại POS

```
Quét mã vạch / tìm kiếm sản phẩm
  ↓
Thêm vào giỏ hàng (điều chỉnh số lượng, giảm giá từng dòng)
  ↓
Nhập thông tin khách hàng (nếu có thẻ thành viên)
  ↓
Áp dụng khuyến mãi / voucher
  ↓
Dùng điểm Loyalty? (1 điểm = 1.000đ)
  ↓
Tính tiền:
  ThanhToan = TongGoc - GiamDong - GiamHoaDon - DiemQuyDoi
  ↓
Chọn phương thức: Tiền mặt / VNPay
  ↓
Xác nhận → Tạo hóa đơn → Trừ tồn kho → Cộng điểm Loyalty
```

### 7.3 Thanh toán VNPay

- Tích hợp cổng VNPay (sandbox mode)
- Tạo URL thanh toán → Redirect khách đến cổng VNPay
- Callback xác thực chữ ký HMAC-SHA512 sau khi thanh toán
- Cập nhật trạng thái đơn hàng tự động

### 7.4 Trả hàng (Return)

```
Chọn hóa đơn gốc → Chọn sản phẩm + số lượng trả
  ↓
Hoàn tiền → Tăng tồn kho về kho quầy
```

- URL: `/admin/pos`

---

## 8. Quản lý hóa đơn

- Xem danh sách toàn bộ hóa đơn đã phát hành
- Tìm kiếm theo ngày, khách hàng, trạng thái
- Xem chi tiết từng hóa đơn (sản phẩm, giá, chiết khấu)
- In hóa đơn
- Lọc theo: Hoàn thành / Đã hủy / Đã trả hàng
- URL: `/admin/invoices`

---

## 9. Nhà cung cấp & công nợ

### 9.1 Quản lý nhà cung cấp

- CRUD: Tên, địa chỉ, SĐT, email, mã số thuế
- Xem lịch sử giao dịch (các phiếu nhập đã mua)
- URL: `/admin/company`

### 9.2 Theo dõi công nợ (Supplier Debts)

```
Mỗi phiếu nhập hàng → Công nợ NCC tăng
  ↓
Admin/Kế toán ghi nhận thanh toán cho NCC
  ↓
Công nợ NCC giảm
  ↓
Báo cáo công nợ theo thời gian
```

- Xem tổng nợ hiện tại từng NCC
- Lịch sử các lần thanh toán
- Cảnh báo công nợ quá hạn
- URL: `/admin/supplier-debts`

---

## 10. Quản lý nhân sự (HRM)

### 10.1 Thông tin nhân viên

| Trường | Chi tiết |
|--------|----------|
| Mã NV | Tự động sinh |
| Họ tên, SĐT, Email | Thông tin cơ bản |
| Chức vụ | Vị trí công việc |
| Ca làm việc (MaCa) | Liên kết bảng `ca_lam_viec` |
| Ngày vào làm | Tính thâm niên & lương T13 |
| Ngày nghỉ việc | NULL nếu đang làm |
| Lương cơ bản | Tính lương hàng tháng |
| Phụ cấp chịu thuế | Tính vào thu nhập chịu thuế TNCN |
| Phụ cấp không chịu thuế | Trả thêm không tính thuế |
| Số người phụ thuộc | Giảm trừ gia cảnh thuế TNCN |
| Tình trạng | 1 = Đang làm / 0 = Đã nghỉ |
| Ảnh đại diện | Upload vào `uploads/nhanvien/` |

### 10.2 Quy trình xin nghỉ phép

```
Nhân viên nộp đơn xin nghỉ (chọn loại + ngày)
  ↓
Loại "Nghỉ phép hưởng lương" → Kiểm tra quota còn lại (12 ngày/năm)
  ├── Hết quota → Báo lỗi
  └── Còn quota → Trạng thái: "Cho_duyet"
  ↓
Quản lý/HR xem xét
  ├── Duyệt → "Da_duyet" → Hệ thống cập nhật chấm công
  └── Từ chối → "Tu_choi"
  ↓
Nếu loại = "Nghỉ việc" → Khóa tài khoản + Cập nhật TinhTrang NV = 0
```

**Các loại nghỉ và quy tắc lương:**

| Loại nghỉ | Hưởng lương | Quota | Ghi chú |
|-----------|------------|-------|---------|
| Nghỉ phép | 100% | 12 ngày/năm | Trừ quota khi duyệt |
| Nghỉ không lương | 0% | Không giới hạn | - |
| Nghỉ bệnh (Công ty) | 100% | ≤ 2 ngày | Nghỉ ngắn hạn |
| Ốm đau (BHXH) | BHXH trả | - | Hồ sơ bảo hiểm riêng |
| Thai sản | BHXH trả | - | Không tính công ty |
| Nghỉ việc | - | - | Khóa tài khoản ngay |

- URL: `/admin/leave`

### 10.3 Hồ sơ cá nhân (Profile)

- NV tự xem/cập nhật thông tin cá nhân
- Xem lịch sử chấm công, lương, đơn nghỉ của bản thân
- Đổi ảnh đại diện
- URL: `/admin/profile`

---

## 11. Chấm công

### 11.1 Các trạng thái chấm công

| Trạng thái | Tính lương | Ghi chú |
|-----------|------------|---------|
| `Di_lam` | Có | - |
| `Tre` | Có | Phạt 20.000đ/lần |
| `Ve_som` | Có | Phạt nếu cấu hình |
| `Tre_Ve_som` | Có | Phạt cả 2 |
| `Lam_them` | Có | Hệ số 1.5/2.0/3.0 |
| `Nghi_phep` | Có | - |
| `Thai_san` | Không | BHXH trả |
| `Om_dau` | Không | BHXH trả |
| `Nghi_khong_phep` | Không | Vi phạm |

### 11.2 Check-in

```
NV chấm vào → Server lấy MaNV từ JWT
  ↓
Kiểm tra: Không phải ngày tương lai, chưa chấm hôm nay
  ↓
So sánh giờ chấm với GioBatDau ca:
  Đúng giờ hoặc sớm → TrangThai = "Di_lam"
  Muộn hơn 5-15 phút → TrangThai = "Tre"
```

### 11.3 Check-out

```
NV chấm ra → Tính TongPhut = GioRa - GioVao
  ↓
Tách giờ chuẩn và tăng ca:
  GioRa > GioKetThuc_Ca  → OT = GioRa - GioKetThuc
  GioRa <= GioKetThuc_Ca → OT = 0
  ↓
Trừ giờ nghỉ: Nếu làm > 5h → Trừ giờ nghỉ ca (mặc định 60 phút)
  ↓
Xác định trạng thái ra:
  GioRa < GioKetThuc → Ve_som (hoặc Tre_Ve_som nếu vào muộn)
```

### 11.4 Chấm công quản trị (Admin)

- Xem lịch dạng bảng tháng (tất cả nhân viên)
- Click vào ô ngày → Gán trạng thái đã chọn
- Shift + click → Chọn nhiều ngày cùng lúc
- Lưu thay đổi → Bắt buộc nhập lý do chỉnh sửa
- Double-click ô đã chấm → Xem lịch sử chỉnh sửa
- Giới hạn sửa: Trong 30 ngày gần nhất

### 11.5 Tự động hóa chấm công (Cron Jobs)

| Thời gian | Hành động |
|-----------|-----------|
| **18:00 hàng ngày** | Phát hiện NV quên chấm ra → Log cảnh báo |
| **23:59 hàng ngày** | Tự động đánh `Nghi_khong_phep` cho NV chưa chấm |
| **23:58 ngày cuối tháng** | Tự động điền chấm công cả tháng (fill hàng loạt) |
| **00:01 ngày 1 hàng tháng** | Tạo báo cáo bất thường tháng trước |

**Logic tự động điền cuối tháng:**
```
Quét ngày làm việc trong tháng (trừ CN, trừ tương lai)
  ↓ skip ngày đã có bản ghi
  ↓ Có đơn nghỉ phép duyệt → "Nghi_phep"
  ↓ Không có → "Nghi_khong_phep"
  → Batch INSERT 1 query
```

### 11.6 Ngày lễ

- Admin quản lý danh sách ngày lễ với Hệ số lương (mặc định 2.0)
- NV làm ngày lễ: Tính lương × HeSoLuong
- Hiển thị trực quan trên lịch chấm công

---

## 12. Tính lương & lương tháng 13

### 12.1 Công thức tính lương tháng

**Bước 1: Ngày công chuẩn**
```
Ngày công chuẩn = Tổng ngày trong tháng - Thứ 7 - Chủ nhật - Ngày lễ
```

**Bước 2: Ngày Payable (có lương)**
```
Payable = Di_lam + Tre + Ve_som + Nghi_phep + Nghi_benh_cty
Unpaid  = Nghi_khong_phep + Nghi_khong_luong + Thai_san + Om_dau_BHXH
```

**Bước 3: Lương thời gian**
```
LuongThoiGian = (LuongCoBan / NgayChuan) × (SoNgayPayable + SoNgayLe)
```

**Bước 4: Tăng ca**
```
GioLuong = LuongCoBan / (NgayChuan × 8h)
OT_ThuungNgay = SoGio × (GioLuong × 1.5)
OT_CuoiTuan   = SoGio × (GioLuong × 2.0)
OT_NgayLe     = SoGio × (GioLuong × 3.0)
```

**Bước 5: Thưởng chuyên cần (+200.000đ) — cần ĐỦ 3 điều kiện:**
- Làm đủ 100% ngày công chuẩn
- Không có lần đi trễ/về sớm/nghỉ không phép
- Nghỉ bệnh (Công ty trả) ≤ 2 ngày

**Bước 6: Phạt**
```
PhatTre = SoLanTre × 20.000đ
```

**Bước 7: Bảo hiểm (NV đóng 10.5%)**
```
BHXH = LuongCoBan × 8%
BHYT = LuongCoBan × 1.5%
BHTN = LuongCoBan × 1%
```

**Bước 8: Thuế TNCN — Lũy tiến 7 bậc**

| Bậc | Thu nhập sau giảm trừ | Thuế suất | Khấu trừ |
|-----|----------------------|-----------|---------|
| 1 | ≤ 5.000.000đ | 5% | 0 |
| 2 | ≤ 10.000.000đ | 10% | 250.000đ |
| 3 | ≤ 18.000.000đ | 15% | 750.000đ |
| 4 | ≤ 32.000.000đ | 20% | 1.650.000đ |
| 5 | ≤ 52.000.000đ | 25% | 3.250.000đ |
| 6 | ≤ 80.000.000đ | 30% | 5.850.000đ |
| 7 | > 80.000.000đ | 35% | 9.850.000đ |

```
Giảm trừ bản thân          = 11.000.000đ/tháng
Giảm trừ người phụ thuộc   = 4.400.000đ/người/tháng
ThuNhapTinhThue = ThuNhapChiuThue - GiamTru
```

**Công thức tổng:**
```
TongThucLinh = LuongThoiGian + OT + ThuongChuyenCan + PhuCap
             - PhatTre - BaoHiem - ThueTNCN
```

### 12.2 Quy trình tính lương hàng tháng

```
Admin chọn Tháng/Năm → Nhấn "Tính lương"
  ↓
Server tổng hợp dữ liệu chấm công → Hiển thị bảng dự kiến
  ↓
Nhấn "Chốt bảng lương" → INSERT vào bảng `luong`
  ↓
Đánh dấu từng NV "Đã chi trả" sau khi chuyển tiền
```

- URL: `/admin/salary`

### 12.3 Lương tháng 13

**Điều kiện: Làm đủ 12 tháng trong năm quyết toán**

**Tính số tháng công (làm tròn 0.5):**
```
SoThangCong = (NgayNghi hoặc 31/12) - MAX(NgayVaoLam, 01/01)
  Quy tắc: < 15 ngày = 0 tháng; >= 15 ngày = +0.5 tháng
  Tối đa = 12 tháng
```

**Quy tắc khấu trừ vi phạm (Trễ + Nghỉ không phép):**

| Số lần vi phạm | Khấu trừ |
|---------------|---------|
| 0 – 10 lần | 0% (nhận đủ 100%) |
| 11 – 20 lần | Trừ 10% |
| 21 – 30 lần | Trừ 20% |
| 31 – 50 lần | Trừ 30% |
| > 50 lần | Trừ 100% (mất thưởng) |

**Công thức:**
```
ThuongGross = LuongCoBan × (SoThangCong/12) × (1 - TyLeKhauTru)
ThueTNCN    = Thuế thêm phát sinh do khoản T13
ThuongNet   = ThuongGross - ThueTNCN
```

**Quy trình lương tháng 13:**
```
1. Xem trước → Tính dự kiến tất cả NV đủ điều kiện
2. Chốt bảng lương → INSERT vào DB (Thang=13)
3. Duyệt chi trả → TrangThai = "Da_chi_tra"
4. Rollback → Chỉ xóa được bản ghi "Chua_chi_tra"
```

---

## 13. Khách hàng & Loyalty

### 13.1 Quản lý khách hàng

- CRUD: Họ tên, SĐT, Email, Địa chỉ
- Tìm kiếm tại POS bằng SĐT
- Xem lịch sử mua hàng
- URL: `/admin/client`

### 13.2 Hệ thống điểm tích lũy

**Tích điểm:**
```
Sau mỗi hóa đơn hoàn thành:
  Điểm tích = 1% × (Tổng tiền thanh toán / 1.000)
```

**Quy đổi điểm:**
```
1 điểm = 1.000đ giảm trên hóa đơn
Không vượt quá tổng tiền hóa đơn
```

**Hạng thành viên (tự động theo tổng chi tiêu):**

| Hạng | Ngưỡng |
|------|--------|
| Đồng | Mặc định |
| Bạc | Ngưỡng 1 |
| Vàng | Ngưỡng 2 |
| Kim cương | Ngưỡng cao nhất |

---

## 14. Khuyến mãi & Voucher

### 14.1 Chương trình khuyến mãi

- Tạo chiến dịch có thời gian bắt đầu/kết thúc
- Áp dụng theo: % giảm giá, giảm giá cố định, mua X tặng Y
- Bật/Tắt linh hoạt mà không cần xóa
- URL: `/admin/khuyenmai`

### 14.2 Mã giảm giá (Voucher)

```
Admin tạo voucher (mã, giá trị, điều kiện tối thiểu, hạn sử dụng)
  ↓
Khách nhập mã tại POS → Validate:
  - Mã tồn tại?
  - Còn hạn sử dụng?
  - Đủ giá trị tối thiểu?
  - Chưa dùng rồi?
  ↓
Áp dụng giảm giá → Lưu lịch sử sử dụng
```

### 14.3 Thống kê khuyến mãi

- Hiệu quả từng chương trình (số lần dùng, tổng giảm giá)
- Lịch sử sử dụng
- Top khách hàng dùng khuyến mãi nhiều nhất

---

## 15. Tài chính & chi phí

### 15.1 Quản lý chi phí (Expenses)

- Ghi nhận khoản chi vận hành (điện, nước, thuê mặt bằng...)
- Phân loại theo danh mục chi phí (tự tạo)
- Xem tổng hợp chi phí theo kỳ

### 15.2 Báo cáo tài chính tổng hợp

```
Doanh thu     = Σ TongTien các hóa đơn hoàn thành
Giá vốn       = Σ (GiaNhap × SoLuong) sản phẩm đã bán
Lợi nhuận gộp = Doanh thu - Giá vốn
Chi phí NV    = Σ TongLuong tháng
Chi phí khác  = Σ Expenses vận hành
Lợi nhuận ròng = Lợi nhuận gộp - Chi phí NV - Chi phí khác
```

---

## 16. Báo cáo & Audit Log

### 16.1 Báo cáo thống kê (Statistical)

- **Doanh thu:** Theo ngày/tuần/tháng/năm, theo chi nhánh, theo NV
- **Sản phẩm bán chạy:** Top N theo doanh số
- **Tồn kho chậm:** Hàng tồn kho lâu ngày
- **Nhân sự:** Phân bổ theo chức vụ/chi nhánh
- **Lương:** Tổng quỹ lương, trung bình lương
- URL: `/admin/statistical`

### 16.2 Báo cáo chấm công bất thường

| Chỉ tiêu | Mô tả |
|---------|-------|
| Số lần đi trễ | Tính trong tháng |
| Số lần về sớm | Tính trong tháng |
| Quên chấm công ra | Vào mà không có giờ ra |
| Tổng giờ tăng ca | OT trong tháng |

### 16.3 Audit Log (Nhật ký hoạt động)

**Mọi hành động Thêm/Sửa/Xóa đều được ghi:**

| Trường | Nội dung |
|--------|---------|
| MaTK | Người thực hiện |
| HanhDong | "Them" / "Sua" / "Xoa" / "CheckIn"... |
| BangDuLieu | Tên bảng bị tác động |
| MaBanGhi | ID bản ghi |
| DuLieuCu | JSON dữ liệu trước khi sửa |
| DuLieuMoi | JSON dữ liệu sau khi sửa |
| DiaChi_IP | IP người thực hiện |
| ThoiGian | Timestamp tự động |

- Lọc theo: Người dùng, Hành động, Bảng, Thời gian
- URL: `/admin/audit-logs`

### 16.4 Chat nội bộ (Real-time)

- Nhân viên/Khách hàng chat 1-1 qua WebSocket
- Lưu lịch sử tin nhắn vào DB
- Hỗ trợ tư vấn khách hàng trực tuyến

---

## PHỤ LỤC: Bản đồ URL hệ thống Admin

| URL | Trang | Quyền yêu cầu |
|-----|-------|--------------|
| `/admin` | Dashboard | Đăng nhập |
| `/admin/products` | Quản lý sản phẩm | PRODUCTS |
| `/admin/category` | Danh mục | CATEGORIES |
| `/admin/authorities` | Tác giả | AUTHORS |
| `/admin/receipt` | Phiếu nhập hàng | PURCHASE_ORDERS |
| `/admin/stock-transfer` | Chuyển kho | STOCK |
| `/admin/inventory-check` | Kiểm kê | INVENTORY_CHECK |
| `/admin/sub-warehouses` | Kho con | STOCK |
| `/admin/barcode-generator` | Tạo mã vạch | POS |
| `/admin/pos` | Bán hàng POS | POS |
| `/admin/invoices` | Hóa đơn | INVOICES |
| `/admin/company` | Nhà cung cấp | SUPPLIERS |
| `/admin/supplier-debts` | Công nợ NCC | SUPPLIERS |
| `/admin/client` | Khách hàng | CUSTOMERS |
| `/admin/khuyenmai` | Khuyến mãi | PROMOTIONS |
| `/admin/users` | Nhân viên | EMPLOYEES |
| `/admin/attendance` | Chấm công | ATTENDANCE |
| `/admin/leave` | Nghỉ phép | LEAVE |
| `/admin/salary` | Lương | SALARY |
| `/admin/account` | Tài khoản & Quyền | USERS |
| `/admin/roles` | Nhóm quyền | ROLES |
| `/admin/statistical` | Thống kê | REPORTS |
| `/admin/audit-logs` | Nhật ký | AUDIT_LOGS |
| `/admin/profile` | Hồ sơ cá nhân | Đăng nhập |

---

*Tài liệu được cập nhật dựa trên source code thực tế của CNPM_WebSach.*  
*Mọi thay đổi logic nghiệp vụ cần được cập nhật đồng bộ vào tài liệu này.*
