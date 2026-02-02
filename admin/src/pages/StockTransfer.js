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
    const [viewingTransfer, setViewingTransfer] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

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
            console.log('Products response:', response.data);
            if (response.data.success) {
                const productList = response.data.data?.items || response.data.data || [];
                console.log('Products loaded:', productList.length);
                setProducts(productList);
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
                    quantity: transfer.SoLuong || 0,
                    transferQty: transfer.SoLuong || 0,
                    status: transfer.TrangThai === 'Da_nhan' ? 'approved' :
                        transfer.TrangThai === 'Cho_duyet' ? 'pending' : 
                        transfer.TrangThai === 'Dang_chuyen' ? 'pending' : 'exceeded',
                    createdDate: transfer.NgayChuyen,
                    nguoiChuyen: transfer.TenNguoiChuyen,
                    nguoiNhan: transfer.TenNguoiNhan,
                    ghiChu: transfer.GhiChu
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
        console.log('Thêm sản phẩm:', product);
        console.log('Danh sách hiện tại:', selectedProducts);
        
        if (!selectedProducts.find(p => p.MaSP === product.MaSP)) {
            const newList = [...selectedProducts, { ...product, transferQty: 1 }];
            console.log('Danh sách mới:', newList);
            setSelectedProducts(newList);
        } else {
            console.log('Sản phẩm đã có trong danh sách');
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

    const viewTransferDetail = async (transferId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `http://localhost:5000/api/warehouse/transfers/${transferId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setViewingTransfer(response.data.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching transfer detail:', error);
            alert('Lỗi khi tải chi tiết chuyển kho');
        }
    };

    const approveTransfer = async (transferId) => {
        if (!window.confirm('Xác nhận duyệt yêu cầu chuyển kho này?')) {
            return;
        }
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `http://localhost:5000/api/warehouse/transfers/${transferId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                alert('Đã duyệt chuyển kho thành công!');
                fetchTransfers();
            }
        } catch (error) {
            console.error('Error approving transfer:', error);
            alert('Lỗi khi duyệt chuyển kho: ' + (error.response?.data?.message || error.message));
        }
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
                                                <img src={
                                                    product.HinhAnh 
                                                        ? (product.HinhAnh.startsWith('http') || product.HinhAnh.startsWith('/uploads') 
                                                            ? `http://localhost:5000${product.HinhAnh.startsWith('/') ? product.HinhAnh : '/' + product.HinhAnh}`
                                                            : `http://localhost:5000/product-images/${product.HinhAnh}`)
                                                        : '/placeholder.jpg'
                                                } alt={product.TenSP} />
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
                                                            <img src={
                                                                product.HinhAnh 
                                                                    ? (product.HinhAnh.startsWith('http') || product.HinhAnh.startsWith('/uploads') 
                                                                        ? `http://localhost:5000${product.HinhAnh.startsWith('/') ? product.HinhAnh : '/' + product.HinhAnh}`
                                                                        : `http://localhost:5000/product-images/${product.HinhAnh}`)
                                                                    : '/placeholder.jpg'
                                                            } alt={product.TenSP} />
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
                                {transfers
                                    .filter(t => selectedTab === 'all' || t.status === selectedTab)
                                    .length > 0 ? (
                                    transfers
                                        .filter(t => selectedTab === 'all' || t.status === selectedTab)
                                        .map(transfer => (
                                            <tr key={transfer.id}>
                                                <td>{transfer.id}</td>
                                                <td>{transfer.fromBranch}</td>
                                                <td>{transfer.toBranch}</td>
                                                <td>{transfer.quantity}</td>
                                                <td>{new Date(transfer.createdDate).toLocaleDateString('vi-VN')}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusBadge(transfer.status).class}`}>
                                                        {getStatusBadge(transfer.status).text}
                                                    </span>
                                                </td>
                                                <td>
                                                    {transfer.status === 'pending' && hasPermissionById(FEATURES.STOCK, 'sua') && (
                                                        <button 
                                                            className="btn-icon" 
                                                            onClick={() => approveTransfer(transfer.id)}
                                                            title="Duyệt chuyển kho"
                                                        >
                                                            <span className="material-icons">check_circle</span>
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="btn-icon"
                                                        onClick={() => viewTransferDetail(transfer.id)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <span className="material-icons">visibility</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="empty-state">
                                            {selectedTab === 'all' ? 'Chưa có lịch sử chuyển kho' : 
                                             selectedTab === 'pending' ? 'Không có yêu cầu chờ duyệt' : 
                                             'Không có yêu cầu đã duyệt'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && viewingTransfer && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết chuyển kho #{viewingTransfer.MaCK}</h2>
                            <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-info-grid">
                                <div className="info-item">
                                    <label>Từ chi nhánh:</label>
                                    <span>{viewingTransfer.TenCHNguon || `Chi nhánh ${viewingTransfer.MaCHNguon}`}</span>
                                </div>
                                <div className="info-item">
                                    <label>Đến chi nhánh:</label>
                                    <span>{viewingTransfer.TenCHDich || `Chi nhánh ${viewingTransfer.MaCHDich}`}</span>
                                </div>
                                <div className="info-item">
                                    <label>Ngày chuyển:</label>
                                    <span>{new Date(viewingTransfer.NgayChuyen).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="info-item">
                                    <label>Trạng thái:</label>
                                    <span className={`status-badge ${
                                        viewingTransfer.TrangThai === 'Da_nhan' ? 'status-approved' :
                                        viewingTransfer.TrangThai === 'Cho_duyet' ? 'status-pending' : 'status-exceeded'
                                    }`}>
                                        {viewingTransfer.TrangThai === 'Da_nhan' ? 'Đã nhận' :
                                         viewingTransfer.TrangThai === 'Cho_duyet' ? 'Chờ duyệt' :
                                         viewingTransfer.TrangThai === 'Dang_chuyen' ? 'Đang chuyển' : viewingTransfer.TrangThai}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <label>Người chuyển:</label>
                                    <span>{viewingTransfer.TenNguoiChuyen || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Người nhận:</label>
                                    <span>{viewingTransfer.TenNguoiNhan || 'Chưa có'}</span>
                                </div>
                                {viewingTransfer.GhiChu && (
                                    <div className="info-item full-width">
                                        <label>Ghi chú:</label>
                                        <span>{viewingTransfer.GhiChu}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="detail-products">
                                <h3>Danh sách sản phẩm</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Mã SP</th>
                                            <th>Tên sản phẩm</th>
                                            <th>Số lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewingTransfer.items && viewingTransfer.items.length > 0 ? (
                                            viewingTransfer.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.MaSP}</td>
                                                    <td>{item.TenSP || 'N/A'}</td>
                                                    <td>{item.SoLuong}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="empty-state">Không có sản phẩm</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {viewingTransfer.TrangThai === 'Cho_duyet' && hasPermissionById(FEATURES.STOCK, 'sua') && (
                                <button 
                                    className="btn-primary"
                                    onClick={() => {
                                        approveTransfer(viewingTransfer.MaCK);
                                        setShowDetailModal(false);
                                    }}
                                >
                                    <span className="material-icons">check_circle</span>
                                    Duyệt chuyển kho
                                </button>
                            )}
                            <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockTransfer;
