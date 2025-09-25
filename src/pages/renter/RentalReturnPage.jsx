import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  ArrowLeft,
  Car,
  MapPin,
  Battery,
  CheckCircle,
  AlertCircle,
  Navigation,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const RentalReturnPage = () => {
  const navigate = useNavigate();
  
  // Use fixed ID or get from localStorage/context instead of useParams
  const id = 123; // Mock rental ID
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rental, setRental] = useState(null);
  const [returnForm, setReturnForm] = useState({
    station_return_id: ''
  });
  const [stations, setStations] = useState([]);

  useEffect(() => {
    if (id) {
      loadRentalData();
      loadStations();
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
        start_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'in_use',
        vehicle: {
          model: 'VinFast Klara S',
          license_plate: '51F-12345',
          battery_level: 45
        },
        station_pickup: {
          name: 'Trạm Quận 1',
          address: '123 Nguyễn Huệ, Quận 1'
        },
        deposit_amount: 500000
      };
      
      setRental(mockRental);
    } catch (err) {
      console.error('Error loading rental data:', err);
      setError('Có lỗi xảy ra khi tải thông tin lượt thuê');
    } finally {
      setLoading(false);
    }
  };

  const loadStations = () => {
    setStations([
      { id: 1, name: 'Trạm Quận 1', address: '123 Nguyễn Huệ, Quận 1', available_slots: 5 },
      { id: 2, name: 'Trạm Quận 3', address: '456 Võ Văn Tần, Quận 3', available_slots: 8 },
      { id: 3, name: 'Trạm Thủ Đức', address: '789 Võ Văn Ngân, Thủ Đức', available_slots: 12 }
    ]);
  };

  const handleReturnVehicle = async () => {
    if (!returnForm.station_return_id) {
      setError('Vui lòng chọn trạm trả xe');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const requestBody = {
        station_return_id: parseInt(returnForm.station_return_id)
      };

      console.log('Return request:', requestBody);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResponse = {
        status: 200,
        message: 'Trả xe thành công',
        rental: {
          id: parseInt(id),
          end_time: new Date().toISOString(),
          station_return_id: parseInt(returnForm.station_return_id),
          staff_return_id: 1,
          status: 'returned'
        }
      };

      setSuccess(mockResponse.message);
      
      setTimeout(() => {
        navigate('/rentals/payment');
      }, 2000);

    } catch (err) {
      console.error('Return error:', err);
      setError('Có lỗi xảy ra khi trả xe. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateRentalDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === parseInt(stationId));
    return station ? station.name : 'N/A';
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
              <Navigation className="h-8 w-8 mr-3 text-orange-600" />
              Trả xe
            </h1>
            <p className="text-gray-600 mt-2">
              Hoàn tất lượt thuê và trả xe tại trạm - Rental #{id}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đang tải thông tin lượt thuê...
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
              Không tìm thấy lượt thuê
            </h3>
            <p className="text-gray-600 mb-6">
              Lượt thuê với ID #{id} không tồn tại hoặc đã kết thúc.
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

      {/* Current Rental Summary */}
      {!loading && rental && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-blue-600" />
              Thông tin lượt thuê hiện tại
            </CardTitle>
            <CardDescription>
              Chi tiết về xe đang thuê và thời gian sử dụng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Thông tin xe</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Model</span>
                    <span className="font-medium">{rental.vehicle.model}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Biển số</span>
                    <span className="font-medium text-lg">{rental.vehicle.license_plate}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Pin còn lại</span>
                    <div className="flex items-center">
                      <Battery className="h-4 w-4 mr-1 text-orange-600" />
                      <span className="font-medium">{rental.vehicle.battery_level}%</span>
                      <Badge 
                        variant={rental.vehicle.battery_level > 30 ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {rental.vehicle.battery_level > 30 ? "Đủ" : "Thấp"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Thông tin thuê</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Thời gian thuê</span>
                    <span className="font-medium">
                      {calculateRentalDuration(rental.start_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Bắt đầu</span>
                    <span className="font-medium">
                      {new Date(rental.start_time).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Trạm nhận</span>
                    <div className="text-right">
                      <div className="font-medium">{rental.station_pickup.name}</div>
                      <div className="text-sm text-gray-500">{rental.station_pickup.address}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Return Station Selection */}
      {!loading && rental && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Chọn trạm trả xe
            </CardTitle>
            <CardDescription>
              Chọn trạm nơi bạn muốn trả xe và kết thúc lượt thuê
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạm trả xe <span className="text-red-500">*</span>
              </label>
              <Select
                value={returnForm.station_return_id}
                onValueChange={(value) => setReturnForm({
                  ...returnForm,
                  station_return_id: value
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạm để trả xe" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{station.name}</div>
                          <div className="text-sm text-gray-500">
                            {station.address} • {station.available_slots} chỗ trống
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Station Info */}
            {returnForm.station_return_id && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Trạm được chọn</h4>
                <div className="text-green-800">
                  <p className="font-medium">{getStationName(returnForm.station_return_id)}</p>
                  <p className="text-sm">
                    {stations.find(s => s.id === parseInt(returnForm.station_return_id))?.address}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Return Action */}
      {!loading && rental && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận trả xe
                </h3>
                <p className="text-gray-600">
                  Kiểm tra thông tin và xác nhận để hoàn tất việc trả xe
                </p>
              </div>
              
              <Button
                onClick={handleReturnVehicle}
                disabled={submitting || !returnForm.station_return_id}
                size="lg"
                className="min-w-[150px] bg-orange-600 hover:bg-orange-700"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Trả xe
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

export default RentalReturnPage;
