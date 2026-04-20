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

const imgUrl = (path) => {
    const API_BASE_URL = 'http://localhost:5000';
    const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGNEY0RjQiLz48cGF0aCBkPSJNMjAgMTRDMjMuMzEzNyAxNCAyNiAxNi42ODYzIDI2IDIwQzI2IDIzLjMxMzcgMjMuMzEzNyAyNiAyMCAyNkMxNi42ODYzIDI2IDE0IDIzLjMxMzcgMTQgMjBDMTQgMTYuNjg2MyAxNi42ODYzIDE0IDIwIDE0WiIgZmlsbD0iI0NDQ0NDQyIvPjwvc3ZnPg==';
    if (!path || path === 'null') return PLACEHOLDER;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleaned = path.toString();
    if (!cleaned.includes('/') && !cleaned.includes('uploads') && !cleaned.startsWith('img')) {
        return `${API_BASE_URL}/uploads/images/${cleaned}`;
    }
    const normalizedPath = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

const ProductThumb = ({ src, name, size = 36 }) => {
    const url = imgUrl(src);
    return (
        <img 
            src={url} 
            alt={name} 
            style={{ width: size, height: size, borderRadius: 4, objectFit: 'cover' }} 
            onError={e => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGNEY0RjQiLz48cGF0aCBkPSJNMjAgMTRDMjMuMzEzNyAxNCAyNiAxNi42ODYzIDI2IDIwQzI2IDIzLjMxMzcgMjMuMzEzNyAyNiAyMCAyNkMxNi42ODYzIDI2IDE0IDIzLjMxMzcgMTQgMjBDMTQgMTYuNjg2MyAxNi42ODYzIDE0IDIwIDE0WiIgZmlsbD0iI0NDQ0NDQyIvPjwvc3ZnPg=='; }} 
        />
    );
};

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
                alert('Tạo phiếu chuyển kho thành công!');
                resetCreate();
                setView('list');
                fetchTransfers(1);
            }
        } catch (e) { alert('Lỗi: ' + (e.response?.data?.message || e.message)); }
        finally { setSubmitting(false); }
    };

    // ── list actions ──────────────────────────────────────────
    // ── list actions ──────────────────────────────────────────
    const openDetail = async (MaPC) => {
        try {
            const r = await axios.get(`${API}/transfers/${MaPC}`, { headers: getHeaders() });
            if (r.data.success) setDetailData(r.data.data);
        } catch (e) { alert('Lỗi tải chi tiết'); }
    };

    const doApprove = async (MaPC) => {
        try {
            const r = await axios.put(`${API}/transfers/${MaPC}/approve`, {}, { headers: getHeaders() });
            if (r.data.success) {
                alert('Đã duyệt phiếu chuyển kho thành công!');
                setDetailData(null);
                fetchTransfers(pagination.page);
            }
        } catch (e) { alert('Lỗi: ' + (e.response?.data?.message || e.message)); }
    };

    const doCancel = async () => {
        if (!cancelTarget) return;
        try {
            const r = await axios.put(`${API}/transfers/${cancelTarget.MaPC}/cancel`,
                { LyDo: cancelReason || 'Không có lý do' },
                { headers: getHeaders() }
            );
            if (r.data.success) {
                alert('Đã hủy phiếu chuyển kho!');
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
                    <p>Tạo và theo dõi yêu cầu điều chuyển hàng hóa giữa các kho</p>
                </div>
                {view === 'list' ? (
                    hasPermissionById(FEATURES.STOCK, 'them') && (
                        <button className="st-btn-primary" onClick={() => { resetCreate(); setView('create'); }}>
                            <span className="material-icons">add</span> Lập phiếu chuyển mới
                        </button>
                    )
                ) : (
                    <button className="st-btn-outline" onClick={() => { resetCreate(); setView('list'); }}>
                        <span className="material-icons">arrow_back</span> Quay lại danh sách
                    </button>
                )}
            </div>

            {/* CREATE VIEW */}
            {view === 'create' && (
                <div className="st-create">
                    <div className="st-create-grid">
                        <div className="st-panel">
                            <h3><span className="material-icons">info</span> Thông tin phiếu chuyển</h3>
                            <div className="st-form-group">
                                <label>Kho nguồn *</label>
                                <select value={form.MaKhoNguon} onChange={e => handleSourceChange(e.target.value)}>
                                    <option value="">-- Chọn kho chuyển đi --</option>
                                    {subWarehouses.map(k => <option key={k.MaKho} value={k.MaKho}>{k.TenKho}</option>)}
                                </select>
                            </div>
                            <div className="st-form-group">
                                <label>Kho đích *</label>
                                <select value={form.MaKhoDich} onChange={e => setForm(f => ({ ...f, MaKhoDich: e.target.value }))}>
                                    <option value="">-- Chọn kho nhận --</option>
                                    {subWarehouses.filter(k => String(k.MaKho) !== String(form.MaKhoNguon)).map(k => <option key={k.MaKho} value={k.MaKho}>{k.TenKho}</option>)}
                                </select>
                            </div>
                            <div className="st-form-group">
                                <label>Ghi chú</label>
                                <input type="text" placeholder="Ghi chú (tuỳ chọn)" value={form.GhiChu} onChange={e => setForm(f => ({ ...f, GhiChu: e.target.value }))} />
                            </div>

                            {form.MaKhoNguon && (
                                <div className="st-search-products">
                                    <h4><span className="material-icons">search</span> Thêm sản phẩm vào phiếu</h4>
                                    <div className="st-search-box">
                                        <span className="material-icons">search</span>
                                        <input type="text" placeholder="Nhập tên sách..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                                    </div>
                                    <div className="st-search-results">
                                        {searchedProducts.slice(0, 8).map(p => {
                                            const stock = sourceStock.find(s => s.MaSP === p.MaSP);
                                            const ton = stock?.SoLuongTon ?? 0;
                                            const added = form.items.find(i => i.MaSP === p.MaSP);
                                            return (
                                                <div key={p.MaSP} className={`st-product-row ${ton === 0 ? 'st-out-of-stock' : ''}`}>
                                                    <ProductThumb src={p.HinhAnh} name={p.TenSP} />
                                                    <div className="st-product-info">
                                                        <span className="st-product-name">{p.TenSP}</span>
                                                        <span className="st-product-stock">Tồn: <strong>{ton}</strong></span>
                                                    </div>
                                                    <button className={`st-btn-add ${added ? 'added' : ''}`} disabled={ton === 0 || !!added} onClick={() => addItem(p)}>
                                                        <span className="material-icons">{added ? 'check' : 'add'}</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="st-panel">
                            <div className="st-panel-header">
                                <h3>Danh sách sản phẩm trong phiếu</h3>
                                <span className="st-count-badge">{form.items.length} mặt hàng</span>
                            </div>
                            <div className="st-items-table-wrap">
                                <table className="st-items-table">
                                    <thead>
                                        <tr>
                                            <th>Sách</th>
                                            <th>Tồn</th>
                                            <th>SL chuyển</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.items.length > 0 ? form.items.map((item, idx) => (
                                            <tr key={`form-item-${item.MaSP}-${idx}`}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <ProductThumb src={item.HinhAnh} name={item.TenSP} />
                                                        <span>{item.TenSP}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">{item.TonNguon}</td>
                                                <td>
                                                    <input type="number" min="1" max={item.TonNguon} value={item.SoLuong} onChange={e => updateQty(item.MaSP, e.target.value)} className="st-qty-input" />
                                                </td>
                                                <td>
                                                    <button className="st-btn-icon-del" onClick={() => removeItem(item.MaSP)}><span className="material-icons">delete</span></button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" className="st-empty-row">Sổ chi tiết đang trống</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="st-form-actions">
                                <button className="st-btn-outline" onClick={() => setView('list')}>Hủy</button>
                                <button className="st-btn-primary" onClick={handleSubmit} disabled={submitting || !form.items.length}>
                                    {submitting ? 'Đang lưu...' : 'Tạo phiếu chuyển'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LIST VIEW */}
            {view === 'list' && (
                <div className="st-list">
                    <div className="st-filter-bar">
                        <div className="st-tabs">
                            {[['', 'Tất cả'], ['Cho_duyet', 'Chờ duyệt'], ['Da_nhan', 'Đã nhận'], ['Huy', 'Đã hủy']].map(([val, label]) => (
                                <button key={val} className={`st-tab ${filterStatus === val ? 'active' : ''}`} onClick={() => setFilterStatus(val)}>{label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="st-table-wrap">
                        {loading ? <div className="st-loading">Đang tải...</div> : (
                            <table className="st-table">
                                <thead>
                                    <tr>
                                        <th>Mã phiếu</th>
                                        <th>Kho chuyển</th>
                                        <th>Kho nhận</th>
                                        <th>Số mặt hàng</th>
                                        <th>Tổng SL</th>
                                        <th>Ngày lập</th>
                                        <th>Người lập</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                               <tbody>
                                    {transfers.map((t, idx) => (
                                        <tr key={`transfer-${t.MaPC}-${idx}`}>
                                            <td><strong>#{t.MaPC}</strong></td>
                                            <td>{t.TenKhoNguon}</td>
                                            <td>{t.TenKhoDich}</td>
                                            <td className="text-center">{t.SoLoaiSP}</td>
                                            <td className="text-center">{t.TongSL}</td>
                                            <td className="text-muted">{new Date(t.NgayChuyen).toLocaleDateString('vi-VN')}</td>
                                            <td>{t.TenNguoiChuyen}</td>
                                            <td><StatusBadge status={t.TrangThai} /></td>
                                            <td>
                                                <div className="st-actions">
                                                    <button className="st-btn-icon" onClick={() => openDetail(t.MaPC)}><span className="material-icons">visibility</span></button>
                                                    {t.TrangThai === 'Cho_duyet' && canApprove && (
                                                        <button className="st-btn-icon approve" onClick={() => doApprove(t.MaPC)}><span className="material-icons">check_circle</span></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                               </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {detailData && (
                <div className="st-overlay" onClick={() => setDetailData(null)}>
                    <div className="st-modal st-modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="st-modal-header">
                            <h2>Chi tiết phiếu chuyển kho #{detailData.MaPC}</h2>
                            <button className="st-btn-icon" onClick={() => setDetailData(null)}><span className="material-icons">close</span></button>
                        </div>
                        <div className="st-modal-body">
                            <div className="st-detail-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                                <div><label>Kho nguồn:</label> <strong>{detailData.TenKhoNguon}</strong></div>
                                <div><label>Kho đích:</label> <strong>{detailData.TenKhoDich}</strong></div>
                                <div><label>Trạng thái:</label> <StatusBadge status={detailData.TrangThai} /></div>
                                <div><label>Ngày chuyển:</label> <span>{new Date(detailData.NgayChuyen).toLocaleString('vi-VN')}</span></div>
                                <div><label>Người lập:</label> <span>{detailData.TenNguoiChuyen}</span></div>
                                {detailData.TrangThai === 'Da_nhan' && (
                                    <div><label>Ngày nhận:</label> <span>{new Date(detailData.NgayNhan).toLocaleString('vi-VN')}</span></div>
                                )}
                            </div>

                            <table className="st-items-table">
                                <thead>
                                    <tr>
                                        <th>Mã SP</th>
                                        <th>Tên sản phẩm</th>
                                        <th className="text-center">Số lượng chuyển</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailData.items.map((it, idx) => (
                                        <tr key={`detail-item-${it.MaSP}-${idx}`}>
                                            <td className="text-muted">#{it.MaSP}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <ProductThumb src={it.HinhAnh} name={it.TenSP} />
                                                    {it.TenSP}
                                                </div>
                                            </td>
                                            <td className="text-center"><strong>{it.SoLuong}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="st-modal-footer">
                            {detailData.TrangThai === 'Cho_duyet' && (
                                <button className="st-btn-danger" onClick={() => { setCancelTarget({ MaPC: detailData.MaPC }); setCancelReason(''); }}>Hủy phiếu</button>
                            )}
                            <button className="st-btn-outline" onClick={() => setDetailData(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CANCEL MODAL */}
            {cancelTarget && (
                <div className="st-overlay" onClick={() => setCancelTarget(null)}>
                    <div className="st-modal st-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="st-modal-header"><h2>Hủy phiếu #{cancelTarget.MaPC}</h2></div>
                        <div className="st-modal-body">
                            <textarea placeholder="Lý do hủy..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
                        </div>
                        <div className="st-modal-footer">
                            <button onClick={doCancel} className="st-btn-danger">Xác nhận hủy</button>
                            <button onClick={() => setCancelTarget(null)} className="st-btn-outline">Quay lại</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockTransfer;
