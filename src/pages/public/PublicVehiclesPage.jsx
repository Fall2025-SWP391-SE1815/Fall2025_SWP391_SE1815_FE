import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import publicService from '@/services/public/publicService';
import { API_BASE_URL } from '@/lib/api/apiConfig';

const PublicVehiclesPage = () => {
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

  const loadStations = async () => {
    try {
      const data = await publicService.getPublicStations();
      const stationsData = Array.isArray(data) ? data : data?.data || [];
      setStations(stationsData.map(s => ({ id: s.id, name: s.name })));
    } catch (err) {
      console.error('Error loading stations:', err);
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

      const data = await publicService.getPublicVehicles(params);
      const vehiclesData = Array.isArray(data) ? data : data?.data || [];
      const normalized = vehiclesData.map(v => ({
        id: v.id,
        license_plate: v.licensePlate || v.license_plate,
        type: v.type,
        brand: v.brand,
        model: v.model,
        capacity: v.capacity,
        rangePerFullCharge: v.rangePerFullCharge,
        status: v.status,
        price_per_hour: v.pricePerHour || v.price_per_hour,
        station_id: v.station?.id || v.station_id || null,
        station: v.station || null,
        imageUrl: v.imageUrl
      }));

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

  const handleBookVehicle = (vehicle) => {
    toast.info('Vui lòng đăng nhập để đặt xe');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  const handleViewDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailDialogOpen(true);
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
                <SelectContent>
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
                <SelectContent>
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
                        src={`${API_BASE_URL}${vehicle.imageUrl}`}
                        alt={vehicle.license_plate}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Vehicle Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Loại xe:</span>
                      <span className="text-sm">{getVehicleTypeLabel(vehicle.type)}</span>
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
                      <span className="text-sm font-medium text-gray-700">Dung lượng:</span>
                      <span className="text-sm flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {vehicle.capacity} pin
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
                      onClick={() => handleViewDetail(vehicle)}
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
              <div className="space-y-6">
                {/* Vehicle Image */}
                {selectedVehicle.imageUrl && (
                  <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={`${API_BASE_URL}${selectedVehicle.imageUrl}`}
                      alt={selectedVehicle.license_plate}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(`${API_BASE_URL}${selectedVehicle.imageUrl}`, '_blank')}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Header with license plate and status */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedVehicle.license_plate}</h3>
                    <p className="text-muted-foreground">{selectedVehicle.brand} {selectedVehicle.model}</p>
                  </div>
                  <Badge 
                    variant={selectedVehicle.status === 'available' ? 'default' : 'secondary'}
                    className={selectedVehicle.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {selectedVehicle.status === 'available' ? 'Có sẵn' : 'Không có sẵn'}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {selectedVehicle.type === 'motorbike' ? (
                        <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                      ) : (
                        <Car className="h-5 w-5 text-green-600 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Loại xe</p>
                        <p className="font-medium">{getVehicleTypeLabel(selectedVehicle.type)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Dung lượng pin</p>
                        <p className="font-medium">{selectedVehicle.capacity} kWh</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Quãng đường di chuyển</p>
                        <p className="font-medium">{selectedVehicle.rangePerFullCharge} km</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Trạm</p>
                        <p className="font-medium">{selectedVehicle.station?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{selectedVehicle.station?.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Giá thuê</p>
                        <p className="font-medium text-green-600 text-lg">
                          {formatPrice(selectedVehicle.price_per_hour)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      handleBookVehicle(selectedVehicle);
                    }}
                    disabled={selectedVehicle.status !== 'available'}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt xe ngay
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

export default PublicVehiclesPage;
