# API KHUYẾN MÃI - HƯỚNG DẪN SỬ DỤNG

Base URL: `http://localhost:5000/api/promotions`

---

## 1. QUẢN LÝ CHƯƠNG TRÌNH KHUYẾN MÃI

### 1.1 Lấy danh sách tất cả khuyến mãi
```http
GET /api/promotions/promotions
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaKM": 1,
      "TenKM": "Giảm 10% cho đơn từ 500k",
      "LoaiKM": "giam_phan_tram",
      "GiaTriGiam": 10.00,
      "GiamToiDa": 100000.00,
      "GiaTriDonToiThieu": 500000.00,
      "NgayBatDau": "2026-02-01T00:00:00.000Z",
      "NgayKetThuc": "2026-12-31T23:59:59.000Z",
      "TrangThai": 1,
      "SoLanDung": 125,
      "TongTienGiam": 5250000.00
    }
  ]
}
```

### 1.2 Lấy chi tiết một khuyến mãi
```http
GET /api/promotions/promotions/:id
Authorization: Bearer {token}
```

### 1.3 Tạo chương trình khuyến mãi mới
```http
POST /api/promotions/promotions
Authorization: Bearer {token}
Content-Type: application/json

{
  "TenKM": "Giảm 20% Black Friday",
  "MoTa": "Khuyến mãi đặc biệt Black Friday",
  "LoaiKM": "giam_phan_tram",
  "GiaTriGiam": 20.00,
  "GiamToiDa": 200000.00,
  "GiaTriDonToiThieu": 500000.00,
  "NgayBatDau": "2026-11-25 00:00:00",
  "NgayKetThuc": "2026-11-30 23:59:59",
  "ApDungCho": "Tat_ca",
  "MaCH": null,
  "ChiTiet": [],
  "MaGiamGia": [
    {
      "MaCode": "BLACKFRIDAY",
      "SoLuongPhatHanh": 100,
      "SoLanDungMoiKH": 1,
      "ApDungChoKHMoi": 0
    }
  ]
}
```

### 1.4 Cập nhật khuyến mãi
```http
PUT /api/promotions/promotions/:id
Authorization: Bearer {token}
Content-Type: application/json
```

### 1.5 Xóa khuyến mãi
```http
DELETE /api/promotions/promotions/:id
Authorization: Bearer {token}
```

### 1.6 Bật/Tắt khuyến mãi
```http
PATCH /api/promotions/promotions/:id/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "TrangThai": 0  // 0: Tắt, 1: Bật
}
```

---

## 2. QUẢN LÝ MÃ GIẢM GIÁ

### 2.1 Lấy tất cả mã giảm giá
```http
GET /api/promotions/vouchers
Authorization: Bearer {token}
```

### 2.2 Tạo mã giảm giá mới
```http
POST /api/promotions/vouchers
Authorization: Bearer {token}
Content-Type: application/json

{
  "MaKM": 1,
  "MaCode": "NEWYEAR2026",
  "SoLuongPhatHanh": 500,
  "SoLanDungMoiKH": 1,
  "ApDungChoKHMoi": 0
}
```

### 2.3 Xóa mã giảm giá
```http
DELETE /api/promotions/vouchers/:id
Authorization: Bearer {token}
```

---

## 3. ÁP DỤNG KHUYẾN MÃI TẠI POS

### 3.1 Kiểm tra khuyến mãi có thể áp dụng
```http
POST /api/promotions/check-available
Authorization: Bearer {token}
Content-Type: application/json

{
  "MaCH": 1,
  "TongTien": 550000,
  "MaKH": 1,
  "ChiTiet": [
    {
      "MaSP": 1,
      "DonGia": 115000,
      "SoLuong": 3
    },
    {
      "MaSP": 5,
      "DonGia": 135000,
      "SoLuong": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaKM": 1,
      "TenKM": "Giảm 10% cho đơn từ 500k",
      "LoaiKM": "giam_phan_tram",
      "GiaTriGiam": 10.00,
      "giaTriGiamDuKien": 55000,
      "tongSauGiam": 495000
    },
    {
      "MaKM": 3,
      "TenKM": "Giờ vàng giảm 15%",
      "LoaiKM": "giam_gio_vang",
      "GiaTriGiam": 15.00,
      "giaTriGiamDuKien": 82500,
      "tongSauGiam": 467500
    }
  ]
}
```

