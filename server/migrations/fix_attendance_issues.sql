-- =============================================
-- FIX ATTENDANCE SYSTEM ISSUES
-- Date: 2026-02-04
-- Compatible with MySQL 5.7+
-- =============================================

-- Tắt safe update mode tạm thời
SET SQL_SAFE_UPDATES = 0;

-- 1. Thêm cột PhutNghi vào bảng ca_lam_viec (dùng stored procedure để tránh lỗi nếu đã tồn tại)
DELIMITER $$

DROP PROCEDURE IF EXISTS AddPhutNghiColumn$$
CREATE PROCEDURE AddPhutNghiColumn()
BEGIN
    -- Kiểm tra xem cột đã tồn tại chưa
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'ca_lam_viec' 
        AND COLUMN_NAME = 'PhutNghi'
    ) THEN
        ALTER TABLE ca_lam_viec 
        ADD COLUMN PhutNghi INT DEFAULT 60 COMMENT 'Phút nghỉ giữa ca (mặc định 60 phút)';
    END IF;
END$$

DELIMITER ;

CALL AddPhutNghiColumn();
DROP PROCEDURE AddPhutNghiColumn;

-- Cập nhật dữ liệu cho các ca hiện có (sử dụng MaCa để tránh lỗi safe mode)
UPDATE ca_lam_viec SET PhutNghi = 60 WHERE MaCa > 0 AND PhutNghi IS NULL;

-- 2. Tạo bảng lịch sử chỉnh sửa chấm công
CREATE TABLE IF NOT EXISTS lich_su_cham_cong (
    MaLS INT PRIMARY KEY AUTO_INCREMENT,
    MaCC INT NOT NULL,
    NguoiSua INT NOT NULL COMMENT 'Mã tài khoản người sửa',
    NgaySua DATETIME DEFAULT CURRENT_TIMESTAMP,
    TruocKhi JSON COMMENT 'Dữ liệu trước khi sửa',
    SauKhi JSON COMMENT 'Dữ liệu sau khi sửa',
    LyDo TEXT COMMENT 'Lý do chỉnh sửa',
    DiaChi_IP VARCHAR(50),
    INDEX idx_macc (MaCC),
    INDEX idx_nguoisua (NguoiSua),
    FOREIGN KEY (MaCC) REFERENCES cham_cong(MaCC) ON DELETE CASCADE,
    FOREIGN KEY (NguoiSua) REFERENCES taikhoan(MaTK)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci 
COMMENT='Lịch sử chỉnh sửa chấm công';

-- 3. Tạo bảng ngày lễ
CREATE TABLE IF NOT EXISTS ngay_le (
    MaNgayLe INT PRIMARY KEY AUTO_INCREMENT,
    TenNgayLe VARCHAR(100) NOT NULL,
    Ngay DATE NOT NULL,
    HeSoLuong DECIMAL(3,2) DEFAULT 2.00 COMMENT 'Hệ số lương ngày lễ (2.0 = x2)',
    LoaiNgayLe VARCHAR(50) DEFAULT 'Quoc_gia' COMMENT 'Quoc_gia, Tet, Khac',
    GhiChu TEXT,
    UNIQUE KEY unique_ngay_le (Ngay)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci 
COMMENT='Danh sách ngày lễ và hệ số lương';

-- Thêm dữ liệu ngày lễ 2026
INSERT INTO ngay_le (TenNgayLe, Ngay, HeSoLuong, LoaiNgayLe) VALUES
('Tết Dương lịch', '2026-01-01', 2.00, 'Quoc_gia'),
('Tết Nguyên Đán (29 Tết)', '2026-01-28', 2.00, 'Tet'),
('Tết Nguyên Đán (Mùng 1)', '2026-01-29', 3.00, 'Tet'),
('Tết Nguyên Đán (Mùng 2)', '2026-01-30', 2.50, 'Tet'),
('Tết Nguyên Đán (Mùng 3)', '2026-01-31', 2.00, 'Tet'),
('Giỗ Tổ Hùng Vương', '2026-04-02', 2.00, 'Quoc_gia'),
('Giải phóng Miền Nam', '2026-04-30', 2.00, 'Quoc_gia'),
('Quốc tế Lao động', '2026-05-01', 2.00, 'Quoc_gia'),
('Quốc khánh', '2026-09-02', 2.00, 'Quoc_gia')
ON DUPLICATE KEY UPDATE TenNgayLe = VALUES(TenNgayLe);

-- 4. Thêm cột tracking vào bảng cham_cong (dùng stored procedure)
DELIMITER $$

DROP PROCEDURE IF EXISTS AddChamCongColumns$$
CREATE PROCEDURE AddChamCongColumns()
BEGIN
    -- Thêm DiaChi_IP
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATIO (kiểm tra trước khi thêm)
SET @exist_idx_ngay := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cham_cong' AND INDEX_NAME = 'idx_ngay'
);
SET @sql_idx_ngay := IF(@exist_idx_ngay = 0, 
    'ALTER TABLE cham_cong ADD INDEX idx_ngay (Ngay)', 
    'SELECT "Index idx_ngay already exists"'
);
PREPARE stmt FROM @sql_idx_ngay;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_idx_trangthai := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cham_cong' AND INDEX_NAME = 'idx_trangthai'
);
SET @sql_idx_trangthai := IF(@exist_idx_trangthai = 0, 
    'ALTER TABLE cham_cong ADD INDEX idx_trangthai (TrangThai)', 
    'SELECT "Index idx_trangthai already exists"'
);
PREPARE stmt FROM @sql_idx_trangthai;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_idx_manv_ngay := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cham_cong' AND INDEX_NAME = 'idx_manv_ngay'
);
SET @sql_idx_manv_ngay := IF(@exist_idx_manv_ngay = 0, 
    'ALTER TABLE cham_cong ADD INDEX idx_manv_ngay (MaNV, Ngay)', 
    'SELECT "Index idx_manv_ngay already exists"'
);
PREPARE stmt FROM @sql_idx_manv_ngay;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Bỏ qua constraint CHECK vì MySQL 5.7 không hỗ trợ tốt
-- Validation sẽ được xử lý ở tầng application (attendanceController.js)  -- Thêm ThietBi
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cham_cong' AND COLUMN_NAME = 'ThietBi'
    ) THEN
        ALTER TABLE cham_cong ADD COLUMN ThietBi VARCHAR(100) COMMENT 'Thiết bị chấm công';
    END IF;
    
    -- Thêm LanSuaCuoi
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cham_cong' AND COLUMN_NAME = 'LanSuaCuoi'
    ) THEN
        ALTER TABLE cham_cong ADD COLUMN LanSuaCuoi DATETIME COMMENT 'Lần sửa cuối cùng';
    END IF;
    
    -- Thêm NguoiSuaCuoi
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cham_cong' AND COLUMN_NAME = 'NguoiSuaCuoi'
    ) THEN
        ALTER TABLE cham_cong ADD COLUMN NguoiSuaCuoi INT COMMENT 'Người sửa cuối cùng';
    END IF;
