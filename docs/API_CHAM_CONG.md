# API CHẤM CÔNG (ATTENDANCE API)

## Base URL
```
http://localhost:5000/api/attendance_admin
```

## Authentication
Tất cả các API đều yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

---

## 1. CHẤM CÔNG CƠ BẢN (Employee Self-Service)

### 1.1. Lấy lịch sử chấm công của tôi
**GET** `/my-attendance`

**Query Parameters:**
- `startDate` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `endDate` (optional): Ngày kết thúc (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaCC": 1,
      "MaNV": 10,
      "MaCa": 1,
      "Ngay": "2026-02-04",
      "GioVao": "08:15:00",
      "GioRa": "17:30:00",
      "SoGioLam": 8.75,
      "SoGioTangCa": 0,
      "TrangThai": "Di_lam",
      "GhiChu": null,
      "DiaChi_IP": "192.168.1.100"
    }
  ]
}
```

### 1.2. Check In (Chấm công vào)
**POST** `/checkin`

**Body:**
```json
{
  "Ngay": "2026-02-04",  // Optional, mặc định hôm nay
  "GioVao": "08:15:00",  // Optional, mặc định giờ hiện tại
  "GhiChu": "Đi làm đúng giờ"  // Optional
}
```

**Validations:**
- ✅ Không được chấm công cho ngày tương lai
- ✅ Giờ check-in phải trong khoảng 2h trước đến 4h sau giờ vào ca
- ✅ Không được chấm công vào 2 lần trong cùng 1 ngày
- ✅ Tự động xác định trạng thái: `Di_lam` hoặc `Tre`
- ✅ Kiểm tra ngày lễ tự động

**Response:**
```json
{
  "success": true,
  "MaCC": 123,
  "message": "Chấm công thành công",
  "data": {
    "Ngay": "2026-02-04",
    "GioVao": "08:15:00",
    "TrangThai": "Di_lam",
    "MaCa": 1,
    "NgayLe": false
  }
}
```

### 1.3. Check Out (Chấm công ra)
**POST** `/checkout`

**Body:**
```json
{
  "Ngay": "2026-02-04",  // Optional, mặc định hôm nay
  "GioRa": "17:30:00",   // Optional, mặc định giờ hiện tại
  "SoGioTangCa": 0,      // Optional, 0-12 giờ
  "GhiChu": "Hoàn thành công việc"  // Optional
}
```

**Validations:**
- ✅ Phải chấm công vào trước khi chấm công ra
- ✅ Không được chấm công ra 2 lần
- ✅ Số giờ làm không quá 16 giờ (phát hiện lỗi)
- ✅ Tự động trừ phút nghỉ nếu làm >5 giờ
- ✅ Số giờ tăng ca từ 0-12 giờ
- ✅ Xử lý ca qua đêm tự động
- ✅ Cập nhật trạng thái: `Ve_som`, `Tre_Ve_som`

**Response:**
```json
{
  "success": true,
  "message": "Chấm công ra thành công",
  "data": {
    "Ngay": "2026-02-04",
    "GioRa": "17:30:00",
    "SoGioLam": "8.75",
    "SoGioTangCa": 0,
    "TrangThai": "Di_lam",
    "PhutNghiTru": 60
  }
}
```

---

## 2. QUẢN LÝ CHẤM CÔNG (HR Manager)

### 2.1. Lấy danh sách chấm công (Có phân trang)
**GET** `/attendance`

**Query Parameters:**
- `page` (default: 1): Trang hiện tại
- `pageSize` (default: 20): Số bản ghi mỗi trang
- `MaNV` (optional): Lọc theo mã nhân viên
- `startDate` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `endDate` (optional): Ngày kết thúc (YYYY-MM-DD)
- `TrangThai` (optional): Lọc theo trạng thái

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}
```

### 2.2. Tạo bản ghi chấm công thủ công
**POST** `/attendance`

**Permissions:** `ATTENDANCE.CREATE`

