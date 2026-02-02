# API HỆ THỐNG HỘI VIÊN & TÍCH ĐIỂM

Base URL: `http://localhost:5000/api/loyalty`

## 📋 MỤC LỤC

1. [Thông tin hội viên](#thông-tin-hội-viên)
2. [Lịch sử điểm](#lịch-sử-điểm)
3. [Tích điểm & sử dụng điểm](#tích-điểm--sử-dụng-điểm)
4. [Quy tắc & ưu đãi](#quy-tắc--ưu-đãi)
5. [Thống kê](#thống-kê)

---

## 🧑‍🤝‍🧑 THÔNG TIN HỘI VIÊN

### 1. Lấy thông tin hội viên theo ID
**GET** `/customer/:customerId`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "MaKH": 1,
    "SDT": "0901234567",
    "Email": "customer@example.com",
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
    "GiaTriDiemHienTai": 250000
  }
}
```

### 2. Tra cứu theo số điện thoại (POS - không cần auth)
**GET** `/customer/phone/:phone`

**Ví dụ:** `/customer/phone/0901234567`

**Response:** Giống như API trên

### 3. Lấy danh sách tất cả hội viên
**GET** `/customers?hang=Bac&minDiem=1000&maxDiem=5000&page=1&limit=20`

**Headers:** Authorization required

**Query Parameters:**
- `hang` (optional): Dong, Bac, Vang, Kim_cuong
- `minDiem` (optional): Điểm tối thiểu
- `maxDiem` (optional): Điểm tối đa
- `page` (default: 1): Trang hiện tại
- `limit` (default: 20): Số bản ghi mỗi trang

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 📜 LỊCH SỬ ĐIỂM

### 4. Lấy lịch sử điểm của khách hàng
**GET** `/history/:customerId?loai=Cong_diem&page=1&limit=20`

**Headers:** Authorization required

**Query Parameters:**
- `loai` (optional): Cong_diem, Tru_diem, Het_han, Dieu_chinh
- `page`, `limit`: Phân trang

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaLS": 1,
      "MaKH": 1,
      "MaHD": 20,
      "LoaiGiaoDich": "Cong_diem",
      "SoDiem": 50,
      "DiemTruoc": 2450,
      "DiemSau": 2500,
      "LyDo": "Tích điểm từ đơn hàng",
      "MoTa": "Mua hàng 500,000đ",
      "NgayGiaoDich": "2026-02-02 14:30:00",
      "NguoiThucHien": 5
    }
  ],
  "pagination": {...}
}
```

---

## 💰 TÍCH ĐIỂM & SỬ DỤNG ĐIỂM

### 5. Tính điểm sẽ được cộng (Preview)
**POST** `/calculate-points`

**Body:**
```json
{
  "tongTien": 500000,
  "maTheLoai": 1,
  "hangTV": "Bac"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tongTien": 500000,
    "diemDuocCong": 55,
    "giaTriDiem": 5500,
    "hangTV": "Bac"
  }
}
```

### 6. Cộng điểm cho khách hàng
**POST** `/add-points`

**Headers:** Authorization required

**Body:**
```json
{
  "maKH": 1,
  "maHD": 20,
  "soDiem": 50,
  "lyDo": "Tích điểm từ đơn hàng",
  "moTa": "Mua hàng 500,000đ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cộng điểm thành công",
  "data": {
    "maKH": 1,
    "soDiem": 50,
    "diemTruoc": 2450,
    "diemSau": 2500
  }
}
```

### 7. Sử dụng điểm thanh toán
**POST** `/use-points`

**Headers:** Authorization required

**Body:**
```json
{
  "maKH": 1,
  "maHD": 25,
  "soDiem": 100,
  "tongTien": 300000,
  "lyDo": "Sử dụng điểm thanh toán",
  "moTa": "Giảm 10,000đ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sử dụng điểm thành công",
  "data": {
    "maKH": 1,
    "soDiemDung": 100,
    "giaTriGiam": 10000,
    "diemConLai": 2400
  }
}
```

**Lỗi khi vượt giới hạn:**
```json
{
  "success": false,
  "message": "Vượt quá giới hạn sử dụng điểm (40% giá trị đơn). Tối đa có thể dùng: 120 điểm"
}
```

### 8. Điều chỉnh điểm thủ công (Admin)
**POST** `/adjust-points`

**Headers:** Authorization required

**Body:**
```json
{
  "maKH": 1,
  "soDiem": 100,
  "lyDo": "Bồi thường khiếu nại",
  "moTa": "Khách hàng phàn nàn về chất lượng dịch vụ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Điều chỉnh điểm thành công",
  "data": {
    "maKH": 1,
    "soDiemDieuChinh": 100,
    "diemTruoc": 2500,
    "diemSau": 2600
  }
}
```

---

## 🎁 QUY TẮC & ƯU ĐÃI

### 9. Lấy quy tắc tích điểm
**GET** `/rules?trangThai=1`

**Query Parameters:**
- `trangThai` (optional): 1 = Hoạt động, 0 = Tắt

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaQT": 1,
      "TenQT": "Quy tắc cơ bản",
      "MoTa": "Mua 10,000đ = 1 điểm",
      "SoTienMua": 10000.00,
      "SoDiem": 1,
      "HeSoNhan": 1.0,
      "ApDungCho": "Tat_ca",
      "TrangThai": 1
    },
    {
      "MaQT": 2,
      "TenQT": "Sách Văn học x1.5",
      "MoTa": "Mua sách văn học được x1.5 điểm",
      "HeSoNhan": 1.5,
      "ApDungCho": "The_loai",
      "MaDoiTuong": 1,
      "TrangThai": 1
    }
  ]
}
```

### 10. Lấy tất cả hạng thành viên
**GET** `/tiers`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaUD": 1,
      "HangTV": "Dong",
      "DiemToiThieu": 0,
      "DiemToiDa": 999,
      "PhanTramGiam": 0,
      "HeSoTichDiem": 1.0,
      "GiamSinhNhat": 5.0,
      "MienPhiShip": 0,
      "ToiDaDungDiem": 30.0,
      "MoTa": "Hạng Đồng - Thành viên mới..."
    },
    {
      "MaUD": 2,
      "HangTV": "Bac",
      "DiemToiThieu": 1000,
      "DiemToiDa": 4999,
      "PhanTramGiam": 5.0,
      "HeSoTichDiem": 1.1,
      "GiamSinhNhat": 10.0,
      "MienPhiShip": 0,
      "ToiDaDungDiem": 40.0,
      "MoTa": "Hạng Bạc - Thành viên thân thiết..."
    }
  ]
}
```

