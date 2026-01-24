import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/BranchManagement.css';

const BranchManagement = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        TenCH: '',
        DiaChi: '',
        SDT: '',
        Email: '',
        TrangThai: 1,
        NgayMo: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/branches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setBranches(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingBranch(null);
        setFormData({
            TenCH: '',
            DiaChi: '',
            SDT: '',
            Email: '',
            TrangThai: 1,
            NgayMo: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setFormData({
            TenCH: branch.TenCH || '',
            DiaChi: branch.DiaChi || '',
            SDT: branch.SDT || '',
            Email: branch.Email || '',
            TrangThai: branch.TrangThai || 1,
            NgayMo: branch.NgayMo || new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('authToken');

            if (editingBranch) {
                await axios.put(
                    `http://localhost:5000/api/branches/${editingBranch.MaCH}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('Cập nhật chi nhánh thành công!');
            } else {
                await axios.post(
                    'http://localhost:5000/api/branches',
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert('Tạo chi nhánh mới thành công!');
            }

            setShowModal(false);
            fetchBranches();
        } catch (error) {
            console.error('Error saving branch:', error);
            alert('Lỗi lưu chi nhánh: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (branchId) => {
        if (!window.confirm('Bạn có chắc muốn xóa chi nhánh này?')) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:5000/api/branches/${branchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Xóa chi nhánh thành công!');
            fetchBranches();
        } catch (error) {
            console.error('Error deleting branch:', error);
            alert('Lỗi xóa chi nhánh: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredBranches = branches.filter(b =>
        b.TenCH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.DiaChi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: branches.length,
        active: branches.filter(b => b.TrangThai === 1).length,
        inactive: branches.filter(b => b.TrangThai === 0).length
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
                    <h1>Quản lý Chi Nhánh / Cửa Hàng</h1>
                    <p className="page-subtitle">Quản lý thông tin các chi nhánh trong hệ thống</p>
                </div>
                <button className="btn-create" onClick={handleCreate}>
                    <span className="material-icons">add</span>
                    Thêm chi nhánh mới
                </button>
            </div>

            <div className="stats-cards">
                <div className="stat-card blue">
                    <span className="material-icons">store</span>
                    <div>
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Tổng chi nhánh</div>
                    </div>
                </div>

                <div className="stat-card green">
                    <span className="material-icons">check_circle</span>
                    <div>
                        <div className="stat-value">{stats.active}</div>
                        <div className="stat-label">Đang hoạt động</div>
                    </div>
                </div>

                <div className="stat-card red">
                    <span className="material-icons">cancel</span>
                    <div>
                        <div className="stat-value">{stats.inactive}</div>
                        <div className="stat-label">Đóng cửa</div>
                    </div>
                </div>
            </div>

            <div className="search-section">
                <div className="search-box">
                    <span className="material-icons">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-section">
                <table className="branches-table">
                    <thead>
                        <tr>
                            <th>MÃ CH</th>
                            <th>TÊN CỬA HÀNG</th>
                            <th>ĐỊA CHỈ</th>
                            <th>SĐT</th>
                            <th>EMAIL</th>
                            <th>TRẠNG THÁI</th>
                            <th>NGÀY MỞ</th>
                            <th>HÀNH ĐỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" className="loading-cell">Đang tải...</td></tr>
                        ) : filteredBranches.length > 0 ? (
                            filteredBranches.map(branch => (
                                <tr key={branch.MaCH}>
                                    <td className="code-cell">{branch.MaCH}</td>
                                    <td className="name-cell">{branch.TenCH}</td>
                                    <td>{branch.DiaChi}</td>
                                    <td>{branch.SDT}</td>
                                    <td>{branch.Email}</td>
                                    <td>
                                        <span className={`status-badge ${branch.TrangThai === 1 ? 'status-active' : 'status-inactive'}`}>
                                            {branch.TrangThai === 1 ? 'Hoạt động' : 'Đóng cửa'}
                                        </span>
                                    </td>
                                    <td>{new Date(branch.NgayMo).toLocaleDateString('vi-VN')}</td>
                                    <td className="actions-cell">
                                        <button className="btn-edit" onClick={() => handleEdit(branch)}>
                                            <span className="material-icons">edit</span>
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(branch.MaCH)}>
                                            <span className="material-icons">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="8" className="empty-cell">Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingBranch ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên cửa hàng *</label>
                                <input
                                    type="text"
                                    value={formData.TenCH}
                                    onChange={(e) => setFormData({ ...formData, TenCH: e.target.value })}
                                    placeholder="VD: Chi nhánh Quận 1"
                                />
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ *</label>
                                <textarea
                                    value={formData.DiaChi}
                                    onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                                    placeholder="Nhập địa chỉ chi tiết"
                                    rows="2"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        value={formData.SDT}
                                        onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                                        placeholder="0123456789"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.Email}
                                        onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select value={formData.TrangThai} onChange={(e) => setFormData({ ...formData, TrangThai: parseInt(e.target.value) })}>
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
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Hủy
                            </button>
                            <button className="btn-save" onClick={handleSubmit}>
                                <span className="material-icons">save</span>
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