**Body:**
```json
{
  "MaNV": 10,
  "Ngay": "2026-02-04",
  "GioVao": "08:00:00",
  "GioRa": "17:00:00",      // Optional
  "SoGioLam": 8.0,          // Optional
  "SoGioTangCa": 0,         // Optional
  "TrangThai": "Di_lam",
  "GhiChu": "Bổ sung chấm công",
  "MaCa": 1                 // Optional
}
```

**Response:**
```json
{
  "success": true,
  "MaCC": 124,
  "message": "Tạo bản ghi chấm công thành công"
}
```

### 2.3. Cập nhật chấm công
**PUT** `/attendance/:id`

**Permissions:** `ATTENDANCE.UPDATE`

**Body:**
```json
{
  "GioVao": "08:10:00",     // Optional
  "GioRa": "17:30:00",      // Optional
  "SoGioLam": 8.5,          // Optional (tự tính nếu đổi giờ)
  "SoGioTangCa": 1.5,       // Optional
  "TrangThai": "Di_lam",    // Optional
  "GhiChu": "Cập nhật giờ vào",
  "LyDoSua": "Nhân viên quên chấm công"  // BẮT BUỘC
}
```

**Validations:**
- ✅ Chỉ được sửa trong 30 ngày (trừ admin)
- ✅ Bắt buộc nhập lý do sửa
- ✅ Số giờ tăng ca 0-12 giờ
- ✅ Tự động lưu lịch sử chỉnh sửa

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật chấm công thành công"
}
```

### 2.4. Xóa bản ghi chấm công
**DELETE** `/attendance/:id`

**Permissions:** `ATTENDANCE.DELETE`

**Response:**
```json
{
  "success": true,
  "message": "Xóa bản ghi chấm công thành công"
}
```

---

## 3. BÁO CÁO CHẤM CÔNG

### 3.1. Tổng hợp chấm công theo tháng
**GET** `/attendance/summary`

**Query Parameters:**
- `MaNV` (optional): Mã nhân viên
- `month` (required): Tháng (1-12)
- `year` (required): Năm (YYYY)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaNV": 10,
      "TongNgayChamCong": 22,
      "SoNgayDiLam": 20,
      "SoNgayTre": 2,
      "SoNgayVeSom": 1,
      "SoNgayNghiPhep": 1,
      "SoNgayNghiKhongPhep": 0,
      "SoNgayThaiSan": 0,
      "SoNgayOmDau": 0,
      "TongGioLam": 176.5,
      "TongGioTangCa": 8.5
    }
  ]
}
```

### 3.2. Chi tiết chấm công hàng tháng (Dạng lịch)
**GET** `/attendance/monthly` hoặc `/monthly`

**Query Parameters:**
- `month` (required): Tháng (1-12)
- `year` (required): Năm (YYYY)

**Response:**
```json
[
  {
    "MaNV": 10,
    "HoTen": "Nguyễn Văn A",
    "ChucVu": "Nhân viên",
    "days": {
      "1": {
        "id": 100,
        "trang_thai": "Di_lam",
        "gio_vao": "08:15:00",
        "gio_ra": "17:30:00",
        "so_gio_lam": 8.75,
        "so_gio_tang_ca": 0
      },
      "2": {
        "id": 101,
        "trang_thai": "Tre",
        "gio_vao": "08:45:00",
        "gio_ra": "17:30:00",
        "so_gio_lam": 8.25,
        "so_gio_tang_ca": 0
      }
    }
  }
]
```

### 3.3. Báo cáo chấm công bất thường
**GET** `/attendance/report/abnormal`

**Query Parameters:**
- `year` (optional): Năm (YYYY)
- `month` (optional): Tháng (1-12)
- `MaNV` (optional): Mã nhân viên

