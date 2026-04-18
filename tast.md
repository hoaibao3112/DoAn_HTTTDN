# 📋 TASK: Rà soát & Fix Luồng HR — Nghỉ phép → Chấm công → Tính lương

## Ngữ cảnh dự án

Hệ thống HR quản lý nghỉ phép, chấm công và tính lương. Tech stack: **Node.js + MySQL**. Business logic tập trung tại:

- `server/src/controllers/hrController.js`
- `server/src/utils/attendanceSync.js`
- `server/src/routes/hrRoutes.js`

---

## Nhiệm vụ

Rà soát và fix/implement toàn bộ luồng: **Nghỉ phép → Chấm công → Tính lương** theo đúng nghiệp vụ HR Việt Nam (Bộ luật Lao động + Luật BHXH hiện hành).

---

## 🔴 Bug Fixes Bắt Buộc (Ưu tiên cao)

### 1. Sửa `dailyRate` và `hourlyRate` — tính động theo tháng

**Hiện trạng:** Code đang dùng cứng `STANDARD_WORKDAYS_PER_MONTH = 26`.

**Yêu cầu:** Sửa lại để tính động theo tháng thực tế:

```js
// Đếm số ngày thứ 2–6 trong tháng đó (hoặc lấy từ bảng lịch làm việc)
const soNgayLamViecThucTeThang = getWorkingDaysInMonth(month, year);

const dailyRate  = LuongCoBan / soNgayLamViecThucTeThang;
const hourlyRate = dailyRate / 8;
```

**Lý do:** Theo Điều 98 BLLĐ, lương ngày/giờ phải tính trên số ngày làm việc thực tế của tháng đó, không phải cố định 26. Các tháng có thể có 23, 24, 25 hoặc 26 ngày làm việc khác nhau.

---

### 2. Sửa hệ số OT — phân loại theo loại ngày

**Hiện trạng:** Code đang nhân cứng `× 1.5` cho mọi tăng ca.

**Yêu cầu:** Phân loại theo Điều 98 BLLĐ:

| Loại ngày tăng ca | Hệ số |
|---|---|
| Ngày thường (T2–T6) | `hourlyRate × 1.5` |
| Ngày nghỉ hàng tuần (T7/CN) | `hourlyRate × 2.0` |
| Ngày lễ / tết | `hourlyRate × 3.0` |

**Cách implement:**
- Thêm field `LoaiNgayTangCa ENUM('thuong', 'nghi_tuan', 'le')` vào bảng `cham_cong`
- Hoặc join với bảng `ngay_le` + kiểm tra `DAYOFWEEK()` để tự phân loại khi tính lương

---

## 🟡 Implement Còn Thiếu (Ưu tiên trung bình)

### 3. Tách phụ cấp chịu thuế / không chịu thuế

**Hiện trạng:** `PhuCap` đang cộng thẳng vào `TongLuongBrutto` rồi tính thuế TNCN hết.

**Yêu cầu:** Tách thành 2 loại:

```
PhuCapChiuThue       → cộng vào ThuNhapChiuThue (tính thuế)
PhuCapKhongChiuThue  → cộng vào lương nhưng KHÔNG tính thuế TNCN
```

**Ví dụ phụ cấp không chịu thuế** (theo TT 111/2013/TT-BTC):
- Phụ cấp ăn trưa ≤ 730.000 đ/tháng
- Phụ cấp xăng xe, điện thoại trong mức khoán

**Thay đổi DB:** Thêm cột `PhuCapChiuThue` và `PhuCapKhongChiuThue` vào bảng `nhanvien` (hoặc tách bảng `phu_cap`).

---

### 4. Logic nghỉ bệnh BHXH — tách khỏi BasePay công ty

**Hiện trạng:** `SICK_STATUSES_BHXH` có trong code nhưng chưa tách phần BHXH trả ra khỏi chi phí công ty.

**Yêu cầu:** Implement công thức:

```js
BhxhSickPay = (LuongDongBHXH * 0.75) / soNgayLamViecThang * BhxhSickDays;
```

- Phần này **không tính vào `BasePay`** của công ty
- Thêm cột `BhxhSickPay` vào bảng `luong` để báo cáo riêng chi phí công ty vs BHXH

---

### 5. Thêm trần đóng BHXH

**Hiện trạng:** `KhauTruBH = LuongCoBan × 10.5%` áp dụng không giới hạn.

**Yêu cầu:** Giới hạn theo quy định (tối đa 20 lần lương tối thiểu vùng):

```js
const mucTranBHXH = 20 * luongToiThieuVung; // lấy từ bảng hr_settings hoặc config
const luongTinhBH = Math.min(LuongCoBan, mucTranBHXH);
const KhauTruBH   = luongTinhBH * 0.105;
```

Lưu `luongToiThieuVung` trong bảng `hr_settings (key, value)` để dễ cập nhật khi nhà nước điều chỉnh.

