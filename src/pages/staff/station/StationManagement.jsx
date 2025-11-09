import React, { useState, useEffect } from 'react';
import vehicleService from '@/services/vehicles/vehicleService';
import staffRentalService from '@/services/staff/staffRentalService';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Car, MapPin, AlertTriangle, Flag, Clock, User, RefreshCw,
  Edit, Shield, Flame, Wrench, DollarSign, Phone, Eye, Zap, Gauge, CheckCircle, Activity,
} from 'lucide-react';

const StationManagement = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('vehicles');
  const [loading, setLoading] = useState(false);

  // --- States ---
  const [vehicles, setVehicles] = useState([]);
  const [currentRentals, setCurrentRentals] = useState([]);
  const [incidentReports, setIncidentReports] = useState([]);

  // --- Dialog States ---
  const [vehicleDetailDialogOpen, setVehicleDetailDialogOpen] = useState(false);
  const [vehicleUpdateDialogOpen, setVehicleUpdateDialogOpen] = useState(false);
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [incidentDetailDialogOpen, setIncidentDetailDialogOpen] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [updateForm, setUpdateForm] = useState({
    brand: '', model: '', capacity: '', rangePerFullCharge: '',
  });

  const [incidentForm, setIncidentForm] = useState({
    vehicle_id: '', rental_id: '', description: '', severity: '',
  });

  // --- Fetch data ---
  useEffect(() => {
    fetchVehicles();
    fetchCurrentRentals();
    fetchIncidentReports();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleService.staff.getAllStaffVehicles();
      const data = Array.isArray(res) ? res : res?.data || [];
      setVehicles(data);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách xe', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const fetchCurrentRentals = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getRentals({ status: 'in_use' });
      const data = Array.isArray(res) ? res : res?.data || res?.content || [];
      setCurrentRentals(data);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải lượt thuê', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const fetchIncidentReports = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getIncidentReports();
      const data = Array.isArray(res) ? res : res?.data || [];
      setIncidentReports(data);
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải báo cáo sự cố', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  // --- UI helper ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString('vi-VN') : 'N/A';

  const getVehicleStatusBadge = (status) => {
    const cfg = {
      available: { label: 'Khả dụng', icon: Activity, variant: 'default' },
      maintenance: { label: 'Bảo trì', icon: Wrench, variant: 'destructive' },
      awaiting_inspection: { label: 'Chờ kiểm tra', icon: Shield, variant: 'outline' },
      rented: { label: 'Đang thuê', icon: Clock, variant: 'secondary' },
    }[status?.toLowerCase()] || { label: status, icon: Activity, variant: 'outline' };
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="h-3 w-3" /> {cfg.label}
      </Badge>
    );
  };

  const getSeverityBadge = (s) => {
    const cfg = {
      low: { label: 'Thấp', variant: 'secondary' },
      medium: { label: 'Trung bình', variant: 'outline' },
      high: { label: 'Cao', variant: 'destructive' },
    }[s?.toLowerCase()] || { label: s, variant: 'outline' };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'available').length,
    rented: vehicles.filter((v) => v.status === 'rented').length,
    maintenance: vehicles.filter((v) => v.status === 'maintenance').length,
  };

  // --- Actions ---
  const handleViewVehicleDetail = (v) => { setSelectedVehicle(v); setVehicleDetailDialogOpen(true); };
  const handleEditVehicle = (v) => {
    setSelectedVehicle(v);
    setUpdateForm({
      brand: v.brand || '', model: v.model || '',
      capacity: v.capacity?.toString() || '',
      rangePerFullCharge: v.rangePerFullCharge?.toString() || '',
    });
    setVehicleUpdateDialogOpen(true);
  };

  const submitVehicleUpdate = async () => {
    if (!selectedVehicle) return;
    try {
      setLoading(true);
      await vehicleService.staff.updateVehicle(selectedVehicle.id, {
        brand: updateForm.brand,
        model: updateForm.model,
        capacity: parseInt(updateForm.capacity),
        rangePerFullCharge: parseInt(updateForm.rangePerFullCharge),
      });
      toast({ title: 'Thành công', description: 'Cập nhật xe thành công' });
      setVehicleUpdateDialogOpen(false);
      fetchVehicles();
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật xe', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const submitIncident = async () => {
    try {
      setLoading(true);
      await staffRentalService.createIncidentReport({
        vehicleId: parseInt(incidentForm.vehicle_id),
        rentalId: incidentForm.rental_id ? parseInt(incidentForm.rental_id) : null,
        description: incidentForm.description,
        severity: incidentForm.severity.toUpperCase(),
      });
      toast({ title: 'Thành công', description: 'Đã báo cáo sự cố' });
      setIncidentDialogOpen(false);
      fetchIncidentReports();
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể báo cáo sự cố', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tại điểm</h1>
          <p className="text-muted-foreground">Quản lý xe, lượt thuê và sự cố</p>
        </div>
        <Button onClick={() => {
          fetchVehicles(); fetchCurrentRentals(); fetchIncidentReports();
        }} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" /> Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex justify-between"><CardTitle>Tổng xe</CardTitle><Car className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex justify-between"><CardTitle>Khả dụng</CardTitle><Activity className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.available}</div></CardContent></Card>
        <Card><CardHeader className="flex justify-between"><CardTitle>Đang thuê</CardTitle><Clock className="h-4 w-4 text-orange-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.rented}</div></CardContent></Card>
        <Card><CardHeader className="flex justify-between"><CardTitle>Bảo trì</CardTitle><Wrench className="h-4 w-4 text-red-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.maintenance}</div></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vehicles"><Car className="h-4 w-4" />Xe ({vehicles.length})</TabsTrigger>
          <TabsTrigger value="rentals"><Clock className="h-4 w-4" />Thuê ({currentRentals.length})</TabsTrigger>
          <TabsTrigger value="incidents"><AlertTriangle className="h-4 w-4" />Sự cố ({incidentReports.length})</TabsTrigger>
        </TabsList>

        {/* Xe */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader><CardTitle>Xe tại trạm</CardTitle></CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Không có xe nào</p>
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
                    {vehicles.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <div className="font-medium">{v.licensePlate}</div>
                          <div className="text-sm text-muted-foreground">{v.brand} {v.model}</div>
                        </TableCell>
                        <TableCell>{getVehicleStatusBadge(v.status)}</TableCell>
                        <TableCell>{v.station?.name || 'N/A'}</TableCell>
                        <TableCell>{formatCurrency(v.pricePerHour)}/giờ</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewVehicleDetail(v)}><Eye className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditVehicle(v)}><Edit className="h-4 w-4" /></Button>
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
                      <TableHead>Thao tác</TableHead>
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
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReportIncidentForRental(rental)}
                            className="gap-2"
                          >
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Báo cáo sự cố
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incident Reports Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danh sách báo cáo sự cố
              </CardTitle>
              <CardDescription>
                Các báo cáo sự cố đã được ghi nhận tại trạm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incidentReports.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không có báo cáo sự cố nào</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã báo cáo</TableHead>
                      <TableHead>Xe liên quan</TableHead>
                      <TableHead>Lượt thuê</TableHead>
                      <TableHead>Mức độ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidentReports.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div className="font-medium">
                            #{incident.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {incident.vehicle?.licensePlate || incident.vehicle?.license_plate || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {incident.vehicle?.brand} {incident.vehicle?.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {incident.rental?.id ? `#${incident.rental.id}` : 'Không có'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(incident.severity)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={incident.status === 'resolved' ? 'default' : 'secondary'}>
                            {incident.status === 'resolved' ? 'Đã xử lý' :
                              incident.status === 'pending' ? 'Đang xử lý' :
                                incident.status === 'investigating' ? 'Đang điều tra' :
                                  incident.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDateTime(incident.createdAt || incident.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewIncidentDetail(incident)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Chi tiết
                          </Button>
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

      {/* Incident Detail Dialog */}
      <Dialog open={incidentDetailDialogOpen} onOpenChange={setIncidentDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Chi tiết báo cáo sự cố #{selectedIncident?.id}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về sự cố đã được báo cáo
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-4">
              {/* Basic Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Mã báo cáo</Label>
                      <p className="font-medium">#{selectedIncident.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Mức độ nghiêm trọng</Label>
                      <div className="mt-1">
                        {getSeverityBadge(selectedIncident.severity)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Trạng thái</Label>
                      <div className="mt-1">
                        <Badge variant={selectedIncident.status === 'resolved' ? 'default' : 'secondary'}>
                          {selectedIncident.status === 'resolved' ? 'Đã xử lý' :
                            selectedIncident.status === 'pending' ? 'Đang xử lý' :
                              selectedIncident.status === 'investigating' ? 'Đang điều tra' :
                                selectedIncident.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Ngày tạo</Label>
                      <p className="font-medium">{formatDateTime(selectedIncident.createdAt || selectedIncident.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Info */}
              {selectedIncident.vehicle && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Thông tin xe liên quan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Biển số</Label>
                        <p className="font-medium text-lg">{selectedIncident.vehicle.licensePlate || selectedIncident.vehicle.license_plate}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Hãng xe</Label>
                        <p className="font-medium">{selectedIncident.vehicle.brand} {selectedIncident.vehicle.model}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Loại xe</Label>
                        <p className="font-medium capitalize">{selectedIncident.vehicle.type}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">ID Xe</Label>
                        <p className="font-medium">#{selectedIncident.vehicle.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rental Info */}
              {selectedIncident.rental && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Thông tin lượt thuê liên quan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Mã thuê</Label>
                        <p className="font-medium">#{selectedIncident.rental.id}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Khách hàng</Label>
                        <p className="font-medium">{selectedIncident.rental.renter?.fullName || selectedIncident.rental.renter?.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Số điện thoại</Label>
                        <p className="font-medium">{selectedIncident.rental.renter?.phone}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Thời gian thuê</Label>
                        <p className="font-medium">
                          {formatDateTime(selectedIncident.rental.startTime || selectedIncident.rental.start_time)} - {formatDateTime(selectedIncident.rental.endTime || selectedIncident.rental.end_time)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Incident Description */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Mô tả sự cố</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedIncident.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Info */}
              {selectedIncident.reportedBy && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nhân viên báo cáo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Tên nhân viên</Label>
                        <p className="font-medium">{selectedIncident.reportedBy.fullName || selectedIncident.reportedBy.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedIncident.reportedBy.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resolution Info */}
              {selectedIncident.resolvedAt && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-900">
                      <CheckCircle className="h-4 w-4" />
                      Thông tin xử lý
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Ngày xử lý xong</Label>
                        <p className="font-medium text-green-900">{formatDateTime(selectedIncident.resolvedAt || selectedIncident.resolved_at)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Người xử lý</Label>
                        <p className="font-medium text-green-900">{selectedIncident.resolvedBy?.fullName || selectedIncident.resolvedBy?.full_name || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedIncident.resolutionNotes && (
                      <div className="mt-4">
                        <Label className="text-muted-foreground">Ghi chú xử lý</Label>
                        <div className="bg-white border border-green-200 p-3 rounded mt-1">
                          <p className="text-sm text-green-900 whitespace-pre-wrap">{selectedIncident.resolutionNotes || selectedIncident.resolution_notes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIncidentDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationManagement;