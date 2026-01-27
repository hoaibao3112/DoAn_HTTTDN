import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const hrController = {
    // ======================= 2.1 EMPLOYEE SELF-SERVICE =======================

    getProfile: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            if (rows.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateProfile: async (req, res) => {
        const { SDT, Email, DiaChi, Anh } = req.body;
        try {
            const [result] = await pool.query(
                'UPDATE nhanvien SET SDT = ?, Email = ?, DiaChi = ?, Anh = ? WHERE MaTK = ?',
                [SDT, Email, DiaChi, Anh, req.user.MaTK]
            );
            res.json({ success: true, message: 'Cập nhật hồ sơ thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    submitLeave: async (req, res) => {
        const { LoaiDon, NgayBatDau, NgayKetThuc, LyDo } = req.body;

        // Validation: No past dates
        if (new Date(NgayBatDau) < new Date().setHours(0, 0, 0, 0)) {
            return res.status(400).json({ success: false, message: 'Ngày bắt đầu không được ở quá khứ' });
        }

        try {
            // Get employee MaNV from MaTK
            const [emp] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            if (emp.length === 0) return res.status(400).json({ success: false, message: 'Nhân viên không tồn tại' });

            await pool.query(
                `INSERT INTO xin_nghi_phep (MaNV, LoaiDon, NgayBatDau, NgayKetThuc, LyDo, TrangThai)
                 VALUES (?, ?, ?, ?, ?, 'Cho_duyet')`,
                [emp[0].MaNV, LoaiDon, NgayBatDau, NgayKetThuc, LyDo]
            );

            res.json({ success: true, message: 'Gửi đơn thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getMyLeave: async (req, res) => {
        try {
            const [rows] = await pool.query(
                'SELECT x.* FROM xin_nghi_phep x JOIN nhanvien n ON x.MaNV = n.MaNV WHERE n.MaTK = ?',
                [req.user.MaTK]
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getMySalary: async (req, res) => {
        const { thang, nam } = req.query;
        try {
            const [rows] = await pool.query(
                'SELECT l.* FROM luong l JOIN nhanvien n ON l.MaNV = n.MaNV WHERE n.MaTK = ? AND l.Thang = ? AND l.Nam = ?',
                [req.user.MaTK, thang, nam]
            );
            res.json({ success: true, data: rows[0] || null });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= 2.2 HR MANAGER =======================

    getAllEmployees: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM nhanvien');
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    addEmployee: async (req, res) => {
        const data = req.body;
        try {
            const [result] = await pool.query(
                `INSERT INTO nhanvien (HoTen, Email, SDT, DiaChi, CCCD, NgaySinh, GioiTinh, ChucVu, NgayVaoLam, LuongCoBan, PhuCap, MaCH, MaTK, TinhTrang)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.HoTen,
                    data.Email || null,
                    data.SDT || null,
                    data.DiaChi || null,
                    data.CCCD || null,
                    data.NgaySinh || null,
                    data.GioiTinh || null,
                    data.ChucVu || null,
                    data.NgayVaoLam || null,
                    data.LuongCoBan || 0,
                    data.PhuCap || 0,
                    data.MaCH || null,
                    data.MaTK || null,
                    data.TinhTrang !== undefined ? data.TinhTrang : 1
                ]
            );
            res.json({ success: true, MaNV: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateEmployee: async (req, res) => {
        const { id } = req.params;
        const data = req.body;
        try {
            await pool.query(
                `UPDATE nhanvien SET 
                    HoTen=?, Email=?, SDT=?, DiaChi=?, CCCD=?, 
                    NgaySinh=?, GioiTinh=?, ChucVu=?, LuongCoBan=?, 
                    PhuCap=?, MaCH=?, TinhTrang=?
                 WHERE MaNV=?`,
                [
                    data.HoTen,
                    data.Email || null,
                    data.SDT || null,
                    data.DiaChi || null,
                    data.CCCD || null,
                    data.NgaySinh || null,
                    data.GioiTinh || null,
                    data.ChucVu || null,
                    data.LuongCoBan || 0,
                    data.PhuCap || 0,
                    data.MaCH || null,
                    data.TinhTrang !== undefined ? data.TinhTrang : 1,
                    id
                ]
            );
            res.json({ success: true, message: 'Updated successfully' });
        } catch (error) {
            console.error('Error updating employee:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteEmployee: async (req, res) => {
        const { id } = req.params;
        try {
            // Soft delete
            await pool.query('UPDATE nhanvien SET TinhTrang = 0, NgayNghiViec = NOW() WHERE MaNV = ?', [id]);
            // Also deactivate account
            await pool.query('UPDATE taikhoan SET TinhTrang = 0 WHERE MaTK = (SELECT MaTK FROM nhanvien WHERE MaNV = ?)', [id]);
            res.json({ success: true, message: 'Employee deactivated' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    changePosition: async (req, res) => {
        const { MaNV, ChucVuMoi, LuongMoi, NgayThayDoi, GhiChu } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const [old] = await conn.query('SELECT ChucVu, LuongCoBan FROM nhanvien WHERE MaNV = ?', [MaNV]);

            await conn.query(
                `INSERT INTO lich_su_chuc_vu (MaNV, ChucVuCu, ChucVuMoi, LuongCu, LuongMoi, NgayThayDoi, GhiChu)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [MaNV, old[0].ChucVu, ChucVuMoi, old[0].LuongCoBan, LuongMoi, NgayThayDoi, GhiChu]
            );

            await conn.query('UPDATE nhanvien SET ChucVu = ?, LuongCoBan = ? WHERE MaNV = ?', [ChucVuMoi, LuongMoi, MaNV]);

            await conn.commit();
            res.json({ success: true, message: 'Thăng chức/Đổi lương thành công' });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    },

    getAllLeaveRequests: async (req, res) => {
        try {
            const [rows] = await pool.query(
                `SELECT x.*, n.HoTen FROM xin_nghi_phep x JOIN nhanvien n ON x.MaNV = n.MaNV WHERE x.TrangThai = 'Cho_duyet'`
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    approveLeave: async (req, res) => {
        const { id } = req.params;
        const { TrangThai, YKienDuyet } = req.body; // Da_duyet, Tu_choi
        try {
            // Get reviewer MaNV from token's MaTK
            const [reviewer] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);

            await pool.query(
                `UPDATE xin_nghi_phep SET TrangThai = ?, NguoiDuyet = ?, NgayDuyet = NOW(), YKienDuyet = ? WHERE id = ?`,
                [TrangThai, reviewer[0]?.MaNV || null, YKienDuyet, id]
            );
            res.json({ success: true, message: 'Duyệt thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    calculateMonthlySalary: async (req, res) => {
        const { month, year } = req.body;
        try {
            // Formula: TongLuong = (LuongCoBan / 26 * SoNgayLam) + PhuCap + Thuong - Phat + (SoGioTangCa * (LuongCoBan / 208) * 1.5)
            // This is a simplified mass-calculation. In reality, we'd loop through employees.
            const [employees] = await pool.query('SELECT MaNV, LuongCoBan, PhuCap FROM nhanvien WHERE TinhTrang = 1');

            for (const emp of employees) {
                // Get attendance stats for the month
                const [stats] = await pool.query(
                    `SELECT 
                        COUNT(CASE WHEN TrangThai = 'Di_lam' THEN 1 END) as DaysWorked,
                        SUM(SoGioTangCa) as OT_Hours
                     FROM cham_cong 
                     WHERE MaNV = ? AND MONTH(Ngay) = ? AND YEAR(Ngay) = ?`,
                    [emp.MaNV, month, year]
                );

                const daysWorked = stats[0].DaysWorked || 0;
                const otHours = stats[0].OT_Hours || 0;

                const base = parseFloat(emp.LuongCoBan);
                const dailyRate = base / 26;
                const hourlyRate = base / 208;

                const tongLuong = (dailyRate * daysWorked) + parseFloat(emp.PhuCap) + (otHours * hourlyRate * 1.5);

                await pool.query(
                    `INSERT INTO luong (MaNV, Thang, Nam, LuongCoBan, PhuCap, SoNgayLam, SoGioTangCa, TongLuong, TrangThai)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Chua_chi_tra')
                     ON DUPLICATE KEY UPDATE TongLuong = VALUES(TongLuong), SoNgayLam = VALUES(SoNgayLam), SoGioTangCa = VALUES(SoGioTangCa)`,
                    [emp.MaNV, month, year, base, emp.PhuCap, daysWorked, otHours, Math.round(tongLuong)]
                );
            }
            res.json({ success: true, message: 'Tính lương hoàn tất' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default hrController;
