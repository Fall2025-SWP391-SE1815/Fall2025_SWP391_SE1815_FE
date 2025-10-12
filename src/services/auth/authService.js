// Authentication Service API (real Swagger backend)
import apiClient from '@/lib/api/apiClient';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const createResponse = (data, success = true, message = 'Success') => ({
    success,
    message,
    data,
    user: data?.userInfo || data?.user || data?.userData || null,
    timestamp: new Date().toISOString()
});

const createErrorResponse = (message, statusCode = 400) => ({
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString()
});

// Authentication state (local cache)
let currentUser = null;
let authToken = null;

// Initialize from localStorage if available
const loadFromStorage = () => {
    try {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('userData');
        if (token) authToken = token;
        if (user) currentUser = JSON.parse(user);
    } catch (e) {
        authToken = null;
        currentUser = null;
    }
};
loadFromStorage();

export const authService = {
    // Login (phone, password)
    login: async (phone, password) => {
        try {
            // Call the backend login endpoint
            const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { phone, password });

            // Normalize possible shapes
            const payload = res || {};
            const user = payload.userInfo || payload.user || payload.userData || payload.data?.userInfo || null;
            const accessToken = payload.accessToken || payload.token || payload.data?.accessToken || payload.data?.token || null;
            const refreshToken = payload.refreshToken || payload.data?.refreshToken || null;

            if (user) {
                currentUser = user;
                localStorage.setItem('userData', JSON.stringify(user));
            }
            if (accessToken) {
                authToken = accessToken;
                localStorage.setItem('accessToken', accessToken);
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            return createResponse({ user, accessToken, refreshToken }, true, 'Login success');
        } catch (error) {
            const msg = error?.data?.message || error?.message || 'Đăng nhập thất bại';
            const status = error?.status || 401;
            return createErrorResponse(msg, status);
        }
    },

    // Register
    register: async (userData) => {
        try {
            const res = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
            const payload = res || {};
            const user = payload.userInfo || payload.user || payload.data?.userInfo || null;
            const accessToken = payload.accessToken || payload.token || payload.data?.accessToken || null;
            const refreshToken = payload.refreshToken || payload.data?.refreshToken || null;

            if (user) {
                currentUser = user;
                localStorage.setItem('userData', JSON.stringify(user));
            }
            if (accessToken) {
                authToken = accessToken;
                localStorage.setItem('accessToken', accessToken);
            }
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

            return createResponse({ user, accessToken, refreshToken }, true, 'Register success');
        } catch (error) {
            const msg = error?.data?.message || error?.message || 'Đăng ký thất bại';
            const status = error?.status || 400;
            return createErrorResponse(msg, status);
        }
    },


    // Logout
    logout: async () => {
        try {
            await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            // ignore errors from backend logout
        }
        currentUser = null;
        authToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        return createResponse({ message: 'Logged out' }, true, 'Logout success');
    },

    // Get current user info from API
    me: async () => {
        try {
            const endpoint = (API_ENDPOINTS?.AUTH?.ME) || '/api/auth/me';
            const payload = await apiClient.get(endpoint);
            const user = payload?.userInfo || payload?.data || payload;
            if (user) {
                currentUser = user;
                localStorage.setItem('userData', JSON.stringify(user));
            }
            return createResponse(payload, true, 'User info retrieved');
        } catch (error) {
            const msg = error?.data?.message || error?.message || 'Not authenticated';
            const status = error?.status || 401;
            return createErrorResponse(msg, status);
        }
    },

    // Not implemented
    changePassword: async () => createErrorResponse('Not implemented on real API', 501),
    forgotPassword: async () => createErrorResponse('Not implemented on real API', 501),
    resetPassword: async () => createErrorResponse('Not implemented on real API', 501),
    updateProfile: async () => createErrorResponse('Not implemented on real API', 501),
    verifyEmail: async () => createErrorResponse('Not implemented on real API', 501),

    // Utilities
    isAuthenticated: () => !!currentUser && !!authToken,
    getToken: () => authToken,
    getCurrentUser: () => currentUser
};

export default authService;
