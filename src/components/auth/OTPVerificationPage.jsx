// OTP Verification Page Component
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
  Send, 
  Shield, 
  Loader2, 
  AlertCircle,
  Timer
} from 'lucide-react';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state (passed from RegisterPage)
  const email = location.state?.email || '';
  const isRegistration = location.state?.isRegistration || false;
  
  // If no email provided, redirect back to register
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Form state
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Start countdown for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResendOtp(true);
    }
  }, [resendCountdown]);

  // Validate OTP
  const validateOtp = (otp) => {
    if (!otp) return 'Mã OTP không được để trống';
    if (otp.length !== 6) return 'Mã OTP phải có 6 chữ số';
    if (!/^\d{6}$/.test(otp)) return 'Mã OTP chỉ được chứa số';
    return '';
  };

  // Handle OTP input change
  const handleOtpChange = (value) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    
    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otpError = validateOtp(otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const result = await authService.verifyOtp(email, otp);
      
      if (result.success) {
        setSuccessMessage('Xác thực OTP thành công!');
        
        // If this is registration verification, redirect to login
        if (isRegistration) {
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.' 
              }
            });
          }, 2000);
        } else {
          // If this is forgot password verification, redirect to reset password
          // Extract token from various possible response structures
          const token = result.data?.token || result.token || result.data?.data?.token || 'dummy-token';
          
          setTimeout(() => {
            navigate('/reset-password', { 
              state: { 
                email: email,
                token: token
              }
            });
          }, 2000);
        }
      } else {
        setSubmitError(result.message || 'Mã OTP không chính xác');
      }
    } catch (error) {
      setSubmitError('Mã OTP không chính xác hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;

    setLoading(true);
    setSubmitError('');
    setSuccessMessage('');
    
    try {
      const result = await authService.resendOtp(email);
      if (result.success) {
        setSuccessMessage('Mã OTP mới đã được gửi đến email của bạn');
        setCanResendOtp(false);
        setResendCountdown(60);
      } else {
        setSubmitError(result.message || 'Không thể gửi lại OTP');
      }
    } catch (error) {
      setSubmitError('Có lỗi xảy ra khi gửi lại OTP');
    } finally {
      setLoading(false);
    }
  };

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
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Xác thực OTP
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isRegistration 
                ? 'Nhập mã OTP được gửi đến email để hoàn tất đăng ký'
                : 'Nhập mã OTP được gửi đến email để đặt lại mật khẩu'
              }
            </CardDescription>
          </CardHeader>

          {/* Success Message */}
          {successMessage && (
            <div className="px-6 pb-2">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {successMessage}
                </AlertDescription>
              </Alert>
            </div>
          )}

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

          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              {/* Email Display */}
              <div className="text-center text-sm text-gray-600 mb-4">
                Mã OTP đã được gửi đến <strong>{email}</strong>
              </div>
              
              {/* OTP Input */}
              <div className="space-y-2">
                <Label htmlFor="otp">Mã OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Nhập mã OTP 6 chữ số"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  className={`text-center text-lg tracking-widest ${errors.otp ? 'border-red-500 focus:border-red-500' : ''}`}
                  maxLength={6}
                  disabled={loading}
                  autoComplete="off"
                />
                {errors.otp && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.otp}
                  </p>
                )}
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                {canResendOtp ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Send className="mr-1 h-3 w-3" />
                    Gửi lại mã OTP
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Timer className="h-3 w-3" />
                    Gửi lại sau {resendCountdown}s
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Xác thực OTP
                  </>
                )}
              </Button>
            </CardFooter>
          </form>

          {/* Back to previous page */}
          <div className="px-6 pb-6">
            <div className="text-center">
              <Link
                to={isRegistration ? "/register" : "/login"}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                {isRegistration ? 'Quay lại đăng ký' : 'Quay lại đăng nhập'}
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerificationPage;