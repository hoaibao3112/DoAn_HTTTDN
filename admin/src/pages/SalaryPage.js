import React, { useEffect, useState, useContext } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import '../styles/AttendancePage.css';

import { FEATURES } from '../constants/permissions';
import { PermissionContext } from '../components/PermissionContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const API_HR = 'http://localhost:5000/api/hr';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + 'đ';
const fmtShort = (n) => {
  const v = Math.round(n || 0);
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.?0+$/, '') + ' tr';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'k';
  return v + 'đ';
};

const LOAI_OPTIONS = [
  { value: 'Thuong', label: '🏆 Thưởng', color: '#2e7d32' },
  { value: 'Phat', label: '⚠️ Phạt', color: '#c62828' },
];

const selectStyle = (base) => ({ ...base, minWidth: 130 });
const selectMenuStyle = (base) => ({ ...base, zIndex: 9999 });

const SalaryPage = () => {
  const { hasPermissionById } = useContext(PermissionContext);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'bonus_penalty', 'stats'
  const [statsData, setStatsData] = useState({ monthlyTrend: [], composition: { base: 0, allowance: 0, bonus: 0, penalty: 0 }, topRewards: [] });

  // Shared state
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const token = localStorage.getItem('authToken');
  const headers = { Authorization: `Bearer ${token}` };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
  const years = Array.from({ length: 8 }, (_, i) => ({ value: 2023 + i, label: `${2023 + i}` }));

  // --- TAB 1: SALARY STATE ---
  const [salaryList, setSalaryList] = useState([]);
  const [salarySummary, setSalarySummary] = useState({ TongLuong: 0, DaChiTra: 0, ChuaChiTra: 0, SoNVDaTra: 0 });
  const [salaryTotal, setSalaryTotal] = useState(0);
  const [loadingSalary, setLoadingSalary] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [paying, setPaying] = useState(null);
  const [payingAll, setPayingAll] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  // --- TAB 2: BONUS/PENALTY STATE ---
  const [bpList, setBpList] = useState([]);
  const [bpSummary, setBpSummary] = useState(null);
  const [bpEmployees, setBpEmployees] = useState([]);
  const [loadingBP, setLoadingBP] = useState(false);
  const [bpFilterLoai, setBpFilterLoai] = useState('');
  const [showBPModal, setShowBPModal] = useState(false);
  const [editBPRecord, setEditBPRecord] = useState(null);
  const [bpForm, setBpForm] = useState({ MaNV: '', Loai: 'Thuong', SoTien: '', LyDo: '', GhiChu: '' });
  const [bpSaving, setBpSaving] = useState(false);

  const canCreateBP = hasPermissionById(FEATURES.BONUS_PENALTY, 'them');
  const canEditBP = hasPermissionById(FEATURES.BONUS_PENALTY, 'sua');
  const canDeleteBP = hasPermissionById(FEATURES.BONUS_PENALTY, 'xoa');

  // --- DATA FETCHING ---
  const fetchSalary = async () => {
    setLoadingSalary(true);
    try {
      const res = await axios.get(`${API_HR}/salary-detail?year=${year}&month=${month}`, { headers });
      if (res.data.success) {
        setSalaryList(res.data.data || []);
        setSalarySummary(res.data.summary || { TongLuong: 0, DaChiTra: 0, ChuaChiTra: 0, SoNVDaTra: 0 });
        setSalaryTotal(res.data.total || 0);
      }
    } catch (err) {
      if (err.response?.status !== 404) console.error('Fetch salary error:', err);
      setSalaryList([]);
      setSalarySummary({ TongLuong: 0, DaChiTra: 0, ChuaChiTra: 0, SoNVDaTra: 0 });
      setSalaryTotal(0);
    }
    setLoadingSalary(false);
  };

  const fetchBPData = async () => {
    setLoadingBP(true);
    try {
      const params = new URLSearchParams({ month, year });
      if (bpFilterLoai) params.append('loai', bpFilterLoai);
      const [listRes, summaryRes] = await Promise.all([
        axios.get(`${API_HR}/bonus-penalty?${params}`, { headers }),
        axios.get(`${API_HR}/bonus-penalty/summary?month=${month}&year=${year}`, { headers }),
      ]);
      setBpList(listRes.data.data || []);
      setBpSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      setBpList([]);
    }
    setLoadingBP(false);
  };

  const fetchBPEmployees = async () => {
    try {
      const res = await axios.get(`${API_HR}/employees`, { headers });
      setBpEmployees((res.data.data || []).map(e => ({
        value: e.MaNV,
        label: `${e.HoTen} (${e.ChucVu || 'NV'})`,
      })));
    } catch { }
  };

  const fetchSalaryStats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/hr/salary/stats?year=${year}&month=${month}`);
      if (res.data.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'summary') fetchSalary();
    else if (activeTab === 'bonus_penalty') fetchBPData();
    else if (activeTab === 'stats') fetchSalaryStats();
  }, [month, year, activeTab, bpFilterLoai]);

  useEffect(() => {
    if (activeTab === 'bonus_penalty') fetchBPEmployees();
  }, [activeTab]);


  // --- SALARY HANDLERS ---
  const handleCalculate = async () => {
    if (!window.confirm(`Tính lương tháng ${month}/${year} cho toàn bộ nhân viên?\nNếu đã tính trước đó, dữ liệu sẽ được cập nhật lại.`)) return;
    setCalculating(true);
    try {
      const res = await axios.post(`${API_HR}/salary/calculate`, { month, year }, { headers });
      if (res.data.success) {
        alert(res.data.message);
        fetchSalary();
      }
    } catch (err) {
      alert('Lỗi tính lương: ' + (err.response?.data?.message || err.message));
    }
    setCalculating(false);
  };

  const handlePayOne = async (row) => {
    if (row.TrangThai === 'Da_chi_tra') return;
    if (!window.confirm(`Xác nhận đã chi trả lương cho ${row.HoTen}?\nSố tiền: ${fmt(row.TongLuong)}`)) return;
    setPaying(row.MaNV);
    try {
      await axios.put(`${API_HR}/salary-pay`, { MaNV: row.MaNV, month, year }, { headers });
      fetchSalary();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
    setPaying(null);
  };

  const handlePayAll = async () => {
    const pending = salaryList.filter(r => r.TrangThai !== 'Da_chi_tra');
    if (pending.length === 0) { alert('Tất cả đã được chi trả!'); return; }
    if (!window.confirm(`Xác nhận chi trả lương cho ${pending.length} nhân viên còn lại?\nTổng: ${fmt(salarySummary.ChuaChiTra)}`)) return;
    setPayingAll(true);
    try {
      const res = await axios.put(`${API_HR}/salary-pay-all`, { month, year }, { headers });
      alert(res.data.message);
      fetchSalary();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
    setPayingAll(false);
  };

  const dailyRate = (row) => parseFloat(row.LuongCoBan || 0) / 26;
  const hourlyRate = (row) => parseFloat(row.LuongCoBan || 0) / 208;
  const basePay = (row) => dailyRate(row) * parseFloat(row.SoNgayLam || 0);
  const otPay = (row) => parseFloat(row.SoGioTangCa || 0) * hourlyRate(row) * 1.5;

  const handleExportExcel = () => {
    if (salaryList.length === 0) { alert('Chưa có dữ liệu để xuất!'); return; }
    const rows = salaryList.map((row, idx) => ({
      STT: idx + 1, 'Mã NV': row.MaNV, 'Họ tên': row.HoTen, 'Chức vụ': row.ChucVu || '',
      'Lương cơ bản': parseFloat(row.LuongCoBan || 0), 'Số ngày công': parseFloat(row.SoNgayLam || 0),
      'Lương công': Math.round(basePay(row)), 'Giờ tăng ca': parseFloat(row.SoGioTangCa || 0),
      'Lương tăng ca': Math.round(otPay(row)), 'Phụ cấp': parseFloat(row.PhuCap || 0),
      'Thưởng': parseFloat(row.Thuong || 0), 'Phạt': parseFloat(row.Phat || 0),
      'Tổng lương': parseFloat(row.TongLuong || 0),
      'Trạng thái': row.TrangThai === 'Da_chi_tra' ? 'Đã chi trả' : 'Chưa chi trả',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Luong_T${month}_${year}`);
    XLSX.writeFile(wb, `BangLuong_T${month}_${year}.xlsx`);
  };

  const handleExportPDF = () => {
    if (salaryList.length === 0) { alert('Chưa có dữ liệu để xuất!'); return; }
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text(`BANG LUONG NHAN VIEN - THANG ${month}/${year}`, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    const tableRows = salaryList.map((row, idx) => [
      idx + 1, row.MaNV, row.HoTen, row.ChucVu || '',
      fmt(row.LuongCoBan), row.SoNgayLam, `+${row.SoGioTangCa}h`, fmt(row.PhuCap), fmt(row.Thuong), fmt(row.Phat),
      fmt(row.TongLuong), row.TrangThai === 'Da_chi_tra' ? 'Da tra' : 'Chua tra'
    ]);
    doc.autoTable({
      startY: 60,
      head: [['STT', 'Ma NV', 'Ho ten', 'Chuc vu', 'Luong CB', 'Công', 'T.Ca', 'Phu cap', 'Thuong', 'Phat', 'Tong', 'TT']],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] }
    });
    doc.save(`BangLuong_T${month}_${year}.pdf`);
  };

  // --- BONUS/PENALTY HANDLERS ---
  const formatVNDInput = (val) => {
    if (!val) return '';
    const num = val.toString().replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleSoTienChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setBpForm({ ...bpForm, SoTien: rawVal });
  };

  const openBPCreate = () => {
    setEditBPRecord(null);
    setBpForm({ MaNV: '', Loai: 'Thuong', SoTien: '', LyDo: '', GhiChu: '' });
    setShowBPModal(true);
  };
  const openBPEdit = (rec) => {
    setEditBPRecord(rec);
    setBpForm({ MaNV: rec.MaNV, Loai: rec.Loai, SoTien: rec.SoTien.toString(), LyDo: rec.LyDo, GhiChu: rec.GhiChu || '' });
    setShowBPModal(true);
  };
  const handleBPSave = async () => {
    if (!bpForm.MaNV || !bpForm.LyDo.trim() || !bpForm.SoTien) { alert('Vui lòng điền đủ NV, Lý do, Số tiền!'); return; }
    setBpSaving(true);
    try {
      const body = { ...bpForm, Thang: month, Nam: year, SoTien: parseFloat(bpForm.SoTien) };
      if (editBPRecord) await axios.put(`${API_HR}/bonus-penalty/${editBPRecord.id}`, body, { headers });
      else await axios.post(`${API_HR}/bonus-penalty`, body, { headers });
      setShowBPModal(false);
      fetchBPData();
    } catch (err) { alert('Lỗi: ' + (err.response?.data?.message || err.message)); }
    setBpSaving(false);
  };
  const handleBPDelete = async (rec) => {
    if (!window.confirm(`Xác nhận xóa?`)) return;
    try { await axios.delete(`${API_HR}/bonus-penalty/${rec.id}`, { headers }); fetchBPData(); }
    catch (err) { alert('Lỗi: ' + (err.response?.data?.message || err.message)); }
  };

  const bpSummaryData = bpSummary?.summary || {};
  const bpSummaryRows = bpSummary?.data || [];

  return (
    <div className="thongke-page">
      {/* HEADER */}
      <div className="thongke-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1><i className="fas fa-money-bill-wave"></i> Quản lý lương & Thưởng phạt</h1>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px 8px 0 0',
              background: activeTab === 'summary' ? '#fff' : '#f5f5f5',
              borderBottom: activeTab === 'summary' ? '2px solid #fff' : '1px solid #ddd',
              fontWeight: 600, cursor: 'pointer', marginBottom: -1
            }}
          >Bảng lương</button>
          <button
            onClick={() => setActiveTab('bonus_penalty')}
            style={{
              padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px 8px 0 0',
              background: activeTab === 'bonus_penalty' ? '#fff' : '#f5f5f5',
              borderBottom: activeTab === 'bonus_penalty' ? '2px solid #fff' : '1px solid #ddd',
              fontWeight: 600, cursor: 'pointer', marginBottom: -1
            }}
          >Thưởng / Phạt</button>
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px 8px 0 0',
              background: activeTab === 'stats' ? '#fff' : '#f5f5f5',
              borderBottom: activeTab === 'stats' ? '2px solid #fff' : '1px solid #ddd',
              fontWeight: 600, cursor: 'pointer', marginBottom: -1
            }}
          >Biểu đồ Thống kê 📊</button>
        </div>
      </div>

      <div className="thongke-content">
        {/* ANALYTICS TAB CONTENT */}
        {activeTab === 'stats' && (
          <div style={{ padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 30 }}>
              {/* Bar Chart */}
              <div style={{ background: '#fcfcfc', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
                <h3 style={{ marginBottom: 20, color: '#333', fontSize: 16 }}>Xu hướng chi lương năm {year}</h3>
                <div style={{ height: 350 }}>
                  <Bar
                    data={{
                      labels: statsData.monthlyTrend.map(m => `T${m.month}`),
                      datasets: [{
                        label: 'Tổng chi lương (VNĐ)',
                        data: statsData.monthlyTrend.map(m => parseFloat(m.total || 0)),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 1,
                        borderRadius: 6
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString('vi-VN') } } }
                    }}
                  />
                </div>
              </div>

              {/* Pie Chart */}
              <div style={{ background: '#fcfcfc', padding: 20, borderRadius: 12, border: '1px solid #eee' }}>
                <h3 style={{ marginBottom: 20, color: '#333', fontSize: 16 }}>Cơ cấu chi phí lương tháng {month}</h3>
                <div style={{ height: 350 }}>
                  {(statsData.composition.base > 0 || statsData.composition.allowance > 0 || statsData.composition.bonus > 0) ? (
                    <Pie
                      data={{
                        labels: ['Lương gốc', 'Phụ cấp', 'Thưởng', 'Phạt'],
                        datasets: [{
                          data: [
                            parseFloat(statsData.composition.base || 0),
                            parseFloat(statsData.composition.allowance || 0),
                            parseFloat(statsData.composition.bonus || 0),
                            parseFloat(statsData.composition.penalty || 0)
                          ],
                          backgroundColor: [
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 205, 86, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 99, 132, 0.7)'
                          ],
                          hoverOffset: 15
                        }]
                      }}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
                      Chưa có dữ liệu tính lương tháng này
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Insights Grid */}
            <div style={{ marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <div style={{ padding: 20, background: '#e3f2fd', borderRadius: 12, border: '1px solid #bbdefb' }}>
                <h4 style={{ color: '#1565c0', marginBottom: 10 }}><i className="fas fa-trophy"></i> Top thưởng tháng {month}</h4>
                {statsData.topRewards.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {statsData.topRewards.map((r, i) => (
                      <li key={i} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                        <span>{i + 1}. {r.HoTen}</span>
                        <span style={{ fontWeight: 600, color: '#2e7d32' }}>+{parseFloat(r.Thuong || 0).toLocaleString()}đ</span>
                      </li>
                    ))}
                  </ul>
                ) : <div style={{ fontSize: 13, color: '#666' }}>Không có nhân viên nào nhận thưởng.</div>}
              </div>

              <div style={{ padding: 20, background: '#f1f8e9', borderRadius: 12, border: '1px solid #dcedc8' }}>
                <h4 style={{ color: '#2e7d32', marginBottom: 10 }}><i className="fas fa-chart-line"></i> Phân tích nhanh</h4>
                <p style={{ fontSize: 13, lineHeight: '1.6', color: '#333' }}>
                  Tổng quỹ lương năm {year} tính đến hiện tại là <strong>{statsData.monthlyTrend.reduce((s, m) => s + parseFloat(m.total || 0), 0).toLocaleString()} VNĐ</strong>.
                  <br />
                  Trung bình mỗi tháng chi khoảng <strong>{(statsData.monthlyTrend.reduce((s, m) => s + parseFloat(m.total || 0), 0) / (statsData.monthlyTrend.filter(m => parseFloat(m.total || 0) > 0).length || 1)).toLocaleString()} VNĐ</strong>.
                </p>
              </div>

              <div style={{ padding: 20, background: '#fff9c4', borderRadius: 12, border: '1px solid #fff176' }}>
                <h4 style={{ color: '#fbc02d', marginBottom: 10 }}><i className="fas fa-lightbulb"></i> Gợi ý</h4>
                <p style={{ fontSize: 13, lineHeight: '1.6', color: '#555' }}>
                  {statsData.composition.penalty > statsData.composition.bonus ?
                    "Tháng này tổng tiền phạt cao hơn thưởng. Bạn nên rà soát lại lý do nhân viên vi phạm nhiều." :
                    "Cơ cấu thưởng tháng này khá tốt, giúp tạo động lực cho nhân viên."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        {/* FILTERS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontWeight: 600 }}>Tháng:</label>
            <Select options={months} value={months.find(m => m.value === month)} onChange={v => setMonth(v.value)} styles={{ control: b => ({ ...b, minWidth: 120 }) }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontWeight: 600 }}>Năm:</label>
            <Select options={years} value={years.find(y => y.value === year)} onChange={v => setYear(v.value)} styles={{ control: b => ({ ...b, minWidth: 100 }) }} />
          </div>

          {activeTab === 'salary' ? (
            <>
              <button onClick={handleCalculate} disabled={calculating} className="btn-salary" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                <i className={`fas ${calculating ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i> {calculating ? 'Đang tính...' : 'Tính lương'}
              </button>
              {salaryList.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                  <button onClick={handleExportExcel} style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}><i className="fas fa-file-excel"></i> Excel</button>
                  <button onClick={handleExportPDF} style={{ background: '#c62828', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}><i className="fas fa-file-pdf"></i> PDF</button>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontWeight: 600 }}>Loại:</label>
                <Select options={[{ value: '', label: 'Tất cả' }, ...LOAI_OPTIONS]} value={[{ value: '', label: 'Tất cả' }, ...LOAI_OPTIONS].find(o => o.value === bpFilterLoai)} onChange={v => setBpFilterLoai(v.value)} styles={{ control: b => ({ ...b, minWidth: 120 }) }} />
              </div>
              {canCreateBP && (
                <button onClick={openBPCreate} style={{ marginLeft: 'auto', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                  <i className="fas fa-plus"></i> Thêm thưởng/phạt
                </button>
              )}
            </>
          )}
        </div>

        {/* TAB 1: SALARY */}
        {activeTab === 'salary' && (
          <>
            {salaryList.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <SummaryCard icon="fa-users" label="Nhân viên" value={`${salaryTotal} người`} color="#1976d2" bg="#e3f2fd" />
                <SummaryCard icon="fa-money-bill-wave" label="Tổng chi" value={fmtShort(salarySummary.TongLuong)} sub={fmt(salarySummary.TongLuong)} color="#6a1b9a" bg="#f3e5f5" />
                <SummaryCard icon="fa-check-circle" label="Đã chi trả" value={`${salarySummary.SoNVDaTra}/${salaryTotal}`} sub={fmt(salarySummary.DaChiTra)} color="#2e7d32" bg="#e8f5e9" />
                <SummaryCard icon="fa-clock" label="Chưa chi trả" value={`${salaryTotal - salarySummary.SoNVDaTra} NV`} sub={fmt(salarySummary.ChuaChiTra)} color="#e65100" bg="#fff3e0" />
              </div>
            )}
            {loadingSalary ? <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin"></i> Đang tải...</div> : (
              salaryList.length === 0 ? <div style={{ textAlign: 'center', padding: 40, background: '#f5f5f5', borderRadius: 10 }}>Chưa có dữ liệu lương tháng này. Hãy nhấn "Tính lương".</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#1976d2', color: '#fff' }}>
                        <th style={th}>STT</th><th style={{ ...th, textAlign: 'left' }}>Nhân viên</th><th style={th}>Chức vụ</th><th style={th}>Lương CB</th><th style={th}>Ngày công</th><th style={th}>T.Ca (h)</th><th style={th}>Phụ cấp</th><th style={th}>Thưởng</th><th style={th}>Phạt</th><th style={th}>Tổng</th><th style={th}>Trạng thái</th><th style={th}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryList.map((row, idx) => (
                        <tr key={row.MaNV} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={td}>{idx + 1}</td>
                          <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{row.HoTen}</td>
                          <td style={td}>{row.ChucVu}</td>
                          <td style={tdRight}>{fmt(row.LuongCoBan)}</td>
                          <td style={td}>{row.SoNgayLam}</td>
                          <td style={td}>{row.SoGioTangCa > 0 ? `+${row.SoGioTangCa}h` : '—'}</td>
                          <td style={tdRight}>{fmt(row.PhuCap)}</td>
                          <td style={{ ...tdRight, color: row.Thuong > 0 ? '#2e7d32' : '#999' }}>{fmt(row.Thuong)}</td>
                          <td style={{ ...tdRight, color: row.Phat > 0 ? '#c62828' : '#999' }}>{row.Phat > 0 ? `-${fmt(row.Phat)}` : '—'}</td>
                          <td style={{ ...tdRight, fontWeight: 700, color: '#1976d2' }}>{fmt(row.TongLuong)}</td>
                          <td style={td}>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: row.TrangThai === 'Da_chi_tra' ? '#e8f5e9' : '#fff3e0', color: row.TrangThai === 'Da_chi_tra' ? '#2e7d32' : '#e65100' }}>
                              {row.TrangThai === 'Da_chi_tra' ? 'Đã chi trả' : 'Chưa trả'}
                            </span>
                          </td>
                          <td style={td}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button
                                onClick={() => { setDetailRow(row); setDetailModal(true); }}
                                style={{
                                  padding: '6px 12px', border: 'none', background: '#1976d2', color: '#fff', borderRadius: 4, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12
                                }}>
                                <i className="fas fa-eye"></i> Chi tiết
                              </button>
                              {row.TrangThai !== 'Da_chi_tra' && (
                                <button
                                  onClick={() => handlePayOne(row)}
                                  disabled={paying === row.MaNV}
                                  style={{
                                    padding: '6px 12px', border: 'none', background: '#388e3c', color: '#fff', borderRadius: 4, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12
                                  }}>
                                  <i className={`fas ${paying === row.MaNV ? 'fa-spinner fa-spin' : 'fa-check'}`}></i> {paying === row.MaNV ? '...' : 'Chi trả'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}

        {/* TAB 2: BONUS/PENALTY */}
        {activeTab === 'bonus-penalty' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              <SummaryCard icon="fa-trophy" label="Tổng thưởng" value={fmt(bpSummaryData.TongThuong)} color="#2e7d32" bg="#e8f5e9" />
              <SummaryCard icon="fa-exclamation-triangle" label="Tổng phạt" value={fmt(bpSummaryData.TongPhat)} color="#c62828" bg="#ffebee" />
              <SummaryCard icon="fa-user-check" label="Được thưởng" value={`${bpSummaryData.SoNVDuocThuong || 0} NV`} color="#1565c0" bg="#e3f2fd" />
              <SummaryCard icon="fa-user-times" label="Bị phạt" value={`${bpSummaryData.SoNVBiPhat || 0} NV`} color="#e65100" bg="#fff3e0" />
            </div>

            {loadingBP ? <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin"></i> Đang tải...</div> : (
              bpList.length === 0 ? <div style={{ textAlign: 'center', padding: 40, background: '#f5f5f5', borderRadius: 10 }}>Chưa có thưởng / phạt nào.</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#1976d2', color: '#fff' }}>
                        <th style={th}>STT</th><th style={{ ...th, textAlign: 'left' }}>Nhân viên</th><th style={th}>Loại</th><th style={th}>Số tiền</th><th style={th}>Lý do</th><th style={th}>Ngày tạo</th><th style={th}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bpList.map((row, idx) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={td}>{idx + 1}</td>
                          <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{row.HoTen}</td>
                          <td style={td}><span style={{ color: row.Loai === 'Thuong' ? '#2e7d32' : '#c62828', fontWeight: 700 }}>{row.Loai === 'Thuong' ? 'Thưởng' : 'Phạt'}</span></td>
                          <td style={{ ...tdRight, color: row.Loai === 'Thuong' ? '#2e7d32' : '#c62828' }}>{row.Loai === 'Thuong' ? '+' : '-'}{fmt(row.SoTien)}</td>
                          <td style={{ ...td, textAlign: 'left' }}>{row.LyDo}</td>
                          <td style={td}>{new Date(row.NgayTao).toLocaleDateString('vi-VN')}</td>
                          <td style={td}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              {canEditBP && (
                                <button
                                  onClick={() => openBPEdit(row)}
                                  disabled={!!row.TrangThaiLuong}
                                  title={row.TrangThaiLuong ? 'Tháng này đã tính lương, không thể sửa thưởng/phạt' : ''}
                                  style={{
                                    padding: '6px 12px', border: 'none',
                                    background: row.TrangThaiLuong ? '#ccc' : '#1976d2',
                                    color: '#fff', borderRadius: 4, cursor: row.TrangThaiLuong ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12
                                  }}>
                                  <i className="fas fa-edit"></i> Sửa
                                </button>
                              )}
                              {canDeleteBP && (
                                <button
                                  onClick={() => handleBPDelete(row)}
                                  disabled={!!row.TrangThaiLuong}
                                  title={row.TrangThaiLuong ? 'Tháng này đã tính lương, không thể xóa thưởng/phạt' : ''}
                                  style={{
                                    padding: '6px 12px', border: 'none',
                                    background: row.TrangThaiLuong ? '#ccc' : '#c62828',
                                    color: '#fff', borderRadius: 4, cursor: row.TrangThaiLuong ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12
                                  }}>
                                  <i className="fas fa-trash"></i> Xóa
                                </button>
                              )}
                              {row.TrangThaiLuong && (
                                <span title="Bản ghi đã bị khóa do đã tính lương" style={{ color: '#888', display: 'flex', alignItems: 'center' }}>
                                  <i className="fas fa-lock"></i>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* SALARY DETAIL MODAL */}
      {detailModal && detailRow && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, width: 500, padding: 24 }}>
            <h3>Chi tiết lương: {detailRow.HoTen}</h3>
            <div style={{ marginTop: 20 }}>
              <div style={mRow}><span>Lương cơ bản:</span> <span>{fmt(detailRow.LuongCoBan)}</span></div>
              <div style={mRow}><span>Lương công ({detailRow.SoNgayLam} ngày):</span> <span>{fmt(basePay(detailRow))}</span></div>
              <div style={mRow}><span>Lương tăng ca ({detailRow.SoGioTangCa}h):</span> <span>{fmt(otPay(detailRow))}</span></div>
              <div style={mRow}><span>Phụ cấp:</span> <span>{fmt(detailRow.PhuCap)}</span></div>
              <div style={{ ...mRow, color: '#2e7d32' }}><span>Thưởng:</span> <span>+{fmt(detailRow.Thuong)}</span></div>
              <div style={{ ...mRow, color: '#c62828' }}><span>Phạt:</span> <span>-{fmt(detailRow.Phat)}</span></div>
              <hr />
              <div style={{ ...mRow, fontWeight: 700, fontSize: 18, color: '#1976d2' }}><span>Tổng nhận:</span> <span>{fmt(detailRow.TongLuong)}</span></div>
            </div>
            <button onClick={() => setDetailModal(false)} style={{ marginTop: 20, width: '100%', padding: 10, border: 'none', background: '#eee', borderRadius: 6, cursor: 'pointer' }}>Đóng</button>
          </div>
        </div>
      )}

      {/* BP MODAL */}
      {showBPModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, width: 450, padding: 24 }}>
            <h3>{editBPRecord ? 'Sửa' : 'Thêm'} Thưởng / Phạt</h3>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={lStyle}>Loại</label><Select options={LOAI_OPTIONS} value={LOAI_OPTIONS.find(o => o.value === bpForm.Loai)} onChange={v => setBpForm({ ...bpForm, Loai: v.value })} /></div>
              {!editBPRecord && <div><label style={lStyle}>Nhân viên</label><Select options={bpEmployees} onChange={v => setBpForm({ ...bpForm, MaNV: v.value })} /></div>}
              <div>
                <label style={lStyle}>Số tiền (VNĐ)</label>
                <input
                  type="text"
                  style={iStyle}
                  value={formatVNDInput(bpForm.SoTien)}
                  onChange={handleSoTienChange}
                  placeholder="VD: 500.000"
                />
              </div>
              <div><label style={lStyle}>Lý do</label><input type="text" style={iStyle} value={bpForm.LyDo} onChange={e => setBpForm({ ...bpForm, LyDo: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button disabled={bpSaving} onClick={() => setShowBPModal(false)} style={{ flex: 1, padding: 10, border: '1px solid #ccc', background: '#fff', borderRadius: 6, cursor: 'pointer' }}>Hủy</button>
              <button disabled={bpSaving} onClick={handleBPSave} style={{ flex: 1, padding: 10, border: 'none', background: '#1976d2', color: '#fff', borderRadius: 6, cursor: 'pointer' }}>{bpSaving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ icon, label, value, sub, color, bg }) => (
  <div style={{ background: bg, borderRadius: 8, padding: 16, border: `1px solid ${color}22` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 32, height: 32, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><i className={`fas ${icon}`}></i></div>
      <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>{label}</div>
    </div>
    <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: '#888' }}>{sub}</div>}
  </div>
);

const th = { padding: '10px', textAlign: 'center', borderBottom: '2px solid #0d47a1', whiteSpace: 'nowrap' };
const td = { padding: '10px', textAlign: 'center', borderBottom: '1px solid #eee' };
const tdRight = { padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' };
const mRow = { display: 'flex', justifyContent: 'space-between', marginBottom: 10 };
const lStyle = { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 };
const iStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' };

export default SalaryPage;
