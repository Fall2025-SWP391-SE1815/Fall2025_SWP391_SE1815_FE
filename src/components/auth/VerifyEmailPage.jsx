import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '@/services/auth/authService.js';

const VerifyEmailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp.trim()) return setError('Vui lòng nhập mã OTP');

        setLoading(true);
        setError('');

        const res = await authService.verifyOtp(email, otp);
        if (res.success) {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 1500);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    const handleResend = async () => {
        setLoading(true);
        const res = await authService.resendOtp(email);
        if (!res.success) setError(res.message);
        else alert('OTP mới đã được gửi đến email của bạn');
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-xl border-0">
                <CardHeader className="text-center space-y-2">
                    <Mail className="mx-auto h-10 w-10 text-green-600" />
                    <CardTitle className="text-xl font-bold text-gray-900">Xác thực tài khoản</CardTitle>
                    <p className="text-gray-600 text-sm">
                        Nhập mã OTP đã gửi đến email <span className="font-medium text-green-600">{email}</span>
                    </p>
                </CardHeader>

                <form onSubmit={handleVerify}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription>Tài khoản đã được xác thực thành công!</AlertDescription>
                            </Alert>
                        )}

                        <div>
                            <label className="text-sm font-medium">Mã OTP</label>
                            <Input
                                type="text"
                                placeholder="Nhập mã 6 chữ số"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                disabled={loading}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3">
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
                                'Xác nhận OTP'
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleResend}
                            disabled={loading}
                        >
                            Gửi lại mã OTP
                        </Button>

                        <p className="text-sm text-center text-gray-600">
                            <Link to="/login" className="text-green-600 hover:underline">Quay lại đăng nhập</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default VerifyEmailPage;
