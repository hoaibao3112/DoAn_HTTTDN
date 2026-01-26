import apiClient from './api';

const authService = {
    // ==================== AUTHENTICATION ====================
    login: (credentials) => apiClient.post('/login', credentials),

    logout: () => apiClient.post('/logout'),

    // ==================== PASSWORD MANAGEMENT ====================
    sendOTP: (email) => apiClient.post('/login/forgot-password/send-otp', { email }),

    verifyOTP: (email, otp) => apiClient.post('/login/forgot-password/verify-otp', { email, otp }),

    resetPassword: (data) => apiClient.post('/login/forgot-password/reset-password', data),
};

export default authService;
