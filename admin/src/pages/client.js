import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import { 
  Button, Input, message, Table, Modal, Space, Tag, Select, Card, Row, Col, 
  Descriptions, Slider, Statistic, Tabs, Tooltip, Progress 
} from 'antd';
import { handleApiError } from '../utils/errorHandler';
import { 
  UserOutlined, TrophyOutlined, HistoryOutlined, RiseOutlined, FallOutlined 
} from '@ant-design/icons';

// Tier configuration
const TIER_CONFIG = {
  'Dong': { color: '#cd7f32', bgColor: '#fef3e2', label: 'Đồng', icon: '🥉' },
  'Bac': { color: '#c0c0c0', bgColor: '#f5f5f5', label: 'Bạc', icon: '🥈' },
  'Vang': { color: '#ffd700', bgColor: '#fffde7', label: 'Vàng', icon: '🥇' },
  'Kim_cuong': { color: '#b9f2ff', bgColor: '#e6f7ff', label: 'Kim Cương', icon: '💎' }
};

const CustomerManagement = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [pointRange, setPointRange] = useState([0, 50000]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Customer detail modal
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const API_URL = '/customers';

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const res = await apiClient.get(`${API_URL}/statistics`);
      if (res.data && res.data.data) {
        setStatistics(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Fetch customers with filters and pagination
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize: pageSize,
      };
      if (searchTerm) params.search = searchTerm;
      if (tierFilter) params.hangTV = tierFilter;
      if (statusFilter) params.trangThai = statusFilter === 'Hoạt động' ? '1' : '0';
      if (pointRange[0] > 0) params.minDiem = pointRange[0];
      if (pointRange[1] < 50000) params.maxDiem = pointRange[1];

      const res = await apiClient.get(API_URL, { params });
      if (res.data && res.data.data) {
        setCustomers(res.data.data);
        setTotalCustomers(res.data.pagination?.total || res.data.data.length);
      } else {
        setCustomers([]);
        setTotalCustomers(0);
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCustomers();
    fetchStatistics();
  }, [currentPage, pageSize]);

  // Refetch when filters change (reset to page 1)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchCustomers();
    }
  }, [searchTerm, tierFilter, statusFilter, pointRange]);

  // Fetch customer detail
  const fetchCustomerDetail = async (makh) => {
    try {
      setDetailLoading(true);
      const res = await apiClient.get(`${API_URL}/${makh}`);
      if (res.data && res.data.data) {
        setCustomerDetail(res.data.data);
        setIsDetailModalVisible(true);
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi tải thông tin chi tiết khách hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  // Toggle customer status
  const handleToggleStatus = async (makh) => {
    try {
      await apiClient.patch(`${API_URL}/${makh}/toggle-status`);
      message.success('Đổi trạng thái thành công');
      fetchCustomers();
      fetchStatistics();
    } catch (err) {
      console.error(err);
      handleApiError(err, 'Lỗi khi đổi trạng thái');
    }
  };

  // Render tier badge
  const renderTierBadge = (tier) => {
    const config = TIER_CONFIG[tier] || TIER_CONFIG['Dong'];
    return (
      <Tag style={{
        background: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}`,
        fontWeight: 600,
        padding: '4px 12px',
        borderRadius: '4px',
        fontSize: '13px'
      }}>
        <span style={{ marginRight: 4 }}>{config.icon}</span>
        {config.label}
      </Tag>
    );
  };

  // Table columns
  const columns = [
    { 
      title: 'Mã KH', 
      dataIndex: 'MaKH', 
      key: 'MaKH', 
      width: 80,
      fixed: 'left',
      render: (text) => <strong>#{text}</strong>
    },
    { 
      title: 'Tên khách hàng', 
      dataIndex: 'HoTen', 
      key: 'HoTen', 
      width: 150,
      ellipsis: true
    },
    { 
      title: 'SĐT', 
      dataIndex: 'SDT', 
      key: 'SDT', 
      width: 110
    },
    { 
      title: 'Email', 
      dataIndex: 'Email', 
      key: 'Email', 
      render: (t) => t || <span style={{ color: '#999' }}>Chưa có</span>, 
      width: 180,
      ellipsis: true
    },
    {
      title: 'Hạng TV',
      dataIndex: 'HangTV',
      key: 'HangTV',
      width: 130,
      align: 'center',
      render: (tier) => renderTierBadge(tier),
      filters: [
        { text: '🥉 Đồng', value: 'Dong' },
        { text: '🥈 Bạc', value: 'Bac' },
        { text: '🥇 Vàng', value: 'Vang' },
        { text: '💎 Kim Cương', value: 'Kim_cuong' }
      ],
      onFilter: (value, record) => record.HangTV === value
    },
    {
      title: 'Điểm tích lũy',
      dataIndex: 'DiemTichLuy',
      key: 'DiemTichLuy',
      width: 130,
      align: 'right',
      render: (points, record) => (
        <Tooltip title={`Tổng: ${(record.TongDiemTichLuy || 0).toLocaleString()} | Đã dùng: ${(record.DiemDaDung || 0).toLocaleString()}`}>
          <span style={{ fontWeight: 600, color: '#1890ff', cursor: 'pointer' }}>
            {(points || 0).toLocaleString()}
          </span>
        </Tooltip>
      ),
      sorter: (a, b) => (a.DiemTichLuy || 0) - (b.DiemTichLuy || 0)
    },
    {
      title: 'Ưu đãi',
      key: 'benefits',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="green" style={{ margin: 0 }}>
            Giảm {record.PhanTramGiam || 0}%
          </Tag>
          <Tag color="blue" style={{ margin: 0 }}>
            Tích x{record.HeSoTichDiem || 1}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        if (!record.DiemCanDeLenHang || record.DiemCanDeLenHang === 0) {
          return <Tag color="gold">Hạng tối đa</Tag>;
        }
        const progress = ((record.DiemTichLuy || 0) / ((record.DiemTichLuy || 0) + record.DiemCanDeLenHang)) * 100;
        return (
          <Tooltip title={`Cần ${record.DiemCanDeLenHang.toLocaleString()} điểm để lên hạng`}>
            <Progress 
              percent={Math.round(progress)} 
              size="small" 
              strokeColor="#52c41a"
              format={() => `${record.DiemCanDeLenHang.toLocaleString()}`}
            />
          </Tooltip>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'TinhTrang', 
      key: 'TinhTrang', 
      width: 110,
      align: 'center',
      render: (s) => (
        <Tag color={s === 1 ? 'green' : 'red'}>
          {s === 1 ? 'Hoạt động' : 'Vô hiệu'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: 1 },
        { text: 'Vô hiệu', value: 0 }
      ],
      onFilter: (value, record) => record.TinhTrang === value
    },
    {
      title: 'Thao tác', 
      key: 'action', 
      fixed: 'right', 
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              size="small" 
              type="link"
              icon={<UserOutlined />}
              onClick={() => fetchCustomerDetail(record.MaKH)}
            >
              Chi tiết
            </Button>
          </Tooltip>
          <Button 
            size="small" 
            type={record.TinhTrang === 1 ? 'default' : 'primary'}
            danger={record.TinhTrang === 1}
            onClick={() => handleToggleStatus(record.MaKH)}
          >
            {record.TinhTrang === 1 ? 'Vô hiệu' : 'Kích hoạt'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="customer-management-page">
      <div className="page-header">
        <h1>
          <UserOutlined style={{ marginRight: 12 }} />
          Quản lý Khách hàng & Hội viên
        </h1>
        <Button type="primary" size="large" onClick={() => { fetchCustomers(); fetchStatistics(); }}>
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng khách hàng"
                value={statistics.totalCustomers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đang hoạt động"
                value={statistics.activeCustomers}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={`/ ${statistics.totalCustomers}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Khách hàng mới (tháng này)"
                value={statistics.newCustomersThisMonth}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Vô hiệu hóa"
                value={statistics.inactiveCustomers}
                prefix={<FallOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tier Distribution */}
      {statistics && statistics.tierDistribution && (
        <Card 
          title={
            <span>
              <TrophyOutlined style={{ marginRight: 8 }} />
              Phân bố hạng thành viên
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(statistics.tierDistribution).map(([tier, count]) => {
              const config = TIER_CONFIG[tier] || TIER_CONFIG['Dong'];
              const percentage = statistics.totalCustomers > 0 
                ? ((count / statistics.totalCustomers) * 100).toFixed(1) 
                : 0;
              return (
                <Col xs={24} sm={12} md={6} key={tier}>
                  <Card 
                    size="small" 
                    style={{ 
                      background: config.bgColor,
                      borderColor: config.color
                    }}
                  >
                    <Statistic
                      title={
                        <span style={{ color: config.color, fontWeight: 600 }}>
                          {config.icon} {config.label}
                        </span>
                      }
                      value={count}
                      suffix={
                        <span style={{ fontSize: 14, color: '#666' }}>
                          ({percentage}%)
                        </span>
                      }
                      valueStyle={{ color: config.color }}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Tìm kiếm:
              </label>
              <Input
                placeholder="Tên, SĐT, Email, Mã KH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Trạng thái:
              </label>
              <Select 
                value={statusFilter} 
                onChange={setStatusFilter} 
                style={{ width: '100%' }}
              >
                <Select.Option value="">Tất cả</Select.Option>
                <Select.Option value="Hoạt động">Hoạt động</Select.Option>
                <Select.Option value="Vô hiệu">Vô hiệu</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Hạng thành viên:
              </label>
              <Select 
                value={tierFilter} 
                onChange={setTierFilter} 
                style={{ width: '100%' }}
              >
                <Select.Option value="">Tất cả</Select.Option>
                <Select.Option value="Dong">🥉 Đồng</Select.Option>
                <Select.Option value="Bac">🥈 Bạc</Select.Option>
                <Select.Option value="Vang">🥇 Vàng</Select.Option>
                <Select.Option value="Kim_cuong">💎 Kim Cương</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Khoảng điểm: {pointRange[0].toLocaleString()} - {pointRange[1].toLocaleString()}
              </label>
              <Slider
                range
                min={0}
                max={50000}
                step={500}
                value={pointRange}
                onChange={setPointRange}
                marks={{
                  0: '0',
                  1000: '1K',
                  5000: '5K',
                  20000: '20K',
                  50000: '50K+'
                }}
              />
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Customer Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="MaKH"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCustomers,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khách hàng`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          size="middle"
          locale={{ emptyText: 'Không tìm thấy khách hàng' }}
        />
      </Card>

      {/* Customer Detail Modal */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            Chi tiết khách hàng
          </span>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setCustomerDetail(null);
        }}
        footer={null}
        width={900}
        centered
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            Đang tải...
          </div>
        ) : customerDetail ? (
          <Tabs 
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: (
                  <span>
                    <UserOutlined />
                    Thông tin cơ bản
                  </span>
                ),
                children: (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Mã KH" span={2}>
                      <strong>#{customerDetail.MaKH}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ tên" span={2}>
                      {customerDetail.HoTen}
                    </Descriptions.Item>
                    <Descriptions.Item label="SĐT">
                      {customerDetail.SDT}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {customerDetail.Email || <span style={{ color: '#999' }}>Chưa có</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>
                      {customerDetail.DiaChi || <span style={{ color: '#999' }}>Chưa có</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={customerDetail.TinhTrang === 1 ? 'green' : 'red'}>
                        {customerDetail.TinhTrang === 1 ? 'Hoạt động' : 'Vô hiệu'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tham gia">
                      {customerDetail.NgayThamGia ? new Date(customerDetail.NgayThamGia).toLocaleDateString('vi-VN') : 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'loyalty',
                label: (
                  <span>
                    <TrophyOutlined />
                    Thông tin hội viên
                  </span>
                ),
                children: (
                  <div>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Hạng thành viên"
                            value={TIER_CONFIG[customerDetail.HangTV]?.label || 'N/A'}
                            prefix={TIER_CONFIG[customerDetail.HangTV]?.icon}
                            valueStyle={{ 
                              color: TIER_CONFIG[customerDetail.HangTV]?.color,
                              fontSize: 28
                            }}
                          />
                          {customerDetail.NgayNangHang && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                              Lên hạng: {new Date(customerDetail.NgayNangHang).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Điểm hiện tại"
                            value={customerDetail.DiemTichLuy || 0}
                            valueStyle={{ color: '#1890ff', fontSize: 28 }}
                            suffix="điểm"
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Tổng điểm tích lũy"
                            value={customerDetail.TongDiemTichLuy || 0}
                            valueStyle={{ color: '#52c41a', fontSize: 20 }}
                            suffix="điểm"
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Statistic
                            title="Điểm đã sử dụng"
                            value={customerDetail.DiemDaDung || 0}
                            valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                            suffix="điểm"
                          />
                        </Card>
                      </Col>
                    </Row>

                    <Descriptions bordered column={2} title="Ưu đãi hiện tại">
                      <Descriptions.Item label="Giảm giá" span={1}>
                        <Tag color="green" style={{ fontSize: 16 }}>
                          {customerDetail.PhanTramGiam || 0}%
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Hệ số tích điểm" span={1}>
                        <Tag color="blue" style={{ fontSize: 16 }}>
                          x{customerDetail.HeSoTichDiem || 1}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tối đa dùng điểm" span={2}>
                        <Tag color="orange" style={{ fontSize: 16 }}>
                          {(customerDetail.ToiDaDungDiem || 0).toLocaleString()} điểm
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tiến độ lên hạng" span={2}>
                        {customerDetail.DiemCanDeLenHang > 0 ? (
                          <div>
                            <Progress 
                              percent={
                                Math.round(
                                  ((customerDetail.DiemTichLuy || 0) / 
                                  ((customerDetail.DiemTichLuy || 0) + customerDetail.DiemCanDeLenHang)) * 100
                                )
                              }
                              strokeColor="#52c41a"
                            />
                            <div style={{ marginTop: 8, fontSize: 14 }}>
                              Cần thêm <strong style={{ color: '#1890ff' }}>
                                {customerDetail.DiemCanDeLenHang.toLocaleString()}
                              </strong> điểm để lên hạng tiếp theo
                            </div>
                          </div>
                        ) : (
                          <Tag color="gold">Đã đạt hạng cao nhất</Tag>
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                )
              },
              {
                key: 'orders',
                label: (
                  <span>
                    <HistoryOutlined />
                    Lịch sử mua hàng
                  </span>
                ),
                children: (
                  <>
                    {customerDetail.recentOrders && customerDetail.recentOrders.length > 0 ? (
                      <Table
                        dataSource={customerDetail.recentOrders}
                        rowKey="MaHD"
                        pagination={false}
                        size="small"
                        columns={[
                          { 
                            title: 'Mã HD', 
                            dataIndex: 'MaHD', 
                            key: 'MaHD',
                            render: (text) => <strong>#{text}</strong>
                          },
                          { 
                            title: 'Ngày mua', 
                            dataIndex: 'NgayBan', 
                            key: 'NgayBan',
                            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
                          },
                          { 
                            title: 'Tổng tiền', 
                            dataIndex: 'TongTien', 
                            key: 'TongTien',
                            render: (val) => (
                              <span style={{ fontWeight: 600 }}>
                                {(val || 0).toLocaleString()} đ
                              </span>
                            ),
                            align: 'right'
                          },
                          { 
                            title: 'Điểm tích', 
                            dataIndex: 'DiemTichLuy', 
                            key: 'DiemTichLuy',
                            render: (val) => (
                              <Tag color="blue">+{val || 0} điểm</Tag>
                            ),
                            align: 'center'
                          },
                          { 
                            title: 'Điểm dùng', 
                            dataIndex: 'DiemSuDung', 
                            key: 'DiemSuDung',
                            render: (val) => (
                              val > 0 ? <Tag color="red">-{val} điểm</Tag> : <Tag>0</Tag>
                            ),
                            align: 'center'
                          }
                        ]}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                        Chưa có lịch sử mua hàng
                      </div>
                    )}
                  </>
                )
              }
            ]}
          />
        ) : null}
      </Modal>

      <style>{`
        .customer-management-page {
          padding: 24px;
          background: #f0f2f5;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .page-header h1 {
          margin: 0;
          font-size: 24px;
          color: #262626;
        }
      `}</style>
    </div>
  );
};

export default CustomerManagement;
