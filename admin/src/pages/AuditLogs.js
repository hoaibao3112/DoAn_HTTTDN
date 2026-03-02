import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/AuditLogs.css';

// Mock data
const AuditLogs = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Mock data
    const mockLogs = useMemo(() => [
        {
            id: 1,
            timestamp: '2024-05-20 14:32:01',
            user: { name: 'Nguyễn Văn A', avatar: null },
            action: 'CREATE',
            module: 'Kho hàng',
            ip: '192.168.1.15',
            details: {
                table: 'sanpham',
                recordId: 'PROD-4402',
                changes: {
                    old: null,
                    new: {
                        id: 'PROD-4402',
                        title: 'Đất Rừng Phương Nam',
                        price: 125000,
                        stock: 24,
                        category: 'Văn học VN',
                        status: 'active',
                        updated_at: '2024-04-12'
                    }
                }
            }
        },
        {
            id: 2,
            timestamp: '2024-05-20 14:30:45',
            user: { name: 'Lê Thị B', avatar: null },
            action: 'UPDATE',
            module: 'Sản phẩm',
            ip: '172.16.0.42',
            details: {
                table: 'sanpham',
                recordId: 'BK-0124',
                action: 'Cập nhật giá bán',
                changes: {
                    old: { price: 150000 },
                    new: { price: 145000 }
                }
            }
        },
        {
            id: 3,
            timestamp: '2024-05-20 14:28:12',
            user: { name: 'Trần Văn C', avatar: null },
            action: 'DELETE',
            module: 'Hóa đơn',
            ip: '192.168.1.55',
            details: {
                table: 'hoadon',
                recordId: 'INV-2024-05-001',
                changes: {
                    old: { id: 'INV-2024-05-001', amount: 250000, status: 'cancelled' },
                    new: null
                }
            }
        },
        {
            id: 4,
            timestamp: '2024-05-20 14:25:30',
            user: { name: 'Lê Thị B', avatar: null },
            action: 'UPDATE',
            module: 'Sản phẩm',
            ip: '172.16.0.42',
            details: {
                table: 'sanpham',
                recordId: 'BK-0892',
                changes: {
                    old: { stock: 50 },
                    new: { stock: 45 }
                }
            }
        },
        {
            id: 5,
            timestamp: '2024-05-20 14:15:00',
            user: { name: 'Admin System', avatar: null },
            action: 'CREATE',
            module: 'Nhân viên',
            ip: '127.0.0.1',
            details: {
                table: 'nhanvien',
                recordId: 'NV-2024-015',
                changes: {
                    old: null,
                    new: { id: 'NV-2024-015', name: 'Phạm Thị D', role: 'Cashier' }
                }
            }
        }
    ], []);

    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        user: 'all',
        action: 'all',
        module: 'all'
    });

    const [stats, setStats] = useState({
        total: 12842,
        created: 156,
        deleted: 12,
        warnings: 0
    });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/reports/audit-logs', {
                headers: { Authorization: `Bearer ${token}` },
                params: filters
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
                setLogs(transformedLogs.length > 0 ? transformedLogs : mockLogs);

                // Update stats if provided by backend
                if (response.data.pagination) {
                    setStats(prev => ({
                        ...prev,
                        total: response.data.pagination.total || prev.total
                    }));
                }
            } else {
                setLogs(mockLogs);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            setLogs(mockLogs);
        } finally {
            setLoading(false);
        }
    }, [filters, mockLogs]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const applyFilters = () => {
        fetchLogs();
    };

    const exportCSV = () => {
        alert('Xuất CSV - Chức năng đang phát triển');
    };

    const viewDetails = (log) => {
        setSelectedLog(log);
        setShowDetailModal(true);
    };

    const getActionBadge = (action) => {
        const badges = {
            CREATE: { text: 'CREATE', class: 'action-create' },
            UPDATE: { text: 'UPDATE', class: 'action-update' },
            DELETE: { text: 'DELETE', class: 'action-delete' }
        };
        return badges[action] || badges.CREATE;
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
                            <option value="all">Tất cả nhân viên</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Nhân viên</option>
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
                            <option value="product">Sản phẩm</option>
                            <option value="invoice">Hóa đơn</option>
                            <option value="warehouse">Kho hàng</option>
                            <option value="employee">Nhân viên</option>
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
                                        <td className="module-cell">{log.module}</td>
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
                    <div className="footer-info">Hiển thị 1-5 (trên 1,284 nhật ký)</div>
                    <div className="pagination">
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span>...</span>
                        <button className="page-btn">80</button>
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
                            <div className="log-id">Log ID: #{selectedLog.details?.table}-{selectedLog.id}</div>

                            <div className="info-section">
                                <h3>THÔNG TIN CHUNG</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span>Đối tượng:</span>
                                        <strong>Sách "{selectedLog.details?.recordId}"</strong>
                                    </div>
                                    <div className="info-item">
                                        <span>ID Sản phẩm:</span>
                                        <strong>{selectedLog.details?.recordId}</strong>
                                    </div>
                                    <div className="info-item">
                                        <span>Hành động:</span>
                                        <strong>{selectedLog.details?.action || selectedLog.action}</strong>
                                    </div>
                                </div>
                            </div>

                            {selectedLog.details?.changes?.old && (
                                <div className="data-section">
                                    <h3>🔴 DỮ LIỆU CŨ (OLD)</h3>
                                    <pre className="json-display old">
                                        {JSON.stringify(selectedLog.details.changes.old, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.details?.changes?.new && (
                                <div className="data-section">
                                    <h3>🟢 DỮ LIỆU MỚI (NEW)</h3>
                                    <pre className="json-display new">
                                        {JSON.stringify(selectedLog.details.changes.new, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
