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

        // 4. Chuẩn bị batch insert values
        const insertValues = [];
        for (const emp of employees) {
            // Skip nếu đã có bản ghi chấm công
            if (existingSet.has(emp.MaNV)) continue;

            const statusToInsert = leaveSet.has(emp.MaNV) ? 'Nghi_phep' : 'Nghi_khong_phep';
            const ghiChu = statusToInsert === 'Nghi_phep'
                ? 'Tự động đồng bộ từ đơn nghỉ phép'
                : 'Hệ thống tự động đánh dấu vắng mặt';

            insertValues.push([emp.MaNV, emp.MaCa, targetDate, statusToInsert, ghiChu, 'System_Sync']);
        }

        // 5. Batch insert tất cả records cùng lúc (thay vì N queries)
        if (insertValues.length > 0) {
            await pool.query(
                'INSERT INTO cham_cong (MaNV, MaCa, Ngay, TrangThai, GhiChu, CreatedBy) VALUES ?',
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
