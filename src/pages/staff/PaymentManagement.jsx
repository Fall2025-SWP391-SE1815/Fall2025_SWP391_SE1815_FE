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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import staffRentalService from '@/services/staff/staffRentalService';
import {
  CreditCard,
  Banknote,
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  User,
  Car,
  RefreshCw,
  Plus,
  Receipt,
  AlertTriangle,
  Calendar,
  Hash,
  Flag,
  Eye,
  MapPin,
  Phone
} from 'lucide-react';

const PaymentManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: ''
  });

  // Additional states for detailed payment info
  const [rentalViolations, setRentalViolations] = useState([]);
  const [rentalBill, setRentalBill] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Violation states
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);
  const [violationForm, setViolationForm] = useState({
    rental_id: '',
    description: '',
    fine_amount: ''
  });

  // Detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // All payment data now comes from real API calls

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      // Call real API to get rentals that need payment processing
      // We can use status filter to get rentals waiting for payment
      const response = await staffRentalService.getRentals({ status: 'waiting_for_payment' });
      console.log('Pending payments response:', response);

      // Transform rental data to payment format for UI - lưu đầy đủ thông tin
      const paymentsData = response?.map(rental => ({
        payment_id: `PAY-${rental.id}`,
        rental_id: rental.id,

        // Renter info
        renter_id: rental.renter.id,
        renter_name: rental.renter.fullName,
        renter_email: rental.renter.email,
        renter_phone: rental.renter.phone,

        // Vehicle info
        vehicle_id: rental.vehicle.id,
        vehicle_license: rental.vehicle.licensePlate,
        vehicle_type: rental.vehicle.type,
        vehicle_brand: rental.vehicle.brand,
        vehicle_model: rental.vehicle.model,
        vehicle_price_per_hour: rental.vehicle.pricePerHour,
        batteryType: rental.vehicle.batteryType,
        numberSeat: rental.vehicle.numberSeat,
        odo: rental.vehicle.odo,
        batteryLevel: rental.vehicle.batteryLevel,
        // Station info
        station_pickup_name: rental.stationPickup?.name,
        station_pickup_address: rental.stationPickup?.address,
        station_return_name: rental.stationReturn?.name,
        station_return_address: rental.stationReturn?.address,

        // Staff info
        staff_pickup_name: rental.staffPickup?.fullName,
        staff_pickup_phone: rental.staffPickup?.phone,
        staff_return_name: rental.staffReturn?.fullName,
        staff_return_phone: rental.staffReturn?.phone,

        // Rental details
        start_time: rental.startTime,
        end_time: rental.endTime,
        total_distance: rental.totalDistance,
        total_cost: rental.totalCost,
        rental_type: rental.rentalType,
        rentalCost: rental.rentalCost,
        deposit_amount: rental.depositAmount,
        deposit_status: rental.depositStatus,
        rental_status: rental.status,
        insurance: rental.insurance,
        batteryLevelStart: rental.batteryLevelStart,
        batteryLevelEnd: rental.batteryLevelEnd,
        odoStart: rental.odoStart,
        odoEnd: rental.odoEnd,

        // Payment info
        amount: rental.totalCost || rental.depositAmount,
        method: 'cash', // Default method, can be changed in dialog
        status: 'pending',
        payment_type: rental.depositStatus === 'pending' ? 'deposit' : 'rental_fee',
        created_at: rental.createdAt,
        due_date: rental.endTime // Use end time as due date
      })) || [];

      setPendingPayments(paymentsData);

    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách thanh toán chưa hoàn tất",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (payment) => {
    setSelectedDetail(payment);
    setDetailDialogOpen(true);
  };

  const handleProcessPayment = async (payment) => {
    console.log('handleProcessPayment called with:', payment);
    setSelectedPayment(payment);
    setPaymentForm({
      amount: '', // Will be set after loading bill details
      method: payment.method || ''
    });
    setPaymentDialogOpen(true);

    // Load detailed payment information
    await loadPaymentDetails(payment.rental_id);
  };

  const loadPaymentDetails = async (rentalId) => {
    try {
      setLoadingDetails(true);
      console.log('Loading payment details for rental:', rentalId);

      // 1. Get violations for this rental
      const violationsResponse = await staffRentalService.getViolations(rentalId);
      const violations = Array.isArray(violationsResponse) ? violationsResponse : violationsResponse?.data || [];
      console.log('Violations loaded:', violations);
      setRentalViolations(violations);

      // 2. Calculate total bill (rental cost + violations)
      // Use current time in Vietnam timezone as the actual return time when processing payment
      const now = new Date();
      const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours for Vietnam timezone (UTC+7)
      const billResponse = await staffRentalService.calculateBill(rentalId, {
        returnTime: vietnamTime.toISOString()
      });
      const billData = billResponse?.data || billResponse;
      console.log('Bill data loaded:', billData);
      setRentalBill(billData);

      // Set default payment amount from bill
      if (billData?.totalBill) {
        setPaymentForm(prev => ({
          ...prev,
          amount: billData.totalBill.toString()
        }));
        console.log('Payment amount set to:', billData.totalBill);
      }

    } catch (error) {
      console.error('Error loading payment details:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin chi tiết thanh toán",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const submitViolation = async () => {
    try {
      if (!violationForm.rental_id || !violationForm.description || !violationForm.fine_amount) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin vi phạm",
          variant: "destructive",
        });
        return;
      }

      const fineAmount = parseInt(violationForm.fine_amount);
      if (isNaN(fineAmount) || fineAmount < 0) {
        toast({
          title: "Số tiền không hợp lệ",
          description: "Vui lòng nhập số tiền phạt hợp lệ",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Use real API service for adding violation
      await staffRentalService.addViolation({
        rentalId: parseInt(violationForm.rental_id),
        description: violationForm.description,
        fineAmount: fineAmount
      });

      toast({
        title: "Thành công",
        description: "Vi phạm đã được ghi nhận.",
      });

      setViolationDialogOpen(false);
      setViolationForm({ rental_id: '', description: '', fine_amount: '' });

      // Refresh pending payments to show updated info
      fetchPendingPayments();

    } catch (error) {
      console.error('Error submitting violation:', error);
      toast({
        title: "Lỗi",
        description: "Không thể ghi nhận vi phạm",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    try {
      if (!paymentForm.method || !rentalBill || !paymentForm.amount) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin thanh toán",
          variant: "destructive",
        });
        return;
      }

      const amount = parseFloat(paymentForm.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Số tiền không hợp lệ",
          description: "Vui lòng nhập số tiền thanh toán hợp lệ",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Use the correct API endpoint for payment confirmation
      await staffRentalService.processPayment(selectedPayment.rental_id, {
        // API expects these fields based on swagger
        paymentMethod: paymentForm.method,
        amount: amount,
        notes: `Thanh toán ${paymentForm.method} tại trạm`
      });

      toast({
        title: "Thành công",
        description: "Đã xác nhận thanh toán thành công.",
      });

      setPaymentDialogOpen(false);
      setPaymentForm({ amount: '', method: '' });
      setRentalViolations([]);
      setRentalBill(null);
      fetchPendingPayments(); // Refresh the list

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xác nhận thanh toán",
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

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      cash: { label: 'Tiền mặt', variant: 'default', icon: Banknote },
      payos: { label: 'PayOS', variant: 'secondary', icon: CreditCard }
    };

    const config = methodConfig[method] || { label: method, variant: 'outline', icon: DollarSign };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentTypeBadge = (type) => {
    const typeConfig = {
      rental_fee: { label: 'Phí thuê', variant: 'default' },
      deposit: { label: 'Đặt cọc', variant: 'secondary' },
      overtime_fee: { label: 'Phí quá giờ', variant: 'destructive' },
      damage_fee: { label: 'Phí hư hỏng', variant: 'destructive' }
    };

    const config = typeConfig[type] || { label: type, variant: 'outline' };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ thanh toán', variant: 'destructive', icon: Clock },
      completed: { label: 'Đã thanh toán', variant: 'default', icon: CheckCircle },
      failed: { label: 'Thất bại', variant: 'destructive', icon: AlertTriangle }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline', icon: Clock };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const isOverdue = (dueDateString) => {
    return new Date(dueDateString) < new Date();
  };

  const getTotalPendingAmount = () => {
    return pendingPayments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getPendingByMethod = (method) => {
    return pendingPayments.filter(p => p.method === method).length;
  };

  // Filter payments based on search and status
  const filteredPayments = pendingPayments.filter(payment => {
    const matchesSearch = !searchTerm ||
      payment.renter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.renter_phone.includes(searchTerm) ||
      payment.vehicle_license.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.rental_id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thanh toán tại trạm</h1>
          <p className="text-muted-foreground">
            Ghi nhận thanh toán trực tiếp từ khách hàng (tiền mặt, thẻ, ví điện tử)
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              placeholder="Tìm kiếm tên, SĐT, biển số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Button onClick={() => setViolationDialogOpen(true)} variant="outline">
            <Flag className="h-4 w-4 mr-2" />
            Ghi nhận vi phạm
          </Button>
          <Button onClick={fetchPendingPayments} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chờ thanh toán</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalPendingAmount())}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} giao dịch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiền mặt</CardTitle>
            <Banknote className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPendingByMethod('cash')}</div>
            <p className="text-xs text-muted-foreground">
              Giao dịch chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PayOS</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPendingByMethod('payos')}</div>
            <p className="text-xs text-muted-foreground">
              Giao dịch chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số giao dịch</CardTitle>
            <Receipt className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments.length}</div>
            <p className="text-xs text-muted-foreground">
              Giao dịch chờ xử lý
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Danh sách thanh toán chờ xử lý ({filteredPayments.length}/{pendingPayments.length})
          </CardTitle>
          <CardDescription>
            Các khoản thanh toán cần được ghi nhận tại trạm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Không tìm thấy thanh toán nào phù hợp' : 'Không có thanh toán nào chờ xử lý'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã giao dịch</TableHead>
                  <TableHead>Thông tin khách hàng</TableHead>
                  <TableHead>Thông tin thuê</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Thời hạn</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.payment_id} className={isOverdue(payment.due_date) ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          #{payment.payment_id}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Rental #{payment.rental_id}
                        </div>
                        {getPaymentTypeBadge(payment.payment_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {payment.renter_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.renter_phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          {payment.vehicle_license}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(payment.created_at)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <div className="font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(payment.amount)}
                        </div>
                        {getPaymentMethodBadge(payment.method)}
                        {getStatusBadge(payment.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className={`text-sm ${isOverdue(payment.due_date) ? 'text-red-600 font-medium' : ''}`}>
                            {formatDateTime(payment.due_date)}
                          </span>
                        </div>
                        {isOverdue(payment.due_date) && (
                          <Badge variant="destructive" className="w-fit">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Quá hạn
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(payment)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleProcessPayment(payment)}
                          disabled={loading}
                          className="w-full"
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          Xử lý thanh toán
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

      {/* Payment Processing Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Xử lý thanh toán
            </DialogTitle>
            <DialogDescription>
              Ghi nhận thanh toán cho: {selectedPayment?.renter_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Thông tin thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Mã giao dịch</Label>
                    <p className="font-medium">#{selectedPayment?.payment_id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Mã thuê xe</Label>
                    <p className="font-medium">#{selectedPayment?.rental_id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Khách hàng</Label>
                    <p className="font-medium">{selectedPayment?.renter_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Xe</Label>
                    <p className="font-medium">{selectedPayment?.vehicle_license}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Violations List */}
            {loadingDetails ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Đang tải thông tin chi tiết...</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {rentalViolations.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-red-600">Vi phạm ({rentalViolations.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {rentalViolations.map((violation, index) => (
                          <div key={index} className="flex justify-between items-start p-3 bg-red-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{violation.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDateTime(violation.createdAt || violation.created_at)}
                              </p>
                            </div>
                            <div className="text-red-600 font-medium">
                              {formatCurrency(violation.fineAmount || violation.fine_amount || 0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bill Summary */}
                {rentalBill && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Tổng kết thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Tiền thuê xe:</span>
                          <span>{formatCurrency(rentalBill.rentalCost || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phí vi phạm:</span>
                          <span className="text-red-600">
                            {formatCurrency(rentalBill.violationCost || 0)}
                          </span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng hóa đơn:</span>
                          <span className="text-green-600">
                            {formatCurrency(rentalBill.totalBill || 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Payment Amount Input */}
            {rentalBill && (
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền thanh toán *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Nhập số tiền thanh toán"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Tổng hóa đơn: {formatCurrency(rentalBill.totalBill || 0)}
                </p>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method">Phương thức thanh toán *</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Tiền mặt
                      </div>
                    </SelectItem>
                    <SelectItem value="payos">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        PayOS
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Method Info */}
            {paymentForm.method && (
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    {paymentForm.method === 'cash' && (
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Nhận tiền mặt trực tiếp từ khách hàng
                      </div>
                    )}
                    {paymentForm.method === 'payos' && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Xử lý thanh toán qua PayOS
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPaymentDialogOpen(false);
              setRentalViolations([]);
              setRentalBill(null);
            }}>
              Hủy
            </Button>
            <Button
              onClick={processPayment}
              disabled={loading || loadingDetails || !rentalBill || !paymentForm.method || !paymentForm.amount}
            >
              {loadingDetails ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang tải thông tin...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Xác nhận thanh toán
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Chi tiết thanh toán - {selectedDetail?.payment_id}
            </DialogTitle>
            <DialogDescription>
              Thông tin đầy đủ về lượt thuê và thanh toán
            </DialogDescription>
          </DialogHeader>

          {selectedDetail && (
            <div className="space-y-4">
              {/* Renter Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">ID</Label>
                      <p className="font-medium">#{selectedDetail.renter_id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Họ tên</Label>
                      <p className="font-medium">{selectedDetail.renter_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedDetail.renter_email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Số điện thoại</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {selectedDetail.renter_phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Thông tin xe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">ID Xe</Label>
                      <p className="font-medium">#{selectedDetail.vehicle_id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Biển số</Label>
                      <p className="font-medium text-lg">{selectedDetail.vehicle_license}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Loại xe</Label>
                      <p className="font-medium capitalize">{selectedDetail.vehicle_type}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Loại pin</Label>
                      <p className="font-medium capitalize">{selectedDetail.batteryType}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Pin ban đầu</Label>
                      <p className="font-medium capitalize">{selectedDetail.batteryLevelStart}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Pin còn lại</Label>
                      <p className="font-medium capitalize">{selectedDetail.batteryLevelEnd}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Hãng xe</Label>
                      <p className="font-medium">{selectedDetail.vehicle_brand} {selectedDetail.vehicle_model}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Giá thuê</Label>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedDetail.vehicle_price_per_hour)}/giờ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Station Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Thông tin trạm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Trạm lấy xe</Label>
                      <p className="font-medium">{selectedDetail.station_pickup_name}</p>
                      <p className="text-xs text-muted-foreground">{selectedDetail.station_pickup_address}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Trạm trả xe</Label>
                      <p className="font-medium">
                        {selectedDetail.station_return_name || 'Chưa trả xe'}
                      </p>
                      {selectedDetail.station_return_address && (
                        <p className="text-xs text-muted-foreground">{selectedDetail.station_return_address}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thông tin nhân viên
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">NV giao xe</Label>
                      <p className="font-medium">{selectedDetail.staff_pickup_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedDetail.staff_pickup_phone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">NV nhận xe</Label>
                      <p className="font-medium">{selectedDetail.staff_return_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedDetail.staff_return_phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Chi tiết thuê xe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Mã thuê</Label>
                      <p className="font-medium">#{selectedDetail.rental_id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Loại thuê</Label>
                      <p className="font-medium capitalize">{selectedDetail.rental_type}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Thời gian bắt đầu</Label>
                      <p className="font-medium">{formatDateTime(selectedDetail.start_time)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Thời gian kết thúc</Label>
                      <p className="font-medium">{formatDateTime(selectedDetail.end_time)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Trạng thái</Label>
                      <Badge variant="secondary" className="capitalize">
                        {selectedDetail.rental_status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Quãng đường</Label>
                      <p className="font-medium">
                        {selectedDetail.odoEnd && selectedDetail.odoStart ? `${selectedDetail.odoEnd - selectedDetail.odoStart} km` : 'Chưa có'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-900">
                    <DollarSign className="h-4 w-4" />
                    Tổng kết thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-800">Tổng chi phí:</span>
                      <span className="font-bold text-lg text-green-900">
                        {formatCurrency(selectedDetail.total_cost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-800">Tiền cọc:</span>
                      <span className="font-medium text-green-900">
                        {formatCurrency(selectedDetail.deposit_amount)}
                      </span>
                    </div>
                    <hr className="border-green-200" />
                    <div className="flex justify-between text-sm">
                      <span className="text-green-800">Tiền thuê:</span>
                      <span className="font-medium text-green-900">
                        {formatCurrency(selectedDetail.rentalCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-800">Tiền bảo hiểm:</span>
                      <span className="font-medium text-green-900">
                        {formatCurrency(selectedDetail.insurance)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-800">Trạng thái cọc:</span>
                      <Badge variant="outline" className="capitalize">
                        {selectedDetail.deposit_status === "held"
                          ? "Đang giữ"
                          : selectedDetail.deposit_status === "returned"
                            ? "Đã trả"
                            : "Không xác định"}
                      </Badge>
                    </div>
                    <hr className="border-green-200" />
                    <div className="flex justify-between text-sm">
                      <span className="text-green-800">Loại thanh toán:</span>
                      {getPaymentTypeBadge(selectedDetail.payment_type)}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-800">Ngày tạo:</span>
                      <span className="font-medium text-green-900">
                        {formatDateTime(selectedDetail.created_at)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
            <Button onClick={() => {
              setDetailDialogOpen(false);
              handleProcessPayment(selectedDetail);
            }}>
              <Receipt className="h-4 w-4 mr-2" />
              Xử lý thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Violation Dialog */}
      <Dialog open={violationDialogOpen} onOpenChange={setViolationDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Ghi nhận vi phạm
            </DialogTitle>
            <DialogDescription>
              Ghi nhận vi phạm khi khách hàng trả xe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rental-id">Mã lượt thuê *</Label>
              <Input
                id="rental-id"
                type="number"
                placeholder="Nhập mã lượt thuê"
                value={violationForm.rental_id}
                onChange={(e) => setViolationForm(prev => ({ ...prev, rental_id: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="violation-description">Mô tả vi phạm *</Label>
              <Textarea
                id="violation-description"
                placeholder="Mô tả chi tiết vi phạm (ví dụ: không đội mũ bảo hiểm, vượt đèn đỏ, trả xe trễ...)"
                value={violationForm.description}
                onChange={(e) => setViolationForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fine-amount">Số tiền phạt (VND) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fine-amount"
                  type="number"
                  placeholder="Nhập số tiền phạt"
                  value={violationForm.fine_amount}
                  onChange={(e) => setViolationForm(prev => ({ ...prev, fine_amount: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Vi phạm sẽ được tính vào hóa đơn thanh toán
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViolationDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitViolation} disabled={loading}>
              <Flag className="h-4 w-4 mr-2" />
              Ghi nhận vi phạm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;