import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Bike, Search, MapPin } from 'lucide-react';
import { getPublicVehicles } from '../../services/public/publicService';
import { useNavigate } from 'react-router-dom';

const PublicVehiclesPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getPublicVehicles();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách xe');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'Available': { label: 'Sẵn sàng', variant: 'success' },
      'Rented': { label: 'Đang thuê', variant: 'warning' },
      'Maintenance': { label: 'Bảo trì', variant: 'secondary' },
      'OutOfService': { label: 'Ngưng hoạt động', variant: 'destructive' }
    };
    const config = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
          <Button onClick={fetchVehicles}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Danh sách xe có sẵn</h1>
        <p className="text-gray-600">Khám phá các loại xe của chúng tôi</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Tìm kiếm theo biển số, model, hãng xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Available">Sẵn sàng</SelectItem>
            <SelectItem value="Rented">Đang thuê</SelectItem>
            <SelectItem value="Maintenance">Bảo trì</SelectItem>
            <SelectItem value="OutOfService">Ngưng hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            Không tìm thấy xe nào
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card key={vehicle.vehicleId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Bike className="text-primary" size={32} />
                  {getStatusBadge(vehicle.status)}
                </div>
                <CardTitle className="text-lg">{vehicle.licensePlate}</CardTitle>
                <CardDescription>
                  {vehicle.manufacturer} {vehicle.model}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {vehicle.year && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Năm sản xuất:</span>
                      <span className="font-semibold">{vehicle.year}</span>
                    </div>
                  )}
                  {vehicle.color && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Màu sắc:</span>
                      <span className="font-semibold">{vehicle.color}</span>
                    </div>
                  )}
                  {vehicle.stationName && (
                    <div className="flex items-start justify-between">
                      <span className="text-gray-600">Trạm:</span>
                      <span className="font-semibold text-right flex-1 ml-2">{vehicle.stationName}</span>
                    </div>
                  )}
                  {vehicle.status === 'Available' && (
                    <Button 
                      className="w-full mt-4"
                      onClick={() => navigate('/login', { state: { from: '/vehicles' } })}
                    >
                      Đăng nhập để thuê
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
            <div className="text-sm text-gray-600">Tổng số xe</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {vehicles.filter(v => v.status === 'Available').length}
            </div>
            <div className="text-sm text-gray-600">Xe sẵn sàng</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {vehicles.filter(v => v.status === 'Rented').length}
            </div>
            <div className="text-sm text-gray-600">Đang được thuê</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {vehicles.filter(v => v.status === 'Maintenance').length}
            </div>
            <div className="text-sm text-gray-600">Đang bảo trì</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVehiclesPage;