### 11. Lấy ưu đãi của một hạng cụ thể
**GET** `/tier/:tierName`

**Ví dụ:** `/tier/Bac`

**Response:** Trả về thông tin chi tiết 1 hạng

---

## 📊 THỐNG KÊ

### 12. Thống kê tổng quan hệ thống
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
      }
    ],
    "topKhachHang": [
      {
        "MaKH": 5,
        "SDT": "0909123456",
        "TongDiemTichLuy": 25000,
        "HangTV": "Kim_cuong"
      }
    ],
    "giaoDichGanDay": [
      {
        "LoaiGiaoDich": "Cong_diem",
        "SoGiaoDich": 120,
        "TongDiem": 15000
      },
      {
        "LoaiGiaoDich": "Tru_diem",
        "SoGiaoDich": 45,
        "TongDiem": 5000
      }
    ],
    "tongQuan": {
      "TongDiemHienCo": 180000,
      "TongDiemDaPhatHanh": 250000,
      "TongDiemDaSuDung": 70000
    }
  }
}
```

---

## 🔄 FLOW TÍCH HỢP VỚI POS

### Kịch bản 1: Khách hàng mua hàng (tích điểm)

```javascript
// 1. Tra cứu khách hàng theo SĐT
const response1 = await fetch('/api/loyalty/customer/phone/0901234567');
const customer = await response1.json();

