-- =====================================================================
-- Script: Thêm chức năng Khuyến mãi + Cấp quyền cho Admin
-- Chạy trong MySQL Workbench, database: bansach_offline
-- =====================================================================

USE bansach_offline;

-- -----------------------------------------------------------
-- BƯỚC 1: Thêm chức năng "Khuyến mãi" vào bảng chucnang
--         MaCN = 31 (khớp với FEATURES.PROMOTIONS = 31 frontend)
-- -----------------------------------------------------------
INSERT INTO `chucnang` (`MaCN`, `TenCN`, `MaCha`, `URL`, `Icon`, `ThuTu`, `TinhTrang`)
VALUES (31, 'Khuyến mãi', NULL, '/admin/khuyenmai', 'local_offer', 31, 1)
ON DUPLICATE KEY UPDATE
    `TenCN` = 'Khuyến mãi',
    `URL` = '/admin/khuyenmai',
    `Icon` = 'local_offer',
    `TinhTrang` = 1;

-- -----------------------------------------------------------
-- BƯỚC 2: Cấp toàn quyền cho Admin (MaNQ = 1) với Khuyến mãi
--         Xem=1, Them=1, Sua=1, Xoa=1, XuatFile=1, Duyet=1
-- -----------------------------------------------------------
INSERT INTO `phanquyen_chitiet` (`MaNQ`, `MaCN`, `Xem`, `Them`, `Sua`, `Xoa`, `XuatFile`, `Duyet`)
VALUES (1, 31, 1, 1, 1, 1, 1, 1)
ON DUPLICATE KEY UPDATE
    `Xem` = 1, `Them` = 1, `Sua` = 1, `Xoa` = 1, `XuatFile` = 1, `Duyet` = 1;

-- -----------------------------------------------------------
-- BƯỚC 3 (Tuỳ chọn): Đặt lại mật khẩu admin thành 123456
--         Hash bcrypt của '123456' với 10 salt rounds
-- -----------------------------------------------------------
UPDATE `taikhoan`
SET `MatKhau` = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy8'
WHERE `TenTK` = 'admin';

-- -----------------------------------------------------------
-- Kiểm tra kết quả
-- -----------------------------------------------------------
SELECT 
    cn.MaCN,
    cn.TenCN,
    nq.TenNQ,
    pq.Xem, pq.Them, pq.Sua, pq.Xoa
FROM phanquyen_chitiet pq
JOIN chucnang cn ON pq.MaCN = cn.MaCN
JOIN nhomquyen nq ON pq.MaNQ = nq.MaNQ
WHERE pq.MaNQ = 1 AND cn.MaCN = 31;
