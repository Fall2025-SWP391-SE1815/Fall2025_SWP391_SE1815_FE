// Authentication Hook with API Integration
import React, { useState, useEffect, useContext, createContext } from 'react';
import authService from '@/services/auth/authService';

// Create Auth Context
const AuthContext = createContext({});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {  
      try {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Verify token is still valid (optional) - Disabled for now to prevent logout issues
          // try {
          //   const response = await apiClient.get('/auth/me');
          //   if (response.success) {
          //     setUser(response.data);
          //   }
          // } catch (error) {
          //   // Token might be expired, clear storage
          //   localStorage.removeItem('accessToken');
          //   localStorage.removeItem('refreshToken');
          //   localStorage.removeItem('userData');
          //   setUser(null);
          //   setIsAuthenticated(false);
          // }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function (phone, password)
  const login = async (phone, password) => {
    try {
      setLoading(true);
      const res = await authService.login(phone, password);

      if (!res || !res.success) {
        return { success: false, message: res?.message || 'Đăng nhập thất bại' };
      }

      // authService stores tokens/userData in localStorage; read from there for consistency
      const storedUser = localStorage.getItem('userData');
      const userInfo = res.user || (storedUser ? JSON.parse(storedUser) : null);

      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
      }

      return { success: true, user: userInfo };
    } catch (error) {
      return { success: false, message: error?.message || 'Đăng nhập thất bại' };
    } finally {
      setLoading(false);
    }
  };


  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await authService.register(userData);
      if (!res || !res.success) return { success: false, message: res?.message || 'Đăng ký thất bại' };

      const storedUser = localStorage.getItem('userData');
      const userInfo = res.user || (storedUser ? JSON.parse(storedUser) : null);
      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
      }
      return { success: true, user: userInfo };
    } catch (error) {
      return { success: false, message: error?.message || 'Đăng ký thất bại' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user profile
  const updateProfile = async (updateData) => {
    try {
      const response = await apiClient.put(`/users/${user.id}`, updateData);

      if (response.success) {
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Cập nhật thông tin thất bại';
      return { success: false, message: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });

      if (response.success) {
        return { success: true, message: 'Đổi mật khẩu thành công' };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại';
      return { success: false, message: errorMessage };
    }
  };

  // Check user role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  // Get user role
  const getUserRole = () => {
    return user?.role || null;
  };

  // Get user full name
  const getUserName = () => {
    return user?.full_name || user?.email || 'Người dùng';
  };

  // Context value
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasRole,
    hasAnyRole,
    getUserRole,
    getUserName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook for form validation
export const useAuthValidation = () => {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email không được để trống';
    if (!emailRegex.test(email)) return 'Định dạng email không hợp lệ';
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return 'Mật khẩu không được để trống';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return null;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phone) return 'Số điện thoại không được để trống';
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) return 'Số điện thoại không hợp lệ';
    return null;
  };

  const validateFullName = (fullName) => {
    if (!fullName) return 'Họ tên không được để trống';
    if (fullName.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    return null;
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Xác nhận mật khẩu không được để trống';
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
    return null;
  };

  return {
    validateEmail,
    validatePassword,
    validatePhone,
    validateFullName,
    validateConfirmPassword
  };
};

export default useAuth;
