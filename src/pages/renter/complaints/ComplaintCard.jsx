import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ArrowRight
} from 'lucide-react';

const ComplaintCard = ({ complaint, onViewDetail }) => {
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
      <div className="flex items-center space-x-1">
        <IconComponent className="h-4 w-4" />
        <Badge className={config.color}>
          {config.label}
        </Badge>
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-xs">
            #{complaint.id}
          </Badge>
          {getStatusBadge(complaint.status)}
        </div>
        <div className="text-sm text-gray-500">
          {new Date(complaint.createdAt).toLocaleDateString('vi-VN')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Chuyến đi liên quan:</p>
          <p className="font-medium">#{complaint.rental?.id || 'N/A'}</p>
        </div>
        {complaint.staff?.id && (
          <div>
            <p className="text-sm text-gray-600">Nhân viên liên quan:</p>
            <p className="font-medium">{complaint.staff.fullName} (#{complaint.staff.id})</p>
          </div>
        )}
        <div className="md:col-span-2">
          <p className="text-sm text-gray-600">Nội dung:</p>
          <p className="font-medium text-gray-800 line-clamp-2">
            {complaint.description}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          {complaint.resolvedAt && (
            <p className="text-xs text-gray-500">
              Giải quyết: {new Date(complaint.resolvedAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetail(complaint.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Xem chi tiết
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ComplaintCard;