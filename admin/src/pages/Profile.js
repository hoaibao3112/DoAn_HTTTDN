import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Modal, Form, Input, Upload, DatePicker, Select, Button
} from 'antd';
import dayjs from 'dayjs';
import html2pdf from 'html2pdf.js';

const API = 'http://localhost:5000/api/hr';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + 'đ';
const fmtShort = (n) => {
  const v = Math.round(n || 0);
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' tr';
  if (v >= 1_000) return Math.round(v / 1_000) + 'k';
  return v + 'đ';
};

const statusColors = {
  Di_lam: '#4CAF50', Nghi_phep: '#2196F3', Nghi_khong_phep: '#F44336',
  Tre: '#FF9800', Ve_som: '#FFC107', Tre_Ve_som: '#FF5722',
  Thai_san: '#9C27B0', Om_dau: '#E91E63', Chua_cham_cong: '#e0e0e0',
};
const statusLabels = {
  Di_lam: 'Đi làm', Nghi_phep: 'Nghỉ phép', Nghi_khong_phep: 'Nghỉ KP',
  Tre: 'Trễ', Ve_som: 'Về sớm', Tre_Ve_som: 'Trễ & Sớm',
  Thai_san: 'Thai sản', Om_dau: 'Ốm', Chua_cham_cong: '',
};

