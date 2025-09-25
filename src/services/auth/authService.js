// Authentication Service API
import { mockData } from '../mockData.js';

// Helper functions
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const createResponse = (data, success = true, message = "Success") => ({
    success,
    message,
    data,
    timestamp: new Date().toISOString()
});

const createErrorResponse = (message, statusCode = 400) => ({
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString()
});

// Authentication state
let currentUser = null;
let authToken = null;

export const authService = {
    // Login
    login: async (email, password) => {
        await simulateDelay();
        const user = mockData.users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = { ...user };
            delete currentUser.password; // Don't return password
            authToken = `mock_token_${user.id}_${Date.now()}`;

            // Update last login (if we had this field)
            const userIndex = mockData.users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                mockData.users[userIndex].updated_at = new Date().toISOString();
            }

            return createResponse({
                userInfo: currentUser,
                accessToken: authToken,
                refreshToken: user.refresh_token
            });
        }
        return createErrorResponse("Invalid email or password", 401);
    },

    // Register new user
    register: async (userData) => {
        await simulateDelay();

        // Check if email already exists
        const existingUser = mockData.users.find(u => u.email === userData.email);
        if (existingUser) {
            return createErrorResponse("Email đã được đăng ký", 409);
        }

        // Check if phone already exists
        if (userData.phone) {
            const existingPhone = mockData.users.find(u => u.phone === userData.phone);
            if (existingPhone) {
                return createErrorResponse("Số điện thoại đã được đăng ký", 409);
            }
        }

        // Validate required fields
        if (!userData.email || !userData.password || !userData.full_name) {
            return createErrorResponse("Email, password, and full name are required", 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return createErrorResponse("Email không hợp lệ", 400);
        }

        // Validate phone format (Vietnamese phone numbers)
        if (userData.phone) {
            const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
            if (!phoneRegex.test(userData.phone)) {
                return createErrorResponse("Số điện thoại không hợp lệ", 400);
            }
        }

        // Validate password strength
        if (userData.password.length < 6) {
            return createErrorResponse("Password must be at least 6 characters long", 400);
        }

        const newUser = {
            id: Math.max(...mockData.users.map(u => u.id)) + 1,
            ...userData,
            role: userData.role || "renter", // Default role is renter
            refresh_token: `refresh_token_${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        mockData.users.push(newUser);

        // Auto login after registration
        currentUser = { ...newUser };
        delete currentUser.password;
        authToken = `mock_token_${newUser.id}_${Date.now()}`;

        return createResponse({
            userInfo: currentUser,
            accessToken: authToken,
            refreshToken: newUser.refresh_token
        });
    },

    // Refresh token
    refreshToken: async (refreshToken) => {
        await simulateDelay();
        const user = mockData.users.find(u => u.refresh_token === refreshToken);
        if (user) {
            const newToken = `mock_token_${user.id}_${Date.now()}`;
            authToken = newToken;
            // API specification: response format { accessToken: String }
            return createResponse({
                accessToken: newToken
            });
        }
        return createErrorResponse("Token làm mới không hợp lệ", 401);
    },

    // Logout
    logout: async () => {
        await simulateDelay();
        currentUser = null;
        authToken = null;
        return createResponse({ message: "Logged out successfully" });
    },

    // Get current user info
    me: async () => {
        await simulateDelay();
        if (currentUser) {
            return createResponse(currentUser);
        }
        return createErrorResponse("Not authenticated", 401);
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        await simulateDelay();
        if (!currentUser) {
            return createErrorResponse("Not authenticated", 401);
        }

        const user = mockData.users.find(u => u.id === currentUser.id);
        if (!user || user.password !== currentPassword) {
            return createErrorResponse("Current password is incorrect", 400);
        }

        if (newPassword.length < 6) {
            return createErrorResponse("New password must be at least 6 characters long", 400);
        }

        user.password = newPassword;
        user.updated_at = new Date().toISOString();

        // Generate new refresh token for security
        user.refresh_token = `refresh_token_${Date.now()}`;

        return createResponse({ message: "Password changed successfully" });
    },

    // Forgot password
    forgotPassword: async (email) => {
        await simulateDelay();
        const user = mockData.users.find(u => u.email === email);
        if (!user) {
            // For security, don't reveal if email exists
            return createResponse({
                message: "If the email exists, a reset link has been sent"
            });
        }

        // In real implementation, this would send an email
        // For mock, we'll generate a reset token
        const resetToken = `reset_token_${user.id}_${Date.now()}`;

        // Store reset token (in real app, this would be in database)
        if (!mockData.passwordResets) {
            mockData.passwordResets = [];
        }

        mockData.passwordResets.push({
            id: Date.now(),
            user_id: user.id,
            token: resetToken,
            expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
            used: false
        });

        return createResponse({
            message: "If the email exists, a reset link has been sent",
            // In real implementation, don't return the token
            resetToken // Only for testing purposes
        });
    },

    // Reset password
    resetPassword: async (resetToken, newPassword) => {
        await simulateDelay();

        if (!mockData.passwordResets) {
            return createErrorResponse("Invalid reset token", 400);
        }

        const resetRecord = mockData.passwordResets.find(r =>
            r.token === resetToken &&
            !r.used &&
            new Date(r.expires_at) > new Date()
        );

        if (!resetRecord) {
            return createErrorResponse("Invalid or expired reset token", 400);
        }

        if (newPassword.length < 6) {
            return createErrorResponse("Password must be at least 6 characters long", 400);
        }

        const user = mockData.users.find(u => u.id === resetRecord.user_id);
        if (!user) {
            return createErrorResponse("User not found", 404);
        }

        // Update password
        user.password = newPassword;
        user.updated_at = new Date().toISOString();
        user.refresh_token = `refresh_token_${Date.now()}`;

        // Mark reset token as used
        resetRecord.used = true;

        return createResponse({ message: "Password reset successfully" });
    },

    // Update profile
    updateProfile: async (profileData) => {
        await simulateDelay();
        if (!currentUser) {
            return createErrorResponse("Not authenticated", 401);
        }

        const userIndex = mockData.users.findIndex(u => u.id === currentUser.id);
        if (userIndex === -1) {
            return createErrorResponse("User not found", 404);
        }

        // Check if email is being changed and already exists
        if (profileData.email && profileData.email !== currentUser.email) {
            const existingUser = mockData.users.find(u => u.email === profileData.email);
            if (existingUser) {
                return createErrorResponse("Email already exists", 409);
            }
        }

        // Check if phone is being changed and already exists
        if (profileData.phone && profileData.phone !== currentUser.phone) {
            const existingPhone = mockData.users.find(u => u.phone === profileData.phone);
            if (existingPhone) {
                return createErrorResponse("Phone number already exists", 409);
            }
        }

        // Update user data
        mockData.users[userIndex] = {
            ...mockData.users[userIndex],
            ...profileData,
            updated_at: new Date().toISOString()
        };

        // Update current user
        currentUser = { ...mockData.users[userIndex] };
        delete currentUser.password;

        return createResponse(currentUser);
    },

    // Verify email (mock implementation)
    verifyEmail: async (verificationToken) => {
        await simulateDelay();

        // In real implementation, this would verify an email verification token
        // For mock, we'll just mark user as verified
        if (!currentUser) {
            return createErrorResponse("Not authenticated", 401);
        }

        const userIndex = mockData.users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            mockData.users[userIndex].email_verified = true;
            mockData.users[userIndex].email_verified_at = new Date().toISOString();
            currentUser.email_verified = true;
        }

        return createResponse({ message: "Email verified successfully" });
    },

    // Check if authenticated
    isAuthenticated: () => {
        return !!currentUser && !!authToken;
    },

    // Get current auth token
    getToken: () => {
        return authToken;
    },

    // Get current user
    getCurrentUser: () => {
        return currentUser;
    }
};