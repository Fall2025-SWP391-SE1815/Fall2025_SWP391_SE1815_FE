import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MapPin, Search, Navigation } from 'lucide-react';
import { getPublicStations } from '../../services/public/publicService';

const PublicStationsPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const data = await getPublicStations();
      setStations(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách trạm');
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations.filter(station =>
    station.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
        <div className="text-center mt-4">
          <Button onClick={fetchStations}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Danh sách trạm xe</h1>
        <p className="text-gray-600">Khám phá các trạm xe của chúng tôi</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Tìm kiếm trạm theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStations.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            Không tìm thấy trạm nào
          </div>
        ) : (
          filteredStations.map((station) => (
            <Card key={station.stationId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{station.stationName}</CardTitle>
                    <CardDescription className="flex items-start gap-2">
                      <MapPin className="mt-1 flex-shrink-0" size={16} />
                      <span>{station.address}</span>
                    </CardDescription>
                  </div>
                  <Badge variant={station.status === 'Active' ? 'success' : 'secondary'}>
                    {station.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng số xe:</span>
                    <span className="font-semibold">{station.totalVehicles || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Xe sẵn sàng:</span>
                    <span className="font-semibold text-green-600">{station.availableVehicles || 0}</span>
                  </div>
                  {station.latitude && station.longitude && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => window.open(`https://www.google.com/maps?q=${station.latitude},${station.longitude}`, '_blank')}
                    >
                      <Navigation className="mr-2" size={16} />
                      Xem trên bản đồ
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicStationsPage;
