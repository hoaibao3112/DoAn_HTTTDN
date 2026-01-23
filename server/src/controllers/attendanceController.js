import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const attendanceController = {
    // ======================= GET ATTENDANCE RECORDS =======================
    getAllAttendance: async (req, res) => {
        const { page = 1, pageSize = 20, MaNV, startDate, endDate, TrangThai } = req.query;
        const offset = (page - 1) * pageSize;

        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (MaNV) {
                whereClause += ' AND cc.MaNV = ?';
                params.push(MaNV);
            }
            if (startDate) {
                whereClause += ' AND cc.Ngay >= ?';
                params.push(startDate);
            }
            if (endDate) {
                whereClause += ' AND cc.Ngay <= ?';
                params.push(endDate);
            }
            if (TrangThai) {
                whereClause += ' AND cc.TrangThai = ?';
                params.push(TrangThai);
            }

            const [rows] = await pool.query(
                `SELECT cc.*, nv.HoTen, nv.ChucVu
                 FROM cham_cong cc
                 JOIN nhanvien nv ON cc.MaNV = nv.MaNV
                 ${whereClause}
                 ORDER BY cc.Ngay DESC, cc.GioVao DESC
                 LIMIT ? OFFSET ?`,
                [...params, parseInt(pageSize), offset]
            );

            const [total] = await pool.query(
                `SELECT COUNT(*) as total FROM cham_cong cc ${whereClause}`,
                params
            );

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: total[0].total
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= GET MY ATTENDANCE =======================
    getMyAttendance: async (req, res) => {
        const { startDate, endDate } = req.query;
        try {
            let whereClause = 'WHERE n.MaTK = ?';
            const params = [req.user.MaTK];

            if (startDate) {
                whereClause += ' AND cc.Ngay >= ?';
                params.push(startDate);
            }
            if (endDate) {
                whereClause += ' AND cc.Ngay <= ?';
                params.push(endDate);
            }

            const [rows] = await pool.query(
                `SELECT cc.* 
                 FROM cham_cong cc
                 JOIN nhanvien n ON cc.MaNV = n.MaNV
                 ${whereClause}
                 ORDER BY cc.Ngay DESC`,
                params
            );

            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= CHECK IN =======================
    checkIn: async (req, res) => {
        const { Ngay, GioVao, GhiChu } = req.body;

        try {
            // Get employee MaNV
            const [emp] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            if (emp.length === 0) {
                return res.status(400).json({ success: false, message: 'Nhân viên không tồn tại' });
            }

            const MaNV = emp[0].MaNV;
            const checkDate = Ngay || new Date().toISOString().split('T')[0];
            const checkTime = GioVao || new Date().toTimeString().split(' ')[0];

            // Check if already checked in today
            const [existing] = await pool.query(
                'SELECT * FROM cham_cong WHERE MaNV = ? AND Ngay = ?',
                [MaNV, checkDate]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn đã chấm công vào hôm nay rồi'
                });
            }

            // Determine status (Late if after 8:30 AM)
            const hourMinute = checkTime.substring(0, 5);
            const TrangThai = hourMinute > '08:30' ? 'Tre' : 'Di_lam';

            const [result] = await pool.query(
                `INSERT INTO cham_cong (MaNV, Ngay, GioVao, TrangThai, GhiChu, CreatedBy)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [MaNV, checkDate, checkTime, TrangThai, GhiChu, req.user.TenTK]
            );

            res.json({
                success: true,
                MaCC: result.insertId,
                message: TrangThai === 'Tre' ? 'Chấm công thành công (Đi trễ)' : 'Chấm công thành công',
                data: { Ngay: checkDate, GioVao: checkTime, TrangThai }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= CHECK OUT =======================
    checkOut: async (req, res) => {
        const { Ngay, GioRa, SoGioTangCa, GhiChu } = req.body;

        try {
            // Get employee MaNV
            const [emp] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            if (emp.length === 0) {
                return res.status(400).json({ success: false, message: 'Nhân viên không tồn tại' });
            }

            const MaNV = emp[0].MaNV;
            const checkDate = Ngay || new Date().toISOString().split('T')[0];
            const checkTime = GioRa || new Date().toTimeString().split(' ')[0];

            // Find today's attendance record
            const [attendance] = await pool.query(
                'SELECT * FROM cham_cong WHERE MaNV = ? AND Ngay = ?',
                [MaNV, checkDate]
            );

            if (attendance.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn chưa chấm công vào. Vui lòng chấm công vào trước.'
                });
            }

            if (attendance[0].GioRa) {
                return res.status(400).json({
                    success: false,
                    message: 'Bạn đã chấm công ra rồi'
                });
            }

            // Calculate work hours
            const gioVao = attendance[0].GioVao;
            const [hourIn, minIn] = gioVao.split(':').map(Number);
            const [hourOut, minOut] = checkTime.split(':').map(Number);

            const totalMinutes = (hourOut * 60 + minOut) - (hourIn * 60 + minIn);
            const soGioLam = (totalMinutes / 60).toFixed(2);

            await pool.query(
                `UPDATE cham_cong 
                 SET GioRa = ?, SoGioLam = ?, SoGioTangCa = ?, GhiChu = COALESCE(?, GhiChu)
                 WHERE MaCC = ?`,
                [checkTime, soGioLam, SoGioTangCa || 0, GhiChu, attendance[0].MaCC]
            );

            res.json({
                success: true,
                message: 'Chấm công ra thành công',
                data: { Ngay: checkDate, GioRa: checkTime, SoGioLam: soGioLam }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= MANUAL ATTENDANCE (Admin) =======================
    createAttendance: async (req, res) => {
        const { MaNV, Ngay, GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu } = req.body;

        // Validation
        if (!MaNV || !Ngay || !GioVao) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin: MaNV, Ngay, GioVao là bắt buộc'
            });
        }

        try {
            // Check duplicate
            const [existing] = await pool.query(
                'SELECT * FROM cham_cong WHERE MaNV = ? AND Ngay = ?',
                [MaNV, Ngay]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Đã tồn tại bản ghi chấm công cho nhân viên này vào ngày này'
                });
            }

            const [result] = await pool.query(
                `INSERT INTO cham_cong (MaNV, Ngay, GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, CreatedBy)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [MaNV, Ngay, GioVao, GioRa, SoGioLam || 0, SoGioTangCa || 0, TrangThai || 'Di_lam', GhiChu, req.user.TenTK]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'cham_cong',
                MaBanGhi: result.insertId,
                DuLieuMoi: { MaNV, Ngay, GioVao },
                DiaChi_IP: req.ip
            });

            res.json({ success: true, MaCC: result.insertId, message: 'Tạo bản ghi chấm công thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= UPDATE ATTENDANCE =======================
    updateAttendance: async (req, res) => {
        const { id } = req.params;
        const { GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu } = req.body;

        try {
            const [oldData] = await pool.query('SELECT * FROM cham_cong WHERE MaCC = ?', [id]);
            if (oldData.length === 0) {
                return res.status(404).json({ success: false, message: 'Bản ghi chấm công không tồn tại' });
            }

            await pool.query(
                `UPDATE cham_cong 
                 SET GioVao = ?, GioRa = ?, SoGioLam = ?, SoGioTangCa = ?, TrangThai = ?, GhiChu = ?
                 WHERE MaCC = ?`,
                [GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'cham_cong',
                MaBanGhi: id,
                DuLieuCu: JSON.stringify(oldData[0]),
                DuLieuMoi: JSON.stringify({ GioVao, GioRa, TrangThai }),
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật chấm công thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= DELETE ATTENDANCE =======================
    deleteAttendance: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('DELETE FROM cham_cong WHERE MaCC = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Bản ghi chấm công không tồn tại' });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'cham_cong',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Xóa bản ghi chấm công thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= ATTENDANCE SUMMARY =======================
    getAttendanceSummary: async (req, res) => {
        const { MaNV, month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Thiếu tham số: month, year' });
        }

        try {
            let whereClause = 'WHERE MONTH(Ngay) = ? AND YEAR(Ngay) = ?';
            const params = [month, year];

            if (MaNV) {
                whereClause += ' AND MaNV = ?';
                params.push(MaNV);
            }

            const [summary] = await pool.query(
                `SELECT 
                    MaNV,
                    COUNT(*) as TongNgayChamCong,
                    SUM(CASE WHEN TrangThai = 'Di_lam' THEN 1 ELSE 0 END) as SoNgayDiLam,
                    SUM(CASE WHEN TrangThai = 'Tre' THEN 1 ELSE 0 END) as SoNgayTre,
                    SUM(CASE WHEN TrangThai = 'Nghi_phep' THEN 1 ELSE 0 END) as SoNgayNghiPhep,
                    SUM(CASE WHEN TrangThai = 'Nghi_khong_phep' THEN 1 ELSE 0 END) as SoNgayNghiKhongPhep,
                    SUM(SoGioLam) as TongGioLam,
                    SUM(SoGioTangCa) as TongGioTangCa
                 FROM cham_cong
                 ${whereClause}
                 GROUP BY MaNV`,
                params
            );

            res.json({ success: true, data: summary });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default attendanceController;
