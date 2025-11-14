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
import { calculateRentalCost, formatCurrency as formatCurrencyUtil } from '@/utils/pricing';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useGlobalToast } from '@/components/ui/global-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import {
  Calculator,
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
  DollarSign,
  Eye,
  Battery,
  Gauge,
  Users,
  Shield
} from 'lucide-react';

const ReservationHandover = () => {
  const { success, error, warning, info } = useGlobalToast();
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [pendingRentals, setPendingRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);

  // Form states
  const [checkInForm, setCheckInForm] = useState({
    depositAmount: '',
    insurance: '',
    highRisk: false
  });

  const [pickupForm, setPickupForm] = useState({
    condition_report: '',
    odo: '',
    batteryLevel: '',
    photo_url: null,
    customer_signature_url: null,
    staff_signature_url: null
  });

  // ✅ Tự động format và validate khi dialog mở hoặc khi depositAmount đổi
  useEffect(() => {
    if (checkInDialogOpen && checkInForm.depositAmount) {
      const raw = checkInForm.depositAmount.toString().replace(/\./g, '');
      const num = parseFloat(raw);

      if (isNaN(num) || num <= 0) {
        error("Lỗi dữ liệu", "Số tiền đặt cọc không hợp lệ hoặc bằng 0.");
        setCheckInForm(prev => ({ ...prev, depositAmount: '' }));
        return;
      }

      const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      if (formatted !== checkInForm.depositAmount) {
        setCheckInForm(prev => ({ ...prev, depositAmount: formatted }));
      }
    }
  }, [checkInDialogOpen, checkInForm.depositAmount]);

  // Fetch reservations with status=pending
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await staffRentalService.getReservations({ status: 'pending' });
      console.log('Reservations response:', response);
      setReservations(response || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      error("Không thể tải danh sách đặt chỗ", error.message);
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
        error("Lỗi truy cập", "Nhân viên chưa được phân công trạm làm việc");
      } else {
        error("Không thể tải danh sách xe cần giao", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Gộp 2 API fetch lại thành 1 hàm tiện dùng
  const loadData = async () => {
    await Promise.all([fetchReservations(), fetchPendingRentals()]);
  };
  useEffect(() => {
    loadData();
  }, []);

  // Handle view details button click
  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDetailsDialogOpen(true);
  };

  // Handle check-in button click
  const handleCheckIn = async (reservation) => {
    setSelectedReservation(reservation);
    const totalCost = calculateTotalCost(reservation);
    const suggestedDeposit = totalCost > 0 ? Math.round(totalCost * 0.3) : 0;

    setCheckInForm({
      depositAmount: suggestedDeposit.toString(),
      insurance: reservation?.insurance?.toString() || '0',
      highRisk: false
    });
    setCheckInDialogOpen(true);
  };

  // Submit check-in
  const submitCheckIn = async () => {
    try {
      if (!checkInForm.depositAmount || !selectedReservation) {
        warning("Thiếu thông tin", "Vui lòng nhập số tiền đặt cọc");
        return;
      }

      setLoading(true);

      const stationId = selectedReservation.vehicle?.station?.id;

      if (!stationId) {
        error("Lỗi dữ liệu", "Không tìm thấy thông tin trạm trong đặt chỗ");
        return;
      }

      // API check-in request - Do NOT include vehicleId for reservation
      const requestData = {
        renterId: parseInt(selectedReservation.renter.id),
        reservationId: parseInt(selectedReservation.id),
        stationId: parseInt(stationId),
        startTime: selectedReservation.reservedStartTime,
        endTime: selectedReservation.reservedEndTime,
        depositAmount: parseFloat(checkInForm.depositAmount.replace(/\./g, '')),
        insurance: parseFloat(checkInForm.insurance),
        highRisk: checkInForm.highRisk
      };

      console.log('Check-in request data:', requestData);

      const response = await staffRentalService.checkIn(requestData);

      success("Check-in thành công", "Khách hàng đã nhận xe và đặt cọc đã được ghi nhận.");

      setCheckInDialogOpen(false);
      await loadData(); // Refresh both lists

    } catch (error) {
      console.error('Error submitting check-in:', error);
      error("Không thể thực hiện check-in", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle pickup check button click
  const handlePickupCheck = async (rental) => {
    setSelectedRental(rental);
    setPickupForm({
      condition_report: '',
      odo: rental?.vehicle?.odo?.toString() || '',
      batteryLevel: rental?.vehicle?.batteryLevel?.toString() || '',
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
        !pickupForm.odo ||
        !pickupForm.batteryLevel ||
        !pickupForm.photo_url ||
        !pickupForm.customer_signature_url ||
        !pickupForm.staff_signature_url) {
        warning("Thiếu thông tin", "Điền đầy đủ biên bản, số km, mức pin và 3 file ảnh");
        return;
      }

      const validateFile = (file, name) => {
        if (!(file instanceof File)) {
          error("Lỗi file", `${name} phải là file ảnh`);
          return false;
        }
        if (!file.type.startsWith('image/')) {
          error("Lỗi định dạng", `${name} phải là file ảnh (JPG, PNG, GIF, v.v.)`);
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
        conditionReport: pickupForm.condition_report,
        odo: parseInt(pickupForm.odo),
        batteryLevel: parseInt(pickupForm.batteryLevel)
      };
      formData.append('data', JSON.stringify(requestData));
      formData.append('photo', pickupForm.photo_url);
      formData.append('staff_signature', pickupForm.staff_signature_url);
      formData.append('customer_signature', pickupForm.customer_signature_url);

      await staffRentalService.confirmPickup(formData);

      success("Xác nhận giao xe thành công", "Khách hàng đã nhận xe.");

      setPickupDialogOpen(false);
      setPickupForm({
        condition_report: '',
        odo: '',
        batteryLevel: '',
        photo_url: null,
        customer_signature_url: null,
        staff_signature_url: null
      });
      await loadData();

    } catch (error) {
      console.error('Error confirming pickup:', error);
      error("Không thể xác nhận giao xe", error.message);
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

      success("Ghi nhận đặt cọc", "Đã ghi nhận đặt cọc từ khách hàng thành công.");

      fetchPendingRentals();
    } catch (error) {
      console.error('Error holding deposit:', error);
      error("Không thể ghi nhận đặt cọc", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount);
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

  // ✅ Tính lại cọc nếu khách hàng rủi ro cao
  const calculateHighRiskDeposit = (baseDeposit) => {
    const deposit = parseFloat(baseDeposit) || 0;
    if (deposit < 10000000) return 10000000;
    return deposit + 10000000;
  };

  const calculateTotalCost = (item, highRisk = false) => {
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

    const { totalCost } = calculateRentalCost(durationInHours, pricePerHour);

    return totalCost;
  };

  // Calculate detailed pricing breakdown for pickup dialog
  const getPricingBreakdown = (item) => {
    if (!item || !item.vehicle || !item.reservedStartTime || !item.reservedEndTime) {
      return null;
    }

    const startTime = new Date(item.reservedStartTime);
    const endTime = new Date(item.reservedEndTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return null;
    }

    const durationInHours = Math.max(0, (endTime - startTime) / (1000 * 60 * 60));
    const pricePerHour = item.vehicle.pricePerHour || 0;

    const { subtotal, discount, discountPercentage, totalCost } = calculateRentalCost(durationInHours, pricePerHour);

    return {
      duration: durationInHours,
      pricePerHour,
      subtotal,
      discount,
      discountPercentage,
      totalCost
    };
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

  const translateStatus = (status) => {
    if (!status) return "";

    const map = {
      pending: "Chờ xử lý",
      booked: "Đã đặt",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
      active: "Đang hoạt động",
      inactive: "Ngừng hoạt động",

      // rental status
      pending_checkin: "Chờ check-in",
      checked_in: "Đã check-in",
      ready_for_pickup: "Sẵn sàng giao xe",
      in_use: "Đang sử dụng",
      returned: "Đã trả xe",

      // deposit
      held: "Đã nhận cọc",
      pending_deposit: "Chờ nhận cọc",
      refunded: "Đã hoàn cọc",

      // vehicle
      RESERVED: "Đang được đặt",
      AVAILABLE: "Sẵn sàng",
      MAINTENANCE: "Bảo dưỡng"
    };

    return map[status] || status;
  };

  // Map role tiếng Anh → tiếng Việt
  const translateRole = (role) => {
    if (!role) return "";

    const map = {
      renter: "Khách hàng",
      staff: "Nhân viên",
      admin: "Quản trị viên",
      manager: "Quản lý",
    };

    return map[role] || role;
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:8080";

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url}`;
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
                        {translateStatus(reservation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(reservation)}
                          disabled={loading}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(reservation)}
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Check-in
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
                        <span className="font-medium">
                          {formatCurrency(rental.depositAmount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(calculateTotalCost(rental))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>
                        {translateStatus(rental.depositStatus)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">Chi phí thuê xe</span>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(calculateTotalCost(selectedReservation))}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">Phí bảo hiểm</span>
                    <div className="text-lg font-bold text-orange-600">
                      {formatCurrency(parseFloat(checkInForm.insurance) || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    {/* Label thay đổi */}
                    <span
                      className={
                        checkInForm.highRisk
                          ? "text-sm font-medium text-red-600"
                          : "text-sm font-medium text-gray-700"
                      }
                    >
                      {checkInForm.highRisk
                        ? "⚠️ Cọc khách hàng rủi ro cao"
                        : "Đề xuất cọc (30%)"}
                    </span>

                    {/* GIÁ CỌC HIỂN THỊ */}
                    <div
                      className={
                        checkInForm.highRisk
                          ? "text-lg font-bold text-red-600"
                          : "text-lg font-bold text-green-600"
                      }
                    >
                      {(() => {
                        const baseDeposit = Math.round(calculateTotalCost(selectedReservation) * 0.3);

                        if (!checkInForm.highRisk) {
                          return formatCurrency(baseDeposit);
                        }

                        // Trường hợp KH rủi ro cao
                        const finalDeposit = calculateHighRiskDeposit(baseDeposit);

                        // 1️⃣ Cọc gốc < 10tr → hiển thị trường hợp đặc biệt
                        if (baseDeposit < 10000000) {
                          return `Cọc tối thiểu: ${formatCurrency(10000000)}`;
                        }

                        // 2️⃣ Cọc gốc ≥ 10tr → hiển thị “Cọc gốc + 10tr”
                        return `${formatCurrency(finalDeposit)} (cọc gốc + 10.000.000₫)`;
                      })()}
                    </div>
                  </div>

                </div>

                <div className="mt-4 pt-4 border-t text-center">
                  <span className="text-sm font-medium text-gray-700">Tổng thanh toán</span>
                  <div className="text-xl font-bold text-purple-600">
                    {formatCurrency(
                      (
                        calculateTotalCost(selectedReservation) + // ✅ chi phí thuê xe
                        (parseFloat(checkInForm.insurance) || 0) + // ✅ phí bảo hiểm
                        (checkInForm.highRisk
                          ? calculateHighRiskDeposit(Math.round(calculateTotalCost(selectedReservation) * 0.3))
                          : Math.round(calculateTotalCost(selectedReservation) * 0.3)) // ✅ cọc thực tế
                      )
                    )}
                  </div>

                  {checkInForm.highRisk && (
                    <div className="text-sm text-red-600 mt-1">
                      ⚠️ Khách hàng rủi ro cao: Cọc dưới <b>10.000.000₫</b> thì lấy <b>10.000.000₫</b>, lớn hơn thì cộng thêm <b>10.000.000₫</b>.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Số tiền đặt cọc (₫) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="deposit-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="500.000"
                  value={checkInForm.depositAmount}
                  readOnly  // ✅ không cho sửa
                  className="bg-gray-100 cursor-not-allowed"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (!value) {
                      setCheckInForm(prev => ({ ...prev, depositAmount: '' }));
                      return;
                    }
                    if (value.length > 12) value = value.slice(0, 12);
                    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    setCheckInForm(prev => ({ ...prev, depositAmount: formatted }));
                  }}
                  onBlur={(e) => {
                    const raw = e.target.value.replace(/\./g, '');
                    const num = parseFloat(raw);
                    if (isNaN(num) || num <= 0) {
                      error("Lỗi nhập liệu", "Số tiền đặt cọc phải lớn hơn 0");
                      setCheckInForm(prev => ({ ...prev, depositAmount: '' }));
                    }
                  }}
                />

                {/* ✅ Gợi ý 30% hiển thị bên phải input */}
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  ≈ 30% tổng chi phí thuê
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance-amount">Phí bảo hiểm (VND)</Label>
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 mt-3 text-muted-foreground" />
                  <div className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-md">
                    <span className="text-gray-900">
                      {selectedReservation?.insurance ? formatCurrency(selectedReservation.insurance) : 'Không có bảo hiểm'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Phí bảo hiểm được xác định từ đặt chỗ, không thể chỉnh sửa
                </p>
              </div>

              <div className="space-y-2">
                <Label>Khách hàng rủi ro cao</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="high-risk"
                    checked={checkInForm.highRisk}
                    onCheckedChange={(checked) => {
                      const baseDeposit = Math.round(calculateTotalCost(selectedReservation) * 0.3);
                      const newDeposit = checked
                        ? calculateHighRiskDeposit(baseDeposit)
                        : baseDeposit;

                      setCheckInForm(prev => ({
                        ...prev,
                        highRisk: checked,
                        depositAmount: newDeposit.toLocaleString('vi-VN')
                      }));
                    }}
                  />
                  <Label htmlFor="high-risk" className="text-sm font-normal">
                    Đánh dấu là khách hàng có rủi ro cao
                  </Label>
                </div>
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

      {/* Reservation Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Chi tiết đặt chỗ #{selectedReservation?.id}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết đặt chỗ của khách hàng {selectedReservation?.renter.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Mã khách hàng</Label>
                      <p className="font-medium">{selectedReservation?.renter.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Họ và tên</Label>
                      <p className="font-medium">{selectedReservation?.renter.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Email</Label>
                      <p className="font-medium">{selectedReservation?.renter.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Số điện thoại</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedReservation?.renter.phone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Vai trò:</Label>
                      <Badge variant="outline">
                        {translateRole(selectedReservation?.renter.role)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Thông tin xe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Mã xe</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Biển số xe</Label>
                      <p className="font-medium text-lg">{selectedReservation?.vehicle.licensePlate}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Loại xe</Label>
                      <Badge variant="secondary">
                        {selectedReservation?.vehicle.type}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Hãng xe</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.brand}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Model</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.model}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Trạng thái:</Label>
                      <Badge variant={selectedReservation?.vehicle.status === 'RESERVED' ? 'default' : 'outline'}>
                        {translateStatus(selectedReservation?.vehicle.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Dung tích pin (kWh)</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Battery className="h-4 w-4" />
                        {selectedReservation?.vehicle.capacity}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Quãng đường/1 lần sạc (km)</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.rangePerFullCharge}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Giá thuê/giờ</Label>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedReservation?.vehicle.pricePerHour)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Loại pin</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.batteryType}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Mức pin hiện tại (%)</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Battery className="h-4 w-4" />
                        {selectedReservation?.vehicle.batteryLevel}%
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Số ghế</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {selectedReservation?.vehicle.numberSeat}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Số Km đã đi</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        {selectedReservation?.vehicle.odo?.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                </div>

                {selectedReservation?.vehicle.imageUrl && (
                  <div className="mt-4">
                    <Label className="text-muted-foreground text-sm">Hình ảnh xe</Label>
                    <div className="mt-2">
                      <img
                        src={getImageUrl(selectedReservation.vehicle.imageUrl)}  // ✅ dùng helper
                        alt={`${selectedReservation.vehicle.brand} ${selectedReservation.vehicle.model}`}
                        className="w-full max-w-md h-auto max-h-[300px] object-cover rounded-xl border shadow"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Station Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Thông tin trạm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Mã trạm</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.station.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Tên trạm</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.station.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Địa chỉ</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.station.address}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Trạng thái:</Label>
                      <Badge variant={selectedReservation?.vehicle.station.status === 'active' ? 'default' : 'secondary'}>
                        {translateStatus(selectedReservation?.vehicle.station.status)}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Vĩ độ</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.station.latitude}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Kinh độ</Label>
                      <p className="font-medium">{selectedReservation?.vehicle.station.longitude}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Thông tin đặt chỗ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Mã đặt chỗ</Label>
                      <p className="font-medium text-lg">#{selectedReservation?.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Thời gian bắt đầu</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(selectedReservation?.reservedStartTime)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Thời gian kết thúc</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(selectedReservation?.reservedEndTime)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Trạng thái đặt chỗ:</Label>
                      <Badge variant="default">
                        {translateStatus(selectedReservation?.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Ngày tạo đặt chỗ</Label>
                      <p className="font-medium">
                        {formatDateTime(selectedReservation?.createdAt)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Phí bảo hiểm</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {formatCurrency(selectedReservation?.insurance)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Người hủy</Label>
                      <p className="font-medium">
                        {selectedReservation?.cancelledBy || 'Không có'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Lý do hủy</Label>
                      <p className="font-medium">
                        {selectedReservation?.cancelledReason || 'Không có'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  Tổng kết chi phí
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Chi phí thuê xe</span>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(calculateTotalCost(selectedReservation))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Phí bảo hiểm</span>
                    <div className="text-lg font-bold text-orange-600">
                      {formatCurrency(selectedReservation?.insurance || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tổng cộng</span>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency((calculateTotalCost(selectedReservation) || 0) + (selectedReservation?.insurance || 0))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Đóng
            </Button>
            <Button
              onClick={() => {
                setDetailsDialogOpen(false);
                handleCheckIn(selectedReservation);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Tiến hành Check-in
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="odo">Số km hiện tại *</Label>
                <div className="flex gap-2">
                  <Gauge className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="odo"
                    type="number"
                    placeholder="12000"
                    value={pickupForm.odo}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, odo: e.target.value }))}
                  />
                  <span className="text-sm text-muted-foreground mt-3">km</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="battery-level">Mức pin hiện tại *</Label>
                <div className="flex gap-2">
                  <Battery className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="battery-level"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="95"
                    value={pickupForm.batteryLevel}
                    onChange={(e) => setPickupForm(prev => ({ ...prev, batteryLevel: e.target.value }))}
                  />
                  <span className="text-sm text-muted-foreground mt-3">%</span>
                </div>
              </div>
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