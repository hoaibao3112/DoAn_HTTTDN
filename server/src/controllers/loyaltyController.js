import pool from '../config/database.js';
import { logActivity } from '../utils/activityLogger.js';

// =====================================================
// THÔNG TIN HỘI VIÊN
// =====================================================

/**
 * Lấy thông tin hội viên của khách hàng
 * GET /api/loyalty/customer/:customerId
 */
export const getCustomerLoyaltyInfo = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { customerId } = req.params;

    const [customers] = await connection.query(
      `SELECT * FROM v_ThongTinHoiVien WHERE MaKH = ?`,
      [customerId]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng'
      });
    }

    res.json({
      success: true,
      data: customers[0]
    });
  } catch (error) {
    console.error('Error getting customer loyalty info:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin hội viên',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Lấy tất cả hội viên
 * GET /api/loyalty/customers
 */
export const getAllCustomersLoyalty = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { hang, minDiem, maxDiem, page = 1, limit = 20 } = req.query;
    
    let query = `SELECT * FROM v_ThongTinHoiVien WHERE 1=1`;
    const params = [];

    if (hang) {
      query += ` AND HangTV = ?`;
      params.push(hang);
    }

    if (minDiem) {
      query += ` AND DiemTichLuy >= ?`;
      params.push(parseInt(minDiem));
    }

    if (maxDiem) {
      query += ` AND DiemTichLuy <= ?`;
      params.push(parseInt(maxDiem));
    }

    query += ` ORDER BY TongDiemTichLuy DESC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [customers] = await connection.query(query, params);

    // Đếm tổng số
    let countQuery = `SELECT COUNT(*) as total FROM v_ThongTinHoiVien WHERE 1=1`;
    const countParams = [];
    if (hang) {
      countQuery += ` AND HangTV = ?`;
      countParams.push(hang);
    }
    if (minDiem) {
      countQuery += ` AND DiemTichLuy >= ?`;
      countParams.push(parseInt(minDiem));
    }
    if (maxDiem) {
      countQuery += ` AND DiemTichLuy <= ?`;
      countParams.push(parseInt(maxDiem));
    }

    const [countResult] = await connection.query(countQuery, countParams);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting all customers loyalty:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hội viên',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// =====================================================
// LỊCH SỬ ĐIỂM
// =====================================================

/**
 * Lấy lịch sử điểm của khách hàng
 * GET /api/loyalty/history/:customerId
 */
export const getPointsHistory = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { customerId } = req.params;
    const { loai, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT ls.*, kh.SDT, kh.Email
      FROM lich_su_diem ls
      LEFT JOIN khachhang kh ON ls.MaKH = kh.MaKH
      WHERE ls.MaKH = ?
    `;
    const params = [customerId];

    if (loai) {
      query += ` AND ls.LoaiGiaoDich = ?`;
      params.push(loai);
    }

    query += ` ORDER BY ls.NgayGiaoDich DESC`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [history] = await connection.query(query, params);

    // Đếm tổng số
    let countQuery = `SELECT COUNT(*) as total FROM lich_su_diem WHERE MaKH = ?`;
    const countParams = [customerId];
    if (loai) {
      countQuery += ` AND LoaiGiaoDich = ?`;
      countParams.push(loai);
    }

    const [countResult] = await connection.query(countQuery, countParams);

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting points history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử điểm',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// =====================================================
// TÍCH ĐIỂM
// =====================================================

/**
 * Tính điểm sẽ được cộng cho đơn hàng
 * POST /api/loyalty/calculate-points
 */
export const calculatePoints = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { tongTien, maTheLoai, hangTV } = req.body;

    if (!tongTien || !hangTV) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: tongTien, hangTV'
      });
    }

    const currentTime = new Date();
    const dayOfWeek = currentTime.getDay();
    const timeOfDay = currentTime.toTimeString().slice(0, 5);

    const [result] = await connection.query(
      `SELECT fn_TinhDiemDuocCong(?, ?, ?, ?, ?) as diemDuocCong`,
      [tongTien, maTheLoai || null, hangTV, timeOfDay, dayOfWeek]
    );

    res.json({
      success: true,
      data: {
        tongTien,
        diemDuocCong: result[0].diemDuocCong,
        giaTriDiem: result[0].diemDuocCong * 100, // 1 điểm = 100đ
        hangTV
      }
    });
  } catch (error) {
    console.error('Error calculating points:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tính điểm',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Cộng điểm cho khách hàng (khi hoàn tất đơn hàng)
 * POST /api/loyalty/add-points
 */
export const addPoints = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { maKH, maHD, soDiem, lyDo, moTa } = req.body;
    const maNV = req.user?.MaNV;

    if (!maKH || !soDiem) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: maKH, soDiem'
      });
    }

    // Lấy điểm hiện tại
    const [customer] = await connection.query(
      `SELECT DiemTichLuy, TongDiemTichLuy FROM khachhang WHERE MaKH = ?`,
      [maKH]
    );

    if (customer.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    const diemTruoc = customer[0].DiemTichLuy;
    const diemSau = diemTruoc + soDiem;

    // Lưu lịch sử
    await connection.query(
      `INSERT INTO lich_su_diem 
      (MaKH, MaHD, LoaiGiaoDich, SoDiem, DiemTruoc, DiemSau, LyDo, MoTa, NguoiThucHien)
      VALUES (?, ?, 'Cong_diem', ?, ?, ?, ?, ?, ?)`,
      [maKH, maHD, soDiem, diemTruoc, diemSau, lyDo, moTa, maNV]
    );

    // Cập nhật điểm cho khách hàng
    await connection.query(
      `UPDATE khachhang 
       SET DiemTichLuy = DiemTichLuy + ?,
           TongDiemTichLuy = TongDiemTichLuy + ?
       WHERE MaKH = ?`,
      [soDiem, soDiem, maKH]
    );

    // Cập nhật điểm vào hóa đơn nếu có
    if (maHD) {
      await connection.query(
        `UPDATE hoadon SET DiemTichLuy = ? WHERE MaHD = ?`,
        [soDiem, maHD]
      );
    }

    await connection.commit();

    // Log activity
    await logActivity(pool, {
      MaNV: maNV,
      HanhDong: 'CONG_DIEM',
      ChiTiet: `Cộng ${soDiem} điểm cho khách hàng ${maKH}${maHD ? ` (Đơn hàng: ${maHD})` : ''}`
    });

    res.json({
      success: true,
      message: 'Cộng điểm thành công',
      data: {
        maKH,
        soDiem,
        diemTruoc,
        diemSau
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding points:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cộng điểm',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Trừ điểm của khách hàng (dùng điểm thanh toán)
 * POST /api/loyalty/use-points
 */
export const usePoints = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { maKH, maHD, soDiem, tongTien, lyDo, moTa } = req.body;
    const maNV = req.user?.MaNV;

    if (!maKH || !soDiem || !tongTien) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: maKH, soDiem, tongTien'
      });
    }

    // Lấy thông tin khách hàng và hạng
    const [customer] = await connection.query(
      `SELECT kh.DiemTichLuy, kh.HangTV, ud.ToiDaDungDiem
       FROM khachhang kh
       LEFT JOIN uu_dai_hang_thanh_vien ud ON kh.HangTV COLLATE utf8mb4_unicode_ci = ud.HangTV
       WHERE kh.MaKH = ?`,
      [maKH]
    );

    if (customer.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    const diemHienTai = customer[0].DiemTichLuy;
    const toiDaDungDiem = customer[0].ToiDaDungDiem || 50;

    // Kiểm tra đủ điểm
    if (diemHienTai < soDiem) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Không đủ điểm. Điểm hiện tại: ${diemHienTai}`
      });
    }

    // Kiểm tra giới hạn sử dụng điểm
    const giaTriDiem = soDiem * 100; // 1 điểm = 100đ
    const phanTramDung = (giaTriDiem / tongTien) * 100;

    if (phanTramDung > toiDaDungDiem) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Vượt quá giới hạn sử dụng điểm (${toiDaDungDiem}% giá trị đơn). Tối đa có thể dùng: ${Math.floor((tongTien * toiDaDungDiem / 100) / 100)} điểm`
      });
    }

    const diemSau = diemHienTai - soDiem;

    // Lưu lịch sử
    await connection.query(
      `INSERT INTO lich_su_diem 
      (MaKH, MaHD, LoaiGiaoDich, SoDiem, DiemTruoc, DiemSau, LyDo, MoTa, NguoiThucHien)
      VALUES (?, ?, 'Tru_diem', ?, ?, ?, ?, ?, ?)`,
      [maKH, maHD, -soDiem, diemHienTai, diemSau, lyDo || 'Sử dụng điểm thanh toán', moTa, maNV]
    );

    // Cập nhật điểm
    await connection.query(
      `UPDATE khachhang 
       SET DiemTichLuy = DiemTichLuy - ?,
           DiemDaDung = DiemDaDung + ?
       WHERE MaKH = ?`,
      [soDiem, soDiem, maKH]
    );

    // Cập nhật hóa đơn nếu có
    if (maHD) {
      await connection.query(
        `UPDATE hoadon SET DiemDaDung = ? WHERE MaHD = ?`,
        [soDiem, maHD]
      );
    }

    await connection.commit();

    // Log activity
    await logActivity(pool, {
      MaNV: maNV,
      HanhDong: 'SU_DUNG_DIEM',
      ChiTiet: `Khách hàng ${maKH} sử dụng ${soDiem} điểm (${giaTriDiem.toLocaleString()}đ)${maHD ? ` cho đơn hàng ${maHD}` : ''}`
    });

    res.json({
      success: true,
      message: 'Sử dụng điểm thành công',
      data: {
        maKH,
        soDiemDung: soDiem,
        giaTriGiam: giaTriDiem,
        diemConLai: diemSau
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error using points:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi sử dụng điểm',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// =====================================================
// QUY TẮC & ƯU ĐÃI
// =====================================================

/**
 * Lấy tất cả quy tắc tích điểm
 * GET /api/loyalty/rules
 */
export const getPointsRules = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { trangThai } = req.query;

    let query = `SELECT * FROM quy_tac_tich_diem`;
    const params = [];

    if (trangThai !== undefined) {
      query += ` WHERE TrangThai = ?`;
      params.push(parseInt(trangThai));
    }

    query += ` ORDER BY ThuTu, MaQT`;

    const [rules] = await connection.query(query, params);

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Error getting points rules:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy quy tắc tích điểm',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Lấy ưu đãi theo hạng
 * GET /api/loyalty/tiers
 */
export const getMembershipTiers = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [tiers] = await connection.query(
      `SELECT * FROM uu_dai_hang_thanh_vien WHERE TrangThai = 1 ORDER BY DiemToiThieu`
    );

    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    console.error('Error getting membership tiers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin hạng thành viên',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Lấy ưu đãi của một hạng cụ thể
 * GET /api/loyalty/tier/:tierName
 */
export const getTierBenefits = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { tierName } = req.params;

    const [tier] = await connection.query(
      `SELECT * FROM uu_dai_hang_thanh_vien WHERE HangTV = ? AND TrangThai = 1`,
      [tierName]
    );

    if (tier.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hạng thành viên'
      });
    }

    res.json({
      success: true,
      data: tier[0]
    });
  } catch (error) {
    console.error('Error getting tier benefits:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy ưu đãi hạng thành viên',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// =====================================================
// THỐNG KÊ
// =====================================================

/**
 * Thống kê tổng quan hệ thống hội viên
 * GET /api/loyalty/statistics
 */
export const getLoyaltyStatistics = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Thống kê theo hạng
    const [tierStats] = await connection.query(`
      SELECT 
        HangTV,
        COUNT(*) as SoLuong,
        SUM(DiemTichLuy) as TongDiem,
        AVG(DiemTichLuy) as DiemTrungBinh
      FROM khachhang
      GROUP BY HangTV
      ORDER BY FIELD(HangTV, 'Dong', 'Bac', 'Vang', 'Kim_cuong')
    `);

    // Top khách hàng có điểm cao nhất
    const [topCustomers] = await connection.query(`
      SELECT * FROM v_ThongTinHoiVien
      ORDER BY TongDiemTichLuy DESC
      LIMIT 10
    `);

    // Thống kê giao dịch điểm gần đây
    const [recentTransactions] = await connection.query(`
      SELECT 
        LoaiGiaoDich,
        COUNT(*) as SoGiaoDich,
        SUM(ABS(SoDiem)) as TongDiem
      FROM lich_su_diem
      WHERE NgayGiaoDich >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY LoaiGiaoDich
    `);

    // Tổng điểm đã phát hành và đã sử dụng
    const [pointsSummary] = await connection.query(`
      SELECT 
        SUM(DiemTichLuy) as TongDiemHienCo,
        SUM(TongDiemTichLuy) as TongDiemDaPhatHanh,
        SUM(DiemDaDung) as TongDiemDaSuDung
      FROM khachhang
    `);

    res.json({
      success: true,
      data: {
        theoHang: tierStats,
        topKhachHang: topCustomers,
        giaoDichGanDay: recentTransactions,
        tongQuan: pointsSummary[0]
      }
    });
  } catch (error) {
    console.error('Error getting loyalty statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * Điều chỉnh điểm thủ công (admin)
 * POST /api/loyalty/adjust-points
 */
export const adjustPoints = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { maKH, soDiem, lyDo, moTa } = req.body;
    const maNV = req.user?.MaNV;

    if (!maKH || !soDiem || !lyDo) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: maKH, soDiem, lyDo'
      });
    }

    // Lấy điểm hiện tại
    const [customer] = await connection.query(
      `SELECT DiemTichLuy FROM khachhang WHERE MaKH = ?`,
      [maKH]
    );

    if (customer.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    const diemTruoc = customer[0].DiemTichLuy;
    const diemSau = diemTruoc + soDiem;

    if (diemSau < 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Điểm sau điều chỉnh không thể âm'
      });
    }

    // Lưu lịch sử
    await connection.query(
      `INSERT INTO lich_su_diem 
      (MaKH, LoaiGiaoDich, SoDiem, DiemTruoc, DiemSau, LyDo, MoTa, NguoiThucHien)
      VALUES (?, 'Dieu_chinh', ?, ?, ?, ?, ?, ?)`,
      [maKH, soDiem, diemTruoc, diemSau, lyDo, moTa, maNV]
    );

    // Cập nhật điểm
    if (soDiem > 0) {
      await connection.query(
        `UPDATE khachhang 
         SET DiemTichLuy = DiemTichLuy + ?,
             TongDiemTichLuy = TongDiemTichLuy + ?
         WHERE MaKH = ?`,
        [soDiem, soDiem, maKH]
      );
    } else {
      await connection.query(
        `UPDATE khachhang 
         SET DiemTichLuy = DiemTichLuy + ?
         WHERE MaKH = ?`,
        [soDiem, maKH]
      );
    }

    await connection.commit();

    // Log activity
    await logActivity(pool, {
      MaNV: maNV,
      HanhDong: 'DIEU_CHINH_DIEM',
      ChiTiet: `Điều chỉnh ${soDiem > 0 ? '+' : ''}${soDiem} điểm cho KH ${maKH}. Lý do: ${lyDo}`
    });

    res.json({
      success: true,
      message: 'Điều chỉnh điểm thành công',
      data: {
        maKH,
        soDiemDieuChinh: soDiem,
        diemTruoc,
        diemSau
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adjusting points:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi điều chỉnh điểm',
      error: error.message
    });
  } finally {
    connection.release();
  }
};
