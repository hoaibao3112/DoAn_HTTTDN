import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import '../styles/AttendancePage.css';

const API_BASE = 'http://localhost:5000/api/attendance_admin';

// Map trạng thái API sang giao diện
const statusColors = {
  Di_lam: '#4CAF50',
  Nghi_phep: '#2196F3',
  Nghi_khong_phep: '#F44336',
  Tre: '#FF9800',
  Ve_som: '#FFC107',
  Tre_Ve_som: '#FF5722',
  Thai_san: '#9C27B0',
  Om_dau: '#E91E63',
  Chua_cham_cong: '#B0BEC5',
};

const statusLabels = {
  Di_lam: 'Đi làm',
  Nghi_phep: 'Nghỉ phép',
  Nghi_khong_phep: 'Nghỉ KP',
  Tre: 'Đi trễ',
  Ve_som: 'Về sớm',
  Tre_Ve_som: 'Trễ & Sớm',
  Thai_san: 'Thai sản',
  Om_dau: 'Ốm đau',
  Chua_cham_cong: '',
};

// Thứ trong tuần
const weekdayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const getWeekday = (year, month, day) => {
  const date = new Date(year, month - 1, day);
  return weekdayLabels[date.getDay()];
};

const isSunday = (year, month, day) => getWeekday(year, month, day) === 'CN';

