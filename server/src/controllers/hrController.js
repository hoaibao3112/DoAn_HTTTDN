import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

// ===== PAYROLL CONFIGURATION =====
// Trạng thái BHXH trả: công ty KHÔNG trả lương, loại khỏi PayableDays, không cộng ngày lễ
const SICK_STATUSES_BHXH = ['Thai_san', 'Om_dau'];

// Trạng thái công ty trả như ngày thường: vào PayableDays, cộng ngày lễ bình thường
const SICK_STATUSES_COMPANY = ['Nghi_benh'];

// Nếu Nghi_benh > threshold ngày/tháng → mất thưởng chuyên cần
const SICK_DAY_ATTENDANCE_BONUS_THRESHOLD = 2;

// Số ngày làm việc tiêu chuẩn trong 1 tháng (công ty có thể điều chỉnh)
const STANDARD_WORKDAYS_PER_MONTH = 26;

// =============================================================================
// CẤU HÌNH BHXH / BHYT / BHTN (tỉ lệ trừ từ nhân viên - theo Luật VN 2024)
// Tính trên LuongCoBan (lương đóng BHXH)
// =============================================================================
const BHXH_RATE = 0.08;    // 8%   - Bảo hiểm xã hội bắt buộc
const BHYT_RATE = 0.015;   // 1.5% - Bảo hiểm y tế
const BHTN_RATE = 0.01;    // 1%   - Bảo hiểm thất nghiệp
const TOTAL_INSURANCE_RATE = BHXH_RATE + BHYT_RATE + BHTN_RATE; // 10.5%

// Giảm trừ gia cảnh (VND/tháng) - theo Nghị quyết 954/2020/UBTVQH14
const PERSONAL_DEDUCTION  = 11000000; // Bản thân: 11tr/tháng
const DEPENDENT_DEDUCTION =  4400000; // Mỗi người phụ thuộc: 4.4tr/tháng

// =============================================================================
// HÀM TÍNH THUẾ TNCN — Biểu lũy tiến 7 bậc (Điều 22 Luật Thuế TNCN VN)
// Input : taxableIncome = Thu nhập tính thuế SAU giảm trừ (tháng)
// Output: Số thuế TNCN phải nộp (tháng), làm tròn đến đồng
// =============================================================================
function calculatePIT(taxableIncome) {
    if (taxableIncome <= 0) return 0;
    const brackets = [
        { limit:  5000000, rate: 0.05 },   // Bậc 1: đến   5tr/th  → 5%
        { limit:  5000000, rate: 0.10 },   // Bậc 2:  5– 10tr/th  → 10%
        { limit:  8000000, rate: 0.15 },   // Bậc 3: 10– 18tr/th  → 15%
        { limit: 14000000, rate: 0.20 },   // Bậc 4: 18– 32tr/th  → 20%
        { limit: 20000000, rate: 0.25 },   // Bậc 5: 32– 52tr/th  → 25%
        { limit: 28000000, rate: 0.30 },   // Bậc 6: 52– 80tr/th  → 30%
        { limit: Infinity, rate: 0.35 },   // Bậc 7: trên 80tr/th → 35%
    ];
    let tax = 0;
    let remaining = taxableIncome;
    for (const bracket of brackets) {
        if (remaining <= 0) break;
        const band  = bracket.limit === Infinity ? remaining : Math.min(remaining, bracket.limit);
        tax      += band * bracket.rate;
        remaining -= band;
    }
    return Math.round(tax);
}

// =============================================================================
// HÀM TÍNH SỐ NGÀY LÀM VIỆC THỰC TẾ TRONG THÁNG
// (Loại trừ weekend + ngày lễ)
// Input: year, month, holidays array [{Ngay: Date, ...}]
// Output: Số ngày Mon-Fri trừ ngày lễ
// =============================================================================
function countWorkdaysInMonth(year, month, holidays) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    let workdays = 0;
    const holidayDates = new Set(
        holidays.map(h => {
            const d = new Date(h.Ngay);
            return d.toISOString().split('T')[0];
        })
    );
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];
        
        // Monday=1, Friday=5 → Count Mon-Fri only
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidayDates.has(dateStr)) {
            workdays++;
        }
    }
    return workdays;
}

