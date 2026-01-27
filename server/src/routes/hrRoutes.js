import express from 'express';
import hrController from '../controllers/hrController.js';
import attendanceController from '../controllers/attendanceController.js';
import pool from '../config/connectDatabase.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// All HR routes require authentication
router.use(authenticateToken);

// ======================= MODULE 2.1: EMPLOYEE SELF-SERVICE =======================

// Profile - Không cần check permission vì mỗi user chỉ xem/sửa profile của mình
router.get('/profile', hrController.getProfile);
router.put('/profile', hrController.updateProfile);

// Leave Requests (Self) - Nhân viên tự nộp đơn xin nghỉ
router.post('/xin-nghi-phep', hrController.submitLeave);
router.get('/my-leave', hrController.getMyLeave);

// Salary (Self) - Nhân viên xem lương của mình
router.get('/my-salary', hrController.getMySalary);

// ======================= MODULE 2.2: HR MANAGER =======================

// Employee Management
router.get('/employees',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.VIEW),
    hrController.getAllEmployees
);

router.post('/employees',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.CREATE),
    hrController.addEmployee
);

router.put('/employees/:id',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.UPDATE),
    hrController.updateEmployee
);

router.delete('/employees/:id',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.DELETE),
    hrController.deleteEmployee
);

// Position & Salary Changes (History)
router.post('/change-position',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.UPDATE),
    hrController.changePosition
);

// Leave Approval
router.get('/leave-requests',
    checkPermission(FEATURES.LEAVE, PERMISSIONS.VIEW),
    hrController.getAllLeaveRequests
);

router.put('/leave-requests/:id/approve',
    checkPermission(FEATURES.LEAVE, PERMISSIONS.APPROVE),
    hrController.approveLeave
);

// Salary Calculation
router.post('/salary/calculate',
    checkPermission(FEATURES.SALARY, PERMISSIONS.CREATE),
    hrController.calculateMonthlySalary
);

// ======================= NEW: SALARY PRINT & REPORTING =======================

