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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Car className="h-4 w-4 mr-2 text-blue-600" />
                        Thông tin xe và lượt thuê
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Biển số xe:</span>
                          <p className="font-medium">{check.rental.vehicle?.licensePlate || 'N/A'}</p>
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
                          <span className="text-gray-600">Trạm:</span>
                          <p className="font-medium">{check.rental.stationPickup?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Nhân viên xử lý:</span>
                          <p className="font-medium">{check.staff?.fullName || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">SĐT nhân viên:</span>
                          <p className="font-medium">{check.staff?.phone || 'N/A'}</p>
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
