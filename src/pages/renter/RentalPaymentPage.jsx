import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { 
  ArrowLeft,
  CreditCard,
  Clock,
  MapPin,
  Car,
  CheckCircle,
  AlertCircle,
  Wallet,
  RefreshCw,
  AlertTriangle,
  Receipt
} from 'lucide-react';

const RentalPaymentPage = () => {
  const navigate = useNavigate();
  
  // Use fixed ID or get from localStorage/context instead of useParams
  const id = 123; // Mock rental ID
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rental, setRental] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: '',
    amount: 0
  });

  useEffect(() => {
    if (id) {
      loadRentalData();
    }
  }, [id]);

  const loadRentalData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRental = {
        id: parseInt(id),
        vehicle_id: 1,
        station_pickup_id: 1,
        station_return_id: 2,
        start_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        end_time: new Date().toISOString(),
        status: 'returned',
        vehicle: {
          model: 'VinFast Klara S',
          license_plate: '51F-12345',
          rental_rate: 15000 // per hour
        },
        station_pickup: {
          name: 'Trạm Quận 1',
          address: '123 Nguyễn Huệ, Quận 1'
        },
        station_return: {
          name: 'Trạm Quận 3',
          address: '456 Võ Văn Tần, Quận 3'
        },
        deposit_amount: 500000,
        rental_cost: 60000, // 4 hours * 15000
        additional_fees: 0,
        total_amount: 60000
      };
      
      setRental(mockRental);
      setPaymentForm({
        ...paymentForm,
        amount: mockRental.total_amount
      });
    } catch (err) {
      console.error('Error loading rental data:', err);
      setError('Có lỗi xảy ra khi tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentForm.payment_method) {
      setError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const requestBody = {
        payment_method: paymentForm.payment_method,
        amount: paymentForm.amount
      };

      console.log('Payment request:', requestBody);
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockResponse = {
        status: 200,
        message: 'Thanh toán thành công',
        payment: {
          id: 1,
          rental_id: parseInt(id),
          payment_method: paymentForm.payment_method,
          amount: paymentForm.amount,
          payment_date: new Date().toISOString(),
          status: 'completed'
        }
      };

      setSuccess(mockResponse.message);
      
      setTimeout(() => {
        navigate('/rentals/summary');
      }, 2000);

    } catch (err) {
      console.error('Payment error:', err);
      setError('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateRentalDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours: diffHours, minutes: diffMins, total: diffMs };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            onClick={() => navigate('/rentals/return')}
            variant="ghost"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Wallet className="h-8 w-8 mr-3 text-green-600" />
              Thanh toán
            </h1>
            <p className="text-gray-600 mt-2">
              Hoàn tất thanh toán cho lượt thuê - Rental #{id}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đang tải thông tin thanh toán...
          </h3>
          <p className="text-gray-600">
            Vui lòng chờ một chút
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && !rental && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy thông tin thanh toán
            </h3>
            <p className="text-gray-600 mb-6">
              Lượt thuê với ID #{id} không tồn tại hoặc chưa được trả xe.
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

      {/* Alert Messages */}
      {!loading && rental && error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && rental && success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Rental Summary */}
      {!loading && rental && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-blue-600" />
              Tóm tắt lượt thuê
            </CardTitle>
            <CardDescription>
              Chi tiết về thời gian và địa điểm thuê xe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Vehicle & Time */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Thông tin xe</h4>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Car className="h-4 w-4 mr-2 text-gray-600" />
                    <div>
                      <div className="font-medium">{rental.vehicle.model}</div>
                      <div className="text-sm text-gray-500">{rental.vehicle.license_plate}</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 mr-2 text-gray-600" />
                    <div>
                      <div className="font-medium">
                        {calculateRentalDuration(rental.start_time, rental.end_time).hours}h {calculateRentalDuration(rental.start_time, rental.end_time).minutes}m
                      </div>
                      <div className="text-sm text-gray-500">Thời gian thuê</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stations */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Địa điểm</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-1">
                      <MapPin className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm text-gray-600">Trạm nhận</span>
                    </div>
                    <div className="font-medium">{rental.station_pickup.name}</div>
                    <div className="text-sm text-gray-500">{rental.station_pickup.address}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-1">
                      <MapPin className="h-4 w-4 mr-2 text-red-600" />
                      <span className="text-sm text-gray-600">Trạm trả</span>
                    </div>
                    <div className="font-medium">{rental.station_return.name}</div>
                    <div className="text-sm text-gray-500">{rental.station_return.address}</div>
                  </div>
                </div>
              </div>

              {/* Time Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Thời gian</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Bắt đầu</div>
                    <div className="font-medium">
                      {new Date(rental.start_time).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Kết thúc</div>
                    <div className="font-medium">
                      {new Date(rental.end_time).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Breakdown */}
      {!loading && rental && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
              Chi phí thanh toán
            </CardTitle>
            <CardDescription>
              Breakdown chi tiết các khoản phí
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Phí thuê xe ({calculateRentalDuration(rental.start_time, rental.end_time).hours}h {calculateRentalDuration(rental.start_time, rental.end_time).minutes}m)</span>
                <span className="font-medium">{formatCurrency(rental.rental_cost)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Phí bổ sung</span>
                <span className="font-medium">{formatCurrency(rental.additional_fees)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Tiền cọc (đã thanh toán)</span>
                <span className="font-medium text-green-600">-{formatCurrency(rental.deposit_amount)}</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-lg font-semibold text-blue-900">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-blue-900">{formatCurrency(rental.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Selection */}
      {!loading && rental && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-purple-600" />
              Phương thức thanh toán
            </CardTitle>
            <CardDescription>
              Chọn phương thức thanh toán cho lượt thuê này
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức <span className="text-red-500">*</span>
              </label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) => setPaymentForm({
                  ...paymentForm,
                  payment_method: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phương thức thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Thẻ tín dụng/Ghi nợ
                    </div>
                  </SelectItem>
                  <SelectItem value="e_wallet">
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      Ví điện tử (Momo, ZaloPay, VNPay)
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Chuyển khoản ngân hàng
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selected Payment Method Info */}
            {paymentForm.payment_method && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Phương thức đã chọn</h4>
                <div className="text-purple-800">
                  {paymentForm.payment_method === 'credit_card' && 'Thẻ tín dụng/Ghi nợ'}
                  {paymentForm.payment_method === 'e_wallet' && 'Ví điện tử'}
                  {paymentForm.payment_method === 'bank_transfer' && 'Chuyển khoản ngân hàng'}
                </div>
                <p className="text-sm text-purple-700 mt-1">
                  Số tiền: <strong>{formatCurrency(paymentForm.amount)}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Action */}
      {!loading && rental && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận thanh toán
                </h3>
                <p className="text-gray-600">
                  Kiểm tra thông tin và xác nhận để hoàn tất thanh toán
                </p>
              </div>
              
              <Button
                onClick={handlePayment}
                disabled={submitting || !paymentForm.payment_method}
                size="lg"
                className="min-w-[180px] bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Thanh toán {formatCurrency(paymentForm.amount)}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RentalPaymentPage;