const hrController = {
    // ======================= 2.1 EMPLOYEE SELF-SERVICE =======================

    getProfile: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    nv.*, 
                    tk.TenTK, tk.Email as AccEmail, tk.MaNQ, tk.NgayTao,
                    nq.TenNQ
                FROM nhanvien nv
                JOIN taikhoan tk ON nv.MaTK = tk.MaTK
                LEFT JOIN nhomquyen nq ON tk.MaNQ = nq.MaNQ
                WHERE nv.MaTK = ?
            `, [req.user.MaTK]);

            if (rows.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateProfile: async (req, res) => {
        const { SDT, Email, DiaChi } = req.body;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            if (req.file) {
                // Only update avatar
                await connection.query(
                    'UPDATE nhanvien SET Anh = ? WHERE MaTK = ?',
                    [req.file.filename, req.user.MaTK]
                );
            } else {
                // Update profile info
                await connection.query(
                    'UPDATE nhanvien SET SDT = ?, Email = ?, DiaChi = ? WHERE MaTK = ?',
                    [SDT, Email, DiaChi, req.user.MaTK]
                );

                // Keep taikhoan email in sync
                await connection.query(
                    'UPDATE taikhoan SET Email = ? WHERE MaTK = ?',
                    [Email, req.user.MaTK]
                );
            }

            await connection.commit();
            res.json({ success: true, message: 'Cập nhật hồ sơ thành công' });
        } catch (error) {
            await connection.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            connection.release();
        }
    },

    submitLeave: async (req, res) => {
        const { LoaiDon, NgayBatDau, NgayKetThuc, LyDo } = req.body;

        // Validation: No past dates
        if (new Date(NgayBatDau) < new Date().setHours(0, 0, 0, 0)) {
            return res.status(400).json({ success: false, message: 'Ngày bắt đầu không được ở quá khứ' });
        }

        try {
            const MinhChung = req.file ? req.file.filename : null;

            // Get employee MaNV from MaTK
            const [emp] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);
            if (emp.length === 0) return res.status(400).json({ success: false, message: 'Nhân viên không tồn tại' });

            await pool.query(
                `INSERT INTO xin_nghi_phep (MaNV, LoaiDon, NgayBatDau, NgayKetThuc, LyDo, MinhChung, TrangThai)
                 VALUES (?, ?, ?, ?, ?, ?, 'Cho_duyet')`,
                [emp[0].MaNV, LoaiDon, NgayBatDau, NgayKetThuc, LyDo, MinhChung]
            );

            res.json({ success: true, message: 'Gửi đơn thành công', MinhChung });
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

    getMySalaryHistory: async (req, res) => {
        try {
            const [rows] = await pool.query(
                'SELECT l.* FROM luong l JOIN nhanvien n ON l.MaNV = n.MaNV WHERE n.MaTK = ? ORDER BY l.Nam DESC, l.Thang DESC',
                [req.user.MaTK]
            );
            res.json({ success: true, data: rows });
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
        const { TrangThai } = req.body; // Da_duyet, Tu_choi
        try {
            // Get reviewer MaNV from token's MaTK
            const [reviewer] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);

            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                await connection.query(
                    `UPDATE xin_nghi_phep SET TrangThai = ?, NguoiDuyet = ?, NgayDuyet = NOW() WHERE id = ?`,
                    [TrangThai, reviewer[0]?.MaNV || null, id]
                );

                // If resignation approved, update employee status
                if (TrangThai === 'Da_duyet') {
                    const [request] = await connection.query('SELECT MaNV, LoaiDon FROM xin_nghi_phep WHERE id = ?', [id]);
                    if (request.length > 0 && request[0].LoaiDon === 'Nghi_viec') {
                        await connection.query(
                            'UPDATE nhanvien SET TinhTrang = 0, NgayNghiViec = NOW() WHERE MaNV = ?',
                            [request[0].MaNV]
                        );
                        // Also deactivate account
                        await connection.query(
                            'UPDATE taikhoan SET TinhTrang = 0 WHERE MaTK = (SELECT MaTK FROM nhanvien WHERE MaNV = ?)',
                            [request[0].MaNV]
                        );
                    }
                }

                await connection.commit();
                res.json({ success: true, message: 'Duyệt thành công' });
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    calculateMonthlySalary: async (req, res) => {
        // Đọc từ req.body (khi gọi từ form) HOẶC req.params (khi gọi từ /compute/:year/:month)
        const month = req.body?.month ?? req.params?.month;
        const year = req.body?.year ?? req.params?.year;
        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tháng và năm' });
        }

        try {
            // Formula: TongLuong = (LuongCoBan / 26 * PayableDays) + PhuCap + Thuong - Phat + (SoGioTangCa * (LuongCoBan / 208) * 1.5)
            // PayableDays include: Di_lam, Tre, Ve_som, Nghi_phep
            const [employees] = await pool.query('SELECT MaNV, LuongCoBan, PhuCap, COALESCE(SoNguoiPhuThuoc, 0) AS SoNguoiPhuThuoc FROM nhanvien WHERE TinhTrang = 1');

            // Lấy danh sách ngày lễ trong tháng
            const [holidaysInMonth] = await pool.query(
                `SELECT Ngay, HeSoLuong FROM ngay_le WHERE MONTH(Ngay) = ? AND YEAR(Ngay) = ?`,
                [month, year]
            );

            // Tính số ngày làm việc thực tế trong tháng
            const actualWorkdaysInMonth = countWorkdaysInMonth(year, month, holidaysInMonth);

            for (const emp of employees) {
                // ===== BỨC 1: Lấy thống kê chấm công chi tiết =====
                // PayableDays: Di_lam, Tre, Ve_som, Nghi_phep, Nghi_benh, Tre_Ve_som
                //             (LOẠI: Thai_san, Om_dau vì BHXH trả)
                const [stats] = await pool.query(
                    `SELECT
                        COUNT(CASE WHEN TrangThai IN ('Di_lam', 'Tre', 'Ve_som', 'Tre_Ve_som', 'Nghi_phep', 'Nghi_benh') THEN 1 END) as PayableDays,
                        COUNT(CASE WHEN TrangThai IN ('Tre', 'Ve_som', 'Tre_Ve_som') THEN 1 END) as LateEarlyCount,
                        COUNT(CASE WHEN TrangThai = 'Nghi_khong_phep' THEN 1 END) as UnpaidAbsenceCount,
                        COUNT(CASE WHEN TrangThai = 'Thai_san' THEN 1 END) as MaternityDays,
                        COUNT(CASE WHEN TrangThai = 'Om_dau' THEN 1 END) as BhxhSickDays,
                        COUNT(CASE WHEN TrangThai = 'Nghi_benh' THEN 1 END) as CompanySickDays,
                        SUM(SoGioTangCa) as OT_Hours
                     FROM cham_cong
                     WHERE MaNV = ? AND MONTH(Ngay) = ? AND YEAR(Ngay) = ?`,
                    [emp.MaNV, month, year]
                );

                // Lấy tổng thưởng/phạt thủ công từ bảng mới
                const [manualStats] = await pool.query(
                    `SELECT 
                        SUM(CASE WHEN Loai = 'Thuong' THEN SoTien ELSE 0 END) as ManualBonus,
                        SUM(CASE WHEN Loai = 'Phat' THEN SoTien ELSE 0 END) as ManualPenalty
                     FROM thuong_phat
                     WHERE MaNV = ? AND Thang = ? AND Nam = ?`,
                    [emp.MaNV, month, year]
                );
                const manualBonus = parseFloat(manualStats[0].ManualBonus || 0);
                const manualPenalty = parseFloat(manualStats[0].ManualPenalty || 0);

                const {
                    PayableDays = 0, LateEarlyCount = 0, OT_Hours = 0,
                    UnpaidAbsenceCount = 0, MaternityDays = 0, BhxhSickDays = 0, CompanySickDays = 0
                } = stats[0];

                const base = parseFloat(emp.LuongCoBan) || 0;
                const dailyRate = base / STANDARD_WORKDAYS_PER_MONTH;
                const hourlyRate = base / 208;

                // ===== BƯỚC 2: Xử lý ngày lễ =====
                // Nguyên tắc:
                // - Đi làm ngày lễ (Di_lam, Tre, Ve_som) → cộng phần chênh (HeSo - 1) * dailyRate
                // - Ngày lễ rơi vào Thai_san / Om_dau → SKIP hoàn toàn (BHXH tính theo lịch liên tục)
                // - Ngộ lễ là Nghi_benh / Nghi_phep / chưa chấm → cộng 1 ngày lễ
                const workedStatuses = ['Di_lam', 'Tre', 'Ve_som', 'Tre_Ve_som'];
                const bhxhDateSet = new Set(); // Lưu ngày BHXH để chặn cộng lễ

                let holidayNotWorkedDays = 0;
                let holidayExtraPay = 0;

                // Trước tiên lấy tất cả ngày BHXH trong tháng
                for (const holiday of holidaysInMonth) {
                    const ngayStr = new Date(holiday.Ngay).toISOString().split('T')[0];
                    const [attRows] = await pool.query(
                        'SELECT TrangThai FROM cham_cong WHERE MaNV = ? AND DATE(Ngay) = ?',
                        [emp.MaNV, ngayStr]
                    );
                    const status = attRows[0]?.TrangThai;
                    if (SICK_STATUSES_BHXH.includes(status)) {
                        bhxhDateSet.add(ngayStr);
                    }
                }

                // Xử lý từng ngày lễ
                for (const holiday of holidaysInMonth) {
                    const ngayStr = new Date(holiday.Ngay).toISOString().split('T')[0];
                    
                    // SKIP: Nếu ngày lễ rơi vào Thai_san / Om_dau → không cộng gì (BHXH đã tính)
                    if (bhxhDateSet.has(ngayStr)) {
                        continue;
                    }

                    const [attRows] = await pool.query(
                        'SELECT TrangThai FROM cham_cong WHERE MaNV = ? AND DATE(Ngay) = ?',
                        [emp.MaNV, ngayStr]
                    );
                    const status = attRows[0]?.TrangThai;

                    if (workedStatuses.includes(status)) {
                        // Đi làm ngày lễ → thêm phần chênh hệ số
                        holidayExtraPay += (parseFloat(holiday.HeSoLuong) - 1) * dailyRate;
                    } else {
                        // Nghỉ lễ (Nghi_benh, Nghi_phep, Nghi_khong_phep, hoặc chưa chấm) → cộng ngày với hệ số lương
                        // Điều kiện: không phải ngày BHXH (đã lọc ở trên)
                        // BUG FIX: Phải nhân với HeSoLuong của ngày lễ, không phải cộng 1
                        holidayNotWorkedDays += parseFloat(holiday.HeSoLuong);
                    }
                }

                // ===== BƯỚC 3: Tính các thành phần lương =====
                // 1. Base Pay: ngày làm thực tế + ngày lế + phần chênh hệ số lễ
                const basePay = dailyRate * (PayableDays + holidayNotWorkedDays) + holidayExtraPay;

                // 2. OT Pay: tính theo giờ tăng ca (1.5x hourly rate)
                const otPay = OT_Hours * hourlyRate * 1.5;

                // 3. Fines: đi trễ/về sớm (20k/lần) + thưởng/phạt thủ công
                // LỜI NHẮC: Không áp dụng phạt cho ngày Thai_san/Om_dau (BHXH trả)
                const totalPenalty = (LateEarlyCount * 20000) + manualPenalty;

                // 4. Thưởng chuyên cần:
                // - Có Thai_san / Om_dau trong tháng → MẤT thưởng chuyên cần
                // - Nghi_benh > 2 ngày → MẤT thưởng chuyên cần
                // - Còn lại: phải đủ (ngày làm thực tế của tháng đó) + không trễ/sớm + không nghỉ không phép
                const hasMaternityOrSickLeave = (MaternityDays > 0 || BhxhSickDays > 0);
                const hasTooManySickDays = (CompanySickDays > SICK_DAY_ATTENDANCE_BONUS_THRESHOLD);
                // BUG FIX: So sánh với actualWorkdaysInMonth (có thể 21, 22, 23...), không phải 26 cố định
                const isEligibleForAttendanceBonus = !hasMaternityOrSickLeave && !hasTooManySickDays &&
                                                     PayableDays >= actualWorkdaysInMonth &&
                                                     LateEarlyCount === 0 && UnpaidAbsenceCount === 0;
                const diligenceBonus = isEligibleForAttendanceBonus ? 200000 : 0;
                const totalBonus = diligenceBonus + manualBonus;

                // 5. Phụ cấp:
                // - Nếu tháng có Thai_san/Om_dau → tính theo tỉ lệ (ngày làm thực tế / ngày làm việc thực tế của tháng)
                // - Nếu tháng thường → full phụ cấp
                let phuCapThang = parseFloat(emp.PhuCap || 0);
                if (hasMaternityOrSickLeave && MaternityDays + BhxhSickDays > 0) {
                    // BUG FIX: Chia cho actualWorkdaysInMonth, không phải STANDARD_WORKDAYS_PER_MONTH (26)
                    // Tính phụ cấp theo tỉ lệ ngày làm (loại trừ ngày BHXH)
                    const actualWorkDays = PayableDays; // Đã loại BHXH rồi
                    phuCapThang = (phuCapThang / actualWorkdaysInMonth) * actualWorkDays;
                }

                // TongLuong TRƯỚC khi trừ BHXH và thuế
                const tongLuongBrutto = basePay + phuCapThang + otPay + totalBonus - totalPenalty;

                // ===== BƯỚC 4: Khấu trừ BHXH / BHYT / BHTN =====
                // Căn cứ: LuongCoBan (lương đóng BHXH, không bao gồm phụ cấp/thưởng/OT)
                // Tỉ lệ nhân viên đóng: BHXH 8% + BHYT 1.5% + BHTN 1% = 10.5%
                //
                // Lưu ý tháng có Thai_san / Om_dau:
                //   - BHXH vẫn tính trên LuongCoBan đầy đủ (không tỉ lệ theo ngày)
                //   - Lý do: Cơ sở đóng BHXH là lương hợp đồng, không phải lương thực nhận
                const bhxhEmployee = Math.round(base * BHXH_RATE);   // 8%
                const bhytEmployee = Math.round(base * BHYT_RATE);   // 1.5%
                const bhtnEmployee = Math.round(base * BHTN_RATE);   // 1%
                const totalInsurance = bhxhEmployee + bhytEmployee + bhtnEmployee; // 10.5%

                // ===== BƯỚC 5: Tính thuế TNCN (lũy tiến 7 bậc) =====
                // Căn cứ Điều 22 Luật Thuế TNCN + Nghị quyết 954/2020/UBTVQH14
                //
                // Số người phụ thuộc: lấy từ bảng nhanvien (trường SoNguoiPhuThuoc)
                // Nếu DB chưa có trường này thì mặc định = 0
                const dependents = parseInt(emp.SoNguoiPhuThuoc || 0);

                // Thu nhập chịu thuế = TongLuong brutto (trước khi trừ bảo hiểm)
                // (Phụ cấp không chịu thuế theo quy định cần loại ra — đơn giản hóa: tính hết)
                const incomeSubjectToTax = tongLuongBrutto;

                // Thu nhập tính thuế = Thu nhập chịu thuế − BH nhân viên − Giảm trừ gia cảnh
                const totalDeduction = totalInsurance
                    + PERSONAL_DEDUCTION
                    + (dependents * DEPENDENT_DEDUCTION);
                const taxableIncome  = Math.max(0, incomeSubjectToTax - totalDeduction);
                const pitTax         = calculatePIT(taxableIncome);

                // ===== BƯỚC 6: Lương thực lĩnh =====
                const tongLuongThucLinh = Math.round(tongLuongBrutto - totalInsurance - pitTax);

                // ===== BƯỚC 7: Ghi vào bảng luong =====
                // Các cột mới cần có trong DB:
                //   KhauTruBHXH  INT  -- tổng BH nhân viên đóng (BHXH+BHYT+BHTN)
                //   ThueTNCN     INT  -- thuế TNCN
                //   LuongThucLinh INT -- lương sau tất cả khấu trừ
                // Migration SQL:
                //   ALTER TABLE luong
                //     ADD COLUMN KhauTruBHXH  INT NOT NULL DEFAULT 0 AFTER Phat,
                //     ADD COLUMN ThueTNCN     INT NOT NULL DEFAULT 0 AFTER KhauTruBHXH,
                //     ADD COLUMN LuongThucLinh INT NOT NULL DEFAULT 0 AFTER ThueTNCN;
                await pool.query(
                    `INSERT INTO luong (MaNV, Thang, Nam, LuongCoBan, PhuCap, SoNgayLam,
                                        SoGioTangCa, Thuong, Phat, TongLuong,
                                        KhauTruBHXH, ThueTNCN, LuongThucLinh, TrangThai)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Chua_chi_tra')
                     ON DUPLICATE KEY UPDATE
                        TongLuong    = VALUES(TongLuong),
                        SoNgayLam    = VALUES(SoNgayLam),
                        SoGioTangCa  = VALUES(SoGioTangCa),
                        Thuong       = VALUES(Thuong),
                        Phat         = VALUES(Phat),
                        PhuCap       = VALUES(PhuCap),
                        KhauTruBHXH  = VALUES(KhauTruBHXH),
                        ThueTNCN     = VALUES(ThueTNCN),
                        LuongThucLinh = VALUES(LuongThucLinh)`,
                    [
                        emp.MaNV, month, year, base, Math.round(phuCapThang),
                        PayableDays + holidayNotWorkedDays, OT_Hours,
                        Math.round(totalBonus), Math.round(totalPenalty),
                        Math.round(tongLuongBrutto),
                        totalInsurance, pitTax, tongLuongThucLinh,
                    ]
                );
            }
            res.json({ success: true, message: `Đã tính lương tháng ${month}/${year} cho ${employees.length} nhân viên.` });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getSalaryStats: async (req, res) => {
        const { year, month } = req.query;
        if (!year) return res.status(400).json({ success: false, message: 'Thiếu năm' });

        try {
            // 1. Xu hướng 12 tháng trong năm
            const [monthlyTrend] = await pool.query(`
                SELECT 
                    m.month,
                    COALESCE(SUM(l.TongLuong), 0) as total
                FROM (
                    SELECT 1 as month UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
                    UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 
                    UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
                ) m
                LEFT JOIN luong l ON m.month = l.Thang AND l.Nam = ?
                GROUP BY m.month
                ORDER BY m.month
            `, [year]);

            // 2. Cơ cấu chi phí của tháng hiện tại
            let composition = { base: 0, allowance: 0, bonus: 0, penalty: 0 };
            if (month) {
                const [compData] = await pool.query(`
                    SELECT 
                        SUM(LuongCoBan) as base,
                        SUM(PhuCap) as allowance,
                        SUM(Thuong) as bonus,
                        SUM(Phat) as penalty
                    FROM luong 
                    WHERE Thang = ? AND Nam = ?
                `, [month, year]);

                if (compData[0]) {
                    composition = {
                        base: parseFloat(compData[0].base || 0),
                        allowance: parseFloat(compData[0].allowance || 0),
                        bonus: parseFloat(compData[0].bonus || 0),
                        penalty: parseFloat(compData[0].penalty || 0)
                    };
                }
            }

            // 3. Top thưởng/phạt (Top 5 thưởng cao nhất)
            const [topRewards] = await pool.query(`
                SELECT nv.HoTen, l.Thuong
                FROM luong l
                JOIN nhanvien nv ON l.MaNV = nv.MaNV
                WHERE l.Thang = ? AND l.Nam = ? AND l.Thuong > 0
                ORDER BY l.Thuong DESC
                LIMIT 5
            `, [month, year]);

            res.json({
                success: true,
                data: {
                    monthlyTrend,
                    composition,
                    topRewards
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default hrController;