import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const customerController = {
    // ======================= GET ALL CUSTOMERS =======================
    getAllCustomers: async (req, res) => {
        const { search, page = 1, pageSize = 20, hangTV, trangThai, minDiem, maxDiem } = req.query;
        const offset = (page - 1) * pageSize;

        try {
            // Sử dụng view để lấy đầy đủ thông tin loyalty
            let sql = `
                SELECT 
                    kh.MaKH,
                    kh.HoTen,
                    kh.SDT,
                    kh.Email,
                    kh.DiaChi,
                    kh.DiemTichLuy,
                    kh.TongDiemTichLuy,
                    kh.DiemDaDung,
                    kh.HangTV,
                    kh.NgayThamGia,
                    kh.NgayNangHang,
                    kh.TongChiTieu,
                    kh.TrangThai,
                    ud.PhanTramGiam,
                    ud.HeSoTichDiem,
                    ud.GiamSinhNhat,
                    ud.MienPhiShip,
                    ud.ToiDaDungDiem
                FROM khachhang kh
                LEFT JOIN uu_dai_hang_thanh_vien ud ON kh.HangTV COLLATE utf8mb4_unicode_ci = ud.HangTV
                WHERE 1=1
            `;
            const params = [];

            // Tìm kiếm theo tên, SĐT, email
            if (search) {
                sql += ' AND (kh.HoTen LIKE ? OR kh.SDT LIKE ? OR kh.Email LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            // Filter theo hạng thành viên
            if (hangTV) {
                sql += ' AND kh.HangTV = ?';
                params.push(hangTV);
            }

            // Filter theo trạng thái
            if (trangThai !== undefined) {
                sql += ' AND kh.TrangThai = ?';
                params.push(parseInt(trangThai));
            }

            // Filter theo điểm tích lũy
            if (minDiem) {
                sql += ' AND kh.DiemTichLuy >= ?';
                params.push(parseInt(minDiem));
            }

            if (maxDiem) {
                sql += ' AND kh.DiemTichLuy <= ?';
                params.push(parseInt(maxDiem));
            }

            // Sắp xếp theo điểm tích lũy giảm dần
            sql += ' ORDER BY kh.TongDiemTichLuy DESC, kh.HoTen LIMIT ? OFFSET ?';
            params.push(parseInt(pageSize), offset);

            const [rows] = await pool.query(sql, params);

            // Count total
            let countSql = 'SELECT COUNT(*) as total FROM khachhang kh WHERE 1=1';
            const countParams = [];

            if (search) {
                countSql += ' AND (kh.HoTen LIKE ? OR kh.SDT LIKE ? OR kh.Email LIKE ?)';
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm, searchTerm);
            }

            if (hangTV) {
                countSql += ' AND kh.HangTV = ?';
                countParams.push(hangTV);
            }

            if (trangThai !== undefined) {
                countSql += ' AND kh.TrangThai = ?';
                countParams.push(parseInt(trangThai));
            }

            if (minDiem) {
                countSql += ' AND kh.DiemTichLuy >= ?';
                countParams.push(parseInt(minDiem));
            }

            if (maxDiem) {
                countSql += ' AND kh.DiemTichLuy <= ?';
                countParams.push(parseInt(maxDiem));
            }

            const [total] = await pool.query(countSql, countParams);

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: total[0].total,
                    totalPages: Math.ceil(total[0].total / parseInt(pageSize))
                }
            });
        } catch (error) {
            console.error('Error getting customers:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= GET CUSTOMER BY ID =======================
    getCustomerById: async (req, res) => {
        const { id } = req.params;
        try {
            // Lấy thông tin đầy đủ từ view
            const [rows] = await pool.query(
                `SELECT * FROM v_ThongTinHoiVien WHERE MaKH = ?`,
                [id]
            );
            
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
            }

            // Lấy lịch sử mua hàng gần đây
            const [orders] = await pool.query(
                `SELECT MaHD, NgayLap, TongTien, TrangThai, DiemTichLuy, DiemDaDung
                 FROM hoadon 
                 WHERE MaKH = ? 
                 ORDER BY NgayLap DESC 
                 LIMIT 10`,
                [id]
            );

            res.json({ 
                success: true, 
                data: {
                    ...rows[0],
                    recentOrders: orders
                }
            });
        } catch (error) {
            console.error('Error getting customer by ID:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= CREATE CUSTOMER =======================
    createCustomer: async (req, res) => {
        const { HoTen, SDT, Email, DiaChi } = req.body;

        if (!HoTen || !SDT) {
            return res.status(400).json({ success: false, message: 'Họ tên và Số điện thoại là bắt buộc' });
        }

        try {
            // Kiểm tra trùng số điện thoại
            const [existing] = await pool.query(
                'SELECT MaKH FROM khachhang WHERE SDT = ?',
                [SDT]
            );

            if (existing.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Số điện thoại đã tồn tại trong hệ thống' 
                });
            }

            // Tạo khách hàng mới với hạng Đồng mặc định
            const [result] = await pool.query(
                `INSERT INTO khachhang 
                (HoTen, SDT, Email, DiaChi, HangTV, NgayThamGia, DiemTichLuy, TongDiemTichLuy, DiemDaDung, TrangThai) 
                VALUES (?, ?, ?, ?, 'Dong', CURDATE(), 0, 0, 0, 1)`,
                [HoTen, SDT, Email || null, DiaChi || null]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',TrangThai } = req.body;

        try {
            const [oldData] = await pool.query('SELECT * FROM khachhang WHERE MaKH = ?', [id]);
            if (oldData.length === 0) {
                return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
            }

            // Kiểm tra trùng SĐT (nếu có thay đổi)
            if (SDT && SDT !== oldData[0].SDT) {
                const [existing] = await pool.query(
                    'SELECT MaKH FROM khachhang WHERE SDT = ? AND MaKH != ?',
                    [SDT, id]
                );

                if (existing.length > 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Số điện thoại đã được sử dụng bởi khách hàng khác' 
                    });
                }
            }

            // Cập nhật thông tin (KHÔNG cho phép sửa điểm thủ công - phải qua loyalty API)
            await pool.query(
                `UPDATE khachhang 
                 SET HoTen = ?, SDT = ?, Email = ?, DiaChi = ?, TrangThai = ?
                 WHERE MaKH = ?`,
                [
                    HoTen ?? oldData[0].HoTen, 
                    SDT ?? oldData[0].SDT, 
                    Email ?? oldData[0].Email, 
                    DiaChi ?? oldData[0].DiaChi,
                    TrangThai ?? oldData[0].TrangThai,
                    id
                ]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'khachhang',
                MaBanGhi: id,
                DuLieuCu: JSON.stringify(oldData[0]),
                DuLieuMoi: JSON.stringify({ HoTen, SDT, Email, DiaChi, TrangThai }),
                DiaChi_IP: req.ip
            });

            // Lấy thông tin sau khi update
            const [updated] = await pool.query(
                'SELECT * FROM v_ThongTinHoiVien WHERE MaKH = ?',
                [id]
            );

            res.json({ 
                success: true, 
                data: updated[0],
                message: 'Cập nhật thông tin khách hàng thành công' 
            });
        } catch (error) {
            console.error('Error updating customer:', error); (req, res) => {
        const { id } = req.params;
        const { HoTen, SDT, Email, DiaChi, DiemTichLuy, TongChiTieu } = req.body;
Kiểm tra nếu khách hàng đã có lịch sử mua hàng
            const [invoices] = await pool.query('SELECT MaHD FROM hoadon WHERE MaKH = ? LIMIT 1', [id]);
            if (invoices.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa khách hàng đã có lịch sử mua hàng. Vui lòng vô hiệu hóa (TrangThai = 0) thay vì xóa.'
                });
            }

            // Kiểm tra nếu khách hàng có điểm tích lũy
            const [customer] = await pool.query(
                'SELECT DiemTichLuy FROM khachhang WHERE MaKH = ?',
                [id]
            );

            if (customer.length === 0) {
                return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
            }

            if (customer[0].DiemTichLuy > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa khách hàng còn điểm tích lũy. Vui lòng vô hiệu hóa thay vì xóa.'
                });
            }

            const [result] = await pool.query('DELETE FROM khachhang WHERE MaKH = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'khachhang',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Xóa khách hàng thành công' });
        } catch (error) {
            console.error('Error deleting customer:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= TOGGLE CUSTOMER STATUS =======================
    toggleCustomerStatus: async (req, res) => {
        const { id } = req.params;
        try {
            const [customer] = await pool.query('SELECT TrangThai FROM khachhang WHERE MaKH = ?', [id]);
            
            if (customer.length === 0) {
                return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
            }

            const newStatus = customer[0].TrangThai === 1 ? 0 : 1;

            await pool.query(
                'UPDATE khachhang SET TrangThai = ? WHERE MaKH = ?',
                [newStatus, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: newStatus === 1 ? 'KichHoat' : 'VoHieuHoa',
                BangDuLieu: 'khachhang',
                MaBanGhi: id,
                DuLieuMoi: { TrangThai: newStatus },
                DiaChi_IP: req.ip
            });

            res.json({ 
                success: true, 
                message: newStatus === 1 ? 'Kích hoạt khách hàng thành công' : 'Vô hiệu hóa khách hàng thành công',
                trangThai: newStatus
            });
        } catch (error) {
            console.error('Error toggling customer status:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= GET CUSTOMER STATISTICS =======================
    getCustomerStatistics: async (req, res) => {
        try {
            // Thống kê theo hạng
            const [tierStats] = await pool.query(`
                SELECT 
                    HangTV,
                    COUNT(*) as SoLuong,
                    SUM(DiemTichLuy) as TongDiem,
                    AVG(DiemTichLuy) as DiemTrungBinh
                FROM khachhang
                WHERE TrangThai = 1
                GROUP BY HangTV
                ORDER BY FIELD(HangTV, 'Dong', 'Bac', 'Vang', 'Kim_cuong')
            `);

            // Khách hàng mới trong tháng
            const [newCustomers] = await pool.query(`
                SELECT COUNT(*) as total
                FROM khachhang
                WHERE NgayThamGia >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            `);

            // Tổng số khách hàng active
            const [activeCustomers] = await pool.query(`
                SELECT COUNT(*) as total FROM khachhang WHERE TrangThai = 1
            `);

            // Tổng số khách hàng inactive
            const [inactiveCustomers] = await pool.query(`
                SELECT COUNT(*) as total FROM khachhang WHERE TrangThai = 0
            `);

            res.json({
                success: true,
                data: {
                    theoHang: tierStats,
                    khachHangMoi: newCustomers[0].total,
                    tongKhachHangActive: activeCustomers[0].total,
                    tongKhachHangInactive: inactiveCustomers[0].total
                }
            });
        } catch (error) {
            console.error('Error getting customer statistics:', error);
            res.json({ success: true, message: 'Cập nhật thông tin khách hàng thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= DELETE CUSTOMER =======================
    deleteCustomer: async (req, res) => {
        const { id } = req.params;
        try {
            // Check if customer has invoices before deleting (optional, but good practice)
            const [invoices] = await pool.query('SELECT MaHD FROM hoadon WHERE MaKH = ? LIMIT 1', [id]);
            if (invoices.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa khách hàng đã có lịch sử mua hàng. Vui lòng vô hiệu hóa thay vì xóa.'
                });
            }

            const [result] = await pool.query('DELETE FROM khachhang WHERE MaKH = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'khachhang',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Xóa khách hàng thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default customerController;
