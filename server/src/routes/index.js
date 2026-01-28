import warehouseRoutes from './warehouseRoutes.js';
import accountRoutes from './account.js';
import LoginRoutes from './LoginRoutes.js';
import roleRoutes from './roleRoutes.js';
import reportRoutes from './reportRoutes.js';
import permissionRoutes from './permissionRoutes.js';
import hrRoutes from './hrRoutes.js';
import salesRoutes from './salesRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import financeRoutes from './financeRoutes.js';
import returnRoutes from './returnRoutes.js';
import customerRoutes from './customerRoutes.js';
import branchRoutes from './branchRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import chatRoutes from './chat.js';
import paymentRoutes from './paymentRoutes.js';

export const initRoutes = (app) => {
  // Root path - Server status
  app.get('/', (req, res) => {
    res.json({
      status: 'OK',
      message: '🎉 Offline Bookstore API Server is running!',
      version: '3.0.0',
      modules: {
        system: ['/api/login', '/api/accounts', '/api/roles', '/api/permissions', '/api/reports'],
        hr: ['/api/hr (includes attendance, leave, salary)'],
        warehouse: ['/api/warehouse (includes products, stock, transfers)', '/api/suppliers'],
        catalog: ['/api/catalog (authors, categories)'],
        sales: ['/api/sales', '/api/returns', '/api/customers'],
        branches: ['/api/branches'],
        finance: ['/api/finance']
      }
    });
  });

  // ======================= SYSTEM MANAGEMENT =======================
  app.use('/api/login', LoginRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/roles', roleRoutes);
  app.use('/api/permissions', permissionRoutes);
  app.use('/api/reports', reportRoutes);

  // ======================= HR MANAGEMENT (CONSOLIDATED) =======================
  // Includes: employees, attendance, leave, salary, reports
  app.use('/api/hr', hrRoutes);
  app.use('/api/attendance_admin', hrRoutes);

  // ======================= WAREHOUSE MANAGEMENT (CONSOLIDATED) =======================
  // Includes: products, stock, purchase-orders, transfers, inventory-check
  app.use('/api/warehouse', warehouseRoutes);

  // Legacy compatibility for products
  app.use('/api/products', warehouseRoutes);
  app.use('/api/product', warehouseRoutes);

  // Suppliers (separate domain but related to warehouse)
  app.use('/api/suppliers', supplierRoutes);

  // ======================= CATALOG / REFERENCE DATA =======================
  // Authors, Categories, Publishers - public reference data
  app.use('/api/catalog', catalogRoutes);

  // ======================= SALES & POS =======================
  app.use('/api/sales', salesRoutes);
  app.use('/api/orders', salesRoutes);
  app.use('/api/returns', returnRoutes);
  app.use('/api/customers', customerRoutes);

  // ======================= BRANCH MANAGEMENT =======================
  app.use('/api/branches', branchRoutes);

  // ======================= FINANCE MANAGEMENT =======================
  app.use('/api/finance', financeRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/payments', paymentRoutes);
};