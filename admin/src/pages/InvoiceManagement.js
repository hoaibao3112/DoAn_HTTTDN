import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/InvoiceManagement.css';
import { Modal, Button, Select, message, Table, Tag, Space, Input, Divider } from 'antd';
import { ExclamationCircleFilled, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { Search } = Input;

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGNEY0RjQiLz48cGF0aCBkPSJNMjAgMTRDMjMuMzEzNyAxNCAyNiAxNi42ODYzIDI2IDIwQzI2IDIzLjMxMzcgMjMuMzEzNyAyNiAyMCAyNkMxNi42ODYzIDI2IDE0IDIzLjMxMzcgMTQgMjBDMTQgMTYuNjg2MyAxNi42ODYzIDE0IDIwIDE0WiIgZmlsbD0iI0NDQ0NDQyIvPjwvc3ZnPg==';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const orderStatuses = [
    { value: 'Hoan_thanh', label: 'Hoàn thành', color: 'green' },
    { value: 'Da_huy', label: 'Đã hủy', color: 'red' }
  ];

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/orders/hoadon');
      setInvoices(res.data.success ? res.data.data : []);
    } catch (error) {
      console.error('❌ Fetch invoices error:', error);
      message.error('Lỗi khi tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/hoadon/${id}`);
      const invoiceData = res.data.success ? res.data.data : null;
      if (!invoiceData) return message.error('Không tìm thấy dữ liệu hóa đơn');

      setSelectedInvoice({
        ...invoiceData,
        items: (invoiceData.ChiTiet || []).map(item => ({
          ...item,
          productId: item.MaSP,
          productName: item.TenSP,
          unitPrice: item.DonGia,
          quantity: item.SoLuong,
          productImage: item.HinhAnh ? item.HinhAnh : PLACEHOLDER_IMAGE,
        })),
        status: invoiceData.TrangThai,
      });
      setIsModalVisible(true);
    } catch (error) {
      console.error('❌ View invoice error:', error);
      message.error('Lỗi khi tải chi tiết hóa đơn');
    }
  };

  const onStatusSelect = async (id, newStatus, prevStatus) => {
    try {
      if (newStatus === 'Da_huy' && prevStatus !== 'Da_huy') {
        return handleCancelInvoice(id);
      }
      await handleStatusChange(id, newStatus);
    } catch (error) {
      console.error('❌ onStatusSelect error:', error);
    }
  };

  const handleStatusChange = async (id, newStatus, ghichu = null, force = false) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`http://localhost:5000/api/orders/hoadon/${id}/trangthai`, {
        trangthai: newStatus,
        ghichu: ghichu,
        force: force
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Cập nhật trạng thái thành công');
      fetchInvoices();
    } catch (error) {
      console.error('❌ Status change error:', error);
      message.error(error.response?.data?.error || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleCancelInvoice = (id) => {
    confirm({
      title: 'Bạn có chắc muốn hủy hóa đơn này?',
      icon: <ExclamationCircleFilled />,
      content: 'Hành động này sẽ không thể hoàn tác',
      okText: 'Hủy đơn',
      okType: 'danger',
      cancelText: 'Thoát',
      async onOk() {
        try {
          const token = localStorage.getItem('authToken');
          await axios.put(`http://localhost:5000/api/orders/hoadon/${id}/huy`, {
            lyDo: 'Hủy bởi quản trị viên'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('Hủy hóa đơn thành công');
          fetchInvoices();
        } catch (error) {
          console.error('❌ Cancel invoice error:', error);
          message.error('Hủy hóa đơn thất bại');
        }
      },
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.MaHD?.toString().includes(searchTerm) ||
    invoice.TenKH?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.SDTKH?.includes(searchTerm)
  );

  const columns = [
    { title: 'Mã HĐ', dataIndex: 'MaHD', key: 'MaHD', width: 100, fixed: 'left' },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div className="customer-cell">
          <div className="font-medium truncate">{record.TenKH || 'Khách lẻ'}</div>
          <div className="text-gray-500 text-xs">{record.SDTKH}</div>
        </div>
      ),
      width: 180,
    },
    { title: 'Ngày lập', dataIndex: 'NgayBan', key: 'NgayBan', render: (date) => formatDate(date), width: 150 },
    { title: 'Tổng tiền', dataIndex: 'TongTien', key: 'TongTien', render: (amount) => <div className="text-right font-bold">{formatCurrency(amount)}</div>, width: 150 },
    {
      title: 'Trạng thái',
      dataIndex: 'TrangThai',
      key: 'TrangThai',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={(value) => onStatusSelect(record.MaHD, value, status)}
          size="small"
        >
          {orderStatuses.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              <Tag color={item.color}>{item.label}</Tag>
            </Select.Option>
          ))}
        </Select>
      ),
      width: 160,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewInvoice(record.MaHD)} title="Xem chi tiết" />
          {record.TrangThai !== 'Da_huy' && (
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleCancelInvoice(record.MaHD)} title="Hủy đơn" />
          )}
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div className="invoice-management-page">
      <div className="invoice-header">
        <h1><i className="fas fa-file-invoice-dollar"></i> Quản lý Hóa đơn POS</h1>
      </div>

      <div className="invoice-content">
        <div className="invoice-filters">
          <Search
            placeholder="Tìm kiếm theo mã HĐ, tên KH hoặc SĐT"
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
          />
          <Button onClick={fetchInvoices} loading={loading} style={{ marginLeft: 'auto' }}>Tải lại</Button>
        </div>

        <div className="invoice-table">
          <Table
            columns={columns}
            dataSource={filteredInvoices}
            rowKey="MaHD"
            loading={loading}
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>

      <Modal
        title={`Chi tiết hóa đơn #${selectedInvoice?.MaHD || ''}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[<Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>]}
        width={800}
      >
        {selectedInvoice && (
          <div className="invoice-detail-content">
            <div className="info-section">
              <h3 className="section-title">Thông tin chung</h3>
              <div className="info-grid">
                <div className="info-item">
                  <p className="info-label">Khách hàng:</p>
                  <p className="info-value">{selectedInvoice.TenKH || 'Khách lẻ'}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Số điện thoại:</p>
                  <p className="info-value">{selectedInvoice.SDTKH || '-'}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Nhân viên lập:</p>
                  <p className="info-value">{selectedInvoice.TenNV || '-'}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Ngày bán:</p>
                  <p className="info-value">{formatDate(selectedInvoice.NgayBan)}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Cửa hàng:</p>
                  <p className="info-value">{selectedInvoice.TenCH}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Trạng thái:</p>
                  <Tag color={orderStatuses.find(s => s.value === selectedInvoice.TrangThai)?.color}>
                    {orderStatuses.find(s => s.value === selectedInvoice.TrangThai)?.label}
                  </Tag>
                </div>
              </div>
            </div>

            <div className="products-section">
              <h3 className="section-title">Chi tiết sản phẩm</h3>
              <Table
                columns={[
                  { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
                  { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', render: (p) => formatCurrency(p), align: 'right' },
                  { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                  { title: 'Thành tiền', key: 'total', render: (_, r) => formatCurrency(r.unitPrice * r.quantity), align: 'right' },
                ]}
                dataSource={selectedInvoice.items}
                rowKey="productId"
                pagination={false}
                size="small"
                bordered
              />
            </div>

            <div className="invoice-summary" style={{ marginTop: 20, textAlign: 'right' }}>
              <Divider />
              <div style={{ fontSize: 16 }}>
                <span>Tổng tiền hàng: </span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(selectedInvoice.TongTien)}</span>
              </div>
              <div style={{ fontSize: 16 }}>
                <span>Giảm giá: </span>
                <span style={{ color: 'red' }}>-{formatCurrency(selectedInvoice.GiamGia || 0)}</span>
              </div>
              <div style={{ fontSize: 18, marginTop: 10, color: '#1890ff' }}>
                <span style={{ fontWeight: 700 }}>Tổng thanh toán: </span>
                <span style={{ fontWeight: 700 }}>{formatCurrency(selectedInvoice.ThanhToan)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .invoice-management-page { padding: 24px; background: #f0f2f5; min-height: 100vh; }
        .invoice-header { margin-bottom: 24px; }
        .invoice-header h1 { font-size: 24px; color: #1a3353; display: flex; align-items: center; gap: 12px; }
        .invoice-content { background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .invoice-filters { display: flex; gap: 16px; margin-bottom: 24px; }
        .info-section { background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1890ff; }
        .section-title { font-size: 16px; font-weight: 600; color: #1a3353; margin-bottom: 16px; }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .info-label { color: #8c8c8c; font-size: 13px; margin: 0; }
        .info-value { font-weight: 500; font-size: 14px; margin: 4px 0 0 0; }
        .products-section { margin-top: 24px; }
      `}</style>
    </div>
  );
};

export default InvoiceManagement;