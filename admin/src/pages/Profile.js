import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Card, Spin, message, Button, Modal, Form, Input, Row, Col, Avatar, Typography, Table, Upload,
  Tag, Divider, Space, DatePicker, Select
} from 'antd';
import {
  UserOutlined, LockOutlined, CheckCircleOutlined,
  DollarCircleOutlined, EyeOutlined, PrinterOutlined, CalendarOutlined
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
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Chi tiết ngày công
  const [detailModal, setDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [attendanceDetail, setAttendanceDetail] = useState([]);

  // NEW: Profile Edit & Leave Management
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveFileList, setLeaveFileList] = useState([]);

  // computed avatar src
  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  const [avatarSrc, setAvatarSrc] = useState(undefined);

  const buildAvatarSrc = useCallback((anh) => {
    if (!anh) return undefined;
    if (anh.startsWith('http')) return anh;
    const clean = anh.replace(/^\/+/, '');
    if (clean.startsWith('uploads/')) return `${apiBase}/${clean}`;
    return `${apiBase}/uploads/nhanvien/${clean}`;
  }, [apiBase]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        message.error('Không tìm thấy thông tin đăng nhập!');
        return;
      }
      const res = await axios.get(`http://localhost:5000/api/hr/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUserInfo(res.data.data);
        setAvatarSrc(buildAvatarSrc(res.data.data?.Anh));

        const attRes = await axios.get(`http://localhost:5000/api/hr/my-attendance`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate: dayjs().format('YYYY-MM-DD'), endDate: dayjs().format('YYYY-MM-DD') }
        });
        if (attRes.data.success && attRes.data.data.length > 0) {
          setTodayAttendance(attRes.data.data[0]);
        }
      } else {
        message.warning('Không tìm thấy thông tin nhân viên!');
      }
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải thông tin cá nhân!');
    } finally {
      setLoading(false);
    }
  }, [buildAvatarSrc]);

  const fetchLeaveHistory = useCallback(async () => {
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
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchLeaveHistory();
  }, [fetchProfile, fetchLeaveHistory]);

  useEffect(() => {
    if (!userInfo) return;
    const anh = userInfo?.Anh;
    setAvatarSrc(buildAvatarSrc(anh));
  }, [userInfo, buildAvatarSrc]);

  const fetchSalary = async () => {
    setSalaryLoading(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) {
        message.error('Không tìm thấy thông tin đăng nhập!');
        setSalaryLoading(false);
        return;
      }
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
      const token = localStorage.getItem('authToken');
      const res = await axios.post('http://localhost:5000/api/hr/checkin', {
        Ngay: dayjs().format('YYYY-MM-DD'),
        GioVao: dayjs().format('HH:mm:ss'),
        GhiChu: "Vào ca"
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        message.success(res.data.message || 'Chấm công vào thành công!');
        fetchProfile();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Chấm công thất bại!');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post('http://localhost:5000/api/hr/checkout', {
        Ngay: dayjs().format('YYYY-MM-DD'),
        GioRa: dayjs().format('HH:mm:ss'),
        GhiChu: "Ra ca"
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        message.success(res.data.message || 'Chấm công ra thành công!');
        fetchProfile();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Chấm công ra thất bại!');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSubmitLeave = async (values) => {
    setLeaveSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('LoaiDon', values.LoaiDon);
      formData.append('NgayBatDau', values.dates[0].format('YYYY-MM-DD'));
      formData.append('NgayKetThuc', values.dates[1].format('YYYY-MM-DD'));
      formData.append('LyDo', values.LyDo || '');

      if (leaveFileList.length > 0) {
        formData.append('MinhChung', leaveFileList[0].originFileObj);
      }

      const res = await axios.post('http://localhost:5000/api/hr/xin-nghi-phep', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        message.success('Gửi đơn thành công!');
        setShowLeaveModal(false);
        setLeaveFileList([]);
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

  const handleShowDetail = async (thang, nam) => {
    setDetailLoading(true);
    setDetailModal(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const { MaTK } = JSON.parse(userInfoStr || '{}');
      const res = await axios.get(`http://localhost:5000/api/attendance/detail/${MaTK}/${thang}/${nam}`);
      setAttendanceDetail(res.data);
    } catch (error) {
      message.error('Không lấy được chi tiết ngày công!');
      setAttendanceDetail([]);
    } finally {
      setDetailLoading(false);
    }
  };

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

  const salaryColumns = [
    { title: 'Tháng', dataIndex: 'Thang' },
    { title: 'Năm', dataIndex: 'Nam' },
    { title: 'Lương cơ bản', dataIndex: 'LuongCoBan', render: v => v?.toLocaleString() },
    { title: 'Phụ cấp', dataIndex: 'PhuCap', render: v => v?.toLocaleString() },
    { title: 'Thưởng', dataIndex: 'Thuong', render: v => v?.toLocaleString() },
    { title: 'Phạt', dataIndex: 'Phat', render: v => v?.toLocaleString() },
    { title: 'Tổng lương', dataIndex: 'TongLuong', render: v => v?.toLocaleString() },
    {
      title: 'Trạng thái',
      dataIndex: 'TrangThai',
      render: v => v === 'Da_tra' ? <span style={{ color: 'green' }}>Đã trả</span> : <span style={{ color: 'orange' }}>Chưa trả</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleShowDetail(record.Thang, record.Nam)}>Chi tiết</Button>
          <Button size="small" icon={<PrinterOutlined />} onClick={() => handlePrint('monthly', record)}>In</Button>
        </Space>
      )
    }
  ];

  if (loading) return (
    <div style={{ padding: '100px 0', textAlign: 'center' }}>
      <Spin>
        <div style={{ marginTop: 20 }}>Đang tải thông tin...</div>
      </Spin>
    </div>
  );
  if (!userInfo) return <div style={{ padding: 50, textAlign: 'center' }}>Không tìm thấy thông tin nhân viên!</div>;

  return (
    <div className="thongke-page">
      <div className="thongke-header">
        <h1><i className="fas fa-user"></i> Thông tin cá nhân</h1>
      </div>

      <div className="thongke-content">
        <Row justify="center" style={{ background: '#f4f6fb', padding: '24px' }}>
          <Col xs={24} md={20} lg={16}>
            <Card
              variant="outlined"
              style={{ borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
              actions={[
                <Space key="actions" style={{ padding: '12px 24px' }}>
                  <Button icon={<LockOutlined />} type="primary" onClick={() => setShowPwdModal(true)}>Đổi mật khẩu</Button>
                  <Button
                    icon={<CheckCircleOutlined />}
                    loading={attendanceLoading}
                    onClick={!todayAttendance ? handleCheckIn : (!todayAttendance.GioRa ? handleCheckOut : undefined)}
                    disabled={!!todayAttendance && !!todayAttendance.GioRa}
                  >
                    {!todayAttendance ? 'Chấm công Vào' : (!todayAttendance.GioRa ? 'Chấm công Ra' : 'Đã hoàn thành')}
                  </Button>
                  <Button icon={<DollarCircleOutlined />} type="dashed" loading={salaryLoading} onClick={fetchSalary}>Xem lương</Button>
                  <Button icon={<CalendarOutlined />} onClick={() => setShowLeaveModal(true)}>Xin nghỉ phép</Button>
                </Space>
              ]}
            >
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar size={120} icon={<UserOutlined />} src={avatarSrc} />
                <div style={{ marginTop: 16 }}>
                  <Button size="small" onClick={() => setShowAvatarModal(true)}>Thay ảnh</Button>
                  <Button size="small" type="link" onClick={() => setShowEditModal(true)}>Sửa thông tin</Button>
                </div>
                <Title level={2}>{userInfo.HoTen || userInfo.TenTK}</Title>
                <Text type="secondary">{userInfo.ChucVu}</Text>
              </div>

              <Row gutter={[16, 16]}>
                <Col span={12}><Text strong>Mã nhân viên:</Text> {userInfo.MaNV}</Col>
                <Col span={12}><Text strong>Số điện thoại:</Text> {userInfo.SDT}</Col>
                <Col span={12}><Text strong>Email:</Text> {userInfo.Email}</Col>
                <Col span={12}><Text strong>Địa chỉ:</Text> {userInfo.DiaChi}</Col>
                <Col span={12}>
                  <Text strong>Ca làm việc:</Text>
                  <Tag color="blue" style={{ marginLeft: 8 }}>{userInfo.TenCa || 'Hành chính'}</Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Trạng thái hôm nay:</Text>
                  {todayAttendance ? (
                    <Tag color={todayAttendance.TrangThai === 'Tre' ? 'red' : 'green'} style={{ marginLeft: 8 }}>
                      {todayAttendance.TrangThai === 'Tre' ? 'Đi trễ' : 'Đúng giờ'}
                    </Tag>
                  ) : <Tag style={{ marginLeft: 8 }}>Chưa chấm công</Tag>}
                </Col>
              </Row>

              <Divider />
              <Title level={4}>Lịch sử xin nghỉ</Title>
              <Table
                dataSource={leaveHistory}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                columns={[
                  { title: 'Loại', dataIndex: 'LoaiDon' },
                  { title: 'Bắt đầu', dataIndex: 'NgayBatDau', render: v => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'Kết thúc', dataIndex: 'NgayKetThuc', render: v => dayjs(v).format('DD/MM/YYYY') },
                  { title: 'Trạng thái', dataIndex: 'TrangThai' }
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Modal title="Lịch sử lương" open={showSalaryModal} onCancel={() => setShowSalaryModal(false)} footer={null} width={800}>
        <Table columns={salaryColumns} dataSource={salaryList} pagination={{ pageSize: 5 }} bordered />
      </Modal>

      <Modal title="Chi tiết ngày công" open={detailModal} onCancel={() => setDetailModal(false)} footer={null}>
        <Spin spinning={detailLoading}>
          <Table
            dataSource={attendanceDetail}
            rowKey="MaCC"
            columns={[
              { title: 'Ngày', dataIndex: 'Ngay', render: v => dayjs(v).format('DD/MM/YYYY') },
              { title: 'Trạng thái', dataIndex: 'TrangThai' }
            ]}
          />
        </Spin>
      </Modal>

      <Modal title="Đổi mật khẩu" open={showPwdModal} onCancel={() => setShowPwdModal(false)} footer={null}>
        <Form layout="vertical" onFinish={handlePwdChange}>
          <Form.Item name="oldPassword" label="Mật khẩu cũ" rules={[{ required: true }]}><Input.Password /></Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true }, { min: 6 }]}><Input.Password /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={pwdLoading} block>Cập nhật</Button></Form.Item>
        </Form>
      </Modal>

      <Modal title="Thay ảnh đại diện" open={showAvatarModal} onCancel={() => setShowAvatarModal(false)} footer={null}>
        <div style={{ textAlign: 'center' }}>
          <Upload
            beforeUpload={file => { setAvatarFile(file); return false; }}
            maxCount={1}
          >
            <Button>Chọn ảnh</Button>
          </Upload>
          <Button
            type="primary"
            style={{ marginTop: 16 }}
            loading={avatarUploading}
            onClick={async () => {
              if (!avatarFile) return;
              setAvatarUploading(true);
              try {
                const token = localStorage.getItem('authToken');
                const form = new FormData();
                form.append('Anh', avatarFile);
                await axios.put(`http://localhost:5000/api/hr/profile`, form, {
                  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                message.success('Cập nhật ảnh thành công');
                fetchProfile();
                setShowAvatarModal(false);
              } catch (e) { message.error('Lỗi tải ảnh'); }
              finally { setAvatarUploading(false); }
            }}
          >Tải lên</Button>
        </div>
      </Modal>

      <Modal title="Sửa thông tin" open={showEditModal} onCancel={() => setShowEditModal(false)} footer={null}>
        <Form
          layout="vertical"
          initialValues={{ SDT: userInfo.SDT, Email: userInfo.Email, DiaChi: userInfo.DiaChi }}
          onFinish={handleUpdateProfile}
        >
          <Form.Item name="SDT" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="Email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="DiaChi" label="Địa chỉ" rules={[{ required: true }]}><Input.TextArea /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={editLoading} block>Cập nhật</Button></Form.Item>
        </Form>
      </Modal>

      <Modal title="Xin nghỉ phép" open={showLeaveModal} onCancel={() => setShowLeaveModal(false)} footer={null}>
        <Form layout="vertical" onFinish={handleSubmitLeave}>
          <Form.Item name="LoaiDon" label="Loại đơn" initialValue="Nghi_phep">
            <Select>
              <Select.Option value="Nghi_phep">Nghỉ phép (Có lương)</Select.Option>
              <Select.Option value="Nghi_khong_phep">Nghỉ không phép (Trừ lương)</Select.Option>
              <Select.Option value="Thai_san">Nghỉ thai sản (BHXH trả)</Select.Option>
              <Select.Option value="Om_dau">Nghỉ ốm/Bảo hiểm (BHXH trả)</Select.Option>
              <Select.Option value="Nghi_viec">Hợp đồng / Nghỉ việc</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dates" label="Thời gian"><DatePicker.RangePicker /></Form.Item>
          <Form.Item name="LyDo" label="Lý do"><Input.TextArea /></Form.Item>
          <Form.Item label="Minh chứng (nếu có)">
            <Upload
              fileList={leaveFileList}
              onChange={({ fileList }) => setLeaveFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
            >
              <Button icon={<PrinterOutlined />}>Chọn file (Ảnh/PDF)</Button>
            </Upload>
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={leaveSubmitting} block>Gửi</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;