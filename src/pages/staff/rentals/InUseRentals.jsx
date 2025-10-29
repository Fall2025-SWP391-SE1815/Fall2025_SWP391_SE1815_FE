import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import {
  Car,
  Clock,
  User,
  MapPin,
  RefreshCw,
  Phone,
  Calendar,
  DollarSign,
  Zap
} from 'lucide-react';

const InUseRentals = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inUseRentals, setInUseRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInUseRentals();
  }, []);

  // Fetch in-use rentals (status=in_use)
  const fetchInUseRentals = async () => {
    try {
      setLoading(true);
      const response = await staffRentalService.getRentals({ status: 'in_use' });
      console.log('In-use rentals response:', response);
      setInUseRentals(response || []);
    } catch (error) {
      console.error('Error fetching in-use rentals:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách xe đang cho thuê",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVehicleTypeName = (type) => {
    const types = {
      'car': 'Ô tô',
      'motorbike': 'Xe máy',
      'bicycle': 'Xe đạp',
      'scooter': 'Xe scooter'
    };
    return types[type?.toLowerCase()] || type;
  };

  const getRentalTypeName = (type) => {
    return type === 'booking' ? 'Đặt trước' : 'Walk-in';
  };

  const getDepositStatusBadge = (status) => {
    const variants = {
      'held': { variant: 'default', text: 'Đã giữ cọc' },
      'pending': { variant: 'secondary', text: 'Chờ cọc' },
      'returned': { variant: 'outline', text: 'Đã trả cọc' }
    };
    return variants[status] || { variant: 'default', text: status };
  };

  const filterRentals = (list) => {
    if (!searchTerm) return list;
    return list.filter(rental =>
      rental.renter.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.renter.phone.includes(searchTerm) ||
      rental.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.id.toString().includes(searchTerm)
    );
  };

  // Calculate remaining time
  const getRemainingTime = (endTime) => {
    if (!endTime) return null;
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return { text: 'Đã quá hạn', color: 'text-red-600' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return { text: `Còn ${minutes} phút`, color: 'text-orange-600' };
    } else if (hours < 24) {
      return { text: `Còn ${hours}h ${minutes}p`, color: 'text-blue-600' };
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return { text: `Còn ${days} ngày ${remainingHours}h`, color: 'text-green-600' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đang cho thuê</h1>
          <p className="text-muted-foreground">
            Danh sách xe đang được khách hàng sử dụng
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm khách hàng, SĐT, biển số..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Danh sách xe đang cho thuê
          </CardTitle>
          <CardDescription>
            Các xe hiện đang được khách hàng sử dụng (status: in_use)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filterRentals(inUseRentals).length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Không tìm thấy xe nào phù hợp' : 'Không có xe nào đang được cho thuê'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thông tin xe</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Thời gian thuê</TableHead>
                  <TableHead>Nhân viên giao</TableHead>
                  <TableHead>Tài chính</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterRentals(inUseRentals).map((rental) => {
                  const remainingTime = getRemainingTime(rental.endTime);
                  const depositBadge = getDepositStatusBadge(rental.depositStatus);

                  return (
                    <TableRow key={rental.id}>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            {rental.vehicle.licensePlate}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {rental.vehicle.brand} {rental.vehicle.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getVehicleTypeName(rental.vehicle.type)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-fit text-xs">
                              {getRentalTypeName(rental.rentalType)}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Zap className="h-3 w-3" />
                              {rental.vehicle.capacity}% - {rental.vehicle.rangePerFullCharge}km
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {rental.renter.fullName}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {rental.renter.phone}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {rental.renter.email}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">
                              Bắt đầu: {formatDateTime(rental.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="text-sm text-muted-foreground">
                              Dự kiến: {formatDateTime(rental.endTime)}
                            </span>
                          </div>
                          {remainingTime && (
                            <div className={`text-sm font-semibold ${remainingTime.color}`}>
                              {remainingTime.text}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {rental.stationPickup.name}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          {rental.staffPickup && (
                            <>
                              <div className="font-medium text-sm">
                                {rental.staffPickup.fullName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {rental.staffPickup.phone}
                              </div>
                            </>
                          )}
                          {!rental.staffPickup && (
                            <span className="text-sm text-muted-foreground">Chưa có</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Tổng tiền</span>
                              <span className="font-medium text-sm">
                                {formatCurrency(rental.totalCost)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Đặt cọc</span>
                              <span className="font-medium text-sm">
                                {formatCurrency(rental.depositAmount)}
                              </span>
                            </div>
                          </div>
                          <Badge variant={depositBadge.variant} className="w-fit text-xs">
                            {depositBadge.text}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600 w-fit">
                            Đang sử dụng
                          </Badge>
                          {rental.totalDistance && (
                            <div className="text-sm text-muted-foreground">
                              Quãng đường: {rental.totalDistance} km
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Mã thuê #: {rental.id}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      {filterRentals(inUseRentals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thống kê</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filterRentals(inUseRentals).length}
                </div>
                <div className="text-sm text-muted-foreground">Tổng xe đang thuê</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filterRentals(inUseRentals).filter(r => r.rentalType === 'booking').length}
                </div>
                <div className="text-sm text-muted-foreground">Đặt trước</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(
                    filterRentals(inUseRentals).reduce((sum, r) => sum + (r.totalCost || 0), 0)
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Tổng doanh thu</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InUseRentals;
