import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ProductManagement from './pages/ProductManagement';
import AccountManagement from './pages/AccountManagement';
import UserManagement from './pages/UserManagement';
import CategoryManagement from './pages/CategoryManagement';
import InvoiceManagement from './pages/InvoiceManagement';
import CompanyManagement from './pages/campanyManagement';
import AuthorManagement from './pages/AuthorManagement';
import Client from './pages/client.js';
import Authorities from './pages/authorities';
import Receipt from './pages/receipt.js';
import Statistical from './pages/statistical.js';
//import KhuyenMai from './pages/khuyenmai.js';
import ReturnManagement from './pages/ReturnManagement.js';
import Profile from './pages/Profile';
import SalaryPage from './pages/SalaryPage';
import LeavePage from './pages/LeavePage';
import AttendancePage from './pages/AttendancePage';
import { PermissionContext } from './components/PermissionContext';
import AdminHome from './pages/AdminHome';
import StockManagement from './pages/StockManagement';
import POSPage from './pages/POSPage';
import StockTransfer from './pages/StockTransfer';
import InventoryCheck from './pages/InventoryCheck';
import SupplierDebts from './pages/SupplierDebts';
import AuditLogs from './pages/AuditLogs';
import BranchManagement from './pages/BranchManagement';
import { FEATURES } from './constants/permissions';

const PrivateRoute = ({ component: Component }) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  return isAuthenticated ? (
    <div className="app-admin">
      <Sidebar />
      <div className="main-content">
        <Component />
      </div>
    </div>
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

const RestrictedRoute = ({ component: Component, permissionId }) => {
  const { hasPermissionById, loading } = React.useContext(PermissionContext);
  if (loading) {
    return <div>Loading permissions...</div>;
  }
  return hasPermissionById(permissionId, 'xem') ? (
    <Component />
  ) : (
    <div style={{ padding: '20px', color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', margin: '20px' }}>
      <h2>Bạn không có quyền truy cập</h2>
      <p>Chức năng ID: <strong>{permissionId}</strong></p>
    </div>
  );
};

const App = () => {
  const isAuthenticated = !!localStorage.getItem('authToken');

  return (
    <Routes>
      <Route
        path="/admin/login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />}
      />

      <Route
        path="/admin"
        element={<PrivateRoute component={AdminHome} />}
      />
      <Route
        path="/admin/products"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={ProductManagement} permissionId={FEATURES.PRODUCTS} />
            )}
          />
        }
      />
      <Route
        path="/admin/account"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={AccountManagement} permissionId={FEATURES.USERS} />
            )}
          />
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={UserManagement} permissionId={FEATURES.EMPLOYEES} />
            )}
          />
        }
      />
      <Route
        path="/admin/category"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={CategoryManagement} permissionId={FEATURES.CATEGORIES} />
            )}
          />
        }
      />
      <Route
        path="/admin/invoices"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={InvoiceManagement} permissionId={FEATURES.INVOICES} />
            )}
          />
        }
      />
      <Route
        path="/admin/company"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={CompanyManagement} permissionId={FEATURES.SUPPLIERS} />
            )}
          />
        }
      />
      <Route
        path="/admin/roles"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={Authorities} permissionId={FEATURES.ROLES} />
            )}
          />
        }
      />
      <Route
        path="/admin/client"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={Client} permissionId={FEATURES.CUSTOMERS} />
            )}
          />
        }
      />
      <Route
        path="/admin/receipt"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={Receipt} permissionId={FEATURES.PURCHASE_ORDERS} />
            )}
          />
        }
      />

      {/* Thêm route cho trang tạo khuyến mãi */}
      <Route
        path="/admin/khuyenmai"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={DiscountManagement} permissionId={FEATURES.PROMOTIONS} />
            )}
          />
        }
      />
      <Route
        path="/admin/statistical"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={Statistical} permissionId={FEATURES.REPORTS} />
            )}
          />
        }
      />
      <Route
        path="/admin/authorities"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={AuthorManagement} permissionId={FEATURES.AUTHORS} />
            )}
          />
        }
      />
      <Route
        path="/admin/profile"
        element={<PrivateRoute component={Profile} />}
      />
      <Route
        path="/admin/salary"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={SalaryPage} permissionId={FEATURES.SALARY} />
            )}
          />
        }
      />
      <Route
        path="/admin/leave"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={LeavePage} permissionId={FEATURES.LEAVE} />
            )}
          />
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={AttendancePage} permissionId={FEATURES.ATTENDANCE} />
            )}
          />
        }
      />

      <Route
        path="/admin/returns"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={ReturnManagement} permissionId={FEATURES.RETURNS} />
            )}
          />
        }
      />

      <Route
        path="/admin/stock"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={StockManagement} permissionId={FEATURES.STOCK} />
            )}
          />
        }
      />

      <Route
        path="/admin/pos"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={POSPage} permissionId={FEATURES.POS} />
            )}
          />
        }
      />

      <Route
        path="/admin/stock-transfer"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={StockTransfer} permissionId={FEATURES.STOCK} />
            )}
          />
        }
      />

      <Route
        path="/admin/inventory-check"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={InventoryCheck} permissionId={FEATURES.INVENTORY_CHECK} />
            )}
          />
        }
      />

      <Route
        path="/admin/supplier-debts"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={SupplierDebts} permissionId={FEATURES.SUPPLIERS} />
            )}
          />
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={AuditLogs} permissionId={FEATURES.AUDIT_LOGS} />
            )}
          />
        }
      />

      <Route
        path="/admin/branches"
        element={
          <PrivateRoute
            component={() => (
              <RestrictedRoute component={BranchManagement} permissionId={FEATURES.CATEGORIES} />
            )}
          />
        }
      />

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default App;