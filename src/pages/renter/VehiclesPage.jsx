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
  Book
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';

const VehiclesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
      const response = await fetch('/api/renter/stations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStations(data.stations || []);
      }
    } catch (err) {
      console.error('Error loading stations:', err);
      // Mock stations for development
      setStations([
        { id: 1, name: 'Trạm Quận 1' },
        { id: 2, name: 'Trạm Quận 3' },
        { id: 3, name: 'Trạm Bình Thạnh' }
      ]);
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

      const url = `/api/renter/vehicles${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setVehicles(data.vehicles || []);
      
      if (data.vehicles?.length === 0) {
        toast.info('Không tìm thấy xe nào phù hợp với bộ lọc');
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Không thể tải danh sách xe. Vui lòng thử lại sau.');
      toast.error('Lỗi khi tải danh sách xe');
      
      // Mock data for development
      setVehicles([
        {
          id: 1,
          license_plate: '59A1-12345',
          type: 'motorbike',
          brand: 'VinFast',
          model: 'VF3',
          capacity: 2,
          status: 'available',
          price_per_hour: 50000,
          station_id: 1
        },
        {
          id: 2,
          license_plate: '59A1-67890',
          type: 'car',
          brand: 'VinFast',
          model: 'VF5',
          capacity: 5,
          status: 'available',
          price_per_hour: 120000,
          station_id: 1
        },
        {
          id: 3,
          license_plate: '59A1-11111',
          type: 'motorbike',
          brand: 'VinFast',
          model: 'VF3',
          capacity: 2,
          status: 'available',
          price_per_hour: 45000,
          station_id: 2
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    // Navigate to booking page with vehicle pre-selected
    const bookingUrl = `/reservations?vehicle_id=${vehicle.id}&station_id=${vehicle.station_id}`;
    window.location.href = bookingUrl;
  };

  // Remove authentication check since it's handled by ProtectedRoute
  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <Card className="w-96">
  //         <CardHeader>
  //           <CardTitle>Cần đăng nhập</CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <p className="text-gray-600">Vui lòng đăng nhập để xem danh sách xe.</p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

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
                      <span className="text-sm font-medium text-gray-700">Sức chứa:</span>
                      <span className="text-sm flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {vehicle.capacity} người
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
                      onClick={() => {
                        toast.info('Tính năng xem chi tiết đang được phát triển');
                      }}
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
      </div>
    </div>
  );
};

export default VehiclesPage;