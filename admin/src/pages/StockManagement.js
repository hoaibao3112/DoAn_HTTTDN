import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES, PERMISSIONS } from '../constants/permissions';
import '../styles/StockManagement.css';

const StockManagement = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('all');
    const [branches, setBranches] = useState([]);
    const [stats, setStats] = useState({
        totalItems: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchStockData();
        fetchBranches();
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

    const fetchStockData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            // Fetch stock data
            const stockResponse = await axios.get('http://localhost:5000/api/warehouse/stock', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch alerts
            const alertsResponse = await axios.get('http://localhost:5000/api/warehouse/stock/alerts', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (stockResponse.data.success) {
                const stock = stockResponse.data.data || [];
                setStockData(stock);

                // Calculate statistics
                const total = stock.length;
                const low = stock.filter(item => item.SoLuong > 0 && item.SoLuong <= 10).length;
                const out = stock.filter(item => item.SoLuong === 0).length;
                const value = stock.reduce((sum, item) => sum + (item.SoLuong * item.DonGia), 0);

                setStats({
                    totalItems: total,
                    lowStock: low,
                    outOfStock: out,
                    totalValue: value
                });
            }
        } catch (error) {
            console.error('Error fetching stock:', error);
            alert('Lỗi khi tải dữ liệu tồn kho');
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { text: 'Hết hàng', class: 'out-of-stock', icon: 'block' };
        if (quantity <= 10) return { text: 'Sắp hết', class: 'low-stock', icon: 'warning' };
        if (quantity <= 50) return { text: 'Còn hàng', class: 'in-stock', icon: 'check_circle' };
        return { text: 'Tồn kho lưu', class: 'high-stock', icon: 'inventory' };
    };

    const handleExportExcel = () => {
        alert('Xuất Excel - Chức năng đang phát triển');
    };

    // Filter and search
    const filteredData = stockData.filter(item => {
        const matchSearch = item.TenSP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.MaSP?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchBranch = filterBranch === 'all' || item.MaCH == filterBranch;
        return matchSearch && matchBranch;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (!hasPermissionById(FEATURES.STOCK, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
                <p>Bạn không có quyền xem quản lý tồn kho</p>
            </div>
        );
    }

    return (
        <div className="stock-management">
            <div className="page-header">
                <div className="header-left">
                    <span className="material-icons page-icon">inventory_2</span>
                    <div>
                        <p className="breadcrumb">Trang chủ / Quản lý Tồn Kho</p>
                        <h1>Quản lý Tồn Kho</h1>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-export" onClick={handleExportExcel}>
                        <span className="material-icons">download</span>
                        Xuất Excel
                    </button>
                    <button className="btn-primary" onClick={fetchStockData}>
                        <span className="material-icons">refresh</span>
                        Nhập hàng
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon">
                        <span className="material-icons">inventory_2</span>
                    </div>
                    <div className="stat-content">
                        <h3>Tổng mặt hàng</h3>
                        <div className="stat-number">{stats.totalItems.toLocaleString()}</div>
                        <div className="stat-trend positive">
                            <span className="material-icons">trending_up</span>
                            12.4% so với tháng trước
                        </div>
                    </div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-icon">
                        <span className="material-icons">warning</span>
                    </div>
                    <div className="stat-content">
                        <h3>Sắp hết hàng</h3>
                        <div className="stat-number">{stats.lowStock}</div>
                        <div className="stat-trend">Cần bổ sung sớm</div>
                    </div>
                </div>

                <div className="stat-card red">
                    <div className="stat-icon">
                        <span className="material-icons">block</span>
                    </div>
                    <div className="stat-content">
                        <h3>Hết hàng</h3>
                        <div className="stat-number">{stats.outOfStock}</div>
                        <div className="stat-trend">Yêu cầu đặt hàng ngay</div>
                    </div>
                </div>

                <div className="stat-card green">
                    <div className="stat-icon">
                        <span className="material-icons">insights</span>
                    </div>
                    <div className="stat-content">
                        <h3>Tồn kho lưu</h3>
                        <div className="stat-number">45</div>
                        <div className="stat-trend">Trên 90 ngày</div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="table-controls">
                <div className="search-box">
                    <span className="material-icons">search</span>
                    <input
                        type="text"
                        placeholder="Tìm theo mã hoặc tên sách..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        className="filter-select"
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                    >
                        <option value="all">Tất cả chi nhánh</option>
                        {branches.map(branch => (
                            <option key={branch.MaCH} value={branch.MaCH}>
                                {branch.TenCH}
                            </option>
                        ))}
                    </select>

                    <button className="btn-icon" onClick={() => setFilterBranch('all')}>
                        <span className="material-icons">filter_list</span>
                    </button>

                    <button className="btn-icon" onClick={fetchStockData}>
                        <span className="material-icons">refresh</span>
                    </button>
                </div>
            </div>

            {/* Stock Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>MÃ SP</th>
                                    <th>TÊN SÁCH</th>
                                    <th>CHI NHÁNH</th>
                                    <th>SỐ LƯỢNG</th>
                                    <th>GIÁ TRỊ TỒN</th>
                                    <th>TRẠNG THÁI</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((item, index) => {
                                        const status = getStockStatus(item.SoLuong);
                                        return (
                                            <tr key={index}>
                                                <td className="code-cell">{item.MaSP}</td>
                                                <td className="name-cell">{item.TenSP}</td>
                                                <td>{item.TenCH || `Quận ${item.MaCH}`}</td>
                                                <td className="quantity-cell">
                                                    <span className={`quantity ${status.class}`}>
                                                        {item.SoLuong || 0} cuốn
                                                    </span>
                                                </td>
                                                <td className="price-cell">
                                                    {((item.SoLuong || 0) * (item.DonGia || 0)).toLocaleString()} đ
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${status.class}`}>
                                                        <span className="material-icons">{status.icon}</span>
                                                        {status.text}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button className="btn-more">
                                                        <span className="material-icons">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="empty-state">
                                            <span className="material-icons">inbox</span>
                                            <p>Không có dữ liệu</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <div className="pagination-info">
                            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} (tổng số {filteredData.length})
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="btn-page"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <span className="material-icons">chevron_left</span>
                            </button>

                            {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                                let pageNum = idx + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 2 + idx;
                                }
                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        className={`btn-page ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => paginate(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                className="btn-page"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <span className="material-icons">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StockManagement;
