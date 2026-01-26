import apiClient from './api';

const salesService = {
    // ==================== POS SESSIONS ====================
    openSession: (sessionData) => apiClient.post('/sales/sessions/open', sessionData),

    closeSession: (sessionData) => apiClient.post('/sales/sessions/close', sessionData),

    // ==================== INVOICES ====================
    createInvoice: (invoiceData) => apiClient.post('/sales/invoices', invoiceData),

    // ==================== CUSTOMERS (Sales Context) ====================
    searchCustomer: (phone) => apiClient.get('/sales/customers/search', { params: { sdt: phone } }),

    createCustomer: (customerData) => apiClient.post('/sales/customers', customerData),
};

export default salesService;