const Profile = () => {
  const token = localStorage.getItem('authToken');
  const headers = { Authorization: `Bearer ${token}` };

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayAtt, setTodayAtt] = useState(null);
  const [attLoading, setAttLoading] = useState(false);
  const [monthAtt, setMonthAtt] = useState([]);
  const [salary, setSalary] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);

  // Modals
  const [showPwd, setShowPwd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showSalaryDetail, setShowSalaryDetail] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [leaveFileList, setLeaveFileList] = useState([]);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  const getAvatarSrc = (anh) => {
    if (!anh) return null;
    if (anh.startsWith('http')) return anh;
    const clean = anh.replace(/^\/+/, '');
    return `${apiBase}/${clean.startsWith('uploads/') ? clean : 'uploads/nhanvien/' + clean}`;
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/profile`, { headers });
      if (res.data.success) setUserInfo(res.data.data);
    } catch { }
    setLoading(false);
  }, []);

  const fetchToday = useCallback(async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const res = await axios.get(`${API}/my-attendance`, {
        headers,
        params: { startDate: today, endDate: today }
      });
      if (res.data.success && res.data.data.length > 0)
        setTodayAtt(res.data.data[0]);
      else setTodayAtt(null);
    } catch { }
  }, []);

  const fetchMonthAtt = useCallback(async (m, y) => {
    try {
      const start = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const end = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;
      const res = await axios.get(`${API}/my-attendance`, {
        headers,
        params: { startDate: start, endDate: end }
      });
      if (res.data.success) setMonthAtt(res.data.data || []);
      else setMonthAtt([]);
    } catch { setMonthAtt([]); }
  }, []);

  const fetchSalary = useCallback(async (m, y) => {
    setSalaryLoading(true);
    try {
      const res = await axios.get(`${API}/my-salary`, {
        headers, params: { thang: m, nam: y }
      });
      setSalary(res.data.success ? res.data.data : null);
    } catch { setSalary(null); }
    setSalaryLoading(false);
  }, []);

  const fetchSalaryHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/my-salary-history`, { headers });
      if (res.data.success) setSalaryHistory(res.data.data || []);
    } catch { }
  }, []);

  const fetchLeave = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/my-leave`, { headers });
      if (res.data.success) setLeaveHistory(res.data.data || []);
    } catch { }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchToday();
    fetchLeave();
    fetchSalaryHistory();
  }, []);

  useEffect(() => {
    fetchMonthAtt(viewMonth, viewYear);
    fetchSalary(viewMonth, viewYear);
  }, [viewMonth, viewYear]);

  const handleCheckin = async () => {
    setAttLoading(true);
    try {
      const res = await axios.post(`${API}/checkin`, {
        Ngay: dayjs().format('YYYY-MM-DD'),
        GioVao: dayjs().format('HH:mm:ss'),
        GhiChu: 'Vào ca'
      }, { headers });
      if (res.data.success) { alert(res.data.message || 'Chấm công vào thành công!'); fetchToday(); }
    } catch (e) { alert(e.response?.data?.message || 'Lỗi chấm công!'); }
    setAttLoading(false);
  };

  const handleCheckout = async () => {
    setAttLoading(true);
    try {
      const res = await axios.post(`${API}/checkout`, {
        Ngay: dayjs().format('YYYY-MM-DD'),
        GioRa: dayjs().format('HH:mm:ss'),
        GhiChu: 'Ra ca'
      }, { headers });
      if (res.data.success) { alert(res.data.message || 'Chấm công ra thành công!'); fetchToday(); }
    } catch (e) { alert(e.response?.data?.message || 'Lỗi chấm công!'); }
    setAttLoading(false);
  };

  const handlePwdChange = async (values) => {
    setPwdLoading(true);
    try {
      await axios.put('http://localhost:5000/api/accounts/change-password',
        { oldPassword: values.oldPassword, newPassword: values.newPassword },
        { headers });
      alert('Đổi mật khẩu thành công!');
      setShowPwd(false);
    } catch (e) { alert(e.response?.data?.error || 'Đổi mật khẩu thất bại!'); }
    setPwdLoading(false);
  };

  const handleUpdateProfile = async (values) => {
    setEditLoading(true);
    try {
      const res = await axios.put(`${API}/profile`, values, { headers });
      if (res.data.success) { alert('Cập nhật thành công!'); setShowEdit(false); fetchProfile(); }
    } catch { alert('Lỗi cập nhật!'); }
    setEditLoading(false);
  };

  const handleSubmitLeave = async (values) => {
    setLeaveSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('LoaiDon', values.LoaiDon);
      fd.append('NgayBatDau', values.dates[0].format('YYYY-MM-DD'));
      fd.append('NgayKetThuc', values.dates[1].format('YYYY-MM-DD'));
      fd.append('LyDo', values.LyDo || '');
      if (leaveFileList.length > 0) fd.append('MinhChung', leaveFileList[0].originFileObj);
      const res = await axios.post(`${API}/xin-nghi-phep`, fd, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert('Gửi đơn thành công!');
        setShowLeave(false);
        setLeaveFileList([]);
        fetchLeave();
      }
    } catch (e) { alert(e.response?.data?.message || 'Gửi đơn thất bại!'); }
    setLeaveSubmitting(false);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('Anh', avatarFile);
      await axios.put(`${API}/profile`, fd, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      alert('Cập nhật ảnh thành công!');
      setShowAvatar(false);
      fetchProfile();
    } catch { alert('Lỗi tải ảnh!'); }
    setAvatarUploading(false);
  };

  // Thống kê chấm công tháng
  const attMap = {};
  monthAtt.forEach(a => {
    const d = new Date(a.Ngay).getDate();
    attMap[d] = a.TrangThai || 'Di_lam';
  });
  const worked = monthAtt.filter(a => ['Di_lam', 'Tre', 'Ve_som', 'Tre_Ve_som'].includes(a.TrangThai)).length;
  const lateCount = monthAtt.filter(a => ['Tre', 'Tre_Ve_som'].includes(a.TrangThai)).length;
  const absentCount = monthAtt.filter(a => a.TrangThai === 'Nghi_khong_phep').length;
  const leaveCount = monthAtt.filter(a => a.TrangThai === 'Nghi_phep').length;
  const totalOT = monthAtt.reduce((s, a) => s + parseFloat(a.SoGioTangCa || 0), 0);
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Salary breakdown
  const luongCB = parseFloat(salary?.LuongCoBan || 0);
  const dailyRate = luongCB / 26;
  const hourlyRate = luongCB / 208;
  const basePay = dailyRate * parseFloat(salary?.SoNgayLam || 0);
  const otPay = parseFloat(salary?.SoGioTangCa || 0) * hourlyRate * 1.5;

  const handlePrintPDF = (r) => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="font-family:Arial,sans-serif;padding:40px;max-width:620px;margin:0 auto;color:#222;">
        <div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #1976d2;padding-bottom:16px;">
          <div style="font-size:13px;color:#888;margin-bottom:4px;">PHIẾU LƯƠNG</div>
          <div style="font-size:22px;font-weight:900;color:#1565c0;">THÁNG ${r.Thang}/${r.Nam}</div>
          <div style="font-size:12px;color:#aaa;margin-top:4px;">Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:13px;">
          <tr>
            <td style="padding:5px 0;color:#888;width:110px;">Họ và tên:</td>
            <td style="padding:5px 0;font-weight:700;">${userInfo.HoTen}</td>
            <td style="padding:5px 0;color:#888;width:90px;">Chức vụ:</td>
            <td style="padding:5px 0;font-weight:700;">${userInfo.ChucVu || '—'}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#888;">Mã NV:</td>
            <td style="padding:5px 0;font-weight:700;">${userInfo.MaNV}</td>
            <td style="padding:5px 0;color:#888;">Ngày công:</td>
            <td style="padding:5px 0;font-weight:700;color:#1976d2;">${r.SoNgayLam} / 26 ngày</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#888;">Tăng ca:</td>
            <td style="padding:5px 0;font-weight:700;color:#e65100;">${r.SoGioTangCa || 0} giờ</td>
            <td style="padding:5px 0;color:#888;">Trạng thái:</td>
            <td style="padding:5px 0;font-weight:700;color:${r.TrangThai === 'Da_chi_tra' ? '#2e7d32' : '#e65100'};">
              ${r.TrangThai === 'Da_chi_tra' ? '✓ Đã chi trả' : '○ Chưa chi trả'}
            </td>
          </tr>
        </table>

        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#1976d2;color:#fff;">
              <th style="padding:10px 12px;text-align:left;font-weight:700;">Khoản mục</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;">Ghi chú</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;min-width:110px;">Số tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:9px 12px;">Lương cơ bản (1 tháng)</td>
              <td style="padding:9px 12px;text-align:right;color:#888;font-size:12px;">Theo hợp đồng</td>
              <td style="padding:9px 12px;text-align:right;font-weight:700;">${fmt(r.LuongCoBan)}</td>
            </tr>
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:9px 12px;color:#1976d2;">+ Lương theo ${r.SoNgayLam} ngày công</td>
              <td style="padding:9px 12px;text-align:right;color:#888;font-size:12px;">${fmt(parseFloat(r.LuongCoBan) / 26)}/ngày × ${r.SoNgayLam}</td>
              <td style="padding:9px 12px;text-align:right;font-weight:700;color:#1976d2;">${fmt((parseFloat(r.LuongCoBan) / 26) * r.SoNgayLam)}</td>
            </tr>
            ${parseFloat(r.SoGioTangCa || 0) > 0 ? `
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:9px 12px;color:#e65100;">+ Tăng ca (${r.SoGioTangCa}h × 1.5)</td>
              <td style="padding:9px 12px;text-align:right;color:#888;font-size:12px;">${fmt(parseFloat(r.LuongCoBan) / 208)}/giờ × ${r.SoGioTangCa}h × 1.5</td>
              <td style="padding:9px 12px;text-align:right;font-weight:700;color:#e65100;">${fmt(r.SoGioTangCa * (parseFloat(r.LuongCoBan) / 208) * 1.5)}</td>
            </tr>` : ''}
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:9px 12px;">+ Phụ cấp</td>
              <td style="padding:9px 12px;text-align:right;color:#888;font-size:12px;">Phụ cấp cố định</td>
              <td style="padding:9px 12px;text-align:right;font-weight:700;">${fmt(r.PhuCap)}</td>
            </tr>
            ${parseFloat(r.Thuong || 0) > 0 ? `
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:9px 12px;color:#2e7d32;">+ Thưởng chuyên cần</td>
              <td style="padding:9px 12px;text-align:right;color:#888;font-size:12px;">Đủ 26 công, 0 lần trễ/vắng</td>
              <td style="padding:9px 12px;text-align:right;font-weight:700;color:#2e7d32;">${fmt(r.Thuong)}</td>
            </tr>` : ''}
            ${parseFloat(r.Phat || 0) > 0 ? `
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:9px 12px;color:#c62828;">− Khấu trừ (đi trễ/về sớm)</td>
              <td style="padding:9px 12px;text-align:right;color:#888;font-size:12px;">20.000đ/lần vi phạm</td>
              <td style="padding:9px 12px;text-align:right;font-weight:700;color:#c62828;">−${fmt(r.Phat)}</td>
            </tr>` : ''}
            <tr style="background:#e3f2fd;">
              <td colspan="2" style="padding:14px 12px;font-weight:700;font-size:15px;color:#0d47a1;">TỔNG LƯƠNG THỰC NHẬN</td>
              <td style="padding:14px 12px;text-align:right;font-weight:900;font-size:18px;color:#0d47a1;">${fmt(r.TongLuong)}</td>
            </tr>
          </tbody>
        </table>

        <div style="display:flex;justify-content:space-between;margin-top:36px;font-size:13px;text-align:center;">
          <div>
            <div style="color:#888;margin-bottom:44px;">Nhân viên</div>
            <div style="border-top:1px solid #555;padding-top:4px;min-width:140px;">${userInfo.HoTen}</div>
          </div>
          <div>
            <div style="color:#888;margin-bottom:44px;">Người phụ trách</div>
            <div style="border-top:1px solid #555;padding-top:4px;min-width:140px;">Ký tên &amp; Đóng dấu</div>
          </div>
        </div>
      </div>
    `;

    html2pdf().set({
      margin: 12,
      filename: `PhieuLuong_${userInfo.HoTen.replace(/\s+/g, '_')}_T${r.Thang}_${r.Nam}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(el).save();
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
  const years = Array.from({ length: 5 }, (_, i) => ({ value: 2023 + i, label: `${2023 + i}` }));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#1976d2' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: 32, marginRight: 12 }}></i>
      <span style={{ fontSize: 16 }}>Đang tải thông tin...</span>
    </div>
  );
  if (!userInfo) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Không tìm thấy thông tin nhân viên!</div>
  );

  const isPaid = salary?.TrangThai === 'Da_chi_tra';
  const avatarSrc = getAvatarSrc(userInfo.Anh);

  return (
    <div className="thongke-page">
      <div className="thongke-header">
        <h1><i className="fas fa-user-circle"></i> Hồ sơ nhân viên</h1>
      </div>

      <div className="thongke-content" style={{ padding: '0 0 40px' }}>

        {/* ====== TOP: PROFILE + CHECKIN ====== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Card: Thông tin cá nhân */}
          <div style={card}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: avatarSrc ? `url(${avatarSrc}) center/cover` : '#1976d2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 36, border: '3px solid #e3f2fd'
                }}>
                  {!avatarSrc && <i className="fas fa-user"></i>}
                </div>
                <button
                  onClick={() => setShowAvatar(true)}
                  style={{
                    position: 'absolute', bottom: 0, right: -4,
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#fff', border: '1px solid #ddd',
                    cursor: 'pointer', fontSize: 12, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Thay ảnh"
                >
                  <i className="fas fa-camera" style={{ color: '#555' }}></i>
                </button>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1a237e', marginBottom: 2 }}>
                  {userInfo.HoTen}
                </div>
                <div style={{ fontSize: 13, color: '#1976d2', fontWeight: 600, marginBottom: 8 }}>
                  {userInfo.ChucVu || 'Nhân viên'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 13 }}>
                  <InfoLine icon="fa-id-badge" label="Mã NV" value={userInfo.MaNV} />
                  <InfoLine icon="fa-phone" label="SĐT" value={userInfo.SDT || '—'} />
                  <InfoLine icon="fa-envelope" label="Email" value={userInfo.Email || '—'} />
                  <InfoLine icon="fa-calendar-alt" label="Vào làm" value={userInfo.NgayVaoLam ? new Date(userInfo.NgayVaoLam).toLocaleDateString('vi-VN') : '—'} />
                  <InfoLine icon="fa-map-marker-alt" label="Địa chỉ" value={userInfo.DiaChi || '—'} />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <PillBtn icon="fa-edit" label="Sửa TT" color="#1976d2" onClick={() => setShowEdit(true)} />
              <PillBtn icon="fa-lock" label="Đổi MK" color="#6a1b9a" onClick={() => setShowPwd(true)} />
              <PillBtn icon="fa-umbrella-beach" label="Xin nghỉ" color="#e65100" onClick={() => setShowLeave(true)} />
            </div>
          </div>

          {/* Card: Chấm công hôm nay */}
          <div style={card}>
            <SectionTitle icon="fa-clock" title={`Chấm công hôm nay — ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}`} />

            <div style={{ display: 'flex', gap: 16, marginBottom: 16, marginTop: 8 }}>
              <AttCard
                label="Giờ vào"
                value={todayAtt?.GioVao ? todayAtt.GioVao.slice(0, 5) : '—'}
                icon="fa-sign-in-alt"
                color="#2e7d32"
              />
              <AttCard
                label="Giờ ra"
                value={todayAtt?.GioRa ? todayAtt.GioRa.slice(0, 5) : '—'}
                icon="fa-sign-out-alt"
                color="#c62828"
              />
              <AttCard
                label="Trạng thái"
                value={todayAtt ? (statusLabels[todayAtt.TrangThai] || todayAtt.TrangThai) : 'Chưa vào'}
                icon="fa-info-circle"
                color={todayAtt ? (statusColors[todayAtt.TrangThai] || '#888') : '#9e9e9e'}
              />
            </div>

            {/* Nút chấm công */}
            {!todayAtt && (
              <button
                onClick={handleCheckin}
                disabled={attLoading}
                style={{ ...bigBtn, background: '#2e7d32' }}
              >
                <i className="fas fa-sign-in-alt"></i>
                {attLoading ? 'Đang xử lý...' : 'Chấm công VÀO'}
              </button>
            )}
            {todayAtt && !todayAtt.GioRa && (
              <button
                onClick={handleCheckout}
                disabled={attLoading}
                style={{ ...bigBtn, background: '#c62828' }}
              >
                <i className="fas fa-sign-out-alt"></i>
                {attLoading ? 'Đang xử lý...' : 'Chấm công RA'}
              </button>
            )}
            {todayAtt && todayAtt.GioRa && (
              <div style={{
                textAlign: 'center', padding: '10px 0', color: '#2e7d32',
                fontWeight: 700, fontSize: 15
              }}>
                <i className="fas fa-check-circle"></i> Đã hoàn thành ca làm hôm nay
              </div>
            )}
          </div>
        </div>

        {/* ====== FILTER THÁNG ====== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, background: '#f8f9fa', padding: '12px 16px', borderRadius: 8, border: '1px solid #e0e0e0' }}>
          <i className="fas fa-filter" style={{ color: '#1976d2' }}></i>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>Xem tháng:</span>
          {months.map(m => (
            <button
              key={m.value}
              onClick={() => setViewMonth(m.value)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 13,
                border: `1px solid ${viewMonth === m.value ? '#1976d2' : '#ddd'}`,
                background: viewMonth === m.value ? '#1976d2' : '#fff',
                color: viewMonth === m.value ? '#fff' : '#555',
                cursor: 'pointer', fontWeight: viewMonth === m.value ? 700 : 400
              }}
            >
              T{m.value}
            </button>
          ))}
          <select
            value={viewYear}
            onChange={e => setViewYear(Number(e.target.value))}
            style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, cursor: 'pointer' }}
          >
            {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
          </select>
        </div>

        {/* ====== ROW 2: LƯƠNG + CHẤM CÔNG THÁNG ====== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Card: Lương tháng */}
          <div style={card}>
            <SectionTitle icon="fa-money-bill-wave" title={`Lương tháng ${viewMonth}/${viewYear}`} />

            {salaryLoading && (
              <div style={{ textAlign: 'center', padding: 30, color: '#1976d2' }}>
                <i className="fas fa-spinner fa-spin"></i> Đang tải...
              </div>
            )}

            {!salaryLoading && !salary && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#aaa' }}>
                <i className="fas fa-file-invoice-dollar" style={{ fontSize: 36, marginBottom: 8 }}></i>
                <div style={{ fontSize: 13 }}>Chưa có dữ liệu lương tháng này.</div>
                <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>Quản lý chưa tính lương cho tháng này.</div>
              </div>
            )}

            {!salaryLoading && salary && (
              <>
                {/* Trạng thái chi trả */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: isPaid ? '#e8f5e9' : '#fff3e0',
                  color: isPaid ? '#2e7d32' : '#e65100',
                  border: `1px solid ${isPaid ? '#a5d6a7' : '#ffcc80'}`,
                  marginBottom: 14
                }}>
                  <i className={`fas ${isPaid ? 'fa-check-circle' : 'fa-clock'}`}></i>
                  {isPaid ? 'Đã chi trả' : 'Chưa chi trả'}
                </div>

                {/* Tổng lương nổi bật */}
                <div style={{
                  background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                  borderRadius: 10, padding: '16px 20px', color: '#fff',
                  marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Tổng lương thực nhận</div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{fmt(salary.TongLuong)}</div>
                  </div>
                  <i className="fas fa-wallet" style={{ fontSize: 36, opacity: 0.3 }}></i>
                </div>

                {/* Breakdown */}
                <div style={{ fontSize: 13 }}>
                  <SalaryRow label={`Lương công (${salary.SoNgayLam} ngày × ${fmt(dailyRate)}/ngày)`} value={fmt(basePay)} color="#1976d2" />
                  {parseFloat(salary.SoGioTangCa || 0) > 0 &&
                    <SalaryRow label={`Tăng ca (${salary.SoGioTangCa}h × 1.5)`} value={fmt(otPay)} color="#e65100" />
                  }
                  <SalaryRow label="Phụ cấp" value={fmt(salary.PhuCap)} />
                  {parseFloat(salary.Thuong || 0) > 0 &&
                    <SalaryRow label="Thưởng chuyên cần" value={fmt(salary.Thuong)} color="#2e7d32" />
                  }
                  {parseFloat(salary.Phat || 0) > 0 &&
                    <SalaryRow label="Khấu trừ (trễ/sớm)" value={`−${fmt(salary.Phat)}`} color="#c62828" />
                  }
                </div>

                <button
                  onClick={() => { setSelectedSalary(salary); setShowSalaryDetail(true); }}
                  style={{ marginTop: 12, background: 'none', border: '1px solid #1976d2', color: '#1976d2', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  <i className="fas fa-eye"></i> Xem chi tiết phiếu lương
                </button>
              </>
            )}
          </div>

          {/* Card: Thống kê chấm công tháng */}
          <div style={card}>
            <SectionTitle icon="fa-calendar-check" title={`Chấm công tháng ${viewMonth}/${viewYear}`} />

            {/* Stat chips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <StatChip icon="fa-check" label="Ngày đi làm" value={`${worked}/26`} color="#2e7d32" bg="#e8f5e9" />
              <StatChip icon="fa-clock" label="Giờ tăng ca" value={`${totalOT}h`} color="#e65100" bg="#fff3e0" />
              <StatChip icon="fa-exclamation-triangle" label="Đi trễ/về sớm" value={lateCount} color="#FF9800" bg="#fff8e1" />
              <StatChip icon="fa-times-circle" label="Vắng không phép" value={absentCount} color="#c62828" bg="#ffebee" />
              {leaveCount > 0 && <StatChip icon="fa-umbrella-beach" label="Nghỉ phép" value={leaveCount} color="#1976d2" bg="#e3f2fd" />}
            </div>

            {/* Mini calendar */}
            <div style={{ fontSize: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 }}>
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontWeight: 700, color: d === 'CN' ? '#c62828' : '#555', fontSize: 11 }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {/* Offset */}
                {Array.from({ length: new Date(viewYear, viewMonth - 1, 1).getDay() }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const weekday = new Date(viewYear, viewMonth - 1, day).getDay();
                  const isSun = weekday === 0;
                  const isToday = viewMonth === now.getMonth() + 1 && viewYear === now.getFullYear() && day === now.getDate();
                  const status = attMap[day];
                  const bg = isSun ? '#ffebee' : status ? statusColors[status] : '#f5f5f5';
                  const color = isSun ? '#c62828' : status ? '#fff' : '#ccc';
                  return (
                    <div
                      key={day}
                      title={status ? statusLabels[status] : (isSun ? 'Chủ nhật' : '')}
                      style={{
                        textAlign: 'center', borderRadius: 4, padding: '3px 0',
                        background: isToday ? '#ff6f00' : bg,
                        color: isToday ? '#fff' : color,
                        fontWeight: isToday ? 800 : 400,
                        fontSize: 11, border: isToday ? '1px solid #e65100' : 'none'
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                {[
                  ['Di_lam', 'Đi làm'], ['Tre', 'Trễ'], ['Nghi_phep', 'Nghỉ phép'],
                  ['Nghi_khong_phep', 'Vắng KP']
                ].map(([k, label]) => (
                  <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: statusColors[k], display: 'inline-block' }}></span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ====== LỊCH SỬ LƯƠNG ====== */}
        <div style={{ ...card, marginBottom: 20 }}>
          <SectionTitle icon="fa-history" title="Lịch sử lương" />
          {salaryHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>Chưa có dữ liệu lương</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    {['Kỳ lương', 'Lương CB', 'Ngày công', 'Tăng ca', 'Phụ cấp', 'Thưởng', 'Phạt', 'Tổng nhận', 'Trạng thái', ''].map(h => (
                      <th key={h} style={{ padding: '10px 8px', textAlign: h === 'Tổng nhận' ? 'right' : 'center', color: '#333', fontWeight: 700, borderBottom: '2px solid #e0e0e0', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {salaryHistory.map((row, idx) => {
                    const paid = row.TrangThai === 'Da_chi_tra';
                    return (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e3f2fd'}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                      >
                        <td style={hTd}><b>T{row.Thang}/{row.Nam}</b></td>
                        <td style={hTd}>{fmt(row.LuongCoBan)}</td>
                        <td style={{ ...hTd, color: '#1976d2', fontWeight: 700 }}>{row.SoNgayLam}</td>
                        <td style={{ ...hTd, color: row.SoGioTangCa > 0 ? '#e65100' : '#bbb' }}>{row.SoGioTangCa > 0 ? `+${row.SoGioTangCa}h` : '—'}</td>
                        <td style={hTd}>{fmt(row.PhuCap)}</td>
                        <td style={{ ...hTd, color: row.Thuong > 0 ? '#2e7d32' : '#bbb' }}>{row.Thuong > 0 ? fmt(row.Thuong) : '—'}</td>
                        <td style={{ ...hTd, color: row.Phat > 0 ? '#c62828' : '#bbb' }}>{row.Phat > 0 ? `-${fmt(row.Phat)}` : '—'}</td>
                        <td style={{ ...hTd, textAlign: 'right', fontWeight: 800, color: '#1565c0', fontSize: 14 }}>{fmt(row.TongLuong)}</td>
                        <td style={hTd}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                            background: paid ? '#e8f5e9' : '#fff3e0',
                            color: paid ? '#2e7d32' : '#e65100'
                          }}>
                            {paid ? '✓ Đã trả' : '○ Chưa trả'}
                          </span>
                        </td>
                        <td style={hTd}>
                          <button
                            onClick={() => { setSelectedSalary(row); setShowSalaryDetail(true); }}
                            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ====== LỊCH SỬ XIN NGHỈ ====== */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionTitle icon="fa-umbrella-beach" title="Lịch sử xin nghỉ phép" />
            <button
              onClick={() => setShowLeave(true)}
              style={{ background: '#e65100', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
            >
              <i className="fas fa-plus"></i> Gửi đơn mới
            </button>
          </div>
          {leaveHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>Chưa có đơn xin nghỉ nào</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  {['Loại đơn', 'Ngày bắt đầu', 'Ngày kết thúc', 'Số ngày', 'Lý do', 'Trạng thái'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', textAlign: 'center', color: '#333', fontWeight: 700, borderBottom: '2px solid #e0e0e0', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaveHistory.slice(0, 10).map((row, idx) => {
                  const ngayBD = new Date(row.NgayBatDau);
                  const ngayKT = new Date(row.NgayKetThuc);
                  const soNgay = Math.ceil((ngayKT - ngayBD) / 86400000) + 1;
                  const statusMap = { Cho_duyet: { label: 'Chờ duyệt', color: '#e65100', bg: '#fff3e0' }, Da_duyet: { label: 'Đã duyệt', color: '#2e7d32', bg: '#e8f5e9' }, Tu_choi: { label: 'Từ chối', color: '#c62828', bg: '#ffebee' } };
                  const loaiMap = { Nghi_phep: 'Nghỉ phép', Nghi_khong_phep: 'Nghỉ KP', Thai_san: 'Thai sản', Om_dau: 'Ốm đau', Nghi_viec: 'Nghỉ việc' };
                  const st = statusMap[row.TrangThai] || { label: row.TrangThai, color: '#888', bg: '#f5f5f5' };
                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={hTd}>{loaiMap[row.LoaiDon] || row.LoaiDon}</td>
                      <td style={hTd}>{ngayBD.toLocaleDateString('vi-VN')}</td>
                      <td style={hTd}>{ngayKT.toLocaleDateString('vi-VN')}</td>
                      <td style={{ ...hTd, fontWeight: 700, color: '#1976d2' }}>{soNgay} ngày</td>
                      <td style={{ ...hTd, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.LyDo || '—'}</td>
                      <td style={hTd}>
                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ===== MODAL: CHI TIẾT LƯƠNG ===== */}
      {showSalaryDetail && selectedSalary && (
        <div style={overlay} onClick={() => setShowSalaryDetail(false)}>
          <div style={{ ...modalBox, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#1976d2', color: '#fff', padding: '18px 24px', borderRadius: '10px 10px 0 0' }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}><i className="fas fa-file-invoice-dollar"></i> Phiếu lương</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 3 }}>
                {userInfo.HoTen} — Tháng {selectedSalary.Thang}/{selectedSalary.Nam}
              </div>
            </div>
            <div style={{ padding: 24 }}>
              {/* Header info */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 16, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 12 }}>
                  <div style={{ color: '#888' }}>Chức vụ</div>
                  <div style={{ fontWeight: 700 }}>{userInfo.ChucVu || '—'}</div>
                </div>
                <div style={{ fontSize: 12 }}>
                  <div style={{ color: '#888' }}>Ngày công</div>
                  <div style={{ fontWeight: 700, color: '#1976d2' }}>{selectedSalary.SoNgayLam} / 26 ngày</div>
                </div>
                <div style={{ fontSize: 12 }}>
                  <div style={{ color: '#888' }}>Tăng ca</div>
                  <div style={{ fontWeight: 700, color: '#e65100' }}>{selectedSalary.SoGioTangCa || 0} giờ</div>
                </div>
                <div style={{ fontSize: 12 }}>
                  <div style={{ color: '#888' }}>Trạng thái</div>
                  <div style={{ fontWeight: 700, color: selectedSalary.TrangThai === 'Da_chi_tra' ? '#2e7d32' : '#e65100' }}>
                    {selectedSalary.TrangThai === 'Da_chi_tra' ? '✓ Đã chi trả' : '○ Chưa chi trả'}
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              {[
                { label: 'Lương cơ bản (hợp đồng)', value: fmt(selectedSalary.LuongCoBan), sub: null },
                { label: `Lương theo ngày công (${selectedSalary.SoNgayLam} ngày)`, value: fmt((parseFloat(selectedSalary.LuongCoBan) / 26) * selectedSalary.SoNgayLam), sub: `${fmt(parseFloat(selectedSalary.LuongCoBan) / 26)}/ngày × ${selectedSalary.SoNgayLam}`, color: '#1976d2', plus: true },
                ...(parseFloat(selectedSalary.SoGioTangCa || 0) > 0 ? [{ label: `Tăng ca (${selectedSalary.SoGioTangCa}h × 1.5)`, value: fmt(parseFloat(selectedSalary.SoGioTangCa) * (parseFloat(selectedSalary.LuongCoBan) / 208) * 1.5), sub: `${fmt(parseFloat(selectedSalary.LuongCoBan) / 208)}/giờ × ${selectedSalary.SoGioTangCa}h × 1.5`, color: '#e65100', plus: true }] : []),
                { label: 'Phụ cấp', value: fmt(selectedSalary.PhuCap), plus: true },
                ...(parseFloat(selectedSalary.Thuong || 0) > 0 ? [{ label: 'Thưởng chuyên cần', value: fmt(selectedSalary.Thuong), color: '#2e7d32', plus: true, sub: 'Đủ 26 công, không trễ/vắng' }] : []),
                ...(parseFloat(selectedSalary.Phat || 0) > 0 ? [{ label: 'Khấu trừ (đi trễ/về sớm)', value: `−${fmt(selectedSalary.Phat)}`, color: '#c62828', sub: '20.000đ/lần vi phạm' }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: item.color || '#333' }}>
                      {item.plus ? <span style={{ color: item.color || '#388e3c', marginRight: 4 }}>+</span> : null}
                      {item.label}
                    </div>
                    {item.sub && <div style={{ fontSize: 11, color: '#9e9e9e' }}>{item.sub}</div>}
                  </div>
                  <div style={{ fontWeight: 700, color: item.color || '#333', fontSize: 13 }}>{item.value}</div>
                </div>
              ))}

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#e3f2fd', borderRadius: 8, marginTop: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0d47a1' }}>
                  <i className="fas fa-equals"></i> Tổng lương thực nhận
                </div>
                <div style={{ fontWeight: 900, fontSize: 20, color: '#0d47a1' }}>{fmt(selectedSalary.TongLuong)}</div>
              </div>

              {/* Print btn */}
              <button
                onClick={() => handlePrintPDF(selectedSalary)}
                style={{ marginTop: 12, width: '100%', background: '#546e7a', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 0', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
              >
                <i className="fas fa-file-pdf"></i> Tải phiếu lương (PDF)
              </button>
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid #e0e0e0', textAlign: 'right' }}>
              <button onClick={() => setShowSalaryDetail(false)} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: ĐỔI MẬT KHẨU ===== */}
      <Modal title="Đổi mật khẩu" open={showPwd} onCancel={() => setShowPwd(false)} footer={null} width={400}>
        <Form layout="vertical" onFinish={handlePwdChange}>
          <Form.Item name="oldPassword" label="Mật khẩu cũ" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirm" label="Xác nhận mật khẩu" dependencies={['newPassword']}
            rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, v) { return v === getFieldValue('newPassword') ? Promise.resolve() : Promise.reject('Mật khẩu không khớp!'); } })]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={pwdLoading} block>Cập nhật mật khẩu</Button>
        </Form>
      </Modal>

      {/* ===== MODAL: SỬA THÔNG TIN ===== */}
      <Modal title="Sửa thông tin cá nhân" open={showEdit} onCancel={() => setShowEdit(false)} footer={null} width={420}>
        <Form layout="vertical" initialValues={{ SDT: userInfo.SDT, Email: userInfo.Email, DiaChi: userInfo.DiaChi }} onFinish={handleUpdateProfile}>
          <Form.Item name="SDT" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="Email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="DiaChi" label="Địa chỉ"><Input.TextArea rows={2} /></Form.Item>
          <Button type="primary" htmlType="submit" loading={editLoading} block>Lưu thay đổi</Button>
        </Form>
      </Modal>

      {/* ===== MODAL: XIN NGHỈ PHÉP ===== */}
      <Modal title="Gửi đơn xin nghỉ" open={showLeave} onCancel={() => setShowLeave(false)} footer={null} width={460}>
        <Form layout="vertical" onFinish={handleSubmitLeave}>
          <Form.Item name="LoaiDon" label="Loại đơn" initialValue="Nghi_phep" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Nghi_phep">Nghỉ phép (Có lương)</Select.Option>
              <Select.Option value="Nghi_khong_phep">Nghỉ không phép (Trừ lương)</Select.Option>
              <Select.Option value="Thai_san">Nghỉ thai sản (BHXH trả)</Select.Option>
              <Select.Option value="Om_dau">Nghỉ ốm/Bảo hiểm</Select.Option>
              <Select.Option value="Nghi_viec">Hợp đồng / Nghỉ việc</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dates" label="Thời gian nghỉ" rules={[{ required: true, message: 'Chọn thời gian' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={d => d && d < dayjs().startOf('day')} />
          </Form.Item>
          <Form.Item name="LyDo" label="Lý do" rules={[{ required: true, message: 'Nhập lý do' }]}>
            <Input.TextArea rows={3} placeholder="Nêu rõ lý do xin nghỉ..." />
          </Form.Item>
          <Form.Item label="Minh chứng (ảnh/PDF, nếu có)">
            <Upload fileList={leaveFileList} onChange={({ fileList }) => setLeaveFileList(fileList)} beforeUpload={() => false} maxCount={1} listType="picture">
              <Button>Chọn file</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={leaveSubmitting} block>Gửi đơn</Button>
        </Form>
      </Modal>

      {/* ===== MODAL: THAY ẢNH ===== */}
      <Modal title="Thay ảnh đại diện" open={showAvatar} onCancel={() => setShowAvatar(false)} footer={null} width={360}>
        <div style={{ textAlign: 'center' }}>
          <Upload beforeUpload={f => { setAvatarFile(f); return false; }} maxCount={1} showUploadList={false}>
            <Button icon={<i className="fas fa-upload" style={{ marginRight: 6 }}></i>}>Chọn ảnh</Button>
          </Upload>
          {avatarFile && <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>Đã chọn: {avatarFile.name}</div>}
          <Button type="primary" style={{ marginTop: 16, width: '100%' }} loading={avatarUploading} disabled={!avatarFile} onClick={handleUploadAvatar}>
            Tải lên
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// ===== SUB-COMPONENTS =====

const SectionTitle = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
    <i className={`fas ${icon}`} style={{ color: '#1976d2', fontSize: 15 }}></i>
    <span style={{ fontWeight: 700, fontSize: 15, color: '#1a237e' }}>{title}</span>
  </div>
);

const InfoLine = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#444', overflow: 'hidden' }}>
    <i className={`fas ${icon}`} style={{ color: '#90a4ae', width: 14, fontSize: 11, flexShrink: 0 }}></i>
    <span style={{ color: '#888', flexShrink: 0 }}>{label}:</span>
    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
  </div>
);

const AttCard = ({ label, value, icon, color }) => (
  <div style={{ flex: 1, background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', textAlign: 'center', border: `1px solid ${color}22` }}>
    <i className={`fas ${icon}`} style={{ color, fontSize: 18, marginBottom: 4 }}></i>
    <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{label}</div>
  </div>
);

const StatChip = ({ icon, label, value, color, bg }) => (
  <div style={{ background: bg, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, flexShrink: 0 }}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#666' }}>{label}</div>
    </div>
  </div>
);

const SalaryRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
    <span style={{ color: '#555' }}>{label}</span>
    <span style={{ fontWeight: 700, color: color || '#333' }}>{value}</span>
  </div>
);

const PillBtn = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 20, border: `1px solid ${color}`,
    background: '#fff', color, cursor: 'pointer', fontWeight: 600, fontSize: 13
  }}>
    <i className={`fas ${icon}`}></i>{label}
  </button>
);

// Shared styles
const card = {
  background: '#fff', borderRadius: 12, padding: 20,
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0'
};
const bigBtn = {
  width: '100%', padding: '12px 0', color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 15,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
};
const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
};
const modalBox = {
  background: '#fff', borderRadius: 10, width: '90%',
  maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
};
const hTd = {
  padding: '9px 8px', textAlign: 'center',
  borderBottom: '1px solid #f0f0f0', fontSize: 13
};

export default Profile;
