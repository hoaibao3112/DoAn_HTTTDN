import cron from 'node-cron';
import pool from '../config/connectDatabase.js';

/**
 * Cron job tự động đánh vắng mặt cho nhân viên
 * Chạy lúc 23:59 mỗi ngày
 */
export const setupAttendanceCronJobs = () => {
    
    // Job 1: Tự động đánh vắng mặt lúc 23:59 hàng ngày
    cron.schedule('59 23 * * *', async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            console.log(`[CRON] Bắt đầu đánh vắng mặt cho ngày ${today}`);
            
            // Gọi stored procedure
            await pool.query('CALL sp_auto_mark_absent(?)', [today]);
            
            console.log(`[CRON] Hoàn thành đánh vắng mặt cho ngày ${today}`);
        } catch (error) {
            console.error('[CRON] Lỗi khi đánh vắng mặt:', error.message);
        }
    });

    // Job 2: Tự động cảnh báo nhân viên quên chấm công ra lúc 18:00
    cron.schedule('0 18 * * *', async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            console.log(`[CRON] Kiểm tra nhân viên quên chấm công ra: ${today}`);
            
            const [forgot] = await pool.query(`
                SELECT nv.MaNV, nv.HoTen, nv.Email, cc.GioVao
                FROM cham_cong cc
                JOIN nhanvien nv ON cc.MaNV = nv.MaNV
                WHERE cc.Ngay = ? 
                AND cc.GioVao IS NOT NULL 
                AND cc.GioRa IS NULL
                AND nv.TinhTrang = 1
            `, [today]);
            
            if (forgot.length > 0) {
                console.log(`[CRON] Phát hiện ${forgot.length} nhân viên quên chấm công ra:`);
                forgot.forEach(emp => {
                    console.log(`  - ${emp.HoTen} (${emp.Email}) - Vào lúc: ${emp.GioVao}`);
                    // TODO: Gửi email/notification nhắc nhở
                });
            }
        } catch (error) {
            console.error('[CRON] Lỗi khi kiểm tra quên chấm công:', error.message);
        }
    });

    // Job 3: Báo cáo tổng hợp chấm công cuối tháng (ngày 1 hàng tháng lúc 00:01)
    cron.schedule('1 0 1 * *', async () => {
        try {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const month = lastMonth.getMonth() + 1;
            const year = lastMonth.getFullYear();
            
            console.log(`[CRON] Tạo báo cáo chấm công tháng ${month}/${year}`);
            
            const [report] = await pool.query(`
                SELECT * FROM v_cham_cong_bat_thuong 
                WHERE Nam = ? AND Thang = ?
                ORDER BY SoLanTre DESC, QuenChamRa DESC
                LIMIT 20
            `, [year, month]);
            
            if (report.length > 0) {
                console.log(`[CRON] Top nhân viên có vấn đề chấm công tháng ${month}/${year}:`);
                report.forEach((emp, idx) => {
                    console.log(`  ${idx + 1}. ${emp.HoTen} - Trễ: ${emp.SoLanTre}, Quên ra: ${emp.QuenChamRa}, OT: ${emp.TongGioTangCa}h`);
                });
            }
            
            // TODO: Gửi báo cáo qua email cho quản lý
        } catch (error) {
            console.error('[CRON] Lỗi khi tạo báo cáo tháng:', error.message);
        }
    });

    console.log('[CRON] Đã khởi tạo các cron jobs chấm công:');
    console.log('  - Đánh vắng mặt: 23:59 hàng ngày');
    console.log('  - Cảnh báo quên chấm ra: 18:00 hàng ngày');
    console.log('  - Báo cáo tháng: 00:01 ngày 1 hàng tháng');
};

/**
 * Chạy thủ công đánh vắng mặt cho một ngày cụ thể
 * @param {string} date - Ngày cần đánh vắng mặt (YYYY-MM-DD)
 */
export const manualMarkAbsent = async (date) => {
    try {
        console.log(`[MANUAL] Đánh vắng mặt cho ngày ${date}`);
        await pool.query('CALL sp_auto_mark_absent(?)', [date]);
        console.log(`[MANUAL] Hoàn thành`);
        return { success: true, message: 'Đánh vắng mặt thành công' };
    } catch (error) {
        console.error('[MANUAL] Lỗi:', error.message);
        return { success: false, message: error.message };
    }
};
