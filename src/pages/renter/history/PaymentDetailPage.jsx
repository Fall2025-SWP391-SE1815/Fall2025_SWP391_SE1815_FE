import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  CreditCard,
  Calendar,
  Car,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Download,
  Receipt,
  User,
  MapPin
} from 'lucide-react';

const PaymentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaymentDetail();
  }, [id]);

  const loadPaymentDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for payment detail
      const mockPayment = {
        id: id,
        transactionId: `TXN${String(Date.now()).slice(-8)}`,
        amount: 67500,
        status: 'completed',
        method: 'credit_card',
        description: 'Thanh toán thuê xe VinFast Evo 200',
        createdAt: '2024-09-20T18:35:00Z',
        processedAt: '2024-09-20T18:35:30Z',
        
        rental: {
          id: 'R00' + id,
          vehicleModel: 'VinFast Evo 200',
          licensePlate: '51F-11111',
          vehicleImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          startTime: '2024-09-20T08:00:00Z',
          endTime: '2024-09-20T18:30:00Z',
          duration: '10 giờ 30 phút',
          distance: 45.2
        },
        
        breakdown: {
          baseRate: 15000,
          timeCharge: 31500,
          distanceCharge: 9000,
          extraCharges: 12000,
          discount: 0,
          tax: 0,
          totalAmount: 67500
        },
        
        paymentInfo: {
          method: 'credit_card',
          cardNumber: '**** **** **** 1234',
          cardHolder: 'NGUYEN VAN A',
          cardType: 'Visa',
          bankName: 'Vietcombank'
        },
        
        invoice: {
          number: 'INV-2024-' + String(Date.now()).slice(-6),
          issueDate: '2024-09-20T18:35:00Z',
          dueDate: '2024-09-20T18:35:00Z',
          downloadUrl: '#'
        },
        
        customer: {
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0901234567'
        }
      };
      
      setPayment(mockPayment);
    } catch (err) {
      setError('Không thể tải thông tin chi tiết giao dịch');
      console.error('Error loading payment detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Thành công', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', label: 'Thất bại', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Đang xử lý', icon: Clock },
      refunded: { color: 'bg-blue-100 text-blue-800', label: 'Đã hoàn tiền', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center space-x-2">
        <IconComponent className="h-5 w-5" />
        <Badge className={config.color}>
          {config.label}
        </Badge>
      </div>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'e_wallet':
        return <Receipt className="h-5 w-5" />;
      case 'bank_transfer':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      credit_card: 'Thẻ tín dụng',
      e_wallet: 'Ví điện tử',
      bank_transfer: 'Chuyển khoản',
      cash: 'Tiền mặt'
    };
    return methods[method] || method;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleDownloadInvoice = () => {
    // Implement invoice download
    alert('Tính năng tải hóa đơn sẽ được triển khai sau');
  };

  const handlePrintInvoice = () => {
    // Implement invoice print
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Không tìm thấy thông tin giao dịch'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết giao dịch #{payment.id}
            </h1>
            <p className="text-gray-600">
              Mã giao dịch: {payment.transactionId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge(payment.status)}
        </div>
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Tóm tắt giao dịch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Số tiền</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(payment.amount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Phương thức</p>
              <div className="flex items-center justify-center space-x-2">
                {getPaymentMethodIcon(payment.method)}
                <p className="text-lg font-semibold">
                  {getPaymentMethodLabel(payment.method)}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Thời gian</p>
              <p className="text-lg font-semibold">
                {new Date(payment.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Mô tả</p>
            <p className="font-medium">{payment.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Rental Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2" />
            Thông tin chuyến thuê
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <img
              src={payment.rental.vehicleImage}
              alt={payment.rental.vehicleModel}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã chuyến:</p>
                <p className="font-semibold">{payment.rental.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Biển số xe:</p>
                <p className="font-semibold">{payment.rental.licensePlate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Loại xe:</p>
                <p className="font-semibold">{payment.rental.vehicleModel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian thuê:</p>
                <p className="font-semibold">{payment.rental.duration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quãng đường:</p>
                <p className="font-semibold">{payment.rental.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian:</p>
                <p className="text-sm">
                  {new Date(payment.rental.startTime).toLocaleString('vi-VN')}
                  <br />
                  đến {new Date(payment.rental.endTime).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết tính phí</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Phí cơ bản:</span>
              <span>{formatCurrency(payment.breakdown.baseRate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí theo thời gian:</span>
              <span>{formatCurrency(payment.breakdown.timeCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí theo quãng đường:</span>
              <span>{formatCurrency(payment.breakdown.distanceCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí phụ trội:</span>
              <span>{formatCurrency(payment.breakdown.extraCharges)}</span>
            </div>
            {payment.breakdown.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(payment.breakdown.discount)}</span>
              </div>
            )}
            {payment.breakdown.tax > 0 && (
              <div className="flex justify-between">
                <span>Thuế VAT:</span>
                <span>{formatCurrency(payment.breakdown.tax)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(payment.breakdown.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {getPaymentMethodIcon(payment.method)}
            <span className="ml-2">Chi tiết thanh toán</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Phương thức:</p>
                <p className="font-semibold">{getPaymentMethodLabel(payment.method)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số thẻ:</p>
                <p className="font-mono">{payment.paymentInfo.cardNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Chủ thẻ:</p>
                <p className="font-semibold">{payment.paymentInfo.cardHolder}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Loại thẻ:</p>
                <p className="font-semibold">{payment.paymentInfo.cardType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngân hàng:</p>
                <p className="font-semibold">{payment.paymentInfo.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian xử lý:</p>
                <p className="text-sm">{new Date(payment.processedAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Thông tin hóa đơn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Số hóa đơn:</p>
                <p className="font-mono font-semibold">{payment.invoice.number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày phát hành:</p>
                <p className="font-semibold">
                  {new Date(payment.invoice.issueDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Khách hàng:</p>
                <p className="font-semibold">{payment.customer.name}</p>
                <p className="text-sm text-gray-600">{payment.customer.email}</p>
                <p className="text-sm text-gray-600">{payment.customer.phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleDownloadInvoice}>
          <Download className="h-4 w-4 mr-2" />
          Tải hóa đơn
        </Button>
        <Button variant="outline" onClick={handlePrintInvoice}>
          <FileText className="h-4 w-4 mr-2" />
          In hóa đơn
        </Button>
        {payment.status === 'completed' && (
          <Button variant="outline">
            <Receipt className="h-4 w-4 mr-2" />
            Yêu cầu hoàn tiền
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentDetailPage;
