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
  `PhutNghi` int DEFAULT '60' COMMENT 'Phút nghỉ giữa ca (mặc định 60 phút)',
  PRIMARY KEY (`MaCa`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Ca sáng, chiều, tối';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_lam_viec`
--

LOCK TABLES `ca_lam_viec` WRITE;
/*!40000 ALTER TABLE `ca_lam_viec` DISABLE KEYS */;
INSERT INTO `ca_lam_viec` VALUES (1,'Ca Sáng','08:00:00','12:00:00','Ca làm việc buổi sáng',60),(2,'Ca Chiều','13:00:00','17:00:00','Ca làm việc buổi chiều',60),(3,'Ca Tối','17:30:00','21:30:00','Ca làm việc buổi tối',60);
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
  `DiaChi_IP` varchar(50) DEFAULT NULL COMMENT 'IP địa chỉ chấm công',
  `ViTri` varchar(255) DEFAULT NULL COMMENT 'Tọa độ GPS (nếu có)',
  `ThietBi` varchar(100) DEFAULT NULL COMMENT 'Thiết bị chấm công',
  `LanSuaCuoi` datetime DEFAULT NULL COMMENT 'Lần sửa cuối cùng',
  `NguoiSuaCuoi` int DEFAULT NULL COMMENT 'Người sửa cuối cùng',
  PRIMARY KEY (`MaCC`),
  UNIQUE KEY `unique_attendance` (`MaNV`,`Ngay`),
  KEY `idx_ngay` (`Ngay`),
  KEY `idx_trangthai` (`TrangThai`),
  KEY `idx_manv_ngay` (`MaNV`,`Ngay`),
  CONSTRAINT `cham_cong_ibfk_1` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB AUTO_INCREMENT=170 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cham_cong`
--

LOCK TABLES `cham_cong` WRITE;
/*!40000 ALTER TABLE `cham_cong` DISABLE KEYS */;
INSERT INTO `cham_cong` VALUES (1,2,NULL,'2026-01-28','14:27:29',NULL,0.00,0.00,'Tre',NULL,'quanly01',NULL,NULL,NULL,NULL,NULL),(2,1,1,'2026-01-01','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(3,1,1,'2026-01-20','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(4,1,1,'2026-01-19','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(5,1,1,'2026-01-17','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(6,1,1,'2026-01-16','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(7,1,1,'2026-01-15','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(8,1,1,'2026-01-14','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(9,1,1,'2026-01-13','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(10,1,1,'2026-01-12','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(11,1,1,'2026-01-21','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(12,1,1,'2026-01-22','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(13,1,1,'2026-01-23','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(14,1,1,'2026-01-24','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(15,1,1,'2026-01-26','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(16,1,1,'2026-01-27','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(17,1,1,'2026-01-28','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(18,1,1,'2026-01-02','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(19,1,1,'2026-01-29','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(20,1,1,'2026-01-30','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(21,1,1,'2026-01-31','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(22,1,1,'2026-01-03','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(23,1,1,'2026-01-05','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(24,1,1,'2026-01-07','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(25,1,1,'2026-01-06','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(26,1,1,'2026-01-08','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(27,1,1,'2026-01-09','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(28,1,1,'2026-01-10','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(29,2,1,'2026-01-01','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(30,2,1,'2026-01-02',NULL,NULL,0.00,0.00,'Nghi_phep','','quanly01',NULL,NULL,NULL,NULL,NULL),(31,2,1,'2026-01-03','08:00:00',NULL,0.00,0.00,'Tre','','quanly01',NULL,NULL,NULL,NULL,NULL),(32,2,1,'2026-01-05','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(33,2,1,'2026-01-07','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(34,2,1,'2026-01-06','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(35,2,1,'2026-01-08','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(36,2,1,'2026-01-09','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(37,2,1,'2026-01-10','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(38,2,1,'2026-01-20','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(39,2,1,'2026-01-19','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(40,2,1,'2026-01-17','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(41,2,1,'2026-01-16','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(42,2,1,'2026-01-15','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(43,2,1,'2026-01-14','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(44,2,1,'2026-01-13','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(45,2,1,'2026-01-12','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(46,2,1,'2026-01-21','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(47,2,1,'2026-01-22','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(48,2,1,'2026-01-31','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(49,2,1,'2026-01-23','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(50,2,1,'2026-01-24','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(51,2,1,'2026-01-26','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(52,2,1,'2026-01-27','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(53,2,1,'2026-01-29','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(54,2,1,'2026-01-30','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(55,3,1,'2026-01-28','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01',NULL,NULL,NULL,NULL,NULL),(56,4,1,'2026-01-28','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01',NULL,NULL,NULL,NULL,NULL),(57,5,1,'2026-01-28','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01',NULL,NULL,NULL,NULL,NULL),(58,3,1,'2026-01-27','08:05:00','12:00:00',3.90,0.00,'Tre',NULL,'quanly01',NULL,NULL,NULL,NULL,NULL),(59,4,1,'2026-01-27','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01',NULL,NULL,NULL,NULL,NULL),(60,5,1,'2026-01-27','08:00:00','12:00:00',4.00,0.00,'Di_lam',NULL,'quanly01',NULL,NULL,NULL,NULL,NULL),(61,3,1,'2026-01-29',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(62,4,1,'2026-01-29',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(63,5,1,'2026-01-29',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(64,2,1,'2026-02-02','08:24:34',NULL,0.00,0.00,'Tre','Vào ca','quanly01',NULL,NULL,NULL,NULL,NULL),(65,3,1,'2026-02-02','22:21:18',NULL,0.00,0.00,'Tre','Vào ca','thungan01',NULL,NULL,NULL,NULL,NULL),(66,1,1,'2026-02-03',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(67,2,1,'2026-02-03',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(68,3,1,'2026-02-03',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(69,4,1,'2026-02-03',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(70,5,1,'2026-02-03',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(71,2,1,'2026-02-04','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(72,2,1,'2026-02-05','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(73,2,1,'2026-02-06','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(74,2,1,'2026-02-07','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(75,2,1,'2026-02-09','08:00:00','17:26:38',8.43,0.00,'Di_lam','Ra ca','quanly01','::1',NULL,NULL,'2026-02-09 17:26:38',NULL),(76,2,1,'2026-02-17','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(77,2,1,'2026-02-10','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(78,2,1,'2026-02-20','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(79,2,1,'2026-02-19','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(80,2,1,'2026-02-18','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(81,2,1,'2026-02-16','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(82,2,1,'2026-02-14','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(83,2,1,'2026-02-13','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(84,2,1,'2026-02-12','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(85,2,1,'2026-02-11','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(86,2,1,'2026-02-21','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(87,2,1,'2026-02-23','08:00:00','15:38:42',6.63,0.00,'Di_lam','Ra ca','quanly01','::1',NULL,NULL,'2026-02-23 15:38:42',NULL),(88,2,1,'2026-02-24','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(89,2,1,'2026-02-25','08:00:00','19:18:44',10.30,0.00,'Di_lam','Ra ca','quanly01','::1',NULL,NULL,'2026-02-25 19:18:44',NULL),(90,2,1,'2026-02-26','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(91,2,1,'2026-02-27','08:00:00','19:25:42',10.42,0.00,'Di_lam','Ra ca','quanly01','::1',NULL,NULL,'2026-02-27 19:25:42',NULL),(92,2,1,'2026-02-28',NULL,NULL,0.00,0.00,'Nghi_khong_phep','','quanly01',NULL,NULL,NULL,NULL,NULL),(93,5,1,'2026-01-03','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(94,5,1,'2026-01-02','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(95,5,1,'2026-01-07','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(96,5,1,'2026-01-08','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(97,5,1,'2026-01-06','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(98,5,1,'2026-01-05','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(99,5,1,'2026-01-10','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(100,5,1,'2026-01-20','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(101,5,1,'2026-01-09','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(102,5,1,'2026-01-19','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(103,5,1,'2026-01-17','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(104,5,1,'2026-01-16','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(105,5,1,'2026-01-12','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(106,5,1,'2026-01-15','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(107,5,1,'2026-01-26','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(108,5,1,'2026-01-24','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(109,5,1,'2026-01-13','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(110,5,1,'2026-01-21','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(111,5,1,'2026-01-22','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(112,5,1,'2026-01-23','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(113,5,1,'2026-01-14','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(114,3,1,'2026-01-03','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(115,3,1,'2026-01-06','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(116,3,1,'2026-01-10','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(117,3,1,'2026-01-20','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(118,3,1,'2026-01-19','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(119,3,1,'2026-01-07','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(120,3,1,'2026-01-17','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(121,3,1,'2026-01-16','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(122,3,1,'2026-01-15','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(123,3,1,'2026-01-14','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(124,3,1,'2026-01-13','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(125,3,1,'2026-01-12','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(126,3,1,'2026-01-21','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(127,3,1,'2026-01-22','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(128,3,1,'2026-01-24','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(129,3,1,'2026-01-05','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(130,3,1,'2026-01-23','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(131,3,1,'2026-01-02','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(132,3,1,'2026-01-08','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(133,3,1,'2026-01-09','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(134,1,1,'2026-02-24',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(135,3,1,'2026-02-24',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(136,4,1,'2026-02-24',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(137,5,1,'2026-02-24',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(138,1,1,'2026-02-04','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(139,1,1,'2026-02-19','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(140,1,1,'2026-02-02','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(141,1,1,'2026-02-05','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(142,1,1,'2026-02-07','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(143,1,1,'2026-02-06','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(144,1,1,'2026-02-09','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(145,1,1,'2026-02-18','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(146,1,1,'2026-02-10','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(147,1,1,'2026-02-20','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(148,1,1,'2026-02-17','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(149,1,1,'2026-02-16','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(150,1,1,'2026-02-26','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(151,1,1,'2026-02-25','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(152,1,1,'2026-02-23','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(153,1,1,'2026-02-21','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(154,1,1,'2026-02-27',NULL,NULL,0.00,0.00,'Nghi_phep','','quanly01',NULL,NULL,NULL,NULL,NULL),(155,1,1,'2026-02-28',NULL,NULL,0.00,0.00,'Nghi_phep','','quanly01',NULL,NULL,NULL,NULL,NULL),(156,1,1,'2026-02-12','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(157,1,1,'2026-02-13','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(158,1,1,'2026-02-11','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(159,1,1,'2026-02-14','08:00:00',NULL,0.00,0.00,'Di_lam','','quanly01',NULL,NULL,NULL,NULL,NULL),(160,1,1,'2026-03-05',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(161,2,1,'2026-03-05',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(162,3,1,'2026-03-05',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(163,4,1,'2026-03-05',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(164,5,1,'2026-03-05',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh dấu vắng mặt','System_Sync',NULL,NULL,NULL,NULL,NULL),(165,1,1,'2026-03-10',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh vắng mặt','System_Auto',NULL,NULL,NULL,NULL,NULL),(166,2,1,'2026-03-10',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh vắng mặt','System_Auto',NULL,NULL,NULL,NULL,NULL),(167,3,1,'2026-03-10',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh vắng mặt','System_Auto',NULL,NULL,NULL,NULL,NULL),(168,4,1,'2026-03-10',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh vắng mặt','System_Auto',NULL,NULL,NULL,NULL,NULL),(169,5,1,'2026-03-10',NULL,NULL,0.00,0.00,'Nghi_khong_phep','Hệ thống tự động đánh vắng mặt','System_Auto',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `cham_cong` ENABLE KEYS */;
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
INSERT INTO `chi_tiet_kiem_ke` (`MaKiemKe`, `MaSP`, `SoLuongHeThong`, `SoLuongThucTe`, `LyDo`) VALUES (1,1,110,110,NULL),(1,2,95,95,NULL),(1,3,100,100,NULL),(1,4,83,83,NULL),(1,5,120,120,NULL),(1,6,89,89,NULL),(1,7,78,78,NULL),(1,8,105,105,NULL),(1,9,115,115,NULL),(1,10,90,90,NULL),(1,11,40,40,NULL),(1,12,40,40,NULL),(1,13,40,40,NULL),(1,14,40,40,NULL),(1,15,40,40,NULL),(1,16,40,40,NULL),(1,17,40,40,NULL),(1,18,40,40,NULL),(1,19,40,40,NULL),(1,20,40,40,NULL),(1,21,40,40,NULL),(1,22,40,40,NULL),(1,23,40,40,NULL),(1,24,40,40,NULL),(1,25,40,40,NULL),(1,26,40,40,NULL),(1,27,40,40,NULL),(1,28,40,40,NULL),(1,29,40,40,NULL),(1,30,40,40,NULL),(1,31,40,40,NULL),(1,32,40,40,NULL),(1,33,40,40,NULL),(1,34,40,40,NULL),(1,35,40,40,NULL),(1,36,40,40,NULL),(1,37,40,40,NULL),(1,38,40,40,NULL),(1,39,40,40,NULL),(1,40,40,40,NULL),(1,41,40,40,NULL),(1,42,40,40,NULL),(1,43,40,40,NULL),(1,44,40,40,NULL),(1,45,40,40,NULL),(1,46,40,40,NULL),(1,47,40,40,NULL),(1,48,40,40,NULL),(1,49,40,40,NULL),(1,50,39,39,NULL),(1,51,40,40,NULL),(1,52,40,40,NULL),(1,53,40,40,NULL),(1,54,40,40,NULL),(1,55,40,40,NULL),(1,56,40,40,NULL),(1,57,40,40,NULL),(1,58,40,40,NULL),(1,59,68,68,NULL),(1,60,40,40,NULL),(1,61,40,40,NULL),(1,62,40,40,NULL),(1,63,40,40,NULL),(1,64,40,40,NULL),(1,65,40,40,NULL),(1,66,40,40,NULL),(1,67,40,40,NULL),(1,68,40,40,NULL),(1,69,40,40,NULL),(1,70,40,40,NULL),(1,71,40,40,NULL),(1,72,40,40,NULL),(1,73,40,40,NULL),(1,74,40,40,NULL),(1,75,40,40,NULL),(1,76,40,40,NULL),(1,77,40,40,NULL),(1,78,40,40,NULL),(1,79,40,40,NULL),(1,80,40,40,NULL),(1,81,40,40,NULL),(1,82,40,40,NULL),(1,83,40,40,NULL),(1,84,40,40,NULL),(1,85,40,40,NULL),(1,86,40,40,NULL),(1,87,40,40,NULL),(1,88,40,40,NULL),(1,89,40,40,NULL),(1,90,40,40,NULL),(1,91,40,40,NULL),(1,92,40,40,NULL),(1,93,40,40,NULL),(1,94,40,40,NULL),(1,95,40,40,NULL),(1,96,40,40,NULL),(1,97,40,40,NULL),(1,98,40,40,NULL),(2,1,108,108,NULL),(2,2,95,95,NULL),(2,3,100,100,NULL),(2,4,82,82,NULL),(2,5,120,120,NULL),(2,6,89,89,NULL),(2,7,78,78,NULL),(2,8,105,105,NULL),(2,9,115,115,NULL),(2,10,90,90,NULL),(2,11,40,40,NULL),(2,12,40,40,NULL),(2,13,40,40,NULL),(2,14,40,40,NULL),(2,15,40,40,NULL),(2,16,40,40,NULL),(2,17,40,40,NULL),(2,18,40,40,NULL),(2,19,40,40,NULL),(2,20,40,40,NULL),(2,21,40,40,NULL),(2,22,40,40,NULL),(2,23,40,40,NULL),(2,24,40,40,NULL),(2,25,40,40,NULL),(2,26,40,40,NULL),(2,27,40,40,NULL),(2,28,40,40,NULL),(2,29,40,40,NULL),(2,30,40,40,NULL),(2,31,40,40,NULL),(2,32,40,40,NULL),(2,33,40,40,NULL),(2,34,40,40,NULL),(2,35,40,40,NULL),(2,36,40,40,NULL),(2,37,40,40,NULL),(2,38,40,40,NULL),(2,39,40,40,NULL),(2,40,40,40,NULL),(2,41,40,40,NULL),(2,42,40,40,NULL),(2,43,40,40,NULL),(2,44,40,40,NULL),(2,45,40,40,NULL),(2,46,40,40,NULL),(2,47,40,40,NULL),(2,48,40,40,NULL),(2,49,40,40,NULL),(2,50,39,39,NULL),(2,51,40,40,NULL),(2,52,40,40,NULL),(2,53,40,40,NULL),(2,54,40,40,NULL),(2,55,40,40,NULL),(2,56,40,40,NULL),(2,57,40,40,NULL),(2,58,40,40,NULL),(2,59,68,68,NULL),(2,60,40,40,NULL),(2,61,40,40,NULL),(2,62,40,40,NULL),(2,63,40,40,NULL),(2,64,40,40,NULL),(2,65,40,40,NULL),(2,66,40,40,NULL),(2,67,40,40,NULL),(2,68,40,40,NULL),(2,69,40,40,NULL),(2,70,40,40,NULL),(2,71,40,40,NULL),(2,72,40,40,NULL),(2,73,40,40,NULL),(2,74,40,40,NULL),(2,75,40,40,NULL),(2,76,40,40,NULL),(2,77,40,40,NULL),(2,78,40,40,NULL),(2,79,40,40,NULL),(2,80,40,40,NULL),(2,81,40,40,NULL),(2,82,40,40,NULL),(2,83,40,40,NULL),(2,84,40,40,NULL),(2,85,40,40,NULL),(2,86,40,40,NULL),(2,87,40,40,NULL),(2,88,40,40,NULL),(2,89,40,40,NULL),(2,90,40,40,NULL),(2,91,40,40,NULL),(2,92,40,40,NULL),(2,93,40,40,NULL),(2,94,40,40,NULL),(2,95,40,40,NULL),(2,96,40,40,NULL),(2,97,40,40,NULL),(2,98,40,40,NULL),(3,1,96,96,NULL),(3,2,95,95,NULL),(3,3,100,100,NULL),(3,4,82,82,NULL),(3,5,120,120,NULL),(3,6,89,89,NULL),(3,7,78,78,NULL),(3,8,105,105,NULL),(3,9,115,115,NULL),(3,10,90,90,NULL),(3,11,40,40,NULL),(3,12,40,40,NULL),(3,13,40,40,NULL),(3,14,40,40,NULL),(3,15,40,40,NULL),(3,16,40,40,NULL),(3,17,40,40,NULL),(3,18,40,40,NULL),(3,19,40,40,NULL),(3,20,40,40,NULL),(3,21,40,40,NULL),(3,22,40,40,NULL),(3,23,40,40,NULL),(3,24,40,40,NULL),(3,25,40,40,NULL),(3,26,40,40,NULL),(3,27,40,40,NULL),(3,28,40,40,NULL),(3,29,40,40,NULL),(3,30,40,40,NULL),(3,31,40,40,NULL),(3,32,40,40,NULL),(3,33,40,40,NULL),(3,34,40,40,NULL),(3,35,40,40,NULL),(3,36,40,40,NULL),(3,37,40,40,NULL),(3,38,40,40,NULL),(3,39,40,40,NULL),(3,40,40,40,NULL),(3,41,40,40,NULL),(3,42,40,40,NULL),(3,43,40,40,NULL),(3,44,40,40,NULL),(3,45,40,40,NULL),(3,46,40,40,NULL),(3,47,40,40,NULL),(3,48,40,40,NULL),(3,49,40,40,NULL),(3,50,39,39,NULL),(3,51,40,40,NULL),(3,52,40,40,NULL),(3,53,40,40,NULL),(3,54,40,40,NULL),(3,55,40,40,NULL),(3,56,40,40,NULL),(3,57,40,40,NULL),(3,58,40,40,NULL),(3,59,68,68,NULL),(3,60,40,40,NULL),(3,61,40,40,NULL),(3,62,40,40,NULL),(3,63,40,40,NULL),(3,64,40,40,NULL),(3,65,40,40,NULL),(3,66,40,40,NULL),(3,67,40,40,NULL),(3,68,40,40,NULL),(3,69,40,40,NULL),(3,70,40,40,NULL),(3,71,40,40,NULL),(3,72,40,40,NULL),(3,73,40,40,NULL),(3,74,40,40,NULL),(3,75,40,40,NULL),(3,76,40,40,NULL),(3,77,40,40,NULL),(3,78,40,40,NULL),(3,79,40,40,NULL),(3,80,40,40,NULL),(3,81,40,40,NULL),(3,82,40,40,NULL),(3,83,40,40,NULL),(3,84,40,40,NULL),(3,85,40,40,NULL),(3,86,40,40,NULL),(3,87,40,40,NULL),(3,88,40,40,NULL),(3,89,40,40,NULL),(3,90,40,40,NULL),(3,91,40,40,NULL),(3,92,40,40,NULL),(3,93,40,40,NULL),(3,94,40,40,NULL),(3,95,40,39,'có cuốn sách bị hư '),(3,96,40,40,NULL),(3,97,40,40,NULL),(3,98,40,40,NULL);
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
-- Table structure for table `chitiet_phanbokho`
--

DROP TABLE IF EXISTS `chitiet_phanbokho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chitiet_phanbokho` (
  `MaPhanBo` int NOT NULL AUTO_INCREMENT,
  `MaPN` int NOT NULL COMMENT 'Phiếu nhập',
  `MaSP` int NOT NULL,
  `MaKho` int NOT NULL,
  `SoLuong` int NOT NULL COMMENT 'Số lượng phân bổ vào kho này',
  `ThoiGian` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaPhanBo`),
  KEY `idx_mapn` (`MaPN`),
  KEY `idx_masp` (`MaSP`),
  KEY `idx_makho` (`MaKho`),
  CONSTRAINT `fk_pb_kho` FOREIGN KEY (`MaKho`) REFERENCES `kho_con` (`MaKho`),
  CONSTRAINT `fk_pb_phieunhap` FOREIGN KEY (`MaPN`) REFERENCES `phieunhap` (`MaPN`) ON DELETE CASCADE,
  CONSTRAINT `fk_pb_sanpham` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Log phân bổ số lượng sản phẩm vào từng kho con khi nhập';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chitiet_phanbokho`
