-- =====================================================
-- Script: Thêm các chức năng còn thiếu vào hệ thống
-- Mục đích: Đồng bộ database với constants trong code
-- =====================================================

-- Kiểm tra xem các chức năng đã tồn tại chưa
SELECT MaCN, TenCN FROM chucnang WHERE MaCN IN (28, 29, 30);

-- Nếu chưa tồn tại, thêm vào
INSERT IGNORE INTO chucnang (MaCN, TenCN, MaCha, URL, Icon, ThuTu, TinhTrang) VALUES
(28, 'Quản lý chi nhánh', 18, '/sales/branches', 'store', 5, 1),
(29, 'Quản lý tác giả', 12, '/warehouse/authors', 'person', 6, 1),
(30, 'Quản lý khuyến mãi', 18, '/sales/promotions', 'local_offer', 6, 1);

-- Hoặc nếu MySQL không hỗ trợ IGNORE, dùng:
-- INSERT INTO chucnang (MaCN, TenCN, MaCha, URL, Icon, ThuTu, TinhTrang) 
-- SELECT 28, 'Quản lý chi nhánh', 18, '/sales/branches', 'store', 5, 1
-- WHERE NOT EXISTS (SELECT 1 FROM chucnang WHERE MaCN = 28);

-- INSERT INTO chucnang (MaCN, TenCN, MaCha, URL, Icon, ThuTu, TinhTrang) 
-- SELECT 29, 'Quản lý tác giả', 12, '/warehouse/authors', 'person', 6, 1
-- WHERE NOT EXISTS (SELECT 1 FROM chucnang WHERE MaCN = 29);

-- INSERT INTO chucnang (MaCN, TenCN, MaCha, URL, Icon, ThuTu, TinhTrang) 
-- SELECT 30, 'Quản lý khuyến mãi', 18, '/sales/promotions', 'local_offer', 6, 1
-- WHERE NOT EXISTS (SELECT 1 FROM chucnang WHERE MaCN = 30);

-- Kiểm tra lại
SELECT * FROM chucnang WHERE MaCN >= 28 ORDER BY MaCN;

-- =====================================================
-- Lưu ý: 
-- - MaCN 28: Quản lý chi nhánh (branches) - thuộc module Bán hàng
-- - MaCN 29: Quản lý tác giả (authors) - thuộc module Kho
-- - MaCN 30: Quản lý khuyến mãi (promotions) - thuộc module Bán hàng
-- 
-- Sau khi chạy script này, bạn cần:
-- 1. Cấp quyền cho các nhóm quyền phù hợp trong bảng phanquyen_chitiet
-- 2. Update frontend để sử dụng đúng các MaCN này
-- =====================================================
