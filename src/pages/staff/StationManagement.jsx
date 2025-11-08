import React, { useState, useEffect } from 'react';
import vehicleService from '@/services/vehicles/vehicleService';
import staffRentalService from '@/services/staff/staffRentalService';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Car,
  MapPin,
  AlertTriangle,
  Flag,
  Clock,
  User,
  RefreshCw,
  Plus,
  Edit,
  Shield,
  Flame,
  Wrench,
  DollarSign,
  Phone,
  Calendar,
  Activity,
  Eye,
  Zap,
  Gauge
} from 'lucide-react';

const StationManagement = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('vehicles');
  const [loading, setLoading] = useState(false);

  // State for vehicles
  const [vehicles, setVehicles] = useState([]);

  // State for vehicle detail/update
  const [vehicleDetailDialogOpen, setVehicleDetailDialogOpen] = useState(false);
  const [vehicleUpdateDialogOpen, setVehicleUpdateDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    brand: '',
    model: '',
    capacity: '',
    rangePerFullCharge: ''
  });

  // State for incidents
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    vehicle_id: '',
    rental_id: '',
    description: '',
    severity: ''
  });

  // State for current rentals
  const [currentRentals, setCurrentRentals] = useState([]);



  useEffect(() => {
    fetchVehicles();
    fetchCurrentRentals();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      // Real API: GET /api/staff/vehicle (optional filters: status, plate_number)
      const response = await vehicleService.staff.getAllStaffVehicles();
      const data = Array.isArray(response) ? response : response?.data || [];
      setVehicles(data);

    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách xe tại trạm",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gọi API lấy danh sách lượt thuê hiện tại
  const fetchCurrentRentals = async () => {
    try {
      setLoading(true);

      // ✅ Chỉ dùng status mà backend thực sự có — ví dụ: "in_use"
      let response = await staffRentalService.getRentals({ status: 'in_use' });

      let data =
        Array.isArray(response)
          ? response
          : response?.data || response?.content || response?.results || [];

      console.log("📦 Rentals API raw:", response);
      console.log("✅ Rentals mapped data:", data);

      const formatted = data.map((rental) => ({
        id: rental.id,
        status: rental.status || 'in_use',
        startTime:
          rental.startTime ||
          rental.start_time ||
          rental.beginTime ||
          rental.start_at ||
          null,
        endTime:
          rental.endTime ||
          rental.end_time ||
          rental.expectedEndTime ||
          rental.end_at ||
          null,

        renter: {
          id: rental.renter?.id || rental.user?.id || rental.customer?.id || null,
          fullName:
            rental.renter?.fullName ||
            rental.renter?.full_name ||
            rental.user?.fullName ||
            rental.customer?.name ||
            'Không rõ tên',
          phone:
            rental.renter?.phone ||
            rental.user?.phone ||
            rental.customer?.phone ||
            'Không có SĐT',
          email:
            rental.renter?.email ||
            rental.user?.email ||
            rental.customer?.email ||
            '',
        },

        vehicle: {
          id: rental.vehicle?.id,
          licensePlate:
            rental.vehicle?.licensePlate ||
            rental.vehicle?.license_plate ||
            'Không rõ biển số',
          brand: rental.vehicle?.brand || '',
          model: rental.vehicle?.model || '',
          type: rental.vehicle?.type || '',
        },

        stationPickup: rental.stationPickup || rental.pickupStation || null,
        stationReturn: rental.stationReturn || rental.returnStation || null,
      }));

      setCurrentRentals(formatted);
    } catch (error) {
      console.error('❌ Lỗi khi tải danh sách lượt thuê:', error);
      toast({
        title: 'Lỗi',
        description:
          error?.message?.includes('No enum constant')
            ? 'Giá trị status không hợp lệ với backend. Hãy dùng status: in_use / waiting_for_payment / completed.'
            : 'Không thể tải danh sách thuê xe hiện tại',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // --- CHUYỂN XE "RENTED" QUA TAB LƯỢT THUÊ ---
  useEffect(() => {
    // Lấy danh sách xe đang thuê từ danh sách xe
    const rentedVehicles = vehicles
      .filter((v) => v.status === 'rented')
      .map((v) => ({
        id: v.id,
        vehicle: v,
        renter: v.currentRenter || {},
        startTime: v.startTime || v.start_time || null,
        endTime: v.endTime || v.end_time || null,
        status: 'rented',
      }));

    // Gộp danh sách với currentRentals tránh trùng ID
    setCurrentRentals((prev) => {
      const combined = [...prev, ...rentedVehicles];
      const unique = combined.filter(
        (item, index, arr) => arr.findIndex((x) => x.id === item.id) === index
      );
      return unique;
    });
  }, [vehicles]);


  const handleViewVehicleDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleDetailDialogOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setUpdateForm({
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      capacity: vehicle.capacity?.toString() || '',
      rangePerFullCharge: vehicle.rangePerFullCharge?.toString() || ''
    });
    setVehicleUpdateDialogOpen(true);
  };

  const submitVehicleUpdate = async () => {
    try {
      if (!updateForm.brand || !updateForm.model || !updateForm.capacity || !updateForm.rangePerFullCharge) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin xe",
          variant: "destructive",
        });
        return;
      }

      const capacity = parseInt(updateForm.capacity);
      const range = parseInt(updateForm.rangePerFullCharge);

      if (isNaN(capacity) || capacity <= 0 || isNaN(range) || range <= 0) {
        toast({
          title: "Thông tin không hợp lệ",
          description: "Vui lòng nhập số hợp lệ cho dung lượng pin và quãng đường",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // PUT /api/staff/vehicle/{id}
      await vehicleService.staff.updateVehicle(selectedVehicle.id, {
        brand: updateForm.brand,
        model: updateForm.model,
        capacity: capacity,
        rangePerFullCharge: range
      });

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin xe.",
      });

      setVehicleUpdateDialogOpen(false);
      setUpdateForm({ brand: '', model: '', capacity: '', rangePerFullCharge: '' });

      // Refresh vehicle list
      fetchVehicles();

    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin xe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitIncident = async () => {
    try {
      if (!incidentForm.vehicle_id || !incidentForm.description || !incidentForm.severity) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin sự cố",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Use real API service for creating incident report - based on API schema
      await staffRentalService.createIncidentReport({
        vehicleId: parseInt(incidentForm.vehicle_id),
        rentalId: incidentForm.rental_id ? parseInt(incidentForm.rental_id) : null,
        description: incidentForm.description,
        severity: incidentForm.severity
      });

      toast({
        title: "Thành công",
        description: "Sự cố đã được ghi nhận.",
      });

      setIncidentDialogOpen(false);
      setIncidentForm({ vehicle_id: '', rental_id: '', description: '', severity: '' });

    } catch (error) {
      console.error('Error submitting incident:', error);
      toast({
        title: "Lỗi",
        description: "Không thể báo cáo sự cố",
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

  const getVehicleStatusBadge = (status) => {
    const statusConfig = {
      available: { label: 'Khả dụng', variant: 'default', icon: Activity },
      reserved: { label: 'Đã đặt', variant: 'secondary', icon: Clock },
      maintenance: { label: 'Bảo trì', variant: 'destructive', icon: Wrench }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline', icon: Activity };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { label: 'Thấp', variant: 'secondary' },
      medium: { label: 'Trung bình', variant: 'outline' },
      high: { label: 'Cao', variant: 'destructive' }
    };

    const config = severityConfig[severity] || { label: severity, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // (Pin/Bảo trì không có trong API thực; bỏ màu pin)

  const getVehicleStats = () => {
    const available = vehicles.filter(v => v.status === 'available').length;
    const rented = vehicles.filter(v => v.status === 'rented').length;
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length;

    return { available, rented, maintenance, total: vehicles.length };
  };

  const stats = getVehicleStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý tại điểm</h1>
          <p className="text-muted-foreground">
            Quản lý xe, vi phạm, sự cố và lượt thuê tại trạm
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIncidentDialogOpen(true)} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Báo cáo sự cố
          </Button>
          <Button onClick={() => {
            fetchVehicles();
            fetchCurrentRentals();
          }} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Station Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số xe</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Xe tại trạm này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xe khả dụng</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
            <p className="text-xs text-muted-foreground">
              Sẵn sàng cho thuê
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang thuê</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rented}</div>
            <p className="text-xs text-muted-foreground">
              Xe đang được sử dụng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bảo trì</CardTitle>
            <Wrench className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              Xe cần bảo trì
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Xe tại trạm ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="rentals" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lượt thuê hiện tại ({currentRentals.length})
          </TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Danh sách xe tại trạm
              </CardTitle>
              <CardDescription>
                Quản lý trạng thái và thông tin xe tại trạm làm việc
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không có xe nào tại trạm</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thông tin xe</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Trạm</TableHead>
                      <TableHead>Giá thuê</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles
                      .filter((v) => v.status !== 'rented' && v.status !== 'in_use')
                      .map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <div className="font-medium flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                {vehicle.licensePlate || vehicle.license_plate || 'N/A'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vehicle.brand} {vehicle.model}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {vehicle.type}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getVehicleStatusBadge(vehicle.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              Trạm: {vehicle.station?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(vehicle.pricePerHour || vehicle.price_per_hour || 0)}/giờ
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewVehicleDetail(vehicle)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditVehicle(vehicle)}
                              >
                                <Edit className="h-4 w-4" />
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

        {/* Current Rentals Tab */}
        <TabsContent value="rentals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Danh sách lượt thuê đang diễn ra
              </CardTitle>
              <CardDescription>
                Quản lý các lượt thuê xe hiện tại đang được sử dụng tại trạm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentRentals.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Không có lượt thuê nào đang diễn ra
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã thuê</TableHead>
                      <TableHead>Thông tin xe</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRentals.map((rental) => (
                      <TableRow key={rental.id || rental.rental_id}>
                        <TableCell>
                          <div className="font-medium text-sm">
                            #{rental.id || rental.rental_id}
                          </div>
                        </TableCell>

                        {/* --- Thông tin xe --- */}
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {rental.vehicle?.licensePlate ||
                                rental.vehicle?.license_plate ||
                                'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rental.vehicle?.brand} {rental.vehicle?.model}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {rental.vehicle?.type || 'N/A'}
                            </div>
                          </div>
                        </TableCell>

                        {/* --- Khách hàng --- */}
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {rental.renter?.fullName ||
                                rental.renter?.full_name ||
                                'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {rental.renter?.phone || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {rental.renter?.email || ''}
                            </div>
                          </div>
                        </TableCell>

                        {/* --- Thời gian --- */}
                        <TableCell>
                          <div className="flex flex-col space-y-1 text-sm">
                            <div>
                              <strong>Bắt đầu:</strong>{' '}
                              {rental.startTime || rental.start_time
                                ? formatDateTime(
                                  rental.startTime || rental.start_time
                                )
                                : 'N/A'}
                            </div>
                            <div>
                              <strong>Dự kiến kết thúc:</strong>{' '}
                              {rental.endTime || rental.end_time
                                ? formatDateTime(rental.endTime || rental.end_time)
                                : 'N/A'}
                            </div>
                          </div>
                        </TableCell>

                        {/* --- Trạng thái --- */}
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {rental.status === 'rented' ? 'Đang được thuê' : rental.status}
                          </Badge>
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

      {/* Vehicle Detail Dialog */}
      <Dialog open={vehicleDetailDialogOpen} onOpenChange={setVehicleDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Chi tiết xe - {selectedVehicle?.licensePlate}
            </DialogTitle>
            <DialogDescription>
              Thông tin đầy đủ về xe tại trạm
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">ID Xe</Label>
                      <p className="font-medium">#{selectedVehicle.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Biển số</Label>
                      <p className="font-medium text-lg">{selectedVehicle.licensePlate}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Loại xe</Label>
                      <p className="font-medium capitalize">{selectedVehicle.type}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Trạng thái</Label>
                      <div className="mt-1">
                        {getVehicleStatusBadge(selectedVehicle.status)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Thông số kỹ thuật</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Hãng xe</Label>
                      <p className="font-medium">{selectedVehicle.brand}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Model</Label>
                      <p className="font-medium">{selectedVehicle.model}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Dung lượng pin
                      </Label>
                      <p className="font-medium">{selectedVehicle.capacity} Ah</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        Quãng đường/lần sạc
                      </Label>
                      <p className="font-medium">{selectedVehicle.rangePerFullCharge} km</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Loại pin</Label>
                      <p className="font-medium">{selectedVehicle.batteryType || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Mức pin hiện tại</Label>
                      <p className="font-medium">{selectedVehicle.batteryLevel != null ? `${selectedVehicle.batteryLevel}%` : '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Số km ODO</Label>
                      <p className="font-medium">{selectedVehicle.odo != null ? selectedVehicle.odo.toLocaleString() + ' km' : '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Số chỗ ngồi</Label>
                      <p className="font-medium">{selectedVehicle.numberSeat != null ? selectedVehicle.numberSeat : '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-900">
                    <DollarSign className="h-4 w-4" />
                    Thông tin giá
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(selectedVehicle.pricePerHour)}/giờ
                  </div>
                </CardContent>
              </Card>

              {/* Station Info */}
              {selectedVehicle.station && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Thông tin trạm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Tên trạm</Label>
                        <p className="font-medium">{selectedVehicle.station.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Địa chỉ</Label>
                        <p className="font-medium">{selectedVehicle.station.address}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Trạng thái trạm</Label>
                        <Badge variant={selectedVehicle.station.status === 'active' ? 'default' : 'secondary'}>
                          {selectedVehicle.station.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Vĩ độ</Label>
                          <p className="font-medium">{selectedVehicle.station.latitude}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Kinh độ</Label>
                          <p className="font-medium">{selectedVehicle.station.longitude}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleDetailDialogOpen(false)}>
              Đóng
            </Button>
            <Button onClick={() => {
              setVehicleDetailDialogOpen(false);
              handleEditVehicle(selectedVehicle);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Update Dialog */}
      <Dialog open={vehicleUpdateDialogOpen} onOpenChange={setVehicleUpdateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Cập nhật thông tin xe
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông số kỹ thuật xe - {selectedVehicle?.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Hãng xe *</Label>
              <Input
                id="brand"
                placeholder="Nhập hãng xe (VD: Honda, Yamaha...)"
                value={updateForm.brand}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                placeholder="Nhập model xe (VD: Air Blade, Vision...)"
                value={updateForm.model}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Dung lượng pin (Ah) *
              </Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Nhập dung lượng pin (VD: 20)"
                value={updateForm.capacity}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, capacity: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="range" className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                Quãng đường/lần sạc (km) *
              </Label>
              <Input
                id="range"
                type="number"
                placeholder="Nhập quãng đường (VD: 250)"
                value={updateForm.rangePerFullCharge}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, rangePerFullCharge: e.target.value }))}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Biển số xe, loại xe và giá thuê không thể thay đổi.
                Chỉ cập nhật thông số kỹ thuật của xe.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleUpdateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitVehicleUpdate} disabled={loading}>
              <Edit className="h-4 w-4 mr-2" />
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Incident Dialog */}
      <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Báo cáo sự cố
            </DialogTitle>
            <DialogDescription>
              Báo cáo sự cố về xe tại trạm (hỏng hóc, tai nạn, cháy nổ)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="incident-vehicle">Mã xe *</Label>
              <Select
                value={incidentForm.vehicle_id}
                onValueChange={(value) => setIncidentForm(prev => ({ ...prev, vehicle_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn xe" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles
                    .filter((v) => v.status !== 'rented' && v.status !== 'in_use')
                    .map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.licensePlate || vehicle.license_plate || 'N/A'} - {vehicle.brand} {vehicle.model}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-rental">Mã lượt thuê (tùy chọn)</Label>
              <Input
                id="incident-rental"
                type="number"
                placeholder="Nhập mã lượt thuê (nếu có)"
                value={incidentForm.rental_id}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, rental_id: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-description">Mô tả sự cố *</Label>
              <Textarea
                id="incident-description"
                placeholder="Mô tả chi tiết sự cố (hỏng hóc, tai nạn, cháy nổ, ...)"
                value={incidentForm.description}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Mức độ nghiêm trọng *</Label>
              <Select
                value={incidentForm.severity}
                onValueChange={(value) => setIncidentForm(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Thấp
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Trung bình
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      Cao
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIncidentDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitIncident} disabled={loading}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Báo cáo sự cố
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationManagement;