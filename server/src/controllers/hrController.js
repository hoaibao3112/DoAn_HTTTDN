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
const STANDARD_WORKDAYS_PER_MONTH = 26; // fallback if hr_settings missing

// Helper: đọc giá trị từ bảng hr_settings
async function getHrSetting(key, defaultValue = null) {
    try {
        const [rows] = await pool.query('SELECT `value` FROM hr_settings WHERE `key` = ? LIMIT 1', [key]);
        if (rows && rows[0] && rows[0].value !== undefined && rows[0].value !== null) return rows[0].value;
        return defaultValue;
    } catch (err) {
        return defaultValue;
    }
}

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

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'CapNhat',
                BangDuLieu: 'nhanvien',
                MaBanGhi: req.user.MaTK, // Profiling uses MaTK reference usually
                DuLieuMoi: req.file ? { Anh: req.file.filename } : { SDT, Email, DiaChi },
                DiaChi_IP: req.ip,
                GhiChu: 'Nhân viên tự cập nhật hồ sơ'
            });

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

            // Kiểm tra quota phép có hưởng lương nếu LoaiDon === 'Nghi_phep'
            if (LoaiDon === 'Nghi_phep') {
                const year = new Date(NgayBatDau).getFullYear();
                const [usedRows] = await pool.query(`
                  SELECT SUM(DATEDIFF(NgayKetThuc, NgayBatDau) + 1) AS used
                  FROM xin_nghi_phep
                  WHERE MaNV = ?
                    AND LoaiDon = 'Nghi_phep'
                    AND TrangThai = 'Da_duyet'
                    AND YEAR(NgayBatDau) = ?
                `, [emp[0].MaNV, year]);
                const used = usedRows[0]?.used || 0;
                const requestedDays = Math.floor((new Date(NgayKetThuc) - new Date(NgayBatDau)) / (24*3600*1000)) + 1;
                const maxPaidLeavePerYearRaw = await getHrSetting('maxPaidLeavePerYear');
                const maxPaidLeavePerYear = maxPaidLeavePerYearRaw !== null ? Number(maxPaidLeavePerYearRaw) : 12;
                if ((used + requestedDays) > maxPaidLeavePerYear) {
                    return res.status(400).json({ success: false, message: `Vượt quá số ngày phép cho phép. Đã dùng: ${used} ngày, còn lại: ${maxPaidLeavePerYear - used} ngày.` });
                }
            }

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
            console.error('❌ Error in getAllEmployees:', error);
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
            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'nhanvien',
                MaBanGhi: result.insertId,
                DuLieuMoi: { HoTen: data.HoTen, ChucVu: data.ChucVu, Email: data.Email },
                DiaChi_IP: req.ip,
                GhiChu: `Thêm nhân viên mới: ${data.HoTen}`
            });

            res.json({ success: true, MaNV: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateEmployee: async (req, res) => {
        const { id } = req.params;
        const data = req.body;
        try {
            // Helper to convert ISO or Date to YYYY-MM-DD for MySQL date columns
            const toSQLDate = (v) => {
                if (!v) return null;
                if (typeof v === 'string') {
                    // Take date part before 'T' if present, otherwise try to parse
                    if (v.includes('T')) return v.split('T')[0];
                    // If already YYYY-MM-DD
                    const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
                    if (m) return m[1];
                    const d = new Date(v);
                    if (!isNaN(d)) return d.toISOString().slice(0, 10);
                    return null;
                }
                if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
                return null;
            };

            // Normalize incoming data to avoid SQL errors when frontend sends partial object
            const normalized = {
                HoTen: data.HoTen || null,
                Email: data.Email || null,
                SDT: data.SDT || null,
                DiaChi: data.DiaChi || null,
                CCCD: data.CCCD || null,
                NgaySinh: toSQLDate(data.NgaySinh),
                NgayVaoLam: toSQLDate(data.NgayVaoLam),
                NgayNghiViec: toSQLDate(data.NgayNghiViec),
                GioiTinh: data.GioiTinh || null,
                ChucVu: data.ChucVu || null,
                LuongCoBan: (data.LuongCoBan !== undefined && data.LuongCoBan !== null && data.LuongCoBan !== '') ? Number(data.LuongCoBan) : 0,
                PhuCap: (data.PhuCap !== undefined && data.PhuCap !== null && data.PhuCap !== '') ? Number(data.PhuCap) : 0,
                MaCH: (data.MaCH !== undefined && data.MaCH !== null && data.MaCH !== '') ? Number(data.MaCH) : null,
                TinhTrang: (data.TinhTrang !== undefined && data.TinhTrang !== null && data.TinhTrang !== '') ? Number(data.TinhTrang) : 1
            };

            // Get old data for audit log
            const [oldData] = await pool.query('SELECT * FROM nhanvien WHERE MaNV = ?', [id]);

            await pool.query(
                `UPDATE nhanvien SET 
                    HoTen=?, Email=?, SDT=?, DiaChi=?, CCCD=?, 
                    NgaySinh=?, NgayVaoLam=?, NgayNghiViec=?, GioiTinh=?, ChucVu=?, LuongCoBan=?, 
                    PhuCap=?, MaCH=?, TinhTrang=?
                 WHERE MaNV=?`,
                [
                    normalized.HoTen,
                    normalized.Email,
                    normalized.SDT,
                    normalized.DiaChi,
                    normalized.CCCD,
                    normalized.NgaySinh,
                    normalized.NgayVaoLam,
                    normalized.NgayNghiViec,
                    normalized.GioiTinh,
                    normalized.ChucVu,
                    normalized.LuongCoBan,
                    normalized.PhuCap,
                    normalized.MaCH,
                    normalized.TinhTrang,
                    id
                ]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'nhanvien',
                MaBanGhi: id,
                DuLieuCu: oldData[0],
                DuLieuMoi: normalized,
                DiaChi_IP: req.ip,
                GhiChu: `Cập nhật thông tin nhân viên: ${normalized.HoTen}`
            });

            res.json({ success: true, message: 'Updated successfully' });
        } catch (error) {
            console.error('Error updating employee:', { id, body: req.body, error });
            res.status(500).json({ success: false, message: 'Lỗi khi cập nhật nhân viên', error: error.message });
        }
    },

    deleteEmployee: async (req, res) => {
        const { id } = req.params;
        try {
            // 1. Kiểm tra trạng thái hiện tại
            const [current] = await pool.query('SELECT TinhTrang, HoTen FROM nhanvien WHERE MaNV = ?', [id]);
            
            if (current.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
            }
            // 2. Thực hiện vô hiệu hóa (soft-delete) — áp dụng cho cả trạng thái đang hoạt động hoặc đã nghỉ
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                // Cập nhật ngày nghỉ việc và trạng thái
                await connection.query(
                    'UPDATE nhanvien SET TinhTrang = 0, NgayNghiViec = IFNULL(NgayNghiViec, NOW()) WHERE MaNV = ?',
                    [id]
                );

                // Lấy MaTK liên kết trước để tránh subquery gây lỗi nếu không tồn tại
                const [tkRows] = await connection.query('SELECT MaTK FROM nhanvien WHERE MaNV = ?', [id]);
                const MaTK = tkRows && tkRows[0] ? tkRows[0].MaTK : null;

                if (MaTK) {
                    await connection.query('UPDATE taikhoan SET TinhTrang = 0 WHERE MaTK = ?', [MaTK]);
                }

                await connection.commit();

                await logActivity({
                    MaTK: req.user?.MaTK || null,
                    HanhDong: 'Xoa_nhan_vien',
                    BangDuLieu: 'nhanvien',
                    MaBanGhi: id,
                    DiaChi_IP: req.ip,
                    GhiChu: `Đã vô hiệu hóa nhân viên: ${current[0].HoTen}`
                });

                res.json({ success: true, message: `Đã hoàn tất vô hiệu hóa nhân viên "${current[0].HoTen}"` });
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('❌ Error in deleteEmployee:', error);
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

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'nhanvien',
                MaBanGhi: MaNV,
                DuLieuCu: { ChucVu: old[0].ChucVu, LuongCoBan: old[0].LuongCoBan },
                DuLieuMoi: { ChucVu: ChucVuMoi, LuongCoBan: LuongMoi },
                DiaChi_IP: req.ip,
                GhiChu: `Thay đổi chức vụ/lương cho nhân viên MaNV=${MaNV}`
            });

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

    // Get all approved leave requests (for review / historical edits)
    getApprovedLeaveRequests: async (req, res) => {
        try {
            const [rows] = await pool.query(
                `SELECT x.*, n.HoTen FROM xin_nghi_phep x JOIN nhanvien n ON x.MaNV = n.MaNV WHERE x.TrangThai = 'Da_duyet' ORDER BY x.NgayBatDau DESC`
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get a single leave request by id
    getLeaveById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query(
                `SELECT x.*, n.HoTen FROM xin_nghi_phep x JOIN nhanvien n ON x.MaNV = n.MaNV WHERE x.id = ? LIMIT 1`,
                [id]
            );
            if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Update an existing leave request (dates, reason, or status) — intended for HR managers
    updateLeaveRequest: async (req, res) => {
        const { id } = req.params;
        const { NgayBatDau, NgayKetThuc, LyDo, TrangThai } = req.body;
        try {
            // Get editor's MaNV for audit
            const [editor] = await pool.query('SELECT MaNV FROM nhanvien WHERE MaTK = ?', [req.user.MaTK]);

            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                // Build update dynamically to allow partial updates
                const updates = [];
                const params = [];
                if (NgayBatDau !== undefined) { updates.push('NgayBatDau = ?'); params.push(NgayBatDau); }
                if (NgayKetThuc !== undefined) { updates.push('NgayKetThuc = ?'); params.push(NgayKetThuc); }
                if (LyDo !== undefined) { updates.push('LyDo = ?'); params.push(LyDo); }
                if (TrangThai !== undefined) { updates.push('TrangThai = ?'); params.push(TrangThai); }

                if (updates.length === 0) {
                    return res.status(400).json({ success: false, message: 'Không có trường nào để cập nhật' });
                }

                // Append audit fields
                updates.push('NguoiSua = ?', 'NgaySua = NOW()');
                params.push(editor[0]?.MaNV || null);

                params.push(id);

                await connection.query(
                    `UPDATE xin_nghi_phep SET ${updates.join(', ')} WHERE id = ?`,
                    params
                );

                // Note: Adjusting related `cham_cong` entries is complex (may require backfill); currently we only update the request record.

                await connection.commit();

                await logActivity({
                    MaTK: req.user?.MaTK || null,
                    HanhDong: 'Cap_nhat_don_nghi',
                    BangDuLieu: 'xin_nghi_phep',
                    MaBanGhi: id,
                    DiaChi_IP: req.ip,
                    GhiChu: `Cập nhật đơn nghỉ (id=${id}) bởi MaNV=${editor[0]?.MaNV || null}`
                });

                res.json({ success: true, message: 'Cập nhật đơn thành công' });
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }
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

                await logActivity({
                    MaTK: req.user.MaTK,
                    HanhDong: 'CapNhat',
                    BangDuLieu: 'xin_nghi_phep',
                    MaBanGhi: id,
                    DuLieuMoi: { TrangThai, NguoiDuyet: reviewer[0]?.MaNV || null },
                    DiaChi_IP: req.ip,
                    GhiChu: `Duyệt đơn nghỉ phép ID=${id} trạng thái ${TrangThai}`
                });

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
            const [employees] = await pool.query(
                `SELECT MaNV,
                        LuongCoBan,
                        COALESCE(PhuCapChiuThue, 0) AS PhuCapChiuThue,
                        COALESCE(PhuCapKhongChiuThue, PhuCap, 0) AS PhuCapKhongChiuThue,
                        COALESCE(SoNguoiPhuThuoc, 0) AS SoNguoiPhuThuoc,
                        COALESCE(LuongBinhQuanBHXH6Thang, NULL) AS LuongBinhQuanBHXH6Thang
                 FROM nhanvien WHERE TinhTrang = 1`
            );

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
                // Lấy số ngày làm việc thực tế trong tháng (fallback về cấu hình nếu rỗng)
                const actualWorkdays = actualWorkdaysInMonth || STANDARD_WORKDAYS_PER_MONTH;
                const dailyRate = actualWorkdays > 0 ? (base / actualWorkdays) : (base / STANDARD_WORKDAYS_PER_MONTH);
                const hourlyRate = dailyRate / 8;

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
                // 2. OT Pay: tính theo giờ tăng ca theo loại ngày
                // Lấy chi tiết tăng ca để phân loại theo ngày lễ / cuối tuần / ngày thường
                const [otRows] = await pool.query(
                    `SELECT Ngay, SoGioTangCa FROM cham_cong WHERE MaNV = ? AND MONTH(Ngay) = ? AND YEAR(Ngay) = ? AND SoGioTangCa > 0`,
                    [emp.MaNV, month, year]
                );
                let otPay = 0;
                for (const r of (otRows || [])) {
                    const d = new Date(r.Ngay);
                    const dayOfWeek = d.getDay(); // 0=Sun,6=Sat
                    const ngayStr = d.toISOString().split('T')[0];
                    // Nếu là ngày lễ theo danh sách -> hệ số 3.0
                    const isHoliday = holidaysInMonth.some(h => new Date(h.Ngay).toISOString().split('T')[0] === ngayStr);
                    let factor = 1.5;
                    if (isHoliday) factor = 3.0;
                    else if (dayOfWeek === 0 || dayOfWeek === 6) factor = 2.0;
                    else factor = 1.5;

                    otPay += (parseFloat(r.SoGioTangCa) || 0) * hourlyRate * factor;
                }

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
                // Áp trần đóng BHXH: tối đa 20 lần lương tối thiểu vùng
                const luongToiThieuVungRaw = await getHrSetting('luongToiThieuVung');
                const luongToiThieuVung = luongToiThieuVungRaw !== null ? Number(luongToiThieuVungRaw) : 4400000;
                const mucTranBHXH = 20 * luongToiThieuVung;
                const luongTinhBH = Math.min(base, mucTranBHXH);

                const bhxhEmployee = Math.round(luongTinhBH * BHXH_RATE);   // 8%
                const bhytEmployee = Math.round(luongTinhBH * BHYT_RATE);   // 1.5%
                const bhtnEmployee = Math.round(luongTinhBH * BHTN_RATE);   // 1%
                const totalInsurance = bhxhEmployee + bhytEmployee + bhtnEmployee; // 10.5% (trên luongTinhBH)

                // Nếu có ngày sick do BHXH (Thai_san, Om_dau) -> tính BhxhSickPay tách riêng
                const luongDongBHXH = luongTinhBH; // xây dựng trên mức đã áp trần
                const bhxhSickPay = Math.round(((luongDongBHXH * 0.75) / actualWorkdays) * BhxhSickDays) || 0;

                // ===== BƯỚC 5: Tính thuế TNCN (lũy tiến 7 bậc) =====
                // Căn cứ Điều 22 Luật Thuế TNCN + Nghị quyết 954/2020/UBTVQH14
                //
                // Số người phụ thuộc: lấy từ bảng nhanvien (trường SoNguoiPhuThuoc)
                // Nếu DB chưa có trường này thì mặc định = 0
                const dependents = parseInt(emp.SoNguoiPhuThuoc || 0);

                // Thu nhập chịu thuế = TongLuong brutto (trước khi trừ bảo hiểm)
                // (Phụ cấp không chịu thuế theo quy định cần loại ra — đơn giản hóa: tính hết)
                // Thu nhập chịu thuế = TongLuong brutto (trước khi trừ bảo hiểm)
                // Loại ra phụ cấp không chịu thuế
                const phuCapKhongChiu = parseFloat(emp.PhuCapKhongChiuThue || 0);
                const incomeSubjectToTax = Math.max(0, tongLuongBrutto - phuCapKhongChiu);

                // Thu nhập tính thuế = Thu nhập chịu thuế − BH nhân viên − Giảm trừ gia cảnh
                const totalDeduction = totalInsurance
                    + PERSONAL_DEDUCTION
                    + (dependents * DEPENDENT_DEDUCTION);
                const taxableIncome  = Math.max(0, incomeSubjectToTax - totalDeduction);
                const pitTax         = calculatePIT(taxableIncome);

                // ===== BƯỚC 6: Lương thực lĩnh =====
                // Lưu ý: BhxhSickPay là khoản BHXH chi trả, không phải chi phí công ty
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
                                        KhauTruBHXH, ThueTNCN, LuongThucLinh, BhxhSickPay, MaternityPay, TrangThai)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Chua_chi_tra')
                     ON DUPLICATE KEY UPDATE
                        TongLuong    = VALUES(TongLuong),
                        SoNgayLam    = VALUES(SoNgayLam),
                        SoGioTangCa  = VALUES(SoGioTangCa),
                        Thuong       = VALUES(Thuong),
                        Phat         = VALUES(Phat),
                        PhuCap       = VALUES(PhuCap),
                        KhauTruBHXH  = VALUES(KhauTruBHXH),
                        ThueTNCN     = VALUES(ThueTNCN),
                        LuongThucLinh = VALUES(LuongThucLinh),
                        BhxhSickPay  = VALUES(BhxhSickPay),
                        MaternityPay  = VALUES(MaternityPay)`,
                    [
                        emp.MaNV, month, year, base, Math.round(phuCapThang),
                        PayableDays + holidayNotWorkedDays, OT_Hours,
                        Math.round(totalBonus), Math.round(totalPenalty),
                        Math.round(tongLuongBrutto),
                        totalInsurance, pitTax, tongLuongThucLinh,
                        bhxhSickPay, Math.round((emp.LuongBinhQuanBHXH6Thang || base) / 30 * (MaternityDays || 0)),
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