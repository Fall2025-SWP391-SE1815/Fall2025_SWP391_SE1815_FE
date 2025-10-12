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
import { Search, Filter, Eye, RefreshCw } from 'lucide-react';
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
            placeholder='Tìm kiếm lượt thuê...'
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
          <SelectContent position="popper" side="bottom" style={{ zIndex: 9999 }}>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            <SelectItem value='booked'>Đã đặt</SelectItem>
            <SelectItem value='in_use'>Đang thuê</SelectItem>
            <SelectItem value='waiting_for_payment'>Chờ thanh toán</SelectItem>
            <SelectItem value='returned'>Đã trả</SelectItem>
            <SelectItem value='cancelled'>Đã hủy</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={fetchRentals} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
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
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Người thuê</Label>
                  <p className='text-lg font-semibold'>{selectedRental.renter?.fullName || 'N/A'}</p>
                  <p className='text-sm text-muted-foreground'>{selectedRental.renter?.email}</p>
                  <p className='text-sm text-muted-foreground'>{selectedRental.renter?.phone}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Xe</Label>
                  <p className='text-lg'>{selectedRental.vehicle?.licensePlate}</p>
                  <p className='text-sm text-muted-foreground'>{selectedRental.vehicle?.brand} {selectedRental.vehicle?.model}</p>
                  <p className='text-sm text-muted-foreground'>Loại: {selectedRental.vehicle?.type}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạng thái</Label>
                  <div className='mt-1'>
                    {getRentalStatusBadge(selectedRental.status)}
                  </div>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Chi phí</Label>
                  <p className='text-lg font-bold'>
                    {selectedRental.totalCost > 0 ? formatCurrency(selectedRental.totalCost) : 'Chưa tính'}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
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

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạm nhận xe</Label>
                  <p className='text-lg'>{selectedRental.stationPickup?.name}</p>
                  <p className='text-sm text-muted-foreground'>{selectedRental.stationPickup?.address}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạm trả xe</Label>
                  <p className='text-lg'>
                    {selectedRental.stationReturn?.name || 'Chưa trả xe'}
                  </p>
                  {selectedRental.stationReturn && (
                    <p className='text-sm text-muted-foreground'>{selectedRental.stationReturn?.address}</p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Nhân viên nhận xe</Label>
                  <p className='text-lg'>{selectedRental.staffPickup?.fullName}</p>
                  <p className='text-sm text-muted-foreground'>{selectedRental.staffPickup?.email}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Nhân viên trả xe</Label>
                  <p className='text-lg'>
                    {selectedRental.staffReturn?.fullName || 'Chưa trả xe'}
                  </p>
                  {selectedRental.staffReturn && (
                    <p className='text-sm text-muted-foreground'>{selectedRental.staffReturn?.email}</p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Loại thuê</Label>
                  <p className='text-lg capitalize'>{selectedRental.rentalType}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Tiền cọc</Label>
                  <p className='text-lg font-bold'>
                    {selectedRental.depositAmount ? formatCurrency(selectedRental.depositAmount) : 'Không có'}
                  </p>
                  <p className='text-sm text-muted-foreground'>Trạng thái: {selectedRental.depositStatus}</p>
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
