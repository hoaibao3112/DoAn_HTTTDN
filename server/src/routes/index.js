import warehouseRoutes from './warehouseRoutes.js';
import accountRoutes from './account.js';
import LoginRoutes from './LoginRoutes.js';
import roleRoutes from './roleRoutes.js';
import Receipt from './receipt.js';
import reportRoutes from './reportRoutes.js';
import permissionRoutes from './permissionRoutes.js';
import hrRoutes from './hrRoutes.js';
import salesRoutes from './salesRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import financeRoutes from './financeRoutes.js';
import returnRoutes from './returnRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import customerRoutes from './customerRoutes.js';
import branchRoutes from './branchRoutes.js';

export const initRoutes = (app) => {
  // Root path - Server status
  app.get('/', (req, res) => {
    res.json({
      status: 'OK',
      message: '🎉 Offline Bookstore API Server is running!',
      version: '2.0.0',
      modules: {
        system: ['/api/login', '/api/accounts', '/api/roles', '/api/reports', '/api/audit-logs'],
        hr: ['/api/hr', '/api/attendance'],
        warehouse: ['/api/product', '/api/receipt', '/api/suppliers', '/api/branches'],
        sales: ['/api/sales', '/api/returns', '/api/customers'],
        finance: ['/api/finance']
      }
    });
  });

  // System Management
  app.use('/api/login', LoginRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/roles', roleRoutes);
  app.use('/api/permissions', permissionRoutes);
  app.use('/api/reports', reportRoutes);

  // HR Management
  app.use('/api/hr', hrRoutes);
  app.use('/api/attendance', attendanceRoutes);

  // Warehouse Management
  app.use('/api/warehouse', warehouseRoutes);
  app.use('/api/product', warehouseRoutes); // Legacy compatibility
  app.use('/api/receipt', Receipt);
  app.use('/api/suppliers', supplierRoutes);

  // Sales & POS
  app.use('/api/sales', salesRoutes);
  app.use('/api/returns', returnRoutes);
  app.use('/api/customers', customerRoutes);

  // Branch Management
  app.use('/api/branches', branchRoutes);

  // Finance Management
  app.use('/api/finance', financeRoutes);

  // Legacy/Other core features (optional to keep if needed, but per plan we clean up)
  // app.use('/api/category', categoryRoutes); 
};