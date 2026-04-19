import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const bonusPenaltyController = {
    // Helper để kiểm tra xem lương đã được TÍNH (tồn tại trong bảng luong) chưa
    _isSalaryLocked: async (MaNV, month, year) => {
        const [rows] = await pool.query(
            'SELECT TrangThai FROM luong WHERE MaNV = ? AND Thang = ? AND Nam = ?',
            [MaNV, month, year]
        );
        // Nếu đã TÍNH LƯƠNG (có bản ghi) thì khóa luôn, không cần đợi đến lúc chi trả
        return rows.length > 0;
    },

    // ======================= LẤY DANH SÁCH =======================
    getAll: async (req, res) => {
        const { month, year, MaNV, loai } = req.query;
        try {
            let where = 'WHERE 1=1';
            const params = [];
            if (month) { where += ' AND tp.Thang = ?'; params.push(month); }
            if (year) { where += ' AND tp.Nam = ?'; params.push(year); }
            if (MaNV) { where += ' AND tp.MaNV = ?'; params.push(MaNV); }
            if (loai) { where += ' AND tp.Loai = ?'; params.push(loai); }

            const [rows] = await pool.query(`
                SELECT 
                    tp.*,
                    nv.HoTen,
                    nv.ChucVu,
                    tk.TenTK AS NguoiTaoTen,
                    (SELECT l.TrangThai FROM luong l 
                     WHERE l.MaNV = tp.MaNV AND l.Thang = tp.Thang AND l.Nam = tp.Nam) AS TrangThaiLuong
                FROM thuong_phat tp
                JOIN nhanvien nv ON tp.MaNV = nv.MaNV
                LEFT JOIN taikhoan tk ON tp.NguoiTao = tk.MaTK
                ${where}
                ORDER BY tp.NgayTao DESC
            `, params);

            res.json({ success: true, data: rows, total: rows.length });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= THỐNG KÊ THEO THÁNG =======================
    getSummary: async (req, res) => {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tháng và năm' });
        }
        try {
            const [rows] = await pool.query(`
                SELECT 
                    nv.MaNV, nv.HoTen, nv.ChucVu,
                    SUM(CASE WHEN tp.Loai = 'Thuong' THEN tp.SoTien ELSE 0 END) AS TongThuong,
                    SUM(CASE WHEN tp.Loai = 'Phat'   THEN tp.SoTien ELSE 0 END) AS TongPhat,
                    COUNT(CASE WHEN tp.Loai = 'Thuong' THEN 1 END) AS SoLanThuong,
                    COUNT(CASE WHEN tp.Loai = 'Phat'   THEN 1 END) AS SoLanPhat
                FROM nhanvien nv
                LEFT JOIN thuong_phat tp ON nv.MaNV = tp.MaNV 
                    AND tp.Thang = ? AND tp.Nam = ?
                WHERE nv.TinhTrang = 1
                GROUP BY nv.MaNV, nv.HoTen, nv.ChucVu
                ORDER BY nv.HoTen
            `, [month, year]);

            const overall = {
                TongThuong: rows.reduce((s, r) => s + parseFloat(r.TongThuong || 0), 0),
                TongPhat: rows.reduce((s, r) => s + parseFloat(r.TongPhat || 0), 0),
                SoNVDuocThuong: rows.filter(r => parseFloat(r.TongThuong) > 0).length,
                SoNVBiPhat: rows.filter(r => parseFloat(r.TongPhat) > 0).length,
            };

            res.json({ success: true, data: rows, summary: overall });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= TẠO MỚI =======================
    create: async (req, res) => {
        const { MaNV, Loai, SoTien, LyDo, Thang, Nam, GhiChu } = req.body;

        if (!MaNV || !Loai || !SoTien || !LyDo || !Thang || !Nam) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        try {
            if (await bonusPenaltyController._isSalaryLocked(MaNV, Thang, Nam)) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể thêm thưởng/phạt vì lương tháng này của nhân viên đã được tính. Vui lòng kiểm tra lại bảng lương.'
                });
            }

            const [result] = await pool.query(
                `INSERT INTO thuong_phat (MaNV, Loai, SoTien, LyDo, Thang, Nam, NguoiTao, GhiChu)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [MaNV, Loai, SoTien, LyDo, Thang, Nam, req.user.MaTK, GhiChu || null]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'thuong_phat',
                MaBanGhi: result.insertId,
                DuLieuMoi: { MaNV, Loai, SoTien, LyDo, Thang, Nam },
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: `Đã tạo ${Loai === 'Thuong' ? 'thưởng' : 'phạt'} thành công`, id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= CẬP NHẬT =======================
    update: async (req, res) => {
        const { id } = req.params;
        const { Loai, SoTien, LyDo, Thang, Nam, GhiChu } = req.body;

        try {
            const [existing] = await pool.query('SELECT * FROM thuong_phat WHERE id = ?', [id]);
            if (existing.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi' });
            }

            if (await bonusPenaltyController._isSalaryLocked(existing[0].MaNV, existing[0].Thang, existing[0].Nam)) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể sửa thưởng/phạt vì lương tháng này của nhân viên đã được tính.'
                });
            }

            await pool.query(
                `UPDATE thuong_phat SET Loai=?, SoTien=?, LyDo=?, Thang=?, Nam=?, GhiChu=? WHERE id=?`,
                [Loai, SoTien, LyDo, Thang, Nam, GhiChu || null, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'thuong_phat',
                MaBanGhi: id,
                DuLieuCu: existing[0],
                DuLieuMoi: { Loai, SoTien, LyDo, Thang, Nam },
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= XÓA =======================
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const [existing] = await pool.query('SELECT * FROM thuong_phat WHERE id = ?', [id]);
            if (existing.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi' });
            }

            if (await bonusPenaltyController._isSalaryLocked(existing[0].MaNV, existing[0].Thang, existing[0].Nam)) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa thưởng/phạt vì lương tháng này của nhân viên đã được tính.'
                });
            }

            await pool.query('DELETE FROM thuong_phat WHERE id = ?', [id]);
            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'thuong_phat',
                MaBanGhi: id,
                DuLieuCu: existing[0],
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Đã xóa thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

export default bonusPenaltyController;