const AttendancePage = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [otHours, setOtHours] = useState(1);
  const [pendingChanges, setPendingChanges] = useState({});
  const [editReason, setEditReason] = useState('');

  // State cho tabs
  const [activeTab, setActiveTab] = useState('calendar');

  // State cho báo cáo bất thường
  const [abnormalReport, setAbnormalReport] = useState([]);
  const [loadingAbnormal, setLoadingAbnormal] = useState(false);

  // State cho quản lý ngày lễ
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [holidayForm, setHolidayForm] = useState({
    TenNgayLe: '',
    Ngay: '',
    HeSoLuong: 2.0,
    LoaiNgayLe: 'Quoc_gia',
    GhiChu: ''
  });

  // State cho modal lịch sử
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedMaCC, setSelectedMaCC] = useState(null);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`,
  }));
  const years = Array.from({ length: 10 }, (_, i) => ({
    value: 2023 + i,
    label: `${2023 + i}`,
  }));

  const daysInMonth = new Date(year, month, 0).getDate();
  const token = localStorage.getItem('authToken');

  // Lấy dữ liệu chấm công theo tháng/năm
  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchAttendanceData();
    }
  }, [month, year, activeTab]);

  const fetchAttendanceData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/monthly?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees(res.data);
      if (res.data.length > 0) setSelectedEmployee(res.data[0]);
      setPendingChanges({});
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setEmployees([]);
      setSelectedEmployee(null);
      setPendingChanges({});
    }
  };

  // Fetch báo cáo bất thường
  const fetchAbnormalReport = async () => {
    setLoadingAbnormal(true);
    try {
      const res = await axios.get(
        `${API_BASE}/attendance/report/abnormal?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAbnormalReport(res.data.data || []);
    } catch (err) {
      console.error('Error fetching abnormal report:', err);
      setAbnormalReport([]);
    }
    setLoadingAbnormal(false);
  };

  // Fetch danh sách ngày lễ
  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const res = await axios.get(
        `${API_BASE}/holidays?year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHolidays(res.data.data || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setHolidays([]);
    }
    setLoadingHolidays(false);
  };

  // Fetch lịch sử chỉnh sửa
  const fetchHistory = async (maCC) => {
    setLoadingHistory(true);
    setSelectedMaCC(maCC);
    try {
      const res = await axios.get(
        `${API_BASE}/attendance/${maCC}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistoryData(res.data.data || []);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('Error fetching history:', err);
      setHistoryData([]);
      setShowHistoryModal(true);
    }
    setLoadingHistory(false);
  };

  // Load data theo tab
  useEffect(() => {
    if (activeTab === 'abnormal') {
      fetchAbnormalReport();
    } else if (activeTab === 'holidays') {
      fetchHolidays();
    }
  }, [activeTab, month, year]);

  // Tạo mảng các dòng, mỗi dòng 10 ngày
  const getDayRows = () => {
    const rows = [];
    for (let i = 0; i < daysInMonth; i += 10) {
      rows.push(Array.from({ length: Math.min(10, daysInMonth - i) }, (_, j) => i + j + 1));
    }
    return rows;
  };

  // Xử lý click vào ngày để lưu thay đổi tạm thời
  const handleDayClick = (day) => {
    if (isSunday(year, month, day)) return;
    if (!selectedEmployee || !selectedStatus) {
      alert('Vui lòng chọn trạng thái trước!');
      return;
    }
    
    const ngay = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let ghiChu = '';
    
    if (selectedStatus === 'Lam_them') {
      ghiChu = `Tăng ca ${otHours} giờ`;
    }
    
    setPendingChanges((prev) => ({
      ...prev,
      [ngay]: {
        TrangThai: selectedStatus,
        SoGioTangCa: selectedStatus === 'Lam_them' ? otHours : 0,
        GhiChu: ghiChu,
      },
    }));
  };

  // Gửi toàn bộ thay đổi tạm thời lên server
  const handleSaveChanges = async () => {
    if (!selectedEmployee || Object.keys(pendingChanges).length === 0) {
      alert('Không có thay đổi để lưu!');
      return;
    }

    if (!editReason || editReason.trim() === '') {
      alert('Vui lòng nhập lý do chỉnh sửa!');
      return;
    }

    try {
      const updates = Object.entries(pendingChanges).map(([ngay, data]) => ({
        MaNV: selectedEmployee.MaNV,
        Ngay: ngay,
        TrangThai: data.TrangThai,
        SoGioTangCa: data.SoGioTangCa || 0,
        GhiChu: data.GhiChu,
        LyDoSua: editReason
      }));

      await Promise.all(
        updates.map((update) => {
          const dayNum = parseInt(update.Ngay.split('-')[2]);
          const existingId = selectedEmployee.days?.[dayNum]?.id;

          if (existingId) {
            // Update existing
            return axios.put(`${API_BASE}/attendance/${existingId}`, update, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } else {
            // Create new
            return axios.post(`${API_BASE}/attendance`, update, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        })
      );

      alert('Lưu chấm công thành công!');
      setEditReason('');
      fetchAttendanceData();
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Lưu chấm công thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // Trigger đánh vắng thủ công
  const handleManualMarkAbsent = async () => {
    const today = new Date();
    const ngay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (!window.confirm(`Xác nhận đánh vắng cho tất cả nhân viên chưa chấm công ngày ${ngay}?`)) return;

    try {
      await axios.post(`${API_BASE}/attendance/mark-absent`, { Ngay: ngay }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã đánh vắng thành công!');
      fetchAttendanceData();
    } catch (err) {
      console.error('Error marking absent:', err);
      alert('Đánh vắng thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // CRUD Ngày lễ
  const handleSaveHoliday = async () => {
    if (!holidayForm.TenNgayLe || !holidayForm.Ngay) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      if (editingHoliday) {
        // Update
        await axios.put(`${API_BASE}/holidays/${editingHoliday.MaNgayLe}`, holidayForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Cập nhật ngày lễ thành công!');
      } else {
        // Create
        await axios.post(`${API_BASE}/holidays`, holidayForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Thêm ngày lễ thành công!');
      }
      setShowHolidayModal(false);
      setEditingHoliday(null);
      setHolidayForm({
        TenNgayLe: '',
        Ngay: '',
        HeSoLuong: 2.0,
        LoaiNgayLe: 'Quoc_gia',
        GhiChu: ''
      });
      fetchHolidays();
    } catch (err) {
      console.error('Error saving holiday:', err);
      alert('Lưu ngày lễ thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Xác nhận xóa ngày lễ?')) return;
    try {
      await axios.delete(`${API_BASE}/holidays/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Xóa ngày lễ thành công!');
      fetchHolidays();
    } catch (err) {
      console.error('Error deleting holiday:', err);
      alert('Xóa ngày lễ thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setHolidayForm({
      TenNgayLe: holiday.TenNgayLe,
      Ngay: holiday.Ngay.split('T')[0],
      HeSoLuong: holiday.HeSoLuong,
      LoaiNgayLe: holiday.LoaiNgayLe,
      GhiChu: holiday.GhiChu || ''
    });
    setShowHolidayModal(true);
  };

  return (
    <div className="thongke-page">
      <div className="thongke-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>
          <i className="fas fa-calendar-check"></i> Quản lý chấm công
        </h1>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '2px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('calendar')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'calendar' ? '#1976d2' : 'transparent',
            color: activeTab === 'calendar' ? '#fff' : '#000',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <i className="fas fa-calendar"></i> Lịch chấm công
        </button>
        <button
          onClick={() => setActiveTab('abnormal')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'abnormal' ? '#1976d2' : 'transparent',
            color: activeTab === 'abnormal' ? '#fff' : '#000',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <i className="fas fa-exclamation-triangle"></i> Báo cáo bất thường
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'holidays' ? '#1976d2' : 'transparent',
            color: activeTab === 'holidays' ? '#fff' : '#000',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <i className="fas fa-gift"></i> Ngày lễ
        </button>
      </div>

      {/* Filters */}
      <div className="thongke-content">
        <div className="thongke-filters">
          <div className="filter-group">
            <label>Tháng:</label>
            <Select
              options={months}
              value={months.find((m) => m.value === month)}
              onChange={(v) => setMonth(v.value)}
              placeholder="Chọn tháng"
              styles={{
                control: (base) => ({ ...base, minHeight: 32 }),
                menu: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
            <label>Năm:</label>
            <Select
              options={years}
              value={years.find((y) => y.value === year)}
              onChange={(v) => setYear(v.value)}
              placeholder="Chọn năm"
              styles={{
                control: (base) => ({ ...base, minHeight: 32 }),
                menu: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
            {activeTab === 'calendar' && (
              <button
                onClick={handleManualMarkAbsent}
                style={{
                  marginLeft: 10,
                  padding: '6px 12px',
                  background: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                <i className="fas fa-user-times"></i> Đánh vắng hôm nay
              </button>
            )}
          </div>
        </div>

        {/* Tab Content: Calendar */}
        {activeTab === 'calendar' && (
          <div className="thongke-table" style={{ display: 'flex', gap: 24 }}>
            {/* Danh sách nhân viên */}
            <div style={{ minWidth: 260 }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Nhân viên</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((nv, idx) => {
                    const days = nv.days || {};
                    const requiredWorkdays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
                      (d) => getWeekday(year, month, d) !== 'CN'
                    ).length;
                    let chamCongCount = 0;
                    for (let d = 1; d <= daysInMonth; d++) {
                      if (getWeekday(year, month, d) === 'CN') continue;
                      const dayInfo = days[d];
                      const status = dayInfo?.trang_thai || 'Chua_cham_cong';
                      if (status && status !== 'Chua_cham_cong') chamCongCount++;
                    }
                    const done = chamCongCount >= requiredWorkdays;
                    return (
                      <tr
                        key={nv.MaNV}
                        style={{
                          background: selectedEmployee && selectedEmployee.MaNV === nv.MaNV ? '#e3f2fd' : undefined,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setSelectedEmployee(nv);
                          setPendingChanges({});
                        }}
                      >
                        <td>{idx + 1}</td>
                        <td>{nv.HoTen}</td>
                        <td style={{ color: done ? '#4CAF50' : '#F44336' }}>
                          {done ? 'Đủ' : 'Thiếu'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Lịch chấm công chi tiết */}
            <div style={{ flex: '1 1 auto', minWidth: 600 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                {selectedEmployee ? `${selectedEmployee.MaNV} - ${selectedEmployee.HoTen}` : ''}
              </div>
              <table style={{ width: '100%', marginBottom: 16 }}>
                <tbody>
                  {getDayRows().map((row, rowIdx) => (
                    <React.Fragment key={rowIdx}>
                      {/* Dòng thứ */}
                      <tr>
                        {row.map((day) => (
                          <td
                            key={`weekday-${day}`}
                            style={{
                              background: '#e3e3e3',
                              color: '#1976d2',
                              fontWeight: 'bold',
                              fontSize: 13,
                              padding: 4,
                              borderBottom: 'none'
                            }}
                          >
                            {getWeekday(year, month, day)}
                          </td>
                        ))}
                        {row.length < 10 &&
                          Array.from({ length: 10 - row.length }).map((_, i) => (
                            <td key={`weekday-empty-${i}`} style={{ background: '#f5f5f5', borderBottom: 'none' }} />
                          ))}
                      </tr>
                      {/* Dòng ngày */}
                      <tr>
                        {row.map((day) => {
                          const ngay = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          
                          if (isSunday(year, month, day)) {
                            return (
                              <td
                                key={day}
                                style={{
                                  background: '#eceff1',
                                  color: '#1976d2',
                                  whiteSpace: 'pre-line',
                                  cursor: 'default',
                                  minWidth: 55,
                                  maxWidth: 80,
                                  fontSize: 16,
                                  padding: 10,
                                }}
                              >
                                <div style={{ fontWeight: 'bold' }}>{day}</div>
                                <div>CN</div>
                              </td>
                            );
                          }

                          const dayData = pendingChanges[ngay] || (selectedEmployee?.days ? selectedEmployee.days[day] : {});
                          const apiStatus = dayData?.TrangThai || dayData?.trang_thai || 'Chua_cham_cong';
                          let cellText = statusLabels[apiStatus] || '';
                          
                          if (dayData?.SoGioTangCa > 0 || dayData?.so_gio_tang_ca > 0) {
                            cellText += `\n+${dayData.SoGioTangCa || dayData.so_gio_tang_ca}h`;
                          }
                          
                          return (
                            <td
                              key={day}
                              style={{
                                background: statusColors[apiStatus],
                                color: '#fff',
                                whiteSpace: 'pre-line',
                                cursor: 'pointer',
                                minWidth: 55,
                                maxWidth: 80,
                                fontSize: 16,
                                padding: 10,
                                position: 'relative'
                              }}
                              onClick={() => handleDayClick(day)}
                              onDoubleClick={() => {
                                const maCC = selectedEmployee?.days?.[day]?.id;
                                if (maCC) fetchHistory(maCC);
                              }}
                              title="Nhấp: đánh dấu | Nhấp đúp: xem lịch sử"
                            >
                              <div style={{ fontWeight: 'bold' }}>{day}</div>
                              <div style={{ fontSize: 12 }}>{cellText}</div>
                            </td>
                          );
                        })}
                        {row.length < 10 &&
                          Array.from({ length: 10 - row.length }).map((_, i) => (
                            <td key={`empty-${i}`} style={{ background: '#f5f5f5' }} />
                          ))}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* Các nút trạng thái */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Chọn trạng thái:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.keys(statusLabels).filter(k => k !== 'Chua_cham_cong').map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      style={{
                        background: selectedStatus === status ? statusColors[status] : '#fff',
                        color: selectedStatus === status ? '#fff' : '#000',
                        border: `2px solid ${statusColors[status]}`,
                        padding: '8px 16px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn giờ tăng ca */}
              {selectedStatus === 'Lam_them' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 'bold', marginRight: 10 }}>Số giờ tăng ca:</label>
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((h) => (
                    <label key={h} style={{ marginLeft: 8 }}>
                      <input
                        type="radio"
                        name="otHours"
                        checked={otHours === h}
                        onChange={() => setOtHours(h)}
                      />
                      {h}h
                    </label>
                  ))}
                </div>
              )}

              {/* Lý do sửa và nút Lưu */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
                  Lý do chỉnh sửa: <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Nhập lý do chỉnh sửa chấm công (bắt buộc)"
                  style={{
                    width: '100%',
                    minHeight: 60,
                    padding: 8,
                    borderRadius: 4,
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <button
                onClick={handleSaveChanges}
                style={{
                  background: '#28a745',
                  color: '#fff',
                  fontWeight: 'bold',
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 16
                }}
                disabled={Object.keys(pendingChanges).length === 0}
              >
                <i className="fas fa-save"></i> Lưu thay đổi ({Object.keys(pendingChanges).length})
              </button>

              <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
                <i className="fas fa-info-circle"></i> Nhấp đúp vào ngày đã chấm để xem lịch sử chỉnh sửa
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Abnormal Report */}
        {activeTab === 'abnormal' && (
          <div>
            <h2>Báo cáo chấm công bất thường - Tháng {month}/{year}</h2>
            {loadingAbnormal ? (
              <div>Đang tải báo cáo...</div>
            ) : (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Mã NV</th>
                    <th>Họ tên</th>
                    <th>Số lần trễ</th>
                    <th>Số lần về sớm</th>
                    <th>Quên chấm ra</th>
                    <th>Tổng giờ tăng ca</th>
                    <th>Tổng ngày chấm công</th>
                  </tr>
                </thead>
                <tbody>
                  {abnormalReport.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                    </tr>
                  ) : (
                    abnormalReport.map((item) => (
                      <tr key={item.MaNV}>
                        <td>{item.MaNV}</td>
                        <td>{item.HoTen}</td>
                        <td style={{ color: item.SoLanTre > 0 ? '#FF9800' : '#000', fontWeight: 'bold' }}>
                          {item.SoLanTre}
                        </td>
                        <td style={{ color: item.SoLanVeSom > 0 ? '#FFC107' : '#000', fontWeight: 'bold' }}>
                          {item.SoLanVeSom}
                        </td>
                        <td style={{ color: item.QuenChamRa > 0 ? '#F44336' : '#000', fontWeight: 'bold' }}>
                          {item.QuenChamRa}
                        </td>
                        <td>{item.TongGioTangCa}</td>
                        <td>{item.TongNgayChamCong}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Content: Holidays */}
        {activeTab === 'holidays' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2>Quản lý ngày lễ</h2>
              <button
                onClick={() => {
                  setEditingHoliday(null);
                  setHolidayForm({
                    TenNgayLe: '',
                    Ngay: '',
                    HeSoLuong: 2.0,
                    LoaiNgayLe: 'Quoc_gia',
                    GhiChu: ''
                  });
                  setShowHolidayModal(true);
                }}
                style={{
                  background: '#1976d2',
                  color: '#fff',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-plus"></i> Thêm ngày lễ
              </button>
            </div>

            {loadingHolidays ? (
              <div>Đang tải danh sách ngày lễ...</div>
            ) : (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Tên ngày lễ</th>
                    <th>Ngày</th>
                    <th>Hệ số lương</th>
                    <th>Loại</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center' }}>Không có ngày lễ nào</td>
                    </tr>
                  ) : (
                    holidays.map((holiday) => (
                      <tr key={holiday.MaNgayLe}>
                        <td>{holiday.TenNgayLe}</td>
                        <td>{new Date(holiday.Ngay).toLocaleDateString('vi-VN')}</td>
                        <td>x{holiday.HeSoLuong}</td>
                        <td>{holiday.LoaiNgayLe}</td>
                        <td>{holiday.GhiChu}</td>
                        <td>
                          <button
                            onClick={() => handleEditHoliday(holiday)}
                            style={{
                              background: '#4CAF50',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: 4,
                              cursor: 'pointer',
                              marginRight: 8
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(holiday.MaNgayLe)}
                            style={{
                              background: '#f44336',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: 4,
                              cursor: 'pointer'
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal: Holiday Form */}
      {showHolidayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowHolidayModal(false)}>
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 8,
            maxWidth: 500,
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <h3>{editingHoliday ? 'Sửa ngày lễ' : 'Thêm ngày lễ'}</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Tên ngày lễ:</label>
              <input
                type="text"
                value={holidayForm.TenNgayLe}
                onChange={(e) => setHolidayForm({ ...holidayForm, TenNgayLe: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Ngày:</label>
              <input
                type="date"
                value={holidayForm.Ngay}
                onChange={(e) => setHolidayForm({ ...holidayForm, Ngay: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Hệ số lương:</label>
              <input
                type="number"
                step="0.1"
                value={holidayForm.HeSoLuong}
                onChange={(e) => setHolidayForm({ ...holidayForm, HeSoLuong: parseFloat(e.target.value) })}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Loại ngày lễ:</label>
              <select
                value={holidayForm.LoaiNgayLe}
                onChange={(e) => setHolidayForm({ ...holidayForm, LoaiNgayLe: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              >
                <option value="Quoc_gia">Quốc gia</option>
                <option value="Tet">Tết</option>
                <option value="Khac">Khác</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Ghi chú:</label>
              <textarea
                value={holidayForm.GhiChu}
                onChange={(e) => setHolidayForm({ ...holidayForm, GhiChu: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', minHeight: 60 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowHolidayModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: '#fff'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveHoliday}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: '#1976d2',
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: History */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowHistoryModal(false)}>
          <div style={{
            background: '#fff',
            padding: 24,
            borderRadius: 8,
            maxWidth: 900,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3>Lịch sử chỉnh sửa - MaCC: {selectedMaCC}</h3>
            {loadingHistory ? (
              <div>Đang tải lịch sử...</div>
            ) : historyData.length === 0 ? (
              <div>Không có lịch sử chỉnh sửa</div>
            ) : (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Ngày sửa</th>
                    <th>Người sửa</th>
                    <th>Lý do</th>
                    <th>Thay đổi</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((h) => (
                    <tr key={h.MaLS}>
                      <td>{new Date(h.NgaySua).toLocaleString('vi-VN')}</td>
                      <td>{h.TenTK}<br/><small>{h.Email}</small></td>
                      <td>{h.LyDo}</td>
                      <td style={{ fontSize: 12 }}>
                        <div><strong>Trước:</strong></div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(h.TruocKhi, null, 2)}</pre>
                        <div><strong>Sau:</strong></div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(h.SauKhi, null, 2)}</pre>
                      </td>
                      <td>{h.DiaChi_IP}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              onClick={() => setShowHistoryModal(false)}
              style={{
                marginTop: 16,
                padding: '10px 20px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: '#1976d2',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
