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

  // Mock data for complaints
  const mockComplaints = [
    {
      id: 1,
      renter_id: 101,
      message: 'Xe đạp điện bị hỏng phanh trong quá trình sử dụng, rất nguy hiểm',
      status: 'pending',
      created_at: '2024-01-15T14:30:00Z',
      renter_name: 'Nguyễn Văn An',
      rental_id: 201
    },
    {
      id: 2,
      renter_id: 102,
      message: 'Pin xe yếu, không đủ để di chuyển quãng đường đã cam kết',
      status: 'in_progress',
      created_at: '2024-01-15T10:20:00Z',
      renter_name: 'Trần Thị Bình',
      rental_id: 202
    },
    {
      id: 3,
      renter_id: 103,
      message: 'Trạm sạc không hoạt động, không thể trả xe đúng giờ',
      status: 'resolved',
      created_at: '2024-01-14T16:45:00Z',
      renter_name: 'Lê Minh Cường',
      rental_id: null
    },
    {
      id: 4,
      renter_id: 104,
      message: 'Bị tính phí sai, yêu cầu hoàn lại tiền thừa',
      status: 'pending',
      created_at: '2024-01-15T09:15:00Z',
      renter_name: 'Phạm Thu Dung',
      rental_id: 204
    },
    {
      id: 5,
      renter_id: 105,
      message: 'Xe bị trầy xước từ trước, không phải do tôi gây ra',
      status: 'rejected',
      created_at: '2024-01-13T18:30:00Z',
      renter_name: 'Hoàng Văn Em',
      rental_id: 205
    },
    {
      id: 6,
      renter_id: 106,
      message: 'Nhân viên trạm không hỗ trợ khi xe gặp sự cố',
      status: 'in_progress',
      created_at: '2024-01-15T12:00:00Z',
      renter_name: 'Nguyễn Thị Phương',
      rental_id: 206
    }
  ];

  // Mock detailed complaint data
  const mockComplaintDetails = {
    1: {
      id: 1,
      renter_id: 101,
      rental_id: 201,
      message: 'Xe đạp điện bị hỏng phanh trong quá trình sử dụng, rất nguy hiểm. Tôi đã phải dừng xe khẩn cấp và suýt gây tai nạn.',
      status: 'pending',
      resolution: null,
      created_at: '2024-01-15T14:30:00Z',
      updated_at: '2024-01-15T14:30:00Z',
      renter_name: 'Nguyễn Văn An',
      renter_phone: '0901234567',
      vehicle_name: 'Xe đạp điện VinFast Klara'
    },
    2: {
      id: 2,
      renter_id: 102,
      rental_id: 202,
      message: 'Pin xe yếu, không đủ để di chuyển quãng đường đã cam kết. Xe chỉ chạy được 15km thay vì 40km như quảng cáo.',
      status: 'in_progress',
      resolution: 'Đang kiểm tra và thay thế pin xe',
      created_at: '2024-01-15T10:20:00Z',
      updated_at: '2024-01-15T15:45:00Z',
      renter_name: 'Trần Thị Bình',
      renter_phone: '0902345678',
      vehicle_name: 'Xe đạp điện Yadea'
    },
    3: {
      id: 3,
      renter_id: 103,
      rental_id: null,
      message: 'Trạm sạc không hoạt động, không thể trả xe đúng giờ. Đã liên hệ nhiều lần nhưng không có hỗ trợ kịp thời.',
      status: 'resolved',
      resolution: 'Đã sửa chữa trạm sạc và miễn phí thêm giờ cho khách hàng. Xin lỗi vì sự bất tiện.',
      created_at: '2024-01-14T16:45:00Z',
      updated_at: '2024-01-15T08:30:00Z',
      renter_name: 'Lê Minh Cường',
      renter_phone: '0903456789',
      vehicle_name: null
    },
    4: {
      id: 4,
      renter_id: 104,
      rental_id: 204,
      message: 'Bị tính phí sai, yêu cầu hoàn lại tiền thừa. Thực tế chỉ thuê 2 tiếng nhưng bị tính 3 tiếng.',
      status: 'pending',
      resolution: null,
      created_at: '2024-01-15T09:15:00Z',
      updated_at: '2024-01-15T09:15:00Z',
      renter_name: 'Phạm Thu Dung',
      renter_phone: '0904567890',
      vehicle_name: 'Xe đạp điện Giant'
    },
    5: {
      id: 5,
      renter_id: 105,
      rental_id: 205,
      message: 'Xe bị trầy xước từ trước, không phải do tôi gây ra. Yêu cầu không tính phí sửa chữa.',
      status: 'rejected',
      resolution: 'Sau khi kiểm tra camera an ninh, xác định xe bị trầy xước trong quá trình sử dụng. Phí sửa chữa là hợp lý.',
      created_at: '2024-01-13T18:30:00Z',
      updated_at: '2024-01-14T14:20:00Z',
      renter_name: 'Hoàng Văn Em',
      renter_phone: '0905678901',
      vehicle_name: 'Xe máy điện VinFast Impes'
    },
    6: {
      id: 6,
      renter_id: 106,
      rental_id: 206,
      message: 'Nhân viên trạm không hỗ trợ khi xe gặp sự cố. Thái độ không chuyên nghiệp và thiếu trách nhiệm.',
      status: 'in_progress',
      resolution: 'Đang trao đổi với nhân viên và sẽ có biện pháp xử lý phù hợp',
      created_at: '2024-01-15T12:00:00Z',
      updated_at: '2024-01-15T16:30:00Z',
      renter_name: 'Nguyễn Thị Phương',
      renter_phone: '0906789012',
      vehicle_name: 'Xe đạp điện Pega'
    }
  };

  // Fetch functions (using mock data)
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/complaints');
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      setComplaints(mockComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintDetail = async (complaintId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/complaints/${complaintId}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setComplaintDetail(mockComplaintDetails[complaintId] || null);
    } catch (error) {
      console.error('Error fetching complaint detail:', error);
      toast.error('Không thể tải chi tiết khiếu nại');
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint || !resolutionData.status) {
      toast.error('Vui lòng chọn trạng thái xử lý');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/complaints/${selectedComplaint.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     status: resolutionData.status,
      //     resolution: resolutionData.resolution
      //   })
      // });

      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setComplaints(prev => prev.map(complaint => 
        complaint.id === selectedComplaint.id 
          ? { 
              ...complaint, 
              status: resolutionData.status,
              updated_at: new Date().toISOString()
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

  const handleViewComplaint = async (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailDialog(true);
    await fetchComplaintDetail(complaint.id);
  };

  const handleResolveComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setResolutionData({ status: complaint.status, resolution: '' });
    setShowResolveDialog(true);
  };

  // Helper functions
  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { label: 'Chờ xử lý', variant: 'destructive', icon: Clock },
      'in_progress': { label: 'Đang xử lý', variant: 'default', icon: AlertTriangle },
      'resolved': { label: 'Đã giải quyết', variant: 'secondary', icon: CheckCircle },
      'rejected': { label: 'Từ chối', variant: 'outline', icon: X }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary', icon: Clock };
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
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesRenter = !renterFilter || complaint.renter_id.toString().includes(renterFilter);
    
    return matchesSearch && matchesStatus && matchesRenter;
  });

  // Calculate statistics
  const complaintStats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
    todayComplaints: complaints.filter(c => 
      new Date(c.created_at).toDateString() === new Date().toDateString()).length
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Re-fetch data when filters change
  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, renterFilter]);

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
          <SelectContent>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            <SelectItem value='pending'>Chờ xử lý</SelectItem>
            <SelectItem value='in_progress'>Đang xử lý</SelectItem>
            <SelectItem value='resolved'>Đã giải quyết</SelectItem>
            <SelectItem value='rejected'>Từ chối</SelectItem>
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
                        ID: {complaint.renter_id}
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
                      {(complaint.status === 'pending' || complaint.status === 'in_progress') && (
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
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Xe liên quan</Label>
                  <p className='text-lg'>{complaintDetail.vehicle_name}</p>
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
            {selectedComplaint && (selectedComplaint.status === 'pending' || selectedComplaint.status === 'in_progress') && (
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
                  <SelectContent>
                    <SelectItem value='in_progress'>Đang xử lý</SelectItem>
                    <SelectItem value='resolved'>Đã giải quyết</SelectItem>
                    <SelectItem value='rejected'>Từ chối</SelectItem>
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
