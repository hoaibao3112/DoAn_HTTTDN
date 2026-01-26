import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import '../styles/AccountManagement.css';
import { Button, Input, message, Table, Modal, Space, Select, Tabs, Form } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PermissionContext } from '../components/PermissionContext';

// `Search` unused; removed to avoid eslint no-unused-vars warning
const { Option } = Select;
const { confirm } = Modal;
const { TabPane } = Tabs;

const AccountManagement = () => {
  const { hasPermission } = useContext(PermissionContext);
  const [state, setState] = useState({
    accounts: [],
    newAccount: {
      TenTK: '',
      MatKhau: '',
      MaNQ: undefined,
      NgayTao: new Date().toISOString().split('T')[0],
      TinhTrang: '1',
    },
    editingAccount: null,
    searchTerm: '',
    isModalVisible: false,
    loading: false,
    error: null,
    quyenList: [],
    permissions: [], // Danh sách quyền của nhóm quyền hiện tại
    features: [], // Danh sách chức năng (cho việc thêm quyền)
    newPermission: { MaCN: undefined, HanhDong: [], TinhTrang: '1' }, // Form thêm quyền mới
  });

  const { accounts, newAccount, editingAccount, searchTerm, isModalVisible, loading, error, quyenList, permissions, features, newPermission } = state;

  const API_URL = 'http://localhost:5000/api/accounts';
  const PERMISSION_API = 'http://localhost:5000/api/permissions';

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const [accountsResp, rolesResp, featuresResp] = await Promise.all([
        axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/roles/list/active', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${PERMISSION_API}/features`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setState(prev => ({
        ...prev,
        accounts: accountsResp.data.map(account => {
          const tinhTrangValue = Number(account.TinhTrang);
          return {
            ...account,
            TinhTrang: tinhTrangValue === 1 ? 'Hoạt động' : 'Bị khóa',
            TinhTrangValue: tinhTrangValue,
          };
        }),
        quyenList: rolesResp.data.data || [],
        features: featuresResp.data || [],
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
      message.error(`Lỗi khi tải dữ liệu: ${error.response?.data?.error || error.message}`);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };


  useEffect(() => {
    if (hasPermission('Tài khoản', 'Đọc')) {
      fetchData();
    } else {
      message.error('Bạn không có quyền xem danh sách tài khoản!');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [hasPermission]);

  // Fetch quyền khi mở modal edit
  const fetchPermissions = async (maNQ) => {
    if (!maNQ) return;
    try {
      const token = localStorage.getItem('authToken');
      const resp = await axios.get(`${PERMISSION_API}/roles/${maNQ}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setState(prev => ({ ...prev, permissions: resp.data }));
    } catch (error) {
      message.error(`Lỗi khi tải quyền: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleInputChange = (field, value) => {
    const updatedValue = field === 'MaNQ' ? parseInt(value) : value;
    if (editingAccount) {
      setState(prev => ({
        ...prev,
        editingAccount: {
          ...prev.editingAccount,
          [field]: updatedValue,
          ...(field === 'TinhTrang' && { TinhTrangValue: parseInt(value) }),
        },
      }));
    } else {
      setState(prev => ({
        ...prev,
        newAccount: {
          ...prev.newAccount,
          [field]: updatedValue,
        },
      }));
    }
  };

  const validateAccountData = (accountData) => {
    if (!accountData.TenTK || !accountData.MatKhau || !accountData.MaNQ) {
      message.error('Vui lòng nhập đầy đủ thông tin bắt buộc (Tên TK, Mật khẩu, Quyền)!');
      return false;
    }
    return true;
  };

  const handleAddAccount = async () => {
    if (!hasPermission('Tài khoản', 'Thêm')) {
      message.error('Bạn không có quyền thêm tài khoản!');
      return;
    }
    if (!validateAccountData(newAccount)) return;

    const payload = {
      TenTK: newAccount.TenTK,
      MatKhau: newAccount.MatKhau,
      MaNQ: newAccount.MaNQ,
      NgayTao: newAccount.NgayTao,
      TinhTrang: parseInt(newAccount.TinhTrang),
    };
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setState(prev => ({
        ...prev,
        newAccount: {
          TenTK: '',
          MatKhau: '',
          MaQuyen: undefined,
          NgayTao: new Date().toISOString().split('T')[0],
          TinhTrang: '1',
        },
        isModalVisible: false,
      }));
      message.success('Thêm tài khoản thành công!');
    } catch (error) {
      message.error(`Lỗi khi thêm tài khoản: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleUpdateAccount = async () => {
    if (!hasPermission('Tài khoản', 'Sửa')) {
      message.error('Bạn không có quyền sửa tài khoản!');
      return;
    }
    if (!validateAccountData(editingAccount)) return;

    const payload = {
      TenTK: editingAccount.TenTK,
      MatKhau: editingAccount.MatKhau,
      MaNQ: editingAccount.MaNQ,
      TinhTrang: parseInt(editingAccount.TinhTrang),
    };
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${API_URL}/${editingAccount.MaTK}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setState(prev => ({
        ...prev,
        editingAccount: null,
        isModalVisible: false,
      }));
      message.success('Cập nhật tài khoản thành công!');
    } catch (error) {
      message.error(`Lỗi khi cập nhật tài khoản: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteAccount = (MaTK) => {
    if (!hasPermission('Tài khoản', 'Xóa')) {
      message.error('Bạn không có quyền xóa tài khoản!');
      return;
    }
    confirm({
      title: 'Bạn có chắc muốn xóa tài khoản này?',
      icon: <ExclamationCircleFilled />,
      content: 'Hành động này sẽ không thể hoàn tác',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Thoát',
      async onOk() {
        try {
          const token = localStorage.getItem('authToken');
          await axios.delete(`${API_URL}/${MaTK}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await fetchData();
          message.success('Xóa tài khoản thành công!');
        } catch (error) {
          message.error(`Lỗi khi xóa tài khoản: ${error.response?.data?.error || error.message}`);
        }
      },
    });
  };

  const handleToggleStatus = (account) => {
    if (!hasPermission('Tài khoản', 'Sửa')) {
      message.error('Bạn không có quyền thay đổi trạng thái tài khoản!');
      return;
    }
    confirm({
      title: `Bạn có muốn ${account.TinhTrang === 'Hoạt động' ? 'tạm ẩn' : 'kích hoạt'} tài khoản này?`,
      icon: <ExclamationCircleFilled />,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      async onOk() {
        try {
          const token = localStorage.getItem('authToken');
          const newStatus = account.TinhTrangValue === 1 ? 0 : 1;
          await axios.put(`${API_URL}/${account.MaTK}`, { TinhTrang: newStatus }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await fetchData();
          message.success(`Đã ${newStatus === 1 ? 'kích hoạt' : 'tạm ẩn'} tài khoản!`);
        } catch (error) {
          message.error(`Lỗi khi đổi trạng thái: ${error.response?.data?.error || error.message}`);
        }
      },
    });
  };

  // Thêm quyền mới cho nhóm quyền
  const handleAddPermission = async () => {
    if (!hasPermission('Phân quyền', 'Thêm')) {
      message.error('Bạn không có quyền thêm quyền!');
      return;
    }
    if (!newPermission.MaCN || !newPermission.HanhDong || newPermission.HanhDong.length === 0) {
      message.error('Vui lòng chọn chức năng và ít nhất một hành động!');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      // Gộp tất cả hành động được chọn vào 1 bản ghi duy nhất (hệ thống bit-flag)
      const payload = {
        MaNQ: editingAccount.MaNQ,
        MaCN: newPermission.MaCN,
        Xem: newPermission.HanhDong.includes('Xem') ? 1 : 0,
        Them: newPermission.HanhDong.includes('Thêm') ? 1 : 0,
        Sua: newPermission.HanhDong.includes('Sửa') ? 1 : 0,
        Xoa: newPermission.HanhDong.includes('Xóa') ? 1 : 0,
        XuatFile: newPermission.HanhDong.includes('Xuất File') ? 1 : 0,
        Duyet: newPermission.HanhDong.includes('Duyệt') ? 1 : 0
      };

      await axios.post(PERMISSION_API, payload, { headers: { Authorization: `Bearer ${token}` } });
      await fetchPermissions(editingAccount.MaNQ);
      setState(prev => ({ ...prev, newPermission: { MaCN: undefined, HanhDong: [], TinhTrang: '1' } }));
      message.success('Thêm quyền thành công!');
    } catch (error) {
      message.error(`Lỗi khi thêm quyền: ${error.response?.data?.error || error.message}`);
    }
  };

  // Xóa quyền
  const handleDeletePermission = (maCTQ) => {
    if (!hasPermission('Phân quyền', 'Xóa')) {
      message.error('Bạn không có quyền xóa quyền!');
      return;
    }
    confirm({
      title: 'Bạn có chắc muốn xóa quyền này?',
      icon: <ExclamationCircleFilled />,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          const token = localStorage.getItem('authToken');
          await axios.delete(`${PERMISSION_API}/${maCTQ}`, { headers: { Authorization: `Bearer ${token}` } });
          await fetchPermissions(editingAccount.MaNQ);
          message.success('Xóa quyền thành công!');
        } catch (error) {
          message.error(`Lỗi khi xóa quyền: ${error.response?.data?.error || error.message}`);
        }
      },
    });
  };

  // Sửa quyền - Để đầy đủ, thêm chức năng edit (sử dụng modal con hoặc inline, ở đây dùng state editingPermission)
  const [editingPermission, setEditingPermission] = useState(null);

  const handleEditPermission = (permission) => {
    if (!hasPermission('Phân quyền', 'Sửa')) {
      message.error('Bạn không có quyền sửa quyền!');
      return;
    }
    setEditingPermission(permission);
  };

  const handleUpdatePermission = async () => {
    if (!editingPermission) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${PERMISSION_API}/${editingPermission.MaCTQ}`, {
        MaNQ: editingAccount.MaNQ,
        MaCN: editingPermission.MaCN,
        Xem: editingPermission.Xem,
        Them: editingPermission.Them,
        Sua: editingPermission.Sua,
        Xoa: editingPermission.Xoa,
        XuatFile: editingPermission.XuatFile,
        Duyet: editingPermission.Duyet
      }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchPermissions(editingAccount.MaNQ);
      setEditingPermission(null);
      message.success('Cập nhật quyền thành công!');
    } catch (error) {
      message.error(`Lỗi khi cập nhật quyền: ${error.response?.data?.error || error.message}`);
    }
  };

  const handlePermissionInputChange = (field, value) => {
    setEditingPermission(prev => ({ ...prev, [field]: value ? 1 : 0 }));
  };

  const filteredAccounts = accounts.filter(
    account =>
      searchTerm === '' || account.TinhTrang === searchTerm
  );

  const columns = [
    { title: 'Mã TK', dataIndex: 'MaTK', key: 'MaTK', width: 100, fixed: 'left' },
    { title: 'Tên tài khoản', dataIndex: 'TenTK', key: 'TenTK', width: 200 },
    {
      title: 'Quyền',
      dataIndex: 'MaNQ',
      key: 'MaNQ',
      width: 120,
      render: (value) => quyenList.find(q => q.MaNQ === value)?.TenNQ || 'Chưa xác định',
    },
    { title: 'Ngày tạo', dataIndex: 'NgayTao', key: 'NgayTao', width: 200 },
    {
      title: 'Trạng thái',
      dataIndex: 'TinhTrang',
      key: 'TinhTrang',
      width: 120,
      render: (status) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {hasPermission('Tài khoản', 'Sửa') && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setState(prev => ({
                  ...prev,
                  editingAccount: { ...record, TinhTrang: record.TinhTrangValue.toString() },
                  isModalVisible: true,
                }));
                fetchPermissions(record.MaNQ);
              }}
            />
          )}
          {hasPermission('Tài khoản', 'Sửa') && (
            <Button
              size="small"
              icon={record.TinhTrang === 'Hoạt động' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          )}
          {hasPermission('Tài khoản', 'Xóa') && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteAccount(record.MaTK)}
            />
          )}
        </Space>
      ),
      fixed: 'right',
      width: 200,
    },
  ];

  const permissionColumns = [
    { title: 'Mã CTQ', dataIndex: 'MaCTQ', key: 'MaCTQ' },
    { title: 'Chức năng', dataIndex: 'TenCN', key: 'TenCN' },
    {
      title: 'Hành động',
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record) => {
        const labels = [];
        if (record.Xem) labels.push(<span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded mr-1">Xem</span>);
        if (record.Them) labels.push(<span className="px-2 py-0.5 bg-green-100 text-green-800 rounded mr-1">Thêm</span>);
        if (record.Sua) labels.push(<span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded mr-1">Sửa</span>);
        if (record.Xoa) labels.push(<span className="px-2 py-0.5 bg-red-100 text-red-800 rounded mr-1">Xóa</span>);
        if (record.XuatFile) labels.push(<span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded mr-1">Xuất</span>);
        if (record.Duyet) labels.push(<span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded mr-1">Duyệt</span>);
        return labels.length > 0 ? <Space wrap>{labels}</Space> : <span className="text-gray-400 italic">Không có quyền</span>;
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Hoạt động
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {hasPermission('Phân quyền', 'Sửa') && (
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEditPermission(record)} />
          )}
          {hasPermission('Phân quyền', 'Xóa') && (
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeletePermission(record.MaCTQ)} />
          )}
        </Space>
      ),
    },
  ];

  if (!hasPermission('Tài khoản', 'Đọc')) {
    return <div>Bạn không có quyền truy cập trang này!</div>;
  }

  return (
    <div className="account-management-page">
      <div className="account-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>
          <i className="fas fa-users"></i> Quản lý Tài khoản
        </h1>
        {hasPermission('Tài khoản', 'Thêm') && (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setState(prev => ({
                ...prev,
                editingAccount: null,
                newAccount: {
                  TenTK: '',
                  MatKhau: '',
                  MaNQ: undefined,
                  NgayTao: new Date().toISOString().split('T')[0],
                  TinhTrang: '1',
                },
                isModalVisible: true,
              }));
            }}
          >
            Thêm tài khoản
          </Button>
        )}
      </div>

      <div className="account-content">
        <div className="account-filters">
          <div className="filter-group">
            <label>Trạng thái:</label>
            <Select
              value={searchTerm}
              onChange={(value) => setState(prev => ({ ...prev, searchTerm: value }))}
              style={{ width: 250 }}
              placeholder="Tìm tài khoản..."
            >
              <Select.Option value="">Tất cả</Select.Option>
              <Select.Option value="Hoạt động">Hoạt động</Select.Option>
              <Select.Option value="Bị khóa">Bị khóa</Select.Option>
            </Select>
          </div>
        </div>

        <div className="account-table">
          <Table
            columns={columns}
            dataSource={filteredAccounts}
            rowKey="MaTK"
            loading={loading}
            scroll={{ x: 1000 }}
            pagination={false}
          />
        </div>
      </div>

      <Modal
        title={editingAccount ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
        open={isModalVisible}
        onCancel={() => setState(prev => ({ ...prev, isModalVisible: false, editingAccount: null, permissions: [] }))}
        footer={null}
        width={900}
        styles={{ body: { padding: '16px' } }}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'Thông tin tài khoản',
              children: (
                <>
                  <div className="info-section">
                    <div className="info-grid">
                      {editingAccount && (
                        <div className="info-item">
                          <p className="info-label">Mã tài khoản:</p>
                          <Input size="small" value={editingAccount.MaTK} disabled />
                        </div>
                      )}
                      <div className="info-item">
                        <p className="info-label">Tên tài khoản <span style={{ color: 'red' }}>*</span></p>
                        <Input
                          size="small"
                          value={editingAccount ? editingAccount.TenTK : newAccount.TenTK}
                          onChange={(e) => handleInputChange('TenTK', e.target.value)}
                          required
                        />
                      </div>
                      <div className="info-item">
                        <p className="info-label">Mật khẩu <span style={{ color: 'red' }}>*</span></p>
                        <Input.Password
                          size="small"
                          value={editingAccount ? editingAccount.MatKhau : newAccount.MatKhau}
                          onChange={(e) => handleInputChange('MatKhau', e.target.value)}
                          required
                        />
                      </div>
                      <div className="info-item">
                        <p className="info-label">Quyền <span style={{ color: 'red' }}>*</span></p>
                        <Select
                          size="small"
                          value={editingAccount ? editingAccount.MaNQ : newAccount.MaNQ}
                          onChange={(value) => handleInputChange('MaNQ', value)}
                          style={{ width: '100%' }}
                        >
                          {quyenList.map(quyen => (
                            <Option key={quyen.MaNQ} value={quyen.MaNQ}>
                              {quyen.TenNQ}
                            </Option>
                          ))}
                        </Select>
                      </div>
                      <div className="info-item">
                        <p className="info-label">Ngày tạo:</p>
                        <Input
                          size="small"
                          type="date"
                          value={editingAccount ? editingAccount.NgayTao : newAccount.NgayTao}
                          onChange={(e) => handleInputChange('NgayTao', e.target.value)}
                        />
                      </div>
                      <div className="info-item">
                        <p className="info-label">Trạng thái <span style={{ color: 'red' }}>*</span></p>
                        <Select
                          size="small"
                          value={editingAccount ? editingAccount.TinhTrang : newAccount.TinhTrang}
                          onChange={(value) => handleInputChange('TinhTrang', value)}
                          style={{ width: '100%' }}
                        >
                          <Option value="1">Hoạt động</Option>
                          <Option value="0">Bị khóa</Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button type="primary" onClick={editingAccount ? handleUpdateAccount : handleAddAccount} style={{ marginTop: 16 }}>
                    {editingAccount ? 'Lưu' : 'Thêm'}
                  </Button>
                </>
              ),
            },
            editingAccount ? {
              key: '2',
              label: 'Quyền của nhóm',
              children: (
                <>
                  <h3>Quyền của nhóm {quyenList.find(q => q.MaNQ === editingAccount?.MaNQ)?.TenNQ} Admin</h3>
                  {hasPermission('Phân quyền', 'Thêm') && (
                    <div style={{ marginBottom: 12 }}>
                      <h4>Thêm quyền mới</h4>
                      <Form layout="inline">
                        <Form.Item label="Chức năng">
                          <Select
                            value={newPermission.MaCN}
                            onChange={(v) => setState(prev => ({ ...prev, newPermission: { ...prev.newPermission, MaCN: v } }))}
                            style={{ width: 200 }}
                          >
                            {features.map(f => <Option key={f.MaCN} value={f.MaCN}>{f.TenCN}</Option>)}
                          </Select>
                        </Form.Item>
                        <Form.Item label="Hành động">
                          <Select
                            mode="multiple"
                            placeholder="Chọn hành động (Xem, Thêm, Sửa, Xóa)"
                            value={newPermission.HanhDong}
                            onChange={(v) => setState(prev => ({ ...prev, newPermission: { ...prev.newPermission, HanhDong: v } }))}
                            style={{ minWidth: 220 }}
                          >
                            <Option value="Xem">Xem</Option>
                            <Option value="Thêm">Thêm</Option>
                            <Option value="Sửa">Sửa</Option>
                            <Option value="Xóa">Xóa</Option>
                            <Option value="Xuất File">Xuất File</Option>
                            <Option value="Duyệt">Duyệt</Option>
                          </Select>
                        </Form.Item>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPermission}>
                          Thêm
                        </Button>
                      </Form>
                    </div>
                  )}
                  <Table
                    columns={permissionColumns}
                    dataSource={permissions}
                    rowKey="MaCTQ"
                    pagination={false}
                    size="small"
                  />
                </>
              ),
            } : null,
          ].filter(Boolean)}
        />
      </Modal>

      {/* Modal sửa quyền (nếu muốn dùng modal riêng) */}
      <Modal
        title={`Sửa quyền: ${editingPermission?.TenCN}`}
        open={!!editingPermission}
        onCancel={() => setEditingPermission(null)}
        onOk={handleUpdatePermission}
        width={500}
        styles={{ body: { padding: '24px' } }}
      >
        {editingPermission && (
          <Form layout="vertical">
            <Form.Item label="Chức năng:">
              <Input value={editingPermission.TenCN} disabled />
            </Form.Item>

            <Form.Item label="Cấu hình hành động:">
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <Form.Item label="Xem" style={{ marginBottom: 0 }}>
                  <Select
                    value={editingPermission.Xem}
                    onChange={(v) => handlePermissionInputChange('Xem', v)}
                    options={[{ label: 'Bật', value: 1 }, { label: 'Tắt', value: 0 }]}
                  />
                </Form.Item>
                <Form.Item label="Thêm" style={{ marginBottom: 0 }}>
                  <Select
                    value={editingPermission.Them}
                    onChange={(v) => handlePermissionInputChange('Them', v)}
                    options={[{ label: 'Bật', value: 1 }, { label: 'Tắt', value: 0 }]}
                  />
                </Form.Item>
                <Form.Item label="Sửa" style={{ marginBottom: 0 }}>
                  <Select
                    value={editingPermission.Sua}
                    onChange={(v) => handlePermissionInputChange('Sua', v)}
                    options={[{ label: 'Bật', value: 1 }, { label: 'Tắt', value: 0 }]}
                  />
                </Form.Item>
                <Form.Item label="Xóa" style={{ marginBottom: 0 }}>
                  <Select
                    value={editingPermission.Xoa}
                    onChange={(v) => handlePermissionInputChange('Xoa', v)}
                    options={[{ label: 'Bật', value: 1 }, { label: 'Tắt', value: 0 }]}
                  />
                </Form.Item>
                <Form.Item label="Xuất File" style={{ marginBottom: 0 }}>
                  <Select
                    value={editingPermission.XuatFile}
                    onChange={(v) => handlePermissionInputChange('XuatFile', v)}
                    options={[{ label: 'Bật', value: 1 }, { label: 'Tắt', value: 0 }]}
                  />
                </Form.Item>
                <Form.Item label="Duyệt" style={{ marginBottom: 0 }}>
                  <Select
                    value={editingPermission.Duyet}
                    onChange={(v) => handlePermissionInputChange('Duyet', v)}
                    options={[{ label: 'Bật', value: 1 }, { label: 'Tắt', value: 0 }]}
                  />
                </Form.Item>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default AccountManagement;