import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Car, 
  Search, 
  Filter, 
  MapPin,
  Zap,
  Calendar,
  DollarSign,
  Users,
  RefreshCw,
  Eye,
  Book,
  Battery,
  Gauge,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import vehicleService from '@/services/vehicles/vehicleService';
import stationService from '@/services/stations/stationService';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api/apiConfig';

const VehiclesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    station_id: '',
    price_min: '',
    price_max: '',
    search: ''
  });

  // Load stations for filter dropdown
  const loadStations = async () => {
    try {
      // use station service renter endpoint
      const data = await stationService.renter.getStations();
      const stationsData = Array.isArray(data) ? data : data?.stations || data?.data || [];
      setStations(stationsData.map(s => ({ id: s.id, name: s.name })));
    } catch (err) {
      console.error('Error loading stations:', err);
      // Keep stations empty on error (remove mock fallback)
      setStations([]);
    }
  };

  // Load vehicles with filters
  const loadVehicles = async () => {
    setLoading(true);
    setError('');

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.station_id && filters.station_id !== 'all') queryParams.append('station_id', filters.station_id);
      if (filters.price_min) queryParams.append('price_min', filters.price_min);
      if (filters.price_max) queryParams.append('price_max', filters.price_max);

      // Build params object for service call
      const params = {};
      if (filters.type && filters.type !== 'all') params.type = filters.type;
      if (filters.station_id && filters.station_id !== 'all') params.station_id = filters.station_id;
      if (filters.price_min) params.price_min = filters.price_min;
      if (filters.price_max) params.price_max = filters.price_max;

      const data = await vehicleService.renter.getAvailableVehicles(params);
      const vehiclesData = Array.isArray(data) ? data : data?.vehicles || data?.data || [];
      const normalized = vehiclesData.map(v => {
        const imageUrl = v.imageUrl ? `${API_BASE_URL}${v.imageUrl}` : null;
        return {
          id: v.id,
          license_plate: v.licensePlate || v.license_plate,
          type: v.type,
          brand: v.brand,
          model: v.model,
          capacity: v.capacity,
          status: v.status,
          price_per_hour: v.pricePerHour || v.price_per_hour,
          station_id: v.station?.id || v.station_id || null,
          station: v.station || null,
          imageUrl: imageUrl,
          batteryType: v.batteryType || v.battery_type,
          batteryLevel: v.batteryLevel || v.battery_level,
          odo: v.odo || v.odo,
          numberSeat: v.numberSeat || v.number_seat,
          rangePerFullCharge: v.rangePerFullCharge || v.range_per_full_charge
        };
      });

      setVehicles(normalized);

      if (normalized.length === 0) {
        toast.info('Không tìm thấy xe nào phù hợp với bộ lọc');
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Không thể tải danh sách xe. Vui lòng thử lại sau.');
      toast.error('Lỗi khi tải danh sách xe');
      // Clear vehicles on error
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize filters from URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters = {
      type: urlParams.get('type') || '',
      station_id: urlParams.get('station_id') || '',
      price_min: urlParams.get('price_min') || '',
      price_max: urlParams.get('price_max') || '',
      search: urlParams.get('search') || ''
    };

    // Only update if there are URL params to avoid unnecessary re-renders
    const hasUrlParams = Object.values(initialFilters).some(value => value !== '');
    if (hasUrlParams) {
      setFilters(initialFilters);
    }

    loadStations();
  }, []); // Remove authentication dependency

  useEffect(() => {
    loadVehicles();
  }, [filters]); // Remove authentication dependency

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.license_plate.toLowerCase().includes(filters.search.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(filters.search.toLowerCase())
  );

  const handleFilterChange = (key, value) => {
    // Convert "all" back to empty string for internal state
    const actualValue = value === 'all' ? '' : value;
    setFilters(prev => ({ ...prev, [key]: actualValue }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      station_id: '',
      price_min: '',
      price_max: '',
      search: ''
    });
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : `Trạm ${stationId}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ/giờ';
  };

  const getVehicleTypeLabel = (type) => {
    return type === 'motorbike' ? 'Xe máy' : 'Ô tô';
  };

  const getBatteryTypeLabel = (type) => {
    const typeMap = {
      'lithium-ion': 'Lithium-ion',
      'Lithium Iron Phosphate': 'Lithium Iron Phosphate',
      'Nickel Manganese Cobalt': 'Nickel Manganese Cobalt',
      'Nickel Cobalt Aluminum': 'Nickel Cobalt Aluminum',
      'lead-acid': 'Lead Acid'
    };
    return typeMap[type] || type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleViewVehicleDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailDialogOpen(true);
  };

  const handleBookVehicle = (vehicle) => {
    // Navigate to booking page with vehicle pre-selected
    const bookingUrl = `/reservations?vehicle_id=${vehicle.id}&station_id=${vehicle.station_id}`;
    window.location.href = bookingUrl;

    // Show feedback to user
    toast.success(`Chuyển đến trang đặt chỗ cho xe ${vehicle.license_plate}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Danh sách xe có sẵn
          </h1>
          <p className="text-gray-600">
            Tìm kiếm và đặt xe điện phù hợp với nhu cầu của bạn
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Bộ lọc tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="xl:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm theo biển số, hãng, model..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <Select value={filters.type || undefined} onValueChange={(value) => handleFilterChange('type', value || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại xe" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="all">Tất cả loại xe</SelectItem>
                  <SelectItem value="motorbike">Xe máy</SelectItem>
                  <SelectItem value="car">Ô tô</SelectItem>
                </SelectContent>
              </Select>

              {/* Station */}
              <Select value={filters.station_id || undefined} onValueChange={(value) => handleFilterChange('station_id', value || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạm" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="all">Tất cả trạm</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Min */}
              <Input
                type="number"
                placeholder="Giá tối thiểu"
                value={filters.price_min}
                onChange={(e) => handleFilterChange('price_min', e.target.value)}
              />

              {/* Price Max */}
              <Input
                type="number"
                placeholder="Giá tối đa"
                value={filters.price_max}
                onChange={(e) => handleFilterChange('price_max', e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
              >
                Xóa bộ lọc
              </Button>

              <Button
                onClick={loadVehicles}
                disabled={loading}
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Đang tải danh sách xe...</span>
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      {vehicle.type === 'motorbike' ? (
                        <Zap className="h-5 w-5 mr-2 text-blue-600" />
                      ) : (
                        <Car className="h-5 w-5 mr-2 text-green-600" />
                      )}
                      {vehicle.license_plate}
                    </span>
                    <Badge
                      variant={vehicle.status === 'available' ? 'default' : 'secondary'}
                      className={vehicle.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {vehicle.status === 'available' ? 'Có sẵn' : 'Không có sẵn'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Vehicle Image */}
                  {vehicle.imageUrl && (
                    <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="11" width="18" height="11" rx="2" ry="2"%3E%3C/rect%3E%3Cpath d="M7 11V7a5 5 0 0 1 10 0v4"%3E%3C/path%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}

                  {/* Vehicle Info */}
                  {/* Vehicle Info */}
                  <div className="space-y-2">{!vehicle.imageUrl && (
                    <div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                      {vehicle.type === 'motorbike' ? (
                        <Zap className="h-12 w-12 text-gray-400" />
                      ) : (
                        <Car className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                  )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Loại xe:</span>
                      <span className="text-sm">{getVehicleTypeLabel(vehicle.type)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Số ghế:</span>
                      <span className="text-sm">{vehicle.numberSeat}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Hãng:</span>
                      <span className="text-sm">{vehicle.brand}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Model:</span>
                      <span className="text-sm">{vehicle.model}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Pin hiện tại:</span>
                      <span className={`text-sm flex items-center ${
                        (vehicle.batteryLevel || 0) > 80 ? 'text-green-600' :
                        (vehicle.batteryLevel || 0) > 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        <Battery className="h-4 w-4 mr-1" />
                        {vehicle.batteryLevel || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Dung lượng pin</span>
                      <span className="text-sm flex items-center">
                        <Zap className="h-4 w-4 mr-1" />
                        {vehicle.capacity} kWh
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Trạm:</span>
                      <span className="text-sm flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {getStationName(vehicle.station_id)}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-lg font-bold text-green-700">
                        {formatPrice(vehicle.price_per_hour)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleBookVehicle(vehicle)}
                      disabled={vehicle.status !== 'available'}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Đặt xe
                    </Button>
                    <Button
                      onClick={() => handleViewVehicleDetail(vehicle)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVehicles.length === 0 && !error && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filters.search || filters.type || filters.station_id || filters.price_min || filters.price_max
                ? 'Không tìm thấy xe nào'
                : 'Chưa có xe nào có sẵn'
              }
            </h3>
            <p className="text-gray-600">
              {filters.search || filters.type || filters.station_id || filters.price_min || filters.price_max
                ? 'Thử điều chỉnh bộ lọc để tìm thấy xe phù hợp'
                : 'Hiện tại chưa có xe nào có sẵn để thuê'
              }
            </p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="mt-4"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Hiển thị {filteredVehicles.length} xe
            {(filters.search || filters.type || filters.station_id || filters.price_min || filters.price_max) &&
              ` (lọc từ ${vehicles.length} xe)`
            }
          </p>
        </div>

        {/* Vehicle Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Chi tiết phương tiện
              </DialogTitle>
            </DialogHeader>

            {selectedVehicle && (
              <div className="space-y-6 pr-2">
                {/* Vehicle Image */}
                {selectedVehicle.imageUrl && (
                  <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      src={selectedVehicle.imageUrl}
                      alt={selectedVehicle.license_plate}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="text-center text-gray-500"><svg class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg><p class="mt-2">Không thể tải ảnh</p></div>';
                      }}
                    />
                  </div>
                )}

                {/* Header với biển số và trạng thái */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedVehicle.license_plate}</h3>
                    <p className="text-muted-foreground">{selectedVehicle.brand} {selectedVehicle.model}</p>
                  </div>
                  <div>
                    <Badge 
                      variant={selectedVehicle.status === 'available' ? 'default' : 'secondary'}
                      className={selectedVehicle.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {selectedVehicle.status === 'available' ? 'Có sẵn' : 'Không có sẵn'}
                    </Badge>
                  </div>
                </div>

                {/* Grid thông tin chi tiết */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Loại xe</p>
                        <p className="font-medium">{getVehicleTypeLabel(selectedVehicle.type)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Số chỗ ngồi</p>
                        <p className="font-medium">{selectedVehicle.numberSeat || 'N/A'} chỗ</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Battery className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Dung lượng pin</p>
                        <p className="font-medium">{selectedVehicle.capacity} kWh</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Loại pin</p>
                        <p className="font-medium">{getBatteryTypeLabel(selectedVehicle.batteryType) || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Quãng đường/sạc đầy</p>
                        <p className="font-medium">{selectedVehicle.rangePerFullCharge} km</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Battery className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Mức pin hiện tại</p>
                        <p className={`font-medium ${
                          (selectedVehicle.batteryLevel || 0) > 80 ? 'text-green-600' :
                          (selectedVehicle.batteryLevel || 0) > 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {selectedVehicle.batteryLevel || 'N/A'}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Gauge className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Odometer</p>
                        <p className="font-medium">{selectedVehicle.odo ? `${selectedVehicle.odo.toLocaleString()} km` : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Giá thuê</p>
                        <p className="font-medium text-lg">{formatCurrency(selectedVehicle.price_per_hour)}/giờ</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Trạm</p>
                        <p className="font-medium">{selectedVehicle.station?.name || getStationName(selectedVehicle.station_id)}</p>
                        {selectedVehicle.station?.address && (
                          <p className="text-sm text-muted-foreground mt-1">{selectedVehicle.station.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin trạm chi tiết */}
                {selectedVehicle.station && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm">Thông tin trạm</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">ID Trạm:</span>
                        <span className="ml-2 font-medium">{selectedVehicle.station.id}</span>
                      </div>
                      {selectedVehicle.station.latitude && selectedVehicle.station.longitude && (
                        <div>
                          <span className="text-muted-foreground">Tọa độ:</span>
                          <span className="ml-2 font-medium">
                            {selectedVehicle.station.latitude.toFixed(5)}, {selectedVehicle.station.longitude.toFixed(5)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      handleBookVehicle(selectedVehicle);
                    }}
                    disabled={selectedVehicle.status !== 'available'}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt xe này
                  </Button>
                  <Button
                    onClick={() => setIsDetailDialogOpen(false)}
                    variant="outline"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VehiclesPage;
