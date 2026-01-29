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
            // Get employee MaNV and their assigned Shift (MaCa)
            const [emp] = await pool.query(
                `SELECT nv.MaNV, nv.MaCa, ca.GioBatDau 
                 FROM nhanvien nv 
                 LEFT JOIN ca_lam_viec ca ON nv.MaCa = ca.MaCa 
                 WHERE nv.MaTK = ?`,
                [req.user.MaTK]
            );

            if (emp.length === 0) {
                return res.status(400).json({ success: false, message: 'Nhân viên không tồn tại' });
            }

            const { MaNV, MaCa, GioBatDau } = emp[0];
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

            // Determine status (Late if after Shift start time)
            // Default to 08:30 if no shift found (legacy/fallback)
            const threshold = GioBatDau || '08:30:00';
            const TrangThai = checkTime > threshold ? 'Tre' : 'Di_lam';

            const [result] = await pool.query(
                `INSERT INTO cham_cong (MaNV, MaCa, Ngay, GioVao, TrangThai, GhiChu, CreatedBy)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [MaNV, MaCa || 1, checkDate, checkTime, TrangThai, GhiChu, req.user.TenTK]
            );

            res.json({
                success: true,
                MaCC: result.insertId,
                message: TrangThai === 'Tre' ? 'Chấm công thành công (Đi trễ)' : 'Chấm công thành công',
                data: { Ngay: checkDate, GioVao: checkTime, TrangThai, MaCa: MaCa || 1 }
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

            // Find today's attendance record and join with shift details
            const [attendance] = await pool.query(
                `SELECT cc.*, ca.GioKetThuc, ca.PhutNghi 
                 FROM cham_cong cc
                 LEFT JOIN ca_lam_viec ca ON cc.MaCa = ca.MaCa
                 WHERE cc.MaNV = ? AND cc.Ngay = ?`,
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

            const record = attendance[0];

            // Calculate work hours
            const gioVao = record.GioVao;
            const [hourIn, minIn] = gioVao.split(':').map(Number);
            const [hourOut, minOut] = checkTime.split(':').map(Number);

            let totalMinutes = (hourOut * 60 + minOut) - (hourIn * 60 + minIn);

            // Automatic break deduction: if work > 5 hours, subtract PhutNghi
            let breakMinutes = 0;
            if (totalMinutes > 300) { // 5 hours = 300 minutes
                breakMinutes = record.PhutNghi || 0;
                totalMinutes -= breakMinutes;
            }

            const soGioLam = (totalMinutes / 60).toFixed(2);

            // Determine if "Ve sớm"
            let transitionStatus = record.TrangThai;
            if (record.GioKetThuc && checkTime < record.GioKetThuc) {
                // If it was "Di_lam" (on time) but now "Ve_som"
                // Or if it was already "Tre", it stays "Tre" but we could append "Ve_som" if we wanted.
                // For simplicity, if they leave early, we mark it as "Ve_som" unless they were already "Tre"
                if (transitionStatus === 'Di_lam') {
                    transitionStatus = 'Ve_som';
                }
            }

            await pool.query(
                `UPDATE cham_cong 
                 SET GioRa = ?, SoGioLam = ?, SoGioTangCa = ?, TrangThai = ?, GhiChu = COALESCE(?, GhiChu)
                 WHERE MaCC = ?`,
                [checkTime, soGioLam, SoGioTangCa || 0, transitionStatus, GhiChu, record.MaCC]
            );

            res.json({
                success: true,
                message: transitionStatus === 'Ve_som' ? 'Chấm công ra thành công (Về sớm)' : 'Chấm công ra thành công',
                data: { Ngay: checkDate, GioRa: checkTime, SoGioLam: soGioLam, TrangThai: transitionStatus }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= MANUAL ATTENDANCE (Admin) =======================
    createAttendance: async (req, res) => {
        const { MaNV, Ngay, GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, MaCa } = req.body;

        // Validation
        if (!MaNV || !Ngay) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin: MaNV, Ngay là bắt buộc'
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

            // Get employee shift if not provided
            let finalMaCa = MaCa;
            let finalGioVao = GioVao;
            let finalTrangThai = TrangThai || 'Di_lam';

            if (!finalMaCa || !finalGioVao) {
                const [emp] = await pool.query(
                    `SELECT nv.MaCa, ca.GioBatDau 
                     FROM nhanvien nv 
                     LEFT JOIN ca_lam_viec ca ON nv.MaCa = ca.MaCa 
                     WHERE nv.MaNV = ?`,
                    [MaNV]
                );

                if (emp.length > 0) {
                    if (!finalMaCa) finalMaCa = emp[0].MaCa || 1;
                    if (!finalGioVao && !['Nghi_phep', 'Nghi_khong_phep', 'Vang'].includes(finalTrangThai)) {
                        finalGioVao = emp[0].GioBatDau || '08:00:00';
                    }
                }
            }

            const [result] = await pool.query(
                `INSERT INTO cham_cong (MaNV, MaCa, Ngay, GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, CreatedBy)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [MaNV, finalMaCa || 1, Ngay, finalGioVao, GioRa, SoGioLam || 0, SoGioTangCa || 0, finalTrangThai, GhiChu, req.user.TenTK]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'cham_cong',
                MaBanGhi: result.insertId,
                DuLieuMoi: { MaNV, Ngay, GioVao: finalGioVao, MaCa: finalMaCa },
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
                 SET GioVao = COALESCE(?, GioVao), 
                     GioRa = COALESCE(?, GioRa), 
                     SoGioLam = COALESCE(?, SoGioLam), 
                     SoGioTangCa = COALESCE(?, SoGioTangCa), 
                     TrangThai = COALESCE(?, TrangThai), 
                     GhiChu = COALESCE(?, GhiChu)
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
                    SUM(CASE WHEN TrangThai = 'Ve_som' THEN 1 ELSE 0 END) as SoNgayVeSom,
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
    },

    getMonthlyAttendance: async (req, res) => {
        const { month, year } = req.query;
        try {
            // 1. Get all employees
            const [employees] = await pool.query('SELECT MaNV, HoTen, ChucVu FROM nhanvien');

            // 2. Get attendance records for the month
            const [attendance] = await pool.query(
                `SELECT MaCC, MaNV, DAY(Ngay) as Ngay, TrangThai, GioVao, GioRa, SoGioLam, SoGioTangCa 
                 FROM cham_cong 
                 WHERE MONTH(Ngay) = ? AND YEAR(Ngay) = ?`,
                [month, year]
            );

            // 3. Transform to frontend format
            const result = employees.map(emp => {
                const empDays = {};
                attendance
                    .filter(a => a.MaNV === emp.MaNV)
                    .forEach(a => {
                        empDays[a.Ngay] = {
                            id: a.MaCC,
                            trang_thai: a.TrangThai,
                            gio_vao: a.GioVao,
                            gio_ra: a.GioRa,
                            so_gio_lam: a.SoGioLam,
                            so_gio_tang_ca: a.SoGioTangCa
                        };
                    });
                return {
                    ...emp,
                    days: empDays
                };
            });

            res.json(result); // Return array directly as expected by frontend
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default attendanceController;
