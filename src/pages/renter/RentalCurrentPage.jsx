import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Clock, 
  Car,
  MapPin,
  Battery,
  Navigation,
  CarTaxiFront,
  AlertTriangle,
  RefreshCw,
  Phone,
  Eye,
  CreditCard,
  Timer,
  Activity
} from 'lucide-react';

const RentalCurrentPage = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentRental, setCurrentRental] = useState(null);
  
  // Load current rental
  useEffect(() => {
    loadCurrentRental();
  }, []);

  const loadCurrentRental = async () => {
    setLoading(true);
    setError('');

    try {
      // Mock API call to GET /api/renter/rentals/current
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate API response
      const mockResponse = {
        rental: {
          id: 123,
          vehicle_id: 1,
          station_pickup_id: 1,
          start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          deposit_amount: 500000,
          status: 'in_use',
          // Additional mock data for UI
          vehicle: {
            model: 'VinFast Klara S',
            license_plate: '51F-12345',
            battery_level: 75
          },
          station_pickup: {
            name: 'Trạm Quận 1',
            address: '123 Nguyễn Huệ, Quận 1'
          }
        }
      };

      setCurrentRental(mockResponse.rental);
    } catch (err) {
      console.error('Error loading current rental:', err);
      // If error status is 404, it means no active rental
      if (err.status === 404) {
        setCurrentRental(null);
      } else {
        setError('Có lỗi xảy ra khi tải thông tin thuê xe');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateRentalDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleRefresh = () => {
    loadCurrentRental();
  };

  const handleEndRental = () => {
    // Navigate to return process
    navigate('/rentals/return');
  };

  const handleViewChecks = () => {
    navigate('/rentals/checks');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đang tải thông tin thuê xe...
          </h3>
          <p className="text-gray-600">
            Vui lòng chờ một chút
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Activity className="h-8 w-8 mr-3 text-blue-600" />
            Lượt thuê hiện tại
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi thông tin lượt thuê xe đang hoạt động
          </p>
        </div>
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No Active Rental */}
      {!currentRental && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <CarTaxiFront className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có lượt thuê nào đang hoạt động
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có lượt thuê xe nào đang hoạt động. Hãy đặt xe hoặc check-in để bắt đầu thuê xe.
            </p>
            <div className="flex space-x-4 justify-center">
              <Button 
                onClick={() => navigate('/vehicles')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Car className="h-4 w-4 mr-2" />
                Đặt xe ngay
              </Button>
              <Button 
                onClick={() => navigate('/rental/checkin')}
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Check-in
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Rental Details */}
      {currentRental && (
        <>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <Timer className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">
                  {calculateRentalDuration(currentRental.start_time)}
                </div>
                <div className="text-sm text-green-700">Thời gian đã thuê</div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">
                  {formatPrice(currentRental.deposit_amount)}
                </div>
                <div className="text-sm text-blue-700">Tiền cọc đã giữ</div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <Badge 
                  variant={currentRental.status === 'in_use' ? 'default' : 'secondary'}
                  className="text-lg px-3 py-1"
                >
                  {currentRental.status === 'in_use' ? 'Đang sử dụng' : currentRental.status}
                </Badge>
                <div className="text-sm text-orange-700 mt-2">Trạng thái</div>
              </CardContent>
            </Card>
          </div>

          {/* Rental Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2 text-blue-600" />
                Thông tin xe đang thuê
              </CardTitle>
              <CardDescription>
                Chi tiết về xe và địa điểm nhận xe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Thông tin xe</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Model</span>
                      <span className="font-medium">{currentRental.vehicle.model}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Biển số</span>
                      <span className="font-medium text-lg">{currentRental.vehicle.license_plate}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Pin còn lại</span>
                      <div className="flex items-center">
                        <Battery className="h-4 w-4 mr-1 text-green-600" />
                        <span className="font-medium">{currentRental.vehicle.battery_level}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rental Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Thông tin thuê</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Rental ID</span>
                      <span className="font-medium">#{currentRental.id}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Bắt đầu</span>
                      <span className="font-medium">
                        {new Date(currentRental.start_time).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Trạm nhận</span>
                      <div className="text-right">
                        <div className="font-medium">{currentRental.station_pickup.name}</div>
                        <div className="text-sm text-gray-500">{currentRental.station_pickup.address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={handleViewChecks}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem biên bản giao xe
                </Button>
                
                <Button
                  onClick={() => navigate('/support')}
                  variant="outline"
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Hỗ trợ khẩn cấp
                </Button>
                
                <Button
                  onClick={handleEndRental}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Kết thúc thuê xe
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Hãy đảm bảo xe luôn được khóa khi không sử dụng</li>
                      <li>Kiểm tra mức pin thường xuyên và sạc khi cần thiết</li>
                      <li>Liên hệ hỗ trợ ngay khi gặp sự cố</li>
                      <li>Trả xe đúng giờ để tránh phí phạt</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RentalCurrentPage;