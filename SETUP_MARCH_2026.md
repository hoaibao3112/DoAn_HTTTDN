# 📦 Bộ dữ liệu Test Tháng 3/2026 - Hướng dẫn sử dụng

## ✨ Tóm tắt những gì được cung cấp

Tôi đã tạo **4 files** để hỗ trợ tính lương tháng 3/2026:

```
server/src/migrations/
├── seed_march_2026_salary.sql      # SQL migration (131 INSERT records)
├── seed_march_2026_salary.js       # Node.js runner script
├── verify_march_2026.js            # Verification checklist
└── README_MARCH_2026.md            # Comprehensive documentation
```

---

## 🚀 Cách bắt đầu ngay (3 bước)

### Bước 1: Chạy kiểm tra tiên quyết
```bash
cd server
node src/migrations/verify_march_2026.js
```

### Bước 2: Seed dữ liệu
```bash
node src/migrations/seed_march_2026_salary.js
```

### Bước 3: Tính lương
Dùng Admin Panel hoặc API:
```bash
curl -X POST http://localhost:5000/api/hr/salary-detail \
  -H "Content-Type: application/json" \
  -d '{"month": 3, "year": 2026}'
```

---

## 📊 Dữ liệu được tạo

### 105 bản ghi công chứng
- **NV1-NV5**: Mỗi nhân viên 21 bản ghi (1 cho mỗi ngày làm trong tháng 3)
- **Tình huống đa dạng:**
  - NV1: Full attendance + 5h tăng ca ✅
  - NV2: Full attendance + 1 ngày trễ 🕒
  - NV3: Full attendance + 1 ngày ốm 🤒
  - NV4: 18 ngày (vắng không phép 3 ngày) ❌
  - NV5: Full attendance + 1 ngày phép + 8h tăng ca ✅

### 4 thưởng/phạt
- Thưởng NV1: 500,000đ (công dân tốt)
- Thưởng NV2: 300,000đ (dự án)
- Phạt NV3: 100,000đ (lỗi)
- Thưởng NV5: 200,000đ (công việc phụ)

### 1 ngày lễ
- 8/3 - Quốc tế Phụ nữ (HeSoLuong = 2.0)

---

## 🔧 Sửa lỗi đã khắc phục

### ✅ HTML trong hrController.js

**Vấn đề cũ:**
```javascript
COUNT(CASE WHEN TrangThai IN ('Tre', 'Ve_som') THEN 1 END) as LateEarlyCount
```
❌ Không tính `Tre_Ve_som` (vừa trễ vừa sớm)

**Sửa mới:**
```javascript
COUNT(CASE WHEN TrangThai IN ('Tre', 'Ve_som', 'Tre_Ve_som') THEN 1 END) as LateEarlyCount
```
✅ Giờ đã tính đúng tất cả trường hợp trễ/sớm

---

## ⚠️ Điều kiện tiên quyết

Các cột database này **BẮT BUỘC**:

```sql
-- Trên bảng luong (nếu chưa có)
ALTER TABLE luong
ADD COLUMN KhauTruBHXH INT NOT NULL DEFAULT 0 AFTER Phat,
ADD COLUMN ThueTNCN INT NOT NULL DEFAULT 0 AFTER KhauTruBHXH,
ADD COLUMN LuongThucLinh INT NOT NULL DEFAULT 0 AFTER ThueTNCN;

-- Trên bảng nhanvien (khuyến khích)
ALTER TABLE nhanvien
ADD COLUMN SoNguoiPhuThuoc INT NOT NULL DEFAULT 0 AFTER MaCa;
```

**Script `verify_march_2026.js` sẽ kiểm tra tất cả này tự động!**

---

## 📖 Chi tiết từng file

### 1. `seed_march_2026_salary.sql`
- **Mục đích:** SQL migration thô để import vào MySQL
- **Nội dung:** 131 INSERT statement
- **Dùng khi:** Chạy trực tiếp MySQL Workbench hoặc cli
- **Cách sử dụng:**
  ```bash
  mysql -h localhost -u root -p123456 CNPM_WebSach < server/src/migrations/seed_march_2026_salary.sql
  ```

### 2. `seed_march_2026_salary.js`
- **Mục đích:** Node.js script tự động chạy migration
- **Lợi ích:** 
  - ✅ Báo cáo chi tiết
  - ✅ Xác nhận dữ liệu
  - ✅ Xử lý lỗi gracefully
- **Cách sử dụng:**
  ```bash
  cd server
  node src/migrations/seed_march_2026_salary.js
  ```

### 3. `verify_march_2026.js`
- **Mục đích:** Kiểm tra schema database và tiên quyết
- **Kiểm tra:**
  - ✅ Các cột database có tồn tại không
  - ✅ Nhân viên đã setup chưa
  - ✅ Dữ liệu test đã seeded chưa
  - ✅ Controller methods có sẵn không
- **Cách sử dụng:**
  ```bash
  cd server
  node src/migrations/verify_march_2026.js
  ```

