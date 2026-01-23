import pool from '../config/connectDatabase.js';
import { logActivity } from '../utils/auditLogger.js';

const customerController = {
    // ======================= GET ALL CUSTOMERS =======================
    getAllCustomers: async (req, res) => {
        const { search, page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;

        try {
            let sql = 'SELECT * FROM khachhang WHERE 1=1';
            const params = [];

            if (search) {
                sql += ' AND (HoTen LIKE ? OR SDT LIKE ? OR Email LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            sql += ' ORDER BY HoTen LIMIT ? OFFSET ?';
            params.push(parseInt(pageSize), offset);

            const [rows] = await pool.query(sql, params);

            const [total] = await pool.query(
                'SELECT COUNT(*) as total FROM khachhang WHERE 1=1' + (search ? ' AND (HoTen LIKE ? OR SDT LIKE ? OR Email LIKE ?)' : ''),
                search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
            );

            res.json({
                success: true,
                data: rows,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total: total[0].total
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= GET CUSTOMER BY ID =======================
    getCustomerById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query('SELECT * FROM khachhang WHERE MaKH = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
            }
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= CREATE CUSTOMER =======================
    createCustomer: async (req, res) => {
        const { HoTen, SDT, Email, DiaChi } = req.body;

        if (!HoTen || !SDT) {
            return res.status(400).json({ success: false, message: 'Họ tên và Số điện thoại là bắt buộc' });
        }

        try {
            const [result] = await pool.query(
                'INSERT INTO khachhang (HoTen, SDT, Email, DiaChi) VALUES (?, ?, ?, ?)',
                [HoTen, SDT, Email, DiaChi]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Them',
                BangDuLieu: 'khachhang',
                MaBanGhi: result.insertId,
                DuLieuMoi: { HoTen, SDT, Email },
                DiaChi_IP: req.ip
            });

            res.status(201).json({ success: true, MaKH: result.insertId, message: 'Thêm khách hàng thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= UPDATE CUSTOMER =======================
    updateCustomer: async (req, res) => {
        const { id } = req.params;
        const { HoTen, SDT, Email, DiaChi, DiemTichLuy, TongChiTieu } = req.body;

        try {
            const [oldData] = await pool.query('SELECT * FROM khachhang WHERE MaKH = ?', [id]);
            if (oldData.length === 0) {
                return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
            }

            await pool.query(
                `UPDATE khachhang 
                 SET HoTen = ?, SDT = ?, Email = ?, DiaChi = ?, DiemTichLuy = ?, TongChiTieu = ?
                 WHERE MaKH = ?`,
                [HoTen, SDT, Email, DiaChi, DiemTichLuy ?? oldData[0].DiemTichLuy, TongChiTieu ?? oldData[0].TongChiTieu, id]
            );

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Sua',
                BangDuLieu: 'khachhang',
                MaBanGhi: id,
                DuLieuCu: JSON.stringify(oldData[0]),
                DuLieuMoi: JSON.stringify({ HoTen, SDT, Email }),
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Cập nhật thông tin khách hàng thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= DELETE CUSTOMER =======================
    deleteCustomer: async (req, res) => {
        const { id } = req.params;
        try {
            // Check if customer has invoices before deleting (optional, but good practice)
            const [invoices] = await pool.query('SELECT MaHD FROM hoadon WHERE MaKH = ? LIMIT 1', [id]);
            if (invoices.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa khách hàng đã có lịch sử mua hàng. Vui lòng vô hiệu hóa thay vì xóa.'
                });
            }

            const [result] = await pool.query('DELETE FROM khachhang WHERE MaKH = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
            }

            await logActivity({
                MaTK: req.user.MaTK,
                HanhDong: 'Xoa',
                BangDuLieu: 'khachhang',
                MaBanGhi: id,
                DiaChi_IP: req.ip
            });

            res.json({ success: true, message: 'Xóa khách hàng thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default customerController;
