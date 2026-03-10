-- Migration: Tạo bảng thuong_phat (Thưởng/Phạt thủ công)
-- Chạy script này trong MySQL để tạo bảng

CREATE TABLE IF NOT EXISTS `thuong_phat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL COMMENT 'Mã nhân viên',
  `Loai` enum('Thuong','Phat') NOT NULL COMMENT 'Loại: Thưởng hoặc Phạt',
  `SoTien` decimal(15,2) NOT NULL COMMENT 'Số tiền thưởng/phạt',
  `LyDo` varchar(255) NOT NULL COMMENT 'Lý do thưởng/phạt',
  `Thang` int NOT NULL COMMENT 'Tháng áp dụng (1-12)',
  `Nam` int NOT NULL COMMENT 'Năm áp dụng',
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo bản ghi',
  `NguoiTao` int DEFAULT NULL COMMENT 'MaTK người tạo',
  `GhiChu` text COMMENT 'Ghi chú thêm',
  PRIMARY KEY (`id`),
  KEY `idx_manv` (`MaNV`),
  KEY `idx_thang_nam` (`Thang`, `Nam`),
  KEY `idx_loai` (`Loai`),
  CONSTRAINT `fk_tp_nhanvien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Bảng thưởng/phạt thủ công của nhân viên';
