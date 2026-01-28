import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, Spin, message, Button, Modal, Form, Input, Row, Col, Avatar, Typography, Table, Upload,
  Tag, Divider, Space, DatePicker, Select, Alert
} from 'antd';
import {
  UserOutlined, LockOutlined, CheckCircleOutlined, LogoutOutlined,
  DollarCircleOutlined, EyeOutlined, PrinterOutlined, SendOutlined, EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [salaryList, setSalaryList] = useState([]);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [resignLoading, setResignLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // NEW: Profile Edit & Leave Management
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  // computed avatar src
  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  const [avatarSrc, setAvatarSrc] = useState(undefined);

  const buildAvatarSrc = (anh) => {
    if (!anh) return undefined;
    if (anh.startsWith('http')) return anh;
    // remove leading slashes
    const clean = anh.replace(/^\/+/, '');
    // if path already contains uploads, use it
    if (clean.startsWith('uploads/')) return `${apiBase}/${clean}`;
    // otherwise assume it's a filename stored in nhanvien and prefix uploads/nhanvien/
    return `${apiBase}/uploads/nhanvien/${clean}`;
  };

  // Chi tiết ngày công
  const [detailModal, setDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [attendanceDetail, setAttendanceDetail] = useState([]);
  const [detailMonth, setDetailMonth] = useState(null);
  const [detailYear, setDetailYear] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchLeaveHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userInfoStr = localStorage.getItem('userInfo');
      if (!token || !userInfoStr) {
        message.error('Không tìm thấy thông tin đăng nhập!');
        return;
      }
      // Use the consolidated hr profile endpoint (no MaTK needed in URL)
      const res = await axios.get(`http://localhost:5000/api/hr/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUserInfo(res.data.data);
        setAvatarSrc(buildAvatarSrc(res.data.data?.Anh));
      } else {
        message.warning('Không tìm thấy thông tin nhân viên!');
      }
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải thông tin cá nhân!');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveHistory = async () => {
    setLeaveLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:5000/api/hr/my-leave', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setLeaveHistory(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi fetch leave history');
    } finally {
      setLeaveLoading(false);
    }
  };

  // update avatarSrc whenever userInfo changes (helps when refreshed after upload)
  useEffect(() => {
    if (!userInfo) return;
    console.log('Profile loaded:', userInfo);
    const anh = userInfo?.Anh;
    setAvatarSrc(buildAvatarSrc(anh));
  }, [userInfo]);

  const fetchSalary = async () => {
    setSalaryLoading(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) {
        message.error('Không tìm thấy thông tin đăng nhập!');
        setSalaryLoading(false);
        return;
      }
      const { MaTK } = JSON.parse(userInfoStr);
      const token = localStorage.getItem('authToken');
      const salaryRes = await axios.get(`http://localhost:5000/api/hr/my-salary-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (salaryRes.data.success) {
        setSalaryList(salaryRes.data.data);
        setShowSalaryModal(true);
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin lương!');
    } finally {
      setSalaryLoading(false);
    }
  };

  const handlePwdChange = async (values) => {
    setPwdLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:5000/api/accounts/change-password`,
        { oldPassword: values.oldPassword, newPassword: values.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Đổi mật khẩu thành công!');
      setShowPwdModal(false);
    } catch (error) {
      message.error(error.response?.data?.error || 'Đổi mật khẩu thất bại!');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setAttendanceLoading(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) {
        message.error('Không tìm thấy thông tin đăng nhập!');
        setAttendanceLoading(false);
        return;
      }
      const { MaTK } = JSON.parse(userInfoStr);
      if (!MaTK) {
        message.error('Không tìm thấy mã tài khoản!');
        setAttendanceLoading(false);
        return;
      }
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const gioVao = now.toTimeString().slice(0, 8);
      await axios.post('http://localhost:5000/api/hr/checkin', {
        MaTK,
        ngay: today,
        gio_vao: gioVao,
        gio_ra: "17:00:00",
        trang_thai: "Di_lam",
        ghi_chu: "Chấm công thành công"
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      message.success('Chấm công hôm nay thành công!');
    } catch (error) {
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('đã chấm công')) {
          message.warning('Bạn đã chấm công trong ngày hôm nay rồi!');
        } else {
          message.error(error.response.data.error);
        }
      } else {
        message.error('Chấm công thất bại!');
      }
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSubmitLeave = async (values) => {
    setLeaveSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post('http://localhost:5000/api/hr/xin-nghi-phep', {
        LoaiDon: values.LoaiDon,
        NgayBatDau: values.dates[0].format('YYYY-MM-DD'),
        NgayKetThuc: values.dates[1].format('YYYY-MM-DD'),
        LyDo: values.LyDo
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        message.success('Gửi đơn thành công!');
        setShowLeaveModal(false);
        fetchLeaveHistory();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Gửi đơn thất bại!');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.put('http://localhost:5000/api/hr/profile', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        message.success('Cập nhật thông tin thành công!');
        setShowEditModal(false);
        fetchProfile();
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật thông tin!');
    } finally {
      setEditLoading(false);
    }
  };

  // Xem chi tiết ngày công
  const handleShowDetail = async (thang, nam) => {
    setDetailLoading(true);
    setDetailModal(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const { MaTK } = JSON.parse(userInfoStr);
      const res = await axios.get(`http://localhost:5000/api/attendance/detail/${MaTK}/${thang}/${nam}`);
      setAttendanceDetail(res.data);
      setDetailMonth(thang);
      setDetailYear(nam);
    } catch (error) {
      message.error('Không lấy được chi tiết ngày công!');
      setAttendanceDetail([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // Cột bảng lương (thêm nút xem chi tiết)
  const salaryColumns = [
    { title: 'Tháng', dataIndex: 'thang', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
    { title: 'Năm', dataIndex: 'nam', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
    { title: 'Lương cơ bản', dataIndex: 'luong_co_ban', render: v => v?.toLocaleString(), responsive: ['md', 'lg', 'xl'] },
    { title: 'Phụ cấp', dataIndex: 'phu_cap', render: v => v?.toLocaleString(), responsive: ['lg', 'xl'] },
    { title: 'Thưởng', dataIndex: 'thuong', render: v => v?.toLocaleString(), responsive: ['lg', 'xl'] },
    { title: 'Phạt', dataIndex: 'phat', render: v => v?.toLocaleString(), responsive: ['lg', 'xl'] },
    { title: 'Tổng lương', dataIndex: 'tong_luong', render: v => v?.toLocaleString(), responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      render: v => v === 'Da_tra'
        ? <span style={{ color: 'green' }}>Đã trả</span>
        : <span style={{ color: 'orange' }}>Chưa trả</span>,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleShowDetail(record.thang, record.nam)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint('monthly', record)}
          >
            In
          </Button>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  ];

  const handlePrint = async (type, record = null) => {
    try {
      const token = localStorage.getItem('authToken');
      let url = `http://localhost:5000/api/hr/my-salary/print/${type}`;
      if (type === 'monthly' && record) {
        url += `?year=${record.nam}&month=${record.thang}`;
      } else if (type === 'yearly') {
        const year = prompt('Nhập năm muốn in:', new Date().getFullYear());
        if (!year) return;
        url += `?year=${year}`;
      }

      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        // Thực hiện in (mở tab mới và in)
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Phiếu lương - ${res.data.employee?.HoTen}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; text-align: right; }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>CỬA HÀNG SÁCH OFFLINE</h2>
                <h1>PHIẾU LƯƠNG ${type === 'monthly' ? 'THÁNG' : 'NĂM'}</h1>
              </div>
              <p><b>Họ tên:</b> ${res.data.employee?.HoTen}</p>
              <p><b>Chức vụ:</b> ${res.data.employee?.ChucVu}</p>
              <table>
                <thead>
                  <tr>
                    <th>Nội dung</th>
                    <th>Số tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  ${type === 'monthly' ? `
                    <tr><td>Lương cơ bản</td><td>${res.data.data[0]?.LuongCoBan?.toLocaleString()}</td></tr>
                    <tr><td>Phụ cấp</td><td>${res.data.data[0]?.PhuCap?.toLocaleString()}</td></tr>
                    <tr><td>Thưởng</td><td>${res.data.data[0]?.Thuong?.toLocaleString()}</td></tr>
                    <tr><td>Phạt/Khấu trừ</td><td>${res.data.data[0]?.Phat?.toLocaleString()}</td></tr>
                    <tr class="total"><td>TỔNG NHẬN</td><td>${res.data.data[0]?.TongLuong?.toLocaleString()}</td></tr>
                  ` : `
                    <tr><td>Tổng lương cơ bản</td><td>${res.data.summary?.TongLuongCoBan?.toLocaleString()}</td></tr>
                    <tr><td>Tổng phụ cấp</td><td>${res.data.summary?.TongPhuCap?.toLocaleString()}</td></tr>
                    <tr><td>Tổng thưởng</td><td>${res.data.summary?.TongThuong?.toLocaleString()}</td></tr>
                    <tr><td>Tổng phạt</td><td>${res.data.summary?.TongPhat?.toLocaleString()}</td></tr>
                    <tr class="total"><td>TỔNG NHẬN CẢ NĂM</td><td>${res.data.summary?.TongLuongNam?.toLocaleString()}</td></tr>
                  `}
                </tbody>
              </table>
              <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <div>Người lập phiếu</div>
                <div>Nhân viên ký tên</div>
              </div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error(error);
      message.error('Không thể in phiếu lương lúc này!');
    }
  };

  if (loading) return (
    <div style={{ padding: '100px 0', textAlign: 'center' }}>
      <Spin tip="Đang tải thông tin..." />
    </div>
  );
  if (!userInfo) return <div>Không tìm thấy thông tin nhân viên!</div>;

  return (
    <div className="thongke-page">
      <div className="thongke-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>
          <i className="fas fa-user"></i> Thông tin cá nhân
        </h1>
      </div>

      <div className="thongke-content">
        <div className="thongke-table">
          <Row
            justify="center"
            align="middle"
            style={{
              minHeight: '70vh',
              background: '#f4f6fb',
              paddingBottom: 40,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            <Col xs={24} md={20} lg={16} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 900 }}>
              <Card
                bordered={false}
                style={{
                  width: '100%',
                  maxWidth: 900, // Tăng chiều rộng form thông tin nhân viên
                  padding: 28,
                  boxShadow: '0 8px 32px rgba(16,24,40,0.08)',
                  borderRadius: 24,
                  background: 'linear-gradient(135deg, #eef4ff 0%, #fff 100%)',
                  marginTop: 40,
                }}
                actions={[
                  <div key="card-actions" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ maxWidth: 980, width: '100%', display: 'flex', gap: 10, justifyContent: 'center', padding: '6px 8px' }}>
                      <Button
                        icon={<LockOutlined />}
                        type="primary"
                        onClick={() => setShowPwdModal(true)}
                        key="changepwd"
                        style={{ borderRadius: 8, padding: '6px 12px', minHeight: 38, fontSize: 14 }}
                      >
                        Đổi mật khẩu
                      </Button>
                      <Button
                        icon={<CheckCircleOutlined />}
                        type="default"
                        loading={attendanceLoading}
                        onClick={handleCheckIn}
                        key="checkin"
                        style={{ borderRadius: 8, color: '#52c41a', borderColor: '#52c41a', padding: '6px 12px', minHeight: 38, fontSize: 14 }}
                      >
                        Chấm công hôm nay
                      </Button>
                      <Button
                        icon={<LogoutOutlined />}
                        danger
                        type="primary"
                        onClick={() => setShowResignModal(true)}
                        key="resign"
                        style={{ borderRadius: 8, padding: '6px 12px', minHeight: 38, fontSize: 14 }}
                      >
                        Nghỉ việc
                      </Button>
                      <Button
                        icon={<SendOutlined />}
                        type="primary"
                        ghost
                        onClick={() => setShowLeaveModal(true)}
                        key="leave"
                        style={{ borderRadius: 8, padding: '6px 12px', minHeight: 38, fontSize: 14 }}
                      >
                        Xin nghỉ phép
                      </Button>
                      <Button
                        icon={<DollarCircleOutlined />}
                        type="dashed"
                        onClick={fetchSalary}
                        key="salary"
                        style={{ borderRadius: 8, color: '#2563eb', borderColor: '#2563eb', padding: '6px 12px', minHeight: 38, fontSize: 14 }}
                        loading={salaryLoading}
                      >
                        Xem lương cá nhân
                      </Button>
                    </div>
                  </div>
                ]}
              >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={avatarSrc}
                    style={{
                      background: avatarSrc ? undefined : 'linear-gradient(135deg, #6366f1 0%, #60a5fa 100%)',
                      marginBottom: 14,
                      boxShadow: '0 6px 18px rgba(99,123,241,0.18)',
                    }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Space>
                      <Button size="small" onClick={() => setShowAvatarModal(true)}>Thay ảnh</Button>
                      <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => setShowEditModal(true)}>Sửa thông tin</Button>
                    </Space>
                  </div>
                  <Title level={2} style={{ marginBottom: 4, color: '#0f172a' }}>{userInfo.TenNV || userInfo.TenTK}</Title>
                  <Text type="secondary" style={{ fontSize: 15 }}>{userInfo.TenNQ}</Text>
                </div>
                <Row gutter={[16, 8]}>
                  <Col span={12}><Text strong>Mã tài khoản:</Text></Col>
                  <Col span={12}><Text>{userInfo.MaTK}</Text></Col>
                  <Col span={12}><Text strong>Tên tài khoản:</Text></Col>
                  <Col span={12}><Text>{userInfo.TenTK}</Text></Col>
                  <Col span={12}><Text strong>Mã nhân viên:</Text></Col>
                  <Col span={12}><Text>{userInfo.MaNV}</Text></Col>
                  <Col span={12}><Text strong>Số điện thoại:</Text></Col>
                  <Col span={12}><Text>{userInfo.SDT}</Text></Col>
                  <Col span={12}><Text strong>Giới tính:</Text></Col>
                  <Col span={12}><Text>{userInfo.GioiTinh}</Text></Col>
                  <Col span={12}><Text strong>Địa chỉ:</Text></Col>
                  <Col span={12}><Text>{userInfo.DiaChi}</Text></Col>
                  <Col span={12}><Text strong>Email:</Text></Col>
                  <Col span={12}><Text>{userInfo.Email}</Text></Col>
                  <Col span={12}><Text strong>Ngày tạo:</Text></Col>
                  <Col span={12}><Text>{userInfo.NgayTao ? new Date(userInfo.NgayTao).toLocaleDateString('vi-VN') : ''}</Text></Col>
                  <Col span={12}><Text strong>Tình trạng:</Text></Col>
                  <Col span={12}><Text>{userInfo.TinhTrang ? 'Hoạt động' : 'Không hoạt động'}</Text></Col>
                </Row>

                <Divider orientation="left" style={{ margin: '32px 0 16px' }}>Lịch sử xin nghỉ</Divider>
                <Table
                  dataSource={leaveHistory}
                  rowKey="id"
                  loading={leaveLoading}
                  pagination={{ pageSize: 5 }}
                  size="small"
                  columns={[
                    { title: 'Loại', dataIndex: 'LoaiDon', render: v => v === 'Nghi_phep' ? 'Nghỉ phép' : v === 'Nghi_om' ? 'Nghỉ ốm' : v === 'Thai_san' ? 'Thai sản' : 'Nghỉ việc' },
                    { title: 'Bắt đầu', dataIndex: 'NgayBatDau', render: v => dayjs(v).format('DD/MM/YYYY') },
                    { title: 'Kết thúc', dataIndex: 'NgayKetThuc', render: v => dayjs(v).format('DD/MM/YYYY') },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'TrangThai',
                      render: v => {
                        const colors = { Cho_duyet: 'orange', Da_duyet: 'green', Tu_choi: 'red' };
                        const labels = { Cho_duyet: 'Chờ duyệt', Da_duyet: 'Đã duyệt', Tu_choi: 'Từ chối' };
                        return <Tag color={colors[v]}>{labels[v]}</Tag>;
                      }
                    }
                  ]}
                />
              </Card>
            </Col>
            {/* Modal lương cá nhân */}
            {/* Modal thay ảnh đại diện */}
            <Modal
              title="Thay ảnh đại diện"
              open={showAvatarModal}
              onCancel={() => { setShowAvatarModal(false); setAvatarFile(null); }}
              footer={null}
            >
              <div style={{ textAlign: 'center' }}>
                <Upload
                  beforeUpload={(file) => {
                    const isImage = /image\/(jpeg|png|gif|jpg)/.test(file.type);
                    if (!isImage) {
                      message.error('Chỉ cho phép file ảnh!');
                      return Upload.LIST_IGNORE;
                    }
                    setAvatarFile(file);
                    return false; // prevent auto upload
                  }}
                  maxCount={1}
                  showUploadList={{ showPreviewIcon: false }}
                >
                  <Button>Chọn ảnh</Button>
                </Upload>
                <div style={{ marginTop: 12 }}>
                  <Button
                    type="primary"
                    loading={avatarUploading}
                    onClick={async () => {
                      if (!avatarFile) return message.warning('Vui lòng chọn ảnh trước khi tải lên');
                      setAvatarUploading(true);
                      try {
                        const token = localStorage.getItem('authToken');
                        const form = new FormData();
                        // Backend requires TenNV, SDT, Email - include existing values so validation passes
                        form.append('TenNV', userInfo.TenNV || '');
                        form.append('SDT', userInfo.SDT || '');
                        form.append('Email', userInfo.Email || '');
                        form.append('GioiTinh', userInfo.GioiTinh || '');
                        form.append('DiaChi', userInfo.DiaChi || '');
                        form.append('TinhTrang', userInfo.TinhTrang ? '1' : '0');
                        form.append('Anh', avatarFile);

                        const res = await axios.put(
                          `http://localhost:5000/api/users/${userInfo.MaNV}`,
                          form,
                          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                        );
                        message.success(res.data?.message || 'Cập nhật ảnh thành công');
                        // refresh profile info
                        const tokenStored = localStorage.getItem('authToken');
                        const { MaTK } = JSON.parse(localStorage.getItem('userInfo') || '{}');
                        const profileRes = await axios.get(`http://localhost:5000/api/users/by-matk/${MaTK}`, { headers: { Authorization: `Bearer ${tokenStored}` } });
                        setUserInfo(profileRes.data);
                        setShowAvatarModal(false);
                        setAvatarFile(null);
                      } catch (err) {
                        console.error(err);
                        message.error(err.response?.data?.error || 'Tải ảnh thất bại');
                      } finally {
                        setAvatarUploading(false);
                      }
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    Tải lên
                  </Button>
                </div>
              </div>
            </Modal>
            <Modal
              title="Lịch sử lương cá nhân"
              open={showSalaryModal}
              onCancel={() => setShowSalaryModal(false)}
              footer={null}
              width={800}
              styles={{ body: { borderRadius: 16, padding: 0, overflow: 'hidden' } }}
            >
              <Alert
                message="Cách tính lương"
                description={
                  <ul style={{ fontSize: 13, paddingLeft: 20 }}>
                    <li><b>Tổng lương</b> = (Lương cơ bản / 26 * Số ngày làm) + Phụ cấp + Thưởng - Phạt</li>
                    <li><b>Tăng ca</b>: Tính 150% lương giờ cơ bản.</li>
                    <li>Phản hồi về lương vui lòng liên hệ phòng nhân sự.</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                action={
                  <Button size="small" type="primary" icon={<PrinterOutlined />} onClick={() => handlePrint('yearly')}>
                    In lương năm
                  </Button>
                }
              />
              <Table
                columns={salaryColumns}
                dataSource={salaryList}
                rowKey={(record, idx) => `${record.nam}-${record.thang}-${idx}`}
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: 'Chưa có dữ liệu lương' }}
                style={{ borderRadius: 16, overflow: 'hidden', fontSize: 13, margin: 0 }}
                bordered
              />
            </Modal>
            {/* Modal chi tiết ngày công */}
            <Modal
              title={`Chi tiết ngày công tháng ${detailMonth}/${detailYear}`}
              open={detailModal}
              onCancel={() => setDetailModal(false)}
              footer={null}
              width={500}
              styles={{ body: { borderRadius: 16, padding: 0, overflow: 'hidden' } }}
            >
              <Spin spinning={detailLoading}>
                <Table
                  columns={[
                    { title: 'Ngày', dataIndex: 'ngay', render: v => dayjs(v).format('DD/MM/YYYY') },
                    {
                      title: 'Trạng thái', dataIndex: 'trang_thai',
                      render: v => {
                        if (v === 'Di_lam') return <span style={{ color: '#52c41a' }}>Đi làm</span>;
                        if (v === 'Nghi_phep') return <span style={{ color: '#1890ff' }}>Nghỉ phép</span>;
                        if (v === 'Nghi_khong_phep') return <span style={{ color: '#f5222d' }}>Nghỉ KP</span>;
                        if (v === 'Lam_them') return <span style={{ color: '#faad14' }}>Tăng ca</span>;
                        if (v === 'Di_tre') return <span style={{ color: '#faad14' }}>Đi trễ</span>;
                        return v;
                      }
                    }
                  ]}
                  dataSource={attendanceDetail}
                  rowKey={(r, idx) => r.ngay + idx}
                  pagination={false}
                  size="small"
                  bordered
                  style={{ margin: 16 }}
                  locale={{ emptyText: 'Không có dữ liệu ngày công' }}
                />
              </Spin>
            </Modal>
            {/* Modal đổi mật khẩu */}
            <Modal
              title="Đổi mật khẩu"
              open={showPwdModal}
              onCancel={() => setShowPwdModal(false)}
              footer={null}
              destroyOnHidden
              styles={{ body: { padding: 24, borderRadius: 12 } }}
            >
              <Form
                layout="vertical"
                onFinish={handlePwdChange}
              >
                <Form.Item
                  name="oldPassword"
                  label="Mật khẩu cũ"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                >
                  <Input.Password placeholder="Nhập mật khẩu cũ" />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={pwdLoading} block style={{ borderRadius: 8 }}>
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Modal
              title="Xin nghỉ việc"
              open={showResignModal}
              onCancel={() => setShowResignModal(false)}
              footer={null}
              destroyOnHidden
              styles={{ body: { padding: 24, borderRadius: 12 } }}
            >
              <Form
                layout="vertical"
                onFinish={(values) => handleSubmitLeave({ ...values, LoaiDon: 'Nghi_viec', dates: [dayjs(), dayjs()], LyDo: values.ly_do })}
              >
                <Form.Item
                  name="ly_do"
                  label="Lý do nghỉ việc"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do nghỉ việc!' }]}
                >
                  <Input.TextArea placeholder="Nhập lý do nghỉ việc..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={leaveSubmitting} block style={{ borderRadius: 8 }}>
                    Gửi đơn xin nghỉ việc
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            {/* NEW: Modal Chỉnh sửa thông tin */}
            <Modal
              title="Cập nhật thông tin cá nhân"
              open={showEditModal}
              onCancel={() => setShowEditModal(false)}
              footer={null}
              destroyOnHidden
            >
              <Form
                layout="vertical"
                initialValues={{
                  SDT: userInfo.SDT,
                  Email: userInfo.Email,
                  DiaChi: userInfo.DiaChi
                }}
                onFinish={handleUpdateProfile}
              >
                <Form.Item name="SDT" label="Số điện thoại" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="Email" label="Email" rules={[{ required: true, type: 'email' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="DiaChi" label="Địa chỉ" rules={[{ required: true }]}>
                  <Input.TextArea />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={editLoading} block>
                    Cập nhật
                  </Button>
                </Form.Item>
              </Form>
            </Modal>

            {/* NEW: Modal Xin nghỉ phép */}
            <Modal
              title="Gửi đơn xin nghỉ phép"
              open={showLeaveModal}
              onCancel={() => setShowLeaveModal(false)}
              footer={null}
              destroyOnHidden
            >
              <Form layout="vertical" onFinish={handleSubmitLeave}>
                <Form.Item name="LoaiDon" label="Loại đơn" rules={[{ required: true }]} initialValue="Nghi_phep">
                  <Select>
                    <Select.Option value="Nghi_phep">Nghỉ phép năm</Select.Option>
                    <Select.Option value="Nghi_om">Nghỉ ốm</Select.Option>
                    <Select.Option value="Thai_san">Nghỉ thai sản</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="dates" label="Thời gian nghỉ" rules={[{ required: true }]}>
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="LyDo" label="Lý do nghỉ" rules={[{ required: true }]}>
                  <Input.TextArea rows={4} placeholder="Nhập lý do chi tiết..." />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={leaveSubmitting} block>
                    Gửi đơn
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Profile;