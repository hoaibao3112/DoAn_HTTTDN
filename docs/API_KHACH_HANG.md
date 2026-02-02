# API QUẢN LÝ KHÁCH HÀNG (Đã tích hợp Loyalty)

Base URL: `http://localhost:5000/api/customers`

## 📋 DANH SÁCH API

### 1. Lấy danh sách khách hàng (có filter)
**GET** `/`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```

**Query Parameters:**
- `search` (optional): Tìm kiếm theo tên, SĐT, email
- `hangTV` (optional): Dong, Bac, Vang, Kim_cuong
- `trangThai` (optional): 1 = Active, 0 = Inactive
- `minDiem` (optional): Điểm tối thiểu
- `maxDiem` (optional): Điểm tối đa
- `page` (default: 1): Trang hiện tại
- `pageSize` (default: 20): Số bản ghi mỗi trang

**Ví dụ:**
```
GET /api/customers?hangTV=Bac&trangThai=1&page=1&pageSize=20
GET /api/customers?search=nguyen&minDiem=1000
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaKH": 1,
      "HoTen": "Nguyễn Văn A",
      "SDT": "0901234567",
      "Email": "nguyenvana@email.com",
      "DiaChi": "123 Đường ABC, Q1, TP.HCM",
      "DiemTichLuy": 2500,
      "TongDiemTichLuy": 3000,
      "DiemDaDung": 500,
      "HangTV": "Bac",
      "NgayThamGia": "2025-01-15",
      "NgayNangHang": "2025-06-20",
      "TongChiTieu": 5000000,
      "TrangThai": 1,
      "PhanTramGiam": 5.00,
      "HeSoTichDiem": 1.10,
      "GiamSinhNhat": 10.00,
      "MienPhiShip": 0,
      "ToiDaDungDiem": 40.00
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 2. Lấy chi tiết khách hàng + lịch sử mua hàng
**GET** `/:id`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "MaKH": 1,
    "HoTen": "Nguyễn Văn A",
    "SDT": "0901234567",
    "Email": "nguyenvana@email.com",
    "DiaChi": "123 Đường ABC",
    "DiemTichLuy": 2500,
    "TongDiemTichLuy": 3000,
    "DiemDaDung": 500,
    "HangTV": "Bac",
    "NgayThamGia": "2025-01-15",
    "NgayNangHang": "2025-06-20",
    "PhanTramGiam": 5.00,
    "HeSoTichDiem": 1.10,
    "GiamSinhNhat": 10.00,
    "MienPhiShip": 0,
    "ToiDaDungDiem": 40.00,
    "DiemCanDeLenHang": 2000,
    "GiaTriDiemHienTai": 250000,
    "TongChiTieu": 5000000,
    "TrangThai": 1,
    "recentOrders": [
      {
        "MaHD": 20,
        "NgayLap": "2026-01-25",
        "TongTien": 500000,
        "TrangThai": "Hoan_thanh",
        "DiemTichLuy": 55,
        "DiemDaDung": 0
      }
    ]
  }
}
```

---

### 3. Tạo khách hàng mới
**POST** `/`

**Headers:** Authorization required

**Body:**
```json
{
  "HoTen": "Trần Thị B",
  "SDT": "0909876543",
  "Email": "tranthib@email.com",
  "DiaChi": "456 Đường XYZ, Q3, TP.HCM"
}
```

**Response:**
```json
{
  "success": true,
  "MaKH": 15,
  "data": {
    "MaKH": 15,
    "HoTen": "Trần Thị B",
    "SDT": "0909876543",
    "Email": "tranthib@email.com",
    "DiaChi": "456 Đường XYZ, Q3, TP.HCM",
    "HangTV": "Dong",
    "DiemTichLuy": 0,
    "TongDiemTichLuy": 0,
    "DiemDaDung": 0,
    "NgayThamGia": "2026-02-02",
    "TrangThai": 1
  },
  "message": "Thêm khách hàng thành công"
}
```

**Lỗi:**
```json
{
  "success": false,
  "message": "Số điện thoại đã tồn tại trong hệ thống"
}
```

---

### 4. Cập nhật thông tin khách hàng
**PUT** `/:id`

**Headers:** Authorization required

**Body:**
```json
{
  "HoTen": "Trần Thị B (Đã sửa)",
  "SDT": "0909876543",
  "Email": "tranthib_new@email.com",
  "DiaChi": "Địa chỉ mới",
  "TrangThai": 1
}
```

**Lưu ý:** 
- Không cho phép sửa điểm trực tiếp (phải qua `/api/loyalty/adjust-points`)
- Hạng thành viên tự động cập nhật dựa vào tổng điểm

**Response:**
```json
{
  "success": true,
  "data": {
    "MaKH": 15,
    "HoTen": "Trần Thị B (Đã sửa)",
    ...
  },
  "message": "Cập nhật thông tin khách hàng thành công"
}
```

---

### 5. Bật/Tắt trạng thái khách hàng
**PATCH** `/:id/toggle-status`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "message": "Vô hiệu hóa khách hàng thành công",
  "trangThai": 0
}
```

