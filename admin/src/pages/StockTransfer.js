import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/StockTransfer.css';

const API = 'http://localhost:5000/api/warehouse';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('authToken')}` });

const STATUS_MAP = {
    Cho_duyet:   { text: 'Chờ duyệt',   cls: 'badge-pending' },
    Dang_chuyen: { text: 'Đang chuyển', cls: 'badge-transit' },
    Da_nhan:     { text: 'Đã nhận',     cls: 'badge-done' },
    Huy:         { text: 'Đã hủy',      cls: 'badge-cancel' },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || { text: status, cls: 'badge-pending' };
    return <span className={`st-badge ${s.cls}`}>{s.text}</span>;
};

const imgUrl = (h) => {
    if (!h) return null;
    if (h.startsWith('http')) return h;
    return `http://localhost:5000${h.startsWith('/') ? h : '/' + h}`;
};

const ProductThumb = ({ src, name, size = 36 }) => (
    imgUrl(src)
        ? <img src={imgUrl(src)} alt={name} style={{ width: size, height: size, borderRadius: 4, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        : <span className="material-icons" style={{ fontSize: size, color: '#ccc' }}>menu_book</span>
);

// ────────────────────────────────────────────────────────────────────────────────
const StockTransfer = () => {
    const { hasPermissionById } = useContext(PermissionContext);

    // list state
    const [transfers, setTransfers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterWarehouse, setFilterWarehouse] = useState('');

    // shared
    const [subWarehouses, setSubWarehouses] = useState([]);
    const [products, setProducts] = useState([]);

    // view: 'list' | 'create'
    const [view, setView] = useState('list');

    // create form
    const [form, setForm] = useState({ MaKhoNguon: '', MaKhoDich: '', GhiChu: '', items: [] });
    const [sourceStock, setSourceStock] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // modals
    const [detailData, setDetailData] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null); // { MaCK }
    const [cancelReason, setCancelReason] = useState('');

    // ── helpers ──────────────────────────────────────────────
    const fetchSubWarehouses = useCallback(async () => {
        try {
            const r = await axios.get(`${API}/sub-warehouses`, { headers: getHeaders() });
            if (r.data.success) setSubWarehouses(r.data.data || []);
        } catch (e) { console.error('fetchSubWarehouses', e); }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const r = await axios.get(`${API}/products?pageSize=300`, { headers: getHeaders() });
            if (r.data.success) setProducts(r.data.data || []);
        } catch (e) { console.error('fetchProducts', e); }
    }, []);

    const fetchTransfers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ page, pageSize: 20 });
            if (filterStatus)    p.append('TrangThai', filterStatus);
            if (filterWarehouse) p.append('MaKhoNguon', filterWarehouse);
            const r = await axios.get(`${API}/transfers?${p}`, { headers: getHeaders() });
            if (r.data.success) {
                setTransfers(r.data.data || []);
                setPagination(r.data.pagination || { page: 1, totalPages: 1 });
            }
        } catch (e) { console.error('fetchTransfers', e); }
        finally { setLoading(false); }
    }, [filterStatus, filterWarehouse]);

    const fetchSourceStock = async (MaKho) => {
        if (!MaKho) { setSourceStock([]); return; }
        try {
            const r = await axios.get(`${API}/stock-by-subwarehouse?MaKho=${MaKho}&pageSize=300`, { headers: getHeaders() });
            if (r.data.success) setSourceStock(r.data.data || []);
        } catch (e) { console.error('fetchSourceStock', e); }
    };

    useEffect(() => { fetchSubWarehouses(); fetchProducts(); }, [fetchSubWarehouses, fetchProducts]);
    useEffect(() => { fetchTransfers(1); }, [fetchTransfers]);

    // ── create form actions ───────────────────────────────────
    const handleSourceChange = (MaKho) => {
        setForm(f => ({ ...f, MaKhoNguon: MaKho, items: [] }));
        fetchSourceStock(MaKho);
    };

    const addItem = (product) => {
        if (form.items.find(i => i.MaSP === product.MaSP)) return;
        const s = sourceStock.find(s => s.MaSP === product.MaSP);
        const ton = s?.SoLuongTon ?? 0;
        if (ton === 0) return;
        setForm(f => ({
            ...f,
            items: [...f.items, {
                MaSP: product.MaSP,
                TenSP: product.TenSP,
                HinhAnh: product.HinhAnh,
                SoLuong: 1,
                TonNguon: ton,
            }]
        }));
    };

    const updateQty = (MaSP, v) => setForm(f => ({
        ...f,
        items: f.items.map(i => i.MaSP === MaSP ? { ...i, SoLuong: Math.max(1, parseInt(v) || 1) } : i)
    }));

    const removeItem = (MaSP) => setForm(f => ({ ...f, items: f.items.filter(i => i.MaSP !== MaSP) }));

    const resetCreate = () => {
        setForm({ MaKhoNguon: '', MaKhoDich: '', GhiChu: '', items: [] });
        setSourceStock([]);
        setProductSearch('');
    };

    const handleSubmit = async () => {
        if (!form.MaKhoNguon || !form.MaKhoDich) { alert('Vui lòng chọn kho nguồn và kho đích'); return; }
        if (form.MaKhoNguon === form.MaKhoDich) { alert('Kho nguồn và kho đích không được trùng nhau'); return; }
        if (!form.items.length) { alert('Vui lòng thêm ít nhất 1 sản phẩm'); return; }
        const over = form.items.find(i => i.SoLuong > i.TonNguon);
        if (over) { alert(`"${over.TenSP}" vượt số lượng tồn kho (${over.TonNguon})`); return; }

        setSubmitting(true);
        try {
            const r = await axios.post(`${API}/transfers`, {
                MaKhoNguon: form.MaKhoNguon,
                MaKhoDich: form.MaKhoDich,
                GhiChu: form.GhiChu,
                items: form.items.map(i => ({ MaSP: i.MaSP, SoLuong: i.SoLuong }))
            }, { headers: getHeaders() });
            if (r.data.success) {
                alert(`Tạo thành công ${r.data.MaCKList?.length || form.items.length} yêu cầu chuyển kho!`);
                resetCreate();
                setView('list');
                fetchTransfers(1);
            }
        } catch (e) { alert('Lỗi: ' + (e.response?.data?.message || e.message)); }
        finally { setSubmitting(false); }
    };

    // ── list actions ──────────────────────────────────────────
    const openDetail = async (MaCK) => {
        try {
            const r = await axios.get(`${API}/transfers/${MaCK}`, { headers: getHeaders() });
            if (r.data.success) setDetailData(r.data.data);
        } catch (e) { alert('Lỗi tải chi tiết'); }
    };

    const doApprove = async (MaCK) => {
        try {
            const r = await axios.put(`${API}/transfers/${MaCK}/approve`, {}, { headers: getHeaders() });
            if (r.data.success) {
                alert('Đã duyệt thành công!');
                setDetailData(null);
                fetchTransfers(pagination.page);
            }
        } catch (e) { alert('Lỗi: ' + (e.response?.data?.message || e.message)); }
    };

    const doCancel = async () => {
        if (!cancelTarget) return;
        try {
            const r = await axios.put(`${API}/transfers/${cancelTarget.MaCK}/cancel`,
                { LyDo: cancelReason || 'Không có lý do' },
                { headers: getHeaders() }
            );
            if (r.data.success) {
                alert('Đã hủy yêu cầu!');
                setCancelTarget(null);
                setCancelReason('');
                setDetailData(null);
                fetchTransfers(pagination.page);
            }
        } catch (e) { alert('Lỗi: ' + (e.response?.data?.message || e.message)); }
    };

    // ── guard ─────────────────────────────────────────────────
    if (!hasPermissionById(FEATURES.STOCK, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
            </div>
        );
    }

    const searchedProducts = products.filter(p =>
        p.TenSP?.toLowerCase().includes(productSearch.toLowerCase()) ||
        String(p.MaSP).includes(productSearch)
    );

    const canApprove = hasPermissionById(FEATURES.STOCK, 'sua');

    // ────────────────────────────────────────────────────────
    return (
        <div className="st-page">

            {/* ── PAGE HEADER ── */}
            <div className="st-page-header">
                <div>
                    <h1>Quản lý Chuyển Kho</h1>
                    <p>Tạo và theo dõi yêu cầu điều chuyển sách giữa các kho</p>
                </div>
                {view === 'list' ? (
                    hasPermissionById(FEATURES.STOCK, 'them') && (
                        <button className="st-btn-primary" onClick={() => { resetCreate(); setView('create'); }}>
                            <span className="material-icons">add</span> Tạo yêu cầu
                        </button>
                    )
                ) : (
                    <button className="st-btn-outline" onClick={() => { resetCreate(); setView('list'); }}>
                        <span className="material-icons">arrow_back</span> Quay lại danh sách
                    </button>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════ */}
            {/* CREATE VIEW */}
            {/* ══════════════════════════════════════════════════════════ */}
            {view === 'create' && (
                <div className="st-create">
                    <div className="st-create-grid">

                        {/* LEFT – thông tin + tìm sản phẩm */}
                        <div className="st-panel">
                            <h3><span className="material-icons">info</span> Thông tin điều chuyển</h3>

                            <div className="st-form-group">
                                <label>Kho nguồn *</label>
                                <select value={form.MaKhoNguon} onChange={e => handleSourceChange(e.target.value)}>
                                    <option value="">-- Chọn kho chuyển đi --</option>
                                    {subWarehouses.map(k => <option key={k.MaKho} value={k.MaKho}>{k.TenKho}</option>)}
                                </select>
                            </div>

                            <div className="st-form-group">
                                <label>Kho đích *</label>
                                <select value={form.MaKhoDich}
                                    onChange={e => setForm(f => ({ ...f, MaKhoDich: e.target.value }))}>
                                    <option value="">-- Chọn kho nhận --</option>
                                    {subWarehouses
                                        .filter(k => String(k.MaKho) !== String(form.MaKhoNguon))
                                        .map(k => <option key={k.MaKho} value={k.MaKho}>{k.TenKho}</option>)}
                                </select>
                            </div>

                            <div className="st-form-group">
                                <label>Ghi chú</label>
                                <input type="text" placeholder="Ghi chú (tuỳ chọn)"
                                    value={form.GhiChu}
                                    onChange={e => setForm(f => ({ ...f, GhiChu: e.target.value }))} />
                            </div>

                            {form.MaKhoNguon && (
                                <div className="st-search-products">
                                    <h4>
                                        <span className="material-icons">search</span>
                                        Tìm & thêm sản phẩm
                                        {sourceStock.length > 0 && <span className="st-stock-count">({sourceStock.length} SP có tồn)</span>}
                                    </h4>
                                    <div className="st-search-box">
                                        <span className="material-icons">search</span>
                                        <input type="text" placeholder="Nhập tên sách..."
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)} />
                                    </div>
                                    <div className="st-search-results">
                                        {searchedProducts.length === 0 && productSearch && (
                                            <p className="st-empty">Không tìm thấy sản phẩm</p>
                                        )}
                                        {searchedProducts.slice(0, 8).map(p => {
                                            const stock = sourceStock.find(s => s.MaSP === p.MaSP);
                                            const ton = stock?.SoLuongTon ?? 0;
                                            const added = form.items.find(i => i.MaSP === p.MaSP);
                                            return (
                                                <div key={p.MaSP} className={`st-product-row ${ton === 0 ? 'st-out-of-stock' : ''}`}>
                                                    <ProductThumb src={p.HinhAnh} name={p.TenSP} />
                                                    <div className="st-product-info">
                                                        <span className="st-product-name">{p.TenSP}</span>
                                                        <span className="st-product-stock">
                                                            Tồn: <strong className={ton === 0 ? 'zero' : ''}>{ton}</strong>
                                                        </span>
                                                    </div>
                                                    <button
                                                        className={`st-btn-add ${added ? 'added' : ''}`}
                                                        disabled={ton === 0 || !!added}
                                                        onClick={() => addItem(p)}
                                                        title={added ? 'Đã thêm' : ton === 0 ? 'Hết hàng' : 'Thêm vào danh sách'}
                                                    >
                                                        <span className="material-icons">{added ? 'check' : 'add'}</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {!form.MaKhoNguon && (
                                <div className="st-hint">
                                    <span className="material-icons">info</span>
                                    Hãy chọn kho nguồn để xem sản phẩm có thể chuyển
                                </div>
                            )}
                        </div>

                        {/* RIGHT – danh sách chuyển */}
                        <div className="st-panel">
                            <div className="st-panel-header">
                                <h3>Danh sách sản phẩm điều chuyển</h3>
                                <span className="st-count-badge">{form.items.length} sản phẩm</span>
                            </div>

                            <div className="st-items-table-wrap">
                                <table className="st-items-table">
                                    <thead>
                                        <tr>
                                            <th>Sách</th>
                                            <th>Tồn nguồn</th>
                                            <th>Số lượng chuyển</th>
                                            <th>Trạng thái</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.items.length > 0 ? form.items.map(item => {
                                            const over = item.SoLuong > item.TonNguon;
                                            return (
                                                <tr key={item.MaSP} className={over ? 'row-error' : ''}>
                                                    <td>
                                                        <div className="st-product-cell">
                                                            <ProductThumb src={item.HinhAnh} name={item.TenSP} />
                                                            <span>{item.TenSP}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">{item.TonNguon}</td>
                                                    <td>
                                                        <input type="number" min="1" max={item.TonNguon}
                                                            value={item.SoLuong}
                                                            onChange={e => updateQty(item.MaSP, e.target.value)}
                                                            className={`st-qty-input ${over ? 'input-error' : ''}`} />
                                                    </td>
                                                    <td>
                                                        <span className={`st-badge ${over ? 'badge-cancel' : 'badge-done'}`}>
                                                            {over ? 'Vượt tồn kho' : 'Hợp lệ'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="st-btn-icon-del" onClick={() => removeItem(item.MaSP)}>
                                                            <span className="material-icons">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="5" className="st-empty-row">
                                                    <span className="material-icons">inbox</span>
                                                    <p>Chưa có sản phẩm — tìm và thêm từ cột bên trái</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {form.items.length > 0 && (
                                <div className="st-summary-bar">
                                    <span>Tổng số lượng chuyển:</span>
                                    <strong>{form.items.reduce((s, i) => s + i.SoLuong, 0)} cuốn</strong>
                                </div>
                            )}

                            <div className="st-info-note">
                                <span className="material-icons">info</span>
                                Khi gửi yêu cầu, phiếu chuyển kho sẽ ở trạng thái <strong>Chờ duyệt</strong>.
                                Tồn kho chỉ thay đổi sau khi được duyệt.
                            </div>

                            <div className="st-form-actions">
                                <button className="st-btn-outline" onClick={() => { resetCreate(); setView('list'); }}>
                                    Hủy
                                </button>
                                <button className="st-btn-primary" onClick={handleSubmit}
                                    disabled={submitting || !form.items.length || !form.MaKhoNguon || !form.MaKhoDich ||
                                        form.items.some(i => i.SoLuong > i.TonNguon)}>
                                    {submitting
                                        ? <><span className="material-icons spin">autorenew</span> Đang gửi...</>
                                        : <><span className="material-icons">send</span> Gửi yêu cầu</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* LIST VIEW */}
            {/* ══════════════════════════════════════════════════════════ */}
            {view === 'list' && (
                <div className="st-list">
                    {/* Filter bar */}
                    <div className="st-filter-bar">
                        <div className="st-tabs">
                            {[
                                ['', 'Tất cả'],
                                ['Cho_duyet', 'Chờ duyệt'],
                                ['Dang_chuyen', 'Đang chuyển'],
                                ['Da_nhan', 'Đã nhận'],
                                ['Huy', 'Đã hủy'],
                            ].map(([val, label]) => (
                                <button key={val}
                                    className={`st-tab ${filterStatus === val ? 'active' : ''}`}
                                    onClick={() => setFilterStatus(val)}>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="st-filter-right">
                            <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)}>
                                <option value="">Tất cả kho</option>
                                {subWarehouses.map(k => <option key={k.MaKho} value={k.MaKho}>{k.TenKho}</option>)}
                            </select>
                            <button className="st-btn-icon" onClick={() => fetchTransfers(1)} title="Làm mới">
                                <span className="material-icons">refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="st-table-wrap">
                        {loading ? (
                            <div className="st-loading">
                                <span className="material-icons spin">autorenew</span> Đang tải...
                            </div>
                        ) : (
                            <table className="st-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Sản phẩm</th>
                                        <th>Kho nguồn</th>
                                        <th>Kho đích</th>
                                        <th>SL</th>
                                        <th>Ngày tạo</th>
                                        <th>Người chuyển</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transfers.length > 0 ? transfers.map(t => (
                                        <tr key={t.MaCK}>
                                            <td className="text-muted">#{t.MaCK}</td>
                                            <td>
                                                <div className="st-product-cell">
                                                    <ProductThumb src={t.HinhAnh} name={t.TenSP} />
                                                    <span>{t.TenSP}</span>
                                                </div>
                                            </td>
                                            <td>{t.TenKhoNguon}</td>
                                            <td>{t.TenKhoDich}</td>
                                            <td><strong>{t.SoLuong}</strong></td>
                                            <td className="text-muted">
                                                {t.NgayChuyen ? new Date(t.NgayChuyen).toLocaleDateString('vi-VN') : '–'}
                                            </td>
                                            <td>{t.TenNguoiChuyen || '–'}</td>
                                            <td><StatusBadge status={t.TrangThai} /></td>
                                            <td>
                                                <div className="st-actions">
                                                    <button className="st-btn-icon" title="Xem chi tiết"
                                                        onClick={() => openDetail(t.MaCK)}>
                                                        <span className="material-icons">visibility</span>
                                                    </button>
                                                    {t.TrangThai === 'Cho_duyet' && canApprove && (
                                                        <button className="st-btn-icon approve" title="Duyệt"
                                                            onClick={() => { if (window.confirm('Duyệt yêu cầu này?')) doApprove(t.MaCK); }}>
                                                            <span className="material-icons">check_circle</span>
                                                        </button>
                                                    )}
                                                    {t.TrangThai === 'Cho_duyet' && (
                                                        <button className="st-btn-icon cancel" title="Hủy yêu cầu"
                                                            onClick={() => { setCancelTarget({ MaCK: t.MaCK }); setCancelReason(''); }}>
                                                            <span className="material-icons">cancel</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="9" className="st-empty-row">
                                                <span className="material-icons">inbox</span>
                                                <p>Không có dữ liệu</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="st-pagination">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p}
                                    className={pagination.page === p ? 'active' : ''}
                                    onClick={() => fetchTransfers(p)}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* DETAIL MODAL */}
            {/* ══════════════════════════════════════════════════════════ */}
            {detailData && (
                <div className="st-overlay" onClick={() => setDetailData(null)}>
                    <div className="st-modal" onClick={e => e.stopPropagation()}>
                        <div className="st-modal-header">
                            <h2>Chi tiết phiếu chuyển kho <span className="text-muted">#{detailData.MaCK}</span></h2>
                            <button className="st-btn-icon" onClick={() => setDetailData(null)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="st-modal-body">
                            <div className="st-detail-grid">
                                <div className="st-detail-item">
                                    <label>Sản phẩm</label>
                                    <div className="st-product-cell">
                                        <ProductThumb src={detailData.HinhAnh} name={detailData.TenSP} size={40} />
                                        <span>{detailData.TenSP}</span>
                                    </div>
                                </div>
                                <div className="st-detail-item">
                                    <label>Trạng thái</label>
                                    <StatusBadge status={detailData.TrangThai} />
                                </div>
                                <div className="st-detail-item">
                                    <label>Từ kho</label>
                                    <span>{detailData.TenKhoNguon}</span>
                                </div>
                                <div className="st-detail-item">
                                    <label>Đến kho</label>
                                    <span>{detailData.TenKhoDich}</span>
                                </div>
                                <div className="st-detail-item">
                                    <label>Số lượng</label>
                                    <strong>{detailData.SoLuong}</strong>
                                </div>
                                <div className="st-detail-item">
                                    <label>Ngày tạo</label>
                                    <span>{detailData.NgayChuyen ? new Date(detailData.NgayChuyen).toLocaleDateString('vi-VN') : '–'}</span>
                                </div>
                                <div className="st-detail-item">
                                    <label>Người chuyển</label>
                                    <span>{detailData.TenNguoiChuyen || '–'}</span>
                                </div>
                                <div className="st-detail-item">
                                    <label>Người nhận</label>
                                    <span>{detailData.TenNguoiNhan || 'Chưa có'}</span>
                                </div>
                                <div className="st-detail-item">
                                    <label>Ngày nhận</label>
                                    <span>{detailData.NgayNhan ? new Date(detailData.NgayNhan).toLocaleDateString('vi-VN') : '–'}</span>
                                </div>
                                {detailData.GhiChu && (
                                    <div className="st-detail-item st-full">
                                        <label>Ghi chú</label>
                                        <span>{detailData.GhiChu}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="st-modal-footer">
                            {detailData.TrangThai === 'Cho_duyet' && canApprove && (
                                <button className="st-btn-primary"
                                    onClick={() => { if (window.confirm('Duyệt yêu cầu này?')) doApprove(detailData.MaCK); }}>
                                    <span className="material-icons">check_circle</span> Duyệt
                                </button>
                            )}
                            {detailData.TrangThai === 'Cho_duyet' && (
                                <button className="st-btn-danger"
                                    onClick={() => { setCancelTarget({ MaCK: detailData.MaCK }); setCancelReason(''); }}>
                                    <span className="material-icons">cancel</span> Hủy yêu cầu
                                </button>
                            )}
                            <button className="st-btn-outline" onClick={() => setDetailData(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* CANCEL MODAL */}
            {/* ══════════════════════════════════════════════════════════ */}
            {cancelTarget && (
                <div className="st-overlay" onClick={() => setCancelTarget(null)}>
                    <div className="st-modal st-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="st-modal-header">
                            <h2>Hủy yêu cầu #{cancelTarget.MaCK}</h2>
                            <button className="st-btn-icon" onClick={() => setCancelTarget(null)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="st-modal-body">
                            <div className="st-form-group">
                                <label>Lý do hủy</label>
                                <textarea rows={3} value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                    placeholder="Nhập lý do hủy (tuỳ chọn)..." />
                            </div>
                        </div>
                        <div className="st-modal-footer">
                            <button className="st-btn-outline" onClick={() => setCancelTarget(null)}>Không</button>
                            <button className="st-btn-danger" onClick={doCancel}>
                                <span className="material-icons">cancel</span> Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockTransfer;