---

### 6. Giới hạn số ngày phép có lương / năm

**Hiện trạng:** Không có giới hạn, nhân viên có thể gửi đơn nghỉ phép không giới hạn số ngày.

**Yêu cầu:** Implement trong hàm `submitLeave`:

```js
// Bước 1: Tính số ngày phép đã dùng trong năm
const [rows] = await pool.query(`
  SELECT SUM(DATEDIFF(NgayKetThuc, NgayBatDau) + 1) AS used
  FROM xin_nghi_phep
  WHERE MaNV = ?
    AND LoaiDon = 'Nghi_phep'
    AND TrangThai = 'Da_duyet'
    AND YEAR(NgayBatDau) = ?
`, [MaNV, year]);

// Bước 2: Tính số ngày đang xin
const requestedDays = dayjs(NgayKetThuc).diff(dayjs(NgayBatDau), 'day') + 1;

// Bước 3: Kiểm tra vượt quota
const maxPaidLeavePerYear = await getHrSetting('maxPaidLeavePerYear'); // từ bảng hr_settings
if ((rows[0].used || 0) + requestedDays > maxPaidLeavePerYear) {
  return res.status(400).json({
    message: `Vượt quá số ngày phép cho phép. Đã dùng: ${rows[0].used || 0} ngày, còn lại: ${maxPaidLeavePerYear - (rows[0].used || 0)} ngày.`
  });
}
```

---

## 🟢 Nice to Have (Ưu tiên thấp)

### 7. Tự động tính thưởng chuyên cần

**Hiện trạng:** Thưởng chuyên cần đang insert thủ công qua bảng `thuong_phat`.

**Yêu cầu:** Define rule rõ ràng và tự động tính trong `calculateMonthlySalary`:

```js
// Điều kiện được thưởng chuyên cần:
const duocThuongChuyenCan =
  lateEarlyCount === 0 &&       // không đi trễ/về sớm
  unpaidAbsenceCount === 0;     // không vắng không phép

if (duocThuongChuyenCan) {
  bonus += thuongChuyenCanAmount; // lấy từ hr_settings
}
```

---

### 8. Logic nghỉ thai sản

**Hiện trạng:** `Thai_san` có trong danh sách trạng thái nhưng chưa có công thức tính.

**Yêu cầu:** Implement theo Luật BHXH:

```js
// BHXH trả 100% lương bình quân 6 tháng đóng BHXH trước khi nghỉ
MaternityPay = (LuongBinhQuanDongBHXH6Thang / 30) * soNgayThaiSan;
```

- Tách riêng khỏi `BasePay`, thêm cột `MaternityPay` vào bảng `luong`
- Cần thêm field `LuongBinhQuanBHXH` vào `nhanvien` hoặc tính từ lịch sử lương 6 tháng

---

## ✅ Acceptance Criteria

Trước khi merge, đảm bảo toàn bộ checklist sau:

- [ ] `dailyRate` thay đổi đúng theo số ngày làm việc thực tế từng tháng (không cứng 26)
- [ ] OT tính đúng 3 mức hệ số: `×1.5` / `×2.0` / `×3.0` theo loại ngày
- [ ] Phụ cấp không chịu thuế không bị cộng vào thu nhập tính thuế TNCN
- [ ] Nghỉ bệnh BHXH không làm tăng chi phí lương phía công ty
- [ ] BHXH không tính vượt trần 20 lần lương tối thiểu vùng
- [ ] Submit đơn nghỉ vượt quota trả lỗi HTTP 400 kèm message rõ ràng
- [ ] Không có regression trên luồng hiện tại: submit → duyệt → sync chấm công → tính lương

---

## 📂 File cần đụng tới

| File | Việc cần làm |
|---|---|
| `server/src/controllers/hrController.js` | Fix dailyRate, OT, BHXH trần, thưởng chuyên cần, thai sản, nghỉ bệnh BHXH |
| `server/src/routes/hrRoutes.js` | Không đổi nhiều, kiểm tra lại validation submit |
| `server/src/utils/attendanceSync.js` | Thêm field `LoaiNgayTangCa` khi sync |
| DB migration | Thêm cột `PhuCapChiuThue`, `PhuCapKhongChiuThue`, `BhxhSickPay`, `MaternityPay`, bảng `hr_settings` |

---

## ✅ Task đã hoàn thành (bản ghi cập nhật)

- [x] Đã thêm migration DB và cập nhật code liên quan: `server/src/migrations/20260418_add_hr_fields.sql`, `server/src/controllers/hrController.js`, `server/src/utils/attendanceSync.js` (2026-04-18). Migration đã chạy thành công trên môi trường thử nghiệm.


*Tài liệu nghiệp vụ tham khảo: Bộ luật Lao động 2019 (Điều 98), Luật BHXH 2014, Thông tư 111/2013/TT-BTC về thuế TNCN.*