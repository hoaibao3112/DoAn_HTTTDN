-- ============================================================================
-- DỮ LIỆU MẪU CHO HỆ THỐNG QUẢN LÝ CỬA HÀNG SÁCH OFFLINE
-- Tạo ngày: 2026-01-23
-- ============================================================================

USE bansach_offline;

-- Tắt kiểm tra foreign key tạm thời để insert dễ dàng hơn
SET FOREIGN_KEY_CHECKS=0;

-- ============================================================================
-- 1. CỬA HÀNG (cua_hang)
-- ============================================================================
INSERT INTO `cua_hang` (`TenCH`, `DiaChi`, `SDT`, `Email`, `TrangThai`, `NgayMo`) VALUES
('Chi nhánh Quận 1', '123 Nguyễn Huệ, Quận 1, TP.HCM', '0283822123', 'q1@bansach.vn', 1, '2020-01-15'),
('Chi nhánh Quận 7', '456 Nguyễn Văn Linh, Quận 7, TP.HCM', '0283666456', 'q7@bansach.vn', 1, '2021-03-20'),
('Chi nhánh Thủ Đức', '789 Xa lộ Hà Nội, Thủ Đức, TP.HCM', '0283999789', 'thuduc@bansach.vn', 1, '2022-06-10');

-- ============================================================================
-- 2. NHÀ XUẤT BẢN (nhaxuatban)
-- ============================================================================
INSERT INTO `nhaxuatban` (`TenNXB`, `DiaChi`, `SDT`, `Email`, `TinhTrang`) VALUES
('NXB Trẻ', '161B Lý Chính Thắng, Quận 3, TP.HCM', '02839316289', 'nxbtre@nxbtre.com.vn', 1),
('NXB Kim Đồng', '55 Quang Trung, Hai Bà Trưng, Hà Nội', '02439434730', 'info@nxbkimdong.com.vn', 1),
('NXB Văn học', '18 Nguyễn Trường Tộ, Ba Đình, Hà Nội', '02437163100', 'nxbvanhoc@gmail.com', 1),
('NXB Dân Trí', '9 Phạm Ngọc Thạch, Đống Đa, Hà Nội', '02462592088', 'lienhe@nxbdantri.com.vn', 1),
('NXB Tổng hợp TP.HCM', '62 Nguyễn Thị Minh Khai, Quận 1, TP.HCM', '02838225340', 'tonghop@nxbhcm.com.vn', 1);

-- ============================================================================
-- 3. THỂ LOẠI (theloai)
-- ============================================================================
INSERT INTO `theloai` (`TenTL`, `MoTa`, `TinhTrang`) VALUES
('Văn học Việt Nam', 'Tiểu thuyết, truyện ngắn của tác giả Việt Nam', 1),
('Văn học nước ngoài', 'Tác phẩm văn học được dịch từ nước ngoài', 1),
('Kinh tế - Kinh doanh', 'Sách về quản trị, marketing, khởi nghiệp', 1),
('Kỹ năng sống', 'Sách phát triển bản thân, kỹ năng mềm', 1),
('Thiếu nhi', 'Truyện tranh, truyện cổ tích cho trẻ em', 1),
('Khoa học - Công nghệ', 'Sách về khoa học, lập trình, công nghệ', 1),
('Lịch sử - Chính trị', 'Sách về lịch sử Việt Nam và thế giới', 1),
('Tâm lý - Triết học', 'Sách về tâm lý học, triết học', 1);

-- ============================================================================
-- 4. TÁC GIẢ (tacgia)
-- ============================================================================
INSERT INTO `tacgia` (`TenTG`, `MoTa`, `TinhTrang`) VALUES
('Nguyễn Nhật Ánh', 'Nhà văn Việt Nam nổi tiếng với các tác phẩm thiếu nhi', 1),
('Tô Hoài', 'Nhà văn Việt Nam, tác giả Dế Mèn phiêu lưu ký', 1),
('Nam Cao', 'Nhà văn hiện thực phê phán', 1),
('Dale Carnegie', 'Tác giả người Mỹ, chuyên về kỹ năng giao tiếp', 1),
('Tony Buổi Sáng', 'Tác giả Việt Nam, chuyên về kỹ năng sống', 1),
('Haruki Murakami', 'Nhà văn Nhật Bản nổi tiếng', 1),
('J.K. Rowling', 'Tác giả series Harry Potter', 1),
('Paulo Coelho', 'Nhà văn Brazil, tác giả Nhà giả kim', 1),
('Nguyễn Du', 'Đại thi hào Việt Nam, tác giả Truyện Kiều', 1),
('Thích Nhất Hạnh', 'Thiền sư Việt Nam nổi tiếng thế giới', 1);

