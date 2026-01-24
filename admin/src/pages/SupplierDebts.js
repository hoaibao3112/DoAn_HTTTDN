import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/SupplierDebts.css';

const SupplierDebts = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [debts, setDebts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loadingsetLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    // Mock debts data
    const mockDebts = [
        {
            id: 1,
            supplier: 'NXB Trẻ',
            contact: '028-381-4521',
            purchaseOrder: 'PO-2023-4521',
            totalAmount: 45000000,
            paid: 30000000,
            remaining: 15000000,
            dueDate: '15/11/2023',
            status: 'unpaid'
        },
        {
            id: 2,
            supplier: 'Fahasa Books',
            contact: '028-3822-4689',
            purchaseOrder: 'PO-2023-2689',
            totalAmount: 12500000,
            paid: 0,
            remaining: 12500000,
            dueDate: '28/10/2023',
            status: 'overdue'
        },
        {
            id: 3,
            supplier: 'Kinh Tế Quốc Dân',
            contact: 'Contact: 034-982-...',
            purchaseOrder: 'PO-2023-4699',
            totalAmount: 105000000,
            paid: 55000000,
            remaining: 50000000,
            dueDate: '25/11/2023',
            status: 'unpaid'
        },
        {
            id: 4,
            supplier: 'Đông Mang Books',
            contact: 'Contact: 028-933-...',
            purchaseOrder: 'PO-2023-#619',
            totalAmount: 2400000,
            paid: 0,
            remaining: 2400000,
            dueDate: '30/11/2023',
            status: 'paid'
        }
    ];

    useEffect(() => {
        fetchDebts();
        fetchSuppliers();
    }, []);

    const fetchDebts = () => {
        setDebts(mockDebts);
    };

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/suppliers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSuppliers(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const calculateStats = () => {
        const totalDebt = debts.reduce((sum, d) => sum + d.remaining, 0);
        const paidThisMonth = debts.reduce((sum, d) => sum + d.paid, 0);
        const overdue = debts.filter(d => d.status === 'overdue').reduce((sum, d) => sum + d.remaining, 0);
        const suppliersWithDebt = new Set(debts.filter(d => d.remaining > 0).map(d => d.supplier)).size;

        return { totalDebt, paidThisMonth, overdue, suppliersWithDebt };
    };

    const handlePayment = (debt) => {
        setSelectedDebt(debt);
        setPaymentAmount(debt.remaining);
        setShowPaymentModal(true);
    };

    const submitPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (parseFloat(paymentAmount) > selectedDebt.remaining) {
            alert('Số tiền thanh toán vượt quá công nợ còn lại');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const paymentData = {
                MaNCC: selectedDebt.supplierId,
                SoTien: parseFloat(paymentAmount),
                PhuongThuc: 'Chuyen_khoan',
                GhiChu: `Thanh toán ${selectedDebt.purchaseOrder}`
            };

            const response = await axios.post(
                'http://localhost:5000/api/debts/pay',
                paymentData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Ghi nhận thanh toán thành công!');
                setShowPaymentModal(false);
                setSelectedDebt(null);
                setPaymentAmount('');
                fetchDebts();
            }
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Lỗi ghi nhận thanh toán: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            paid: { text: 'ĐÃ THANH TOÁN', class: 'status-paid' },
            unpaid: { text: 'MỚI PHÁT', class: 'status-unpaid' },
            overdue: { text: 'CHƯA TRẢ', class: 'status-overdue' }
        };
        return badges[status] || badges.unpaid;
    };

    const filteredDebts = debts.filter(d => {
        if (filterStatus === 'all') return true;
        return d.status === filterStatus;
    });

    const stats = calculateStats();

    if (!hasPermissionById(FEATURES.SUPPLIERS, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
            </div>
        );
    }

    return (
        <div className="supplier-debts-page">
            <div className="page-header">
                <div>
                    <h1>Quản lý Công Nợ Nhà Cung Cấp</h1>
                    <p className="page-subtitle">Theo dõi, đối soát và thanh toán các khoản nợ nhập hàng</p>
                </div>
                <div className="header-actions">
                    <button className="btn-history">
                        <span className="material-icons">history</span>
                        Lịch sử thanh toán
                    </button>
                    <button className="btn-export">
                        <span className="material-icons">file_download</span>
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="debts-stats">
                <div className="stat-card blue">
                    <div className="stat-icon">
                        <span className="material-icons">account_balance_wallet</span>
                    </div>
                    <div className="stat-content">
                        <h3>TỔNG NỢ CẦN TRẢ</h3>
                        <div className="stat-value">{stats.totalDebt.toLocaleString()}.000đ</div>
                        <div className="stat-trend positive">+4.2% so với tháng trước</div>
                    </div>
                </div>

                <div className="stat-card green">
                    <div className="stat-icon">
                        <span className="material-icons">check_circle</span>
                    </div>
                    <div className="stat-content">
                        <h3>ĐÃ TRẢ THÁNG NÀY</h3>
                        <div className="stat-value">{stats.paidThisMonth.toLocaleString()}.000đ</div>
                        <div className="stat-trend positive">+12.4% so với tháng trước</div>
                    </div>
                </div>

                <div className="stat-card red">
                    <div className="stat-icon">
                        <span className="material-icons">warning</span>
                    </div>
                    <div className="stat-content">
                        <h3>NỢ QUÁ HẠN</h3>
                        <div className="stat-value">{stats.overdue.toLocaleString()}.000đ</div>
                        <div className="stat-trend negative">-2.1% cảnh báo quá hạn</div>
                    </div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-icon">
                        <span className="material-icons">store</span>
                    </div>
                    <div className="stat-content">
                        <h3>NHÀ CUNG CẤP CÒN NỢ</h3>
                        <div className="stat-value">{stats.suppliersWithDebt} Nhà cung cấp</div>
                        <div className="stat-trend">+1 nợ mới tháng này</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="debts-controls">
                <div className="filter-section">
                    <button className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
                        Tất cả trạng thái
                    </button>
                    <select className="filter-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        <option value="">Tất cả thời hạn: Tháng này</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={i} value={i + 1}>Tháng {i + 1}</option>
                        ))}
                    </select>
                    <button className="btn-icon">
                        <span className="material-icons">refresh</span>
                    </button>
                </div>
            </div>

            {/* Debts Table */}
            <div className="debts-table-section">
                <div className="table-header">
                    <h3>Danh sách nợ chi tiết</h3>
                </div>

                <table className="debts-table">
                    <thead>
                        <tr>
                            <th>NHÀ CUNG CẤP</th>
                            <th>MÃ PHIẾU HÀNG</th>
                            <th>TỔNG TIỀN</th>
                            <th>ĐÃ THANH TOÁN</th>
                            <th>CÒN LẠI</th>
                            <th>HẠN THANH TOÁN</th>
                            <th>TRẠNG THÁI</th>
                            <th>HÀNH ĐỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDebts.length > 0 ? (
                            filteredDebts.map(debt => {
                                const statusBadge = getStatusBadge(debt.status);
                                return (
                                    <tr key={debt.id}>
                                        <td>
                                            <div className="supplier-cell">
                                                <div className="supplier-avatar">{debt.supplier.charAt(0)}</div>
                                                <div>
                                                    <strong>{debt.supplier}</strong>
                                                    <p>{debt.contact}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="po-code">{debt.purchaseOrder}</td>
                                        <td className="amount-cell">{debt.totalAmount.toLocaleString()}.000đ</td>
                                        <td className="paid-cell">
                                            {debt.paid > 0 ? `${debt.paid.toLocaleString()}.000đ` : 'Ođ'}
                                        </td>
                                        <td className="remaining-cell">
                                            {debt.remaining > 0 ? (
                                                <span className="remaining-amount">{debt.remaining.toLocaleString()}.000đ</span>
                                            ) : (
                                                'Ođ'
                                            )}
                                        </td>
                                        <td className="due-date">{debt.dueDate}</td>
                                        <td>
                                            <span className={`status-badge ${statusBadge.class}`}>
                                                {statusBadge.text}
                                            </span>
                                        </td>
                                        <td>
                                            {debt.remaining > 0 && (
                                                <button className="btn-pay" onClick={() => handlePayment(debt)}>
                                                    Thanh toán
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="empty-state">Không có công nợ</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="table-footer">
                    <div className="footer-info">
                        Hiển thị 1 - 4 trong số 12 nhà cung cấp
                    </div>
                    <div className="pagination">
                        <button className="page-btn"><span className="material-icons">chevron_left</span></button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <button className="page-btn"><span className="material-icons">chevron_right</span></button>
                    </div>
                </div>
            </div>

            {/* Payment Guidelines */}
            <div className="payment-guidelines">
                <div className="guideline-card">
                    <span className="material-icons">info</span>
                    <div>
                        <h4>Nhắc nhở thanh toán</h4>
                        <p>Có 4 nhà cung cấp sắp đến hạn thanh toán trong vòng 48 giờ tới và cần liên hệ nhà bank để thực hiện giao hạn nhận hàng nếu vẫn còn 25,400,000đ. Hãy chủ động nguyên tắc giá hạn nhưng rác</p>
                    </div>
                </div>
                <button className="btn-legal">
                    <span className="material-icons">gavel</span>
                    Tạo phiếu chi thanh toán luật
                </button>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedDebt && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Ghi nhận thanh toán</h2>
                            <button className="btn-close" onClick={() => setShowPaymentModal(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="debt-info">
                                <div className="info-row">
                                    <span>Nhà cung cấp:</span>
                                    <strong>{selectedDebt.supplier}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Phiếu nhập:</span>
                                    <strong>{selectedDebt.purchaseOrder}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Nợ còn lại:</span>
                                    <strong className="debt-amount">{selectedDebt.remaining.toLocaleString()}.000đ</strong>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Số tiền thanh toán</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Nhập số tiền"
                                    className="payment-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Hình thức thanh toán</label>
                                <select className="payment-method-select">
                                    <option value="transfer">Chuyển khoản</option>
                                    <option value="cash">Tiền mặt</option>
                                    <option value="card">Thẻ</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    placeholder="Nhập ghi chú (tùy chọn)"
                                    className="payment-note"
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel-modal" onClick={() => setShowPaymentModal(false)}>
                                Hủy
                            </button>
                            <button className="btn-submit-payment" onClick={submitPayment}>
                                <span className="material-icons">check_circle</span>
                                Xác nhận thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierDebts;
