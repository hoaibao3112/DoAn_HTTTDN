import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Select, Input, notification, DatePicker, Alert, Space } from 'antd';
import { PlusOutlined, EyeOutlined, SyncOutlined, SearchOutlined } from '@ant-design/icons';
import '../styles/ReceiptManagement.css';

const { Column } = Table;
const { Option } = Select;
const { RangePicker } = DatePicker;

const NhapHang = () => {
  // ----- States -----
  const [phieuNhap, setPhieuNhap] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [nhaCungCap, setNhaCungCap] = useState([]);
  const [sanPham, setSanPham] = useState([]);
  const [branches, setBranches] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [chiTietVisible, setChiTietVisible] = useState(false);
  const [selectedPhieu, setSelectedPhieu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [searchParams, setSearchParams] = useState({
    MaNCC: '',
    MaCH: '',
    startDate: '',
    endDate: ''
  });

  // Low-stock
  const [lowStock, setLowStock] = useState([]);
  const [showLowStockBanner, setShowLowStockBanner] = useState(false);
  const [showLowStockDetails, setShowLowStockDetails] = useState(false);

  // Tỷ lệ lợi nhuận chung (%) - dùng để tính giá bán
  const [tyLeLoi, setTyLeLoi] = useState(20); // Mặc định 20% cho hợp lý hơn

  // State để theo dõi items trong form
  const [formItems, setFormItems] = useState([]);

  const API_BASE_URL = 'http://localhost:5000/api/warehouse';
  const TOKEN = localStorage.getItem('authToken');

  const config = {
    headers: { Authorization: `Bearer ${TOKEN}` }
  };

  // ----- Effects -----
  useEffect(() => {
    fetchPhieuNhap();
    fetchNhaCungCap();
    fetchSanPham();
    fetchBranches();
    fetchLowStock(true);
  }, []);

  // ----- Fetchers -----
  const fetchPhieuNhap = async (params = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams(params).toString();
      const res = await axios.get(`${API_BASE_URL}/purchase-orders?${query}`, config);
      if (res.data.success) {
        setPhieuNhap(res.data.data);
        if (res.data.pagination) {
          setPagination({
            current: res.data.pagination.page,
            pageSize: res.data.pagination.pageSize,
            total: res.data.pagination.total
          });
        }
      }
    } catch (error) {
      notification.error({ message: 'Lỗi tải dữ liệu phiếu nhập' });
    } finally {
      setLoading(false);
    }
  };

  const fetchNhaCungCap = async () => {
    try {
      // Backend common endpoint for suppliers
      const res = await axios.get('http://localhost:5000/api/suppliers', config);
      setNhaCungCap(res.data.data || res.data);
    } catch (error) {
      console.error('Lỗi fetchNhaCungCap:', error.response?.status, error.response?.data || error.message);
      notification.error({ message: 'Lỗi tải danh sách nhà cung cấp' });
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/branches', config);
      if (res.data.success) {
        setBranches(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi tải chi nhánh');
    }
  };

  const fetchSanPham = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products?pageSize=100`, config);
      if (res.data.success) {
        setSanPham(res.data.data.items || res.data.data);
      } else {
        console.warn('API fetchSanPham returned unsuccessful:', res.data);
      }
    } catch (error) {
      console.error('Lỗi fetchSanPham:', error.response?.status, error.message);
      notification.error({
        message: 'Lỗi tải sản phẩm',
        description: error.response?.status === 403 ? 'Bạn không có quyền xem sản phẩm' : 'Không thể kết nối đến server'
      });
    }
  };

  const fetchLowStock = async (askConfirm = false) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stock/alerts`, config);
      if (res.data.success) {
        const items = res.data.data || [];
        setLowStock(items);
        const hasLow = items.length > 0;
        setShowLowStockBanner(hasLow);

        if (askConfirm && hasLow) {
          Modal.confirm({
            title: `CẢNH BÁO TỒN KHO: Có ${items.length} sản phẩm sắp hết`,
            content: 'Bạn có muốn lập phiếu nhập hàng ngay để đảm bảo kinh doanh không?',
            okText: 'Lập phiếu ngay',
            cancelText: 'Để sau',
            onOk: () => createReceiptFromLowStock(items)
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy low-stock:', error.response?.status, error.response?.data || error.message);
    }
  };

  // ----- Helpers -----
  const calculateTotalNhap = (items) => {
    return (items || []).reduce((total, item) => {
      if (!item) return total;
      const donGiaNhap = Number(item.DonGiaNhap || 0);
      const soLuong = Number(item.SoLuong || 0);
      return total + (donGiaNhap * soLuong);
    }, 0);
  };

  const createReceiptFromLowStock = (items) => {
    const itemsPrefill = items.map(sp => ({
      MaSP: sp.MaSP,
      TenSP: sp.TenSP,
      SoLuong: sp.SoLuongCanNhap || 10,
      DonGiaNhap: Number(sp.DonGiaNhap || sp.DonGia || 0)
    }));

    form.setFieldsValue({ items: itemsPrefill });
    setFormItems(itemsPrefill);
    setModalVisible(true);
  };

  // ----- Actions -----
  const handleSubmit = async (values) => {
    try {
      const validItems = (values.items || [])
        .filter(it => it.MaSP && it.SoLuong > 0 && it.DonGiaNhap > 0)
        .map(it => ({
          MaSP: it.MaSP,
          SoLuong: Number(it.SoLuong),
          DonGiaNhap: Number(it.DonGiaNhap)
        }));

      if (validItems.length === 0) {
        notification.warning({ message: 'Vui lòng cung cấp danh sách sản phẩm hợp lệ' });
        return;
      }

      const payload = {
        MaNCC: values.MaNCC,
        MaCH: values.MaCH,
        DaThanhToan: Number(values.DaThanhToan || 0),
        GhiChu: values.GhiChu,
        TyLeLoi: tyLeLoi,
        ChiTiet: validItems
      };

      const response = await axios.post(`${API_BASE_URL}/purchase-orders`, payload, config);

      if (response.data.success) {
        notification.success({
          message: 'Lập phiếu nhập thành công',
          description: `Mã phiếu: ${response.data.MaPN} | Tổng tiền: ${response.data.TongTien.toLocaleString()}đ`
        });
        setModalVisible(false);
        form.resetFields();
        setFormItems([]);
        fetchPhieuNhap();
        fetchLowStock(false);
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi lập phiếu',
        description: error.response?.data?.message || error.message
      });
    }
  };

  const xemChiTiet = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/purchase-orders/${id}`, config);
      if (res.data.success) {
        setSelectedPhieu(res.data.data);
        setChiTietVisible(true);
      }
    } catch (error) {
      notification.error({ message: 'Lỗi khi lấy chi tiết phiếu nhập' });
    }
  };

  const handleSearch = () => {
    const params = {};
    if (searchParams.MaNCC) params.MaNCC = searchParams.MaNCC;
    if (searchParams.MaCH) params.MaCH = searchParams.MaCH;
    if (searchParams.startDate) params.startDate = searchParams.startDate;
    if (searchParams.endDate) params.endDate = searchParams.endDate;
    fetchPhieuNhap(params);
  };

  // ----- Render -----
  const columns = [
    { title: 'ID', dataIndex: 'MaPN', key: 'MaPN', width: 80, align: 'center' },
    {
      title: 'Ngày nhập', dataIndex: 'NgayNhap', key: 'NgayNhap', width: 180,
      render: (val) => <span style={{ color: '#64748b' }}>{new Date(val).toLocaleString('vi-VN')}</span>
    },
    { title: 'Nhà cung cấp', dataIndex: 'TenNCC', key: 'TenNCC', minWidth: 200 },
    { title: 'Kho/Chi nhánh', dataIndex: 'TenCH', key: 'TenCH', width: 180 },
    { title: 'Người lập', dataIndex: 'NguoiLap', key: 'NguoiLap', width: 140 },
    {
      title: 'Tổng tiền', dataIndex: 'TongTien', key: 'TongTien', align: 'right', width: 150,
      render: (v) => <b style={{ color: '#0f172a' }}>{Number(v).toLocaleString()}đ</b>
    },
    {
      title: 'Đã trả', dataIndex: 'DaThanhToan', key: 'DaThanhToan', align: 'right', width: 130,
      render: (v) => <span style={{ color: '#10b981', fontWeight: '500' }}>{Number(v || 0).toLocaleString()}đ</span>
    },
    {
      title: 'Còn nợ', dataIndex: 'ConNo', key: 'ConNo', align: 'right', width: 130,
      render: (v) => <span style={{ color: '#ef4444', fontWeight: '500' }}>{Number(v || 0).toLocaleString()}đ</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => xemChiTiet(record.MaPN)}
          style={{ color: '#3b82f6' }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="receipt-management-container">
      <div className="receipt-header">
        <div className="search-section">
          <Select
            placeholder="Nhà cung cấp"
            value={searchParams.MaNCC || undefined}
            onChange={(val) => setSearchParams({ ...searchParams, MaNCC: val || '' })}
            style={{ width: 160 }}
            allowClear
          >
            {nhaCungCap.map(ncc => (
              <Option key={ncc.MaNCC} value={ncc.MaNCC}>{ncc.TenNCC}</Option>
            ))}
          </Select>

          <Select
            placeholder="Kho/Chi nhánh"
            value={searchParams.MaCH || undefined}
            onChange={(val) => setSearchParams({ ...searchParams, MaCH: val || '' })}
            style={{ width: 160 }}
            allowClear
          >
            {branches.map(b => (
              <Option key={b.MaCH} value={b.MaCH}>{b.TenCH}</Option>
            ))}
          </Select>

          <RangePicker
            onChange={(dates) => setSearchParams({
              ...searchParams,
              startDate: dates ? dates[0].format('YYYY-MM-DD') : '',
              endDate: dates ? dates[1].format('YYYY-MM-DD') : ''
            })}
            style={{ width: 220 }}
          />

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            className="filter-btn"
          >
            Lọc
          </Button>
          <Button
            icon={<SyncOutlined />}
            onClick={() => {
              setSearchParams({ MaNCC: '', MaCH: '', startDate: '', endDate: '' });
              fetchPhieuNhap();
            }}
            className="reset-btn"
          >
            Làm mới
          </Button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          className="create-btn"
          onClick={() => setModalVisible(true)}
        >
          Lập phiếu nhập mới
        </Button>
      </div>

      {showLowStockBanner && (
        <Alert
          className="lowstock-alert"
          type="warning"
          showIcon
          message={<b>Cảnh báo hàng sắp hết: Có {lowStock.length} sản phẩm cần nhập thêm!</b>}
          description={
            <div className="lowstock-actions">
              <Button size="small" onClick={() => setShowLowStockDetails(!showLowStockDetails)}>
                {showLowStockDetails ? 'Ẩn bảng kê' : 'Xem bảng kê'}
              </Button>
              <Button type="primary" size="small" onClick={() => createReceiptFromLowStock(lowStock)}>
                Lập phiếu nhập hàng loạt
              </Button>
            </div>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {showLowStockDetails && (
        <Table
          dataSource={lowStock}
          rowKey="MaSP"
          pagination={false}
          size="small"
          className="lowstock-table"
        >
          <Table.Column title="ID" dataIndex="MaSP" width={60} />
          <Table.Column title="Sản phẩm" dataIndex="TenSP" />
          <Table.Column title="Hiện tại" dataIndex="SoLuongTon" align="center" />
          <Table.Column title="Tối thiểu" dataIndex="SoLuongToiThieu" align="center" />
          <Table.Column title="Cần nhập" align="center" render={(_, r) => <b>{r.SoLuongCanNhap}</b>} />
        </Table>
      )}

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={phieuNhap}
          rowKey="MaPN"
          loading={loading}
          pagination={pagination}
          onChange={(p) => fetchPhieuNhap({ page: p.current, pageSize: p.pageSize })}
          scroll={{ x: 1200 }}
          className="main-table"
        />
      </div>

      <Modal
        title="Lập phiếu nhập hàng BookStore"
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); setFormItems([]); }}
        footer={null}
        width={1000}
        destroyOnHidden
        className="receipt-modal"
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          onValuesChange={(_, all) => setFormItems(all.items || [])}
          initialValues={{ DaThanhToan: 0 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="MaNCC" label="Nhà cung cấp" rules={[{ required: true }]}>
              <Select placeholder="Chọn NCC" showSearch optionFilterProp="children">
                {nhaCungCap.map(ncc => (
                  <Option key={ncc.MaNCC} value={ncc.MaNCC}>{ncc.TenNCC}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="MaCH" label="Nhập vào kho/chi nhánh" rules={[{ required: true }]}>
              <Select placeholder="Chọn kho" showSearch optionFilterProp="children">
                {branches.map(b => (
                  <Option key={b.MaCH} value={b.MaCH}>{b.TenCH}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="DaThanhToan" label="Số tiền thanh toán ngay (vnđ)">
              <Input type="number" min={0} placeholder="0" />
            </Form.Item>
          </div>

          <div className="profit-buttons">
            <span style={{ fontWeight: 600 }}>⚙️ Tỷ lệ lợi nhuận áp dụng:</span>
            {[10, 20, 30, 40, 50].map(p => (
              <Button
                key={p}
                type={tyLeLoi === p ? 'primary' : 'default'}
                onClick={() => setTyLeLoi(p)}
              >
                {p}%
              </Button>
            ))}
            <Input
              type="number"
              value={tyLeLoi}
              onChange={e => setTyLeLoi(Number(e.target.value))}
              style={{ width: 80 }}
              addonAfter="%"
            />
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="form-item-row" style={{ background: '#fff', border: '1px solid #eee' }}>
                    <Form.Item {...restField} name={[name, 'MaSP']} rules={[{ required: true }]} style={{ width: 250, margin: 0 }}>
                      <Select
                        showSearch
                        optionFilterProp="children"
                        placeholder="Tìm sản phẩm"
                        onChange={(val) => {
                          const sp = sanPham.find(s => s.MaSP === val);
                          const current = form.getFieldValue('items') || [];
                          current[name] = {
                            ...current[name],
                            MaSP: val,
                            TenSP: sp?.TenSP,
                            DonGiaNhap: sp?.GiaNhap || 0
                          };
                          form.setFieldsValue({ items: current });
                        }}
                      >
                        {sanPham.map(s => <Option key={s.MaSP} value={s.MaSP}>{s.MaSP} - {s.TenSP}</Option>)}
                      </Select>
                    </Form.Item>

                    <Form.Item {...restField} name={[name, 'SoLuong']} rules={[{ required: true }]} style={{ margin: 0 }}>
                      <Input type="number" placeholder="SL" min={1} style={{ width: 80 }} />
                    </Form.Item>

                    <Form.Item {...restField} name={[name, 'DonGiaNhap']} rules={[{ required: true }]} style={{ margin: 0 }}>
                      <Input type="number" placeholder="Giá nhập" min={0} style={{ width: 140 }} />
                    </Form.Item>

                    <div style={{ width: 150 }}>
                      <span style={{ fontSize: 11, color: '#999' }}>Giá bán (dự kiến {tyLeLoi}%)</span>
                      <div style={{ fontWeight: 700, color: '#1677ff' }}>
                        {(Math.round(Number(formItems[name]?.DonGiaNhap || 0) * (1 + tyLeLoi / 100))).toLocaleString()}đ
                      </div>
                    </div>

                    <Button danger onClick={() => remove(name)}>Xóa</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm sản phẩm</Button>
              </div>
            )}
          </Form.List>

          <div className="total-display" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
            <span>Tổng cộng:</span>
            <span>{calculateTotalNhap(formItems).toLocaleString()}đ</span>
          </div>

          <Form.Item name="GhiChu" label="Ghi chú" style={{ marginTop: 16 }}>
            <Input.TextArea rows={2} placeholder="Nhập ghi chú phiếu nhập..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space size="middle">
              <Button size="large" onClick={() => setModalVisible(false)}>Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" size="large">Xác nhận nhập kho</Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`Chi tiết phiếu nhập #${selectedPhieu?.MaPN}`}
        open={chiTietVisible}
        onCancel={() => setChiTietVisible(false)}
        footer={null}
        width={900}
      >
        {selectedPhieu && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
              <div>
                <p><b>Nhà cung cấp:</b> {selectedPhieu.TenNCC}</p>
                <p><b>Địa chỉ:</b> {selectedPhieu.DiaChiNCC || 'N/A'}</p>
                <p><b>SĐT:</b> {selectedPhieu.SDTNCC || 'N/A'}</p>
              </div>
              <div>
                <p><b>Nhập tại:</b> {selectedPhieu.TenCH}</p>
                <p><b>Người lập:</b> {selectedPhieu.NguoiLap}</p>
                <p><b>Ngày lập:</b> {new Date(selectedPhieu.NgayNhap).toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <Table dataSource={selectedPhieu.items} rowKey="MaSP" pagination={false} size="small">
              <Table.Column title="Mã SP" dataIndex="MaSP" width={80} />
              <Table.Column title="Tên sách" dataIndex="TenSP" />
              <Table.Column title="Số lượng" dataIndex="SoLuong" align="center" />
              <Table.Column title="Giá nhập" dataIndex="DonGiaNhap" align="right" render={v => Number(v).toLocaleString() + 'đ'} />
              <Table.Column title="Thành tiền" align="right" render={(_, r) => (r.SoLuong * r.DonGiaNhap).toLocaleString() + 'đ'} />
            </Table>

            <div style={{ textAlign: 'right', marginTop: 20, fontSize: 16 }}>
              <p>Tổng tiền hàng: <b>{Number(selectedPhieu.TongTien).toLocaleString()}đ</b></p>
              <p>Đã thanh toán: <b style={{ color: '#52c41a' }}>{Number(selectedPhieu.DaThanhToan).toLocaleString()}đ</b></p>
              <p>Còn nợ NCC: <b style={{ color: '#ff4d4f' }}>{Number(selectedPhieu.ConNo).toLocaleString()}đ</b></p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NhapHang;
