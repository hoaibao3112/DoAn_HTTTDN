import apiClient from './api';

const hrService = {
    // ==================== EMPLOYEE SELF-SERVICE ====================
    getProfile: () => apiClient.get('/hr/profile'),

    updateProfile: (profileData) => apiClient.put('/hr/profile', profileData),

    submitLeave: (leaveData) => apiClient.post('/hr/xin-nghi-phep', leaveData),

    getMyLeave: () => apiClient.get('/hr/my-leave'),

    getMySalary: () => apiClient.get('/hr/my-salary'),

    // ==================== EMPLOYEE MANAGEMENT ====================
    getAllEmployees: () => apiClient.get('/hr/employees'),

    addEmployee: (employeeData) => apiClient.post('/hr/employees', employeeData),

    updateEmployee: (id, employeeData) => apiClient.put(`/hr/employees/${id}`, employeeData),

    deleteEmployee: (id) => apiClient.delete(`/hr/employees/${id}`),

    changePosition: (changeData) => apiClient.post('/hr/change-position', changeData),

    // ==================== LEAVE MANAGEMENT ====================
    getAllLeaveRequests: () => apiClient.get('/hr/leave-requests'),

    approveLeave: (id, approvalData) => apiClient.put(`/hr/leave-requests/${id}/approve`, approvalData),

    // ==================== SALARY ====================
    calculateMonthlySalary: (salaryData) => apiClient.post('/hr/salary/calculate', salaryData),
};

export default hrService;
