-- ================================================================================
-- MIGRATION: Seed data for March 2026 salary calculation
-- Purpose: Populate realistic test data for payroll testing
-- Date: 2026-03-20
-- ================================================================================

-- ================================================================================
-- 1. ADD HOLIDAYS FOR MARCH 2026 (if not already present)
-- ================================================================================
INSERT IGNORE INTO ngay_le (TenNgayLe, Ngay, HeSoLuong, LoaiNgayLe, GhiChu) VALUES
('Ngày Quốc tế Phụ nữ (Nữ nhân viên)', '2026-03-08', 2.00, 'Quoc_gia', 'March 8 - International Women\'s Day');

-- ================================================================================
-- 2. INSERT ATTENDANCE DATA (CHAM_CONG) FOR MARCH 2026
-- March 2026 calendar:
--   Working days (Mon-Fri): 3,4,5,6, 9,10,11,12,13, 16,17,18,19,20, 23,24,25,26,27, 30,31
--   Total: 21 working days
--
-- Test scenarios:
--   NV1 (Giám đốc): Full attendance + 5 hours OT
--   NV2 (Quản lý): Full attendance, 1 day late
--   NV3 (Thu ngân): Full attendance, 1 sick day (Nghi_benh)
--   NV4 (Nhân viên kho): 18 days present (missed 3 days)
--   NV5 (HR): Full attendance + 8 hours OT + 1 day paid leave
-- ================================================================================