// Print Salary by Month (for employee) - NEW
router.get('/my-salary/print/monthly',
    async (req, res) => {
        const { year, month } = req.query;
        const MaTK = req.user.MaTK;

        try {
            const [salaryData] = await pool.query(`
                SELECT 
                    bl.*, 
                    nv.HoTen, nv.ChucVu,
                    DATE_FORMAT(bl.NgayTinhLuong, '%m/%Y') as ThangNam
                FROM bang_luong bl
                JOIN nhanvien nv ON bl.MaNV = nv.MaTK
                WHERE nv.MaTK = ? 
                ${year ? 'AND YEAR(bl.NgayTinhLuong) = ?' : ''}
                ${month ? 'AND MONTH(bl.NgayTinhLuong) = ?' : ''}
                ORDER BY bl.NgayTinhLuong DESC
            `, year && month ? [MaTK, year, month] : year ? [MaTK, year] : [MaTK]);

            res.json({
                success: true,
                data: salaryData,
                type: 'monthly',
                employee: salaryData.length > 0 ? {
                    HoTen: salaryData[0].HoTen,
                    ChucVu: salaryData[0].ChucVu
                } : null
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi lấy bảng lương theo tháng', error: error.message });
        }
    }
);

// Print Salary by Year (for employee) - NEW
router.get('/my-salary/print/yearly',
    async (req, res) => {
        const { year } = req.query;
        const MaTK = req.user.MaTK;

        if (!year) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp năm' });
        }

        try {
            const [salaryData] = await pool.query(`
                SELECT 
                    MONTH(bl.NgayTinhLuong) as Thang,
                    bl.LuongCoBan, bl.PhuCap, bl.Thuong, bl.KhauTru, bl.TongLuong,
                    nv.HoTen, nv.ChucVu
                FROM bang_luong bl
                JOIN nhanvien nv ON bl.MaNV = nv.MaTK
                WHERE nv.MaTK = ? AND YEAR(bl.NgayTinhLuong) = ?
                ORDER BY Thang
            `, [MaTK, year]);

            // Calculate yearly summary
            const summary = salaryData.reduce((acc, row) => ({
                TongLuongCoBan: acc.TongLuongCoBan + parseFloat(row.LuongCoBan || 0),
                TongPhuCap: acc.TongPhuCap + parseFloat(row.PhuCap || 0),
                TongThuong: acc.TongThuong + parseFloat(row.Thuong || 0),
                TongKhauTru: acc.TongKhauTru + parseFloat(row.KhauTru || 0),
                TongLuongNam: acc.TongLuongNam + parseFloat(row.TongLuong || 0)
            }), { TongLuongCoBan: 0, TongPhuCap: 0, TongThuong: 0, TongKhauTru: 0, TongLuongNam: 0 });

            res.json({
                success: true,
                data: salaryData,
                summary,
                type: 'yearly',
                year,
                employee: salaryData.length > 0 ? {
                    HoTen: salaryData[0].HoTen,
                    ChucVu: salaryData[0].ChucVu
                } : null
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi lấy bảng lương theo năm', error: error.message });
        }
    }
);

// ======================= NEW: HR MANAGER REPORTS =======================

// HR Statistics Report - NEW
router.get('/reports/employees/stats',
    checkPermission(FEATURES.EMPLOYEES, PERMISSIONS.VIEW),
    async (req, res) => {
        try {
            // Get employee statistics
            const [stats] = await pool.query(`
                SELECT 
                    COUNT(*) as TongNhanVien,
                    SUM(CASE WHEN TinhTrang = 'Dang_lam' THEN 1 ELSE 0 END) as DangLamViec,
                    SUM(CASE WHEN TinhTrang = 'Nghi_viec' THEN 1 ELSE 0 END) as DaNghiViec,
                    COUNT(DISTINCT ChucVu) as SoChucVu
                FROM nhanvien
            `);

            // Get by position
            const [byPosition] = await pool.query(`
                SELECT 
                    ChucVu,
                    COUNT(*) as SoLuong,
                    AVG(LuongCoBan) as LuongTrungBinh
                FROM nhanvien
                WHERE TinhTrang = 'Dang_lam'
                GROUP BY ChucVu
            `);

            // Get by branch
            const [byBranch] = await pool.query(`
                SELECT 
                    ch.TenCH,
                    COUNT(nv.MaTK) as SoNhanVien
                FROM cua_hang ch
                LEFT JOIN nhanvien nv ON ch.MaCH = nv.MaCH AND nv.TinhTrang = 'Dang_lam'
                GROUP BY ch.MaCH
            `);

            res.json({
                success: true,
                data: {
                    summary: stats[0],
                    byPosition,
                    byBranch
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê nhân sự', error: error.message });
        }
    }
);

// Salary Report by Month/Year - NEW
router.get('/reports/salary',
    checkPermission(FEATURES.SALARY, PERMISSIONS.VIEW),
    async (req, res) => {
        const { period = 'monthly', year, month } = req.query;

        try {
            let query = '';
            let params = [];

            if (period === 'monthly' && year && month) {
                query = `
                    SELECT 
                        nv.HoTen, nv.ChucVu,
                        bl.LuongCoBan, bl.PhuCap, bl.Thuong, bl.KhauTru, bl.TongLuong,
                        bl.NgayTinhLuong
                    FROM bang_luong bl
                    JOIN nhanvien nv ON bl.MaNV = nv.MaTK
                    WHERE YEAR(bl.NgayTinhLuong) = ? AND MONTH(bl.NgayTinhLuong) = ?
                    ORDER BY nv.HoTen
                `;
                params = [year, month];
            } else if (period === 'yearly' && year) {
                query = `
                    SELECT 
                        nv.HoTen, nv.ChucVu,
                        MONTH(bl.NgayTinhLuong) as Thang,
                        SUM(bl.LuongCoBan) as TongLuongCoBan,
                        SUM(bl.PhuCap) as TongPhuCap,
                        SUM(bl.Thuong) as TongThuong,
                        SUM(bl.KhauTru) as TongKhauTru,
                        SUM(bl.TongLuong) as TongLuongNam
                    FROM bang_luong bl
                    JOIN nhanvien nv ON bl.MaNV = nv.MaTK
                    WHERE YEAR(bl.NgayTinhLuong) = ?
                    GROUP BY nv.MaTK, nv.HoTen, nv.ChucVu
                    ORDER BY TongLuongNam DESC
                `;
                params = [year];
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp year và month cho monthly hoặc year cho yearly'
                });
            }

            const [salaryReport] = await pool.query(query, params);

            // Calculate total
            const total = salaryReport.reduce((acc, row) => {
                if (period === 'monthly') {
                    return {
                        TongLuong: acc.TongLuong + parseFloat(row.TongLuong || 0),
                        TongPhuCap: acc.TongPhuCap + parseFloat(row.PhuCap || 0),
                        TongThuong: acc.TongThuong + parseFloat(row.Thuong || 0)
                    };
                } else {
                    return {
                        TongLuong: acc.TongLuong + parseFloat(row.TongLuongNam || 0)
                    };
                }
            }, { TongLuong: 0, TongPhuCap: 0, TongThuong: 0 });

            res.json({
                success: true,
                data: salaryReport,
                summary: total,
                period,
                year,
                month: period === 'monthly' ? month : undefined
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo lương', error: error.message });
        }
    }
);

// Bonus/Reward Report - NEW
router.get('/reports/bonus',
    checkPermission(FEATURES.SALARY, PERMISSIONS.VIEW),
    async (req, res) => {
        const { year } = req.query;

        try {
            const query = `
                SELECT 
                    nv.HoTen, nv.ChucVu,
                    ${year ? 'MONTH(bl.NgayTinhLuong) as Thang,' : ''}
                    ${year ? 'YEAR(bl.NgayTinhLuong) as Nam,' : 'YEAR(bl.NgayTinhLuong) as Nam,'}
                    SUM(bl.Thuong) as TongThuong,
                    COUNT(*) as SoLanThuong
                FROM bang_luong bl
                JOIN nhanvien nv ON bl.MaNV = nv.MaTK
                WHERE bl.Thuong > 0
                ${year ? 'AND YEAR(bl.NgayTinhLuong) = ?' : ''}
                GROUP BY nv.MaTK, nv.HoTen, nv.ChucVu ${year ? ', Nam, Thang' : ', Nam'}
                ORDER BY ${year ? 'Nam, Thang' : 'Nam DESC'}, TongThuong DESC
            `;

            const [bonusReport] = year
                ? await pool.query(query, [year])
                : await pool.query(query);

            res.json({
                success: true,
                data: bonusReport,
                year: year || 'all'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi lấy báo cáo thưởng', error: error.message });
        }
    }
);

// ======================= ATTENDANCE MANAGEMENT (CONSOLIDATED FROM attendanceRoutes.js) =======================

// Employee Self-Service - Attendance
router.get('/my-attendance', attendanceController.getMyAttendance);
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

// HR Manager - Attendance Management
router.get('/attendance',
    checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.VIEW),
    attendanceController.getAllAttendance
);

router.post('/attendance',
    checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.CREATE),
    attendanceController.createAttendance
);

router.put('/attendance/:id',
    checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.UPDATE),
    attendanceController.updateAttendance
);

router.delete('/attendance/:id',
    checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.DELETE),
    attendanceController.deleteAttendance
);

// Attendance Reports
router.get('/attendance/summary',
    checkPermission(FEATURES.ATTENDANCE, PERMISSIONS.VIEW),
    attendanceController.getAttendanceSummary
);

export default router;


