import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import renterService from '@/services/renter/renterService.js';
import stationService from '@/services/stations/stationService';
import vehicleService from '@/services/vehicles/vehicleService';
import { API_BASE_URL } from '@/lib/api/apiConfig';
import { Calendar, Car, MapPin, Clock, CreditCard, Trash2, Eye, RefreshCw, Search, Filter, CheckCircle, XCircle, AlertCircle, User, Phone, Mail, Shield, ShieldCheck, ShieldX, Battery, BatteryLow } from 'lucide-react';
import { calculateRentalCost, formatCurrency } from '@/utils/pricing';
import { toast } from 'sonner';

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
  const [reservationDetail, setReservationDetail] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create booking form
  const [createForm, setCreateForm] = useState({
    vehicle_id: '',
    vehicle_type: '',
    station_id: '',
    reserved_start_time: '',
    reserved_end_time: '',
    hasInsurance: false
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

      if (selectedVehicle) {
        // Pre-fill form with vehicle selection
        setCreateForm(prev => ({
          ...prev,
          vehicle_id: vehicleId,
          station_id: stationId,
          vehicle_type: selectedVehicle.type?.toLowerCase() || ''
        }));

        // Auto-open create modal
        setShowCreateModal(true);

        // Clear query parameters from URL after processing
        navigate('/reservations', { replace: true });
      }
    }
  }, [searchParams, navigate, vehicles]); // Add vehicles dependency

  // Filter reservations
  useEffect(() => {
    let filtered = [...reservations];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(reservation =>
        reservation.id?.toString().includes(filters.search.toLowerCase()) ||
        reservation.vehicle?.brand?.toLowerCase().includes(filters.search.toLowerCase()) ||
        reservation.vehicle?.licensePlate?.toLowerCase().includes(filters.search.toLowerCase()) ||
        reservation.vehicle?.station?.name?.toLowerCase().includes(filters.search.toLowerCase())
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
        station_id: v.station?.id || v.station_id || null,
        pricePerHour: v.pricePerHour || 0
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
      
      // Check minimum rental duration (4 hours)
      const startTime = new Date(createForm.reserved_start_time);
      const endTime = new Date(createForm.reserved_end_time);
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      
      if (durationHours < 4) {
        throw new Error('Thời gian thuê tối thiểu là 4 giờ. Vui lòng chọn lại thời gian.');
      }
      
      if (!createForm.vehicle_id || createForm.vehicle_id === 'none') {
        throw new Error('Vui lòng chọn xe cụ thể');
      }

      // Check if user already has an active reservation
      const activeReservations = reservations.filter(reservation => 
        ['pending', 'confirmed'].includes(reservation.status) &&
        new Date(reservation.reservedStartTime || reservation.reserved_start_time) > new Date()
      );
      
      if (activeReservations.length > 0) {
        throw new Error('Bạn đã có lịch hẹn đang chờ hoặc đã xác nhận. Vui lòng hủy lịch cũ trước khi tạo lịch mới.');
      }

      // Java LocalDateTime format: YYYY-MM-DDTHH:mm:ss (không có timezone)
      const formatLocalDateTime = (dateTimeString) => {
        return dateTimeString + ':00';
      };

      // Calculate insurance based on vehicle type
      let insuranceValue = null;
      if (createForm.hasInsurance) {
        const selectedVehicle = vehicles.find(v => v.id === parseInt(createForm.vehicle_id));
        if (selectedVehicle) {
          insuranceValue = selectedVehicle.type === 'car' ? 400000 : 100000;
        }
      }

      const payload = {
        vehicleId: parseInt(createForm.vehicle_id),
        reservedStartTime: formatLocalDateTime(createForm.reserved_start_time),
        reservedEndTime: formatLocalDateTime(createForm.reserved_end_time)
      };

      // Add insurance if selected
      if (insuranceValue !== null) {
        payload.insurance = insuranceValue;
      }

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
        reserved_end_time: '',
        hasInsurance: false
      });

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
    if (!createForm.station_id || !vehicles || vehicles.length === 0) return [];
    
    let filtered = vehicles.filter(v => 
      v && 
      v.station_id === parseInt(createForm.station_id) &&
      v.id && 
      v.license_plate
    );
    
    // Filter by vehicle type if selected
    if (createForm.vehicle_type && createForm.vehicle_type !== 'none') {
      filtered = filtered.filter(v => v.type === createForm.vehicle_type);
    }
    
    return filtered;
  };

  const getSelectedVehicleInfo = () => {
    if (!createForm.vehicle_id || !vehicles || vehicles.length === 0) return null;
    return vehicles.find(v => v && v.id === parseInt(createForm.vehicle_id)) || null;
  };

  const getInsuranceValue = () => {
    const selectedVehicle = getSelectedVehicleInfo();
    if (!selectedVehicle || !selectedVehicle.type) return 0;
    return selectedVehicle.type === 'car' ? 400000 : 100000;
  };

  const getRentalDuration = () => {
    if (!createForm.reserved_start_time || !createForm.reserved_end_time) return 0;
    const startTime = new Date(createForm.reserved_start_time);
    const endTime = new Date(createForm.reserved_end_time);
    return (endTime - startTime) / (1000 * 60 * 60); // Return hours
  };

  const isValidRentalDuration = () => {
    return getRentalDuration() >= 4;
  };

  // Validate that start time is not in the past
  const isValidStartTime = () => {
    if (!createForm.reserved_start_time) return true;
    const startTime = new Date(createForm.reserved_start_time);
    const now = new Date();
    return startTime >= now;
  };

  // Validate that end time is after start time
  const isValidEndTime = () => {
    if (!createForm.reserved_start_time || !createForm.reserved_end_time) return true;
    const startTime = new Date(createForm.reserved_start_time);
    const endTime = new Date(createForm.reserved_end_time);
    return endTime > startTime;
  };

  const handleViewDetail = async (reservation) => {
    try {
      // Lấy chi tiết mới nhất từ API theo ID
      const res = await renterService.reservations.getById(reservation.id);
      const r = res?.data || res;
      setReservationDetail(r);

      // Map API response to normalized format
      const normalized = {
        id: r.id,
        vehicle_id: r.vehicle?.id,
        vehicle_type: r.vehicle?.type?.toLowerCase() || '',
        station_id: r.vehicle?.station?.id,
        reservedStartTime: r.reservedStartTime,
        reservedEndTime: r.reservedEndTime,
        status: r.status?.toLowerCase() || '',
        createdAt: r.createdAt,
        cancelledBy: r.cancelledBy,
        cancelledReason: r.cancelledReason,
        insurance: r.insurance, // Thêm trường insurance từ API
        // Keep vehicle and renter info for display
        vehicle: r.vehicle,
        renter: r.renter
      };
      setSelectedReservation(normalized);
    } catch (e) {
      console.error('Error loading reservation detail:', e);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'confirmed': { text: 'Đã xác nhận', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'expired': { text: 'Hết hạn', color: 'bg-red-100 text-red-700', icon: XCircle },
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

  const canCancel = (reservation) => {
    return reservation.status === 'pending' &&
      new Date(reservation.reservedStartTime || reservation.reserved_start_time) > new Date();
  };

  const hasActiveReservation = () => {
    return reservations.some(reservation => 
      ['pending', 'confirmed'].includes(reservation.status) &&
      new Date(reservation.reservedStartTime || reservation.reserved_start_time) > new Date()
    );
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
                disabled={hasActiveReservation()}
                className={`${hasActiveReservation() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                title={hasActiveReservation() ? 'Bạn đã có lịch hẹn đang chờ hoặc đã xác nhận' : ''}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Tạo lịch hẹn mới
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
        
        {/* Active Reservation Warning */}
        {hasActiveReservation() && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Bạn đã có lịch hẹn đang chờ hoặc đã xác nhận. Vui lòng hủy lịch cũ trước khi tạo lịch mới.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    {reservations.filter(r => new Date(r.reservedStartTime || r.reserved_start_time) > new Date()).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
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
                <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="all" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã xác nhận</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Thời gian" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="all" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Tất cả thời gian</SelectItem>
                  <SelectItem value="upcoming" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Sắp tới</SelectItem>
                  <SelectItem value="active" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đang diễn ra</SelectItem>
                  <SelectItem value="past" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã qua</SelectItem>
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
              <Button onClick={() => navigate('/stations')}>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết đặt chỗ</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về đặt chỗ #{selectedReservation?.id}
              </DialogDescription>
            </DialogHeader>

            {selectedReservation && (
              <div className="space-y-6">
                {/* Vehicle Image */}
                {selectedReservation.vehicle?.imageUrl && (
                  <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={selectedReservation.vehicle.imageUrl.startsWith('http')
                        ? selectedReservation.vehicle.imageUrl
                        : `${API_BASE_URL}${selectedReservation.vehicle.imageUrl}`
                      }
                      alt={`${selectedReservation.vehicle?.brand} ${selectedReservation.vehicle?.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Vehicle Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin xe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Biển số</p>
                        <p className="font-semibold">{selectedReservation.vehicle?.licensePlate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Loại xe</p>
                        <p className="font-semibold">
                          {selectedReservation.vehicle?.type === 'MOTORBIKE' ? 'Xe máy điện' :
                            selectedReservation.vehicle?.type === 'CAR' ? 'Ô tô điện' :
                              selectedReservation.vehicle?.type || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Hãng/Model</p>
                        <p className="font-semibold">
                          {selectedReservation.vehicle?.brand} {selectedReservation.vehicle?.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Số chỗ ngồi</p>
                        <p className="font-semibold">{selectedReservation.vehicle?.numberSeat || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Dung lượng pin</p>
                        <p className="font-semibold">{selectedReservation.vehicle?.capacity || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Loại pin</p>
                        <p className="font-semibold">{selectedReservation.vehicle?.batteryType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Mức pin hiện tại</p>
                        <p className="font-semibold">
                          <span className={`inline-flex items-center ${
                            selectedReservation.vehicle?.batteryLevel >= 80 ? 'text-green-600' :
                            selectedReservation.vehicle?.batteryLevel >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {selectedReservation.vehicle?.batteryLevel || 'N/A'}%
                            {selectedReservation.vehicle?.batteryLevel && (
                              selectedReservation.vehicle.batteryLevel >= 50 ? 
                                <Battery className="w-4 h-4 ml-1" /> : 
                                <BatteryLow className="w-4 h-4 ml-1" />
                            )}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Số km đã đi</p>
                        <p className="font-semibold">
                          {selectedReservation.vehicle?.odo ? 
                            `${selectedReservation.vehicle.odo.toLocaleString('vi-VN')} km` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Quãng đường/1 lần sạc</p>
                        <p className="font-semibold">{selectedReservation.vehicle?.rangePerFullCharge || 'N/A'} km</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Giá/giờ</p>
                        <p className="font-semibold">
                          {selectedReservation.vehicle?.pricePerHour ?
                            `${selectedReservation.vehicle.pricePerHour.toLocaleString('vi-VN')} ₫` : 'N/A'}
                        </p>
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
                        <p className="font-semibold">{formatDate(selectedReservation.reservedStartTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Thời gian trả</p>
                        <p className="font-semibold">{formatDate(selectedReservation.reservedEndTime)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-600">Điểm nhận/trả xe</p>
                        <p className="font-semibold">{selectedReservation.vehicle?.station?.name || 'N/A'}</p>
                        {selectedReservation.vehicle?.station?.address && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {selectedReservation.vehicle.station.address}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                        <div className="font-semibold">{getStatusBadge(selectedReservation.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tạo lúc</p>
                        <p className="font-semibold">{formatDate(selectedReservation.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Bảo hiểm</p>
                        <div className="font-semibold">
                          {selectedReservation.insurance ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600 flex items-center">
                                <ShieldCheck className="w-4 h-4 mr-1" />
                                Có mua
                              </span>
                              <span className="text-sm text-gray-500">
                                ({selectedReservation.insurance.toLocaleString('vi-VN')} ₫)
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 flex items-center">
                              <ShieldX className="w-4 h-4 mr-1" />
                              Không mua
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedReservation.cancelledBy && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-600">Hủy bởi</p>
                          <p className="font-semibold text-red-600">
                            {selectedReservation.cancelledBy}
                            {selectedReservation.cancelledReason && ` — ${selectedReservation.cancelledReason}`}
                          </p>
                        </div>
                      )}
                      {selectedReservation.renter && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-600">Thông tin người đặt</p>
                          <div className="font-semibold space-y-1">
                            <p className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              {selectedReservation.renter.fullName}
                            </p>
                            <p className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              {selectedReservation.renter.phone}
                            </p>
                            <p className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {selectedReservation.renter.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chi phí dự tính</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(() => {
                        const startTime = new Date(selectedReservation.reservedStartTime);
                        const endTime = new Date(selectedReservation.reservedEndTime);
                        const totalHours = (endTime - startTime) / (1000 * 60 * 60);
                        const pricePerHour = selectedReservation.vehicle?.pricePerHour || 0;
                        
                        if (pricePerHour === 0) {
                          return (
                            <div className="text-center py-4 text-gray-500">
                              Chưa có thông tin giá cho xe này
                            </div>
                          );
                        }

                        const pricing = calculateRentalCost(totalHours, pricePerHour);

                        return (
                          <>
                            {/* Chi tiết từng bậc giá */}
                            {pricing.breakdown.map((tier, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{tier.description}</span>
                                <div className="text-right">
                                  {tier.discount > 0 ? (
                                    <>
                                      <div className="line-through text-gray-400 text-xs">
                                        {formatCurrency(tier.originalCost)}
                                      </div>
                                      <div className="text-green-600 font-medium">
                                        {formatCurrency(tier.finalCost)}
                                      </div>
                                    </>
                                  ) : (
                                    <span>{formatCurrency(tier.finalCost)}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            {/* Tổng cộng trước bảo hiểm */}
                            {pricing.discountAmount > 0 && (
                              <div className="flex justify-between text-sm border-t pt-2">
                                <span className="text-green-600">💰 Tiết kiệm được</span>
                                <span className="text-green-600 font-medium">
                                  -{formatCurrency(pricing.discountAmount)}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Phí dịch vụ</span>
                              <span>0 ₫</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span>Bảo hiểm ({selectedReservation.vehicle?.type === 'MOTORBIKE' ? 'Xe máy' : 'Ô tô'})</span>
                              <span className={selectedReservation.insurance ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                                {selectedReservation.insurance ? 
                                  formatCurrency(selectedReservation.insurance) : 
                                  'Không mua bảo hiểm'
                                }
                              </span>
                            </div>
                            
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                              <span>Tổng cộng (dự tính)</span>
                              <span className="text-green-600">
                                {formatCurrency(pricing.totalCost + (selectedReservation.insurance || 0))}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-2">
                              * Chi phí thực tế sẽ được tính dựa trên thời gian sử dụng thực tế và chi phí phát sinh (nếu có).
                              {pricing.discountAmount > 0 && (
                                <><br />* Áp dụng giảm giá theo thời gian thuê dài hạn.</>
                              )}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Booking Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Tạo lịch hẹn mới
              </DialogTitle>
              <DialogDescription>
                Tạo lịch hẹn xe điện mới với thông tin chi tiết
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Selected Vehicle Info (if pre-selected from VehiclesPage) */}
                  {createForm.vehicle_id && getSelectedVehicleInfo() && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="font-medium text-green-800 mb-2">Xe đã chọn:</h4>
                      <div className="text-sm text-green-700">
                        <p><strong>Biển số:</strong> {getSelectedVehicleInfo()?.license_plate || 'N/A'}</p>
                        <p><strong>Loại xe:</strong> {getSelectedVehicleInfo()?.brand || ''} {getSelectedVehicleInfo()?.model || ''}</p>
                      </div>
                    </div>
                  )}

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
                      <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                        {stations.map((station) => (
                          <SelectItem key={station.id} value={station.id.toString()}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vehicle Type */}
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
                      <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="none" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Không chọn cụ thể</SelectItem>
                        <SelectItem value="motorbike" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Xe máy</SelectItem>
                        <SelectItem value="car" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Ô tô</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specific Vehicle */}
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
                      <SelectValue placeholder={
                        !createForm.station_id 
                          ? "Chọn trạm trước" 
                          : createForm.vehicle_type && createForm.vehicle_type !== 'none'
                            ? `Chọn ${createForm.vehicle_type === 'car' ? 'ô tô' : 'xe máy'} cụ thể`
                            : "Chọn xe cụ thể"
                      } />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                      <SelectItem value="none">Không chọn cụ thể</SelectItem>
                      {getAvailableVehicles().length === 0 && createForm.station_id ? (
                        <div className="px-3 py-2 text-sm text-gray-500 cursor-default">
                          {createForm.vehicle_type && createForm.vehicle_type !== 'none' 
                            ? `Không có ${createForm.vehicle_type === 'car' ? 'ô tô' : 'xe máy'} nào tại trạm này`
                            : 'Không có xe nào tại trạm này'
                          }
                        </div>
                      ) : (
                        getAvailableVehicles().map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.license_plate} - {vehicle.brand} {vehicle.model} ({vehicle.type === 'car' ? 'Ô tô' : 'Xe máy'})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {createForm.station_id && createForm.vehicle_type && createForm.vehicle_type !== 'none' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Hiển thị {getAvailableVehicles().length} xe {createForm.vehicle_type === 'car' ? 'ô tô' : 'máy'} tại trạm này
                    </p>
                  )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Time Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời gian bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="datetime-local"
                        value={createForm.reserved_start_time}
                        onChange={(e) => {
                          const newStartTime = e.target.value;
                          const newForm = { ...createForm, reserved_start_time: newStartTime };
                          
                          // If end time is before the new start time, clear it
                          if (createForm.reserved_end_time && newStartTime && 
                              new Date(createForm.reserved_end_time) <= new Date(newStartTime)) {
                            newForm.reserved_end_time = '';
                          }
                          
                          setCreateForm(newForm);
                        }}
                        min={new Date().toISOString().slice(0, 16)}
                        className={`${!isValidStartTime() ? 'border-red-300 focus:border-red-500' : ''}`}
                      />
                      {createForm.reserved_start_time && !isValidStartTime() && (
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                          <span className="mr-1">⚠</span>
                          Không thể chọn thời gian trong quá khứ
                        </p>
                      )}
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
                        className={`${!isValidEndTime() ? 'border-red-300 focus:border-red-500' : ''}`}
                      />
                      {createForm.reserved_end_time && !isValidEndTime() && (
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                          <span className="mr-1">⚠</span>
                          Thời gian kết thúc phải sau thời gian bắt đầu
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Insurance Option */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="insurance"
                        checked={createForm.hasInsurance}
                        onCheckedChange={(checked) => setCreateForm({ ...createForm, hasInsurance: checked })}
                      />
                      <div className="flex-1">
                        <label htmlFor="insurance" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Bảo hiểm (tuỳ chọn)
                        </label>
                        <p className="text-xs text-gray-500">
                          {getSelectedVehicleInfo() && getSelectedVehicleInfo().type ? (
                            <span>
                              Phí bảo hiểm: {getInsuranceValue().toLocaleString('vi-VN')} ₫
                              {getSelectedVehicleInfo().type === 'car' ? ' (Ô tô)' : ' (Xe máy)'}
                            </span>
                          ) : (
                            'Vui lòng chọn xe để xem phí bảo hiểm'
                          )}
                        </p>
                      </div>
                    </div>
                    {createForm.hasInsurance && getSelectedVehicleInfo() && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                          <div className="text-sm text-blue-700">
                            <p className="font-medium">Bảo hiểm đã được chọn</p>
                            <p>Chi phí: {getInsuranceValue().toLocaleString('vi-VN')} VND</p>
                            <p className="text-xs mt-1">
                              Bảo hiểm sẽ bao gồm các trường hợp hỏng hóc không do lỗi của người thuê.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>



              {/* Duration and Time Validation */}
              {createForm.reserved_start_time && createForm.reserved_end_time && (
                <div className={`border rounded-lg p-3 ${
                  isValidRentalDuration() && isValidStartTime() && isValidEndTime() 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      isValidRentalDuration() && isValidStartTime() && isValidEndTime() ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div className="text-sm">
                      <p className={`font-medium ${
                        isValidRentalDuration() && isValidStartTime() && isValidEndTime() ? 'text-green-700' : 'text-red-700'
                      }`}>
                        Thời gian thuê: {getRentalDuration().toFixed(1)} giờ
                      </p>
                      
                      {/* Time validation messages */}
                      {!isValidStartTime() && (
                        <p className="text-red-600 text-xs mt-1">
                          ⚠ Thời gian bắt đầu không thể ở quá khứ
                        </p>
                      )}
                      {!isValidEndTime() && isValidStartTime() && (
                        <p className="text-red-600 text-xs mt-1">
                          ⚠ Thời gian kết thúc phải sau thời gian bắt đầu
                        </p>
                      )}
                      
                      {/* Duration validation messages */}
                      {isValidStartTime() && isValidEndTime() && (
                        <>
                          {isValidRentalDuration() ? (
                            <p className="text-green-600 text-xs mt-1">
                              ✓ Đủ thời gian tối thiểu (4 giờ)
                            </p>
                          ) : (
                            <p className="text-red-600 text-xs mt-1">
                              ⚠ Thời gian thuê tối thiểu là 4 giờ. Còn thiếu {(4 - getRentalDuration()).toFixed(1)} giờ.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}



              {/* Cost Preview */}
              {createForm.reserved_start_time && createForm.reserved_end_time && getSelectedVehicleInfo() && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Tổng chi phí dự tính</h4>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const totalHours = getRentalDuration();
                      const selectedVehicle = getSelectedVehicleInfo();
                      const pricePerHour = selectedVehicle?.pricePerHour || 0;
                      const insuranceCost = createForm.hasInsurance ? getInsuranceValue() : 0;

                      if (pricePerHour === 0) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm">
                              ⚠ Chưa có thông tin giá cho xe này
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Vui lòng liên hệ để biết thêm chi tiết về giá thuê
                            </p>
                          </div>
                        );
                      }

                      const pricing = calculateRentalCost(totalHours, pricePerHour);

                      return (
                        <>
                          {/* Hiển thị breakdown giá theo bậc */}
                          {pricing.breakdown.map((tier, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{tier.description}</span>
                              <div className="text-right">
                                {tier.discount > 0 ? (
                                  <>
                                    <div className="line-through text-gray-400 text-xs">
                                      {formatCurrency(tier.originalCost)}
                                    </div>
                                    <div className="text-green-600 font-medium">
                                      {formatCurrency(tier.finalCost)}
                                    </div>
                                  </>
                                ) : (
                                  <span>{formatCurrency(tier.finalCost)}</span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Hiển thị tiết kiệm nếu có */}
                          {pricing.discountAmount > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded p-2 flex justify-between">
                              <span className="text-green-700 font-medium">💰 Bạn tiết kiệm được</span>
                              <span className="text-green-600 font-bold">
                                -{formatCurrency(pricing.discountAmount)}
                              </span>
                            </div>
                          )}

                          {/* Bảo hiểm */}
                          {createForm.hasInsurance && (
                            <div className="flex justify-between">
                              <span>Bảo hiểm</span>
                              <span>{formatCurrency(insuranceCost)}</span>
                            </div>
                          )}

                          {/* Tổng cộng */}
                          <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-medium text-base">
                            <span>Tổng cộng</span>
                            <span className="text-green-600">
                              {formatCurrency(pricing.totalCost + insuranceCost)}
                            </span>
                          </div>

                          {/* Hiển thị giá gốc nếu có giảm giá */}
                          {pricing.discountAmount > 0 && (
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Giá gốc (không giảm giá)</span>
                              <span className="line-through">
                                {formatCurrency(pricing.originalCost + insuranceCost)}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Đây là ước tính, chi phí thực tế có thể khác tùy theo thời gian sử dụng.
                    {getRentalDuration() >= 4 && (
                      <><br />* Áp dụng giảm giá theo thời gian thuê: 4h (5%), 8h (7.5%), 12h (10%), 24h+ (12.5%)</>
                    )}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  disabled={
                    loading || 
                    !createForm.station_id || 
                    !createForm.reserved_start_time || 
                    !createForm.reserved_end_time ||
                    !isValidRentalDuration() ||
                    !isValidStartTime() ||
                    !isValidEndTime()
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Tạo
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
