import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, Filter, Eye } from 'lucide-react';
import adminService from '@/services/admin/adminService';

const RentalsTab = () => {
  // State for data
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [showRentalDialog, setShowRentalDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  // Fetch rentals data
  const fetchRentals = async () => {
    setLoading(true);
    try {
      // Chỉ gửi status nếu không phải 'all'
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await adminService.getRentals(params);
      setRentals(data || []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast.error('Không thể tải dữ liệu thuê xe');
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRentals();
  }, []);

  // Re-fetch data when filters change
  useEffect(() => {
    fetchRentals();
  }, [statusFilter]);
  const getRentalStatusBadge = (status) => {
    const statusConfig = {
      booked: { variant: 'outline', label: 'Đã đặt' },
      in_use: { variant: 'default', label: 'Đang thuê' },
      waiting_for_payment: { variant: 'destructive', label: 'Chờ thanh toán' },
      returned: { variant: 'secondary', label: 'Đã trả' },
      cancelled: { variant: 'destructive', label: 'Đã hủy' }
    };

    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.renter?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${rental.vehicle?.brand} ${rental.vehicle?.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm người thuê hoặc xe...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-48'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Lọc theo trạng thái' />
          </SelectTrigger>
          <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
            <SelectItem value='all' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Tất cả trạng thái</SelectItem>
            <SelectItem value='booked' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã đặt</SelectItem>
            <SelectItem value='in_use' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đang thuê</SelectItem>
            <SelectItem value='waiting_for_payment' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Chờ thanh toán</SelectItem>
            <SelectItem value='returned' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã trả</SelectItem>
            <SelectItem value='cancelled' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lượt thuê</CardTitle>
          <CardDescription>
            Theo dõi tất cả các lượt thuê xe trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người thuê</TableHead>
                <TableHead>Xe</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian bắt đầu</TableHead>
                <TableHead>Chi phí</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell className='font-medium'>
                    {rental.renter?.fullName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {rental.vehicle?.licensePlate} - {rental.vehicle?.brand} {rental.vehicle?.model}
                  </TableCell>
                  <TableCell>
                    {getRentalStatusBadge(rental.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(rental.startTime).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {rental.totalCost > 0 ? formatCurrency(rental.totalCost) : 'Chưa tính'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setSelectedRental(rental);
                        setShowRentalDialog(true);
                      }}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRentals.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm || (statusFilter && statusFilter !== 'all') ? 'Không tìm thấy lượt thuê phù hợp' : 'Chưa có lượt thuê nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rental Details Dialog */}
      <Dialog open={showRentalDialog} onOpenChange={setShowRentalDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết lượt thuê</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về lượt thuê xe
            </DialogDescription>
          </DialogHeader>

          {selectedRental && (
            <div className='grid gap-6 py-4 max-h-[70vh] overflow-y-auto'>
              {/* Basic Information */}
              <div className='bg-blue-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-blue-900 mb-3'>Thông tin cơ bản</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Mã lượt thuê</Label>
                    <p className='text-lg font-semibold'>#{selectedRental.id}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Ngày tạo</Label>
                    <p className='text-lg'>{new Date(selectedRental.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              </div>

              {/* Renter Information */}
              <div className='bg-green-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-green-900 mb-3'>Thông tin khách hàng</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Họ tên</Label>
                    <p className='text-lg font-semibold'>{selectedRental.renter?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>ID khách hàng</Label>
                    <p className='text-lg'>#{selectedRental.renter?.id}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Email</Label>
                    <p className='text-sm text-muted-foreground'>{selectedRental.renter?.email}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Số điện thoại</Label>
                    <p className='text-sm text-muted-foreground'>{selectedRental.renter?.phone}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Vai trò</Label>
                    <Badge variant="outline">{selectedRental.renter?.role}</Badge>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className='bg-orange-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-orange-900 mb-3'>Thông tin xe</h3>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Biển số xe</Label>
                    <p className='text-lg font-bold text-blue-600'>{selectedRental.vehicle?.licensePlate}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>ID xe</Label>
                    <p className='text-lg'>#{selectedRental.vehicle?.id}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Hãng/Model</Label>
                    <p className='text-lg'>{selectedRental.vehicle?.brand} {selectedRental.vehicle?.model}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Loại xe</Label>
                    <Badge className={selectedRental.vehicle?.type === 'motorbike' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                      {selectedRental.vehicle?.type === 'motorbike' ? 'Xe máy điện' :
                        selectedRental.vehicle?.type === 'car' ? 'Ô tô điện' : selectedRental.vehicle?.type}
                    </Badge>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Dung lượng pin</Label>
                    <p className='text-lg'>{selectedRental.vehicle?.capacity} kWh</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Tầm hoạt động</Label>
                    <p className='text-lg'>{selectedRental.vehicle?.rangePerFullCharge} km</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Loại pin</Label>
                    <p className='text-lg'>{selectedRental.vehicle?.batteryType}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Số ghế</Label>
                    <p className='text-lg'>{selectedRental.vehicle?.numberSeat} người</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Giá thuê</Label>
                    <p className='text-lg font-bold text-green-600'>{formatCurrency(selectedRental.vehicle?.pricePerHour)}/giờ</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Trạng thái xe</Label>
                    <Badge variant={selectedRental.vehicle?.status === 'available' ? 'default' : 'secondary'}>
                      {selectedRental.vehicle?.status === 'available' ? 'Có sẵn' :
                        selectedRental.vehicle?.status === 'rented' ? 'Đang thuê' :
                          selectedRental.vehicle?.status === 'maintenance' ? 'Bảo trì' : selectedRental.vehicle?.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Pin</Label>
                    <p className='text-lg font-bold text-green-600'>{selectedRental.vehicle?.batteryLevel}%</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Odo hiện tại</Label>
                    <p className='text-lg'>{selectedRental.vehicle?.odo?.toLocaleString()} km</p>
                  </div>
                </div>
              </div>

              {/* Battery and Odometer Information */}
              <div className='bg-purple-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-purple-900 mb-3'>Thông tin pin và quãng đường</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Pin lúc nhận xe</Label>
                    <p className='text-lg font-bold text-green-600'>{selectedRental.batteryLevelStart}%</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Pin lúc trả xe</Label>
                    <p className='text-lg font-bold text-orange-600'>
                      {selectedRental.batteryLevelEnd ? `${selectedRental.batteryLevelEnd}%` : 'Chưa trả'}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Odo lúc nhận xe</Label>
                    <p className='text-lg'>{selectedRental.odoStart?.toLocaleString()} km</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Odo lúc trả xe</Label>
                    <p className='text-lg'>
                      {selectedRental.odoEnd ? `${selectedRental.odoEnd?.toLocaleString()} km` : 'Chưa trả'}
                    </p>
                  </div>
                  {selectedRental.odoEnd && selectedRental.odoStart && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Quãng đường đi</Label>
                      <p className='text-lg font-bold text-blue-600'>
                        {(selectedRental.odoEnd - selectedRental.odoStart).toLocaleString()} km
                      </p>
                    </div>
                  )}
                  {selectedRental.totalDistance && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Tổng quãng đường</Label>
                      <p className='text-lg font-bold'>{selectedRental.totalDistance.toLocaleString()} km</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rental Status and Timing */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-gray-900 mb-3'>Trạng thái và thời gian</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Trạng thái lượt thuê</Label>
                    <div className='mt-1'>
                      {getRentalStatusBadge(selectedRental.status)}
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Loại thuê</Label>
                    <Badge className={selectedRental.rentalType === 'booking' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                      {selectedRental.rentalType === 'booking' ? 'Đặt trước' :
                        selectedRental.rentalType === 'walkin' ? 'Thuê tại chỗ' : selectedRental.rentalType}
                    </Badge>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Thời gian bắt đầu</Label>
                    <p className='text-lg'>{new Date(selectedRental.startTime).toLocaleString('vi-VN')}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Thời gian kết thúc</Label>
                    <p className='text-lg'>
                      {selectedRental.endTime ?
                        new Date(selectedRental.endTime).toLocaleString('vi-VN') :
                        'Chưa kết thúc'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className='bg-yellow-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-yellow-900 mb-3'>Thông tin thanh toán</h3>
                
                {/* Chi tiết các loại tiền */}
                <div className='grid grid-cols-3 gap-4 mb-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Chi phí thuê tạm tính</Label>
                    <p className='text-lg font-bold text-blue-600'>
                      {selectedRental.rentalCost ? formatCurrency(selectedRental.rentalCost) : 'Chưa tính'}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Bảo hiểm</Label>
                    <p className='text-lg font-bold text-purple-600'>
                      {selectedRental.insurance > 0 ? formatCurrency(selectedRental.insurance) : '0 ₫'}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Tiền cọc</Label>
                    <p className='text-lg font-bold text-orange-600'>
                      {selectedRental.depositAmount ? formatCurrency(selectedRental.depositAmount) : '0 ₫'}
                    </p>
                  </div>
                </div>

                {/* Trạng thái cọc */}
                <div className='mb-4'>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạng thái cọc</Label>
                  <div className='mt-1'>
                    <Badge variant={
                      selectedRental.depositStatus === 'held' ? 'secondary' :
                        selectedRental.depositStatus === 'returned' ? 'default' :
                          selectedRental.depositStatus === 'refunded' ? 'default' : 'outline'
                    }>
                      {selectedRental.depositStatus === 'held' ? 'Đang giữ' :
                        selectedRental.depositStatus === 'returned' ? 'Đã trả' :
                          selectedRental.depositStatus === 'refunded' ? 'Đã hoàn' :
                            selectedRental.depositStatus === 'pending' ? 'Chờ xử lý' : selectedRental.depositStatus}
                    </Badge>
                  </div>
                </div>

                {/* Tổng chi phí ở góc phải */}
                <div className='flex justify-end'>
                  <div className='bg-white p-4 rounded-lg border-2 border-yellow-300 shadow-sm'>
                    <Label className='text-sm font-medium text-muted-foreground block text-center'>Tổng chi phí</Label>
                    <p className='text-3xl font-bold text-green-600 text-center mt-1'>
                      {selectedRental.totalCost > 0 ? formatCurrency(selectedRental.totalCost) : 'Chưa tính'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Station Information */}
              <div className='bg-indigo-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-indigo-900 mb-3'>Thông tin trạm</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Trạm lấy xe</Label>
                    <p className='text-lg font-bold'>{selectedRental.stationPickup?.name}</p>
                    <p className='text-sm text-muted-foreground'>ID: #{selectedRental.stationPickup?.id}</p>
                    <p className='text-sm text-muted-foreground'>{selectedRental.stationPickup?.address}</p>
                    {selectedRental.stationPickup?.latitude && selectedRental.stationPickup?.longitude && (
                      <p className='text-xs text-muted-foreground'>
                        GPS: {selectedRental.stationPickup.latitude.toFixed(6)}, {selectedRental.stationPickup.longitude.toFixed(6)}
                      </p>
                    )}
                    <div className='flex items-center gap-2 mt-1'>
                      <Badge variant={selectedRental.stationPickup?.status === 'active' ? 'default' : 'secondary'}>
                        {selectedRental.stationPickup?.status === 'active' ? 'Hoạt động' : selectedRental.stationPickup?.status}
                      </Badge>
                    </div>
                  </div>
                  {selectedRental.vehicle?.station && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Trạm trả xe</Label>
                      <p className='text-lg font-bold'>{selectedRental.vehicle.station.name}</p>
                      <p className='text-sm text-muted-foreground'>ID: #{selectedRental.vehicle.station.id}</p>
                      <p className='text-sm text-muted-foreground'>{selectedRental.vehicle.station.address}</p>
                      {selectedRental.vehicle.station?.latitude && selectedRental.vehicle.station?.longitude && (
                        <p className='text-xs text-muted-foreground'>
                          GPS: {selectedRental.vehicle.station.latitude.toFixed(6)}, {selectedRental.vehicle.station.longitude.toFixed(6)}
                        </p>
                      )}
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge variant={selectedRental.vehicle.station?.status === 'active' ? 'default' : 'secondary'}>
                          {selectedRental.vehicle.station?.status === 'active' ? 'Hoạt động' : selectedRental.vehicle.station?.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Information */}
              <div className='bg-teal-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-teal-900 mb-3'>Thông tin nhân viên</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Nhân viên giao xe</Label>
                    {selectedRental.staffPickup ? (
                      <>
                        <p className='text-lg font-bold'>{selectedRental.staffPickup.fullName}</p>
                        <p className='text-sm text-muted-foreground'>ID: #{selectedRental.staffPickup.id}</p>
                        <p className='text-sm text-muted-foreground'>{selectedRental.staffPickup.email}</p>
                        <p className='text-sm text-muted-foreground'>{selectedRental.staffPickup.phone}</p>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge variant="outline">{selectedRental.staffPickup.role}</Badge>
                        </div>
                      </>
                    ) : (
                      <p className='text-lg text-gray-500'>Chưa có nhân viên</p>
                    )}
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Nhân viên nhận xe</Label>
                    {selectedRental.staffReturn ? (
                      <>
                        <p className='text-lg font-bold'>{selectedRental.staffReturn.fullName}</p>
                        <p className='text-sm text-muted-foreground'>ID: #{selectedRental.staffReturn.id}</p>
                        <p className='text-sm text-muted-foreground'>{selectedRental.staffReturn.email}</p>
                        <p className='text-sm text-muted-foreground'>{selectedRental.staffReturn.phone}</p>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge variant="outline">{selectedRental.staffReturn.role}</Badge>
                        </div>
                      </>
                    ) : (
                      <p className='text-lg text-gray-500'>Chưa trả xe</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowRentalDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentalsTab;
