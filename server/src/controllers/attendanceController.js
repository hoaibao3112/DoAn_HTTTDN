import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

// ======================= HELPER FUNCTIONS =======================

// Kiểm tra giờ check-in hợp lệ (trong khoảng cho phép)
const isValidCheckInTime = (checkTime, shiftStart) => {
    const checkDate = new Date(`1970-01-01T${checkTime}`);
    const shiftDate = new Date(`1970-01-01T${shiftStart}`);
    const earlyLimit = new Date(shiftDate.getTime() - 2 * 60 * 60 * 1000); // 2h trước
    const lateLimit = new Date(shiftDate.getTime() + 4 * 60 * 60 * 1000); // 4h sau
    return checkDate >= earlyLimit && checkDate <= lateLimit;
};

// Tính số phút làm việc (xử lý qua đêm)
const calculateWorkMinutes = (gioVao, gioRa) => {
    const [hourIn, minIn] = gioVao.split(':').map(Number);
    const [hourOut, minOut] = gioRa.split(':').map(Number);
    let totalMinutes = (hourOut * 60 + minOut) - (hourIn * 60 + minIn);
    
    // Xử lý qua đêm
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
    }
    
    return totalMinutes;
};

// Kiểm tra ngày lễ
const isHoliday = async (date) => {
    const [rows] = await pool.query('SELECT HeSoLuong FROM ngay_le WHERE Ngay = ?', [date]);
    return rows.length > 0 ? rows[0].HeSoLuong : null;
};

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
                `SELECT nv.MaNV, nv.MaCa, ca.GioBatDau, nv.TinhTrang 
                 FROM nhanvien nv 
                 LEFT JOIN ca_lam_viec ca ON nv.MaCa = ca.MaCa 
                 WHERE nv.MaTK = ? AND nv.TinhTrang = 1`,
                [req.user.MaTK]
            );

            if (emp.length === 0) {
                return res.status(400).json({ success: false, message: 'Nhân viên không tồn tại hoặc đã nghỉ việc' });
            }

            const { MaNV, MaCa, GioBatDau } = emp[0];
            const checkDate = Ngay || new Date().toISOString().split('T')[0];
            const checkTime = GioVao || new Date().toTimeString().split(' ')[0];

            // Validate: Không được chấm công cho ngày tương lai
            if (new Date(checkDate) > new Date(new Date().toISOString().split('T')[0])) {
                return res.status(400).json({ success: false, message: 'Không thể chấm công cho ngày tương lai' });
            }

            // Validate: Giờ check-in phải trong khoảng hợp lệ
            const threshold = GioBatDau || '08:30:00';
            if (!isValidCheckInTime(checkTime, threshold)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Giờ chấm công không hợp lệ. Chỉ được chấm trong khoảng 2h trước đến 4h sau giờ vào ca' 
                });
            }

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
            const TrangThai = checkTime > threshold ? 'Tre' : 'Di_lam';
            
            // Kiểm tra ngày lễ
            const heSoNgayLe = await isHoliday(checkDate);

            const [result] = await pool.query(
                `INSERT INTO cham_cong (MaNV, MaCa, Ngay, GioVao, TrangThai, GhiChu, CreatedBy, DiaChi_IP)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [MaNV, MaCa || 1, checkDate, checkTime, TrangThai, GhiChu, req.user.TenTK, req.ip]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'CheckIn',
                BangDuLieu: 'cham_cong',
                MaBanGhi: result.insertId,
                DuLieuMoi: { MaNV, Ngay: checkDate, GioVao: checkTime, TrangThai },
                DiaChi_IP: req.ip
            });

            res.json({
                success: true,
                MaCC: result.insertId,
                message: TrangThai === 'Tre' ? 'Chấm công thành công (Đi trễ)' : 'Chấm công thành công',
                data: { 
                    Ngay: checkDate, 
                    GioVao: checkTime, 
                    TrangThai, 
                    MaCa: MaCa || 1,
                    NgayLe: heSoNgayLe ? true : false
                }
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
            const [emp] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaTK = ? AND TinhTrang = 1', [req.user.MaTK]);
            if (emp.length === 0) {
                return res.status(400).json({ success: false, message: 'Nhân viên không tồn tại hoặc đã nghỉ việc' });
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

            // Calculate work hours with proper overnight handling
            const gioVao = record.GioVao;
            if (!gioVao) {
                return res.status(400).json({ success: false, message: 'Dữ liệu chấm công vào bị thiếu (GioVao null)' });
            }

            let totalMinutes = calculateWorkMinutes(gioVao, checkTime);

            // Validate: Số giờ làm không quá 16 giờ (trừ trường hợp đặc biệt)
            if (totalMinutes > 960) { // 16 hours
                return res.status(400).json({ 
                    success: false, 
                    message: 'Số giờ làm việc bất thường (>16 giờ). Vui lòng kiểm tra lại thời gian.' 
                });
            }

            // Automatic break deduction: if work > 5 hours, subtract PhutNghi
            let breakMinutes = 0;
            if (totalMinutes > 300) { // 5 hours = 300 minutes
                breakMinutes = record.PhutNghi || 60; // Mặc định 60 phút nếu không có
                totalMinutes -= breakMinutes;
            }

            const soGioLam = (totalMinutes / 60).toFixed(2);

            // Validate SoGioTangCa
            const validatedOT = SoGioTangCa || 0;
            if (validatedOT < 0 || validatedOT > 12) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Số giờ tăng ca không hợp lệ (phải từ 0-12 giờ)' 
                });
            }

            // Determine status: Kết hợp trạng thái vào và ra
            let finalStatus = record.TrangThai; // Giữ trạng thái vào (Tre hoặc Di_lam)
            
            if (record.GioKetThuc && checkTime < record.GioKetThuc) {
                // Về sớm
                if (finalStatus === 'Tre') {
                    finalStatus = 'Tre_Ve_som'; // Đi trễ VÀ về sớm
                } else {
                    finalStatus = 'Ve_som';
                }
            }

            await pool.query(
                `UPDATE cham_cong 
                 SET GioRa = ?, SoGioLam = ?, SoGioTangCa = ?, TrangThai = ?, GhiChu = COALESCE(?, GhiChu), DiaChi_IP = ?
                 WHERE MaCC = ?`,
                [checkTime, soGioLam, validatedOT, finalStatus, GhiChu, req.ip, record.MaCC]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'CheckOut',
                BangDuLieu: 'cham_cong',
                MaBanGhi: record.MaCC,
                DuLieuMoi: { GioRa: checkTime, SoGioLam: soGioLam, TrangThai: finalStatus },
                DiaChi_IP: req.ip
            });

            res.json({
                success: true,
                message: finalStatus.includes('Ve_som') ? 'Chấm công ra thành công (Về sớm)' : 'Chấm công ra thành công',
                data: { 
                    Ngay: checkDate, 
                    GioRa: checkTime, 
                    SoGioLam: soGioLam, 
                    SoGioTangCa: validatedOT,
                    TrangThai: finalStatus,
                    PhutNghiTru: breakMinutes
                }
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
        const { GioVao, GioRa, SoGioLam, SoGioTangCa, TrangThai, GhiChu, LyDoSua } = req.body;

        try {
            const [oldData] = await pool.query('SELECT * FROM cham_cong WHERE MaCC = ?', [id]);
            if (oldData.length === 0) {
                return res.status(404).json({ success: false, message: 'Bản ghi chấm công không tồn tại' });
            }

            const old = oldData[0];

            // Validate: Chỉ cho phép sửa trong 30 ngày (trừ admin)
            const daysDiff = Math.floor((new Date() - new Date(old.Ngay)) / (1000 * 60 * 60 * 24));
            if (daysDiff > 30 && req.user.MaNQ !== 1) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Chỉ được sửa chấm công trong 30 ngày gần đây' 
                });
            }

            // Validate: Bắt buộc nhập lý do khi sửa
            if (!LyDoSua || LyDoSua.trim() === '') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Vui lòng nhập lý do chỉnh sửa' 
                });
            }

            // Validate số giờ tăng ca
            if (SoGioTangCa && (SoGioTangCa < 0 || SoGioTangCa > 12)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Số giờ tăng ca không hợp lệ (0-12)' 
                });
            }

            // Tính lại số giờ làm nếu có thay đổi giờ vào/ra
            let finalSoGioLam = SoGioLam;
            if ((GioVao && GioVao !== old.GioVao) || (GioRa && GioRa !== old.GioRa)) {
                const vao = GioVao || old.GioVao;
                const ra = GioRa || old.GioRa;
                if (vao && ra) {
                    const minutes = calculateWorkMinutes(vao, ra);
                    finalSoGioLam = (minutes / 60).toFixed(2);
                }
            }

            await pool.query(
                `UPDATE cham_cong 
                 SET GioVao = COALESCE(?, GioVao), 
                     GioRa = COALESCE(?, GioRa), 
                     SoGioLam = COALESCE(?, SoGioLam), 
                     SoGioTangCa = COALESCE(?, SoGioTangCa), 
                     TrangThai = COALESCE(?, TrangThai), 
                     GhiChu = COALESCE(?, GhiChu),
                     NguoiSuaCuoi = ?
                 WHERE MaCC = ?`,
                [GioVao, GioRa, finalSoGioLam, SoGioTangCa, TrangThai, GhiChu, req.user.MaTK, id]
            );

            // Lưu lịch sử chỉnh sửa
            await pool.query(
                `INSERT INTO lich_su_cham_cong (MaCC, NguoiSua, TruocKhi, SauKhi, LyDo, DiaChi_IP)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    req.user.MaTK,
                    JSON.stringify(old),
                    JSON.stringify({ GioVao, GioRa, SoGioLam: finalSoGioLam, SoGioTangCa, TrangThai, GhiChu }),
                    LyDoSua,
                    req.ip
                ]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'cham_cong',
                MaBanGhi: id,
                DuLieuCu: JSON.stringify(old),
                DuLieuMoi: JSON.stringify({ GioVao, GioRa, TrangThai, LyDoSua }),
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
                    SUM(CASE WHEN TrangThai = 'Thai_san' THEN 1 ELSE 0 END) as SoNgayThaiSan,
                    SUM(CASE WHEN TrangThai = 'Om_dau' THEN 1 ELSE 0 END) as SoNgayOmDau,
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
    },

    // ======================= ATTENDANCE HISTORY =======================
    getAttendanceHistory: async (req, res) => {
        const { MaCC } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;

        try {
            const [history] = await pool.query(
                `SELECT ls.*, tk.TenTK, tk.Email
                 FROM lich_su_cham_cong ls
                 JOIN taikhoan tk ON ls.NguoiSua = tk.MaTK
                 WHERE ls.MaCC = ?
                 ORDER BY ls.NgaySua DESC
                 LIMIT ? OFFSET ?`,
                [MaCC, parseInt(pageSize), offset]
            );

            const [total] = await pool.query(
                'SELECT COUNT(*) as total FROM lich_su_cham_cong WHERE MaCC = ?',
                [MaCC]
            );

            res.json({
                success: true,
                data: history.map(h => ({
                    ...h,
                    TruocKhi: JSON.parse(h.TruocKhi),
                    SauKhi: JSON.parse(h.SauKhi)
                })),
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

    // ======================= ABNORMAL ATTENDANCE REPORT =======================
    getAbnormalReport: async (req, res) => {
        const { year, month, MaNV } = req.query;

        try {
            let whereClause = 'WHERE 1=1';
            const params = [];

            if (year) {
                whereClause += ' AND Nam = ?';
                params.push(year);
            }
            if (month) {
                whereClause += ' AND Thang = ?';
                params.push(month);
            }
            if (MaNV) {
                whereClause += ' AND MaNV = ?';
                params.push(MaNV);
            }

            const [report] = await pool.query(
                `SELECT * FROM v_cham_cong_bat_thuong ${whereClause} ORDER BY MaNV`,
                params
            );

            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= AUTO MARK ABSENT (Manual Trigger) =======================
    manualMarkAbsent: async (req, res) => {
        const { Ngay } = req.body;

        if (!Ngay) {
            return res.status(400).json({ 
                success: false, 
                message: 'Thiếu tham số: Ngay (định dạng YYYY-MM-DD)' 
            });
        }

        try {
            await pool.query('CALL sp_auto_mark_absent(?)', [Ngay]);

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'ManualMarkAbsent',
                BangDuLieu: 'cham_cong',
                DuLieuMoi: { Ngay },
                DiaChi_IP: req.ip
            });

            res.json({ 
                success: true, 
                message: `Đã tự động đánh vắng mặt cho ngày ${Ngay}` 
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= HOLIDAY MANAGEMENT (CRUD) =======================
    getAllHolidays: async (req, res) => {
        const { year } = req.query;

        try {
            let whereClause = '';
            const params = [];

            if (year) {
                whereClause = 'WHERE YEAR(Ngay) = ?';
                params.push(year);
            }

            const [holidays] = await pool.query(
                `SELECT * FROM ngay_le ${whereClause} ORDER BY Ngay`,
                params
            );

            res.json({ success: true, data: holidays });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createHoliday: async (req, res) => {
        const { TenNgayLe, Ngay, HeSoLuong, LoaiNgayLe, GhiChu } = req.body;

        if (!TenNgayLe || !Ngay) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin: TenNgayLe, Ngay là bắt buộc'
            });
        }

        try {
            const [result] = await pool.query(
                `INSERT INTO ngay_le (TenNgayLe, Ngay, HeSoLuong, LoaiNgayLe, GhiChu)
                 VALUES (?, ?, ?, ?, ?)`,
                [TenNgayLe, Ngay, HeSoLuong || 2.0, LoaiNgayLe || 'Khac', GhiChu]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'ngay_le',
                MaBanGhi: result.insertId,
                DuLieuMoi: { TenNgayLe, Ngay, HeSoLuong },
                DiaChi_IP: req.ip
            });

            res.json({ 
                success: true, 
                MaNgayLe: result.insertId, 
                message: 'Thêm ngày lễ thành công' 
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Ngày lễ này đã tồn tại' 
                });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateHoliday: async (req, res) => {
        const { id } = req.params;
        const { TenNgayLe, Ngay, HeSoLuong, LoaiNgayLe, GhiChu } = req.body;

        try {
            const [result] = await pool.query(
                `UPDATE ngay_le 
                 SET TenNgayLe = COALESCE(?, TenNgayLe), 
                     Ngay = COALESCE(?, Ngay), 
                     HeSoLuong = COALESCE(?, HeSoLuong), 
                     LoaiNgayLe = COALESCE(?, LoaiNgayLe), 
                     GhiChu = COALESCE(?, GhiChu)
                 WHERE MaNgayLe = ?`,
                [TenNgayLe, Ngay, HeSoLuong, LoaiNgayLe, GhiChu, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Ngày lễ không tồn tại' 
                });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'ngay_le',
                MaBanGhi: id,
                DuLieuMoi: { TenNgayLe, Ngay, HeSoLuong },
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật ngày lễ thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteHoliday: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await pool.query(
                'DELETE FROM ngay_le WHERE MaNgayLe = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Ngày lễ không tồn tại' 
                });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'ngay_le',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Xóa ngày lễ thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default attendanceController;
