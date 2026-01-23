import React, { useState, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/sidebar.css';
import logo from '../assets/logo.png';
import UserInfo from './UserInfo';
import { PermissionContext } from './PermissionContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  // sync a body-level class so portal/popover/modal elements can react when sidebar toggles
  React.useEffect(() => {
    try {
      document.body.classList.toggle('sidebar-open', isOpen);
      document.body.classList.toggle('sidebar-closed', !isOpen);
    } catch (e) {
      // ignore non-browser env
    }
    return () => {
      try {
        document.body.classList.remove('sidebar-open', 'sidebar-closed');
      } catch { }
    };
  }, [isOpen]);
  const navigate = useNavigate();
  const location = useLocation();
  const { permissions, hasPermissionById } = useContext(PermissionContext);

  // Permission IDs (MaCN) mapped to menu items to avoid fuzzy name matching
  const menuItems = [
    { to: '/admin', icon: 'dashboard', text: 'Trang Chủ', permission: null },
    { to: '/admin/products', icon: 'inventory_2', text: 'Quản lý sản phẩm', permissionId: 13 },
    { to: '/admin/account', icon: 'people', text: 'Quản lý tài khoản', permissionId: 2 },
    { to: '/admin/category', icon: 'category', text: 'Quản lý thể loại', permissionId: 28 },
    { to: '/admin/users', icon: 'badge', text: 'Quản lý nhân viên', permissionId: 6 },
    { to: '/admin/invoices', icon: 'receipt_long', text: 'Quản lý hóa đơn', permissionId: 20 },
    { to: '/admin/company', icon: 'business', text: 'Quản lý nhà cung cấp', permissionId: 14 },
    { to: '/admin/roles', icon: 'admin_panel_settings', text: 'Quản lý quyền', permissionId: 3 },
    { to: '/admin/authorities', icon: 'person', text: 'Quản lý tác giả', permissionId: 29 },
    { to: '/admin/client', icon: 'groups', text: 'Quản lý khách hàng', permissionId: 21 },
    { to: '/admin/statistical', icon: 'analytics', text: 'Thống kê', permissionId: 23 },
    { to: '/admin/receipt', icon: 'receipt', text: 'Quản lý phiếu nhập', permissionId: 15 },
    { to: '/admin/khuyenmai', icon: 'local_offer', text: 'Quản lý khuyến mãi', permissionId: 30 },
    { to: '/admin/salary', icon: 'payments', text: 'Tính lương', permissionId: 10 },
    { to: '/admin/leave', icon: 'event_busy', text: 'Xin nghỉ phép', permissionId: 9 },
    { to: '/admin/attendance', icon: 'check_circle', text: 'Chấm công', permissionId: 7 },
    { to: '/admin/returns', icon: 'assignment_return', text: 'Quản lý trả hàng', permissionId: 22 }
  ];

  // Normalize function (same as PermissionContext) to compare names safely
  const normalize = (s) => {
    if (!s && s !== '') return '';
    try {
      return String(s)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();
    } catch (e) {
      return String(s)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }
  };

  // Show menu item if:
  // - it has no permission requirement OR
  // - there exists at least one active permission (any action) for that function
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permissionId && !item.permission) return true;
    // Prefer checking by numeric MaCN if provided
    if (item.permissionId && typeof hasPermissionById === 'function') {
      return hasPermissionById(item.permissionId, 'xem');
    }
    const fn = normalize(item.permission || '');
    return permissions.some((perm) => normalize(perm.TenCN) === fn);
  });

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>
        <button
          className="btn-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          {isOpen ? '‹' : '›'}
        </button>
      </div>

      <ul className="sidebar-menu">
        {filteredMenuItems.map((item) => {
          // Check if current path matches
          const isActive = location.pathname === item.to;

          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={isActive ? 'active' : ''}
                end={item.to === '/admin'}
              >
                <span className="material-icons">{item.icon}</span>
                {isOpen && <span className="menu-text">{item.text}</span>}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <UserInfo isSidebarOpen={isOpen} />
        {localStorage.getItem('showPerms') === '1' && (
          <div style={{ padding: '8px', maxHeight: 180, overflow: 'auto', background: '#0b2233', color: '#fff', marginTop: 8 }}>
            <div style={{ fontSize: 12, marginBottom: 6 }}>DEBUG Permissions (showPerms=1)</div>
            <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap' }}>{JSON.stringify(permissions, null, 2)}</pre>
          </div>
        )}
        <button
          className="logout-btn logged-in"
          onClick={handleLogout}
          aria-label="Đăng xuất"
        >
          <span className="material-icons">logout</span>
          {isOpen && <span className="menu-text">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;