# 📋 Hướng dẫn sử dụng dữ liệu test Tháng 3/2026

## 📌 Tóm tắt

Các file migration này cung cấp dữ liệu test hoàn chỉnh cho việc tính lương tháng 3/2026 với các tình huống khác nhau:

### ✨ File tạo ra:
1. **`seed_march_2026_salary.sql`** - Dữ liệu SQL thô (công chứng, thưởng/phạt, ngày lễ)
2. **`seed_march_2026_salary.js`** - Script Node.js tự động chạy migration

---

## 🚀 Cách sử dụng

### Cách 1: Chạy Script Node.js (Khuyến khích)

**Từ thư mục gốc dự án:**

```bash
cd server
node src/migrations/seed_march_2026_salary.js
```

**Điều này sẽ:**
- ✅ Chèn dữ liệu công chứng (21 ngày cho mỗi nhân viên)
- ✅ Thêm thưởng/phạt thủ công
- ✅ Thêm ngày lễ (8/3 Quốc tế Phụ nữ)
- ✅ Hiển thị báo cáo tóm tắt
- ✅ Xác nhận dữ liệu đã insert

---

### Cách 2: Chạy SQL trực tiếp (Alternative)

**Nếu bạn có MySQL client:**

```bash
mysql -h localhost -u root -p123456 CNPM_WebSach < server/src/migrations/seed_march_2026_salary.sql
```

**Hoặc import trong MySQL Workbench:**
- File → Open SQL Script → `server/src/migrations/seed_march_2026_salary.sql`
- Execute All (Ctrl+Shift+Enter)

---

## 📊 Dữ liệu được tạo

### Công chứng tháng 3/2026 (Tổng 21 ngày làm việc)

**NV1 - Nguyễn Văn Admin (Giám đốc)**
- Công: 21/21 ngày ✅
- Trễ/Sớm: 0 ngày
- Tăng ca: 5.0 giờ (2 + 1 + 1.5 + 0.5 giờ)
- Thưởng thủ công: 500,000đ
- **Kỳ vọng:** Đủ điều kiện thưởng chuyên cần (mặc dù chỉ 21 < 26 ngày)

**NV2 - Trần Thị Lan (Quản lý)**
- Công: 20/21 ngày ✅
- Trễ: 1 ngày (3 phút - phạt 20k)
- Tăng ca: 0 giờ
- Thưởng thủ công: 300,000đ
- **Kỳ vọng:** KHÔNG đủ thưởng chuyên cần (có trễ)

**NV3 - Lê Văn Hùng (Thu ngân)**
- Công: 20/21 ngày ✅
- Nghi ốm (Nghi_benh): 1 ngày (công ty trả lương)
- Tăng ca: 0 giờ
- Phạt thủ công: 100,000đ
- **Kỳ vọng:** Đủ thưởng (Nghi_benh ≤ 2 ngày, không trễ)

**NV4 - Phạm Thị Mai (Nhân viên kho)**
- Công: 18/21 ngày ✅
- Vắng không phép: 3 ngày (10, 11, 25/3)
- Tăng ca: 0 giờ
- Không có thưởng/phạt thủ công
- **Kỳ vọng:** KHÔNG thưởng (18 < 26 ngày, có vắng không phép)

**NV5 - Hoàng Văn Nam (HR)**
- Công: 20/21 ngày ✅
- Nghi phép (Nghi_phep): 1 ngày có tính lương (11/3)
- Tăng ca: 8.0 giờ (2 + 1.5 + 1 + 2 + 1.5 giờ)
- Thưởng thủ công: 200,000đ
- **Kỳ vọng:** Đủ thưởng chuyên cần

---

## 🧮 Công thức tính lương tháng 3/2026

### Thông tin nhân viên:
| MaNV | HoTen | LuongCoBan | PhuCap | 
|------|-------|-----------|--------|
| 1 | Nguyễn Văn Admin | 20,000,000 | 5,000,000 |
| 2 | Trần Thị Lan | 15,000,000 | 3,000,000 |
| 3 | Lê Văn Hùng | 8,000,000 | 1,000,000 |
| 4 | Phạm Thị Mai | 7,500,000 | 800,000 |
| 5 | Hoàng Văn Nam | 12,000,000 | 2,000,000 |

### Ví dụ tính NV1 (Giám đốc):

**Step 1: Lương cơ bản**
```
LuongCoBan = 20,000,000
DailyRate = 20,000,000 / 26 = 769,231
HourlyRate = 20,000,000 / 208 = 96,154
```

**Step 2: Thành phần lương tháng 3**
```
PayableDays = 21 ngày
HolidayNotWorkedDays = 0 (không có lễ rơi vào công chứng)
HolidayExtraPay = 0

BasePay = (769,231 × 21) + 0 = 16,153,851đ
OT_Pay = 5.0 × 96,154 × 1.5 = 721,155đ
Thuong = 200,000đ (chuyên cần) + 500,000đ (thủ công) = 700,000đ
Phat = 0đ
PhuCap = 5,000,000đ (full - không có ngày BHXH)

TongLuongBrutto = 16,153,851 + 721,155 + 700,000 + 0 + 5,000,000 = 22,575,006đ
```

**Step 3: Khấu trừ BHXH/BHYT/BHTN**
```
BHXH (8%)   = 20,000,000 × 0.08   = 1,600,000đ
BHYT (1.5%) = 20,000,000 × 0.015  = 300,000đ
BHTN (1%)   = 20,000,000 × 0.01   = 200,000đ
─────────────────────────────────
TongBH      = 2,100,000đ
```