### 3.2 Kiểm tra mã giảm giá
```http
POST /api/promotions/validate-voucher
Authorization: Bearer {token}
Content-Type: application/json

{
  "MaCode": "TET2026",
  "MaCH": 1,
  "TongTien": 550000,
  "MaKH": 1,
  "ChiTiet": [
    {
      "MaSP": 1,
      "DonGia": 115000,
      "SoLuong": 3
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mã giảm giá hợp lệ",
  "data": {
    "MaKM": 5,
    "MaMGG": 2,
    "TenKM": "Sale Tết Bính Ngọ 2026",
    "LoaiKM": "giam_phan_tram",
    "GiaTriGiam": 110000,
    "TongSauGiam": 440000
  }
}
```

### 3.3 Lưu lịch sử sử dụng khuyến mãi
```http
POST /api/promotions/save-usage
Authorization: Bearer {token}
Content-Type: application/json

{
  "MaHD": 45,
  "MaKM": 5,
  "MaMGG": 2,
  "MaKH": 1,
  "LoaiKM": "giam_phan_tram",
  "GiaTriGiam": 110000,
  "TongTienTruocGiam": 550000,
  "TongTienSauGiam": 440000
}
```

---

## 4. BÁO CÁO & THỐNG KÊ

### 4.1 Thống kê hiệu quả khuyến mãi
```http
GET /api/promotions/statistics?startDate=2026-02-01&endDate=2026-02-28&MaKM=1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaKM": 1,
      "TenKM": "Giảm 10% cho đơn từ 500k",
      "LoaiKM": "giam_phan_tram",
      "SoDonHang": 125,
      "SoKhachHang": 89,
      "TongTienGiam": 5250000,
      "TongDoanhThuTruocGiam": 65000000,
      "TongDoanhThuSauGiam": 59750000,
      "GiaTriGiamTrungBinh": 42000
    }
  ]
}
```

### 4.2 Lịch sử sử dụng khuyến mãi
```http
GET /api/promotions/history?page=1&limit=50&MaKM=1
Authorization: Bearer {token}
```

### 4.3 Top khách hàng sử dụng khuyến mãi
```http
GET /api/promotions/top-customers?startDate=2026-02-01&endDate=2026-02-28&limit=10
Authorization: Bearer {token}
```

---

## 5. LUỒNG SỬ DỤNG TẠI POS

### Bước 1: Nhân viên quét sản phẩm
```javascript
const cart = {
  items: [
    { MaSP: 1, DonGia: 115000, SoLuong: 3 },
    { MaSP: 5, DonGia: 135000, SoLuong: 2 }
  ],
  tongTien: 615000
};
```

### Bước 2: Hệ thống tự động kiểm tra khuyến mãi
```javascript
const response = await fetch('/api/promotions/check-available', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    MaCH: 1,
    TongTien: cart.tongTien,
    MaKH: customer?.MaKH,
    ChiTiet: cart.items
  })
});

const { data: availablePromotions } = await response.json();
// Hiển thị danh sách KM cho nhân viên chọn
```

### Bước 3: Nhân viên/Khách nhập mã (nếu có)
```javascript
const voucherResponse = await fetch('/api/promotions/validate-voucher', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    MaCode: 'TET2026',
    MaCH: 1,
    TongTien: cart.tongTien,
    MaKH: customer?.MaKH,
    ChiTiet: cart.items
  })
});

const voucherResult = await voucherResponse.json();
if (voucherResult.success) {
  // Áp dụng mã giảm giá
  selectedPromotion = voucherResult.data;
}
```

