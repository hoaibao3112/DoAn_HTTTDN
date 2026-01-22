import pool from '../config/connectDatabase.js';

/**
 * Logs a system activity to the database.
 * @param {Object} data - The log data.
 * @param {number} data.MaTK - ID of the user performing the action.
 * @param {string} data.HanhDong - Action type (Them, Sua, Xoa, Xem, Dang_nhap, etc.)
 * @param {string} data.BangDuLieu - Name of the table affected.
 * @param {number} data.MaBanGhi - ID of the record affected.
 * @param {Object|null} data.DuLieuCu - Old state of the record (JSON).
 * @param {Object|null} data.DuLieuMoi - New state of the record (JSON).
 * @param {string} data.DiaChi_IP - IP address of the requester.
 * @param {string} data.GhiChu - Optional notes.
 */
export const logActivity = async ({
    MaTK,
    HanhDong,
    BangDuLieu,
    MaBanGhi,
    DuLieuCu,
    DuLieuMoi,
    DiaChi_IP,
    GhiChu
}) => {
    try {
        await pool.query(
            `INSERT INTO nhat_ky_hoat_dong 
        (MaTK, HanhDong, BangDuLieu, MaBanGhi, DuLieuCu, DuLieuMoi, DiaChi_IP, GhiChu) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                MaTK,
                HanhDong,
                BangDuLieu,
                MaBanGhi,
                DuLieuCu ? JSON.stringify(DuLieuCu) : null,
                DuLieuMoi ? JSON.stringify(DuLieuMoi) : null,
                DiaChi_IP,
                GhiChu
            ]
        );
    } catch (error) {
        console.error('Failed to log activity:', error.message);
    }
};