**Step 4: Tính thuế TNCN (lũy tiến 7 bậc)**
```
Thu nhập chịu thuế = 22,575,006đ

Giảm trừ:
  - Bản thân: 11,000,000đ
  - Phụ thuộc (0 người): 0đ
  - BHXH/BHYT/BHTN: 2,100,000đ
────────────────────
Thu nhập tính thuế = 22,575,006 - 13,100,000 = 9,475,006đ

Thuế TNCN (biểu lũy tiến 7 bậc):
  - Đến 5M: 5,000,000 × 5% = 250,000đ
  - 5-10M: 4,475,006 × 10% = 447,500đ
─────────────────────────────────
Tổng TNCN = 697,500đ
```

**Step 5: Lương thực lĩnh**
```
TongLuongThucLinh = 22,575,006 - 2,100,000 - 697,500
                  = 19,777,506đ
```

### Database sẽ lưu:
```
MaNV      = 1
Thang     = 3
Nam       = 2026
LuongCoBan= 20,000,000
PhuCap    = 5,000,000
SoNgayLam = 21
SoGioTangCa = 5.0
Thuong    = 700,000
Phat      = 0
TongLuong = 22,575,006 (Brutto)
KhauTruBHXH = 2,100,000
ThueTNCN  = 697,500
LuongThucLinh = 19,777,506
```

---

## ⚠️ Điều kiện tiên quyết

### Cột cơ sở dữ liệu bắt buộc:

Trước khi chạy migration, hãy chắc chắn bảng `luong` có các cột này:

```sql
-- Nếu chưa có, chạy:
ALTER TABLE luong
ADD COLUMN KhauTruBHXH INT NOT NULL DEFAULT 0 AFTER Phat,
ADD COLUMN ThueTNCN INT NOT NULL DEFAULT 0 AFTER KhauTruBHXH,
ADD COLUMN LuongThucLinh INT NOT NULL DEFAULT 0 AFTER ThueTNCN;
```

Ngoài ra, nên thêm vào bảng `nhanvien`:

```sql
ALTER TABLE nhanvien
ADD COLUMN SoNguoiPhuThuoc INT NOT NULL DEFAULT 0 AFTER MaCa;
```

---

## 🧪 Kiểm tra dữ liệu

### Sau khi chạy migration, kiểm tra:

```sql
-- 1. Công chứng tháng 3
SELECT COUNT(*) as days FROM cham_cong 
WHERE MONTH(Ngay) = 3 AND YEAR(Ngay) = 2026;

-- 2. Thưởng/Phạt tháng 3
SELECT * FROM thuong_phat 
WHERE Thang = 3 AND Nam = 2026;

-- 3. Công chứng chi tiết từng nhân viên
SELECT MaNV, COUNT(*) as days, SUM(SoGioTangCa) as total_ot
FROM cham_cong 
WHERE MONTH(Ngay) = 3 AND YEAR(Ngay) = 2026
GROUP BY MaNV;
```

---

## 🎯 Tiếp theo: Tính lương

### 1. Qua API:

```bash
curl -X POST http://localhost:5000/api/hr/salary-detail \
  -H "Content-Type: application/json" \
  -d '{
    "month": 3,
    "year": 2026
  }' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Qua Admin Panel:

1. Đăng nhập `/admin`
2. Vào **HR → Lương**
3. Chọn tháng **3/2026**
4. Bấm **"Tính Lương"**
5. Kiểm tra kết quả trong tab **"Chi tiết Lương"**

---

## 📝 Ghi chú quan trọng

### ✅ Được kiểm tra:
- ✅ Tất cả 21 ngày làm việc trong tháng 3
- ✅ Các tình huống khác nhau (trễ, ốm, vắng, tăng ca)
- ✅ Thưởng chuyên cần dựa trên điều kiện
- ✅ Tăng ca được tính 1.5x lương giờ
- ✅ Phạt trễ/sớm: 20,000đ/lần

### ⚠️ Cần chú ý:
- March 2026 chỉ có **21 ngày làm việc** (không phải 26), nhưng hệ thống có thể cơ cấu để điều chỉnh
- Thưởng chuyên cần hiện tại setup 200,000đ (có thể thay đổi)
- Tỉ lệ BHXH/BHYT/BHTN: 8% + 1.5% + 1% = 10.5% (theo QUY ĐỊNH VIỆT NAM 2024)
- Thu nhập tính thuế TNCN = brutto - bảo hiểm - giảm trừ gia cảnh

---

## 🔄 Để xóa dữ liệu test (nếu cần reset):

```sql
DELETE FROM cham_cong 
WHERE MONTH(Ngay) = 3 AND YEAR(Ngay) = 2026;

DELETE FROM thuong_phat 
WHERE Thang = 3 AND Nam = 2026;

DELETE FROM luong 
WHERE Thang = 3 AND Nam = 2026;
```

---

## 💬 Câu hỏi thường gặp

**Q: Tại sao NV4 chỉ có 18 ngày công?**  
A: Vì vắng không phép 3 ngày (10, 11, 25/3), không được tính vào PayableDays và mất thưởng chuyên cần.

**Q: Tăng ca được tính sao?**  
A: OT Pay = OT_Hours × (LuongCoBan / 208) × 1.5

**Q: Nếu nhân viên có múi sử dụng ngày phép thì sao?**  
A: Nghi_phep được tính vào PayableDays, khác với Nghi_khong_phep (vắng không phép).

**Q: Thưởng chuyên cần được tính như nào?**  
A: Chỉ nhân viên đủ 26 ngày công, không trễ/sớm, không vắng không phép, Nghi_benh ≤ 2 ngày mới được 200k.

---

**Created:** 2026-03-20  
**Last Updated:** 2026-03-20
