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
  Hash
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

  // Mock data for pending payments
  const mockPendingPayments = [
    {
      payment_id: 1,
      rental_id: 101,
      renter_name: "Nguyễn Văn Minh",
      renter_phone: "0909123456",
      vehicle_license: "29A1-12345",
      amount: 150000,
      method: "cash",
      status: "pending",
      payment_type: "rental_fee",
      created_at: "2025-09-23T09:30:00Z",
      due_date: "2025-09-23T18:00:00Z"
    },
    {
      payment_id: 2,
      rental_id: 102,
      renter_name: "Trần Thị Lan",
      renter_phone: "0912345678",
      vehicle_license: "29A1-67890",
      amount: 75000,
      method: "card",
      status: "pending",
      payment_type: "deposit",
      created_at: "2025-09-23T10:15:00Z",
      due_date: "2025-09-23T19:00:00Z"
    },
    {
      payment_id: 3,
      rental_id: 103,
      renter_name: "Lê Hoàng Nam",
      renter_phone: "0987654321",
      vehicle_license: "29A1-11111",
      amount: 200000,
      method: "e-wallet",
      status: "pending",
      payment_type: "rental_fee",
      created_at: "2025-09-23T11:45:00Z",
      due_date: "2025-09-23T20:30:00Z"
    },
    {
      payment_id: 4,
      rental_id: 104,
      renter_name: "Phạm Văn Đức",
      renter_phone: "0901234567",
      vehicle_license: "29A1-22222",
      amount: 300000,
      method: "cash",
      status: "pending",
      payment_type: "overtime_fee",
      created_at: "2025-09-23T13:20:00Z",
      due_date: "2025-09-23T21:00:00Z"
    },
    {
      payment_id: 5,
      rental_id: 105,
      renter_name: "Võ Thị Mai",
      renter_phone: "0913456789",
      vehicle_license: "29A1-33333",
      amount: 120000,
      method: "card",
      status: "pending",
      payment_type: "rental_fee",
      created_at: "2025-09-23T14:10:00Z",
      due_date: "2025-09-23T22:00:00Z"
    }
  ];

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/staff/payments/pending');
      // setPendingPayments(response.data.data);
      
      // Using mock data for now
      setPendingPayments(mockPendingPayments);
      
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thanh toán chưa hoàn tất",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentForm({
      amount: payment.amount.toString(),
      method: payment.method
    });
    setPaymentDialogOpen(true);
  };

  const processPayment = async () => {
    try {
      if (!paymentForm.amount || !paymentForm.method) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin thanh toán",
          variant: "destructive",
        });
        return;
      }

      const amount = parseInt(paymentForm.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Số tiền không hợp lệ",
          description: "Vui lòng nhập số tiền hợp lệ",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/api/staff/rentals/${selectedPayment.rental_id}/payment`, {
      //   amount: amount,
      //   method: paymentForm.method
      // });
      
      // Mock success response
      const mockResponse = {
        success: true,
        message: "Thanh toán đã được ghi nhận.",
        data: {
          payment_id: Date.now(),
          rental_id: selectedPayment.rental_id,
          amount: amount,
          method: paymentForm.method,
          status: "completed",
          created_at: new Date().toISOString()
        }
      };

      toast({
        title: "Thành công",
        description: mockResponse.message,
      });

      setPaymentDialogOpen(false);
      fetchPendingPayments(); // Refresh the list
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xử lý thanh toán",
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
      card: { label: 'Thẻ', variant: 'secondary', icon: CreditCard },
      'e-wallet': { label: 'Ví điện tử', variant: 'outline', icon: Wallet }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thanh toán tại trạm</h1>
          <p className="text-muted-foreground">
            Ghi nhận thanh toán trực tiếp từ khách hàng (tiền mặt, thẻ, ví điện tử)
          </p>
        </div>
        <Button onClick={fetchPendingPayments} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
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
            <CardTitle className="text-sm font-medium">Thẻ ngân hàng</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPendingByMethod('card')}</div>
            <p className="text-xs text-muted-foreground">
              Giao dịch chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ví điện tử</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPendingByMethod('e-wallet')}</div>
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
            Danh sách thanh toán chờ xử lý ({pendingPayments.length})
          </CardTitle>
          <CardDescription>
            Các khoản thanh toán cần được ghi nhận tại trạm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không có thanh toán nào chờ xử lý</p>
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
                {pendingPayments.map((payment) => (
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
                      <Button
                        size="sm"
                        onClick={() => handleProcessPayment(payment)}
                        disabled={loading}
                        className="w-full"
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        Xử lý thanh toán
                      </Button>
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

            {/* Payment Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền thanh toán *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Nhập số tiền"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Số tiền gốc: {selectedPayment && formatCurrency(selectedPayment.amount)}
                </p>
              </div>

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
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Thẻ ngân hàng
                      </div>
                    </SelectItem>
                    <SelectItem value="e-wallet">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Ví điện tử
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
                    {paymentForm.method === 'card' && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Xử lý thanh toán qua thẻ ngân hàng
                      </div>
                    )}
                    {paymentForm.method === 'e-wallet' && (
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Xử lý thanh toán qua ví điện tử
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={processPayment} disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;