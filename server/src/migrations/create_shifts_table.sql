-- Migration: Create Shifts Table and update Attendance/Employee schema

-- 1. Create Shifts Table
CREATE TABLE IF NOT EXISTS ca_lam_viec (
    MaCa INT AUTO_INCREMENT PRIMARY KEY,
    TenCa VARCHAR(50) NOT NULL,
    GioBatDau TIME NOT NULL,
    GioKetThuc TIME NOT NULL,
    PhutNghi INT DEFAULT 60, -- Mặc định nghỉ 60 phút
    MoTa TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Insert Sample Shifts
INSERT IGNORE INTO ca_lam_viec (MaCa, TenCa, GioBatDau, GioKetThuc, PhutNghi, MoTa) VALUES
(1, 'Ca Hành Chính', '08:00:00', '17:00:00', 60, 'Ca làm việc giờ hành chính'),
(2, 'Ca Sáng', '08:00:00', '12:00:00', 0, 'Ca làm việc buổi sáng'),
(3, 'Ca Chiều', '13:00:00', '17:00:00', 0, 'Ca làm việc buổi chiều'),
(4, 'Ca Tối', '17:00:00', '21:00:00', 0, 'Ca làm việc buổi tối');

-- 3. Add MaCa to nhanvien (Default Shift)
ALTER TABLE nhanvien ADD COLUMN MaCa INT DEFAULT 1;
ALTER TABLE nhanvien ADD CONSTRAINT fk_nv_ca FOREIGN KEY (MaCa) REFERENCES ca_lam_viec(MaCa);

-- 4. Add MaCa to cham_cong (Recorded Shift)
ALTER TABLE cham_cong ADD COLUMN MaCa INT AFTER MaNV;
ALTER TABLE cham_cong ADD CONSTRAINT fk_cc_ca FOREIGN KEY (MaCa) REFERENCES ca_lam_viec(MaCa);

-- 5. Add Ve_som status support (Optional: Update constraints if any exist, usually Enum in some DBs)
-- In MySQL, if it's already a VARCHAR, no change needed.
