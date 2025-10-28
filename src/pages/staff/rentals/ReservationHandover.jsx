import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import {
  Car,
  Clock,
  User,
  MapPin,
  Camera,
  PenTool,
  CheckCircle,
  RefreshCw,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react';

const ReservationHandover = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [pendingRentals, setPendingRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);

  // Form states
  const [checkInForm, setCheckInForm] = useState({
    depositAmount: ''
  });

  const [pickupForm, setPickupForm] = useState({
    condition_report: '',
    photo_url: null,
    customer_signature_url: null,
    staff_signature_url: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchReservations(),
      fetchPendingRentals()
    ]);
  };

  // Fetch reservations with status=pending
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await staffRentalService.getReservations({ status: 'pending' });
      console.log('Reservations response:', response);
      setReservations(response || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách đặt chỗ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending rentals (status=booked, ready for pickup)
  const fetchPendingRentals = async () => {
    try {
      setLoading(true);
      const response = await staffRentalService.getRentals({ status: 'booked' });
      console.log('Pending rentals response:', response);
      setPendingRentals(response || []);
    } catch (error) {
      console.error('Error fetching pending rentals:', error);
      if (error.status === 403) {
        toast({
          title: "Lỗi truy cập",
          description: "Nhân viên chưa được phân công trạm làm việc",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách xe cần giao",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle check-in button click
  const handleCheckIn = async (reservation) => {
    setSelectedReservation(reservation);
    const totalCost = calculateTotalCost(reservation);
    const suggestedDeposit = totalCost > 0 ? Math.round(totalCost * 0.3) : 0;
    
    setCheckInForm({
      depositAmount: suggestedDeposit.toString()
    });
    setCheckInDialogOpen(true);
  };

  // Submit check-in
  const submitCheckIn = async () => {
    try {
      if (!checkInForm.depositAmount || !selectedReservation) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng nhập số tiền đặt cọc",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      const stationId = selectedReservation.vehicle?.station?.id;

      if (!stationId) {
        toast({
          title: "Lỗi dữ liệu",
          description: "Không tìm thấy thông tin trạm trong đặt chỗ",
          variant: "destructive",
        });
        return;
      }

      // API check-in request - Do NOT include vehicleId for reservation
      const requestData = {
        renterId: parseInt(selectedReservation.renter.id),
        reservationId: parseInt(selectedReservation.id),
        stationId: parseInt(stationId),
        startTime: selectedReservation.reservedStartTime,
        endTime: selectedReservation.reservedEndTime,
        depositAmount: parseFloat(checkInForm.depositAmount)
      };

      console.log('Check-in request data:', requestData);

      const response = await staffRentalService.checkIn(requestData);

      toast({
        title: "Thành công",
        description: "Check-in thành công. Khách hàng đã nhận xe và đặt cọc đã được ghi nhận.",
      });

      setCheckInDialogOpen(false);
      await loadData(); // Refresh both lists

    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thực hiện check-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle pickup check button click
  const handlePickupCheck = async (rental) => {
    setSelectedRental(rental);
    setPickupForm({
      condition_report: '',
      photo_url: null,
      customer_signature_url: null,
      staff_signature_url: null
    });
    setPickupDialogOpen(true);
  };

  // Submit pickup check
  const submitPickupCheck = async () => {
    try {
      if (!pickupForm.condition_report || 
          !pickupForm.photo_url || 
          !pickupForm.customer_signature_url || 
          !pickupForm.staff_signature_url) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin biên bản và chọn 3 file ảnh",
          variant: "destructive",
        });
        return;
      }

      const validateFile = (file, name) => {
        if (!(file instanceof File)) {
          toast({
            title: "Lỗi file",
            description: `${name} phải là file ảnh`,
            variant: "destructive",
          });
          return false;
        }
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Lỗi định dạng",
            description: `${name} phải là file ảnh (JPG, PNG, GIF, v.v.)`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      };

      if (!validateFile(pickupForm.photo_url, "Ảnh xe") ||
          !validateFile(pickupForm.customer_signature_url, "Chữ ký khách hàng") ||
          !validateFile(pickupForm.staff_signature_url, "Chữ ký nhân viên")) {
        return;
      }

      setLoading(true);

      const formData = new FormData();
      const requestData = {
        rentalId: selectedRental.id,
        checkType: "pickup",
        conditionReport: pickupForm.condition_report
      };
      formData.append('data', JSON.stringify(requestData));
      formData.append('photo', pickupForm.photo_url);
      formData.append('staff_signature', pickupForm.staff_signature_url);
      formData.append('customer_signature', pickupForm.customer_signature_url);

      await staffRentalService.confirmPickup(formData);

      toast({
        title: "Thành công",
        description: "Xác nhận giao xe thành công! Khách hàng đã nhận xe.",
      });

      setPickupDialogOpen(false);
      setPickupForm({
        condition_report: '',
        photo_url: null,
        customer_signature_url: null,
        staff_signature_url: null
      });
      await loadData();

    } catch (error) {
      console.error('Error confirming pickup:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác nhận giao xe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hold deposit API
  const holdDeposit = async (rentalId, depositAmount) => {
    try {
      setLoading(true);
      await staffRentalService.holdDeposit(rentalId, {
        amount: depositAmount
      });

      toast({
        title: "Thành công",
        description: "Đã ghi nhận đặt cọc từ khách hàng thành công",
      });

      fetchPendingRentals();
    } catch (error) {
      console.error('Error holding deposit:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể ghi nhận đặt cọc",
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

  const calculateTotalCost = (item) => {
    if (item?.totalCost && typeof item.totalCost === 'number') {
      return item.totalCost;
    }
    
    if (!item || !item.vehicle || !item.reservedStartTime || !item.reservedEndTime) {
      return 0;
    }
    
    const startTime = new Date(item.reservedStartTime);
    const endTime = new Date(item.reservedEndTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return 0;
    }
    
    const durationInHours = Math.max(0, (endTime - startTime) / (1000 * 60 * 60));
    const pricePerHour = item.vehicle.pricePerHour || 0;
    
    return Math.round(durationInHours * pricePerHour);
  };

  const filterReservations = (list) => {
    if (!searchTerm) return list;
    return list.filter(item => 
      item.renter.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.renter.phone.includes(searchTerm) ||
      item.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm)
    );
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đặt chỗ & Giao xe</h1>
          <p className="text-muted-foreground">
            Quản lý check-in đặt chỗ và giao xe cho khách hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm khách hàng, SĐT, biển số..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Reservations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Danh sách đặt chỗ chờ check-in
          </CardTitle>
          <CardDescription>
            Các đặt chỗ từ khách hàng cần xác nhận và check-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filterReservations(reservations).length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Không tìm thấy đặt chỗ nào phù hợp' : 'Không có đặt chỗ nào chờ check-in'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thông tin xe</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Thời gian đặt</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterReservations(reservations).map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          {reservation.vehicle.licensePlate}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.vehicle.brand} {reservation.vehicle.model}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {reservation.renter.fullName}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {reservation.renter.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            Bắt đầu: {formatDateTime(reservation.reservedStartTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">
                            Kết thúc: {formatDateTime(reservation.reservedEndTime)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {reservation.status === 'pending' ? 'Chờ check-in' : reservation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(reservation)}
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check-in
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Rentals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Danh sách xe cần giao
          </CardTitle>
          <CardDescription>
            Các lượt thuê đã check-in, sẵn sàng giao xe cho khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filterRentals(pendingRentals).length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Không tìm thấy xe nào phù hợp' : 'Không có xe nào cần giao'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thông tin xe</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Thời gian giao</TableHead>
                  <TableHead>Đặt cọc</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái cọc</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterRentals(pendingRentals).map((rental) => (
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
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {formatDateTime(rental.startTime)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {rental.stationPickup.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          {formatCurrency(rental.depositAmount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          {formatCurrency(calculateTotalCost(rental))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        rental.depositStatus === 'held' ? 'default' : 
                        rental.depositStatus === 'pending' ? 'secondary' : 'outline'
                      }>
                        {rental.depositStatus === 'held' ? 'Đã nhận cọc' :
                         rental.depositStatus === 'pending' ? 'Chờ nhận cọc' : rental.depositStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {rental.depositStatus === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => holdDeposit(rental.id, rental.depositAmount)}
                            disabled={loading}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Ghi nhận cọc
                          </Button>
                        )}
                        
                        {rental.depositStatus === 'held' && (
                          <Button
                            size="sm"
                            onClick={() => handlePickupCheck(rental)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Xác nhận giao xe
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Check-in Dialog */}
      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Check-in khách hàng
            </DialogTitle>
            <DialogDescription>
              Xác nhận check-in cho: {selectedReservation?.renter.fullName} - {selectedReservation?.vehicle.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Thông tin đặt chỗ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Biển số</Label>
                    <p className="font-medium">{selectedReservation?.vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Khách hàng</Label>
                    <p className="font-medium">{selectedReservation?.renter.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Thời gian bắt đầu</Label>
                    <p className="font-medium">{formatDateTime(selectedReservation?.reservedStartTime)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Thời gian kết thúc</Label>
                    <p className="font-medium">{formatDateTime(selectedReservation?.reservedEndTime)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">Tổng chi phí</span>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(calculateTotalCost(selectedReservation))}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">Đề xuất cọc (30%)</span>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(Math.round(calculateTotalCost(selectedReservation) * 0.3))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Số tiền đặt cọc (VND) *</Label>
              <div className="flex gap-2">
                <DollarSign className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="500000"
                  value={checkInForm.depositAmount}
                  onChange={(e) => setCheckInForm({ depositAmount: e.target.value })}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const suggestedAmount = Math.round(calculateTotalCost(selectedReservation) * 0.3);
                    setCheckInForm({ depositAmount: suggestedAmount.toString() });
                  }}
                >
                  Áp dụng 30%
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitCheckIn} disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pickup Dialog */}
      <Dialog open={pickupDialogOpen} onOpenChange={setPickupDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Xác nhận giao xe
            </DialogTitle>
            <DialogDescription>
              Lập biên bản giao xe cho: {selectedRental?.renter.fullName} - {selectedRental?.vehicle.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Báo cáo tình trạng xe *</Label>
              <Textarea
                id="condition"
                placeholder="Mô tả chi tiết tình trạng xe..."
                value={pickupForm.condition_report}
                onChange={(e) => setPickupForm(prev => ({ ...prev, condition_report: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Ảnh xe *</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setPickupForm(prev => ({ ...prev, photo_url: file }));
                  }}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" disabled>
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              {pickupForm.photo_url && (
                <p className="text-sm text-green-600">✓ Đã chọn: {pickupForm.photo_url.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chữ ký khách hàng *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setPickupForm(prev => ({ ...prev, customer_signature_url: file }));
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" disabled>
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
                {pickupForm.customer_signature_url && (
                  <p className="text-sm text-green-600">✓ Đã chọn: {pickupForm.customer_signature_url.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Chữ ký nhân viên *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setPickupForm(prev => ({ ...prev, staff_signature_url: file }));
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" disabled>
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
                {pickupForm.staff_signature_url && (
                  <p className="text-sm text-green-600">✓ Đã chọn: {pickupForm.staff_signature_url.name}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPickupDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitPickupCheck} disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận giao xe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReservationHandover;
