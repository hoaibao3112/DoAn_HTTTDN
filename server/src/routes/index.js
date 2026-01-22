import productRoutes from './productRoutes.js';
import accountRoutes from './account.js';
import LoginRoutes from './LoginRoutes.js';
import roleRoutes from './roleRoutes.js';
import Receipt from './receipt.js';
import reportRoutes from './reportRoutes.js';
import hrRoutes from './hrRoutes.js';
import salesRoutes from './salesRoutes.js';

export const initRoutes = (app) => {
  // Root path - Server status
  app.get('/', (req, res) => {
    res.json({
      status: 'OK',
      message: '🎉 Offline Bookstore API Server is running!',
      version: '2.0.0',
      modules: {
        system: ['/api/login', '/api/accounts', '/api/roles', '/api/reports', '/api/audit-logs'],
        hr: ['/api/hr'],
        warehouse: ['/api/product', '/api/receipt'],
        sales: ['/api/sales']
      }
    });
  });

  // System Management
  app.use('/api/login', LoginRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/roles', roleRoutes);
  app.use('/api/reports', reportRoutes);

  // HR Management
  app.use('/api/hr', hrRoutes);

  // Warehouse Management
  app.use('/api/product', productRoutes);
  app.use('/api/receipt', Receipt);

  // Sales & POS
  app.use('/api/sales', salesRoutes);

  // Legacy/Other core features (optional to keep if needed, but per plan we clean up)
  // app.use('/api/category', categoryRoutes); 
};