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

    // Verify OTP
    verifyOtp: async (email, otp) => {
        try {
            const res = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
            const payload = res || {};
            const user = payload.userInfo || payload.user || payload.data?.userInfo || null;
            const accessToken = payload.accessToken || payload.token || payload.data?.accessToken || null;
            const refreshToken = payload.refreshToken || payload.data?.refreshToken || null;
            
            // Extract token for password reset (different from accessToken)
            const resetToken = payload.token || payload.data?.token || payload.resetToken || payload.data?.resetToken || null;

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
            return createResponse({ 
                user, 
                accessToken, 
                refreshToken, 
                token: resetToken // Include reset token in response
            }, true, 'OTP verified successfully');
        } catch (error) {
            const msg = error?.data?.message || error?.message || 'Xác thực OTP thất bại';
            const status = error?.status || 400;
            return createErrorResponse(msg, status);
        }
    },

    // Forgot Password
    forgotPassword: async (email) => {
        try {
            const res = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
            return createResponse(res, true, 'OTP đã được gửi đến email của bạn');
        } catch (error) {
            const msg = error?.data?.message || error?.message || 'Không thể gửi OTP';
            const status = error?.status || 400;
            return createErrorResponse(msg, status);
        }
    },

    // Reset Password  
    resetPassword: async (token, newPassword) => {
        try {
            const res = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { 
                token, 
                newPassword 
            });
            return createResponse(res, true, 'Mật khẩu đã được đặt lại thành công');
        } catch (error) {
            const msg = error?.data?.message || error?.message || 'Đặt lại mật khẩu thất bại';
            const status = error?.status || 400;
            return createErrorResponse(msg, status);
        }
    },

    // Resend OTP
    resendOtp: async (email) => {
        try {
            const res = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email });
            return createResponse(res, true, 'OTP mới đã được gửi');
        } catch (error) {
            const msg = error?.data?.message || error?.message || 'Không thể gửi lại OTP';
            const status = error?.status || 400;
            return createErrorResponse(msg, status);
        }
    },

    // Change Password
    changePassword: async (currentPassword, newPassword, confirmNewPassword) => {
        try {
            const res = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { 
                currentPassword, 
                newPassword,
                confirmNewPassword 
            });
            return createResponse(res, true, 'Đổi mật khẩu thành công');
        } catch (error) {
            const msg = error?.data?.message || error?.message || 'Đổi mật khẩu thất bại';
            const status = error?.status || 400;
            return createErrorResponse(msg, status);
        }
    },

    // Update Profile (placeholder for now)
    updateProfile: async (profileData) => {
        try {
            // Note: This endpoint might be in user service instead of auth service
            const endpoint = '/api/user/profile'; // This might need adjustment based on actual API
            const res = await apiClient.put(endpoint, profileData);
            const user = res?.userInfo || res?.user || res?.data || res;
            
            if (user) {
                currentUser = user;
                localStorage.setItem('userData', JSON.stringify(user));
            }
            return createResponse(user, true, 'Cập nhật hồ sơ thành công');
        } catch (error) {
            const msg = error?.data?.message || error?.message || 'Cập nhật hồ sơ thất bại';
            const status = error?.status || 400;
            return createErrorResponse(msg, status);
        }
    },

    // Utilities
    isAuthenticated: () => !!currentUser && !!authToken,
    getToken: () => authToken,
    getCurrentUser: () => currentUser
};

export default authService;
