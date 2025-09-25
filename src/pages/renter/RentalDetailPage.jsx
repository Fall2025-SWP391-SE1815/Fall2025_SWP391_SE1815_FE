import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { 
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Car,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Route,
  Fuel,
  Settings,
  User,
  FileText,
  Camera
} from 'lucide-react';

const RentalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRentalDetail();
  }, [id]);

  const loadRentalDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for rental detail
      const mockRental = {
        id: id,
        vehicleId: 'VH001',
        vehicleLicensePlate: '29A-12345',
        vehicleType: 'Xe máy điện',
        vehicleBrand: 'VinFast Klara S',
        vehicleImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        
        status: 'completed',
        startTime: '2024-09-20T08:00:00Z',
        endTime: '2024-09-20T18:30:00Z',
        duration: '10 giờ 30 phút',
        
        startStation: {
          id: 'ST001',
          name: 'Trạm Đại học Bách Khoa',
          address: '268 Lý Thường Kiệt, Q.10, TP.HCM'
        },
        endStation: {
          id: 'ST002', 
          name: 'Trạm Công viên Tao Đàn',
          address: '37 Trương Định, Q.1, TP.HCM'
        },
        
        distance: 45.2,
        route: 'Đại học Bách Khoa → Công viên Tao Đàn',
        
        pricing: {
          baseRate: 15000,
          timeRate: 3000,
          distanceRate: 2000,
          totalAmount: 89000,
          discount: 0,
          finalAmount: 89000
        },
        
        payment: {
          method: 'credit_card',
          status: 'completed',
          transactionId: 'TXN123456789',
          timestamp: '2024-09-20T18:35:00Z'
        },
        
        vehicleCondition: {
          before: {
            battery: 85,
            mileage: 1245,
            damages: [],
            photos: []
          },
          after: {
            battery: 23,
            mileage: 1290,
            damages: ['Vết trầy nhỏ bên phải'],
            photos: []
          }
        },
        
        violations: [],
        incidents: [],
        rating: {
          score: 4,
          comment: 'Xe chạy tốt, pin khá bền'
        }
      };
      
      setRental(mockRental);
    } catch (err) {
      setError('Không thể tải thông tin chi tiết thuê xe');
      console.error('Error loading rental detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Đang thuê' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Hoàn thành' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Đã hủy' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xử lý' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'active':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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

  if (error || !rental) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Không tìm thấy thông tin thuê xe'}
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
              Chi tiết thuê xe #{rental.id}
            </h1>
            <p className="text-gray-600">
              {rental.vehicleLicensePlate} - {rental.vehicleBrand}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusIcon(rental.status)}
          {getStatusBadge(rental.status)}
        </div>
      </div>

      {/* Vehicle Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2" />
            Thông tin xe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <img
              src={rental.vehicleImage}
              alt={rental.vehicleBrand}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Biển số xe:</p>
                <p className="font-semibold">{rental.vehicleLicensePlate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Loại xe:</p>
                <p className="font-semibold">{rental.vehicleType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thương hiệu:</p>
                <p className="font-semibold">{rental.vehicleBrand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã xe:</p>
                <p className="font-semibold">{rental.vehicleId}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Route className="h-5 w-5 mr-2" />
            Chi tiết chuyến đi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Điểm đi
              </h4>
              <p className="font-medium">{rental.startStation.name}</p>
              <p className="text-sm text-gray-600">{rental.startStation.address}</p>
              <p className="text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                {new Date(rental.startTime).toLocaleString('vi-VN')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Điểm đến
              </h4>
              <p className="font-medium">{rental.endStation.name}</p>
              <p className="text-sm text-gray-600">{rental.endStation.address}</p>
              <p className="text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                {new Date(rental.endTime).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Thời gian thuê</p>
              <p className="text-lg font-semibold">{rental.duration}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Quãng đường</p>
              <p className="text-lg font-semibold">{rental.distance} km</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Tuyến đường</p>
              <p className="text-sm font-medium">{rental.route}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Chi tiết thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Phí cơ bản:</span>
                <span>{formatCurrency(rental.pricing.baseRate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí theo thời gian:</span>
                <span>{formatCurrency(rental.pricing.timeRate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí theo quãng đường:</span>
                <span>{formatCurrency(rental.pricing.distanceRate)}</span>
              </div>
              {rental.pricing.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatCurrency(rental.pricing.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(rental.pricing.finalAmount)}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Phương thức thanh toán:</p>
                <p className="font-semibold">{getPaymentMethodLabel(rental.payment.method)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái thanh toán:</p>
                <Badge className={rental.payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {rental.payment.status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã giao dịch:</p>
                <p className="font-mono text-sm">{rental.payment.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian thanh toán:</p>
                <p className="text-sm">{new Date(rental.payment.timestamp).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Tình trạng xe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-700">Trước khi thuê</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Pin:</span>
                  <span>{rental.vehicleCondition.before.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Quãng đường:</span>
                  <span>{rental.vehicleCondition.before.mileage} km</span>
                </div>
                <div>
                  <span>Hư hỏng:</span>
                  {rental.vehicleCondition.before.damages.length === 0 ? (
                    <p className="text-green-600 text-sm">Không có</p>
                  ) : (
                    <ul className="text-sm text-red-600">
                      {rental.vehicleCondition.before.damages.map((damage, index) => (
                        <li key={index}>• {damage}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-red-700">Sau khi thuê</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Pin:</span>
                  <span>{rental.vehicleCondition.after.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Quãng đường:</span>
                  <span>{rental.vehicleCondition.after.mileage} km</span>
                </div>
                <div>
                  <span>Hư hỏng:</span>
                  {rental.vehicleCondition.after.damages.length === 0 ? (
                    <p className="text-green-600 text-sm">Không có</p>
                  ) : (
                    <ul className="text-sm text-red-600">
                      {rental.vehicleCondition.after.damages.map((damage, index) => (
                        <li key={index}>• {damage}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating & Feedback */}
      {rental.rating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Đánh giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xl ${
                      star <= rental.rating.score
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Nhận xét của bạn:</p>
                <p className="text-sm">{rental.rating.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Tải hóa đơn
        </Button>
        <Button variant="outline">
          <Camera className="h-4 w-4 mr-2" />
          Xem ảnh
        </Button>
        {rental.status === 'completed' && !rental.rating && (
          <Button>
            <User className="h-4 w-4 mr-2" />
            Đánh giá chuyến đi
          </Button>
        )}
      </div>
    </div>
  );
};

export default RentalDetailPage;