### 4. `README_MARCH_2026.md`
- **Mục đích:** Tài liệu chi tiết đầy đủ
- **Bao gồm:**
  - Ví dụ tính lương step-by-step
  - Công thức BHXH/BHYT/BHTN
  - Công thức thuế TNCN (7 bậc lũy tiến)
  - FAQ
  - Lệnh reset/xóa data

---

## 🎯 Quy trình đề xuất

```
┌─────────────────────┐
│ Run verify script   │ ← Kiểm tra schema
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Run seed script     │ ← Chèn 105 record
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ API /salary-detail  │ ← Tính lương
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Admin Panel /salary │ ← Xem kết quả
└─────────────────────┘
```

---

## 🧮 Công thức tính chính xác

### Lương Brutto = 
```
BasePay + PhuCap + OT_Pay + Bonus - Penalty
```

### BaseDay = 
```
(LuongCoBan / 26) × (PayableDays + HolidayDays) + HolidayExtraPay
```

### OT_Pay = 
```
OT_Hours × (LuongCoBan / 208) × 1.5
```

### Khấu trừ = 
```
BHXH (8%) + BHYT (1.5%) + BHTN (1%) + TNCN
= 10.5% + Thuế
```

### Lương Thực Lĩnh = 
```
Lương_Brutto - Khấu_Trừ
```

---

## ✅ Kiểm tra kết quả mong đợi

Sau khi tính lương tháng 3, bạn sẽ thấy:

| Nhân viên | Brutto | BHXH+BHYT+BHTN | Thuế | Thực Lĩnh |
|----------|---------|--------|------|---------|
| NV1 (Giám đốc) | 22.6M | 2.1M | 0.7M | 19.8M |
| NV2 (Quản lý) | 19.3M | 1.58M | 0.5M | 17.2M |
| NV3 (Thu ngân) | 10.9M | 0.84M | 0.2M | 9.9M |
| NV4 (Kho) | 8.7M | 0.75M | 0.1M | 7.9M |
| NV5 (HR) | 15.5M | 1.26M | 0.3M | 14.0M |

*(Số là ước tính - phụ thuộc vào giảm trừ gia cảnh)*

---

## 🐛 Troubleshooting

### Lỗi: "Column 'KhauTruBHXH' doesn't exist"
**Giải pháp:** Chạy ALTER TABLE migration
```sql
ALTER TABLE luong
ADD COLUMN KhauTruBHXH INT NOT NULL DEFAULT 0 AFTER Phat,
ADD COLUMN ThueTNCN INT NOT NULL DEFAULT 0 AFTER KhauTruBHXH,
ADD COLUMN LuongThucLinh INT NOT NULL DEFAULT 0 AFTER ThueTNCN;
```

### Lỗi: "No employees found"
**Giải pháp:** Kiểm tra bảng `nhanvien` có dữ liệu không
```sql
SELECT COUNT(*) FROM nhanvien WHERE TinhTrang = 1;
```

### Migration bị interrupt
**Giải pháp:** Run verification để kiểm tra dữ liệu đã insert bao nhiêu
```bash
node src/migrations/verify_march_2026.js
```

---

## 📞 Câu hỏi thường gặp

**Q: Tháng 3 có bao nhiêu ngày làm việc?**  
A: 21 ngày (Mon-Fri từ 3-31/3)

**Q: Tại sao NV4 không được thưởng?**  
A: Có 3 ngày vắng không phép → không đủ 26 ngày → mất thưởng chuyên cần

**Q: BHXH 8% tính trên cái gì?**  
A: Tính trên `LuongCoBan` (lương cơ bản/lương hợp đồng)

**Q: Tăng ca được trả bao nhiêu?**  
A: 1.5 lần lương giờ = OT_Hours × (LuongCoBan/208) × 1.5

**Q: Phạt trễ là bao nhiêu?**  
A: 20,000đ mỗi lần (mỗi ngày trễ hoặc vừa trễ vừa sớm)

---

## 📝 File được sửa/tạo

```diff
server/src/controllers/
  hrController.js                    [MODIFIED] ← Fixed LateEarlyCount logic

server/src/migrations/
  + seed_march_2026_salary.sql       [NEW] ← 131 INSERT statements
  + seed_march_2026_salary.js        [NEW] ← Node.js runner
  + verify_march_2026.js             [NEW] ← Verification script
  + README_MARCH_2026.md             [NEW] ← Full documentation
```

---

## 🎁 Bạn nhận được

✅ **105 bản ghi công chứng** cho 5 nhân viên  
✅ **4 thưởng/phạt** để kiểm tra logic  
✅ **1 ngày lễ** (8/3)  
✅ **Script tham chiếu** để tính toán chính xác  
✅ **Tài liệu đầy đủ** với ví dụ  
✅ **Fix LateEarlyCount** trong hrController  

---

## 🚀 Khởi động NGAY

```bash
# 1. Kiểm tra schema
cd server && node src/migrations/verify_march_2026.js

# 2. Seed dữ liệu
node src/migrations/seed_march_2026_salary.js

# 3. Tính lương (qua API)
# hoặc vào Admin Panel rồi bấm "Tính Lương"
```

---

**Chúc bạn thành công! 🎉**

Nếu có câu hỏi, kiểm tra `README_MARCH_2026.md` để biết thêm chi tiết.
