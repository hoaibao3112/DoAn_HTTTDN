import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/InventoryCheck.css';

const API = 'http://localhost:5000/api/warehouse';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('authToken')}` });

const StatusBadge = ({ status }) => {
    const map = { Dang_kiem: ['badge-pending', 'Đang kiểm'], Hoan_thanh: ['badge-done', 'Hoàn thành'] };
    const [cls, text] = map[status] || ['badge-pending', status];
    return <span className={`ic-badge ${cls}`}>{text}</span>;
};

// ────────────────────────────────────────────────────────────────────────────────
const InventoryCheck = () => {
    const { hasPermissionById } = useContext(PermissionContext);

    // screens: 'list' | 'create' | 'detail'
    const [view, setView] = useState('list');

    // LIST
    const [checks, setChecks] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [filterStore, setFilterStore] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [listLoading, setListLoading] = useState(false);

    // SHARED
    const [stores, setStores] = useState([]);

    // CREATE
    const [createStore, setCreateStore] = useState('');
    const [createDate, setCreateDate] = useState(new Date().toISOString().split('T')[0]);
    const [createNote, setCreateNote] = useState('');
    const [createItems, setCreateItems] = useState([]); // { MaSP, TenSP, TonHeThong, SoLuongThucTe, LyDo }
    const [createLoading, setCreateLoading] = useState(false);
    const [stockLoading, setStockLoading] = useState(false);

    // DETAIL
    const [detailData, setDetailData] = useState(null); // header + items
    const [detailLoading, setDetailLoading] = useState(false);
    const [completeModal, setCompleteModal] = useState(false);
    const [apDung, setApDung] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [detailSaving, setDetailSaving] = useState(false);

    // ── fetch ─────────────────────────────────────────────────
    const fetchStores = useCallback(async () => {
        try {
            const r = await axios.get(`${API}/stores`, { headers: getHeaders() });
            if (r.data.success) setStores(r.data.data);
        } catch (e) { console.error(e); }
    }, []);

    const fetchChecks = useCallback(async (page = 1) => {
        setListLoading(true);
        try {
            const p = new URLSearchParams({ page, pageSize: 20 });
            if (filterStore) p.append('MaCH', filterStore);
            if (filterStatus) p.append('TrangThai', filterStatus);
            const r = await axios.get(`${API}/inventory-checks?${p}`, { headers: getHeaders() });
            if (r.data.success) {
                setChecks(r.data.data || []);
                setPagination(r.data.pagination || { page: 1, totalPages: 1 });
            }
        } catch (e) { console.error(e); }
        finally { setListLoading(false); }
    }, [filterStore, filterStatus]);

    useEffect(() => { fetchStores(); }, [fetchStores]);
    useEffect(() => { fetchChecks(1); }, [fetchChecks]);

    // ── create: load stock khi chọn kho ──────────────────────
    const loadStockForStore = async (MaCH) => {
        setCreateStore(MaCH);
        setCreateItems([]);
        if (!MaCH) return;
        setStockLoading(true);
        try {
            const r = await axios.get(`${API}/stock?MaCH=${MaCH}&pageSize=500`, { headers: getHeaders() });
            if (r.data.success) {
                const items = (r.data.data || []).map(s => ({
                    MaSP: s.MaSP,
                    TenSP: s.TenSP,
                    TonHeThong: s.SoLuongTon ?? 0,
                    SoLuongThucTe: s.SoLuongTon ?? 0, // default = hệ thống
                    LyDo: '',
                }));
                setCreateItems(items);
                if (items.length === 0) alert('Kho này chưa có sản phẩm nào!');
            }
        } catch (e) { console.error(e); alert('Lỗi tải tồn kho'); }
        finally { setStockLoading(false); }
    };

    const updateThucTe = (MaSP, val) => {
        const num = Math.max(0, parseInt(val) || 0);
        setCreateItems(items => items.map(i =>
            i.MaSP === MaSP ? { ...i, SoLuongThucTe: num } : i
        ));
    };

    const updateLyDo = (MaSP, val) => {
        setCreateItems(items => items.map(i =>
            i.MaSP === MaSP ? { ...i, LyDo: val } : i
        ));
    };

    const handleCreateSubmit = async () => {
        if (!createStore) { alert('Vui lòng chọn kho'); return; }
        if (!createItems.length) { alert('Không có sản phẩm để kiểm kê'); return; }

        setCreateLoading(true);
        try {
            const r = await axios.post(`${API}/inventory-checks`, {
                MaCH: createStore,
                NgayKiemKe: createDate,
                GhiChu: createNote || null,
                items: createItems.map(i => ({
                    MaSP: i.MaSP,
                    SoLuongThucTe: i.SoLuongThucTe,
                    LyDo: i.LyDo || null,
                }))
            }, { headers: getHeaders() });

            if (r.data.success) {
                alert(`Tạo phiếu kiểm kê thành công! Mã: ${r.data.MaKiemKe}`);
                setView('list');
                setCreateStore('');
                setCreateItems([]);
                setCreateNote('');
                fetchChecks(1);
            }
        } catch (e) { alert('Lỗi: ' + (e.response?.data?.message || e.message)); }
        finally { setCreateLoading(false); }
    };

    // ── detail ────────────────────────────────────────────────
    const openDetail = async (MaKiemKe) => {
        setDetailLoading(true);
        setView('detail');
        try {
            const r = await axios.get(`${API}/inventory-checks/${MaKiemKe}`, { headers: getHeaders() });
            if (r.data.success) setDetailData(r.data.data);
        } catch (e) { alert('Lỗi tải chi tiết'); setView('list'); }
        finally { setDetailLoading(false); }
    };

    const doComplete = async () => {
        if (!detailData) return;
        setCompleting(true);
        try {
            const r = await axios.put(
                `${API}/inventory-checks/${detailData.MaKiemKe}/complete`,
                { apDungChenhLech: apDung },
                { headers: getHeaders() }
            );
            if (r.data.success) {
                alert(r.data.message);
                setCompleteModal(false);
                // Refresh detail
                const r2 = await axios.get(`${API}/inventory-checks/${detailData.MaKiemKe}`, { headers: getHeaders() });
                if (r2.data.success) setDetailData(r2.data.data);
                fetchChecks(1);
            }
        } catch (e) { alert('Lỗi: ' + (e.response?.data?.message || e.message)); }
        finally { setCompleting(false); }
    };

    const updateDetailThucTe = (MaSP, val) => {
        const num = Math.max(0, parseInt(val) || 0);
        setDetailData(d => ({
            ...d,
            items: (d.items || []).map(i => i.MaSP === MaSP ? { ...i, SoLuongThucTe: num, ChenhLech: num - (i.SoLuongHeThong ?? i.TonHeThong ?? 0) } : i)
        }));
    };

    const updateDetailLyDo = (MaSP, val) => {
        setDetailData(d => ({
            ...d,
            items: (d.items || []).map(i => i.MaSP === MaSP ? { ...i, LyDo: val } : i)
        }));
    };

    const saveDetailChanges = async () => {
        if (!detailData) return;
        if (detailData.TrangThai !== 'Dang_kiem') { alert('Phiếu đã hoàn tất, không thể cập nhật'); return; }
        setDetailSaving(true);
        try {
            const payload = {
                items: (detailData.items || []).map(i => ({ MaSP: i.MaSP, SoLuongThucTe: i.SoLuongThucTe, LyDo: i.LyDo || null }))
            };
            const r = await axios.put(`${API}/inventory-checks/${detailData.MaKiemKe}`, payload, { headers: getHeaders() });
            if (r.data.success) {
                alert('Cập nhật phiếu kiểm kê thành công');
                // refresh detail
                const r2 = await axios.get(`${API}/inventory-checks/${detailData.MaKiemKe}`, { headers: getHeaders() });
                if (r2.data.success) setDetailData(r2.data.data);
                fetchChecks(1);
            } else {
                alert('Cập nhật thất bại: ' + (r.data.message || ''));
            }
        } catch (e) {
            console.error('Lỗi cập nhật phiếu:', e);
            alert('Lỗi: ' + (e.response?.data?.message || e.message));
        } finally {
            setDetailSaving(false);
        }
    };

    // ── helpers ───────────────────────────────────────────────
    const createStats = () => {
        const total = createItems.length;
        const changed = createItems.filter(i => i.SoLuongThucTe !== i.TonHeThong).length;
        const totalDiff = createItems.reduce((s, i) => s + (i.SoLuongThucTe - i.TonHeThong), 0);
        return { total, changed, totalDiff };
    };

    const diffClass = (chenh) => {
        if (chenh === 0) return 'diff-zero';
        if (chenh > 0) return 'diff-plus';
        return 'diff-minus';
    };

    // ── guard ─────────────────────────────────────────────────
    if (!hasPermissionById(FEATURES.INVENTORY_CHECK, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
            </div>
        );
    }

    const canCreate = hasPermissionById(FEATURES.INVENTORY_CHECK, 'them');
    const canComplete = hasPermissionById(FEATURES.INVENTORY_CHECK, 'sua');

    // ────────────────────────────────────────────────────────
    return (
        <div className="ic-page">

            {/* ── PAGE HEADER ── */}
            <div className="ic-page-header">
                <div>
                    <h1>
                        {view === 'list' && 'Kiểm Kê Kho'}
                        {view === 'create' && 'Tạo Phiếu Kiểm Kê'}
                        {view === 'detail' && `Phiếu Kiểm Kê ${detailData ? `#${detailData.MaKiemKe}` : ''}`}
                    </h1>
                    <p>
                        {view === 'list' && 'Quản lý các phiếu kiểm kê tồn kho theo từng kho'}
                        {view === 'create' && 'Nhập số lượng thực tế để đối chiếu với hệ thống'}
                        {view === 'detail' && 'Chi tiết kết quả kiểm kê'}
                    </p>
                </div>
                <div className="ic-header-actions">
                    {view !== 'list' && (
                        <button className="ic-btn-outline" onClick={() => { setView('list'); setDetailData(null); }}>
                            <span className="material-icons">arrow_back</span> Quay lại
                        </button>
                    )}
                    {view === 'list' && canCreate && (
                        <button className="ic-btn-primary" onClick={() => { setCreateStore(''); setCreateItems([]); setView('create'); }}>
                            <span className="material-icons">add</span> Tạo phiếu kiểm kê
                        </button>
                    )}
                    {view === 'detail' && detailData && detailData.TrangThai === 'Dang_kiem' && canComplete && (
                        <>
                            <button className="ic-btn-outline" onClick={saveDetailChanges} disabled={detailSaving}>
                                {detailSaving ? <><span className="material-icons spin">autorenew</span> Đang lưu...</> : <><span className="material-icons">save</span> Lưu thay đổi</>}
                            </button>
                            <button className="ic-btn-primary" onClick={() => setCompleteModal(true)}>
                                <span className="material-icons">check_circle</span> Hoàn tất kiểm kê
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* LIST VIEW */}
            {/* ══════════════════════════════════════════════════════════ */}
            {view === 'list' && (
                <div className="ic-list">
                    <div className="ic-filter-bar">
                        <div className="ic-tabs">
                            {[['', 'Tất cả'], ['Dang_kiem', 'Đang kiểm'], ['Hoan_thanh', 'Hoàn thành']].map(([val, label]) => (
                                <button key={val} className={`ic-tab ${filterStatus === val ? 'active' : ''}`}
                                    onClick={() => setFilterStatus(val)}>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="ic-filter-right">
                            <select value={filterStore} onChange={e => setFilterStore(e.target.value)}>
                                <option value="">Tất cả kho</option>
                                {stores.map(s => <option key={s.MaCH} value={s.MaCH}>{s.TenCH}</option>)}
                            </select>
                            <button className="ic-btn-icon" onClick={() => fetchChecks(1)} title="Làm mới">
                                <span className="material-icons">refresh</span>
                            </button>
                        </div>
                    </div>

                    <div className="ic-table-wrap">
                        {listLoading ? (
                            <div className="ic-loading"><span className="material-icons spin">autorenew</span> Đang tải...</div>
                        ) : (
                            <table className="ic-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Kho</th>
                                        <th>Ngày kiểm kê</th>
                                        <th>Người kiểm</th>
                                        <th>Số SP</th>
                                        <th>SP chênh lệch</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {checks.length > 0 ? checks.map(c => (
                                        <tr key={c.MaKiemKe}>
                                            <td className="text-muted">#{c.MaKiemKe}</td>
                                            <td>{c.TenCH}</td>
                                            <td>{new Date(c.NgayKiemKe).toLocaleDateString('vi-VN')}</td>
                                            <td>{c.TenNguoiKiemKe}</td>
                                            <td>{c.SoSanPham}</td>
                                            <td>
                                                {c.SoChenhLech > 0
                                                    ? <span className="ic-diff-warning">{c.SoChenhLech} SP</span>
                                                    : <span className="ic-diff-ok">Không có</span>}
                                            </td>
                                            <td><StatusBadge status={c.TrangThai} /></td>
                                            <td>
                                                <button className="ic-btn-icon" title="Xem chi tiết"
                                                    onClick={() => openDetail(c.MaKiemKe)}>
                                                    <span className="material-icons">visibility</span>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="8" className="ic-empty-row">
                                                <span className="material-icons">inventory_2</span>
                                                <p>Chưa có phiếu kiểm kê nào</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="ic-pagination">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} className={pagination.page === p ? 'active' : ''}
                                    onClick={() => fetchChecks(p)}>{p}</button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* CREATE VIEW */}
            {/* ══════════════════════════════════════════════════════════ */}
            {view === 'create' && (
                <div className="ic-create">
                    {/* Setup */}
                    <div className="ic-create-setup">
                        <div className="ic-form-row">
                            <div className="ic-form-group">
                                <label>Kho kiểm kê *</label>
                                <select value={createStore} onChange={e => loadStockForStore(e.target.value)}>
                                    <option value="">-- Chọn kho --</option>
                                    {stores.map(s => <option key={s.MaCH} value={s.MaCH}>{s.TenCH}</option>)}
                                </select>
                            </div>
                            <div className="ic-form-group">
                                <label>Ngày kiểm kê</label>
                                <input type="date" value={createDate}
                                    onChange={e => setCreateDate(e.target.value)} />
                            </div>
                            <div className="ic-form-group">
                                <label>Ghi chú</label>
                                <input type="text" value={createNote}
                                    onChange={e => setCreateNote(e.target.value)}
                                    placeholder="Ghi chú phiếu kiểm kê..." />
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    {createItems.length > 0 && (() => {
                        const s = createStats();
                        return (
                            <div className="ic-stats-bar">
                                <div className="ic-stat">
                                    <span className="material-icons">inventory</span>
                                    <div><strong>{s.total}</strong><p>Tổng SP</p></div>
                                </div>
                                <div className="ic-stat">
                                    <span className="material-icons">compare_arrows</span>
                                    <div><strong className={s.changed > 0 ? 'warn' : ''}>{s.changed}</strong><p>SP chênh lệch</p></div>
                                </div>
                                <div className="ic-stat">
                                    <span className="material-icons">{s.totalDiff < 0 ? 'trending_down' : 'trending_flat'}</span>
                                    <div>
                                        <strong className={s.totalDiff < 0 ? 'negative' : s.totalDiff > 0 ? 'positive' : ''}>
                                            {s.totalDiff > 0 ? '+' : ''}{s.totalDiff}
                                        </strong>
                                        <p>Tổng chênh lệch</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Table */}
                    {stockLoading ? (
                        <div className="ic-loading"><span className="material-icons spin">autorenew</span> Đang tải tồn kho...</div>
                    ) : createItems.length > 0 ? (
                        <div className="ic-check-table-wrap">
                            <table className="ic-check-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Mã SP</th>
                                        <th>Tên sách</th>
                                        <th>Tồn hệ thống</th>
                                        <th>Tồn thực tế</th>
                                        <th>Chênh lệch</th>
                                        <th>Lý do</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {createItems.map((item, idx) => {
                                        const chenh = item.SoLuongThucTe - item.TonHeThong;
                                        return (
                                            <tr key={`create-${idx}-${item.MaSP}`} className={chenh !== 0 ? 'has-diff' : ''}>
                                                <td className="text-muted">{idx + 1}</td>
                                                <td className="text-muted">{item.MaSP}</td>
                                                <td className="ic-product-name">{item.TenSP}</td>
                                                <td className="text-center ic-system-qty">{item.TonHeThong}</td>
                                                <td>
                                                    <input type="number" min="0"
                                                        value={item.SoLuongThucTe}
                                                        onChange={e => updateThucTe(item.MaSP, e.target.value)}
                                                        className="ic-qty-input" />
                                                </td>
                                                <td className={`ic-diff ${diffClass(chenh)}`}>
                                                    {chenh > 0 ? '+' : ''}{chenh}
                                                </td>
                                                <td>
                                                    <input type="text"
                                                        value={item.LyDo}
                                                        onChange={e => updateLyDo(item.MaSP, e.target.value)}
                                                        placeholder={chenh !== 0 ? 'Nhập lý do...' : ''}
                                                        className="ic-note-input" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : createStore ? (
                        <div className="ic-empty-create">
                            <span className="material-icons">inventory_2</span>
                            <p>Kho này chưa có sản phẩm nào</p>
                        </div>
                    ) : (
                        <div className="ic-hint-create">
                            <span className="material-icons">touch_app</span>
                            <p>Hãy chọn kho để bắt đầu kiểm kê</p>
                        </div>
                    )}

                    {/* Actions */}
                    {createItems.length > 0 && (
                        <div className="ic-create-footer">
                            <button className="ic-btn-outline" onClick={() => setView('list')}>Hủy</button>
                            <button className="ic-btn-primary" onClick={handleCreateSubmit} disabled={createLoading}>
                                {createLoading
                                    ? <><span className="material-icons spin">autorenew</span> Đang lưu...</>
                                    : <><span className="material-icons">save</span> Lưu phiếu kiểm kê</>
                                }
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* DETAIL VIEW */}
            {/* ══════════════════════════════════════════════════════════ */}
            {view === 'detail' && (
                <div className="ic-detail">
                    {detailLoading ? (
                        <div className="ic-loading"><span className="material-icons spin">autorenew</span> Đang tải...</div>
                    ) : detailData ? (
                        <>
                            {/* Header info */}
                            <div className="ic-detail-header">
                                <div className="ic-detail-info-grid">
                                    <div className="ic-detail-item">
                                        <label>Kho</label>
                                        <span>{detailData.TenCH}</span>
                                    </div>
                                    <div className="ic-detail-item">
                                        <label>Ngày kiểm kê</label>
                                        <span>{new Date(detailData.NgayKiemKe).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="ic-detail-item">
                                        <label>Người kiểm</label>
                                        <span>{detailData.TenNguoiKiemKe}</span>
                                    </div>
                                    <div className="ic-detail-item">
                                        <label>Trạng thái</label>
                                        <StatusBadge status={detailData.TrangThai} />
                                    </div>
                                    {detailData.GhiChu && (
                                        <div className="ic-detail-item ic-full">
                                            <label>Ghi chú</label>
                                            <span>{detailData.GhiChu}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Summary stats */}
                                {detailData.items?.length > 0 && (
                                    <div className="ic-stats-bar">
                                        <div className="ic-stat">
                                            <span className="material-icons">inventory</span>
                                            <div><strong>{detailData.items.length}</strong><p>Tổng SP</p></div>
                                        </div>
                                        <div className="ic-stat">
                                            <span className="material-icons">compare_arrows</span>
                                            <div>
                                                <strong className={detailData.items.filter(i => i.ChenhLech !== 0).length > 0 ? 'warn' : ''}>
                                                    {detailData.items.filter(i => i.ChenhLech !== 0).length}
                                                </strong>
                                                <p>SP chênh lệch</p>
                                            </div>
                                        </div>
                                        <div className="ic-stat">
                                            <span className="material-icons">trending_down</span>
                                            <div>
                                                <strong className="negative">
                                                    {detailData.items.filter(i => i.ChenhLech < 0).length}
                                                </strong>
                                                <p>SP thiếu</p>
                                            </div>
                                        </div>
                                        <div className="ic-stat">
                                            <span className="material-icons">trending_up</span>
                                            <div>
                                                <strong className="positive">
                                                    {detailData.items.filter(i => i.ChenhLech > 0).length}
                                                </strong>
                                                <p>SP thừa</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Items table */}
                            <div className="ic-check-table-wrap">
                                <table className="ic-check-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Mã SP</th>
                                            <th>Tên sách</th>
                                            <th>Tồn hệ thống</th>
                                            <th>Tồn thực tế</th>
                                            <th>Chênh lệch</th>
                                            <th>Lý do</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(detailData.items || []).map((item, idx) => (
                                            <tr key={`detail-${idx}-${item.MaSP}`} className={item.ChenhLech !== 0 ? 'has-diff' : ''}>
                                                <td className="text-muted">{idx + 1}</td>
                                                <td className="text-muted">{item.MaSP}</td>
                                                <td className="ic-product-name">{item.TenSP}</td>
                                                <td className="text-center ic-system-qty">{item.SoLuongHeThong}</td>
                                                <td className="text-center">
                                                    {detailData.TrangThai === 'Dang_kiem' ? (
                                                        <input type="number" min="0" className="ic-qty-input" value={item.SoLuongThucTe}
                                                            onChange={e => updateDetailThucTe(item.MaSP, e.target.value)} />
                                                    ) : (
                                                        item.SoLuongThucTe
                                                    )}
                                                </td>
                                                <td className={`ic-diff ${diffClass(item.ChenhLech)}`}>
                                                    {item.ChenhLech > 0 ? '+' : ''}{item.ChenhLech}
                                                </td>
                                                <td>
                                                    {detailData.TrangThai === 'Dang_kiem' ? (
                                                        <input type="text" className="ic-note-input" value={item.LyDo || ''}
                                                            onChange={e => updateDetailLyDo(item.MaSP, e.target.value)} placeholder={item.ChenhLech !== 0 ? 'Nhập lý do...' : ''} />
                                                    ) : (
                                                        item.LyDo || (item.ChenhLech === 0 ? '–' : <span className="ic-no-reason">Chưa có lý do</span>)
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : null}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* COMPLETE MODAL */}
            {/* ══════════════════════════════════════════════════════════ */}
            {completeModal && detailData && (
                <div className="ic-overlay" onClick={() => setCompleteModal(false)}>
                    <div className="ic-modal" onClick={e => e.stopPropagation()}>
                        <div className="ic-modal-header">
                            <h2>Hoàn tất phiếu kiểm kê #{detailData.MaKiemKe}</h2>
                            <button className="ic-btn-icon" onClick={() => setCompleteModal(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="ic-modal-body">
                            <p>Bạn muốn hoàn tất phiếu kiểm kê với <strong>{detailData.items?.filter(i => i.ChenhLech !== 0).length || 0}</strong> sản phẩm chênh lệch.</p>

                            <div className="ic-complete-options">
                                <label className={`ic-option ${apDung ? 'selected' : ''}`} onClick={() => setApDung(true)}>
                                    <div className="ic-option-icon sync">
                                        <span className="material-icons">sync</span>
                                    </div>
                                    <div>
                                        <strong>Đồng bộ tồn kho</strong>
                                        <p>Cập nhật tồn kho theo số lượng thực tế đếm được. Dữ liệu kho sẽ khớp với thực tế.</p>
                                    </div>
                                    <span className="material-icons ic-radio">{apDung ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                </label>

                                <label className={`ic-option ${!apDung ? 'selected' : ''}`} onClick={() => setApDung(false)}>
                                    <div className="ic-option-icon nosync">
                                        <span className="material-icons">block</span>
                                    </div>
                                    <div>
                                        <strong>Chỉ lưu kết quả, không đồng bộ</strong>
                                        <p>Lưu kết quả kiểm kê để báo cáo, tồn kho hệ thống không thay đổi.</p>
                                    </div>
                                    <span className="material-icons ic-radio">{!apDung ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                </label>
                            </div>
                        </div>
                        <div className="ic-modal-footer">
                            <button className="ic-btn-outline" onClick={() => setCompleteModal(false)}>Hủy</button>
                            <button className="ic-btn-primary" onClick={doComplete} disabled={completing}>
                                {completing
                                    ? <><span className="material-icons spin">autorenew</span> Đang xử lý...</>
                                    : <><span className="material-icons">check_circle</span> Xác nhận hoàn tất</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryCheck;
