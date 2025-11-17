// Login Page Component
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth, useAuthValidation } from '@/hooks/auth/useAuth.jsx';
import { Eye, EyeOff, Mail, Lock, Zap, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { validatePhone, validatePassword } = useAuthValidation();
  
  // Get success message from navigation state (from OTP verification)
  const successMessage = location.state?.message || '';

  // Form state
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    rememberMe: false
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await login(formData.phone, formData.password);

      if (result.success && result.user) {
        const userRole = result.user.role;

        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'staff':
            navigate('/staff');
            break;
          case 'renter':
          default:
            navigate('/');
            break;
        }
      } else {
        setSubmitError(result.message || 'Đăng nhập thất bại');
      }

    } catch (error) {
      // Log error for debugging and show user-friendly message
      // eslint-disable-next-line no-console
      console.error('Login error:', error);
      setSubmitError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo login functions for testing (phone-based)
  // const handleDemoLogin = async (role) => {
  //   const demoCredentials = {
  //     admin: { phone: '0123456789', password: 'Admin@123' },
  //     staff: { phone: '0123456781', password: 'Abc@1234' },
  //     renter: { phone: '0999999999', password: 'User1@123' }
  //   };

  //   const credentials = demoCredentials[role];
  //   if (credentials) {
  //     setFormData(prev => ({
  //       ...prev,
  //       phone: credentials.phone,
  //       password: credentials.password
  //     }));
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-600 rounded-full">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Đăng nhập EV Rental
            </CardTitle>
            <CardDescription className="text-gray-600">
              Nhập thông tin để truy cập hệ thống
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Success Message */}
              {successMessage && (
                <Alert className="border-green-200 bg-green-50 animate-in fade-in-50 slide-in-from-top-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Error Alert */}
              {submitError && (
                <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Nhập số điện thoại của bạn"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 animate-in fade-in-50">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 animate-in fade-in-50">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-800 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Demo Login Buttons */}
              {/* <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">Tài khoản demo:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin('admin')}
                    disabled={isSubmitting}
                    className="text-xs"
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin('staff')}
                    disabled={isSubmitting}
                    className="text-xs"
                  >
                    Staff
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin('renter')}
                    disabled={isSubmitting}
                    className="text-xs"
                  >
                    Renter
                  </Button>
                </div>
              </div> */}
              
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
              
              {/* Register Link */}
              <p className="text-center text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className="text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;