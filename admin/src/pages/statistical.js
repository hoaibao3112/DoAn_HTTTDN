import { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { message, DatePicker, Card, Row, Col, Statistic, Table, Tag } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

// SỬA LẠI IMPORT NÀY
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import '../styles/statistical.css';
// ...existing code...

// Đăng ký các components của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const { RangePicker } = DatePicker;

const ThongKe = () => {
  const { hasPermissionById } = useContext(PermissionContext);
  let unicodeFontName = null;
  // ==================== STATE ====================
  const [activeTab, setActiveTab] = useState('doanhthu');
  const [subTab, setSubTab] = useState('nam');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [dateRange, setDateRange] = useState([null, null]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(true);
const [salaryMonthly, setSalaryMonthly] = useState([]); // tổng theo tháng (api trả)
const [salaryDetails, setSalaryDetails] = useState([]);
const [selectedSalaryMonth, setSelectedSalaryMonth] = useState(null);
  const [productTab, setProductTab] = useState('sanpham');
  const [productFilter, setProductFilter] = useState('today');
  const [productDateRange, setProductDateRange] = useState([null, null]);
  const [sortBy, setSortBy] = useState('bestseller');
const [salaryData, setSalaryData] = useState([]);
const token = localStorage.getItem('authToken');
const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [customerFilter, setCustomerFilter] = useState('today');
  const [customerDateRange, setCustomerDateRange] = useState([null, null]);
  const [customerData, setCustomerData] = useState({ summary: {}, tiers: [], vips: [], trends: [] });

  // ==================== API CALLS ====================
  const fetchDoanhThuData = useCallback(async () => {
    setLoading(true);
    try {
      let url = '';
      // ...existing code...

      if (subTab === 'nam') {
        url = 'http://localhost:5000/api/reports/doanhthu/nam';
      } else if (subTab === 'thang') {
        url = `http://localhost:5000/api/reports/doanhthu/thang/${selectedYear}`;
      } else if (subTab === 'ngay') {
        url = `http://localhost:5000/api/reports/doanhthu/ngay/${selectedYear}/${selectedMonth}`;
      } else if (subTab === 'khoangtg') {
        if (!dateRange[0] || !dateRange[1]) {
          message.warning('Vui lòng chọn khoảng thời gian');
          setLoading(false);
          return;
        }
        url = 'http://localhost:5000/api/reports/doanhthu/khoangtg';
        const response = await axios.post(url, {
          tuNgay: dateRange[0].format('YYYY-MM-DD'),
          denNgay: dateRange[1].format('YYYY-MM-DD')
        }, { headers });
        setData(response.data.data || []);
        setLoading(false);
        return;
      }

      const response = await axios.get(url, { headers });
      setData(response.data.data || []);
    } catch (error) {
      console.error('Lỗi fetch doanh thu:', error);
      message.error('Không thể tải dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  }, [subTab, selectedYear, selectedMonth, dateRange, headers]);
// ...existing code continues

// ...existing code...

const fetchSalaryDetails = useCallback(async (month) => {
  if (!month) return;
  setLoading(true);
  try {
    const res = await axios.get(`http://localhost:5000/api/salary/per-month/${salaryYear}/${month}`, { headers });
    const payload = res.data?.data ?? [];
    const records = Array.isArray(payload) ? payload : [payload];
    const normalized = records
      .filter(r => r && r.MaNV)
      .map(r => ({
        id: r.id || 0,
        MaNV: r.MaNV ?? '',
        TenNV: r.TenNV ?? 'N/A',
        ChucVu: r.ChucVu ?? '',
        month: Number(r.Thang ?? month),
        year: Number(r.Nam ?? salaryYear),
        luong_co_ban: Number(r.luong_co_ban ?? 0),
        phu_cap: Number(r.phu_cap ?? 0),
        tang_ca: Number(r.tang_ca ?? 0),
        thuong: Number(r.thuong ?? 0),
        phat: Number(r.phat ?? 0),
        tong_luong: Number(r.tong_luong ?? 0),
        so_ngay_lam: Number(r.SoNgayLam ?? 0),
        trang_thai: r.trang_thai ?? 'Chưa trả',
      }));
    setSalaryDetails(normalized);
    setSelectedSalaryMonth(month);
  } catch (error) {
    console.error('Lỗi fetch chi tiết lương:', error.response?.data || error.message);
    message.error('Không thể tải chi tiết lương');
    setSalaryDetails([]);
  } finally {
    setLoading(false);
  }
}, [salaryYear]);

// Auto-load chi tiết khi user chọn tháng (hoặc khi monthly được load lần đầu)
useEffect(() => {
  if (selectedSalaryMonth) {
    fetchSalaryDetails(selectedSalaryMonth);
  }
}, [selectedSalaryMonth, fetchSalaryDetails]);

// Nếu sau fetch tổng theo tháng bạn muốn auto chọn tháng có dữ liệu:
useEffect(() => {
  if ((!selectedSalaryMonth || selectedSalaryMonth === null) && Array.isArray(salaryMonthly) && salaryMonthly.length) {
    // chọn tháng đầu tiên có TongLuong > 0, nếu không thì tháng hiện tại
    const m = (salaryMonthly.find(x => Number(x.Thang ?? x.month) && Number(x.TongLuong ?? x.total) > 0) || {}).Thang
      ?? (salaryMonthly[0].Thang ?? salaryMonthly[0].month)
      ?? (new Date().getMonth() + 1);
    setSelectedSalaryMonth(Number(m));
  }
}, [salaryMonthly, selectedSalaryMonth]);
  const fetchBanHangData = useCallback(async () => {
    setLoading(true);
    try {
      const url = productTab === 'sanpham' 
        ? 'http://localhost:5000/api/reports/banhang/sanpham'
        : 'http://localhost:5000/api/reports/banhang/theloai';

      const payload = {
        timePeriod: productFilter
      };

      if (productFilter === 'custom' && productDateRange[0] && productDateRange[1]) {
        payload.tuNgay = productDateRange[0].format('YYYY-MM-DD');
        payload.denNgay = productDateRange[1].format('YYYY-MM-DD');
      }

      const response = await axios.post(url, payload, { headers });
      setData(response.data.data || []);
    } catch (error) {
      console.error('Lỗi fetch bán hàng:', error);
      message.error('Không thể tải dữ liệu bán hàng');
    } finally {
      setLoading(false);
    }
  }, [productTab, productFilter, productDateRange, headers]);

  const fetchKhachHangData = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        timePeriod: customerFilter
      };

      if (customerFilter === 'custom' && customerDateRange[0] && customerDateRange[1]) {
        payload.tuNgay = customerDateRange[0].format('YYYY-MM-DD');
        payload.denNgay = customerDateRange[1].format('YYYY-MM-DD');
      }

      const response = await axios.post('http://localhost:5000/api/reports/khachhang/khoangtg', payload, { headers });
      setCustomerData(response.data.data || { summary: {}, tiers: [], vips: [], trends: [] });
      // Also update shared data for Export PDF/Excel compatibility if they rely on it
      setData(response.data.data.trends || []);
    } catch (error) {
      console.error('Lỗi fetch khách hàng:', error);
      message.error('Không thể tải dữ liệu khách hàng');
    } finally {
      setLoading(false);
    }
  }, [customerFilter, customerDateRange, headers]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (activeTab === 'doanhthu') {
      fetchDoanhThuData();
    }
  }, [activeTab, fetchDoanhThuData]);

  useEffect(() => {
    if (activeTab === 'banhang') {
      fetchBanHangData();
    }
  }, [activeTab, fetchBanHangData]);

  useEffect(() => {
    if (activeTab === 'khachhang') {
      fetchKhachHangData();
    }
  }, [activeTab, fetchKhachHangData]);



// ...existing code...

// ==================== API CALLS (LƯƠNG) ====================
const fetchLuongData = useCallback(async () => {
  setLoading(true);
  try {
    const res = await axios.get(`http://localhost:5000/api/salary/monthly/${salaryYear}`, { headers });
    let payload = res.data;
    if (payload && payload.success && payload.data) payload = payload.data;
    if (payload && payload.data && Array.isArray(payload.data)) payload = payload.data;

    let normalized = [];
    if (Array.isArray(payload)) {
      normalized = payload;
    } else if (payload && typeof payload === 'object') {
      const monthKeys = Object.keys(payload).filter(k => !isNaN(k)).sort((a,b)=>a-b);
      if (monthKeys.length) {
        normalized = monthKeys.map(k => {
          const v = payload[k];
          if (typeof v === 'number') return { month: Number(k), total: Number(v) };
          if (v && typeof v === 'object') return { month: Number(k), ...v };
          return { month: Number(k), total: 0 };
        });
      } else {
        normalized = Object.values(payload).map(v => (typeof v === 'object' ? v : { value: v }));
      }
    }

    normalized = normalized.map(item => {
      if (!item) return null;
      const obj = { ...(typeof item === 'object' ? item : { value: item }) };
      if (obj.month === undefined && obj.Thang !== undefined) obj.month = Number(obj.Thang);
      if (obj.total === undefined && (obj.TongLuong !== undefined)) obj.total = Number(obj.TongLuong);
      if (obj.total === undefined && (obj.tong_luong !== undefined)) obj.total = Number(obj.tong_luong);
      return obj;
    }).filter(Boolean);

    // set both monthly summary and salaryData used by chart/table
    setSalaryMonthly(normalized);
    setSalaryData(normalized);
    console.debug('salary monthly data:', normalized);
  } catch (error) {
    console.error('Lỗi fetch lương:', error);
    message.error('Không thể tải dữ liệu lương');
    setSalaryMonthly([]);
    setSalaryData([]);
  } finally {
    setLoading(false);
  }
}, [salaryYear]);

// gọi fetch khi chuyển sang tab Lương hoặc khi đổi năm
useEffect(() => {
  if (activeTab === 'luong') {
    fetchLuongData();
  }
}, [activeTab, salaryYear, fetchLuongData]);



// Biểu đồ thanh: tổng lương 12 tháng trong năm
const getLuongYearChartData = () => {
  const totals = Array(12).fill(0);
  const nvCounts = Array(12).fill(0);
  if (Array.isArray(salaryMonthly)) {
    salaryMonthly.forEach(row => {
      const m = Number(row.month ?? row.Thang);
      if (m >= 1 && m <= 12) {
        totals[m - 1] = Number(row.total ?? row.TongLuong ?? 0);
        nvCounts[m - 1] = Number(row.so_nv ?? 0);
      }
    });
  }
  return {
    labels: Array.from({ length: 12 }, (_, i) => `T${i + 1}`),
    datasets: [
      {
        label: 'Tổng lương (VNĐ)',
        data: totals,
        backgroundColor: 'rgba(54,162,235,0.75)',
        borderColor: 'rgb(54,162,235)',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        label: 'Số nhân viên',
        data: nvCounts,
        type: 'line',
        borderColor: 'rgb(255,159,64)',
        backgroundColor: 'rgba(255,159,64,0.2)',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };
};

// Biểu đồ thanh: tổng lương theo từng nhân viên trong tháng đang chọn
const getLuongMonthChartData = () => {
  if (!salaryDetails || salaryDetails.length === 0) return null;
  const sorted = [...salaryDetails].sort((a, b) => b.tong_luong - a.tong_luong).slice(0, 15);
  const colors = sorted.map((_, i) => `hsla(${(i * 25) % 360}, 70%, 55%, 0.8)`);
  return {
    labels: sorted.map(e => e.TenNV),
    datasets: [
      {
        label: 'Tổng nhận (VNĐ)',
        data: sorted.map(e => e.tong_luong),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
};

  // ==================== CHART DATA ====================
  const getDoanhThuChartData = () => {
    if (!data || data.length === 0) return null;

    const labels = data.map(item => {
      if (subTab === 'nam') return `Năm ${item.Nam}`;
      if (subTab === 'thang') return `Tháng ${item.Thang}`;
      if (subTab === 'ngay') return `Ngày ${item.Ngay}`;
      return dayjs(item.Ngay).format('DD/MM');
    });

    return {
      labels,
      datasets: [
        {
          label: 'Vốn',
          data: data.map(item => item.Von),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.4,
        },
        {
          label: 'Doanh thu',
          data: data.map(item => item.DoanhThu),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4,
        }
      ]
    };
  };

  const getBanHangChartData = () => {
    if (!data || data.length === 0) return null;

    if (productTab === 'sanpham') {
      const top10 = data.slice(0, 10);
      return {
        labels: top10.map(item => item.TenSP),
        datasets: [
          {
            label: 'Số lượng bán',
            data: top10.map(item => item.SoLuongBan),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(199, 199, 199, 0.8)',
              'rgba(83, 102, 255, 0.8)',
              'rgba(255, 99, 255, 0.8)',
              'rgba(99, 255, 132, 0.8)',
            ],
            borderWidth: 1,
          }
        ]
      };
    } else {
      return {
        labels: data.map(item => item.TheLoai),
        datasets: [
          {
            label: 'Tổng số lượng',
            data: data.map(item => item.TongSoLuong),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(199, 199, 199, 0.8)',
              'rgba(83, 102, 255, 0.8)',
            ],
            borderWidth: 2,
          }
        ]
      };
    }
  };

  const getKhachHangChartData = () => {
    const trends = customerData.trends || [];
    if (trends.length === 0) return null;

    return {
      labels: trends.map(item => dayjs(item.ThoiGian).format('DD/MM')),
      datasets: [
        {
          label: 'Số lượng đơn',
          data: trends.map(item => item.SoLuongDon),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Khách hàng tương tác',
          data: trends.map(item => item.SoLuongKhachHang),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getTierChartData = () => {
    const tiers = customerData.tiers || [];
    if (tiers.length === 0) return null;

    const tierLabels = {
      'Dong': 'Hạng Đồng',
      'Bac': 'Hạng Bạc',
      'Vang': 'Hạng Vàng',
      'Kim_cuong': 'Kim Cương'
    };

    return {
      labels: tiers.map(t => tierLabels[t.name] || t.name),
      datasets: [
        {
          data: tiers.map(t => t.value),
          backgroundColor: [
            '#cd7f32', // Bronze
            '#c0c0c0', // Silver
            '#ffd700', // Gold
            '#b9f2ff'  // Diamond
          ],
          borderWidth: 0
        }
      ]
    };
  };

  // ==================== CHART OPTIONS ====================
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ thống kê',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (activeTab === 'doanhthu') {
              label += new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(context.parsed.y);
            } else {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: activeTab === 'doanhthu' || activeTab === 'khachhang' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (activeTab === 'doanhthu') {
              return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                notation: 'compact',
                compactDisplay: 'short'
              }).format(value);
            }
            return value;
          }
        }
      }
    } : undefined
  };

  // ==================== HELPER FUNCTIONS ====================
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // Robust number parser for currency-like values
  const parseNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === 'number' && isFinite(v)) return v;
    if (typeof v === 'string') {
      const cleaned = v.replace(/[^0-9,.-]/g, '');
      if (!cleaned) return 0;
      if (cleaned.indexOf(',') !== -1 && cleaned.indexOf('.') !== -1) {
        // e.g. '1.234,56' => '1234.56'
        return Number(cleaned.replace(/\./g, '').replace(/,/g, '.')) || 0;
      }
      return Number(cleaned.replace(/,/g, '.')) || 0;
    }
    return 0;
  };

  // ...existing code...

