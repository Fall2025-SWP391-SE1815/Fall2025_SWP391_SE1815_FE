// Rental Page - Combined locations and vehicle booking
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import { renterService } from '@/services/renter/renterService.js';
import { mockData } from '@/services/mockData.js';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Phone,
  Clock,
  Car,
  Battery,
  RefreshCw,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Route,
  Zap,
  Users,
  Calendar,
  CreditCard,
  Gauge,
  User
} from 'lucide-react';

const RentalPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('stations');

  // State
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Filters
  const [stationFilters, setStationFilters] = useState({
    search: '',
    status: 'all',
    services: 'all',
    distance: 'all'
  });

  const [vehicleFilters, setVehicleFilters] = useState({
    search: '',
    type: 'all',
    priceRange: 'all',
    capacity: 'all',
    station: searchParams.get('station') || 'all'
  });

  // Booking form
  const [booking, setBooking] = useState({
    vehicle_id: '',
    vehicle_type: '',
    station_id: '',
    reserved_start_time: new Date().toISOString().slice(0, 16),
    reserved_end_time: '',
    status: 'pending'
  });

  // User location
  const [userLocation, setUserLocation] = useState(null);

  // Load data
  useEffect(() => {
    loadData();
    getCurrentLocation();
    
    // Check if station parameter is provided in URL
    const stationParam = searchParams.get('station');
    if (stationParam) {
      setSelectedStation(stationParam);
      setActiveTab('vehicles');
    }
  }, [searchParams]);

  // Filter stations
  useEffect(() => {
    if (!Array.isArray(stations)) {
      setFilteredStations([]);
      return;
    }

    let filtered = [...stations];

    if (stationFilters.search) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(stationFilters.search.toLowerCase()) ||
        station.address.toLowerCase().includes(stationFilters.search.toLowerCase())
      );
    }

    if (stationFilters.status !== 'all') {
      filtered = filtered.filter(station => station.status === stationFilters.status);
    }

    if (stationFilters.services !== 'all') {
      filtered = filtered.filter(station => 
        station.services && station.services.includes(stationFilters.services)
      );
    }

    setFilteredStations(filtered);
  }, [stations, stationFilters]);

  // Filter vehicles
  useEffect(() => {
    let filtered = [...vehicles];

    if (vehicleFilters.search) {
      filtered = filtered.filter(vehicle =>
        vehicle.brand.toLowerCase().includes(vehicleFilters.search.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(vehicleFilters.search.toLowerCase())
      );
    }

    if (vehicleFilters.type !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === vehicleFilters.type);
    }

    if (vehicleFilters.priceRange !== 'all') {
      const [min, max] = vehicleFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(vehicle => {
        const price = vehicle.price_per_hour;
        return max ? (price >= min && price <= max) : price >= min;
      });
    }

    if (vehicleFilters.capacity !== 'all') {
      const capacity = parseInt(vehicleFilters.capacity);
      filtered = filtered.filter(vehicle => vehicle.capacity >= capacity);
    }

    if (vehicleFilters.station !== 'all') {
      const stationId = parseInt(vehicleFilters.station);
      filtered = filtered.filter(vehicle => vehicle.station_id === stationId);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, vehicleFilters]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [stationsResponse, vehiclesResponse] = await Promise.all([
        renterService.stations.getAll(),
        renterService.vehicles.getAvailable()
      ]);

      let stationsData = [];
      if (stationsResponse.success) {
        stationsData = stationsResponse.data.stations || stationsResponse.data || [];
        
        // Enrich stations with staff information
        const enrichedStations = stationsData.map(station => {
          // Find active staff at this station
          const activeStaff = mockData.staffStations
            .filter(ss => ss.station_id === station.id && ss.is_active)
            .map(ss => {
              const staff = mockData.users.find(u => u.id === ss.staff_id);
              return staff ? {
                id: staff.id,
                name: staff.full_name,
                phone: staff.phone,
                email: staff.email,
                assigned_at: ss.assigned_at
              } : null;
            })
            .filter(Boolean);
          
          return {
            ...station,
            staff: activeStaff,
            staff_count: activeStaff.length
          };
        });
        setStations(enrichedStations);
      } else {
        console.error('Failed to load stations:', stationsResponse);
      }

      if (vehiclesResponse.success) {
        const vehiclesData = vehiclesResponse.data.vehicles || vehiclesResponse.data || [];
        const vehiclesWithStations = vehiclesData.map(vehicle => {
          const station = stationsData.find(s => s.id === vehicle.station_id);
          return {
            ...vehicle,
            station_name: station ? station.name : 'Trạm không xác định',
            station_address: station ? station.address : ''
          };
        });
        setVehicles(vehiclesWithStations);
      } else {
        console.error('Failed to load vehicles:', vehiclesResponse);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          // Silent error handling
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 600000
        }
      );
    }
  };

  const calculateDistance = (station) => {
    if (!userLocation || !station.latitude || !station.longitude) return null;
    
    const R = 6371;
    const dLat = (station.latitude - userLocation.lat) * Math.PI / 180;
    const dLon = (station.longitude - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(station.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const handleViewStationVehicles = (station) => {
    setVehicleFilters({...vehicleFilters, station: station.id.toString()});
    setActiveTab('vehicles');
  };

  const handleBookVehicle = (vehicle) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    setSelectedVehicle(vehicle);
    setBooking({
      ...booking,
      vehicle_id: vehicle.id,
      vehicle_type: vehicle.type,
      station_id: vehicle.station_id
    });
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!booking.reserved_end_time) {
      setError('Vui lòng chọn thời gian trả xe.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await renterService.reservations.create({
        ...booking,
        renter_id: user.id
      });

      if (response.success) {
        setSuccess('Đặt xe thành công! Bạn có thể xem chi tiết trong mục "Đặt chỗ".');
        setShowBookingModal(false);
        setSelectedVehicle(null);
        setBooking({
          vehicle_id: '',
          vehicle_type: '',
          station_id: '',
          reserved_start_time: new Date().toISOString().slice(0, 16),
          reserved_end_time: '',
          status: 'pending'
        });
      } else {
        setError('Không thể đặt xe. Vui lòng thử lại.');
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi đặt xe.');
    } finally {
      setLoading(false);
    }
  };

  const calculateRentalCost = () => {
    if (!selectedVehicle || !booking.reserved_start_time || !booking.reserved_end_time) return 0;
    
    const start = new Date(booking.reserved_start_time);
    const end = new Date(booking.reserved_end_time);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    return hours * selectedVehicle.price_per_hour;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { text: 'Hoạt động', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'available': { text: 'Khả dụng', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'rented': { text: 'Đang thuê', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'maintenance': { text: 'Bảo trì', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
      'inactive': { text: 'Tạm ngưng', color: 'bg-red-100 text-red-700', icon: XCircle }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleGetDirections = (station) => {
    if (station.latitude && station.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
      window.open(url, '_blank');
    }
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
                Thuê xe điện
              </h1>
              <p className="text-gray-600 mt-1">
                Tìm trạm và đặt xe phù hợp cho chuyến đi của bạn
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={getCurrentLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Vị trí của tôi
              </Button>
              <Button
                variant="outline"
                onClick={loadData}
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

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stations" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Tìm trạm ({filteredStations.length})
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Chọn xe ({filteredVehicles.length})
            </TabsTrigger>
          </TabsList>

          {/* Stations Tab */}
          <TabsContent value="stations" className="space-y-6">
            {/* Station Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Tìm kiếm trạm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm theo tên, địa chỉ..."
                      value={stationFilters.search}
                      onChange={(e) => setStationFilters({...stationFilters, search: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                  <Select 
                    value={stationFilters.status} 
                    onValueChange={(value) => setStationFilters({...stationFilters, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="maintenance">Bảo trì</SelectItem>
                      <SelectItem value="inactive">Tạm ngưng</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={stationFilters.services} 
                    onValueChange={(value) => setStationFilters({...stationFilters, services: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                      <SelectItem value="charging">Sạc xe</SelectItem>
                      <SelectItem value="maintenance">Bảo dưỡng</SelectItem>
                      <SelectItem value="24h">Mở 24/7</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={stationFilters.distance} 
                    onValueChange={(value) => setStationFilters({...stationFilters, distance: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Khoảng cách" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả khoảng cách</SelectItem>
                      <SelectItem value="1">Trong vòng 1km</SelectItem>
                      <SelectItem value="5">Trong vòng 5km</SelectItem>
                      <SelectItem value="10">Trong vòng 10km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stations List */}
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Đang tải danh sách trạm...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredStations.map((station) => (
                  <Card key={station.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{station.name}</h3>
                            {getStatusBadge(station.status)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {station.address}
                          </div>
                          {userLocation && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Route className="h-4 w-4 mr-1" />
                              Cách {calculateDistance(station)} km
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {station.rating || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Station Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{station.available_vehicles || 0} xe khả dụng</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Zap className="h-4 w-4 mr-2 text-green-600" />
                          <span>{station.charging_stations || 0} điểm sạc</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{station.operating_hours || '24/7'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 text-blue-600" />
                          <span>{station.staff_count || 0} nhân viên</span>
                        </div>
                      </div>

                      {/* Staff Information */}
                      {station.staff && station.staff.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Nhân viên trực:</h4>
                          <div className="space-y-1">
                            {station.staff.map((staff) => (
                              <div key={staff.id} className="flex items-center justify-between text-lg">
                                <span className="text-blue-700 font-medium">{staff.name}</span>
                                <span className="text-blue-600">{staff.phone}</span>
                                <span className="text-blue-600">{staff.email}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleViewStationVehicles(station)}
                          disabled={station.status !== 'active' || station.available_vehicles === 0}
                          className="flex-1"
                        >
                          <Car className="h-4 w-4 mr-2" />
                          Xem xe có sẵn
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleGetDirections(station)}
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Chỉ đường
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            {/* Vehicle Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Lọc xe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm theo tên, model..."
                      value={vehicleFilters.search}
                      onChange={(e) => setVehicleFilters({...vehicleFilters, search: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                  <Select 
                    value={vehicleFilters.type} 
                    onValueChange={(value) => setVehicleFilters({...vehicleFilters, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Loại xe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      <SelectItem value="xe máy">Xe máy điện</SelectItem>
                      <SelectItem value="ô tô">Ô tô điện</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={vehicleFilters.priceRange} 
                    onValueChange={(value) => setVehicleFilters({...vehicleFilters, priceRange: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Giá thuê" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả giá</SelectItem>
                      <SelectItem value="0-50000">&lt; 50.000 VND/h</SelectItem>
                      <SelectItem value="50000-100000">50k - 100k VND/h</SelectItem>
                      <SelectItem value="100000-200000">100k - 200k VND/h</SelectItem>
                      <SelectItem value="200000">&gt; 200.000 VND/h</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={vehicleFilters.capacity} 
                    onValueChange={(value) => setVehicleFilters({...vehicleFilters, capacity: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Số chỗ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="1">1 người</SelectItem>
                      <SelectItem value="2">2 người</SelectItem>
                      <SelectItem value="4">4 người</SelectItem>
                      <SelectItem value="7">7 người</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={vehicleFilters.station} 
                    onValueChange={(value) => setVehicleFilters({...vehicleFilters, station: value})}
                  >
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
                </div>
              </CardContent>
            </Card>

            {/* Vehicles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <Car className="h-16 w-16 text-gray-400" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        {getStatusBadge(vehicle.status)}
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>{vehicle.type} - {vehicle.license_plate}</p>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <div>
                            <div>{vehicle.station_name}</div>
                            {vehicle.station_address && (
                              <div className="text-xs text-gray-500 mt-0.5">{vehicle.station_address}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-600" />
                          <span>{vehicle.capacity} chỗ</span>
                        </div>
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-green-600" />
                          <span>{vehicle.energy_type}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {formatPrice(vehicle.price_per_hour)}
                          </p>
                          <p className="text-xs text-gray-500">per hour</p>
                        </div>
                        <Button 
                          onClick={() => handleBookVehicle(vehicle)}
                          disabled={vehicle.status !== 'available'}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Đặt xe
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Đặt xe: {selectedVehicle?.brand} {selectedVehicle?.model}</DialogTitle>
              <DialogDescription>
                Điền thông tin để hoàn tất đặt xe
              </DialogDescription>
            </DialogHeader>
            
            {selectedVehicle && (
              <div className="space-y-4">
                {/* Vehicle Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Car className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{selectedVehicle.brand} {selectedVehicle.model}</h4>
                        <p className="text-sm text-gray-600">{selectedVehicle.type} - {selectedVehicle.license_plate}</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(selectedVehicle.price_per_hour)}/giờ
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Thời gian nhận xe *
                    </label>
                    <Input
                      type="datetime-local"
                      value={booking.reserved_start_time}
                      onChange={(e) => setBooking({...booking, reserved_start_time: e.target.value})}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Thời gian trả xe *
                    </label>
                    <Input
                      type="datetime-local"
                      value={booking.reserved_end_time}
                      onChange={(e) => setBooking({...booking, reserved_end_time: e.target.value})}
                      min={booking.reserved_start_time}
                    />
                  </div>
                </div>

                {/* Cost Summary */}
                {booking.reserved_start_time && booking.reserved_end_time && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Tổng chi phí dự kiến</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatPrice(calculateRentalCost())}
                          </p>
                        </div>
                        <CreditCard className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBookingModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleConfirmBooking}
                    disabled={loading || !booking.reserved_end_time}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Xác nhận đặt xe
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">{stations.length}</h3>
              <p className="text-sm text-gray-600">Tổng số trạm</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900">
                {stations.filter(s => s.status === 'active').length}
              </h3>
              <p className="text-sm text-gray-600">Trạm hoạt động</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Car className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900">{vehicles.length}</h3>
              <p className="text-sm text-gray-600">Tổng số xe</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'available').length}
              </h3>
              <p className="text-sm text-gray-600">Xe khả dụng</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RentalPage;