-- ============================================================================
-- 5. SẢN PHẨM (sanpham)
-- ============================================================================
INSERT INTO `sanpham` (`TenSP`, `MoTa`, `DonGia`, `GiaNhap`, `MaTL`, `MaTG`, `MaNXB`, `NamXB`, `SoTrang`, `ISBN`, `TinhTrang`) VALUES
('Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Truyện dài của Nguyễn Nhật Ánh về tuổi thơ miền Trung', 115000, 80000, 1, 1, 1, 2022, 368, '978-604-1-00000-1', 1),
('Cho Tôi Xin Một Vé Đi Tuổi Thơ', 'Tác phẩm văn học về ký ức tuổi thơ', 95000, 65000, 1, 1, 1, 2021, 280, '978-604-1-00000-2', 1),
('Dế Mèn Phiêu Lưu Ký', 'Tác phẩm kinh điển của văn học thiếu nhi VN', 75000, 50000, 5, 2, 2, 2020, 196, '978-604-2-00000-1', 1),
('Lão Hạc', 'Truyện ngắn nổi tiếng của Nam Cao', 55000, 35000, 1, 3, 3, 2023, 120, '978-604-3-00000-1', 1),
('Đắc Nhân Tâm', 'Sách kỹ năng giao tiếp và ứng xử', 135000, 90000, 4, 4, 1, 2022, 320, '978-604-1-00001-1', 1),
('Trên Đường Băng', 'Kỹ năng sống của Tony Buổi Sáng', 105000, 70000, 4, 5, 4, 2021, 256, '978-604-4-00000-1', 1),
('Rừng Na Uy', 'Tiểu thuyết của Haruki Murakami', 145000, 100000, 2, 6, 3, 2023, 448, '978-604-3-00001-1', 1),
('Harry Potter và Hòn Đá Phù Thủy', 'Tập 1 series Harry Potter', 175000, 120000, 2, 7, 1, 2022, 368, '978-604-1-00002-1', 1),
('Nhà Giả Kim', 'Tác phẩm nổi tiếng của Paulo Coelho', 95000, 60000, 2, 8, 3, 2021, 227, '978-604-3-00002-1', 1),
('Truyện Kiều', 'Tác phẩm kinh điển của Nguyễn Du', 85000, 55000, 1, 9, 3, 2023, 256, '978-604-3-00003-1', 1),
('Đường Xưa Mây Trắng', 'Cuộc đời Đức Phật - Thích Nhất Hạnh', 125000, 85000, 8, 10, 5, 2022, 512, '978-604-5-00000-1', 1),
('Totto-Chan Bên Cửa Sổ', 'Hồi ký tuổi thơ tại Nhật Bản', 88000, 58000, 5, 6, 2, 2021, 268, '978-604-2-00001-1', 1),
('Cà Phê Cùng Tony', 'Sách kỹ năng sống', 98000, 65000, 4, 5, 4, 2023, 212, '978-604-4-00001-1', 1),
('Tuổi Trẻ Đáng Giá Bao Nhiêu', 'Sách về tuổi trẻ và đam mê', 85000, 55000, 4, 5, 4, 2020, 192, '978-604-4-00002-1', 1),
('Sapiens: Lịch Sử Loài Người', 'Tóm tắt lịch sử nhân loại', 195000, 135000, 7, 6, 5, 2022, 512, '978-604-5-00001-1', 1);

-- ============================================================================
-- 6. NHÀ CUNG CẤP (nhacungcap)
-- ============================================================================
INSERT INTO `nhacungcap` (`TenNCC`, `DiaChi`, `SDT`, `Email`, `MaSoThue`, `NguoiLienHe`, `TinhTrang`) VALUES
('Công ty TNHH Sách Văn hóa', '456 Lê Lợi, Quận 1, TP.HCM', '0283456789', 'vanhoa@gmail.com', '0123456789', 'Nguyễn Văn A', 1),
('Công ty CP Sách Tri thức', '789 Hai Bà Trưng, Hà Nội', '0243567890', 'trithuc@gmail.com', '0987654321', 'Trần Thị B', 1),
('Nhà sách Phương Nam', '234 Lý Thường Kiệt, Quận 10, TP.HCM', '0283678901', 'phuongnam@gmail.com', '0112233445', 'Lê Văn C', 1);

-- ============================================================================
-- 7. TÀI KHOẢN VÀ NHÓM QUYỀN - Cần tạo trước để có thể tạo nhân viên
-- ============================================================================