// 2. Tính điểm preview
const response2 = await fetch('/api/loyalty/calculate-points', {
  method: 'POST',
  body: JSON.stringify({
    tongTien: cartTotal,
    maTheLoai: primaryCategory,
    hangTV: customer.data.HangTV
  })
});
const pointsPreview = await response2.json();
// Hiển thị: "Bạn sẽ nhận được 55 điểm (5,500đ)"

// 3. Sau khi thanh toán xong, cộng điểm
const response3 = await fetch('/api/loyalty/add-points', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    maKH: customer.data.MaKH,
    maHD: invoiceId,
    soDiem: pointsPreview.data.diemDuocCong,
    lyDo: 'Tích điểm từ đơn hàng',
    moTa: `Đơn hàng ${invoiceId} - ${cartTotal.toLocaleString()}đ`
  })
});
```

### Kịch bản 2: Khách hàng dùng điểm thanh toán

```javascript
// 1. Tra cứu thông tin khách hàng
const customer = await fetch('/api/loyalty/customer/phone/0901234567').then(r => r.json());

// Hiển thị: 
// - Điểm hiện có: 2,500 điểm (250,000đ)
// - Tối đa dùng: 40% giá trị đơn
// - Nếu đơn 300,000đ → Tối đa dùng 120 điểm = 12,000đ

// 2. Khách chọn dùng 100 điểm
const response = await fetch('/api/loyalty/use-points', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    maKH: customer.data.MaKH,
    maHD: invoiceId,
    soDiem: 100,
    tongTien: 300000,
    lyDo: 'Sử dụng điểm thanh toán'
  })
});

// Kết quả: Giảm 10,000đ, còn 2,400 điểm
```

### Kịch bản 3: Áp dụng giảm giá theo hạng

```javascript
// Lấy thông tin hạng
const customer = await fetch('/api/loyalty/customer/phone/0901234567').then(r => r.json());

// Tính giảm giá
const phanTramGiam = customer.data.PhanTramGiam; // VD: 5%
const giaTriGiam = cartTotal * (phanTramGiam / 100);

// Tổng thanh toán
const finalTotal = cartTotal - giaTriGiam - (diemdung * 100);
```

---

## ⚠️ LƯU Ý

### Quy tắc tích điểm:
- 10,000đ = 1 điểm cơ bản
- Hệ số nhân theo hạng: Đồng x1.0, Bạc x1.1, Vàng x1.2, Kim Cương x1.3
- Hệ số nhân theo thể loại/thời gian (nếu có)
- **Công thức:** `Điểm = FLOOR((TongTien / 10000) * HeSoTheLoai * HeSoHang)`

### Giới hạn sử dụng điểm:
- Đồng: Tối đa 30% giá trị đơn
- Bạc: Tối đa 40% giá trị đơn
- Vàng: Tối đa 50% giá trị đơn
- Kim Cương: Không giới hạn (100%)

### Quy đổi:
- **1 điểm = 100đ**
- **100 điểm = 10,000đ**

### Hạng thành viên:
- Đồng: 0-999 điểm
- Bạc: 1,000-4,999 điểm
- Vàng: 5,000-19,999 điểm
- Kim Cương: ≥20,000 điểm

### Auto nâng hạng:
- Trigger tự động chạy khi `TongDiemTichLuy` thay đổi
- Không cần gọi API riêng

---

## 🎯 TESTING

```bash
# Test tích điểm
curl -X POST http://localhost:5000/api/loyalty/calculate-points \
  -H "Content-Type: application/json" \
  -d '{"tongTien": 500000, "hangTV": "Bac"}'

# Test tra cứu
curl http://localhost:5000/api/loyalty/customer/phone/0901234567

# Test lấy quy tắc
curl http://localhost:5000/api/loyalty/rules

# Test lấy hạng
curl http://localhost:5000/api/loyalty/tiers
```
