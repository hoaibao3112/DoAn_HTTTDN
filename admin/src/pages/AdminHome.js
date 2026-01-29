import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import '../styles/adminHome.css';
import heroIllustration from './bookstore_dashboard_hero_1769598928400.png';

const AdminHome = () => {
  const [now, setNow] = useState(new Date());
  const [user, setUser] = useState({ name: 'Quản trị viên', role: 'Admin' });
  const [stats, setStats] = useState({
    sales: '12,500,000đ',
    orders: '42',
    products: '156',
    customers: '1,204'
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);

    // Load user info
    try {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser({
          name: parsed.TenTK || parsed.HoTen || 'Quản trị viên',
          role: parsed.TenNQ || 'Cán bộ quản lý'
        });
      }
    } catch (e) {
      console.warn('Failed to load user info', e);
    }

    // Optional: Fetch real stats if API exists
    // fetchStats();

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const formatTime = (d) => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d) => d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="admin-home">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-banner">
          <div className="banner-content">
            <h1 className="fade-in">{getGreeting()}, {user.name}! 👋</h1>
            <p>Chào mừng bạn quay trở lại hệ thống quản lý Nhà Sách Antigravity. Chúc bạn có một ngày làm việc thật hiệu quả và đầy năng lượng!</p>

            <div className="datetime-badge">
              <span className="time">{formatTime(now)}</span>
              <span className="divider">|</span>
              <span className="date">{formatDate(now)}</span>
            </div>
          </div>
          <div className="banner-image-container">
            <img src={heroIllustration} alt="Dashboard Illustration" className="banner-image" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="metrics-grid">
          <div className="metric-card sales">
            <div className="metric-icon">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="metric-info">
              <span className="metric-label">Doanh thu hôm nay</span>
              <span className="metric-value">{stats.sales}</span>
              <span className="metric-trend trend-up">
                <i className="fas fa-arrow-up"></i> +12% so với hôm qua
              </span>
            </div>
          </div>

          <div className="metric-card orders">
            <div className="metric-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="metric-info">
              <span className="metric-label">Đơn hàng mới</span>
              <span className="metric-value">{stats.orders}</span>
              <span className="metric-trend trend-up">
                <i className="fas fa-arrow-up"></i> +5 đơn mới
              </span>
            </div>
          </div>

          <div className="metric-card products">
            <div className="metric-icon">
              <i className="fas fa-book"></i>
            </div>
            <div className="metric-info">
              <span className="metric-label">Sản phẩm trong kho</span>
              <span className="metric-value">{stats.products}</span>
              <span className="metric-trend text-muted">Đang kinh doanh</span>
            </div>
          </div>

          <div className="metric-card users">
            <div className="metric-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="metric-info">
              <span className="metric-label">Khách hàng</span>
              <span className="metric-value">{stats.customers}</span>
              <span className="metric-trend trend-up">
                <i className="fas fa-plus"></i> 12 thành viên mới
              </span>
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="quick-access-section">
          <div className="section-header">
            <h2>Truy cập nhanh</h2>
          </div>
          <div className="quick-actions-grid">
            <NavLink to="/admin/pos" className="action-btn">
              <i className="fas fa-cash-register"></i>
              <span>Bán hàng (POS)</span>
            </NavLink>
            <NavLink to="/admin/products" className="action-btn">
              <i className="fas fa-plus-circle"></i>
              <span>Thêm sản phẩm</span>
            </NavLink>
            <NavLink to="/admin/invoices" className="action-btn">
              <i className="fas fa-file-invoice"></i>
              <span>Quản lý hóa đơn</span>
            </NavLink>
            <NavLink to="/admin/stock" className="action-btn">
              <i className="fas fa-warehouse"></i>
              <span>Kiểm kê kho</span>
            </NavLink>
            <NavLink to="/admin/statistical" className="action-btn">
              <i className="fas fa-chart-line"></i>
              <span>Báo cáo doanh thu</span>
            </NavLink>
            <NavLink to="/admin/profile" className="action-btn">
              <i className="fas fa-user-circle"></i>
              <span>Hồ sơ cá nhân</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;