---

### 6. Xóa khách hàng
**DELETE** `/:id`

**Headers:** Authorization required

**Điều kiện xóa:**
- Khách hàng chưa có lịch sử mua hàng
- Khách hàng không có điểm tích lũy

**Response thành công:**
```json
{
  "success": true,
  "message": "Xóa khách hàng thành công"
}
```

**Response lỗi:**
```json
{
  "success": false,
  "message": "Không thể xóa khách hàng đã có lịch sử mua hàng. Vui lòng vô hiệu hóa (TrangThai = 0) thay vì xóa."
}
```

---

### 7. Thống kê khách hàng
**GET** `/statistics`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "theoHang": [
      {
        "HangTV": "Dong",
        "SoLuong": 50,
        "TongDiem": 25000,
        "DiemTrungBinh": 500
      },
      {
        "HangTV": "Bac",
        "SoLuong": 30,
        "TongDiem": 90000,
        "DiemTrungBinh": 3000
      },
      {
        "HangTV": "Vang",
        "SoLuong": 15,
        "TongDiem": 150000,
        "DiemTrungBinh": 10000
      },
      {
        "HangTV": "Kim_cuong",
        "SoLuong": 5,
        "TongDiem": 200000,
        "DiemTrungBinh": 40000
      }
    ],
    "khachHangMoi": 12,
    "tongKhachHangActive": 95,
    "tongKhachHangInactive": 5
  }
}
```

---

## 🔄 WORKFLOW TÍCH HỢP

### Tạo khách hàng mới từ POS:
```javascript
// 1. Khách hàng mua lần đầu
const response = await fetch('/api/customers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    HoTen: customerName,
    SDT: phone,
    Email: email
  })
});

const newCustomer = await response.json();
// newCustomer.data.HangTV = "Dong" (mặc định)
// newCustomer.data.DiemTichLuy = 0
```

### Hiển thị danh sách với filter:
```javascript
// Frontend - Component quản lý khách hàng
const [filters, setFilters] = useState({
  search: '',
  hangTV: '',
  trangThai: '1',
  page: 1,
  pageSize: 20
});

const fetchCustomers = async () => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/customers?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  setCustomers(data.data);
  setPagination(data.pagination);
};
```

### Vô hiệu hóa thay vì xóa:
```javascript
// Khi khách hàng đã có lịch sử, dùng toggle status
const toggleStatus = async (customerId) => {
  await fetch(`/api/customers/${customerId}/toggle-status`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Quản lý điểm:
- **KHÔNG** được sửa điểm trực tiếp qua API customers
- Sử dụng API loyalty để:
  - Cộng điểm: `/api/loyalty/add-points`
  - Trừ điểm: `/api/loyalty/use-points`
  - Điều chỉnh: `/api/loyalty/adjust-points`

### Hạng thành viên:
- Tự động cập nhật khi `TongDiemTichLuy` thay đổi (trigger)
- KHÔNG cho phép sửa thủ công

### Xóa vs Vô hiệu hóa:
- **Xóa**: Chỉ dùng cho khách hàng mới tạo nhầm (chưa có giao dịch)
- **Vô hiệu hóa**: Dùng cho khách hàng không còn hoạt động nhưng có lịch sử

### Số điện thoại:
- Là unique key
- Không được trùng lặp
- Dùng để tra cứu nhanh tại POS

---

## 🎯 TESTING

```bash
# Lấy danh sách với filter
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/customers?hangTV=Bac&page=1"

# Tạo khách hàng mới
curl -X POST http://localhost:5000/api/customers \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"HoTen":"Test Customer","SDT":"0999999999"}'

# Toggle status
curl -X PATCH http://localhost:5000/api/customers/1/toggle-status \
  -H "Authorization: Bearer TOKEN"

# Thống kê
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/customers/statistics
```
