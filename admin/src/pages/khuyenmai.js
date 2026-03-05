import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table, Button, Input, Modal, Form, Select, Switch, Tag, Space,
  Tooltip, message, Tabs, Card, Row, Col, Statistic, DatePicker,
  InputNumber, AutoComplete, Badge, Popconfirm, Divider, Typography, Empty
} from 'antd';
import { handleApiError } from '../utils/errorHandler';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SearchOutlined, ReloadOutlined, TagOutlined, BarChartOutlined,
  GiftOutlined, StopOutlined, CheckCircleOutlined, HistoryOutlined,
  PercentageOutlined, DollarOutlined, ClockCircleOutlined, PrinterOutlined, DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import '../styles/DiscountManagement.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const API_URL = 'http://localhost:5000/api/promotions';

const LOAI_KM_LABELS = {
  giam_phan_tram: { label: 'Giảm %', color: 'blue', icon: <PercentageOutlined /> },
  giam_tien: { label: 'Giảm tiền', color: 'green', icon: <DollarOutlined /> },
  giam_gio_vang: { label: 'Giờ vàng', color: 'gold', icon: <ClockCircleOutlined /> },
  mua_X_tang_Y: { label: 'Mua X tặng Y', color: 'purple', icon: <GiftOutlined /> },
};

const AP_DUNG_CHO_LABELS = {
  Tat_ca: 'Tất cả sản phẩm',
  San_pham: 'Sản phẩm cụ thể',
  The_loai: 'Thể loại',
  Chi_nhanh: 'Chi nhánh',
};

const formatCurrency = (amount) =>
  amount ? `${Number(amount).toLocaleString('vi-VN')}đ` : '0đ';

// ==================== TRANG CHÍNH ====================
const KhuyenMai = () => {
  const [activeTab, setActiveTab] = useState('promotions');

  return (
    <div className="discount-management-container">
      <div className="header-section">
        <Title level={3} style={{ marginBottom: 0 }}>
          <TagOutlined style={{ marginRight: 10, color: '#1890ff' }} />
          Quản lý Khuyến mãi
        </Title>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: 'promotions',
            label: <span><GiftOutlined /> Chương trình KM</span>,
            children: <PromotionList />
          },
          {
            key: 'vouchers',
            label: <span><TagOutlined /> Mã giảm giá</span>,
            children: <VoucherList />
          },
          {
            key: 'statistics',
            label: <span><BarChartOutlined /> Thống kê</span>,
            children: <PromotionStatistics />
          },
          {
            key: 'history',
            label: <span><HistoryOutlined /> Lịch sử</span>,
            children: <PromotionHistory />
          },
        ]}
      />
    </div>
  );
};