--

LOCK TABLES `chitiet_phanbokho` WRITE;
/*!40000 ALTER TABLE `chitiet_phanbokho` DISABLE KEYS */;
INSERT INTO `chitiet_phanbokho` VALUES (1,5,2,3,4,'2026-03-05 06:32:42'),(2,6,6,3,3,'2026-03-05 06:50:35'),(3,6,8,3,15,'2026-03-05 06:50:35'),(4,7,7,6,7,'2026-03-05 10:15:59'),(5,7,6,6,8,'2026-03-05 10:15:59'),(6,8,7,6,3,'2026-03-05 10:19:36'),(7,8,6,6,2,'2026-03-05 10:19:36'),(8,9,6,6,10,'2026-03-05 10:21:23'),(9,9,7,6,10,'2026-03-05 10:21:23');
/*!40000 ALTER TABLE `chitiet_phanbokho` ENABLE KEYS */;
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
INSERT INTO `chitiethoadon` (`MaHD`, `MaSP`, `DonGia`, `SoLuong`, `GiamGia`) VALUES (20,1,115000.00,2,0.00),(21,1,115000.00,1,0.00),(22,1,115000.00,3,0.00),(23,1,115000.00,2,0.00),(28,1,115000.00,5,0.00),(32,1,115000.00,1,0.00),(35,1,115000.00,20,0.00),(37,1,115000.00,3,0.00),(39,1,115000.00,8,0.00),(43,1,115000.00,10,0.00),(25,2,95000.00,1,0.00),(35,2,95000.00,2,0.00),(39,2,95000.00,1,0.00),(51,3,60000.00,1,0.00),(46,4,55000.00,1,0.00),(49,4,55000.00,1,0.00),(24,5,135000.00,3,0.00),(31,5,135000.00,4,0.00),(34,5,135000.00,1,0.00),(43,5,135000.00,1,0.00),(44,5,135000.00,1,0.00),(48,6,105000.00,1,0.00),(26,7,145000.00,1,0.00),(37,7,145000.00,20,0.00),(45,7,145000.00,1,0.00),(47,7,145000.00,1,0.00),(30,8,175000.00,1,0.00),(38,8,175000.00,2,0.00),(43,8,175000.00,5,0.00),(27,9,95000.00,1,0.00),(42,9,95000.00,1,0.00),(29,10,85000.00,4,0.00),(32,10,85000.00,1,0.00),(41,10,85000.00,2,0.00),(28,11,125000.00,5,0.00),(36,11,125000.00,6,0.00),(40,11,125000.00,1,0.00),(33,12,88000.00,10,0.00),(29,13,98000.00,1,0.00),(26,15,195000.00,4,0.00),(30,15,195000.00,7,0.00),(41,15,195000.00,2,0.00),(50,50,88000.00,1,0.00);
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
INSERT INTO `chitietphieunhap` (`MaPN`, `MaSP`, `DonGiaNhap`, `SoLuong`) VALUES (5,2,65000.00,4),(1,3,50000.00,1),(2,4,35000.00,10),(2,5,90000.00,10),(2,6,70000.00,10),(6,6,70000.00,3),(7,6,70000.00,8),(8,6,84000.00,2),(9,6,100800.00,10),(2,7,100000.00,10),(7,7,100000.00,7),(8,7,120000.00,3),(9,7,144000.00,10),(6,8,120000.00,15),(2,17,58000.00,10),(3,59,88000.00,9),(4,59,105600.00,8),(3,96,95000.00,13);
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách chức năng hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chucnang`
--

LOCK TABLES `chucnang` WRITE;
/*!40000 ALTER TABLE `chucnang` DISABLE KEYS */;
INSERT INTO `chucnang` VALUES (1,'Quản lý hệ thống',NULL,NULL,'settings',1,1),(2,'Tài khoản',1,'/admin/users','users',1,1),(3,'Phân quyền',1,'/admin/roles','shield',2,1),(4,'Nhật ký hoạt động',1,'/admin/logs','file-text',3,1),(5,'Quản lý nhân sự',NULL,NULL,'user-check',2,1),(6,'Danh sách nhân viên',5,'/hr/employees','users',1,1),(7,'Chấm công',5,'/hr/attendance','clock',2,1),(8,'Phân ca làm việc',5,'/hr/schedule','calendar',3,1),(9,'Nghĩ Phép',5,'/hr/leave','clipboard',4,1),(10,'Tính Lương',5,'/hr/salary','dollar-sign',5,1),(11,'Thưởng phạt',5,'/hr/bonus-penalty','award',6,1),(12,'Nhà cung cấp',NULL,NULL,'package',3,1),(13,'Danh sách sản phẩm',12,'/warehouse/products','book',1,1),(14,'Nhà cung cấp',12,'/warehouse/suppliers','truck',2,1),(15,'Phiếu nhập',12,'/warehouse/import','arrow-down',3,1),(16,'Tồn kho',12,'/warehouse/stock','database',4,1),(17,'Kiểm kê',12,'/warehouse/inventory','check-square',5,1),(18,'Quản lý bán hàng',NULL,NULL,'shopping-cart',4,1),(19,'Bán hàng',18,'/sales/pos','credit-card',1,1),(20,'Quản lý hóa đơn',18,'/sales/invoices','file-text',2,1),(21,'Quản lý khách hàng',18,'/sales/customers','user',3,1),(22,'Trả hàng',18,'/sales/returns','rotate-ccw',4,1),(23,'Báo cáo thống kê',NULL,NULL,'bar-chart',5,1),(24,'Báo cáo doanh thu',23,'/reports/revenue','trending-up',1,1),(25,'Báo cáo lợi nhuận',23,'/reports/profit','pie-chart',2,1),(26,'Báo cáo tồn kho',23,'/reports/stock','package',3,1),(27,'Báo cáo nhân sự',23,'/reports/hr','users',4,1),(28,'Quản lý chi nhánh',NULL,'/admin/branches','home',28,1),(29,'Quản lý tác giả',NULL,'/admin/authors','user',29,1),(30,'Quản lý thể loại',NULL,'/admin/categories','list',30,1),(31,'Khuyến mãi',NULL,'/admin/khuyenmai','local_offer',31,1);
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
  `MaKhoNguon` int DEFAULT NULL COMMENT 'Kho con nguồn (kho_con.MaKho)',
  `MaKhoDich` int DEFAULT NULL COMMENT 'Kho con đích (kho_con.MaKho)',
  `MaSP` int NOT NULL,
  `SoLuong` int NOT NULL,
  `NgayChuyen` datetime DEFAULT CURRENT_TIMESTAMP,
  `NguoiChuyen` int DEFAULT NULL COMMENT 'Mã nhân viên',
  `NguoiNhan` int DEFAULT NULL,
  `NgayNhan` datetime DEFAULT NULL,
  `TrangThai` varchar(20) DEFAULT 'Cho_duyet' COMMENT 'Cho_duyet, Dang_chuyen, Da_nhan, Huy',
  `GhiChu` text,
  PRIMARY KEY (`MaCK`),
  KEY `MaSP` (`MaSP`),
  KEY `NguoiChuyen` (`NguoiChuyen`),
  KEY `NguoiNhan` (`NguoiNhan`),
  KEY `fk_ck_kho_nguon` (`MaKhoNguon`),
  KEY `fk_ck_kho_dich` (`MaKhoDich`),
  CONSTRAINT `chuyen_kho_ibfk_3` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`),
  CONSTRAINT `chuyen_kho_ibfk_4` FOREIGN KEY (`NguoiChuyen`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `chuyen_kho_ibfk_5` FOREIGN KEY (`NguoiNhan`) REFERENCES `nhanvien` (`MaNV`),
  CONSTRAINT `fk_ck_kho_dich` FOREIGN KEY (`MaKhoDich`) REFERENCES `kho_con` (`MaKho`),
  CONSTRAINT `fk_ck_kho_nguon` FOREIGN KEY (`MaKhoNguon`) REFERENCES `kho_con` (`MaKho`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chuyển hàng giữa các chi nhánh';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuyen_kho`
--

LOCK TABLES `chuyen_kho` WRITE;
/*!40000 ALTER TABLE `chuyen_kho` DISABLE KEYS */;
INSERT INTO `chuyen_kho` VALUES (1,1,2,3,1,'2026-02-02 09:16:14',2,NULL,'2026-02-25 19:17:59','Da_nhan',NULL),(2,1,2,4,1,'2026-02-02 09:16:14',2,NULL,NULL,'Cho_duyet',NULL),(3,1,2,1,2,'2026-03-04 19:31:43',2,2,'2026-03-04 22:48:59','Da_nhan',NULL),(4,1,2,2,1,'2026-03-04 19:31:43',2,2,'2026-03-05 15:40:08','Da_nhan',NULL),(5,1,2,3,1,'2026-03-04 19:31:43',2,2,'2026-03-05 15:40:23','Da_nhan',NULL),(6,1,2,4,1,'2026-03-04 19:31:43',2,2,'2026-03-04 22:39:13','Da_nhan',NULL),(7,1,2,1,12,'2026-03-05 06:24:23',2,2,'2026-03-05 06:24:42','Da_nhan',NULL),(8,1,2,2,1,'2026-03-05 06:24:23',2,1,'2026-03-05 07:27:41','Da_nhan',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Công nợ phải trả NCC';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cong_no_ncc`
--

LOCK TABLES `cong_no_ncc` WRITE;
/*!40000 ALTER TABLE `cong_no_ncc` DISABLE KEYS */;
INSERT INTO `cong_no_ncc` (`MaCongNo`, `MaNCC`, `MaPN`, `NgayPhatSinh`, `SoTienNo`, `SoTienDaTra`, `HanThanhToan`, `TrangThai`, `GhiChu`) VALUES (4,1,NULL,'2026-01-27 21:03:04',45000000.00,45000000.00,'2026-02-15','Da_thanh_toan','Batch #1 2024'),(5,2,NULL,'2026-01-27 21:03:04',12500000.00,12500000.00,'2024-01-20','Da_thanh_toan','Batch #2 2024'),(6,3,NULL,'2026-01-27 21:03:04',105000000.00,105000000.00,'2026-03-01','Da_thanh_toan','Batch #3 2024'),(7,1,1,'2026-01-28 13:59:43',50000.00,50000.00,NULL,'Da_thanh_toan',NULL),(8,1,2,'2026-02-24 14:07:31',3530000.00,3530000.00,NULL,'Da_thanh_toan',NULL),(9,3,3,'2026-02-24 14:08:46',2027000.00,2027000.00,NULL,'Da_thanh_toan',NULL),(10,2,4,'2026-02-24 14:09:20',844800.00,844800.00,NULL,'Da_thanh_toan',NULL),(11,1,5,'2026-03-05 06:32:42',260000.00,260000.00,NULL,'Da_thanh_toan',NULL),(12,3,6,'2026-03-05 06:50:35',2010000.00,2010000.00,NULL,'Da_thanh_toan',NULL),(13,1,7,'2026-03-05 10:15:59',1260000.00,1260000.00,NULL,'Da_thanh_toan',NULL),(14,1,8,'2026-03-05 10:19:36',528000.00,528000.00,NULL,'Da_thanh_toan',NULL),(15,1,9,'2026-03-05 10:21:23',2448000.00,2448000.00,NULL,'Da_thanh_toan',NULL);
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
  CONSTRAINT `hoadon_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  CONSTRAINT `hoadon_ibfk_2` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoadon`
--

LOCK TABLES `hoadon` WRITE;
/*!40000 ALTER TABLE `hoadon` DISABLE KEYS */;
INSERT INTO `hoadon` VALUES (20,1,1,1,'2026-01-28 16:41:17','Tai_quay',230000.00,0.00,0,0,230000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Hóa đơn mẫu POS 1',0,0.00),(21,NULL,1,1,'2026-01-28 16:41:17','Tai_quay',115000.00,0.00,0,0,115000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Hóa đơn mẫu POS 2',0,0.00),(22,1,1,1,'2026-01-28 16:41:17','Tai_quay',345000.00,0.00,0,0,345000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(23,1,3,1,'2025-11-02 09:15:00','Tai_quay',230000.00,0.00,0,0,230000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'KH thân thiết Q1',0,0.00),(24,2,3,1,'2025-11-05 14:20:00','Tai_quay',450000.00,0.00,0,0,450000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(25,NULL,3,1,'2025-11-10 18:00:00','Tai_quay',115000.00,0.00,0,0,115000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Khách vãng lai',0,0.00),(26,3,3,2,'2025-11-12 10:00:00','Tai_quay',850000.00,0.00,0,0,850000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Đơn hàng Q7',0,0.00),(27,NULL,3,2,'2025-11-15 16:30:00','Tai_quay',95000.00,0.00,0,0,95000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(28,4,3,3,'2025-11-20 11:45:00','Tai_quay',1200000.00,0.00,0,0,1200000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Đơn lớn Thủ Đức',0,0.00),(29,5,3,3,'2025-11-25 20:10:00','Tai_quay',345000.00,0.00,0,0,345000.00,'QR',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(30,1,3,1,'2025-12-01 10:00:00','Tai_quay',1500000.00,0.00,0,0,1500000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Quà tặng giáng sinh',0,0.00),(31,NULL,3,1,'2025-12-05 19:20:00','Tai_quay',550000.00,0.00,0,0,550000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(32,3,3,1,'2025-12-10 15:30:00','Tai_quay',215000.00,0.00,0,0,215000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(33,2,3,2,'2025-12-12 09:45:00','Tai_quay',880000.00,0.00,0,0,880000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(34,NULL,3,2,'2025-12-15 14:15:00','Tai_quay',135000.00,0.00,0,0,135000.00,'QR',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(35,NULL,3,2,'2025-12-20 18:50:00','Tai_quay',2500000.00,0.00,0,0,2500000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Mua sỉ',0,0.00),(36,4,3,3,'2025-12-22 11:00:00','Tai_quay',750000.00,0.00,0,0,750000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(37,5,3,3,'2025-12-24 16:30:00','Tai_quay',3200000.00,0.00,0,0,3200000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Tiệc Noel',0,0.00),(38,NULL,3,3,'2025-12-28 20:00:00','Tai_quay',445000.00,0.00,0,0,445000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(39,1,3,1,'2026-01-05 10:30:00','Tai_quay',950000.00,0.00,0,0,950000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(40,2,3,1,'2026-01-10 14:15:00','Tai_quay',125000.00,0.00,0,0,125000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(41,NULL,3,2,'2026-01-15 16:45:00','Tai_quay',580000.00,0.00,0,0,580000.00,'The',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(42,3,3,2,'2026-01-20 09:00:00','Tai_quay',95000.00,0.00,0,0,95000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(43,4,3,3,'2026-01-22 13:20:00','Tai_quay',2100000.00,0.00,0,0,2100000.00,'Chuyen_khoan',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,'Quà Tết',0,0.00),(44,5,3,3,'2026-01-25 18:30:00','Tai_quay',135000.00,0.00,0,0,135000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(45,NULL,3,1,'2026-02-09 17:33:10','Tai_quay',145000.00,0.00,1450,0,145000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(46,NULL,3,1,'2026-02-09 17:36:00','Tai_quay',55000.00,0.00,550,0,55000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(47,NULL,3,1,'2026-02-09 17:36:43','Tai_quay',145000.00,0.00,1450,0,145000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(48,NULL,3,1,'2026-02-09 17:37:55','Tai_quay',105000.00,10500.00,945,0,94500.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(49,NULL,3,1,'2026-02-09 17:40:50','Tai_quay',55000.00,0.00,550,0,55000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(50,NULL,3,1,'2026-03-03 08:56:25','Tai_quay',88000.00,0.00,880,0,88000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00),(51,NULL,3,1,'2026-03-05 15:38:50','Tai_quay',60000.00,0.00,600,0,60000.00,'Tien_mat',NULL,NULL,'Hoan_thanh',NULL,NULL,NULL,0.00,NULL,0,0.00);
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
-- Table structure for table `kho_con`
--

DROP TABLE IF EXISTS `kho_con`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kho_con` (
  `MaKho` int NOT NULL AUTO_INCREMENT,
  `MaCH` int DEFAULT NULL COMMENT 'Không dùng nữa - bỏ khái niệm cửa hàng',
  `TenKho` varchar(100) NOT NULL COMMENT 'VD: Kho 1, Kho Lạnh',
  `Capacity` int NOT NULL DEFAULT '10000' COMMENT 'Sức chứa tối đa (đơn vị sản phẩm)',
  `Priority` int NOT NULL DEFAULT '1' COMMENT 'Ưu tiên: nhỏ = được chọn trước',
  `ViTri` varchar(255) DEFAULT NULL COMMENT 'Mô tả vị trí vật lý trong kho',
  `TinhTrang` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Hoạt động, 0: Ngưng',
  `GhiChu` text,
  `NgayTao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaKho`),
  UNIQUE KEY `uq_name_global` (`TenKho`),
  KEY `idx_tinhtrang` (`TinhTrang`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Kho con trong mỗi cửa hàng — có capacity và priority';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kho_con`
--

LOCK TABLES `kho_con` WRITE;
/*!40000 ALTER TABLE `kho_con` DISABLE KEYS */;
INSERT INTO `kho_con` VALUES (1,1,'Kho 1',5000,1,'Tầng trệt, phía sau quầy',1,'Kho chính, ưu tiên nhập đầu tiên','2026-03-04 19:52:25'),(2,1,'Kho 2',3000,2,'Tầng 2',1,'Kho phụ, nhận hàng khi Kho 1 đầy','2026-03-04 19:52:25'),(3,2,'Kho 3',5000,1,'Tầng trệt',1,'Kho chính','2026-03-04 19:52:25'),(4,2,'Kho 4',3000,2,'Phía sau',1,'Kho phụ','2026-03-04 19:52:25'),(5,3,'Kho 5',5000,1,'Tầng trệt',1,'Kho chính','2026-03-04 19:52:25'),(6,3,'Kho 6',3000,2,'Phía sau',1,'Kho phụ','2026-03-04 19:52:25');
/*!40000 ALTER TABLE `kho_con` ENABLE KEYS */;
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
  KEY `fk_km_cuahang` (`MaCH`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bảng quản lý các chương trình khuyến mãi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khuyen_mai`
--

LOCK TABLES `khuyen_mai` WRITE;
/*!40000 ALTER TABLE `khuyen_mai` DISABLE KEYS */;
INSERT INTO `khuyen_mai` VALUES (1,'Giảm 10% cho đơn từ 500k','Áp dụng cho tất cả sản phẩm khi mua từ 500,000đ','giam_phan_tram',10.00,100000.00,500000.00,'2026-02-01 00:00:00','2026-12-31 23:59:59',NULL,NULL,'Tat_ca',NULL,1,0,NULL),(2,'Giảm 50k cho đơn từ 300k','Giảm trực tiếp 50,000đ cho đơn hàng từ 300,000đ','giam_tien',50000.00,50000.00,300000.00,'2026-02-01 00:00:00','2026-06-30 23:59:59',NULL,NULL,'Tat_ca',NULL,1,0,NULL),(3,'Giờ vàng giảm 15%','Giảm 15% tất cả sản phẩm từ 10h-12h hàng ngày','giam_gio_vang',15.00,150000.00,200000.00,'2026-02-01 00:00:00','2026-12-31 23:59:59','10:00-12:00',NULL,'Tat_ca',NULL,1,0,NULL),(4,'Cuối tuần giảm 12%','Giảm 12% vào Thứ 7 và Chủ nhật','giam_phan_tram',12.00,120000.00,250000.00,'2026-02-01 00:00:00','2026-12-31 23:59:59',NULL,'6,0','Tat_ca',NULL,1,0,NULL),(5,'Sale Tết Bính Ngọ 2026','Khuyến mãi đặc biệt dịp Tết Nguyên Đán','giam_phan_tram',20.00,200000.00,400000.00,'2026-01-25 00:00:00','2026-02-10 23:59:59',NULL,NULL,'Tat_ca',NULL,1,0,NULL),(6,'Sách văn học giảm 15%','Giảm 15% cho tất cả sách văn học','giam_phan_tram',15.00,100000.00,150000.00,'2026-02-01 00:00:00','2026-03-31 23:59:59',NULL,NULL,'The_loai',NULL,1,0,NULL),(7,'Sách kỹ năng giảm 10%','Giảm 10% cho sách kỹ năng sống','giam_phan_tram',10.00,80000.00,100000.00,'2026-02-01 00:00:00','2026-12-31 23:59:59',NULL,NULL,'The_loai',NULL,1,0,NULL),(11,'cvvc','xcxc','giam_tien',30000.00,10000.00,200000.00,'2026-02-27 00:00:00','2026-02-28 00:00:00','13',NULL,'Tat_ca',NULL,1,0,NULL),(12,'cvvc','xcxc','giam_tien',30000.00,10000.00,200000.00,'2026-02-27 00:00:00','2026-02-28 00:00:00','13',NULL,'Tat_ca',NULL,1,0,NULL);
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
  `MaCH` int DEFAULT NULL COMMENT 'Lưu MaKho của kho_con',
  `NgayKiemKe` date NOT NULL,
  `NguoiKiemKe` int NOT NULL,
  `TrangThai` varchar(20) DEFAULT 'Dang_kiem' COMMENT 'Dang_kiem, Hoan_thanh',
  `GhiChu` text,
  PRIMARY KEY (`MaKiemKe`),
  KEY `MaCH` (`MaCH`),
  KEY `NguoiKiemKe` (`NguoiKiemKe`),
  CONSTRAINT `kiem_ke_kho_ibfk_2` FOREIGN KEY (`NguoiKiemKe`) REFERENCES `nhanvien` (`MaNV`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kiem_ke_kho`
--

LOCK TABLES `kiem_ke_kho` WRITE;
/*!40000 ALTER TABLE `kiem_ke_kho` DISABLE KEYS */;
INSERT INTO `kiem_ke_kho` VALUES (1,1,'2026-03-04',2,'Dang_kiem',NULL),(2,1,'2026-03-04',2,'Dang_kiem',NULL),(3,1,'2026-03-05',1,'Dang_kiem',NULL);
/*!40000 ALTER TABLE `kiem_ke_kho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_cham_cong`
--

DROP TABLE IF EXISTS `lich_su_cham_cong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_cham_cong` (
  `MaLS` int NOT NULL AUTO_INCREMENT,
  `MaCC` int NOT NULL,
  `NguoiSua` int NOT NULL COMMENT 'Mã tài khoản người sửa',
  `NgaySua` datetime DEFAULT CURRENT_TIMESTAMP,
  `TruocKhi` json DEFAULT NULL COMMENT 'Dữ liệu trước khi sửa',
  `SauKhi` json DEFAULT NULL COMMENT 'Dữ liệu sau khi sửa',
  `LyDo` text COMMENT 'Lý do chỉnh sửa',
  `DiaChi_IP` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`MaLS`),
  KEY `idx_macc` (`MaCC`),
  KEY `idx_nguoisua` (`NguoiSua`),
  CONSTRAINT `lich_su_cham_cong_ibfk_1` FOREIGN KEY (`MaCC`) REFERENCES `cham_cong` (`MaCC`) ON DELETE CASCADE,
  CONSTRAINT `lich_su_cham_cong_ibfk_2` FOREIGN KEY (`NguoiSua`) REFERENCES `taikhoan` (`MaTK`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử chỉnh sửa chấm công';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_cham_cong`
--

LOCK TABLES `lich_su_cham_cong` WRITE;
/*!40000 ALTER TABLE `lich_su_cham_cong` DISABLE KEYS */;
/*!40000 ALTER TABLE `lich_su_cham_cong` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_tra_no_ncc`
--

LOCK TABLES `lich_su_tra_no_ncc` WRITE;
/*!40000 ALTER TABLE `lich_su_tra_no_ncc` DISABLE KEYS */;
INSERT INTO `lich_su_tra_no_ncc` VALUES (1,5,'2026-01-27 21:08:39',12500000.00,'Chuyen_khoan',2,'cv'),(2,6,'2026-02-23 08:08:58',50000000.00,'Tien_mat',2,'dfd'),(3,10,'2026-02-24 14:56:16',844800.00,'Chuyen_khoan',4,'Thanh toán cho phiếu PN-4'),(4,4,'2026-02-26 14:08:56',15000000.00,'Chuyen_khoan',2,'Thanh toán cho phiếu N/A'),(5,7,'2026-02-26 14:08:59',50000.00,'Chuyen_khoan',2,'Thanh toán cho phiếu PN-1'),(6,8,'2026-02-26 14:09:02',3530000.00,'Chuyen_khoan',2,'Thanh toán cho phiếu PN-2'),(7,9,'2026-02-26 14:09:06',2027000.00,'Chuyen_khoan',2,'Thanh toán cho phiếu PN-3'),(8,11,'2026-03-05 06:33:06',260000.00,'Chuyen_khoan',4,'ddf'),(9,12,'2026-03-05 06:50:44',2010000.00,'Chuyen_khoan',4,'fg'),(10,13,'2026-03-05 10:16:14',1260000.00,'Chuyen_khoan',1,'ccbvc'),(11,14,'2026-03-05 10:19:47',528000.00,'Chuyen_khoan',1,'Thanh toán cho phiếu PN-8'),(12,15,'2026-03-05 10:21:28',2448000.00,'Chuyen_khoan',1,'Thanh toán cho phiếu PN-9');
/*!40000 ALTER TABLE `lich_su_tra_no_ncc` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `luong`
--

LOCK TABLES `luong` WRITE;
/*!40000 ALTER TABLE `luong` DISABLE KEYS */;
INSERT INTO `luong` VALUES (1,1,11,2025,20000000.00,5000000.00,0.00,0.00,26,0.00,25000000.00,'Da_tra','2025-11-30 00:00:00',NULL),(2,2,11,2025,15000000.00,3000000.00,500000.00,0.00,26,0.00,18500000.00,'Da_tra','2025-11-30 00:00:00',NULL),(3,3,11,2025,8000000.00,1000000.00,200000.00,0.00,26,0.00,9200000.00,'Da_tra','2025-11-30 00:00:00',NULL),(4,4,11,2025,7500000.00,800000.00,0.00,0.00,26,0.00,8300000.00,'Da_tra','2025-11-30 00:00:00',NULL),(5,5,11,2025,12000000.00,2000000.00,0.00,0.00,26,0.00,14000000.00,'Da_tra','2025-11-30 00:00:00',NULL),(6,1,12,2025,20000000.00,5000000.00,2000000.00,0.00,27,0.00,27000000.00,'Da_tra','2025-12-31 00:00:00',NULL),(7,2,12,2025,15000000.00,3000000.00,1500000.00,0.00,27,0.00,19500000.00,'Da_tra','2025-12-31 00:00:00',NULL),(8,3,12,2025,8000000.00,1000000.00,1000000.00,0.00,27,0.00,10000000.00,'Da_tra','2025-12-31 00:00:00',NULL),(9,4,12,2025,7500000.00,800000.00,1000000.00,0.00,27,0.00,9300000.00,'Da_tra','2025-12-31 00:00:00',NULL),(10,5,12,2025,12000000.00,2000000.00,1500000.00,0.00,27,0.00,15500000.00,'Da_tra','2025-12-31 00:00:00',NULL),(11,1,1,2026,20000000.00,5000000.00,200000.00,0.00,28,0.00,30969231.00,'Da_chi_tra','2026-02-23 08:38:19',NULL),(12,2,1,2026,15000000.00,3000000.00,0.00,40000.00,28,0.00,22286923.00,'Da_chi_tra','2026-02-23 08:38:19',NULL),(13,3,1,2026,8000000.00,1000000.00,0.00,20000.00,25,0.00,9595385.00,'Da_chi_tra','2026-02-23 08:38:19',NULL),(14,4,1,2026,7500000.00,800000.00,0.00,0.00,5,0.00,3107692.00,'Da_chi_tra','2026-02-23 08:38:19',NULL),(15,5,1,2026,12000000.00,2000000.00,0.00,0.00,26,0.00,15384615.00,'Da_chi_tra','2026-02-23 08:38:19',NULL),(16,1,2,2025,20000000.00,5000000.00,0.00,0.00,0,NULL,5000000.00,'Chua_chi_tra','2026-03-05 19:44:28',NULL),(17,2,2,2025,15000000.00,3000000.00,0.00,0.00,0,NULL,3000000.00,'Chua_chi_tra','2026-03-05 19:44:28',NULL),(18,3,2,2025,8000000.00,1000000.00,0.00,0.00,0,NULL,1000000.00,'Chua_chi_tra','2026-03-05 19:44:28',NULL),(19,4,2,2025,7500000.00,800000.00,0.00,0.00,0,NULL,800000.00,'Chua_chi_tra','2026-03-05 19:44:28',NULL),(20,5,2,2025,12000000.00,2000000.00,0.00,0.00,0,NULL,2000000.00,'Chua_chi_tra','2026-03-05 19:44:28',NULL),(21,1,5,2025,20000000.00,5000000.00,0.00,0.00,0,NULL,5000000.00,'Chua_chi_tra','2026-03-05 19:44:30',NULL),(22,2,5,2025,15000000.00,3000000.00,0.00,0.00,0,NULL,3000000.00,'Chua_chi_tra','2026-03-05 19:44:30',NULL),(23,3,5,2025,8000000.00,1000000.00,0.00,0.00,0,NULL,1000000.00,'Chua_chi_tra','2026-03-05 19:44:30',NULL),(24,4,5,2025,7500000.00,800000.00,0.00,0.00,0,NULL,800000.00,'Chua_chi_tra','2026-03-05 19:44:30',NULL),(25,5,5,2025,12000000.00,2000000.00,0.00,0.00,0,NULL,2000000.00,'Chua_chi_tra','2026-03-05 19:44:30',NULL),(31,1,5,2026,20000000.00,5000000.00,0.00,0.00,1,NULL,5769231.00,'Chua_chi_tra','2026-03-05 19:45:59',NULL),(32,2,5,2026,15000000.00,3000000.00,0.00,0.00,1,NULL,3576923.00,'Chua_chi_tra','2026-03-05 19:45:59',NULL),(33,3,5,2026,8000000.00,1000000.00,0.00,0.00,1,NULL,1307692.00,'Chua_chi_tra','2026-03-05 19:45:59',NULL),(34,4,5,2026,7500000.00,800000.00,0.00,0.00,1,NULL,1088462.00,'Chua_chi_tra','2026-03-05 19:45:59',NULL),(35,5,5,2026,12000000.00,2000000.00,0.00,0.00,1,NULL,2461538.00,'Chua_chi_tra','2026-03-05 19:45:59',NULL),(41,1,3,2026,20000000.00,5000000.00,0.00,0.00,0,0.00,5000000.00,'Chua_chi_tra','2026-03-10 21:45:56',NULL),(42,2,3,2026,15000000.00,3000000.00,4555.00,0.00,0,0.00,3004555.00,'Chua_chi_tra','2026-03-10 21:45:56',NULL),(43,3,3,2026,8000000.00,1000000.00,0.00,0.00,0,0.00,1000000.00,'Chua_chi_tra','2026-03-10 21:45:56',NULL),(44,4,3,2026,7500000.00,800000.00,3333330033.00,0.00,0,0.00,3334130033.00,'Chua_chi_tra','2026-03-10 21:45:56',NULL),(45,5,3,2026,12000000.00,2000000.00,0.00,0.00,0,0.00,2000000.00,'Chua_chi_tra','2026-03-10 21:45:56',NULL);
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
-- Table structure for table `ngay_le`
--

DROP TABLE IF EXISTS `ngay_le`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ngay_le` (
  `MaNgayLe` int NOT NULL AUTO_INCREMENT,
  `TenNgayLe` varchar(100) NOT NULL,
  `Ngay` date NOT NULL,
  `HeSoLuong` decimal(3,2) DEFAULT '2.00' COMMENT 'Hệ số lương ngày lễ (2.0 = x2)',
  `LoaiNgayLe` varchar(50) DEFAULT 'Quoc_gia' COMMENT 'Quoc_gia, Tet, Khac',
  `GhiChu` text,
  PRIMARY KEY (`MaNgayLe`),
  UNIQUE KEY `unique_ngay_le` (`Ngay`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Danh sách ngày lễ và hệ số lương';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ngay_le`
--

LOCK TABLES `ngay_le` WRITE;
/*!40000 ALTER TABLE `ngay_le` DISABLE KEYS */;
INSERT INTO `ngay_le` VALUES (1,'Tết Dương lịch','2026-01-01',2.00,'Quoc_gia',NULL),(2,'Tết Nguyên Đán (29 Tết)','2026-01-28',2.00,'Tet',NULL),(3,'Tết Nguyên Đán (Mùng 1)','2026-01-29',3.00,'Tet',NULL),(4,'Tết Nguyên Đán (Mùng 2)','2026-01-30',2.50,'Tet',NULL),(5,'Tết Nguyên Đán (Mùng 3)','2026-01-31',2.00,'Tet',NULL),(6,'Giỗ Tổ Hùng Vương','2026-04-02',2.00,'Quoc_gia',NULL),(7,'Giải phóng Miền Nam','2026-04-30',2.00,'Quoc_gia',NULL),(8,'Quốc tế Lao động','2026-05-01',2.00,'Quoc_gia',NULL),(9,'Quốc khánh','2026-09-02',2.00,'Quoc_gia',NULL);
/*!40000 ALTER TABLE `ngay_le` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhacungcap`
--

LOCK TABLES `nhacungcap` WRITE;
/*!40000 ALTER TABLE `nhacungcap` DISABLE KEYS */;
INSERT INTO `nhacungcap` VALUES (1,'Công ty TNHH Sách Văn hóa','456 Lê Lợi, Quận 1, TP.HCM','0283456789','vanhoa@gmail.com','0123456789','Nguyễn Văn A',1),(2,'Công ty CP Sách Tri thức','789 Hai Bà Trưng, Hà Nội','0243567890','trithuc@gmail.com','0987654321','Trần Thị B',1),(3,'Nhà sách Phương Nam','234 Lý Thường Kiệt, Quận 10, TP.HCM','0283678901','phuongnam@gmail.com','0112233445','Lê Văn C',1),(4,'hhjjhj','hcm','0987654321',NULL,NULL,NULL,1);
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
  CONSTRAINT `nhanvien_ibfk_1` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Thông tin nhân viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhanvien`
--

LOCK TABLES `nhanvien` WRITE;
/*!40000 ALTER TABLE `nhanvien` DISABLE KEYS */;
INSERT INTO `nhanvien` VALUES (1,'Nguyễn Văn Admin','admin@bansach.vn','0901234567','123 Lê Lợi, Quận 1, TP.HCM','001088012345','1990-05-16','Nam','Giám đốc','2020-01-01',20000000.00,5000000.00,NULL,NULL,1,1,NULL,1,1),(2,'Trần Thị Lan',NULL,NULL,NULL,'001089123456','1992-08-20','Nữ','Quản lý cửa hàng','2020-02-01',15000000.00,3000000.00,NULL,NULL,2,1,'avatar-1772946326604-264056462.png',1,1),(3,'Lê Văn Hùng','thungan01@bansach.vn','0903456788','789 Lý Thường Kiệt, Quận 10, TP.HCM','001090234567','1995-03-10','Nam','Thu ngân','2021-03-15',8000000.00,1000000.00,NULL,NULL,3,1,'avatar-1772946421167-322285015.png',1,1),(4,'Phạm Thị Mai','kho01@bansach.vn','0904567890','234 Hai Bà Trưng, Quận 3, TP.HCM','001091345678','1993-11-25','Nữ','Nhân viên kho','2021-06-01',7500000.00,800000.00,NULL,NULL,4,1,NULL,1,1),(5,'Hoàng Văn Nam','hr01@bansach.vn','0905678901','567 Trần Hưng Đạo, Quận 1, TP.HCM','001092456789','1991-07-18','Nam','Nhân viên nhân sự','2020-08-01',12000000.00,2000000.00,NULL,NULL,5,1,NULL,1,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=408 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Lịch sử thao tác hệ thống';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhat_ky_hoat_dong`
--

LOCK TABLES `nhat_ky_hoat_dong` WRITE;
/*!40000 ALTER TABLE `nhat_ky_hoat_dong` DISABLE KEYS */;
INSERT INTO `nhat_ky_hoat_dong` VALUES (1,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:15:01','Sai mật khẩu'),(2,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:15:03','Sai mật khẩu'),(3,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:17:48','Sai mật khẩu'),(4,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:23:23',NULL),(5,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:23:50',NULL),(6,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:26:27',NULL),(7,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-23 19:27:55',NULL),(8,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:32:45',NULL),(9,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 19:41:07',NULL),(10,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:09:58',NULL),(11,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:23:02',NULL),(12,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-23 20:23:34',NULL),(13,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:31:52','Sai mật khẩu'),(14,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:34:00',NULL),(15,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:44:40',NULL),(16,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 20:53:22',NULL),(17,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-23 21:16:44',NULL),(18,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-23 21:24:33',NULL),(19,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-24 07:27:31',NULL),(20,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-24 07:31:28',NULL),(21,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-24 22:10:32',NULL),(22,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-24 22:10:35',NULL),(23,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-24 22:13:12',NULL),(24,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-24 22:14:01',NULL),(25,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-24 22:34:03',NULL),(26,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-25 09:20:41',NULL),(27,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-25 09:40:25',NULL),(28,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-25 09:48:10',NULL),(29,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-25 20:41:50',NULL),(30,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-25 20:50:05',NULL),(31,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 20:31:41',NULL),(32,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:32:32',NULL),(33,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-26 20:40:13',NULL),(34,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 20:41:06',NULL),(35,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:49:53',NULL),(36,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:55:38',NULL),(37,2,'Dang_nhap_that_bai','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:58:37','Sai mật khẩu'),(38,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 20:58:41',NULL),(39,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:03:42',NULL),(40,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:06:08',NULL),(41,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:08:35',NULL),(42,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-26 21:09:39',NULL),(43,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 21:10:56',NULL),(44,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 21:25:58',NULL),(45,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 21:26:15',NULL),(46,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:49:25',NULL),(47,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-26 21:55:12',NULL),(48,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:55:28',NULL),(49,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-26 21:55:50',NULL),(50,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-26 21:57:11',NULL),(51,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-27 09:02:39',NULL),(52,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-27 09:03:58',NULL),(53,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-27 09:04:15','Sai mật khẩu'),(54,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-27 09:04:20','Sai mật khẩu'),(55,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-27 09:04:24',NULL),(56,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-27 09:04:43',NULL),(57,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-27 19:46:25','Sai mật khẩu'),(58,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-27 19:46:29',NULL),(59,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-27 19:49:14',NULL),(60,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-27 19:49:47',NULL),(61,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-27 20:45:07',NULL),(62,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-27 21:07:13',NULL),(63,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-28 08:39:13',NULL),(64,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-28 08:40:33',NULL),(65,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-28 10:37:10',NULL),(66,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-28 13:24:51',NULL),(67,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-01-28 13:38:50',NULL),(68,4,'Them','phieunhap',1,NULL,'{\"MaNCC\":1,\"MaCH\":1,\"TongTien\":50000,\"ConNo\":50000}','::1','2026-01-28 13:59:43',NULL),(69,5,'Dang_nhap','taikhoan',5,NULL,NULL,'::1','2026-01-28 14:11:59',NULL),(70,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-28 14:22:30',NULL),(71,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-29 09:00:00',NULL),(72,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 09:30:53',NULL),(73,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 10:02:22',NULL),(74,2,'Them','cham_cong',2,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-01\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(75,2,'Them','cham_cong',3,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-20\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(76,2,'Them','cham_cong',5,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-17\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(77,2,'Them','cham_cong',6,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-16\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(78,2,'Them','cham_cong',4,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-19\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(79,2,'Them','cham_cong',7,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-15\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(80,2,'Them','cham_cong',8,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-14\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(81,2,'Them','cham_cong',10,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-12\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(82,2,'Them','cham_cong',9,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-13\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(83,2,'Them','cham_cong',11,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-21\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(84,2,'Them','cham_cong',13,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-23\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(85,2,'Them','cham_cong',12,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-22\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(86,2,'Them','cham_cong',14,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-24\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(87,2,'Them','cham_cong',15,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-26\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(88,2,'Them','cham_cong',16,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-27\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(89,2,'Them','cham_cong',17,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-28\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(90,2,'Them','cham_cong',19,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-29\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(91,2,'Them','cham_cong',18,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-02\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(92,2,'Them','cham_cong',20,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-30\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(93,2,'Them','cham_cong',24,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-07\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(94,2,'Them','cham_cong',21,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-31\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(95,2,'Them','cham_cong',22,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-03\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(96,2,'Them','cham_cong',23,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-05\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(97,2,'Them','cham_cong',25,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-06\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(98,2,'Them','cham_cong',26,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-08\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(99,2,'Them','cham_cong',28,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-10\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(100,2,'Them','cham_cong',27,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-01-09\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:02:42',NULL),(101,2,'Them','cham_cong',29,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-01\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(102,2,'Them','cham_cong',30,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-02\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(103,2,'Them','cham_cong',31,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-03\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(104,2,'Them','cham_cong',33,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-07\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(105,2,'Them','cham_cong',34,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-06\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(106,2,'Them','cham_cong',32,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-05\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(107,2,'Them','cham_cong',35,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-08\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(108,2,'Them','cham_cong',36,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-09\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(109,2,'Them','cham_cong',37,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-10\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(110,2,'Them','cham_cong',39,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-19\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(111,2,'Them','cham_cong',38,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-20\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(112,2,'Them','cham_cong',40,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-17\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:45',NULL),(113,2,'Them','cham_cong',41,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-16\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(114,2,'Them','cham_cong',42,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-15\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(115,2,'Them','cham_cong',45,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-12\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(116,2,'Them','cham_cong',43,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-14\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(117,2,'Them','cham_cong',44,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-13\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(118,2,'Them','cham_cong',46,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-21\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(119,2,'Them','cham_cong',47,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-22\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(120,2,'Them','cham_cong',48,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-31\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(121,2,'Them','cham_cong',52,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-27\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(122,2,'Them','cham_cong',49,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-23\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(123,2,'Them','cham_cong',50,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-24\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(124,2,'Them','cham_cong',51,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-26\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(125,2,'Them','cham_cong',53,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-29\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(126,2,'Them','cham_cong',54,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-01-30\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-01-29 10:07:46',NULL),(127,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 15:55:30',NULL),(128,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 2 | Cửa hàng 1: Thực tế 35 vs Hệ thống 35. Lý do: Không có'),(129,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 5 | Cửa hàng 1: Thực tế 60 vs Hệ thống 60. Lý do: Không có'),(130,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 3 | Cửa hàng 1: Thực tế 41 vs Hệ thống 41. Lý do: Không có'),(131,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 8 | Cửa hàng 1: Thực tế 45 vs Hệ thống 45. Lý do: Không có'),(132,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 4 | Cửa hàng 1: Thực tế 25 vs Hệ thống 25. Lý do: Không có'),(133,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 9 | Cửa hàng 1: Thực tế 55 vs Hệ thống 55. Lý do: Không có'),(134,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 7 | Cửa hàng 1: Thực tế 20 vs Hệ thống 20. Lý do: Không có'),(135,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 1 | Cửa hàng 1: Thực tế 50 vs Hệ thống 50. Lý do: Không có'),(136,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 6 | Cửa hàng 1: Thực tế 30 vs Hệ thống 30. Lý do: Không có'),(137,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-01-29 16:10:50','SP: 10 | Cửa hàng 1: Thực tế 30 vs Hệ thống 30. Lý do: Không có'),(138,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 16:28:08',NULL),(139,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-29 20:20:48',NULL),(140,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-31 07:49:50','Sai mật khẩu'),(141,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-01-31 07:49:54','Sai mật khẩu'),(142,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-01-31 07:52:34',NULL),(143,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-01-31 07:53:44',NULL),(144,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-01-31 08:44:00',NULL),(145,5,'Dang_nhap','taikhoan',5,NULL,NULL,'::1','2026-01-31 08:45:00',NULL),(146,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-02 08:22:28',NULL),(147,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-02 08:30:34',NULL),(148,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 2 | Cửa hàng 1: Thực tế 35 vs Hệ thống 35. Lý do: Không có'),(149,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 5 | Cửa hàng 1: Thực tế 60 vs Hệ thống 60. Lý do: Không có'),(150,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 3 | Cửa hàng 1: Thực tế 41 vs Hệ thống 41. Lý do: Không có'),(151,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 8 | Cửa hàng 1: Thực tế 45 vs Hệ thống 45. Lý do: Không có'),(152,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 4 | Cửa hàng 1: Thực tế 25 vs Hệ thống 25. Lý do: Không có'),(153,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 9 | Cửa hàng 1: Thực tế 55 vs Hệ thống 55. Lý do: Không có'),(154,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 7 | Cửa hàng 1: Thực tế 20 vs Hệ thống 20. Lý do: Không có'),(155,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 1 | Cửa hàng 1: Thực tế 50 vs Hệ thống 50. Lý do: Không có'),(156,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 6 | Cửa hàng 1: Thực tế 30 vs Hệ thống 30. Lý do: Không có'),(157,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-02 09:25:51','SP: 10 | Cửa hàng 1: Thực tế 30 vs Hệ thống 30. Lý do: Không có'),(158,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-02 21:16:59',NULL),(159,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-02 21:39:17',NULL),(160,3,'VoHieuHoa','khachhang',3,NULL,'{\"TinhTrang\":0}','::1','2026-02-02 22:18:56',NULL),(161,3,'VoHieuHoa','khachhang',2,NULL,'{\"TinhTrang\":0}','::1','2026-02-02 22:18:59',NULL),(162,3,'KichHoat','khachhang',2,NULL,'{\"TinhTrang\":1}','::1','2026-02-02 22:20:40',NULL),(163,3,'KichHoat','khachhang',3,NULL,'{\"TinhTrang\":1}','::1','2026-02-02 22:20:41',NULL),(164,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-03 09:21:33',NULL),(165,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-03 09:33:21',NULL),(166,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-03 09:34:29',NULL),(167,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-03 09:35:54',NULL),(168,5,'Dang_nhap','taikhoan',5,NULL,NULL,'::1','2026-02-04 12:13:38',NULL),(169,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-04 12:15:15',NULL),(170,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-04 12:37:24',NULL),(171,2,'Them','cham_cong',71,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-04\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(172,2,'Them','cham_cong',72,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-05\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(173,2,'Them','cham_cong',73,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-06\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(174,2,'Them','cham_cong',74,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-07\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(175,2,'Them','cham_cong',75,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-09\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(176,2,'Them','cham_cong',76,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-17\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(177,2,'Them','cham_cong',77,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-10\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(178,2,'Them','cham_cong',78,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-20\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(179,2,'Them','cham_cong',79,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-19\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(180,2,'Them','cham_cong',80,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-18\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(181,2,'Them','cham_cong',81,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-16\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(182,2,'Them','cham_cong',82,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-14\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(183,2,'Them','cham_cong',83,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-13\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(184,2,'Them','cham_cong',84,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-12\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(185,2,'Them','cham_cong',85,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-11\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(186,2,'Them','cham_cong',86,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-21\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(187,2,'Them','cham_cong',87,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-23\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(188,2,'Them','cham_cong',88,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-24\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(189,2,'Them','cham_cong',89,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-25\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(190,2,'Them','cham_cong',90,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-26\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(191,2,'Them','cham_cong',92,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-28\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(192,2,'Them','cham_cong',91,NULL,'{\"MaNV\":2,\"Ngay\":\"2026-02-27\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-04 12:38:46',NULL),(193,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-09 17:22:14',NULL),(194,2,'CheckOut','cham_cong',75,NULL,'{\"GioRa\":\"17:26:38\",\"SoGioLam\":\"8.43\",\"TrangThai\":\"Di_lam\"}','::1','2026-02-09 17:26:38',NULL),(195,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-09 17:27:25',NULL),(196,3,'Them','hoadon',45,NULL,'{\"MaKH\":null,\"TongThanhToan\":145000}','::1','2026-02-09 17:33:10',NULL),(197,3,'Them','hoadon',46,NULL,'{\"MaKH\":null,\"TongThanhToan\":55000}','::1','2026-02-09 17:36:00',NULL),(198,3,'Them','hoadon',47,NULL,'{\"MaKH\":null,\"TongThanhToan\":145000}','::1','2026-02-09 17:36:43',NULL),(199,3,'Them','hoadon',48,NULL,'{\"MaKH\":null,\"TongThanhToan\":94500}','::1','2026-02-09 17:37:55',NULL),(200,3,'Them','hoadon',49,NULL,'{\"MaKH\":null,\"TongThanhToan\":55000}','::1','2026-02-09 17:40:50',NULL),(201,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-23 08:07:49',NULL),(202,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-23 08:26:26',NULL),(203,2,'Them','cham_cong',93,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-03\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:48',NULL),(204,2,'Them','cham_cong',94,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-02\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:48',NULL),(205,2,'Them','cham_cong',96,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-08\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:48',NULL),(206,2,'Them','cham_cong',95,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-07\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:48',NULL),(207,2,'Them','cham_cong',97,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-06\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:48',NULL),(208,2,'Them','cham_cong',98,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-05\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:48',NULL),(209,2,'Them','cham_cong',99,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-10\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(210,2,'Them','cham_cong',100,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-20\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(211,2,'Them','cham_cong',101,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-09\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(212,2,'Them','cham_cong',102,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-19\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(213,2,'Them','cham_cong',103,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-17\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(214,2,'Them','cham_cong',104,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-16\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(215,2,'Them','cham_cong',105,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-12\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(216,2,'Them','cham_cong',106,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-15\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(217,2,'Them','cham_cong',107,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-26\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(218,2,'Them','cham_cong',108,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-24\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(219,2,'Them','cham_cong',109,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-13\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(220,2,'Them','cham_cong',110,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-21\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(221,2,'Them','cham_cong',111,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-22\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(222,2,'Them','cham_cong',112,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-23\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(223,2,'Them','cham_cong',113,NULL,'{\"MaNV\":5,\"Ngay\":\"2026-01-14\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:28:49',NULL),(224,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-23 08:29:39',NULL),(225,2,'Them','cham_cong',114,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-03\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(226,2,'Them','cham_cong',115,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-06\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(227,2,'Them','cham_cong',116,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-10\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(228,2,'Them','cham_cong',118,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-19\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(229,2,'Them','cham_cong',117,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-20\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(230,2,'Them','cham_cong',119,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-07\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(231,2,'Them','cham_cong',120,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-17\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(232,2,'Them','cham_cong',123,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-14\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(233,2,'Them','cham_cong',124,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-13\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(234,2,'Them','cham_cong',121,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-16\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(235,2,'Them','cham_cong',122,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-15\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(236,2,'Them','cham_cong',125,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-12\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(237,2,'Them','cham_cong',126,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-21\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(238,2,'Them','cham_cong',127,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-22\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(239,2,'Them','cham_cong',128,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-24\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(240,2,'Them','cham_cong',130,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-23\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(241,2,'Them','cham_cong',129,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-05\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(242,2,'Them','cham_cong',131,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-02\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(243,2,'Them','cham_cong',132,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-08\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(244,2,'Them','cham_cong',133,NULL,'{\"MaNV\":3,\"Ngay\":\"2026-01-09\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-23 08:30:32',NULL),(245,2,'CheckOut','cham_cong',87,NULL,'{\"GioRa\":\"15:38:42\",\"SoGioLam\":\"6.63\",\"TrangThai\":\"Di_lam\"}','::1','2026-02-23 15:38:42',NULL),(246,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-24 13:24:41',NULL),(247,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-24 14:05:52',NULL),(248,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-02-24 14:06:16',NULL),(249,4,'Them','phieunhap',2,NULL,'{\"MaNCC\":1,\"MaCH\":2,\"TongTien\":3530000,\"ConNo\":3530000}','::1','2026-02-24 14:07:31',NULL),(250,4,'Them','phieunhap',3,NULL,'{\"MaNCC\":3,\"MaCH\":2,\"TongTien\":2027000,\"ConNo\":2027000}','::1','2026-02-24 14:08:46',NULL),(251,4,'Them','phieunhap',4,NULL,'{\"MaNCC\":2,\"MaCH\":1,\"TongTien\":844800,\"ConNo\":844800}','::1','2026-02-24 14:09:20',NULL),(252,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-25 11:34:43',NULL),(253,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-25 19:17:46',NULL),(254,2,'CheckOut','cham_cong',89,NULL,'{\"GioRa\":\"19:18:44\",\"SoGioLam\":\"10.30\",\"TrangThai\":\"Di_lam\"}','::1','2026-02-25 19:18:44',NULL),(255,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-26 14:01:59',NULL),(256,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-26 14:19:14',NULL),(257,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-27 19:19:09',NULL),(258,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 95 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(259,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 66 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(260,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 76 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(261,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 77 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(262,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 41 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(263,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 31 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(264,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 86 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(265,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 24 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(266,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 13 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(267,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 16 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(268,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 2 | Cửa hàng 2: Thực tế 85 vs Hệ thống 85. Lý do: Không có'),(269,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 5 | Cửa hàng 2: Thực tế 110 vs Hệ thống 110. Lý do: Không có'),(270,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 51 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(271,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 3 | Cửa hàng 2: Thực tế 61 vs Hệ thống 61. Lý do: Không có'),(272,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 75 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(273,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 82 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(274,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 81 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(275,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 71 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(276,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 70 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(277,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 69 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(278,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 68 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(279,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 62 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(280,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 21 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(281,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 11 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(282,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 23 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(283,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 52 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(284,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 80 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(285,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 27 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(286,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 65 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(287,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 32 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(288,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 20 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(289,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 8 | Cửa hàng 2: Thực tế 95 vs Hệ thống 95. Lý do: Không có'),(290,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 87 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(291,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 78 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(292,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 73 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(293,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 74 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(294,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 79 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(295,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 39 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(296,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 96 | Cửa hàng 2: Thực tế 73 vs Hệ thống 73. Lý do: Không có'),(297,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 4 | Cửa hàng 2: Thực tế 70 vs Hệ thống 70. Lý do: Không có'),(298,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 91 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(299,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 17 | Cửa hàng 2: Thực tế 70 vs Hệ thống 70. Lý do: Không có'),(300,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 60 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(301,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 49 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(302,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 88 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(303,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 25 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(304,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 9 | Cửa hàng 2: Thực tế 90 vs Hệ thống 90. Lý do: Không có'),(305,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 84 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(306,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 67 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(307,2,'Kiem_Ke','ton_kho',NULL,NULL,NULL,'::1','2026-02-27 19:23:29','SP: 57 | Cửa hàng 2: Thực tế 40 vs Hệ thống 40. Lý do: Không có'),(308,2,'Them','cham_cong',143,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-06\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(309,2,'Them','cham_cong',139,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-19\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(310,2,'Them','cham_cong',138,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-04\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(311,2,'Them','cham_cong',142,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-07\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(312,2,'Them','cham_cong',140,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-02\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(313,2,'Them','cham_cong',141,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-05\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(314,2,'Them','cham_cong',144,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-09\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(315,2,'Them','cham_cong',146,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-10\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(316,2,'Them','cham_cong',147,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-20\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(317,2,'Them','cham_cong',148,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-17\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(318,2,'Them','cham_cong',145,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-18\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(319,2,'Them','cham_cong',149,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-16\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(320,2,'Them','cham_cong',150,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-26\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(321,2,'Them','cham_cong',151,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-25\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(322,2,'Them','cham_cong',153,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-21\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(323,2,'Them','cham_cong',152,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-23\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(324,2,'Them','cham_cong',154,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-27\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(325,2,'Them','cham_cong',155,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-28\",\"MaCa\":1}','::1','2026-02-27 19:25:09',NULL),(326,2,'Them','cham_cong',156,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-12\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:32',NULL),(327,2,'Them','cham_cong',157,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-13\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:32',NULL),(328,2,'Them','cham_cong',159,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-14\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:32',NULL),(329,2,'Them','cham_cong',158,NULL,'{\"MaNV\":1,\"Ngay\":\"2026-02-11\",\"GioVao\":\"08:00:00\",\"MaCa\":1}','::1','2026-02-27 19:25:32',NULL),(330,2,'CheckOut','cham_cong',91,NULL,'{\"GioRa\":\"19:25:42\",\"SoGioLam\":\"10.42\",\"TrangThai\":\"Di_lam\"}','::1','2026-02-27 19:25:42',NULL),(331,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-02-27 19:26:58',NULL),(332,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-02-27 19:27:39',NULL),(333,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-02-27 19:27:58',NULL),(334,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 19:29:14',NULL),(335,5,'Dang_nhap','taikhoan',5,NULL,NULL,'::1','2026-02-27 19:29:50',NULL),(336,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 19:43:24',NULL),(337,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-02-27 19:53:03','Sai mật khẩu'),(338,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-02-27 19:53:06','Sai mật khẩu'),(339,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-02-27 19:53:13','Sai mật khẩu'),(340,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-02-27 19:55:49','Sai mật khẩu'),(341,1,'Dang_nhap_that_bai','taikhoan',1,NULL,NULL,'::1','2026-02-27 19:55:58','Sai mật khẩu'),(342,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 20:00:33',NULL),(343,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 20:06:26',NULL),(344,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 20:08:21',NULL),(345,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 20:15:24',NULL),(346,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 20:20:08',NULL),(347,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-02-27 20:27:33',NULL),(348,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 20:31:46',NULL),(349,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 20:32:35',NULL),(350,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 20:41:32',NULL),(351,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 20:50:07',NULL),(352,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-02-27 21:19:40',NULL),(353,1,'Them','khuyen_mai',12,NULL,NULL,'::1','2026-02-27 21:26:50','Tạo chương trình khuyến mãi: cvvc'),(354,1,'Xoa','khuyen_mai',10,NULL,NULL,'::1','2026-02-27 21:27:48','Xóa chương trình khuyến mãi'),(355,1,'Sua','khuyen_mai',9,NULL,NULL,'::1','2026-02-27 21:29:16','Cập nhật khuyến mãi: Trung thu sách hay '),(356,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-01 18:23:13',NULL),(357,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-03-01 19:03:21',NULL),(358,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-03-02 18:28:34',NULL),(359,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-03-03 08:44:57',NULL),(360,3,'Them','hoadon',50,NULL,'{\"MaKH\":null,\"TongThanhToan\":88000}','::1','2026-03-03 08:56:25',NULL),(361,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-04 15:13:11',NULL),(362,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-03-04 15:16:34',NULL),(363,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-04 19:27:28',NULL),(364,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-04 20:07:05',NULL),(365,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-04 22:35:43',NULL),(366,2,'Sua','sanpham',5,'\"{\\\"MaSP\\\":5,\\\"TenSP\\\":\\\"Đắc Nhân Tâm\\\",\\\"MoTa\\\":\\\"Sách kỹ năng giao tiếp và ứng xử\\\",\\\"DonGia\\\":\\\"108000.00\\\",\\\"GiaNhap\\\":\\\"90000.00\\\",\\\"HinhAnh\\\":\\\"/uploads/images/Cho_toi_tro_ve_tuoi_Tho.jpg\\\",\\\"MaTL\\\":4,\\\"MaTG\\\":4,\\\"MaNXB\\\":1,\\\"NamXB\\\":2022,\\\"SoTrang\\\":320,\\\"TrongLuong\\\":null,\\\"KichThuoc\\\":null,\\\"ISBN\\\":\\\"978-604-1-00001-1\\\",\\\"TinhTrang\\\":1,\\\"NgayTao\\\":\\\"2026-01-23T02:50:57.000Z\\\",\\\"MinSoLuong\\\":0}\"',NULL,'::1','2026-03-04 22:45:46',NULL),(367,2,'Sua','sanpham',5,'\"{\\\"MaSP\\\":5,\\\"TenSP\\\":\\\"Đắc Nhân Tâm\\\",\\\"MoTa\\\":\\\"Sách kỹ năng giao tiếp và ứng xử\\\",\\\"DonGia\\\":\\\"108000.00\\\",\\\"GiaNhap\\\":\\\"90000.00\\\",\\\"HinhAnh\\\":\\\"/uploads/images/Cho_toi_tro_ve_tuoi_Tho.jpg\\\",\\\"MaTL\\\":4,\\\"MaTG\\\":4,\\\"MaNXB\\\":1,\\\"NamXB\\\":2022,\\\"SoTrang\\\":320,\\\"TrongLuong\\\":\\\"200.00\\\",\\\"KichThuoc\\\":\\\"null\\\",\\\"ISBN\\\":null,\\\"TinhTrang\\\":1,\\\"NgayTao\\\":\\\"2026-01-23T02:50:57.000Z\\\",\\\"MinSoLuong\\\":0}\"',NULL,'::1','2026-03-04 22:46:00',NULL),(368,2,'Sua','sanpham',1,'\"{\\\"MaSP\\\":1,\\\"TenSP\\\":\\\"Tôi Thấy Hoa Vàng Trên Cỏ Xanh\\\",\\\"MoTa\\\":\\\"Truyện dài của Nguyễn Nhật Ánh về tuổi thơ miền Trung\\\",\\\"DonGia\\\":\\\"0.00\\\",\\\"GiaNhap\\\":\\\"80000.00\\\",\\\"HinhAnh\\\":\\\"/uploads/images/Toi_Thay_Hoa_Vang_Tren_Co_Xanh.jpg\\\",\\\"MaTL\\\":1,\\\"MaTG\\\":1,\\\"MaNXB\\\":1,\\\"NamXB\\\":2022,\\\"SoTrang\\\":368,\\\"TrongLuong\\\":null,\\\"KichThuoc\\\":null,\\\"ISBN\\\":\\\"978-604-1-00000-1\\\",\\\"TinhTrang\\\":1,\\\"NgayTao\\\":\\\"2026-01-23T02:50:57.000Z\\\",\\\"MinSoLuong\\\":9}\"',NULL,'::1','2026-03-04 22:48:48',NULL),(369,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-05 06:22:57',NULL),(370,4,'Dang_nhap','taikhoan',4,NULL,NULL,'::1','2026-03-05 06:27:19',NULL),(371,4,'Them','phieunhap',5,NULL,'\"{\\\"MaNCC\\\":1,\\\"MaCH\\\":2,\\\"TongTien\\\":260000,\\\"ConNo\\\":260000}\"','::1','2026-03-05 06:32:42',NULL),(372,4,'Them','phieunhap',6,NULL,'\"{\\\"MaNCC\\\":3,\\\"MaCH\\\":2,\\\"TongTien\\\":2010000,\\\"ConNo\\\":2010000}\"','::1','2026-03-05 06:50:35',NULL),(373,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-03-05 07:00:31',NULL),(374,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-03-05 07:07:38',NULL),(375,1,'Xoa','khuyen_mai',9,NULL,NULL,'::1','2026-03-05 07:17:33','Xóa chương trình khuyến mãi'),(376,1,'Xoa','khuyen_mai',8,NULL,NULL,'::1','2026-03-05 07:17:39','Xóa chương trình khuyến mãi'),(377,1,'Them','nhacungcap',4,NULL,'{\"TenNCC\":\"hhjjhj\",\"SDT\":\"0987654321\"}','::1','2026-03-05 07:44:11',NULL),(378,1,'Them','phieunhap',7,NULL,'\"{\\\"MaNCC\\\":1,\\\"MaCH\\\":6,\\\"TongTien\\\":1260000,\\\"ConNo\\\":1260000}\"','::1','2026-03-05 10:15:59',NULL),(379,1,'Them','phieunhap',8,NULL,'\"{\\\"MaNCC\\\":1,\\\"MaCH\\\":6,\\\"TongTien\\\":528000,\\\"ConNo\\\":528000}\"','::1','2026-03-05 10:19:36',NULL),(380,1,'Them','phieunhap',9,NULL,'\"{\\\"MaNCC\\\":1,\\\"MaCH\\\":6,\\\"TongTien\\\":2448000,\\\"ConNo\\\":2448000}\"','::1','2026-03-05 10:21:23',NULL),(381,1,'Dang_xuat','taikhoan',1,NULL,NULL,'::1','2026-03-05 14:56:24',NULL),(382,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-03-05 14:56:35',NULL),(383,3,'Them','hoadon',51,NULL,'{\"MaKH\":null,\"TongThanhToan\":60000}','::1','2026-03-05 15:38:50',NULL),(384,3,'Dang_xuat','taikhoan',3,NULL,NULL,'::1','2026-03-05 15:39:18',NULL),(385,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-05 15:39:34',NULL),(386,2,'Dang_xuat','taikhoan',2,NULL,NULL,'::1','2026-03-05 19:29:20',NULL),(387,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-05 19:29:34',NULL),(388,2,'Dang_xuat','taikhoan',2,NULL,NULL,'::1','2026-03-05 19:29:40',NULL),(389,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-03-05 19:29:54',NULL),(390,1,'Dang_xuat','taikhoan',1,NULL,NULL,'::1','2026-03-05 19:30:54',NULL),(391,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-03-05 19:31:09',NULL),(392,1,'Dang_xuat','taikhoan',1,NULL,NULL,'::1','2026-03-05 19:31:23',NULL),(393,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-05 19:31:32',NULL),(394,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-08 12:01:08',NULL),(395,2,'Dang_xuat','taikhoan',2,NULL,NULL,'::1','2026-03-08 12:03:26',NULL),(396,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-08 12:03:37',NULL),(397,2,'Dang_xuat','taikhoan',2,NULL,NULL,'::1','2026-03-08 12:05:52',NULL),(398,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-03-08 12:06:06',NULL),(399,3,'Dang_xuat','taikhoan',3,NULL,NULL,'::1','2026-03-08 12:08:01',NULL),(400,1,'Dang_nhap','taikhoan',1,NULL,NULL,'::1','2026-03-08 12:16:12',NULL),(401,1,'Dang_xuat','taikhoan',1,NULL,NULL,'::1','2026-03-08 12:17:03',NULL),(402,3,'Dang_nhap_that_bai','taikhoan',3,NULL,NULL,'::1','2026-03-08 12:17:16','Sai mật khẩu'),(403,3,'Dang_nhap','taikhoan',3,NULL,NULL,'::1','2026-03-08 12:17:18',NULL),(404,3,'Dang_xuat','taikhoan',3,NULL,NULL,'::1','2026-03-08 12:30:33',NULL),(405,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-10 21:10:35',NULL),(406,2,'Dang_xuat','taikhoan',2,NULL,NULL,'::1','2026-03-10 23:07:02',NULL),(407,2,'Dang_nhap','taikhoan',2,NULL,NULL,'::1','2026-03-10 23:07:42',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=314 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Phân quyền CRUD chi tiết';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phanquyen_chitiet`
--

LOCK TABLES `phanquyen_chitiet` WRITE;
/*!40000 ALTER TABLE `phanquyen_chitiet` DISABLE KEYS */;
INSERT INTO `phanquyen_chitiet` VALUES (213,1,2,1,1,1,1,1,1),(214,1,3,1,1,1,1,1,1),(215,1,4,1,1,1,1,1,1),(301,1,12,1,1,1,1,1,1),(295,1,13,1,1,1,1,1,1),(302,1,14,1,1,1,1,1,1),(303,1,15,1,1,1,1,1,1),(304,1,16,1,1,1,1,1,1),(305,1,17,1,1,1,1,1,1),(312,1,24,1,1,1,1,1,1),(286,1,28,1,1,1,1,1,1),(287,1,29,1,1,1,1,1,1),(288,1,30,1,1,1,1,1,1),(308,1,31,1,1,1,1,1,1),(253,2,1,1,1,1,1,1,1),(254,2,5,1,1,1,1,1,1),(260,2,6,1,1,1,1,1,1),(261,2,7,1,1,1,1,1,1),(262,2,8,1,1,1,1,1,1),(263,2,9,1,1,1,1,1,1),(264,2,10,1,1,1,1,1,1),(265,2,11,1,1,1,1,1,1),(255,2,12,1,1,1,1,1,1),(266,2,13,1,1,1,1,1,1),(267,2,14,1,1,1,1,1,1),(268,2,16,1,1,1,1,1,1),(269,2,17,1,1,1,1,1,1),(256,2,18,1,1,1,1,1,1),(270,2,20,1,1,1,1,1,1),(271,2,22,1,1,1,1,1,1),(257,2,23,1,1,1,1,1,1),(272,2,24,1,1,1,1,1,1),(273,2,25,1,1,1,1,1,1),(274,2,26,1,1,1,1,1,1),(275,2,27,1,1,1,1,1,1),(290,2,28,1,0,0,0,0,0),(297,3,13,1,0,0,0,0,0),(216,3,19,1,1,1,1,1,1),(217,3,21,1,1,1,1,1,1),(291,3,28,1,0,0,0,0,0),(298,4,13,1,1,0,0,0,0),(306,4,14,1,1,0,0,0,0),(219,4,15,1,1,1,1,1,1),(307,4,16,1,1,0,0,0,0),(292,4,28,1,1,0,0,0,0),(56,5,6,1,1,1,1,1,1),(57,5,7,1,1,1,1,1,1),(58,5,9,1,1,1,1,1,1),(59,5,10,1,1,1,1,1,1),(299,5,13,1,0,0,0,0,0),(293,5,28,1,0,0,0,0,0),(60,6,12,1,0,0,0,1,0),(300,6,13,1,0,0,0,0,0),(61,6,20,1,0,0,0,1,0),(62,6,23,1,0,0,0,1,0),(63,6,24,1,0,0,0,1,0),(64,6,25,1,0,0,0,1,0),(65,6,26,1,0,0,0,1,0),(294,6,28,1,0,0,0,0,0);
/*!40000 ALTER TABLE `phanquyen_chitiet` ENABLE KEYS */;
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
  `MaCH` int DEFAULT NULL COMMENT 'Lưu MaKho của kho_con',
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
  CONSTRAINT `phieunhap_ibfk_3` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieunhap`
--

LOCK TABLES `phieunhap` WRITE;
/*!40000 ALTER TABLE `phieunhap` DISABLE KEYS */;
INSERT INTO `phieunhap` VALUES (1,1,1,4,'2026-01-28 13:59:42',50000.00,0.00,50000.00,'Hoan_thanh','xc'),(2,1,2,4,'2026-02-24 14:07:31',3530000.00,0.00,3530000.00,'Hoan_thanh',NULL),(3,3,2,4,'2026-02-24 14:08:46',2027000.00,0.00,2027000.00,'Hoan_thanh',NULL),(4,2,1,4,'2026-02-24 14:09:20',844800.00,0.00,844800.00,'Hoan_thanh','j'),(5,1,2,4,'2026-03-05 06:32:42',260000.00,0.00,260000.00,'Hoan_thanh','ddf'),(6,3,2,4,'2026-03-05 06:50:35',2010000.00,0.00,2010000.00,'Hoan_thanh',NULL),(7,1,6,1,'2026-03-05 10:15:59',1260000.00,0.00,1260000.00,'Hoan_thanh','đfdfd'),(8,1,6,1,'2026-03-05 10:19:36',528000.00,0.00,528000.00,'Hoan_thanh','dvvc'),(9,1,6,1,'2026-03-05 10:21:23',2448000.00,0.00,2448000.00,'Hoan_thanh','sdfghgg');
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
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sanpham`
--

LOCK TABLES `sanpham` WRITE;
/*!40000 ALTER TABLE `sanpham` DISABLE KEYS */;
INSERT INTO `sanpham` VALUES (1,'Tôi Thấy Hoa Vàng Trên Cỏ Xanh','Truyện dài của Nguyễn Nhật Ánh về tuổi thơ miền Trung',0.00,80000.00,'/uploads/images/Toi_Thay_Hoa_Vang_Tren_Co_Xanh.jpg',1,1,1,2022,368,100.00,'13x19 cm',NULL,1,'2026-01-23 09:50:57',9),(2,'Cho Tôi Xin Một Vé Đi Tuổi Thơ','Tác phẩm văn học về ký ức tuổi thơ',91000.00,65000.00,'/uploads/images/Nha_Gia_Kim.jpg',1,4,1,2021,280,NULL,NULL,'978-604-1-00000-2',1,'2026-01-23 09:50:57',0),(3,'Dế Mèn Phiêu Lưu Ký','Tác phẩm kinh điển của văn học thiếu nhi VN',60000.00,50000.00,'/uploads/images/Dac_Nhan_Tam.jpg',5,2,4,2020,196,NULL,NULL,'978-604-2-00000-1',1,'2026-01-23 09:50:57',0),(4,'Lão Hạc','Truyện ngắn nổi tiếng của Nam Cao',42000.00,35000.00,'/uploads/images/Harry_Potter_va_Hon_Đa_Phu_Thuy.jpg',1,3,3,2023,120,NULL,NULL,'978-604-3-00000-1',1,'2026-01-23 09:50:57',0),(5,'Đắc Nhân Tâm','Sách kỹ năng giao tiếp và ứng xử',108000.00,90000.00,'/uploads/images/Cho_toi_tro_ve_tuoi_Tho.jpg',4,4,1,2022,320,200.00,'null',NULL,1,'2026-01-23 09:50:57',10),(6,'Trên Đường Băng','Kỹ năng sống của Tony Buổi Sáng',120960.00,100800.00,'/uploads/images/Rung_Na_Uy.jpg',4,5,4,2021,256,NULL,NULL,'978-604-4-00000-1',1,'2026-01-23 09:50:57',0),(7,'Rừng Na Uy','Tiểu thuyết của Haruki Murakami',172800.00,144000.00,'/uploads/images/De_Men_Thieu_luu_ky.jpg',2,6,3,2023,448,NULL,NULL,'978-604-3-00001-1',1,'2026-01-23 09:50:57',0),(8,'Harry Potter và Hòn Đá Phù Thủy','Tập 1 series Harry Potter',156000.00,120000.00,'/uploads/images/Lao_Hac.jpg',2,7,1,2022,368,NULL,NULL,'978-604-1-00002-1',1,'2026-01-23 09:50:57',0),(9,'Nhà Giả Kim','Tác phẩm nổi tiếng của Paulo Coelho',95000.00,60000.00,'/uploads/images/Truyen_Kieu.jpg',2,8,3,2021,227,NULL,NULL,'978-604-3-00002-1',1,'2026-01-23 09:50:57',0),(10,'Truyện Kiều','Tác phẩm kinh điển của Nguyễn Du',85000.00,55000.00,'/uploads/images/Đuong_Xua_May_Trang.jpg',1,9,3,2023,256,NULL,NULL,'978-604-3-00003-1',1,'2026-01-23 09:50:57',0),(11,'Đường Xưa Mây Trắng','Cuộc đời Đức Phật - Thích Nhất Hạnh',125000.00,85000.00,'/uploads/images/Len_Duong_Bang.png',8,10,5,2022,512,NULL,NULL,'978-604-5-00000-1',1,'2026-01-23 09:50:57',0),(12,'Totto-Chan Bên Cửa Sổ','Hồi ký tuổi thơ tại Nhật Bản',88000.00,58000.00,'/product-images/sp12.jpg',5,6,2,2021,268,NULL,NULL,'978-604-2-00001-1',1,'2026-01-23 09:50:57',0),(13,'Cà Phê Cùng Tony','Sách kỹ năng sống',98000.00,65000.00,'/product-images/sp13.jpg',4,5,4,2023,212,NULL,NULL,'978-604-4-00001-1',1,'2026-01-23 09:50:57',0),(14,'Tuổi Trẻ Đáng Giá Bao Nhiêu','Sách về tuổi trẻ và đam mê',85000.00,55000.00,'/product-images/sp14.jpg',4,5,4,2020,192,NULL,NULL,'978-604-4-00002-1',1,'2026-01-23 09:50:57',0),(15,'Sapiens: Lịch Sử Loài Người','Tóm tắt lịch sử nhân loại',195000.00,135000.00,'/product-images/sp15.jpg',7,6,5,2022,512,NULL,NULL,'978-604-5-00001-1',1,'2026-01-23 09:50:57',0),(16,'Cho Tôi Xin Một Vé Đi Tuổi Thơ','Cuốn sách kể về hành trình đầy hài hước và cảm động',95000.00,65000.00,'/uploads/images/sp01.jpg',1,1,1,2021,280,250.00,'14x20 cm','978-604-1-00101-1',1,'2026-02-24 13:52:08',10),(17,'Mắt Biếc','Một câu chuyện tình yêu lãng mạn và bi thương',69600.00,58000.00,'/uploads/images/sp02.jpg',1,1,1,2022,250,230.00,'14x20 cm','978-604-1-00102-1',1,'2026-02-24 13:52:08',10),(18,'Pride and Prejudice','Tác phẩm kinh điển của Jane Austen kể về cuộc đời và tình yêu',125000.00,88000.00,'/uploads/images/sp03.jpg',2,6,5,2023,432,380.00,'14x20 cm','978-604-5-00101-1',1,'2026-02-24 13:52:08',8),(19,'The Great Gatsby','Tiểu thuyết của F. Scott Fitzgerald khắc họa giấc mơ Mỹ',115000.00,80000.00,'/uploads/images/sp04.jpg',2,6,5,2022,180,210.00,'14x20 cm','978-604-5-00102-1',1,'2026-02-24 13:52:08',8),(20,'Harry Potter and the Philosophers Stone','Cuốn sách đầu tiên trong loạt truyện của J.K. Rowling về phù thủy Harry Potter',175000.00,120000.00,'/uploads/images/sp05.jpg',2,7,1,2023,368,350.00,'14x20 cm','978-604-1-00103-1',1,'2026-02-24 13:52:08',10),(21,'Dune','Tác phẩm khoa học viễn tưởng kinh điển của Frank Herbert',195000.00,135000.00,'/uploads/images/sp06.jpg',2,6,5,2022,688,620.00,'16x24 cm','978-604-5-00103-1',1,'2026-02-24 13:52:08',5),(22,'The Hitchhikers Guide to the Galaxy','Một tiểu thuyết hài hước của Douglas Adams, một tác phẩm cult',105000.00,73000.00,'/uploads/images/sp07.jpg',2,6,5,2023,224,250.00,'14x20 cm','978-604-5-00104-1',1,'2026-02-24 13:52:08',10),(23,'Enders Game','Tác phẩm của Orson Scott Card kể về Ender Wiggin và cuộc chiến với người ngoài hành tinh',135000.00,95000.00,'/uploads/images/sp08.jpg',2,6,5,2022,324,300.00,'14x20 cm','978-604-5-00105-1',1,'2026-02-24 13:52:08',8),(24,'Brave New World','Tiểu thuyết dystopia của Aldous Huxley miêu tả một xã hội tương lai đen tối',125000.00,88000.00,'/uploads/images/sp09.jpg',2,6,5,2023,268,280.00,'14x20 cm','978-604-5-00106-1',1,'2026-02-24 13:52:08',8),(25,'Neuromancer','Tác phẩm tiên phong của thể loại cyberpunk của William Gibson',145000.00,100000.00,'/uploads/images/sp10.jpg',2,6,5,2022,271,290.00,'14x20 cm','978-604-5-00107-1',1,'2026-02-24 13:52:08',8),(26,'The Da Vinci Code','Tiểu thuyết trinh thám của Dan Brown, theo dõi giáo sư Robert Langdon',155000.00,108000.00,'/uploads/images/sp11.jpg',2,6,5,2023,454,420.00,'14x20 cm','978-604-5-00108-1',1,'2026-02-24 13:52:08',8),(27,'Gone Girl','Tác phẩm tâm lý tội phạm của Gillian Flynn kể về một cuộc hôn nhân đầy bí ẩn',135000.00,95000.00,'/uploads/images/sp12.jpg',2,6,5,2022,422,390.00,'14x20 cm','978-604-5-00109-1',1,'2026-02-24 13:52:08',8),(28,'The Girl with the Dragon Tattoo','Phần đầu trong loạt Millennium của Stieg Larsson kể về nhà báo Mikael Blomkvist',145000.00,100000.00,'/uploads/images/sp13.jpg',2,6,5,2023,465,430.00,'14x20 cm','978-604-5-00110-1',1,'2026-02-24 13:52:08',8),(29,'The Hound of the Baskervilles','Một trong những tác phẩm nổi tiếng của Arthur Conan Doyle về Sherlock Holmes',95000.00,66000.00,'/uploads/images/sp14.jpg',2,6,5,2022,256,270.00,'14x20 cm','978-604-5-00111-1',1,'2026-02-24 13:52:08',10),(30,'The Secret History','Tác phẩm của Donna Tartt kể về một nhóm sinh viên tại trường cao đẳng New England',155000.00,108000.00,'/uploads/images/sp15.jpg',2,6,5,2023,559,510.00,'16x24 cm','978-604-5-00112-1',1,'2026-02-24 13:52:08',8),(31,'A Peoples History of the United States','Cuốn sách của Howard Zinn tái hiện lịch sử Hoa Kỳ từ góc nhìn của người dân thường',185000.00,128000.00,'/uploads/images/sp16.jpg',6,6,5,2022,729,670.00,'16x24 cm','978-604-5-00113-1',1,'2026-02-24 13:52:08',5),(32,'Guns, Germs, and Steel','Tác phẩm kinh điển của Jared Diamond phân tích lý do tại sao một số nền văn minh phát triển',195000.00,135000.00,'/uploads/images/sp17.jpg',6,6,5,2023,528,490.00,'16x24 cm','978-604-5-00114-1',1,'2026-02-24 13:52:08',5),(33,'The Diary of a Young Girl','Nhật ký của Anne Frank, một cô bé Do Thái, ghi lại cuộc sống ẩn náu trong Thế chiến II',98000.00,68000.00,'/uploads/images/sp18.jpg',6,6,5,2022,283,280.00,'14x20 cm','978-604-5-00115-1',1,'2026-02-24 13:52:08',10),(34,'The Guns of August','Tác phẩm của William Manchester mô tả sự kiện bắt đầu Thế chiến I',165000.00,115000.00,'/uploads/images/sp19.jpg',6,6,5,2023,606,560.00,'16x24 cm','978-604-5-00116-1',1,'2026-02-24 13:52:08',5),(35,'The Rise and Fall of the Third Reich','Cuốn sách của William L. Shirer ghi lại sự trỗi dậy và sụp đổ của Nazi Đức',235000.00,162000.00,'/uploads/images/sp20.jpg',6,6,5,2022,1264,1150.00,'16x24 cm','978-604-5-00117-1',1,'2026-02-24 13:52:08',3),(36,'The Poet','Tác phẩm của James Patterson kể về thám tử Alex Cross điều tra vụ án giết người hàng loạt',115000.00,80000.00,'/uploads/images/sp21.jpg',2,6,5,2023,434,400.00,'14x20 cm','978-604-5-00118-1',1,'2026-02-24 13:52:08',8),(37,'The Cuckoos Calling','Tiểu thuyết kinh dị của Thomas Harris, theo chân đặc vụ FBI Clarice Starling',125000.00,88000.00,'/uploads/images/sp22.jpg',2,6,5,2022,343,320.00,'14x20 cm','978-604-5-00119-1',1,'2026-02-24 13:52:08',8),(38,'The Silence of the Lambs','Tác phẩm của Tana French kể về một vụ án mạng xảy ra trong rừng Dublin',135000.00,95000.00,'/uploads/images/sp23.jpg',2,6,5,2023,429,400.00,'14x20 cm','978-604-5-00120-1',1,'2026-02-24 13:52:08',8),(39,'In the Woods','Cuốn sách của Haruki Murakami dẫn dắt người đọc vào thế giới đầy cảm xúc và triết lý',145000.00,100000.00,'/uploads/images/sp24.jpg',2,6,3,2022,389,370.00,'14x20 cm','978-604-3-00101-1',1,'2026-02-24 13:52:08',8),(40,'The Secret History','Tác phẩm của Donna Tartt kể về một nhóm học sinh tại một trường cao đẳng',155000.00,108000.00,'/uploads/images/sp25.jpg',2,6,5,2023,559,510.00,'16x24 cm','978-604-5-00121-1',1,'2026-02-24 13:52:08',8),(41,'A Brief History of Time','Cuốn sách của Stephen Hawking giải thích các khái niệm vũ trụ học phức tạp',185000.00,128000.00,'/uploads/images/sp26.jpg',7,6,5,2022,256,300.00,'16x24 cm','978-604-5-00122-1',1,'2026-02-24 13:52:08',8),(42,'The Selfish Gene','Cuốn sách của Richard Dawkins khám phá lý thuyết tiến hóa từ góc độ gen',165000.00,115000.00,'/uploads/images/sp27.jpg',7,6,5,2023,360,340.00,'16x24 cm','978-604-5-00123-1',1,'2026-02-24 13:52:08',8),(43,'Sapiens: A Brief History of Humankind','Tác phẩm của Yuval Noah Harari kể lại lịch sử loài người từ thời tiền sử',195000.00,135000.00,'/uploads/images/sp28.jpg',7,6,5,2022,464,430.00,'16x24 cm','978-604-5-00124-1',1,'2026-02-24 13:52:08',5),(44,'The Origin of Species','Cuốn sách kinh điển của Charles Darwin trình bày thuyết tiến hóa',175000.00,120000.00,'/uploads/images/sp29.jpg',7,6,5,2023,502,470.00,'16x24 cm','978-604-5-00125-1',1,'2026-02-24 13:52:08',5),(45,'The Double Helix','Tác phẩm của Nicholas Sparks kể về hành trình khám phá cấu trúc DNA',125000.00,88000.00,'/uploads/images/sp30.jpg',7,6,5,2022,226,250.00,'14x20 cm','978-604-5-00126-1',1,'2026-02-24 13:52:08',10),(46,'The Alchemist','Cuốn sách của Paulo Coelho kể về hành trình của người chăn cừu tìm kiếm kho báu',95000.00,66000.00,'/uploads/images/sp31.jpg',8,8,3,2023,227,240.00,'14x20 cm','978-604-3-00102-1',1,'2026-02-24 13:52:08',10),(47,'The Power of Now','Tác phẩm của Rhonda Byrne tiếp tục khám phá luật hấp dẫn',115000.00,80000.00,'/uploads/images/sp32.jpg',8,5,5,2022,272,280.00,'14x20 cm','978-604-5-00127-1',1,'2026-02-24 13:52:08',10),(48,'The Celestine Prophecy','Cuốn sách của James Redwood kể về cuộc phiêu lưu tâm linh tại Peru',105000.00,73000.00,'/uploads/images/sp33.jpg',8,5,5,2023,253,260.00,'14x20 cm','978-604-5-00128-1',1,'2026-02-24 13:52:08',10),(49,'Mere Christianity','Tác phẩm của C.S. Lewis kể về hành trình của nhà thần học',98000.00,68000.00,'/uploads/images/sp34.JPG',8,6,5,2022,191,220.00,'14x20 cm','978-604-5-00129-1',1,'2026-02-24 13:52:08',10),(50,'The Tao of Pooh','Cuốn sách của A.A. Milne đưa người đọc vào thế giới triết học Đạo giáo qua Gấu Pooh',88000.00,61000.00,'/uploads/images/sp35.jpg',8,6,5,2023,158,180.00,'13x19 cm','978-604-5-00130-1',1,'2026-02-24 13:52:08',10),(51,'Daring Greatly','Tác phẩm của Gretchen Rubin hướng dẫn cách sống hạnh phúc mỗi ngày',125000.00,88000.00,'/uploads/images/sp36.jpg',4,5,5,2022,336,310.00,'14x20 cm','978-604-5-00131-1',1,'2026-02-24 13:52:08',10),(52,'Girl, Wash Your Face','Cuốn sách của Marie Kondo chia sẻ phương pháp sắp xếp và dọn dẹp',115000.00,80000.00,'/uploads/images/sp37.jpg',4,5,5,2023,240,260.00,'14x20 cm','978-604-5-00132-1',1,'2026-02-24 13:52:08',10),(53,'The Power of Now','Tác phẩm của Eckhart Tolle tiếp tục khám phá sức mạnh của hiện tại',125000.00,88000.00,'/uploads/images/sp38.jpg',8,5,5,2022,236,260.00,'14x20 cm','978-604-5-00133-1',1,'2026-02-24 13:52:08',10),(54,'The Four Agreements','Cuốn sách của Don Miguel Ruiz giới thiệu bốn nguyên tắc sống đơn giản',98000.00,68000.00,'/uploads/images/sp39.jpg',8,5,5,2023,138,170.00,'13x19 cm','978-604-5-00134-1',1,'2026-02-24 13:52:08',10),(55,'Start with Why','Tác phẩm của Simon Sinek giải thích tại sao việc bắt đầu bằng \"Tại sao\" là quan trọng',135000.00,95000.00,'/uploads/images/sp40.jpg',4,5,5,2022,256,280.00,'14x20 cm','978-604-5-00135-1',1,'2026-02-24 13:52:08',10),(56,'The Notebook','Tác phẩm lãng mạn của Nicholas Sparks kể về tình yêu vượt thời gian',105000.00,73000.00,'/uploads/images/sp41.jpg',2,6,5,2023,214,240.00,'14x20 cm','978-604-5-00136-1',1,'2026-02-24 13:52:08',10),(57,'Outlander','Cuốn sách của Diana Gabaldon kể về hành trình xuyên thời gian của Claire Randall',165000.00,115000.00,'/uploads/images/sp42.jpg',2,6,5,2022,627,580.00,'16x24 cm','978-604-5-00137-1',1,'2026-02-24 13:52:08',5),(58,'The Rosie Project','Tác phẩm của Graeme Simsion kể về Hazel Grace và câu chuyện tình yêu của cô',115000.00,80000.00,'/uploads/images/sp43.jpg',2,6,5,2023,295,290.00,'14x20 cm','978-604-5-00138-1',1,'2026-02-24 13:52:08',10),(59,'The Fault in Our Stars','Cuốn sách của John Green kể về tình yêu trong bối cảnh bệnh tật',126720.00,105600.00,'/uploads/images/sp44.jpg',2,6,5,2022,313,300.00,'14x20 cm','978-604-5-00139-1',1,'2026-02-24 13:52:08',10),(60,'Me Before You','Tác phẩm của Jojo Moyes kể về mối quan hệ giữa Louisa Clark và Will Traynor',135000.00,95000.00,'/uploads/images/sp45.jpg',2,6,5,2023,369,350.00,'14x20 cm','978-604-5-00140-1',1,'2026-02-24 13:52:08',10),(61,'Tom Sawyer','Tiểu thuyết kinh điển của Mark Twain kể về cuộc phiêu lưu của Tom',95000.00,66000.00,'/uploads/images/sp46.jpg',5,6,1,2022,274,280.00,'14x20 cm','978-604-1-00104-1',1,'2026-02-24 13:52:08',10),(62,'Doremon Phiên Lưu','Cuốn truyện hài hước của Fujiko F. Fujio, một tác phẩm được yêu thích',25000.00,17000.00,'/uploads/images/sp47.jpg',5,6,2,2023,196,150.00,'11.3x17.6 cm','978-604-2-00101-1',1,'2026-02-24 13:52:08',20),(63,'Thơ 7 Màu','Tác phẩm của Alexandre Dumas kể về ba chàng lính ngự lâm và cuộc phiêu lưu',85000.00,59000.00,'/uploads/images/sp48.jpg',5,6,1,2022,625,580.00,'16x24 cm','978-604-1-00105-1',1,'2026-02-24 13:52:08',10),(64,'Vũ Trụ và Trái Đất','Cuốn tiểu thuyết của Alexandre Dumas kể về hành trình của Edmond Dantes',95000.00,66000.00,'/uploads/images/sp49.jpg',5,6,1,2023,1276,1150.00,'16x24 cm','978-604-1-00106-1',1,'2026-02-24 13:52:08',5),(65,'Gulliver','Tác phẩm kinh điển của Jonathan Swift kể về chuyến phiêu lưu của Gulliver',88000.00,61000.00,'/uploads/images/sp50.jpg',5,6,1,2022,306,310.00,'14x20 cm','978-604-1-00107-1',1,'2026-02-24 13:52:08',10),(66,'2 Vạn Dặm Dưới Biển','Cuốn sách của Jules Verne kể về cuộc đời của thuyền trưởng Nemo',105000.00,73000.00,'/uploads/images/sp51.jpg',5,6,1,2023,214,260.00,'14x20 cm','978-604-1-00108-1',1,'2026-02-24 13:52:08',10),(67,'Nhớ Tỷ Tỷ Phụ','Tác phẩm của Victor Hugo kể về hành trình của Jean Valjean',125000.00,88000.00,'/uploads/images/sp52.jpg',2,6,5,2022,1463,1350.00,'16x24 cm','978-604-5-00141-1',1,'2026-02-24 13:52:08',3),(68,'Đề Minh Họa Tốt Nghiệp THPT 2025','Tài liệu đề minh họa chính thức cho kỳ thi THPT Quốc gia 2025',45000.00,31000.00,'/uploads/images/sp53.jpg',7,1,5,2024,120,150.00,'19x27 cm','978-604-5-00142-1',1,'2026-02-24 13:52:08',20),(69,'Đề Minh Họa Tốt Nghiệp THPT 2025','Bộ đề minh họa dành cho kỳ thi THPT 2025, cung cấp đầy đủ các môn',48000.00,33000.00,'/uploads/images/sp54.jpg',7,1,5,2024,180,200.00,'19x27 cm','978-604-5-00143-1',1,'2026-02-24 13:52:08',20),(70,'Đề Minh Họa Tốt Nghiệp THPT 2025','Tài liệu đề minh họa chính thức kỳ thi THPT với đáp án chi tiết',45000.00,31000.00,'/uploads/images/sp55.jpg',7,1,5,2024,120,150.00,'19x27 cm','978-604-5-00144-1',1,'2026-02-24 13:52:08',20),(71,'Đề Minh Họa Tốt Nghiệp THPT 2025','Tài liệu đề minh họa tổng hợp dành cho kỳ thi THPT 2025',50000.00,35000.00,'/uploads/images/sp56.jpg',7,1,5,2024,150,180.00,'19x27 cm','978-604-5-00145-1',1,'2026-02-24 13:52:08',20),(72,'Tuyển Sinh 10 & Các Đề Toán Thực Tế','Tuyển tập 10 đề toán thực tế và bài tập kèm lời giải cho học sinh',55000.00,38000.00,'/uploads/images/sp57.jpg',7,1,5,2024,200,220.00,'19x27 cm','978-604-5-00146-1',1,'2026-02-24 13:52:08',15),(73,'Hướng Dẫn Ôn Thi Vào Lớp 10 (Định Hướng)','Hướng dẫn chi tiết cách ôn thi vào lớp 10 môn Văn, cung cấp phương pháp và bài tập',65000.00,45000.00,'/uploads/images/sp58.jpg',7,1,5,2024,280,290.00,'19x27 cm','978-604-5-00147-1',1,'2026-02-24 13:52:08',15),(74,'Hướng Dẫn Ôn Thi Vào Lớp 10 (Định Hướng)','Sách hướng dẫn ôn thi vào lớp 10 môn Văn, cung cấp kiến thức và bài tập',65000.00,45000.00,'/uploads/images/sp59.jpg',7,1,5,2024,280,290.00,'19x27 cm','978-604-5-00148-1',1,'2026-02-24 13:52:08',15),(75,'Đề Minh Họa Thi Vào 10','Tài liệu đề minh họa chính thức kỳ thi đánh giá đầu vào lớp 10',42000.00,29000.00,'/uploads/images/sp60.jpg',7,1,5,2024,100,130.00,'19x27 cm','978-604-5-00149-1',1,'2026-02-24 13:52:08',20),(76,'25 Đề Ôn Thi ĐGNL ĐH Quốc Gia TP.HCM','Tài liệu gồm 25 đề thi mẫu dành cho kỳ thi đánh giá năng lực',75000.00,52000.00,'/uploads/images/sp61.jpg',7,1,5,2024,320,350.00,'19x27 cm','978-604-5-00150-1',1,'2026-02-24 13:52:08',15),(77,'50 Đề Thực Chiến Luyện Thi Anh Vào Lớp 10','Tuyển tập 50 đề thi thử môn Tiếng Anh vào lớp 10 với đáp án chi tiết',68000.00,47000.00,'/uploads/images/sp62.jpg',7,1,5,2024,280,300.00,'19x27 cm','978-604-5-00151-1',1,'2026-02-24 13:52:08',15),(78,'Hướng Dẫn Ôn Thi Tuyển Sinh Lớp 10','Hướng dẫn ôn thi vào lớp 10 môn Toán, bao gồm lý thuyết và bài tập',70000.00,49000.00,'/uploads/images/sp63.jpg',7,1,5,2024,300,320.00,'19x27 cm','978-604-5-00152-1',1,'2026-02-24 13:52:08',15),(79,'Hướng Dẫn Ôn Thi Vào Lớp 10 (Định Hướng)','Sách hướng dẫn ôn thi vào lớp 10 môn Hóa, cung cấp kiến thức cơ bản',65000.00,45000.00,'/uploads/images/sp64.jpg',7,1,5,2024,260,280.00,'19x27 cm','978-604-5-00153-1',1,'2026-02-24 13:52:08',15),(80,'Global Success - Tiếng Anh 9 - Sách Học','Tài liệu tiếng Anh lớp 9, tập trung vào kỹ năng nghe nói đọc viết',85000.00,59000.00,'/uploads/images/sp65.jpg',7,1,5,2024,240,280.00,'19x27 cm','978-604-5-00154-1',1,'2026-02-24 13:52:08',15),(81,'Đề Minh Họa Tốt Nghiệp THPT 2025','Tài liệu đề minh họa chính thức cho kỳ thi THPT Quốc gia 2025',45000.00,31000.00,'/uploads/images/sp66.jpg',7,1,5,2024,120,150.00,'19x27 cm','978-604-5-00155-1',1,'2026-02-24 13:52:08',20),(82,'Đề Minh Họa Tốt Nghiệp THPT 2025','Bộ đề minh họa dành cho kỳ thi THPT 2025, hỗ trợ học sinh ôn luyện',48000.00,33000.00,'/uploads/images/sp67.jpg',7,1,5,2024,180,200.00,'19x27 cm','978-604-5-00156-1',1,'2026-02-24 13:52:08',20),(83,'Văn Học Dân Gian Cho Ro - Thể Loại Và Giá Trị','Cuốn sách của Dale Carnegie hướng dẫn cách xây dựng mối quan hệ',75000.00,52000.00,'/uploads/images/sp68.jpg',1,1,3,2023,320,300.00,'14x20 cm','978-604-3-00103-1',1,'2026-02-24 13:52:08',10),(84,'Nhà Văn - Cuộc Đời Và Tác Phẩm','Tác phẩm của Nguyễn Nhật Ánh kể về tuổi thơ và ký ức',85000.00,59000.00,'/uploads/images/sp69.jpg',1,1,1,2022,280,270.00,'14x20 cm','978-604-1-00109-1',1,'2026-02-24 13:52:08',10),(85,'Soạn Giả Viên Châu - Tác Giả Và Tác Phẩm','Cuốn sách giới thiệu tiểu sử và sự nghiệp của các tác giả nổi tiếng',95000.00,66000.00,'/uploads/images/sp70.jpg',1,1,3,2023,360,340.00,'14x20 cm','978-604-3-00104-1',1,'2026-02-24 13:52:08',10),(86,'Abraham Lincoln - Các Tác Phẩm Và Suy Nghĩ','Tuyển tập các tác phẩm của nhiều tác giả, tái hiện cuộc đời và tư tưởng',125000.00,88000.00,'/uploads/images/sp71.jpg',6,6,5,2022,480,450.00,'16x24 cm','978-604-5-00157-1',1,'2026-02-24 13:52:08',8),(87,'Hiểu Về Thương Thức Một Tác Phẩm Mỹ Thuật','Sách kể lại cuộc đời và sự nghiệp của Michelangelo',145000.00,100000.00,'/uploads/images/sp72.jpg',6,6,5,2023,520,490.00,'16x24 cm','978-604-5-00158-1',1,'2026-02-24 13:52:08',8),(88,'Michelangelo - Cuộc Đời Và Tác Phẩm Quan Trọng','Tác phẩm kinh điển của Quentin Blake, kể về hành trình sáng tạo nghệ thuật',155000.00,108000.00,'/uploads/images/sp73.jpg',6,6,5,2022,420,400.00,'16x24 cm','978-604-5-00159-1',1,'2026-02-24 13:52:08',8),(89,'Tác Phẩm Kinh Điển Của Quentin Blake','Tác phẩm sách khám phá cuộc đời và sự nghiệp của họa sĩ Quentin Blake',165000.00,115000.00,'/uploads/images/sp74.jpg',6,6,5,2023,380,360.00,'16x24 cm','978-604-5-00160-1',1,'2026-02-24 13:52:08',8),(90,'Tác Phẩm Kinh Điển Của Quentin Blake','Tác phẩm kể lại cuộc đời của Leonardo da Vinci, một thiên tài nghệ thuật',175000.00,120000.00,'/uploads/images/sp75.jpg',6,6,5,2022,450,420.00,'16x24 cm','978-604-5-00161-1',1,'2026-02-24 13:52:08',8),(91,'Leonardo Da Vinci - Cuộc Đời Và Tác Phẩm','Tuyển tập các bài viết về cuộc đời và sự nghiệp của Leonardo da Vinci',185000.00,128000.00,'/uploads/images/sp76.jpg',6,6,5,2023,520,480.00,'16x24 cm','978-604-5-00162-1',1,'2026-02-24 13:52:08',8),(92,'Tác Phẩm Chọn Lọc - Văn Học Mỹ - Ông Già Và Biển Cả','Tác phẩm của Nguyễn Nhật Ánh kể về tuổi trẻ đầy cảm xúc',95000.00,66000.00,'/uploads/images/sp77.jpg',1,1,1,2022,320,300.00,'14x20 cm','978-604-1-00110-1',1,'2026-02-24 13:52:08',10),(93,'Tủ Sách Vàng - Tác Phẩm Chọn Lọc Dân Gian','Tuyển tập các tác phẩm của Tú Vương, nhà thơ lãng mạn nổi tiếng',88000.00,61000.00,'/uploads/images/sp78.jpg',1,1,3,2023,280,270.00,'14x20 cm','978-604-3-00105-1',1,'2026-02-24 13:52:08',10),(94,'Thế Giới Nghệ Thuật Trong Bảo Tàng','Cuốn sách khám phá nghệ thuật thế giới qua các bảo tàng lớn',195000.00,135000.00,'/uploads/images/sp79.jpg',6,6,5,2022,580,540.00,'21x28 cm','978-604-5-00163-1',1,'2026-02-24 13:52:08',8),(95,'10 Vạn Câu Hỏi Vì Sao? - Khám Phá Các Bí Ẩn','Tài liệu giáo khoa dành cho trẻ em, giải đáp 10 vạn câu hỏi khoa học',125000.00,88000.00,'/uploads/images/sp80.jpg',5,1,5,2023,480,520.00,'21x28 cm','978-604-5-00164-1',1,'2026-02-24 13:52:08',10),(96,'Khám Phá Và Thực Hành Steam Qua Tác Dụng','Sách hướng dẫn thực hành STEAM qua các dự án sáng tạo và khám phá',114000.00,95000.00,'/uploads/images/sp81.jpg',7,1,5,2024,320,350.00,'21x28 cm','978-604-5-00165-1',1,'2026-02-24 13:52:08',10),(97,'Tác Phẩm Chọn Lọc - Văn Học Mỹ - Bé Nicolô','Tuyển tập các tác phẩm văn học Mỹ chọn lọc, giới thiệu tác phẩm của các tác giả lớn',98000.00,68000.00,'/uploads/images/sp82.jpg',2,6,5,2023,380,360.00,'14x20 cm','978-604-5-00166-1',1,'2026-02-24 13:52:08',10),(98,'Sách mới 2025','Sách mới phát hành năm 2025',150000.00,105000.00,'/uploads/images/sp83.jpg',1,1,1,2025,300,280.00,'14x20 cm','978-604-1-00111-1',1,'2026-02-24 13:52:08',10);
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
INSERT INTO `taikhoan` VALUES (1,'admin','$2a$10$RanLSUcHQwTliSuSLx3fvOSBrLJTZGEerUkPv.1bgDQLTGP87Y3hu','hoaibao4062004@gmail.com',1,1,'2026-01-23 09:50:57'),(2,'quanly01','$2a$10$RZwm4ORbMGTVh77MlStrdeYXW2eIiGP94LHkGC0KbLWclhL7p15fm',NULL,1,2,'2026-01-23 09:50:57'),(3,'thungan01','$2a$10$RZwm4ORbMGTVh77MlStrdeYXW2eIiGP94LHkGC0KbLWclhL7p15fm','thungan01@bansach.vn',1,3,'2026-01-23 09:50:57'),(4,'kho01','$2a$10$RZwm4ORbMGTVh77MlStrdeYXW2eIiGP94LHkGC0KbLWclhL7p15fm','kho01@bansach.vn',1,4,'2026-01-23 09:50:57'),(5,'hr01','$2a$10$RZwm4ORbMGTVh77MlStrdeYXW2eIiGP94LHkGC0KbLWclhL7p15fm','hr01@bansach.vn',1,5,'2026-01-23 09:50:57');
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
  `id` int NOT NULL AUTO_INCREMENT,
  `MaNV` int NOT NULL,
  `Loai` enum('Thuong','Phat') NOT NULL,
  `SoTien` decimal(15,2) NOT NULL,
  `LyDo` varchar(255) NOT NULL,
  `Thang` int NOT NULL,
  `Nam` int NOT NULL,
  `NgayTao` datetime DEFAULT CURRENT_TIMESTAMP,
  `NguoiTao` int DEFAULT NULL,
  `GhiChu` text,
  PRIMARY KEY (`id`),
  KEY `idx_manv` (`MaNV`),
  KEY `idx_thang_nam` (`Thang`,`Nam`),
  CONSTRAINT `fk_tp_nhanvien` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien` (`MaNV`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thuong_phat`
--

LOCK TABLES `thuong_phat` WRITE;
/*!40000 ALTER TABLE `thuong_phat` DISABLE KEYS */;
INSERT INTO `thuong_phat` VALUES (1,3,'Thuong',111111.00,'làm công việc tốt lắm ',2,2026,'2026-03-10 21:40:25',2,NULL),(2,2,'Thuong',4555.00,'cvv',3,2026,'2026-03-10 21:50:37',2,NULL),(3,4,'Thuong',3333330033.00,'fđff',3,2026,'2026-03-10 21:51:16',2,NULL);
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
  `MaCH` int DEFAULT NULL COMMENT 'Lưu MaKho của kho_con',
  `SoLuongTon` int DEFAULT '0',
  `SoLuongToiThieu` int DEFAULT '10' COMMENT 'Mức cảnh báo hết hàng',
  `ViTri` varchar(50) DEFAULT NULL COMMENT 'Kệ A1, Ngăn B2',
  `NgayCapNhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_stock` (`MaSP`,`MaCH`),
  UNIQUE KEY `idx_masp_mach` (`MaSP`,`MaCH`),
  KEY `MaCH` (`MaCH`),
  CONSTRAINT `ton_kho_ibfk_1` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`)
) ENGINE=InnoDB AUTO_INCREMENT=625 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tồn kho từng chi nhánh';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ton_kho`
--

LOCK TABLES `ton_kho` WRITE;
/*!40000 ALTER TABLE `ton_kho` DISABLE KEYS */;
INSERT INTO `ton_kho` VALUES (1,1,1,96,10,'Kệ A1','2026-03-05 06:24:42'),(2,2,1,94,10,'Kệ A2','2026-03-05 07:27:41'),(3,3,1,99,10,'Kệ B1','2026-03-05 15:38:50'),(4,4,1,82,10,'Kệ B2','2026-03-04 22:39:13'),(5,5,1,120,15,'Kệ C1','2026-02-26 14:15:31'),(6,6,1,89,10,'Kệ C2','2026-02-26 14:15:31'),(7,7,1,78,10,'Kệ D1','2026-02-26 14:15:31'),(8,8,1,105,15,'Kệ D2','2026-02-26 14:15:31'),(9,9,1,115,10,'Kệ E1','2026-02-26 14:15:31'),(10,10,1,90,10,'Kệ E2','2026-02-26 14:15:31'),(11,1,2,104,10,'Kệ A1','2026-03-05 06:24:42'),(12,2,2,90,10,'Kệ A2','2026-03-05 07:27:41'),(13,5,2,110,10,'Kệ B1','2026-02-26 14:15:31'),(14,8,2,110,10,'Kệ B2','2026-03-05 06:50:35'),(15,9,2,90,10,'Kệ C1','2026-02-26 14:15:31'),(16,1,3,80,10,'Kệ A1','2026-02-26 14:15:31'),(17,3,3,85,10,'Kệ A2','2026-02-26 14:15:31'),(18,5,3,90,10,'Kệ B1','2026-02-26 14:15:31'),(19,7,3,75,10,'Kệ B2','2026-02-26 14:15:31'),(20,11,3,80,10,'Kệ C1','2026-02-26 14:15:31'),(42,4,2,71,10,NULL,'2026-03-04 22:39:13'),(44,6,2,73,10,NULL,'2026-03-05 06:50:35'),(45,7,2,70,10,NULL,'2026-02-26 14:15:31'),(46,17,2,70,10,NULL,'2026-02-26 14:15:31'),(47,59,2,69,10,NULL,'2026-02-26 14:15:31'),(48,96,2,73,10,NULL,'2026-02-26 14:15:31'),(49,59,1,68,10,NULL,'2026-02-26 14:15:31'),(50,3,2,61,10,NULL,'2026-02-26 14:15:31'),(51,2,3,40,10,NULL,'2026-02-26 14:15:31'),(52,4,3,40,10,NULL,'2026-02-26 14:15:31'),(53,6,3,40,10,NULL,'2026-02-26 14:15:31'),(54,8,3,40,10,NULL,'2026-02-26 14:15:31'),(55,9,3,40,10,NULL,'2026-02-26 14:15:31'),(56,10,3,40,10,NULL,'2026-02-26 14:15:31'),(57,10,2,40,10,NULL,'2026-02-26 14:15:31'),(58,11,2,40,10,NULL,'2026-02-26 14:15:31'),(59,11,1,40,10,NULL,'2026-02-26 14:15:31'),(60,12,3,40,10,NULL,'2026-02-26 14:15:31'),(61,12,2,40,10,NULL,'2026-02-26 14:15:31'),(62,12,1,40,10,NULL,'2026-02-26 14:15:31'),(63,13,3,40,10,NULL,'2026-02-26 14:15:31'),(64,13,2,40,10,NULL,'2026-02-26 14:15:31'),(65,13,1,40,10,NULL,'2026-02-26 14:15:31'),(66,14,3,40,10,NULL,'2026-02-26 14:15:31'),(67,14,2,40,10,NULL,'2026-02-26 14:15:31'),(68,14,1,40,10,NULL,'2026-02-26 14:15:31'),(69,15,3,40,10,NULL,'2026-02-26 14:15:31'),(70,15,2,40,10,NULL,'2026-02-26 14:15:31'),(71,15,1,40,10,NULL,'2026-02-26 14:15:31'),(72,16,3,40,10,NULL,'2026-02-26 14:15:31'),(73,16,2,40,10,NULL,'2026-02-26 14:15:31'),(74,16,1,40,10,NULL,'2026-02-26 14:15:31'),(75,17,3,40,10,NULL,'2026-02-26 14:15:31'),(76,17,1,40,10,NULL,'2026-02-26 14:15:31'),(77,18,3,40,10,NULL,'2026-02-26 14:15:31'),(78,18,2,40,10,NULL,'2026-02-26 14:15:31'),(79,18,1,40,10,NULL,'2026-02-26 14:15:31'),(80,19,3,40,10,NULL,'2026-02-26 14:15:31'),(81,19,2,40,10,NULL,'2026-02-26 14:15:31'),(82,19,1,40,10,NULL,'2026-02-26 14:15:31'),(83,20,3,40,10,NULL,'2026-02-26 14:15:31'),(84,20,2,40,10,NULL,'2026-02-26 14:15:31'),(85,20,1,40,10,NULL,'2026-02-26 14:15:31'),(86,21,3,40,10,NULL,'2026-02-26 14:15:31'),(87,21,2,40,10,NULL,'2026-02-26 14:15:31'),(88,21,1,40,10,NULL,'2026-02-26 14:15:31'),(89,22,3,40,10,NULL,'2026-02-26 14:15:31'),(90,22,2,40,10,NULL,'2026-02-26 14:15:31'),(91,22,1,40,10,NULL,'2026-02-26 14:15:31'),(92,23,3,40,10,NULL,'2026-02-26 14:15:31'),(93,23,2,40,10,NULL,'2026-02-26 14:15:31'),(94,23,1,40,10,NULL,'2026-02-26 14:15:31'),(95,24,3,40,10,NULL,'2026-02-26 14:15:31'),(96,24,2,40,10,NULL,'2026-02-26 14:15:31'),(97,24,1,40,10,NULL,'2026-02-26 14:15:31'),(98,25,3,40,10,NULL,'2026-02-26 14:15:31'),(99,25,2,40,10,NULL,'2026-02-26 14:15:31'),(100,25,1,40,10,NULL,'2026-02-26 14:15:31'),(101,26,3,40,10,NULL,'2026-02-26 14:15:31'),(102,26,2,40,10,NULL,'2026-02-26 14:15:31'),(103,26,1,40,10,NULL,'2026-02-26 14:15:31'),(104,27,3,40,10,NULL,'2026-02-26 14:15:31'),(105,27,2,40,10,NULL,'2026-02-26 14:15:31'),(106,27,1,40,10,NULL,'2026-02-26 14:15:31'),(107,28,3,40,10,NULL,'2026-02-26 14:15:31'),(108,28,2,40,10,NULL,'2026-02-26 14:15:31'),(109,28,1,40,10,NULL,'2026-02-26 14:15:31'),(110,29,3,40,10,NULL,'2026-02-26 14:15:31'),(111,29,2,40,10,NULL,'2026-02-26 14:15:31'),(112,29,1,40,10,NULL,'2026-02-26 14:15:31'),(113,30,3,40,10,NULL,'2026-02-26 14:15:31'),(114,30,2,40,10,NULL,'2026-02-26 14:15:31'),(115,30,1,40,10,NULL,'2026-02-26 14:15:31'),(116,31,3,40,10,NULL,'2026-02-26 14:15:31'),(117,31,2,40,10,NULL,'2026-02-26 14:15:31'),(118,31,1,40,10,NULL,'2026-02-26 14:15:31'),(119,32,3,40,10,NULL,'2026-02-26 14:15:31'),(120,32,2,40,10,NULL,'2026-02-26 14:15:31'),(121,32,1,40,10,NULL,'2026-02-26 14:15:31'),(122,33,3,40,10,NULL,'2026-02-26 14:15:31'),(123,33,2,40,10,NULL,'2026-02-26 14:15:31'),(124,33,1,40,10,NULL,'2026-02-26 14:15:31'),(125,34,3,40,10,NULL,'2026-02-26 14:15:31'),(126,34,2,40,10,NULL,'2026-02-26 14:15:31'),(127,34,1,40,10,NULL,'2026-02-26 14:15:31'),(128,35,3,40,10,NULL,'2026-02-26 14:15:31'),(129,35,2,40,10,NULL,'2026-02-26 14:15:31'),(130,35,1,40,10,NULL,'2026-02-26 14:15:31'),(131,36,3,40,10,NULL,'2026-02-26 14:15:31'),(132,36,2,40,10,NULL,'2026-02-26 14:15:31'),(133,36,1,40,10,NULL,'2026-02-26 14:15:31'),(134,37,3,40,10,NULL,'2026-02-26 14:15:31'),(135,37,2,40,10,NULL,'2026-02-26 14:15:31'),(136,37,1,40,10,NULL,'2026-02-26 14:15:31'),(137,38,3,40,10,NULL,'2026-02-26 14:15:31'),(138,38,2,40,10,NULL,'2026-02-26 14:15:31'),(139,38,1,40,10,NULL,'2026-02-26 14:15:31'),(140,39,3,40,10,NULL,'2026-02-26 14:15:31'),(141,39,2,40,10,NULL,'2026-02-26 14:15:31'),(142,39,1,40,10,NULL,'2026-02-26 14:15:31'),(143,40,3,40,10,NULL,'2026-02-26 14:15:31'),(144,40,2,40,10,NULL,'2026-02-26 14:15:31'),(145,40,1,40,10,NULL,'2026-02-26 14:15:31'),(146,41,3,40,10,NULL,'2026-02-26 14:15:31'),(147,41,2,40,10,NULL,'2026-02-26 14:15:31'),(148,41,1,40,10,NULL,'2026-02-26 14:15:31'),(149,42,3,40,10,NULL,'2026-02-26 14:15:31'),(150,42,2,40,10,NULL,'2026-02-26 14:15:31'),(151,42,1,40,10,NULL,'2026-02-26 14:15:31'),(152,43,3,40,10,NULL,'2026-02-26 14:15:31'),(153,43,2,40,10,NULL,'2026-02-26 14:15:31'),(154,43,1,40,10,NULL,'2026-02-26 14:15:31'),(155,44,3,40,10,NULL,'2026-02-26 14:15:31'),(156,44,2,40,10,NULL,'2026-02-26 14:15:31'),(157,44,1,40,10,NULL,'2026-02-26 14:15:31'),(158,45,3,40,10,NULL,'2026-02-26 14:15:31'),(159,45,2,40,10,NULL,'2026-02-26 14:15:31'),(160,45,1,40,10,NULL,'2026-02-26 14:15:31'),(161,46,3,40,10,NULL,'2026-02-26 14:15:31'),(162,46,2,40,10,NULL,'2026-02-26 14:15:31'),(163,46,1,40,10,NULL,'2026-02-26 14:15:31'),(164,47,3,40,10,NULL,'2026-02-26 14:15:31'),(165,47,2,40,10,NULL,'2026-02-26 14:15:31'),(166,47,1,40,10,NULL,'2026-02-26 14:15:31'),(167,48,3,40,10,NULL,'2026-02-26 14:15:31'),(168,48,2,40,10,NULL,'2026-02-26 14:15:31'),(169,48,1,40,10,NULL,'2026-02-26 14:15:31'),(170,49,3,40,10,NULL,'2026-02-26 14:15:31'),(171,49,2,40,10,NULL,'2026-02-26 14:15:31'),(172,49,1,40,10,NULL,'2026-02-26 14:15:31'),(173,50,3,40,10,NULL,'2026-02-26 14:15:31'),(174,50,2,40,10,NULL,'2026-02-26 14:15:31'),(175,50,1,39,10,NULL,'2026-03-03 08:56:25'),(176,51,3,40,10,NULL,'2026-02-26 14:15:31'),(177,51,2,40,10,NULL,'2026-02-26 14:15:31'),(178,51,1,40,10,NULL,'2026-02-26 14:15:31'),(179,52,3,40,10,NULL,'2026-02-26 14:15:31'),(180,52,2,40,10,NULL,'2026-02-26 14:15:31'),(181,52,1,40,10,NULL,'2026-02-26 14:15:31'),(182,53,3,40,10,NULL,'2026-02-26 14:15:31'),(183,53,2,40,10,NULL,'2026-02-26 14:15:31'),(184,53,1,40,10,NULL,'2026-02-26 14:15:31'),(185,54,3,40,10,NULL,'2026-02-26 14:15:31'),(186,54,2,40,10,NULL,'2026-02-26 14:15:31'),(187,54,1,40,10,NULL,'2026-02-26 14:15:31'),(188,55,3,40,10,NULL,'2026-02-26 14:15:31'),(189,55,2,40,10,NULL,'2026-02-26 14:15:31'),(190,55,1,40,10,NULL,'2026-02-26 14:15:31'),(191,56,3,40,10,NULL,'2026-02-26 14:15:31'),(192,56,2,40,10,NULL,'2026-02-26 14:15:31'),(193,56,1,40,10,NULL,'2026-02-26 14:15:31'),(194,57,3,40,10,NULL,'2026-02-26 14:15:31'),(195,57,2,40,10,NULL,'2026-02-26 14:15:31'),(196,57,1,40,10,NULL,'2026-02-26 14:15:31'),(197,58,3,40,10,NULL,'2026-02-26 14:15:31'),(198,58,2,40,10,NULL,'2026-02-26 14:15:31'),(199,58,1,40,10,NULL,'2026-02-26 14:15:31'),(200,59,3,40,10,NULL,'2026-02-26 14:15:31'),(201,60,3,40,10,NULL,'2026-02-26 14:15:31'),(202,60,2,40,10,NULL,'2026-02-26 14:15:31'),(203,60,1,40,10,NULL,'2026-02-26 14:15:31'),(204,61,3,40,10,NULL,'2026-02-26 14:15:31'),(205,61,2,40,10,NULL,'2026-02-26 14:15:31'),(206,61,1,40,10,NULL,'2026-02-26 14:15:31'),(207,62,3,40,10,NULL,'2026-02-26 14:15:31'),(208,62,2,40,10,NULL,'2026-02-26 14:15:31'),(209,62,1,40,10,NULL,'2026-02-26 14:15:31'),(210,63,3,40,10,NULL,'2026-02-26 14:15:31'),(211,63,2,40,10,NULL,'2026-02-26 14:15:31'),(212,63,1,40,10,NULL,'2026-02-26 14:15:31'),(213,64,3,40,10,NULL,'2026-02-26 14:15:31'),(214,64,2,40,10,NULL,'2026-02-26 14:15:31'),(215,64,1,40,10,NULL,'2026-02-26 14:15:31'),(216,65,3,40,10,NULL,'2026-02-26 14:15:31'),(217,65,2,40,10,NULL,'2026-02-26 14:15:31'),(218,65,1,40,10,NULL,'2026-02-26 14:15:31'),(219,66,3,40,10,NULL,'2026-02-26 14:15:31'),(220,66,2,40,10,NULL,'2026-02-26 14:15:31'),(221,66,1,40,10,NULL,'2026-02-26 14:15:31'),(222,67,3,40,10,NULL,'2026-02-26 14:15:31'),(223,67,2,40,10,NULL,'2026-02-26 14:15:31'),(224,67,1,40,10,NULL,'2026-02-26 14:15:31'),(225,68,3,40,10,NULL,'2026-02-26 14:15:31'),(226,68,2,40,10,NULL,'2026-02-26 14:15:31'),(227,68,1,40,10,NULL,'2026-02-26 14:15:31'),(228,69,3,40,10,NULL,'2026-02-26 14:15:31'),(229,69,2,40,10,NULL,'2026-02-26 14:15:31'),(230,69,1,40,10,NULL,'2026-02-26 14:15:31'),(231,70,3,40,10,NULL,'2026-02-26 14:15:31'),(232,70,2,40,10,NULL,'2026-02-26 14:15:31'),(233,70,1,40,10,NULL,'2026-02-26 14:15:31'),(234,71,3,40,10,NULL,'2026-02-26 14:15:31'),(235,71,2,40,10,NULL,'2026-02-26 14:15:31'),(236,71,1,40,10,NULL,'2026-02-26 14:15:31'),(237,72,3,40,10,NULL,'2026-02-26 14:15:31'),(238,72,2,40,10,NULL,'2026-02-26 14:15:31'),(239,72,1,40,10,NULL,'2026-02-26 14:15:31'),(240,73,3,40,10,NULL,'2026-02-26 14:15:31'),(241,73,2,40,10,NULL,'2026-02-26 14:15:31'),(242,73,1,40,10,NULL,'2026-02-26 14:15:31'),(243,74,3,40,10,NULL,'2026-02-26 14:15:31'),(244,74,2,40,10,NULL,'2026-02-26 14:15:31'),(245,74,1,40,10,NULL,'2026-02-26 14:15:31'),(246,75,3,40,10,NULL,'2026-02-26 14:15:31'),(247,75,2,40,10,NULL,'2026-02-26 14:15:31'),(248,75,1,40,10,NULL,'2026-02-26 14:15:31'),(249,76,3,40,10,NULL,'2026-02-26 14:15:31'),(250,76,2,40,10,NULL,'2026-02-26 14:15:31'),(251,76,1,40,10,NULL,'2026-02-26 14:15:31'),(252,77,3,40,10,NULL,'2026-02-26 14:15:31'),(253,77,2,40,10,NULL,'2026-02-26 14:15:31'),(254,77,1,40,10,NULL,'2026-02-26 14:15:31'),(255,78,3,40,10,NULL,'2026-02-26 14:15:31'),(256,78,2,40,10,NULL,'2026-02-26 14:15:31'),(257,78,1,40,10,NULL,'2026-02-26 14:15:31'),(258,79,3,40,10,NULL,'2026-02-26 14:15:31'),(259,79,2,40,10,NULL,'2026-02-26 14:15:31'),(260,79,1,40,10,NULL,'2026-02-26 14:15:31'),(261,80,3,40,10,NULL,'2026-02-26 14:15:31'),(262,80,2,40,10,NULL,'2026-02-26 14:15:31'),(263,80,1,40,10,NULL,'2026-02-26 14:15:31'),(264,81,3,40,10,NULL,'2026-02-26 14:15:31'),(265,81,2,40,10,NULL,'2026-02-26 14:15:31'),(266,81,1,40,10,NULL,'2026-02-26 14:15:31'),(267,82,3,40,10,NULL,'2026-02-26 14:15:31'),(268,82,2,40,10,NULL,'2026-02-26 14:15:31'),(269,82,1,40,10,NULL,'2026-02-26 14:15:31'),(270,83,3,40,10,NULL,'2026-02-26 14:15:31'),(271,83,2,40,10,NULL,'2026-02-26 14:15:31'),(272,83,1,40,10,NULL,'2026-02-26 14:15:31'),(273,84,3,40,10,NULL,'2026-02-26 14:15:31'),(274,84,2,40,10,NULL,'2026-02-26 14:15:31'),(275,84,1,40,10,NULL,'2026-02-26 14:15:31'),(276,85,3,40,10,NULL,'2026-02-26 14:15:31'),(277,85,2,40,10,NULL,'2026-02-26 14:15:31'),(278,85,1,40,10,NULL,'2026-02-26 14:15:31'),(279,86,3,40,10,NULL,'2026-02-26 14:15:31'),(280,86,2,40,10,NULL,'2026-02-26 14:15:31'),(281,86,1,40,10,NULL,'2026-02-26 14:15:31'),(282,87,3,40,10,NULL,'2026-02-26 14:15:31'),(283,87,2,40,10,NULL,'2026-02-26 14:15:31'),(284,87,1,40,10,NULL,'2026-02-26 14:15:31'),(285,88,3,40,10,NULL,'2026-02-26 14:15:31'),(286,88,2,40,10,NULL,'2026-02-26 14:15:31'),(287,88,1,40,10,NULL,'2026-02-26 14:15:31'),(288,89,3,40,10,NULL,'2026-02-26 14:15:31'),(289,89,2,40,10,NULL,'2026-02-26 14:15:31'),(290,89,1,40,10,NULL,'2026-02-26 14:15:31'),(291,90,3,40,10,NULL,'2026-02-26 14:15:31'),(292,90,2,40,10,NULL,'2026-02-26 14:15:31'),(293,90,1,40,10,NULL,'2026-02-26 14:15:31'),(294,91,3,40,10,NULL,'2026-02-26 14:15:31'),(295,91,2,40,10,NULL,'2026-02-26 14:15:31'),(296,91,1,40,10,NULL,'2026-02-26 14:15:31'),(297,92,3,40,10,NULL,'2026-02-26 14:15:31'),(298,92,2,40,10,NULL,'2026-02-26 14:15:31'),(299,92,1,40,10,NULL,'2026-02-26 14:15:31'),(300,93,3,40,10,NULL,'2026-02-26 14:15:31'),(301,93,2,40,10,NULL,'2026-02-26 14:15:31'),(302,93,1,40,10,NULL,'2026-02-26 14:15:31'),(303,94,3,40,10,NULL,'2026-02-26 14:15:31'),(304,94,2,40,10,NULL,'2026-02-26 14:15:31'),(305,94,1,40,10,NULL,'2026-02-26 14:15:31'),(306,95,3,40,10,NULL,'2026-02-26 14:15:31'),(307,95,2,40,10,NULL,'2026-02-26 14:15:31'),(308,95,1,40,10,NULL,'2026-02-26 14:15:31'),(309,96,3,40,10,NULL,'2026-02-26 14:15:31'),(310,96,1,40,10,NULL,'2026-02-26 14:15:31'),(311,97,3,40,10,NULL,'2026-02-26 14:15:31'),(312,97,2,40,10,NULL,'2026-02-26 14:15:31'),(313,97,1,40,10,NULL,'2026-02-26 14:15:31'),(314,98,3,40,10,NULL,'2026-02-26 14:15:31'),(315,98,2,40,10,NULL,'2026-02-26 14:15:31'),(316,98,1,40,10,NULL,'2026-02-26 14:15:31'),(619,7,6,20,10,NULL,'2026-03-05 10:21:23'),(620,6,6,20,10,NULL,'2026-03-05 10:21:23');
/*!40000 ALTER TABLE `ton_kho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ton_kho_chi_tiet`
--

DROP TABLE IF EXISTS `ton_kho_chi_tiet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ton_kho_chi_tiet` (
  `MaKho` int NOT NULL COMMENT 'Kho con cụ thể',
  `MaSP` int NOT NULL,
  `SoLuongTon` int NOT NULL DEFAULT '0',
  `CapNhatLuc` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaKho`,`MaSP`),
  KEY `idx_masp` (`MaSP`),
  CONSTRAINT `fk_tkct_kho` FOREIGN KEY (`MaKho`) REFERENCES `kho_con` (`MaKho`),
  CONSTRAINT `fk_tkct_sanpham` FOREIGN KEY (`MaSP`) REFERENCES `sanpham` (`MaSP`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tồn kho chi tiết theo từng kho con';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ton_kho_chi_tiet`
--

LOCK TABLES `ton_kho_chi_tiet` WRITE;
/*!40000 ALTER TABLE `ton_kho_chi_tiet` DISABLE KEYS */;
INSERT INTO `ton_kho_chi_tiet` VALUES (1,1,110,'2026-03-04 19:52:25'),(1,2,94,'2026-03-05 15:40:08'),(1,3,98,'2026-03-05 15:40:23'),(1,4,83,'2026-03-04 19:52:25'),(1,5,120,'2026-03-04 19:52:25'),(1,6,89,'2026-03-04 19:52:25'),(1,7,78,'2026-03-04 19:52:25'),(1,8,105,'2026-03-04 19:52:25'),(1,9,115,'2026-03-04 19:52:25'),(1,10,90,'2026-03-04 19:52:25'),(1,11,40,'2026-03-04 19:52:25'),(1,12,40,'2026-03-04 19:52:25'),(1,13,40,'2026-03-04 19:52:25'),(1,14,40,'2026-03-04 19:52:25'),(1,15,40,'2026-03-04 19:52:25'),(1,16,40,'2026-03-04 19:52:25'),(1,17,40,'2026-03-04 19:52:25'),(1,18,40,'2026-03-04 19:52:25'),(1,19,40,'2026-03-04 19:52:25'),(1,20,40,'2026-03-04 19:52:25'),(1,21,40,'2026-03-04 19:52:25'),(1,22,40,'2026-03-04 19:52:25'),(1,23,40,'2026-03-04 19:52:25'),(1,24,40,'2026-03-04 19:52:25'),(1,25,40,'2026-03-04 19:52:25'),(1,26,40,'2026-03-04 19:52:25'),(1,27,40,'2026-03-04 19:52:25'),(1,28,40,'2026-03-04 19:52:25'),(1,29,40,'2026-03-04 19:52:25'),(1,30,40,'2026-03-04 19:52:25'),(1,31,40,'2026-03-04 19:52:25'),(1,32,40,'2026-03-04 19:52:25'),(1,33,40,'2026-03-04 19:52:25'),(1,34,40,'2026-03-04 19:52:25'),(1,35,40,'2026-03-04 19:52:25'),(1,36,40,'2026-03-04 19:52:25'),(1,37,40,'2026-03-04 19:52:25'),(1,38,40,'2026-03-04 19:52:25'),(1,39,40,'2026-03-04 19:52:25'),(1,40,40,'2026-03-04 19:52:25'),(1,41,40,'2026-03-04 19:52:25'),(1,42,40,'2026-03-04 19:52:25'),(1,43,40,'2026-03-04 19:52:25'),(1,44,40,'2026-03-04 19:52:25'),(1,45,40,'2026-03-04 19:52:25'),(1,46,40,'2026-03-04 19:52:25'),(1,47,40,'2026-03-04 19:52:25'),(1,48,40,'2026-03-04 19:52:25'),(1,49,40,'2026-03-04 19:52:25'),(1,50,39,'2026-03-04 19:52:25'),(1,51,40,'2026-03-04 19:52:25'),(1,52,40,'2026-03-04 19:52:25'),(1,53,40,'2026-03-04 19:52:25'),(1,54,40,'2026-03-04 19:52:25'),(1,55,40,'2026-03-04 19:52:25'),(1,56,40,'2026-03-04 19:52:25'),(1,57,40,'2026-03-04 19:52:25'),(1,58,40,'2026-03-04 19:52:25'),(1,59,68,'2026-03-04 19:52:25'),(1,60,40,'2026-03-04 19:52:25'),(1,61,40,'2026-03-04 19:52:25'),(1,62,40,'2026-03-04 19:52:25'),(1,63,40,'2026-03-04 19:52:25'),(1,64,40,'2026-03-04 19:52:25'),(1,65,40,'2026-03-04 19:52:25'),(1,66,40,'2026-03-04 19:52:25'),(1,67,40,'2026-03-04 19:52:25'),(1,68,40,'2026-03-04 19:52:25'),(1,69,40,'2026-03-04 19:52:25'),(1,70,40,'2026-03-04 19:52:25'),(1,71,40,'2026-03-04 19:52:25'),(1,72,40,'2026-03-04 19:52:25'),(1,73,40,'2026-03-04 19:52:25'),(1,74,40,'2026-03-04 19:52:25'),(1,75,40,'2026-03-04 19:52:25'),(1,76,40,'2026-03-04 19:52:25'),(1,77,40,'2026-03-04 19:52:25'),(1,78,40,'2026-03-04 19:52:25'),(1,79,40,'2026-03-04 19:52:25'),(1,80,40,'2026-03-04 19:52:25'),(1,81,40,'2026-03-04 19:52:25'),(1,82,40,'2026-03-04 19:52:25'),(1,83,40,'2026-03-04 19:52:25'),(1,84,40,'2026-03-04 19:52:25'),(1,85,40,'2026-03-04 19:52:25'),(1,86,40,'2026-03-04 19:52:25'),(1,87,40,'2026-03-04 19:52:25'),(1,88,40,'2026-03-04 19:52:25'),(1,89,40,'2026-03-04 19:52:25'),(1,90,40,'2026-03-04 19:52:25'),(1,91,40,'2026-03-04 19:52:25'),(1,92,40,'2026-03-04 19:52:25'),(1,93,40,'2026-03-04 19:52:25'),(1,94,40,'2026-03-04 19:52:25'),(1,95,40,'2026-03-04 19:52:25'),(1,96,40,'2026-03-04 19:52:25'),(1,97,40,'2026-03-04 19:52:25'),(1,98,40,'2026-03-04 19:52:25'),(2,2,1,'2026-03-05 15:40:08'),(2,3,1,'2026-03-05 15:40:23'),(3,1,90,'2026-03-04 19:52:25'),(3,2,89,'2026-03-05 06:32:42'),(3,3,61,'2026-03-04 19:52:25'),(3,4,70,'2026-03-04 19:52:25'),(3,5,110,'2026-03-04 19:52:25'),(3,6,73,'2026-03-05 06:50:35'),(3,7,70,'2026-03-04 19:52:25'),(3,8,110,'2026-03-05 06:50:35'),(3,9,90,'2026-03-04 19:52:25'),(3,10,40,'2026-03-04 19:52:25'),(3,11,40,'2026-03-04 19:52:25'),(3,12,40,'2026-03-04 19:52:25'),(3,13,40,'2026-03-04 19:52:25'),(3,14,40,'2026-03-04 19:52:25'),(3,15,40,'2026-03-04 19:52:25'),(3,16,40,'2026-03-04 19:52:25'),(3,17,70,'2026-03-04 19:52:25'),(3,18,40,'2026-03-04 19:52:25'),(3,19,40,'2026-03-04 19:52:25'),(3,20,40,'2026-03-04 19:52:25'),(3,21,40,'2026-03-04 19:52:25'),(3,22,40,'2026-03-04 19:52:25'),(3,23,40,'2026-03-04 19:52:25'),(3,24,40,'2026-03-04 19:52:25'),(3,25,40,'2026-03-04 19:52:25'),(3,26,40,'2026-03-04 19:52:25'),(3,27,40,'2026-03-04 19:52:25'),(3,28,40,'2026-03-04 19:52:25'),(3,29,40,'2026-03-04 19:52:25'),(3,30,40,'2026-03-04 19:52:25'),(3,31,40,'2026-03-04 19:52:25'),(3,32,40,'2026-03-04 19:52:25'),(3,33,40,'2026-03-04 19:52:25'),(3,34,40,'2026-03-04 19:52:25'),(3,35,40,'2026-03-04 19:52:25'),(3,36,40,'2026-03-04 19:52:25'),(3,37,40,'2026-03-04 19:52:25'),(3,38,40,'2026-03-04 19:52:25'),(3,39,40,'2026-03-04 19:52:25'),(3,40,40,'2026-03-04 19:52:25'),(3,41,40,'2026-03-04 19:52:25'),(3,42,40,'2026-03-04 19:52:25'),(3,43,40,'2026-03-04 19:52:25'),(3,44,40,'2026-03-04 19:52:25'),(3,45,40,'2026-03-04 19:52:25'),(3,46,40,'2026-03-04 19:52:25'),(3,47,40,'2026-03-04 19:52:25'),(3,48,40,'2026-03-04 19:52:25'),(3,49,40,'2026-03-04 19:52:25'),(3,50,40,'2026-03-04 19:52:25'),(3,51,40,'2026-03-04 19:52:25'),(3,52,40,'2026-03-04 19:52:25'),(3,53,40,'2026-03-04 19:52:25'),(3,54,40,'2026-03-04 19:52:25'),(3,55,40,'2026-03-04 19:52:25'),(3,56,40,'2026-03-04 19:52:25'),(3,57,40,'2026-03-04 19:52:25'),(3,58,40,'2026-03-04 19:52:25'),(3,59,69,'2026-03-04 19:52:25'),(3,60,40,'2026-03-04 19:52:25'),(3,61,40,'2026-03-04 19:52:25'),(3,62,40,'2026-03-04 19:52:25'),(3,63,40,'2026-03-04 19:52:25'),(3,64,40,'2026-03-04 19:52:25'),(3,65,40,'2026-03-04 19:52:25'),(3,66,40,'2026-03-04 19:52:25'),(3,67,40,'2026-03-04 19:52:25'),(3,68,40,'2026-03-04 19:52:25'),(3,69,40,'2026-03-04 19:52:25'),(3,70,40,'2026-03-04 19:52:25'),(3,71,40,'2026-03-04 19:52:25'),(3,72,40,'2026-03-04 19:52:25'),(3,73,40,'2026-03-04 19:52:25'),(3,74,40,'2026-03-04 19:52:25'),(3,75,40,'2026-03-04 19:52:25'),(3,76,40,'2026-03-04 19:52:25'),(3,77,40,'2026-03-04 19:52:25'),(3,78,40,'2026-03-04 19:52:25'),(3,79,40,'2026-03-04 19:52:25'),(3,80,40,'2026-03-04 19:52:25'),(3,81,40,'2026-03-04 19:52:25'),(3,82,40,'2026-03-04 19:52:25'),(3,83,40,'2026-03-04 19:52:25'),(3,84,40,'2026-03-04 19:52:25'),(3,85,40,'2026-03-04 19:52:25'),(3,86,40,'2026-03-04 19:52:25'),(3,87,40,'2026-03-04 19:52:25'),(3,88,40,'2026-03-04 19:52:25'),(3,89,40,'2026-03-04 19:52:25'),(3,90,40,'2026-03-04 19:52:25'),(3,91,40,'2026-03-04 19:52:25'),(3,92,40,'2026-03-04 19:52:25'),(3,93,40,'2026-03-04 19:52:25'),(3,94,40,'2026-03-04 19:52:25'),(3,95,40,'2026-03-04 19:52:25'),(3,96,73,'2026-03-04 19:52:25'),(3,97,40,'2026-03-04 19:52:25'),(3,98,40,'2026-03-04 19:52:25'),(5,1,80,'2026-03-04 19:52:25'),(5,2,40,'2026-03-04 19:52:25'),(5,3,85,'2026-03-04 19:52:25'),(5,4,40,'2026-03-04 19:52:25'),(5,5,90,'2026-03-04 19:52:25'),(5,6,40,'2026-03-04 19:52:25'),(5,7,75,'2026-03-04 19:52:25'),(5,8,40,'2026-03-04 19:52:25'),(5,9,40,'2026-03-04 19:52:25'),(5,10,40,'2026-03-04 19:52:25'),(5,11,80,'2026-03-04 19:52:25'),(5,12,40,'2026-03-04 19:52:25'),(5,13,40,'2026-03-04 19:52:25'),(5,14,40,'2026-03-04 19:52:25'),(5,15,40,'2026-03-04 19:52:25'),(5,16,40,'2026-03-04 19:52:25'),(5,17,40,'2026-03-04 19:52:25'),(5,18,40,'2026-03-04 19:52:25'),(5,19,40,'2026-03-04 19:52:25'),(5,20,40,'2026-03-04 19:52:25'),(5,21,40,'2026-03-04 19:52:25'),(5,22,40,'2026-03-04 19:52:25'),(5,23,40,'2026-03-04 19:52:25'),(5,24,40,'2026-03-04 19:52:25'),(5,25,40,'2026-03-04 19:52:25'),(5,26,40,'2026-03-04 19:52:25'),(5,27,40,'2026-03-04 19:52:25'),(5,28,40,'2026-03-04 19:52:25'),(5,29,40,'2026-03-04 19:52:25'),(5,30,40,'2026-03-04 19:52:25'),(5,31,40,'2026-03-04 19:52:25'),(5,32,40,'2026-03-04 19:52:25'),(5,33,40,'2026-03-04 19:52:25'),(5,34,40,'2026-03-04 19:52:25'),(5,35,40,'2026-03-04 19:52:25'),(5,36,40,'2026-03-04 19:52:25'),(5,37,40,'2026-03-04 19:52:25'),(5,38,40,'2026-03-04 19:52:25'),(5,39,40,'2026-03-04 19:52:25'),(5,40,40,'2026-03-04 19:52:25'),(5,41,40,'2026-03-04 19:52:25'),(5,42,40,'2026-03-04 19:52:25'),(5,43,40,'2026-03-04 19:52:25'),(5,44,40,'2026-03-04 19:52:25'),(5,45,40,'2026-03-04 19:52:25'),(5,46,40,'2026-03-04 19:52:25'),(5,47,40,'2026-03-04 19:52:25'),(5,48,40,'2026-03-04 19:52:25'),(5,49,40,'2026-03-04 19:52:25'),(5,50,40,'2026-03-04 19:52:25'),(5,51,40,'2026-03-04 19:52:25'),(5,52,40,'2026-03-04 19:52:25'),(5,53,40,'2026-03-04 19:52:25'),(5,54,40,'2026-03-04 19:52:25'),(5,55,40,'2026-03-04 19:52:25'),(5,56,40,'2026-03-04 19:52:25'),(5,57,40,'2026-03-04 19:52:25'),(5,58,40,'2026-03-04 19:52:25'),(5,59,40,'2026-03-04 19:52:25'),(5,60,40,'2026-03-04 19:52:25'),(5,61,40,'2026-03-04 19:52:25'),(5,62,40,'2026-03-04 19:52:25'),(5,63,40,'2026-03-04 19:52:25'),(5,64,40,'2026-03-04 19:52:25'),(5,65,40,'2026-03-04 19:52:25'),(5,66,40,'2026-03-04 19:52:25'),(5,67,40,'2026-03-04 19:52:25'),(5,68,40,'2026-03-04 19:52:25'),(5,69,40,'2026-03-04 19:52:25'),(5,70,40,'2026-03-04 19:52:25'),(5,71,40,'2026-03-04 19:52:25'),(5,72,40,'2026-03-04 19:52:25'),(5,73,40,'2026-03-04 19:52:25'),(5,74,40,'2026-03-04 19:52:25'),(5,75,40,'2026-03-04 19:52:25'),(5,76,40,'2026-03-04 19:52:25'),(5,77,40,'2026-03-04 19:52:25'),(5,78,40,'2026-03-04 19:52:25'),(5,79,40,'2026-03-04 19:52:25'),(5,80,40,'2026-03-04 19:52:25'),(5,81,40,'2026-03-04 19:52:25'),(5,82,40,'2026-03-04 19:52:25'),(5,83,40,'2026-03-04 19:52:25'),(5,84,40,'2026-03-04 19:52:25'),(5,85,40,'2026-03-04 19:52:25'),(5,86,40,'2026-03-04 19:52:25'),(5,87,40,'2026-03-04 19:52:25'),(5,88,40,'2026-03-04 19:52:25'),(5,89,40,'2026-03-04 19:52:25'),(5,90,40,'2026-03-04 19:52:25'),(5,91,40,'2026-03-04 19:52:25'),(5,92,40,'2026-03-04 19:52:25'),(5,93,40,'2026-03-04 19:52:25'),(5,94,40,'2026-03-04 19:52:25'),(5,95,40,'2026-03-04 19:52:25'),(5,96,40,'2026-03-04 19:52:25'),(5,97,40,'2026-03-04 19:52:25'),(5,98,40,'2026-03-04 19:52:25'),(6,6,20,'2026-03-05 10:21:23'),(6,7,20,'2026-03-05 10:21:23');
/*!40000 ALTER TABLE `ton_kho_chi_tiet` ENABLE KEYS */;
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
-- Temporary view structure for view `v_cham_cong_bat_thuong`
--

DROP TABLE IF EXISTS `v_cham_cong_bat_thuong`;
/*!50001 DROP VIEW IF EXISTS `v_cham_cong_bat_thuong`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_cham_cong_bat_thuong` AS SELECT 
 1 AS `MaNV`,
 1 AS `HoTen`,
 1 AS `Nam`,
 1 AS `Thang`,
 1 AS `SoLanTre`,
 1 AS `SoLanVeSom`,
 1 AS `QuenChamRa`,
 1 AS `TongGioTangCa`,
 1 AS `TongNgayChamCong`*/;
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
INSERT INTO `xin_nghi_phep` VALUES (1,2,'Nghi_khong_phep','2026-01-29','2026-01-31','đff','proof-1769693499068-744203656.png','Da_duyet',2,'2026-03-01 18:23:41','2026-01-29 20:31:39'),(2,3,'Nghi_phep','2026-01-31','2026-02-01','','proof-1769823827777-420781202.png','Da_duyet',2,'2026-02-09 17:24:55','2026-01-31 08:43:47');
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
-- Final view structure for view `v_cham_cong_bat_thuong`
--

/*!50001 DROP VIEW IF EXISTS `v_cham_cong_bat_thuong`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_cham_cong_bat_thuong` AS select `nv`.`MaNV` AS `MaNV`,`nv`.`HoTen` AS `HoTen`,year(`cc`.`Ngay`) AS `Nam`,month(`cc`.`Ngay`) AS `Thang`,sum((case when (`cc`.`TrangThai` = 'Tre') then 1 else 0 end)) AS `SoLanTre`,sum((case when (`cc`.`TrangThai` = 'Ve_som') then 1 else 0 end)) AS `SoLanVeSom`,sum((case when ((`cc`.`GioRa` is null) and (`cc`.`GioVao` is not null)) then 1 else 0 end)) AS `QuenChamRa`,sum(`cc`.`SoGioTangCa`) AS `TongGioTangCa`,count(`cc`.`MaCC`) AS `TongNgayChamCong` from (`cham_cong` `cc` join `nhanvien` `nv` on((`cc`.`MaNV` = `nv`.`MaNV`))) group by `nv`.`MaNV`,`nv`.`HoTen`,year(`cc`.`Ngay`),month(`cc`.`Ngay`) */;
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

-- Dump completed on 2026-03-11 17:25:53
