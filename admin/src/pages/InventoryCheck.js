import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/InventoryCheck.css';

const InventoryCheck = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [checkSession, setCheckSession] = useState(null);
    const [branches, setBranches] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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

    const startInventoryCheck = async () => {
        if (!selectedBranch) {
            alert('Vui lòng chọn chi nhánh');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            // Fetch real stock for this branch
            const response = await axios.get(`http://localhost:5000/api/warehouse/stock?MaCH=${selectedBranch}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const stockData = response.data.data.map(item => ({
                    MaSP: item.MaSP,
                    TenSP: item.TenSP,
                    TonHeThong: item.SoLuongTon || 0,
                    ThucTe: item.SoLuongTon || 0, // Default to system qty
                    ChenhLech: 0,
                    Note: ''
                }));

                if (stockData.length === 0) {
                    alert('Chi nhánh này hiện chưa có sản phẩm nào trong kho!');
                    setLoading(false);
                    return;
                }

                setCheckSession({
                    MaCH: selectedBranch,
                    NgayKiemKe: new Date().toISOString().split('T')[0],
                    NguoiKiemKe: JSON.parse(localStorage.getItem('userInfo') || '{}').HoTen || 'Nhân viên quản lý'
                });
                setInventoryItems(stockData);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            alert('Không thể tải dữ liệu tồn thực tế của chi nhánh!');
        } finally {
            setLoading(false);
        }
    };

    const updateActualQty = (productId, value) => {
        setInventoryItems(items => items.map(item => {
            if (item.MaSP === productId) {
                const thucTe = parseInt(value) || 0;
                const chenhLech = thucTe - item.TonHeThong;
                return { ...item, ThucTe: thucTe, ChenhLech: chenhLech };
            }
            return item;
        }));
    };

    const updateNote = (productId, note) => {
        setInventoryItems(items => items.map(item =>
            item.MaSP === productId ? { ...item, Note: note } : item
        ));
    };

    const getDiscrepancyClass = (diff) => {
        if (diff === 0) return 'diff-zero';
        if (diff > 0) return 'diff-positive';
        return 'diff-negative';
    };

    const calculateStats = () => {
        const checked = inventoryItems.filter(i => i.ThucTe !== undefined && typeof i.ThucTe === 'number').length;
        const totalItems = inventoryItems.length;
        const percentage = totalItems > 0 ? ((checked / totalItems) * 100).toFixed(1) : 0;

        const totalDiff = inventoryItems.reduce((sum, item) => {
            if (item.ChenhLech < 0) return sum + Math.abs(item.ChenhLech);
            return sum;
        }, 0);

        const negativeItems = inventoryItems.filter(i => i.ChenhLech < 0).length;

        return { checked, totalItems, percentage, totalDiff, negativeItems };
    };

    const handleCompleteCheck = async () => {
        const unchecked = inventoryItems.filter(i => i.ThucTe === undefined || typeof i.ThucTe !== 'number');

        if (unchecked.length > 0) {
            if (!window.confirm(`Còn ${unchecked.length} sản phẩm chưa kiểm. Bạn có chắc muốn hoàn tất?`)) {
                return;
            }
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const checkData = {
                MaCH: checkSession.MaCH,
                items: inventoryItems.map(item => ({
                    MaSP: item.MaSP,
                    SoLuongHeThong: item.TonHeThong,
                    SoLuongThucTe: item.ThucTe || 0,
                    ChenhLech: item.ChenhLech || 0,
                    GhiChu: item.Note || ''
                }))
            };

            const response = await axios.post(
                'http://localhost:5000/api/warehouse/inventory-check',
                checkData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Hoàn tất kiểm kê thành công!');
                // Reset
                setCheckSession(null);
                setInventoryItems([]);
                setSelectedBranch('');
            }
        } catch (error) {
            console.error('Error completing inventory check:', error);
            alert('Lỗi hoàn tất kiểm kê: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        alert('Xuất PDF - Chức năng đang phát triển');
    };

    const stats = calculateStats();

    if (!hasPermissionById(FEATURES.INVENTORY_CHECK, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
            </div>
        );
    }

    return (
        <div className="inventory-check-page">
            {!checkSession ? (
                // Start Screen
                <div className="start-screen">
                    <div className="start-card">
                        <div className="start-icon">
                            <span className="material-icons">inventory</span>
                        </div>
                        <h1>Kiểm Kê Kho (Inventory Check)</h1>
                        <p>Chi nhánh: <strong>Central Bookstore</strong></p>
                        <p>Ngày: <strong>{new Date().toLocaleDateString('vi-VN')}</strong></p>
                        <p>Người phụ trách: <strong>{JSON.parse(localStorage.getItem('userInfo') || '{}').HoTen || 'Nguyễn Văn A'}</strong></p>

                        <div className="select-branch">
                            <label>Chọn chi nhánh cần kiểm kê</label>
                            <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                                <option value="">-- Chọn chi nhánh --</option>
                                {branches.map(b => (
                                    <option key={b.MaCH} value={b.MaCH}>{b.TenCH}</option>
                                ))}
                            </select>
                        </div>

                        <button className="btn-start" onClick={startInventoryCheck}>
                            <span className="material-icons">play_arrow</span>
                            Bắt Đầu Kiểm Kê
                        </button>
                    </div>
                </div>
            ) : (
                // Check Screen
                <div className="check-screen">
                    <div className="check-header">
                        <div className="breadcrumb">
                            <span>Trang chủ</span>
                            <span className="material-icons">chevron_right</span>
                            <span>Quản lý kho</span>
                            <span className="material-icons">chevron_right</span>
                            <span>Phiên kiểm kê #{new Date().getTime()}</span>
                        </div>

                        <h1>Kiểm Kê Kho (Inventory Check)</h1>

                        <div className="check-info">
                            <span className="material-icons">business</span>
                            <span>Chi nhánh: Central Bookstore</span>
                            <span className="separator">|</span>
                            <span className="material-icons">event</span>
                            <span>Ngày: {new Date().toLocaleDateString('vi-VN')}</span>
                            <span className="separator">|</span>
                            <span className="material-icons">person</span>
                            <span>Người phụ trách: {checkSession.NguoiKiemKe}</span>
                        </div>

                        <div className="check-actions">
                            <button className="btn-pdf" onClick={exportPDF}>
                                <span className="material-icons">picture_as_pdf</span>
                                Xuất PDF
                            </button>
                            <button className="btn-complete" onClick={handleCompleteCheck} disabled={loading}>
                                <span className="material-icons">check_circle</span>
                                {loading ? 'Đang xử lý...' : 'Hoàn tất phiên kiểm kê'}
                            </button>
                        </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="progress-section">
                        <div className="progress-card">
                            <div className="progress-header">
                                <span>Sản phẩm đã kiểm</span>
                                <button className="btn-action">Bước 1: Khởi tạo</button>
                            </div>
                            <div className="progress-stats">
                                <div className="big-stat">
                                    {stats.checked} / {stats.totalItems} items
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${stats.percentage}%` }}></div>
                                </div>
                                <div className="percentage">{stats.percentage}%</div>
                            </div>
                        </div>

                        <div className="loss-card">
                            <div className="loss-header">
                                <span>Tổng giá trị chênh lệch thực tế</span>
                            </div>
                            <div className="loss-value">-{stats.totalDiff.toLocaleString()}.000 VND</div>
                            <div className="loss-note">* Dựa trên giá mua tính giản mật</div>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="inventory-table-section">
                        <div className="table-header">
                            <div className="section-title">
                                <span className="material-icons">assignment</span>
                                <span>Tiến độ kiểm kê <strong>({stats.checked}/{stats.totalItems}) 37.5%</strong></span>
                            </div>
                            <div className="table-info">
                                <span className="material-icons">error</span>
                                <span>Đã tự động nhập giá lúc nhập kho. Lúc 14:35</span>
                            </div>
                            <div className="status-summary">
                                <span>Trạng thái lưu</span>
                                <span className="material-icons check-icon">check_circle</span>
                                <span>Đã tự động lưu</span>
                            </div>
                        </div>

                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>MÃ SP</th>
                                    <th>TÊN SÁCH / SẢN PHẨM</th>
                                    <th>TỒN HỆ THỐNG</th>
                                    <th>THỰC TẾ</th>
                                    <th>CHÊNH LỆCH</th>
                                    <th>LÝ DO & GHI CHÚ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryItems.map(item => (
                                    <tr key={item.MaSP} className={item.ChenhLech !== 0 ? 'has-discrepancy' : ''}>
                                        <td className="code-cell">{item.MaSP}</td>
                                        <td className="product-name">{item.TenSP}</td>
                                        <td className="system-qty">{item.TonHeThong}</td>
                                        <td className="actual-qty">
                                            <input
                                                type="number"
                                                value={item.ThucTe === undefined ? '' : item.ThucTe}
                                                onChange={(e) => updateActualQty(item.MaSP, e.target.value)}
                                                placeholder="0"
                                                className="qty-input"
                                            />
                                        </td>
                                        <td className={`diff-cell ${getDiscrepancyClass(item.ChenhLech)}`}>
                                            {item.ChenhLech > 0 ? '+' : ''}{item.ChenhLech || 0}
                                        </td>
                                        <td className="note-cell">
                                            <div className="note-wrapper">
                                                <input
                                                    type="text"
                                                    value={item.Note}
                                                    onChange={(e) => updateNote(item.MaSP, e.target.value)}
                                                    placeholder={item.ChenhLech !== 0 ? 'Nhập lý do chênh lệch...' : 'Không cần điều'}
                                                    className="note-input"
                                                />
                                                {item.Note && (
                                                    <button className="btn-clear-note" onClick={() => updateNote(item.MaSP, '')}>
                                                        <span className="material-icons">close</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="check-footer">
                        <div className="footer-stats">
                            <div className="stat-item">
                                <span>TIẾN ĐỘ KIỂM KÊ</span>
                                <strong>{stats.checked} / {stats.totalItems} ({stats.percentage}%)</strong>
                            </div>
                            <div className="stat-item">
                                <span>TỔNG CHÊNH LỆCH THỰC TẾ</span>
                                <strong className="negative">{stats.negativeItems} Sản phẩm</strong>
                            </div>
                            <div className="stat-item">
                                <span>TRẠNG THÁI LƯU</span>
                                <div className="status-indicator">
                                    <span className="material-icons">timer</span>
                                    <span>Đã tự động lưu lúc: nhập lúc 14:35</span>
                                </div>
                            </div>
                        </div>

                        <div className="footer-actions">
                            <button className="btn-save">
                                Tạm dừng & Lưu
                            </button>
                            <button className="btn-finalize" onClick={handleCompleteCheck}>
                                <span className="material-icons">check_circle</span>
                                HOÀN TẤT KIỂM KÊ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryCheck;
