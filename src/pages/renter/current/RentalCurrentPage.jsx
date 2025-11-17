import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
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
  Activity,
  CheckCircle
} from 'lucide-react';
import { renterService } from '../../../services/renter/renterService';

const RentalCurrentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
      // Try to get current rental - first check in_use, then wait_confirm
      let currentRental = null;

      // First try to get in_use rentals
      try {
        const inUseResponse = await renterService.rentals.getAll({ status: 'in_use' });
        const inUseRentals = inUseResponse.data || inUseResponse;
        if (Array.isArray(inUseRentals) && inUseRentals.length > 0) {
          currentRental = inUseRentals[0];
        }
      } catch (error) {
      }

      // If no in_use rental found, try wait_confirm
      if (!currentRental) {
        try {
          const waitConfirmResponse = await renterService.rentals.getAll({ status: 'wait_confirm' });
          const waitConfirmRentals = waitConfirmResponse.data || waitConfirmResponse;
          if (Array.isArray(waitConfirmRentals) && waitConfirmRentals.length > 0) {
            currentRental = waitConfirmRentals[0];
          }
        } catch (error) {
        }
      }

      if (currentRental) {
        // Transform API response to match expected format
        const transformedRental = {
          id: currentRental.id,
          vehicle_id: currentRental.vehicle?.id,
          station_pickup_id: currentRental.stationPickup?.id,
          start_time: currentRental.startTime,
          end_time: currentRental.endTime,
          deposit_amount: currentRental.depositAmount,
          total_cost: currentRental.totalCost,
          status: currentRental.status,
          rental_type: currentRental.rentalType,
          deposit_status: currentRental.depositStatus,
          vehicle: {
            id: currentRental.vehicle?.id,
            model: currentRental.vehicle?.model,
            brand: currentRental.vehicle?.brand,
            license_plate: currentRental.vehicle?.licensePlate,
            type: currentRental.vehicle?.type,
            battery_level: currentRental.vehicle?.batteryLevel,
            capacity: currentRental.vehicle?.capacity,
            range_per_full_charge: currentRental.vehicle?.rangePerFullCharge,
            price_per_hour: currentRental.vehicle?.pricePerHour
          },
          station_pickup: {
            id: currentRental.stationPickup?.id,
            name: currentRental.stationPickup?.name,
            address: currentRental.stationPickup?.address,
            latitude: currentRental.stationPickup?.latitude,
            longitude: currentRental.stationPickup?.longitude
          },
          station_return: currentRental.stationReturn ? {
            id: currentRental.stationReturn.id,
            name: currentRental.stationReturn.name,
            address: currentRental.stationReturn.address
          } : null,
          staff_pickup: currentRental.staffPickup ? {
            id: currentRental.staffPickup.id,
            fullName: currentRental.staffPickup.fullName,
            email: currentRental.staffPickup.email,
            phone: currentRental.staffPickup.phone
          } : null,
          renter: currentRental.renter ? {
            id: currentRental.renter.id,
            fullName: currentRental.renter.fullName,
            email: currentRental.renter.email,
            phone: currentRental.renter.phone
          } : null
        };

        setCurrentRental(transformedRental);
      } else {
        setCurrentRental(null);
      }
    } catch (err) {
      console.error('Error loading current rental:', err);
      // If error status is 404 or no data, it means no active rental
      if (err.response?.status === 404 || err.status === 404) {
        setCurrentRental(null);
      } else {
        setError('Có lỗi xảy ra khi tải thông tin thuê xe');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateRentalDuration = (startTime) => {
    if (!startTime) return "0h 0m";

    const start = new Date(startTime);
    const now = new Date();

    // Nếu chưa tới giờ bắt đầu → hiện "Chưa bắt đầu"
    if (now < start) {
      return "Chưa bắt đầu";
    }

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

  const handleEndRental = async () => {
    if (!currentRental?.id) {
      setError('Không tìm thấy thông tin lượt thuê');
      return;
    }

    try {
      setLoading(true);

      // Call API to confirm rental
      await renterService.rentals.confirmRental(currentRental.id);

      // Update the current rental status to 'in_use' immediately
      setCurrentRental(prev => ({
        ...prev,
        status: 'in_use'
      }));

      // Show success message
      toast({
        title: "Thành công",
        description: "Đã xác nhận nhận xe thành công! Xe hiện đang trong trạng thái sử dụng.",
      });

      setError(''); // Clear any previous errors

    } catch (err) {
      console.error('Error confirming rental:', err);
      setError('Có lỗi xảy ra khi xác nhận thuê xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChecks = () => {
    if (currentRental?.id) {
      navigate(`/rentals/checks/${currentRental.id}`);
    } else {
      setError('Không tìm thấy thông tin lượt thuê');
    }
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
                <div className="text-sm text-blue-700">
                  Tiền cọc ({currentRental.deposit_status === 'held' ? 'Đã giữ' : 'Đã trả'})
                </div>
              </CardContent>
            </Card>

            <Card className={currentRental.status === 'in_use' ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
              <CardContent className="p-4 text-center">
                <Activity className={`h-8 w-8 mx-auto mb-2 ${currentRental.status === 'in_use' ? 'text-green-600' : 'text-orange-600'}`} />
                <Badge
                  variant={currentRental.status === 'in_use' ? 'default' : 'secondary'}
                  className="text-lg px-3 py-1"
                >
                  {currentRental.status === 'in_use' ? 'Đang sử dụng' :
                    currentRental.status === 'wait_confirm' ? 'Chờ xác nhận' :
                      currentRental.status}
                </Badge>
                <div className={`text-sm mt-2 ${currentRental.status === 'in_use' ? 'text-green-700' : 'text-orange-700'}`}>Trạng thái</div>
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
                      <span className="text-gray-600">Loại xe</span>
                      <Badge variant="outline">
                        {currentRental.vehicle.type === 'motorbike' ? 'Xe máy' : 'Ô tô'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Model</span>
                      <span className="font-medium">
                        {currentRental.vehicle.brand} {currentRental.vehicle.model}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Biển số</span>
                      <span className="font-medium text-lg">{currentRental.vehicle.license_plate}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Pin</span>
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
                      <span className="text-gray-600">Loại thuê</span>
                      <Badge variant={currentRental.rental_type === 'booking' ? 'default' : 'secondary'}>
                        {currentRental.rental_type === 'booking' ? 'Đặt trước' : 'Walk-in'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Bắt đầu</span>
                      <span className="font-medium">
                        {new Date(currentRental.start_time).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    {currentRental.end_time && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Dự kiến kết thúc</span>
                        <span className="font-medium">
                          {new Date(currentRental.end_time).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )}
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

                {currentRental.status === 'wait_confirm' && (
                  <Button
                    onClick={handleEndRental}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4 mr-2" />
                    )}
                    Xác nhận đã nhận xe
                  </Button>
                )}

                {currentRental.status === 'in_use' && (
                  <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="text-green-700 font-medium flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Đã xác nhận - Xe đang sử dụng
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Bạn đã xác nhận nhận xe thành công
                    </div>
                  </div>
                )}
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
