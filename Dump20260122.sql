-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: bansach_offline
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ca_lam_viec`
--

DROP TABLE IF EXISTS `ca_lam_viec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ca_lam_viec` (
  `MaCa` int NOT NULL AUTO_INCREMENT,
  `TenCa` varchar(50) NOT NULL,
  `GioBatDau` time NOT NULL,
  `GioKetThuc` time NOT NULL,
  `MoTa` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaCa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ca sáng, chiều, tối';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_lam_viec`
--

LOCK TABLES `ca_lam_viec` WRITE;
/*!40000 ALTER TABLE `ca_lam_viec` DISABLE KEYS */;
/*!40000 ALTER TABLE `ca_lam_viec` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cham_cong`
--

DROP TABLE IF EXISTS `cham_cong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cham_cong` (
  `MaCC` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL,
  `Ngay` date NOT NULL,
  `GioVao` time DEFAULT NULL,
  `GioRa` time DEFAULT NULL,
  `SoGioLam` decimal(4,2) DEFAULT '0.00',
  `SoGioTangCa` decimal(4,2) DEFAULT '0.00',
  `TrangThai` varchar(50) DEFAULT 'Di_lam' COMMENT 'Di_lam, Tre, Nghi_phep, Nghi_khong_phep',
  `GhiChu` text,
  `CreatedBy` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`MaCC`),
  UNIQUE KEY `unique_attendance` (`MaNV`,`Ngay`),
  CONSTRAINT `cham_cong_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cham_cong`
--

LOCK TABLES `cham_cong` WRITE;
/*!40000 ALTER TABLE `cham_cong` DISABLE KEYS */;
/*!40000 ALTER TABLE `cham_cong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_phi`
--

DROP TABLE IF EXISTS `chi_phi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_phi` (
  `MaCP` int NOT NULL AUTO_INCREMENT,
  `MaLoai` int NOT NULL,
  `MaCH` int DEFAULT NULL COMMENT 'Chi phí của cửa hàng nào',
  `TenChiPhi` varchar(255) NOT NULL,
  `SoTien` decimal(15,2) NOT NULL,
  `NgayPhatSinh` date NOT NULL,
  `NguoiLap` int DEFAULT NULL,
  `NgayLap` datetime DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` varchar(50) DEFAULT 'Chua_thanh_toan',
  `FileDinhKem` varchar(255) DEFAULT NULL COMMENT 'Hóa đơn, chứng từ',
  `GhiChu` text,
  PRIMARY KEY (`MaCP`),
  KEY `MaLoai` (`MaLoai`),
  KEY `MaCH` (`MaCH`),
  KEY `NguoiLap` (`NguoiLap`),
  CONSTRAINT `chi_phi_ibfk_1` FOREIGN KEY (`MaLoai`) REFERENCES `loai_chi_phi` (`MaLoai`),
  CONSTRAINT `chi_phi_ibfk_2` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`),
  CONSTRAINT `chi_phi_ibfk_3` FOREIGN KEY (`NguoiLap`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chi phí điện nước, thuê MB, vận chuyển...';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_phi`
--

LOCK TABLES `chi_phi` WRITE;
/*!40000 ALTER TABLE `chi_phi` DISABLE KEYS */;
/*!40000 ALTER TABLE `chi_phi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_kiem_ke`
--

DROP TABLE IF EXISTS `chi_tiet_kiem_ke`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_kiem_ke` (
  `MaKiemKe` int NOT NULL,
  `MaSP` int NOT NULL,
  `SoLuongHeThong` int NOT NULL COMMENT 'Số lượng trong hệ thống',
  `SoLuongThucTe` int NOT NULL COMMENT 'Số lượng đếm được',
  `ChenhLech` int GENERATED ALWAYS AS ((`SoLuongThucTe` - `SoLuongHeThong`)) STORED,
  `LyDo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`MaKiemKe`,`MaSP`),
  KEY `MaSP` (`MaSP`),
  CONSTRAINT `chi_tiet_kiem_ke_ibfk_1` FOREIGN KEY (`MaKiemKe`) REFERENCES `kiem_ke_kho` (`MaKiemKe`) ON DELETE CASCADE,
  CONSTRAINT `chi_tiet_kiem_ke_ibfk_2` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_kiem_ke`
--

LOCK TABLES `chi_tiet_kiem_ke` WRITE;
/*!40000 ALTER TABLE `chi_tiet_kiem_ke` DISABLE KEYS */;
/*!40000 ALTER TABLE `chi_tiet_kiem_ke` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_tra_hang`
--

DROP TABLE IF EXISTS `chi_tiet_tra_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_tra_hang` (
  `MaTraHang` int NOT NULL,
  `MaSP` int NOT NULL,
  `SoLuong` int NOT NULL,
  `DonGia` decimal(15,2) NOT NULL,
  `ThanhTien` decimal(15,2) GENERATED ALWAYS AS ((`SoLuong` * `DonGia`)) STORED,
  PRIMARY KEY (`MaTraHang`,`MaSP`),
  KEY `MaSP` (`MaSP`),
  CONSTRAINT `chi_tiet_tra_hang_ibfk_1` FOREIGN KEY (`MaTraHang`) REFERENCES `tra_hang` (`MaTraHang`) ON DELETE CASCADE,
  CONSTRAINT `chi_tiet_tra_hang_ibfk_2` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_tra_hang`
--

LOCK TABLES `chi_tiet_tra_hang` WRITE;
/*!40000 ALTER TABLE `chi_tiet_tra_hang` DISABLE KEYS */;
/*!40000 ALTER TABLE `chi_tiet_tra_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chitiethoadon`
--

DROP TABLE IF EXISTS `chitiethoadon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chitiethoadon` (
  `MaHD` int NOT NULL,
  `MaSP` int NOT NULL,
  `DonGia` decimal(15,2) NOT NULL,
  `SoLuong` int NOT NULL,
  `GiamGia` decimal(15,2) DEFAULT '0.00',
  `ThanhTien` decimal(15,2) GENERATED ALWAYS AS (((`DonGia` * `SoLuong`) - `GiamGia`)) STORED,
  PRIMARY KEY (`MaSP`,`MaHD`),
  KEY `MaHD` (`MaHD`),
  CONSTRAINT `chitiethoadon_ibfk_1` FOREIGN KEY (`MaHD`) REFERENCES `hoadon` (`MaHD`) ON DELETE CASCADE,
  CONSTRAINT `chitiethoadon_ibfk_2` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chitiethoadon`
--

LOCK TABLES `chitiethoadon` WRITE;
/*!40000 ALTER TABLE `chitiethoadon` DISABLE KEYS */;
/*!40000 ALTER TABLE `chitiethoadon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chitietphieunhap`
--

DROP TABLE IF EXISTS `chitietphieunhap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chitietphieunhap` (
  `MaPN` int NOT NULL,
  `MaSP` int NOT NULL,
  `DonGiaNhap` decimal(15,2) NOT NULL,
  `SoLuong` int NOT NULL,
  `ThanhTien` decimal(15,2) GENERATED ALWAYS AS ((`DonGiaNhap` * `SoLuong`)) STORED,
  PRIMARY KEY (`MaSP`,`MaPN`),
  KEY `MaPN` (`MaPN`),
  CONSTRAINT `chitietphieunhap_ibfk_1` FOREIGN KEY (`MaPN`) REFERENCES `phieunhap` (`MaPN`) ON DELETE CASCADE,
  CONSTRAINT `chitietphieunhap_ibfk_2` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chitietphieunhap`
--

LOCK TABLES `chitietphieunhap` WRITE;
/*!40000 ALTER TABLE `chitietphieunhap` DISABLE KEYS */;
/*!40000 ALTER TABLE `chitietphieunhap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chucnang`
--

DROP TABLE IF EXISTS `chucnang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chucnang` (
  `MaCN` int NOT NULL AUTO_INCREMENT,
  `TenCN` varchar(100) NOT NULL COMMENT 'VD: Quản lý nhân viên, Quản lý kho',
  `MaCha` int DEFAULT NULL COMMENT 'Chức năng cha (để tạo menu đa cấp)',
  `URL` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn trang',
  `Icon` varchar(50) DEFAULT NULL COMMENT 'Icon hiển thị',
  `ThuTu` int DEFAULT '0' COMMENT 'Thứ tự hiển thị menu',
  `TinhTrang` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaCN`),
  KEY `idx_macha` (`MaCha`),
  CONSTRAINT `fk_chucnang_macha` FOREIGN KEY (`MaCha`) REFERENCES `chucnang` (`MaCN`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách chức năng hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chucnang`
--

LOCK TABLES `chucnang` WRITE;
/*!40000 ALTER TABLE `chucnang` DISABLE KEYS */;
INSERT INTO `chucnang` VALUES (1,'Quản lý hệ thống',NULL,NULL,'settings',1,1),(2,'Quản lý người dùng',1,'/admin/users','users',1,1),(3,'Quản lý phân quyền',1,'/admin/roles','shield',2,1),(4,'Nhật ký hoạt động',1,'/admin/logs','file-text',3,1),(5,'Quản lý nhân sự',NULL,NULL,'user-check',2,1),(6,'Danh sách nhân viên',5,'/hr/employees','users',1,1),(7,'Chấm công',5,'/hr/attendance','clock',2,1),(8,'Phân ca làm việc',5,'/hr/schedule','calendar',3,1),(9,'Xin nghỉ phép',5,'/hr/leave','clipboard',4,1),(10,'Tính lương',5,'/hr/salary','dollar-sign',5,1),(11,'Thưởng phạt',5,'/hr/bonus-penalty','award',6,1),(12,'Quản lý kho',NULL,NULL,'package',3,1),(13,'Danh sách sản phẩm',12,'/warehouse/products','book',1,1),(14,'Nhà cung cấp',12,'/warehouse/suppliers','truck',2,1),(15,'Phiếu nhập',12,'/warehouse/import','arrow-down',3,1),(16,'Tồn kho',12,'/warehouse/stock','database',4,1),(17,'Kiểm kê',12,'/warehouse/inventory','check-square',5,1),(18,'Quản lý bán hàng',NULL,NULL,'shopping-cart',4,1),(19,'Bán hàng',18,'/sales/pos','credit-card',1,1),(20,'Quản lý hóa đơn',18,'/sales/invoices','file-text',2,1),(21,'Quản lý khách hàng',18,'/sales/customers','user',3,1),(22,'Trả hàng',18,'/sales/returns','rotate-ccw',4,1),(23,'Báo cáo thống kê',NULL,NULL,'bar-chart',5,1),(24,'Báo cáo doanh thu',23,'/reports/revenue','trending-up',1,1),(25,'Báo cáo lợi nhuận',23,'/reports/profit','pie-chart',2,1),(26,'Báo cáo tồn kho',23,'/reports/stock','package',3,1),(27,'Báo cáo nhân sự',23,'/reports/hr','users',4,1);
/*!40000 ALTER TABLE `chucnang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chuyen_kho`
--

DROP TABLE IF EXISTS `chuyen_kho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chuyen_kho` (
  `MaCK` int NOT NULL AUTO_INCREMENT,
  `MaCHNguon` int NOT NULL,
  `MaCHDich` int NOT NULL,
  `MaSP` int NOT NULL,
  `SoLuong` int NOT NULL,
  `NgayChuyen` datetime DEFAULT CURRENT_TIMESTAMP,
  `NguoiChuyen` int DEFAULT NULL COMMENT 'Mã nhân viên',
  `NguoiNhan` int DEFAULT NULL,
  `NgayNhan` datetime DEFAULT NULL,
  `TrangThai` varchar(20) DEFAULT 'Cho_duyet' COMMENT 'Cho_duyet, Dang_chuyen, Da_nhan, Huy',
  `GhiChu` text,
  PRIMARY KEY (`MaCK`),
  KEY `MaCHNguon` (`MaCHNguon`),
  KEY `MaCHDich` (`MaCHDich`),
  KEY `MaSP` (`MaSP`),
  KEY `NguoiChuyen` (`NguoiChuyen`),
  KEY `NguoiNhan` (`NguoiNhan`),
  CONSTRAINT `chuyen_kho_ibfk_1` FOREIGN KEY (`MaCHNguon`) REFERENCES `cua_hang` (`MaCH`),
  CONSTRAINT `chuyen_kho_ibfk_2` FOREIGN KEY (`MaCHDich`) REFERENCES `cua_hang` (`MaCH`),
  CONSTRAINT `chuyen_kho_ibfk_3` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`),
  CONSTRAINT `chuyen_kho_ibfk_4` FOREIGN KEY (`NguoiChuyen`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `chuyen_kho_ibfk_5` FOREIGN KEY (`NguoiNhan`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chuyển hàng giữa các chi nhánh';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuyen_kho`
--

LOCK TABLES `chuyen_kho` WRITE;
/*!40000 ALTER TABLE `chuyen_kho` DISABLE KEYS */;
/*!40000 ALTER TABLE `chuyen_kho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cong_no_ncc`
--

DROP TABLE IF EXISTS `cong_no_ncc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cong_no_ncc` (
  `MaCongNo` int NOT NULL AUTO_INCREMENT,
  `MaNCC` int NOT NULL,
  `MaPN` int DEFAULT NULL COMMENT 'Liên kết với phiếu nhập',
  `NgayPhatSinh` datetime DEFAULT CURRENT_TIMESTAMP,
  `SoTienNo` decimal(15,2) NOT NULL,
  `SoTienDaTra` decimal(15,2) DEFAULT '0.00',
  `SoTienConLai` decimal(15,2) GENERATED ALWAYS AS ((`SoTienNo` - `SoTienDaTra`)) STORED,
  `HanThanhToan` date DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT 'Chua_thanh_toan' COMMENT 'Chua_thanh_toan, Da_thanh_toan_1_phan, Da_thanh_toan',
  `GhiChu` text,
  PRIMARY KEY (`MaCongNo`),
  KEY `MaNCC` (`MaNCC`),
  KEY `MaPN` (`MaPN`),
  CONSTRAINT `cong_no_ncc_ibfk_1` FOREIGN KEY (`MaNCC`) REFERENCES `nhacungcap` (`MaNCC`),
  CONSTRAINT `cong_no_ncc_ibfk_2` FOREIGN KEY (`MaPN`) REFERENCES `phieunhap` (`MaPN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Công nợ phải trả NCC';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cong_no_ncc`
--

LOCK TABLES `cong_no_ncc` WRITE;
/*!40000 ALTER TABLE `cong_no_ncc` DISABLE KEYS */;
/*!40000 ALTER TABLE `cong_no_ncc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cua_hang`
--

DROP TABLE IF EXISTS `cua_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cua_hang` (
  `MaCH` int NOT NULL AUTO_INCREMENT,
  `TenCH` varchar(100) NOT NULL,
  `DiaChi` text,
  `SDT` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `TrangThai` tinyint(1) DEFAULT '1' COMMENT '1: Đang hoạt động, 0: Đóng cửa',
  `NgayMo` date DEFAULT NULL,
  PRIMARY KEY (`MaCH`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách cửa hàng/chi nhánh';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cua_hang`
--

LOCK TABLES `cua_hang` WRITE;
/*!40000 ALTER TABLE `cua_hang` DISABLE KEYS */;
/*!40000 ALTER TABLE `cua_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `don_nghi_viec`
--

DROP TABLE IF EXISTS `don_nghi_viec`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `don_nghi_viec` (
  `MaDon` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL,
  `NgayNopDon` datetime DEFAULT CURRENT_TIMESTAMP,
  `NgayNghiMongMuon` date NOT NULL,
  `LyDo` text,
  `TrangThai` varchar(50) DEFAULT 'Cho_duyet' COMMENT 'Cho_duyet, Da_duyet, Tu_choi',
  `NguoiDuyet` int DEFAULT NULL,
  `NgayDuyet` datetime DEFAULT NULL,
  `YKienDuyet` text,
  `NgayNghiThucTe` date DEFAULT NULL COMMENT 'Ngày nghỉ thực tế sau khi duyệt',
  PRIMARY KEY (`MaDon`),
  KEY `MaNV` (`MaNV`),
  KEY `NguoiDuyet` (`NguoiDuyet`),
  CONSTRAINT `don_nghi_viec_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `don_nghi_viec_ibfk_2` FOREIGN KEY (`NguoiDuyet`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Đơn xin nghỉ việc';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `don_nghi_viec`
--

LOCK TABLES `don_nghi_viec` WRITE;
/*!40000 ALTER TABLE `don_nghi_viec` DISABLE KEYS */;
/*!40000 ALTER TABLE `don_nghi_viec` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoadon`
--

DROP TABLE IF EXISTS `hoadon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoadon` (
  `MaHD` int NOT NULL AUTO_INCREMENT,
  `MaKH` int DEFAULT NULL COMMENT 'NULL nếu khách vãng lai',
  `MaNV` int NOT NULL COMMENT 'Nhân viên bán hàng',
  `MaCH` int NOT NULL COMMENT 'Cửa hàng bán',
  `MaPhien` int DEFAULT NULL COMMENT 'Phiên bán hàng',
  `NgayBan` datetime DEFAULT CURRENT_TIMESTAMP,
  `LoaiHoaDon` varchar(20) DEFAULT 'Tai_quay' COMMENT 'Tai_quay, Giao_hang',
  `TongTien` decimal(15,2) DEFAULT '0.00',
  `GiamGia` decimal(15,2) DEFAULT '0.00',
  `DiemTichLuy` int DEFAULT '0' COMMENT 'Điểm cộng cho KH',
  `DiemSuDung` int DEFAULT '0' COMMENT 'Điểm KH đã dùng',
  `ThanhToan` decimal(15,2) DEFAULT '0.00' COMMENT 'Số tiền thực tế thu',
  `PhuongThucTT` varchar(50) DEFAULT 'Tien_mat' COMMENT 'Tien_mat, The, Chuyen_khoan, QR',
  `TienKhachDua` decimal(15,2) DEFAULT NULL,
  `TienThua` decimal(15,2) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT 'Hoan_thanh' COMMENT 'Hoan_thanh, Huy, Da_tra',
  `DiaChiGiao` text,
  `SDTGiao` varchar(15) DEFAULT NULL,
  `TenNguoiNhan` varchar(100) DEFAULT NULL,
  `PhiVanChuyen` decimal(15,2) DEFAULT '0.00',
  `GhiChu` text,
  PRIMARY KEY (`MaHD`),
  KEY `MaKH` (`MaKH`),
  KEY `MaNV` (`MaNV`),
  KEY `MaCH` (`MaCH`),
  KEY `MaPhien` (`MaPhien`),
  CONSTRAINT `hoadon_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  CONSTRAINT `hoadon_ibfk_2` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `hoadon_ibfk_3` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`),
  CONSTRAINT `hoadon_ibfk_4` FOREIGN KEY (`MaPhien`) REFERENCES `phien_ban_hang` (`MaPhien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoadon`
--

LOCK TABLES `hoadon` WRITE;
/*!40000 ALTER TABLE `hoadon` DISABLE KEYS */;
/*!40000 ALTER TABLE `hoadon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khachhang`
--

DROP TABLE IF EXISTS `khachhang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khachhang` (
  `MaKH` int NOT NULL AUTO_INCREMENT,
  `HoTen` varchar(100) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `DiaChi` text,
  `NgaySinh` date DEFAULT NULL,
  `GioiTinh` varchar(10) DEFAULT NULL,
  `NgayDK` datetime DEFAULT CURRENT_TIMESTAMP,
  `LoaiKH` varchar(20) DEFAULT 'Thuong' COMMENT 'Thuong, VIP, VVIP',
  `DiemTichLuy` int DEFAULT '0',
  `TongChiTieu` decimal(15,2) DEFAULT '0.00',
  `GhiChu` text,
  `TinhTrang` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaKH`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `SDT` (`SDT`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Khách hàng thân thiết';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khachhang`
--

LOCK TABLES `khachhang` WRITE;
/*!40000 ALTER TABLE `khachhang` DISABLE KEYS */;
/*!40000 ALTER TABLE `khachhang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khuyen_mai`
--

DROP TABLE IF EXISTS `khuyen_mai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khuyen_mai` (
  `MaKM` int NOT NULL AUTO_INCREMENT,
  `TenKM` varchar(100) NOT NULL,
  `MoTa` text,
  `LoaiKM` varchar(50) DEFAULT 'giam_phan_tram' COMMENT 'giam_phan_tram, giam_tien, mua_X_tang_Y',
  `GiaTriGiam` decimal(10,2) DEFAULT NULL COMMENT 'Phần trăm hoặc số tiền',
  `GiamToiDa` decimal(12,2) DEFAULT NULL,
  `GiaTriDonToiThieu` decimal(12,2) DEFAULT NULL,
  `NgayBatDau` datetime DEFAULT NULL,
  `NgayKetThuc` datetime DEFAULT NULL,
  `ApDungCho` varchar(50) DEFAULT 'Tat_ca' COMMENT 'Tat_ca, San_pham, The_loai, Khach_hang',
  `TrangThai` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaKM`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khuyen_mai`
--

LOCK TABLES `khuyen_mai` WRITE;
/*!40000 ALTER TABLE `khuyen_mai` DISABLE KEYS */;
/*!40000 ALTER TABLE `khuyen_mai` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kiem_ke_kho`
--

DROP TABLE IF EXISTS `kiem_ke_kho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kiem_ke_kho` (
  `MaKiemKe` int NOT NULL AUTO_INCREMENT,
  `MaCH` int NOT NULL,
  `NgayKiemKe` date NOT NULL,
  `NguoiKiemKe` int NOT NULL,
  `TrangThai` varchar(20) DEFAULT 'Dang_kiem' COMMENT 'Dang_kiem, Hoan_thanh',
  `GhiChu` text,
  PRIMARY KEY (`MaKiemKe`),
  KEY `MaCH` (`MaCH`),
  KEY `NguoiKiemKe` (`NguoiKiemKe`),
  CONSTRAINT `kiem_ke_kho_ibfk_1` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`),
  CONSTRAINT `kiem_ke_kho_ibfk_2` FOREIGN KEY (`NguoiKiemKe`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kiem_ke_kho`
--

LOCK TABLES `kiem_ke_kho` WRITE;
/*!40000 ALTER TABLE `kiem_ke_kho` DISABLE KEYS */;
/*!40000 ALTER TABLE `kiem_ke_kho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_chuc_vu`
--

DROP TABLE IF EXISTS `lich_su_chuc_vu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_chuc_vu` (
  `MaLS` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL,
  `ChucVuCu` varchar(50) DEFAULT NULL,
  `ChucVuMoi` varchar(50) DEFAULT NULL,
  `LuongCu` decimal(15,2) DEFAULT NULL,
  `LuongMoi` decimal(15,2) DEFAULT NULL,
  `NgayThayDoi` datetime DEFAULT CURRENT_TIMESTAMP,
  `GhiChu` text,
  PRIMARY KEY (`MaLS`),
  KEY `MaNV` (`MaNV`),
  CONSTRAINT `lich_su_chuc_vu_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_chuc_vu`
--

LOCK TABLES `lich_su_chuc_vu` WRITE;
/*!40000 ALTER TABLE `lich_su_chuc_vu` DISABLE KEYS */;
/*!40000 ALTER TABLE `lich_su_chuc_vu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_gia`
--

DROP TABLE IF EXISTS `lich_su_gia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_gia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `MaSP` int NOT NULL,
  `GiaCu` decimal(15,2) DEFAULT NULL,
  `GiaMoi` decimal(15,2) DEFAULT NULL,
  `NgayThayDoi` datetime DEFAULT CURRENT_TIMESTAMP,
  `LyDo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `MaSP` (`MaSP`),
  CONSTRAINT `lich_su_gia_ibfk_1` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Theo dõi biến động giá';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_gia`
--

LOCK TABLES `lich_su_gia` WRITE;
/*!40000 ALTER TABLE `lich_su_gia` DISABLE KEYS */;
/*!40000 ALTER TABLE `lich_su_gia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_tra_no_ncc`
--

DROP TABLE IF EXISTS `lich_su_tra_no_ncc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_tra_no_ncc` (
  `MaTra` int NOT NULL AUTO_INCREMENT,
  `MaCongNo` int NOT NULL,
  `NgayTra` datetime DEFAULT CURRENT_TIMESTAMP,
  `SoTienTra` decimal(15,2) NOT NULL,
  `HinhThucTra` varchar(50) DEFAULT 'Tien_mat' COMMENT 'Tien_mat, Chuyen_khoan, The',
  `NguoiThu` int DEFAULT NULL COMMENT 'Nhân viên thu tiền',
  `GhiChu` text,
  PRIMARY KEY (`MaTra`),
  KEY `MaCongNo` (`MaCongNo`),
  KEY `NguoiThu` (`NguoiThu`),
  CONSTRAINT `lich_su_tra_no_ncc_ibfk_1` FOREIGN KEY (`MaCongNo`) REFERENCES `cong_no_ncc` (`MaCongNo`),
  CONSTRAINT `lich_su_tra_no_ncc_ibfk_2` FOREIGN KEY (`NguoiThu`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_tra_no_ncc`
--

LOCK TABLES `lich_su_tra_no_ncc` WRITE;
/*!40000 ALTER TABLE `lich_su_tra_no_ncc` DISABLE KEYS */;
/*!40000 ALTER TABLE `lich_su_tra_no_ncc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loai_chi_phi`
--

DROP TABLE IF EXISTS `loai_chi_phi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loai_chi_phi` (
  `MaLoai` int NOT NULL AUTO_INCREMENT,
  `TenLoai` varchar(100) NOT NULL COMMENT 'Điện, nước, thuê mặt bằng, vận chuyển',
  `MoTa` text,
  `TinhTrang` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaLoai`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loai_chi_phi`
--

LOCK TABLES `loai_chi_phi` WRITE;
/*!40000 ALTER TABLE `loai_chi_phi` DISABLE KEYS */;
INSERT INTO `loai_chi_phi` VALUES (1,'Điện nước','Chi phí điện, nước hàng tháng',1),(2,'Thuê mặt bằng','Chi phí thuê cửa hàng',1),(3,'Vận chuyển','Chi phí vận chuyển hàng hóa',1),(4,'Marketing','Chi phí quảng cáo, marketing',1),(5,'Bảo trì','Chi phí sửa chữa, bảo trì cơ sở vật chất',1),(6,'Văn phòng phẩm','Chi phí mua sắm văn phòng phẩm',1),(7,'Khác','Chi phí khác',1);
/*!40000 ALTER TABLE `loai_chi_phi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `luong`
--

DROP TABLE IF EXISTS `luong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `luong` (
  `id` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL,
  `Thang` int NOT NULL,
  `Nam` int NOT NULL,
  `LuongCoBan` decimal(15,2) DEFAULT '0.00',
  `PhuCap` decimal(15,2) DEFAULT '0.00',
  `Thuong` decimal(15,2) DEFAULT '0.00',
  `Phat` decimal(15,2) DEFAULT '0.00',
  `SoNgayLam` int DEFAULT '0',
  `SoGioTangCa` decimal(6,2) DEFAULT '0.00',
  `TongLuong` decimal(15,2) DEFAULT '0.00',
  `TrangThai` varchar(50) DEFAULT 'Chua_chi_tra' COMMENT 'Chua_chi_tra, Da_tra',
  `NgayTinh` datetime DEFAULT CURRENT_TIMESTAMP,
  `GhiChu` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_salary` (`MaNV`,`Thang`,`Nam`),
  CONSTRAINT `luong_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `luong`
--

LOCK TABLES `luong` WRITE;
/*!40000 ALTER TABLE `luong` DISABLE KEYS */;
/*!40000 ALTER TABLE `luong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhacungcap`
--

DROP TABLE IF EXISTS `nhacungcap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhacungcap` (
  `MaNCC` int NOT NULL AUTO_INCREMENT,
  `TenNCC` varchar(100) NOT NULL,
  `DiaChi` text,
  `SDT` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `MaSoThue` varchar(20) DEFAULT NULL,
  `NguoiLienHe` varchar(100) DEFAULT NULL,
  `TinhTrang` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaNCC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhacungcap`
--

LOCK TABLES `nhacungcap` WRITE;
/*!40000 ALTER TABLE `nhacungcap` DISABLE KEYS */;
/*!40000 ALTER TABLE `nhacungcap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhanvien`
--

DROP TABLE IF EXISTS `nhanvien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhanvien` (
  `MaNV` int NOT NULL AUTO_INCREMENT,
  `HoTen` varchar(100) NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `DiaChi` text,
  `CCCD` varchar(20) DEFAULT NULL,
  `NgaySinh` date DEFAULT NULL,
  `GioiTinh` varchar(10) DEFAULT NULL,
  `ChucVu` varchar(50) DEFAULT NULL COMMENT 'Quản lý, Thu ngân, Nhân viên kho, Bảo vệ',
  `NgayVaoLam` date DEFAULT NULL,
  `LuongCoBan` decimal(15,2) DEFAULT '0.00',
  `PhuCap` decimal(15,2) DEFAULT '0.00',
  `NgayNghiViec` date DEFAULT NULL,
  `MoTaCongViec` text,
  `MaTK` int DEFAULT NULL,
  `MaCH` int DEFAULT NULL COMMENT 'Cửa hàng đang làm việc',
  `Anh` varchar(255) DEFAULT NULL,
  `TinhTrang` tinyint(1) DEFAULT '1' COMMENT '1: Đang làm, 0: Đã nghỉ',
  PRIMARY KEY (`MaNV`),
  UNIQUE KEY `CCCD` (`CCCD`),
  UNIQUE KEY `MaTK` (`MaTK`),
  KEY `MaCH` (`MaCH`),
  CONSTRAINT `nhanvien_ibfk_1` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`),
  CONSTRAINT `nhanvien_ibfk_2` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thông tin nhân viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhanvien`
--

LOCK TABLES `nhanvien` WRITE;
/*!40000 ALTER TABLE `nhanvien` DISABLE KEYS */;
/*!40000 ALTER TABLE `nhanvien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhat_ky_hoat_dong`
--

DROP TABLE IF EXISTS `nhat_ky_hoat_dong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhat_ky_hoat_dong` (
  `MaNK` int NOT NULL AUTO_INCREMENT,
  `MaTK` int DEFAULT NULL COMMENT 'Tài khoản thực hiện',
  `HanhDong` varchar(100) NOT NULL COMMENT 'Them, Sua, Xoa, Xem, Dang_nhap',
  `BangDuLieu` varchar(50) DEFAULT NULL COMMENT 'Tên bảng bị tác động',
  `MaBanGhi` int DEFAULT NULL COMMENT 'ID của bản ghi',
  `DuLieuCu` text COMMENT 'Dữ liệu trước khi thay đổi (JSON)',
  `DuLieuMoi` text COMMENT 'Dữ liệu sau khi thay đổi (JSON)',
  `DiaChi_IP` varchar(50) DEFAULT NULL,
  `ThoiGian` datetime DEFAULT CURRENT_TIMESTAMP,
  `GhiChu` text,
  PRIMARY KEY (`MaNK`),
  KEY `idx_thoigian` (`ThoiGian`),
  KEY `idx_matk` (`MaTK`),
  CONSTRAINT `nhat_ky_hoat_dong_ibfk_1` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử thao tác hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhat_ky_hoat_dong`
--

LOCK TABLES `nhat_ky_hoat_dong` WRITE;
/*!40000 ALTER TABLE `nhat_ky_hoat_dong` DISABLE KEYS */;
/*!40000 ALTER TABLE `nhat_ky_hoat_dong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhaxuatban`
--

DROP TABLE IF EXISTS `nhaxuatban`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhaxuatban` (
  `MaNXB` int NOT NULL AUTO_INCREMENT,
  `TenNXB` varchar(100) NOT NULL,
  `DiaChi` text,
  `SDT` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `TinhTrang` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaNXB`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhaxuatban`
--

LOCK TABLES `nhaxuatban` WRITE;
/*!40000 ALTER TABLE `nhaxuatban` DISABLE KEYS */;
/*!40000 ALTER TABLE `nhaxuatban` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhomquyen`
--

DROP TABLE IF EXISTS `nhomquyen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhomquyen` (
  `MaNQ` int NOT NULL AUTO_INCREMENT,
  `TenNQ` varchar(50) NOT NULL,
  `MoTa` text,
  `TinhTrang` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaNQ`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phân quyền hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhomquyen`
--

LOCK TABLES `nhomquyen` WRITE;
/*!40000 ALTER TABLE `nhomquyen` DISABLE KEYS */;
/*!40000 ALTER TABLE `nhomquyen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phan_cong_ca`
--

DROP TABLE IF EXISTS `phan_cong_ca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phan_cong_ca` (
  `id` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL,
  `MaCa` int NOT NULL,
  `MaCH` int NOT NULL,
  `Ngay` date NOT NULL,
  `TrangThai` varchar(20) DEFAULT 'Chua_lam' COMMENT 'Chua_lam, Da_lam, Vang_mat',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_schedule` (`MaNV`,`Ngay`,`MaCa`),
  KEY `MaCa` (`MaCa`),
  KEY `MaCH` (`MaCH`),
  CONSTRAINT `phan_cong_ca_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `phan_cong_ca_ibfk_2` FOREIGN KEY (`MaCa`) REFERENCES `ca_lam_viec` (`MaCa`),
  CONSTRAINT `phan_cong_ca_ibfk_3` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch làm việc nhân viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phan_cong_ca`
--

LOCK TABLES `phan_cong_ca` WRITE;
/*!40000 ALTER TABLE `phan_cong_ca` DISABLE KEYS */;
/*!40000 ALTER TABLE `phan_cong_ca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phanquyen_chitiet`
--

DROP TABLE IF EXISTS `phanquyen_chitiet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phanquyen_chitiet` (
  `MaNQ` int NOT NULL,
  `MaCN` int NOT NULL,
  `Xem` tinyint(1) DEFAULT '0',
  `Them` tinyint(1) DEFAULT '0',
  `Sua` tinyint(1) DEFAULT '0',
  `Xoa` tinyint(1) DEFAULT '0',
  `XuatFile` tinyint(1) DEFAULT '0' COMMENT 'Xuất Excel/PDF',
  `Duyet` tinyint(1) DEFAULT '0' COMMENT 'Duyệt đơn, phiếu',
  PRIMARY KEY (`MaNQ`,`MaCN`),
  KEY `MaCN` (`MaCN`),
  CONSTRAINT `phanquyen_chitiet_ibfk_1` FOREIGN KEY (`MaNQ`) REFERENCES `nhomquyen` (`MaNQ`) ON DELETE CASCADE,
  CONSTRAINT `phanquyen_chitiet_ibfk_2` FOREIGN KEY (`MaCN`) REFERENCES `chucnang` (`MaCN`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phân quyền CRUD chi tiết';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phanquyen_chitiet`
--

LOCK TABLES `phanquyen_chitiet` WRITE;
/*!40000 ALTER TABLE `phanquyen_chitiet` DISABLE KEYS */;
/*!40000 ALTER TABLE `phanquyen_chitiet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phien_ban_hang`
--

DROP TABLE IF EXISTS `phien_ban_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phien_ban_hang` (
  `MaPhien` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL COMMENT 'Thu ngân',
  `MaCH` int NOT NULL,
  `ThoiGianMo` datetime DEFAULT CURRENT_TIMESTAMP,
  `ThoiGianDong` datetime DEFAULT NULL,
  `TienBanDau` decimal(15,2) DEFAULT '0.00' COMMENT 'Tiền mặt lúc mở ca',
  `TienKetThuc` decimal(15,2) DEFAULT NULL COMMENT 'Tiền mặt lúc đóng ca',
  `TongTienMat` decimal(15,2) DEFAULT '0.00' COMMENT 'Tổng thu bằng tiền mặt',
  `TongThe` decimal(15,2) DEFAULT '0.00',
  `TongChuyenKhoan` decimal(15,2) DEFAULT '0.00',
  `TongDoanhThu` decimal(15,2) DEFAULT '0.00',
  `SoHoaDon` int DEFAULT '0',
  `ChenhLech` decimal(15,2) DEFAULT NULL COMMENT 'Tiền thừa/thiếu',
  `TrangThai` varchar(20) DEFAULT 'Dang_mo' COMMENT 'Dang_mo, Da_dong',
  `GhiChu` text,
  PRIMARY KEY (`MaPhien`),
  KEY `MaNV` (`MaNV`),
  KEY `MaCH` (`MaCH`),
  CONSTRAINT `phien_ban_hang_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `phien_ban_hang_ibfk_2` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Mở/đóng ca thu ngân';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phien_ban_hang`
--

LOCK TABLES `phien_ban_hang` WRITE;
/*!40000 ALTER TABLE `phien_ban_hang` DISABLE KEYS */;
/*!40000 ALTER TABLE `phien_ban_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieunhap`
--

DROP TABLE IF EXISTS `phieunhap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieunhap` (
  `MaPN` int NOT NULL AUTO_INCREMENT,
  `MaNCC` int NOT NULL,
  `MaCH` int NOT NULL COMMENT 'Nhập về cửa hàng nào',
  `MaTK` int DEFAULT NULL COMMENT 'Người lập phiếu',
  `NgayNhap` datetime DEFAULT CURRENT_TIMESTAMP,
  `TongTien` decimal(15,2) DEFAULT '0.00',
  `DaThanhToan` decimal(15,2) DEFAULT '0.00',
  `ConNo` decimal(15,2) DEFAULT '0.00',
  `TrangThai` varchar(20) DEFAULT 'Hoan_thanh' COMMENT 'Hoan_thanh, Huy',
  `GhiChu` text,
  PRIMARY KEY (`MaPN`),
  KEY `MaNCC` (`MaNCC`),
  KEY `MaCH` (`MaCH`),
  KEY `MaTK` (`MaTK`),
  CONSTRAINT `phieunhap_ibfk_1` FOREIGN KEY (`MaNCC`) REFERENCES `nhacungcap` (`MaNCC`),
  CONSTRAINT `phieunhap_ibfk_2` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`),
  CONSTRAINT `phieunhap_ibfk_3` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieunhap`
--

LOCK TABLES `phieunhap` WRITE;
/*!40000 ALTER TABLE `phieunhap` DISABLE KEYS */;
/*!40000 ALTER TABLE `phieunhap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sanpham`
--

DROP TABLE IF EXISTS `sanpham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sanpham` (
  `MaSP` int NOT NULL AUTO_INCREMENT,
  `TenSP` varchar(255) NOT NULL,
  `MoTa` text,
  `DonGia` decimal(15,2) DEFAULT '0.00',
  `GiaNhap` decimal(15,2) DEFAULT '0.00' COMMENT 'Giá nhập gần nhất',
  `HinhAnh` varchar(255) DEFAULT NULL,
  `MaTL` int DEFAULT NULL,
  `MaTG` int DEFAULT NULL,
  `MaNXB` int DEFAULT NULL,
  `NamXB` int DEFAULT NULL,
  `SoTrang` int DEFAULT NULL,
  `TrongLuong` decimal(6,2) DEFAULT NULL COMMENT 'Gram',
  `KichThuoc` varchar(50) DEFAULT NULL COMMENT 'VD: 14x20 cm',
  `ISBN` varchar(20) DEFAULT NULL,
  `MinSoLuong` int DEFAULT '0',
  `TinhTrang` tinyint(1) DEFAULT '1' COMMENT '1: Còn bán, 0: Ngừng kinh doanh',
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaSP`),
  KEY `MaTL` (`MaTL`),
  KEY `MaTG` (`MaTG`),
  KEY `MaNXB` (`MaNXB`),
  CONSTRAINT `sanpham_ibfk_1` FOREIGN KEY (`MaTL`) REFERENCES `theloai` (`MaTL`),
  CONSTRAINT `sanpham_ibfk_2` FOREIGN KEY (`MaTG`) REFERENCES `tacgia` (`MaTG`),
  CONSTRAINT `sanpham_ibfk_3` FOREIGN KEY (`MaNXB`) REFERENCES `nhaxuatban` (`MaNXB`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sanpham`
--

LOCK TABLES `sanpham` WRITE;
/*!40000 ALTER TABLE `sanpham` DISABLE KEYS */;
/*!40000 ALTER TABLE `sanpham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tacgia`
--

DROP TABLE IF EXISTS `tacgia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tacgia` (
  `MaTG` int NOT NULL AUTO_INCREMENT,
  `TenTG` varchar(100) NOT NULL,
  `MoTa` text,
  `HinhAnh` varchar(255) DEFAULT NULL,
  `TinhTrang` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaTG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tacgia`
--

LOCK TABLES `tacgia` WRITE;
/*!40000 ALTER TABLE `tacgia` DISABLE KEYS */;
/*!40000 ALTER TABLE `tacgia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taikhoan`
--

DROP TABLE IF EXISTS `taikhoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taikhoan` (
  `MaTK` int NOT NULL AUTO_INCREMENT,
  `TenTK` varchar(50) NOT NULL,
  `MatKhau` varchar(255) NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `TinhTrang` tinyint(1) DEFAULT '1',
  `MaNQ` int DEFAULT NULL,
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaTK`),
  UNIQUE KEY `TenTK` (`TenTK`),
  UNIQUE KEY `Email` (`Email`),
  KEY `MaNQ` (`MaNQ`),
  CONSTRAINT `taikhoan_ibfk_1` FOREIGN KEY (`MaNQ`) REFERENCES `nhomquyen` (`MaNQ`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tài khoản đăng nhập hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taikhoan`
--

LOCK TABLES `taikhoan` WRITE;
/*!40000 ALTER TABLE `taikhoan` DISABLE KEYS */;
/*!40000 ALTER TABLE `taikhoan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `theloai`
--

DROP TABLE IF EXISTS `theloai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `theloai` (
  `MaTL` int NOT NULL AUTO_INCREMENT,
  `TenTL` varchar(100) NOT NULL,
  `MoTa` text,
  `TinhTrang` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaTL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thể loại sách';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theloai`
--

LOCK TABLES `theloai` WRITE;
/*!40000 ALTER TABLE `theloai` DISABLE KEYS */;
/*!40000 ALTER TABLE `theloai` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thuong_phat`
--

DROP TABLE IF EXISTS `thuong_phat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thuong_phat` (
  `MaTP` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL,
  `LoaiTP` varchar(20) NOT NULL COMMENT 'Thuong, Phat',
  `LyDo` text NOT NULL,
  `SoTien` decimal(15,2) NOT NULL,
  `NgayApDung` date NOT NULL,
  `ThangApDung` int DEFAULT NULL COMMENT 'Tháng áp dụng vào lương',
  `NamApDung` int DEFAULT NULL,
  `NguoiLap` int DEFAULT NULL COMMENT 'Người lập quyết định',
  `NgayLap` datetime DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` varchar(50) DEFAULT 'Da_duyet',
  `GhiChu` text,
  PRIMARY KEY (`MaTP`),
  KEY `MaNV` (`MaNV`),
  KEY `NguoiLap` (`NguoiLap`),
  CONSTRAINT `thuong_phat_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `thuong_phat_ibfk_2` FOREIGN KEY (`NguoiLap`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Quản lý thưởng phạt nhân viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thuong_phat`
--

LOCK TABLES `thuong_phat` WRITE;
/*!40000 ALTER TABLE `thuong_phat` DISABLE KEYS */;
/*!40000 ALTER TABLE `thuong_phat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ton_kho`
--

DROP TABLE IF EXISTS `ton_kho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ton_kho` (
  `id` int NOT NULL AUTO_INCREMENT,
  `MaSP` int NOT NULL,
  `MaCH` int NOT NULL,
  `SoLuongTon` int DEFAULT '0',
  `SoLuongToiThieu` int DEFAULT '10' COMMENT 'Mức cảnh báo hết hàng',
  `ViTri` varchar(50) DEFAULT NULL COMMENT 'Kệ A1, Ngăn B2',
  `NgayCapNhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_stock` (`MaSP`,`MaCH`),
  KEY `MaCH` (`MaCH`),
  CONSTRAINT `ton_kho_ibfk_1` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`),
  CONSTRAINT `ton_kho_ibfk_2` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tồn kho từng chi nhánh';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ton_kho`
--

LOCK TABLES `ton_kho` WRITE;
/*!40000 ALTER TABLE `ton_kho` DISABLE KEYS */;
/*!40000 ALTER TABLE `ton_kho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tra_hang`
--

DROP TABLE IF EXISTS `tra_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tra_hang` (
  `MaTraHang` int NOT NULL AUTO_INCREMENT,
  `MaHD` int NOT NULL,
  `MaKH` int DEFAULT NULL,
  `NgayTra` datetime DEFAULT CURRENT_TIMESTAMP,
  `LyDo` text,
  `TongTienTra` decimal(15,2) DEFAULT '0.00',
  `HinhThucHoanTien` varchar(50) DEFAULT NULL COMMENT 'Tien_mat, Chuyen_khoan, Doi_hang',
  `TrangThai` varchar(50) DEFAULT 'Da_duyet',
  `NguoiDuyet` int DEFAULT NULL,
  `NgayDuyet` datetime DEFAULT NULL,
  `GhiChu` text,
  PRIMARY KEY (`MaTraHang`),
  KEY `MaHD` (`MaHD`),
  KEY `MaKH` (`MaKH`),
  KEY `NguoiDuyet` (`NguoiDuyet`),
  CONSTRAINT `tra_hang_ibfk_1` FOREIGN KEY (`MaHD`) REFERENCES `hoadon` (`MaHD`),
  CONSTRAINT `tra_hang_ibfk_2` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  CONSTRAINT `tra_hang_ibfk_3` FOREIGN KEY (`NguoiDuyet`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tra_hang`
--

LOCK TABLES `tra_hang` WRITE;
/*!40000 ALTER TABLE `tra_hang` DISABLE KEYS */;
/*!40000 ALTER TABLE `tra_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_bao_cao_luong_thang`
--

DROP TABLE IF EXISTS `v_bao_cao_luong_thang`;
/*!50001 DROP VIEW IF EXISTS `v_bao_cao_luong_thang`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_bao_cao_luong_thang` AS SELECT 
 1 AS `Thang`,
 1 AS `Nam`,
 1 AS `MaNV`,
 1 AS `HoTen`,
 1 AS `ChucVu`,
 1 AS `LuongCoBan`,
 1 AS `PhuCap`,
 1 AS `Thuong`,
 1 AS `Phat`,
 1 AS `SoNgayLam`,
 1 AS `SoGioTangCa`,
 1 AS `TongLuong`,
 1 AS `TrangThai`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_bao_cao_ton_kho`
--

DROP TABLE IF EXISTS `v_bao_cao_ton_kho`;
/*!50001 DROP VIEW IF EXISTS `v_bao_cao_ton_kho`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_bao_cao_ton_kho` AS SELECT 
 1 AS `TenCH`,
 1 AS `MaSP`,
 1 AS `TenSP`,
 1 AS `TheLoai`,
 1 AS `SoLuongTon`,
 1 AS `SoLuongToiThieu`,
 1 AS `TrangThaiKho`,
 1 AS `DonGia`,
 1 AS `GiaTriTonKho`,
 1 AS `NgayCapNhat`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_doanh_thu_thang`
--

DROP TABLE IF EXISTS `v_doanh_thu_thang`;
/*!50001 DROP VIEW IF EXISTS `v_doanh_thu_thang`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_doanh_thu_thang` AS SELECT 
 1 AS `Nam`,
 1 AS `Thang`,
 1 AS `TenCH`,
 1 AS `SoHoaDon`,
 1 AS `TongDoanhThu`,
 1 AS `TongGiamGia`,
 1 AS `DoanhThuTrungBinh`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_loi_nhuan`
--

DROP TABLE IF EXISTS `v_loi_nhuan`;
/*!50001 DROP VIEW IF EXISTS `v_loi_nhuan`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_loi_nhuan` AS SELECT 
 1 AS `Nam`,
 1 AS `Thang`,
 1 AS `TenCH`,
 1 AS `DoanhThu`,
 1 AS `GiaVon`,
 1 AS `LoiNhuanGop`,
 1 AS `TyLeLoiNhuan`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_san_pham_ban_chay`
--

DROP TABLE IF EXISTS `v_san_pham_ban_chay`;
/*!50001 DROP VIEW IF EXISTS `v_san_pham_ban_chay`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_san_pham_ban_chay` AS SELECT 
 1 AS `MaSP`,
 1 AS `TenSP`,
 1 AS `TheLoai`,
 1 AS `TongSoLuongBan`,
 1 AS `TongDoanhThu`,
 1 AS `SoLanMua`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_thong_ke_cham_cong`
--

DROP TABLE IF EXISTS `v_thong_ke_cham_cong`;
/*!50001 DROP VIEW IF EXISTS `v_thong_ke_cham_cong`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_thong_ke_cham_cong` AS SELECT 
 1 AS `MaNV`,
 1 AS `HoTen`,
 1 AS `ChucVu`,
 1 AS `Thang`,
 1 AS `Nam`,
 1 AS `NgayDiLam`,
 1 AS `NgayDiTre`,
 1 AS `NgayNghi`,
 1 AS `TongGioLam`,
 1 AS `TongGioTangCa`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `xin_nghi_phep`
--

DROP TABLE IF EXISTS `xin_nghi_phep`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `xin_nghi_phep` (
  `id` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL,
  `LoaiDon` varchar(50) DEFAULT 'Nghi_phep' COMMENT 'Nghi_phep, Nghi_om, Thai_san',
  `NgayBatDau` date NOT NULL,
  `NgayKetThuc` date NOT NULL,
  `LyDo` text,
  `TrangThai` varchar(50) DEFAULT 'Cho_duyet' COMMENT 'Cho_duyet, Da_duyet, Tu_choi',
  `NguoiDuyet` int DEFAULT NULL,
  `NgayDuyet` datetime DEFAULT NULL,
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `MaNV` (`MaNV`),
  KEY `NguoiDuyet` (`NguoiDuyet`),
  CONSTRAINT `xin_nghi_phep_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `xin_nghi_phep_ibfk_2` FOREIGN KEY (`NguoiDuyet`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `xin_nghi_phep`
--

LOCK TABLES `xin_nghi_phep` WRITE;
/*!40000 ALTER TABLE `xin_nghi_phep` DISABLE KEYS */;
/*!40000 ALTER TABLE `xin_nghi_phep` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `v_bao_cao_luong_thang`
--

/*!50001 DROP VIEW IF EXISTS `v_bao_cao_luong_thang`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_bao_cao_luong_thang` AS select `l`.`Thang` AS `Thang`,`l`.`Nam` AS `Nam`,`nv`.`MaNV` AS `MaNV`,`nv`.`HoTen` AS `HoTen`,`nv`.`ChucVu` AS `ChucVu`,`l`.`LuongCoBan` AS `LuongCoBan`,`l`.`PhuCap` AS `PhuCap`,`l`.`Thuong` AS `Thuong`,`l`.`Phat` AS `Phat`,`l`.`SoNgayLam` AS `SoNgayLam`,`l`.`SoGioTangCa` AS `SoGioTangCa`,`l`.`TongLuong` AS `TongLuong`,`l`.`TrangThai` AS `TrangThai` from (`luong` `l` join `nhanvien` `nv` on((`l`.`MaNV` = `nv`.`MaNV`))) order by `l`.`Nam` desc,`l`.`Thang` desc,`nv`.`HoTen` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_bao_cao_ton_kho`
--

/*!50001 DROP VIEW IF EXISTS `v_bao_cao_ton_kho`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_bao_cao_ton_kho` AS select `ch`.`TenCH` AS `TenCH`,`sp`.`MaSP` AS `MaSP`,`sp`.`TenSP` AS `TenSP`,`tl`.`TenTL` AS `TheLoai`,`tk`.`SoLuongTon` AS `SoLuongTon`,`tk`.`SoLuongToiThieu` AS `SoLuongToiThieu`,(case when (`tk`.`SoLuongTon` <= `tk`.`SoLuongToiThieu`) then 'Can_nhap_them' when (`tk`.`SoLuongTon` > (`tk`.`SoLuongToiThieu` * 3)) then 'Ton_kho_cao' else 'Binh_thuong' end) AS `TrangThaiKho`,`sp`.`DonGia` AS `DonGia`,(`tk`.`SoLuongTon` * `sp`.`DonGia`) AS `GiaTriTonKho`,`tk`.`NgayCapNhat` AS `NgayCapNhat` from (((`ton_kho` `tk` join `sanpham` `sp` on((`tk`.`MaSP` = `sp`.`MaSP`))) join `cua_hang` `ch` on((`tk`.`MaCH` = `ch`.`MaCH`))) left join `theloai` `tl` on((`sp`.`MaTL` = `tl`.`MaTL`))) where (`sp`.`TinhTrang` = 1) order by `ch`.`TenCH`,`sp`.`TenSP` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_doanh_thu_thang`
--

/*!50001 DROP VIEW IF EXISTS `v_doanh_thu_thang`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_doanh_thu_thang` AS select year(`hd`.`NgayBan`) AS `Nam`,month(`hd`.`NgayBan`) AS `Thang`,`ch`.`TenCH` AS `TenCH`,count(distinct `hd`.`MaHD`) AS `SoHoaDon`,sum(`hd`.`ThanhToan`) AS `TongDoanhThu`,sum(`hd`.`GiamGia`) AS `TongGiamGia`,avg(`hd`.`ThanhToan`) AS `DoanhThuTrungBinh` from (`hoadon` `hd` join `cua_hang` `ch` on((`hd`.`MaCH` = `ch`.`MaCH`))) where (`hd`.`TrangThai` = 'Hoan_thanh') group by `Nam`,`Thang`,`ch`.`MaCH` order by `Nam` desc,`Thang` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_loi_nhuan`
--

/*!50001 DROP VIEW IF EXISTS `v_loi_nhuan`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_loi_nhuan` AS select year(`hd`.`NgayBan`) AS `Nam`,month(`hd`.`NgayBan`) AS `Thang`,`ch`.`TenCH` AS `TenCH`,sum((`cthd`.`SoLuong` * `cthd`.`DonGia`)) AS `DoanhThu`,sum((`cthd`.`SoLuong` * `sp`.`GiaNhap`)) AS `GiaVon`,sum(((`cthd`.`DonGia` - `sp`.`GiaNhap`) * `cthd`.`SoLuong`)) AS `LoiNhuanGop`,round(((sum(((`cthd`.`DonGia` - `sp`.`GiaNhap`) * `cthd`.`SoLuong`)) / sum((`cthd`.`SoLuong` * `cthd`.`DonGia`))) * 100),2) AS `TyLeLoiNhuan` from (((`hoadon` `hd` join `chitiethoadon` `cthd` on((`hd`.`MaHD` = `cthd`.`MaHD`))) join `sanpham` `sp` on((`cthd`.`MaSP` = `sp`.`MaSP`))) join `cua_hang` `ch` on((`hd`.`MaCH` = `ch`.`MaCH`))) where (`hd`.`TrangThai` = 'Hoan_thanh') group by `Nam`,`Thang`,`ch`.`MaCH` order by `Nam` desc,`Thang` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_san_pham_ban_chay`
--

/*!50001 DROP VIEW IF EXISTS `v_san_pham_ban_chay`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_san_pham_ban_chay` AS select `sp`.`MaSP` AS `MaSP`,`sp`.`TenSP` AS `TenSP`,`tl`.`TenTL` AS `TheLoai`,sum(`cthd`.`SoLuong`) AS `TongSoLuongBan`,sum(`cthd`.`ThanhTien`) AS `TongDoanhThu`,count(distinct `cthd`.`MaHD`) AS `SoLanMua` from (((`chitiethoadon` `cthd` join `sanpham` `sp` on((`cthd`.`MaSP` = `sp`.`MaSP`))) left join `theloai` `tl` on((`sp`.`MaTL` = `tl`.`MaTL`))) join `hoadon` `hd` on((`cthd`.`MaHD` = `hd`.`MaHD`))) where (`hd`.`TrangThai` = 'Hoan_thanh') group by `sp`.`MaSP` order by `TongSoLuongBan` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_thong_ke_cham_cong`
--

/*!50001 DROP VIEW IF EXISTS `v_thong_ke_cham_cong`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_thong_ke_cham_cong` AS select `nv`.`MaNV` AS `MaNV`,`nv`.`HoTen` AS `HoTen`,`nv`.`ChucVu` AS `ChucVu`,month(`cc`.`Ngay`) AS `Thang`,year(`cc`.`Ngay`) AS `Nam`,count((case when (`cc`.`TrangThai` = 'Di_lam') then 1 end)) AS `NgayDiLam`,count((case when (`cc`.`TrangThai` = 'Tre') then 1 end)) AS `NgayDiTre`,count((case when (`cc`.`TrangThai` like 'Nghi%') then 1 end)) AS `NgayNghi`,sum(`cc`.`SoGioLam`) AS `TongGioLam`,sum(`cc`.`SoGioTangCa`) AS `TongGioTangCa` from (`cham_cong` `cc` join `nhanvien` `nv` on((`cc`.`MaNV` = `nv`.`MaNV`))) group by `nv`.`MaNV`,`Thang`,`Nam` order by `Nam` desc,`Thang` desc,`nv`.`HoTen` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-22 20:46:06
