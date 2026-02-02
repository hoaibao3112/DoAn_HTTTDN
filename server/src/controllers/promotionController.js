import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const promotionController = {
    // ======================= 1. QUẢN LÝ CHƯƠNG TRÌNH KHUYẾN MÃI =======================

    // 1.1 Lấy danh sách tất cả khuyến mãi
    getAllPromotions: async (req, res) => {
        try {
            const [promotions] = await pool.query(`
                SELECT 
                    km.*,
                    ch.TenCH,
                    COUNT(DISTINCT sdkm.MaSD) as SoLanDung,
                    SUM(sdkm.GiaTriGiam) as TongTienGiam
                FROM khuyen_mai km
                LEFT JOIN cua_hang ch ON km.MaCH = ch.MaCH
                LEFT JOIN su_dung_khuyen_mai sdkm ON km.MaKM = sdkm.MaKM
                GROUP BY km.MaKM
                ORDER BY km.TrangThai DESC, km.NgayBatDau DESC
            `);

            res.json({ success: true, data: promotions });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 1.2 Lấy chi tiết một khuyến mãi
    getPromotionById: async (req, res) => {
        const { id } = req.params;
        try {
            const [promotion] = await pool.query(`
                SELECT km.*, ch.TenCH
                FROM khuyen_mai km
                LEFT JOIN cua_hang ch ON km.MaCH = ch.MaCH
                WHERE km.MaKM = ?
            `, [id]);

            if (promotion.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi' });
            }

            // Lấy danh sách sản phẩm/thể loại được áp dụng
            const [details] = await pool.query(`
                SELECT 
                    ct.*,
                    CASE 
                        WHEN ct.LoaiDoiTuong = 'San_pham' THEN sp.TenSP
                        WHEN ct.LoaiDoiTuong = 'The_loai' THEN tl.TenTL
                    END as TenDoiTuong
                FROM chi_tiet_km_sanpham ct
                LEFT JOIN sanpham sp ON ct.LoaiDoiTuong = 'San_pham' AND ct.MaDoiTuong = sp.MaSP
                LEFT JOIN theloai tl ON ct.LoaiDoiTuong = 'The_loai' AND ct.MaDoiTuong = tl.MaTL
                WHERE ct.MaKM = ?
            `, [id]);

            // Lấy danh sách mã giảm giá
            const [vouchers] = await pool.query(`
                SELECT * FROM ma_giam_gia WHERE MaKM = ?
            `, [id]);

            res.json({ 
                success: true, 
                data: {
                    ...promotion[0],
                    chiTiet: details,
                    maGiamGia: vouchers
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 1.3 Tạo chương trình khuyến mãi mới
    createPromotion: async (req, res) => {
        const {
            TenKM, MoTa, LoaiKM, GiaTriGiam, GiamToiDa, GiaTriDonToiThieu,
            NgayBatDau, NgayKetThuc, GioApDung, NgayApDung,
            ApDungCho, MaCH, ChiTiet, MaGiamGia
        } = req.body;

        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 1. Tạo khuyến mãi
            const [result] = await conn.query(`
                INSERT INTO khuyen_mai 
                (TenKM, MoTa, LoaiKM, GiaTriGiam, GiamToiDa, GiaTriDonToiThieu,
                 NgayBatDau, NgayKetThuc, GioApDung, NgayApDung, ApDungCho, MaCH, TrangThai)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [TenKM, MoTa, LoaiKM, GiaTriGiam, GiamToiDa, GiaTriDonToiThieu,
                NgayBatDau, NgayKetThuc, GioApDung, NgayApDung, ApDungCho, MaCH]);

            const MaKM = result.insertId;

            // 2. Thêm chi tiết sản phẩm/thể loại (nếu có)
            if (ChiTiet && ChiTiet.length > 0) {
                const chiTietValues = ChiTiet.map(ct => [MaKM, ct.LoaiDoiTuong, ct.MaDoiTuong]);
                await conn.query(`
                    INSERT INTO chi_tiet_km_sanpham (MaKM, LoaiDoiTuong, MaDoiTuong)
                    VALUES ?
                `, [chiTietValues]);
            }

            // 3. Thêm mã giảm giá (nếu có)
            if (MaGiamGia && MaGiamGia.length > 0) {
                const voucherValues = MaGiamGia.map(v => [
                    MaKM, v.MaCode, v.SoLuongPhatHanh, v.SoLanDungMoiKH, v.ApDungChoKHMoi
                ]);
                await conn.query(`
                    INSERT INTO ma_giam_gia (MaKM, MaCode, SoLuongPhatHanh, SoLanDungMoiKH, ApDungChoKHMoi)
                    VALUES ?
                `, [voucherValues]);
            }

            await conn.commit();

            // Log activity
            await logActivity(req.user.MaTK, 'CREATE', 'khuyen_mai', MaKM, 
                `Tạo chương trình khuyến mãi: ${TenKM}`);

            res.json({ success: true, message: 'Tạo khuyến mãi thành công', MaKM });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    // 1.4 Cập nhật khuyến mãi
    updatePromotion: async (req, res) => {
        const { id } = req.params;
        const {
            TenKM, MoTa, LoaiKM, GiaTriGiam, GiamToiDa, GiaTriDonToiThieu,
            NgayBatDau, NgayKetThuc, GioApDung, NgayApDung,
            ApDungCho, MaCH, TrangThai, ChiTiet, MaGiamGia
        } = req.body;

        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 1. Cập nhật khuyến mãi
            await conn.query(`
                UPDATE khuyen_mai SET
                    TenKM = ?, MoTa = ?, LoaiKM = ?, GiaTriGiam = ?, 
                    GiamToiDa = ?, GiaTriDonToiThieu = ?,
                    NgayBatDau = ?, NgayKetThuc = ?, GioApDung = ?, NgayApDung = ?,
                    ApDungCho = ?, MaCH = ?, TrangThai = ?
                WHERE MaKM = ?
            `, [TenKM, MoTa, LoaiKM, GiaTriGiam, GiamToiDa, GiaTriDonToiThieu,
                NgayBatDau, NgayKetThuc, GioApDung, NgayApDung, ApDungCho, MaCH, TrangThai, id]);

            // 2. Xóa và thêm lại chi tiết (nếu có)
            if (ChiTiet !== undefined) {
                await conn.query('DELETE FROM chi_tiet_km_sanpham WHERE MaKM = ?', [id]);
                if (ChiTiet.length > 0) {
                    const chiTietValues = ChiTiet.map(ct => [id, ct.LoaiDoiTuong, ct.MaDoiTuong]);
                    await conn.query(`
                        INSERT INTO chi_tiet_km_sanpham (MaKM, LoaiDoiTuong, MaDoiTuong)
                        VALUES ?
                    `, [chiTietValues]);
                }
            }

            await conn.commit();

            await logActivity(req.user.MaTK, 'UPDATE', 'khuyen_mai', id, 
                `Cập nhật khuyến mãi: ${TenKM}`);

            res.json({ success: true, message: 'Cập nhật khuyến mãi thành công' });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    // 1.5 Xóa khuyến mãi
    deletePromotion: async (req, res) => {
        const { id } = req.params;
        try {
            // Kiểm tra xem có hóa đơn nào dùng khuyến mãi này chưa
            const [used] = await pool.query(
                'SELECT COUNT(*) as count FROM su_dung_khuyen_mai WHERE MaKM = ?', [id]
            );

            if (used[0].count > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Không thể xóa khuyến mãi đã được sử dụng. Hãy tạm dừng thay vì xóa.' 
                });
            }

            await pool.query('DELETE FROM khuyen_mai WHERE MaKM = ?', [id]);

            await logActivity(req.user.MaTK, 'DELETE', 'khuyen_mai', id, 
                `Xóa chương trình khuyến mãi`);

            res.json({ success: true, message: 'Xóa khuyến mãi thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 1.6 Bật/Tắt khuyến mãi
    togglePromotion: async (req, res) => {
        const { id } = req.params;
        const { TrangThai } = req.body;

        try {
            await pool.query('UPDATE khuyen_mai SET TrangThai = ? WHERE MaKM = ?', [TrangThai, id]);

            await logActivity(req.user.MaTK, 'UPDATE', 'khuyen_mai', id, 
                `${TrangThai ? 'Kích hoạt' : 'Tạm dừng'} khuyến mãi`);

            res.json({ success: true, message: `${TrangThai ? 'Kích hoạt' : 'Tạm dừng'} thành công` });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= 2. QUẢN LÝ MÃ GIẢM GIÁ =======================

    // 2.1 Lấy tất cả mã giảm giá
    getAllVouchers: async (req, res) => {
        try {
            const [vouchers] = await pool.query(`
                SELECT 
                    mgg.*,
                    km.TenKM,
                    km.LoaiKM,
                    km.GiaTriGiam,
                    (mgg.SoLuongPhatHanh - mgg.DaSuDung) as ConLai
                FROM ma_giam_gia mgg
                JOIN khuyen_mai km ON mgg.MaKM = km.MaKM
                ORDER BY mgg.TrangThai DESC, mgg.NgayTao DESC
            `);

            res.json({ success: true, data: vouchers });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2.2 Tạo mã giảm giá mới
    createVoucher: async (req, res) => {
        const { MaKM, MaCode, SoLuongPhatHanh, SoLanDungMoiKH, ApDungChoKHMoi } = req.body;

        try {
            // Kiểm tra mã đã tồn tại chưa
            const [existing] = await pool.query('SELECT MaMGG FROM ma_giam_gia WHERE MaCode = ?', [MaCode]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Mã giảm giá đã tồn tại' });
            }

            const [result] = await pool.query(`
                INSERT INTO ma_giam_gia (MaKM, MaCode, SoLuongPhatHanh, SoLanDungMoiKH, ApDungChoKHMoi)
                VALUES (?, ?, ?, ?, ?)
            `, [MaKM, MaCode, SoLuongPhatHanh, SoLanDungMoiKH, ApDungChoKHMoi]);

            await logActivity(req.user.MaTK, 'CREATE', 'ma_giam_gia', result.insertId, 
                `Tạo mã giảm giá: ${MaCode}`);

            res.json({ success: true, message: 'Tạo mã giảm giá thành công', MaMGG: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2.3 Xóa mã giảm giá
    deleteVoucher: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM ma_giam_gia WHERE MaMGG = ?', [id]);

            await logActivity(req.user.MaTK, 'DELETE', 'ma_giam_gia', id, 
                `Xóa mã giảm giá`);

            res.json({ success: true, message: 'Xóa mã giảm giá thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= 3. ÁP DỤNG KHUYẾN MÃI (TẠI POS) =======================

    // 3.1 Kiểm tra khuyến mãi có thể áp dụng cho đơn hàng
    checkAvailablePromotions: async (req, res) => {
        const { MaCH, TongTien, ChiTiet, MaKH } = req.body;

        try {
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0 = CN, 1 = T2, ...
            const currentTime = now.toTimeString().slice(0, 5); // HH:MM

            // Lấy tất cả khuyến mãi đang hoạt động
            const [promotions] = await pool.query(`
                SELECT km.* 
                FROM khuyen_mai km
                WHERE km.TrangThai = 1
                AND (km.MaCH IS NULL OR km.MaCH = ?)
                AND km.NgayBatDau <= NOW()
                AND km.NgayKetThuc >= NOW()
            `, [MaCH]);

            const availablePromotions = [];

            for (const promo of promotions) {
                let isValid = true;

                // Kiểm tra giá trị đơn tối thiểu
                if (promo.GiaTriDonToiThieu && TongTien < promo.GiaTriDonToiThieu) {
                    isValid = false;
                }

                // Kiểm tra ngày trong tuần
                if (promo.NgayApDung && isValid) {
                    const allowedDays = promo.NgayApDung.split(',').map(d => parseInt(d.trim()));
                    if (!allowedDays.includes(dayOfWeek)) {
                        isValid = false;
                    }
                }

                // Kiểm tra giờ áp dụng
                if (promo.GioApDung && isValid) {
                    const [startTime, endTime] = promo.GioApDung.split('-');
                    if (currentTime < startTime || currentTime > endTime) {
                        isValid = false;
                    }
                }

                // Kiểm tra sản phẩm/thể loại
                if (promo.ApDungCho === 'San_pham' || promo.ApDungCho === 'The_loai') {
                    const [details] = await pool.query(`
                        SELECT MaDoiTuong FROM chi_tiet_km_sanpham 
                        WHERE MaKM = ? AND LoaiDoiTuong = ?
                    `, [promo.MaKM, promo.ApDungCho]);

                    const allowedIds = details.map(d => d.MaDoiTuong);
                    
                    // Kiểm tra xem có sản phẩm nào trong giỏ được áp dụng không
                    let hasValidProduct = false;
                    for (const item of ChiTiet) {
                        if (promo.ApDungCho === 'San_pham' && allowedIds.includes(item.MaSP)) {
                            hasValidProduct = true;
                            break;
                        } else if (promo.ApDungCho === 'The_loai') {
                            const [product] = await pool.query('SELECT MaTL FROM sanpham WHERE MaSP = ?', [item.MaSP]);
                            if (product.length > 0 && allowedIds.includes(product[0].MaTL)) {
                                hasValidProduct = true;
                                break;
                            }
                        }
                    }
                    if (!hasValidProduct) {
                        isValid = false;
                    }
                }

                if (isValid) {
                    // Tính giá trị giảm dự kiến
                    let giaTriGiam = 0;
                    if (promo.LoaiKM === 'giam_phan_tram' || promo.LoaiKM === 'giam_gio_vang') {
                        giaTriGiam = (TongTien * promo.GiaTriGiam) / 100;
                        if (promo.GiamToiDa && giaTriGiam > promo.GiamToiDa) {
                            giaTriGiam = promo.GiamToiDa;
                        }
                    } else if (promo.LoaiKM === 'giam_tien') {
                        giaTriGiam = promo.GiaTriGiam;
                    }

                    availablePromotions.push({
                        ...promo,
                        giaTriGiamDuKien: giaTriGiam,
                        tongSauGiam: TongTien - giaTriGiam
                    });
                }
            }

            // Sắp xếp theo giá trị giảm (cao nhất lên đầu)
            availablePromotions.sort((a, b) => b.giaTriGiamDuKien - a.giaTriGiamDuKien);

            res.json({ success: true, data: availablePromotions });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3.2 Kiểm tra và áp dụng mã giảm giá
    validateVoucher: async (req, res) => {
        const { MaCode, MaKH, TongTien, ChiTiet, MaCH } = req.body;

        try {
            // Lấy thông tin mã
            const [vouchers] = await pool.query(`
                SELECT mgg.*, km.*
                FROM ma_giam_gia mgg
                JOIN khuyen_mai km ON mgg.MaKM = km.MaKM
                WHERE mgg.MaCode = ? AND mgg.TrangThai = 1
            `, [MaCode]);

            if (vouchers.length === 0) {
                return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
            }

            const voucher = vouchers[0];

            // Kiểm tra số lượng
            if (voucher.SoLuongPhatHanh !== null && voucher.DaSuDung >= voucher.SoLuongPhatHanh) {
                return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết số lượng' });
            }

            // Kiểm tra thời gian
            const now = new Date();
            if (now < new Date(voucher.NgayBatDau) || now > new Date(voucher.NgayKetThuc)) {
                return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn' });
            }

            // Kiểm tra khách hàng mới
            if (voucher.ApDungChoKHMoi && MaKH) {
                const [orders] = await pool.query('SELECT COUNT(*) as count FROM hoadon WHERE MaKH = ?', [MaKH]);
                if (orders[0].count > 0) {
                    return res.status(400).json({ success: false, message: 'Mã này chỉ dành cho khách hàng mới' });
                }
            }

            // Kiểm tra số lần đã dùng của khách hàng
            if (MaKH) {
                const [used] = await pool.query(`
                    SELECT COUNT(*) as count 
                    FROM su_dung_khuyen_mai sdkm
                    JOIN hoadon hd ON sdkm.MaHD = hd.MaHD
                    WHERE sdkm.MaMGG = ? AND hd.MaKH = ?
                `, [voucher.MaMGG, MaKH]);

                if (used[0].count >= voucher.SoLanDungMoiKH) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Bạn đã dùng hết số lần sử dụng mã này (${voucher.SoLanDungMoiKH} lần)` 
                    });
                }
            }

            // Kiểm tra điều kiện giống checkAvailablePromotions
            if (voucher.GiaTriDonToiThieu && TongTien < voucher.GiaTriDonToiThieu) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Đơn hàng tối thiểu ${voucher.GiaTriDonToiThieu.toLocaleString()}đ` 
                });
            }

            // Tính giá trị giảm
            let giaTriGiam = 0;
            if (voucher.LoaiKM === 'giam_phan_tram' || voucher.LoaiKM === 'giam_gio_vang') {
                giaTriGiam = (TongTien * voucher.GiaTriGiam) / 100;
                if (voucher.GiamToiDa && giaTriGiam > voucher.GiamToiDa) {
                    giaTriGiam = voucher.GiamToiDa;
                }
            } else if (voucher.LoaiKM === 'giam_tien') {
                giaTriGiam = voucher.GiaTriGiam;
            }

            res.json({ 
                success: true, 
                message: 'Mã giảm giá hợp lệ',
                data: {
                    MaKM: voucher.MaKM,
                    MaMGG: voucher.MaMGG,
                    TenKM: voucher.TenKM,
                    LoaiKM: voucher.LoaiKM,
                    GiaTriGiam: giaTriGiam,
                    TongSauGiam: TongTien - giaTriGiam
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3.3 Lưu lịch sử sử dụng khuyến mãi (gọi sau khi tạo hóa đơn)
    savePromotionUsage: async (req, res) => {
        const { MaHD, MaKM, MaMGG, MaKH, LoaiKM, GiaTriGiam, TongTienTruocGiam, TongTienSauGiam } = req.body;

        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 1. Lưu lịch sử
            await conn.query(`
                INSERT INTO su_dung_khuyen_mai 
                (MaHD, MaKM, MaMGG, MaKH, LoaiKM, GiaTriGiam, TongTienTruocGiam, TongTienSauGiam, MaNV)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [MaHD, MaKM, MaMGG, MaKH, LoaiKM, GiaTriGiam, TongTienTruocGiam, TongTienSauGiam, req.user.MaTK]);

            // 2. Cập nhật số lần sử dụng khuyến mãi
            await conn.query('UPDATE khuyen_mai SET SoLanDaSuDung = SoLanDaSuDung + 1 WHERE MaKM = ?', [MaKM]);

            // 3. Cập nhật số lượng mã giảm giá đã dùng (nếu có)
            if (MaMGG) {
                await conn.query('UPDATE ma_giam_gia SET DaSuDung = DaSuDung + 1 WHERE MaMGG = ?', [MaMGG]);
            }

            await conn.commit();

            res.json({ success: true, message: 'Lưu lịch sử khuyến mãi thành công' });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    // ======================= 4. BÁO CÁO & THỐNG KÊ =======================

    // 4.1 Thống kê hiệu quả khuyến mãi
    getPromotionStatistics: async (req, res) => {
        const { startDate, endDate, MaKM } = req.query;

        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (startDate && endDate) {
                whereClause += ' AND sdkm.NgaySuDung BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            if (MaKM) {
                whereClause += ' AND sdkm.MaKM = ?';
                params.push(MaKM);
            }

            const [stats] = await pool.query(`
                SELECT 
                    km.MaKM,
                    km.TenKM,
                    km.LoaiKM,
                    COUNT(DISTINCT sdkm.MaHD) as SoDonHang,
                    COUNT(DISTINCT sdkm.MaKH) as SoKhachHang,
                    SUM(sdkm.GiaTriGiam) as TongTienGiam,
                    SUM(sdkm.TongTienTruocGiam) as TongDoanhThuTruocGiam,
                    SUM(sdkm.TongTienSauGiam) as TongDoanhThuSauGiam,
                    AVG(sdkm.GiaTriGiam) as GiaTriGiamTrungBinh,
                    MIN(sdkm.NgaySuDung) as NgayDauTien,
                    MAX(sdkm.NgaySuDung) as NgayCuoiCung
                FROM khuyen_mai km
                LEFT JOIN su_dung_khuyen_mai sdkm ON km.MaKM = sdkm.MaKM
                ${whereClause}
                GROUP BY km.MaKM
                ORDER BY TongTienGiam DESC
            `, params);

            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4.2 Lịch sử sử dụng khuyến mãi
    getPromotionHistory: async (req, res) => {
        const { page = 1, limit = 50, MaKM, MaKH } = req.query;
        const offset = (page - 1) * limit;

        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (MaKM) {
                whereClause += ' AND sdkm.MaKM = ?';
                params.push(MaKM);
            }

            if (MaKH) {
                whereClause += ' AND sdkm.MaKH = ?';
                params.push(MaKH);
            }

            const [history] = await pool.query(`
                SELECT 
                    sdkm.*,
                    km.TenKM,
                    hd.MaHD,
                    kh.TenKH,
                    nv.HoTen as TenNV,
                    mgg.MaCode
                FROM su_dung_khuyen_mai sdkm
                JOIN khuyen_mai km ON sdkm.MaKM = km.MaKM
                JOIN hoadon hd ON sdkm.MaHD = hd.MaHD
                LEFT JOIN khachhang kh ON sdkm.MaKH = kh.MaKH
                LEFT JOIN nhanvien nv ON sdkm.MaNV = nv.MaNV
                LEFT JOIN ma_giam_gia mgg ON sdkm.MaMGG = mgg.MaMGG
                ${whereClause}
                ORDER BY sdkm.NgaySuDung DESC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(limit), offset]);

            const [[{ total }]] = await pool.query(`
                SELECT COUNT(*) as total FROM su_dung_khuyen_mai sdkm ${whereClause}
            `, params);

            res.json({ 
                success: true, 
                data: history,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4.3 Top khách hàng sử dụng khuyến mãi nhiều nhất
    getTopCustomers: async (req, res) => {
        const { startDate, endDate, limit = 10 } = req.query;

        try {
            let whereClause = '';
            const params = [];

            if (startDate && endDate) {
                whereClause = 'WHERE sdkm.NgaySuDung BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            const [customers] = await pool.query(`
                SELECT 
                    kh.MaKH,
                    kh.TenKH,
                    kh.SDT,
                    COUNT(DISTINCT sdkm.MaHD) as SoDonHang,
                    COUNT(DISTINCT sdkm.MaKM) as SoKMDaSuDung,
                    SUM(sdkm.GiaTriGiam) as TongTienTietKiem
                FROM su_dung_khuyen_mai sdkm
                JOIN khachhang kh ON sdkm.MaKH = kh.MaKH
                ${whereClause}
                GROUP BY kh.MaKH
                ORDER BY TongTienTietKiem DESC
                LIMIT ?
            `, [...params, parseInt(limit)]);

            res.json({ success: true, data: customers });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default promotionController;
