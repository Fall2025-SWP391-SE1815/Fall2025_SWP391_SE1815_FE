import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { renterService } from '../../../services/renter/renterService';
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
      const response = await renterService.rentals.getAll();
      const rentals = Array.isArray(response) ? response : response.data || [];
      setRentals(rentals);
    } catch (err) {
      console.error('Error loading rental history:', err);

      if (err.response?.status === 401) {
        setError('Vui lòng đăng nhập để xem lịch sử thuê xe');
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền truy cập tính năng này');
      } else if (err.response?.status === 404) {
        setError('Không tìm thấy dữ liệu lịch sử thuê xe');
      } else {
        setError('Có lỗi xảy ra khi tải lịch sử thuê xe. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterRentals = () => {
    let filtered = [...rentals];

    if (searchTerm) {
      filtered = filtered.filter(
        (rental) =>
          rental.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rental.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rental.id.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((rental) => rental.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((rental) => {
        const rentalDate = new Date(rental.startTime);
        const diffDays = Math.floor((now - rentalDate) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case 'quarter':
            return diffDays <= 90;
          default:
            return true;
        }
      });
    }

    setFilteredRentals(filtered);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'N/A';
    const diffMs = new Date(endTime) - new Date(startTime);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'returned':
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewDetail = (rental) => {
    navigate(`/rental-detail/${rental.id}`, { state: { rentalData: rental } });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <History className="h-8 w-8 mr-3 text-blue-600" />
            Lịch sử thuê xe
          </h1>
          <p className="text-gray-600 mt-2">Xem lại các lượt thuê xe đã thực hiện</p>
        </div>

        <Button onClick={loadRentalHistory} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Tìm kiếm & Lọc
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
                <SelectItem value="returned">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="in_use">Đang sử dụng</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
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

      {/* Thông báo lỗi */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Danh sách */}
      {!loading && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách lượt thuê ({filteredRentals.length})
          </h2>

          {filteredRentals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có lịch sử thuê xe</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Không tìm thấy lượt thuê nào phù hợp với bộ lọc.'
                    : 'Bạn chưa có lượt thuê xe nào. Hãy bắt đầu thuê xe ngay!'}
                </p>
                <Button onClick={() => navigate('/vehicles')}>
                  <Car className="h-4 w-4 mr-2" />
                  Thuê xe ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRentals.map((rental) => (
              <Card key={rental.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Car className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {rental.vehicle?.brand} {rental.vehicle?.model}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {rental.vehicle?.licensePlate} • Rental #{rental.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(rental.status)}
                      <Button onClick={() => handleViewDetail(rental)} variant="outline" size="sm">
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
                        <div>{new Date(rental.startTime).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">Thời gian</div>
                        <div>{formatDuration(rental.startTime, rental.endTime)}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">Quãng đường</div>
                        <div>{rental.totalDistance ? `${rental.totalDistance} km` : 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">Tổng chi phí</div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(rental.totalCost)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {(rental.stationPickup || rental.stationReturn || rental.rentalType) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                        {rental.stationPickup && (
                          <div>
                            <span className="font-medium">Trạm lấy xe:</span> {rental.stationPickup.name}
                          </div>
                        )}
                        {rental.stationReturn && (
                          <div>
                            <span className="font-medium">Trạm trả xe:</span> {rental.stationReturn.name}
                          </div>
                        )}
                        {rental.rentalType && (
                          <div>
                            <span className="font-medium">Loại thuê:</span>{' '}
                            {rental.rentalType === 'booking' ? 'Đặt trước' : rental.rentalType}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