**Description:**
Sử dụng view `v_cham_cong_bat_thuong` để lấy báo cáo tổng hợp:
- Số lần đi trễ
- Số lần về sớm
- Số lần quên chấm ra
- Tổng giờ tăng ca

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaNV": 10,
      "HoTen": "Nguyễn Văn A",
      "Nam": 2026,
      "Thang": 2,
      "SoLanTre": 3,
      "SoLanVeSom": 1,
      "QuenChamRa": 0,
      "TongGioTangCa": 12.5,
      "TongNgayChamCong": 20
    }
  ]
}
```

---

## 4. LỊCH SỬ CHỈNH SỬA CHẤM CÔNG

### 4.1. Xem lịch sử chỉnh sửa
**GET** `/attendance/:MaCC/history`

**Query Parameters:**
- `page` (default: 1): Trang hiện tại
- `pageSize` (default: 20): Số bản ghi mỗi trang

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaLS": 1,
      "MaCC": 123,
      "NguoiSua": 5,
      "TenTK": "admin",
      "Email": "admin@example.com",
      "NgaySua": "2026-02-04T10:30:00.000Z",
      "TruocKhi": {
        "GioVao": "08:00:00",
        "GioRa": "17:00:00",
        "TrangThai": "Di_lam"
      },
      "SauKhi": {
        "GioVao": "08:15:00",
        "GioRa": "17:30:00",
        "TrangThai": "Di_lam"
      },
      "LyDo": "Cập nhật giờ thực tế theo camera",
      "DiaChi_IP": "192.168.1.50"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 5
  }
}
```

---

## 5. TỰ ĐỘNG ĐÁNH VẮNG (AUTO MARK ABSENT)

### 5.1. Kích hoạt thủ công đánh vắng
**POST** `/attendance/mark-absent`

**Permissions:** `ATTENDANCE.CREATE`

**Body:**
```json
{
  "Ngay": "2026-02-03"
}
```

**Description:**
- Gọi stored procedure `sp_auto_mark_absent` để tự động đánh vắng cho tất cả nhân viên chưa chấm công trong ngày
- Kiểm tra đơn nghỉ phép đã duyệt → Trạng thái `Nghi_phep`
- Không có đơn nghỉ phép → Trạng thái `Nghi_khong_phep`
- Cron job tự động chạy lúc 23:59 hàng ngày

**Response:**
```json
{
  "success": true,
  "message": "Đã tự động đánh vắng mặt cho ngày 2026-02-03"
}
```

---

## 6. QUẢN LÝ NGÀY LỄ

### 6.1. Lấy danh sách ngày lễ
**GET** `/holidays`

