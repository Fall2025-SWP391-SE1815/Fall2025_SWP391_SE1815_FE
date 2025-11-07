// Forgot Password Page Component
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import authService from '@/services/auth/authService.js';
import { 
  ArrowLeft, 
  CheckCircle, 
  Send, 
  Shield, 
  Key, 
  KeyRound,
  Mail, 
  Loader2, 
  AlertCircle, 
  Eye,
  EyeOff
} from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  // Flow steps: 'email' -> 'otp' -> 'reset' -> 'success'
  const [currentStep, setCurrentStep] = useState('email');
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [canResendOtp, setCanResendOtp] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

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

  // Validate email
  const validateEmail = (email) => {
    if (!email) return 'Email không được để trống';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email không hợp lệ';
    return '';
  };

  // Validate OTP
  const validateOtp = (otp) => {
    if (!otp) return 'Mã OTP không được để trống';
    if (otp.length !== 6) return 'Mã OTP phải có 6 chữ số';
    if (!/^\d{6}$/.test(otp)) return 'Mã OTP chỉ được chứa số';
    return '';
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

  // Step 1: Send reset email
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const result = await authService.forgotPassword(formData.email);
      
      if (result.success) {
        setSuccessMessage('Mã OTP đã được gửi đến email của bạn');
        setCurrentStep('otp');
        startResendCountdown();
      } else {
        setSubmitError(result.message || 'Có lỗi xảy ra khi gửi email');
      }
    } catch (error) {
      setSubmitError('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otpError = validateOtp(formData.otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      // Verify OTP with backend
      const result = await authService.verifyOtp(formData.email, formData.otp);
      
      if (result.success) {
        // Save token from OTP verification for password reset
        setFormData(prev => ({ ...prev, token: result.data?.token || '' }));
        setSuccessMessage('OTP xác thực thành công');
        setCurrentStep('reset');
      } else {
        setSubmitError(result.message || 'Mã OTP không chính xác');
      }
    } catch (error) {
      setSubmitError('Mã OTP không chính xác hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const result = await authService.resetPassword(
        formData.token, 
        formData.newPassword
      );
      
      if (result.success) {
        setCurrentStep('success');
      } else {
        setSubmitError(result.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
      }
    } catch (error) {
      setSubmitError('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;

    setLoading(true);
    try {
      const result = await authService.resendOtp(formData.email);
      if (result.success) {
        setSuccessMessage('Mã OTP mới đã được gửi');
        startResendCountdown();
      } else {
        setSubmitError(result.message || 'Không thể gửi lại OTP');
      }
    } catch (error) {
      setSubmitError('Có lỗi xảy ra khi gửi lại OTP');
    } finally {
      setLoading(false);
    }
  };

  // Countdown for resend OTP
  const startResendCountdown = () => {
    setCanResendOtp(false);
    setResendCountdown(60);
    
    const timer = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResendOtp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Get step content
  const getStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <form onSubmit={handleSendResetEmail}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
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
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Gửi mã xác thực
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                Mã OTP đã được gửi đến <strong>{formData.email}</strong>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">Mã OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Nhập mã OTP 6 chữ số"
                  value={formData.otp}
                  onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`text-center text-lg tracking-widest ${errors.otp ? 'border-red-500 focus:border-red-500' : ''}`}
                  maxLength={6}
                  disabled={loading}
                />
                {errors.otp && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.otp}
                  </p>
                )}
              </div>

              <div className="text-center">
                {canResendOtp ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Gửi lại mã OTP
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Gửi lại sau {resendCountdown}s
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
                    Đang xác thực...
                  </>
                ) : (
                  'Xác thực OTP'
                )}
              </Button>
            </CardFooter>
          </form>
        );

      case 'reset':
        return (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
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
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
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
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                    Đang đặt lại...
                  </>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </Button>
            </CardFooter>
          </form>
        );

      case 'success':
        return (
          <CardContent className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Đặt lại mật khẩu thành công!
              </h3>
              <p className="text-gray-600">
                Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Đăng nhập ngay
            </Button>
          </CardContent>
        );

      default:
        return null;
    }
  };

  // Get step title and description
  const getStepInfo = () => {
    switch (currentStep) {
      case 'email':
        return {
          title: 'Quên mật khẩu',
          description: 'Nhập email để nhận mã xác thực'
        };
      case 'otp':
        return {
          title: 'Xác thực OTP',
          description: 'Nhập mã OTP được gửi đến email'
        };
      case 'reset':
        return {
          title: 'Đặt lại mật khẩu',
          description: 'Tạo mật khẩu mới cho tài khoản'
        };
      case 'success':
        return {
          title: 'Hoàn thành',
          description: 'Mật khẩu đã được đặt lại thành công'
        };
      default:
        return { title: '', description: '' };
    }
  };

  const stepInfo = getStepInfo();

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
                <KeyRound className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {stepInfo.title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {stepInfo.description}
            </CardDescription>
          </CardHeader>

          {/* Error Alert */}
          {submitError && (
            <div className="px-6">
              <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="px-6">
              <Alert className="border-green-200 bg-green-50 animate-in fade-in-50 slide-in-from-top-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            </div>
          )}

          {getStepContent()}

          {/* Back to login */}
          {currentStep !== 'success' && (
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;