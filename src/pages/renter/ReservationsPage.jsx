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
import stationService from '@/services/stations/stationService';
import vehicleService from '@/services/vehicles/vehicleService';
import {
  Calendar,
  Car,
  MapPin,
  Clock,
  CreditCard,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  const [reservationDetail, setReservationDetail] = useState(null); // raw detail from API
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create booking form
  const [createForm, setCreateForm] = useState({
    id: '',
    type: '',
    station_id: '',
    resreservedStartTime: '',
    reservedEndTime: ''
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
        reservation.id?.toString().includes(filters.search.toLowerCase()) ||
        (reservation.vehicle?.type || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (reservation.vehicle?.station?.id?.toString() || '').includes(filters.search.toLowerCase())
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
          filtered = filtered.filter(reservation => new Date(reservation.reservedStartTime) > now);
          break;
        case 'past':
          filtered = filtered.filter(reservation => new Date(reservation.reservedEndTime) < now);
          break;
        case 'active':
          filtered = filtered.filter(reservation =>
            new Date(reservation.reservedStartTime) <= now && new Date(reservation.reservedEndTime) >= now
          );
          break;
        default:
          break;
      }
    }

    setFilteredReservations(filtered);
  }, [reservations, filters]);

  // Whenever filters (status/date/search) change, request server-side filtered data as well
  useEffect(() => {
    const serverParams = {};
    if (filters.status && filters.status !== 'all') serverParams.status = filters.status.toUpperCase();
    if (filters.search && /^[0-9]+$/.test(filters.search.trim())) serverParams.vehicleId = parseInt(filters.search.trim());
    // date filters (startFrom/startTo) could be added via UI later
    // Call server with selected params
    loadReservations(serverParams);
  }, [filters]);

  /**
   * Load reservations from server.
   * Accepts optional server filter params: { status, vehicleId, startFrom, startTo }
   */
  const loadReservations = async (serverParams = {}) => {
    setLoading(true);
    setError('');
    try {
      // Build params from UI filters if not explicitly provided
      const params = { ...serverParams };
      if (!params.status && filters.status && filters.status !== 'all') {
        params.status = filters.status.toUpperCase(); // API expects uppercase enums
      }
      // If search term is numeric, treat as vehicleId
      if (!params.vehicleId && filters.search && /^[0-9]+$/.test(filters.search.trim())) {
        params.vehicleId = parseInt(filters.search.trim());
      }

      const res = await renterService.reservations.getAll(params);
      const data = Array.isArray(res) ? res : res?.data || res?.reservations || res || [];
      // Lưu trực tiếp response, ẩn các booking cancelled
      const withoutCancelled = data.filter(item => String(item.status).toLowerCase() !== 'cancelled');
      setReservations(withoutCancelled);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('Không thể tải danh sách đặt chỗ. Vui lòng thử lại.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load stations and vehicles for booking
  const loadStationsAndVehicles = async () => {
    try {
      const stationsRes = await stationService.renter.getStations();
      const stationsData = Array.isArray(stationsRes) ? stationsRes : stationsRes?.data || stationsRes?.stations || [];
      setStations(stationsData.map(s => ({ id: s.id, name: s.name })));

      const vehiclesRes = await vehicleService.renter.getAvailableVehicles();
      const vehiclesData = Array.isArray(vehiclesRes) ? vehiclesRes : vehiclesRes?.data || vehiclesRes?.vehicles || [];
      const normalizedVehicles = vehiclesData.map(v => ({
        id: v.id,
        license_plate: v.licensePlate || v.license_plate,
        type: (v.type || '').toLowerCase(),
        brand: v.brand,
        model: v.model,
        station_id: v.station?.id || v.station_id || null
      }));
      setVehicles(normalizedVehicles);
    } catch (err) {
      console.error('Error loading stations/vehicles:', err);
      setStations([]);
      setVehicles([]);
    }
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!createForm.reserved_start_time || !createForm.reserved_end_time) {
        throw new Error('Vui lòng chọn thời gian');
      }
      if (new Date(createForm.reserved_start_time) >= new Date(createForm.reserved_end_time)) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
      }
      if (!createForm.vehicle_id || createForm.vehicle_id === 'none') {
        throw new Error('Vui lòng chọn xe cụ thể');
      }

      // Payload theo Swagger
      const payload = {
        vehicleId: parseInt(createForm.vehicle_id),
        reservedStartTime: new Date(createForm.reserved_start_time).toISOString(),
        reservedEndTime: new Date(createForm.reserved_end_time).toISOString()
      };

      const res = await renterService.reservations.create(payload);
      const created = res?.data || res || {};

      // Normalize returned reservation to local shape
      const newReservation = {
        id: created.id,
        vehicle_id: created.vehicle?.id || created.vehicleId || null,
        vehicle_type: (created.vehicle?.type || created.vehicleType || '').toLowerCase(),
        station_id: created.vehicle?.station?.id || created.stationId || null,
        reserved_start_time: created.reservedStartTime || created.reserved_start_time,
        reserved_end_time: created.reservedEndTime || created.reserved_end_time,
        status: created.status,
        created_at: created.createdAt || created.created_at
      };

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

      // Using renterService.reservations.create to call the real API (above block was a raw fetch example)

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

  const getVehicleInfo = (vehicle) => {
    if (!vehicle) return 'Xe điện';
    return `${vehicle.brand || ''} ${vehicle.model || ''} - ${vehicle.licensePlate || ''}`.trim();
  };

  const getAvailableVehicles = () => {
    if (!createForm.stationid) return [];
    return vehicles.filter(v => v.station_id === parseInt(createForm.stationid));
  };

  const handleViewDetail = async (reservation) => {
    try {
      // Lấy chi tiết mới nhất từ API theo ID
      const res = await renterService.reservations.getById(reservation.id);
      const r = res?.data || res;
      setReservationDetail(r);
      const normalized = {
        id: r.id,
        vehicle_id: r.vehicle?.id || r.vehicleId || null,
        vehicle_type: (r.vehicle?.type || r.vehicleType || r.vehicle_type || reservation.vehicle_type || '').toLowerCase(),
        station_id: r.vehicle?.station?.id || r.stationId || r.station_id || reservation.station_id || null,
        reserved_start_time: r.reservedStartTime || r.reserved_start_time || reservation.reserved_start_time,
        reserved_end_time: r.reservedEndTime || r.reserved_end_time || reservation.reserved_end_time,
        status: (r.status || reservation.status || '').toLowerCase(),
        notes: r.notes || reservation.notes || undefined
      };
      setSelectedReservation(normalized);
    } catch (e) {
      // Fallback dùng dữ liệu từ danh sách nếu API lỗi
      setSelectedReservation(reservation);
      setReservationDetail(null);
    } finally {
      setShowDetailModal(true);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Bạn có chắc muốn hủy đặt chỗ này?')) return;
    const reason = prompt('Vui lòng nhập lý do hủy (tuỳ chọn):', '');

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call real API to cancel reservation with optional reason
      await renterService.reservations.cancel(reservationId, reason || undefined);
      // Loại bỏ ngay trong danh sách để UI phản hồi tức thời
      setReservations(prev => prev.filter(r => r.id !== reservationId));
      setSuccess('Hủy đặt chỗ thành công!');
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
      new Date(reservation.reservedStartTime) > new Date();
  };

  const canCancel = (reservation) => {
    return ['pending', 'confirmed'].includes(reservation.status) &&
      new Date(reservation.reservedStartTime) > new Date();
  };

  const canStart = (reservation) => {
    const now = new Date();
    const startDate = new Date(reservation.reservedStartTime);
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
                            {getVehicleInfo(reservation.vehicle)}
                          </h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(reservation.reservedStartTime)} - {formatDate(reservation.reservedEndTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{reservation.vehicle?.station?.name || getStationName(reservation.vehicle?.station?.id)}</span>
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
                Thông tin chi tiết về đặt chỗ #{reservationDetail?.id}
              </DialogDescription>
            </DialogHeader>

            {reservationDetail && (
              <div className="space-y-6">
                {/* Vehicle Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin xe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Biển số</p>
                        <p className="font-semibold">{reservationDetail.vehicle?.licensePlate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Loại xe</p>
                        <p className="font-semibold">{reservationDetail.vehicle?.type === 'MOTORBIKE' ? 'Xe máy' : 'Ô tô'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Hãng/Model</p>
                        <p className="font-semibold">{reservationDetail.vehicle?.brand} {reservationDetail.vehicle?.model}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Dung lượng pin</p>
                        <p className="font-semibold">{reservationDetail.vehicle?.capacity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Quãng đường/1 lần sạc</p>
                        <p className="font-semibold">{reservationDetail.vehicle?.rangePerFullCharge}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Giá/giờ</p>
                        <p className="font-semibold">{reservationDetail.vehicle?.pricePerHour?.toLocaleString('vi-VN')} ₫</p>
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
                        <p className="font-semibold">{formatDate(reservationDetail.reservedStartTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Thời gian trả</p>
                        <p className="font-semibold">{formatDate(reservationDetail.reservedEndTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Điểm nhận</p>
                        <p className="font-semibold">{reservationDetail.vehicle?.station?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Điểm trả</p>
                        <p className="font-semibold">{reservationDetail.vehicle?.station?.name}</p>
                      </div>
                      {reservationDetail && (
                        <>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                            <p className="font-semibold">{reservationDetail.status}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Tạo lúc</p>
                            <p className="font-semibold">{formatDate(reservationDetail.createdAt)}</p>
                          </div>
                          {reservationDetail.cancelledBy && (
                            <div className="col-span-2">
                              <p className="text-sm font-medium text-gray-600">Hủy bởi</p>
                              <p className="font-semibold">{reservationDetail.cancelledBy} — {reservationDetail.cancelledReason || 'Không rõ lý do'}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

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
                    disabled={!createForm.station_id || getAvailableVehicles().length === 0}
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