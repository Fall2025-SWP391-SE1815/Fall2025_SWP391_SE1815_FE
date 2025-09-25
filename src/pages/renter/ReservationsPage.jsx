// Reservations Page - Booking management for viewing, modifying, canceling reservations
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import renterService from '@/services/renter/renterService.js';
import apiClient from '../../lib/api/apiClient';
import {
  Calendar,
  Car,
  MapPin,
  Clock,
  CreditCard,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Battery,
  Phone,
  Navigation,
  Download,
  ArrowRight
} from 'lucide-react';

const ReservationsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create booking form
  const [createForm, setCreateForm] = useState({
    vehicle_id: '',
    vehicle_type: '',
    station_id: '',
    reserved_start_time: '',
    reserved_end_time: ''
  });
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });

  // Load data
  useEffect(() => {
    loadReservations();
    loadStationsAndVehicles();
  }, []); // Remove authentication dependency

  // Handle query parameters from VehiclesPage
  useEffect(() => {
    const vehicleId = searchParams.get('vehicle_id');
    const stationId = searchParams.get('station_id');
    
    if (vehicleId && stationId && vehicles.length > 0) {
      // Find the selected vehicle to get its type
      const selectedVehicle = vehicles.find(v => v.id === parseInt(vehicleId));
      
      // Pre-fill form with vehicle selection
      setCreateForm(prev => ({
        ...prev,
        vehicle_id: vehicleId,
        station_id: stationId,
        vehicle_type: selectedVehicle ? selectedVehicle.type : ''
      }));
      
      // Auto-open create modal
      setShowCreateModal(true);
      
      // Clear query parameters from URL after processing
      navigate('/reservations', { replace: true });
    }
  }, [searchParams, navigate, vehicles]); // Add vehicles dependency

  // Filter reservations
  useEffect(() => {
    let filtered = [...reservations];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(reservation =>
        reservation.id.toString().includes(filters.search.toLowerCase()) ||
        reservation.vehicle_type.toLowerCase().includes(filters.search.toLowerCase()) ||
        reservation.station_id.toString().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;
      switch (filters.dateRange) {
        case 'upcoming':
          filtered = filtered.filter(reservation => new Date(reservation.reserved_start_time) > now);
          break;
        case 'past':
          filtered = filtered.filter(reservation => new Date(reservation.reserved_end_time) < now);
          break;
        case 'active':
          filtered = filtered.filter(reservation =>
            new Date(reservation.reserved_start_time) <= now && new Date(reservation.reserved_end_time) >= now
          );
          break;
        default:
          break;
      }
    }

    setFilteredReservations(filtered);
  }, [reservations, filters]);

  const loadReservations = async () => {
    setLoading(true);
    setError('');

    // Load mock data directly for development
    setTimeout(() => {
      setReservations([
        {
          id: 1,
          vehicle_id: 1,
          vehicle_type: 'motorbike',
          station_id: 1,
          reserved_start_time: '2025-09-25T09:00:00', // Tomorrow
          reserved_end_time: '2025-09-25T17:00:00',
          status: 'confirmed',
          created_at: '2025-09-23T10:30:00'
        },
        {
          id: 2,
          vehicle_id: 2,
          vehicle_type: 'car',
          station_id: 3,
          reserved_start_time: '2025-09-26T14:00:00', // Day after tomorrow
          reserved_end_time: '2025-09-26T20:00:00',
          status: 'pending',
          created_at: '2025-09-23T15:20:00'
        },
        {
          id: 3,
          vehicle_id: null,
          vehicle_type: 'car',
          station_id: 2,
          reserved_start_time: '2025-09-24T08:00:00', // Tomorrow
          reserved_end_time: '2025-09-24T18:00:00',
          status: 'confirmed',
          created_at: '2025-09-22T09:15:00'
        }
      ]);
      setLoading(false);
    }, 500);
  };

  // Load stations and vehicles for booking
  const loadStationsAndVehicles = async () => {
    // Load mock data directly for development
    setStations([
      { id: 1, name: 'Trạm Quận 1' },
      { id: 2, name: 'Trạm Quận 3' },
      { id: 3, name: 'Trạm Bình Thạnh' }
    ]);
    setVehicles([
      { id: 1, license_plate: '59A1-12345', type: 'motorbike', brand: 'VinFast', model: 'VF3', station_id: 1 },
      { id: 2, license_plate: '59A1-67890', type: 'car', brand: 'VinFast', model: 'VF5', station_id: 1 }
    ]);
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!createForm.station_id) {
        throw new Error('Vui lòng chọn trạm');
      }
      if (!createForm.reserved_start_time || !createForm.reserved_end_time) {
        throw new Error('Vui lòng chọn thời gian');
      }
      if (new Date(createForm.reserved_start_time) >= new Date(createForm.reserved_end_time)) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
      }
      if (!createForm.vehicle_type && !createForm.vehicle_id) {
        throw new Error('Vui lòng chọn loại xe hoặc xe cụ thể');
      }

      // Prepare data for API (ready for real API)
      const bookingData = {
        station_id: parseInt(createForm.station_id),
        reserved_start_time: createForm.reserved_start_time,
        reserved_end_time: createForm.reserved_end_time
      };

      // Add vehicle selection (either specific vehicle or vehicle type)
      if (createForm.vehicle_id && createForm.vehicle_id !== 'none') {
        bookingData.vehicle_id = parseInt(createForm.vehicle_id);
      } else if (createForm.vehicle_type && createForm.vehicle_type !== 'none') {
        bookingData.vehicle_type = createForm.vehicle_type;
      }

      // Mock successful booking creation (replace with real API call later)
      console.log('Booking data ready for API:', bookingData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful response
      const newReservation = {
        id: Date.now(), // Mock ID
        vehicle_id: bookingData.vehicle_id || null,
        vehicle_type: bookingData.vehicle_type || 'motorbike',
        station_id: bookingData.station_id,
        reserved_start_time: bookingData.reserved_start_time,
        reserved_end_time: bookingData.reserved_end_time,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Add to current reservations
      setReservations(prev => [newReservation, ...prev]);
      
      setSuccess('Tạo booking thành công!');
      setShowCreateModal(false);
      setCreateForm({
        vehicle_id: '',
        vehicle_type: '',
        station_id: '',
        reserved_start_time: '',
        reserved_end_time: ''
      });

      /* 
      // Real API call (enable when API is available):
      const response = await fetch('/api/renter/reservations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo booking');
      }

      const data = await response.json();
      loadReservations(); // Refresh the list
      */

    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Không thể tạo booking. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : `Trạm #${stationId}`;
  };

  const getVehicleInfo = (vehicleId, vehicleType) => {
    if (vehicleId) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      return vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}` : `Xe #${vehicleId}`;
    }
    return vehicleType === 'motorbike' ? 'Xe máy điện' : 'Ô tô điện';
  };

  const getAvailableVehicles = () => {
    if (!createForm.station_id) return [];
    return vehicles.filter(v => v.station_id === parseInt(createForm.station_id));
  };

  const handleViewDetail = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Bạn có chắc muốn hủy đặt chỗ này?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mock cancellation - update status locally
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: 'cancelled' }
            : reservation
        )
      );
      
      setSuccess('Hủy đặt chỗ thành công!');

      /* 
      // Real API call (enable when API is available):
      const response = await apiClient.delete(`/renter/reservations/${reservationId}`);
      if (response.success) {
        setSuccess('Hủy đặt chỗ thành công!');
        loadReservations();
      } else {
        setError(response.message || 'Không thể hủy đặt chỗ. Vui lòng thử lại.');
      }
      */
    } catch (error) {
      console.error('Error canceling reservation:', error);
      setError('Có lỗi xảy ra khi hủy đặt chỗ.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRental = (reservationId) => {
    // Navigate to start rental process
    navigate(`/current-rentals?start=${reservationId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'confirmed': { text: 'Đã xác nhận', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'active': { text: 'Đang thuê', color: 'bg-blue-100 text-blue-700', icon: Car },
      'completed': { text: 'Hoàn thành', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
      'cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle }
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

  const canEdit = (reservation) => {
    return ['pending', 'confirmed'].includes(reservation.status) &&
      new Date(reservation.reserved_start_time) > new Date();
  };

  const canCancel = (reservation) => {
    return ['pending', 'confirmed'].includes(reservation.status) &&
      new Date(reservation.reserved_start_time) > new Date();
  };

  const canStart = (reservation) => {
    const now = new Date();
    const startDate = new Date(reservation.reserved_start_time);
    const timeDiff = startDate - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    return reservation.status === 'confirmed' && hoursDiff <= 1 && hoursDiff >= -0.5;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                Đặt chỗ của tôi
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi các đặt chỗ xe điện
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Tạo booking mới
              </Button>
              <Button
                variant="outline"
                onClick={loadReservations}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng đặt chỗ</p>
                  <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sắp tới</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => new Date(r.start_date) > new Date()).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang thuê</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => r.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Car className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => r.status === 'completed').length}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo xe, mã đặt chỗ..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="active">Đang thuê</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thời gian</SelectItem>
                  <SelectItem value="upcoming">Sắp tới</SelectItem>
                  <SelectItem value="active">Đang diễn ra</SelectItem>
                  <SelectItem value="past">Đã qua</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reservations List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Đang tải danh sách đặt chỗ...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đặt chỗ nào</h3>
              <p className="text-gray-500 mb-4">Bắt đầu hành trình với chiếc xe điện đầu tiên</p>
              <Button onClick={() => navigate('/rental')}>
                <Car className="h-4 w-4 mr-2" />
                Đặt xe ngay
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Car className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getVehicleInfo(reservation.vehicle_id, reservation.vehicle_type)}
                          </h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(reservation.reserved_start_time)} - {formatDate(reservation.reserved_end_time)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{getStationName(reservation.station_id)}</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            <span className="font-medium">Sẽ tính khi thuê xe</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {canStart(reservation) && (
                        <Button
                          onClick={() => handleStartRental(reservation.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Car className="h-4 w-4 mr-1" />
                          Bắt đầu thuê
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(reservation)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                      {canCancel(reservation) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hủy
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết đặt chỗ</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về đặt chỗ #{selectedReservation?.reservation_id}
              </DialogDescription>
            </DialogHeader>

            {selectedReservation && (
              <div className="space-y-6">
                {/* Vehicle Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin xe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tên xe</p>
                        <p className="font-semibold">{getVehicleInfo(selectedReservation.vehicle_id, selectedReservation.vehicle_type)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Biển số</p>
                        <p className="font-semibold">
                          {selectedReservation.vehicle_id ? 
                            vehicles.find(v => v.id === selectedReservation.vehicle_id)?.license_plate || 'N/A' 
                            : 'Chưa xác định'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Loại xe</p>
                        <p className="font-semibold">{selectedReservation.vehicle_type === 'motorbike' ? 'Xe máy' : 'Ô tô'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Số chỗ</p>
                        <p className="font-semibold">{selectedReservation.vehicle_type === 'motorbike' ? '1 người' : '4 người'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chi tiết đặt chỗ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Thời gian nhận</p>
                        <p className="font-semibold">{formatDate(selectedReservation.reserved_start_time)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Thời gian trả</p>
                        <p className="font-semibold">{formatDate(selectedReservation.reserved_end_time)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Điểm nhận</p>
                        <p className="font-semibold">{getStationName(selectedReservation.station_id)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Điểm trả</p>
                        <p className="font-semibold">{getStationName(selectedReservation.station_id)}</p>
                      </div>
                    </div>
                    {selectedReservation.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Ghi chú</p>
                        <p className="font-semibold">{selectedReservation.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chi phí</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Phí thuê xe</span>
                        <span>Chưa tính toán</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí dịch vụ</span>
                        <span>0 ₫</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Tổng cộng</span>
                        <span className="text-green-600">Sẽ tính khi thuê xe</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Booking Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Tạo booking mới
              </DialogTitle>
              <DialogDescription>
                Tạo booking xe điện mới với thông tin chi tiết
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Station Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn trạm <span className="text-red-500">*</span>
                </label>
                <Select
                  value={createForm.station_id}
                  onValueChange={(value) => setCreateForm({ ...createForm, station_id: value, vehicle_id: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạm để đặt xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id.toString()}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Type or Specific Vehicle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại xe
                  </label>
                  <Select
                    value={createForm.vehicle_type || undefined}
                    onValueChange={(value) => setCreateForm({ ...createForm, vehicle_type: value || '', vehicle_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại xe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn cụ thể</SelectItem>
                      <SelectItem value="motorbike">Xe máy</SelectItem>
                      <SelectItem value="car">Ô tô</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xe cụ thể (tùy chọn)
                  </label>
                  <Select
                    value={createForm.vehicle_id || undefined}
                    onValueChange={(value) => setCreateForm({ ...createForm, vehicle_id: value || '' })}
                    disabled={!createForm.station_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xe cụ thể" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn cụ thể</SelectItem>
                      {getAvailableVehicles().map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={createForm.reserved_start_time}
                    onChange={(e) => setCreateForm({ ...createForm, reserved_start_time: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian kết thúc <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={createForm.reserved_end_time}
                    onChange={(e) => setCreateForm({ ...createForm, reserved_end_time: e.target.value })}
                    min={createForm.reserved_start_time || new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Bạn có thể chọn loại xe hoặc xe cụ thể</li>
                      <li>Booking sẽ được xác nhận sau khi tạo thành công</li>
                      <li>Vui lòng đến đúng thời gian để nhận xe</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  disabled={loading || !createForm.station_id || !createForm.reserved_start_time || !createForm.reserved_end_time}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Tạo booking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ReservationsPage;