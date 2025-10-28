import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, RefreshCw, Eye, User, Car, MapPin, Calendar, DollarSign, FileText, Phone, Mail } from 'lucide-react';
import adminService from '@/services/admin/adminService';

const ViolationsTab = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [showViolationDialog, setShowViolationDialog] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Fetch violations data
  const fetchViolations = async () => {
    setLoading(true);
    try {
      const data = await adminService.getViolations();
      setViolations(data || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
      toast.error('Không thể tải dữ liệu vi phạm');
      setViolations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchViolations();
  }, []);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewDetail = (violation) => {
    setSelectedViolation(violation);
    setShowViolationDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Danh sách vi phạm</CardTitle>
            <CardDescription>
              Theo dõi các vi phạm và phạt tiền trong hệ thống
            </CardDescription>
          </div>
          <Button variant="outline" onClick={fetchViolations} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {violations.length > 0 ? violations.map((violation) => (
            <div key={violation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <Badge variant="outline">#{violation.id}</Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-800">
                    <span className="text-gray-500">Rental:</span>
                    <span className="font-medium">#{violation.rental.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2 text-sm text-gray-800">
                  <User className="h-4 w-4 text-blue-600" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Người thuê:</span>
                    <span className="font-medium">{violation.rental.renter.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Xe:</span>
                    <span className="font-medium">{violation.rental.vehicle.licensePlate}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{violation.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(violation.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(violation.fineAmount)}
                </div>
                <Badge variant="destructive">Vi phạm</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetail(violation)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Chi tiết
                </Button>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có vi phạm nào
              </h3>
              <p className="text-gray-600">
                Các vi phạm sẽ xuất hiện tại đây khi được ghi nhận
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Violation Details Dialog */}
      <Dialog open={showViolationDialog} onOpenChange={setShowViolationDialog}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Chi tiết vi phạm #{selectedViolation?.id}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về vi phạm và lượt thuê liên quan
            </DialogDescription>
          </DialogHeader>

          {selectedViolation && (
            <div className='grid gap-6 py-4'>
              {/* Violation Information */}
              <div className='bg-red-50 p-4 rounded-lg border border-red-200'>
                <h3 className='font-semibold text-red-900 mb-3 flex items-center gap-2'>
                  <Shield className="h-4 w-4" />
                  Thông tin vi phạm
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Mã vi phạm</Label>
                    <p className='text-lg font-bold text-red-600'>#{selectedViolation.id}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Số tiền phạt</Label>
                    <p className='text-2xl font-bold text-red-600'>
                      {formatCurrency(selectedViolation.fineAmount)}
                    </p>
                  </div>
                  <div className='col-span-2'>
                    <Label className='text-sm font-medium text-muted-foreground'>Mô tả vi phạm</Label>
                    <p className='text-lg bg-white p-3 rounded border mt-1'>
                      {selectedViolation.description}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Thời gian ghi nhận</Label>
                    <p className='text-lg'>{new Date(selectedViolation.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              </div>

              {/* Rental Information */}
              <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                <h3 className='font-semibold text-blue-900 mb-3 flex items-center gap-2'>
                  <FileText className="h-4 w-4" />
                  Thông tin lượt thuê
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Mã lượt thuê</Label>
                    <p className='text-lg font-semibold'>#{selectedViolation.rental.id}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Loại thuê</Label>
                    <Badge className={selectedViolation.rental.rentalType === 'booking' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                      {selectedViolation.rental.rentalType === 'booking' ? 'Đặt trước' : 
                       selectedViolation.rental.rentalType === 'walkin' ? 'Thuê tại chỗ' : selectedViolation.rental.rentalType}
                    </Badge>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Thời gian bắt đầu</Label>
                    <p className='text-lg'>{new Date(selectedViolation.rental.startTime).toLocaleString('vi-VN')}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Thời gian kết thúc</Label>
                    <p className='text-lg'>
                      {selectedViolation.rental.endTime 
                        ? new Date(selectedViolation.rental.endTime).toLocaleString('vi-VN')
                        : 'Chưa kết thúc'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Renter Information */}
              <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                <h3 className='font-semibold text-green-900 mb-3 flex items-center gap-2'>
                  <User className="h-4 w-4" />
                  Thông tin khách hàng
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Họ tên</Label>
                    <p className='text-lg font-semibold'>{selectedViolation.rental.renter.fullName}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>ID khách hàng</Label>
                    <p className='text-lg'>#{selectedViolation.rental.renter.id}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Email</Label>
                    <p className='text-lg flex items-center gap-2'>
                      <Mail className="h-4 w-4" />
                      {selectedViolation.rental.renter.email}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Số điện thoại</Label>
                    <p className='text-lg flex items-center gap-2'>
                      <Phone className="h-4 w-4" />
                      {selectedViolation.rental.renter.phone}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Vai trò</Label>
                    <Badge variant="outline">{selectedViolation.rental.renter.role}</Badge>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className='bg-orange-50 p-4 rounded-lg border border-orange-200'>
                <h3 className='font-semibold text-orange-900 mb-3 flex items-center gap-2'>
                  <Car className="h-4 w-4" />
                  Thông tin xe vi phạm
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Biển số xe</Label>
                    <p className='text-2xl font-bold text-blue-600'>{selectedViolation.rental.vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>ID xe</Label>
                    <p className='text-lg'>#{selectedViolation.rental.vehicle.id}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Hãng/Model</Label>
                    <p className='text-lg'>{selectedViolation.rental.vehicle.brand} {selectedViolation.rental.vehicle.model}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Loại xe</Label>
                    <Badge className={selectedViolation.rental.vehicle.type === 'motorbike' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                      {selectedViolation.rental.vehicle.type === 'motorbike' ? 'Xe máy điện' : 
                       selectedViolation.rental.vehicle.type === 'car' ? 'Ô tô điện' : selectedViolation.rental.vehicle.type}
                    </Badge>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Dung lượng pin</Label>
                    <p className='text-lg'>{selectedViolation.rental.vehicle.capacity} kWh</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Tầm hoạt động</Label>
                    <p className='text-lg'>{selectedViolation.rental.vehicle.rangePerFullCharge} km</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Loại pin</Label>
                    <p className='text-lg'>{selectedViolation.rental.vehicle.batteryType}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Giá thuê</Label>
                    <p className='text-lg font-bold text-green-600'>{formatCurrency(selectedViolation.rental.vehicle.pricePerHour)}/giờ</p>
                  </div>
                </div>
              </div>

              {/* Station Information */}
              <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
                <h3 className='font-semibold text-purple-900 mb-3 flex items-center gap-2'>
                  <MapPin className="h-4 w-4" />
                  Thông tin trạm
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Trạm lấy xe</Label>
                    <p className='text-lg font-bold'>{selectedViolation.rental.stationPickup?.name}</p>
                    <p className='text-sm text-muted-foreground'>ID: #{selectedViolation.rental.stationPickup?.id}</p>
                    <p className='text-sm text-muted-foreground'>{selectedViolation.rental.stationPickup?.address}</p>
                  </div>
                  {selectedViolation.rental.stationReturn && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Trạm trả xe</Label>
                      <p className='text-lg font-bold'>{selectedViolation.rental.stationReturn.name}</p>
                      <p className='text-sm text-muted-foreground'>ID: #{selectedViolation.rental.stationReturn.id}</p>
                      <p className='text-sm text-muted-foreground'>{selectedViolation.rental.stationReturn.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Information */}
              {(selectedViolation.rental.staffPickup || selectedViolation.rental.staffReturn) && (
                <div className='bg-teal-50 p-4 rounded-lg border border-teal-200'>
                  <h3 className='font-semibold text-teal-900 mb-3 flex items-center gap-2'>
                    <User className="h-4 w-4" />
                    Thông tin nhân viên
                  </h3>
                  <div className='grid grid-cols-2 gap-4'>
                    {selectedViolation.rental.staffPickup && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Nhân viên giao xe</Label>
                        <p className='text-lg font-bold'>{selectedViolation.rental.staffPickup.fullName}</p>
                        <p className='text-sm text-muted-foreground'>ID: #{selectedViolation.rental.staffPickup.id}</p>
                        <p className='text-sm text-muted-foreground'>{selectedViolation.rental.staffPickup.email}</p>
                        <p className='text-sm text-muted-foreground'>{selectedViolation.rental.staffPickup.phone}</p>
                      </div>
                    )}
                    {selectedViolation.rental.staffReturn && (
                      <div>
                        <Label className='text-sm font-medium text-muted-foreground'>Nhân viên nhận xe</Label>
                        <p className='text-lg font-bold'>{selectedViolation.rental.staffReturn.fullName}</p>
                        <p className='text-sm text-muted-foreground'>ID: #{selectedViolation.rental.staffReturn.id}</p>
                        <p className='text-sm text-muted-foreground'>{selectedViolation.rental.staffReturn.email}</p>
                        <p className='text-sm text-muted-foreground'>{selectedViolation.rental.staffReturn.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
                <h3 className='font-semibold text-yellow-900 mb-3 flex items-center gap-2'>
                  <DollarSign className="h-4 w-4" />
                  Thông tin tài chính
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Tổng chi phí thuê</Label>
                    <p className='text-xl font-bold text-green-600'>{formatCurrency(selectedViolation.rental.totalCost)}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Phí vi phạm</Label>
                    <p className='text-xl font-bold text-red-600'>{formatCurrency(selectedViolation.fineAmount)}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Chi phí thuê</Label>
                    <p className='text-lg'>{formatCurrency(selectedViolation.rental.rentalCost)}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Tiền cọc</Label>
                    <p className='text-lg'>{formatCurrency(selectedViolation.rental.depositAmount)}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Bảo hiểm</Label>
                    <p className='text-lg'>
                      {selectedViolation.rental.insurance > 0 
                        ? formatCurrency(selectedViolation.rental.insurance) 
                        : 'Không có bảo hiểm'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Trạng thái cọc</Label>
                    <Badge variant={
                      selectedViolation.rental.depositStatus === 'held' ? 'secondary' :
                      selectedViolation.rental.depositStatus === 'returned' ? 'default' :
                      selectedViolation.rental.depositStatus === 'refunded' ? 'default' : 'outline'
                    }>
                      {selectedViolation.rental.depositStatus === 'held' ? 'Đang giữ' :
                       selectedViolation.rental.depositStatus === 'returned' ? 'Đã trả' :
                       selectedViolation.rental.depositStatus === 'refunded' ? 'Đã hoàn' :
                       selectedViolation.rental.depositStatus === 'pending' ? 'Chờ xử lý' : selectedViolation.rental.depositStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowViolationDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ViolationsTab;
