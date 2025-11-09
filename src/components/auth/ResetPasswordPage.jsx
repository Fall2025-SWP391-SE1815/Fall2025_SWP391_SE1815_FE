// Reset Password Page Component
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import authService from '@/services/auth/authService.js';
import { 
  ArrowLeft, 
  CheckCircle, 
  Key, 
  Lock,
  Eye,
  EyeOff,
  Loader2, 
  AlertCircle
} from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email and token from navigation state (passed from OTPVerificationPage)
  const email = location.state?.email || '';
  const token = location.state?.token || '';
  
  // Debug log
  console.log('ResetPasswordPage - Received:', { email, token });
  
  // If no email or token provided, redirect back to forgot password
  useEffect(() => {
    if (!email || !token) {
      console.log('Missing email or token, redirecting to forgot-password');
      navigate('/forgot-password');
    }
  }, [email, token, navigate]);

  // Form state
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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

  // Validate password
  const validatePassword = (password) => {
    if (!password) return 'Mật khẩu không được để trống';
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt';
    }
    return '';
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      console.log('ResetPasswordPage - Calling resetPassword with:', { token, newPassword: formData.newPassword });
      const result = await authService.resetPassword(token, formData.newPassword);
      console.log('ResetPasswordPage - Reset result:', result);
      
      if (result.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập với mật khẩu mới.' 
            }
          });
        }, 3000);
      } else {
        setSubmitError(result.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
      }
    } catch (error) {
      setSubmitError('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength, text: 'Yếu', color: 'text-red-500' };
    if (strength <= 4) return { strength, text: 'Trung bình', color: 'text-yellow-500' };
    return { strength, text: 'Mạnh', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
            <CardContent className="text-center py-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Đặt lại mật khẩu thành công!
              </h2>
              <p className="text-gray-600 mb-6">
                Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập trong vài giây.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-green-600 hover:bg-green-700"
              >
                Đăng nhập ngay
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                <Key className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Đặt lại mật khẩu
            </CardTitle>
            <CardDescription className="text-gray-600">
              Tạo mật khẩu mới cho tài khoản của bạn
            </CardDescription>
          </CardHeader>

          {/* Error Message */}
          {submitError && (
            <div className="px-6 pb-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {submitError}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Email Display */}
              <div className="text-center text-sm text-gray-600 mb-4">
                Đặt lại mật khẩu cho <strong>{email}</strong>
              </div>
              
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.strength <= 2 ? 'bg-red-500' :
                            passwordStrength.strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}
                
                {errors.newPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && formData.newPassword && (
                  <div className="flex items-center space-x-1">
                    {formData.newPassword === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-500">Mật khẩu khớp</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-500">Mật khẩu không khớp</span>
                      </>
                    )}
                  </div>
                )}
                
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đặt lại mật khẩu...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Đặt lại mật khẩu
                  </>
                )}
              </Button>
            </CardFooter>
          </form>

          {/* Back to login */}
          <div className="px-6 pb-6">
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;