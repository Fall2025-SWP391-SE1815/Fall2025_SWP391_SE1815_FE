// Current Rentals Page - Active rental management with check-in/check-out functionality
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import renterService from '@/services/renter/renterService.js';
import apiClient from '../../lib/api/apiClient';
import {
  Car,
  MapPin,
  Clock,
  Battery,
  Route,
  Navigation,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  Users,
  Gauge,
  Zap,
  Shield,
  Star,
  Calendar,
  CreditCard,
  Play,
  Square,
  Timer,
  ArrowRight,
  Upload,
  Download
} from 'lucide-react';

const CurrentRentalsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State
  const [currentRentals, setCurrentRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [vehicleCondition, setVehicleCondition] = useState({
    battery_level: '',
    mileage: '',
    condition_notes: '',
    damage_photos: [],
    cleanliness_rating: 5
  });

  // Load data
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadCurrentRentals();
      
      // Check if starting rental from reservation
      const startReservationId = searchParams.get('start');
      if (startReservationId) {
        startRentalFromReservation(startReservationId);
      }
    }
  }, [isAuthenticated, user, searchParams]);

  const loadCurrentRentals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/renter/rentals/current');
      if (response.success) {
        // API returns single rental object, convert to array for UI consistency  
        const rentalData = response.data.rental;
        setCurrentRentals(rentalData ? [rentalData] : []);
      } else {
        if (response.statusCode === 404) {
          setCurrentRentals([]);
        } else {
          setError('Không thể tải danh sách thuê xe hiện tại. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      console.error('Error loading current rentals:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const startRentalFromReservation = async (reservationId) => {
    try {
      const response = await renterService.rentals.startFromReservation(reservationId);
      if (response.success) {
        setSuccess('Bắt đầu thuê xe thành công!');
        loadCurrentRentals();
      } else {
        setError('Không thể bắt đầu thuê xe. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error starting rental:', error);
      setError('Có lỗi xảy ra khi bắt đầu thuê xe.');
    }
  };

  const handleCheckIn = (rental) => {
    setSelectedRental(rental);
    setVehicleCondition({
      battery_level: rental.battery_level || '',
      mileage: rental.current_mileage || '',
      condition_notes: '',
      damage_photos: [],
      cleanliness_rating: 5
    });
    setShowCheckInModal(true);
  };

  const handleCheckOut = (rental) => {
    setSelectedRental(rental);
    setVehicleCondition({
      battery_level: '',
      mileage: '',
      condition_notes: '',
      damage_photos: [],
      cleanliness_rating: 5
    });
    setShowCheckOutModal(true);
  };

  const handleConfirmCheckIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const checkInData = {
        rental_id: selectedRental.id,
        check_in_time: new Date().toISOString(),
        vehicle_condition: vehicleCondition,
        check_in_location: selectedRental.pickup_location
      };

      const response = await renterService.rentals.checkIn(checkInData);
      if (response.success) {
        setSuccess('Check-in thành công! Bạn có thể bắt đầu sử dụng xe.');
        setShowCheckInModal(false);
        loadCurrentRentals();
      } else {
        setError('Không thể check-in. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      setError('Có lỗi xảy ra khi check-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckOut = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const checkOutData = {
        rental_id: selectedRental.id,
        check_out_time: new Date().toISOString(),
        vehicle_condition: vehicleCondition,
        check_out_location: selectedRental.return_location
      };

      const response = await renterService.rentals.checkOut(checkOutData);
      if (response.success) {
        setSuccess('Check-out thành công! Cảm ơn bạn đã sử dụng dịch vụ.');
        setShowCheckOutModal(false);
        loadCurrentRentals();
      } else {
        setError('Không thể check-out. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      setError('Có lỗi xảy ra khi check-out.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setVehicleCondition({
      ...vehicleCondition,
      damage_photos: [...vehicleCondition.damage_photos, ...files]
    });
  };

  const removePhoto = (index) => {
    const updatedPhotos = vehicleCondition.damage_photos.filter((_, i) => i !== index);
    setVehicleCondition({
      ...vehicleCondition,
      damage_photos: updatedPhotos
    });
  };

  // View rental checks
  const handleViewChecks = async (rentalId) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/renter/rentals/${rentalId}/checks`);
      if (response.success) {
        // You can set this to state and show in a modal or navigate to a checks page
        console.log('Rental checks:', response.data.checks);
        // For now, let's show a simple alert with the number of checks
        alert(`Tìm thấy ${response.data.checks.length} biên bản giao xe`);
      } else {
        setError('Không thể tải biên bản giao xe');
      }
    } catch (error) {
      console.error('Error loading checks:', error);
      setError('Có lỗi xảy ra khi tải biên bản giao xe');
    } finally {
      setLoading(false);
    }
  };

  const handleExtendRental = (rentalId) => {
    // Navigate to extend rental flow
    navigate(`/rentals/${rentalId}/extend`);
  };

  const handleReportIssue = (rentalId) => {
    // Navigate to incident reporting
    navigate(`/incidents?rental=${rentalId}`);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending_checkin': { text: 'Chờ check-in', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'active': { text: 'Đang thuê', color: 'bg-green-100 text-green-700', icon: Car },
      'pending_checkout': { text: 'Chờ check-out', color: 'bg-blue-100 text-blue-700', icon: Square },
      'completed': { text: 'Hoàn thành', color: 'bg-gray-100 text-gray-700', icon: CheckCircle }
    };
    const config = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
    const IconComponent = config.icon;
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getBatteryColor = (level) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-yellow-600';
    if (level >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateRemainingTime = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end - now;
    
    if (diffMs <= 0) return { hours: 0, minutes: 0, isOverdue: true };
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, isOverdue: false };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Car className="h-6 w-6 mr-2 text-green-600" />
                Đang thuê xe
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý các chuyến thuê xe hiện tại
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => navigate('/rental')} className="bg-green-600 hover:bg-green-700">
                <Car className="h-4 w-4 mr-2" />
                Thuê xe mới
              </Button>
              <Button
                variant="outline"
                onClick={loadCurrentRentals}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Alerts */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Rentals */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Đang tải thông tin thuê xe...</p>
          </div>
        ) : currentRentals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có chuyến thuê nào</h3>
              <p className="text-gray-500 mb-4">Bạn chưa có chuyến thuê xe nào đang diễn ra</p>
              <div className="space-x-3">
                <Button onClick={() => navigate('/rental')}>
                  <Car className="h-4 w-4 mr-2" />
                  Thuê xe mới
                </Button>
                <Button variant="outline" onClick={() => navigate('/reservations')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Xem đặt chỗ
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {currentRentals.map((rental) => {
              const timeRemaining = calculateRemainingTime(rental.end_date);
              return (
                <Card key={rental.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{rental.vehicle_name}</h3>
                          <p className="text-green-100">{rental.license_plate} • {rental.vehicle_type}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(rental.status)}
                          <p className="text-green-100 mt-1">#{rental.rental_id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Vehicle Info */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Time and Location */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Thời gian còn lại</p>
                                    <p className={`text-lg font-bold ${timeRemaining.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                      {timeRemaining.isOverdue ? 'Quá hạn' : `${timeRemaining.hours}h ${timeRemaining.minutes}m`}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-purple-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Vị trí hiện tại</p>
                                    <p className="text-lg font-bold text-gray-900">
                                      {rental.current_location || rental.pickup_location}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Vehicle Stats */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Thông số xe</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                  <Battery className={`h-8 w-8 mx-auto mb-2 ${getBatteryColor(rental.battery_level)}`} />
                                  <p className="text-sm font-medium text-gray-600">Pin</p>
                                  <p className="text-lg font-bold">{rental.battery_level}%</p>
                                </div>
                                <div className="text-center">
                                  <Gauge className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                                  <p className="text-sm font-medium text-gray-600">Quãng đường</p>
                                  <p className="text-lg font-bold">{rental.distance_traveled || 0} km</p>
                                </div>
                                <div className="text-center">
                                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                                  <p className="text-sm font-medium text-gray-600">Số chỗ</p>
                                  <p className="text-lg font-bold">{rental.capacity}</p>
                                </div>
                                <div className="text-center">
                                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                                  <p className="text-sm font-medium text-gray-600">Đánh giá</p>
                                  <p className="text-lg font-bold">{rental.vehicle_rating || 'N/A'}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Rental Timeline */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Lịch trình</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <div>
                                    <p className="font-medium">Bắt đầu thuê</p>
                                    <p className="text-sm text-gray-600">{formatDate(rental.start_date)}</p>
                                    <p className="text-sm text-gray-600">{rental.pickup_location}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className={`w-3 h-3 rounded-full ${timeRemaining.isOverdue ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                  <div>
                                    <p className="font-medium">Kết thúc dự kiến</p>
                                    <p className="text-sm text-gray-600">{formatDate(rental.end_date)}</p>
                                    <p className="text-sm text-gray-600">{rental.return_location}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Actions Panel */}
                        <div className="space-y-4">
                          {/* Primary Actions */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Hành động</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {rental.status === 'pending_checkin' && (
                                <Button 
                                  onClick={() => handleCheckIn(rental)}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Check-in
                                </Button>
                              )}
                              
                              {rental.status === 'active' && (
                                <Button 
                                  onClick={() => handleCheckOut(rental)}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  <Square className="h-4 w-4 mr-2" />
                                  Check-out
                                </Button>
                              )}

                              <Button 
                                variant="outline" 
                                onClick={() => handleExtendRental(rental.id)}
                                className="w-full"
                              >
                                <Timer className="h-4 w-4 mr-2" />
                                Gia hạn
                              </Button>

                              <Button 
                                variant="outline" 
                                onClick={() => navigate(`/payment?rental=${rental.id}`)}
                                className="w-full"
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Thanh toán
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Support Actions */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Hỗ trợ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <Button 
                                variant="outline" 
                                onClick={() => handleReportIssue(rental.id)}
                                className="w-full"
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Báo cáo sự cố
                              </Button>

                              <Button 
                                variant="outline" 
                                className="w-full"
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Liên hệ hỗ trợ
                              </Button>

                              <Button 
                                variant="outline" 
                                className="w-full"
                              >
                                <Navigation className="h-4 w-4 mr-2" />
                                Tìm đường
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Cost Info */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Chi phí</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Chi phí hiện tại</span>
                                  <span className="font-medium">{formatPrice(rental.current_cost || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Dự kiến tổng</span>
                                  <span className="font-bold text-green-600">{formatPrice(rental.estimated_total || 0)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Check-in Modal */}
        <Dialog open={showCheckInModal} onOpenChange={setShowCheckInModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Check-in xe: {selectedRental?.vehicle_name}</DialogTitle>
              <DialogDescription>
                Kiểm tra tình trạng xe trước khi bắt đầu thuê
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Vehicle Inspection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kiểm tra xe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Mức pin hiện tại (%)
                      </label>
                      <Input
                        type="number"
                        value={vehicleCondition.battery_level}
                        onChange={(e) => setVehicleCondition({...vehicleCondition, battery_level: e.target.value})}
                        placeholder="85"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Số km hiện tại
                      </label>
                      <Input
                        type="number"
                        value={vehicleCondition.mileage}
                        onChange={(e) => setVehicleCondition({...vehicleCondition, mileage: e.target.value})}
                        placeholder="12500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tình trạng xe
                    </label>
                    <textarea
                      value={vehicleCondition.condition_notes}
                      onChange={(e) => setVehicleCondition({...vehicleCondition, condition_notes: e.target.value})}
                      placeholder="Ghi chú về tình trạng xe (hư hỏng, vết xước, v.v.)"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Chụp ảnh xe (nếu có hư hỏng)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="checkin-photos"
                    />
                    <label htmlFor="checkin-photos" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click để chụp ảnh</p>
                      </div>
                    </label>
                    {vehicleCondition.damage_photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {vehicleCondition.damage_photos.map((file, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Damage ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => removePhoto(index)}
                              className="absolute top-0 right-0 text-red-600 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCheckInModal(false)}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleConfirmCheckIn}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Xác nhận Check-in
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Check-out Modal */}
        <Dialog open={showCheckOutModal} onOpenChange={setShowCheckOutModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Check-out xe: {selectedRental?.vehicle_name}</DialogTitle>
              <DialogDescription>
                Kiểm tra tình trạng xe sau khi sử dụng
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Vehicle Return Inspection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kiểm tra trả xe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Mức pin khi trả (%)
                      </label>
                      <Input
                        type="number"
                        value={vehicleCondition.battery_level}
                        onChange={(e) => setVehicleCondition({...vehicleCondition, battery_level: e.target.value})}
                        placeholder="65"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Số km khi trả
                      </label>
                      <Input
                        type="number"
                        value={vehicleCondition.mileage}
                        onChange={(e) => setVehicleCondition({...vehicleCondition, mileage: e.target.value})}
                        placeholder="12550"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Đánh giá độ sạch xe (1-5 sao)
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant={vehicleCondition.cleanliness_rating >= rating ? "default" : "outline"}
                          size="sm"
                          onClick={() => setVehicleCondition({...vehicleCondition, cleanliness_rating: rating})}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Ghi chú về tình trạng xe
                    </label>
                    <textarea
                      value={vehicleCondition.condition_notes}
                      onChange={(e) => setVehicleCondition({...vehicleCondition, condition_notes: e.target.value})}
                      placeholder="Mô tả tình trạng xe sau khi sử dụng..."
                      className="w-full p-3 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Chụp ảnh xe cuối chuyến
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="checkout-photos"
                    />
                    <label htmlFor="checkout-photos" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click để chụp ảnh xe</p>
                      </div>
                    </label>
                    {vehicleCondition.damage_photos.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {vehicleCondition.damage_photos.map((file, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Final ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => removePhoto(index)}
                              className="absolute top-0 right-0 text-red-600 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCheckOutModal(false)}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleConfirmCheckOut}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Xác nhận Check-out
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CurrentRentalsPage;