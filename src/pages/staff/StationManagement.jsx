import React, { useState, useEffect } from 'react';
import vehicleService from '@/services/vehicles/vehicleService';
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
  Settings,
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
  Activity
} from 'lucide-react';

const StationManagement = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('vehicles');
  const [loading, setLoading] = useState(false);
  
  // State for vehicles
  const [vehicles, setVehicles] = useState([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // State for violations
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);
  const [violationForm, setViolationForm] = useState({
    rental_id: '',
    description: '',
    fine_amount: ''
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

  // (Removed mock vehicles; using real API)

  // Mock data for current rentals
  const mockCurrentRentals = [
    {
      rental_id: 101,
      vehicle: {
        id: 2,
        license_plate: "29A1-67890",
        type: "Electric Bike"
      },
      renter: {
        id: 1,
        full_name: "Nguyễn Văn Minh",
        phone: "0909123456"
      },
      start_time: "2025-09-23T09:30:00Z",
      expected_end_time: "2025-09-23T17:30:00Z",
      status: "in_use"
    },
    {
      rental_id: 102,
      vehicle: {
        id: 5,
        license_plate: "29A1-33333",
        type: "Electric Scooter"
      },
      renter: {
        id: 2,
        full_name: "Trần Thị Lan",
        phone: "0912345678"
      },
      start_time: "2025-09-23T11:00:00Z",
      expected_end_time: "2025-09-23T19:00:00Z",
      status: "in_use"
    }
  ];

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

  const fetchCurrentRentals = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/staff/rentals/current');
      // setCurrentRentals(response.data.data);
      
      // Using mock data for now
      setCurrentRentals(mockCurrentRentals);
      
    } catch (error) {
      console.error('Error fetching current rentals:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thuê xe hiện tại",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVehicleStatus = (vehicle) => {
    setSelectedVehicle(vehicle);
    setNewStatus(vehicle.status);
    setStatusDialogOpen(true);
  };

  const updateVehicleStatus = async () => {
    try {
      if (!newStatus) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng chọn trạng thái mới",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      
      // Real API call
      await apiClient.put(`/api/staff/vehicles/${selectedVehicle.id}/status`, {
        status: newStatus
      });

      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái xe thành công.",
      });

      setStatusDialogOpen(false);
      fetchVehicles(); // Refresh the list
      
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái xe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/api/staff/violations', {
      //   rental_id: parseInt(violationForm.rental_id),
      //   description: violationForm.description,
      //   fine_amount: fineAmount
      // });
      
      // Mock success response
      const mockResponse = {
        success: true,
        message: "Vi phạm đã được ghi nhận.",
        data: {
          violation_id: Date.now(),
          rental_id: parseInt(violationForm.rental_id),
          staff_id: 1,
          description: violationForm.description,
          fine_amount: fineAmount,
          created_at: new Date().toISOString()
        }
      };

      toast({
        title: "Thành công",
        description: mockResponse.message,
      });

      setViolationDialogOpen(false);
      setViolationForm({ rental_id: '', description: '', fine_amount: '' });
      
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
      
      // TODO: Replace with actual API call
      // const response = await apiClient.post('/api/staff/incidents', {
      //   vehicle_id: parseInt(incidentForm.vehicle_id),
      //   rental_id: incidentForm.rental_id ? parseInt(incidentForm.rental_id) : null,
      //   description: incidentForm.description,
      //   severity: incidentForm.severity
      // });
      
      // Mock success response
      const mockResponse = {
        success: true,
        message: "Sự cố đã được ghi nhận.",
        data: {
          incident_id: Date.now(),
          vehicle_id: parseInt(incidentForm.vehicle_id),
          rental_id: incidentForm.rental_id ? parseInt(incidentForm.rental_id) : null,
          staff_id: 1,
          description: incidentForm.description,
          severity: incidentForm.severity,
          status: "pending",
          created_at: new Date().toISOString()
        }
      };

      toast({
        title: "Thành công",
        description: mockResponse.message,
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
      rented: { label: 'Đang thuê', variant: 'secondary', icon: Clock },
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
          <Button onClick={() => setViolationDialogOpen(true)} variant="outline">
            <Flag className="h-4 w-4 mr-2" />
            Ghi nhận vi phạm
          </Button>
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
                      <TableHead>Pin & Bảo trì</TableHead>
                      <TableHead>Giá thuê</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {vehicle.licensePlate}
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
                            {formatCurrency(vehicle.pricePerHour || 0)}/giờ
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateVehicleStatus(vehicle)}
                            disabled={loading}
                            className="w-full"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Đổi trạng thái
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

        {/* Current Rentals Tab */}
        <TabsContent value="rentals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lượt thuê đang diễn ra
              </CardTitle>
              <CardDescription>
                Các lượt thuê xe hiện tại tại trạm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentRentals.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không có lượt thuê nào đang diễn ra</p>
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
                      <TableRow key={rental.rental_id}>
                        <TableCell>
                          <div className="font-medium">
                            #{rental.rental_id}
                          </div>
                        </TableCell>
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
                            <div className="text-sm">
                              <strong>Bắt đầu:</strong> {formatDateTime(rental.start_time)}
                            </div>
                            <div className="text-sm">
                              <strong>Dự kiến kết thúc:</strong> {formatDateTime(rental.expected_end_time)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Đang sử dụng
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

      {/* Vehicle Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cập nhật trạng thái xe
            </DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái cho xe: {selectedVehicle?.license_plate}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái mới *</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Khả dụng
                    </div>
                  </SelectItem>
                  <SelectItem value="rented">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Đang thuê
                    </div>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Bảo trì
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={updateVehicleStatus} disabled={loading}>
              <Settings className="h-4 w-4 mr-2" />
              Cập nhật
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
                placeholder="Mô tả chi tiết vi phạm (ví dụ: không đội mũ bảo hiểm, vượt đèn đỏ, ...)"
                value={violationForm.description}
                onChange={(e) => setViolationForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fine-amount">Số tiền phạt (VND) *</Label>
              <Input
                id="fine-amount"
                type="number"
                placeholder="Nhập số tiền phạt"
                value={violationForm.fine_amount}
                onChange={(e) => setViolationForm(prev => ({ ...prev, fine_amount: e.target.value }))}
              />
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
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
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