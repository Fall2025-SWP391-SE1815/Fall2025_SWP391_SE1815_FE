import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  Car,
  MessageSquare,
  FileText,
  Phone,
  Mail
} from 'lucide-react';

// Services
import renterComplaintsService from '@/services/renter/complaintsService';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadComplaintDetail();
  }, [id]);

  const loadComplaintDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // GET /api/renter/complaint/:id
      const complaint = await renterComplaintsService.getById(id);
      setComplaint(complaint);
    } catch (err) {
      setError('Không thể tải thông tin chi tiết khiếu nại');
      console.error('Error loading complaint detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xử lý', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'Đang xử lý', icon: RefreshCw },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Đã giải quyết', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Từ chối', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center space-x-2">
        <IconComponent className="h-5 w-5" />
        <Badge className={config.color}>
          {config.label}
        </Badge>
      </div>
    );
  };

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-yellow-600" />;
      case 'investigating':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Không tìm thấy thông tin khiếu nại'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết khiếu nại #{complaint.id}
            </h1>
            <p className="text-gray-600">
              Gửi ngày {new Date(complaint.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge(complaint.status)}
        </div>
      </div>

      {/* Complaint Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Thông tin khiếu nại
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Nội dung khiếu nại:</p>
            <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {complaint.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Mã chuyến liên quan:</p>
              <p className="font-semibold">#{complaint.rental?.id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Thời gian gửi:</p>
              <p className="font-semibold">
                {new Date(complaint.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          
          {complaint.resolvedAt && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Người xử lý:</p>
                <p className="font-semibold">{complaint.admin?.fullName || 'N/A'}</p>
                <p className="text-sm text-gray-500">{complaint.admin?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Thời gian giải quyết:</p>
                <p className="font-semibold">
                  {new Date(complaint.resolvedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Rental Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2" />
            Thông tin chuyến đi liên quan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {complaint.rental ? (
            <div className="flex items-start space-x-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Biển số xe:</p>
                  <p className="font-semibold">{complaint.rental.vehicle?.licensePlate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loại xe:</p>
                  <p className="font-semibold">{complaint.rental.vehicle?.brand} {complaint.rental.vehicle?.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Điểm lấy xe:</p>
                  <p className="font-semibold">{complaint.rental.stationPickup?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Điểm trả xe:</p>
                  <p className="font-semibold">{complaint.rental.stationReturn?.name || 'Chưa xác định'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thời gian thuê:</p>
                  <p className="text-sm">
                    {complaint.rental.startTime ? new Date(complaint.rental.startTime).toLocaleString('vi-VN') : 'N/A'}
                    <br />
                    đến {complaint.rental.endTime ? new Date(complaint.rental.endTime).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng chi phí:</p>
                  <p className="font-semibold text-green-600">
                    {complaint.rental.totalCost ? `${complaint.rental.totalCost.toLocaleString()} VNĐ` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Không có thông tin chuyến đi liên quan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Information (if involved) */}
      {complaint.staff && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Thông tin nhân viên liên quan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tên nhân viên:</p>
                <p className="font-semibold">{complaint.staff?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vai trò:</p>
                <p className="font-semibold">{complaint.staff?.role || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Điện thoại:</p>
                <p className="font-semibold flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {complaint.staff?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-semibold flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {complaint.staff?.email || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolution (if resolved) */}
      {complaint.status === 'resolved' && complaint.resolution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="h-5 w-5 mr-2" />
              Kết quả xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 leading-relaxed">
                {complaint.resolution}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Tiến trình xử lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaint.timeline && complaint.timeline.length > 0 ? complaint.timeline.map((item, index) => (
              <div key={item.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                    {getTimelineIcon(item.status)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {item.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Bởi: {item.actor}
                  </p>
                </div>
                {index < complaint.timeline.length - 1 && (
                  <div className="absolute left-4 mt-8 w-0.5 h-8 bg-gray-200"></div>
                )}
              </div>
            )) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Chưa có thông tin tiến trình xử lý</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          In báo cáo
        </Button>
        {complaint.status === 'resolved' && (
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Đánh giá xử lý
          </Button>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetailPage;
