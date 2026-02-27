import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import { FEATURES } from '../constants/permissions';
import ProductManagement from './ProductManagement';
import AccountManagement from './AccountManagement';
import UserManagement from './UserManagement';
import CategoryManagement from './CategoryManagement';
import InvoiceManagement from './InvoiceManagement';
import CompanyManagement from './campanyManagement';
import Authorities from './authorities';
import Client from './client.js';
import Receipt from './receipt.js';
import Statistical from './statistical.js';
import KhuyenMai from './khuyenmai.js';
import '../styles/sidebar.css';
import Profile from './Profile';
import { PermissionContext } from '../components/PermissionContext';
import AuthorManagement from './AuthorManagement.js';
import POSPage from './POSPage.js';
import BarcodeGeneratorPage from './BarcodeGeneratorPage.js';

// Component bảo vệ route theo quyền
// Nhận cả permission (tên) và permissionId (MaCN số) để kiểm tra đáng tin cậy hơn
const RestrictedRoute = ({ component: Component, permission, permissionId }) => {
  const { hasPermission, hasPermissionById, loading } = useContext(PermissionContext);

  // Chờ permissions load xong mới kiểm tra
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        Đang tải quyền...
      </div>
    );
  }

  // Ưu tiên kiểm tra bằng ID số (chính xác hơn tên chuỗi)
  const allowed = permissionId
    ? hasPermissionById(permissionId, 'xem')
    : hasPermission(permission, 'Đọc');

  if (!allowed) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: '#ff4d4f' }}>Không có quyền truy cập</h2>
        <p>Tài khoản của bạn không có quyền xem trang <b>{permission}</b>.</p>
        <p>Liên hệ quản trị viên để được cấp quyền.</p>
      </div>
    );
  }

  return <Component />;
};

const AppAdmin = () => {
  return (
    <div className="app-admin">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route
            path="products"
            element={<RestrictedRoute component={ProductManagement} permission="Sản phẩm" />}
          />
          <Route
            path="account"
            element={<RestrictedRoute component={AccountManagement} permission="Tài khoản" />}
          />
          <Route
            path="users"
            element={<RestrictedRoute component={UserManagement} permission="Nhân viên" />}
          />
          <Route
            path="category"
            element={<RestrictedRoute component={CategoryManagement} permission="Thể loại" />}
          />
          <Route
            path="invoices"
            element={<RestrictedRoute component={InvoiceManagement} permission="Hóa đơn" />}
          />
          <Route
            path="company"
            element={<RestrictedRoute component={CompanyManagement} permission="Công ty" />}
          />
          <Route
            path="roles"
            element={<RestrictedRoute component={Authorities} permission="Phân quyền" />}
          />
          <Route
            path="client"
            element={<RestrictedRoute component={Client} permission="Khách hàng" />}
          />
          <Route
            path="receipt"
            element={<RestrictedRoute component={Receipt} permission="Phiếu nhập" />}
          />
          <Route
            path="khuyenmai"
            element={<RestrictedRoute component={KhuyenMai} permission="Khuyến mãi" permissionId={FEATURES.PROMOTIONS} />}
          />
          <Route
            path="statistical"
            element={<RestrictedRoute component={Statistical} permission="Thống kê" />}
          />
          <Route
            path="authorities"
            element={<RestrictedRoute component={AuthorManagement} permission="tác giả" />}
          />
          <Route path="profile" element={<Profile />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="barcode-generator" element={<BarcodeGeneratorPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AppAdmin;