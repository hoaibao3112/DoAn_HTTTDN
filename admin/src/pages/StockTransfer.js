import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/StockTransfer.css';

const StockTransfer = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [transfers, setTransfers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState('all'); // all, pending, approved, rejected
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        fromBranch: '',
        toBranch: '',
        items: []
    });

    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        fetchBranches();
        fetchProducts();
        fetchTransfers();
    }, []);

    const fetchBranches = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/branches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setBranches(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/warehouse/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setProducts(response.data.data?.items || response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchTransfers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                'http://localhost:5000/api/warehouse/transfers',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success && response.data.data) {
                // Map backend response to frontend format
                const mappedTransfers = response.data.data.map(transfer => ({
                    id: transfer.MaCK,
                    product: transfer.TenSP || 'N/A',
                    sku: transfer.MaSP || 'N/A',
                    fromBranch: transfer.TenCHNguon || `Chi nhánh ${transfer.MaCHNguon}`,
                    toBranch: transfer.TenCHDich || `Chi nhánh ${transfer.MaCHDich}`,
                    quantity: transfer.SoLuongKho || 0,
                    transferQty: transfer.SoLuong || 0,
                    status: transfer.TrangThai === 'Da_duyet' ? 'approved' :
                        transfer.TrangThai === 'Cho_duyet' ? 'pending' : 'exceeded',
                    createdDate: transfer.NgayTao
                }));
                setTransfers(mappedTransfers);
            } else {
                setTransfers([]);
            }
        } catch (error) {
            console.error('Error fetching transfers:', error);
            // Fallback to empty array if API fails
            setTransfers([]);
        }
    };

    const addProductToTransfer = (product) => {
        if (!selectedProducts.find(p => p.MaSP === product.MaSP)) {
            setSelectedProducts([...selectedProducts, { ...product, transferQty: 1 }]);
        }
    };

    const updateTransferQty = (productId, qty) => {
        setSelectedProducts(selectedProducts.map(p =>
            p.MaSP === productId ? { ...p, transferQty: parseInt(qty) || 0 } : p
        ));
    };

    const removeProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.MaSP !== productId));
    };

    const handleSubmitTransfer = async () => {
        if (!formData.fromBranch || !formData.toBranch) {
            alert('Vui lòng chọn chi nhánh nguồn và đích');
            return;
        }

        if (selectedProducts.length === 0) {
            alert('Vui lòng thêm sản phẩm cần chuyển');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const transferData = {
                MaCHNguon: formData.fromBranch,
                MaCHDich: formData.toBranch,
                items: selectedProducts.map(p => ({
                    MaSP: p.MaSP,
                    SoLuong: p.transferQty
                }))
            };

            const response = await axios.post(
                'http://localhost:5000/api/warehouse/transfers',
                transferData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Tạo yêu cầu chuyển kho thành công!');
                setShowCreateForm(false);
                setSelectedProducts([]);
                setFormData({ fromBranch: '', toBranch: '', items: [] });
                fetchTransfers();
            }
        } catch (error) {
            console.error('Error creating transfer:', error);
            alert('Lỗi tạo yêu cầu chuyển kho: ' + (error.response?.data?.message || error.message));
        }
    };

    const getTotalTransferQty = () => {
        return selectedProducts.reduce((sum, p) => sum + p.transferQty, 0);
    };

    const getStatusBadge = (status) => {
        const badges = {
            approved: { text: 'Hợp lệ', class: 'status-approved' },
            exceeded: { text: 'Vượt tồn kho', class: 'status-exceeded' },
            pending: { text: 'Chờ duyệt', class: 'status-pending' }
        };
        return badges[status] || badges.pending;
    };

    const filteredProducts = products.filter(p =>
        p.TenSP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.MaSP?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!hasPermissionById(FEATURES.STOCK, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
            </div>
        );
    }

    return (
        <div className="stock-transfer-page">
            <div className="page-header">
                <div>
                    <h1>Quản lý Chuyển Kho</h1>
                    <p className="page-subtitle">Tạo và quản lý các yêu cầu điều chuyển sách giữa các chi nhánh</p>
                </div>
                <div className="header-actions">
                    <button className="btn-outline" onClick={fetchTransfers}>
                        <span className="material-icons">refresh</span>
                        Lưu nháp
                    </button>
                    <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                        <span className="material-icons">add</span>
                        Gửi yêu cầu điều chuyển
                    </button>
                </div>
            </div>

            {showCreateForm && (
                <div className="create-transfer-section">
                    <div className="transfer-wizard">
                        <div className="wizard-steps">
                            <div className="step active">
                                <div className="step-number">1</div>
                                <span>Khởi tạo</span>
                            </div>
                            <div className="step-line"></div>
                            <div className="step">
                                <div className="step-number">2</div>
                                <span>Phê duyệt</span>
                            </div>
                            <div className="step-line"></div>
                            <div className="step">
                                <div className="step-number">3</div>
                                <span>Đang chuyển</span>
                            </div>
                            <div className="step-line"></div>
                            <div className="step">
                                <div className="step-number">4</div>
                                <span>Đã nhận</span>
                            </div>
                        </div>
                    </div>

                    <div className="transfer-form-grid">
                        {/* Left Panel - Branch Selection */}
                        <div className="form-panel">
                            <h3><span className="material-icons">info</span> Thông tin điều chuyển</h3>

                            <div className="form-group">
                                <label>Chi nhánh nguồn</label>
                                <select
                                    value={formData.fromBranch}
                                    onChange={(e) => setFormData({ ...formData, fromBranch: e.target.value })}
                                >
                                    <option value="">Chọn chi nhánh chuyển đi</option>
                                    {branches.map(b => (
                                        <option key={b.MaCH} value={b.MaCH}>{b.TenCH}</option>
                                    ))}
                                </select>
                                <span className="material-icons field-icon">warehouse</span>
                            </div>

                            <div className="form-group">
                                <label>Chi nhánh đích</label>
                                <select
                                    value={formData.toBranch}
                                    onChange={(e) => setFormData({ ...formData, toBranch: e.target.value })}
                                >
                                    <option value="">Chọn chi nhánh nhận</option>
                                    {branches.map(b => (
                                        <option key={b.MaCH} value={b.MaCH}>{b.TenCH}</option>
                                    ))}
                                </select>
                                <span className="material-icons field-icon">warehouse</span>
                            </div>

                            <div className="search-products">
                                <h4><span className="material-icons">search</span> Thêm sách vào danh sách</h4>
                                <div className="search-box">
                                    <span className="material-icons">search</span>
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên hoặc mã ISBN..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="search-results">
                                    <p className="results-header">KẾT QUẢ TÌM KIẾM</p>
                                    {filteredProducts.slice(0, 5).map(product => (
                                        <div key={product.MaSP} className="product-result-item">
                                            <div className="product-info">
                                                <img src={product.Anh || '/placeholder.jpg'} alt={product.TenSP} />
                                                <div>
                                                    <h5>{product.TenSP}</h5>
                                                    <p>{product.MaSP}</p>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-add-product"
                                                onClick={() => addProductToTransfer(product)}
                                            >
                                                <span className="material-icons">add</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Selected Products */}
                        <div className="form-panel">
                            <h3>Danh sách sách điều chuyển</h3>
                            <p className="transfer-count">Tổng số: {selectedProducts.length} đầu sách</p>

                            <div className="transfer-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>TÊN SÁCH</th>
                                            <th>TỒN KHO NGUỒN</th>
                                            <th>SỐ LƯỢNG CHUYỂN</th>
                                            <th>TRẠNG THÁI</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProducts.length > 0 ? (
                                            selectedProducts.map(product => (
                                                <tr key={product.MaSP}>
                                                    <td>
                                                        <div className="product-cell">
                                                            <img src={product.Anh || '/placeholder.jpg'} alt={product.TenSP} />
                                                            <div>
                                                                <strong>{product.TenSP}</strong>
                                                                <p>{product.MaSP}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{product.SoLuong || 45}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={product.transferQty}
                                                            onChange={(e) => updateTransferQty(product.MaSP, e.target.value)}
                                                            className="qty-input"
                                                        />
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${product.transferQty > (product.SoLuong || 45) ? 'status-exceeded' : 'status-approved'}`}>
                                                            {product.transferQty > (product.SoLuong || 45) ? 'Vượt tồn kho' : 'Hợp lệ'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn-icon-delete" onClick={() => removeProduct(product.MaSP)}>
                                                            <span className="material-icons">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="empty-state">Chưa có sản phẩm nào</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="transfer-summary">
                                <div className="summary-info">
                                    <span className="material-icons">info</span>
                                    <p>Lưu ý: Khi gửi yêu cầu, số lượng sách trong kho nguồn sẽ được tạm khóa cho đến khi yêu cầu được duyệt hoặc bị từ chối</p>
                                </div>
                                <div className="summary-total">
                                    Tổng số lượng chuyển: <strong>{getTotalTransferQty()} cuốn</strong>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="btn-cancel" onClick={() => setShowCreateForm(false)}>
                                    Hủy
                                </button>
                                <button className="btn-submit" onClick={handleSubmitTransfer}>
                                    <span className="material-icons">send</span>
                                    Gửi yêu cầu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer History */}
            {!showCreateForm && (
                <div className="transfer-history">
                    <div className="filter-tabs">
                        <button className={selectedTab === 'all' ? 'tab active' : 'tab'} onClick={() => setSelectedTab('all')}>
                            Tất cả
                        </button>
                        <button className={selectedTab === 'pending' ? 'tab active' : 'tab'} onClick={() => setSelectedTab('pending')}>
                            Chờ duyệt
                        </button>
                        <button className={selectedTab === 'approved' ? 'tab active' : 'tab'} onClick={() => setSelectedTab('approved')}>
                            Đã duyệt
                        </button>
                    </div>

                    <div className="history-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã chuyển kho</th>
                                    <th>Từ chi nhánh</th>
                                    <th>Đến chi nhánh</th>
                                    <th>Số sản phẩm</th>
                                    <th>Ngày tạo</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan="7" className="empty-state">Chưa có lịch sử chuyển kho</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockTransfer;
