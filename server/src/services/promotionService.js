import pool from '../config/connectDatabase.js';

/**
 * Service tính toán và xử lý khuyến mãi
 * Sử dụng trong POS và tạo hóa đơn
 */
class PromotionService {
    /**
     * Kiểm tra và lấy tất cả khuyến mãi có thể áp dụng cho đơn hàng
     * @param {Object} order - Thông tin đơn hàng { MaCH, TongTien, ChiTiet, MaKH }
     * @returns {Array} Danh sách khuyến mãi có thể áp dụng
     */
    async getAvailablePromotions(order) {
        const { MaCH, TongTien, ChiTiet, MaKH } = order;
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
            const isValid = await this.validatePromotion(promo, order, dayOfWeek, currentTime);

            if (isValid) {
                const giaTriGiam = await this.calculateDiscount(promo, TongTien, ChiTiet);
                
                availablePromotions.push({
                    ...promo,
                    giaTriGiamDuKien: giaTriGiam,
                    tongSauGiam: TongTien - giaTriGiam
                });
            }
        }

        // Sắp xếp theo giá trị giảm (cao nhất lên đầu)
        availablePromotions.sort((a, b) => b.giaTriGiamDuKien - a.giaTriGiamDuKien);

        return availablePromotions;
    }

    /**
     * Kiểm tra tính hợp lệ của một khuyến mãi
     */
    async validatePromotion(promo, order, dayOfWeek, currentTime) {
        const { TongTien, ChiTiet } = order;

        // Kiểm tra giá trị đơn tối thiểu
        if (promo.GiaTriDonToiThieu && TongTien < promo.GiaTriDonToiThieu) {
            return false;
        }

        // Kiểm tra ngày trong tuần
        if (promo.NgayApDung) {
            const allowedDays = promo.NgayApDung.split(',').map(d => parseInt(d.trim()));
            if (!allowedDays.includes(dayOfWeek)) {
                return false;
            }
        }

        // Kiểm tra giờ áp dụng
        if (promo.GioApDung) {
            const [startTime, endTime] = promo.GioApDung.split('-');
            if (currentTime < startTime || currentTime > endTime) {
                return false;
            }
        }

        // Kiểm tra sản phẩm/thể loại
        if (promo.ApDungCho === 'San_pham' || promo.ApDungCho === 'The_loai') {
            const hasValidProduct = await this.checkProductEligibility(promo, ChiTiet);
            if (!hasValidProduct) {
                return false;
            }
        }

        return true;
    }

    /**
     * Kiểm tra xem giỏ hàng có sản phẩm được áp dụng KM không
     */
    async checkProductEligibility(promo, chiTiet) {
        const [details] = await pool.query(`
            SELECT MaDoiTuong FROM chi_tiet_km_sanpham 
            WHERE MaKM = ? AND LoaiDoiTuong = ?
        `, [promo.MaKM, promo.ApDungCho]);

        const allowedIds = details.map(d => d.MaDoiTuong);

        for (const item of chiTiet) {
            if (promo.ApDungCho === 'San_pham' && allowedIds.includes(item.MaSP)) {
                return true;
            } else if (promo.ApDungCho === 'The_loai') {
                const [product] = await pool.query('SELECT MaTL FROM sanpham WHERE MaSP = ?', [item.MaSP]);
                if (product.length > 0 && allowedIds.includes(product[0].MaTL)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Tính toán giá trị giảm giá
     */
    async calculateDiscount(promo, tongTien, chiTiet) {
        let giaTriGiam = 0;

        if (promo.LoaiKM === 'giam_phan_tram' || promo.LoaiKM === 'giam_gio_vang') {
            // Giảm theo phần trăm
            if (promo.ApDungCho === 'Tat_ca') {
                // Giảm toàn đơn
                giaTriGiam = (tongTien * promo.GiaTriGiam) / 100;
            } else {
                // Giảm theo sản phẩm/thể loại cụ thể
                giaTriGiam = await this.calculatePartialDiscount(promo, chiTiet);
            }

            // Áp dụng giảm tối đa
            if (promo.GiamToiDa && giaTriGiam > promo.GiamToiDa) {
                giaTriGiam = promo.GiamToiDa;
            }

        } else if (promo.LoaiKM === 'giam_tien') {
            // Giảm cố định
            giaTriGiam = promo.GiaTriGiam;
        }

        return Math.round(giaTriGiam); // Làm tròn
    }

    /**
     * Tính giảm giá cho sản phẩm/thể loại cụ thể
     */
    async calculatePartialDiscount(promo, chiTiet) {
        const [details] = await pool.query(`
            SELECT MaDoiTuong FROM chi_tiet_km_sanpham 
            WHERE MaKM = ? AND LoaiDoiTuong = ?
        `, [promo.MaKM, promo.ApDungCho]);

        const allowedIds = details.map(d => d.MaDoiTuong);
        let tongTienDuocGiam = 0;

        for (const item of chiTiet) {
            let isEligible = false;

            if (promo.ApDungCho === 'San_pham' && allowedIds.includes(item.MaSP)) {
                isEligible = true;
            } else if (promo.ApDungCho === 'The_loai') {
                const [product] = await pool.query('SELECT MaTL FROM sanpham WHERE MaSP = ?', [item.MaSP]);
                if (product.length > 0 && allowedIds.includes(product[0].MaTL)) {
                    isEligible = true;
                }
            }

            if (isEligible) {
                tongTienDuocGiam += item.DonGia * item.SoLuong;
            }
        }

        return (tongTienDuocGiam * promo.GiaTriGiam) / 100;
    }

    /**
     * Kiểm tra và validate mã giảm giá
     */
    async validateVoucher(maCode, order) {
        const { MaKH, TongTien, ChiTiet, MaCH } = order;

        // Lấy thông tin mã
        const [vouchers] = await pool.query(`
            SELECT mgg.*, km.*
            FROM ma_giam_gia mgg
            JOIN khuyen_mai km ON mgg.MaKM = km.MaKM
            WHERE mgg.MaCode = ? AND mgg.TrangThai = 1 AND km.TrangThai = 1
        `, [maCode]);

        if (vouchers.length === 0) {
            return { success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' };
        }

        const voucher = vouchers[0];

        // Kiểm tra số lượng
        if (voucher.SoLuongPhatHanh !== null && voucher.DaSuDung >= voucher.SoLuongPhatHanh) {
            return { success: false, message: 'Mã giảm giá đã hết số lượng' };
        }

        // Kiểm tra thời gian
        const now = new Date();
        if (now < new Date(voucher.NgayBatDau) || now > new Date(voucher.NgayKetThuc)) {
            return { success: false, message: 'Mã giảm giá đã hết hạn' };
        }

        // Kiểm tra khách hàng mới
        if (voucher.ApDungChoKHMoi && MaKH) {
            const [orders] = await pool.query(
                'SELECT COUNT(*) as count FROM hoadon WHERE MaKH = ? AND TrangThai = "Hoan_thanh"', 
                [MaKH]
            );
            if (orders[0].count > 0) {
                return { success: false, message: 'Mã này chỉ dành cho khách hàng mới' };
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
                return { 
                    success: false, 
                    message: `Bạn đã dùng hết số lần sử dụng mã này (${voucher.SoLanDungMoiKH} lần)` 
                };
            }
        }

        // Kiểm tra điều kiện
        if (voucher.GiaTriDonToiThieu && TongTien < voucher.GiaTriDonToiThieu) {
            return { 
                success: false, 
                message: `Đơn hàng tối thiểu ${voucher.GiaTriDonToiThieu.toLocaleString()}đ` 
            };
        }

        // Kiểm tra ngày, giờ, sản phẩm
        const dayOfWeek = now.getDay();
        const currentTime = now.toTimeString().slice(0, 5);
        const isValid = await this.validatePromotion(voucher, order, dayOfWeek, currentTime);

        if (!isValid) {
            return { success: false, message: 'Mã giảm giá không áp dụng cho đơn hàng này' };
        }

        // Tính giá trị giảm
        const giaTriGiam = await this.calculateDiscount(voucher, TongTien, ChiTiet);

        return { 
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
        };
    }

    /**
     * Chọn khuyến mãi tốt nhất cho đơn hàng
     */
    async getBestPromotion(order) {
        const promotions = await this.getAvailablePromotions(order);
        
        if (promotions.length === 0) {
            return null;
        }

        // Đã sắp xếp theo giá trị giảm giảm dần rồi, lấy cái đầu tiên
        return promotions[0];
    }

    /**
     * Lưu lịch sử sử dụng khuyến mãi
     */
    async saveUsage(data, connection = null) {
        const { MaHD, MaKM, MaMGG, MaKH, LoaiKM, GiaTriGiam, TongTienTruocGiam, TongTienSauGiam, MaNV } = data;

        const conn = connection || await pool.getConnection();
        const shouldReleaseConnection = !connection;

        try {
            if (!connection) await conn.beginTransaction();

            // 1. Lưu lịch sử
            await conn.query(`
                INSERT INTO su_dung_khuyen_mai 
                (MaHD, MaKM, MaMGG, MaKH, LoaiKM, GiaTriGiam, TongTienTruocGiam, TongTienSauGiam, MaNV)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [MaHD, MaKM, MaMGG, MaKH, LoaiKM, GiaTriGiam, TongTienTruocGiam, TongTienSauGiam, MaNV]);

            // 2. Cập nhật số lần sử dụng khuyến mãi
            await conn.query('UPDATE khuyen_mai SET SoLanDaSuDung = SoLanDaSuDung + 1 WHERE MaKM = ?', [MaKM]);

            // 3. Cập nhật số lượng mã giảm giá đã dùng (nếu có)
            if (MaMGG) {
                await conn.query('UPDATE ma_giam_gia SET DaSuDung = DaSuDung + 1 WHERE MaMGG = ?', [MaMGG]);
            }

            if (!connection) await conn.commit();

            return { success: true };
        } catch (error) {
            if (!connection) await conn.rollback();
            throw error;
        } finally {
            if (shouldReleaseConnection) conn.release();
        }
    }

    /**
     * Format thông tin khuyến mãi để hiển thị
     */
    formatPromotionInfo(promo) {
        let info = promo.TenKM;

        if (promo.LoaiKM === 'giam_phan_tram') {
            info += ` - Giảm ${promo.GiaTriGiam}%`;
            if (promo.GiamToiDa) {
                info += ` (tối đa ${promo.GiamToiDa.toLocaleString()}đ)`;
            }
        } else if (promo.LoaiKM === 'giam_tien') {
            info += ` - Giảm ${promo.GiaTriGiam.toLocaleString()}đ`;
        }

        if (promo.GiaTriDonToiThieu) {
            info += ` cho đơn từ ${promo.GiaTriDonToiThieu.toLocaleString()}đ`;
        }

        return info;
    }
}

export default new PromotionService();
