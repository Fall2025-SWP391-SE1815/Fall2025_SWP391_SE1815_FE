import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Car,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Camera,
  AlertCircle,
  Clock,
  Image,
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import renterService from '@/services/renter/renterService';
import { API_BASE_URL } from '@/lib/api/apiConfig';

const RentalChecksPage = () => {
  const { id } = useParams(); // rental ID

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checks, setChecks] = useState([]);
  const [selectedCheck, setSelectedCheck] = useState(null);

  // Load rental checks
  useEffect(() => {
    if (id) {
      loadRentalChecks();
    } else {
      // If no ID provided, show message to select a rental
      setError('Vui lòng chọn một lượt thuê để xem biên bản');
    }
  }, [id]);

  const loadRentalChecks = async () => {
    setLoading(true);
    setError('');

    try {
      // Call real API: GET /api/renter/rentals/:id/checks
      const response = await renterService.rentals.getChecks(id);

      // API returns array directly or wrapped in data
      const checksData = Array.isArray(response) ? response : response?.data || response?.checks || [];

      // Normalize the response to match component structure
      const normalizedChecks = checksData.map(check => ({
        id: check.id,
        check_type: (check.checkType || check.check_type || 'pickup').toLowerCase(),
        condition_report: check.conditionReport || check.condition_report || '',
        photo_url: check.photoUrl ? `${API_BASE_URL}${check.photoUrl}` : null,
        customer_signature_url: check.customerSignatureUrl ? `${API_BASE_URL}${check.customerSignatureUrl}` : null,
        staff_signature_url: check.staffSignatureUrl ? `${API_BASE_URL}${check.staffSignatureUrl}` : null,
        created_at: check.createdAt || check.created_at,
        // Additional info from API
        rental: check.rental,
        staff: check.staff
      }));

      setChecks(normalizedChecks);

      if (normalizedChecks.length === 0) {
        setError('Chưa có biên bản giao xe nào cho lượt thuê này');
      }
    } catch (err) {
      console.error('Error loading rental checks:', err);
      setError('Có lỗi xảy ra khi tải biên bản giao xe. Vui lòng thử lại sau.');
      setChecks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRentalChecks();
  };

  const handleViewPhoto = (photoUrl) => {
    window.open(photoUrl, '_blank');
  };

  const getCheckTypeInfo = (checkType) => {
    switch (checkType) {
      case 'pickup':
        return {
          label: 'Nhận xe',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle
        };
      case 'return':
        return {
          label: 'Trả xe',
          color: 'bg-blue-100 text-blue-800',
          icon: XCircle
        };
      default:
        return {
          label: 'Không xác định',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đang tải biên bản giao xe...
          </h3>
          <p className="text-gray-600">
            Vui lòng chờ một chút
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 mr-3 text-blue-600" />
            Biên bản giao xe
          </h1>
          <p className="text-gray-600 mt-2">
            {id
              ? `Xem chi tiết biên bản giao xe và tình trạng xe - Rental #${id}`
              : 'Xem biên bản giao xe cho các lượt thuê của bạn'
            }
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No Rental ID */}
      {!id && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chọn lượt thuê để xem biên bản
            </h3>
            <p className="text-gray-600 mb-6">
              Vui lòng chọn một lượt thuê cụ thể để xem biên bản giao xe chi tiết.
            </p>
            <div className="flex space-x-4 justify-center">
              <Button
                onClick={() => window.location.href = '/rentals/current'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Lượt thuê hiện tại
              </Button>
              <Button
                onClick={() => window.location.href = '/history'}
                variant="outline"
              >
                <Clock className="h-4 w-4 mr-2" />
                Lịch sử thuê xe
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Checks Available */}
      {id && checks.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có biên bản giao xe
            </h3>
            <p className="text-gray-600 mb-6">
              Biên bản giao xe sẽ được tạo khi bạn thực hiện check-in hoặc trả xe.
            </p>
            <Button
              onClick={() => window.location.href = '/rental/current'}
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Quay lại lượt thuê hiện tại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Checks List */}
      {id && checks.length > 0 && (
        <div className="space-y-6">
          {checks.map((check) => {
            const typeInfo = getCheckTypeInfo(check.check_type);
            const TypeIcon = typeInfo.icon;

            return (
              <Card key={check.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <TypeIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Biên bản {typeInfo.label}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                      <Badge variant="outline">
                        #{check.id}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(check.created_at).toLocaleString('vi-VN')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Rental & Vehicle Info */}
                  {check.rental && (
                    <div className="space-y-4">
                      {/* Rental Information */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-green-600" />
                          Thông tin lượt thuê
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Mã lượt thuê:</span>
                            <p className="font-medium">#{check.rental.id}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Loại thuê:</span>
                            <p className="font-medium capitalize">
                              {check.rental.rentalType === 'booking' ? 'Đặt trước' :
                                check.rental.rentalType === 'walkin' ? 'Thuê tại chỗ' : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Thời gian bắt đầu:</span>
                            <p className="font-medium">
                              {new Date(check.rental.startTime).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Thời gian kết thúc:</span>
                            <p className="font-medium">
                              {new Date(check.rental.endTime).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Trạng thái:</span>
                            <p className="font-medium">
                              <Badge variant={check.rental.status === 'wait_confirm' ? 'secondary' : 'default'}>
                                {check.rental.status === 'wait_confirm' ? 'Chờ xác nhận' :
                                  check.rental.status === 'confirmed' ? 'Đã xác nhận' :
                                    check.rental.status === 'in_use' ? 'Đang sử dụng' :
                                      check.rental.status === 'completed' ? 'Hoàn thành' :
                                        check.rental.status === 'cancelled' ? 'Đã hủy' : check.rental.status}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Ngày tạo:</span>
                            <p className="font-medium">
                              {new Date(check.rental.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Information */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                          Thông tin xe
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Biển số xe:</span>
                            <p className="font-medium text-lg">{check.rental.vehicle?.licensePlate || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Loại xe:</span>
                            <p className="font-medium">
                              {check.rental.vehicle?.type === 'motorbike' ? 'Xe máy điện' :
                                check.rental.vehicle?.type === 'car' ? 'Ô tô điện' : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Hãng/Model:</span>
                            <p className="font-medium">
                              {check.rental.vehicle?.brand} {check.rental.vehicle?.model}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Dung lượng pin:</span>
                            <p className="font-medium">{check.rental.vehicle?.capacity} kWh</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tầm hoạt động:</span>
                            <p className="font-medium">{check.rental.vehicle?.rangePerFullCharge} km</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Loại pin:</span>
                            <p className="font-medium">{check.rental.vehicle?.batteryType}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Số ghế:</span>
                            <p className="font-medium">{check.rental.vehicle?.numberSeat} người</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Giá thuê:</span>
                            <p className="font-medium text-green-600">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(check.rental.vehicle?.pricePerHour)}/giờ
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Pin lúc nhận:</span>
                            <p className="font-medium">{check.rental.batteryLevelStart}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Odo lúc nhận:</span>
                            <p className="font-medium">{check.rental.odoStart?.toLocaleString()} km</p>
                          </div>
                          {check.rental.batteryLevelEnd && (
                            <div>
                              <span className="text-gray-600">Pin lúc trả:</span>
                              <p className="font-medium">{check.rental.batteryLevelEnd}%</p>
                            </div>
                          )}
                          {check.rental.odoEnd && (
                            <div>
                              <span className="text-gray-600">Odo lúc trả:</span>
                              <p className="font-medium">{check.rental.odoEnd?.toLocaleString()} km</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Station Information */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <User className="h-4 w-4 mr-2 text-purple-600" />
                          Thông tin trạm và nhân viên
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Trạm lấy xe:</span>
                            <p className="font-medium">{check.rental.stationPickup?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{check.rental.stationPickup?.address}</p>
                          </div>
                          {check.rental.stationReturn && (
                            <div>
                              <span className="text-gray-600">Trạm trả xe:</span>
                              <p className="font-medium">{check.rental.stationReturn.name}</p>
                              <p className="text-xs text-gray-500">{check.rental.stationReturn.address}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">NV giao xe:</span>
                            <p className="font-medium">{check.rental.staffPickup?.fullName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{check.rental.staffPickup?.phone}</p>
                          </div>
                          {check.rental.staffReturn && (
                            <div>
                              <span className="text-gray-600">NV nhận xe:</span>
                              <p className="font-medium">{check.rental.staffReturn.fullName}</p>
                              <p className="text-xs text-gray-500">{check.rental.staffReturn.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financial Information */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-yellow-600" />
                          Thông tin thanh toán
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Tổng chi phí:</span>
                            <p className="font-medium text-lg text-green-600">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(check.rental.totalCost)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Chi phí thuê:</span>
                            <p className="font-medium">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(check.rental.rentalCost)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tiền cọc:</span>
                            <p className="font-medium">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(check.rental.depositAmount)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Trạng thái cọc:</span>
                            <p className="font-medium">
                              <Badge variant={check.rental.depositStatus === 'held' ? 'secondary' : 'default'}>
                                {check.rental.depositStatus === 'held' ? 'Đang giữ' :
                                  check.rental.depositStatus === 'returned' ? 'Đã trả' :
                                    check.rental.depositStatus === 'pending' ? 'Chờ xử lý' : check.rental.depositStatus}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Bảo hiểm:</span>
                            <p className="font-medium">
                              {check.rental.insurance > 0 ?
                                new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(check.rental.insurance)
                                : 'Không có bảo hiểm'
                              }
                            </p>
                          </div>
                          {check.rental.totalDistance && (
                            <div>
                              <span className="text-gray-600">Tổng quãng đường:</span>
                              <p className="font-medium">{check.rental.totalDistance} km</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Renter Information */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-600" />
                          Thông tin khách hàng
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Họ tên:</span>
                            <p className="font-medium">{check.rental.renter?.fullName || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p className="font-medium">{check.rental.renter?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Số điện thoại:</span>
                            <p className="font-medium">{check.rental.renter?.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">ID khách hàng:</span>
                            <p className="font-medium">#{check.rental.renter?.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Condition Report */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Báo cáo tình trạng xe</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        {check.condition_report || 'Không có báo cáo'}
                      </p>
                    </div>
                  </div>

                  {/* Photos */}
                  {check.photo_url && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Hình ảnh xe</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                          <img
                            src={check.photo_url}
                            alt="Tình trạng xe"
                            className="w-full h-48 object-cover rounded-lg border"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent && !parent.querySelector('.error-placeholder')) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'error-placeholder w-full h-48 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500';
                                placeholder.innerHTML = '<div class="text-center"><svg class="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm">Không thể tải ảnh</p></div>';
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <Button
                              onClick={() => handleViewPhoto(check.photo_url)}
                              variant="secondary"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem lớn
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signatures */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Chữ ký xác nhận</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Signature */}
                      {check.customer_signature_url && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Chữ ký khách hàng</h5>
                          <div className="border rounded-lg p-2 bg-gray-50">
                            <img
                              src={check.customer_signature_url}
                              alt="Chữ ký khách hàng"
                              className="w-full h-24 object-contain"
                            />
                          </div>
                        </div>
                      )}

                      {/* Staff Signature */}
                      {check.staff_signature_url && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Chữ ký nhân viên</h5>
                          <div className="border rounded-lg p-2 bg-gray-50">
                            <img
                              src={check.staff_signature_url}
                              alt="Chữ ký nhân viên"
                              className="w-full h-24 object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {check.photo_url && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => handleViewPhoto(check.photo_url)}
                        variant="outline"
                        className="w-full"
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Xem ảnh gốc
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Note */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Thông tin về biên bản giao xe:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Biên bản được tạo tự động khi check-in và trả xe</li>
                <li>Chứa đầy đủ thông tin về tình trạng xe và hình ảnh</li>
                <li>Cả khách hàng và nhân viên đều phải ký xác nhận</li>
                <li>Có thể tải xuống để lưu trữ cá nhân</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalChecksPage;