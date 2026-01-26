import apiClient from './api';

const reportService = {
    // ==================== AUDIT LOGS ====================
    getAuditLogs: (params) => apiClient.get('/reports/audit-logs', { params }),

    // ==================== FINANCIAL REPORTS ====================
    getMonthlyRevenue: () => apiClient.get('/reports/revenue/monthly'),

    getMonthlyProfit: () => apiClient.get('/reports/profit/monthly'),

    getBestSellers: () => apiClient.get('/reports/best-sellers'),

    getStockByBranches: () => apiClient.get('/reports/stock/branches'),
};

export default reportService;