-- Nhóm quyền
INSERT INTO `nhomquyen` (`TenNQ`, `MoTa`, `TinhTrang`) VALUES
('Admin', 'Quản trị viên hệ thống - toàn quyền', 1),
('Quản lý', 'Quản lý cửa hàng', 1),
('Thu ngân', 'Nhân viên thu ngân', 1),
('Kho', 'Nhân viên kho', 1),
('HR', 'Nhân viên nhân sự', 1);

-- Tài khoản (mật khẩu mẫu: "123456" đã hash)
-- Lưu ý: Trong thực tế cần hash password bằng bcrypt
INSERT INTO `taikhoan` (`TenTK`, `MatKhau`, `Email`, `TinhTrang`, `MaNQ`) VALUES
('admin', '$2b$10$YourHashedPasswordHere1', 'admin@bansach.vn', 1, 1),
('quanly01', '$2b$10$YourHashedPasswordHere2', 'quanly01@bansach.vn', 1, 2),
('thungan01', '$2b$10$YourHashedPasswordHere3', 'thungan01@bansach.vn', 1, 3),
('kho01', '$2b$10$YourHashedPasswordHere4', 'kho01@bansach.vn', 1, 4),
('hr01', '$2b$10$YourHashedPasswordHere5', 'hr01@bansach.vn', 1, 5);

-- ============================================================================
-- 8. NHÂN VIÊN (nhanvien)
-- ============================================================================
INSERT INTO `nhanvien` (`HoTen`, `Email`, `SDT`, `DiaChi`, `CCCD`, `NgaySinh`, `GioiTinh`, `ChucVu`, `NgayVaoLam`, `LuongCoBan`, `PhuCap`, `MaTK`, `MaCH`, `TinhTrang`) VALUES
('Nguyễn Văn Admin', 'admin@bansach.vn', '0901234567', '123 Lê Lợi, Quận 1, TP.HCM', '001088012345', '1990-05-15', 'Nam', 'Giám đốc', '2020-01-01', 20000000, 5000000, 1, 1, 1),
('Trần Thị Lan', 'quanly01@bansach.vn', '0902345678', '456 Nguyễn Huệ, Quận 1, TP.HCM', '001089123456', '1992-08-20', 'Nữ', 'Quản lý cửa hàng', '2020-02-01', 15000000, 3000000, 2, 1, 1),
('Lê Văn Hùng', 'thungan01@bansach.vn', '0903456789', '789 Lý Thường Kiệt, Quận 10, TP.HCM', '001090234567', '1995-03-10', 'Nam', 'Thu ngân', '2021-03-15', 8000000, 1000000, 3, 1, 1),
('Phạm Thị Mai', 'kho01@bansach.vn', '0904567890', '234 Hai Bà Trưng, Quận 3, TP.HCM', '001091345678', '1993-11-25', 'Nữ', 'Nhân viên kho', '2021-06-01', 7500000, 800000, 4, 1, 1),
('Hoàng Văn Nam', 'hr01@bansach.vn', '0905678901', '567 Trần Hưng Đạo, Quận 1, TP.HCM', '001092456789', '1991-07-18', 'Nam', 'Nhân viên nhân sự', '2020-08-01', 12000000, 2000000, 5, 1, 1);

-- ============================================================================
-- 9. KHÁCH HÀNG (khachhang)
-- ============================================================================
INSERT INTO `khachhang` (`HoTen`, `Email`, `SDT`, `DiaChi`, `NgaySinh`, `GioiTinh`, `LoaiKH`, `DiemTichLuy`, `TongChiTieu`, `TinhTrang`) VALUES
('Vũ Thị Hoa', 'hoa.vu@gmail.com', '0911111111', '123 Điện Biên Phủ, Quận 1, TP.HCM', '1988-04-15', 'Nữ', 'VIP', 1500, 15000000, 1),
('Đặng Văn Long', 'long.dang@yahoo.com', '0912222222', '456 Võ Văn Tần, Quận 3, TP.HCM', '1990-09-20', 'Nam', 'Thường', 800, 8000000, 1),
('Bùi Thị Kim', 'kim.bui@gmail.com', '0913333333', '789 Cách Mạng Tháng 8, Quận 3, TP.HCM', '1995-12-05', 'Nữ', 'Thường', 350, 3500000, 1),
('Phan Minh Tuấn', 'tuan.phan@hotmail.com', '0914444444', '234 Lê Văn Sỹ, Quận 3, TP.HCM', '1992-06-30', 'Nam', 'VIP', 2100, 21000000, 1),
('Võ Thị Nga', 'nga.vo@gmail.com', '0915555555', '567 Phan Xích Long, Phú Nhuận, TP.HCM', '1987-02-14', 'Nữ', 'VVIP', 4500, 45000000, 1);

