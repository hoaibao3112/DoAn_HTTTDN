# Hướng dẫn tính lương, xử lý nghỉ phép và ghép chấm công

Ngày: 2026-04-18

Mục đích: Tài liệu này mô tả các quy tắc tính lương, cách hệ thống xử lý đơn nghỉ phép và cách ghép/chồng chấm công để tạo dữ liệu trả lương (`luong`). Dành cho dev, admin HR và người kiểm thử.

---

## 1. Bảng dữ liệu chính
- `nhanvien`: thông tin nhân viên (`MaNV`, `MaTK`, `LuongCoBan`, `PhuCap`, `PhuCapChiuThue`, `PhuCapKhongChiuThue`, `SoNguoiPhuThuoc`, `LuongBinhQuanBHXH6Thang`, ...)
- `cham_cong`: bản ghi chấm công theo ngày (trường quan trọng: `MaNV`, `Ngay`, `TrangThai`, `SoGioTangCa`, `GhiChu`, `LoaiNgayTangCa`)
- `xin_nghi_phep`: đơn nghỉ (trường: `id`, `MaNV`, `LoaiDon`, `NgayBatDau`, `NgayKetThuc`, `LyDo`, `MinhChung`, `TrangThai`, `NguoiDuyet`)
- `luong`: kết quả tính lương theo tháng (lưu `MaNV`, `Thang`, `Nam`, `LuongCoBanThucTe`, `PhuCapChiuThue`, `PhuCapKhongChiuThue`, `Thuong`, `Phat`, `TongLuong`, `DaChiTra`...)
- `ngay_le`: danh sách ngày lễ (`Ngay`, `TenNgayLe`, `HeSoLuong`, `LoaiNgayLe`)
- `thuong_phat`: thưởng/phạt thủ công theo tháng.

---

## 2. Luồng xử lý chung
1. Nhân viên nộp đơn nghỉ (`POST /api/hr/xin-nghi-phep`) → trạng thái ban đầu `'Cho_duyet'`.
2. HR duyệt/từ chối (`PUT /api/hr/leave-requests/:id/approve`) → khi duyệt `'Da_duyet'` hệ thống có thể (tùy cấu hình) cập nhật chấm công/điểm danh.
3. Hệ thống chấm công có thể auto-insert các ngày thiếu (utility `attendanceSync`) — khi insert sẽ đặt `LoaiNgayTangCa` nếu là ngày lễ/ cuối tuần.
4. Khi chạy tính lương (`POST /api/hr/salary/calculate` với `{month, year}`):
   - Hệ thống đọc `ngay_le` để biết ngày lễ và `hr_settings` để lấy cấu hình (ví dụ `maxPaidLeavePerYear`, `luongToiThieuVung`).
   - Lấy dữ liệu `cham_cong` cho tháng: nhóm theo `MaNV` để đếm `PayableDays`, `SoGioTangCa`, các ngày `Thai_san`, `Om_dau`, `Nghi_benh`...
   - Lấy `thuong_phat` (thưởng/phạt thủ công) cho tháng.
   - Tính công, lương, BHXH, thuế, và ghi vào bảng `luong`.

---

## 3. Nguyên tắc tính lương chính
- **Ngày làm việc thực tế trong tháng (actualWorkdays)**: đếm số ngày Mon–Fri trừ ngày lễ trong `ngay_le` cho tháng (hàm `countWorkdaysInMonth(year, month, holidays)`). Dùng để tính `dailyRate` khi có dữ liệu ngày lễ chính xác. Nếu không có, fallback về `STANDARD_WORKDAYS_PER_MONTH = 26`.
- **Daily / Hourly rate**:
  - `dailyRate = LuongCoBan / actualWorkdays` (fallback `LuongCoBan / 26`)
  - `hourlyRate = dailyRate / 8`
- **Lương công cơ bản (base pay)**: `dailyRate * PayableDays` hoặc nếu có `LuongCoBanThucTe` dùng trực tiếp.
- **Tiền tăng ca (OT)**: cộng theo giờ: `sum(SoGioTangCa * hourlyRate * OT_factor)`; mặc định factor tối thiểu ×1.5, ×2, ×3 tùy chính sách (hệ thống có thể phân loại `LoaiNgayTangCa` để quyết định hệ số).
- **Phụ cấp**: tách `PhuCapChiuThue` (tính thuế) và `PhuCapKhongChiuThue` (không chịu thuế). Nếu không có trường mới, `PhuCapChiuThue = PhuCap` và `PhuCapKhongChiuThue = 0`.
- **Tổng thu nhập trước thuế**: base + OT + PhuCapChiuThue + PhuCapKhongChiuThue + Thuong - Phat

---

