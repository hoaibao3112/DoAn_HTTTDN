# Luồng nghỉ phép → chấm công → tính lương (Chi tiết)

Tài liệu này mô tả toàn bộ luồng nghiệp vụ từ khi nhân viên gửi đơn nghỉ tới cách chấm công, đồng bộ vào bảng chấm công và cuối cùng là cách hệ thống tính lương hàng tháng. File tham chiếu các endpoint, bảng dữ liệu và đoạn logic chính trong code hiện tại.

## Mục lục
- Tổng quan luồng
- Định nghĩa loại nghỉ và cách hệ thống xử lý
- Bảng dữ liệu liên quan
- API / route chính
- Luồng nghiệp vụ chi tiết (submit, duyệt, sync, chấm công)
- Quy tắc tính công (PayableDays, ngày lễ, OT)
- Công thức tính lương (brutto → khấu trừ → net)
- Ví dụ tính toán cụ thể
- Kiểm tra, xác thực và edge cases
- Nơi cần sửa/điều chỉnh trong code
- Gợi ý cải tiến (ví dụ: giới hạn ngày phép/năm)

---

## 1) Tổng quan luồng
1. Nhân viên gửi đơn nghỉ (POST `xin_nghi_phep`).
2. API lưu đơn vào bảng `xin_nghi_phep` với trạng thái `Cho_duyet`.
3. Quản lý/Duyệt viên xem và duyệt/từ chối (PUT `approveLeave`).
4. Sau khi duyệt, hệ thống có thể đồng bộ thông tin nghỉ vào bảng chấm công (`cham_cong`) — hoặc attendance sync script sẽ thực hiện (ví dụ: `attendanceSync.js`).
5. Khi tính lương tháng, controller tính các chỉ số chấm công (PayableDays, OT hours, UnpaidAbsence) và áp dụng công thức ra `luong`.

---

## 2) Định nghĩa các loại nghỉ và cách xử lý trong hệ thống
- `Nghi_phep` (Nghỉ phép có lương)
  - Hệ thống **tính vào PayableDays** (tức là được coi là ngày làm có lương). Thông tin này xác định phần tiền cơ bản được trả.
  - Bảng lưu đơn: `xin_nghi_phep`.
- `Nghi_khong_phep` (vắng không phép)
  - **Không tính vào PayableDays** → ảnh hưởng giảm lương/thưởng.
- `Nghi_benh` (Nghỉ ốm)
  - Có phân loại `SICK_STATUSES_COMPANY` và `SICK_STATUSES_BHXH` trong code: một số loại ốm do công ty trả như ngày làm (tính vào PayableDays), một số do BHXH trả (không tính như ngày làm bình thường theo quy tắc BHXH).
- `Thai_san`, `Om_dau` v.v.
  - Theo cấu hình trong `hrController.js` có danh sách trạng thái BHXH trả (`SICK_STATUSES_BHXH`) và công ty trả (`SICK_STATUSES_COMPANY`).

(Ghi chú: chi tiết mapping trạng thái → hành vi tính lương được implement trong [server/src/controllers/hrController.js](server/src/controllers/hrController.js)).

---

## 3) Bảng dữ liệu chính liên quan
- `xin_nghi_phep` — lưu đơn nghỉ, trường chính: `MaNV`, `LoaiDon`, `NgayBatDau`, `NgayKetThuc`, `LyDo`, `MinhChung`, `TrangThai`, `NguoiDuyet`, `NgayDuyet`.
- `cham_cong` — bảng công hàng ngày, trường ví dụ: `MaNV`, `Ngay`, `TrangThai` (Di_lam / Tre / Ve_som / Nghi_phep / Nghi_khong_phep / Nghi_benh / ...), `SoGioTangCa`, `GioVao`, `GioRa`.
- `luong` — bảng lương tháng, chứa các cột tính toán: `Thang`, `Nam`, `LuongCoBan`, `PhuCap`, `TongLuong`, `KhauTruBHXH`, `ThueTNCN`, `LuongThucLinh`.
- `thuong_phat` — lưu thưởng/phạt thủ công để cộng/trừ khi tính lương.
- `ngay_le` — chứa ngày lễ và hệ số lương tương ứng.

