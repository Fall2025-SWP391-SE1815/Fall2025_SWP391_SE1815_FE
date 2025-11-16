import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency as formatCurrencyUtil } from '@/utils/pricing';
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
import { useGlobalToast } from '@/components/ui/global-toast';
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
  DollarSign,
  AlertTriangle,
  Gauge,
  Battery
} from 'lucide-react';

const VehicleReturn = () => {
  const { success, error, warning, info } = useGlobalToast();
  const [loading, setLoading] = useState(false);
  const [returningRentals, setReturningRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedReturnRental, setSelectedReturnRental] = useState(null);

  // Form states
  const [returnForm, setReturnForm] = useState({
    condition_report: '',
    odo: '',
    batteryLevel: '',
    photo_url: null,
    customer_signature_url: null,
    staff_signature_url: null
  });

  useEffect(() => {
    fetchReturningRentals();
  }, []);

  // Fetch in-use rentals (ready for return)
  const fetchReturningRentals = async () => {
    try {
      setLoading(true);
      const response = await staffRentalService.getRentals({ status: 'in_use' });
      console.log('Returning rentals (in_use) response:', response);
      setReturningRentals(response || []);
    } catch (error) {
      console.error('Error fetching returning rentals:', error);
      error("Không thể tải danh sách xe cần nhận", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle return check button click
  const handleReturnCheck = async (rental) => {
    setSelectedReturnRental(rental);
    setReturnForm({
      condition_report: '',
      odo: rental?.vehicle?.odo?.toString() || '',
      batteryLevel: rental?.vehicle?.batteryLevel?.toString() || '',
      photo_url: null,
      customer_signature_url: null,
      staff_signature_url: null
    });
    setReturnDialogOpen(true);
  };

  // Submit return check with files
  const submitReturnCheck = async () => {
    try {
      // Validate all required fields and files
      if (!returnForm.condition_report ||
        !returnForm.odo ||
        !returnForm.batteryLevel ||
        !returnForm.photo_url ||
        !returnForm.customer_signature_url ||
        !returnForm.staff_signature_url) {
        warning(
          "Thiếu thông tin",
          "Điền đủ biên bản, số km, mức pin và chọn 3 file ảnh (xe + chữ ký KH + NV)"
        );
        return;
      }

      // --- Validate ODO & Battery Level ---
      const newOdo = parseInt(returnForm.odo);
      const oldOdo = parseInt(selectedReturnRental?.vehicle?.odo || 0);

      if (isNaN(newOdo) || newOdo < 0) {
        warning("Sai số Km", "Số km không được âm và phải là số hợp lệ.");
        return;
      }

      if (newOdo < oldOdo) {
        warning("Sai số Km", `Số km hiện tại (${newOdo} km) không được nhỏ hơn số km trước đó (${oldOdo} km).`);
        return;
      }

      const battery = parseInt(returnForm.batteryLevel);

      if (isNaN(battery) || battery < 0) {
        warning("Giá trị pin không hợp lệ", "Mức pin không được âm.");
        return;
      }

      if (battery > 100) {
        warning("Giá trị pin không hợp lệ", "Mức pin không được vượt quá 100%.");
        return;
      }

      // Validate file types
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

      if (!validateFile(returnForm.photo_url, "Ảnh xe") ||
        !validateFile(returnForm.customer_signature_url, "Chữ ký khách hàng") ||
        !validateFile(returnForm.staff_signature_url, "Chữ ký nhân viên")) {
        return;
      }

      setLoading(true);

      // Create FormData for multipart form submission
      const formData = new FormData();

      // Add the required data field as JSON string
      const requestData = {
        rentalId: selectedReturnRental.id,
        checkType: "return",
        conditionReport: returnForm.condition_report,
        odo: parseInt(returnForm.odo),
        batteryLevel: parseInt(returnForm.batteryLevel)
      };
      formData.append('data', JSON.stringify(requestData));

      // Add file fields - all are File objects now
      formData.append('photo', returnForm.photo_url);
      formData.append('staff_signature', returnForm.staff_signature_url);
      formData.append('customer_signature', returnForm.customer_signature_url);

      // Call the confirm-return API
      const response = await staffRentalService.confirmReturn(formData);

      success("Xác nhận nhận xe thành công", "Xe đã được trả về hệ thống.");

      setReturnDialogOpen(false);
      // Reset form after successful submission
      setReturnForm({
        condition_report: '',
        odo: '',
        batteryLevel: '',
        photo_url: null,
        customer_signature_url: null,
        staff_signature_url: null
      });
      // Refresh the returning rentals list
      fetchReturningRentals();

    } catch (error) {
      console.error('Error confirming return:', error);
      error("Không thể xác nhận nhận xe từ khách", error.message);
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

  const getVehicleTypeName = (type) => {
    const types = {
      'car': 'Ô tô',
      'motorbike': 'Xe máy',
      'bicycle': 'Xe đạp',
      'scooter': 'Xe scooter'
    };
    return types[type?.toLowerCase()] || type;
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
          <h1 className="text-3xl font-bold tracking-tight">Nhận xe từ khách hàng</h1>
          <p className="text-muted-foreground">
            Xác nhận nhận xe và lập biên bản trả xe
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
            <CheckCircle className="h-5 w-5" />
            Danh sách xe đang cho thuê
          </CardTitle>
          <CardDescription>
            Các xe đang được thuê và có thể được khách hàng trả về bất cứ lúc nào
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filterRentals(returningRentals).length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Không tìm thấy xe nào phù hợp' : 'Không có xe nào đang được thuê'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thông tin xe</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Thời gian thuê</TableHead>
                  <TableHead>Tài chính</TableHead>
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
                          {rental.vehicle.brand} {rental.vehicle.model}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getVehicleTypeName(rental.vehicle.type)}
                        </div>
                        <Badge variant="outline" className="w-fit text-xs">
                          {rental.rentalType === 'booking' ? 'Đặt trước' : 'Walk-in'}
                        </Badge>
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
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            Bắt đầu: {formatDateTime(rental.startTime)}
                          </span>
                        </div>
                        {rental.endTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-600">
                              Dự kiến: {formatDateTime(rental.endTime)}
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {rental.stationReturn?.name || rental.stationPickup.name}
                        </div>
                        {rental.totalDistance && (
                          <div className="text-xs text-blue-600 font-medium">
                            Đã đi: {rental.totalDistance} km
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col space-y-2">

                        {/* Tổng tiền */}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Tổng tiền</span>
                            <span className="font-medium text-sm">
                              {formatCurrency(rental.totalCost)}
                            </span>
                          </div>
                        </div>

                        {/* Đặt cọc */}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Đặt cọc</span>
                            <span className="font-medium text-sm text-green-600">
                              {formatCurrency(rental.depositAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Badge trạng thái */}
                        <Badge
                          variant={rental.depositStatus === 'held' ? 'default' : 'secondary'}
                          className="w-fit text-xs"
                        >
                          {rental.depositStatus === 'held' ? 'Đã giữ cọc' : rental.depositStatus}
                        </Badge>

                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleReturnCheck(rental)}
                        disabled={loading}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Xác nhận nhận xe
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Return Dialog for Vehicle Returns */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Xác nhận nhận xe từ khách hàng
            </DialogTitle>
            <DialogDescription>
              Xác nhận nhận xe và lập biên bản trả xe cho: {selectedReturnRental?.renter.fullName} - {selectedReturnRental?.vehicle.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Vehicle Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Thông tin xe trả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Biển số xe</p>
                    <p className="font-medium">{selectedReturnRental?.vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loại xe</p>
                    <p className="font-medium">{selectedReturnRental?.vehicle.brand} {selectedReturnRental?.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Khách hàng</p>
                    <p className="font-medium">{selectedReturnRental?.renter.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{selectedReturnRental?.renter.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian bắt đầu</p>
                    <p className="font-medium">{formatDateTime(selectedReturnRental?.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dự kiến kết thúc</p>
                    <p className="font-medium">{formatDateTime(selectedReturnRental?.endTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng tiền</p>
                    <p className="font-medium text-blue-600">{formatCurrency(selectedReturnRental?.totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Đã đặt cọc</p>
                    <p className="font-medium text-green-600">{formatCurrency(selectedReturnRental?.depositAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Condition Report */}
            <div className="space-y-2">
              <Label htmlFor="return-condition">Báo cáo tình trạng xe khi nhận lại *</Label>
              <Textarea
                id="return-condition"
                placeholder="Mô tả chi tiết tình trạng xe khi khách hàng trả (vết xước, hỏng hóc, mức pin, v.v.)"
                value={returnForm.condition_report}
                onChange={(e) => setReturnForm(prev => ({ ...prev, condition_report: e.target.value }))}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Ghi chú cẩn thận để xử lý bồi thường nếu có hư hỏng
              </p>
            </div>

            {/* Odometer and Battery Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="return-odo">Số km hiện tại *</Label>
                <div className="flex gap-2">
                  <Gauge className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="return-odo"
                    type="number"
                    placeholder="12000"
                    value={returnForm.odo}
                    onChange={(e) => {
                      let value = e.target.value;

                      // 🚫 Không cho nhập số âm
                      if (value.startsWith("-")) value = value.replace("-", "");
                      if (value < 0) value = 0;

                      setReturnForm(prev => ({ ...prev, odo: value }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = parseInt(returnForm.odo);
                        const oldOdo = selectedReturnRental?.vehicle?.odo || 0;

                        if (isNaN(value)) {
                          warning("Sai số Km", "Số km phải là số hợp lệ.");
                        } else if (value < oldOdo) {
                          warning("Sai số Km", `Số km phải từ ${oldOdo} km trở lên.`);
                        }
                      }
                    }}
                    onBlur={() => {
                      const value = parseInt(returnForm.odo);
                      const oldOdo = selectedReturnRental?.vehicle?.odo || 0;

                      if (isNaN(value)) {
                        warning("Sai số Km", "Số km phải là số hợp lệ.");
                      } else if (value < oldOdo) {
                        warning("Sai số Km", `Số km phải từ ${oldOdo} km trở lên.`);
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground mt-3">km</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="return-battery-level">Mức pin hiện tại *</Label>
                <div className="flex gap-2">
                  <Battery className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="return-battery-level"
                    type="number"
                    placeholder="95"
                    value={returnForm.batteryLevel}
                    onChange={(e) => {
                      let value = e.target.value;

                      // 🚫 Không cho nhập âm
                      if (value.startsWith("-")) value = value.replace("-", "");
                      if (value < 0) value = 0;

                      setReturnForm(prev => ({ ...prev, batteryLevel: value }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = parseInt(returnForm.batteryLevel);

                        if (isNaN(value)) {
                          warning("Giá trị không hợp lệ", "Mức pin phải là số hợp lệ.");
                        } else if (value > 100) {
                          warning("Giá trị pin không hợp lệ", "Mức pin không được vượt quá 100%.");
                        }
                      }
                    }}
                    onBlur={() => {
                      const value = parseInt(returnForm.batteryLevel);

                      if (isNaN(value)) {
                        warning("Giá trị không hợp lệ", "Mức pin phải là số hợp lệ.");
                      } else if (value > 100) {
                        warning("Giá trị pin không hợp lệ", "Mức pin không được vượt quá 100%.");
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground mt-3">%</span>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="return-photo">Ảnh xe khi nhận lại *</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="return-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setReturnForm(prev => ({ ...prev, photo_url: file }));
                    }
                  }}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" disabled>
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              {returnForm.photo_url && typeof returnForm.photo_url === 'object' && (
                <p className="text-sm text-green-600">
                  ✓ Đã chọn: {returnForm.photo_url.name}
                </p>
              )}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="return-customer-signature">Chữ ký khách hàng *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="return-customer-signature"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setReturnForm(prev => ({ ...prev, customer_signature_url: file }));
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" disabled>
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
                {returnForm.customer_signature_url && typeof returnForm.customer_signature_url === 'object' && (
                  <p className="text-sm text-green-600">
                    ✓ Đã chọn: {returnForm.customer_signature_url.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="return-staff-signature">Chữ ký nhân viên *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="return-staff-signature"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setReturnForm(prev => ({ ...prev, staff_signature_url: file }));
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" disabled>
                    <PenTool className="h-4 w-4" />
                  </Button>
                </div>
                {returnForm.staff_signature_url && typeof returnForm.staff_signature_url === 'object' && (
                  <p className="text-sm text-green-600">
                    ✓ Đã chọn: {returnForm.staff_signature_url.name}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">Lưu ý quan trọng</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Kiểm tra kỹ tình trạng xe trước khi xác nhận. Tiền cọc sẽ được xử lý dựa trên báo cáo này.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitReturnCheck} disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Xác nhận nhận xe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleReturn;
