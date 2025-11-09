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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useGlobalToast } from "@/components/ui/global-toast";
import {
  Car, MapPin, Clock, Edit, Wrench,
  RefreshCw, DollarSign, Eye, Zap, Gauge, Activity, Shield,
} from 'lucide-react';

const StationManagement = () => {
  const { success, error } = useGlobalToast();
  const [selectedTab, setSelectedTab] = useState('vehicles');
  const [loading, setLoading] = useState(false);

  // --- States ---
  const [vehicles, setVehicles] = useState([]);
  const [currentRentals, setCurrentRentals] = useState([]);

  // --- Dialog States ---
  const [vehicleDetailDialogOpen, setVehicleDetailDialogOpen] = useState(false);
  const [vehicleUpdateDialogOpen, setVehicleUpdateDialogOpen] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    brand: '', model: '', capacity: '', rangePerFullCharge: '',
  });

  // --- Fetch data ---
  useEffect(() => {
    fetchVehicles();
    fetchCurrentRentals();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleService.staff.getAllStaffVehicles();
      const data = Array.isArray(res) ? res : res?.data || [];
      setVehicles(data);
    } catch {
      error('Không thể tải danh sách xe');
    } finally { setLoading(false); }
  };

  const fetchCurrentRentals = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getRentals({ status: 'in_use' });
      const data = Array.isArray(res) ? res : res?.data || res?.content || [];
      setCurrentRentals(data);
    } catch {
      error('Không thể tải lượt thuê');
    } finally { setLoading(false); }
  };

  // --- UI helper ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString('vi-VN') : 'N/A';

  const getVehicleStatusBadge = (status) => {
    const map = {
      available: { label: 'Khả dụng', icon: Activity, variant: 'default' },
      maintenance: { label: 'Bảo trì', icon: Wrench, variant: 'destructive' },
      awaiting_inspection: { label: 'Chờ kiểm tra', icon: Shield, variant: 'outline' },
      rented: { label: 'Đang thuê', icon: Clock, variant: 'secondary' },
    };
    const cfg = map[status?.toLowerCase()] || { label: status || 'N/A', icon: Activity, variant: 'outline' };
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="h-3 w-3" /> {cfg.label}
      </Badge>
    );
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
      success('Cập nhật xe thành công');
      setVehicleUpdateDialogOpen(false);
      fetchVehicles();
    } catch {
      error('Không thể cập nhật xe');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tại điểm</h1>
          <p className="text-muted-foreground">Quản lý xe và lượt thuê</p>
        </div>
        <Button onClick={() => {
          fetchVehicles(); fetchCurrentRentals();
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles">
            <Car className="h-4 w-4" />
            Xe khả dụng ({vehicles.filter(v => v.status !== 'rented').length})
          </TabsTrigger>
          <TabsTrigger value="rentals">
            <Clock className="h-4 w-4" />
            Đang cho thuê ({currentRentals.length + vehicles.filter(v => v.status === 'rented').length})
          </TabsTrigger>
        </TabsList>

        {/* Xe khả dụng */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader><CardTitle>Xe tại trạm (khả dụng)</CardTitle></CardHeader>
            <CardContent>
              {vehicles.filter(v => v.status !== 'rented').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Không có xe khả dụng</p>
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
                      .filter((v) => v.status !== 'rented')
                      .map((v) => (
                        <TableRow key={v.id}>
                          <TableCell>
                            <div className="font-medium">{v.licensePlate}</div>
                            <div className="text-sm text-muted-foreground">
                              {v.brand} {v.model}
                            </div>
                          </TableCell>
                          <TableCell>{getVehicleStatusBadge(v.status)}</TableCell>
                          <TableCell>{v.station?.name || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(v.pricePerHour)}/giờ</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewVehicleDetail(v)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditVehicle(v)}>
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

        {/* Đang cho thuê */}
        <TabsContent value="rentals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Xe đang cho thuê
              </CardTitle>
              <CardDescription>
                Bao gồm lượt thuê và xe có trạng thái “rented”.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {[...currentRentals, ...vehicles.filter(v => v.status === 'rented')].length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không có xe nào đang cho thuê</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã</TableHead>
                      <TableHead>Xe</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...currentRentals, ...vehicles.filter(v => v.status === 'rented')].map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>#{item.id || item.rental_id || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.vehicle?.licensePlate || item.licensePlate}</span>
                            <span className="text-sm text-muted-foreground">
                              {item.vehicle?.brand || item.brand} {item.vehicle?.model || item.model}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{item.renter ? item.renter.fullName || item.renter.full_name : 'N/A'}</TableCell>
                        <TableCell>
                          {item.startTime
                            ? formatDateTime(item.startTime)
                            : item.start_time
                              ? formatDateTime(item.start_time)
                              : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Đang được thuê</Badge>
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
            <DialogDescription>Thông tin đầy đủ về xe tại trạm</DialogDescription>
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
                    <div><Label>ID Xe</Label><p className="font-medium">#{selectedVehicle.id}</p></div>
                    <div><Label>Biển số</Label><p className="font-medium text-lg">{selectedVehicle.licensePlate}</p></div>
                    <div><Label>Loại xe</Label><p className="font-medium capitalize">{selectedVehicle.type}</p></div>
                    <div><Label>Trạng thái</Label>{getVehicleStatusBadge(selectedVehicle.status)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Details */}
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Thông số kỹ thuật</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><Label>Hãng xe</Label><p className="font-medium">{selectedVehicle.brand}</p></div>
                    <div><Label>Model</Label><p className="font-medium">{selectedVehicle.model}</p></div>
                    <div><Label className="flex items-center gap-1"><Zap className="h-3 w-3" />Dung lượng pin</Label><p className="font-medium">{selectedVehicle.capacity} Ah</p></div>
                    <div><Label className="flex items-center gap-1"><Gauge className="h-3 w-3" />Quãng đường/lần sạc</Label><p className="font-medium">{selectedVehicle.rangePerFullCharge} km</p></div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-900">
                    <DollarSign className="h-4 w-4" /> Thông tin giá
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
                      <div><Label>Tên trạm</Label><p className="font-medium">{selectedVehicle.station.name}</p></div>
                      <div><Label>Địa chỉ</Label><p className="font-medium">{selectedVehicle.station.address}</p></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleDetailDialogOpen(false)}>Đóng</Button>
            <Button onClick={() => {
              setVehicleDetailDialogOpen(false);
              handleEditVehicle(selectedVehicle);
            }}>
              <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Update Dialog */}
      <Dialog open={vehicleUpdateDialogOpen} onOpenChange={setVehicleUpdateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" /> Cập nhật thông tin xe
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông số kỹ thuật xe - {selectedVehicle?.licensePlate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Hãng xe *</Label>
              <Input value={updateForm.brand} onChange={(e) => setUpdateForm(prev => ({ ...prev, brand: e.target.value }))} />
            </div>
            <div>
              <Label>Model *</Label>
              <Input value={updateForm.model} onChange={(e) => setUpdateForm(prev => ({ ...prev, model: e.target.value }))} />
            </div>
            <div>
              <Label>Dung lượng pin (Ah) *</Label>
              <Input type="number" value={updateForm.capacity} onChange={(e) => setUpdateForm(prev => ({ ...prev, capacity: e.target.value }))} />
            </div>
            <div>
              <Label>Quãng đường/lần sạc (km) *</Label>
              <Input type="number" value={updateForm.rangePerFullCharge} onChange={(e) => setUpdateForm(prev => ({ ...prev, rangePerFullCharge: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleUpdateDialogOpen(false)}>Hủy</Button>
            <Button onClick={submitVehicleUpdate} disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationManagement;
