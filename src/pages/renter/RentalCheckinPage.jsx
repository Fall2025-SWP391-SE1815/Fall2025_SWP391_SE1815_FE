import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  QrCode, 
  CheckCircle, 
  AlertTriangle, 
  Car, 
  MapPin, 
  Clock, 
  CreditCard,
  UserCheck,
  Smartphone,
  Calendar
} from 'lucide-react';

const RentalCheckinPage = () => {
  const [searchParams] = useSearchParams();
  
  // State
  const [checkinType, setCheckinType] = useState('booking'); // 'booking' or 'walk-in'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [checkinForm, setCheckinForm] = useState({
    reservation_id: searchParams.get('reservation_id') || '',
    vehicle_id: searchParams.get('vehicle_id') || '',
    station_id: searchParams.get('station_id') || ''
  });
  
  // Mock data
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanResult, setQrScanResult] = useState('');

  // Load initial data
  useEffect(() => {
    loadStations();
    loadVehicles();
    loadReservations();
  }, []);

  // Auto-populate from query params
  useEffect(() => {
    if (checkinForm.reservation_id) {
      setCheckinType('booking');
      loadReservationDetails(checkinForm.reservation_id);
    } else if (checkinForm.vehicle_id) {
      setCheckinType('walk-in');
      loadVehicleDetails(checkinForm.vehicle_id);
    }
  }, [checkinForm.reservation_id, checkinForm.vehicle_id]);

  const loadStations = () => {
    // Mock stations data
    setStations([
      { id: 1, name: 'Trạm Quận 1', address: '123 Nguyễn Huệ, Quận 1', available_vehicles: 15 },
      { id: 2, name: 'Trạm Quận 3', address: '456 Võ Văn Tần, Quận 3', available_vehicles: 12 },
      { id: 3, name: 'Trạm Thủ Đức', address: '789 Võ Văn Ngân, Thủ Đức', available_vehicles: 20 }
    ]);
  };

  const loadVehicles = () => {
    // Mock vehicles data
    setVehicles([
      { 
        id: 1, 
        model: 'VinFast Klara S', 
        license_plate: '51F-12345',
        battery_level: 85,
        station_id: 1,
        status: 'available'
      },
      { 
        id: 2, 
        model: 'Pega Newtech', 
        license_plate: '51F-67890',
        battery_level: 92,
        station_id: 1,
        status: 'available'
      }
    ]);
  };

  const loadReservations = () => {
    // Mock reservations data
    setReservations([
      {
        id: 1,
        vehicle_id: 1,
        station_id: 1,
        reserved_start_time: '2025-09-25T08:00:00',
        reserved_end_time: '2025-09-25T18:00:00',
        status: 'confirmed',
        total_amount: 120000
      }
    ]);
  };

  const loadReservationDetails = (reservationId) => {
    const reservation = reservations.find(r => r.id === parseInt(reservationId));
    if (reservation) {
      setSelectedReservation(reservation);
      const vehicle = vehicles.find(v => v.id === reservation.vehicle_id);
      setSelectedVehicle(vehicle);
    }
  };

  const loadVehicleDetails = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    if (vehicle) {
      setSelectedVehicle(vehicle);
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    // Simulate QR scan result
    setTimeout(() => {
      const mockQRData = {
        vehicle_id: 1,
        station_id: 1,
        license_plate: '51F-12345'
      };
      setQrScanResult(JSON.stringify(mockQRData));
      setCheckinForm({
        ...checkinForm,
        vehicle_id: mockQRData.vehicle_id.toString(),
        station_id: mockQRData.station_id.toString()
      });
      setShowQRScanner(false);
      loadVehicleDetails(mockQRData.vehicle_id);
    }, 2000);
  };

  const handleCheckin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (checkinType === 'booking' && !checkinForm.reservation_id) {
        throw new Error('Vui lòng chọn booking');
      }
      if (checkinType === 'walk-in' && (!checkinForm.vehicle_id || !checkinForm.station_id)) {
        throw new Error('Vui lòng chọn xe và trạm');
      }

      // Mock API call
      const requestBody = checkinType === 'booking' 
        ? { 
            reservation_id: parseInt(checkinForm.reservation_id),
            vehicle_id: parseInt(checkinForm.vehicle_id),
            station_id: parseInt(checkinForm.station_id)
          }
        : {
            vehicle_id: parseInt(checkinForm.vehicle_id),
            station_id: parseInt(checkinForm.station_id)
          };

      console.log('Check-in request:', requestBody);

      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResponse = {
        rental: {
          id: Math.floor(Math.random() * 1000),
          renter_id: 1,
          vehicle_id: parseInt(checkinForm.vehicle_id),
          station_pickup_id: parseInt(checkinForm.station_id),
          staff_pickup_id: 1,
          start_time: new Date().toISOString(),
          rental_type: checkinType,
          deposit_amount: 500000,
          deposit_status: 'held',
          status: 'in_use'
        }
      };

      setSuccess(`Check-in thành công! Rental ID: ${mockResponse.rental.id}`);
      
      // Reset form
      setCheckinForm({
        reservation_id: '',
        vehicle_id: '',
        station_id: ''
      });
      setSelectedReservation(null);
      setSelectedVehicle(null);

    } catch (error) {
      console.error('Check-in error:', error);
      setError(error.message || 'Có lỗi xảy ra khi check-in');
    } finally {
      setLoading(false);
    }
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === parseInt(stationId));
    return station ? station.name : 'N/A';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserCheck className="h-8 w-8 mr-3 text-green-600" />
            Check-in Nhận xe
          </h1>
          <p className="text-gray-600 mt-2">
            Thực hiện check-in để nhận xe theo booking hoặc walk-in
          </p>
        </div>
        
        <Button
          onClick={handleQRScan}
          variant="outline"
          className="flex items-center"
          disabled={loading}
        >
          <QrCode className="h-4 w-4 mr-2" />
          Quét QR
        </Button>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Check-in Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Loại Check-in</CardTitle>
          <CardDescription>
            Chọn loại check-in phù hợp với tình huống của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={checkinType === 'booking' ? 'default' : 'outline'}
              onClick={() => setCheckinType('booking')}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Theo Booking
            </Button>
            <Button
              variant={checkinType === 'walk-in' ? 'default' : 'outline'}
              onClick={() => setCheckinType('walk-in')}
              className="flex-1"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Walk-in
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardContent className="p-8 text-center">
            <QrCode className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Đang quét QR code...
            </h3>
            <p className="text-blue-700">
              Hướng camera về phía QR code trên xe để quét
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Check-in Form */}
      {checkinType === 'booking' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Check-in theo Booking
            </CardTitle>
            <CardDescription>
              Nhập ID booking hoặc chọn từ danh sách booking đã xác nhận
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking ID
              </label>
              <Input
                type="number"
                value={checkinForm.reservation_id}
                onChange={(e) => setCheckinForm({
                  ...checkinForm,
                  reservation_id: e.target.value
                })}
                placeholder="Nhập ID booking"
              />
            </div>

            {/* Display selected reservation details */}
            {selectedReservation && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin Booking</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Booking ID:</span>
                    <p className="font-medium">{selectedReservation.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạm:</span>
                    <p className="font-medium">{getStationName(selectedReservation.station_id)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian bắt đầu:</span>
                    <p className="font-medium">
                      {new Date(selectedReservation.reserved_start_time).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian kết thúc:</span>
                    <p className="font-medium">
                      {new Date(selectedReservation.reserved_end_time).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Walk-in Check-in Form */}
      {checkinType === 'walk-in' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-purple-600" />
              Check-in Walk-in
            </CardTitle>
            <CardDescription>
              Chọn trạm và xe có sẵn để thuê ngay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạm <span className="text-red-500">*</span>
                </label>
                <Select
                  value={checkinForm.station_id}
                  onValueChange={(value) => setCheckinForm({
                    ...checkinForm,
                    station_id: value,
                    vehicle_id: '' // Reset vehicle when station changes
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạm" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id.toString()}>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">{station.name}</div>
                            <div className="text-sm text-gray-500">
                              {station.available_vehicles} xe có sẵn
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xe <span className="text-red-500">*</span>
                </label>
                <Select
                  value={checkinForm.vehicle_id}
                  onValueChange={(value) => {
                    setCheckinForm({
                      ...checkinForm,
                      vehicle_id: value
                    });
                    loadVehicleDetails(value);
                  }}
                  disabled={!checkinForm.station_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles
                      .filter(vehicle => 
                        vehicle.station_id === parseInt(checkinForm.station_id) && 
                        vehicle.status === 'available'
                      )
                      .map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">{vehicle.model}</div>
                              <div className="text-sm text-gray-500">
                                {vehicle.license_plate} • Pin: {vehicle.battery_level}%
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Vehicle Info */}
      {selectedVehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-green-600" />
              Thông tin Xe được chọn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Model</div>
                <div className="font-semibold text-lg">{selectedVehicle.model}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Biển số</div>
                <div className="font-semibold text-lg">{selectedVehicle.license_plate}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Pin</div>
                <div className="flex items-center">
                  <div className="font-semibold text-lg">{selectedVehicle.battery_level}%</div>
                  <Badge 
                    variant={selectedVehicle.battery_level > 50 ? "default" : "destructive"}
                    className="ml-2"
                  >
                    {selectedVehicle.battery_level > 50 ? "Tốt" : "Thấp"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in Action */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Xác nhận Check-in
              </h3>
              <p className="text-gray-600">
                Kiểm tra thông tin và xác nhận để bắt đầu thuê xe
              </p>
            </div>
            
            <Button
              onClick={handleCheckin}
              disabled={loading || 
                (checkinType === 'booking' && !checkinForm.reservation_id) ||
                (checkinType === 'walk-in' && (!checkinForm.vehicle_id || !checkinForm.station_id))
              }
              size="lg"
              className="min-w-[150px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check-in
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalCheckinPage;