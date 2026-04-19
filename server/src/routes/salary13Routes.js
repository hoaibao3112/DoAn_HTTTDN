import express from 'express';
import pool from '../config/connectDatabase.js';
import { authenticateToken } from '../utils/generateToken.js';
import { checkPermission } from '../middlewares/rbacMiddleware.js';
import { FEATURES, PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();

// ─── Hằng số nghiệp vụ ───────────────────────────────────────────────────────
const THANG_13 = 13;
const MIEN_GIAM_CANH = 11000000; // Giảm trừ bản thân (đồng)
const MIEN_GIAM_PT = 4400000;  // Giảm trừ mỗi người phụ thuộc (đồng)

// Biểu thuế TNCN lũy tiến 7 bậc
const BIEU_THUE = [
    { den: 5000000, ty_le: 0.05, khau_tru: 0 },
    { den: 10000000, ty_le: 0.10, khau_tru: 250000 },
    { den: 18000000, ty_le: 0.15, khau_tru: 750000 },
    { den: 32000000, ty_le: 0.20, khau_tru: 1650000 },
    { den: 52000000, ty_le: 0.25, khau_tru: 3250000 },
    { den: 80000000, ty_le: 0.30, khau_tru: 5850000 },
    { den: Infinity, ty_le: 0.35, khau_tru: 9850000 },
];

/**
 * Helper: Tính thuế TNCN
 */
function tinhThueTNCN(thuNhapChiuThue, soNguoiPhuThuoc = 0) {
    const giamTru = MIEN_GIAM_CANH + soNguoiPhuThuoc * MIEN_GIAM_PT;
    const thuNhapTinh = Math.max(0, thuNhapChiuThue - giamTru);
    if (thuNhapTinh <= 0) return 0;
    for (const bac of BIEU_THUE) {
        if (thuNhapTinh <= bac.den) {
            return Math.round(thuNhapTinh * bac.ty_le - bac.khau_tru);
        }
    }
    return 0;
}
/**
 * Helper: Tính % khấu trừ theo số lần vi phạm (Trễ + Nghỉ không phép)
 */
function tinhPhanTramKhauTru(soViPham) {
    if (soViPham <= 10) return 0;
    if (soViPham <= 20) return 0.1;
    if (soViPham <= 30) return 0.2;
    if (soViPham <= 50) return 0.3;
    return 1.0; // > 50 lần -> trừ 100%
}
/**
 * Helper: Tính số tháng công trong năm (làm tròn đến 0.5 tháng)
 */
function tinhSoThangCong(ngayVaoLam, ngayNghiViec, nam) {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Nếu tính cho tương lai, trả về 0
    if (nam > currentYear) return 0;

    const batDauNam = new Date(nam, 0, 1);
    const cuoiNam = new Date(nam, 11, 31);

    // Nếu là năm hiện tại, chỉ tính đến ngày hôm nay
    const maxEnd = (nam === currentYear) ? today : cuoiNam;

    const start = new Date(Math.max(new Date(ngayVaoLam), batDauNam));
    const end = ngayNghiViec
        ? new Date(Math.min(new Date(ngayNghiViec), maxEnd))
        : maxEnd;

    if (start > end) return 0;

    const diffMs = end - start;
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

    // Quy tắc làm tròn: 
    // < 15 ngày -> 0, >= 15 ngày -> 0.5 tháng
    // Hoặc đơn giản là làm tròn đến 0.5 gần nhất
    return Math.min(12, Math.max(0, Math.round(diffMonths * 2) / 2));
}

// =========================================================================
// GET /api/luong-thang-13/xem-truoc/:nam
// Tính thử danh sách dự kiến
// =========================================================================
router.get(
    '/xem-truoc/:nam',
    authenticateToken,
    checkPermission(FEATURES.SALARY, PERMISSIONS.VIEW),
    async (req, res) => {
        const nam = parseInt(req.params.nam, 10);
        const currentYear = new Date().getFullYear();

        if (!nam || nam < 2020 || nam > currentYear) {
            return res.status(400).json({
                success: false,
                message: nam > currentYear ? `Không thể tính trước cho năm ${nam}` : 'Năm không hợp lệ'
            });
        }

        try {
            // 1. Lấy tất cả nhân viên làm việc trong năm + số vi phạm (Trễ + Nghỉ không phép)
            const [nhanViens] = await pool.query(
                `SELECT nv.MaNV, nv.HoTen, nv.ChucVu, nv.LuongCoBan, nv.PhuCapChiuThue,
                        nv.NgayVaoLam, nv.NgayNghiViec, nv.SoNguoiPhuThuoc,
                        COALESCE(vi.soViPham, 0) as soViPham
                 FROM nhanvien nv
                 LEFT JOIN (
                    SELECT MaNV, COUNT(*) as soViPham 
                    FROM cham_cong 
                    WHERE YEAR(Ngay) = ? AND TrangThai IN ('Tre', 'Nghi_khong_phep')
                    GROUP BY MaNV
                 ) vi ON nv.MaNV = vi.MaNV
                 WHERE nv.TinhTrang = 1
                    OR (nv.NgayNghiViec IS NOT NULL AND YEAR(nv.NgayNghiViec) = ?)`,
                [nam, nam]
            );

            // 2. Kiểm tra bản ghi đã tồn tại
            const [daCoRows] = await pool.query(
                `SELECT MaNV FROM luong WHERE Thang = ? AND Nam = ?`,
                [THANG_13, nam]
            );
            const daCo = new Set(daCoRows.map(r => r.MaNV));

            // 3. Tính toán
            const ketQua = nhanViens.map(nv => {
                const soThangCong = tinhSoThangCong(nv.NgayVaoLam, nv.NgayNghiViec, nam);

                if (soThangCong < 12) {
                    return {
                        MaNV: nv.MaNV, HoTen: nv.HoTen, ChucVu: nv.ChucVu,
                        soThangCong,
                        soViPham: nv.soViPham,
                        thuongT13_gross: 0,
                        thueTNCN: 0,
                        thuongT13_net: 0,
                        ghiChu: 'chưa làm đủ 12 tháng k thể tính luong thứ 13 Được',
                        daTonTai: daCo.has(nv.MaNV),
                    };
                }

                const tyLeKhauTru = tinhPhanTramKhauTru(nv.soViPham);
                const thuongGrossBase = Math.round(Number(nv.LuongCoBan) * soThangCong / 12);
                const thuongGross     = Math.round(thuongGrossBase * (1 - tyLeKhauTru));

                // Thuế TNCN (tính dựa trên thu nhập năm dự kiến)
                const thuNhapThang = Number(nv.LuongCoBan) + Number(nv.PhuCapChiuThue || 0);
                const thuNhapCaNam = thuNhapThang * 12;
                const thuNhapCoThuongT13 = thuNhapCaNam + thuongGross;
                const thueNam_koThuong = tinhThueTNCN(thuNhapCaNam, nv.SoNguoiPhuThuoc) * 12;
                const thueNam_coThuong = tinhThueTNCN(thuNhapCoThuongT13, nv.SoNguoiPhuThuoc);
                const thueTNCN = Math.max(0, thueNam_coThuong - thueNam_koThuong);

                const thuongNet = thuongGross - thueTNCN;

                let ghiChu = nv.NgayNghiViec
                    ? `Nghỉ việc ${nv.NgayNghiViec.toISOString().split('T')[0]} (đã làm ${soThangCong} tháng)`
                    : `Đủ 12 tháng`;
                
                if (tyLeKhauTru > 0) {
                    ghiChu += ` - Vi phạm ${nv.soViPham} lần (Trừ ${tyLeKhauTru * 100}%)`;
                }
                if (tyLeKhauTru === 1) {
                    ghiChu = `Vi phạm quá nhiều (${nv.soViPham} lần) - Không thưởng T13`;
                }

                return {
                    MaNV: nv.MaNV,
                    HoTen: nv.HoTen,
                    ChucVu: nv.ChucVu,
                    soThangCong,
                    soViPham: nv.soViPham,
                    tyLeKhauTru,
                    thuongT13_gross: thuongGross,
                    thueTNCN,
                    thuongT13_net: Math.round(thuongNet),
                    ghiChu,
                    daTonTai: daCo.has(nv.MaNV),
                };
            });

            res.json({
                success: true,
                nam,
                tongNhanVien: ketQua.length,
                tongChiPhi: ketQua.reduce((s, r) => s + r.thuongT13_gross, 0),
                data: ketQua,
            });
        } catch (err) {
            console.error('[Salary13] View error:', err);
            res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
        }
    }
);

// =========================================================================
// POST /api/luong-thang-13/tinh/:nam
// Lưu bảng lương tháng 13 vào DB
// =========================================================================
router.post(
    '/tinh/:nam',
    authenticateToken,
    checkPermission(FEATURES.SALARY, PERMISSIONS.CREATE),
    async (req, res) => {
        const nam = parseInt(req.params.nam, 10);
        if (!nam) return res.status(400).json({ success: false, message: 'Năm không hợp lệ' });

        const { maNVList } = req.body;
        const nguoiTao = req.user?.MaTK || 1;

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            let whereExtra = '';
            const queryParams = [nam];
            if (Array.isArray(maNVList) && maNVList.length > 0) {
                whereExtra = `AND nv.MaNV IN (${maNVList.map(() => '?').join(',')})`;
                queryParams.push(...maNVList);
            }

            const [nhanViens] = await conn.query(
                `SELECT nv.MaNV, nv.HoTen, nv.LuongCoBan, nv.PhuCapChiuThue, nv.PhuCapKhongChiuThue,
                        nv.NgayVaoLam, nv.NgayNghiViec, nv.SoNguoiPhuThuoc,
                        COALESCE(vi.soViPham, 0) as soViPham
                 FROM nhanvien nv
                 LEFT JOIN (
                    SELECT MaNV, COUNT(*) as soViPham 
                    FROM cham_cong 
                    WHERE YEAR(Ngay) = ? AND TrangThai IN ('Tre', 'Nghi_khong_phep')
                    GROUP BY MaNV
                 ) vi ON nv.MaNV = vi.MaNV
                 WHERE (nv.TinhTrang = 1
                        OR (nv.NgayNghiViec IS NOT NULL AND YEAR(nv.NgayNghiViec) = ?))
                 ${whereExtra}`,
                [nam, nam, ...queryParams]
            );

            const inserted = [];
            for (const nv of nhanViens) {
                const soThangCong = tinhSoThangCong(nv.NgayVaoLam, nv.NgayNghiViec, nam);
                if (soThangCong < 12) continue;

                const tyLeKhauTru = tinhPhanTramKhauTru(nv.soViPham);
                const thuongGrossBase = Math.round(Number(nv.LuongCoBan) * soThangCong / 12);
                const thuongGross     = Math.round(thuongGrossBase * (1 - tyLeKhauTru));
                
                // Thuế TNCN (tính dựa trên thu nhập năm dự kiến)
                const thuNhapThang = Number(nv.LuongCoBan) + Number(nv.PhuCapChiuThue || 0);
                const thuNhapCaNam = thuNhapThang * 12;
                const thuNhapCoThuongT13 = thuNhapCaNam + thuongGross;
                const thueNam_koThuong = tinhThueTNCN(thuNhapCaNam, nv.SoNguoiPhuThuoc) * 12;
                const thueNam_coThuong = tinhThueTNCN(thuNhapCoThuongT13, nv.SoNguoiPhuThuoc);
                const thueTNCN = Math.max(0, thueNam_coThuong - thueNam_koThuong);
                const luongThucLinh = Math.round(thuongGross - thueTNCN);

                let ghiChu = nv.NgayNghiViec
                    ? `Thưởng tháng 13 năm ${nam} - ${soThangCong} tháng (nghỉ việc)`
                    : `Thưởng tháng 13 năm ${nam} - đủ ${soThangCong} tháng`;
                
                if (tyLeKhauTru > 0) {
                    ghiChu += ` (Vi phạm ${nv.soViPham} lần - trừ ${tyLeKhauTru * 100}%)`;
                }

                await conn.query(
                    `INSERT INTO luong
                        (MaNV, Thang, Nam, LuongCoBan, PhuCap, Thuong, Phat,
                         KhauTruBHXH, ThueTNCN, LuongThucLinh, SoNgayLam,
                         SoGioTangCa, TongLuong, TrangThai, NgayTinh, GhiChu,
                         PayableDays, LuongCoBanThucTe)
                     VALUES (?, ?, ?, ?, 0, ?, 0, 0, ?, ?, 0, 0, ?, 'Chua_chi_tra', NOW(), ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                        Thuong = VALUES(Thuong),
                        ThueTNCN = VALUES(ThueTNCN),
                        LuongThucLinh = VALUES(LuongThucLinh),
                        TongLuong = VALUES(TongLuong),
                        TrangThai = 'Chua_chi_tra',
                        NgayTinh = NOW(),
                        GhiChu = VALUES(GhiChu),
                        PayableDays = VALUES(PayableDays)`,
                    [
                        nv.MaNV, THANG_13, nam, nv.LuongCoBan, thuongGross,
                        thueTNCN, luongThucLinh, thuongGross,
                        ghiChu, soThangCong, nv.LuongCoBan
                    ]
                );

                // Audit Log
                await conn.query(
                    `INSERT INTO nhat_ky_hoat_dong
                        (MaTK, HanhDong, BangDuLieu, MaBanGhi, DuLieuMoi, DiaChi_IP)
                     VALUES (?, 'Them', 'luong', ?, ?, ?)`,
                    [
                        nguoiTao, nv.MaNV,
                        JSON.stringify({ Thang: THANG_13, Nam: nam, Thuong: thuongGross }),
                        req.ip || '::1'
                    ]
                );

                inserted.push({ MaNV: nv.MaNV, HoTen: nv.HoTen, thuongGross });
            }

            await conn.commit();
            res.json({ success: true, message: `Đã tính thưởng tháng 13 cho ${inserted.length} nhân viên`, data: inserted });
        } catch (err) {
            await conn.rollback();
            console.error('[Salary13] Calc error:', err);
            res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
        } finally {
            conn.release();
        }
    }
);

