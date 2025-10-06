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
  const [selectedTab, setSelectedTab] = useState('pickup');
  const [loading, setLoading] = useState(false);
  const [pendingRentals, setPendingRentals] = useState([]);
  const [returningRentals, setReturningRentals] = useState([]);

  // Dialog states
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  // Form states
  const [pickupForm, setPickupForm] = useState({
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

  // Mock data for pending rentals
  const mockPendingRentals = [
    {
      rental_id: 1,
      reservation_id: 101,
      vehicle: {
        id: 1,
        license_plate: "29A1-12345",
        type: "Electric Bike",
        brand: "VinFast",
        model: "Klara A2"
      },
      renter: {
        id: 1,
        full_name: "Nguyễn Văn Minh",
        phone: "0909123456"
      },
      pickup_station: {
        id: 1,
        name: "Trạm Quận 1",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
      },
      start_time: "2025-09-23T09:00:00Z",
      deposit_amount: 2000000,
      deposit_status: "paid"
    },
    {
      rental_id: 2,
      reservation_id: null,
      vehicle: {
        id: 2,
        license_plate: "29A1-67890",
        type: "Electric Bike",
        brand: "VinFast",
        model: "Feliz S"
      },
      renter: {
        id: 2,
        full_name: "Trần Thị Lan",
        phone: "0912345678"
      },
      pickup_station: {
        id: 1,
        name: "Trạm Quận 1",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
      },
      start_time: "2025-09-23T10:30:00Z",
      deposit_amount: 2000000,
      deposit_status: "paid"
    },
    {
      rental_id: 3,
      reservation_id: 103,
      vehicle: {
        id: 3,
        license_plate: "29A1-11111",
        type: "Electric Bike",
        brand: "Honda",
        model: "Benly e"
      },
      renter: {
        id: 3,
        full_name: "Lê Hoàng Nam",
        phone: "0987654321"
      },
      pickup_station: {
        id: 1,
        name: "Trạm Quận 1",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
      },
      start_time: "2025-09-23T14:00:00Z",
      deposit_amount: 2500000,
      deposit_status: "paid"
    }
  ];

  // Mock data for returning rentals
  const mockReturningRentals = [
    {
      rental_id: 4,
      vehicle: {
        id: 4,
        license_plate: "29A1-22222",
        type: "Electric Bike"
      },
      renter: {
        id: 4,
        full_name: "Phạm Văn Đức",
        phone: "0901234567"
      },
      return_station: {
        id: 1,
        name: "Trạm Quận 1",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
      },
      expected_end_time: "2025-09-23T16:00:00Z"
    },
    {
      rental_id: 5,
      vehicle: {
        id: 5,
        license_plate: "29A1-33333",
        type: "Electric Bike"
      },
      renter: {
        id: 5,
        full_name: "Võ Thị Mai",
        phone: "0913456789"
      },
      return_station: {
        id: 1,
        name: "Trạm Quận 1",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM"
      },
      expected_end_time: "2025-09-23T17:30:00Z"
    }
  ];

  useEffect(() => {
    fetchPendingRentals();
    fetchReturningRentals();
  }, []);

  const fetchPendingRentals = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/staff/rentals/pending');
      // setPendingRentals(response.data.data);

      // Using mock data for now
      setPendingRentals(mockPendingRentals);

    } catch (error) {
      console.error('Error fetching pending rentals:', error);
      if (error.response?.status === 403) {
        toast({
          title: "Lỗi truy cập",
          description: "Nhân viên chưa được phân công trạm làm việc",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách xe cần giao",
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
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/staff/rentals/returning');
      // setReturningRentals(response.data.data);

      // Using mock data for now
      setReturningRentals(mockReturningRentals);

    } catch (error) {
      console.error('Error fetching returning rentals:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách xe cần nhận",
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

  const submitPickupCheck = async () => {
    try {
      if (!pickupForm.condition_report || !pickupForm.photo_url ||
        !pickupForm.customer_signature_url || !pickupForm.staff_signature_url) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin biên bản",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/api/staff/rentals/${selectedRental.rental_id}/pickup-check`, pickupForm);

      // Mock success response
      const mockResponse = {
        success: true,
        message: "Biên bản bàn giao xe đã được lưu.",
        data: {
          check_id: Date.now(),
          rental_id: selectedRental.rental_id,
          staff_id: 1,
          check_type: "pickup",
          ...pickupForm,
          created_at: new Date().toISOString()
        }
      };

      toast({
        title: "Thành công",
        description: mockResponse.message,
      });

      setPickupDialogOpen(false);
      fetchPendingRentals(); // Refresh the list

    } catch (error) {
      console.error('Error submitting pickup check:', error);
      if (error.response?.status === 400) {
        toast({
          title: "Lỗi",
          description: "Lượt thuê không hợp lệ để lập biên bản pickup",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể lưu biên bản bàn giao",
          variant: "destructive",
        });
      }
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

      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/api/staff/rentals/${selectedRental.rental_id}/return-check`, returnForm);

      // Mock success response
      const mockResponse = {
        success: true,
        message: "Biên bản nhận xe đã được lưu.",
        data: {
          check_id: Date.now(),
          rental_id: selectedRental.rental_id,
          staff_id: 1,
          check_type: "return",
          ...returnForm,
          created_at: new Date().toISOString()
        }
      };

      toast({
        title: "Thành công",
        description: mockResponse.message,
      });

      setReturnDialogOpen(false);
      fetchReturningRentals(); // Refresh the list

    } catch (error) {
      console.error('Error submitting return check:', error);
      if (error.response?.status === 400) {
        toast({
          title: "Lỗi",
          description: "Lượt thuê không hợp lệ để lập biên bản return",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể lưu biên bản nhận xe",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmPickup = async (rentalId) => {
    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/api/staff/rentals/${rentalId}/confirm-pickup`);

      // Mock success response
      const mockResponse = {
        success: true,
        message: "Giao xe thành công. Rental đã chuyển sang trạng thái in_use."
      };

      toast({
        title: "Thành công",
        description: mockResponse.message,
      });

      fetchPendingRentals(); // Refresh the list

    } catch (error) {
      console.error('Error confirming pickup:', error);
      if (error.response?.status === 400) {
        toast({
          title: "Lỗi",
          description: "Cần lập biên bản bàn giao trước khi xác nhận",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể xác nhận giao xe",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmReturn = async (rentalId) => {
    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/api/staff/rentals/${rentalId}/confirm-return`);

      // Mock success response
      const mockResponse = {
        success: true,
        message: "Xe đã được trả thành công. Rental đã chuyển sang trạng thái returned."
      };

      toast({
        title: "Thành công",
        description: mockResponse.message,
      });

      fetchReturningRentals(); // Refresh the list

    } catch (error) {
      console.error('Error confirming return:', error);
      if (error.response?.status === 400) {
        toast({
          title: "Lỗi",
          description: "Cần lập biên bản nhận xe trước khi xác nhận",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể xác nhận nhận xe",
          variant: "destructive",
        });
      }
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

  const getDepositStatusBadge = (status) => {
    const statusConfig = {
      paid: { label: 'Đã thanh toán', variant: 'default' },
      pending: { label: 'Chờ thanh toán', variant: 'destructive' },
      refunded: { label: 'Đã hoàn', variant: 'secondary' }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
        <Button onClick={() => {
          fetchPendingRentals();
          fetchReturningRentals();
        }} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pickup" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Giao xe ({pendingRentals.length})
          </TabsTrigger>
          <TabsTrigger value="return" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Nhận xe ({returningRentals.length})
          </TabsTrigger>
        </TabsList>

        {/* Pickup Tab */}
        <TabsContent value="pickup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Danh sách xe cần giao
              </CardTitle>
              <CardDescription>
                Các lượt thuê đã được xác nhận và sẵn sàng giao xe cho khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRentals.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không có xe nào cần giao</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thông tin xe</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Thời gian giao</TableHead>
                      <TableHead>Đặt cọc</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRentals.map((rental) => (
                      <TableRow key={rental.rental_id}>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {rental.vehicle.license_plate}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rental.vehicle.brand} {rental.vehicle.model}
                            </div>
                            {rental.reservation_id && (
                              <Badge variant="outline" className="w-fit">
                                Đặt trước #{rental.reservation_id}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {rental.renter.full_name}
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
                                {formatDateTime(rental.start_time)}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {rental.pickup_station.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">
                                {formatCurrency(rental.deposit_amount)}
                              </span>
                            </div>
                            {getDepositStatusBadge(rental.deposit_status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePickupCheck(rental)}
                              className="w-full"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Lập biên bản
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => confirmPickup(rental.rental_id)}
                              disabled={loading}
                              className="w-full"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Xác nhận giao
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
              {returningRentals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không có xe nào cần nhận</p>
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
                    {returningRentals.map((rental) => (
                      <TableRow key={rental.rental_id}>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {rental.vehicle.license_plate}
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
                              {rental.renter.full_name}
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
                                {formatDateTime(rental.expected_end_time)}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {rental.return_station.name}
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
                              onClick={() => confirmReturn(rental.rental_id)}
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
              <FileText className="h-5 w-5" />
              Biên bản bàn giao xe
            </DialogTitle>
            <DialogDescription>
              Lập biên bản giao xe cho: {selectedRental?.renter.full_name} - {selectedRental?.vehicle.license_plate}
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
                    <p className="font-medium">{selectedRental?.vehicle.license_plate}</p>
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
              <FileText className="h-4 w-4 mr-2" />
              Lưu biên bản
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
              Lập biên bản nhận xe từ: {selectedRental?.renter.full_name} - {selectedRental?.vehicle.license_plate}
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
                    <p className="font-medium">{selectedRental?.vehicle.license_plate}</p>
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
    </div>
  );
};

export default RentalManagement;