## 4. BHXH / BHYT / BHTN / Trần đóng BHXH
- Tỷ lệ nhân viên: BHXH 8%, BHYT 1.5%, BHTN 1% (các thông số cấu hình trong code: `BHXH_RATE`, `BHYT_RATE`, `BHTN_RATE`).
- **Trần đóng BHXH**: theo quy định hiện hành — ví dụ `maxBaseForBHXH = 20 * luongToiThieuVung` (luongToiThieuVung lấy từ `hr_settings`). Nếu `LuongBinhQuanBHXH6Thang` có, dùng để tính base đóng BHXH thay thế.

---

## 5. Nghỉ bệnh (BHXH) và nghỉ hưởng lương
- Các status phân biệt:
  - `Thai_san`, `Om_dau`: BHXH trả — có thể không tính vào `PayableDays` của công ty (nếu BHXH chi trả).
  - `Nghi_benh`: công ty trả như ngày thường (tính vào `PayableDays`).
  - `Nghi_phep`: phép hưởng lương nếu đã được duyệt (`TrangThai='Da_duyet'` trong `xin_nghi_phep`) và trong quota.
- **Quota phép có trả lương**: `maxPaidLeavePerYear` lấy từ `hr_settings` (mặc định 12 ngày/năm). Khi nhân viên nộp đơn, hệ thống kiểm tra tổng ngày đã được duyệt trong năm và từ chối nếu vượt hạn mức.

---

## 6. Ghép giữa đơn nghỉ và chấm công
- Khi đơn nghỉ phép `Da_duyet` được lưu, có 2 chiến lược:
1) Cập nhật trực tiếp bảng `cham_cong` để tạo bản ghi `TrangThai='Nghi_phep'` cho các ngày trong khoảng (thường sau khi HR duyệt). Ưu: tính lương đơn giản; nhược: cần audit/rollback khi sửa.
2) Không cập nhật `cham_cong` tự động nhưng khi tính lương, logic aggregate sẽ kiểm tra `xin_nghi_phep` với `TrangThai='Da_duyet'` để tính `PayableDays` bổ sung. Ưu: dễ rollback; nhược: phức tạp chút ở hàm tính.
- Hiện tại code hỗ trợ kiểm tra khi tính lương (aggregate từ `cham_cong`) và có API để sửa `xin_nghi_phep`. Nếu muốn auto sync, cần implement backfill/rollback trong `updateLeaveRequest`.

---

## 7. API liên quan (tóm tắt)
- `POST /api/hr/xin-nghi-phep` — gửi đơn nghỉ (nhân viên)
- `GET /api/hr/leave-requests` — list pending (HR)
- `GET /api/hr/leave-requests/approved` — list approved (HR)
- `GET /api/hr/leave-requests/:id` — chi tiết đơn
- `PUT /api/hr/leave-requests/:id/approve` — duyệt/từ chối
- `PUT /api/hr/leave-requests/:id` — (HR) cập nhật đơn — hiện cập nhật record, chưa backfill `cham_cong` tự động
- `POST /api/hr/salary/calculate` — tính lương cho `month/year` và ghi vào `luong`

---

## 8. Ghi nhật ký & audit
- Mọi cập nhật quan trọng (duyệt đơn, chỉnh sửa đơn, tính lương) phải ghi `logActivity` vào bảng audit để truy vết: `MaTK`, `HanhDong`, `BangDuLieu`, `MaBanGhi`, `GhiChu`, `DiaChi_IP`.

---

## 9. Kiểm thử & ví dụ nhanh
- Ví dụ: nhân viên A, LCB = 10,000,000 VND, tháng có 22 ngày làm thực tế.
  - `dailyRate = 10,000,000 / 22 = 454,545 VND`
  - Nếu PayableDays = 20 → base = 9,090,900
  - Nếu OT = 10h, hourly=56,818 → OT pay (factor1.5) = 10 * 56,818 * 1.5 = 852,270
  - Tổng trước thuế = base + OT + PhuCap + Thuong − Phat

Thử các trường hợp biên: nghỉ phép vượt quota (từ chối), thay đổi ngày đã duyệt (yêu cầu HR liên hệ admin để rollback), ngày lễ có đi làm (tính hệ số), BHXH sử dụng `LuongBinhQuanBHXH6Thang` khi có.

---

## 10. Gợi ý cải tiến/những việc nên làm
- Khi HR chỉnh sửa ngày đã duyệt, hệ thống nên tự động backfill/rollback các bản ghi `cham_cong` tương ứng (cần implement transactional logic và audit rõ ràng).
- Thêm unit tests/integration tests cho `calculateMonthlySalary` (mock `ngay_le`, `cham_cong`, `thuong_phat`).
- Thêm config runtime cho hệ số OT theo loại ngày (weekday/holiday/weekend).

---

Tài liệu ngắn này là bản tóm tắt để dev và HR hiểu quy tắc. Nếu cần, tôi có thể mở rộng mỗi phần với pseudocode, SQL examples, và test-cases cụ thể.