const handleExportPDF = async () => {
    // For non-salary tabs require `data`. For salary tab allow export when salaryDetails or salaryMonthly exist.
    if (activeTab === 'luong') {
      if ((!salaryDetails || salaryDetails.length === 0) && (!salaryMonthly || salaryMonthly.length === 0)) {
        message.warning('Không có dữ liệu lương để xuất');
        return;
      }
    } else {
      if (!data || data.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        return;
      }
    }

    try {
      // For the 'luong' tab we always capture the DOM as an image (html2canvas) to avoid font issues
      if (activeTab === 'luong') {
        try {
          const hc = await import('html2canvas');
          const html2canvas = hc.default || hc;
          const el = document.getElementById('luong-export-area');
          if (!el) {
            message.error('Không tìm thấy vùng dữ liệu lương để xuất (luong-export-area)');
            return;
          }
          const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
          const imgData = canvas.toDataURL('image/png');
          const doc = new jsPDF('p', 'mm', 'a4');
          const pageWidth = doc.internal.pageSize.getWidth();
          const margin = 10;
          const usableWidth = pageWidth - margin * 2;
          const imgProps = doc.getImageProperties(imgData);
          const imgHeight = (imgProps.height * usableWidth) / imgProps.width;
          doc.addImage(imgData, 'PNG', margin, 10, usableWidth, imgHeight);
          const filename = `luong_${selectedSalaryMonth || 'all'}_${salaryYear}_${Date.now()}.pdf`;
          doc.save(filename);
          message.success('Xuất PDF Lương (ảnh) thành công!');
          return;
        } catch (err) {
          console.error('Lỗi html2canvas PDF export (luong):', err);
          message.error('Xuất PDF (ảnh) thất bại. Cài `html2canvas` (npm i html2canvas) để hỗ trợ xuất ảnh.');
          return;
        }
      }
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      let titleText = '';
      let tableHeaders = [];
      let tableData = [];

      // === XÁC ĐỊNH TIÊU ĐỀ VÀ DỮ LIỆU ===
  if (activeTab === 'doanhthu') {
        titleText = `THONG KE DOANH THU ${
          subTab === 'nam' ? 'THEO NAM' : 
          subTab === 'thang' ? `TUNG THANG NAM ${selectedYear}` : 
          subTab === 'ngay' ? `TUNG NGAY THANG ${selectedMonth}/${selectedYear}` : 
          'THEO KHOANG THOI GIAN'
        }`;
        
        tableHeaders = [
          ['STT', subTab === 'nam' ? 'Nam' : subTab === 'thang' ? 'Thang' : subTab === 'ngay' ? 'Ngay' : 'Thoi gian', 'Von (VND)', 'Doanh thu (VND)']
        ];
        
        tableData = data.map((item, index) => [
          index + 1,
          item.Nam || item.Thang || item.Ngay || dayjs(item.Ngay).format('DD/MM/YYYY'),
          new Intl.NumberFormat('vi-VN').format(item.Von),
          new Intl.NumberFormat('vi-VN').format(item.DoanhThu)
        ]);
      } else if (activeTab === 'banhang') {
        titleText = `THONG KE BAN HANG THEO ${productTab === 'sanpham' ? 'SAN PHAM' : 'THE LOAI'}`;
        
        if (productTab === 'sanpham') {
          tableHeaders = [['STT', 'Ma SP', 'Ten SP', 'SL ban', 'SL don']];
          tableData = data.map((item, index) => [
            index + 1,
            item.MaSP,
            item.TenSP,
            item.SoLuongBan,
            item.SoLuongDon
          ]);
        } else {
          tableHeaders = [['STT', 'The loai', 'Tong SL', 'Tong don', 'So SP']];
          tableData = data.map((item, index) => [
            index + 1,
            item.TheLoai,
            item.TongSoLuong,
            item.TongDon,
            item.SoSanPham
          ]);
        }
      } else if (activeTab === 'khachhang') {
        titleText = 'THONG KE KHACH MUA HANG THEO THOI GIAN';
        
        tableHeaders = [['STT', 'Thoi gian', 'So luong KH', 'So luong don', 'So loai SP']];
        tableData = data.map((item, index) => [
          index + 1,
          dayjs(item.ThoiGian).format('DD/MM/YYYY'),
          item.SoLuongKhachHang,
          item.SoLuongDon,
          item.SoLoaiSanPham
        ]);
      }

      // === LUONG EXPORT ===
      else if (activeTab === 'luong') {
        titleText = `THONG KE LUONG THANG ${selectedSalaryMonth || ''} NAM ${salaryYear}`;
        tableHeaders = [[
          'STT', 'Mã NV', 'Tên NV', 'Lương cơ bản', 'Phụ cấp', 'Tăng ca', 'Thưởng', 'Phạt', 'Tổng nhận', 'Trạng thái'
        ]];

        // prefer detailed rows; fallback to monthly summary
        const rows = Array.isArray(salaryDetails) && salaryDetails.length ? salaryDetails : [];

        tableData = rows.map((r, i) => [
          i + 1,
          r.MaNV,
          r.TenNV,
          new Intl.NumberFormat('vi-VN').format(r.luong_co_ban || 0),
          new Intl.NumberFormat('vi-VN').format(r.phu_cap || 0),
          new Intl.NumberFormat('vi-VN').format(r.tang_ca || 0),
          new Intl.NumberFormat('vi-VN').format(r.thuong || 0),
          new Intl.NumberFormat('vi-VN').format(r.phat || 0),
          new Intl.NumberFormat('vi-VN').format(((r.tong_luong ?? r.tong_nhan) || 0)),
          r.trang_thai || ''
        ]);

        // compute total paid for the month using robust parser
        let totalPaid = 0;
        if (rows.length) {
          totalPaid = rows.reduce((s, rr) => s + parseNumber(rr.tong_luong ?? rr.tong_nhan), 0);
        } else if (Array.isArray(salaryMonthly) && salaryMonthly.length && selectedSalaryMonth) {
          const m = salaryMonthly.find(x => Number(x.Thang ?? x.month) === Number(selectedSalaryMonth));
          totalPaid = parseNumber(m && (m.TongLuong ?? m.total));
        } else if (Array.isArray(salaryMonthly) && salaryMonthly.length && !selectedSalaryMonth) {
          totalPaid = salaryMonthly.reduce((s, x) => s + parseNumber(x.TongLuong ?? x.total), 0);
        }

        // if no detailed rows, add a placeholder row to show month summary
        if (!tableData.length && Array.isArray(salaryMonthly) && salaryMonthly.length) {
          const m = salaryMonthly.find(x => Number(x.Thang ?? x.month) === Number(selectedSalaryMonth));
          tableData = [[
            1,
            '- ',
            `Tổng lương tháng ${selectedSalaryMonth || 'N/A'}`,
            '-', '-', '-', '-', '-', new Intl.NumberFormat('vi-VN').format((m && (m.TongLuong ?? m.total)) || 0), '-'
          ]];
        }

        // expose totalPaid to use after autoTable
        var luongTotalPaid = totalPaid;
      }

      // === VẼ BACKGROUND GRADIENT ===
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageWidth, 40, 'F');

      // === TIÊU ĐỀ CHÍNH ===
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  if (unicodeFontName) doc.setFont(unicodeFontName, 'normal'); else doc.setFont('helvetica', 'bold');
  // note: jsPDF font weight support depends on added font variants; use normal for safety
  doc.text(titleText, pageWidth / 2, 20, { align: 'center' });

      // === THÔNG TIN PHỤ ===
  doc.setFontSize(10);
  if (unicodeFontName) doc.setFont(unicodeFontName, 'normal'); else doc.setFont('helvetica', 'italic');
      const dateText = `Ngay xuat: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`;
      doc.text(dateText, pageWidth / 2, 30, { align: 'center' });

      // === ĐƯỜNG KẺ TRANG TRÍ ===
      doc.setDrawColor(118, 75, 162);
      doc.setLineWidth(1);
      doc.line(10, 42, pageWidth - 10, 42);

      // === VẼ BẢNG DỮ LIỆU ===
      autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: 48,
        theme: 'grid',
        styles: {
          font: unicodeFontName || 'helvetica',
          fontSize: 10,
          cellPadding: 5,
          overflow: 'linebreak',
          halign: 'center',
          valign: 'middle',
        },
        headStyles: {
          fillColor: [118, 75, 162],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11,
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 'auto' },
        },
        didParseCell: function(data) {
          if (activeTab === 'doanhthu') {
            if (data.column.index === 2) {
              data.cell.styles.textColor = [255, 107, 107];
              data.cell.styles.fontStyle = 'bold';
            }
            if (data.column.index === 3) {
              data.cell.styles.textColor = [82, 196, 26];
              data.cell.styles.fontStyle = 'bold';
            }
          } else if (activeTab === 'banhang') {
            if ((productTab === 'sanpham' && data.column.index === 3) || 
                (productTab === 'theloai' && data.column.index === 2)) {
              data.cell.styles.textColor = [24, 144, 255];
              data.cell.styles.fontStyle = 'bold';
            }
          } else if (activeTab === 'khachhang' && data.column.index === 3) {
            data.cell.styles.textColor = [24, 144, 255];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        didDrawPage: function(data) {
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
          
          doc.setFontSize(9);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Trang ${currentPage} / ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
          
          doc.setFontSize(8);
          doc.text('Admin System - Your Company', 10, pageHeight - 10);
        },
        margin: { top: 48, left: 10, right: 10, bottom: 20 },
      });

      // === THÊM TỔNG KẾT (NẾU LÀ DOANH THU) ===
      if (activeTab === 'doanhthu' && data.length > 0) {
        const finalY = doc.lastAutoTable.finalY || 50;
        
        const tongVon = data.reduce((sum, item) => sum + (item.Von || 0), 0);
        const tongDoanhThu = data.reduce((sum, item) => sum + (item.DoanhThu || 0), 0);
        const loiNhuan = tongDoanhThu - tongVon;
        
        doc.setFillColor(230, 247, 255);
        doc.roundedRect(10, finalY + 5, pageWidth - 20, 30, 3, 3, 'F');
        
  doc.setFontSize(11);
  if (unicodeFontName) doc.setFont(unicodeFontName, 'normal'); else doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        
        const summaryX = 15;
        let summaryY = finalY + 15;
        
        doc.text(`Tong von: ${new Intl.NumberFormat('vi-VN').format(tongVon)} VND`, summaryX, summaryY);
        summaryY += 7;
        doc.text(`Tong doanh thu: ${new Intl.NumberFormat('vi-VN').format(tongDoanhThu)} VND`, summaryX, summaryY);
        summaryY += 7;
        doc.setTextColor(loiNhuan >= 0 ? 82 : 255, loiNhuan >= 0 ? 196 : 0, loiNhuan >= 0 ? 26 : 0);
        doc.text(`Loi nhuan: ${new Intl.NumberFormat('vi-VN').format(loiNhuan)} VND`, summaryX, summaryY);
      }

      // === THÊM TỔNG KẾT (NẾU LÀ LUONG) ===
      if (activeTab === 'luong') {
        const finalY = doc.lastAutoTable ? (doc.lastAutoTable.finalY || 50) : 50;
        const total = typeof luongTotalPaid !== 'undefined' ? luongTotalPaid : 0;

        doc.setFillColor(230, 247, 255);
        doc.roundedRect(10, finalY + 5, pageWidth - 20, 20, 3, 3, 'F');

  doc.setFontSize(11);
  if (unicodeFontName) doc.setFont(unicodeFontName, 'normal'); else doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);

        const summaryX = 15;
        let summaryY = finalY + 15;
        doc.text(`Tong tien luong da chi tra: ${new Intl.NumberFormat('vi-VN').format(total)} VND`, summaryX, summaryY);
      }

      const filename = `${activeTab}_${Date.now()}.pdf`;
      doc.save(filename);
      
      message.success('Xuất PDF thành công!');
    } catch (error) {
      console.error('Lỗi xuất PDF:', error);
      message.error('Không thể xuất PDF');
    }
  };
  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      message.warning('Không có dữ liệu để xuất');
      return;
    }

    try {
      let exportData = [];
      let filename = '';
      let sheetName = '';
      let titleText = '';

      if (activeTab === 'doanhthu') {
        filename = `DoanhThu_${subTab}_${Date.now()}.xlsx`;
        sheetName = 'Doanh Thu';
        titleText = `THỐNG KÊ DOANH THU ${
          subTab === 'nam' ? 'THEO NĂM' : 
          subTab === 'thang' ? `TỪNG THÁNG NĂM ${selectedYear}` : 
          subTab === 'ngay' ? `TỪNG NGÀY THÁNG ${selectedMonth}/${selectedYear}` : 
          'THEO KHOẢNG THỜI GIAN'
        }`;
        
        exportData = data.map((item, index) => ({
          'STT': index + 1,
          [subTab === 'nam' ? 'Năm' : subTab === 'thang' ? 'Tháng' : subTab === 'ngay' ? 'Ngày' : 'Thời gian']: 
            item.Nam || item.Thang || item.Ngay || dayjs(item.Ngay).format('DD/MM/YYYY'),
          'Vốn': item.Von,
          'Doanh thu': item.DoanhThu
        }));
      } else if (activeTab === 'banhang') {
        filename = `BanHang_${productTab}_${Date.now()}.xlsx`;
        sheetName = productTab === 'sanpham' ? 'Sản Phẩm' : 'Thể Loại';
        titleText = `THỐNG KÊ BÁN HÀNG THEO ${productTab === 'sanpham' ? 'SẢN PHẨM' : 'THỂ LOẠI'}`;
        
        if (productTab === 'sanpham') {
          exportData = data.map((item, index) => ({
            'STT': index + 1,
            'Mã SP': item.MaSP,
            'Tên SP': item.TenSP,
            'SL bán': item.SoLuongBan,
            'SL đơn': item.SoLuongDon
          }));
        } else {
          exportData = data.map((item, index) => ({
            'STT': index + 1,
            'Thể loại': item.TheLoai,
            'Tổng SL': item.TongSoLuong,
            'Tổng đơn': item.TongDon,
            'Số SP': item.SoSanPham
          }));
        }
      } else if (activeTab === 'khachhang') {
        filename = `KhachHang_${Date.now()}.xlsx`;
        sheetName = 'Khách Hàng';
        titleText = 'THỐNG KÊ KHÁCH MUA HÀNG THEO THỜI GIAN';
        
        exportData = data.map((item, index) => ({
          'STT': index + 1,
          'Thời gian': dayjs(item.ThoiGian).format('DD/MM/YYYY'),
          'Số lượng KH': item.SoLuongKhachHang,
          'Số lượng đơn': item.SoLuongDon,
          'Số loại SP': item.SoLoaiSanPham
        }));
      } else if (activeTab === 'luong') {
        filename = `Luong_${selectedSalaryMonth || 'all'}_${salaryYear}_${Date.now()}.xlsx`;
        sheetName = 'Lương';
        titleText = `THỐNG KÊ LƯƠNG THÁNG ${selectedSalaryMonth || 'TẤT CẢ'} NĂM ${salaryYear}`;

        // prefer details if available
        if (Array.isArray(salaryDetails) && salaryDetails.length) {
          exportData = salaryDetails.map((r, i) => ({
            'STT': i + 1,
            'Mã NV': r.MaNV,
            'Tên NV': r.TenNV,
            'Lương cơ bản': r.luong_co_ban || 0,
            'Phụ cấp': r.phu_cap || 0,
            'Tăng ca': r.tang_ca || 0,
            'Thưởng': r.thuong || 0,
            'Phạt': r.phat || 0,
            'Tổng nhận': (r.tong_luong ?? r.tong_nhan) || 0,
            'Trạng thái': r.trang_thai || ''
          }));
        } else if (Array.isArray(salaryMonthly) && salaryMonthly.length) {
          // export monthly summary rows
          exportData = salaryMonthly.map((m, i) => ({
            'STT': i + 1,
            'Tháng': m.Thang ?? m.month,
            'Tổng lương': m.TongLuong ?? m.total ?? 0
          }));
        }
        // append total row later after sheet creation
      }

      const ws = XLSX.utils.aoa_to_sheet([]);
      
      XLSX.utils.sheet_add_aoa(ws, [[titleText]], { origin: 'A1' });
      
      const dateText = `Ngày xuất: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`;
      XLSX.utils.sheet_add_aoa(ws, [[dateText]], { origin: 'A2' });
      
      XLSX.utils.sheet_add_aoa(ws, [['']], { origin: 'A3' });
      
      XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A4', skipHeader: false });

      // If salary export, append total summary row after data
      if (activeTab === 'luong') {
        // compute total
        let totalPaid = 0;
        if (Array.isArray(salaryDetails) && salaryDetails.length) {
          totalPaid = salaryDetails.reduce((s, r) => s + (Number((r.tong_luong ?? r.tong_nhan) || 0) || 0), 0);
        } else if (Array.isArray(salaryMonthly) && salaryMonthly.length) {
          totalPaid = salaryMonthly.reduce((s, m) => s + (Number(m.TongLuong ?? m.total) || 0), 0);
        }

        const afterRow = XLSX.utils.decode_range(ws['!ref']).e.r + 2; // +1 for 1-index, +1 for blank row
        XLSX.utils.sheet_add_aoa(ws, [['']], { origin: `A${afterRow}` });
        XLSX.utils.sheet_add_aoa(ws, [[`Tong tien luong da chi tra:`, new Intl.NumberFormat('vi-VN').format(totalPaid)]], { origin: `A${afterRow + 1}` });
      }
      
      const range = XLSX.utils.decode_range(ws['!ref']);
      const numCols = range.e.c + 1;
      
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: numCols - 1 } }
      ];
      
      ws['A1'].s = {
        fill: { fgColor: { rgb: "667EEA" } },
        font: { name: "Arial", sz: 18, bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } },
          left: { style: "medium", color: { rgb: "000000" } },
          right: { style: "medium", color: { rgb: "000000" } }
        }
      };
      
      ws['A2'].s = {
        fill: { fgColor: { rgb: "E6F7FF" } },
        font: { name: "Arial", sz: 11, italic: true, color: { rgb: "1890FF" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { bottom: { style: "thin", color: { rgb: "91D5FF" } } }
      };
      
      for (let C = 0; C < numCols; ++C) {
        const address = XLSX.utils.encode_col(C) + "4";
        if (!ws[address]) continue;
        
        ws[address].s = {
          fill: { fgColor: { rgb: "764BA2" } },
          font: { name: "Arial", sz: 12, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } }
          }
        };
      }
      
      for (let R = 4; R <= range.e.r; ++R) {
        for (let C = 0; C < numCols; ++C) {
          const address = XLSX.utils.encode_col(C) + (R + 1);
          if (!ws[address]) continue;
          
          const fillColor = (R - 4) % 2 === 0 ? "F8F9FA" : "FFFFFF";
          
          ws[address].s = {
            fill: { fgColor: { rgb: fillColor } },
            font: { name: "Arial", sz: 11, color: { rgb: "212529" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "E9ECEF" } },
              bottom: { style: "thin", color: { rgb: "E9ECEF" } },
              left: { style: "thin", color: { rgb: "E9ECEF" } },
              right: { style: "thin", color: { rgb: "E9ECEF" } }
            }
          };
          
          if (activeTab === 'doanhthu') {
            if (C === 2 || C === 3) {
              ws[address].z = '#,##0" ₫"';
              ws[address].s.font.color = { rgb: C === 3 ? "52C41A" : "FF6B6B" };
              ws[address].s.font.bold = true;
              ws[address].s.font.sz = 12;
            }
          }
          
          if (activeTab === 'banhang') {
            if (productTab === 'sanpham' && C === 3) {
              ws[address].s.font.color = { rgb: "1890FF" };
              ws[address].s.font.bold = true;
              ws[address].s.font.sz = 12;
            } else if (productTab === 'theloai' && C === 2) {
              ws[address].s.font.color = { rgb: "1890FF" };
              ws[address].s.font.bold = true;
              ws[address].s.font.sz = 12;
            }
          }
          
          if (activeTab === 'khachhang' && C === 3) {
            ws[address].s.font.color = { rgb: "1890FF" };
            ws[address].s.font.bold = true;
            ws[address].s.font.sz = 12;
          }
        }
      }
      
      const colWidths = [];
      for (let C = 0; C < numCols; ++C) {
        let maxWidth = 12;
        for (let R = 3; R <= range.e.r; ++R) {
          const address = XLSX.utils.encode_col(C) + (R + 1);
          if (ws[address] && ws[address].v) {
            const cellLength = ws[address].v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        colWidths.push({ wch: Math.min(maxWidth + 3, 40) });
      }
      ws['!cols'] = colWidths;
      
      const rowHeights = [];
      rowHeights.push({ hpt: 35 });
      rowHeights.push({ hpt: 22 });
      rowHeights.push({ hpt: 10 });
      rowHeights.push({ hpt: 28 });
      
      for (let R = 4; R <= range.e.r; ++R) {
        rowHeights.push({ hpt: 22 });
      }
      ws['!rows'] = rowHeights;
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      wb.Props = {
        Title: titleText,
        Subject: "Thống kê dữ liệu",
        Author: "Admin System",
        Company: "Your Company",
        CreatedDate: new Date()
      };
      
      XLSX.writeFile(wb, filename, { 
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary',
        cellStyles: true
      });
      
      message.success('Xuất Excel thành công!');
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      message.error('Không thể xuất Excel');
    }
  };

  // ==================== RENDER CHART ====================
 // ...existing code...