**Query Parameters:**
- `year` (optional): Năm (YYYY)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaNgayLe": 1,
      "TenNgayLe": "Tết Dương lịch",
      "Ngay": "2026-01-01",
      "HeSoLuong": 2.0,
      "LoaiNgayLe": "Quoc_gia",
      "GhiChu": null
    },
    {
      "MaNgayLe": 2,
      "TenNgayLe": "Tết Nguyên Đán (Mùng 1)",
      "Ngay": "2026-01-29",
      "HeSoLuong": 3.0,
      "LoaiNgayLe": "Tet",
      "GhiChu": null
    }
  ]
}
```

### 6.2. Thêm ngày lễ
**POST** `/holidays`

**Permissions:** `ATTENDANCE.CREATE`

**Body:**
```json
{
  "TenNgayLe": "Quốc khánh",
  "Ngay": "2026-09-02",
  "HeSoLuong": 2.0,         // Optional, mặc định 2.0
  "LoaiNgayLe": "Quoc_gia", // Optional: Quoc_gia, Tet, Khac
  "GhiChu": "Lễ quốc khánh 2/9"
}
```

**Response:**
```json
{
  "success": true,
  "MaNgayLe": 10,
  "message": "Thêm ngày lễ thành công"
}
```

### 6.3. Cập nhật ngày lễ
**PUT** `/holidays/:id`

**Permissions:** `ATTENDANCE.UPDATE`

**Body:**
```json
{
  "TenNgayLe": "Quốc khánh Việt Nam",
  "HeSoLuong": 2.5,
  "GhiChu": "Cập nhật hệ số lương"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật ngày lễ thành công"
}
```

### 6.4. Xóa ngày lễ
**DELETE** `/holidays/:id`

**Permissions:** `ATTENDANCE.DELETE`

**Response:**
```json
{
  "success": true,
  "message": "Xóa ngày lễ thành công"
}
```

---

## 7. CRON JOBS TỰ ĐỘNG

### 7.1. Auto Mark Absent (23:59 hàng ngày)
- **Schedule:** `59 23 * * *` (23:59 mỗi ngày)
- **Function:** Tự động đánh vắng cho nhân viên chưa chấm công
- **Logic:** Gọi `sp_auto_mark_absent` với ngày hôm nay

### 7.2. Reset Daily Stats (00:01 hàng ngày)
- **Schedule:** `1 0 * * *` (00:01 mỗi ngày)
- **Function:** Reset các thống kê hàng ngày nếu cần
- **Status:** Placeholder cho tương lai

### 7.3. Weekly Report (Thứ 2 lúc 08:00)
- **Schedule:** `0 8 * * 1` (8:00 sáng thứ 2)
- **Function:** Tạo báo cáo tuần tự động
- **Status:** Placeholder cho tương lai

---

## 8. TRẠNG THÁI CHẤM CÔNG (TrangThai)

| Trạng thái | Mô tả |
|-----------|-------|
| `Di_lam` | Đi làm đúng giờ |
| `Tre` | Đi trễ |
| `Ve_som` | Về sớm |
| `Tre_Ve_som` | Đi trễ VÀ về sớm |
| `Nghi_phep` | Nghỉ phép có đơn được duyệt |
| `Nghi_khong_phep` | Vắng mặt không phép |
| `Thai_san` | Nghỉ thai sản |
| `Om_dau` | Nghỉ ốm/đau |
| `Vang` | Vắng mặt (deprecated, dùng Nghi_khong_phep) |

---

## 9. PERMISSIONS REQUIRED

| API Endpoint | Feature | Permission |
|-------------|---------|-----------|
| GET `/my-attendance` | - | Authenticated |
| POST `/checkin` | - | Authenticated |
| POST `/checkout` | - | Authenticated |
| GET `/attendance` | ATTENDANCE | VIEW |
| POST `/attendance` | ATTENDANCE | CREATE |
| PUT `/attendance/:id` | ATTENDANCE | UPDATE |
| DELETE `/attendance/:id` | ATTENDANCE | DELETE |
| GET `/attendance/summary` | ATTENDANCE | VIEW |
| GET `/attendance/monthly` | ATTENDANCE | VIEW |
| GET `/attendance/:MaCC/history` | ATTENDANCE | VIEW |
| GET `/attendance/report/abnormal` | ATTENDANCE | VIEW |
| POST `/attendance/mark-absent` | ATTENDANCE | CREATE |
| GET `/holidays` | ATTENDANCE | VIEW |
| POST `/holidays` | ATTENDANCE | CREATE |
| PUT `/holidays/:id` | ATTENDANCE | UPDATE |
| DELETE `/holidays/:id` | ATTENDANCE | DELETE |

---

## 10. ERROR CODES

| Status Code | Message |
|------------|---------|
| 400 | Validation error (thiếu dữ liệu, dữ liệu không hợp lệ) |
| 401 | Unauthorized (chưa đăng nhập) |
| 403 | Forbidden (không có quyền) |
| 404 | Not found (không tìm thấy bản ghi) |
| 500 | Internal server error |

---

## 11. NOTES

### 11.1. Tính giờ làm tự động
- Tự động trừ `PhutNghi` (mặc định 60 phút) nếu làm >5 giờ
- Xử lý ca qua đêm tự động (VD: 22:00 → 06:00 = 8 giờ)
- Giới hạn tối đa 16 giờ để phát hiện lỗi

### 11.2. Ngày lễ
- Check-in tự động phát hiện ngày lễ
- Hệ số lương ngày lễ lưu trong bảng `ngay_le`
- Tích hợp vào tính lương sau này

### 11.3. Audit Log
- Mọi thao tác đều được ghi log vào `lich_su_cham_cong`
- Lưu trữ IP address, user, thời gian, dữ liệu cũ/mới

### 11.4. Cron Job Setup
- Import `setupAttendanceCronJobs` trong `server.js`
- Tự động chạy khi server start
- Timezone: Asia/Ho_Chi_Minh (UTC+7)
