import React, { useEffect, useState, useContext, useMemo } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { exportToExcel } from '../utils/excelHelper';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import '../styles/AttendancePage.css';

import { FEATURES } from '../constants/permissions';
import { PermissionContext } from '../components/PermissionContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const API_HR = 'http://localhost:5000/api/hr';
const API_SALARY_13 = 'http://localhost:5000/api/luong-thang-13';

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

// selectStyle/selectMenuStyle removed (unused)

const SalaryPage = () => {
  const { hasPermissionById } = useContext(PermissionContext);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'bonus_penalty', 'stats', 'salary13'
  const [statsData, setStatsData] = useState({ monthlyTrend: [], composition: { base: 0, allowance: 0, bonus: 0, penalty: 0 }, topRewards: [] });

  // Shared state
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const token = localStorage.getItem('authToken');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
  const years = Array.from({ length: 8 }, (_, i) => ({ value: 2023 + i, label: `${2023 + i}` }));

  // --- TAB 1: SALARY STATE ---
  const [salaryList, setSalaryList] = useState([]);
  const [salarySummary, setSalarySummary] = useState({ TongLuong: 0, DaChiTra: 0, ChuaChiTra: 0, SoNVDaTra: 0 });
  const [salaryTotal, setSalaryTotal] = useState(0);
  const [loadingSalary, setLoadingSalary] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [paying, setPaying] = useState(null);
  
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

  // --- TAB 4: SALARY 13 STATE ---
  const [salary13List, setSalary13List] = useState([]);
  const [salary13Summary, setSalary13Summary] = useState({ tongNhanVien: 0, tongChiPhi: 0 });
  const [loading13, setLoading13] = useState(false);
  const [calculating13, setCalculating13] = useState(false);
  const [paying13, setPaying13] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [detailModal13, setDetailModal13] = useState(false);
  const [detailRow13, setDetailRow13] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const canCreateBP = hasPermissionById(FEATURES.BONUS_PENALTY, 'them');
  const canEditBP = hasPermissionById(FEATURES.BONUS_PENALTY, 'sua');
  const canDeleteBP = hasPermissionById(FEATURES.BONUS_PENALTY, 'xoa');

  // --- DATA FETCHING ---
  const fetchSalary = React.useCallback(async () => {
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
  }, [year, month, headers]);

  const fetchBPData = React.useCallback(async () => {
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
  }, [month, year, bpFilterLoai, headers]);

  const fetchBPEmployees = React.useCallback(async () => {
    try {
      const res = await axios.get(`${API_HR}/employees`, { headers });
      setBpEmployees((res.data.data || []).map(e => ({
        value: e.MaNV,
        label: `${e.HoTen} (${e.ChucVu || 'NV'})`,
      })));
    } catch { }
  }, [headers]);

  const fetchSalaryStats = React.useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/hr/salary/stats?year=${year}&month=${month}`);
      if (res.data.success) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [year, month]);

  const fetchSalary13 = React.useCallback(async () => {
    setLoading13(true);
    try {
      // Đầu tiên thử lấy dữ liệu đã chốt
      const res = await axios.get(`${API_SALARY_13}/${year}`, { headers });
      if (res.data.success && res.data.data.length > 0) {
        setSalary13List(res.data.data);
        setSalary13Summary({
          tongNhanVien: res.data.data.length,
          tongChiPhi: res.data.data.reduce((s, r) => s + Number(r.Thuong || 0), 0)
        });
        setIsPreviewMode(false);
      } else {
        // Nếu chưa có, lấy bản xem trước
        const previewRes = await axios.get(`${API_SALARY_13}/xem-truoc/${year}`, { headers });
        if (previewRes.data.success) {
          setSalary13List(previewRes.data.data || []);
          setSalary13Summary({
            tongNhanVien: previewRes.data.tongNhanVien,
            tongChiPhi: previewRes.data.tongChiPhi
          });
          setIsPreviewMode(true);
        }
      }
    } catch (err) {
      console.error('Fetch salary 13 error:', err);
      setSalary13List([]);
    }
    setLoading13(false);
  }, [year, headers]);

  useEffect(() => {
    if (activeTab === 'summary') fetchSalary();
    else if (activeTab === 'bonus_penalty') fetchBPData();
    else if (activeTab === 'stats') fetchSalaryStats();
    else if (activeTab === 'salary13') fetchSalary13();
  }, [activeTab, fetchSalary, fetchBPData, fetchSalaryStats, fetchSalary13]);

  useEffect(() => {
    if (activeTab === 'bonus_penalty') fetchBPEmployees();
  }, [activeTab, fetchBPEmployees]);


  // --- SALARY HANDLERS ---
  const handleCalculate = async () => {
    if (!window.confirm(`Tính lương tháng ${month}/${year} cho toàn bộ nhân viên?\nNếu đã tính trước đó, dữ liệu sẽ được cập nhật lại.`)) return;
    setCalculating(true);
    try {
      const res = await axios.post(`${API_HR}/salary/calculate`, { month, year }, { headers });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchSalary();
      }
    } catch (err) {
      toast.error('Lỗi tính lương: ' + (err.response?.data?.message || err.message));
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
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    }
    setPaying(null);
  };

  // --- SALARY 13 HANDLERS ---
  const handleCalculate13 = async () => {
    const eligibleCount = salary13List.filter(row => (row.soThangCong || row.PayableDays) >= 12).length;
    if (eligibleCount === 0) {
      toast.error('Không có nhân viên nào đủ điều kiện (12 tháng) để chốt lương T13 năm ' + year);
      return;
    }

    if (!window.confirm(`Xác nhận chốt bảng lương tháng 13 năm ${year}?\nDữ liệu sẽ được lưu chính thức vào hệ thống.`)) return;
    
    setCalculating13(true);
    try {
      const res = await axios.post(`${API_SALARY_13}/tinh/${year}`, { maNVList: selectedRowKeys }, { headers });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchSalary13();
      }
    } catch (err) {
      toast.error('Lỗi tính lương: ' + (err.response?.data?.message || err.message));
    }
    setCalculating13(false);
  };

  const handlePay13 = async (row) => {
    if (!window.confirm(`Xác nhận đã chi trả thưởng tháng 13 cho ${row.HoTen}?\nSố tiền: ${fmt(row.LuongThucLinh || row.thuongT13_net)}`)) return;
    setPaying13(row.MaNV);
    try {
      const res = await axios.patch(`${API_SALARY_13}/${year}/${row.MaNV}/duyet`, {}, { headers });
      if (res.data.success) {
        fetchSalary13();
      }
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
    setPaying13(null);
  };

  const handleDelete13 = async () => {
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn HỦY bộ dữ liệu thưởng T13 năm ${year}? Phải tính toán lại toàn bộ dữ liệu.`)) return;
    try {
      const res = await axios.delete(`${API_SALARY_13}/${year}`, { headers });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchSalary13();
      }
    } catch (err) { toast.error('Lỗi khi xóa dữ liệu: ' + (err.response?.data?.message || err.message)); }
  };

  const dailyRate = (row) => {
    const base = parseFloat(row.LuongCoBan || 0);
    const daysInMonth = parseInt(row.SoNgayLamViecThang || row.SoNgayLamViec || 0) || 0;
    if (daysInMonth > 0) return base / daysInMonth;
    return base / 26;
  };
  const hourlyRate = (row) => dailyRate(row) / 8;
  const basePay = (row) => {
    if (row.LuongCoBanThucTe) return parseFloat(row.LuongCoBanThucTe || 0);
    return dailyRate(row) * parseFloat(row.PayableDays || row.SoNgayLam || 0);
  };
  const otPay = (row) => {
    if (row.OT_Pay) return parseFloat(row.OT_Pay || 0);
    return parseFloat(row.SoGioTangCa || 0) * hourlyRate(row) * 1.5;
  };

  const handleExportExcel = () => {
    if (salaryList.length === 0) { alert('Chưa có dữ liệu để xuất!'); return; }
      const rows = salaryList.map((row, idx) => ({
      STT: idx + 1,
      MaNV: row.MaNV,
      HoTen: row.HoTen,
      ChucVu: row.ChucVu || '',
        LuongCoBan: parseFloat(row.LuongCoBan || 0),
        SoNgayCong: parseFloat(row.PayableDays || row.SoNgayLam || 0),
        SoNgayLamViecThang: parseInt(row.SoNgayLamViecThang || row.SoNgayLamViec || 0),
        LuongCoBanThucTe: parseFloat(row.LuongCoBanThucTe || 0),
        LuongCong: Math.round(basePay(row)),
        GioTangCa: parseFloat(row.SoGioTangCa || 0),
        LuongTangCa: Math.round(otPay(row)),
        PhuCapChiuThue: parseFloat(row.PhuCapChiuThue || row.PhuCap || 0),
        PhuCapKhongChiuThue: parseFloat(row.PhuCapKhongChiuThue || 0),
      Thuong: parseFloat(row.Thuong || 0),
      Phat: parseFloat(row.Phat || 0),
        BhxhSickPay: parseFloat(row.BhxhSickPay || 0),
        MaternityPay: parseFloat(row.MaternityPay || 0),
        TongThuNhap: parseFloat(row.TongLuong || 0),
      TrangThai: row.TrangThai === 'Da_chi_tra' ? 'Đã chi trả' : 'Chưa chi trả',
    }));

    const columns = [
      { key: 'STT', header: 'STT', width: 6 },
      { key: 'MaNV', header: 'Mã NV', width: 10 },
      { key: 'HoTen', header: 'Tên NV', width: 30 },
      { key: 'ChucVu', header: 'Chức vụ', width: 20 },
      { key: 'LuongCoBan', header: 'Lương cơ bản', width: 16, type: 'currency' },
      { key: 'SoNgayCong', header: 'Số ngày công', width: 12 },
      { key: 'GioTangCa', header: 'Giờ tăng ca', width: 10 },
      { key: 'PhuCap', header: 'Phụ cấp', width: 12, type: 'currency' },
      { key: 'Thuong', header: 'Thưởng', width: 12, type: 'currency' },
      { key: 'Phat', header: 'Phạt', width: 12, type: 'currency' },
      { key: 'TongThuNhap', header: 'Tổng thu nhập', width: 16, type: 'currency' },
      { key: 'TrangThai', header: 'Trạng thái', width: 12 }
    ];
    exportToExcel({ filename: `BangLuong_T${month}_${year}.xlsx`, sheetName: `Luong_T${month}_${year}`, columns, data: rows });
  };

  const handleExportPDF = async () => {
    if (salaryList.length === 0) { alert('Chưa có dữ liệu để xuất!'); return; }
    try {
      const hc = await import('html2canvas');
      const html2canvas = hc.default || hc;
      const el = document.getElementById('salary-export-area');
      if (!el) {
        alert('Không tìm thấy vùng dữ liệu để xuất (salary-export-area)');
        return;
      }
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const imgProps = doc.getImageProperties(imgData);
      const imgHeight = (imgProps.height * usableWidth) / imgProps.width;
      doc.addImage(imgData, 'PNG', margin, 10, usableWidth, imgHeight);
      const filename = `BangLuong_T${month}_${year}.pdf`;
      doc.save(filename);
      alert('Xuất PDF Lương (ảnh) thành công!');
    } catch (err) {
      console.error('Lỗi html2canvas PDF export (luong):', err);
      alert('Xuất PDF thất bại. Hãy cài `html2canvas` (npm i html2canvas) hoặc báo mình để mình hỗ trợ.');
    }
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
          <button
            onClick={() => setActiveTab('salary13')}
            style={{
              padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px 8px 0 0',
              background: activeTab === 'salary13' ? '#fff' : '#f5f5f5',
              borderBottom: activeTab === 'salary13' ? '2px solid #fff' : '1px solid #ddd',
              fontWeight: 600, cursor: 'pointer', marginBottom: -1
            }}
          >Lương tháng 13</button>
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

          {activeTab === 'summary' ? (
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
          ) : activeTab === 'salary13' ? (
            <>
              {isPreviewMode && (
                <button
                  onClick={handleCalculate13}
                  disabled={calculating13 || salary13List.length === 0}
                  className="btn-salary"
                  style={{ background: '#e65100', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <i className={`fas ${calculating13 ? 'fa-spinner fa-spin' : 'fa-check-double'}`}></i> {calculating13 ? 'Đang lưu...' : 'Chốt bảng lương T13'}
                </button>
              )}
              {!isPreviewMode && (
                <div style={{ padding: '8px 16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 6, fontWeight: 700 }}>
                  <i className="fas fa-lock"></i> Đã chốt số liệu năm {year}
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
        {activeTab === 'summary' && (
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
                <div id="salary-export-area" style={{ overflowX: 'auto' }}>
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
        {activeTab === 'bonus_penalty' && (
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

        {/* TAB 4: SALARY 13 */}
        {activeTab === 'salary13' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <SummaryCard icon="fa-user-graduate" label="Nhân viên đủ điều kiện" value={`${salary13Summary.tongNhanVien} người`} color="#e65100" bg="#fff3e0" />
              <SummaryCard icon="fa-gift" label="Tổng quỹ thưởng T13" value={fmtShort(salary13Summary.tongChiPhi)} sub={fmt(salary13Summary.tongChiPhi)} color="#c62828" bg="#ffebee" />
              <SummaryCard icon="fa-info-circle" label="Trạng thái" value={isPreviewMode ? 'Bản xem trước' : 'Đã chốt sổ'} color={isPreviewMode ? '#1976d2' : '#2e7d32'} bg={isPreviewMode ? '#e3f2fd' : '#e8f5e9'} />
            </div>

            {/* Quy chuẩn trừ thưởng */}
            <div style={{ background: '#fff9c4', padding: '10px 15px', borderRadius: 8, fontSize: 13, color: '#f57f17', border: '1px solid #fff176', marginBottom: 20 }}>
              <i className="fas fa-exclamation-circle"></i> <strong>Quy tắc trừ thâm niên:</strong> 0-10 lần (Nhận 100%), 11-20 (-10%), 21-30 (-20%), 31-50 (-30%), >50 (Mất thưởng).
            </div>

            {loading13 ? <div style={{ textAlign: 'center', padding: 40 }}><i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</div> : (
              salary13List.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#f5f5f5', borderRadius: 10 }}>
                  Không có dữ liệu thưởng tháng 13 cho năm {year}.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: isPreviewMode ? '#555' : '#c62828', color: '#fff' }}>
                        <th style={th}>STT</th>
                        <th style={{ ...th, textAlign: 'left' }}>Nhân viên</th>
                        <th style={th}>Thâm niên (Tháng)</th>
                        <th style={th}>Vi phạm (Lần)</th>
                        <th style={th}>Thưởng Gross</th>
                        <th style={th}>Thuế TNCN</th>
                        <th style={th}>Thưởng Net</th>
                        <th style={th}>Ghi chú</th>
                        {!isPreviewMode && <th style={th}>Trạng thái</th>}
                        {!isPreviewMode && <th style={th}>Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {salary13List.map((row, idx) => (
                        <tr key={row.MaNV} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={td}>{idx + 1}</td>
                          <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{row.HoTen}</td>
                          <td style={td}>{row.soThangCong || row.PayableDays} tháng</td>
                          <td style={{ ...td, color: row.soViPham > 10 ? '#c62828' : '#555', fontWeight: row.soViPham > 10 ? 700 : 400 }}>
                            {row.soViPham || 0} lần
                          </td>
                          <td style={tdRight}>{fmt(row.thuongT13_gross || row.Thuong)}</td>
                          <td style={{ ...tdRight, color: '#c62828' }}>-{fmt(row.thueTNCN || row.ThueTNCN)}</td>
                          <td style={{ ...tdRight, fontWeight: 700, color: '#2e7d32' }}>{fmt(row.thuongT13_net || row.LuongThucLinh)}</td>
                          <td style={{ ...td, textAlign: 'left', fontSize: 11, color: '#666' }}>{row.ghiChu || row.GhiChu}</td>
                          {!isPreviewMode && (
                            <td style={td}>
                              <span style={{
                                fontSize: 11, padding: '2px 8px', borderRadius: 10,
                                background: row.TrangThai === 'Da_chi_tra' ? '#e8f5e9' : '#fff3e0',
                                color: row.TrangThai === 'Da_chi_tra' ? '#2e7d32' : '#e65100'
                              }}>
                                {row.TrangThai === 'Da_chi_tra' ? 'Đã chi trả' : 'Đợi duyệt'}
                              </span>
                            </td>
                          )}
                          {!isPreviewMode && (
                            <td style={td}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                <button
                                  onClick={() => { setDetailRow13(row); setDetailModal13(true); }}
                                  style={{
                                    padding: '6px 12px', border: 'none', background: '#1976d2', color: '#fff', borderRadius: 4, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12
                                  }}>
                                  <i className="fas fa-eye"></i> Chi tiết
                                </button>
                                {row.TrangThai !== 'Da_chi_tra' && (
                                  <button
                                    onClick={() => handlePay13(row)}
                                    disabled={paying13 === row.MaNV}
                                    style={{
                                      padding: '6px 12px', border: 'none', background: '#388e3c', color: '#fff', borderRadius: 4, cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 12
                                    }}>
                                    <i className={`fas ${paying13 === row.MaNV ? 'fa-spinner fa-spin' : 'fa-check'}`}></i> {paying13 === row.MaNV ? '...' : 'Chi trả'}
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
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

      {/* SALARY 13 DETAIL MODAL */}
      {detailModal13 && detailRow13 && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 10, width: 550, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Chi tiết Thưởng T13 - {year}</h3>
              <span style={{ fontSize: 24, cursor: 'pointer' }} onClick={() => setDetailModal13(false)}>&times;</span>
            </div>
            
            <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: 8, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{detailRow13.HoTen}</div>
              <div style={{ color: '#666', fontSize: 14 }}>{detailRow13.ChucVu}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={mRow}>
                <span>Lương cơ bản (đóng BH):</span> 
                <span style={{ fontWeight: 600 }}>{fmt(detailRow13.LuongCoBan || detailRow13.LuongCoBanThucTe)}</span>
              </div>
              <div style={mRow}>
                <span>Thời gian công tác trong năm:</span> 
                <span style={{ fontWeight: 600 }}>{detailRow13.soThangCong || detailRow13.PayableDays} / 12 tháng</span>
              </div>
              <div style={mRow}>
                <span>Tổng vi phạm (Trễ/Nghỉ KP):</span> 
                <span style={{ fontWeight: 700, color: detailRow13.soViPham > 10 ? '#c62828' : '#2e7d32' }}>{detailRow13.soViPham || 0} lần</span>
              </div>
              <div style={mRow}>
                <span>Tỉ lệ khấu trừ:</span> 
                <span style={{ fontWeight: 700, color: '#c62828' }}>
                  {detailRow13.tyLeKhauTru ? `-${detailRow13.tyLeKhauTru * 100}%` : 'Không trừ'}
                </span>
              </div>
              <div style={{ ...mRow, fontSize: 13, color: '#666', fontStyle: 'italic' }}>
                <span>Cách tính:</span>
                <span>(Lương CB * số tháng) / 12</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />
              
              <div style={mRow}>
                <span>Tổng thưởng (Gross):</span>
                <span style={{ fontWeight: 700 }}>{fmt(detailRow13.thuongT13_gross || detailRow13.Thuong)}</span>
              </div>
              <div style={{ ...mRow, color: '#c62828' }}>
                <span>Thuế TNCN tạm tính:</span>
                <span>-{fmt(detailRow13.thueTNCN || detailRow13.ThueTNCN)}</span>
              </div>
              
              <div style={{ 
                marginTop: 10, padding: '16px', background: '#e8f5e9', borderRadius: 8, 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#2e7d32' }}>Thực lĩnh (Net):</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: '#2e7d32' }}>{fmt(detailRow13.thuongT13_net || detailRow13.LuongThucLinh)}</span>
              </div>

              {(detailRow13.ghiChu || detailRow13.GhiChu) && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#888' }}>
                  <strong>Ghi chú:</strong> {detailRow13.ghiChu || detailRow13.GhiChu}
                </div>
              )}
            </div>

            <button 
              onClick={() => setDetailModal13(false)} 
              style={{ 
                marginTop: 24, width: '100%', padding: '12px', border: 'none', 
                background: '#444', color: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 600
              }}>
              Đóng cửa sổ
            </button>
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