// ==================== TAB 1: DANH SÁCH KHUYẾN MÃI ====================
const PromotionList = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [form] = Form.useForm();

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/promotions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setPromotions(res.data.success ? res.data.data : []);
    } catch {
      message.error('Lỗi khi tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  // Điền dữ liệu vào form khi mở modal chỉnh sửa
  useEffect(() => {
    if (isFormOpen) {
      if (editingItem) {
        form.setFieldsValue({
          TenKM: editingItem.TenKM,
          MoTa: editingItem.MoTa,
          LoaiKM: editingItem.LoaiKM,
          ApDungCho: editingItem.ApDungCho,
          GiaTriGiam: editingItem.GiaTriGiam,
          GiamToiDa: editingItem.GiamToiDa,
          GiaTriDonToiThieu: editingItem.GiaTriDonToiThieu,
          NgayBatDau: editingItem.NgayBatDau ? dayjs(editingItem.NgayBatDau) : null,
          NgayKetThuc: editingItem.NgayKetThuc ? dayjs(editingItem.NgayKetThuc) : null,
          GioApDung: editingItem.GioApDung,
          NgayApDung: editingItem.NgayApDung,
          GhiChu: editingItem.GhiChu,
          TrangThai: editingItem.TrangThai === 1,
        });
      } else {
        form.resetFields();
      }
    }
  }, [isFormOpen, editingItem, form]);

  const loaiKM = Form.useWatch('LoaiKM', form);
  const giaTriGiamOptions = (loaiKM === 'giam_tien')
    ? [10000, 20000, 30000, 50000, 100000, 150000, 200000]
    : [5, 10, 15, 20, 25, 30, 50];
  const giamToiDaOptions = [30000, 50000, 100000, 150000, 200000, 300000, 500000];
  const donToiThieuOptions = [100000, 200000, 300000, 500000, 1000000];

  const handleViewDetail = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/promotions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setDetailItem(res.data.data);
      setIsDetailOpen(true);
    } catch {
      message.error('Lỗi khi tải chi tiết khuyến mãi');
    }
  };

  const handleOpenForm = (item = null) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        GiaTriGiam: values.GiaTriGiam !== undefined && values.GiaTriGiam !== '' ? Number(values.GiaTriGiam) : null,
        GiamToiDa: values.GiamToiDa !== undefined && values.GiamToiDa !== '' ? Number(values.GiamToiDa) : null,
        GiaTriDonToiThieu: values.GiaTriDonToiThieu !== undefined && values.GiaTriDonToiThieu !== '' ? Number(values.GiaTriDonToiThieu) : null,
        NgayBatDau: values.NgayBatDau ? values.NgayBatDau.format('YYYY-MM-DD HH:mm:ss') : null,
        NgayKetThuc: values.NgayKetThuc ? values.NgayKetThuc.format('YYYY-MM-DD HH:mm:ss') : null,
      };
      const token = localStorage.getItem('authToken');
      if (editingItem) {
        await axios.put(`${API_URL}/promotions/${editingItem.MaKM}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Cập nhật khuyến mãi thành công');
      } else {
        await axios.post(`${API_URL}/promotions`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Tạo khuyến mãi thành công');
      }
      setIsFormOpen(false);
      fetchPromotions();
    } catch (err) {
      handleApiError(err, 'Lỗi khi lưu khuyến mãi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/promotions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      message.success('Xóa khuyến mãi thành công');
      fetchPromotions();
    } catch (err) {
      handleApiError(err, 'Không thể xóa khuyến mãi này');
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_URL}/promotions/${id}/toggle`,
        { TrangThai: currentStatus ? 0 : 1 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      message.success(currentStatus ? 'Đã tạm dừng khuyến mãi' : 'Đã kích hoạt khuyến mãi');
      fetchPromotions();
    } catch (err) {
      handleApiError(err, 'Lỗi khi thay đổi trạng thái');
    }
  };

  const filtered = promotions.filter(p => {
    const matchSearch = p.TenKM?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === '' ? true : String(p.TrangThai) === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.TrangThai === 1).length,
    inactive: promotions.filter(p => p.TrangThai === 0).length,
  };

  const columns = [
    {
      title: 'Tên chương trình',
      dataIndex: 'TenKM',
      key: 'TenKM',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.MoTa?.slice(0, 60)}{record.MoTa?.length > 60 ? '...' : ''}</Text>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'LoaiKM',
      key: 'LoaiKM',
      width: 140,
      render: (val) => {
        const info = LOAI_KM_LABELS[val] || { label: val, color: 'default' };
        return <Tag color={info.color} icon={info.icon}>{info.label}</Tag>;
      },
    },
    {
      title: 'Giá trị giảm',
      key: 'GiaTriGiam',
      width: 140,
      render: (_, record) => (
        <Text strong style={{ color: '#f5222d' }}>
          {record.LoaiKM === 'giam_tien'
            ? formatCurrency(record.GiaTriGiam)
            : `${record.GiaTriGiam}%`}
          {record.GiamToiDa && (
            <><br /><Text type="secondary" style={{ fontSize: 11 }}>Tối đa: {formatCurrency(record.GiamToiDa)}</Text></>
          )}
        </Text>
      ),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'GiaTriDonToiThieu',
      key: 'GiaTriDonToiThieu',
      width: 130,
      render: (val) => val ? formatCurrency(val) : <Text type="secondary">Không yêu cầu</Text>,
    },
    {
      title: 'Thời gian',
      key: 'ThoiGian',
      width: 180,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>Từ: <Text strong>{record.NgayBatDau ? dayjs(record.NgayBatDau).format('DD/MM/YYYY') : '—'}</Text></div>
          <div>Đến: <Text strong>{record.NgayKetThuc ? dayjs(record.NgayKetThuc).format('DD/MM/YYYY') : '—'}</Text></div>
        </div>
      ),
    },
    {
      title: 'Áp dụng cho',
      dataIndex: 'ApDungCho',
      key: 'ApDungCho',
      width: 130,
      render: (val) => <Tag>{AP_DUNG_CHO_LABELS[val] || val}</Tag>,
    },
    {
      title: 'Lần dùng',
      dataIndex: 'SoLanDaSuDung',
      key: 'SoLanDaSuDung',
      width: 90,
      align: 'center',
      render: (val) => <Badge count={val || 0} showZero style={{ backgroundColor: '#1890ff' }} />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'TrangThai',
      key: 'TrangThai',
      width: 120,
      render: (val, record) => (
        <Switch
          checked={val === 1}
          checkedChildren="Hoạt động"
          unCheckedChildren="Tạm dừng"
          onChange={() => handleToggle(record.MaKM, val)}
          size="small"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetail(record.MaKM)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenForm(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa khuyến mãi này?"
              description="Chỉ xóa được nếu chưa có lần sử dụng nào."
              onConfirm={() => handleDelete(record.MaKM)}
              okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card className="stat-card" size="small">
            <Statistic title="Tổng chương trình" value={stats.total} prefix={<GiftOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card success" size="small">
            <Statistic title="Đang hoạt động" value={stats.active} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card warning" size="small">
            <Statistic title="Tạm dừng" value={stats.inactive} valueStyle={{ color: '#faad14' }} prefix={<StopOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <div className="controls-section" style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm tên khuyến mãi..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }} placeholder="Lọc trạng thái">
          <Option value="">Tất cả</Option>
          <Option value="1">Hoạt động</Option>
          <Option value="0">Tạm dừng</Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={fetchPromotions}>Làm mới</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenForm()}>
          Tạo khuyến mãi
        </Button>
      </div>

      {/* Table */}
      <Card className="table-card">
        <Table
          className="promotion-table"
          columns={columns}
          dataSource={filtered}
          rowKey="MaKM"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} chương trình` }}
          locale={{ emptyText: <Empty description="Chưa có khuyến mãi nào" /> }}
        />
      </Card>

      {/* Form Modal: Tạo / Sửa */}
      <Modal
        title={editingItem ? 'Chỉnh sửa khuyến mãi' : 'Tạo chương trình khuyến mãi mới'}
        open={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={700}
        className="form-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="TenKM" label="Tên chương trình" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input placeholder="VD: Giảm 10% dịp Tết" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="MoTa" label="Mô tả">
                <TextArea rows={2} placeholder="Mô tả ngắn về chương trình..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="LoaiKM" label="Loại khuyến mãi" rules={[{ required: true }]}>
                <Select placeholder="Chọn loại">
                  <Option value="giam_phan_tram">Giảm theo %</Option>
                  <Option value="giam_tien">Giảm tiền trực tiếp</Option>
                  <Option value="giam_gio_vang">Giờ vàng</Option>
                  <Option value="mua_X_tang_Y">Mua X tặng Y</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ApDungCho" label="Áp dụng cho" rules={[{ required: true }]}>
                <Select placeholder="Chọn đối tượng">
                  <Option value="Tat_ca">Tất cả sản phẩm</Option>
                  <Option value="San_pham">Sản phẩm cụ thể</Option>
                  <Option value="The_loai">Thể loại</Option>
                  <Option value="Chi_nhanh">Chi nhánh</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="GiaTriGiam" label="Giá trị giảm" rules={[{ required: true, message: 'Nhập giá trị!' }]}>
                <AutoComplete
                  style={{ width: '100%' }}
                  placeholder={loaiKM === 'giam_tien' ? 'VD: 50000' : 'VD: 10 (%)'}
                  options={giaTriGiamOptions.map(v => ({ value: String(v), label: loaiKM === 'giam_tien' ? `${v.toLocaleString('vi-VN')}đ` : `${v}%` }))}
                  filterOption={(input, option) => option.value.startsWith(input)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="GiamToiDa" label="Giảm tối đa (đ)">
                <AutoComplete
                  style={{ width: '100%' }}
                  placeholder="VD: 100000"
                  options={giamToiDaOptions.map(v => ({ value: String(v), label: `${v.toLocaleString('vi-VN')}đ` }))}
                  filterOption={(input, option) => option.value.startsWith(input)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="GiaTriDonToiThieu" label="Đơn tối thiểu (đ)">
                <AutoComplete
                  style={{ width: '100%' }}
                  placeholder="VD: 300000"
                  options={donToiThieuOptions.map(v => ({ value: String(v), label: `${v.toLocaleString('vi-VN')}đ` }))}
                  filterOption={(input, option) => option.value.startsWith(input)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="NgayBatDau" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày!' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="NgayKetThuc" label="Ngày kết thúc" rules={[{ required: true, message: 'Chọn ngày!' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="GioApDung" label="Giờ áp dụng" tooltip="Bỏ trống = áp dụng cả ngày">
                <AutoComplete
                  style={{ width: '100%' }}
                  placeholder="VD: 10:00-12:00"
                  options={[
                    { value: '07:00-09:00', label: '07:00 - 09:00 (Sáng sớm)' },
                    { value: '08:00-10:00', label: '08:00 - 10:00 (Buổi sáng)' },
                    { value: '10:00-12:00', label: '10:00 - 12:00 (Trưa)' },
                    { value: '12:00-14:00', label: '12:00 - 14:00 (Nghỉ trưa)' },
                    { value: '14:00-17:00', label: '14:00 - 17:00 (Chiều)' },
                    { value: '17:00-20:00', label: '17:00 - 20:00 (Tối)' },
                    { value: '20:00-22:00', label: '20:00 - 22:00 (Tối muộn)' },
                    { value: '09:00-21:00', label: '09:00 - 21:00 (Cả ngày)' },
                  ]}
                  filterOption={(input, option) =>
                    option.value.toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="NgayApDung" label="Ngày trong tuần" tooltip="Bỏ trống = áp dụng cả tuần. Số: 2=T2, 3=T3... 1=CN">
                <AutoComplete
                  style={{ width: '100%' }}
                  placeholder="VD: 2,4,6"
                  options={[
                    { value: '2,3,4,5,6', label: 'T2 - T6 (Ngày thường)' },
                    { value: '7,1', label: 'T7 & Chủ nhật (Cuối tuần)' },
                    { value: '2,3,4,5,6,7', label: 'T2 - T7' },
                    { value: '2,4,6', label: 'T2, T4, T6' },
                    { value: '3,5,7', label: 'T3, T5, T7' },
                    { value: '7', label: 'Thứ 7' },
                    { value: '1', label: 'Chủ nhật' },
                    { value: '2,3,4,5,6,7,1', label: 'Tất cả các ngày' },
                  ]}
                  filterOption={(input, option) =>
                    option.value.toLowerCase().includes(input.toLowerCase()) ||
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="GhiChu" label="Ghi chú">
                <TextArea rows={2} placeholder="Ghi chú nội bộ..." />
              </Form.Item>
            </Col>
            {editingItem && (
              <Col span={12}>
                <Form.Item name="TrangThai" label="Trạng thái" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={<><EyeOutlined style={{ marginRight: 8 }} />{detailItem?.TenKM}</>}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={[<Button key="close" onClick={() => setIsDetailOpen(false)}>Đóng</Button>]}
        width={680}
        className="detail-modal"
      >
        {detailItem && (
          <div className="detail-content">
            <Row gutter={16}>
              <Col span={12}><Text type="secondary">Loại KM:</Text><br /><Tag color={LOAI_KM_LABELS[detailItem.LoaiKM]?.color}>{LOAI_KM_LABELS[detailItem.LoaiKM]?.label || detailItem.LoaiKM}</Tag></Col>
              <Col span={12}><Text type="secondary">Áp dụng cho:</Text><br /><Tag>{AP_DUNG_CHO_LABELS[detailItem.ApDungCho]}</Tag></Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={8}><Text type="secondary">Giá trị giảm:</Text><br /><Text strong style={{ color: '#f5222d' }}>{detailItem.LoaiKM === 'giam_tien' ? formatCurrency(detailItem.GiaTriGiam) : `${detailItem.GiaTriGiam}%`}</Text></Col>
              <Col span={8}><Text type="secondary">Giảm tối đa:</Text><br /><Text>{formatCurrency(detailItem.GiamToiDa)}</Text></Col>
              <Col span={8}><Text type="secondary">Đơn tối thiểu:</Text><br /><Text>{detailItem.GiaTriDonToiThieu ? formatCurrency(detailItem.GiaTriDonToiThieu) : 'Không yêu cầu'}</Text></Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}><Text type="secondary">Ngày bắt đầu:</Text><br /><Text>{detailItem.NgayBatDau ? dayjs(detailItem.NgayBatDau).format('DD/MM/YYYY HH:mm') : '—'}</Text></Col>
              <Col span={12}><Text type="secondary">Ngày kết thúc:</Text><br /><Text>{detailItem.NgayKetThuc ? dayjs(detailItem.NgayKetThuc).format('DD/MM/YYYY HH:mm') : '—'}</Text></Col>
            </Row>
            {(detailItem.GioApDung || detailItem.NgayApDung) && (
              <>
                <Divider />
                <Row gutter={16}>
                  {detailItem.GioApDung && <Col span={12}><Text type="secondary">Giờ áp dụng:</Text><br /><Tag icon={<ClockCircleOutlined />}>{detailItem.GioApDung}</Tag></Col>}
                  {detailItem.NgayApDung && <Col span={12}><Text type="secondary">Ngày áp dụng:</Text><br /><Text>{detailItem.NgayApDung}</Text></Col>}
                </Row>
              </>
            )}
            <Divider />
            <Row gutter={16}>
              <Col span={12}><Text type="secondary">Số lần đã dùng:</Text><br /><Text strong>{detailItem.SoLanDaSuDung || 0} lần</Text></Col>
              <Col span={12}><Text type="secondary">Trạng thái:</Text><br /><Tag color={detailItem.TrangThai ? 'success' : 'warning'}>{detailItem.TrangThai ? 'Đang hoạt động' : 'Tạm dừng'}</Tag></Col>
            </Row>
            {detailItem.MoTa && (<><Divider /><Text type="secondary">Mô tả:</Text><br /><Text>{detailItem.MoTa}</Text></>)}
            {detailItem.chiTiet?.length > 0 && (
              <>
                <Divider />
                <Text type="secondary">Sản phẩm/Thể loại áp dụng:</Text>
                <div style={{ marginTop: 8 }}>
                  {detailItem.chiTiet.map(ct => (
                    <Tag key={ct.MaCT} color="cyan" style={{ marginBottom: 4 }}>{ct.TenDoiTuong} ({ct.LoaiDoiTuong})</Tag>
                  ))}
                </div>
              </>
            )}
            {detailItem.maGiamGia?.length > 0 && (
              <>
                <Divider />
                <Text type="secondary">Mã giảm giá đính kèm:</Text>
                <div style={{ marginTop: 8 }}>
                  {detailItem.maGiamGia.map(v => (
                    <Tag key={v.MaMGG} color="volcano" style={{ marginBottom: 4, fontSize: 13 }}>{v.MaCode}</Tag>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

// ==================== TAB 2: MÃ GIẢM GIÁ ====================
// ==================== HÀM IN PHIẾU GIẢM GIÁ ====================
const printVoucherTicket = (voucher) => {
  const discountText = voucher.LoaiKM === 'giam_tien'
    ? `${Number(voucher.GiaTriGiam).toLocaleString('vi-VN')}đ`
    : `${voucher.GiaTriGiam}%`;
  const loaiLabel = {
    giam_phan_tram: 'Giảm phần trăm', giam_tien: 'Giảm tiền trực tiếp',
    giam_gio_vang: 'Ưu đãi giờ vàng', mua_X_tang_Y: 'Mua X tặng Y'
  }[voucher.LoaiKM] || voucher.LoaiKM;
  const now = new Date().toLocaleDateString('vi-VN');

  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8">
  <title>Phiếu Giảm Giá - ${voucher.MaCode}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f0f2f5; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Inter', Arial, sans-serif; padding: 20px; }
    .page-title { font-size: 13px; color: #888; margin-bottom: 18px; letter-spacing: 1px; text-transform: uppercase; }
    .ticket {
      width: 720px; height: 240px; display: flex; border-radius: 18px; overflow: visible;
      box-shadow: 0 20px 60px rgba(99,51,187,0.25), 0 4px 16px rgba(0,0,0,0.12);
      position: relative;
    }
    /* Left panel */
    .ticket-left {
      width: 220px; flex-shrink: 0;
      background: linear-gradient(135deg, #6333bb 0%, #9b59b6 40%, #e040fb 100%);
      border-radius: 18px 0 0 18px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 22px 20px; color: #fff; position: relative; overflow: hidden;
    }
    .ticket-left::before {
      content: 'GIẢM GIÁ';
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg);
      font-size: 38px; font-weight: 900; color: rgba(255,255,255,0.06); white-space: nowrap;
      letter-spacing: 4px; pointer-events: none;
    }
    .shop-logo {
      display: flex; align-items: center; gap: 8px;
    }
    .shop-icon {
      width: 36px; height: 36px; background: rgba(255,255,255,0.2);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .shop-name { font-size: 15px; font-weight: 800; letter-spacing: 0.5px; line-height: 1.2; }
    .shop-sub { font-size: 10px; opacity: 0.75; }
    .promo-name { font-size: 13px; font-weight: 600; opacity: 0.9; line-height: 1.4; }
    .promo-type {
      display: inline-block; background: rgba(255,255,255,0.18); border-radius: 20px;
      padding: 3px 10px; font-size: 10px; font-weight: 600; margin-top: 4px;
    }
    .issue-date { font-size: 10px; opacity: 0.7; }
    /* Notch cutout */
    .notch-top, .notch-bottom {
      position: absolute; width: 28px; height: 28px; background: #f0f2f5;
      border-radius: 50%; z-index: 10;
    }
    .notch-top { top: -14px; left: 205px; }
    .notch-bottom { bottom: -14px; left: 205px; }
    /* Center panel */
    .ticket-center {
      flex: 1; background: #fff;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 20px 28px; border-left: 2px dashed #e0d0f5; border-right: 2px dashed #e0d0f5;
      position: relative;
    }
    .discount-badge {
      background: linear-gradient(135deg, #6333bb, #e040fb);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; font-size: 68px; font-weight: 900; line-height: 1;
      letter-spacing: -2px;
    }
    .discount-label { font-size: 13px; color: #6333bb; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .divider-dots { display: flex; gap: 4px; margin: 8px 0; }
    .dot { width: 5px; height: 5px; border-radius: 50%; background: #d0b8f5; }
    .conditions { text-align: center; }
    .cond-item { font-size: 11px; color: #666; padding: 2px 0; }
    .cond-item span { font-weight: 700; color: #444; }
    /* Right panel */
    .ticket-right {
      width: 200px; flex-shrink: 0;
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      border-radius: 0 18px 18px 0;
      display: flex; flex-direction: column; align-items: center; justify-content: space-between;
      padding: 20px 16px; color: #fff; position: relative; overflow: hidden;
    }
    .ticket-right::after {
      content: ''; position: absolute; top: -30px; right: -30px;
      width: 100px; height: 100px; border-radius: 50%;
      background: rgba(99,51,187,0.2);
    }
    .code-label { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 2px; }
    .code-value {
      font-size: 22px; font-weight: 900; color: #fff; letter-spacing: 2px;
      background: rgba(255,255,255,0.1); border-radius: 10px;
      padding: 8px 12px; text-align: center; margin: 4px 0;
      border: 1px solid rgba(255,255,255,0.15);
      word-break: break-all;
    }
    .barcode-visual {
      display: flex; gap: 2px; align-items: flex-end; height: 38px; margin: 6px 0;
    }
    .bar { background: rgba(255,255,255,0.6); border-radius: 2px; }
    .validity { text-align: center; }
    .valid-label { font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; }
    .valid-value { font-size: 11px; font-weight: 700; color: #e0b0ff; }
    /* Footer */
    .ticket-footer {
      width: 720px; margin-top: 14px;
      background: rgba(255,255,255,0.7); border-radius: 10px;
      padding: 10px 20px; display: flex; justify-content: space-between; align-items: center;
      font-size: 10px; color: #999;
    }
    @media print {
      body { background: white; padding: 0; }
      .ticket { box-shadow: none; }
      .notch-top, .notch-bottom { background: white; }
      .ticket-footer { background: transparent; }
    }
  </style>
</head><body>
  <p class="page-title">Phiếu Giảm Giá Khuyến Mãi</p>
  <div class="ticket">
    <!-- Notch cutouts -->
    <div class="notch-top"></div>
    <div class="notch-bottom"></div>
    <!-- LEFT -->
    <div class="ticket-left">
      <div class="shop-logo">
        <div class="shop-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4.5C2 3.12 3.12 2 4.5 2H12v20H4.5C3.12 22 2 20.88 2 19.5V4.5Z" fill="rgba(255,255,255,0.9)"/>
            <path d="M12 2h7.5C20.88 2 22 3.12 22 4.5v15c0 1.38-1.12 2.5-2.5 2.5H12V2Z" fill="rgba(255,255,255,0.55)"/>
            <path d="M12 2v20" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            <path d="M5 7h5M5 10h5M5 13h3" stroke="rgba(99,51,187,0.6)" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <div class="shop-name">WebSách</div>
          <div class="shop-sub">Nhà sách uy tín #1</div>
        </div>
      </div>
      <div>
        <div class="promo-name">${voucher.TenKM || 'Chương trình khuyến mãi'}</div>
        <div class="promo-type">${loaiLabel}</div>
      </div>
      <div class="issue-date">Phát hành: ${now}</div>
    </div>
    <!-- CENTER -->
    <div class="ticket-center">
      <div class="discount-label">Ưu đãi giảm</div>
      <div class="discount-badge">${discountText}</div>
      <div class="divider-dots">${Array(9).fill('<div class="dot"></div>').join('')}</div>
      <div class="conditions">
        <div class="cond-item">Số lần dùng / khách: <span>${voucher.SoLanDungMoiKH ?? 'Không giới hạn'}</span></div>
        <div class="cond-item">Còn lại: <span>${voucher.ConLai ?? 'Không giới hạn'}</span> lượt</div>
        <div class="cond-item">Đối tượng: <span>${voucher.ApDungChoKHMoi ? 'Khách hàng mới' : 'Tất cả khách hàng'}</span></div>
      </div>
    </div>
    <!-- RIGHT -->
    <div class="ticket-right">
      <div>
        <div class="code-label">Mã voucher</div>
        <div class="code-value">${voucher.MaCode}</div>
      </div>
      <div class="barcode-visual">
        ${[3,5,2,6,4,7,3,5,8,4,2,6,3,5,4,7,2,5].map(h =>
          `<div class="bar" style="width:${h > 5 ? 3 : 2}px;height:${h * 4 + 8}px;"></div>`
        ).join('')}
      </div>
      <div class="validity">
        <div class="valid-label">Trạng thái</div>
        <div class="valid-value">${voucher.TrangThai ? '✓ Đang hoạt động' : '✗ Hết hạn'}</div>
      </div>
    </div>
  </div>
  <div class="ticket-footer">
    <span>* Mỗi mã chỉ sử dụng 1 lần / giao dịch</span>
    <span>* Không áp dụng đồng thời nhiều mã</span>
    <span>WebSách © ${new Date().getFullYear()}</span>
  </div>
  <script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;

  const pw = window.open('', '_blank', 'width=800,height=600');
  pw.document.write(html);
  pw.document.close();
};

// ==================== LƯU PDF PHIẾU GIẢM GIÁ ====================
const downloadVoucherPDF = async (voucher) => {
  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');

  const discountText = voucher.LoaiKM === 'giam_tien'
    ? `${Number(voucher.GiaTriGiam).toLocaleString('vi-VN')}đ`
    : `${voucher.GiaTriGiam}%`;
  const loaiLabel = {
    giam_phan_tram: 'Giảm phần trăm', giam_tien: 'Giảm tiền trực tiếp',
    giam_gio_vang: 'Ưu đãi giờ vàng', mua_X_tang_Y: 'Mua X tặng Y',
  }[voucher.LoaiKM] || voucher.LoaiKM;
  const now = new Date().toLocaleDateString('vi-VN');

  // Wrapper ngoài cùng - render trực tiếp trong document (không dùng iframe)
  const wrap = document.createElement('div');
  wrap.style.cssText = [
    'position:absolute', 'left:-9999px', 'top:0',
    'width:876px', 'background:#f0f2f5', 'padding:28px 28px 20px',
    'font-family:Arial,Helvetica,sans-serif',
  ].join(';');

  const barsHTML = [3,5,2,6,4,7,3,5,8,4,2,6,3,5,4,7,2,5].map(h =>
    `<div style="background:rgba(255,255,255,0.7);border-radius:2px;width:${h>5?4:2}px;height:${h*3+8}px;display:inline-block;margin:0 1px;vertical-align:bottom;"></div>`
  ).join('');

  wrap.innerHTML = `
    <div style="text-align:center;font-size:11px;color:#888;margin-bottom:14px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">
      PHIẾU GIẢM GIÁ KHUYẾN MÃI
    </div>

    <div style="display:flex;width:820px;height:236px;border-radius:16px;overflow:hidden;
                box-shadow:0 8px 30px rgba(99,51,187,0.25);">

      <!-- LEFT: gradient tím -->
      <div style="width:218px;flex-shrink:0;
                  background:linear-gradient(135deg,#6333bb 0%,#9b59b6 50%,#d060ea 100%);
                  display:flex;flex-direction:column;justify-content:space-between;
                  padding:20px 18px;color:#fff;position:relative;overflow:hidden;">
        <!-- watermark -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);
                    font-size:36px;font-weight:900;color:rgba(255,255,255,0.07);
                    white-space:nowrap;letter-spacing:4px;pointer-events:none;">GIẢM GIÁ</div>
        <!-- logo -->
        <div style="display:flex;align-items:center;gap:10px;position:relative;">
          <div style="width:36px;height:36px;background:rgba(255,255,255,0.22);border-radius:9px;
                      display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4.5C2 3.12 3.12 2 4.5 2H12v20H4.5C3.12 22 2 20.88 2 19.5V4.5Z" fill="rgba(255,255,255,0.9)"/>
            <path d="M12 2h7.5C20.88 2 22 3.12 22 4.5v15c0 1.38-1.12 2.5-2.5 2.5H12V2Z" fill="rgba(255,255,255,0.55)"/>
            <path d="M12 2v20" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            <path d="M5 7h5M5 10h5M5 13h3" stroke="rgba(99,51,187,0.6)" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </div>
          <div>
            <div style="font-size:15px;font-weight:800;line-height:1.2;">WebSách</div>
            <div style="font-size:10px;opacity:0.75;">Nhà sách uy tín #1</div>
          </div>
        </div>
        <!-- tên KM -->
        <div style="position:relative;">
          <div style="font-size:12px;font-weight:600;opacity:0.92;line-height:1.45;margin-bottom:5px;">
            ${voucher.TenKM || 'Chương trình khuyến mãi'}
          </div>
          <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:30px;
                      padding:3px 11px;font-size:9px;font-weight:700;">${loaiLabel}</div>
        </div>
        <div style="font-size:9px;opacity:0.7;position:relative;">Phát hành: ${now}</div>
      </div>

      <!-- NOTCH trái (giả lập) -->
      <div style="width:2px;background:repeating-linear-gradient(to bottom,#e0d0f5 0,#e0d0f5 6px,transparent 6px,transparent 12px);flex-shrink:0;"></div>

      <!-- CENTER: trắng -->
      <div style="flex:1;background:#fff;display:flex;flex-direction:column;
                  align-items:center;justify-content:center;padding:14px 22px;">
        <div style="font-size:11px;color:#7c3aed;font-weight:700;text-transform:uppercase;
                    letter-spacing:1px;margin-bottom:6px;">Ưu đãi giảm</div>
        <div style="font-size:62px;font-weight:900;line-height:1;color:#6333bb;letter-spacing:-2px;">
          ${discountText}
        </div>
        <div style="margin:8px 0;line-height:0;">
          ${Array(9).fill('<span style="width:6px;height:6px;border-radius:50%;background:#d0b8f5;display:inline-block;margin:0 2px;"></span>').join('')}
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px;color:#555;padding:2px 0;">
            Số lần dùng / khách: <b style="color:#222;">${voucher.SoLanDungMoiKH ?? 'Không giới hạn'}</b>
          </div>
          <div style="font-size:11px;color:#555;padding:2px 0;">
            Còn lại: <b style="color:#222;">${voucher.ConLai ?? 'Không giới hạn'}</b> lượt
          </div>
          <div style="font-size:11px;color:#555;padding:2px 0;">
            Đối tượng: <b style="color:#222;">${voucher.ApDungChoKHMoi ? 'Khách hàng mới' : 'Tất cả khách hàng'}</b>
          </div>
        </div>
      </div>

      <!-- NOTCH phải (giả lập) -->
      <div style="width:2px;background:repeating-linear-gradient(to bottom,#e0d0f5 0,#e0d0f5 6px,transparent 6px,transparent 12px);flex-shrink:0;"></div>

      <!-- RIGHT: tối xanh đêm -->
      <div style="width:196px;flex-shrink:0;
                  background:linear-gradient(180deg,#1a1a2e 0%,#16213e 55%,#0f3460 100%);
                  display:flex;flex-direction:column;align-items:center;
                  justify-content:space-between;padding:18px 14px;color:#fff;overflow:hidden;position:relative;">
        <div style="position:absolute;top:-28px;right:-28px;width:90px;height:90px;
                    border-radius:50%;background:rgba(99,51,187,0.25);"></div>
        <!-- mã -->
        <div style="text-align:center;position:relative;">
          <div style="font-size:9px;color:rgba(255,255,255,0.45);text-transform:uppercase;
                      letter-spacing:2px;margin-bottom:5px;">Mã Voucher</div>
          <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:3px;
                      background:rgba(255,255,255,0.1);border-radius:9px;
                      padding:8px 10px;border:1px solid rgba(255,255,255,0.18);
                      word-break:break-all;line-height:1.2;">${voucher.MaCode}</div>
        </div>
        <!-- barcode visual -->
        <div style="line-height:0;">${barsHTML}</div>
        <!-- trạng thái -->
        <div style="text-align:center;">
          <div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;
                      letter-spacing:1px;margin-bottom:3px;">Trạng thái</div>
          <div style="font-size:12px;font-weight:700;color:#e0b0ff;">
            ${voucher.TrangThai ? '✓ Đang hoạt động' : '✗ Hết hạn'}
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="width:820px;margin:10px 0 0;background:rgba(255,255,255,0.75);border-radius:8px;
                padding:8px 18px;display:flex;justify-content:space-between;font-size:9px;color:#999;">
      <span>* Mỗi mã chỉ sử dụng 1 lần / giao dịch</span>
      <span>* Không áp dụng đồng thời nhiều mã</span>
      <span>WebSách © ${new Date().getFullYear()}</span>
    </div>`;

  document.body.appendChild(wrap);

  try {
    // Đợi browser paint xong
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas(wrap, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f0f2f5',
      width: wrap.offsetWidth,
      height: wrap.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdfW = canvas.width / 2;
    const pdfH = canvas.height / 2;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [pdfW, pdfH],
      hotfixes: ['px_scaling'],
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    pdf.save(`PhieuGiamGia_${voucher.MaCode}.pdf`);
  } finally {
    document.body.removeChild(wrap);
  }
};

// ==================== VOUCHER LIST ====================
const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const handleBatchPrint = () => {
    const selected = vouchers.filter(v => selectedRowKeys.includes(v.MaMGG));
    if (!selected.length) return message.warning('Chọn ít nhất 1 mã để in!');
    selected.forEach((v, i) => setTimeout(() => printVoucherTicket(v), i * 300));
  };

  useEffect(() => {
    if (isFormOpen) form.resetFields();
  }, [isFormOpen, form]);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, pRes] = await Promise.all([
        axios.get(`${API_URL}/vouchers`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }),
        axios.get(`${API_URL}/promotions`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }),
      ]);
      setVouchers(vRes.data.success ? vRes.data.data : []);
      setPromotions(pRes.data.success ? pRes.data.data : []);
    } catch {
      message.error('Lỗi khi tải mã giảm giá');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleCreate = async (values) => {
    try {
      await axios.post(`${API_URL}/vouchers`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      message.success('Tạo mã giảm giá thành công');
      setIsFormOpen(false);
      form.resetFields();
      fetchVouchers();
    } catch (err) {
      handleApiError(err, 'Lỗi khi tạo mã giảm giá');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/vouchers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      message.success('Xóa mã giảm giá thành công');
      fetchVouchers();
    } catch (err) {
      handleApiError(err, 'Lỗi khi xóa mã');
    }
  };

  const filtered = vouchers.filter(v =>
    v.MaCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.TenKM?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: 'Mã voucher',
      dataIndex: 'MaCode',
      key: 'MaCode',
      render: (val) => <Tag color="volcano" style={{ fontSize: 14, padding: '2px 10px' }}><b>{val}</b></Tag>,
    },
    {
      title: 'Chương trình KM',
      dataIndex: 'TenKM',
      key: 'TenKM',
      render: (val, record) => (
        <div>
          <Text strong>{val}</Text><br />
          <Tag color={LOAI_KM_LABELS[record.LoaiKM]?.color} style={{ fontSize: 11 }}>
            {LOAI_KM_LABELS[record.LoaiKM]?.label}
          </Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {' '}{record.LoaiKM === 'giam_tien' ? formatCurrency(record.GiaTriGiam) : `${record.GiaTriGiam}%`}
          </Text>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      key: 'SoLuong',
      width: 160,
      render: (_, record) => (
        <div>
          <div>Phát hành: <Text strong>{record.SoLuongPhatHanh ?? '∞'}</Text></div>
          <div>Đã dùng: <Text strong style={{ color: '#f5222d' }}>{record.DaSuDung || 0}</Text></div>
          <div>Còn lại: <Text strong style={{ color: '#52c41a' }}>{record.ConLai ?? '∞'}</Text></div>
        </div>
      ),
    },
    {
      title: 'Giới hạn / KH',
      dataIndex: 'SoLanDungMoiKH',
      key: 'SoLanDungMoiKH',
      width: 120,
      render: (val) => <Text>{val ?? '∞'} lần</Text>,
    },
    {
      title: 'KH mới',
      dataIndex: 'ApDungChoKHMoi',
      key: 'ApDungChoKHMoi',
      width: 100,
      render: (val) => val ? <Tag color="green">Chỉ KH mới</Tag> : <Tag>Tất cả</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'TrangThai',
      key: 'TrangThai',
      width: 110,
      render: (val) => <Tag color={val ? 'success' : 'default'}>{val ? 'Hoạt động' : 'Hết hạn'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="In phiếu giảm giá">
            <Button
              icon={<PrinterOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => printVoucherTicket(record)}
            />
          </Tooltip>
          <Tooltip title="Tải PDF phiếu giảm giá">
            <Button
              icon={<DownloadOutlined />}
              size="small"
              style={{ color: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => downloadVoucherPDF(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa mã giảm giá này?"
            onConfirm={() => handleDelete(record.MaMGG)}
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="controls-section" style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm mã voucher, tên KM..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <Button icon={<ReloadOutlined />} onClick={fetchVouchers}>Làm mới</Button>
        {selectedRowKeys.length > 0 && (
          <Button
            icon={<PrinterOutlined />}
            onClick={handleBatchPrint}
            style={{ background: '#6333bb', borderColor: '#6333bb', color: '#fff' }}
          >
            In {selectedRowKeys.length} phiếu
          </Button>
        )}
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsFormOpen(true); }}>
          Tạo mã giảm giá
        </Button>
      </div>

      <Card className="table-card">
        <Table
          className="promotion-table"
          columns={columns}
          dataSource={filtered}
          rowKey="MaMGG"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} mã` }}
          locale={{ emptyText: <Empty description="Chưa có mã giảm giá nào" /> }}
        />
      </Card>

      {/* Form tạo voucher */}
      <Modal
        title={<><TagOutlined style={{ marginRight: 8 }} />Tạo mã giảm giá mới</>}
        open={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
        onOk={() => form.submit()}
        okText="Tạo mã"
        cancelText="Hủy"
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="MaKM" label="Chương trình khuyến mãi" rules={[{ required: true, message: 'Chọn chương trình!' }]}>
            <Select placeholder="Chọn chương trình KM">
              {promotions.map(p => (
                <Option key={p.MaKM} value={p.MaKM}>{p.TenKM}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="MaCode" label="Mã voucher" rules={[{ required: true, message: 'Nhập mã!' }, { pattern: /^[A-Z0-9_-]+$/, message: 'Chỉ dùng chữ hoa, số, _ -' }]}>
            <Input placeholder="VD: SALE2026, GIAM50K" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="SoLuongPhatHanh" label="Số lượng phát hành" tooltip="Để trống = không giới hạn">
                <InputNumber min={1} style={{ width: '100%' }} placeholder="100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="SoLanDungMoiKH" label="Giới hạn / khách" initialValue={1}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="ApDungChoKHMoi" label="Chỉ áp dụng cho khách hàng mới?" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// ==================== TAB 3: THỐNG KÊ ====================
const PromotionStatistics = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [summary, setSummary] = useState({ totalDiscount: 0, totalOrders: 0, totalCustomers: 0 });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      const res = await axios.get(`${API_URL}/statistics`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = res.data.success ? res.data.data : [];
      setStats(data);
      setSummary({
        totalDiscount: data.reduce((sum, r) => sum + (Number(r.TongTienGiam) || 0), 0),
        totalOrders: data.reduce((sum, r) => sum + (Number(r.SoDonHang) || 0), 0),
        totalCustomers: data.reduce((sum, r) => sum + (Number(r.SoKhachHang) || 0), 0),
      });
    } catch {
      message.error('Lỗi khi tải thống kê');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const columns = [
    { title: 'Chương trình KM', dataIndex: 'TenKM', key: 'TenKM', render: (val) => <Text strong>{val}</Text> },
    {
      title: 'Loại', dataIndex: 'LoaiKM', key: 'LoaiKM', width: 130,
      render: (val) => <Tag color={LOAI_KM_LABELS[val]?.color}>{LOAI_KM_LABELS[val]?.label || val}</Tag>,
    },
    { title: 'Số đơn hàng', dataIndex: 'SoDonHang', key: 'SoDonHang', align: 'center', width: 120, render: (v) => <Text strong>{v || 0}</Text> },
    { title: 'Số khách hàng', dataIndex: 'SoKhachHang', key: 'SoKhachHang', align: 'center', width: 130, render: (v) => <Text>{v || 0}</Text> },
    {
      title: 'Tổng tiền giảm', dataIndex: 'TongTienGiam', key: 'TongTienGiam', width: 150,
      render: (v) => <Text strong style={{ color: '#f5222d' }}>{formatCurrency(v)}</Text>,
      sorter: (a, b) => (a.TongTienGiam || 0) - (b.TongTienGiam || 0),
    },
    {
      title: 'Giảm TB / đơn', dataIndex: 'GiaTriGiamTrungBinh', key: 'GiaTriGiamTrungBinh', width: 140,
      render: (v) => <Text>{v ? formatCurrency(Math.round(v)) : '—'}</Text>,
    },
    {
      title: 'Ngày cuối dùng', dataIndex: 'NgayCuoiCung', key: 'NgayCuoiCung', width: 140,
      render: (v) => v ? <Text>{dayjs(v).format('DD/MM/YYYY')}</Text> : <Text type="secondary">Chưa dùng</Text>,
    },
  ];

  return (
    <>
      {/* Summary cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card className="stat-card" size="small">
            <Statistic title="Tổng tiền đã giảm" value={summary.totalDiscount}
              formatter={v => formatCurrency(v)} valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card success" size="small">
            <Statistic title="Tổng đơn có KM" value={summary.totalOrders} suffix="đơn" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stat-card warning" size="small">
            <Statistic title="Lượt khách hàng" value={summary.totalCustomers} suffix="lượt" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <div className="controls-section" style={{ marginBottom: 16 }}>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchStats}>Xem thống kê</Button>
      </div>

      <Card className="table-card">
        <Table
          className="promotion-table"
          columns={columns}
          dataSource={stats}
          rowKey="MaKM"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} chương trình` }}
          locale={{ emptyText: <Empty description="Chưa có dữ liệu thống kê" /> }}
        />
      </Card>
    </>
  );
};

// ==================== TAB 4: LỊCH SỬ SỬ DỤNG ====================
const PromotionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filterKM, setFilterKM] = useState('');
  const [promotions, setPromotions] = useState([]);

  const fetchHistory = useCallback(async (page = 1, MaKM = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (MaKM) params.MaKM = MaKM;
      const res = await axios.get(`${API_URL}/history`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (res.data.success) {
        setHistory(res.data.data);
        setPagination(prev => ({ ...prev, current: page, total: res.data.pagination?.total || 0 }));
      }
    } catch {
      message.error('Lỗi khi tải lịch sử');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/promotions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
    }).then(res => setPromotions(res.data.success ? res.data.data : [])).catch(() => {});
    fetchHistory();
  }, [fetchHistory]);

  const columns = [
    {
      title: 'Hóa đơn',
      dataIndex: 'MaHD',
      key: 'MaHD',
      width: 90,
      render: (v) => <Tag color="blue">#{v}</Tag>,
    },
    { title: 'Chương trình KM', dataIndex: 'TenKM', key: 'TenKM', render: (v) => <Text strong>{v}</Text> },
    {
      title: 'Mã voucher', dataIndex: 'MaCode', key: 'MaCode', width: 130,
      render: (v) => v ? <Tag color="volcano">{v}</Tag> : <Text type="secondary">—</Text>,
    },
    { title: 'Khách hàng', dataIndex: 'TenKH', key: 'TenKH', width: 140, render: (v) => v || <Text type="secondary">Khách vãng lai</Text> },
    { title: 'Nhân viên', dataIndex: 'TenNV', key: 'TenNV', width: 130 },
    {
      title: 'Trước giảm', dataIndex: 'TongTienTruocGiam', key: 'TongTienTruocGiam', width: 130,
      render: (v) => formatCurrency(v),
    },
    {
      title: 'Tiền giảm', dataIndex: 'GiaTriGiam', key: 'GiaTriGiam', width: 120,
      render: (v) => <Text strong style={{ color: '#f5222d' }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Sau giảm', dataIndex: 'TongTienSauGiam', key: 'TongTienSauGiam', width: 130,
      render: (v) => <Text strong style={{ color: '#52c41a' }}>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Ngày sử dụng', dataIndex: 'NgaySuDung', key: 'NgaySuDung', width: 150,
      render: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—',
    },
  ];

  return (
    <>
      <div className="controls-section" style={{ marginBottom: 16 }}>
        <Select
          value={filterKM}
          onChange={(val) => { setFilterKM(val); fetchHistory(1, val); }}
          style={{ width: 260 }}
          placeholder="Lọc theo chương trình KM"
          allowClear
        >
          {promotions.map(p => <Option key={p.MaKM} value={p.MaKM}>{p.TenKM}</Option>)}
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => fetchHistory(1, filterKM)}>Làm mới</Button>
      </div>

      <Card className="table-card">
        <Table
          className="promotion-table"
          columns={columns}
          dataSource={history}
          rowKey={(r) => `${r.MaHD}-${r.MaKM}`}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => fetchHistory(page, filterKM),
            showTotal: (t) => `Tổng ${t} lượt sử dụng`,
          }}
          locale={{ emptyText: <Empty description="Chưa có lịch sử sử dụng" /> }}
        />
      </Card>
    </>
  );
};

export default KhuyenMai;
