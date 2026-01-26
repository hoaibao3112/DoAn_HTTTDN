import apiClient from './api';

const warehouseService = {
    // ==================== PRODUCTS ====================
    getAllProducts: () => apiClient.get('/warehouse/products'),

    getProductById: (id) => apiClient.get(`/warehouse/products/${id}`),

    createProduct: (productData) => apiClient.post('/warehouse/products', productData),

    updateProduct: (id, productData) => apiClient.put(`/warehouse/products/${id}`, productData),

    deleteProduct: (id) => apiClient.delete(`/warehouse/products/${id}`),

    updateMinStock: (id, minStock) => apiClient.patch(`/warehouse/products/${id}/min-stock`, { minStock }),

    // ==================== REFERENCE DATA (No Auth) ====================
    getAuthors: () => apiClient.get('/warehouse/authors'),

    getCategories: () => apiClient.get('/warehouse/categories'),

    getSuppliers: () => apiClient.get('/warehouse/suppliers'),

    // ==================== PURCHASE ORDERS ====================
    getAllPurchaseOrders: () => apiClient.get('/warehouse/purchase-orders'),

    getPurchaseOrderById: (id) => apiClient.get(`/warehouse/purchase-orders/${id}`),

    createPurchaseOrder: (orderData) => apiClient.post('/warehouse/purchase-orders', orderData),

    // ==================== STOCK MANAGEMENT ====================
    getStockByBranch: (branchId) => apiClient.get('/warehouse/stock', { params: { branchId } }),

    getLowStockAlerts: () => apiClient.get('/warehouse/stock/alerts'),

    // ==================== STOCK TRANSFER ====================
    transferStock: (transferData) => apiClient.post('/warehouse/transfers', transferData),

    approveTransfer: (id) => apiClient.put(`/warehouse/transfers/${id}/approve`),

    // ==================== INVENTORY CHECK ====================
    performInventoryCheck: (checkData) => apiClient.post('/warehouse/inventory-check', checkData),
};

export default warehouseService;
