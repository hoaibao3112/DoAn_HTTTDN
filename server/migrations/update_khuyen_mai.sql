-- =====================================================
-- HỆ THỐNG KHUYẾN MÃI CHO CỬA HÀNG OFFLINE
-- Đơn giản, thực tế, dễ áp dụng tại quầy
-- =====================================================

-- XÓA CÁC BẢNG CŨ (NẾU CÓ)
DROP TABLE IF EXISTS `su_dung_khuyen_mai`;
DROP TABLE IF EXISTS `chi_tiet_km_sanpham`;
DROP TABLE IF EXISTS `ma_giam_gia`;
DROP TABLE IF EXISTS `khuyen_mai`;

-- =====================================================
-- 1. BẢNG KHUYẾN MÃI CHÍNH
-- =====================================================
CREATE TABLE `khuyen_mai` (
  `MaKM` INT NOT NULL AUTO_INCREMENT,
  `TenKM` VARCHAR(100) NOT NULL,
  `MoTa` TEXT,
  `LoaiKM` VARCHAR(50) DEFAULT 'giam_phan_tram' COMMENT 'giam_phan_tram, giam_tien, mua_X_tang_Y, giam_gio_vang',
  
  -- Giá trị khuyến mãi
  `GiaTriGiam` DECIMAL(10,2) DEFAULT NULL COMMENT 'Phần trăm (10 = 10%) hoặc số tiền (50000)',
  `GiamToiDa` DECIMAL(12,2) DEFAULT NULL COMMENT 'Giảm tối đa bao nhiêu tiền',
  `GiaTriDonToiThieu` DECIMAL(12,2) DEFAULT NULL COMMENT 'Đơn hàng tối thiểu',
  
  -- Thời gian áp dụng
  `NgayBatDau` DATETIME DEFAULT NULL,
  `NgayKetThuc` DATETIME DEFAULT NULL,
  `GioApDung` VARCHAR(50) DEFAULT NULL COMMENT 'VD: 10:00-12:00,15:00-17:00 hoặc NULL = cả ngày',
  `NgayApDung` VARCHAR(50) DEFAULT NULL COMMENT 'VD: 2,4,6 (Thứ 2,4,6) hoặc NULL = cả tuần',
  
  -- Áp dụng
  `ApDungCho` VARCHAR(50) DEFAULT 'Tat_ca' COMMENT 'Tat_ca, San_pham, The_loai, Chi_nhanh',
  `MaCH` INT DEFAULT NULL COMMENT 'NULL = tất cả chi nhánh',
  
  -- Trạng thái
  `TrangThai` TINYINT(1) DEFAULT 1 COMMENT '1: Đang hoạt động, 0: Tạm dừng',
  `SoLanDaSuDung` INT DEFAULT 0,
  `GhiChu` TEXT,
  
  PRIMARY KEY (`MaKM`),
  KEY `idx_trangthai` (`TrangThai`),
  KEY `idx_thoigian` (`NgayBatDau`, `NgayKetThuc`),
  CONSTRAINT `fk_km_cuahang` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci 
COMMENT='Bảng quản lý các chương trình khuyến mãi';

-- =====================================================
-- 2. BẢNG CHI TIẾT SẢN PHẨM ĐƯỢC KHUYẾN MÃI
-- =====================================================
CREATE TABLE `chi_tiet_km_sanpham` (
  `MaCT` INT NOT NULL AUTO_INCREMENT,
  `MaKM` INT NOT NULL,
  `LoaiDoiTuong` VARCHAR(50) NOT NULL COMMENT 'San_pham, The_loai',
  `MaDoiTuong` INT NOT NULL COMMENT 'MaSP hoặc MaTL',
  
  PRIMARY KEY (`MaCT`),
  KEY `idx_km` (`MaKM`),
  KEY `idx_doituong` (`LoaiDoiTuong`, `MaDoiTuong`),
  CONSTRAINT `fk_ctkm_km` FOREIGN KEY (`MaKM`) REFERENCES `khuyen_mai` (`MaKM`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Chi tiết sản phẩm/thể loại được áp dụng khuyến mãi';

-- =====================================================
-- 3. BẢNG MÃ GIẢM GIÁ (VOUCHER)
-- =====================================================
CREATE TABLE `ma_giam_gia` (
  `MaMGG` INT NOT NULL AUTO_INCREMENT,
  `MaKM` INT NOT NULL,
  `MaCode` VARCHAR(50) NOT NULL UNIQUE COMMENT 'GIAM50K, TET2026, HSSV2026',
  
  -- Giới hạn sử dụng
  `SoLuongPhatHanh` INT DEFAULT NULL COMMENT 'NULL = không giới hạn',
  `DaSuDung` INT DEFAULT 0,
  `SoLanDungMoiKH` INT DEFAULT 1 COMMENT 'Mỗi KH dùng được bao nhiêu lần',
  
  -- Đối tượng
  `ApDungChoKHMoi` TINYINT(1) DEFAULT 0 COMMENT 'Chỉ dành cho KH mua lần đầu',
  
  -- Trạng thái
  `TrangThai` TINYINT(1) DEFAULT 1,
  `NgayTao` DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`MaMGG`),
  KEY `idx_macode` (`MaCode`),
  CONSTRAINT `fk_mgg_km` FOREIGN KEY (`MaKM`) REFERENCES `khuyen_mai` (`MaKM`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Mã giảm giá (voucher code) để khách hàng nhập';

-- =====================================================
-- 4. BẢNG LỊCH SỬ SỬ DỤNG KHUYẾN MÃI
-- =====================================================
CREATE TABLE `su_dung_khuyen_mai` (
  `MaSD` INT NOT NULL AUTO_INCREMENT,
  `MaHD` INT NOT NULL,
  `MaKM` INT DEFAULT NULL,
  `MaMGG` INT DEFAULT NULL COMMENT 'Nếu dùng mã giảm giá',
  `MaKH` INT DEFAULT NULL,
  
  -- Thông tin giảm giá
  `LoaiKM` VARCHAR(50),
  `GiaTriGiam` DECIMAL(12,2) COMMENT 'Số tiền thực tế đã giảm',
  `TongTienTruocGiam` DECIMAL(15,2),
  `TongTienSauGiam` DECIMAL(15,2),
  
  -- Thời gian
  `NgaySuDung` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `MaNV` INT COMMENT 'Nhân viên áp dụng KM',
  
  PRIMARY KEY (`MaSD`),
  KEY `idx_hoadon` (`MaHD`),
  KEY `idx_km` (`MaKM`),
  KEY `idx_mgg` (`MaMGG`),
  CONSTRAINT `fk_sdkm_hoadon` FOREIGN KEY (`MaHD`) REFERENCES `hoadon` (`MaHD`) ON DELETE CASCADE,
  CONSTRAINT `fk_sdkm_km` FOREIGN KEY (`MaKM`) REFERENCES `khuyen_mai` (`MaKM`),
  CONSTRAINT `fk_sdkm_mgg` FOREIGN KEY (`MaMGG`) REFERENCES `ma_giam_gia` (`MaMGG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Lịch sử sử dụng khuyến mãi trong hóa đơn';

-- =====================================================
-- INSERT DỮ LIỆU MẪU THỰC TẾ
-- =====================================================

-- KHUYẾN MÃI 1: Giảm 10% cho đơn từ 500k (Phổ biến nhất)
INSERT INTO `khuyen_mai` 
(`TenKM`, `MoTa`, `LoaiKM`, `GiaTriGiam`, `GiamToiDa`, `GiaTriDonToiThieu`, 
 `NgayBatDau`, `NgayKetThuc`, `ApDungCho`, `TrangThai`) 
VALUES 
('Giảm 10% cho đơn từ 500k', 
 'Áp dụng cho tất cả sản phẩm khi mua từ 500,000đ', 
 'giam_phan_tram', 10.00, 100000.00, 500000.00,
 '2026-02-01 00:00:00', '2026-12-31 23:59:59',
 'Tat_ca', 1);

-- KHUYẾN MÃI 2: Giảm 50k cho đơn từ 300k
INSERT INTO `khuyen_mai` 
(`TenKM`, `MoTa`, `LoaiKM`, `GiaTriGiam`, `GiamToiDa`, `GiaTriDonToiThieu`, 
 `NgayBatDau`, `NgayKetThuc`, `ApDungCho`, `TrangThai`) 
VALUES 
('Giảm 50k cho đơn từ 300k', 
 'Giảm trực tiếp 50,000đ cho đơn hàng từ 300,000đ', 
 'giam_tien', 50000.00, 50000.00, 300000.00,
 '2026-02-01 00:00:00', '2026-06-30 23:59:59',
 'Tat_ca', 1);

-- KHUYẾN MÃI 3: Giờ vàng 10h-12h mỗi ngày
INSERT INTO `khuyen_mai` 
(`TenKM`, `MoTa`, `LoaiKM`, `GiaTriGiam`, `GiamToiDa`, `GiaTriDonToiThieu`, 
 `NgayBatDau`, `NgayKetThuc`, `GioApDung`, `ApDungCho`, `TrangThai`) 
VALUES 
('Giờ vàng giảm 15%', 
 'Giảm 15% tất cả sản phẩm từ 10h-12h hàng ngày', 
 'giam_gio_vang', 15.00, 150000.00, 200000.00,
 '2026-02-01 00:00:00', '2026-12-31 23:59:59',
 '10:00-12:00', 'Tat_ca', 1);

-- KHUYẾN MÃI 4: Cuối tuần vui vẻ (Thứ 7, Chủ nhật)
INSERT INTO `khuyen_mai` 
(`TenKM`, `MoTa`, `LoaiKM`, `GiaTriGiam`, `GiamToiDa`, `GiaTriDonToiThieu`, 
 `NgayBatDau`, `NgayKetThuc`, `NgayApDung`, `ApDungCho`, `TrangThai`) 
VALUES 
('Cuối tuần giảm 12%', 
 'Giảm 12% vào Thứ 7 và Chủ nhật', 
 'giam_phan_tram', 12.00, 120000.00, 250000.00,
 '2026-02-01 00:00:00', '2026-12-31 23:59:59',
 '6,0', 'Tat_ca', 1);

-- KHUYẾN MÃI 5: Sale Tết 2026
INSERT INTO `khuyen_mai` 
(`TenKM`, `MoTa`, `LoaiKM`, `GiaTriGiam`, `GiamToiDa`, `GiaTriDonToiThieu`, 
 `NgayBatDau`, `NgayKetThuc`, `ApDungCho`, `TrangThai`) 
VALUES 
('Sale Tết Bính Ngọ 2026', 
 'Khuyến mãi đặc biệt dịp Tết Nguyên Đán', 
 'giam_phan_tram', 20.00, 200000.00, 400000.00,
 '2026-01-25 00:00:00', '2026-02-10 23:59:59',
 'Tat_ca', 1);

-- KHUYẾN MÃI 6: Sách văn học giảm đặc biệt
INSERT INTO `khuyen_mai` 
(`TenKM`, `MoTa`, `LoaiKM`, `GiaTriGiam`, `GiamToiDa`, `GiaTriDonToiThieu`, 
 `NgayBatDau`, `NgayKetThuc`, `ApDungCho`, `TrangThai`) 
VALUES 
('Sách văn học giảm 15%', 
 'Giảm 15% cho tất cả sách văn học', 
 'giam_phan_tram', 15.00, 100000.00, 150000.00,
 '2026-02-01 00:00:00', '2026-03-31 23:59:59',
 'The_loai', 1);

-- Chi tiết: Áp dụng cho thể loại Văn học (MaTL = 1)
INSERT INTO `chi_tiet_km_sanpham` (`MaKM`, `LoaiDoiTuong`, `MaDoiTuong`) 
VALUES (6, 'The_loai', 1);

-- KHUYẾN MÃI 7: Sách kỹ năng sống giảm giá
INSERT INTO `khuyen_mai` 
(`TenKM`, `MoTa`, `LoaiKM`, `GiaTriGiam`, `GiamToiDa`, `GiaTriDonToiThieu`, 
 `NgayBatDau`, `NgayKetThuc`, `ApDungCho`, `TrangThai`) 
VALUES 
('Sách kỹ năng giảm 10%', 
 'Giảm 10% cho sách kỹ năng sống', 
 'giam_phan_tram', 10.00, 80000.00, 100000.00,
 '2026-02-01 00:00:00', '2026-12-31 23:59:59',
 'The_loai', 1);

-- Chi tiết: Áp dụng cho thể loại Kỹ năng sống (MaTL = 4)
INSERT INTO `chi_tiet_km_sanpham` (`MaKM`, `LoaiDoiTuong`, `MaDoiTuong`) 
VALUES (7, 'The_loai', 4);

-- =====================================================
-- MÃ GIẢM GIÁ (VOUCHER)
-- =====================================================

-- Mã 1: GIAM50K - Cho khách hàng mới
INSERT INTO `ma_giam_gia` 
(`MaKM`, `MaCode`, `SoLuongPhatHanh`, `SoLanDungMoiKH`, `ApDungChoKHMoi`, `TrangThai`) 
VALUES 
(2, 'GIAM50K', 100, 1, 1, 1);

-- Mã 2: TET2026 - Dịp Tết
INSERT INTO `ma_giam_gia` 
(`MaKM`, `MaCode`, `SoLuongPhatHanh`, `SoLanDungMoiKH`, `ApDungChoKHMoi`, `TrangThai`) 
VALUES 
(5, 'TET2026', 200, 1, 0, 1);

-- Mã 3: HSSV2026 - Dành cho học sinh sinh viên
INSERT INTO `ma_giam_gia` 
(`MaKM`, `MaCode`, `SoLuongPhatHanh`, `SoLanDungMoiKH`, `ApDungChoKHMoi`, `TrangThai`) 
VALUES 
(1, 'HSSV2026', 500, 2, 0, 1);

-- Mã 4: VANHOC15 - Dành cho sách văn học
INSERT INTO `ma_giam_gia` 
(`MaKM`, `MaCode`, `SoLuongPhatHanh`, `SoLanDungMoiKH`, `ApDungChoKHMoi`, `TrangThai`) 
VALUES 
(6, 'VANHOC15', 300, 1, 0, 1);

-- Mã 5: WEEKEND12 - Cuối tuần
INSERT INTO `ma_giam_gia` 
(`MaKM`, `MaCode`, `SoLuongPhatHanh`, `SoLanDungMoiKH`, `ApDungChoKHMoi`, `TrangThai`) 
VALUES 
(4, 'WEEKEND12', NULL, 5, 0, 1);

-- =====================================================
-- HOÀN TẤT
-- =====================================================
SELECT 'Hệ thống khuyến mãi đã được tạo thành công!' AS Message;

SELECT 'Tổng số chương trình khuyến mãi:' AS Info, COUNT(*) AS SoLuong FROM khuyen_mai;
SELECT 'Tổng số mã giảm giá:' AS Info, COUNT(*) AS SoLuong FROM ma_giam_gia;
