import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/AuditLogs.css';

// Helper to parse data that might be double-stringified or a JSON string
const parseLogsData = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
        const parsed = JSON.parse(data);
        // If the parsed result is still a string (double-stringified), try parsing again
        if (typeof parsed === 'string') return parseLogsData(parsed);
        return parsed;
    } catch (e) {
        return data; // Return as is if not valid JSON
    }
};

const renderObjectData = (data) => {
    const parsed = parseLogsData(data);
    if (!parsed) return <div className="no-data">Không có dữ liệu</div>;
    if (typeof parsed !== 'object') return <div className="raw-data">{parsed}</div>;

    return (
        <div className="data-card-grid">
            {Object.entries(parsed).map(([key, value]) => (
                <div key={key} className="data-card-item">
                    <span className="data-card-key">{key}</span>
                    <span className="data-card-value">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

const renderComparison = (oldData, newData) => {
    const oldParsed = parseLogsData(oldData) || {};
    const newParsed = parseLogsData(newData) || {};
    
    // Get all unique keys from both objects
    const allKeys = Array.from(new Set([...Object.keys(oldParsed), ...Object.keys(newParsed)]));

    return (
        <div className="comparison-table-wrapper">
            <table className="comparison-table">
                <thead>
                    <tr>
                        <th>Trường dữ liệu</th>
                        <th>Giá trị cũ</th>
                        <th>Giá trị mới</th>
                    </tr>
                </thead>
                <tbody>
                    {allKeys.map(key => {
                        const isChanged = JSON.stringify(oldParsed[key]) !== JSON.stringify(newParsed[key]);
                        return (
                            <tr key={key} className={isChanged ? 'diff-row changed' : 'diff-row'}>
                                <td className="diff-key">{key}</td>
                                <td className="diff-value old">
                                    {oldParsed[key] !== undefined ? String(oldParsed[key]) : <span className="null-val">-</span>}
                                </td>
                                <td className="diff-value new">
                                    {newParsed[key] !== undefined ? String(newParsed[key]) : <span className="null-val">-</span>}
                                    {isChanged && <span className="change-icon material-icons">trending_flat</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// Main component
const AuditLogs = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Mapping database table names to friendly names
    const MODULE_MAP = useMemo(() => ({
        'sanpham': { name: 'Sách', idLabel: 'Mã sách', icon: 'auto_stories' },
        'hoadon': { name: 'Hóa đơn', idLabel: 'Mã hóa đơn', icon: 'receipt' },
        'taikhoan': { name: 'Tài khoản', idLabel: 'ID Tài khoản', icon: 'account_circle' },
        'nhanvien': { name: 'Nhân viên', idLabel: 'Mã nhân viên', icon: 'badge' },
        'khachhang': { name: 'Khách hàng', idLabel: 'Mã khách hàng', icon: 'person' },
        'nhacungcap': { name: 'Nhà cung cấp', idLabel: 'Mã nhà cung cấp', icon: 'local_shipping' },
        'phieunhap': { name: 'Phiếu nhập', idLabel: 'Mã phiếu nhập', icon: 'input' },
        'loai_nqi': { name: 'Nhóm quyền', idLabel: 'Mã quyền', icon: 'security' },
        'khuyenmai': { name: 'Khuyến mãi', idLabel: 'Mã KM', icon: 'sell' },
        'cham_cong': { name: 'Chấm công', idLabel: 'ID Chấm công', icon: 'event_available' },
        'khen_thuong_ky_luat': { name: 'Khen thưởng/Kỷ luật', idLabel: 'ID Bản ghi', icon: 'gavel' },
        'phieu_kiem_ke': { name: 'Kiểm kê', idLabel: 'Mã phiếu', icon: 'inventory' },
        'website_settings': { name: 'Cài đặt hệ thống', idLabel: 'ID Cấu hình', icon: 'settings' }
    }), []);

    const [metadata, setMetadata] = useState({ users: [], modules: [] });

    // Mock data - REMOVED for DB only data
    // const mockLogs = useMemo(() => [ ... ], []);

    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        user: 'all',
        action: 'all',
        module: 'all'
    });

    const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

    const [stats, setStats] = useState({
        total: 0,
        created: 0,
        deleted: 0,
        warnings: 0
    });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const params = { ...filters, page: pagination.page, limit: pagination.pageSize };
            const response = await axios.get('http://localhost:5000/api/reports/audit-logs', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (response.data.success && response.data.data) {
                // Transform backend data to frontend format
                const transformedLogs = response.data.data.map(item => ({
                    id: item.MaNK || item.id,
                    timestamp: item.ThoiGian ? new Date(item.ThoiGian).toLocaleString('vi-VN') : item.timestamp,
                    user: {
                        name: item.TenTK || item.user?.name || 'Hệ thống',
                        avatar: item.user?.avatar || null
                    },
                    action: item.HanhDong || item.action,
                    module: item.BangDuLieu || item.module,
                    ip: item.DiaChi_IP || item.ip,
                    details: {
                        table: item.BangDuLieu || item.details?.table,
                        recordId: item.MaBanGhi || item.details?.recordId,
                        action: item.HanhDongGoc || item.HanhDong || item.details?.action,
                        note: item.GhiChu || null,
                        changes: {
                            old: item.DuLieuCu || item.details?.changes?.old || null,
                            new: item.DuLieuMoi || item.details?.changes?.new || null,
                        }
                    }
                }));
                setLogs(transformedLogs);

                // Update stats if provided by backend
                if (response.data.pagination) {
                    setStats(prev => ({
                        ...prev,
                        total: response.data.pagination.total || prev.total
                    }));
                    setPagination(prev => ({ ...prev, total: response.data.pagination.total || prev.total }));
                }
            } else {
                setLogs([]);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.pageSize]);

    const fetchMetadata = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/reports/audit-logs/metadata', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMetadata(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    }, []);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs, filters, pagination.page, pagination.pageSize]);

    const applyFilters = () => {
        // Reset to first page when applying filters
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const exportCSV = () => {
        alert('Xuất CSV - Chức năng đang phát triển');
    };

    const viewDetails = (log) => {
        setSelectedLog(log);
        setShowDetailModal(true);
    };

    const getActionBadge = (action) => {
        const normalizedAction = (action || '').toUpperCase();
        const badges = {
            'CREATE': { text: 'THEM', class: 'action-create' },
            'THEM': { text: 'THEM', class: 'action-create' },
            'UPDATE': { text: 'SUA', class: 'action-update' },
            'SUA': { text: 'SUA', class: 'action-update' },
            'DELETE': { text: 'XOA', class: 'action-delete' },
            'XOA': { text: 'XOA', class: 'action-delete' },
            'KIEMKE': { text: 'KIEM KE', class: 'action-update' }
        };
        return badges[normalizedAction] || { text: normalizedAction, class: 'action-update' };
    };

    if (!hasPermissionById(FEATURES.AUDIT_LOGS, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
            </div>
        );
    }

    return (
        <div className="audit-logs-page">
            <div className="page-header">
                <div>
                    <p className="breadcrumb">Cài đặt hệ thống / Nhật ký hoạt động</p>
                    <h1>Nhật Ký Hoạt Động (Audit Logs)</h1>
                </div>
                <div className="header-actions">
                    <button className="btn-csv" onClick={exportCSV}>
                        <span className="material-icons">file_download</span>
                        Xuất file CSV
                    </button>
                    <button className="btn-refresh" onClick={fetchLogs}>
                        <span className="material-icons">refresh</span>
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-grid">
                    <div className="filter-group">
                        <label>Khoảng thời gian</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="date-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Người dùng</label>
                        <select value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })}>
                            <option value="all">Tất cả người dùng</option>
                            {metadata.users.map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Loại hành động</label>
                        <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
                            <option value="all">Tất cả hành động</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Phần mục</label>
                        <select value={filters.module} onChange={(e) => setFilters({ ...filters, module: e.target.value })}>
                            <option value="all">Tất cả phần mục</option>
                            {metadata.modules.map(m => (
                                <option key={m} value={m}>
                                    {MODULE_MAP[m]?.name || m}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button className="btn-apply-filter" onClick={applyFilters}>
                    <span className="material-icons">filter_list</span>
                    Áp dụng bộ lọc
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card blue">
                    <span className="material-icons">list_alt</span>
                    <div>
                        <div className="stat-value">{stats.total.toLocaleString()}</div>
                        <div className="stat-label">TỔNG SỐ LOG</div>
                    </div>
                </div>

                <div className="stat-card green">
                    <span className="material-icons">add_circle</span>
                    <div>
                        <div className="stat-value">{stats.created}</div>
                        <div className="stat-label">THÊM MỚI (24H)</div>
                    </div>
                </div>

                <div className="stat-card red">
                    <span className="material-icons">delete</span>
                    <div>
                        <div className="stat-value">{stats.deleted}</div>
                        <div className="stat-label">XÓA (24H)</div>
                    </div>
                </div>

                <div className="stat-card purple">
                    <span className="material-icons">shield</span>
                    <div>
                        <div className="stat-value">{stats.warnings}</div>
                        <div className="stat-label">CẢNH BÁO BẢO MẬT</div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="logs-table-section">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th>THỜI GIAN</th>
                            <th>NGƯỜI THỰC HIỆN</th>
                            <th>HÀNH ĐỘNG</th>
                            <th>PHẦN MỤC</th>
                            <th>ĐỊA CHỈ IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="loading-cell">Đang tải...</td></tr>
                        ) : logs.length > 0 ? (
                            logs.map(log => {
                                const actionBadge = getActionBadge(log.action);
                                return (
                                    <tr key={log.id} onClick={() => viewDetails(log)} className="clickable-row">
                                        <td className="time-cell">{log.timestamp}</td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {log.user?.avatar ? (
                                                        <img src={log.user.avatar} alt={log.user.name} />
                                                    ) : (
                                                        <span>{log.user?.name?.charAt(0) || 'U'}</span>
                                                    )}
                                                </div>
                                                <span>{log.user?.name || 'Unknown User'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`action-badge ${actionBadge.class}`}>
                                                {actionBadge.text}
                                            </span>
                                        </td>
                                        <td className="module-cell">
                                            {MODULE_MAP[log.module]?.name || log.module}
                                        </td>
                                        <td className="ip-cell">{log.ip}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="5" className="empty-cell">Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="table-footer">
                    <div className="footer-info">
                        Hiển thị {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} (trên {pagination.total.toLocaleString()} nhật ký)
                    </div>
                    <div className="pagination">
                        <button
                            className="page-btn"
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page <= 1}
                        >Prev</button>
                        <button className="page-btn active">{pagination.page}</button>
                        <button
                            className="page-btn"
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(Math.ceil((prev.total || 0) / prev.pageSize) || 1, prev.page + 1) }))}
                            disabled={pagination.page >= Math.ceil((pagination.total || 0) / pagination.pageSize)}
                        >Next</button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedLog && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết thay đổi</h2>
                            <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="log-id">
                                <span>Log ID: #{selectedLog.details?.table}-{selectedLog.id}</span>
                                <span className="log-ip">IP: {selectedLog.ip}</span>
                            </div>

                            <div className="info-section">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="material-icons">category</span>
                                        <div>
                                            <p>Đối tượng</p>
                                            <strong>{MODULE_MAP[selectedLog.module]?.name || selectedLog.module}</strong>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="material-icons">fingerprint</span>
                                        <div>
                                            <p>{MODULE_MAP[selectedLog.module]?.idLabel || 'Mã bản ghi'}</p>
                                            <strong>{selectedLog.details?.recordId}</strong>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="material-icons">bolt</span>
                                        <div>
                                            <p>Hành động</p>
                                            <strong className={`text-${getActionBadge(selectedLog.details?.action || selectedLog.action).class}`}>
                                                {getActionBadge(selectedLog.details?.action || selectedLog.action).text}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="changes-container">
                                {selectedLog.action.toUpperCase() === 'SUA' || selectedLog.action.toUpperCase() === 'UPDATE' ? (
                                    <div className="data-section full-width">
                                        <div className="section-header">
                                            <span className="material-icons">compare</span>
                                            <h3>SO SÁNH THAY ĐỔI</h3>
                                        </div>
                                        {renderComparison(selectedLog.details.changes.old, selectedLog.details.changes.new)}
                                    </div>
                                ) : (
                                    <>
                                        {selectedLog.details?.changes?.old && (
                                            <div className="data-section">
                                                <div className="section-header red">
                                                    <span className="material-icons">history</span>
                                                    <h3>DỮ LIỆU CŨ (OLD)</h3>
                                                </div>
                                                {renderObjectData(selectedLog.details.changes.old)}
                                            </div>
                                        )}

                                        {selectedLog.details?.changes?.new && (
                                            <div className="data-section">
                                                <div className="section-header green">
                                                    <span className="material-icons">add_chart</span>
                                                    <h3>DỮ LIỆU MỚI (NEW)</h3>
                                                </div>
                                                {renderObjectData(selectedLog.details.changes.new)}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
