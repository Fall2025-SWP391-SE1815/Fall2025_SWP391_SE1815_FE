import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Car, Edit, Trash2, Search, Eye, Battery, Settings, Filter } from 'lucide-react';
import vehicleService from '@/services/vehicles/vehicleService';
import stationService from '@/services/stations/stationService';
import { useToast } from '@/hooks/use-toast';

const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    licensePlate: '',
    type: '',
    brand: '',
    model: '',
    capacity: '',
    rangePerFullCharge: '',
    status: 'available',
    pricePerHour: '',
    stationId: ''
  });
  const [statistics, setStatistics] = useState({
    available: 0,
    rented: 0,
    maintenance: 0,
    reserved: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
    fetchStations();
    fetchStatistics();
  }, []);

  // ...existing code...

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.plate_number = searchTerm;
      const res = await vehicleService.admin.getVehicles(params);
      // flexible parsing in case API returns { vehicles } or raw array
      const list = res?.vehicles || res?.data || res || [];
      setVehicles(Array.isArray(list) ? list : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phương tiện',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await stationService.admin.getStations();
      const list = res?.stations || res?.data || res || [];
      setStations(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await vehicleService.admin.getVehicleStats();
      // API may return an object with counts or an array; normalize
      if (res && typeof res === 'object') {
        setStatistics({
          available: res.available || res.available_count || 0,
          rented: res.rented || res.rented_count || 0,
          maintenance: res.maintenance || res.maintenance_count || 0,
          reserved: res.reserved || res.reserved_count || 0
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleCreateVehicle = async () => {
    try {
      const payload = {
        licensePlate: formData.licensePlate,
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        capacity: Number.parseInt(formData.capacity, 10),
        rangePerFullCharge: formData.rangePerFullCharge ? Number.parseFloat(formData.rangePerFullCharge) : undefined,
        status: formData.status,
        pricePerHour: formData.pricePerHour ? Number.parseFloat(formData.pricePerHour) : undefined,
        stationId: formData.stationId ? Number.parseInt(formData.stationId, 10) : undefined
      };
      await vehicleService.admin.createVehicle(payload);
      toast({ title: 'Thành công', description: 'Đã tạo phương tiện mới thành công' });
      setShowCreateDialog(false);
      resetForm();
      fetchVehicles();
      fetchStatistics();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast({
        title: 'Lỗi',
        description: error?.message || error?.response?.data?.message || 'Không thể tạo phương tiện mới',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      const payload = {
        licensePlate: formData.licensePlate,
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        capacity: formData.capacity ? Number.parseInt(formData.capacity, 10) : undefined,
        rangePerFullCharge: formData.rangePerFullCharge ? Number.parseFloat(formData.rangePerFullCharge) : undefined,
        status: formData.status,
        pricePerHour: formData.pricePerHour ? Number.parseFloat(formData.pricePerHour) : undefined,
        stationId: formData.stationId ? Number.parseInt(formData.stationId, 10) : undefined
      };
      await vehicleService.admin.updateVehicle(selectedVehicle.id, payload);
      toast({ title: 'Thành công', description: 'Đã cập nhật phương tiện thành công' });
      setShowEditDialog(false);
      setSelectedVehicle(null);
      resetForm();
      fetchVehicles();
      fetchStatistics();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật phương tiện',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) {
      return;
    }

    try {
      await vehicleService.admin.deleteVehicle(vehicleId);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast({ title: 'Thành công', description: 'Đã xóa phương tiện thành công' });
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa phương tiện',
        variant: 'destructive'
      });
    }
  };

  const handleViewVehicle = async (vehicle) => {
    try {
      const res = await vehicleService.admin.getVehicleById(vehicle.id);
      const data = res?.vehicle || res?.data || res || vehicle;
      setSelectedVehicle(data);
      setShowViewDialog(true);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin chi tiết phương tiện',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      licensePlate: '',
      type: '',
      brand: '',
      model: '',
      capacity: '',
      status: 'available',
      pricePerHour: '',
      stationId: ''
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const openEditDialog = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      capacity: vehicle.capacity.toString(),
      status: vehicle.status,
      pricePerHour: vehicle.pricePerHour.toString(),
      rangePerFullCharge: vehicle.rangePerFullCharge ? vehicle.rangePerFullCharge.toString() : '',
      stationId: vehicle.stationId
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'available': { label: 'Có sẵn', variant: 'default' },
      'rented': { label: 'Đang thuê', variant: 'secondary' },
      'maintenance': { label: 'Bảo trì', variant: 'destructive' },
      'reserved': { label: 'Đã đặt', variant: 'outline' }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getVehicleTypeLabel = (type) => {
    return type === 'car' ? 'Ô tô' : 'Xe máy';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getBatteryColor = (level) => {
    if (level >= 70) return 'text-green-600';
    if (level >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.station.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Re-fetch data when filters change
  useEffect(() => {
    fetchVehicles();
  }, [statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý Phương tiện</h1>
          <p className='text-muted-foreground'>
            Quản lý các phương tiện trong hệ thống
          </p>
        </div>
        
        <Button onClick={openCreateDialog}>
          <Plus className='h-4 w-4 mr-2' />
          Thêm phương tiện mới
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng số xe</CardTitle>
            <Car className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{vehicles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Có sẵn</CardTitle>
            <Car className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{statistics.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đang thuê</CardTitle>
            <Car className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{statistics.rented}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Bảo trì</CardTitle>
            <Settings className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{statistics.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm phương tiện...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-48'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Lọc theo trạng thái' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            <SelectItem value='available'>Có sẵn</SelectItem>
            <SelectItem value='rented'>Đang thuê</SelectItem>
            <SelectItem value='maintenance'>Bảo trì</SelectItem>
            <SelectItem value='reserved'>Đã đặt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách phương tiện</CardTitle>
          <CardDescription>
            Quản lý thông tin các phương tiện trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Biển số</TableHead>
                <TableHead>Loại xe</TableHead>
                <TableHead>Hãng xe</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Dung lượng</TableHead>
                <TableHead>Trạm</TableHead>
                <TableHead>Giá/giờ</TableHead>
                <TableHead>Pin</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className='font-medium'>
                    {vehicle.licensePlate}
                  </TableCell>
                  <TableCell>{getVehicleTypeLabel(vehicle.type)}</TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.capacity}</TableCell>
                  <TableCell>{vehicle.station.name || 'Chưa phân bổ'}</TableCell>
                  <TableCell>{formatCurrency(vehicle.pricePerHour)}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Battery className='h-4 w-4' />
                      <span className={getBatteryColor(vehicle.rangePerFullCharge)}>
                        {vehicle.rangePerFullCharge || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(vehicle.status)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewVehicle(vehicle)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => openEditDialog(vehicle)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredVehicles.length === 0 && !loading && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm || (statusFilter && statusFilter !== 'all') ? 'Không tìm thấy phương tiện phù hợp' : 'Không có phương tiện nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Vehicle Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Thêm phương tiện mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin phương tiện mới vào hệ thống
            </DialogDescription>
          </DialogHeader>
          
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='license_plate'>Biển số xe</Label>
                <Input
                  id='license_plate'
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  placeholder='51G-12345'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='type'>Loại xe</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn loại xe' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='car'>Ô tô</SelectItem>
                    <SelectItem value='motorbike'>Xe máy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='brand'>Hãng xe</Label>
                <Input
                  id='brand'
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder='Honda, Toyota, VinFast...'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='model'>Model</Label>
                <Input
                  id='model'
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder='Vision 2023, Vios 2024...'
                />
              </div>
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='capacity'>Sức chứa</Label>
                <Input
                  id='capacity'
                  type='number'
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder='2, 5, 7...'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='price_per_hour'>Giá/giờ (VND)</Label>
                <Input
                  id='price_per_hour'
                  type='number'
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                  placeholder='50000'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='range_per_full_charge'>Quãng đường / sạc đầy (km)</Label>
                <Input
                  id='range_per_full_charge'
                  type='number'
                  value={formData.rangePerFullCharge}
                  onChange={(e) => setFormData({...formData, rangePerFullCharge: e.target.value})}
                  placeholder='250'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='status'>Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='available'>Có sẵn</SelectItem>
                    <SelectItem value='maintenance'>Bảo trì</SelectItem>
                    <SelectItem value='reserved'>Đã đặt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='stationId'>Trạm</Label>
              <Select value={formData.stationId} onValueChange={(value) => setFormData({...formData, stationId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn trạm' />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateVehicle}>
              Tạo phương tiện
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Cập nhật phương tiện</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin phương tiện
            </DialogDescription>
          </DialogHeader>
          
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_license_plate'>Biển số xe</Label>
                <Input
                  id='edit_license_plate'
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  placeholder='51G-12345'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='edit_type'>Loại xe</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn loại xe' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='car'>Ô tô</SelectItem>
                    <SelectItem value='motorbike'>Xe máy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_brand'>Hãng xe</Label>
                <Input
                  id='edit_brand'
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder='Honda, Toyota, VinFast...'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='edit_model'>Model</Label>
                <Input
                  id='edit_model'
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder='Vision 2023, Vios 2024...'
                />
              </div>
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_capacity'>Sức chứa</Label>
                <Input
                  id='edit_capacity'
                  type='number'
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder='2, 5, 7...'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='edit_price_per_hour'>Giá/giờ (VND)</Label>
                <Input
                  id='edit_price_per_hour'
                  type='number'
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                  placeholder='50000'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='rangePerFullCharge'>Quãng đường / sạc đầy (km)</Label>
                <Input
                  id='edit_rangePerFullCharge'
                  type='number'
                  value={formData.rangePerFullCharge}
                  onChange={(e) => setFormData({...formData, rangePerFullCharge: e.target.value})}
                  placeholder='250'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit_status'>Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='available'>Có sẵn</SelectItem>
                    <SelectItem value='rented'>Đang thuê</SelectItem>
                    <SelectItem value='maintenance'>Bảo trì</SelectItem>
                    <SelectItem value='reserved'>Đã đặt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit_station_id'>Trạm</Label>
              <Select value={formData.stationId} onValueChange={(value) => setFormData({...formData, stationId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn trạm' />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowEditDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateVehicle}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Vehicle Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết phương tiện</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của phương tiện
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Biển số xe</Label>
                  <p className='text-lg font-semibold'>{selectedVehicle.licensePlate}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Loại xe</Label>
                  <p className='text-lg'>{getVehicleTypeLabel(selectedVehicle.type)}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Hãng xe</Label>
                  <p className='text-lg'>{selectedVehicle.brand}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Model</Label>
                  <p className='text-lg'>{selectedVehicle.model}</p>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Dung lượng</Label>
                  <p className='text-lg'>{selectedVehicle.capacity} </p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Giá/giờ</Label>
                  <p className='text-lg'>{formatCurrency(selectedVehicle.pricePerHour)}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Mức pin</Label>
                  <p className='text-lg'>{selectedVehicle.rangePerFullCharge || 0}%</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạng thái</Label>
                  <div className='mt-1'>
                    {getStatusBadge(selectedVehicle.status)}
                  </div>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạm</Label>
                  <p className='text-lg'>{selectedVehicle.station.name || 'Chưa phân bổ'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowViewDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehiclesManagement;