// =========================================================================
// GET /api/luong-thang-13/:nam
// Lấy danh sách đã tính
// =========================================================================
router.get(
    '/:nam',
    authenticateToken,
    checkPermission(FEATURES.SALARY, PERMISSIONS.VIEW),
    async (req, res) => {
        const nam = parseInt(req.params.nam, 10);
        try {
            const [rows] = await pool.query(
                `SELECT l.*, nv.HoTen, nv.ChucVu
                 FROM luong l
                 JOIN nhanvien nv ON l.MaNV = nv.MaNV
                 WHERE l.Thang = ? AND l.Nam = ?
                 ORDER BY nv.HoTen`,
                [THANG_13, nam]
            );
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
);

// =========================================================================
// PATCH /api/luong-thang-13/:nam/:maNV/duyet
// Duyệt chi trả
// =========================================================================
router.patch(
    '/:nam/:maNV/duyet',
    authenticateToken,
    checkPermission(FEATURES.SALARY, PERMISSIONS.APPROVE),
    async (req, res) => {
        const { nam, maNV } = req.params;
        try {
            const [result] = await pool.query(
                `UPDATE luong SET TrangThai = 'Da_chi_tra', NgayTinh = NOW()
                 WHERE Thang = ? AND Nam = ? AND MaNV = ? AND TrangThai = 'Chua_chi_tra'`,
                [THANG_13, nam, maNV]
            );
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
            res.json({ success: true, message: 'Đã duyệt chi trả' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
);

// =========================================================================
// GET /api/luong-thang-13/ca-nhan/:nam
// Nhân viên tự xem thưởng T13 của mình
// =========================================================================
router.get(
    '/ca-nhan/:nam',
    authenticateToken,
    async (req, res) => {
        const nam = parseInt(req.params.nam, 10);
        try {
            const [rows] = await pool.query(
                `SELECT l.*, nv.HoTen, nv.ChucVu
                 FROM luong l
                 JOIN nhanvien nv ON l.MaNV = nv.MaNV
                 WHERE l.Thang = ? AND l.Nam = ? AND nv.MaTK = ?`,
                [THANG_13, nam, req.user.MaTK]
            );
            res.json({ success: true, data: rows[0] || null });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
);

// =========================================================================
// DELETE /api/luong-thang-13/:nam
// Xóa toàn bộ bảng lương T13 của năm (Rollback)
// =========================================================================
router.delete(
    '/:nam',
    authenticateToken,
    checkPermission(FEATURES.SALARY, PERMISSIONS.DELETE),
    async (req, res) => {
        const { nam } = req.params;
        try {
            // Chỉ cho phép xóa nếu CHƯA chi trả bản ghi nào (hoặc tùy chính sách)
            // Ở đây tôi cho phép xóa các bản ghi 'Chua_chi_tra'
            const [result] = await pool.query(
                `DELETE FROM luong WHERE Thang = ? AND Nam = ? AND TrangThai = 'Chua_chi_tra'`,
                [THANG_13, nam]
            );
            res.json({ success: true, message: ` Đã xóa ${result.affectedRows} bản ghi lương tháng 13 năm ${nam}` });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
);

export default router;
