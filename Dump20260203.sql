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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ca sáng, chiều, tối';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_lam_viec`
--

LOCK TABLES `ca_lam_viec` WRITE;
/*!40000 ALTER TABLE `ca_lam_viec` DISABLE KEYS */;
INSERT INTO `ca_lam_viec` VALUES (1,'Ca Sáng','08:00:00','12:00:00','Ca làm việc buổi sáng'),(2,'Ca Chiều','13:00:00','17:00:00','Ca làm việc buổi chiều'),(3,'Ca Tối','17:30:00','21:30:00','Ca làm việc buổi tối');
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
  `MaCa` int DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cham_cong`
--

LOCK TABLES `cham_cong` WRITE;
/*!40000 ALTER TABLE `cham_cong` DISABLE KEYS */;
INSERT INTO `cham_cong` VALUES (1,2,NULL,'2026-01-28','14:27:29',NULL,0.00,0.00,'Tre',NULL,'quanly01'),(2,1,1,'2026-01-01','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(3,1,1,'2026-01-20','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(4,1,1,'2026-01-19','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(5,1,1,'2026-01-17','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(6,1,1,'2026-01-16','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(7,1,1,'2026-01-15','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(8,1,1,'2026-01-14','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(9,1,1,'2026-01-13','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(10,1,1,'2026-01-12','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(11,1,1,'2026-01-21','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(12,1,1,'2026-01-22','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(13,1,1,'2026-01-23','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(14,1,1,'2026-01-24','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(15,1,1,'2026-01-26','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(16,1,1,'2026-01-27','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(17,1,1,'2026-01-28','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(18,1,1,'2026-01-02','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(19,1,1,'2026-01-29','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(20,1,1,'2026-01-30','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(21,1,1,'2026-01-31','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(22,1,1,'2026-01-03','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(23,1,1,'2026-01-05','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(24,1,1,'2026-01-07','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(25,1,1,'2026-01-06','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(26,1,1,'2026-01-08','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(27,1,1,'2026-01-09','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(28,1,1,'2026-01-10','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(29,2,1,'2026-01-01','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(30,2,1,'2026-01-02',NULL,NULL,0.00,0.00,'Nghi_phep','','quanly01'),(31,2,1,'2026-01-03','08:00:00',NULL,0.00,0.00,'Tre','','quanly01'),(32,2,1,'2026-01-05','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(33,2,1,'2026-01-07','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(34,2,1,'2026-01-06','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(35,2,1,'2026-01-08','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(36,2,1,'2026-01-09','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(37,2,1,'2026-01-10','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(38,2,1,'2026-01-20','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(39,2,1,'2026-01-19','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(40,2,1,'2026-01-17','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(41,2,1,'2026-01-16','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(42,2,1,'2026-01-15','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(43,2,1,'2026-01-14','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(44,2,1,'2026-01-13','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(45,2,1,'2026-01-12','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(46,2,1,'2026-01-21','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(47,2,1,'2026-01-22','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(48,2,1,'2026-01-31','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(49,2,1,'2026-01-23','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(50,2,1,'2026-01-24','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(51,2,1,'2026-01-26','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(52,2,1,'2026-01-27','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(53,2,1,'2026-01-29','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(54,2,1,'2026-01-30','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01'),(55,3,1,'2026-01-28','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01'),(56,4,1,'2026-01-28','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01'),(57,5,1,'2026-01-28','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01'),(58,3,1,'2026-01-27','08:05:00','12:00:00',3.90,0.00,'Tre',NULL,'quanly01'),(59,4,1,'2026-01-27','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01'),(60,5,1,'2026-01-27','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01'),(61,3,1,'2026-01-29',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync'),(62,4,1,'2026-01-29',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync'),(63,5,1,'2026-01-29',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync'),(64,2,1,'2026-02-02','08:24:34',NULL,0.00,0.00,'Tre','Vào ca','quanly01'),(65,3,1,'2026-02-02','22:21:18',NULL,0.00,0.00,'Tre','Vào ca','thungan01');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chi phí điện nước, thuê MB, vận chuyển...';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_phi`
--

