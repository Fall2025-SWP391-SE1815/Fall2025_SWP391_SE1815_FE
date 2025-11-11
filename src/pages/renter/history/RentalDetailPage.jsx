import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  MessageSquare,
  Send,
  Car,
  CreditCard,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Star,
  Battery,
  Gauge
} from 'lucide-react';

// Services
import { renterService } from '../../../services/renter/renterService';
import { API_BASE_URL } from '../../../lib/api/apiConfig';

const RentalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Complaint states
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('none');
  const [description, setDescription] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [success, setSuccess] = useState('');

  // Rating states
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [ratingType, setRatingType] = useState('trip'); // 'trip' or 'staff'
  const [selectedRatingStaff, setSelectedRatingStaff] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    loadRentalDetail();
  }, [id]);

  const loadRentalDetail = () => {
    try {
      setLoading(true);
      setError('');

      // Kiểm tra xem có data từ navigation state không
      const rentalData = location.state?.rentalData;
      if (rentalData) {
        // Sử dụng data từ HistoryPage
        setRental(rentalData);
        setLoading(false);
        return;
      }

      // Nếu không có data từ navigation state, hiển thị lỗi
      setError('Không tìm thấy thông tin chi tiết rental. Vui lòng quay lại trang lịch sử.');

    } catch (err) {
      setError('Không thể tải thông tin chi tiết thuê xe');
      console.error('Error loading rental detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMins}m`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { color: 'bg-green-100 text-green-800', label: 'Đang thuê' },
      'returned': { color: 'bg-blue-100 text-blue-800', label: 'Đã trả xe' },
      'in_use': { color: 'bg-yellow-100 text-yellow-800', label: 'Đang sử dụng' },
      'completed': { color: 'bg-blue-100 text-blue-800', label: 'Hoàn thành' },
      'waiting_for_payment': { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ thanh toán' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Đã hủy' },
      'pending': { color: 'bg-gray-100 text-gray-800', label: 'Chờ xử lý' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDepositStatusBadge = (status) => {
    const statusConfig = {
      'held': { color: 'bg-yellow-100 text-yellow-800', label: 'Đang giữ' },
      'refunded': { color: 'bg-green-100 text-green-800', label: 'Đã hoàn' },
      'forfeited': { color: 'bg-red-100 text-red-800', label: 'Bị tịch thu' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleCreateComplaint = () => {
    setSelectedStaff('none');
    setDescription('');
    setShowComplaintDialog(true);
  };

  const submitComplaint = async () => {
    if (!description.trim()) {
      setError('Vui lòng mô tả vấn đề');
      return;
    }

    try {
      setSubmittingComplaint(true);
      setError('');

      // POST /api/renter/complaint
      const requestBody = {
        rentalId: rental.id,
        staffId: selectedStaff && selectedStaff !== '' && selectedStaff !== 'none' ? parseInt(selectedStaff) : undefined,
        description: description.trim()
      };

      const response = await renterService.complaints.submit(requestBody);

      // Reset form and close dialog
      setShowComplaintDialog(false);
      setSelectedStaff('none');
      setDescription('');

      setSuccess(`Khiếu nại #${response?.id || 'mới'} đã được gửi thành công! Chúng tôi sẽ xử lý trong thời gian sớm nhất.`);

    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError('Không thể gửi khiếu nại. Vui lòng thử lại.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Rating functions
  const handleCreateRating = (type = 'trip') => {
    setRatingType(type);
    setSelectedRatingStaff('');
    setRating(0);
    setRatingComment('');
    setShowRatingDialog(true);
  };

  const submitRating = async () => {
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (ratingType === 'staff' && !selectedRatingStaff) {
      setError('Vui lòng chọn nhân viên để đánh giá');
      return;
    }

    try {
      setSubmittingRating(true);
      setError('');

      let response;
      if (ratingType === 'trip') {
        // POST /api/renter/rating/trip
        const requestBody = {
          rentalId: rental.id,
          rating: rating,
          comment: ratingComment.trim() || undefined
        };
        response = await renterService.ratings.submitTrip(requestBody);
      } else {
        // POST /api/renter/rating/staff
        const requestBody = {
          rentalId: rental.id,
          staffId: parseInt(selectedRatingStaff),
          rating: rating,
          comment: ratingComment.trim() || undefined
        };
        response = await renterService.ratings.submitStaff(requestBody);
      }

      // Reset form and close dialog
      setShowRatingDialog(false);
      setSelectedRatingStaff('');
      setRating(0);
      setRatingComment('');

      setSuccess(`Đánh giá ${ratingType === 'trip' ? 'chuyến đi' : 'nhân viên'} đã được gửi thành công! Cảm ơn bạn đã đóng góp ý kiến.`);

    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, readOnly = false }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          onClick={() => !readOnly && onRatingChange(star)}
          disabled={readOnly}
        >
          <Star className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại lịch sử
        </Button>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Không tìm thấy thông tin rental</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết thuê xe #{rental.id}
            </h1>
            <p className="text-gray-600 mt-1">
              Thông tin đầy đủ về lượt thuê xe của bạn
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusBadge(rental.status)}
          <Button
            onClick={() => handleCreateRating('trip')}
            disabled={submittingRating}
            size="sm"
            variant="outline"
          >
            <Star className="h-4 w-4 mr-2" />
            Đánh giá chuyến đi
          </Button>
          <Button
            onClick={handleCreateComplaint}
            disabled={submittingComplaint}
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Gửi khiếu nại
          </Button>
        </div>
      </div>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2" />
            Thông tin xe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Vehicle summary with image and primary info */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {rental.vehicle?.imageUrl ? (
                  <img src={`${API_BASE_URL}${rental.vehicle.imageUrl}`} alt={`${rental.vehicle?.brand} ${rental.vehicle?.model}`} className="w-36 h-24 object-cover rounded-lg border" />
                ) : (
                  <div className="w-36 h-24 bg-gray-100 rounded-lg flex items-center justify-center border">
                    <Car className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Xe</div>
                  <div className="text-xl font-semibold">{rental.vehicle?.brand} {rental.vehicle?.model}</div>
                  <div className="text-sm text-gray-500 mt-2">Biển số</div>
                  <div className="text-lg font-medium">{rental.vehicle?.licensePlate}</div>
                  <div className="mt-3">
                    <Badge variant="outline" className="px-2 py-1">{rental.vehicle?.type}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-xs text-gray-500">PIN ban đầu</div>
                  <div className="mt-1 text-lg font-semibold flex items-center justify-center gap-2">
                    <Battery className="h-4 w-4 text-green-600" />
                    {rental.batteryLevelStart ?? 'Chưa có dữ liệu'}%
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-xs text-gray-500">PIN còn lại</div>
                  <div className="mt-1 text-lg font-semibold flex items-center justify-center gap-2">
                    <Battery className="h-4 w-4 text-green-600" />
                    {rental.batteryLevelEnd ?? 'Chưa có dữ liệu'}%
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-xs text-gray-500">Quãng đường/lần sạc</div>
                  <div className="mt-1 text-lg font-semibold flex items-center justify-center gap-2">
                    <Gauge className="h-4 w-4 text-blue-600" />
                    {rental.vehicle?.rangePerFullCharge ?? 'N/A'} km
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Odo and pricing details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Đồng hồ (bắt đầu)</div>
                  <div className="mt-1 text-lg font-semibold">{rental.odoStart ?? 'Chưa có dữ liệu'} km</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Đồng hồ (kết thúc)</div>
                  <div className="mt-1 text-lg font-semibold">{rental.odoEnd ?? 'Chưa có dữ liệu'} km</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Quãng đường đã đi</div>
                <div className="mt-1 text-lg font-semibold">{(rental.odoStart != null && rental.odoEnd != null) ? `${rental.odoEnd - rental.odoStart} km` : 'Chưa có dữ liệu'}</div>
              </div>

              <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                <div className="text-xs text-gray-500">Giá thuê</div>
                <div className="mt-1 text-2xl font-bold text-green-700">{formatCurrency(rental.vehicle?.pricePerHour)}</div>
                <div className="text-sm text-gray-600">/giờ</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Thông tin thuê xe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Thời gian bắt đầu</label>
                  <p className="text-lg">{formatDateTime(rental.startTime)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Thời gian kết thúc</label>
                  <p className="text-lg">{formatDateTime(rental.endTime)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Thời gian thuê</label>
                  <p className="text-lg font-semibold">
                    {formatDuration(rental.startTime, rental.endTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Loại thuê</label>
                <p className="text-lg capitalize">
                  {rental.rentalType === 'booking' ? 'Đặt trước' : rental.rentalType}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Quãng đường đi</label>
                <p className="text-lg">
                  {rental.odoStart && rental.odoEnd ? `${rental.odoEnd - rental.odoStart} km` : 'Chưa có dữ liệu'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="text-lg">{formatDateTime(rental.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Station Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Thông tin trạm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Trạm lấy xe</label>
              {rental.stationPickup ? (
                <div className="mt-2">
                  <p className="font-semibold">{rental.stationPickup.name}</p>
                  <p className="text-gray-600">{rental.stationPickup.address}</p>
                  <Badge className="mt-1" variant={rental.stationPickup.status === 'active' ? 'default' : 'secondary'}>
                    {rental.stationPickup.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              ) : (
                <p className="text-gray-500 mt-2">Chưa có thông tin</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Trạm trả xe</label>
              {rental.stationPickup ? (
                <div className="mt-2">
                  <p className="font-semibold">{rental.stationPickup.name}</p>
                  <p className="text-gray-600">{rental.stationPickup.address}</p>
                  <Badge className="mt-1" variant={rental.stationPickup.status === 'active' ? 'default' : 'secondary'}>
                    {rental.stationPickup.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
              ) : (
                <p className="text-gray-500 mt-2">Chưa trả xe</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Information */}
      {(rental.staffPickup || rental.staffReturn) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Thông tin nhân viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rental.staffPickup && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Nhân viên giao xe</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">{rental.staffPickup.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{rental.staffPickup.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{rental.staffPickup.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {rental.staffReturn && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Nhân viên nhận xe</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">{rental.staffReturn.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{rental.staffReturn.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{rental.staffReturn.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Thông tin thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng chi phí:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(rental.totalCost)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tiền thuê:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(rental.rentalCost)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tiền bảo hiểm:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(rental.insurance)}
                </span>
              </div>
              {rental.depositAmount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tiền cọc:</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(rental.depositAmount)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {rental.depositStatus && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái cọc</label>
                  <div className="mt-1">
                    {getDepositStatusBadge(rental.depositStatus)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renter Information */}
      {rental.renter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Thông tin người thuê
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold">{rental.renter.fullName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{rental.renter.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{rental.renter.phone}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complaint Dialog */}
      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Gửi khiếu nại - Chuyến #{rental?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Thông tin chuyến đi */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Thông tin chuyến đi</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-700">Xe:</p>
                  <p className="font-medium text-blue-900">
                    {rental?.vehicle?.brand} {rental?.vehicle?.model} - {rental?.vehicle?.licensePlate}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Tổng chi phí:</p>
                  <p className="font-medium text-blue-900">
                    {formatCurrency(rental?.totalCost)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Thời gian:</p>
                  <p className="font-medium text-blue-900">
                    {formatDateTime(rental?.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Trạng thái:</p>
                  {rental?.status && getStatusBadge(rental.status)}
                </div>
              </div>
            </div>

            {/* Chọn nhân viên (nếu có) */}
            {(rental?.staffPickup || rental?.staffReturn) && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Khiếu nại liên quan đến nhân viên (tùy chọn)
                </label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên nếu khiếu nại liên quan" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                    <SelectItem value="none" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Không liên quan đến nhân viên cụ thể</SelectItem>
                    {rental?.staffPickup && (
                      <SelectItem value={rental.staffPickup.id.toString()}>
                        {rental.staffPickup.fullName} - Nhân viên giao xe
                      </SelectItem>
                    )}
                    {rental?.staffReturn && rental.staffReturn.id !== rental.staffPickup?.id && (
                      <SelectItem value={rental.staffReturn.id.toString()}>
                        {rental.staffReturn.fullName} - Nhân viên nhận xe
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Mô tả vấn đề */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Mô tả vấn đề *
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải, thời gian xảy ra, và tác động..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/1000 ký tự
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowComplaintDialog(false)}
                disabled={submittingComplaint}
              >
                Hủy
              </Button>
              <Button
                onClick={submitComplaint}
                disabled={submittingComplaint || !description.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {submittingComplaint ? 'Đang gửi...' : 'Gửi khiếu nại'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Đánh giá {ratingType === 'trip' ? 'chuyến đi' : 'nhân viên'} - Chuyến #{rental?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Thông tin chuyến đi */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Thông tin chuyến đi</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-700">Xe:</p>
                  <p className="font-medium text-blue-900">
                    {rental?.vehicle?.brand} {rental?.vehicle?.model} - {rental?.vehicle?.licensePlate}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Tổng chi phí:</p>
                  <p className="font-medium text-blue-900">
                    {formatCurrency(rental?.totalCost)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Thời gian:</p>
                  <p className="font-medium text-blue-900">
                    {formatDateTime(rental?.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Trạng thái:</p>
                  {rental?.status && getStatusBadge(rental.status)}
                </div>
              </div>
            </div>

            {/* Chọn loại đánh giá */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Loại đánh giá
              </label>
              <Select value={ratingType} onValueChange={setRatingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="trip">Đánh giá chuyến đi</SelectItem>
                  <SelectItem value="staff">Đánh giá nhân viên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Chọn nhân viên (nếu đánh giá nhân viên) */}
            {ratingType === 'staff' && (rental?.staffPickup || rental?.staffReturn) && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Chọn nhân viên *
                </label>
                <Select value={selectedRatingStaff} onValueChange={setSelectedRatingStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhân viên để đánh giá" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                    {rental?.staffPickup && (
                      <SelectItem value={rental.staffPickup.id.toString()}>
                        {rental.staffPickup.fullName}
                      </SelectItem>
                    )}
                    {rental?.staffReturn && rental.staffReturn.id !== rental.staffPickup?.id && (
                      <SelectItem value={rental.staffReturn.id.toString()}>
                        {rental.staffReturn.fullName}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Đánh giá sao */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Đánh giá *
              </label>
              <div className="flex items-center space-x-3">
                <StarRating rating={rating} onRatingChange={setRating} />
                <span className="text-sm text-gray-600">
                  {rating > 0 && `${rating}/5 sao`}
                </span>
              </div>
            </div>

            {/* Nhận xét */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nhận xét (tùy chọn)
              </label>
              <Textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder={ratingType === 'trip'
                  ? "Chia sẻ trải nghiệm của bạn về chất lượng xe, độ tiện lợi..."
                  : "Chia sẻ về thái độ phục vụ, sự nhiệt tình, chuyên nghiệp..."}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {ratingComment.length}/500 ký tự
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowRatingDialog(false)}
                disabled={submittingRating}
              >
                Hủy
              </Button>
              <Button
                onClick={submitRating}
                disabled={submittingRating || rating === 0 || (ratingType === 'staff' && !selectedRatingStaff)}
              >
                <Star className="h-4 w-4 mr-2" />
                {submittingRating ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentalDetailPage;
