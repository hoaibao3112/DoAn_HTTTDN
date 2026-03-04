import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/BranchManagement.css';

const BranchManagement = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [storeId, setStoreId] = useState(null);

    const [formData, setFormData] = useState({
        TenCH: '',
        DiaChi: '',
        SDT: '',
        Email: '',
        TrangThai: 1,
        NgayMo: ''
    });

    useEffect(() => {
        fetchStore();
    }, []);

    const fetchStore = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/branches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success && response.data.data.length > 0) {
                const store = response.data.data[0];
                setStoreId(store.MaCH);
                setFormData({
                    TenCH: store.TenCH || '',
                    DiaChi: store.DiaChi || '',
                    SDT: store.SDT || '',
                    Email: store.Email || '',
                    TrangThai: store.TrangThai ?? 1,
                    NgayMo: store.NgayMo ? store.NgayMo.split('T')[0] : ''
                });
            }
        } catch (error) {
            console.error('Error fetching store:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.TenCH) {
            alert('Tên cửa hàng là bắt buộc');
            return;
        }
        try {
            setSaving(true);
            const token = localStorage.getItem('authToken');
            await axios.put(
                `http://localhost:5000/api/branches/${storeId}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Cập nhật thông tin thành công!');
            setEditing(false);
        } catch (error) {
            console.error('Error saving store:', error);
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        fetchStore();
    };

    if (!hasPermissionById(FEATURES.CATEGORIES, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
            </div>
        );
    }

    return (
        <div className="branch-management-page">
            <div className="page-header">
                <div>
                    <h1>Thông tin Cửa Hàng</h1>
                    <p className="page-subtitle">Xem và cập nhật thông tin cửa hàng</p>
                </div>
                {!editing && (
                    <button className="btn-create" onClick={() => setEditing(true)}>
                        <span className="material-icons">edit</span>
                        Chỉnh sửa
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
                    <span className="material-icons" style={{ fontSize: 40 }}>hourglass_empty</span>
                    <p>Đang tải...</p>
                </div>
            ) : (
                <div className="form-modal" style={{ position: 'static', boxShadow: 'none', maxWidth: 600, margin: '24px auto' }}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Tên cửa hàng *</label>
                            <input
                                type="text"
                                value={formData.TenCH}
                                onChange={(e) => setFormData({ ...formData, TenCH: e.target.value })}
                                disabled={!editing}
                                placeholder="VD: Nhà sách ABC"
                            />
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <textarea
                                value={formData.DiaChi}
                                onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                                disabled={!editing}
                                placeholder="Nhập địa chỉ chi tiết"
                                rows="2"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={formData.SDT}
                                    onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                                    disabled={!editing}
                                    placeholder="0123456789"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.Email}
                                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                    disabled={!editing}
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select
                                    value={formData.TrangThai}
                                    onChange={(e) => setFormData({ ...formData, TrangThai: parseInt(e.target.value) })}
                                    disabled={!editing}
                                >
                                    <option value="1">Hoạt động</option>
                                    <option value="0">Đóng cửa</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ngày mở cửa</label>
                                <input
                                    type="date"
                                    value={formData.NgayMo}
                                    onChange={(e) => setFormData({ ...formData, NgayMo: e.target.value })}
                                    disabled={!editing}
                                />
                            </div>
                        </div>
                    </div>

                    {editing && (
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleCancel} disabled={saving}>
                                Hủy
                            </button>
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                <span className="material-icons">save</span>
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BranchManagement;