---

## 4) API / Route chính (tham chiếu code)
- `POST /api/hr/xin-nghi-phep` — gửi đơn nghỉ (see [server/src/routes/hrRoutes.js](server/src/routes/hrRoutes.js)).
- `GET /api/hr/my-leave` (hoặc tương tự) — lấy đơn của người gửi.
- `GET /api/hr/leave-requests` — lấy các đơn chờ duyệt.
- `PUT /api/hr/approve/:id` — duyệt/từ chối đơn (controller: [server/src/controllers/hrController.js](server/src/controllers/hrController.js#L402-L430)).
- Đồng bộ chấm công: utility `attendanceSync.js` (nếu có) sẽ đọc `xin_nghi_phep` và insert/update `cham_cong` tương ứng (xem [server/src/utils/attendanceSync.js](server/src/utils/attendanceSync.js)).
- Endpoint tính lương: `POST /api/hr/salary-detail` hoặc `GET /api/hr/compute/:year/:month` → gọi `calculateMonthlySalary` trong [server/src/controllers/hrController.js](server/src/controllers/hrController.js#L460).

---

## 5) Luồng nghiệp vụ chi tiết
1. Nhân viên điền đơn trên UI (Admin panel: `LeavePage.js` hoặc form tương tự) và submit.
   - Frontend gửi `multipart/form-data` nếu có file minh chứng.
   - Backend `submitLeave` kiểm tra: không cho ngày bắt đầu nằm trong quá khứ (validation hiện tại).
2. Bảng `xin_nghi_phep` lưu với `TrangThai = 'Cho_duyet'`.
3. Quản lý vào trang quản trị, xem danh sách đơn chờ, nhấn duyệt hoặc từ chối.
   - Nếu duyệt (`TrangThai='Da_duyet'`) thì controller cập nhật `TrangThai`, `NguoiDuyet`, `NgayDuyet`.
   - Nếu loại đơn là `Nghi_viec` và duyệt thì cập nhật `nhanvien.TinhTrang = 0` (nghỉ việc).
4. Sau khi duyệt, attendance sync:
   - Script/logic `attendanceSync.js` sẽ chọn các nhân viên có đơn nghỉ trong khoảng thời gian và insert hoặc set trạng thái `Nghi_phep` vào `cham_cong` (hoặc đổi record tương ứng).
   - Nếu không có sync tự động, admin có thể gọi API để apply đơn vào chuỗi chấm công.
5. Khi chạy tính lương cho tháng: `calculateMonthlySalary(month, year)`
   - Lấy danh sách `nhanvien` đang hoạt động.
   - Lấy `cham_cong` trong tháng để đếm: PayableDays, LateEarlyCount, UnpaidAbsenceCount, SoGioTangCa, MaternityDays, BhxhSickDays, CompanySickDays.
   - Lấy `ngay_le` trong tháng để xử lý ngày lễ.
   - Lấy `thuong_phat` để cộng/trừ.
   - Áp dụng công thức (xem tiếp mục 6).

---

## 6) Quy tắc tính công & các khái niệm quan trọng
- STANDARD_WORKDAYS_PER_MONTH = 26 (cấu hình trong `hrController.js`).
- PayableDays: các trạng thái được coi là có lương và tính vào ngày công: `Di_lam`, `Tre`, `Ve_som`, `Tre_Ve_som`, `Nghi_phep`, `Nghi_benh` (tùy loại), v.v.
- UnpaidAbsence: `Nghi_khong_phep` không được tính vào PayableDays.
- Ngày lễ: nếu rơi vào ngày nghỉ, có thể được xử lý với hệ số lương (`HeSoLuong`) — code cộng phần chênh `(HeSo - 1) * dailyRate` khi nhân viên đi làm ngày lễ; nếu nghỉ lễ thuộc loại `Nghi_benh`/`Nghi_phep`, hệ thống vẫn áp dụng qui tắc cụ thể mô tả trong controller.
- OT (tăng ca): tích lũy `SoGioTangCa` từ `cham_cong`.

---

## 7) Công thức tính lương (tóm tắt và công thức chính)
Tóm tắt công thức trong code (`calculateMonthlySalary`):

1. Các biến cơ bản
   - `base = LuongCoBan`
   - `dailyRate = base / STANDARD_WORKDAYS_PER_MONTH` (ví dụ 26)
   - `hourlyRate = base / 208` (208 giờ = 26 * 8)

2. Thành phần lương
   - BasePay = `dailyRate * PayableDays`
   - OT_Pay = `OT_Hours * hourlyRate * 1.5`
   - ManualBonus = tổng `thuong` từ `thuong_phat`
   - ManualPenalty = tổng `phat` từ `thuong_phat`
   - PhuCap = `PhuCap` từ `nhanvien` (có thể phụ thuộc BHXH)

3. Tổng lương Brutto
   - `TongLuongBrutto = BasePay + OT_Pay + ManualBonus - ManualPenalty + PhuCap`

4. Khấu trừ BHXH/BHYT/BHTN
   - Sử dụng tỷ lệ: BHXH 8%, BHYT 1.5%, BHTN 1% (tổng 10.5%).
   - `KhauTruBH = LuongCoBan * TOTAL_INSURANCE_RATE` (theo code hiện tại tính trên LuongCoBan).

5. Tính thu nhập chịu thuế
   - `ThuNhapChiuThue = TongLuongBrutto - KhauTruBH - PersonalDeduction - DependentDeduction`.
   - `PersonalDeduction = 11,000,000` (mặc định trong code)
   - `DependentDeduction = 4,400,000 * SoNguoiPhuThuoc`

6. Tính Thuế TNCN
   - Áp biểu thuế lũy tiến 7 bậc (hàm `calculatePIT`) trong `hrController.js`.

7. Lương thực lĩnh
   - `LuongThucLinh = TongLuongBrutto - KhauTruBH - ThueTNCN`

(Ghi chú: chi tiết và số làm tròn được thể hiện trong code `hrController.js`).

---

## 8) Ví dụ cụ thể (dựa trên dữ liệu test March 2026)
NV1: `LuongCoBan = 20,000,000`, `PhuCap = 5,000,000`, `PayableDays = 21`, `OT_Hours = 5.0`, `Thuong_thu_cong = 500,000`.

- dailyRate = 20,000,000 / 26 = 769,231
- BasePay = 769,231 × 21 = 16,153,851
- OT_Pay = 5 × (20,000,000 / 208) × 1.5 = 721,155
- Thuong = 200,000 (chuyên cần) + 500,000 (thủ công) = 700,000
- TongLuongBrutto = 16,153,851 + 721,155 + 700,000 + 5,000,000 = 22,575,006
- KhauTruBH = 20,000,000 × 0.105 = 2,100,000
- ThuNhapTinhThue = 22,575,006 - 2,100,000 - 11,000,000 = 9,475,006
- Thuế TNCN (theo bậc) ≈ 697,500
- LuongThucLinh = 22,575,006 - 2,100,000 - 697,500 = 19,777,506

(Đây là ví dụ được dùng trong `server/src/migrations/seed_march_2026_salary.js` và mô tả trong README migration: [server/src/migrations/README_MARCH_2026.md](server/src/migrations/README_MARCH_2026.md)).

---

## 9) Kiểm tra, xác thực và các edge cases
- Backend hiện có validation: không cho `NgayBatDau` nhỏ hơn ngày hiện tại.
- Không thấy luật giới hạn `Số ngày phép tối đa/năm` trong codebase → nghĩa là hệ thống hiện tại **không giới hạn** số ngày phép có lương mỗi năm (nếu muốn phải add logic).
- Cần xử lý khi:
  - Đơn chồng chéo ngày (gửi nhiều đơn trùng ngày) → cần check conflict khi insert
  - Nghỉ dài hạn (thai sản) liên quan BHXH → cần quy đổi theo luật BHXH (đã có phân loại trạng thái BHXH trong controller)
  - Thời gian nghỉ vượt quá số ngày phép còn lại (nếu doanh nghiệp muốn enforce) → cần quy tắc và dữ liệu lưu trữ `soNgayPhepConLai` (cột trong `nhanvien` hoặc bảng policy).
- File upload lớn: route `xin-nghi-phep` có giới hạn 10MB (xem routes).

---

## 10) Nơi cần sửa / tham chiếu code để điều chỉnh
- Business logic & tính lương: [server/src/controllers/hrController.js](server/src/controllers/hrController.js)
- Submit/route: [server/src/routes/hrRoutes.js](server/src/routes/hrRoutes.js)
- Attendance sync: [server/src/utils/attendanceSync.js](server/src/utils/attendanceSync.js)
- Migration / Tài liệu test: [server/src/migrations/README_MARCH_2026.md](server/src/migrations/README_MARCH_2026.md)
- Frontend leave UI: admin frontend file nằm trong `admin/src/pages/LeavePage.js` hoặc `admin/src/pages/` tương ứng (tìm trong repo để xác định file chính xác).

---

## 11) Gợi ý cải tiến (ví dụ: thêm giới hạn ngày phép/năm)
1. BẢNG CẤU HÌNH / SETTING:
   - Tạo bảng `hr_settings (key, value)` hoặc cột `SoNgayPhepNam` trong `nhanvien` để lưu quyền lợi, hoặc `policy` chung: `maxPaidLeavePerYear`.
2. LOGIC KIỂM TRA TRONG `submitLeave`:
   - Khi nhân viên gửi đơn (`submitLeave`), tính tổng số ngày `Nghi_phep` đã được `Da_duyet` trong cùng năm: `SELECT SUM(datediff(NgayKetThuc, NgayBatDau)+1) FROM xin_nghi_phep WHERE MaNV=? AND LoaiDon='Nghi_phep' AND TrangThai='Da_duyet' AND YEAR(NgayBatDau)=?`.
   - Nếu `existing + requested > maxPaidLeavePerYear` → trả lỗi 400 với message rõ ràng.
3. GIAO DIỆN:
   - Hiển thị số ngày phép đã dùng và còn lại trong UI LeavePage.
   - Thông báo khi cố gửi vượt hạn.
4. TESTS:
   - Viết unit tests cho controller `submitLeave` và integration test cho luồng approve + attendance sync.

---

## 12) Đề xuất triển khai (mã mẫu kiểm tra giới hạn)
Pseudo-code cho `submitLeave` (server):

```js
// 1. parse request, compute requestedDays = diff(NgayKetThuc - NgayBatDau) + 1
// 2. const existing = await pool.query("SELECT SUM(...) AS used FROM xin_nghi_phep WHERE MaNV=? AND LoaiDon='Nghi_phep' AND TrangThai='Da_duyet' AND YEAR(NgayBatDau)=?", [MaNV, year]);
// 3. if (existing.used + requestedDays > maxPaidLeavePerYear) return 400
// 4. insert xin_nghi_phep
```

(Implement `maxPaidLeavePerYear` lấy từ bảng `hr_settings` hoặc config `.env`.)

---

## 13) Kết luận ngắn
- Hệ thống hiện tại: `Nghi_phep` **được tính** vào PayableDays và ảnh hưởng trực tiếp tới BasePay. Tuy nhiên **không có** cấu hình giới hạn số ngày phép tối đa/năm trong codebase.
- Nếu công ty cần giới hạn — cần thêm: DB setting + validation trong `submitLeave` + hiển thị UI.

---

## Tham khảo code chính (tốc hành):
- [server/src/controllers/hrController.js](server/src/controllers/hrController.js)
- [server/src/utils/attendanceSync.js](server/src/utils/attendanceSync.js)
- [server/src/migrations/README_MARCH_2026.md](server/src/migrations/README_MARCH_2026.md)
- Routes: [server/src/routes/hrRoutes.js](server/src/routes/hrRoutes.js)

---

Nếu bạn muốn, tôi có thể tiếp tục và: 
- 1) Thêm `maxPaidLeavePerYear` vào DB + implement kiểm tra ở `submitLeave` (backend) và hiển thị trên UI.
- 2) Viết test tích hợp cho luồng gửi → duyệt → sync → tính lương.

Bạn muốn tôi làm bước nào tiếp theo?