LOCK TABLES `chi_phi` WRITE;
/*!40000 ALTER TABLE `chi_phi` DISABLE KEYS */;
INSERT INTO `chi_phi` VALUES (1,1,1,'Điện nước tháng 11 - Q1',4200000.00,'2025-11-28',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(2,2,1,'Thuê mặt bằng Q1',20000000.00,'2025-11-01',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(3,1,2,'Điện nước tháng 11 - Q7',3100000.00,'2025-11-28',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(4,2,2,'Thuê mặt bằng Q7',15000000.00,'2025-11-01',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(5,3,1,'Vận chuyển hàng kho',2500000.00,'2025-11-15',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(6,1,1,'Điện nước tháng 12 - Q1',5800000.00,'2025-12-28',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,'Máy lạnh chạy nhiều'),(7,2,1,'Thuê mặt bằng Q1',20000000.00,'2025-12-01',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(8,4,1,'Quảng cáo Facebook Noel',10000000.00,'2025-12-10',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(9,1,2,'Điện nước tháng 12 - Q7',4500000.00,'2025-12-28',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(10,2,2,'Thuê mặt bằng Q7',15000000.00,'2025-12-01',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(11,1,3,'Điện nước tháng 12 - Thủ Đức',3800000.00,'2025-12-28',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL),(12,2,3,'Thuê mặt bằng Thủ Đức',12000000.00,'2025-12-01',NULL,'2026-01-29 16:41:05','Da_thanh_toan',NULL,NULL);
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
-- Table structure for table `chi_tiet_km_sanpham`
--

DROP TABLE IF EXISTS `chi_tiet_km_sanpham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_km_sanpham` (
  `MaCT` int NOT NULL AUTO_INCREMENT,
  `MaKM` int NOT NULL,
  `LoaiDoiTuong` varchar(50) NOT NULL COMMENT 'San_pham, The_loai',
  `MaDoiTuong` int NOT NULL COMMENT 'MaSP hoặc MaTL',
  PRIMARY KEY (`MaCT`),
  KEY `idx_km` (`MaKM`),
  KEY `idx_doituong` (`LoaiDoiTuong`,`MaDoiTuong`),
  CONSTRAINT `fk_ctkm_km` FOREIGN KEY (`MaKM`) REFERENCES `khuyen_mai` (`MaKM`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chi tiết sản phẩm/thể loại được áp dụng khuyến mãi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_km_sanpham`
--

LOCK TABLES `chi_tiet_km_sanpham` WRITE;
/*!40000 ALTER TABLE `chi_tiet_km_sanpham` DISABLE KEYS */;
INSERT INTO `chi_tiet_km_sanpham` VALUES (1,6,'The_loai',1),(2,7,'The_loai',4);
/*!40000 ALTER TABLE `chi_tiet_km_sanpham` ENABLE KEYS */;
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
INSERT INTO `chitiethoadon` (`MaHD`, `MaSP`, `DonGia`, `SoLuong`, `GiamGia`) VALUES (20,1,115000.00,2,0.00),(21,1,115000.00,1,0.00),(22,1,115000.00,3,0.00),(23,1,115000.00,2,0.00),(28,1,115000.00,5,0.00),(32,1,115000.00,1,0.00),(35,1,115000.00,20,0.00),(37,1,115000.00,3,0.00),(39,1,115000.00,8,0.00),(43,1,115000.00,10,0.00),(25,2,95000.00,1,0.00),(35,2,95000.00,2,0.00),(39,2,95000.00,1,0.00),(24,5,135000.00,3,0.00),(31,5,135000.00,4,0.00),(34,5,135000.00,1,0.00),(43,5,135000.00,1,0.00),(44,5,135000.00,1,0.00),(26,7,145000.00,1,0.00),(37,7,145000.00,20,0.00),(30,8,175000.00,1,0.00),(38,8,175000.00,2,0.00),(43,8,175000.00,5,0.00),(27,9,95000.00,1,0.00),(42,9,95000.00,1,0.00),(29,10,85000.00,4,0.00),(32,10,85000.00,1,0.00),(41,10,85000.00,2,0.00),(28,11,125000.00,5,0.00),(36,11,125000.00,6,0.00),(40,11,125000.00,1,0.00),(33,12,88000.00,10,0.00),(29,13,98000.00,1,0.00),(26,15,195000.00,4,0.00),(30,15,195000.00,7,0.00),(41,15,195000.00,2,0.00);
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
INSERT INTO `chitietphieunhap` (`MaPN`, `MaSP`, `DonGiaNhap`, `SoLuong`) VALUES (1,3,50000.00,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách chức năng hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chucnang`
--

LOCK TABLES `chucnang` WRITE;
/*!40000 ALTER TABLE `chucnang` DISABLE KEYS */;
INSERT INTO `chucnang` VALUES (1,'Quản lý hệ thống',NULL,NULL,'settings',1,1),(2,'Tài khoản',1,'/admin/users','users',1,1),(3,'Phân quyền',1,'/admin/roles','shield',2,1),(4,'Nhật ký hoạt động',1,'/admin/logs','file-text',3,1),(5,'Quản lý nhân sự',NULL,NULL,'user-check',2,1),(6,'Danh sách nhân viên',5,'/hr/employees','users',1,1),(7,'Chấm công',5,'/hr/attendance','clock',2,1),(8,'Phân ca làm việc',5,'/hr/schedule','calendar',3,1),(9,'Nghĩ Phép',5,'/hr/leave','clipboard',4,1),(10,'Tính Lương',5,'/hr/salary','dollar-sign',5,1),(11,'Thưởng phạt',5,'/hr/bonus-penalty','award',6,1),(12,'Nhà cung cấp',NULL,NULL,'package',3,1),(13,'Danh sách sản phẩm',12,'/warehouse/products','book',1,1),(14,'Nhà cung cấp',12,'/warehouse/suppliers','truck',2,1),(15,'Phiếu nhập',12,'/warehouse/import','arrow-down',3,1),(16,'Tồn kho',12,'/warehouse/stock','database',4,1),(17,'Kiểm kê',12,'/warehouse/inventory','check-square',5,1),(18,'Quản lý bán hàng',NULL,NULL,'shopping-cart',4,1),(19,'Bán hàng',18,'/sales/pos','credit-card',1,1),(20,'Quản lý hóa đơn',18,'/sales/invoices','file-text',2,1),(21,'Quản lý khách hàng',18,'/sales/customers','user',3,1),(22,'Trả hàng',18,'/sales/returns','rotate-ccw',4,1),(23,'Báo cáo thống kê',NULL,NULL,'bar-chart',5,1),(24,'Báo cáo doanh thu',23,'/reports/revenue','trending-up',1,1),(25,'Báo cáo lợi nhuận',23,'/reports/profit','pie-chart',2,1),(26,'Báo cáo tồn kho',23,'/reports/stock','package',3,1),(27,'Báo cáo nhân sự',23,'/reports/hr','users',4,1),(28,'Quản lý chi nhánh',NULL,'/admin/branches','home',28,1),(29,'Quản lý tác giả',NULL,'/admin/authors','user',29,1),(30,'Quản lý thể loại',NULL,'/admin/categories','list',30,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chuyển hàng giữa các chi nhánh';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuyen_kho`
--

LOCK TABLES `chuyen_kho` WRITE;
/*!40000 ALTER TABLE `chuyen_kho` DISABLE KEYS */;
INSERT INTO `chuyen_kho` VALUES (1,1,2,3,1,'2026-02-02 09:16:14',2,NULL,NULL,'Cho_duyet',NULL),(2,1,2,4,1,'2026-02-02 09:16:14',2,NULL,NULL,'Cho_duyet',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Công nợ phải trả NCC';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cong_no_ncc`
--

LOCK TABLES `cong_no_ncc` WRITE;
/*!40000 ALTER TABLE `cong_no_ncc` DISABLE KEYS */;
INSERT INTO `cong_no_ncc` (`MaCongNo`, `MaNCC`, `MaPN`, `NgayPhatSinh`, `SoTienNo`, `SoTienDaTra`, `HanThanhToan`, `TrangThai`, `GhiChu`) VALUES (4,1,NULL,'2026-01-27 21:03:04',45000000.00,30000000.00,'2026-02-15','Chua_thanh_toan','Batch #1 2024'),(5,2,NULL,'2026-01-27 21:03:04',12500000.00,12500000.00,'2024-01-20','Da_thanh_toan','Batch #2 2024'),(6,3,NULL,'2026-01-27 21:03:04',105000000.00,55000000.00,'2026-03-01','Da_thanh_toan_1_phan','Batch #3 2024'),(7,1,1,'2026-01-28 13:59:43',50000.00,0.00,NULL,'Chua_thanh_toan',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách cửa hàng/chi nhánh';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cua_hang`
--

LOCK TABLES `cua_hang` WRITE;
/*!40000 ALTER TABLE `cua_hang` DISABLE KEYS */;
INSERT INTO `cua_hang` VALUES (1,'Chi nhánh Quận 1','123 Nguyễn Huệ, Quận 1, TP.HCM','0283822123','q1@bansach.vn',1,'2020-01-15'),(2,'Chi nhánh Quận 7','456 Nguyễn Văn Linh, Quận 7, TP.HCM','0283666456','q7@bansach.vn',1,'2021-03-20'),(3,'Chi nhánh Thủ Đức','789 Xa lộ Hà Nội, Thủ Đức, TP.HCM','0283999789','thuduc@bansach.vn',1,'2022-06-10');
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
  `DiemDaDung` int DEFAULT '0' COMMENT 'Điểm khách đã dùng',
  `GiamGiaHangTV` decimal(15,2) DEFAULT '0.00' COMMENT 'Giảm giá từ hạng thành viên',
  PRIMARY KEY (`MaHD`),
  KEY `MaKH` (`MaKH`),
  KEY `MaNV` (`MaNV`),
  KEY `MaCH` (`MaCH`),
  KEY `MaPhien` (`MaPhien`),
  CONSTRAINT `hoadon_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  CONSTRAINT `hoadon_ibfk_2` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `hoadon_ibfk_3` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`),
  CONSTRAINT `hoadon_ibfk_4` FOREIGN KEY (`MaPhien`) REFERENCES `phien_ban_hang` (`MaPhien`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoadon`
--

LOCK TABLES `hoadon` WRITE;
/*!40000 ALTER TABLE `hoadon` DISABLE KEYS */;
INSERT INTO `hoadon` VALUES (20,1,1,1,NULL,'2026-01-28 16:41:17','Tai_quay',230000.00,0.00,0,0,230000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Hóa đơn mẫu POS 1',0,0.00),(21,NULL,1,1,NULL,'2026-01-28 16:41:17','Tai_quay',115000.00,0.00,0,0,115000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Hóa đơn mẫu POS 2',0,0.00),(22,1,1,1,NULL,'2026-01-28 16:41:17','Tai_quay',345000.00,0.00,0,0,345000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(23,1,3,1,NULL,'2025-11-02 09:15:00','Tai_quay',230000.00,0.00,0,0,230000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'KH thân thiết Q1',0,0.00),(24,2,3,1,NULL,'2025-11-05 14:20:00','Tai_quay',450000.00,0.00,0,0,450000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(25,NULL,3,1,NULL,'2025-11-10 18:00:00','Tai_quay',115000.00,0.00,0,0,115000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Khách vãng lai',0,0.00),(26,3,3,2,NULL,'2025-11-12 10:00:00','Tai_quay',850000.00,0.00,0,0,850000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Đơn hàng Q7',0,0.00),(27,NULL,3,2,NULL,'2025-11-15 16:30:00','Tai_quay',95000.00,0.00,0,0,95000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(28,4,3,3,NULL,'2025-11-20 11:45:00','Tai_quay',1200000.00,0.00,0,0,1200000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Đơn lớn Thủ Đức',0,0.00),(29,5,3,3,NULL,'2025-11-25 20:10:00','Tai_quay',345000.00,0.00,0,0,345000.00,'QR',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(30,1,3,1,NULL,'2025-12-01 10:00:00','Tai_quay',1500000.00,0.00,0,0,1500000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Quà tặng giáng sinh',0,0.00),(31,NULL,3,1,NULL,'2025-12-05 19:20:00','Tai_quay',550000.00,0.00,0,0,550000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(32,3,3,1,NULL,'2025-12-10 15:30:00','Tai_quay',215000.00,0.00,0,0,215000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(33,2,3,2,NULL,'2025-12-12 09:45:00','Tai_quay',880000.00,0.00,0,0,880000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(34,NULL,3,2,NULL,'2025-12-15 14:15:00','Tai_quay',135000.00,0.00,0,0,135000.00,'QR',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(35,NULL,3,2,NULL,'2025-12-20 18:50:00','Tai_quay',2500000.00,0.00,0,0,2500000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Mua sỉ',0,0.00),(36,4,3,3,NULL,'2025-12-22 11:00:00','Tai_quay',750000.00,0.00,0,0,750000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(37,5,3,3,NULL,'2025-12-24 16:30:00','Tai_quay',3200000.00,0.00,0,0,3200000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Tiệc Noel',0,0.00),(38,NULL,3,3,NULL,'2025-12-28 20:00:00','Tai_quay',445000.00,0.00,0,0,445000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(39,1,3,1,NULL,'2026-01-05 10:30:00','Tai_quay',950000.00,0.00,0,0,950000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(40,2,3,1,NULL,'2026-01-10 14:15:00','Tai_quay',125000.00,0.00,0,0,125000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(41,NULL,3,2,NULL,'2026-01-15 16:45:00','Tai_quay',580000.00,0.00,0,0,580000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(42,3,3,2,NULL,'2026-01-20 09:00:00','Tai_quay',95000.00,0.00,0,0,95000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(43,4,3,3,NULL,'2026-01-22 13:20:00','Tai_quay',2100000.00,0.00,0,0,2100000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Quà Tết',0,0.00),(44,5,3,3,NULL,'2026-01-25 18:30:00','Tai_quay',135000.00,0.00,0,0,135000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00);
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
  `DiemDaDung` int DEFAULT '0' COMMENT 'Tổng điểm đã tiêu',
  `TongDiemTichLuy` int DEFAULT '0' COMMENT 'Tổng điểm từ trước tới nay',
  `HangTV` varchar(50) DEFAULT 'Dong' COMMENT 'Dong, Bac, Vang, Kim_cuong',
  `NgayThamGia` date DEFAULT NULL COMMENT 'Ngày đăng ký thành viên',
  `NgayNangHang` datetime DEFAULT NULL COMMENT 'Lần cuối nâng hạng',
  PRIMARY KEY (`MaKH`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `SDT` (`SDT`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Khách hàng thân thiết';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khachhang`
--

LOCK TABLES `khachhang` WRITE;
/*!40000 ALTER TABLE `khachhang` DISABLE KEYS */;
INSERT INTO `khachhang` VALUES (1,'Vũ Thị Hoa','hoa.vu@gmail.com','0911111111','123 Điện Biên Phủ, Quận 1, TP.HCM','1988-04-15','Nữ','2026-01-23 09:50:57','VIP',1500,15000000.00,NULL,1,0,0,'Dong','2026-02-02',NULL),(2,'Đặng Văn Long','long.dang@yahoo.com','0912222222','456 Võ Văn Tần, Quận 3, TP.HCM','1990-09-20','Nam','2026-01-23 09:50:57','Thường',800,8000000.00,NULL,1,0,0,'Dong','2026-02-02',NULL),(3,'Bùi Thị Kim','kim.bui@gmail.com','0913333333','789 Cách Mạng Tháng 8, Quận 3, TP.HCM','1995-12-05','Nữ','2026-01-23 09:50:57','Thường',350,3500000.00,NULL,1,0,0,'Dong','2026-02-02',NULL),(4,'Phan Minh Tuấn','tuan.phan@hotmail.com','0914444444','234 Lê Văn Sỹ, Quận 3, TP.HCM','1992-06-30','Nam','2026-01-23 09:50:57','VIP',2100,21000000.00,NULL,1,0,0,'Dong','2026-02-02',NULL),(5,'Võ Thị Nga','nga.vo@gmail.com','0915555555','567 Phan Xích Long, Phú Nhuận, TP.HCM','1987-02-14','Nữ','2026-01-23 09:50:57','VVIP',4500,45000000.00,NULL,1,0,0,'Dong','2026-02-02',NULL);
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
  `LoaiKM` varchar(50) DEFAULT 'giam_phan_tram' COMMENT 'giam_phan_tram, giam_tien, mua_X_tang_Y, giam_gio_vang',
  `GiaTriGiam` decimal(10,2) DEFAULT NULL COMMENT 'Phần trăm (10 = 10%) hoặc số tiền (50000)',
  `GiamToiDa` decimal(12,2) DEFAULT NULL COMMENT 'Giảm tối đa bao nhiêu tiền',
  `GiaTriDonToiThieu` decimal(12,2) DEFAULT NULL COMMENT 'Đơn hàng tối thiểu',
  `NgayBatDau` datetime DEFAULT NULL,
  `NgayKetThuc` datetime DEFAULT NULL,
  `GioApDung` varchar(50) DEFAULT NULL COMMENT 'VD: 10:00-12:00,15:00-17:00 hoặc NULL = cả ngày',
  `NgayApDung` varchar(50) DEFAULT NULL COMMENT 'VD: 2,4,6 (Thứ 2,4,6) hoặc NULL = cả tuần',
  `ApDungCho` varchar(50) DEFAULT 'Tat_ca' COMMENT 'Tat_ca, San_pham, The_loai, Chi_nhanh',
  `MaCH` int DEFAULT NULL COMMENT 'NULL = tất cả chi nhánh',
  `TrangThai` tinyint(1) DEFAULT '1' COMMENT '1: Đang hoạt động, 0: Tạm dừng',
  `SoLanDaSuDung` int DEFAULT '0',
  `GhiChu` text,
  PRIMARY KEY (`MaKM`),
  KEY `idx_trangthai` (`TrangThai`),
  KEY `idx_thoigian` (`NgayBatDau`,`NgayKetThuc`),
  KEY `fk_km_cuahang` (`MaCH`),
  CONSTRAINT `fk_km_cuahang` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng quản lý các chương trình khuyến mãi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khuyen_mai`
--

LOCK TABLES `khuyen_mai` WRITE;
/*!40000 ALTER TABLE `khuyen_mai` DISABLE KEYS */;
INSERT INTO `khuyen_mai` VALUES (1,'Giảm 10% cho đơn từ 500k','Áp dụng cho tất cả sản phẩm khi mua từ 500,000đ','giam_phan_tram',10.00,100000.00,500000.00,'2026-02-01 00:00:00','2026-12-31 23:59:59',NULL,NULL,'Tat_ca',NULL,1,0,NULL),(2,'Giảm 50k cho đơn từ 300k','Giảm trực tiếp 50,000đ cho đơn hàng từ 300,000đ','giam_tien',50000.00,50000.00,300000.00,'2026-02-01 00:00:00','2026-06-30 23:59:59',NULL,NULL,'Tat_ca',NULL,1,0,NULL),(3,'Giờ vàng giảm 15%','Giảm 15% tất cả sản phẩm từ 10h-12h hàng ngày','giam_gio_vang',15.00,150000.00,200000.00,'2026-02-01 00:00:00','2026-12-31 23:59:59','10:00-12:00',NULL,'Tat_ca',NULL,1,0,NULL),(4,'Cuối tuần giảm 12%','Giảm 12% vào Thứ 7 và Chủ nhật','giam_phan_tram',12.00,120000.00,250000.00,'2026-02-01 00:00:00','2026-12-31 23:59:59',NULL,'6,0','Tat_ca',NULL,1,0,NULL),(5,'Sale Tết Bính Ngọ 2026','Khuyến mãi đặc biệt dịp Tết Nguyên Đán','giam_phan_tram',20.00,200000.00,400000.00,'2026-01-25 00:00:00','2026-02-10 23:59:59',NULL,NULL,'Tat_ca',NULL,1,0,NULL),(6,'Sách văn học giảm 15%','Giảm 15% cho tất cả sách văn học','giam_phan_tram',15.00,100000.00,150000.00,'2026-02-01 00:00:00','2026-03-31 23:59:59',NULL,NULL,'The_loai',NULL,1,0,NULL),(7,'Sách kỹ năng giảm 10%','Giảm 10% cho sách kỹ năng sống','giam_phan_tram',10.00,80000.00,100000.00,'2026-02-01 00:00:00','2026-12-31 23:59:59',NULL,NULL,'The_loai',NULL,1,0,NULL);
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
-- Table structure for table `lich_su_diem`
--

DROP TABLE IF EXISTS `lich_su_diem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_diem` (
  `MaLS` int NOT NULL AUTO_INCREMENT,
  `MaKH` int NOT NULL,
  `MaHD` int DEFAULT NULL COMMENT 'Mã hóa đơn (nếu có)',
  `LoaiGiaoDich` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Cong_diem, Tru_diem, Het_han, Dieu_chinh',
  `SoDiem` int NOT NULL COMMENT 'Số điểm thay đổi',
  `DiemTruoc` int DEFAULT '0' COMMENT 'Điểm trước khi giao dịch',
  `DiemSau` int DEFAULT '0' COMMENT 'Điểm sau khi giao dịch',
  `LyDo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lý do giao dịch',
  `MoTa` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả chi tiết',
  `NgayGiaoDich` datetime DEFAULT CURRENT_TIMESTAMP,
  `NgayHetHan` date DEFAULT NULL COMMENT 'Ngày điểm hết hạn (nếu có)',
  `NguoiThucHien` int DEFAULT NULL COMMENT 'Mã nhân viên thực hiện',
  PRIMARY KEY (`MaLS`),
  KEY `idx_khachhang` (`MaKH`),
  KEY `idx_hoadon` (`MaHD`),
  KEY `idx_ngaygd` (`NgayGiaoDich`),
  CONSTRAINT `fk_lsdiem_hd` FOREIGN KEY (`MaHD`) REFERENCES `hoadon` (`MaHD`) ON DELETE SET NULL,
  CONSTRAINT `fk_lsdiem_kh` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử tích điểm và sử dụng điểm của khách hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_diem`
--

LOCK TABLES `lich_su_diem` WRITE;
/*!40000 ALTER TABLE `lich_su_diem` DISABLE KEYS */;
INSERT INTO `lich_su_diem` VALUES (1,1,20,'Cong_diem',50,2450,2500,'Tích điểm từ đơn hàng','Mua hàng 500,000đ','2026-02-02 21:36:47',NULL,NULL),(2,1,NULL,'Tru_diem',-500,3000,2500,'Sử dụng điểm thanh toán','Dùng 500 điểm = 50,000đ','2026-02-02 21:36:47',NULL,NULL),(3,2,21,'Cong_diem',30,770,800,'Tích điểm từ đơn hàng','Mua hàng 300,000đ','2026-02-02 21:36:47',NULL,NULL);
/*!40000 ALTER TABLE `lich_su_diem` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_tra_no_ncc`
--

LOCK TABLES `lich_su_tra_no_ncc` WRITE;
/*!40000 ALTER TABLE `lich_su_tra_no_ncc` DISABLE KEYS */;
INSERT INTO `lich_su_tra_no_ncc` VALUES (1,5,'2026-01-27 21:08:39',12500000.00,'Chuyen_khoan',2,'cv');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `luong`
--

LOCK TABLES `luong` WRITE;
/*!40000 ALTER TABLE `luong` DISABLE KEYS */;
INSERT INTO `luong` VALUES (1,1,11,2025,20000000.00,5000000.00,0.00,0.00,26,0.00,25000000.00,'Da_tra','2025-11-30 00:00:00',NULL),(2,2,11,2025,15000000.00,3000000.00,500000.00,0.00,26,0.00,18500000.00,'Da_tra','2025-11-30 00:00:00',NULL),(3,3,11,2025,8000000.00,1000000.00,200000.00,0.00,26,0.00,9200000.00,'Da_tra','2025-11-30 00:00:00',NULL),(4,4,11,2025,7500000.00,800000.00,0.00,0.00,26,0.00,8300000.00,'Da_tra','2025-11-30 00:00:00',NULL),(5,5,11,2025,12000000.00,2000000.00,0.00,0.00,26,0.00,14000000.00,'Da_tra','2025-11-30 00:00:00',NULL),(6,1,12,2025,20000000.00,5000000.00,2000000.00,0.00,27,0.00,27000000.00,'Da_tra','2025-12-31 00:00:00',NULL),(7,2,12,2025,15000000.00,3000000.00,1500000.00,0.00,27,0.00,19500000.00,'Da_tra','2025-12-31 00:00:00',NULL),(8,3,12,2025,8000000.00,1000000.00,1000000.00,0.00,27,0.00,10000000.00,'Da_tra','2025-12-31 00:00:00',NULL),(9,4,12,2025,7500000.00,800000.00,1000000.00,0.00,27,0.00,9300000.00,'Da_tra','2025-12-31 00:00:00',NULL),(10,5,12,2025,12000000.00,2000000.00,1500000.00,0.00,27,0.00,15500000.00,'Da_tra','2025-12-31 00:00:00',NULL);
/*!40000 ALTER TABLE `luong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ma_giam_gia`
--

DROP TABLE IF EXISTS `ma_giam_gia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ma_giam_gia` (
  `MaMGG` int NOT NULL AUTO_INCREMENT,
  `MaKM` int NOT NULL,
  `MaCode` varchar(50) NOT NULL COMMENT 'GIAM50K, TET2026, HSSV2026',
  `SoLuongPhatHanh` int DEFAULT NULL COMMENT 'NULL = không giới hạn',
  `DaSuDung` int DEFAULT '0',
  `SoLanDungMoiKH` int DEFAULT '1' COMMENT 'Mỗi KH dùng được bao nhiêu lần',
  `ApDungChoKHMoi` tinyint(1) DEFAULT '0' COMMENT 'Chỉ dành cho KH mua lần đầu',
  `TrangThai` tinyint(1) DEFAULT '1',
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaMGG`),
  UNIQUE KEY `MaCode` (`MaCode`),
  KEY `idx_macode` (`MaCode`),
  KEY `fk_mgg_km` (`MaKM`),
  CONSTRAINT `fk_mgg_km` FOREIGN KEY (`MaKM`) REFERENCES `khuyen_mai` (`MaKM`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Mã giảm giá (voucher code) để khách hàng nhập';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ma_giam_gia`
--

LOCK TABLES `ma_giam_gia` WRITE;
/*!40000 ALTER TABLE `ma_giam_gia` DISABLE KEYS */;
INSERT INTO `ma_giam_gia` VALUES (1,2,'GIAM50K',100,0,1,1,1,'2026-02-02 21:01:01'),(2,5,'TET2026',200,0,1,0,1,'2026-02-02 21:01:01'),(3,1,'HSSV2026',500,0,2,0,1,'2026-02-02 21:01:01'),(4,6,'VANHOC15',300,0,1,0,1,'2026-02-02 21:01:01'),(5,4,'WEEKEND12',NULL,0,5,0,1,'2026-02-02 21:01:01');
/*!40000 ALTER TABLE `ma_giam_gia` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhacungcap`
--

LOCK TABLES `nhacungcap` WRITE;
/*!40000 ALTER TABLE `nhacungcap` DISABLE KEYS */;
INSERT INTO `nhacungcap` VALUES (1,'Công ty TNHH Sách Văn hóa','456 Lê Lợi, Quận 1, TP.HCM','0283456789','vanhoa@gmail.com','0123456789','Nguyễn Văn A',1),(2,'Công ty CP Sách Tri thức','789 Hai Bà Trưng, Hà Nội','0243567890','trithuc@gmail.com','0987654321','Trần Thị B',1),(3,'Nhà sách Phương Nam','234 Lý Thường Kiệt, Quận 10, TP.HCM','0283678901','phuongnam@gmail.com','0112233445','Lê Văn C',1);
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
  `MaCa` int DEFAULT '1',
  PRIMARY KEY (`MaNV`),
  UNIQUE KEY `CCCD` (`CCCD`),
  UNIQUE KEY `MaTK` (`MaTK`),
  KEY `MaCH` (`MaCH`),
  CONSTRAINT `nhanvien_ibfk_1` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`),
  CONSTRAINT `nhanvien_ibfk_2` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thông tin nhân viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhanvien`
--

LOCK TABLES `nhanvien` WRITE;
/*!40000 ALTER TABLE `nhanvien` DISABLE KEYS */;
INSERT INTO `nhanvien` VALUES (1,'Nguyễn Văn Admin','admin@bansach.vn','0901234567','123 Lê Lợi, Quận 1, TP.HCM','001088012345','1990-05-16','Nam','Giám đốc','2020-01-01',20000000.00,5000000.00,NULL,NULL,1,1,NULL,1,1),(2,'Trần Thị Lan','quanly01@bansach.vn','0902345678','456 Nguyễn Huệ, Quận 1, TP.HCM','001089123456','1992-08-20','Nữ','Quản lý cửa hàng','2020-02-01',15000000.00,3000000.00,NULL,NULL,2,1,NULL,1,1),(3,'Lê Văn Hùng','thungan01@bansach.vn','0903456789','789 Lý Thường Kiệt, Quận 10, TP.HCM','001090234567','1995-03-10','Nam','Thu ngân','2021-03-15',8000000.00,1000000.00,NULL,NULL,3,1,NULL,1,1),(4,'Phạm Thị Mai','kho01@bansach.vn','0904567890','234 Hai Bà Trưng, Quận 3, TP.HCM','001091345678','1993-11-25','Nữ','Nhân viên kho','2021-06-01',7500000.00,800000.00,NULL,NULL,4,1,NULL,1,1),(5,'Hoàng Văn Nam','hr01@bansach.vn','0905678901','567 Trần Hưng Đạo, Quận 1, TP.HCM','001092456789','1991-07-18','Nam','Nhân viên nhân sự','2020-08-01',12000000.00,2000000.00,NULL,NULL,5,1,NULL,1,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=164 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử thao tác hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhat_ky_hoat_dong`
--

LOCK TABLES `nhat_ky_hoat_dong` WRITE;
/*!40000 ALTER TABLE `nhat_ky_hoat_dong` DISABLE KEYS */;
INSERT INTO `nhat_ky_hoat_dong` VALUES (1,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:15:01','Sai mật khẩu'),(2,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:15:03','Sai mật khẩu'),(3,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:17:48','Sai mật khẩu'),(4,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:23:23',NULL),(5,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:23:50',NULL),(6,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:26:27',NULL),(7,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-23 19:27:55',NULL),(8,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:32:45',NULL),(9,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:41:07',NULL),(10,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:09:58',NULL),(11,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:23:02',NULL),(12,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-23 20:23:34',NULL),(13,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:31:52','Sai mật khẩu'),(14,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:34:00',NULL),(15,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:44:40',NULL),(16,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:53:22',NULL),(17,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 21:16:44',NULL),(18,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-23 21:24:33',NULL),(19,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-24 07:27:31',NULL),(20,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-24 07:31:28',NULL),(21,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-24 22:10:32',NULL),(22,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-24 22:10:35',NULL),(23,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-24 22:13:12',NULL),(24,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-24 22:14:01',NULL),(25,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-24 22:34:03',NULL),(26,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-25 09:20:41',NULL),(27,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-25 09:40:25',NULL),(28,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-25 09:48:10',NULL),(29,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-25 20:41:50',NULL),(30,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-25 20:50:05',NULL),(31,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 20:31:41',NULL),(32,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:32:32',NULL),(33,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-26 20:40:13',NULL),(34,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 20:41:06',NULL),(35,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:49:53',NULL),(36,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:55:38',NULL),(37,2,'Dang_nhap_that_bai','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:58:37','Sai mật khẩu'),(38,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:58:41',NULL),(39,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:03:42',NULL),(40,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:06:08',NULL),(41,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:08:35',NULL),(42,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-26 21:09:39',NULL),(43,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 21:10:56',NULL),(44,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 21:25:58',NULL),(45,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 21:26:15',NULL),(46,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:49:25',NULL),(47,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 21:55:12',NULL),(48,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:55:28',NULL),(49,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-26 21:55:50',NULL),(50,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:57:11',NULL),(51,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-27 09:02:39',NULL),(52,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-27 09:03:58',NULL),(53,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-27 09:04:15','Sai mật khẩu'),(54,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-27 09:04:20','Sai mật khẩu'),(55,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-27 09:04:24',NULL),(56,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-27 09:04:43',NULL),(57,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-27 19:46:25','Sai mật khẩu'),(58,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-27 19:46:29',NULL),(59,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-27 19:49:14',NULL),(60,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-27 19:49:47',NULL),(61,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-27 20:45:07',NULL),(62,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-27 21:07:13',NULL),(63,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-28 08:39:13',NULL),(64,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-28 08:40:33',NULL),(65,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-28 10:37:10',NULL),(66,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-28 13:24:51',NULL),(67,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-28 13:38:50',NULL),(68,4,'Them','phieunhap',1,NULL,'{\"MaNCC\":1,\"MaCH\":1,\"TongTien\":50000,\"ConNo\":50000}','::1','2026-01-28 13:59:43',NULL),(69,5,'Dang_nhap','taikhoan',5,NULL,NULL,'::1','2026-01-28 14:11:59',NULL),(70,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-28 14:22:30',NULL),(71,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-29 09:00:00',NULL),(72,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 09:30:53',NULL),(73,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 10:02:22',NULL),(74,2,'Them','cham_cong',2,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-01\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(75,2,'Them','cham_cong',3,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-20\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(76,2,'Them','cham_cong',5,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-17\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(77,2,'Them','cham_cong',6,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-16\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(78,2,'Them','cham_cong',4,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-19\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(79,2,'Them','cham_cong',7,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-15\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(80,2,'Them','cham_cong',8,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-14\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(81,2,'Them','cham_cong',10,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-12\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(82,2,'Them','cham_cong',9,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-13\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(83,2,'Them','cham_cong',11,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-21\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(84,2,'Them','cham_cong',13,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-23\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(85,2,'Them','cham_cong',12,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-22\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(86,2,'Them','cham_cong',14,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-24\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(87,2,'Them','cham_cong',15,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-26\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(88,2,'Them','cham_cong',16,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-27\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(89,2,'Them','cham_cong',17,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-28\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(90,2,'Them','cham_cong',19,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-29\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(91,2,'Them','cham_cong',18,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-02\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(92,2,'Them','cham_cong',20,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-30\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(93,2,'Them','cham_cong',24,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-07\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(94,2,'Them','cham_cong',21,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-31\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(95,2,'Them','cham_cong',22,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-03\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(96,2,'Them','cham_cong',23,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-05\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(97,2,'Them','cham_cong',25,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-06\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(98,2,'Them','cham_cong',26,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-08\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(99,2,'Them','cham_cong',28,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-10\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(100,2,'Them','cham_cong',27,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-09\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(101,2,'Them','cham_cong',29,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-01\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(102,2,'Them','cham_cong',30,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-02\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(103,2,'Them','cham_cong',31,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-03\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(104,2,'Them','cham_cong',33,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-07\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(105,2,'Them','cham_cong',34,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-06\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(106,2,'Them','cham_cong',32,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-05\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(107,2,'Them','cham_cong',35,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-08\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(108,2,'Them','cham_cong',36,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-09\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(109,2,'Them','cham_cong',37,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-10\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(110,2,'Them','cham_cong',39,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-19\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(111,2,'Them','cham_cong',38,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-20\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(112,2,'Them','cham_cong',40,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-17\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(113,2,'Them','cham_cong',41,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-16\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(114,2,'Them','cham_cong',42,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-15\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(115,2,'Them','cham_cong',45,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-12\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(116,2,'Them','cham_cong',43,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-14\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(117,2,'Them','cham_cong',44,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-13\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(118,2,'Them','cham_cong',46,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-21\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(119,2,'Them','cham_cong',47,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-22\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(120,2,'Them','cham_cong',48,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-31\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(121,2,'Them','cham_cong',52,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-27\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(122,2,'Them','cham_cong',49,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-23\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(123,2,'Them','cham_cong',50,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-24\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(124,2,'Them','cham_cong',51,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-26\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(125,2,'Them','cham_cong',53,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-29\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(126,2,'Them','cham_cong',54,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-30\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(127,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 15:55:30',NULL),(128,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 2 | Cửa hàng 1: Thực tế 35 vs Hệ thống 35. Lý do: Không có'),(129,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 5 | Cửa hàng 1: Thực tế 60 vs Hệ thống 60. Lý do: Không có'),(130,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 3 | Cửa hàng 1: Thực tế 41 vs Hệ thống 41. Lý do: Không có'),(131,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 8 | Cửa hàng 1: Thực tế 45 vs Hệ thống 45. Lý do: Không có'),(132,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 4 | Cửa hàng 1: Thực tế 25 vs Hệ thống 25. Lý do: Không có'),(133,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 9 | Cửa hàng 1: Thực tế 55 vs Hệ thống 55. Lý do: Không có'),(134,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 7 | Cửa hàng 1: Thực tế 20 vs Hệ thống 20. Lý do: Không có'),(135,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 1 | Cửa hàng 1: Thực tế 50 vs Hệ thống 50. Lý do: Không có'),(136,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 6 | Cửa hàng 1: Thực tế 30 vs Hệ thống 30. Lý do: Không có'),(137,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 10 | Cửa hàng 1: Thực tế 30 vs Hệ thống 30. Lý do: Không có'),(138,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 16:28:08',NULL),(139,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 20:20:48',NULL),(140,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-31 07:49:50','Sai mật khẩu'),(141,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-31 07:49:54','Sai mật khẩu'),(142,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-31 07:52:34',NULL),(143,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-31 07:53:44',NULL),(144,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-31 08:44:00',NULL),(145,5,'Dang_nhap','taikhoan',5,NULL,NULL,'::1','2026-01-31 08:45:00',NULL),(146,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-02 08:22:28',NULL),(147,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-02 08:30:34',NULL),(148,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 2 | Cửa hàng 1: Thực tế 35 vs Hệ thống 35. Lý do: Không có'),(149,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 5 | Cửa hàng 1: Thực tế 60 vs Hệ thống 60. Lý do: Không có'),(150,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 3 | Cửa hàng 1: Thực tế 41 vs Hệ thống 41. Lý do: Không có'),(151,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 8 | Cửa hàng 1: Thực tế 45 vs Hệ thống 45. Lý do: Không có'),(152,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 4 | Cửa hàng 1: Thực tế 25 vs Hệ thống 25. Lý do: Không có'),(153,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 9 | Cửa hàng 1: Thực tế 55 vs Hệ thống 55. Lý do: Không có'),(154,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 7 | Cửa hàng 1: Thực tế 20 vs Hệ thống 20. Lý do: Không có'),(155,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 1 | Cửa hàng 1: Thực tế 50 vs Hệ thống 50. Lý do: Không có'),(156,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 6 | Cửa hàng 1: Thực tế 30 vs Hệ thống 30. Lý do: Không có'),(157,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 10 | Cửa hàng 1: Thực tế 30 vs Hệ thống 30. Lý do: Không có'),(158,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-02 21:16:59',NULL),(159,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-02 21:39:17',NULL),(160,3,'VoHieuHoa','khachhang',3,NULL,'{\"TinhTrang\":0}','::1','2026-02-02 22:18:56',NULL),(161,3,'VoHieuHoa','khachhang',2,NULL,'{\"TinhTrang\":0}','::1','2026-02-02 22:18:59',NULL),(162,3,'KichHoat','khachhang',2,NULL,'{\"TinhTrang\":1}','::1','2026-02-02 22:20:40',NULL),(163,3,'KichHoat','khachhang',3,NULL,'{\"TinhTrang\":1}','::1','2026-02-02 22:20:41',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhaxuatban`
--

LOCK TABLES `nhaxuatban` WRITE;
/*!40000 ALTER TABLE `nhaxuatban` DISABLE KEYS */;
INSERT INTO `nhaxuatban` VALUES (1,'NXB Trẻ','161B Lý Chính Thắng, Quận 3, TP.HCM','02839316289','nxbtre@nxbtre.com.vn',1),(2,'NXB Kim Đồng','55 Quang Trung, Hai Bà Trưng, Hà Nội','02439434730','info@nxbkimdong.com.vn',1),(3,'NXB Văn học','18 Nguyễn Trường Tộ, Ba Đình, Hà Nội','02437163100','nxbvanhoc@gmail.com',1),(4,'NXB Dân Trí','9 Phạm Ngọc Thạch, Đống Đa, Hà Nội','02462592088','lienhe@nxbdantri.com.vn',1),(5,'NXB Tổng hợp TP.HCM','62 Nguyễn Thị Minh Khai, Quận 1, TP.HCM','02838225340','tonghop@nxbhcm.com.vn',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phân quyền hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhomquyen`
--

LOCK TABLES `nhomquyen` WRITE;
/*!40000 ALTER TABLE `nhomquyen` DISABLE KEYS */;
INSERT INTO `nhomquyen` VALUES (1,'Admin','Quản trị viên hệ thống',1),(2,'Chủ cửa hàng','Toàn quyền điều hành và xem báo cáo kinh doanh',1),(3,'Nhân viên bán hàng','Sử dụng POS, lập hóa đơn và trả hàng',1),(4,'Nhân viên kho','Quản lý sản phẩm, nhập hàng và tồn kho',1),(5,'Quản lý nhân sự','Quản lý nhân viên, chấm công và tính lương',1),(6,'Kế toán','Quản lý thu chi và báo cáo tài chính',1);
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
  `MaCTQ` int NOT NULL AUTO_INCREMENT,
  `MaNQ` int NOT NULL,
  `MaCN` int NOT NULL,
  `Xem` tinyint(1) DEFAULT '0',
  `Them` tinyint(1) DEFAULT '0',
  `Sua` tinyint(1) DEFAULT '0',
  `Xoa` tinyint(1) DEFAULT '0',
  `XuatFile` tinyint(1) DEFAULT '0' COMMENT 'Xuất Excel/PDF',
  `Duyet` tinyint(1) DEFAULT '0' COMMENT 'Duyệt đơn, phiếu',
  PRIMARY KEY (`MaNQ`,`MaCN`),
  UNIQUE KEY `MaCTQ` (`MaCTQ`),
  KEY `MaCN` (`MaCN`),
  CONSTRAINT `phanquyen_chitiet_ibfk_1` FOREIGN KEY (`MaNQ`) REFERENCES `nhomquyen` (`MaNQ`) ON DELETE CASCADE,
  CONSTRAINT `phanquyen_chitiet_ibfk_2` FOREIGN KEY (`MaCN`) REFERENCES `chucnang` (`MaCN`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=308 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phân quyền CRUD chi tiết';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phanquyen_chitiet`
--

LOCK TABLES `phanquyen_chitiet` WRITE;
/*!40000 ALTER TABLE `phanquyen_chitiet` DISABLE KEYS */;
INSERT INTO `phanquyen_chitiet` VALUES (213,1,2,1,1,1,1,1,1),(214,1,3,1,1,1,1,1,1),(215,1,4,1,1,1,1,1,1),(301,1,12,1,1,1,1,1,1),(295,1,13,1,1,1,1,1,1),(302,1,14,1,1,1,1,1,1),(303,1,15,1,1,1,1,1,1),(304,1,16,1,1,1,1,1,1),(305,1,17,1,1,1,1,1,1),(286,1,28,1,1,1,1,1,1),(287,1,29,1,1,1,1,1,1),(288,1,30,1,1,1,1,1,1),(253,2,1,1,1,1,1,1,1),(254,2,5,1,1,1,1,1,1),(260,2,6,1,1,1,1,1,1),(261,2,7,1,1,1,1,1,1),(262,2,8,1,1,1,1,1,1),(263,2,9,1,1,1,1,1,1),(264,2,10,1,1,1,1,1,1),(265,2,11,1,1,1,1,1,1),(255,2,12,1,1,1,1,1,1),(266,2,13,1,1,1,1,1,1),(267,2,14,1,1,1,1,1,1),(268,2,16,1,1,1,1,1,1),(269,2,17,1,1,1,1,1,1),(256,2,18,1,1,1,1,1,1),(270,2,20,1,1,1,1,1,1),(271,2,22,1,1,1,1,1,1),(257,2,23,1,1,1,1,1,1),(272,2,24,1,1,1,1,1,1),(273,2,25,1,1,1,1,1,1),(274,2,26,1,1,1,1,1,1),(275,2,27,1,1,1,1,1,1),(290,2,28,1,0,0,0,0,0),(297,3,13,1,0,0,0,0,0),(216,3,19,1,1,1,1,1,1),(217,3,21,1,1,1,1,1,1),(291,3,28,1,0,0,0,0,0),(298,4,13,1,1,0,0,0,0),(306,4,14,1,1,0,0,0,0),(219,4,15,1,1,1,1,1,1),(307,4,16,1,1,0,0,0,0),(292,4,28,1,1,0,0,0,0),(56,5,6,1,1,1,1,1,1),(57,5,7,1,1,1,1,1,1),(58,5,9,1,1,1,1,1,1),(59,5,10,1,1,1,1,1,1),(299,5,13,1,0,0,0,0,0),(293,5,28,1,0,0,0,0,0),(60,6,12,1,0,0,0,1,0),(300,6,13,1,0,0,0,0,0),(61,6,20,1,0,0,0,1,0),(62,6,23,1,0,0,0,1,0),(63,6,24,1,0,0,0,1,0),(64,6,25,1,0,0,0,1,0),(65,6,26,1,0,0,0,1,0),(294,6,28,1,0,0,0,0,0);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieunhap`
--

LOCK TABLES `phieunhap` WRITE;
/*!40000 ALTER TABLE `phieunhap` DISABLE KEYS */;
INSERT INTO `phieunhap` VALUES (1,1,1,4,'2026-01-28 13:59:42',50000.00,0.00,50000.00,'Hoan_thanh','xc');
/*!40000 ALTER TABLE `phieunhap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quy_tac_tich_diem`
--

DROP TABLE IF EXISTS `quy_tac_tich_diem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quy_tac_tich_diem` (
  `MaQT` int NOT NULL AUTO_INCREMENT,
  `TenQT` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` text COLLATE utf8mb4_unicode_ci,
  `SoTienMua` decimal(12,2) NOT NULL COMMENT 'Số tiền mua bao nhiêu',
  `SoDiem` int NOT NULL COMMENT 'Được bao nhiêu điểm',
  `HeSoNhan` decimal(5,2) DEFAULT '1.00' COMMENT 'Hệ số nhân điểm (1.0 = 100%, 1.5 = 150%)',
  `ApDungCho` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Tat_ca' COMMENT 'Tat_ca, The_loai, San_pham, Hang_TV, Khung_gio',
  `MaDoiTuong` int DEFAULT NULL COMMENT 'ID của thể loại/sản phẩm/hạng (nếu có)',
  `TuNgay` datetime DEFAULT NULL,
  `DenNgay` datetime DEFAULT NULL,
  `ThuTrongTuan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'VD: 0,6 = CN,T7',
  `KhungGio` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'VD: 10:00-12:00',
  `TrangThai` tinyint(1) DEFAULT '1' COMMENT '1: Hoạt động, 0: Tắt',
  `ThuTu` int DEFAULT '0' COMMENT 'Thứ tự ưu tiên áp dụng',
  PRIMARY KEY (`MaQT`),
  KEY `idx_trangthai` (`TrangThai`),
  KEY `idx_apdung` (`ApDungCho`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quy tắc tính điểm thưởng cho khách hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quy_tac_tich_diem`
--

LOCK TABLES `quy_tac_tich_diem` WRITE;
/*!40000 ALTER TABLE `quy_tac_tich_diem` DISABLE KEYS */;
INSERT INTO `quy_tac_tich_diem` VALUES (1,'Quy tắc cơ bản','Mua 10,000đ = 1 điểm',10000.00,1,1.00,'Tat_ca',NULL,'2026-01-01 00:00:00','2099-12-31 00:00:00',NULL,NULL,1,1),(2,'Sách Văn học x1.5','Mua sách văn học được x1.5 điểm',10000.00,1,1.50,'The_loai',1,'2026-01-01 00:00:00','2099-12-31 00:00:00',NULL,NULL,1,2),(3,'Sách Kỹ năng x1.2','Mua sách kỹ năng được x1.2 điểm',10000.00,1,1.20,'The_loai',4,'2026-01-01 00:00:00','2099-12-31 00:00:00',NULL,NULL,1,3),(4,'Giờ vàng x2 điểm','Mua từ 10h-12h được x2 điểm',10000.00,1,2.00,'Khung_gio',NULL,'2026-01-01 00:00:00','2099-12-31 00:00:00',NULL,'10:00-12:00',1,4),(5,'Cuối tuần x1.5','Mua Thứ 7, CN được x1.5 điểm',10000.00,1,1.50,'Tat_ca',NULL,'2026-01-01 00:00:00','2099-12-31 00:00:00','0,6',NULL,1,5);
/*!40000 ALTER TABLE `quy_tac_tich_diem` ENABLE KEYS */;
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
  `TinhTrang` tinyint(1) DEFAULT '1' COMMENT '1: Còn bán, 0: Ngừng kinh doanh',
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  `MinSoLuong` int DEFAULT '0',
  PRIMARY KEY (`MaSP`),
  KEY `MaTL` (`MaTL`),
  KEY `MaTG` (`MaTG`),
  KEY `MaNXB` (`MaNXB`),
  CONSTRAINT `sanpham_ibfk_1` FOREIGN KEY (`MaTL`) REFERENCES `theloai` (`MaTL`),
  CONSTRAINT `sanpham_ibfk_2` FOREIGN KEY (`MaTG`) REFERENCES `tacgia` (`MaTG`),
  CONSTRAINT `sanpham_ibfk_3` FOREIGN KEY (`MaNXB`) REFERENCES `nhaxuatban` (`MaNXB`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sanpham`
--

LOCK TABLES `sanpham` WRITE;
/*!40000 ALTER TABLE `sanpham` DISABLE KEYS */;
INSERT INTO `sanpham` VALUES (1,'Tôi Thấy Hoa Vàng Trên Cỏ Xanh','Truyện dài của Nguyễn Nhật Ánh về tuổi thơ miền Trung',0.00,80000.00,'/uploads/images/Toi_Thay_Hoa_Vang_Tren_Co_Xanh.jpg',1,1,1,2022,368,NULL,NULL,'978-604-1-00000-1',1,'2026-01-23 09:50:57',9),(2,'Cho Tôi Xin Một Vé Đi Tuổi Thơ','Tác phẩm văn học về ký ức tuổi thơ',0.00,65000.00,'/uploads/images/Nha_Gia_Kim.jpg',1,4,1,2021,280,NULL,NULL,'978-604-1-00000-2',1,'2026-01-23 09:50:57',0),(3,'Dế Mèn Phiêu Lưu Ký','Tác phẩm kinh điển của văn học thiếu nhi VN',60000.00,50000.00,'/uploads/images/Dac_Nhan_Tam.jpg',5,2,4,2020,196,NULL,NULL,'978-604-2-00000-1',1,'2026-01-23 09:50:57',0),(4,'Lão Hạc','Truyện ngắn nổi tiếng của Nam Cao',55000.00,35000.00,'/uploads/images/Harry_Potter_va_Hon_Đa_Phu_Thuy.jpg',1,3,3,2023,120,NULL,NULL,'978-604-3-00000-1',1,'2026-01-23 09:50:57',0),(5,'Đắc Nhân Tâm','Sách kỹ năng giao tiếp và ứng xử',135000.00,90000.00,'/uploads/images/Cho_toi_tro_ve_tuoi_Tho.jpg',4,4,1,2022,320,NULL,NULL,'978-604-1-00001-1',1,'2026-01-23 09:50:57',0),(6,'Trên Đường Băng','Kỹ năng sống của Tony Buổi Sáng',105000.00,70000.00,'/uploads/images/Rung_Na_Uy.jpg',4,5,4,2021,256,NULL,NULL,'978-604-4-00000-1',1,'2026-01-23 09:50:57',0),(7,'Rừng Na Uy','Tiểu thuyết của Haruki Murakami',145000.00,100000.00,'/uploads/images/De_Men_Thieu_luu_ky.jpg',2,6,3,2023,448,NULL,NULL,'978-604-3-00001-1',1,'2026-01-23 09:50:57',0),(8,'Harry Potter và Hòn Đá Phù Thủy','Tập 1 series Harry Potter',175000.00,120000.00,'/uploads/images/Lao_Hac.jpg',2,7,1,2022,368,NULL,NULL,'978-604-1-00002-1',1,'2026-01-23 09:50:57',0),(9,'Nhà Giả Kim','Tác phẩm nổi tiếng của Paulo Coelho',95000.00,60000.00,'/uploads/images/Truyen_Kieu.jpg',2,8,3,2021,227,NULL,NULL,'978-604-3-00002-1',1,'2026-01-23 09:50:57',0),(10,'Truyện Kiều','Tác phẩm kinh điển của Nguyễn Du',85000.00,55000.00,'/uploads/images/Đuong_Xua_May_Trang.jpg',1,9,3,2023,256,NULL,NULL,'978-604-3-00003-1',1,'2026-01-23 09:50:57',0),(11,'Đường Xưa Mây Trắng','Cuộc đời Đức Phật - Thích Nhất Hạnh',125000.00,85000.00,'/uploads/images/Len_Duong_Bang.png',8,10,5,2022,512,NULL,NULL,'978-604-5-00000-1',1,'2026-01-23 09:50:57',0),(12,'Totto-Chan Bên Cửa Sổ','Hồi ký tuổi thơ tại Nhật Bản',88000.00,58000.00,'/product-images/sp12.jpg',5,6,2,2021,268,NULL,NULL,'978-604-2-00001-1',1,'2026-01-23 09:50:57',0),(13,'Cà Phê Cùng Tony','Sách kỹ năng sống',98000.00,65000.00,'/product-images/sp13.jpg',4,5,4,2023,212,NULL,NULL,'978-604-4-00001-1',1,'2026-01-23 09:50:57',0),(14,'Tuổi Trẻ Đáng Giá Bao Nhiêu','Sách về tuổi trẻ và đam mê',85000.00,55000.00,'/product-images/sp14.jpg',4,5,4,2020,192,NULL,NULL,'978-604-4-00002-1',1,'2026-01-23 09:50:57',0),(15,'Sapiens: Lịch Sử Loài Người','Tóm tắt lịch sử nhân loại',195000.00,135000.00,'/product-images/sp15.jpg',7,6,5,2022,512,NULL,NULL,'978-604-5-00001-1',1,'2026-01-23 09:50:57',0);
/*!40000 ALTER TABLE `sanpham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `su_dung_khuyen_mai`
--

DROP TABLE IF EXISTS `su_dung_khuyen_mai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `su_dung_khuyen_mai` (
  `MaSD` int NOT NULL AUTO_INCREMENT,
  `MaHD` int NOT NULL,
  `MaKM` int DEFAULT NULL,
  `MaMGG` int DEFAULT NULL COMMENT 'Nếu dùng mã giảm giá',
  `MaKH` int DEFAULT NULL,
  `LoaiKM` varchar(50) DEFAULT NULL,
  `GiaTriGiam` decimal(12,2) DEFAULT NULL COMMENT 'Số tiền thực tế đã giảm',
  `TongTienTruocGiam` decimal(15,2) DEFAULT NULL,
  `TongTienSauGiam` decimal(15,2) DEFAULT NULL,
  `NgaySuDung` datetime DEFAULT CURRENT_TIMESTAMP,
  `MaNV` int DEFAULT NULL COMMENT 'Nhân viên áp dụng KM',
  PRIMARY KEY (`MaSD`),
  KEY `idx_hoadon` (`MaHD`),
  KEY `idx_km` (`MaKM`),
  KEY `idx_mgg` (`MaMGG`),
  CONSTRAINT `fk_sdkm_hoadon` FOREIGN KEY (`MaHD`) REFERENCES `hoadon` (`MaHD`) ON DELETE CASCADE,
  CONSTRAINT `fk_sdkm_km` FOREIGN KEY (`MaKM`) REFERENCES `khuyen_mai` (`MaKM`),
  CONSTRAINT `fk_sdkm_mgg` FOREIGN KEY (`MaMGG`) REFERENCES `ma_giam_gia` (`MaMGG`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử sử dụng khuyến mãi trong hóa đơn';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `su_dung_khuyen_mai`
--

LOCK TABLES `su_dung_khuyen_mai` WRITE;
/*!40000 ALTER TABLE `su_dung_khuyen_mai` DISABLE KEYS */;
/*!40000 ALTER TABLE `su_dung_khuyen_mai` ENABLE KEYS */;
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
  `NgaySinh` date DEFAULT NULL,
  `QuocTich` varchar(100) DEFAULT NULL,
  `MoTa` text,
  `HinhAnh` varchar(255) DEFAULT NULL,
  `TinhTrang` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaTG`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tacgia`
--

LOCK TABLES `tacgia` WRITE;
/*!40000 ALTER TABLE `tacgia` DISABLE KEYS */;
INSERT INTO `tacgia` VALUES (1,'Nguyễn Nhật Ánh',NULL,NULL,'Nhà văn Việt Nam nổi tiếng với các tác phẩm thiếu nhi',NULL,1),(2,'Tô Hoài',NULL,NULL,'Nhà văn Việt Nam, tác giả Dế Mèn phiêu lưu ký',NULL,1),(3,'Nam Cao',NULL,NULL,'Nhà văn hiện thực phê phán',NULL,1),(4,'Dale Carnegie',NULL,NULL,'Tác giả người Mỹ, chuyên về kỹ năng giao tiếp',NULL,1),(5,'Tony Buổi Sáng',NULL,NULL,'Tác giả Việt Nam, chuyên về kỹ năng sống',NULL,1),(6,'Haruki Murakami',NULL,NULL,'Nhà văn Nhật Bản nổi tiếng',NULL,1),(7,'J.K. Rowling',NULL,NULL,'Tác giả series Harry Potter',NULL,1),(8,'Paulo Coelho',NULL,NULL,'Nhà văn Brazil, tác giả Nhà giả kim',NULL,1),(9,'Nguyễn Du',NULL,NULL,'Đại thi hào Việt Nam, tác giả Truyện Kiều',NULL,1),(10,'Thích Nhất Hạnh',NULL,NULL,'Thiền sư Việt Nam nổi tiếng thế giới',NULL,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tài khoản đăng nhập hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taikhoan`
--

LOCK TABLES `taikhoan` WRITE;
/*!40000 ALTER TABLE `taikhoan` DISABLE KEYS */;
INSERT INTO `taikhoan` VALUES (1,'admin','$2a$10$RZwm4ORbMGTVh77MlStrdeYXW2eIiGP94LHkGC0KbLWclhL7p15fm','admin@bansach.vn',1,1,'2026-01-23 09:50:57'),(2,'quanly01','$2a$10$RZwm4ORbMGTVh77MlStrdeYXW2eIiGP94LHkGC0KbLWclhL7p15fm','quanly01@bansach.vn',1,2,'2026-01-23 09:50:57'),(3,'thungan01','$2a$10$RZwm4ORbMGTVh77MlStrdeYXW2eIiGP94LHkGC0KbLWclhL7p15fm','thungan01@bansach.vn',1,3,'2026-01-23 09:50:57'),(4,'kho01','$2a$10$RZwm4ORbMGTVh77MlStrdeYXW2eIiGP94LHkGC0KbLWclhL7p15fm','kho01@bansach.vn',1,4,'2026-01-23 09:50:57'),(5,'hr01','$2a$10$RZwm4ORbMGTVh77MlStrdeYXW2eIiGP94LHkGC0KbLWclhL7p15fm','hr01@bansach.vn',1,5,'2026-01-23 09:50:57');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thể loại sách';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theloai`
--

LOCK TABLES `theloai` WRITE;
/*!40000 ALTER TABLE `theloai` DISABLE KEYS */;
INSERT INTO `theloai` VALUES (1,'Văn học Việt Nam','Tiểu thuyết, truyện ngắn của tác giả Việt Nam',1),(2,'Văn học nước ngoài','Tác phẩm văn học được dịch từ nước ngoài',1),(3,'Kinh tế - Kinh doanh','Sách về quản trị, marketing, khởi nghiệp',1),(4,'Kỹ năng sống','Sách phát triển bản thân, kỹ năng mềm',1),(5,'Thiếu nhi','Truyện tranh, truyện cổ tích cho trẻ em',1),(6,'Khoa học - Công nghệ','Sách về khoa học, lập trình, công nghệ',1),(7,'Lịch sử - Chính trị','Sách về lịch sử Việt Nam và thế giới',1),(8,'Tâm lý - Triết học','Sách về tâm lý học, triết học',1);
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
  UNIQUE KEY `idx_masp_mach` (`MaSP`,`MaCH`),
  KEY `MaCH` (`MaCH`),
  CONSTRAINT `ton_kho_ibfk_1` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`),
  CONSTRAINT `ton_kho_ibfk_2` FOREIGN KEY (`MaCH`) REFERENCES `cua_hang` (`MaCH`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tồn kho từng chi nhánh';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ton_kho`
--

LOCK TABLES `ton_kho` WRITE;
/*!40000 ALTER TABLE `ton_kho` DISABLE KEYS */;
INSERT INTO `ton_kho` VALUES (1,1,1,50,10,'Kệ A1','2026-01-23 09:50:57'),(2,2,1,35,10,'Kệ A2','2026-01-23 09:50:57'),(3,3,1,41,10,'Kệ B1','2026-01-28 13:59:42'),(4,4,1,25,10,'Kệ B2','2026-01-23 09:50:57'),(5,5,1,60,15,'Kệ C1','2026-01-23 09:50:57'),(6,6,1,30,10,'Kệ C2','2026-01-23 09:50:57'),(7,7,1,20,10,'Kệ D1','2026-01-23 09:50:57'),(8,8,1,45,15,'Kệ D2','2026-01-23 09:50:57'),(9,9,1,55,10,'Kệ E1','2026-01-23 09:50:57'),(10,10,1,30,10,'Kệ E2','2026-01-23 09:50:57'),(11,1,2,30,10,'Kệ A1','2026-01-23 09:50:57'),(12,2,2,25,10,'Kệ A2','2026-01-23 09:50:57'),(13,5,2,40,10,'Kệ B1','2026-01-23 09:50:57'),(14,8,2,35,10,'Kệ B2','2026-01-23 09:50:57'),(15,9,2,30,10,'Kệ C1','2026-01-23 09:50:57'),(16,1,3,20,10,'Kệ A1','2026-01-23 09:50:57'),(17,3,3,25,10,'Kệ A2','2026-01-23 09:50:57'),(18,5,3,30,10,'Kệ B1','2026-01-23 09:50:57'),(19,7,3,15,10,'Kệ B2','2026-01-23 09:50:57'),(20,11,3,20,10,'Kệ C1','2026-01-23 09:50:57');
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
-- Table structure for table `uu_dai_hang_thanh_vien`
--

DROP TABLE IF EXISTS `uu_dai_hang_thanh_vien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uu_dai_hang_thanh_vien` (
  `MaUD` int NOT NULL AUTO_INCREMENT,
  `HangTV` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Dong, Bac, Vang, Kim_cuong',
  `DiemToiThieu` int NOT NULL COMMENT 'Điểm tối thiểu để đạt hạng',
  `DiemToiDa` int DEFAULT NULL COMMENT 'Điểm tối đa của hạng (NULL = không giới hạn)',
  `PhanTramGiam` decimal(5,2) DEFAULT '0.00' COMMENT 'Giảm % mọi đơn hàng',
  `HeSoTichDiem` decimal(5,2) DEFAULT '1.00' COMMENT 'Hệ số nhân điểm khi mua (1.0 = 100%)',
  `GiamSinhNhat` decimal(5,2) DEFAULT '0.00' COMMENT 'Giảm % tháng sinh nhật',
  `MienPhiShip` tinyint(1) DEFAULT '0' COMMENT 'Miễn phí vận chuyển',
  `UuTienMuaMoi` tinyint(1) DEFAULT '0' COMMENT 'Ưu tiên mua sách mới',
  `ToiDaDungDiem` decimal(5,2) DEFAULT '50.00' COMMENT 'Tối đa dùng % giá trị đơn',
  `MoTa` text COLLATE utf8mb4_unicode_ci,
  `TrangThai` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`MaUD`),
  UNIQUE KEY `unique_hang` (`HangTV`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ưu đãi và quyền lợi theo từng hạng thành viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uu_dai_hang_thanh_vien`
--

LOCK TABLES `uu_dai_hang_thanh_vien` WRITE;
/*!40000 ALTER TABLE `uu_dai_hang_thanh_vien` DISABLE KEYS */;
INSERT INTO `uu_dai_hang_thanh_vien` VALUES (1,'Dong',0,999,0.00,1.00,5.00,0,0,30.00,'Hạng Đồng - Thành viên mới\n- Tích điểm cơ bản\n- Giảm 5% sinh nhật\n- Dùng tối đa 30% giá trị đơn bằng điểm',1),(2,'Bac',1000,4999,5.00,1.10,10.00,0,0,40.00,'Hạng Bạc - Thành viên thân thiết\n- Giảm 5% mọi đơn hàng\n- Tích điểm +10%\n- Giảm 10% sinh nhật\n- Dùng tối đa 40% giá trị đơn bằng điểm',1),(3,'Vang',5000,19999,10.00,1.20,15.00,1,0,50.00,'Hạng Vàng - Thành viên VIP\n- Giảm 10% mọi đơn hàng\n- Tích điểm +20%\n- Giảm 15% sinh nhật\n- Miễn phí ship\n- Dùng tối đa 50% giá trị đơn bằng điểm',1),(4,'Kim_cuong',20000,NULL,15.00,1.30,20.00,1,1,100.00,'Hạng Kim Cương - Thành viên Đặc Biệt\n- Giảm 15% mọi đơn hàng\n- Tích điểm +30%\n- Giảm 20% sinh nhật\n- Miễn phí ship\n- Ưu tiên mua sách mới\n- Không giới hạn sử dụng điểm',1);
/*!40000 ALTER TABLE `uu_dai_hang_thanh_vien` ENABLE KEYS */;
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
-- Temporary view structure for view `v_thongtinhoivien`
--

DROP TABLE IF EXISTS `v_thongtinhoivien`;
/*!50001 DROP VIEW IF EXISTS `v_thongtinhoivien`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_thongtinhoivien` AS SELECT 
 1 AS `MaKH`,
 1 AS `HoTen`,
 1 AS `Email`,
 1 AS `SDT`,
 1 AS `DiaChi`,
 1 AS `NgaySinh`,
 1 AS `GioiTinh`,
 1 AS `NgayDK`,
 1 AS `LoaiKH`,
 1 AS `DiemTichLuy`,
 1 AS `TongChiTieu`,
 1 AS `GhiChu`,
 1 AS `TinhTrang`,
 1 AS `DiemDaDung`,
 1 AS `TongDiemTichLuy`,
 1 AS `HangTV`,
 1 AS `NgayThamGia`,
 1 AS `NgayNangHang`,
 1 AS `PhanTramGiam`,
 1 AS `HeSoTichDiem`,
 1 AS `GiamSinhNhat`,
 1 AS `MienPhiShip`,
 1 AS `ToiDaDungDiem`,
 1 AS `MoTaHang`,
 1 AS `DiemCanDeLenHang`,
 1 AS `GiaTriDiemHienTai`*/;
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
  `MinhChung` varchar(255) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT 'Cho_duyet' COMMENT 'Cho_duyet, Da_duyet, Tu_choi',
  `NguoiDuyet` int DEFAULT NULL,
  `NgayDuyet` datetime DEFAULT NULL,
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `MaNV` (`MaNV`),
  KEY `NguoiDuyet` (`NguoiDuyet`),
  CONSTRAINT `xin_nghi_phep_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `xin_nghi_phep_ibfk_2` FOREIGN KEY (`NguoiDuyet`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `xin_nghi_phep`
--

LOCK TABLES `xin_nghi_phep` WRITE;
/*!40000 ALTER TABLE `xin_nghi_phep` DISABLE KEYS */;
INSERT INTO `xin_nghi_phep` VALUES (1,2,'Nghi_khong_phep','2026-01-29','2026-01-31','đff','proof-1769693499068-744203656.png','Cho_duyet',NULL,NULL,'2026-01-29 20:31:39'),(2,3,'Nghi_phep','2026-01-31','2026-02-01','','proof-1769823827777-420781202.png','Cho_duyet',NULL,NULL,'2026-01-31 08:43:47');
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

--
-- Final view structure for view `v_thongtinhoivien`
--

/*!50001 DROP VIEW IF EXISTS `v_thongtinhoivien`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_thongtinhoivien` AS select `kh`.`MaKH` AS `MaKH`,`kh`.`HoTen` AS `HoTen`,`kh`.`Email` AS `Email`,`kh`.`SDT` AS `SDT`,`kh`.`DiaChi` AS `DiaChi`,`kh`.`NgaySinh` AS `NgaySinh`,`kh`.`GioiTinh` AS `GioiTinh`,`kh`.`NgayDK` AS `NgayDK`,`kh`.`LoaiKH` AS `LoaiKH`,`kh`.`DiemTichLuy` AS `DiemTichLuy`,`kh`.`TongChiTieu` AS `TongChiTieu`,`kh`.`GhiChu` AS `GhiChu`,`kh`.`TinhTrang` AS `TinhTrang`,`kh`.`DiemDaDung` AS `DiemDaDung`,`kh`.`TongDiemTichLuy` AS `TongDiemTichLuy`,`kh`.`HangTV` AS `HangTV`,`kh`.`NgayThamGia` AS `NgayThamGia`,`kh`.`NgayNangHang` AS `NgayNangHang`,`ud`.`PhanTramGiam` AS `PhanTramGiam`,`ud`.`HeSoTichDiem` AS `HeSoTichDiem`,`ud`.`GiamSinhNhat` AS `GiamSinhNhat`,`ud`.`MienPhiShip` AS `MienPhiShip`,`ud`.`ToiDaDungDiem` AS `ToiDaDungDiem`,`ud`.`MoTa` AS `MoTaHang`,(case when ((`kh`.`HangTV` collate utf8mb4_unicode_ci) = 'Kim_cuong') then NULL else ((select `uu_dai_hang_thanh_vien`.`DiemToiThieu` from `uu_dai_hang_thanh_vien` where (`uu_dai_hang_thanh_vien`.`HangTV` = (select `uu_dai_hang_thanh_vien`.`HangTV` from `uu_dai_hang_thanh_vien` where (`uu_dai_hang_thanh_vien`.`DiemToiThieu` > `ud`.`DiemToiThieu`) order by `uu_dai_hang_thanh_vien`.`DiemToiThieu` limit 1))) - `kh`.`TongDiemTichLuy`) end) AS `DiemCanDeLenHang`,(`kh`.`DiemTichLuy` * 100) AS `GiaTriDiemHienTai` from (`khachhang` `kh` left join `uu_dai_hang_thanh_vien` `ud` on(((`kh`.`HangTV` collate utf8mb4_unicode_ci) = `ud`.`HangTV`))) */;
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

-- Dump completed on 2026-02-03  9:06:34