const renderChart = () => {
  if (!showChart || loading) return null;

  let chartData = null;
  let ChartComponent = null;

  if (activeTab === 'doanhthu') {
    if (!data || data.length === 0) return null;
    chartData = getDoanhThuChartData();
    ChartComponent = Line;
  } else if (activeTab === 'banhang') {
    if (!data || data.length === 0) return null;
    chartData = getBanHangChartData();
    ChartComponent = productTab === 'sanpham' ? Bar : Pie;
  } else if (activeTab === 'khachhang') {
    if (!data || data.length === 0) return null;
    chartData = getKhachHangChartData();
    ChartComponent = Bar;
  } else if (activeTab === 'luong') {
    return null; // Charts trong luong tab tự render riêng
  }

  if (!chartData || !ChartComponent) {
    console.debug('No chartData or ChartComponent', { activeTab, chartData, salaryData });
    return null;
  }

  // debug: in ra dữ liệu chart để kiểm tra
  console.debug('Render chart', { activeTab, chartData });

  return (
    <div className="chart-container" style={{ width: '100%', marginTop: 12 }}>
      <div className="chart-wrapper" style={{ height: 360 }}>
        <ChartComponent data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
// ...existing code...
  // ==================== RENDER TABS ====================
  const renderDoanhThuTab = () => (
    <div className="thongke-content">
      <div className="thongke-subtabs">
        <button className={subTab === 'nam' ? 'active' : ''} onClick={() => setSubTab('nam')}>
          Thống kê theo năm
        </button>
        <button className={subTab === 'thang' ? 'active' : ''} onClick={() => setSubTab('thang')}>
          Thống kê từng tháng trong năm
        </button>
        <button className={subTab === 'ngay' ? 'active' : ''} onClick={() => setSubTab('ngay')}>
          Thống kê từng ngày trong tháng
        </button>
        <button className={subTab === 'khoangtg' ? 'active' : ''} onClick={() => setSubTab('khoangtg')}>
          Thống kê từ ngày đến ngày
        </button>
      </div>

      <div className="thongke-filters">
        {subTab === 'thang' && (
          <div className="filter-group">
            <label>Từ năm</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        {subTab === 'ngay' && (
          <>
            <div className="filter-group">
              <label>Từ năm</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Đến năm</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>Tháng {month}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {subTab === 'khoangtg' && (
          <div className="filter-group">
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </div>
        )}

        <div className="filter-actions">
          <button className={`btn-chart ${showChart ? 'active' : ''}`} onClick={() => setShowChart(!showChart)}>
            <i className={`fas fa-chart-${showChart ? 'line' : 'bar'}`}></i> 
            {showChart ? 'Ẩn biểu đồ' : 'Hiện biểu đồ'}
          </button>

          {hasPermissionById(FEATURES.REPORTS, 'XuatFile') && (
            <button className="btn-pdf" onClick={handleExportPDF}>
              <i className="fas fa-file-pdf"></i> Xuất PDF
            </button>
          )}

          {hasPermissionById(FEATURES.REPORTS, 'XuatFile') && (
            <button className="btn-excel" onClick={handleExportExcel}>
              <i className="fas fa-file-excel"></i> Xuất Excel
            </button>
          )}
        </div>
      </div>

      {renderChart()}

      <div className="thongke-table">
        <table>
          <thead>
            <tr>
              <th>{subTab === 'nam' ? 'Năm' : subTab === 'thang' ? 'Tháng' : subTab === 'ngay' ? 'Ngày' : 'Thời gian'}</th>
              <th>Vốn</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '30px' }}>
                  <i className="fas fa-spinner fa-spin"></i> Đang tải...
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  <td>{item.Nam || item.Thang || item.Ngay || (item.Ngay && dayjs(item.Ngay).format('DD/MM/YYYY'))}</td>
                  <td>{formatCurrency(item.Von)}</td>
                  <td style={{ color: '#52c41a', fontWeight: 'bold' }}>{formatCurrency(item.DoanhThu)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '30px' }}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  const renderLuongTab = () => {
    // ---- Tổng hợp số liệu ----
    const yearTotal = Array.isArray(salaryMonthly)
      ? salaryMonthly.reduce((s, r) => s + Number(r.total ?? r.TongLuong ?? 0), 0)
      : 0;
    const monthTotal = salaryDetails.reduce((s, r) => s + Number(r.tong_luong ?? 0), 0);
    const monthNV = salaryDetails.length;
    const monthPaidCount = salaryDetails.filter(r => r.trang_thai === 'Da_tra' || r.trang_thai === 'Da_chi_tra').length;
    const monthPaidAmount = salaryDetails.filter(r => r.trang_thai === 'Da_tra' || r.trang_thai === 'Da_chi_tra').reduce((s, r) => s + Number(r.tong_luong ?? 0), 0);
    const monthUnpaidAmount = monthTotal - monthPaidAmount;

    const yearChartData = getLuongYearChartData();
    const monthChartData = getLuongMonthChartData();

    const summaryColumns = [
      { 
        title: 'Tháng', 
        dataIndex: 'month', 
        key: 'month', 
        align: 'center', 
        render: (m, record) => {
          const actualMonth = record.month ?? record.Thang;
          return <strong>Tháng {actualMonth}</strong>;
        } 
      },
      { 
        title: 'Tổng quỹ lương', 
        dataIndex: 'total', 
        key: 'total', 
        align: 'right', 
        render: (val, record) => {
          const actualTotal = record.total ?? record.TongLuong ?? 0;
          return <span style={{ color: '#1890ff', fontWeight: 600 }}>{formatCurrency(actualTotal)}</span>;
        } 
      },
      { 
        title: 'Số nhân viên', 
        dataIndex: 'so_nv', 
        key: 'so_nv', 
        align: 'right', 
        render: (val) => `${val || 0} người` 
      },
      { 
        title: 'Trung bình/NV', 
        key: 'avg', 
        align: 'right', 
        render: (_, record) => {
          const total = record.total ?? record.TongLuong ?? 0;
          const nv = record.so_nv ?? 0;
          return nv > 0 ? formatCurrency(Math.round(total / nv)) : '—';
        }
      },
    ];

    const detailColumns = [
      { title: 'Mã NV', dataIndex: 'MaNV', key: 'MaNV', width: 100 },
      { title: 'Tên nhân viên', dataIndex: 'TenNV', key: 'TenNV', render: text => <strong>{text}</strong> },
      { title: 'Chức vụ', dataIndex: 'ChucVu', key: 'ChucVu' },
      { title: 'Lương CB', dataIndex: 'luong_co_ban', key: 'luong_co_ban', align: 'right', render: val => formatCurrency(val) },
      { title: 'Phụ cấp', dataIndex: 'phu_cap', key: 'phu_cap', align: 'right', render: val => formatCurrency(val) },
      { title: 'Tăng ca', dataIndex: 'tang_ca', key: 'tang_ca', align: 'center', render: val => `${val}h` },
      { title: 'Thưởng', dataIndex: 'thuong', key: 'thuong', align: 'right', render: val => <span style={{ color: '#52c41a' }}>{formatCurrency(val)}</span> },
      { title: 'Phạt', dataIndex: 'phat', key: 'phat', align: 'right', render: val => <span style={{ color: '#ff4d4f' }}>{formatCurrency(val)}</span> },
      { title: 'Tổng nhận', dataIndex: 'tong_luong', key: 'tong_luong', align: 'right', render: val => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{formatCurrency(val)}</span> },
      { 
        title: 'Trạng thái', 
        dataIndex: 'trang_thai', 
        key: 'trang_thai', 
        align: 'center',
        render: (status) => {
          const isPaid = status === 'Da_tra' || status === 'Da_chi_tra';
          return <Tag color={isPaid ? 'success' : 'warning'} icon={isPaid ? <i className="fas fa-check-circle" /> : <i className="fas fa-clock" />}>
            {isPaid ? ' Đã trả' : ' Chưa trả'}
          </Tag>;
        }
      },
    ];

    const yearChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ctx.datasetIndex === 0 ? ` ${formatCurrency(ctx.raw)}` : ` ${ctx.raw} người`,
          },
        },
      },
      scales: {
        y: { type: 'linear', position: 'left', ticks: { callback: v => (v >= 1e6 ? (v/1e6).toFixed(0)+'M' : v) } },
        y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { stepSize: 1 } },
      },
    };

    const monthChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${formatCurrency(ctx.raw)}` } },
      },
      scales: {
        x: { ticks: { callback: v => (v >= 1e6 ? (v/1e6).toFixed(0)+'M' : v) } },
      },
    };

    return (
      <div className="tab-content salary-stats-premium" id="luong-export-area">
        {/* ---- BỘ LỌC ---- */}
        <div className="thongke-filters" style={{ marginBottom: '24px' }}>
          <div className="filter-group">
            <label>Năm báo cáo</label>
            <select value={salaryYear} onChange={(e) => { setSalaryYear(Number(e.target.value)); setSelectedSalaryMonth(null); setSalaryDetails([]); }}>
              {Array.from({length: new Date().getFullYear() - 2022}, (_, i) => 2023 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Tháng</label>
            <select value={selectedSalaryMonth || ''} onChange={(e) => setSelectedSalaryMonth(e.target.value ? Number(e.target.value) : null)}>
              <option value="">-- Cả năm --</option>
              {Array.from({length: 12}, (_, i) => i+1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn-refresh" onClick={() => { fetchLuongData(); selectedSalaryMonth && fetchSalaryDetails(selectedSalaryMonth); }}>
              <i className="fas fa-sync-alt"></i> Làm mới
            </button>
            <button className="btn-pdf" onClick={handleExportPDF}>
              <i className="fas fa-file-pdf"></i> PDF
            </button>
            <button className="btn-excel" onClick={handleExportExcel}>
              <i className="fas fa-file-excel"></i> Excel
            </button>
          </div>
        </div>

        {/* ---- SUMMARY CARDS ---- */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card total-payroll" bordered={false}>
              <Statistic
                title={`Tổng lương năm ${salaryYear}`}
                value={yearTotal}
                formatter={val => formatCurrency(val)}
                prefix={<i className="fas fa-wallet" style={{ color: '#1890ff' }} />}
              />
              <div className="payroll-progress">
                <div className="progress-text">
                  <span>Dữ liệu: {salaryMonthly.length}/12 tháng</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card month-payroll" bordered={false}>
              <Statistic
                title={selectedSalaryMonth ? `Quỹ lương Tháng ${selectedSalaryMonth}` : "Lương trung bình tháng"}
                value={selectedSalaryMonth ? monthTotal : (salaryMonthly.length > 0 ? (yearTotal / salaryMonthly.length) : 0)}
                formatter={val => formatCurrency(val)}
                prefix={<i className="fas fa-money-check-alt" style={{ color: '#52c41a' }} />}
              />
              <div className="payroll-progress">
                <div className="progress-text">
                  <span>Số nhân viên: {monthNV > 0 ? monthNV : '—'}</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card paid-status" bordered={false}>
              <Statistic
                title="Đã chi trả"
                value={selectedSalaryMonth ? monthPaidAmount : "—"}
                formatter={val => typeof val === 'number' ? formatCurrency(val) : val}
                prefix={<i className="fas fa-hand-holding-usd" style={{ color: '#faad14' }} />}
              />
              <div className="payroll-progress">
                <div className="progress-text">
                  <span>Thanh toán: {selectedSalaryMonth ? `${monthPaidCount}/${monthNV}` : '—'} NV</span>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card unpaid-status" bordered={false}>
              <Statistic
                title="Còn nợ lương"
                value={selectedSalaryMonth ? monthUnpaidAmount : "—"}
                formatter={val => typeof val === 'number' ? formatCurrency(val) : val}
                prefix={<i className="fas fa-exclamation-circle" style={{ color: '#ff4d4f' }} />}
              />
              <div className="payroll-progress">
                <div className="progress-text">
                  <span>Cần chi trả: {selectedSalaryMonth ? (monthNV - monthPaidCount) : '—'} NV</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* ---- CHARTS & SUMMARY TABLE ---- */}
        <Row gutter={[24, 24]} className="chart-row">
          <Col xs={24} lg={14}>
            <Card title={<span><i className="fas fa-chart-line" /> Xu hướng quỹ lương năm {salaryYear}</span>} className="chart-card" bordered={false}>
              <div style={{ height: '350px' }}>
                {salaryMonthly.length > 0 ? (
                  <Bar data={yearChartData} options={yearChartOptions} />
                ) : (
                  <div className="no-data" style={{ padding: '100px 0' }}>Không có dữ liệu biểu đồ</div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title={<span><i className="fas fa-table" /> Tổng hợp 12 tháng</span>} className="chart-card" bordered={false}>
              <Table
                columns={summaryColumns}
                dataSource={Array.from({length: 12}, (_, i) => {
                  const m = i + 1;
                  const row = salaryMonthly.find(r => Number(r.month ?? r.Thang) === m);
                  return {
                    key: m,
                    month: m,
                    total: row ? (row.total ?? row.TongLuong ?? 0) : 0,
                    so_nv: row ? (row.so_nv ?? 0) : 0,
                  };
                })}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
                onRow={(record) => ({
                  onClick: () => setSelectedSalaryMonth(record.month),
                  className: selectedSalaryMonth === record.month ? 'selected-month-row' : ''
                })}
              />
            </Card>
          </Col>
        </Row>

        {/* ---- MONTHLY DETAIL SECTION ---- */}
        {selectedSalaryMonth && (
          <div className="section-card detail-table-section">
            <div className="section-title" style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <i className="fas fa-users-cog" /> Biến động lương nhân viên - Tháng {selectedSalaryMonth}/{salaryYear}
            </div>
            
            <div style={{ padding: '24px' }}>
              {salaryDetails.length > 0 && (
                <div style={{ height: Math.min(400, Math.max(200, salaryDetails.length * 40)), marginBottom: '32px' }}>
                  <Bar data={monthChartData} options={monthChartOptions} />
                </div>
              )}

              <Table
                columns={detailColumns}
                dataSource={salaryDetails.map((item, idx) => ({ ...item, key: item.id || idx }))}
                loading={loading}
                pagination={{ pageSize: 10 }}
                summary={(pageData) => {
                  if (pageData.length === 0) return null;
                  return (
                    <Table.Summary fixed>
                      <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} colSpan={3} align="right">TỔNG CỘNG:</Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">{formatCurrency(salaryDetails.reduce((s, r) => s + Number(r.luong_co_ban || 0), 0))}</Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="right">{formatCurrency(salaryDetails.reduce((s, r) => s + Number(r.phu_cap || 0), 0))}</Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="center">—</Table.Summary.Cell>
                        <Table.Summary.Cell index={4} align="right" style={{ color: '#52c41a' }}>{formatCurrency(salaryDetails.reduce((s, r) => s + Number(r.thuong || 0), 0))}</Table.Summary.Cell>
                        <Table.Summary.Cell index={5} align="right" style={{ color: '#ff4d4f' }}>{formatCurrency(salaryDetails.reduce((s, r) => s + Number(r.phat || 0), 0))}</Table.Summary.Cell>
                        <Table.Summary.Cell index={6} align="right" style={{ color: '#1890ff' }}>{formatCurrency(monthTotal)}</Table.Summary.Cell>
                        <Table.Summary.Cell index={7} align="center">—</Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBanHangTab = () => {
    return (
      <div className="tab-content">
        <div className="thongke-subtabs">
          <button className={productTab === 'sanpham' ? 'active' : ''} onClick={() => setProductTab('sanpham')}>
            Sản phẩm
          </button>
          <button className={productTab === 'theloai' ? 'active' : ''} onClick={() => setProductTab('theloai')}>
            Thể loại
          </button>
        </div>

        <div className="thongke-filters">
          <div className="filter-group">
            <label>Khoảng thời gian</label>
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>

          {productFilter === 'custom' && (
            <div className="filter-group">
              <RangePicker
                value={productDateRange}
                onChange={setProductDateRange}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </div>
          )}

          {productTab === 'sanpham' && (
            <div className="filter-group">
              <label>Lọc</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="bestseller">Sản phẩm bán chạy</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
          )}

          <div className="filter-actions">
            <button className={`btn-chart ${showChart ? 'active' : ''}`} onClick={() => setShowChart(!showChart)}>
              <i className={`fas fa-chart-${productTab === 'sanpham' ? 'bar' : 'pie'}`}></i> 
              {showChart ? 'Ẩn biểu đồ' : 'Hiện biểu đồ'}
            </button>

            <button className="btn-pdf" onClick={handleExportPDF}>
              <i className="fas fa-file-pdf"></i> Xuất PDF
            </button>

            <button className="btn-excel" onClick={handleExportExcel}>
              <i className="fas fa-file-excel"></i> Xuất Excel
            </button>
          </div>
        </div>

        {showChart && (
          <div className="chart-container" style={{ height: '400px', marginBottom: '30px' }}>
            {getBanHangChartData() ? (
              productTab === 'sanpham' ? (
                <Bar data={getBanHangChartData()} options={chartOptions} />
              ) : (
                <Pie data={getBanHangChartData()} options={chartOptions} />
              )
            ) : (
              <div className="no-data">Không có dữ liệu cho biểu đồ</div>
            )}
          </div>
        )}

        <div className="thongke-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                {productTab === 'sanpham' ? (
                  <>
                    <th>MaSP</th>
                    <th>TenSP</th>
                    <th>SL bán</th>
                    <th>SL đơn bán</th>
                  </>
                ) : (
                  <>
                    <th>Thể loại</th>
                    <th>Tổng SL</th>
                    <th>Tổng đơn</th>
                    <th>Số SP</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>
                    <i className="fas fa-spinner fa-spin"></i> Đang tải...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    {productTab === 'sanpham' ? (
                      <>
                        <td>{item.MaSP}</td>
                        <td>{item.TenSP}</td>
                        <td style={{ color: '#1890ff', fontWeight: 'bold' }}>{item.SoLuongBan}</td>
                        <td>{item.SoLuongDon}</td>
                      </>
                    ) : (
                      <>
                        <td>{item.TheLoai}</td>
                        <td style={{ color: '#1890ff', fontWeight: 'bold' }}>{item.TongSoLuong}</td>
                        <td>{item.TongDon}</td>
                        <td>{item.SoSanPham}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderKhachHangTab = () => {
    const { summary = {}, vips = [] } = customerData;
    
    const vipColumns = [
      { title: 'Tên khách hàng', dataIndex: 'HoTen', key: 'HoTen', render: text => <strong>{text}</strong> },
      { title: 'Số điện thoại', dataIndex: 'SDT', key: 'SDT' },
      { 
        title: 'Hạng', 
        dataIndex: 'HangTV', 
        key: 'HangTV',
        render: (tier) => {
          let color = 'default';
          let label = tier;
          if (tier === 'Dong') { color = 'orange'; label = 'Đồng'; }
          if (tier === 'Bac') { color = 'gray'; label = 'Bạc'; }
          if (tier === 'Vang') { color = 'gold'; label = 'Vàng'; }
          if (tier === 'Kim_cuong') { color = 'cyan'; label = 'Kim Cương'; }
          return <Tag color={color}>{label}</Tag>;
        }
      },
      { 
        title: 'Tổng chi tiêu', 
        dataIndex: 'TongChiTieu', 
        key: 'TongChiTieu',
        render: val => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{formatCurrency(val)}</span>
      },
      { title: 'Điểm tích lũy', dataIndex: 'DiemTichLuy', key: 'DiemTichLuy', render: val => <span>{val} điểm</span> },
    ];

    return (
      <div className="tab-content customer-stats-premium">
        {/* Overview Cards */}
        <Row gutter={[16, 16]} className="stats-overview-cards">
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="stat-card total-customers">
              <Statistic
                title="Tổng khách hàng"
                value={summary.TotalCustomers || 0}
                suffix="thành viên"
                prefix={<i className="fas fa-users"></i>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="stat-card new-customers">
              <Statistic
                title="Khách hàng mới (Tháng này)"
                value={summary.NewCustomersThisMonth || 0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<i className="fas fa-user-plus"></i>}
                suffix="+"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="stat-card vip-customers">
              <Statistic
                title="Hội viên VIP"
                value={summary.VipCount || 0}
                prefix={<i className="fas fa-crown" style={{ color: '#ffd700' }}></i>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="stat-card avg-spent">
              <Statistic
                title="Chi tiêu TB / Khách"
                value={summary.AvgSpent || 0}
                formatter={(val) => formatCurrency(val)}
                prefix={<i className="fas fa-hand-holding-usd"></i>}
              />
            </Card>
          </Col>
        </Row>

        <div className="thongke-filters">
          <div className="filter-group">
            <label>Thời gian</label>
            <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
              <option value="custom">Tùy chọn</option>
            </select>
          </div>

          {customerFilter === 'custom' && (
            <div className="filter-group">
              <RangePicker
                value={customerDateRange}
                onChange={setCustomerDateRange}
                format="DD/MM/YYYY"
              />
            </div>
          )}
        </div>

        <Row gutter={[24, 24]} className="customer-charts-row">
          <Col xs={24} lg={16}>
            <Card title="📈 Xu hướng mua sắm" bordered={false} className="chart-card">
              <div className="chart-container" style={{ height: '350px' }}>
                {getKhachHangChartData() ? (
                  <Line data={getKhachHangChartData()} options={chartOptions} />
                ) : (
                  <div className="no-data">Không có dữ liệu xu hướng</div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="💎 Phân bổ hạng thành viên" bordered={false} className="chart-card">
              <div className="chart-container" style={{ height: '350px' }}>
                {getTierChartData() ? (
                  <Pie data={getTierChartData()} options={{ ...chartOptions, title: { display: false } }} />
                ) : (
                  <div className="no-data">Không có dữ liệu phân hạng</div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        <div className="vip-ranking-section" style={{ marginTop: '24px' }}>
          <Card title={<span><i className="fas fa-trophy" style={{ color: '#ffd700', marginRight: '8px' }}></i> Top 10 khách hàng chi tiêu nhiều nhất</span>} bordered={false}>
            <Table 
              columns={vipColumns} 
              dataSource={vips.map((v, i) => ({ ...v, key: i }))} 
              pagination={false} 
              loading={loading}
              className="vip-table"
            />
          </Card>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="thongke-page">
      <div className="thongke-header">
        <h1>
          <i className="fas fa-chart-bar"></i> Thống kê
        </h1>
      </div>

      <div className="thongke-tabs">
  <button data-tab="doanhthu" className={activeTab === 'doanhthu' ? 'active' : ''} onClick={() => setActiveTab('doanhthu')}>
    <i className="fas fa-chart-line"></i>
    <span>Doanh thu</span>
  </button>
  <button data-tab="banhang" className={activeTab === 'banhang' ? 'active' : ''} onClick={() => setActiveTab('banhang')}>
    <i className="fas fa-shopping-cart"></i>
    <span>Bán hàng</span>
  </button>
  <button data-tab="khachhang" className={activeTab === 'khachhang' ? 'active' : ''} onClick={() => setActiveTab('khachhang')}>
    <i className="fas fa-users"></i>
    <span>Khách hàng</span>
  </button>
  <button data-tab="luong" className={activeTab === 'luong' ? 'active' : ''} onClick={() => setActiveTab('luong')}>
    <i className="fas fa-money-bill-wave"></i>
    <span>Lương nhân viên</span>
  </button>
</div>
{activeTab === 'doanhthu' && renderDoanhThuTab()}
{activeTab === 'banhang' && renderBanHangTab()}
{activeTab === 'khachhang' && renderKhachHangTab()}
{activeTab === 'luong' && renderLuongTab()}
    </div>
  );
};

export default ThongKe;