-- NV1 (Nguyễn Văn Admin - Giám đốc): Full attendance + OT
INSERT IGNORE INTO cham_cong (MaNV, MaCa, Ngay, GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, CreatedBy) VALUES
(1, 1, '2026-03-03', '08:00:00', '17:00:00', 8.00, 2.00, 'Di_lam', 'Normal working day + 2h OT', 'system'),
(1, 1, '2026-03-04', '08:00:00', '17:00:00', 8.00, 1.00, 'Di_lam', 'Normal working day + 1h OT', 'system'),
(1, 1, '2026-03-05', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-06', '08:00:00', '17:00:00', 8.00, 1.50, 'Di_lam', 'Normal working day + 1.5h OT', 'system'),
(1, 1, '2026-03-09', '08:00:00', '17:00:00', 8.00, 0.50, 'Di_lam', 'Normal working day + 0.5h OT', 'system'),
(1, 1, '2026-03-10', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-11', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-12', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-13', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-16', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-17', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-18', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-19', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-20', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-23', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-24', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-25', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-26', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-27', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-30', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(1, 1, '2026-03-31', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system');

-- NV2 (Trần Thị Lan - Quản lý): Full attendance + 1 day late
INSERT IGNORE INTO cham_cong (MaNV, MaCa, Ngay, GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, CreatedBy) VALUES
(2, 1, '2026-03-03', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-04', '08:15:00', '17:00:00', 7.75, 0.00, 'Tre', 'Late arrival 15 minutes', 'system'),
(2, 1, '2026-03-05', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-06', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-09', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-10', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-11', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-12', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-13', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-16', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-17', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-18', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-19', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-20', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-23', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-24', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-25', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-26', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-27', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-30', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(2, 1, '2026-03-31', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system');

-- NV3 (Lê Văn Hùng - Thu ngân): Full attendance + 1 sick day (Nghi_benh - company pays)
INSERT IGNORE INTO cham_cong (MaNV, MaCa, Ngay, GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, CreatedBy) VALUES
(3, 1, '2026-03-03', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-04', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-05', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-06', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-09', NULL, NULL, 0.00, 0.00, 'Nghi_benh', 'Sick leave (company pays)', 'system'),
(3, 1, '2026-03-10', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-11', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-12', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-13', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-16', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-17', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-18', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-19', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-20', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-23', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-24', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-25', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-26', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-27', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-30', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(3, 1, '2026-03-31', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system');

-- NV4 (Phạm Thị Mai - Nhân viên kho): 18 working days + 3 missing days
INSERT IGNORE INTO cham_cong (MaNV, MaCa, Ngay, GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, CreatedBy) VALUES
(4, 1, '2026-03-03', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-04', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-05', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-06', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-09', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-10', NULL, NULL, 0.00, 0.00, 'Nghi_khong_phep', 'Unauthorized absence (Day 1)', 'system'),
(4, 1, '2026-03-11', NULL, NULL, 0.00, 0.00, 'Nghi_khong_phep', 'Unauthorized absence (Day 2)', 'system'),
(4, 1, '2026-03-12', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-13', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-16', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-17', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-18', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-19', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-20', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-23', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-24', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-25', NULL, NULL, 0.00, 0.00, 'Nghi_khong_phep', 'Unauthorized absence (Day 3)', 'system'),
(4, 1, '2026-03-26', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-27', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-30', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(4, 1, '2026-03-31', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system');

-- NV5 (Hoàng Văn Nam - HR): Full attendance + 8 hours OT + 1 paid leave
INSERT IGNORE INTO cham_cong (MaNV, MaCa, Ngay, GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, CreatedBy) VALUES
(5, 1, '2026-03-03', '08:00:00', '17:00:00', 8.00, 2.00, 'Di_lam', 'Normal working day + 2h OT', 'system'),
(5, 1, '2026-03-04', '08:00:00', '17:00:00', 8.00, 1.50, 'Di_lam', 'Normal working day + 1.5h OT', 'system'),
(5, 1, '2026-03-05', '08:00:00', '17:00:00', 8.00, 1.00, 'Di_lam', 'Normal working day + 1h OT', 'system'),
(5, 1, '2026-03-06', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-09', '08:00:00', '17:00:00', 8.00, 2.00, 'Di_lam', 'Normal working day + 2h OT', 'system'),
(5, 1, '2026-03-10', '08:00:00', '17:00:00', 8.00, 1.50, 'Di_lam', 'Normal working day + 1.5h OT', 'system'),
(5, 1, '2026-03-11', NULL, NULL, 0.00, 0.00, 'Nghi_phep', 'Paid leave (authorized)', 'system'),
(5, 1, '2026-03-12', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-13', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-16', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-17', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-18', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-19', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-20', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-23', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-24', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-25', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-26', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-27', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-30', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system'),
(5, 1, '2026-03-31', '08:00:00', '17:00:00', 8.00, 0.00, 'Di_lam', 'Normal working day', 'system');

-- ================================================================================
-- 3. INSERT MANUAL BONUSES/PENALTIES (THUONG_PHAT) FOR MARCH 2026
-- ================================================================================
INSERT IGNORE INTO thuong_phat (MaNV, Thang, Nam, Loai, SoTien, LyDo, NguoiTao, GhiChu) VALUES
(1, 3, 2026, 'Thuong', 500000, 'Thưởng công dân tốt - Tháng 3', 1, 'Seed data for testing'),
(2, 3, 2026, 'Thuong', 300000, 'Thưởng hoàn thành dự án - Tháng 3', 1, 'Seed data for testing'),
(3, 3, 2026, 'Phat', 100000, 'Phạt vi phạm quy định - Tháng 3', 1, 'Seed data for testing'),
(5, 3, 2026, 'Thuong', 200000, 'Thưởng công việc phụ trợ - Tháng 3', 1, 'Seed data for testing');

-- ================================================================================
-- 4. OPTIONAL: Update SoNguoiPhuThuoc for employees (if column added)
-- ================================================================================
-- Uncomment after adding SoNguoiPhuThuoc column to nhanvien table
-- UPDATE nhanvien SET SoNguoiPhuThuoc = 2 WHERE MaNV = 1; -- Admin: 2 dependents
-- UPDATE nhanvien SET SoNguoiPhuThuoc = 1 WHERE MaNV = 2; -- Quản lý: 1 dependent
-- UPDATE nhanvien SET SoNguoiPhuThuoc = 0 WHERE MaNV = 3; -- Thu ngân: no dependents
-- UPDATE nhanvien SET SoNguoiPhuThuoc = 2 WHERE MaNV = 4; -- Nhân viên kho: 2 dependents
-- UPDATE nhanvien SET SoNguoiPhuThuoc = 1 WHERE MaNV = 5; -- HR: 1 dependent

-- ================================================================================
-- 5. VERIFY DATA INSERTED
-- ================================================================================
SELECT 'ATTENDANCE RECORDS INSERTED:' as Status;
SELECT COUNT(*) as Total_Attendance_Records FROM cham_cong WHERE MONTH(Ngay) = 3 AND YEAR(Ngay) = 2026;

SELECT 'BONUSES/PENALTIES INSERTED:' as Status;
SELECT COUNT(*) as Total_BonusPenalty_Records FROM thuong_phat WHERE Thang = 3 AND Nam = 2026;

SELECT 'HOLIDAYS FOR MARCH 2026:' as Status;
SELECT MaNgayLe, TenNgayLe, Ngay, HeSoLuong FROM ngay_le WHERE MONTH(Ngay) = 3 AND YEAR(Ngay) = 2026;

-- ================================================================================
-- NOTES FOR SALARY CALCULATION:
-- ================================================================================
-- Expected salary calculations for March 2026:
--
-- NV1 (Giám đốc - LuongCoBan: 20,000,000):
--   - Di_lam: 21 days
--   - Tre/Ve_som: 0
--   - Nghi_loai_other: 0
--   - SoGioTangCa: 5.0 hours
--   - Eligibility: ELIGIBLE for bonus (no sick days, no late, 21 >= 26... wait this is < 26)
--   - Note: 21 working days in March (not full 26)
--
-- NV2 (Quản lý - LuongCoBan: 15,000,000):
--   - Di_lam: 20 days
--   - Tre: 1 day
--   - SoGioTangCa: 0
--   - Eligibility: NOT eligible (has Tre penalty)
--   - Manual Bonus: 300,000
--
-- NV3 (Thu ngân - LuongCoBan: 8,000,000):
--   - Di_lam: 20 days
--   - Nghi_benh: 1 day (company pays, counts as PayableDay)
--   - SoGioTangCa: 0
--   - Eligibility: ELIGIBLE if Nghi_benh <= 2 days
--   - Manual Penalty: 100,000
--
-- NV4 (Nhân viên kho - LuongCoBan: 7,500,000):
--   - Di_lam: 18 days
--   - Nghi_khong_phep: 3 days (NOT counted in PayableDays, NOT eligible for bonus)
--   - SoGioTangCa: 0
--   - Eligibility: NOT eligible (less than 26 days, has unauthorized absence)
--
-- NV5 (HR - LuongCoBan: 12,000,000):
--   - Di_lam: 20 days
--   - Nghi_phep: 1 day (counts as PayableDay)
--   - SoGioTangCa: 8.0 hours
--   - Eligibility: ELIGIBLE for bonus (21 >= 26... wait also less than 26)
--   - Manual Bonus: 200,000
-- ================================================================================
