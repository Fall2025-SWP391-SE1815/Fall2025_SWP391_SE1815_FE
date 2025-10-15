import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Search, 
  Car, 
  Navigation, 
  Phone,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';
import stationService from '@/services/stations/stationService.js';
import vehicleService from '@/services/vehicles/vehicleService.js';

const StationsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Load stations data
  const loadStations = async () => {
    setLoading(true);
    setError('');
    try {
      const [res, vehiclesRes] = await Promise.all([
        stationService.renter.getStations(),
        vehicleService.renter.getAvailableVehicles()
      ]);
      // { id, name, address, status, latitude, longitude }
      const list = Array.isArray(res) ? res : (res?.stations || res?.data || []);
      const vehicles = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
      // aggregate vehicle counts per station
      const stationVehicleMap = {};
      vehicles.forEach(v => {
        const sid = v.station?.id;
        if (!sid) return;
        stationVehicleMap[sid] = stationVehicleMap[sid] || { total: 0, available: 0 };
        stationVehicleMap[sid].total += 1;
        if (v.status === 'available') stationVehicleMap[sid].available += 1;
      });
      const norm = (Array.isArray(list) ? list : []).map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        status: s.status ?? 'active',
        latitude: s.latitude,
        longitude: s.longitude,
        // populate vehicle counts from vehicles API when possible
        total_vehicles: stationVehicleMap[s.id]?.total ?? s.total_vehicles ?? 0,
        available_vehicles: stationVehicleMap[s.id]?.available ?? s.available_vehicles ?? 0,
        operating_hours: s.operating_hours ?? ''
      }));
      setStations(norm);
      if (norm.length === 0) toast.info('Hiện tại chưa có trạm nào được mở');
      else toast.success(`Đã tải ${norm.length} trạm xe điện`);
    } catch (err) {
      console.error('Error loading stations from API:', err);
      setError('Không thể tải danh sách trạm. Vui lòng thử lại sau.');
      toast.error('Lỗi khi tải danh sách trạm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []); // Remove authentication dependency

  // Filter stations based on search term
  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openInMaps = (latitude, longitude, name) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Simple distance calculation (approximate)
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Bảo trì</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-800">Đóng cửa</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Danh sách trạm xe điện
          </h1>
          <p className="text-gray-600">
            Tìm kiếm và xem vị trí các trạm xe điện gần bạn
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên trạm hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={loadStations}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

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
            <span className="ml-2 text-gray-600">Đang tải danh sách trạm...</span>
          </div>
        )}

        {/* Stations Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station) => (
              <Card key={station.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-green-600" />
                      {station.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(station.status)}
                      <Badge variant="outline" className="text-green-700 border-green-200">
                        ID: {station.id}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address */}
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Địa chỉ:</p>
                    <p>{station.address}</p>
                  </div>

                  {/* Vehicle availability */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Xe có sẵn:</p>
                      <p className="text-lg font-bold text-green-600">
                        {station.available_vehicles || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Tổng số xe:</p>
                      <p className="text-lg font-bold text-gray-900">
                        {station.total_vehicles || 0}
                      </p>
                    </div>
                  </div>

                  {/* Distance (mock calculation from city center) */}
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Khoảng cách từ trung tâm:</p>
                    <p>
                      ~{calculateDistance(10.7769, 106.7009, station.latitude, station.longitude)} km
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => openInMaps(station.latitude, station.longitude, station.name)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                      disabled={station.status !== 'active'}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Chỉ đường
                    </Button>
                    <Button
                      onClick={() => {
                        // Navigate to vehicles page with station filter
                        window.location.href = `/vehicles?station_id=${station.id}`;
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={station.status !== 'active' || station.available_vehicles === 0}
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Xem xe ({station.available_vehicles || 0})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredStations.length === 0 && !error && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy trạm nào' : 'Chưa có trạm nào'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại tên trạm'
                : 'Hiện tại chưa có trạm xe điện nào được mở'
              }
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                variant="outline"
                className="mt-4"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Tổng cộng: {filteredStations.length} trạm được hiển thị
            {searchTerm && ` (lọc từ ${stations.length} trạm)`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StationsPage;
