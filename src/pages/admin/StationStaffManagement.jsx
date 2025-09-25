import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCheck, MapPin, Clock, AlertCircle, Plus, Search, Filter, Edit, Trash2, Eye, Users } from 'lucide-react';
import { apiClient } from '@/lib/api/apiClient';
import { useToast } from '@/hooks/use-toast';

const StationStaffManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [stationsList, setStationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    staff_id: '',
    station_id: ''
  });
  const [statistics, setStatistics] = useState({
    total_staff: 0,
    active_assignments: 0,
    stations_with_staff: 0,
    needs_support: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchStaffList();
    fetchStationsList();
    fetchStatistics();
  }, []);

  // Mock data for testing
  const mockAssignments = [
    {
      id: 1,
      staff_id: 1,
      staff_name: 'Nguyễn Văn An',
      station_id: 1,
      station_name: 'Trạm Quận 1',
      status: 'active',
      assigned_at: '2024-01-15T09:00:00Z'
    },
    {
      id: 2,
      staff_id: 2,
      staff_name: 'Trần Thị Bình',
      station_id: 1,
      station_name: 'Trạm Quận 1',
      status: 'active',
      assigned_at: '2024-01-20T10:15:00Z'
    },
    {
      id: 3,
      staff_id: 3,
      staff_name: 'Lê Minh Cường',
      station_id: 2,
      station_name: 'Trạm Quận 3',
      status: 'active',
      assigned_at: '2024-02-01T08:30:00Z'
    },
    {
      id: 4,
      staff_id: 4,
      staff_name: 'Phạm Thị Dung',
      station_id: 3,
      station_name: 'Trạm Quận 7',
      status: 'inactive',
      assigned_at: '2024-02-10T13:45:00Z'
    },
    {
      id: 5,
      staff_id: 5,
      staff_name: 'Hoàng Văn Em',
      station_id: 4,
      station_name: 'Trạm Thủ Đức',
      status: 'active',
      assigned_at: '2024-02-15T15:20:00Z'
    },
    {
      id: 6,
      staff_id: 6,
      staff_name: 'Vũ Thị Hoa',
      station_id: 5,
      station_name: 'Trạm Bình Thạnh',
      status: 'active',
      assigned_at: '2024-03-01T09:15:00Z'
    }
  ];

  const mockStaff = [
    { id: 1, name: 'Nguyễn Văn An', phone: '0901234567' },
    { id: 2, name: 'Trần Thị Bình', phone: '0912345678' },
    { id: 3, name: 'Lê Minh Cường', phone: '0923456789' },
    { id: 4, name: 'Phạm Thị Dung', phone: '0934567890' },
    { id: 5, name: 'Hoàng Văn Em', phone: '0945678901' },
    { id: 6, name: 'Vũ Thị Hoa', phone: '0956789012' },
    { id: 7, name: 'Đặng Văn Giang', phone: '0967890123' },
    { id: 8, name: 'Bùi Thị Huyền', phone: '0978901234' }
  ];

  const mockStations = [
    { id: 1, name: 'Trạm Quận 1', address: '123 Nguyễn Huệ, Q1' },
    { id: 2, name: 'Trạm Quận 3', address: '456 Võ Văn Tần, Q3' },
    { id: 3, name: 'Trạm Quận 7', address: '789 Nguyễn Thị Thập, Q7' },
    { id: 4, name: 'Trạm Thủ Đức', address: '321 Võ Văn Ngân, Thủ Đức' },
    { id: 5, name: 'Trạm Bình Thạnh', address: '654 Xô Viết Nghệ Tĩnh, Bình Thạnh' }
  ];
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // TODO: Uncomment when API is ready
      // const response = await apiClient.get('/admin/staff-stations');
      // setAssignments(response.assignments || []);
      
      // Mock implementation
      setTimeout(() => {
        let filteredAssignments = [...mockAssignments];
        if (statusFilter && statusFilter !== 'all') {
          filteredAssignments = filteredAssignments.filter(a => a.status === statusFilter);
        }
        if (searchTerm) {
          filteredAssignments = filteredAssignments.filter(a => 
            a.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.station_name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setAssignments(filteredAssignments);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phân công',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      // TODO: Uncomment when API is ready
      // const response = await apiClient.get('/admin/users?role=staff');
      // setStaffList(response.users || []);
      
      // Mock implementation
      setStaffList(mockStaff);
    } catch (error) {
      console.error('Error fetching staff list:', error);
    }
  };

  const fetchStationsList = async () => {
    try {
      // TODO: Uncomment when API is ready
      // const response = await apiClient.get('/admin/stations');
      // setStationsList(response.stations || []);
      
      // Mock implementation
      setStationsList(mockStations);
    } catch (error) {
      console.error('Error fetching stations list:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      // Mock implementation
      const activeAssignments = mockAssignments.filter(a => a.status === 'active');
      const uniqueStations = new Set(activeAssignments.map(a => a.station_id));
      
      setStatistics({
        total_staff: mockStaff.length,
        active_assignments: activeAssignments.length,
        stations_with_staff: uniqueStations.size,
        needs_support: Math.max(0, mockStations.length - uniqueStations.size)
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleAssignStaff = async () => {
    try {
      // TODO: Uncomment when API is ready
      // const response = await apiClient.post('/admin/staff-stations', formData);
      // toast({
      //   title: 'Thành công',
      //   description: 'Đã phân công nhân viên thành công'
      // });
      
      // Mock implementation
      const staff = mockStaff.find(s => s.id == formData.staff_id);
      const station = mockStations.find(s => s.id == formData.station_id);
      
      const newAssignment = {
        id: Date.now(),
        staff_id: parseInt(formData.staff_id),
        staff_name: staff?.name || '',
        station_id: parseInt(formData.station_id),
        station_name: station?.name || '',
        status: 'active',
        assigned_at: new Date().toISOString()
      };
      
      setAssignments(prev => [...prev, newAssignment]);
      toast({
        title: 'Thành công',
        description: 'Đã phân công nhân viên thành công'
      });
      
      setShowAssignDialog(false);
      resetForm();
      fetchStatistics();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể phân công nhân viên',
        variant: 'destructive'
      });
    }
  };

  const handleDeactivateAssignment = async (assignmentId) => {
    if (!confirm('Bạn có chắc chắn muốn kết thúc phân công này?')) {
      return;
    }

    try {
      // TODO: Uncomment when API is ready
      // await apiClient.put(`/admin/staff-stations/${assignmentId}/deactivate`);
      
      // Mock implementation
      setAssignments(prev => 
        prev.map(a => 
          a.id === assignmentId 
            ? { ...a, status: 'inactive', updated_at: new Date().toISOString() }
            : a
        )
      );
      
      toast({
        title: 'Thành công',
        description: 'Đã kết thúc phân công thành công'
      });
      fetchStatistics();
    } catch (error) {
      console.error('Error deactivating assignment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kết thúc phân công',
        variant: 'destructive'
      });
    }
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowViewDialog(true);
  };

  const resetForm = () => {
    setFormData({
      staff_id: '',
      station_id: ''
    });
  };

  const openAssignDialog = () => {
    resetForm();
    setShowAssignDialog(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { label: 'Hoạt động', variant: 'default' },
      'inactive': { label: 'Kết thúc', variant: 'secondary' }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getStationStaffCount = (stationId) => {
    return assignments.filter(a => a.station_id === stationId && a.status === 'active').length;
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.station_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Re-fetch data when filters change
  useEffect(() => {
    fetchAssignments();
  }, [statusFilter, searchTerm]);
  // Re-fetch data when filters change
  useEffect(() => {
    fetchAssignments();
  }, [statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý nhân viên trạm</h1>
          <p className="text-muted-foreground">
            Phân công và giám sát nhân viên tại các trạm xe
          </p>
        </div>
        <Button onClick={openAssignDialog}>
          <UserCheck className="h-4 w-4 mr-2" />
          Phân công nhân viên
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_staff}</div>
            <p className="text-xs text-muted-foreground">
              Nhân viên có thể phân công
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang phân công</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.active_assignments}</div>
            <p className="text-xs text-muted-foreground">
              Phân công hiện tại
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạm có nhân viên</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.stations_with_staff}</div>
            <p className="text-xs text-muted-foreground">
              Trên {mockStations.length} trạm hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cần hỗ trợ</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.needs_support}</div>
            <p className="text-xs text-muted-foreground">
              Trạm chưa có nhân viên
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm phân công...'
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
            <SelectItem value='active'>Đang hoạt động</SelectItem>
            <SelectItem value='inactive'>Đã kết thúc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phân công theo trạm</CardTitle>
            <CardDescription>
              Tình trạng nhân viên tại các trạm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockStations.map((station) => {
                const staffCount = getStationStaffCount(station.id);
                const status = staffCount >= 2 ? 'normal' : 'warning';
                
                return (
                  <div key={station.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{station.name}</span>
                        <p className="text-xs text-muted-foreground">{station.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{staffCount} nhân viên</span>
                      <Badge variant={status === 'warning' ? 'destructive' : 'default'}>
                        {status === 'warning' ? 'Cần thêm' : 'Đủ'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo trạng thái</CardTitle>
            <CardDescription>
              Phân bố phân công nhân viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Đang hoạt động</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {assignments.filter(a => a.status === 'active').length} phân công
                  </span>
                  <Badge variant='default'>Hoạt động</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Đã kết thúc</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {assignments.filter(a => a.status === 'inactive').length} phân công
                  </span>
                  <Badge variant='secondary'>Kết thúc</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Nhân viên rảnh</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {mockStaff.length - assignments.filter(a => a.status === 'active').length} người
                  </span>
                  <Badge variant='outline'>Sẵn sàng</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách phân công</CardTitle>
          <CardDescription>
            Quản lý phân công nhân viên tại các trạm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Trạm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày phân công</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className='font-medium'>
                    {assignment.staff_name}
                  </TableCell>
                  <TableCell>{assignment.station_name}</TableCell>
                  <TableCell>
                    {getStatusBadge(assignment.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assigned_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewAssignment(assignment)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      {assignment.status === 'active' && (
                        <Button 
                          variant='ghost' 
                          size='sm'
                          onClick={() => handleDeactivateAssignment(assignment.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAssignments.length === 0 && !loading && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm || (statusFilter && statusFilter !== 'all') ? 'Không tìm thấy phân công phù hợp' : 'Chưa có phân công nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Staff Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Phân công nhân viên</DialogTitle>
            <DialogDescription>
              Gán nhân viên vào trạm làm việc
            </DialogDescription>
          </DialogHeader>
          
          <div className='grid gap-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='staff_id'>Chọn nhân viên</Label>
              <Select value={formData.staff_id} onValueChange={(value) => setFormData({...formData, staff_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn nhân viên' />
                </SelectTrigger>
                <SelectContent>
                  {staffList
                    .filter(staff => !assignments.some(a => a.staff_id === staff.id && a.status === 'active'))
                    .map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.name} - {staff.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='station_id'>Chọn trạm</Label>
              <Select value={formData.station_id} onValueChange={(value) => setFormData({...formData, station_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn trạm' />
                </SelectTrigger>
                <SelectContent>
                  {stationsList.map((station) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.name} - {station.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowAssignDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleAssignStaff}>
              Phân công
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignment Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết phân công</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về phân công nhân viên
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Nhân viên</Label>
                  <p className='text-lg font-semibold'>{selectedAssignment.staff_name}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạm</Label>
                  <p className='text-lg'>{selectedAssignment.station_name}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạng thái</Label>
                  <div className='mt-1'>
                    {getStatusBadge(selectedAssignment.status)}
                  </div>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>ID Phân công</Label>
                  <p className='text-lg'>{selectedAssignment.id}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Ngày phân công</Label>
                  <p className='text-lg'>{new Date(selectedAssignment.assigned_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                {selectedAssignment.updated_at && (
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Cập nhật lần cuối</Label>
                    <p className='text-lg'>{new Date(selectedAssignment.updated_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                )}
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

export default StationStaffManagement;