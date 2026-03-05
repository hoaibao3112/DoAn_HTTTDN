import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/SubWarehouseManagement.css';

const API_BASE = 'http://localhost:5000/api/warehouse';

const SubWarehouseManagement = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [stockView, setStockView] = useState(null); // kho đang xem tồn kho chi tiết
    const [stockData, setStockData] = useState([]);
    const [stockLoading, setStockLoading] = useState(false);
    const [form, setForm] = useState({
        TenKho: '', Capacity: '', Priority: '', ViTri: '', GhiChu: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/sub-warehouses`, { headers });
            if (res.data.success) setWarehouses(res.data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getNextPriority = () => {
        const active = warehouses.filter(w => w.TinhTrang === 1);
        if (active.length === 0) return 1;
        return Math.max(...active.map(w => w.Priority)) + 1;
    };

    const getNextSuggestedName = () => {
        const usedNumbers = warehouses
            .map(w => {
                const match = w.TenKho.match(/^Kho (\d+)$/i);
                return match ? parseInt(match[1]) : null;
            })
            .filter(n => n !== null);
        if (usedNumbers.length === 0) return 'Kho 1';
        return `Kho ${Math.max(...usedNumbers) + 1}`;
    };

    const openCreate = () => {
        setEditItem(null);
        setForm({ TenKho: getNextSuggestedName(), Capacity: '', Priority: getNextPriority(), ViTri: '', GhiChu: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (wh) => {
        setEditItem(wh);
        setForm({
            TenKho: wh.TenKho, Capacity: wh.Capacity,
            Priority: wh.Priority, ViTri: wh.ViTri || '', GhiChu: wh.GhiChu || ''
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (editItem) {
                await axios.put(`${API_BASE}/sub-warehouses/${editItem.MaKho}`, form, { headers });
            } else {
                await axios.post(`${API_BASE}/sub-warehouses`, form, { headers });
            }
            setShowModal(false);
            fetchWarehouses();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi lưu kho con');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (wh) => {
        const newStatus = wh.TinhTrang === 1 ? 0 : 1;
        const action = newStatus === 0 ? 'vô hiệu hóa' : 'kích hoạt';
        if (!window.confirm(`Bạn có chắc muốn ${action} kho "${wh.TenKho}"?`)) return;
        try {
            await axios.put(`${API_BASE}/sub-warehouses/${wh.MaKho}`, { TinhTrang: newStatus }, { headers });
            fetchWarehouses();
        } catch (err) {
            alert(err.response?.data?.message || `Lỗi khi ${action} kho`);
        }
    };

    const handleViewStock = async (wh) => {
        setStockView(wh);
        setStockLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/stock-by-subwarehouse`, {
                headers, params: { MaKho: wh.MaKho, pageSize: 200 }
            });
            if (res.data.success) setStockData(res.data.data || []);
        } catch (e) {
            setStockData([]);
        } finally {
            setStockLoading(false);
        }
    };

    const getCapacityColor = (pct) => {
        if (!pct) return 'capacity-empty';
        if (pct >= 90) return 'capacity-full';
        if (pct >= 70) return 'capacity-high';
        if (pct >= 40) return 'capacity-medium';
        return 'capacity-low';
    };

    if (!hasPermissionById(FEATURES.STOCK, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
                <p>Bạn không có quyền xem quản lý kho con</p>
            </div>
        );
    }

    // Tổng quan
    const totalCapacity = warehouses.reduce((s, w) => s + (w.Capacity || 0), 0);
    const totalUsed = warehouses.reduce((s, w) => s + (w.SoLuongHienTai || 0), 0);
    const overallPct = totalCapacity > 0 ? Math.round(totalUsed * 100 / totalCapacity) : 0;

    return (
        <div className="subwh-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <span className="material-icons page-icon">warehouse</span>
                    <div>
                        <p className="breadcrumb">Trang chủ / Quản lý Kho Con</p>
                        <h1>Quản lý Kho Con</h1>
                    </div>
                </div>
                <div className="header-actions">
                    {hasPermissionById(FEATURES.STOCK, 'them') && (
                        <button className="btn-primary" onClick={openCreate}>
                            <span className="material-icons">add</span>
                            Thêm Kho Mới
                        </button>
                    )}
                    <button className="btn-secondary" onClick={fetchWarehouses}>
                        <span className="material-icons">refresh</span>
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="subwh-stats">
                <div className="stat-card blue">
                    <span className="material-icons">warehouse</span>
                    <div>
                        <div className="stat-num">{warehouses.length}</div>
                        <div className="stat-label">Kho đang quản lý</div>
                    </div>
                </div>
                <div className="stat-card green">
                    <span className="material-icons">inventory_2</span>
                    <div>
                        <div className="stat-num">{totalUsed.toLocaleString()}</div>
                        <div className="stat-label">Tổng hàng tồn (cuốn)</div>
                    </div>
                </div>
                <div className="stat-card orange">
                    <span className="material-icons">storage</span>
                    <div>
                        <div className="stat-num">{totalCapacity.toLocaleString()}</div>
                        <div className="stat-label">Tổng sức chứa</div>
                    </div>
                </div>
                <div className={`stat-card ${overallPct >= 85 ? 'red' : 'purple'}`}>
                    <span className="material-icons">donut_large</span>
                    <div>
                        <div className="stat-num">{overallPct}%</div>
                        <div className="stat-label">Tỉ lệ sử dụng</div>
                    </div>
                </div>
            </div>

            {/* Warehouse Cards Grid */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu kho...</p>
                </div>
            ) : warehouses.length === 0 ? (
                <div className="empty-state-box">
                    <span className="material-icons">inventory</span>
                    <h3>Chưa có kho nào</h3>
                    <p>Bấm "Thêm Kho Mới" để tạo kho đầu tiên.</p>
                </div>
            ) : (
                <div className="warehouse-grid">
                    {warehouses.map(wh => {
                        const pct = wh.PhanTramLapDay || 0;
                        const colorClass = getCapacityColor(pct);
                        return (
                            <div key={wh.MaKho} className={`wh-card ${wh.TinhTrang === 0 ? 'wh-disabled' : ''}`}>
                                <div className="wh-card-header">
                                    <div className="wh-icon-wrap">
                                        <span className="material-icons">warehouse</span>
                                    </div>
                                    <div className="wh-title-wrap">
                                        <h3 className="wh-name">{wh.TenKho}</h3>
                                    </div>
                                    <span className={`wh-status-badge ${wh.TinhTrang === 1 ? 'active' : 'inactive'}`}>
                                        {wh.TinhTrang === 1 ? 'Hoạt động' : 'Ngưng'}
                                    </span>
                                </div>

                                <div className="wh-meta">
                                    <div className="wh-meta-item">
                                        <span className="material-icons">low_priority</span>
                                        <span>Ưu tiên: <strong>#{wh.Priority}</strong></span>
                                    </div>
                                    {wh.ViTri && (
                                        <div className="wh-meta-item">
                                            <span className="material-icons">place</span>
                                            <span>{wh.ViTri}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Capacity Bar */}
                                <div className="capacity-section">
                                    <div className="capacity-header">
                                        <span>Sức chứa</span>
                                        <span className={`capacity-pct ${colorClass}`}>{pct}%</span>
                                    </div>
                                    <div className="capacity-bar-bg">
                                        <div
                                            className={`capacity-bar-fill ${colorClass}`}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="capacity-numbers">
                                        <span>{(wh.SoLuongHienTai || 0).toLocaleString()} cuốn</span>
                                        <span>/ {wh.Capacity.toLocaleString()} cuốn</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="wh-actions">
                                    <button className="btn-view" onClick={() => handleViewStock(wh)}>
                                        <span className="material-icons">visibility</span>
                                        Xem hàng
                                    </button>
                                    {hasPermissionById(FEATURES.STOCK, 'sua') && (
                                        <button className="btn-edit" onClick={() => openEdit(wh)}>
                                            <span className="material-icons">edit</span>
                                        </button>
                                    )}
                                    {hasPermissionById(FEATURES.STOCK, 'sua') && (
                                        <button
                                            className={`btn-toggle-status ${wh.TinhTrang === 1 ? 'btn-deactivate' : 'btn-activate'}`}
                                            onClick={() => handleToggleStatus(wh)}
                                            title={wh.TinhTrang === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                        >
                                            <span className="material-icons">
                                                {wh.TinhTrang === 1 ? 'toggle_on' : 'toggle_off'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal: Tạo / Sửa Kho */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? 'Chỉnh sửa Kho Con' : 'Thêm Kho Con Mới'}</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="modal-form">
                            {error && <div className="form-error"><span className="material-icons">error</span>{error}</div>}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tên kho <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="VD: Kho 7, Kho Lạnh..."
                                        value={form.TenKho}
                                        onChange={e => setForm({ ...form, TenKho: e.target.value })}
                                        required
                                    />
                                    <span className="field-hint">
                                        Đã dùng: {warehouses.map(w => w.TenKho).join(', ')}
                                    </span>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sức chứa (cuốn sách) <span className="required">*</span></label>
                                    <input
                                        type="number" min="1"
                                        placeholder="VD: 5000"
                                        value={form.Capacity}
                                        onChange={e => setForm({ ...form, Capacity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        Ưu tiên nhập <span className="required">*</span>
                                        <span className="field-hint">Số nhỏ = ưu tiên cao hơn</span>
                                    </label>
                                    <input
                                        type="number" min="1"
                                        placeholder="VD: 1 (Kho chính), 2 (Kho phụ)"
                                        value={form.Priority}
                                        onChange={e => setForm({ ...form, Priority: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Vị trí (tuỳ chọn)</label>
                                <input
                                    type="text"
                                    placeholder="VD: Tầng trệt, phía sau quầy"
                                    value={form.ViTri}
                                    onChange={e => setForm({ ...form, ViTri: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ghi chú (tuỳ chọn)</label>
                                <textarea
                                    rows="2"
                                    placeholder="Ghi chú thêm về kho..."
                                    value={form.GhiChu}
                                    onChange={e => setForm({ ...form, GhiChu: e.target.value })}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? (
                                        <><span className="spinner-sm"></span> Đang lưu...</>
                                    ) : (
                                        <><span className="material-icons">save</span> {editItem ? 'Cập nhật' : 'Tạo kho'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Drawer: Xem tồn kho chi tiết */}
            {stockView && (
                <div className="stock-drawer-overlay" onClick={() => setStockView(null)}>
                    <div className="stock-drawer" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <div>
                                <h2>Tồn kho: {stockView.TenKho}</h2>
                                <p className="drawer-sub">Capacity: {stockView.Capacity.toLocaleString()} cuốn | Đang dùng: {(stockView.SoLuongHienTai || 0).toLocaleString()} cuốn</p>
                            </div>
                            <button className="btn-close" onClick={() => setStockView(null)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        {stockLoading ? (
                            <div className="loading-state"><div className="spinner"></div><p>Đang tải...</p></div>
                        ) : stockData.length === 0 ? (
                            <div className="empty-state-box">
                                <span className="material-icons">inbox</span>
                                <p>Kho này chưa có hàng</p>
                            </div>
                        ) : (
                            <div className="stock-table-wrap">
                                <table className="stock-table">
                                    <thead>
                                        <tr>
                                            <th>ẢNH</th>
                                            <th>MÃ SP</th>
                                            <th>TÊN SÁCH</th>
                                            <th>SỐ LƯỢNG</th>
                                            <th>ĐƠN GIÁ</th>
                                            <th>% KHO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockData.map((item, i) => (
                                            <tr key={i}>
                                                <td className="img-cell">
                                                    <img
                                                        src={item.HinhAnh ? `http://localhost:5000${item.HinhAnh}` : 'https://via.placeholder.com/48x64?text=No+Img'}
                                                        alt={item.TenSP}
                                                        style={{ width: 48, height: 64, objectFit: 'cover', borderRadius: 4, border: '1px solid #e0e0e0' }}
                                                        onError={e => { e.target.src = 'https://via.placeholder.com/48x64?text=No+Img'; }}
                                                    />
                                                </td>
                                                <td className="code-cell">{item.MaSP}</td>
                                                <td className="name-cell">{item.TenSP}</td>
                                                <td><strong>{item.SoLuongTon.toLocaleString()}</strong> cuốn</td>
                                                <td>{(item.DonGia || 0).toLocaleString()}đ</td>
                                                <td>
                                                    <span className={`pct-badge ${getCapacityColor(item.PhanTramSuDung)}`}>
                                                        {item.PhanTramSuDung || 0}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubWarehouseManagement;
