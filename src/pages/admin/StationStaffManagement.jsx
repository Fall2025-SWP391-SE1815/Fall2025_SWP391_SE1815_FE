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
import staffStationService from '@/services/staffStations/staffStationService.js';
import stationService from '@/services/stations/stationService.js';
import { apiGet } from '@/lib/api/apiClient.js';
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

  // real data will be fetched via services
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await staffStationService.admin.getAssignments(params);
      const list = res?.assignments || res?.data || res || [];
      setAssignments(list);
      setLoading(false);
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
      const res = await apiGet('/api/admin/users?role=staff');
      const list = res?.users || res || [];
      setStaffList(list);
    } catch (error) {
      console.error('Error fetching staff list:', error);
    }
  };

  const fetchStationsList = async () => {
    try {
      const res = await stationService.admin.getStations();
      const list = res?.stations || res || [];
      setStationsList(list);
    } catch (error) {
      console.error('Error fetching stations list:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      // derive statistics from current lists if available
      const total_staff = staffList.length;
      const active_assignments = assignments.filter(a => a.status === 'active').length;
      const uniqueStations = new Set(assignments.filter(a => a.status === 'active').map(a => a.station_id));
      const stations_with_staff = uniqueStations.size;
      const needs_support = Math.max(0, stationsList.length - stations_with_staff);

      setStatistics({
        total_staff,
        active_assignments,
        stations_with_staff,
        needs_support
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleAssignStaff = async () => {
    try {
      const payload = {
        staff_id: parseInt(formData.staff_id),
        station_id: parseInt(formData.station_id)
      };
      await staffStationService.admin.createAssignment(payload);
      toast({ title: 'Thành công', description: 'Đã phân công nhân viên thành công' });
      setShowAssignDialog(false);
      resetForm();
      await fetchAssignments();
      await fetchStatistics();
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
      await staffStationService.admin.deactivateAssignment(assignmentId);
      toast({ title: 'Thành công', description: 'Đã kết thúc phân công thành công' });
      await fetchAssignments();
      await fetchStatistics();
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
              Trên {stationsList.length} trạm hoạt động
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
              {stationsList.map((station) => {
                const stationId = station.id ?? station.station_id ?? station._id;
                const staffCount = getStationStaffCount(stationId);
                const status = staffCount >= 2 ? 'normal' : 'warning';

                return (
                  <div key={stationId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{station.name || station.station_name}</span>
                        <p className="text-xs text-muted-foreground">{station.address || station.location || station.addr}</p>
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
                {staffList.length - assignments.filter(a => a.status === 'active').length} người
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