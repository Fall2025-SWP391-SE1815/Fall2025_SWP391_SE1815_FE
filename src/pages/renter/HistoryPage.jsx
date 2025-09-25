import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Calendar,
  Car,
  Clock,
  MapPin,
  CreditCard,
  Search,
  Filter,
  Eye,
  RefreshCw,
  History,
  AlertCircle
} from 'lucide-react';

const HistoryPage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rentals, setRentals] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadRentalHistory();
  }, []);

  useEffect(() => {
    filterRentals();
  }, [rentals, searchTerm, statusFilter, dateFilter]);

  const loadRentalHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock GET /api/renter/rentals response
      const mockResponse = {
        rentals: [
          {
            id: 1,
            vehicle_id: 1,
            start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2h later
            status: 'completed',
            vehicle: { model: 'VinFast Klara S', license_plate: '51F-12345' },
            total_cost: 45000,
            total_distance: 8.5
          },
          {
            id: 2,
            vehicle_id: 2,
            start_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
            end_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            vehicle: { model: 'VinFast Theon S', license_plate: '51F-67890' },
            total_cost: 37500,
            total_distance: 6.2
          },
          {
            id: 3,
            vehicle_id: 1,
            start_time: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
            end_time: null, // Ongoing rental
            status: 'cancelled',
            vehicle: { model: 'VinFast Klara S', license_plate: '51F-12345' },
            total_cost: 0,
            total_distance: 0
          },
          {
            id: 4,
            vehicle_id: 3,
            start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            end_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            vehicle: { model: 'VinFast Evo 200', license_plate: '51F-11111' },
            total_cost: 67500,
            total_distance: 12.8
          }
        ]
      };
      
      setRentals(mockResponse.rentals);
    } catch (err) {
      console.error('Error loading rental history:', err);
      setError('Có lỗi xảy ra khi tải lịch sử thuê xe');
    } finally {
      setLoading(false);
    }
  };

  const filterRentals = () => {
    let filtered = [...rentals];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rental => 
        rental.vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.id.toString().includes(searchTerm)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rental => rental.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(rental => {
        const rentalDate = new Date(rental.start_time);
        const diffDays = Math.floor((now - rentalDate) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          case 'quarter': return diffDays <= 90;
          default: return true;
        }
      });
    }
    
    setFilteredRentals(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      case 'in_use':
        return <Badge className="bg-blue-100 text-blue-800">Đang sử dụng</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewDetail = (rentalId) => {
    navigate(`/rental-detail/${rentalId}`);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <History className="h-8 w-8 mr-3 text-blue-600" />
            Lịch sử thuê xe
          </h1>
          <p className="text-gray-600 mt-2">
            Xem lại các lượt thuê xe đã thực hiện
          </p>
        </div>
        
        <Button
          onClick={loadRentalHistory}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Tìm kiếm và lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Tìm theo biển số, model hoặc ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="in_use">Đang sử dụng</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
                <SelectItem value="week">7 ngày qua</SelectItem>
                <SelectItem value="month">30 ngày qua</SelectItem>
                <SelectItem value="quarter">3 tháng qua</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              variant="outline"
            >
              Xóa lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đang tải lịch sử thuê xe...
          </h3>
        </div>
      )}

      {/* Rental History List */}
      {!loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Danh sách lượt thuê ({filteredRentals.length})
            </h2>
          </div>

          {filteredRentals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không có lịch sử thuê xe
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? 'Không tìm thấy lượt thuê nào phù hợp với bộ lọc.'
                    : 'Bạn chưa có lượt thuê xe nào. Hãy bắt đầu thuê xe ngay!'
                  }
                </p>
                <Button onClick={() => navigate('/vehicles')}>
                  <Car className="h-4 w-4 mr-2" />
                  Thuê xe ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRentals.map((rental) => (
                <Card key={rental.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Car className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {rental.vehicle.model}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {rental.vehicle.license_plate} • Rental #{rental.id}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(rental.status)}
                        <Button
                          onClick={() => handleViewDetail(rental.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Chi tiết
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Ngày thuê</div>
                          <div>{new Date(rental.start_time).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Thời gian</div>
                          <div>{formatDuration(rental.start_time, rental.end_time)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Quãng đường</div>
                          <div>{rental.total_distance ? `${rental.total_distance} km` : 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">Tổng chi phí</div>
                          <div className="font-semibold text-green-600">
                            {formatCurrency(rental.total_cost)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
