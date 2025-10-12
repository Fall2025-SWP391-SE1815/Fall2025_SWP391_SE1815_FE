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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  FileText,
  Camera,
  PenTool,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react';

const RentalManagement = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('handover');
  const [loading, setLoading] = useState(false);
  const [pendingRentals, setPendingRentals] = useState([]);
  const [returningRentals, setReturningRentals] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [inUseRentals, setInUseRentals] = useState([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Form states
  const [pickupForm, setPickupForm] = useState({
    condition_report: '',
    photo_url: '',
    customer_signature_url: '',
    staff_signature_url: ''
  });

  const [checkInForm, setCheckInForm] = useState({
    depositAmount: '',
    condition_report: '',
    photo_url: '',
    customer_signature_url: '',
    staff_signature_url: ''
  });

  const [returnForm, setReturnForm] = useState({
    condition_report: '',
    photo_url: '',
    customer_signature_url: '',
    staff_signature_url: ''
  });

  // All data now comes from real API calls

  useEffect(() => {
    fetchPendingRentals();
    fetchReturningRentals();
    fetchReservations();
    fetchInUseRentals();
  }, []);

  const fetchPendingRentals = async () => {
    try {
      setLoading(true);
      // Call real API to get pending rentals (status=booked means ready for pickup)
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

  const fetchReturningRentals = async () => {
    try {
      setLoading(true);
      // Call real API to get returning rentals (status=returned means ready for return processing)
      const response = await staffRentalService.getRentals({ status: 'returned' });
      console.log('Returning rentals response:', response);
      setReturningRentals(response || []);

    } catch (error) {
      console.error('Error fetching returning rentals:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách xe cần nhận",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Call real API to get reservations
      const response = await staffRentalService.getReservations();
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

  const fetchInUseRentals = async () => {
    try {
      setLoading(true);
      // Call real API to get in-use rentals (status=in_use)
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

  const handlePickupCheck = async (rental) => {
    setSelectedRental(rental);
    setPickupForm({
      condition_report: '',
      photo_url: '',
      customer_signature_url: '',
      staff_signature_url: ''
    });
    setPickupDialogOpen(true);
  };

  const handleReturnCheck = async (rental) => {
    setSelectedRental(rental);
    setReturnForm({
      condition_report: '',
      photo_url: '',
      customer_signature_url: '',
      staff_signature_url: ''
    });
    setReturnDialogOpen(true);
  };

  const handleCheckIn = async (reservation) => {
    setSelectedReservation(reservation);
    setCheckInForm({
      depositAmount: '',
      condition_report: '',
      photo_url: '',
      customer_signature_url: '',
      staff_signature_url: ''
    });
    setCheckInDialogOpen(true);
  };

  const submitPickupCheck = async () => {
    try {
      if (!pickupForm.condition_report || !pickupForm.photo_url ||
        !pickupForm.customer_signature_url || !pickupForm.staff_signature_url) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin biên bản và tải lên các file cần thiết",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Create FormData for multipart form submission
      const formData = new FormData();
      
      // Add the required data field as JSON string (theo đúng format API)
      const requestData = {
        rentalId: selectedRental.id,
        checkType: "pickup",
        conditionReport: pickupForm.condition_report
      };
      formData.append('data', JSON.stringify(requestData));

      // Add file fields - trong thực tế sẽ là File objects
      // Hiện tại dùng URLs tạm thời
      if (pickupForm.photo_url instanceof File) {
        formData.append('photo', pickupForm.photo_url);
      } else {
        // Convert URL to blob/file if needed, or handle URL case
        const blob = new Blob([pickupForm.photo_url], { type: 'text/plain' });
        formData.append('photo', blob, 'photo.txt');
      }

      if (pickupForm.staff_signature_url instanceof File) {
        formData.append('staff_signature', pickupForm.staff_signature_url);
      } else {
        const blob = new Blob([pickupForm.staff_signature_url], { type: 'text/plain' });
        formData.append('staff_signature', blob, 'staff_signature.txt');
      }

      if (pickupForm.customer_signature_url instanceof File) {
        formData.append('customer_signature', pickupForm.customer_signature_url);
      } else {
        const blob = new Blob([pickupForm.customer_signature_url], { type: 'text/plain' });
        formData.append('customer_signature', blob, 'customer_signature.txt');
      }

      // Call the confirm-pickup API through service
      const response = await staffRentalService.confirmPickup(formData);

      toast({
        title: "Thành công",
        description: "Xác nhận giao xe thành công! Khách hàng đã nhận xe.",
      });

      setPickupDialogOpen(false);
      // Refresh both lists - remove from pending and add to in-use
      await Promise.all([
        fetchPendingRentals(),
        fetchInUseRentals()
      ]);

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

  const submitReturnCheck = async () => {
    try {
      if (!returnForm.condition_report || !returnForm.photo_url ||
        !returnForm.customer_signature_url || !returnForm.staff_signature_url) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin biên bản",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Call real API for return check-in
      const response = await staffRentalService.checkIn({
        rental_id: selectedRental.id,
        check_type: "return",
        condition_report: returnForm.condition_report,
        photo_url: returnForm.photo_url,
        customer_signature_url: returnForm.customer_signature_url,
        staff_signature_url: returnForm.staff_signature_url
      });

      toast({
        title: "Thành công",
        description: "Biên bản nhận xe đã được lưu thành công",
      });

      setReturnDialogOpen(false);
      fetchReturningRentals(); // Refresh the list

    } catch (error) {
      console.error('Error submitting return check:', error);
      if (error.status === 400) {
        toast({
          title: "Lỗi",
          description: "Lượt thuê không hợp lệ để lập biên bản return",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể lưu biên bản nhận xe",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

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

      // Debug: log the reservation data to see available fields
      console.log('Selected reservation data:', selectedReservation);

      // Get station ID from the correct field path based on API response
      const stationId = selectedReservation.vehicle?.station?.id;

      if (!stationId) {
        toast({
          title: "Lỗi dữ liệu",
          description: "Không tìm thấy thông tin trạm trong đặt chỗ",
          variant: "destructive",
        });
        return;
      }

      // For booking (reservation), only send reservationId, not vehicleId
      const requestData = {
        renterId: parseInt(selectedReservation.renter.id),
        reservationId: parseInt(selectedReservation.id),
        stationId: parseInt(stationId),
        startTime: selectedReservation.reservedStartTime,
        endTime: selectedReservation.reservedEndTime,
        depositAmount: parseFloat(checkInForm.depositAmount)
      };
      // Note: Do NOT include vehicleId for booking/reservation check-in

      console.log('Check-in request data (booking):', requestData);

      // Validate required fields for booking
      const missingFields = [];
      if (!requestData.renterId || isNaN(requestData.renterId)) missingFields.push('renterId');
      if (!requestData.reservationId || isNaN(requestData.reservationId)) missingFields.push('reservationId');
      if (!requestData.stationId || isNaN(requestData.stationId)) missingFields.push('stationId');
      if (!requestData.depositAmount || isNaN(requestData.depositAmount)) missingFields.push('depositAmount');
      if (!requestData.startTime) missingFields.push('startTime');
      if (!requestData.endTime) missingFields.push('endTime');

      if (missingFields.length > 0) {
        toast({
          title: "Lỗi dữ liệu",
          description: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Call real API for check-in with reservation data
      const response = await staffRentalService.checkIn(requestData);

      toast({
        title: "Thành công",
        description: "Check-in thành công. Khách hàng đã nhận xe và đặt cọc đã được ghi nhận.",
      });

      setCheckInDialogOpen(false);
      
      // Refresh all lists to update the UI properly
      await Promise.all([
        fetchReservations(), // Remove the checked-in reservation from the list
        fetchPendingRentals(), // Add the new rental to pending rentals list
        fetchInUseRentals(), // In case rental goes directly to in-use
        fetchReturningRentals() // Refresh all lists for consistency
      ]);

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



  const confirmReturn = async (rentalId) => {
    try {
      setLoading(true);

      // Call real API to confirm return
      const response = await staffRentalService.confirmReturn({
        rental_id: rentalId
      });

      toast({
        title: "Thành công",
        description: "Xe đã được trả thành công. Rental đã chuyển sang trạng thái returned.",
      });

      fetchReturningRentals(); // Refresh the list

    } catch (error) {
      console.error('Error confirming return:', error);
      if (error.status === 400) {
        toast({
          title: "Lỗi",
          description: "Cần lập biên bản nhận xe trước khi xác nhận",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể xác nhận nhận xe",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const holdDeposit = async (rentalId, depositAmount) => {
    try {
      setLoading(true);

      // Call real API to hold deposit
      const response = await staffRentalService.holdDeposit(rentalId, {
        amount: depositAmount
      });

      toast({
        title: "Thành công",
        description: "Đã ghi nhận đặt cọc từ khách hàng thành công",
      });

      fetchPendingRentals(); // Refresh the list to update deposit status

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

  // Filter functions
  const filterRentals = (rentals) => {
    if (!searchTerm) return rentals;
    return rentals.filter(rental => 
      rental.renter.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.renter.phone.includes(searchTerm) ||
      rental.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.id.toString().includes(searchTerm)
    );
  };

  const filterReservations = (reservations) => {
    // Filter to only show reservations that can be checked in
    // Exclude reservations that already have a corresponding rental (already checked in)
    const checkInableReservations = reservations.filter(reservation => {
      // Only show pending or confirmed reservations
      if (reservation.status !== 'pending' && reservation.status !== 'confirmed') {
        return false;
      }
      
      // Check if this reservation already has a corresponding rental in any of the rental lists
      const alreadyCheckedIn = 
        // Check in pending rentals (status: booked)
        pendingRentals.some(rental => 
          rental.reservationId === reservation.id || 
          (rental.vehicle?.id === reservation.vehicle?.id && 
           rental.renter?.id === reservation.renter?.id &&
           rental.rentalType === 'booking')
        ) ||
        // Check in in-use rentals (status: in_use)
        inUseRentals.some(rental => 
          rental.reservationId === reservation.id || 
          (rental.vehicle?.id === reservation.vehicle?.id && 
           rental.renter?.id === reservation.renter?.id &&
           rental.rentalType === 'booking')
        ) ||
        // Check in returning rentals (status: returned)
        returningRentals.some(rental => 
          rental.reservationId === reservation.id || 
          (rental.vehicle?.id === reservation.vehicle?.id && 
           rental.renter?.id === reservation.renter?.id &&
           rental.rentalType === 'booking')
        );
      
      return !alreadyCheckedIn;
    });
    
    if (!searchTerm) return checkInableReservations;
    return checkInableReservations.filter(reservation => 
      reservation.renter.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.renter.phone.includes(searchTerm) ||
      reservation.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.id.toString().includes(searchTerm)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý giao - nhận xe</h1>
          <p className="text-muted-foreground">
            Xử lý các yêu cầu giao xe và nhận xe từ khách hàng
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              placeholder="Tìm kiếm khách hàng, SĐT, biển số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
          </div>
          <Button onClick={() => {
            fetchPendingRentals();
            fetchReturningRentals();
            fetchReservations();
            fetchInUseRentals();
          }} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="handover" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Đặt chỗ & Giao xe ({filterReservations(reservations).length + filterRentals(pendingRentals).length})
          </TabsTrigger>
          <TabsTrigger value="in-use" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Đang cho thuê ({filterRentals(inUseRentals).length})
          </TabsTrigger>
          <TabsTrigger value="return" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Nhận xe ({filterRentals(returningRentals).length})
          </TabsTrigger>
        </TabsList>

        {/* Handover Tab - Combines Reservations and Pickup */}
        <TabsContent value="handover" className="space-y-4">
          {/* Reservations Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Danh sách đặt chỗ chờ check-in
              </CardTitle>
              <CardDescription>
                Các đặt chỗ từ khách hàng cần xác nhận và giao xe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filterReservations(reservations).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'Không tìm thấy đặt chỗ nào phù hợp' 
                      : 'Không có đặt chỗ nào chờ check-in'
                    }
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Các đặt chỗ đã được check-in sẽ xuất hiện ở phần "Danh sách xe cần giao" bên dưới
                    </p>
                  )}
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
                            <div className="text-sm text-muted-foreground">
                              {reservation.vehicle.type}
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
                            <div className="text-sm text-muted-foreground">
                              Đặt lúc: {formatDateTime(reservation.createdAt)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={reservation.status === 'cancelled' ? 'destructive' : 'default'}>
                            {reservation.status === 'cancelled' ? 'Đã hủy' : 
                             reservation.status === 'confirmed' ? 'Đã xác nhận' :
                             reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(reservation.status === 'confirmed' || reservation.status === 'pending') && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(reservation)}
                              disabled={loading}
                              className="w-full"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Check-in
                            </Button>
                          )}
                          {reservation.status === 'cancelled' && (
                            <div className="text-center">
                              <Badge variant="destructive" className="text-xs">
                                Đã hủy
                              </Badge>
                            </div>
                          )}
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
                Các lượt thuê đã được check-in và sẵn sàng giao xe cho khách hàng. Ghi nhận đặt cọc trước khi giao xe.
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
                            {rental.rentalType === 'booking' && (
                              <Badge variant="outline" className="w-fit">
                                Đặt trước
                              </Badge>
                            )}
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
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">
                                {formatCurrency(rental.depositAmount)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">
                                {formatCurrency(rental.totalCost)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge variant={
                              rental.depositStatus === 'held' ? 'default' : 
                              rental.depositStatus === 'pending' ? 'secondary' :
                              rental.depositStatus === 'returned' ? 'outline' : 'destructive'
                            }>
                              {rental.depositStatus === 'held' ? 'Đã nhận cọc' :
                               rental.depositStatus === 'pending' ? 'Chờ nhận cọc' :
                               rental.depositStatus === 'returned' ? 'Đã trả cọc' : rental.depositStatus}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {rental.depositStatus === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => holdDeposit(rental.id, rental.depositAmount)}
                                disabled={loading}
                                className="w-full"
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
                                className="w-full"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Xác nhận giao xe
                              </Button>
                            )}

                            {rental.depositStatus === 'pending' && (
                              <div className="text-center py-2">
                                <p className="text-xs text-muted-foreground">
                                  Ghi nhận cọc trước khi giao xe
                                </p>
                              </div>
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
        </TabsContent>

        {/* In-Use Tab */}
        <TabsContent value="in-use" className="space-y-4">
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
                      <TableHead>Đặt cọc</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterRentals(inUseRentals).map((rental) => (
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
                              {rental.vehicle.type}
                            </div>
                            {rental.rentalType === 'booking' && (
                              <Badge variant="outline" className="w-fit">
                                Đặt trước
                              </Badge>
                            )}
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
                              <span className="font-medium text-sm">
                                Bắt đầu: {formatDateTime(rental.startTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm text-muted-foreground">
                                Kết thúc: {formatDateTime(rental.endTime)}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {rental.stationPickup.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">
                                {formatCurrency(rental.depositAmount)}
                              </span>
                            </div>
                            <Badge variant="default" className="w-fit">
                              {rental.depositStatus === 'held' ? 'Đã nhận cọc' : rental.depositStatus}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">
                                {formatCurrency(rental.totalCost)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                              Đang sử dụng
                            </Badge>
                            {rental.totalDistance && (
                              <div className="text-sm text-muted-foreground">
                                {rental.totalDistance} km
                              </div>
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
        </TabsContent>

        {/* Return Tab */}
        <TabsContent value="return" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Danh sách xe cần nhận
              </CardTitle>
              <CardDescription>
                Các lượt thuê sắp kết thúc và cần nhận xe từ khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filterRentals(returningRentals).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Không tìm thấy xe nào phù hợp' : 'Không có xe nào cần nhận'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thông tin xe</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Thời gian trả dự kiến</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterRentals(returningRentals).map((rental) => (
                      <TableRow key={rental.id}>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {rental.vehicle.licensePlate}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rental.vehicle.type}
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
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">
                                {formatDateTime(rental.endTime)}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {rental.stationReturn?.name || rental.stationPickup.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReturnCheck(rental)}
                              className="w-full"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Lập biên bản
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => confirmReturn(rental.id)}
                              disabled={loading}
                              className="w-full"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Xác nhận nhận
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Pickup Check Dialog */}
      <Dialog open={pickupDialogOpen} onOpenChange={setPickupDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Xác nhận giao xe
            </DialogTitle>
            <DialogDescription>
              Xác nhận giao xe và lập biên bản cho: {selectedRental?.renter.fullName} - {selectedRental?.vehicle.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Vehicle Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Thông tin xe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Biển số</Label>
                    <p className="font-medium">{selectedRental?.vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Loại xe</Label>
                    <p className="font-medium">{selectedRental?.vehicle.brand} {selectedRental?.vehicle.model}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Condition Report */}
            <div className="space-y-2">
              <Label htmlFor="condition">Báo cáo tình trạng xe *</Label>
              <Textarea
                id="condition"
                placeholder="Mô tả chi tiết tình trạng xe (vết xước, hỏng hóc, mức pin, v.v.)"
                value={pickupForm.condition_report}
                onChange={(e) => setPickupForm(prev => ({ ...prev, condition_report: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photo">URL ảnh xe *</Label>
              <div className="flex gap-2">
                <Input
                  id="photo"
                  placeholder="https://example.com/vehicle-photo.jpg"
                  value={pickupForm.photo_url}
                  onChange={(e) => setPickupForm(prev => ({ ...prev, photo_url: e.target.value }))}
                />
                <Button variant="outline" size="icon">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-signature">Chữ ký khách hàng *</Label>
                <div className="flex gap-2">
                  <Input
                    id="customer-signature"
                    placeholder="URL chữ ký khách hàng"
                    value={pickupForm.customer_signature_url}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, customer_signature_url: e.target.value }))}
                  />
                  <Button variant="outline" size="icon">
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff-signature">Chữ ký nhân viên *</Label>
                <div className="flex gap-2">
                  <Input
                    id="staff-signature"
                    placeholder="URL chữ ký nhân viên"
                    value={pickupForm.staff_signature_url}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, staff_signature_url: e.target.value }))}
                  />
                  <Button variant="outline" size="icon">
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
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

      {/* Return Check Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Biên bản nhận lại xe
            </DialogTitle>
            <DialogDescription>
              Lập biên bản nhận xe từ: {selectedRental?.renter.fullName} - {selectedRental?.vehicle.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Vehicle Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Thông tin xe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Biển số</Label>
                    <p className="font-medium">{selectedRental?.vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Loại xe</Label>
                    <p className="font-medium">{selectedRental?.vehicle.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Condition Report */}
            <div className="space-y-2">
              <Label htmlFor="return-condition">Báo cáo tình trạng xe khi nhận *</Label>
              <Textarea
                id="return-condition"
                placeholder="Mô tả chi tiết tình trạng xe khi nhận lại (vết xước mới, hỏng hóc, mức pin, v.v.)"
                value={returnForm.condition_report}
                onChange={(e) => setReturnForm(prev => ({ ...prev, condition_report: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="return-photo">URL ảnh xe khi nhận *</Label>
              <div className="flex gap-2">
                <Input
                  id="return-photo"
                  placeholder="https://example.com/vehicle-return-photo.jpg"
                  value={returnForm.photo_url}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, photo_url: e.target.value }))}
                />
                <Button variant="outline" size="icon">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="return-customer-signature">Chữ ký khách hàng *</Label>
                <div className="flex gap-2">
                  <Input
                    id="return-customer-signature"
                    placeholder="URL chữ ký khách hàng"
                    value={returnForm.customer_signature_url}
                    onChange={(e) => setReturnForm(prev => ({ ...prev, customer_signature_url: e.target.value }))}
                  />
                  <Button variant="outline" size="icon">
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="return-staff-signature">Chữ ký nhân viên *</Label>
                <div className="flex gap-2">
                  <Input
                    id="return-staff-signature"
                    placeholder="URL chữ ký nhân viên"
                    value={returnForm.staff_signature_url}
                    onChange={(e) => setReturnForm(prev => ({ ...prev, staff_signature_url: e.target.value }))}
                  />
                  <Button variant="outline" size="icon">
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitReturnCheck} disabled={loading}>
              <FileText className="h-4 w-4 mr-2" />
              Lưu biên bản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog for Reservations */}
      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Check-in khách hàng
            </DialogTitle>
            <DialogDescription>
              Xác nhận giao xe và nhận cọc từ: {selectedReservation?.renter.fullName} - {selectedReservation?.vehicle.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reservation Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Thông tin đặt chỗ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Biển số</Label>
                    <p className="font-medium">{selectedReservation?.vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Loại xe</Label>
                    <p className="font-medium">{selectedReservation?.vehicle.brand} {selectedReservation?.vehicle.model}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Khách hàng</Label>
                    <p className="font-medium">{selectedReservation?.renter.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Số điện thoại</Label>
                    <p className="font-medium">{selectedReservation?.renter.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Thời gian bắt đầu</Label>
                    <p className="font-medium">{formatDateTime(selectedReservation?.reservedStartTime)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Thời gian kết thúc</Label>
                    <p className="font-medium">{formatDateTime(selectedReservation?.reservedEndTime)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Reservation ID</Label>
                    <p className="font-medium">{selectedReservation?.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Trạm</Label>
                    <p className="font-medium">
                      {selectedReservation?.vehicle?.station?.name || 'Không có thông tin trạm'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {selectedReservation?.vehicle?.station?.id || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deposit Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Số tiền đặt cọc nhận từ khách hàng (VND) *</Label>
              <div className="flex gap-2">
                <DollarSign className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="500000"
                  value={checkInForm.depositAmount}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, depositAmount: e.target.value }))}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Nhập số tiền cọc mà khách hàng đã trả cho bạn
              </p>
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
    </div>
  );
};

export default RentalManagement;