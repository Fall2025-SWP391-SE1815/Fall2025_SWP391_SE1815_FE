import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  MessageSquare, Edit, Search, Eye, Clock, CheckCircle, AlertTriangle, 
  X, Filter, RefreshCw, Users, Calendar, FileText
} from 'lucide-react';
import complaintsService from '@/services/complaints/complaintsService';

const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [renterFilter, setRenterFilter] = useState('');
  
  // Dialog states
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintDetail, setComplaintDetail] = useState(null);
  const [resolutionData, setResolutionData] = useState({ status: '', resolution: '' });



  // Fetch functions
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter.toUpperCase();
      }
      
      const response = await complaintsService.getAll(params);
      
      // Map API response to component data structure - lưu đầy đủ thông tin cho popup
      const mappedComplaints = response.map(complaint => ({
        id: complaint.id,
        renter_id: complaint.renter?.id,
        renter_name: complaint.renter?.fullName,
        renter_phone: complaint.renter?.phone,
        renter_email: complaint.renter?.email,
        message: complaint.description,
        status: complaint.status?.toLowerCase(),
        created_at: complaint.createdAt,
        updated_at: complaint.resolvedAt || complaint.createdAt,
        rental_id: complaint.rental?.id,
        resolution: complaint.resolution,
        vehicle_name: complaint.rental?.vehicle ? 
          `${complaint.rental.vehicle.brand} ${complaint.rental.vehicle.model}` : null,
        vehicle_license: complaint.rental?.vehicle?.licensePlate,
        station_name: complaint.rental?.stationPickup?.name,
        station_address: complaint.rental?.stationPickup?.address,
        staff_name: complaint.staff?.fullName,
        staff_phone: complaint.staff?.phone,
        admin_name: complaint.admin?.fullName,
        start_time: complaint.rental?.startTime,
        end_time: complaint.rental?.endTime,
        total_cost: complaint.rental?.totalCost,
        rental_status: complaint.rental?.status
      }));
      
      setComplaints(mappedComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng dữ liệu từ danh sách
  const prepareComplaintDetail = (complaint) => {
    // Dữ liệu đã có đầy đủ từ danh sách
    setComplaintDetail(complaint);
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint || !resolutionData.status) {
      toast.error('Vui lòng chọn trạng thái xử lý');
      return;
    }

    try {
      const requestData = {
        complaintId: selectedComplaint.id,
        status: resolutionData.status,
        resolution: resolutionData.resolution
      };

      const response = await complaintsService.resolve(requestData);
      
      // Update local state with response data
      setComplaints(prev => prev.map(complaint => 
        complaint.id === selectedComplaint.id 
          ? { 
              ...complaint, 
              status: response.status?.toLowerCase(),
              resolution: response.resolution,
              updated_at: response.resolvedAt || new Date().toISOString()
            }
          : complaint
      ));

      toast.success('Cập nhật trạng thái khiếu nại thành công');
      setShowResolveDialog(false);
      setSelectedComplaint(null);
      setResolutionData({ status: '', resolution: '' });
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast.error('Không thể cập nhật trạng thái khiếu nại');
    }
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    prepareComplaintDetail(complaint);
    setShowDetailDialog(true);
  };

  const handleResolveComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setResolutionData({ status: complaint.status, resolution: '' });
    setShowResolveDialog(true);
  };

  // Helper functions
  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase();
    const statusMap = {
      'pending': { label: 'Chờ xử lý', variant: 'destructive', icon: Clock },
      'resolved': { label: 'Đã giải quyết', variant: 'secondary', icon: CheckCircle },
      'rejected': { label: 'Từ chối', variant: 'outline', icon: X }
    };
    
    const statusInfo = statusMap[normalizedStatus] || { label: status, variant: 'secondary', icon: Clock };
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className='flex items-center gap-1'>
        <Icon className='h-3 w-3' />
        {statusInfo.label}
      </Badge>
    );
  };

  // Filter functions
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.renter_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status?.toLowerCase() === statusFilter;
    const matchesRenter = !renterFilter || complaint.renter_id?.toString().includes(renterFilter);
    
    return matchesSearch && matchesStatus && matchesRenter;
  });

  // Calculate statistics
  const complaintStats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status?.toLowerCase() === 'pending').length,
    resolved: complaints.filter(c => c.status?.toLowerCase() === 'resolved').length,
    rejected: complaints.filter(c => c.status?.toLowerCase() === 'rejected').length,
    todayComplaints: complaints.filter(c => 
      new Date(c.created_at).toDateString() === new Date().toDateString()).length
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Re-fetch data when status filter changes
  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  if (loading && complaints.length === 0) {
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
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý khiếu nại</h1>
          <p className='text-muted-foreground'>
            Xử lý và theo dõi khiếu nại từ khách hàng
          </p>
        </div>
        <Button variant="outline" onClick={fetchComplaints}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng khiếu nại</CardTitle>
            <MessageSquare className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{complaintStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {complaintStats.todayComplaints} hôm nay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Chờ xử lý</CardTitle>
            <Clock className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{complaintStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Cần xử lý ngay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đang xử lý</CardTitle>
            <AlertTriangle className='h-4 w-4 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{complaintStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Đang được xem xét
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đã hoàn thành</CardTitle>
            <CheckCircle className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{complaintStats.resolved + complaintStats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              {complaintStats.resolved} giải quyết, {complaintStats.rejected} từ chối
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm khiếu nại...'
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
          <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
            <SelectItem value='all' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Tất cả trạng thái</SelectItem>
            <SelectItem value='pending' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Chờ xử lý</SelectItem>
            <SelectItem value='resolved' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã giải quyết</SelectItem>
            <SelectItem value='rejected' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Từ chối</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder='Lọc theo ID khách hàng...'
          value={renterFilter}
          onChange={(e) => setRenterFilter(e.target.value)}
          className='w-48'
        />
      </div>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khiếu nại</CardTitle>
          <CardDescription>
            Quản lý và xử lý khiếu nại từ khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Nội dung khiếu nại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{complaint.renter_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {complaint.renter_phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='max-w-md'>
                    <div className="truncate font-medium">
                      {complaint.message.length > 80 
                        ? complaint.message.substring(0, 80) + '...' 
                        : complaint.message}
                    </div>
                    {complaint.rental_id && (
                      <div className="text-sm text-muted-foreground">
                        Liên quan đến lượt thuê #{complaint.rental_id}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(complaint.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(complaint.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewComplaint(complaint)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      {complaint.status?.toLowerCase() === 'pending' && (
                        <Button 
                          variant='ghost' 
                          size='sm'
                          onClick={() => handleResolveComplaint(complaint)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredComplaints.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm || statusFilter !== 'all' || renterFilter ? 
                'Không tìm thấy khiếu nại phù hợp' : 'Chưa có khiếu nại nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaint Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết khiếu nại</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về khiếu nại từ khách hàng
            </DialogDescription>
          </DialogHeader>
          
          {complaintDetail && (
            <div className='space-y-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Khách hàng</Label>
                  <p className='text-lg font-semibold'>{complaintDetail.renter_name}</p>
                  <p className='text-sm text-muted-foreground'>{complaintDetail.renter_phone}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạng thái</Label>
                  <div className='mt-1'>
                    {getStatusBadge(complaintDetail.status)}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>ID Khiếu nại</Label>
                  <p className='text-lg'>{complaintDetail.id}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Lượt thuê liên quan</Label>
                  <p className='text-lg'>
                    {complaintDetail.rental_id ? `#${complaintDetail.rental_id}` : 'Không có'}
                  </p>
                </div>
              </div>

              {complaintDetail.vehicle_name && (
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Xe liên quan</Label>
                    <p className='text-lg'>{complaintDetail.vehicle_name}</p>
                    {complaintDetail.vehicle_license && (
                      <p className='text-sm text-muted-foreground'>
                        Biển số: {complaintDetail.vehicle_license}
                      </p>
                    )}
                  </div>
                  {complaintDetail.rental_status && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Trạng thái thuê</Label>
                      <p className='text-lg capitalize'>{complaintDetail.rental_status}</p>
                    </div>
                  )}
                </div>
              )}

              {complaintDetail.station_name && (
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạm liên quan</Label>
                  <p className='text-lg'>{complaintDetail.station_name}</p>
                  {complaintDetail.station_address && (
                    <p className='text-sm text-muted-foreground'>{complaintDetail.station_address}</p>
                  )}
                </div>
              )}

              {(complaintDetail.start_time || complaintDetail.end_time || complaintDetail.total_cost) && (
                <div className='grid grid-cols-2 gap-4'>
                  {complaintDetail.start_time && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Thời gian bắt đầu</Label>
                      <p className='text-lg'>{new Date(complaintDetail.start_time).toLocaleString('vi-VN')}</p>
                    </div>
                  )}
                  {complaintDetail.end_time && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Thời gian kết thúc</Label>
                      <p className='text-lg'>{new Date(complaintDetail.end_time).toLocaleString('vi-VN')}</p>
                    </div>
                  )}
                  {complaintDetail.total_cost && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Tổng chi phí</Label>
                      <p className='text-lg font-semibold text-green-600'>
                        {complaintDetail.total_cost.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(complaintDetail.staff_name || complaintDetail.admin_name) && (
                <div className='grid grid-cols-2 gap-4'>
                  {complaintDetail.staff_name && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Nhân viên liên quan</Label>
                      <p className='text-lg'>{complaintDetail.staff_name}</p>
                      {complaintDetail.staff_phone && (
                        <p className='text-sm text-muted-foreground'>{complaintDetail.staff_phone}</p>
                      )}
                    </div>
                  )}
                  {complaintDetail.admin_name && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>Người xử lý</Label>
                      <p className='text-lg'>{complaintDetail.admin_name}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Nội dung khiếu nại</Label>
                <div className='mt-2 p-4 bg-muted rounded-lg'>
                  <p className='text-sm'>{complaintDetail.message}</p>
                </div>
              </div>

              {complaintDetail.resolution && (
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Phản hồi xử lý</Label>
                  <div className='mt-2 p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <p className='text-sm text-green-800'>{complaintDetail.resolution}</p>
                  </div>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Ngày tạo</Label>
                  <p className='text-lg'>{new Date(complaintDetail.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Cập nhật lần cuối</Label>
                  <p className='text-lg'>{new Date(complaintDetail.updated_at).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
            {selectedComplaint && selectedComplaint.status?.toLowerCase() === 'pending' && (
              <Button onClick={() => {
                setShowDetailDialog(false);
                handleResolveComplaint(selectedComplaint);
              }}>
                Xử lý khiếu nại
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Complaint Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Xử lý khiếu nại</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái và phản hồi cho khiếu nại
            </DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className='space-y-4 py-4'>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Khách hàng</Label>
                <p className='text-lg font-semibold'>{selectedComplaint.renter_name}</p>
              </div>

              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Nội dung khiếu nại</Label>
                <div className='mt-2 p-3 bg-muted rounded-lg'>
                  <p className='text-sm'>{selectedComplaint.message}</p>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>Trạng thái xử lý</Label>
                <Select 
                  value={resolutionData.status} 
                  onValueChange={(value) => setResolutionData({...resolutionData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn trạng thái' />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                    <SelectItem value='resolved' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã giải quyết</SelectItem>
                    <SelectItem value='rejected' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='resolution'>Phản hồi xử lý</Label>
                <Textarea
                  id='resolution'
                  placeholder='Nhập phản hồi chi tiết về cách xử lý khiếu nại...'
                  value={resolutionData.resolution}
                  onChange={(e) => setResolutionData({...resolutionData, resolution: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowResolveDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateComplaint}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsManagement;
