import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const supplierController = {
    // ======================= GET ALL SUPPLIERS =======================
    getAllSuppliers: async (req, res) => {
        const {
            search,
            status = '1',
            sortBy = 'TenNCC',
            sortOrder = 'ASC',
            page = 1,
            pageSize = 20
        } = req.query;

        try {
            let sql = 'SELECT * FROM nhacungcap WHERE 1=1';
            const params = [];

            if (search) {
                sql += ' AND (TenNCC LIKE ? OR SDT LIKE ? OR Email LIKE ? OR DiaChi LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            if (status) {
                sql += ' AND TinhTrang = ?';
                params.push(status);
            }

            // Sorting
            const allowedSortFields = ['TenNCC', 'SDT', 'Email', 'MaNCC'];
            const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'TenNCC';
            const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            sql += ` ORDER BY ${sortField} ${order}`;

            // Pagination
            const offset = (page - 1) * pageSize;
            sql += ` LIMIT ? OFFSET ?`;
            params.push(parseInt(pageSize), offset);

            const [rows] = await pool.query(sql, params);

            // Get total count
            let countSql = 'SELECT COUNT(*) as total FROM nhacungcap WHERE 1=1';
            const countParams = [];
            if (search) {
                countSql += ' AND (TenNCC LIKE ? OR SDT LIKE ? OR Email LIKE ? OR DiaChi LIKE ?)';
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            if (status) {
                countSql += ' AND TinhTrang = ?';
                countParams.push(status);
            }

            const [countResult] = await pool.query(countSql, countParams);

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / pageSize)
                },
                filters: { search, status },
                sort: { sortBy: sortField, sortOrder: order }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= GET SUPPLIER BY ID =======================
    getSupplierById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query('SELECT * FROM nhacungcap WHERE MaNCC = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Nhà cung cấp không tồn tại' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= CREATE SUPPLIER =======================
    createSupplier: async (req, res) => {
        const { TenNCC, DiaChi, SDT, Email, MaSoThue, NguoiLienHe } = req.body;

        // Validation
        if (!TenNCC) {
            return res.status(400).json({ success: false, message: 'Tên nhà cung cấp là bắt buộc' });
        }

        try {
            const [result] = await pool.query(
                `INSERT INTO nhacungcap (TenNCC, DiaChi, SDT, Email, MaSoThue, NguoiLienHe) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [TenNCC, DiaChi, SDT, Email, MaSoThue, NguoiLienHe]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'nhacungcap',
                MaBanGhi: result.insertId,
                DuLieuMoi: { TenNCC, SDT, Email },
                DiaChi_IP: req.ip
            });

            res.json({ success: true, MaNCC: result.insertId, message: 'Tạo nhà cung cấp thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= UPDATE SUPPLIER =======================
    updateSupplier: async (req, res) => {
        const { id } = req.params;
        const { TenNCC, DiaChi, SDT, Email, MaSoThue, NguoiLienHe, TinhTrang } = req.body;

        try {
            // Get old data for audit
            const [oldData] = await pool.query('SELECT * FROM nhacungcap WHERE MaNCC = ?', [id]);
            if (oldData.length === 0) {
                return res.status(404).json({ success: false, message: 'Nhà cung cấp không tồn tại' });
            }

            await pool.query(
                `UPDATE nhacungcap 
                 SET TenNCC = ?, DiaChi = ?, SDT = ?, Email = ?, MaSoThue = ?, NguoiLienHe = ?, TinhTrang = ?
                 WHERE MaNCC = ?`,
                [TenNCC, DiaChi, SDT, Email, MaSoThue, NguoiLienHe, TinhTrang ?? 1, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'nhacungcap',
                MaBanGhi: id,
                DuLieuCu: JSON.stringify(oldData[0]),
                DuLieuMoi: JSON.stringify({ TenNCC, SDT, Email }),
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật nhà cung cấp thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= DELETE SUPPLIER =======================
    deleteSupplier: async (req, res) => {
        const { id } = req.params;
        try {
            // Soft delete
            const [result] = await pool.query('UPDATE nhacungcap SET TinhTrang = 0 WHERE MaNCC = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Nhà cung cấp không tồn tại' });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'nhacungcap',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Xóa nhà cung cấp thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= GET ALL DEBTS =======================
    getAllDebts: async (req, res) => {
        try {
            const [rows] = await pool.query(
                `SELECT cn.*, ncc.TenNCC as supplier, ncc.SDT as contact, pn.MaPN as purchaseOrder,
                        cn.SoTienNo as totalAmount, cn.SoTienDaTra as paid, cn.SoTienConLai as remaining,
                        cn.HanThanhToan as dueDate, cn.TrangThai as status
                 FROM cong_no_ncc cn
                 JOIN nhacungcap ncc ON cn.MaNCC = ncc.MaNCC
                 LEFT JOIN phieunhap pn ON cn.MaPN = pn.MaPN
                 ORDER BY cn.NgayPhatSinh DESC`
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= GET SUPPLIER DEBTS =======================
    getSupplierDebts: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query(
                `SELECT cn.*, pn.NgayNhap, pn.TongTien
                 FROM cong_no_ncc cn
                 JOIN phieunhap pn ON cn.MaPN = pn.MaPN
                 WHERE cn.MaNCC = ? AND cn.SoTienConLai > 0
                 ORDER BY cn.NgayPhatSinh DESC`,
                [id]
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= RECORD DEBT PAYMENT =======================
    recordDebtPayment: async (req, res) => {
        const { MaCongNo, SoTien, PhuongThuc, GhiChu } = req.body;

        if (!MaCongNo || !SoTien || SoTien <= 0) {
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Get current debt
            const [debt] = await conn.query('SELECT * FROM cong_no_ncc WHERE MaCongNo = ?', [MaCongNo]);
            if (debt.length === 0) {
                throw new Error('Công nợ không tồn tại');
            }

            if (SoTien > debt[0].SoTienConLai) {
                throw new Error('Số tiền trả vượt quá số tiền còn lại');
            }

            // Record payment history
            await conn.query(
                `INSERT INTO lich_su_tra_no_ncc (MaCongNo, SoTienTra, HinhThucTra, NguoiThu, GhiChu)
                 VALUES (?, ?, ?, ?, ?)`,
                [MaCongNo, SoTien, PhuongThuc || 'Tien_mat', req.user.MaTK, GhiChu]
            );

            // Update debt
            const newPaid = parseFloat(debt[0].SoTienDaTra) + parseFloat(SoTien);
            const newRemaining = parseFloat(debt[0].SoTienNo) - newPaid;
            let newStatus = 'Chua_thanh_toan';

            if (newRemaining <= 0) {
                newStatus = 'Da_thanh_toan';
            } else if (newPaid > 0) {
                newStatus = 'Da_thanh_toan_1_phan';
            }

            await conn.query(
                `UPDATE cong_no_ncc 
                 SET SoTienDaTra = ?, TrangThai = ?
                 WHERE MaCongNo = ?`,
                [newPaid, newStatus, MaCongNo]
            );

            await conn.commit();
            res.json({ success: true, message: 'Ghi nhận thanh toán thành công', SoTienConLai: newRemaining });
        } catch (error) {
            await conn.rollback();
            res.status(500).json({ success: false, message: error.message });
        } finally {
            conn.release();
        }
    }
};

export default supplierController;
