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
      // Always use mock data for development since API is not available
      console.log('Loading stations with mock data...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for development
      const mockStations = [
        {
          id: 1,
          name: 'Trạm D1 - ĐHQG TP.HCM',
          address: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM',
          latitude: 10.7626,
          longitude: 106.6820,
          total_vehicles: 15,
          available_vehicles: 8,
          status: 'active',
          operating_hours: '06:00 - 22:00'
        },
        {
          id: 2,
          name: 'Trạm Quận 1 - Nguyễn Huệ',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          latitude: 10.7769,
          longitude: 106.7009,
          total_vehicles: 20,
          available_vehicles: 12,
          status: 'active',
          operating_hours: '24/7'
        },
        {
          id: 3,
          name: 'Trạm Quận 3 - Võ Văn Tần',
          address: '456 Võ Văn Tần, Quận 3, TP.HCM',
          latitude: 10.7829,
          longitude: 106.6928,
          total_vehicles: 12,
          available_vehicles: 5,
          status: 'active',
          operating_hours: '06:00 - 22:00'
        },
        {
          id: 4,
          name: 'Trạm Bình Thạnh - Xô Viết Nghệ Tĩnh',
          address: '789 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',
          latitude: 10.8017,
          longitude: 106.7148,
          total_vehicles: 18,
          available_vehicles: 10,
          status: 'active',
          operating_hours: '06:00 - 22:00'
        },
        {
          id: 5,
          name: 'Trạm Quận 7 - Phú Mỹ Hưng',
          address: '101 Nguyễn Văn Linh, Quận 7, TP.HCM',
          latitude: 10.7308,
          longitude: 106.7191,
          total_vehicles: 25,
          available_vehicles: 15,
          status: 'active',
          operating_hours: '24/7'
        },
        {
          id: 6,
          name: 'Trạm Thủ Đức - ĐHQG',
          address: 'Khu phố 6, Linh Trung, Thủ Đức, TP.HCM',
          latitude: 10.8700,
          longitude: 106.8034,
          total_vehicles: 14,
          available_vehicles: 7,
          status: 'maintenance',
          operating_hours: '07:00 - 21:00'
        }
      ];

      setStations(mockStations);
      
      if (mockStations.length === 0) {
        toast.info('Hiện tại chưa có trạm nào được mở');
      } else {
        toast.success(`Đã tải ${mockStations.length} trạm xe điện`);
      }
    } catch (err) {
      console.error('Error loading stations:', err);
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

  // Remove authentication check since it's handled by ProtectedRoute
  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <Card className="w-96">
  //         <CardHeader>
  //           <CardTitle>Cần đăng nhập</CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <p className="text-gray-600">Vui lòng đăng nhập để xem danh sách trạm.</p>
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

                  {/* Operating hours */}
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Giờ hoạt động:
                    </p>
                    <p>{station.operating_hours || 'Không xác định'}</p>
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