-- ============================================================================
-- 10. TỒN KHO (ton_kho) - Phân bổ sách cho các chi nhánh
-- ============================================================================
INSERT INTO `ton_kho` (`MaSP`, `MaCH`, `SoLuongTon`, `SoLuongToiThieu`, `ViTri`) VALUES
-- Chi nhánh Quận 1
(1, 1, 50, 10, 'Kệ A1'),
(2, 1, 35, 10, 'Kệ A2'),
(3, 1, 40, 10, 'Kệ B1'),
(4, 1, 25, 10, 'Kệ B2'),
(5, 1, 60, 15, 'Kệ C1'),
(6, 1, 30, 10, 'Kệ C2'),
(7, 1, 20, 10, 'Kệ D1'),
(8, 1, 45, 15, 'Kệ D2'),
(9, 1, 55, 10, 'Kệ E1'),
(10, 1, 30, 10, 'Kệ E2'),
-- Chi nhánh Quận 7
(1, 2, 30, 10, 'Kệ A1'),
(2, 2, 25, 10, 'Kệ A2'),
(5, 2, 40, 10, 'Kệ B1'),
(8, 2, 35, 10, 'Kệ B2'),
(9, 2, 30, 10, 'Kệ C1'),
-- Chi nhánh Thủ Đức
(1, 3, 20, 10, 'Kệ A1'),
(3, 3, 25, 10, 'Kệ A2'),
(5, 3, 30, 10, 'Kệ B1'),
(7, 3, 15, 10, 'Kệ B2'),
(11, 3, 20, 10, 'Kệ C1');

-- ============================================================================
-- 11. CA LÀM VIỆC (ca_lam_viec)
-- ============================================================================
INSERT INTO `ca_lam_viec` (`TenCa`, `GioBatDau`, `GioKetThuc`, `MoTa`) VALUES
('Ca Sáng', '08:00:00', '12:00:00', 'Ca làm việc buổi sáng'),
('Ca Chiều', '13:00:00', '17:00:00', 'Ca làm việc buổi chiều'),
('Ca Tối', '17:30:00', '21:30:00', 'Ca làm việc buổi tối');

-- ============================================================================
-- 12. KHUYẾN MÃI (khuyen_mai)
-- ============================================================================
INSERT INTO `khuyen_mai` (`TenKM`, `MoTa`, `LoaiKM`, `GiaTriGiam`, `GiamToiDa`, `GiaTriDonToiThieu`, `NgayBatDau`, `NgayKetThuc`, `ApDungCho`, `TrangThai`) VALUES
('Giảm 10% đơn hàng trên 500k', 'Giảm 10% cho đơn hàng từ 500,000đ trở lên', 'giam_phan_tram', 10.00, 100000, 500000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'Tat_ca', 1),
('Giảm 50k cho khách hàng mới', 'Giảm 50,000đ cho khách hàng mua lần đầu', 'giam_tien', 50000, 50000, 200000, '2026-01-01 00:00:00', '2026-06-30 23:59:59', 'Khach_hang', 1),
('Sale Tết 2026', 'Giảm 15% tất cả sản phẩm dịp Tết', 'giam_phan_tram', 15.00, 200000, 300000, '2026-01-25 00:00:00', '2026-02-10 23:59:59', 'Tat_ca', 1);

-- ============================================================================
-- BẬT LẠI FOREIGN KEY CHECKS
-- ============================================================================
SET FOREIGN_KEY_CHECKS=1;

-- ============================================================================
-- HOÀN TẤT
-- ============================================================================
SELECT 'Đã thêm dữ liệu mẫu thành công!' as Status;

-- Kiểm tra số lượng bản ghi trong các bảng chính
SELECT 'cua_hang' as BangDuLieu, COUNT(*) as SoLuong FROM cua_hang
UNION ALL SELECT 'nhaxuatban', COUNT(*) FROM nhaxuatban
UNION ALL SELECT 'theloai', COUNT(*) FROM theloai
UNION ALL SELECT 'tacgia', COUNT(*) FROM tacgia
UNION ALL SELECT 'sanpham', COUNT(*) FROM sanpham
UNION ALL SELECT 'nhacungcap', COUNT(*) FROM nhacungcap
UNION ALL SELECT 'nhomquyen', COUNT(*) FROM nhomquyen
UNION ALL SELECT 'taikhoan', COUNT(*) FROM taikhoan
UNION ALL SELECT 'nhanvien', COUNT(*) FROM nhanvien
UNION ALL SELECT 'khachhang', COUNT(*) FROM khachhang
UNION ALL SELECT 'ton_kho', COUNT(*) FROM ton_kho
UNION ALL SELECT 'ca_lam_viec', COUNT(*) FROM ca_lam_viec
UNION ALL SELECT 'khuyen_mai', COUNT(*) FROM khuyen_mai;
