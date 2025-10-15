import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare,
  Send,
  RefreshCw,
  AlertTriangle,
  Plus,
  User,
  Car
} from 'lucide-react';

// Services
import { renterService } from '@/services/renter/renterService';

// Rental Card Component
const RentalCard = ({ rental, onCreateComplaint, loading }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'returned':
        return 'bg-green-100 text-green-800';
      case 'in_use':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'returned':
        return 'Đã trả xe';
      case 'in_use':
        return 'Đang sử dụng';
      case 'active':
        return 'Đang hoạt động';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Badge className="text-xs">
            #{rental.id}
          </Badge>
          <Badge className={getStatusColor(rental.status)}>
            {getStatusLabel(rental.status)}
          </Badge>
        </div>
        <div className="text-sm text-gray-500">
          {rental.createdAt && new Date(rental.createdAt).toLocaleDateString('vi-VN')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Xe:</p>
          <p className="font-medium">
            {rental.vehicle?.model || rental.vehicleModel || 'N/A'} - {rental.vehicle?.licensePlate || rental.licensePlate || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tổng chi phí:</p>
          <p className="font-medium text-blue-600">
            {rental.totalCost ? `${rental.totalCost.toLocaleString()} VNĐ` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Thời gian bắt đầu:</p>
          <p className="font-medium">
            {rental.startTime ? new Date(rental.startTime).toLocaleString('vi-VN') : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Thời gian kết thúc:</p>
          <p className="font-medium">
            {rental.endTime ? new Date(rental.endTime).toLocaleString('vi-VN') : 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => onCreateComplaint(rental.id)}
          disabled={loading}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Gửi khiếu nại
        </Button>
        
        {/* Nếu có nhân viên pickup/return, hiển thị button khiếu nại về nhân viên */}
        {rental.staffPickup && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCreateComplaint(rental.id, rental.staffPickup.id)}
            disabled={loading}
          >
            <User className="h-4 w-4 mr-1" />
            Khiếu nại NV giao xe
          </Button>
        )}
        
        {rental.staffReturn && rental.staffReturn.id !== rental.staffPickup?.id && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCreateComplaint(rental.id, rental.staffReturn.id)}
            disabled={loading}
          >
            <User className="h-4 w-4 mr-1" />
            Khiếu nại NV nhận xe
          </Button>
        )}
      </div>

      {/* Hiển thị thông tin nhân viên nếu có */}
      {(rental.staffPickup || rental.staffReturn) && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium text-gray-700 mb-2">Nhân viên liên quan:</p>
          {rental.staffPickup && (
            <p className="text-gray-600">
              Giao xe: {rental.staffPickup.fullName} ({rental.staffPickup.phone})
            </p>
          )}
          {rental.staffReturn && (
            <p className="text-gray-600">
              Nhận xe: {rental.staffReturn.fullName} ({rental.staffReturn.phone})
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const ComplaintsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states for new complaint
  const [availableRentals, setAvailableRentals] = useState([]);
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [selectedRentalForComplaint, setSelectedRentalForComplaint] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadAvailableRentals();
  }, []);

  const loadAvailableRentals = async () => {
    try {
      // GET /api/renter/rentals/all - Get all rentals that can be complained about
      const response = await renterService.rentals.getAll();
      const rentals = response.data || [];
      setAvailableRentals(rentals);
    } catch (err) {
      console.error('Error loading rentals:', err);
      setError('Không thể tải danh sách chuyến đi');
    }
  };



  const handleCreateComplaint = (rentalId, staffId = null) => {
    const rental = availableRentals.find(r => r.id === rentalId);
    if (rental) {
      setSelectedRentalForComplaint(rental);
      setSelectedStaff(staffId ? staffId.toString() : '');
      setDescription('');
      setShowComplaintDialog(true);
    }
  };

  const submitComplaintFromDialog = async () => {
    if (!selectedRentalForComplaint || !description.trim()) {
      setError('Vui lòng mô tả vấn đề');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // POST /api/renter/complaint
      const requestBody = {
        rentalId: selectedRentalForComplaint.id,
        staffId: selectedStaff && selectedStaff !== '' ? parseInt(selectedStaff) : undefined,
        description: description.trim()
      };
      
      const response = await renterService.complaints.submit(requestBody);
      
      // Process response - API returns full complaint object with nested data
      if (response && response.id) {
        console.log('Complaint created successfully:', response);
      }
      
      // Reset form
      setShowComplaintDialog(false);
      setSelectedRentalForComplaint(null);
      setSelectedStaff('');
      setDescription('');
      
      setSuccess(`Khiếu nại #${response?.id || 'mới'} đã được gửi thành công! Chúng tôi sẽ xử lý trong thời gian sớm nhất.`);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError('Không thể gửi khiếu nại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="h-8 w-8 mr-3 text-red-600" />
            Gửi khiếu nại
          </h1>
          <p className="text-gray-600 mt-2">
            Gửi khiếu nại về chuyến đi hoặc dịch vụ
          </p>
        </div>
        
        <Button
          onClick={loadAvailableRentals}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Submit Complaint Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Gửi khiếu nại mới
          </CardTitle>
          <CardDescription>
            Chọn chuyến đi và gửi khiếu nại trực tiếp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Đang tải danh sách chuyến đi...</p>
            </div>
          ) : availableRentals.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có chuyến đi nào
              </h3>
              <p className="text-gray-600">
                Bạn chưa có chuyến đi nào để gửi khiếu nại.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableRentals.map((rental) => (
                <RentalCard 
                  key={rental.id} 
                  rental={rental} 
                  onCreateComplaint={(rentalId, staffId) => handleCreateComplaint(rentalId, staffId)}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaint Dialog */}
      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Gửi khiếu nại - Chuyến #{selectedRentalForComplaint?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedRentalForComplaint && (
            <div className="space-y-4">
              {/* Thông tin chuyến đi */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Thông tin chuyến đi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-blue-700">Xe:</p>
                    <p className="font-medium text-blue-900">
                      {selectedRentalForComplaint.vehicle?.model || selectedRentalForComplaint.vehicleModel || 'N/A'} - 
                      {selectedRentalForComplaint.vehicle?.licensePlate || selectedRentalForComplaint.licensePlate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Tổng chi phí:</p>
                    <p className="font-medium text-blue-900">
                      {selectedRentalForComplaint.totalCost ? `${selectedRentalForComplaint.totalCost.toLocaleString()} VNĐ` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Thời gian:</p>
                    <p className="font-medium text-blue-900">
                      {selectedRentalForComplaint.startTime ? new Date(selectedRentalForComplaint.startTime).toLocaleString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Trạng thái:</p>
                    <Badge className="bg-green-100 text-green-800">
                      {selectedRentalForComplaint.status || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Chọn nhân viên (nếu có) */}
              {(selectedRentalForComplaint.staffPickup || selectedRentalForComplaint.staffReturn) && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Khiếu nại liên quan đến nhân viên (tùy chọn)
                  </label>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhân viên nếu khiếu nại liên quan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Không liên quan đến nhân viên cụ thể</SelectItem>
                      {selectedRentalForComplaint.staffPickup && (
                        <SelectItem value={selectedRentalForComplaint.staffPickup.id.toString()}>
                          {selectedRentalForComplaint.staffPickup.fullName} - Nhân viên giao xe
                        </SelectItem>
                      )}
                      {selectedRentalForComplaint.staffReturn && selectedRentalForComplaint.staffReturn.id !== selectedRentalForComplaint.staffPickup?.id && (
                        <SelectItem value={selectedRentalForComplaint.staffReturn.id.toString()}>
                          {selectedRentalForComplaint.staffReturn.fullName} - Nhân viên nhận xe
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
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  onClick={submitComplaintFromDialog}
                  disabled={loading || !description.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Đang gửi...' : 'Gửi khiếu nại'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsPage;
