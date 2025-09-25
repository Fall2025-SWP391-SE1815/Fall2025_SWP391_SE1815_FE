import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { 
  ArrowLeft,
  CheckCircle,
  Car,
  Clock,
  MapPin,
  CreditCard,
  FileText,
  Download,
  Star,
  RefreshCw,
  AlertCircle,
  Home,
  Receipt
} from 'lucide-react';

const RentalSummaryPage = () => {
  const navigate = useNavigate();
  
  // Use fixed ID or get from localStorage/context instead of useParams
  const id = 123; // Mock rental ID
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rentalSummary, setRentalSummary] = useState(null);

  useEffect(() => {
    if (id) {
      loadRentalSummary();
    }
  }, [id]);

  const loadRentalSummary = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock GET /api/renter/rentals/:id/summary response
      const mockSummary = {
        rental: {
          id: parseInt(id),
          vehicle_id: 1,
          station_pickup_id: 1,
          station_return_id: 2,
          start_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          status: 'completed',
          vehicle: {
            model: 'VinFast Klara S',
            license_plate: '51F-12345',
            rental_rate: 15000
          },
          station_pickup: {
            name: 'Trạm Quận 1',
            address: '123 Nguyễn Huệ, Quận 1'
          },
          station_return: {
            name: 'Trạm Quận 3',
            address: '456 Võ Văn Tần, Quận 3'
          }
        },
        payment: {
          id: 1,
          rental_id: parseInt(id),
          payment_method: 'credit_card',
          amount: 60000,
          payment_date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        cost_breakdown: {
          rental_cost: 60000,
          additional_fees: 0,
          deposit_amount: 500000,
          total_amount: 60000
        },
        trip_stats: {
          duration_hours: 4,
          duration_minutes: 0,
          distance_km: 12.5
        }
      };
      
      setRentalSummary(mockSummary);
    } catch (err) {
      console.error('Error loading rental summary:', err);
      setError('Có lỗi xảy ra khi tải tóm tắt lượt thuê');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const downloadReceipt = () => {
    // Mock download functionality
    console.log('Downloading receipt for rental', id);
    alert('Tính năng tải hóa đơn sẽ được triển khai sớm');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            onClick={() => navigate('/rental/current')}
            variant="ghost"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="h-8 w-8 mr-3 text-green-600" />
              Hoàn thành
            </h1>
            <p className="text-gray-600 mt-2">
              Tóm tắt lượt thuê - Rental #{id}
            </p>
          </div>
        </div>
        <Button
          onClick={downloadReceipt}
          variant="outline"
          className="hidden md:flex"
        >
          <Download className="h-4 w-4 mr-2" />
          Tải hóa đơn
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đang tải tóm tắt lượt thuê...
          </h3>
          <p className="text-gray-600">
            Vui lòng chờ một chút
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && !rentalSummary && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy thông tin lượt thuê
            </h3>
            <p className="text-gray-600 mb-6">
              Lượt thuê với ID #{id} không tồn tại hoặc chưa hoàn thành.
            </p>
            <Button 
              onClick={() => navigate('/rental/current')}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completion Status */}
      {!loading && rentalSummary && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Lượt thuê đã hoàn thành thành công!</strong> Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
          </AlertDescription>
        </Alert>
      )}

      {/* Trip Summary */}
      {!loading && rentalSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-blue-600" />
              Tóm tắt chuyến đi
            </CardTitle>
            <CardDescription>
              Thông tin chi tiết về lượt thuê vừa hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Trip Stats */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-900">
                  {rentalSummary.trip_stats.duration_hours}h {rentalSummary.trip_stats.duration_minutes}m
                </div>
                <div className="text-sm text-blue-700">Thời gian thuê</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-900">
                  {rentalSummary.trip_stats.distance_km} km
                </div>
                <div className="text-sm text-green-700">Quãng đường</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Car className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-lg font-bold text-orange-900">
                  {rentalSummary.rental.vehicle.model}
                </div>
                <div className="text-sm text-orange-700">{rentalSummary.rental.vehicle.license_plate}</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Receipt className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(rentalSummary.payment.amount)}
                </div>
                <div className="text-sm text-purple-700">Đã thanh toán</div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Chi tiết hành trình</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">Điểm bắt đầu</span>
                  </div>
                  <div className="text-gray-900">{rentalSummary.rental.station_pickup.name}</div>
                  <div className="text-sm text-gray-600">{rentalSummary.rental.station_pickup.address}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(rentalSummary.rental.start_time).toLocaleString('vi-VN')}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-red-600" />
                    <span className="font-medium">Điểm kết thúc</span>
                  </div>
                  <div className="text-gray-900">{rentalSummary.rental.station_return.name}</div>
                  <div className="text-sm text-gray-600">{rentalSummary.rental.station_return.address}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(rentalSummary.rental.end_time).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      {!loading && rentalSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
              Thông tin thanh toán
            </CardTitle>
            <CardDescription>
              Chi tiết thanh toán cho lượt thuê này
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Chi tiết thanh toán</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí thuê xe</span>
                    <span className="font-medium">{formatCurrency(rentalSummary.cost_breakdown.rental_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí bổ sung</span>
                    <span className="font-medium">{formatCurrency(rentalSummary.cost_breakdown.additional_fees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiền cọc (hoàn trả)</span>
                    <span className="font-medium text-green-600">-{formatCurrency(rentalSummary.cost_breakdown.deposit_amount)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng đã thanh toán</span>
                    <span className="text-green-600">{formatCurrency(rentalSummary.payment.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method & Status */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Trạng thái thanh toán</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <div className="font-medium text-green-900">Thanh toán thành công</div>
                      <div className="text-sm text-green-700">
                        {new Date(rentalSummary.payment.payment_date).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Hoàn thành
                    </Badge>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Phương thức thanh toán</div>
                    <div className="font-medium">
                      {rentalSummary.payment.payment_method === 'credit_card' && 'Thẻ tín dụng/Ghi nợ'}
                      {rentalSummary.payment.payment_method === 'e_wallet' && 'Ví điện tử'}
                      {rentalSummary.payment.payment_method === 'bank_transfer' && 'Chuyển khoản ngân hàng'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!loading && rentalSummary && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cảm ơn bạn đã sử dụng dịch vụ!
                </h3>
                <p className="text-gray-600">
                  Hãy để lại đánh giá của bạn để giúp chúng tôi cải thiện dịch vụ.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={downloadReceipt}
                  variant="outline"
                  className="md:hidden"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Tải hóa đơn
                </Button>
                
                <Button
                  onClick={() => navigate('/rental/ratings')}
                  variant="outline"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Đánh giá
                </Button>
                
                <Button
                  onClick={() => navigate('/rental')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Thuê xe mới
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RentalSummaryPage;
