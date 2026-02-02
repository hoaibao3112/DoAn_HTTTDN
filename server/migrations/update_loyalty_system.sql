-- =====================================================
-- HỆ THỐNG HỘI VIÊN & TÍCH ĐIỂM
-- Loyalty Points & Membership System
-- =====================================================

-- Tắt safe update mode tạm thời
SET SQL_SAFE_UPDATES = 0;

-- =====================================================
-- 1. CẬP NHẬT BẢNG KHÁCH HÀNG (nếu cần)
-- =====================================================

-- Procedure để thêm cột an toàn (không lỗi nếu cột đã tồn tại)
DELIMITER $$

DROP PROCEDURE IF EXISTS `AddColumnIfNotExists`$$

CREATE PROCEDURE `AddColumnIfNotExists`(
    IN tableName VARCHAR(128),
    IN columnName VARCHAR(128),
    IN columnDefinition VARCHAR(255)
)
BEGIN
    DECLARE colCount INT;
    
    SELECT COUNT(*) INTO colCount
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = tableName
    AND COLUMN_NAME = columnName;
    
    IF colCount = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', tableName, '` ADD COLUMN `', columnName, '` ', columnDefinition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- Thêm các cột vào bảng khachhang
CALL AddColumnIfNotExists('khachhang', 'DiemTichLuy', 'INT DEFAULT 0 COMMENT ''Tổng điểm hiện có''');
CALL AddColumnIfNotExists('khachhang', 'DiemDaDung', 'INT DEFAULT 0 COMMENT ''Tổng điểm đã tiêu''');
CALL AddColumnIfNotExists('khachhang', 'TongDiemTichLuy', 'INT DEFAULT 0 COMMENT ''Tổng điểm từ trước tới nay''');
CALL AddColumnIfNotExists('khachhang', 'HangTV', 'VARCHAR(50) DEFAULT ''Dong'' COMMENT ''Dong, Bac, Vang, Kim_cuong''');
CALL AddColumnIfNotExists('khachhang', 'NgayThamGia', 'DATE DEFAULT NULL COMMENT ''Ngày đăng ký thành viên''');
CALL AddColumnIfNotExists('khachhang', 'NgayNangHang', 'DATETIME DEFAULT NULL COMMENT ''Lần cuối nâng hạng''');

-- Cập nhật ngày tham gia cho khách hàng cũ (nếu NULL)
UPDATE `khachhang` 
SET `NgayThamGia` = CURDATE() 
WHERE `NgayThamGia` IS NULL;

-- =====================================================
-- 2. BẢNG LỊCH SỬ ĐIỂM
-- =====================================================

DROP TABLE IF EXISTS `lich_su_diem`;

CREATE TABLE `lich_su_diem` (
  `MaLS` INT NOT NULL AUTO_INCREMENT,
  `MaKH` INT NOT NULL,
  `MaHD` INT DEFAULT NULL COMMENT 'Mã hóa đơn (nếu có)',
  `LoaiGiaoDich` VARCHAR(50) NOT NULL COMMENT 'Cong_diem, Tru_diem, Het_han, Dieu_chinh',
  `SoDiem` INT NOT NULL COMMENT 'Số điểm thay đổi',
  `DiemTruoc` INT DEFAULT 0 COMMENT 'Điểm trước khi giao dịch',
  `DiemSau` INT DEFAULT 0 COMMENT 'Điểm sau khi giao dịch',
  `LyDo` VARCHAR(255) DEFAULT NULL COMMENT 'Lý do giao dịch',
  `MoTa` TEXT COMMENT 'Mô tả chi tiết',
  `NgayGiaoDich` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `NgayHetHan` DATE DEFAULT NULL COMMENT 'Ngày điểm hết hạn (nếu có)',
  `NguoiThucHien` INT DEFAULT NULL COMMENT 'Mã nhân viên thực hiện',
  
  PRIMARY KEY (`MaLS`),
  KEY `idx_khachhang` (`MaKH`),
  KEY `idx_hoadon` (`MaHD`),
  KEY `idx_ngaygd` (`NgayGiaoDich`),
  
  CONSTRAINT `fk_lsdiem_kh` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`) ON DELETE CASCADE,
  CONSTRAINT `fk_lsdiem_hd` FOREIGN KEY (`MaHD`) REFERENCES `hoadon` (`MaHD`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Lịch sử tích điểm và sử dụng điểm của khách hàng';

-- =====================================================
-- 3. BẢNG QUY TẮC TÍCH ĐIỂM
-- =====================================================

DROP TABLE IF EXISTS `quy_tac_tich_diem`;

CREATE TABLE `quy_tac_tich_diem` (
  `MaQT` INT NOT NULL AUTO_INCREMENT,
  `TenQT` VARCHAR(100) NOT NULL,
  `MoTa` TEXT,
  `SoTienMua` DECIMAL(12,2) NOT NULL COMMENT 'Số tiền mua bao nhiêu',
  `SoDiem` INT NOT NULL COMMENT 'Được bao nhiêu điểm',
  `HeSoNhan` DECIMAL(5,2) DEFAULT 1.0 COMMENT 'Hệ số nhân điểm (1.0 = 100%, 1.5 = 150%)',
  
  -- Áp dụng cho
  `ApDungCho` VARCHAR(50) DEFAULT 'Tat_ca' COMMENT 'Tat_ca, The_loai, San_pham, Hang_TV, Khung_gio',
  `MaDoiTuong` INT DEFAULT NULL COMMENT 'ID của thể loại/sản phẩm/hạng (nếu có)',
  
  -- Thời gian
  `TuNgay` DATETIME DEFAULT NULL,
  `DenNgay` DATETIME DEFAULT NULL,
  `ThuTrongTuan` VARCHAR(20) DEFAULT NULL COMMENT 'VD: 0,6 = CN,T7',
  `KhungGio` VARCHAR(50) DEFAULT NULL COMMENT 'VD: 10:00-12:00',
  
  -- Trạng thái
  `TrangThai` TINYINT(1) DEFAULT 1 COMMENT '1: Hoạt động, 0: Tắt',
  `ThuTu` INT DEFAULT 0 COMMENT 'Thứ tự ưu tiên áp dụng',
  
  PRIMARY KEY (`MaQT`),
  KEY `idx_trangthai` (`TrangThai`),
  KEY `idx_apdung` (`ApDungCho`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Quy tắc tính điểm thưởng cho khách hàng';

-- Dữ liệu mẫu quy tắc tích điểm
INSERT INTO `quy_tac_tich_diem` VALUES
-- Quy tắc cơ bản
(1, 'Quy tắc cơ bản', 'Mua 10,000đ = 1 điểm', 10000.00, 1, 1.0, 'Tat_ca', NULL, '2026-01-01', '2099-12-31', NULL, NULL, 1, 1),

-- Quy tắc theo thể loại
(2, 'Sách Văn học x1.5', 'Mua sách văn học được x1.5 điểm', 10000.00, 1, 1.5, 'The_loai', 1, '2026-01-01', '2099-12-31', NULL, NULL, 1, 2),
(3, 'Sách Kỹ năng x1.2', 'Mua sách kỹ năng được x1.2 điểm', 10000.00, 1, 1.2, 'The_loai', 4, '2026-01-01', '2099-12-31', NULL, NULL, 1, 3),

-- Quy tắc theo thời gian
(4, 'Giờ vàng x2 điểm', 'Mua từ 10h-12h được x2 điểm', 10000.00, 1, 2.0, 'Khung_gio', NULL, '2026-01-01', '2099-12-31', NULL, '10:00-12:00', 1, 4),
(5, 'Cuối tuần x1.5', 'Mua Thứ 7, CN được x1.5 điểm', 10000.00, 1, 1.5, 'Tat_ca', NULL, '2026-01-01', '2099-12-31', '0,6', NULL, 1, 5);

-- =====================================================
-- 4. BẢNG ƯU ĐÃI THEO HẠNG THÀNH VIÊN
-- =====================================================

DROP TABLE IF EXISTS `uu_dai_hang_thanh_vien`;

CREATE TABLE `uu_dai_hang_thanh_vien` (
  `MaUD` INT NOT NULL AUTO_INCREMENT,
  `HangTV` VARCHAR(50) NOT NULL COMMENT 'Dong, Bac, Vang, Kim_cuong',
  `DiemToiThieu` INT NOT NULL COMMENT 'Điểm tối thiểu để đạt hạng',
  `DiemToiDa` INT DEFAULT NULL COMMENT 'Điểm tối đa của hạng (NULL = không giới hạn)',
  
  -- Ưu đãi
  `PhanTramGiam` DECIMAL(5,2) DEFAULT 0 COMMENT 'Giảm % mọi đơn hàng',
  `HeSoTichDiem` DECIMAL(5,2) DEFAULT 1.0 COMMENT 'Hệ số nhân điểm khi mua (1.0 = 100%)',
  `GiamSinhNhat` DECIMAL(5,2) DEFAULT 0 COMMENT 'Giảm % tháng sinh nhật',
  `MienPhiShip` TINYINT(1) DEFAULT 0 COMMENT 'Miễn phí vận chuyển',
  `UuTienMuaMoi` TINYINT(1) DEFAULT 0 COMMENT 'Ưu tiên mua sách mới',
  
  -- Giới hạn sử dụng điểm
  `ToiDaDungDiem` DECIMAL(5,2) DEFAULT 50.0 COMMENT 'Tối đa dùng % giá trị đơn',
  
  `MoTa` TEXT,
  `TrangThai` TINYINT(1) DEFAULT 1,
  
  PRIMARY KEY (`MaUD`),
  UNIQUE KEY `unique_hang` (`HangTV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Ưu đãi và quyền lợi theo từng hạng thành viên';

-- Dữ liệu ưu đãi theo hạng
INSERT INTO `uu_dai_hang_thanh_vien` VALUES
(1, 'Dong', 0, 999, 0, 1.0, 5.0, 0, 0, 30.0, 
 'Hạng Đồng - Thành viên mới\n- Tích điểm cơ bản\n- Giảm 5% sinh nhật\n- Dùng tối đa 30% giá trị đơn bằng điểm', 1),

(2, 'Bac', 1000, 4999, 5.0, 1.1, 10.0, 0, 0, 40.0,
 'Hạng Bạc - Thành viên thân thiết\n- Giảm 5% mọi đơn hàng\n- Tích điểm +10%\n- Giảm 10% sinh nhật\n- Dùng tối đa 40% giá trị đơn bằng điểm', 1),

(3, 'Vang', 5000, 19999, 10.0, 1.2, 15.0, 1, 0, 50.0,
 'Hạng Vàng - Thành viên VIP\n- Giảm 10% mọi đơn hàng\n- Tích điểm +20%\n- Giảm 15% sinh nhật\n- Miễn phí ship\n- Dùng tối đa 50% giá trị đơn bằng điểm', 1),

(4, 'Kim_cuong', 20000, NULL, 15.0, 1.3, 20.0, 1, 1, 100.0,
 'Hạng Kim Cương - Thành viên Đặc Biệt\n- Giảm 15% mọi đơn hàng\n- Tích điểm +30%\n- Giảm 20% sinh nhật\n- Miễn phí ship\n- Ưu tiên mua sách mới\n- Không giới hạn sử dụng điểm', 1);

-- =====================================================
-- 5. CẬP NHẬT BẢNG HÓA ĐƠN (thêm cột điểm)
-- =====================================================

-- Thêm các cột vào bảng hoadon
CALL AddColumnIfNotExists('hoadon', 'DiemTichLuy', 'INT DEFAULT 0 COMMENT ''Điểm được cộng từ đơn này''');
CALL AddColumnIfNotExists('hoadon', 'DiemDaDung', 'INT DEFAULT 0 COMMENT ''Điểm khách đã dùng''');
CALL AddColumnIfNotExists('hoadon', 'GiamGiaHangTV', 'DECIMAL(15,2) DEFAULT 0 COMMENT ''Giảm giá từ hạng thành viên''');

-- Cập nhật lại tên cột cho thống nhất (nếu có cột DiemSuDung cũ)
-- ALTER TABLE `hoadon` CHANGE `DiemSuDung` `DiemDaDung` INT DEFAULT 0;

-- =====================================================
-- 6. STORED PROCEDURES - HÀM HỖ TRỢ
-- =====================================================

-- Hàm tính điểm được cộng từ đơn hàng
DELIMITER $$

DROP FUNCTION IF EXISTS `fn_TinhDiemDuocCong`$$

CREATE FUNCTION `fn_TinhDiemDuocCong`(
    p_TongTien DECIMAL(15,2),
    p_MaTL INT,
    p_HangTV VARCHAR(50),
    p_GioBan TIME,
    p_ThuTrongTuan INT
) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_DiemCoBan INT DEFAULT 0;
    DECLARE v_HeSo DECIMAL(5,2) DEFAULT 1.0;
    DECLARE v_HeSoHang DECIMAL(5,2) DEFAULT 1.0;
    
    -- Tính điểm cơ bản (10,000đ = 1 điểm)
    SET v_DiemCoBan = FLOOR(p_TongTien / 10000);
    
    -- Lấy hệ số theo hạng
    SELECT HeSoTichDiem INTO v_HeSoHang 
    FROM uu_dai_hang_thanh_vien 
    WHERE HangTV = p_HangTV LIMIT 1;
    
    -- Lấy hệ số cao nhất từ quy tắc (thể loại, giờ, ngày...)
    SELECT MAX(HeSoNhan) INTO v_HeSo
    FROM quy_tac_tich_diem
    WHERE TrangThai = 1
    AND (ApDungCho = 'Tat_ca' 
         OR (ApDungCho = 'The_loai' AND MaDoiTuong = p_MaTL)
         OR (ApDungCho = 'Khung_gio' AND TIME(NOW()) BETWEEN SUBSTRING_INDEX(KhungGio, '-', 1) AND SUBSTRING_INDEX(KhungGio, '-', -1))
         OR (ThuTrongTuan IS NOT NULL AND FIND_IN_SET(p_ThuTrongTuan, ThuTrongTuan) > 0)
    );
    
    IF v_HeSo IS NULL THEN
        SET v_HeSo = 1.0;
    END IF;
    
    RETURN FLOOR(v_DiemCoBan * v_HeSo * v_HeSoHang);
END$$

DELIMITER ;

-- Hàm xác định hạng thành viên
DELIMITER $$

DROP FUNCTION IF EXISTS `fn_XacDinhHangTV`$$

CREATE FUNCTION `fn_XacDinhHangTV`(p_TongDiem INT) 
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE v_Hang VARCHAR(50) DEFAULT 'Dong';
    
    SELECT HangTV INTO v_Hang
    FROM uu_dai_hang_thanh_vien
    WHERE p_TongDiem >= DiemToiThieu 
    AND (DiemToiDa IS NULL OR p_TongDiem <= DiemToiDa)
    LIMIT 1;
    
    RETURN v_Hang;
END$$

DELIMITER ;

-- =====================================================
-- 7. TRIGGERS - TỰ ĐỘNG CẬP NHẬT HẠNG
-- =====================================================

DELIMITER $$

DROP TRIGGER IF EXISTS `trg_CapNhatHangTV_AfterDiemThayDoi`$$

CREATE TRIGGER `trg_CapNhatHangTV_AfterDiemThayDoi`
AFTER UPDATE ON `khachhang`
FOR EACH ROW
BEGIN
    DECLARE v_HangMoi VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    
    -- Chỉ chạy khi điểm tích lũy thay đổi
    IF NEW.TongDiemTichLuy <> OLD.TongDiemTichLuy THEN
        SET v_HangMoi = fn_XacDinhHangTV(NEW.TongDiemTichLuy);
        
        -- Nếu hạng thay đổi (sử dụng COLLATE để tránh lỗi)
        IF v_HangMoi COLLATE utf8mb4_unicode_ci <> OLD.HangTV COLLATE utf8mb4_unicode_ci THEN
            UPDATE khachhang 
            SET HangTV = v_HangMoi,
                NgayNangHang = NOW()
            WHERE MaKH = NEW.MaKH;
        END IF;
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- 8. DỮ LIỆU MẪU - CẬP NHẬT KHÁCH HÀNG
-- =====================================================

-- Bạn có thể tự cập nhật điểm cho khách hàng sau khi tạo xong
-- Ví dụ:
-- UPDATE `khachhang` SET 
--     `DiemTichLuy` = 2500,
--     `TongDiemTichLuy` = 3000,
--     `DiemDaDung` = 500,
--     `HangTV` = 'Bac',
--     `NgayThamGia` = '2025-01-15',
--     `NgayNangHang` = '2025-06-20'
-- WHERE `MaKH` = 1;

-- Thêm lịch sử điểm mẫu
INSERT INTO `lich_su_diem` 
(`MaKH`, `MaHD`, `LoaiGiaoDich`, `SoDiem`, `DiemTruoc`, `DiemSau`, `LyDo`, `MoTa`) 
VALUES
(1, 20, 'Cong_diem', 50, 2450, 2500, 'Tích điểm từ đơn hàng', 'Mua hàng 500,000đ'),
(1, NULL, 'Tru_diem', -500, 3000, 2500, 'Sử dụng điểm thanh toán', 'Dùng 500 điểm = 50,000đ'),
(2, 21, 'Cong_diem', 30, 770, 800, 'Tích điểm từ đơn hàng', 'Mua hàng 300,000đ');

-- =====================================================
-- 9. VIEW - XEM THÔNG TIN HỘI VIÊN
-- =====================================================

DROP VIEW IF EXISTS `v_ThongTinHoiVien`;

CREATE VIEW `v_ThongTinHoiVien` AS
SELECT 
    kh.*,
    ud.PhanTramGiam,
    ud.HeSoTichDiem,
    ud.GiamSinhNhat,
    ud.MienPhiShip,
    ud.ToiDaDungDiem,
    ud.MoTa AS MoTaHang,
    CASE 
        WHEN kh.HangTV COLLATE utf8mb4_unicode_ci = 'Kim_cuong' THEN NULL
        ELSE (SELECT DiemToiThieu FROM uu_dai_hang_thanh_vien 
              WHERE HangTV = (SELECT HangTV FROM uu_dai_hang_thanh_vien 
                             WHERE DiemToiThieu > ud.DiemToiThieu 
                             ORDER BY DiemToiThieu LIMIT 1)) - kh.TongDiemTichLuy
    END AS DiemCanDeLenHang,
    (kh.DiemTichLuy * 100) AS GiaTriDiemHienTai
FROM khachhang kh
LEFT JOIN uu_dai_hang_thanh_vien ud ON kh.HangTV COLLATE utf8mb4_unicode_ci = ud.HangTV;

-- =====================================================
-- HOÀN TẤT
-- =====================================================

-- Xóa procedure tạm (không cần nữa)
DROP PROCEDURE IF EXISTS `AddColumnIfNotExists`;

-- Bật lại safe update mode
SET SQL_SAFE_UPDATES = 1;

SELECT '✅ Hệ thống hội viên đã được cài đặt thành công!' AS Message;
SELECT 'Tổng số hạng thành viên:' AS Info, COUNT(*) AS SoLuong FROM uu_dai_hang_thanh_vien;
SELECT 'Tổng số quy tắc tích điểm:' AS Info, COUNT(*) AS SoLuong FROM quy_tac_tich_diem WHERE TrangThai = 1;

-- Test functions
SELECT 'Test tính điểm: 500,000đ, Thể loại 1, Hạng Bạc:' AS Test,
       fn_TinhDiemDuocCong(500000, 1, 'Bac', '11:00:00', 1) AS DiemDuocCong;

SELECT 'Test xác định hạng: 2500 điểm:' AS Test,
       fn_XacDinhHangTV(2500) AS Hang;
