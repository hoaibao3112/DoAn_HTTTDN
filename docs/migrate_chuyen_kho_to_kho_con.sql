-- ============================================================
-- Migration: Đổi chuyen_kho từ cấp chi nhánh → cấp kho con
-- Trạng thái DB hiện tại (Dump 05/03/2026):
--   - FK ibfk_1, ibfk_2 (tham chiếu cua_hang) ĐÃ bị xóa rồi
--   - Cột vẫn tên MaCHNguon / MaCHDich, không có FK
-- Chỉ cần đổi tên + thêm FK mới → chạy 2 bước dưới
-- ============================================================

-- Bước 1: Đổi tên cột
ALTER TABLE chuyen_kho
    CHANGE COLUMN MaCHNguon MaKhoNguon INT DEFAULT NULL COMMENT 'Kho con nguồn (kho_con.MaKho)',
    CHANGE COLUMN MaCHDich  MaKhoDich  INT DEFAULT NULL COMMENT 'Kho con đích (kho_con.MaKho)';

-- Bước 2: Thêm FK mới tham chiếu kho_con
ALTER TABLE chuyen_kho
    ADD CONSTRAINT fk_ck_kho_nguon FOREIGN KEY (MaKhoNguon) REFERENCES kho_con (MaKho),
    ADD CONSTRAINT fk_ck_kho_dich  FOREIGN KEY (MaKhoDich)  REFERENCES kho_con (MaKho);

-- Xong! Dữ liệu cũ (MaCHNguon=1→Kho1, MaCHDich=2→Kho2) hợp lệ vì kho_con có MaKho 1,2.