### Bước 4: Tạo hóa đơn với khuyến mãi
```javascript
// 1. Tạo hóa đơn
const invoiceResponse = await fetch('/api/sales/invoices', {
  method: 'POST',
  body: JSON.stringify({
    MaKH: customer?.MaKH,
    MaCH: 1,
    ChiTiet: cart.items,
    GiamGia: selectedPromotion.GiaTriGiam,
    TongTien: cart.tongTien,
    ThanhToan: cart.tongTien - selectedPromotion.GiaTriGiam
  })
});

const { MaHD } = await invoiceResponse.json();

// 2. Lưu lịch sử khuyến mãi
await fetch('/api/promotions/save-usage', {
  method: 'POST',
  body: JSON.stringify({
    MaHD: MaHD,
    MaKM: selectedPromotion.MaKM,
    MaMGG: selectedPromotion.MaMGG,
    MaKH: customer?.MaKH,
    LoaiKM: selectedPromotion.LoaiKM,
    GiaTriGiam: selectedPromotion.GiaTriGiam,
    TongTienTruocGiam: cart.tongTien,
    TongTienSauGiam: cart.tongTien - selectedPromotion.GiaTriGiam
  })
});
```

---

## 6. VÍ DỤ FRONTEND (REACT)

```jsx
import React, { useState, useEffect } from 'react';

function POSPromotion({ cart, onApplyPromotion }) {
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  // Tự động kiểm tra khuyến mãi khi giỏ hàng thay đổi
  useEffect(() => {
    if (cart.items.length > 0) {
      checkAvailablePromotions();
    }
  }, [cart]);

  const checkAvailablePromotions = async () => {
    const response = await fetch('/api/promotions/check-available', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        MaCH: 1,
        TongTien: cart.tongTien,
        ChiTiet: cart.items
      })
    });
    const result = await response.json();
    setAvailablePromotions(result.data);
    
    // Tự động chọn KM tốt nhất
    if (result.data.length > 0) {
      setSelectedPromotion(result.data[0]);
      onApplyPromotion(result.data[0]);
    }
  };

  const applyVoucher = async () => {
    const response = await fetch('/api/promotions/validate-voucher', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        MaCode: voucherCode,
        MaCH: 1,
        TongTien: cart.tongTien,
        ChiTiet: cart.items
      })
    });
    const result = await response.json();
    
    if (result.success) {
      setSelectedPromotion(result.data);
      onApplyPromotion(result.data);
      alert('Áp dụng mã thành công!');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="promotion-section">
      <h3>Khuyến mãi</h3>
      
      {/* Nhập mã */}
      <div className="voucher-input">
        <input 
          type="text" 
          placeholder="Nhập mã giảm giá"
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value)}
        />
        <button onClick={applyVoucher}>Áp dụng</button>
      </div>

      {/* Danh sách KM có thể áp dụng */}
      {availablePromotions.length > 0 && (
        <div className="available-promotions">
          <h4>Khuyến mãi khả dụng:</h4>
          {availablePromotions.map(promo => (
            <div 
              key={promo.MaKM}
              className={selectedPromotion?.MaKM === promo.MaKM ? 'selected' : ''}
              onClick={() => {
                setSelectedPromotion(promo);
                onApplyPromotion(promo);
              }}
            >
              <strong>{promo.TenKM}</strong>
              <span>Giảm: {promo.giaTriGiamDuKien.toLocaleString()}đ</span>
            </div>
          ))}
        </div>
      )}

      {/* Hiển thị KM đang áp dụng */}
      {selectedPromotion && (
        <div className="applied-promotion">
          <p>Đang áp dụng: <strong>{selectedPromotion.TenKM}</strong></p>
          <p>Giảm giá: <strong>{selectedPromotion.GiaTriGiam.toLocaleString()}đ</strong></p>
        </div>
      )}
    </div>
  );
}
```

---

Hoàn thành! Backend khuyến mãi đã sẵn sàng sử dụng.
