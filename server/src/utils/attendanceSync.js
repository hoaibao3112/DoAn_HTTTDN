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

        // Lấy tất cả tài khoản nhân viên đang hoạt động
        const [accounts] = await pool.query('SELECT MaTK FROM taikhoan WHERE TinhTrang = 1');

        for (const acc of accounts) {
            const MaTK = acc.MaTK;

            // Kiểm tra xem đã có bản ghi chấm công chưa
            const [existing] = await pool.query(
                'SELECT id FROM cham_cong WHERE MaTK = ? AND DATE(ngay) = ?',
                [MaTK, targetDate]
            );

            if (existing.length > 0) continue;

            // Kiểm tra xem ngày đó có đơn nghỉ phép đã duyệt không
            const [leaveRows] = await pool.query(
                'SELECT id FROM xin_nghi_phep WHERE MaTK = ? AND trang_thai = ? AND DATE(?) BETWEEN DATE(ngay_bat_dau) AND DATE(ngay_ket_thuc)',
                [MaTK, 'Da_duyet', targetDate]
            );

            const statusToInsert = leaveRows.length > 0 ? 'Nghi_phep' : 'Nghi_khong_phep';
            const ghiChu = statusToInsert === 'Nghi_phep'
                ? 'Tự động đồng bộ từ đơn nghỉ phép'
                : 'Hệ thống tự động đánh dấu vắng mặt';

            await pool.query(
                'INSERT INTO cham_cong (MaTK, ngay, trang_thai, ghi_chu) VALUES (?, ?, ?, ?)',
                [MaTK, targetDate, statusToInsert, ghiChu]
            );
        }

        console.log(`[Sync] Completed missed attendance sync for date: ${targetDate}`);
    } catch (error) {
        console.error('[Sync] Error syncing missed attendance:', error);
        throw error;
    }
};