END$$

DELIMITER ;

CALL AddChamCongColumns();
DROP PROCEDURE AddChamCongColumns;

-- 5. Thêm index để tối ưu query
ALTER TABLE cham_cong 
ADD INDEX idx_ngay (Ngay),
ADD INDEX idx_trangthai (TrangThai),
ADD INDEX idx_manv_ngay (MaNV, Ngay);

-- 6. Thêm constraint kiểm tra giờ hợp lệ
ALTER TABLE cham_cong
ADD CONSTRAINT chk_gio_hop_le 
CHECK (
    GioRa IS NULL OR 
    GioVao IS NULL OR 
    TIME_TO_SEC(GioRa) >= TIME_TO_SEC(GioVao) OR
    (TIME_TO_SEC(GioRa) < TIME_TO_SEC(GioVao) AND SoGioLam <= 24)
);

-- 7. Tạo view báo cáo chấm công bất thường
CREATE OR REPLACE VIEW v_cham_cong_bat_thuong AS
SELECT 
    nv.MaNV,
    nv.HoTen,
    YEAR(cc.Ngay) as Nam,
    MONTH(cc.Ngay) as Thang,
    SUM(CASE WHEN cc.TrangThai = 'Tre' THEN 1 ELSE 0 END) as SoLanTre,
    SUM(CASE WHEN cc.TrangThai = 'Ve_som' THEN 1 ELSE 0 END) as SoLanVeSom,
    SUM(CASE WHEN cc.GioRa IS NULL AND cc.GioVao IS NOT NULL THEN 1 ELSE 0 END) as QuenChamRa,
    SUM(cc.SoGioTangCa) as TongGioTangCa,
    COUNT(cc.MaCC) as TongNgayChamCong
FROM cham_cong cc
JOIN nhanvien nv ON cc.MaNV = nv.MaNV
GROUP BY nv.MaNV, nv.HoTen, YEAR(cc.Ngay), MONTH(cc.Ngay);

-- 8. Tạo stored procedure tự động đánh vắng mặt
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS sp_auto_mark_absent(IN target_date DATE)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_MaNV INT;
    DECLARE v_MaCa INT;
    
    DECLARE cur_employees CURSOR FOR 
        SELECT MaNV, MaCa FROM nhanvien WHERE TinhTrang = 1;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur_employees;
    
    read_loop: LOOP
        FETCH cur_employees INTO v_MaNV, v_MaCa;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Kiểm tra xem nhân viên đã có bản ghi chấm công chưa
        IF NOT EXISTS (
            SELECT 1 FROM cham_cong 
            WHERE MaNV = v_MaNV AND Ngay = target_date
        ) THEN
            -- Kiểm tra xem có đơn nghỉ phép được duyệt không
            IF EXISTS (
DROP TRIGGER IF EXISTS tr_cham_cong_before_update$$
CREATE TRIGGERM xin_nghi_phep 
                WHERE MaNV = v_MaNV 
                AND TrangThai = 'Da_duyet'
                AND target_date BETWEEN DATE(NgayBatDau) AND DATE(NgayKetThuc)
            ) THEN
                -- Insert với trạng thái nghỉ phép
                INSERT INTO cham_cong (MaNV, MaCa, Ngay, TrangThai, GhiChu, CreatedBy)
                VALUES (v_MaNV, v_MaCa, target_date, 'Nghi_phep', 'Nghỉ phép có đơn', 'System_Auto');
            ELSE
                -- Insert với trạng thái vắng mặt
                INSERT INTO cham_cong (MaNV, MaCa, Ngay, TrangThai, GhiChu, CreatedBy)
                VALUES (v_MaNV, v_MaCa, target_date, 'Nghi_khong_phep', 'Hệ thống tự động đánh vắng mặt', 'System_Auto');
            END IF;
        END IF;
    END LOOP;
    
    CLOSE cur_employees;
END$$

DELIMITER ;

-- 9. Tạo trigger ghi log khi sửa chấm công
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS tr_cham_cong_before_update
BEFORE UPDATE ON cham_cong
FOR EACH ROW
BEGIN
    SET NEW.LanSuaCuoi = NOW();
    -- NguoiSuaCuoi sẽ được set từ application
END$$

DELIMITER ;

COMMIT;
