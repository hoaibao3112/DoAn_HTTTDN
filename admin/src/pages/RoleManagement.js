import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, message, Table, Modal, Space, Form, Tag, Checkbox, Card } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';

const { Search } = Input;
const { confirm } = Modal;

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [newRole, setNewRole] = useState({
    TenNQ: '',
    MoTa: '',
    TinhTrang: 1,
    permissions: [],
  });
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const API_URL = 'http://localhost:5000/api/roles';

  // Fetch roles
  const fetchRoles = async (page = 1, pageSize = 10, search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        params: { page, pageSize, search },
      });
      if (response.data.success) {
        setRoles(response.data.data.items);
        setPagination({
          current: response.data.data.pagination.page,
          pageSize: response.data.data.pagination.pageSize,
          total: response.data.data.pagination.total,
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhóm quyền:', error);
      message.error('Lỗi khi tải danh sách nhóm quyền');
    } finally {
      setLoading(false);
    }
  };

  // Fetch functions (chucnang)
  const fetchFunctions = async () => {
    try {
      const response = await axios.get(`${API_URL}/functions`);
      if (Array.isArray(response.data)) {
        setFunctions(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chức năng:', error);
      message.error('Lỗi khi tải danh sách chức năng');
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchFunctions();
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchRoles(1, pagination.pageSize, value);
  };

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    fetchRoles(newPagination.current, newPagination.pageSize, searchTerm);
  };

  // Toggle permission for a feature
  const togglePermission = (featureId, action, isEditing = false) => {
    const updatePermissions = (prevPermissions) => {
      const existingIndex = prevPermissions.findIndex(p => p.MaCN === featureId);

      if (existingIndex >= 0) {
        // Feature exists, toggle the action
        const updated = [...prevPermissions];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [action]: updated[existingIndex][action] ? 0 : 1
        };
        return updated;
      } else {
        // Feature doesn't exist, add it with this action enabled
        return [
          ...prevPermissions,
          {
            MaCN: featureId,
            Xem: action === 'Xem' ? 1 : 0,
            Them: action === 'Them' ? 1 : 0,
            Sua: action === 'Sua' ? 1 : 0,
            Xoa: action === 'Xoa' ? 1 : 0,
            XuatFile: action === 'XuatFile' ? 1 : 0,
            Duyet: action === 'Duyet' ? 1 : 0,
          }
        ];
      }
    };

    if (isEditing) {
      setEditingRole(prev => ({
        ...prev,
        permissions: updatePermissions(prev.permissions)
      }));
    } else {
      setNewRole(prev => ({
        ...prev,
        permissions: updatePermissions(prev.permissions)
      }));
    }
  };

  // Check if permission is enabled
  const hasPermission = (featureId, action, isEditing = false) => {
    const permissions = isEditing ? editingRole?.permissions : newRole.permissions;
    const perm = permissions?.find(p => p.MaCN === featureId);
    return perm?.[action] === 1;
  };

  // Handle add role
  const handleAddRole = async () => {
    if (!newRole.TenNQ) {
      message.error('Vui lòng nhập tên nhóm quyền!');
      return;
    }

    try {
      const roleToAdd = {
        TenNQ: newRole.TenNQ.trim(),
        MoTa: newRole.MoTa.trim(),
        permissions: newRole.permissions,
      };

      const response = await axios.post(`${API_URL}/save`, roleToAdd);
      if (response.data.success) {
        await fetchRoles(pagination.current, pagination.pageSize, searchTerm);
        setNewRole({
          TenNQ: '',
          MoTa: '',
          TinhTrang: 1,
          permissions: [],
        });
        setIsModalVisible(false);
        message.success('Thêm nhóm quyền thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi thêm nhóm quyền:', error.response || error);
      message.error(error.response?.data?.message || 'Lỗi khi thêm nhóm quyền!');
    }
  };

  // Handle update role
  const handleUpdateRole = async () => {
    if (!editingRole.TenNQ) {
      message.error('Vui lòng nhập tên nhóm quyền!');
      return;
    }

    try {
      const roleToUpdate = {
        MaNQ: editingRole.MaNQ,
        TenNQ: editingRole.TenNQ.trim(),
        MoTa: editingRole.MoTa.trim(),
        permissions: editingRole.permissions,
      };

      const response = await axios.post(`${API_URL}/save`, roleToUpdate);
      if (response.data.success) {
        await fetchRoles(pagination.current, pagination.pageSize, searchTerm);
        setEditingRole(null);
        setIsModalVisible(false);
        message.success('Cập nhật nhóm quyền thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật nhóm quyền:', error.response || error);
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật nhóm quyền!');
    }
  };

  // Handle delete role
  const handleDeleteRole = (MaNQ) => {
    confirm({
      title: 'Bạn có chắc muốn xóa nhóm quyền này?',
      icon: <ExclamationCircleFilled />,
      content: 'Hành động này sẽ không thể hoàn tác',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Thoát',
      async onOk() {
        try {
          const response = await axios.delete(`${API_URL}/${MaNQ}`);
          if (response.data.success) {
            await fetchRoles(pagination.current, pagination.pageSize, searchTerm);
            message.success('Xóa nhóm quyền thành công!');
          }
        } catch (error) {
          console.error('Lỗi khi xóa nhóm quyền:', error.response || error);
          message.error(error.response?.data?.message || 'Xóa nhóm quyền thất bại!');
        }
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Mã nhóm quyền',
      dataIndex: 'MaNQ',
      key: 'MaNQ',
      width: 120,
    },
    {
      title: 'Tên nhóm quyền',
      dataIndex: 'TenNQ',
      key: 'TenNQ',
      width: 200,
    },
    {
      title: 'Mô tả',
      dataIndex: 'MoTa',
      key: 'MoTa',
      width: 300,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'TinhTrang',
      key: 'TinhTrang',
      width: 120,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={async () => {
              try {
                const response = await axios.get(`${API_URL}/${record.MaNQ}/permissions`);
                setEditingRole({
                  MaNQ: record.MaNQ,
                  TenNQ: record.TenNQ,
                  MoTa: record.MoTa,
                  TinhTrang: record.TinhTrang,
                  permissions: response.data || [],
                });
                setIsModalVisible(true);
              } catch (error) {
                message.error('Lỗi khi tải thông tin nhóm quyền!');
              }
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRole(record.MaNQ)}
          />
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <div className="thongke-page">
      <div className="thongke-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>
          <i className="fas fa-users"></i> Quản lý Nhóm Quyền
        </h1>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setEditingRole(null);
            setNewRole({
              TenNQ: '',
              MoTa: '',
              TinhTrang: 1,
              permissions: [],
            });
            setIsModalVisible(true);
          }}
        >
          Thêm nhóm quyền
        </Button>
      </div>

      <div className="thongke-content">
        <div className="thongke-filters">
          <div className="filter-group">
            <label>Tìm kiếm:</label>
            <Input
              placeholder="Tìm nhóm quyền..."
              allowClear
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={() => handleSearch(searchTerm)}
              style={{ width: 250 }}
            />
          </div>
        </div>

        <div className="thongke-table">
          <Table
            columns={columns}
            dataSource={roles}
            rowKey="MaNQ"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            size="small"
            locale={{
              emptyText: 'Không tìm thấy nhóm quyền',
            }}
          />
        </div>
      </div>

      {/* Add/Edit Role Modal */}
      <Modal
        title={editingRole ? 'Chỉnh sửa nhóm quyền' : 'Thêm nhóm quyền mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRole(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalVisible(false);
              setEditingRole(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={editingRole ? handleUpdateRole : handleAddRole}
          >
            {editingRole ? 'Lưu' : 'Thêm'}
          </Button>,
        ]}
        width={900}
        styles={{ body: { padding: '16px', maxHeight: '70vh', overflow: 'auto' } }}
      >
        <Form layout="vertical">
          <Form.Item label="Tên nhóm quyền" required>
            <Input
              size="small"
              value={editingRole ? editingRole.TenNQ : newRole.TenNQ}
              onChange={(e) =>
                editingRole
                  ? setEditingRole({ ...editingRole, TenNQ: e.target.value })
                  : setNewRole({ ...newRole, TenNQ: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item label="Mô tả">
            <Input.TextArea
              size="small"
              rows={3}
              value={editingRole ? editingRole.MoTa : newRole.MoTa}
              onChange={(e) =>
                editingRole
                  ? setEditingRole({ ...editingRole, MoTa: e.target.value })
                  : setNewRole({ ...newRole, MoTa: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item label="Phân quyền chi tiết">
            <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '12px' }}>
              {functions.map((func) => (
                <Card
                  key={func.MaCN}
                  size="small"
                  title={func.TenCN}
                  style={{ marginBottom: '12px' }}
                >
                  <Space wrap>
                    <Checkbox
                      checked={hasPermission(func.MaCN, 'Xem', !!editingRole)}
                      onChange={() => togglePermission(func.MaCN, 'Xem', !!editingRole)}
                    >
                      Xem
                    </Checkbox>
                    <Checkbox
                      checked={hasPermission(func.MaCN, 'Them', !!editingRole)}
                      onChange={() => togglePermission(func.MaCN, 'Them', !!editingRole)}
                    >
                      Thêm
                    </Checkbox>
                    <Checkbox
                      checked={hasPermission(func.MaCN, 'Sua', !!editingRole)}
                      onChange={() => togglePermission(func.MaCN, 'Sua', !!editingRole)}
                    >
                      Sửa
                    </Checkbox>
                    <Checkbox
                      checked={hasPermission(func.MaCN, 'Xoa', !!editingRole)}
                      onChange={() => togglePermission(func.MaCN, 'Xoa', !!editingRole)}
                    >
                      Xóa
                    </Checkbox>
                    <Checkbox
                      checked={hasPermission(func.MaCN, 'XuatFile', !!editingRole)}
                      onChange={() => togglePermission(func.MaCN, 'XuatFile', !!editingRole)}
                    >
                      Xuất file
                    </Checkbox>
                    <Checkbox
                      checked={hasPermission(func.MaCN, 'Duyet', !!editingRole)}
                      onChange={() => togglePermission(func.MaCN, 'Duyet', !!editingRole)}
                    >
                      Duyệt
                    </Checkbox>
                  </Space>
                </Card>
              ))}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement;