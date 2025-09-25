import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, Edit, Trash2, Search, Eye, Settings, Users, X } from 'lucide-react';
import { apiClient } from '@/lib/api/apiClient';
import { useToast } from '@/hooks/use-toast';

const StationsManagement = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      
      // Mock data for testing - replace with actual API call later
      const mockData = {
        stations: [
          {
            id: 1,
            name: "Trạm Quận 1",
            address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
            latitude: 10.762622,
            longitude: 106.660172,
            created_at: "2024-01-15T08:30:00Z"
          },
          {
            id: 2,
            name: "Trạm Quận 2",
            address: "456 Đường Trần Não, Phường Bình An, Quận 2, TP.HCM",
            latitude: 10.787448,
            longitude: 106.720557,
            created_at: "2024-02-20T10:15:00Z"
          },
          {
            id: 3,
            name: "Trạm Quận 3",
            address: "789 Võ Văn Tần, Phường 6, Quận 3, TP.HCM",
            latitude: 10.776889,
            longitude: 106.690899,
            created_at: "2024-09-18T14:45:00Z"
          },
          {
            id: 4,
            name: "Trạm Quận 7",
            address: "321 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM",
            latitude: 10.729054,
            longitude: 106.719308,
            created_at: "2024-03-10T16:20:00Z"
          },
          {
            id: 5,
            name: "Trạm Thủ Đức",
            address: "Đại học Quốc gia TP.HCM, Khu phố 6, Phường Linh Trung, Thành phố Thủ Đức",
            latitude: 10.870446,
            longitude: 106.802490,
            created_at: "2024-09-20T09:00:00Z"
          }
        ]
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStations(mockData.stations || []);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/admin/stations');
      // setStations(response.stations || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách trạm xe',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên trạm không được để trống';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Địa chỉ không được để trống';
    }
    
    if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
      errors.latitude = 'Vĩ độ phải là số hợp lệ';
    }
    
    if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
      errors.longitude = 'Kinh độ phải là số hợp lệ';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: ''
    });
    setFormErrors({});
  };

  const handleCreateStation = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const requestBody = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      // Mock success response for testing
      const mockResponse = {
        id: stations.length + 1,
        ...requestBody,
        created_at: new Date().toISOString()
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add to local state for now
      setStations([...stations, mockResponse]);
      
      toast({
        title: 'Thành công',
        description: 'Đã tạo trạm xe mới thành công'
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      
      // TODO: Replace with actual API call
      // await apiClient.post('/api/admin/stations', requestBody);
      // fetchStations();
    } catch (error) {
      console.error('Error creating station:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo trạm xe mới',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStation = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const requestBody = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      // Mock update for testing
      const updatedStations = stations.map(station => 
        station.id === selectedStation.id 
          ? { ...station, ...requestBody, updated_at: new Date().toISOString() }
          : station
      );
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStations(updatedStations);
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin trạm xe'
      });
      
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedStation(null);
      
      // TODO: Replace with actual API call
      // await apiClient.put(`/api/admin/stations/${selectedStation.id}`, requestBody);
      // fetchStations();
    } catch (error) {
      console.error('Error updating station:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin trạm xe',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteStation = async (stationId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa trạm xe này?')) {
      return;
    }

    try {
      // Mock delete for testing
      const updatedStations = stations.filter(station => station.id !== stationId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStations(updatedStations);
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa trạm xe thành công'
      });
      
      // TODO: Replace with actual API call
      // await apiClient.delete(`/api/admin/stations/${stationId}`);
      // fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa trạm xe',
        variant: 'destructive'
      });
    }
  };

  const handleViewStation = async (stationId) => {
    try {
      // Mock get station detail for testing
      const station = stations.find(s => s.id === stationId);
      
      if (!station) {
        toast({
          title: 'Lỗi',
          description: 'Không tìm thấy trạm xe',
          variant: 'destructive'
        });
        return;
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSelectedStation(station);
      setIsViewDialogOpen(true);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/api/admin/stations/${stationId}`);
      // setSelectedStation(response);
      // setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching station details:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin chi tiết trạm xe',
        variant: 'destructive'
      });
    }
  };

  const handleEditStation = (station) => {
    setSelectedStation(station);
    setFormData({
      name: station.name,
      address: station.address,
      latitude: station.latitude.toString(),
      longitude: station.longitude.toString()
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (station) => {
    // Since the API doesn't provide status, we'll determine it based on creation date
    const isNew = new Date() - new Date(station.created_at) < 7 * 24 * 60 * 60 * 1000;
    
    return (
      <Badge variant={isNew ? 'default' : 'secondary'}>
        {isNew ? 'Mới' : 'Hoạt động'}
      </Badge>
    );
  };

  const filteredStations = stations.filter(station =>
    station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý trạm xe & điểm thuê</h1>
          <p className='text-muted-foreground'>
            Quản lý vị trí trạm xe và điểm thuê xe trên toàn hệ thống
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className='h-4 w-4 mr-2' />
              Thêm trạm mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tạo trạm xe mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin để tạo trạm xe mới trong hệ thống
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên trạm *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="VD: Trạm Quận 1"
                />
                {formErrors.name && (
                  <span className="text-sm text-red-500">{formErrors.name}</span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Địa chỉ *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
                />
                {formErrors.address && (
                  <span className="text-sm text-red-500">{formErrors.address}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Vĩ độ *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    placeholder="10.762622"
                  />
                  {formErrors.latitude && (
                    <span className="text-sm text-red-500">{formErrors.latitude}</span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Kinh độ *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    placeholder="106.660172"
                  />
                  {formErrors.longitude && (
                    <span className="text-sm text-red-500">{formErrors.longitude}</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateStation}>
                Tạo trạm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng số trạm</CardTitle>
            <MapPin className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Trạm mới</CardTitle>
            <Settings className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stations.filter(s => new Date() - new Date(s.created_at) < 7 * 24 * 60 * 60 * 1000).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Khu vực phủ sóng</CardTitle>
            <Settings className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {new Set(stations.map(s => s.address?.split(',').pop()?.trim())).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Độ phủ sóng</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stations.length > 0 ? Math.round((stations.length / 20) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='flex items-center space-x-2'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm trạm xe...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách trạm xe</CardTitle>
          <CardDescription>
            Quản lý thông tin các trạm xe trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên trạm</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Tọa độ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell className='font-medium'>
                    #{station.id}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {station.name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {station.address}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(station)}
                  </TableCell>
                  <TableCell>
                    {station.created_at ? new Date(station.created_at).toLocaleDateString('vi-VN') : '-'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewStation(station.id)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleEditStation(station)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleDeleteStation(station.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredStations.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm ? 'Không tìm thấy trạm xe phù hợp' : 'Chưa có trạm xe nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin trạm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin trạm xe #{selectedStation?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên trạm *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="VD: Trạm Quận 1"
              />
              {formErrors.name && (
                <span className="text-sm text-red-500">{formErrors.name}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Địa chỉ *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
              />
              {formErrors.address && (
                <span className="text-sm text-red-500">{formErrors.address}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-latitude">Vĩ độ *</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  placeholder="10.762622"
                />
                {formErrors.latitude && (
                  <span className="text-sm text-red-500">{formErrors.latitude}</span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-longitude">Kinh độ *</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  placeholder="106.660172"
                />
                {formErrors.longitude && (
                  <span className="text-sm text-red-500">{formErrors.longitude}</span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
              setSelectedStation(null);
            }}>
              Hủy
            </Button>
            <Button onClick={handleUpdateStation}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết trạm xe</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của trạm xe #{selectedStation?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedStation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID</Label>
                  <p className="text-sm mt-1">#{selectedStation.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tên trạm</Label>
                  <p className="text-sm mt-1">{selectedStation.name}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Địa chỉ</Label>
                <p className="text-sm mt-1">{selectedStation.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Vĩ độ</Label>
                  <p className="text-sm mt-1">{selectedStation.latitude}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Kinh độ</Label>
                  <p className="text-sm mt-1">{selectedStation.longitude}</p>
                </div>
              </div>
              {selectedStation.created_at && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ngày tạo</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedStation.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationsManagement;
