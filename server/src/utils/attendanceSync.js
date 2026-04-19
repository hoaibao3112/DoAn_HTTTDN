/**
 * Attendance Sync Utility
 * 
 * Chứa các hàm xử lý đồng bộ dữ liệu chấm công tự động.
 */

import pool from '../config/connectDatabase.js';

/**
 * Normalize date input to YYYY-MM-DD string
 */
const toDateString = (d) => {
    const date = d instanceof Date ? d : new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

/**
 * Đồng bộ những ngày chưa chấm công cho toàn bộ nhân viên
 * @param {Date|string} dateParam - Ngày cần đồng bộ, mặc định là ngày hôm qua
 */
export const syncMissedAttendancesForDate = async (dateParam) => {
    try {
        const targetDate = dateParam ? toDateString(dateParam) : toDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

        console.log(`[Sync] Starting missed attendance sync for date: ${targetDate}`);

        // 1. Lấy tất cả nhân viên đang hoạt động
        const [employees] = await pool.query('SELECT MaNV, MaCa FROM nhanvien WHERE TinhTrang = 1');

        if (employees.length === 0) {
            console.log('[Sync] No active employees found');
            return;
        }

        const employeeIds = employees.map(e => e.MaNV);

        // 2. Lấy tất cả bản ghi chấm công đã tồn tại trong 1 query (thay vì N queries)
        const [existingRecords] = await pool.query(
            'SELECT MaNV FROM cham_cong WHERE MaNV IN (?) AND Ngay = ?',
            [employeeIds, targetDate]
        );
        const existingSet = new Set(existingRecords.map(e => e.MaNV));

        // 3. Lấy tất cả đơn nghỉ phép đã duyệt trong 1 query (thay vì N queries)
        const [leaveRecords] = await pool.query(
            `SELECT MaNV FROM xin_nghi_phep 
             WHERE MaNV IN (?) AND TrangThai = ? 
             AND DATE(?) BETWEEN DATE(NgayBatDau) AND DATE(NgayKetThuc)`,
            [employeeIds, 'Da_duyet', targetDate]
        );
        const leaveSet = new Set(leaveRecords.map(l => l.MaNV));

        // 4. Kiểm tra xem ngày có phải lễ hay không
        const [holidays] = await pool.query('SELECT Ngay FROM ngay_le WHERE DATE(Ngay) = ?', [targetDate]);
        const isHolidayDate = holidays && holidays.length > 0;

        // 5. Chuẩn bị batch insert values
        const insertValues = [];
        for (const emp of employees) {
            // Skip nếu đã có bản ghi chấm công
            if (existingSet.has(emp.MaNV)) continue;

            const statusToInsert = leaveSet.has(emp.MaNV) ? 'Nghi_phep' : 'Nghi_khong_phep';
            const ghiChu = statusToInsert === 'Nghi_phep'
                ? 'Tự động đồng bộ từ đơn nghỉ phép'
                : 'Hệ thống tự động đánh dấu vắng mặt';

            // Xác định loại ngày tăng ca: 'thuong' | 'nghi_tuan' | 'le'
            const day = new Date(targetDate).getDay(); // 0=Sun,6=Sat
            let loaiNgayTangCa = 'thuong';
            if (isHolidayDate) loaiNgayTangCa = 'le';
            else if (day === 0 || day === 6) loaiNgayTangCa = 'nghi_tuan';

            insertValues.push([emp.MaNV, emp.MaCa, targetDate, statusToInsert, ghiChu, 'System_Sync', loaiNgayTangCa]);
        }

        // 5. Batch insert tất cả records cùng lúc (thay vì N queries)
        if (insertValues.length > 0) {
            await pool.query(
                'INSERT INTO cham_cong (MaNV, MaCa, Ngay, TrangThai, GhiChu, CreatedBy, LoaiNgayTangCa) VALUES ?',
                [insertValues]
            );
            console.log(`[Sync] Inserted ${insertValues.length} attendance records for date: ${targetDate}`);
        } else {
            console.log(`[Sync] No new attendance records to insert for date: ${targetDate}`);
        }

        console.log(`[Sync] Completed missed attendance sync for date: ${targetDate}`);
    } catch (error) {
        console.error('[Sync] Error syncing missed attendance:', error);
        throw error;
    }
};

/**
 * Tự động điền chấm công cho toàn bộ tháng
 * Quét tất cả ngày làm việc (trừ CN) trong tháng, tìm những ngày chưa có bản ghi
 * và tự động tạo với trạng thái phù hợp.
 * 
 * @param {number} month - Tháng cần xử lý (1-12)
 * @param {number} year  - Năm cần xử lý
 * @returns {{ inserted: number, skipped: number }} - Thống kê kết quả
 */
export const autoFillMonthlyAttendance = async (month, year) => {
    try {
        console.log(`[MonthlyFill] Bắt đầu tự động chấm công tháng ${month}/${year}`);

        // 1. Lấy tất cả nhân viên đang hoạt động
        const [employees] = await pool.query(
            'SELECT MaNV, MaCa FROM nhanvien WHERE TinhTrang = 1'
        );

        if (employees.length === 0) {
            console.log('[MonthlyFill] Không có nhân viên nào đang hoạt động');
            return { inserted: 0, skipped: 0 };
        }

        const employeeIds = employees.map(e => e.MaNV);

        // 2. Tính tất cả ngày làm việc trong tháng (trừ Chủ nhật)
        const daysInMonth = new Date(year, month, 0).getDate(); // số ngày trong tháng
        const workingDays = []; // mảng string 'YYYY-MM-DD'
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month - 1, d);
            if (date.getDay() !== 0) { // 0 = Chủ nhật
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                // Không điền ngày trong tương lai
                if (new Date(dateStr) <= new Date()) {
                    workingDays.push(dateStr);
                }
            }
        }

        if (workingDays.length === 0) {
            console.log('[MonthlyFill] Không có ngày làm việc nào trong tháng');
            return { inserted: 0, skipped: 0 };
        }

        // 3. Lấy tất cả bản ghi chấm công trong tháng (1 query)
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate   = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
        const [existingRecords] = await pool.query(
            'SELECT MaNV, DATE_FORMAT(Ngay, "%Y-%m-%d") as Ngay FROM cham_cong WHERE Ngay BETWEEN ? AND ? AND MaNV IN (?)',
            [startDate, endDate, employeeIds]
        );
        // Tạo Set nhanh tra cứu: "MaNV_YYYY-MM-DD"
        const existingSet = new Set(existingRecords.map(r => `${r.MaNV}_${r.Ngay}`));

        // 4. Lấy tất cả đơn nghỉ phép đã duyệt trong tháng (1 query)
        const [leaveRecords] = await pool.query(
            `SELECT MaNV, DATE_FORMAT(NgayBatDau, "%Y-%m-%d") as TuNgay, DATE_FORMAT(NgayKetThuc, "%Y-%m-%d") as DenNgay
             FROM xin_nghi_phep
             WHERE TrangThai = 'Da_duyet'
               AND MaNV IN (?)
               AND NgayKetThuc >= ?
               AND NgayBatDau <= ?`,
            [employeeIds, startDate, endDate]
        );

        // 5. Lấy danh sách ngày lễ trong tháng (1 query)
        const [holidays] = await pool.query(
            'SELECT DATE_FORMAT(Ngay, "%Y-%m-%d") as Ngay FROM ngay_le WHERE Ngay BETWEEN ? AND ?',
            [startDate, endDate]
        );
        const holidaySet = new Set(holidays.map(h => h.Ngay));

        // Helper: kiểm tra nhân viên có đơn nghỉ phép được duyệt cho ngày đó không
        const isOnApprovedLeave = (maNV, dateStr) => {
            return leaveRecords.some(lr => {
                if (lr.MaNV !== maNV) return false;
                return dateStr >= lr.TuNgay && dateStr <= lr.DenNgay;
            });
        };

        // 6. Chuẩn bị batch insert
        const insertValues = [];
        let skippedCount = 0;

        for (const emp of employees) {
            for (const dateStr of workingDays) {
                const key = `${emp.MaNV}_${dateStr}`;
                if (existingSet.has(key)) {
                    skippedCount++;
                    continue; // Đã có bản ghi → bỏ qua
                }

                // Xác định trạng thái
                let status = 'Nghi_khong_phep';
                let ghiChu = 'Hệ thống tự động điền cuối tháng';

                if (isOnApprovedLeave(emp.MaNV, dateStr)) {
                    status = 'Nghi_phep';
                    ghiChu = 'Hệ thống tự động điền - Có đơn nghỉ phép được duyệt';
                }

                // Xác định loại ngày tăng ca
                const dayOfWeek = new Date(dateStr).getDay();
                let loaiNgayTangCa = 'thuong';
                if (holidaySet.has(dateStr)) loaiNgayTangCa = 'le';
                else if (dayOfWeek === 6) loaiNgayTangCa = 'nghi_tuan'; // Thứ 7

                insertValues.push([emp.MaNV, emp.MaCa, dateStr, status, ghiChu, 'System_MonthlyFill', loaiNgayTangCa]);
            }
        }

        // 7. Batch INSERT
        if (insertValues.length > 0) {
            await pool.query(
                'INSERT INTO cham_cong (MaNV, MaCa, Ngay, TrangThai, GhiChu, CreatedBy, LoaiNgayTangCa) VALUES ?',
                [insertValues]
            );
        }

        console.log(`[MonthlyFill] Hoàn thành tháng ${month}/${year}: tạo ${insertValues.length} bản ghi, bỏ qua ${skippedCount} bản ghi đã có`);
        return { inserted: insertValues.length, skipped: skippedCount };
    } catch (error) {
        console.error('[MonthlyFill] Lỗi khi tự động chấm công tháng:', error);
        throw error;
    }
};
