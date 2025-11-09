import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  Eye, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  Phone, 
  Mail, 
  Search,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Car,
  Filter
} from 'lucide-react';
import adminService from '@/services/admin/adminService';

const IncidentsTab = () => {
  // State for data
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch incidents data
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await adminService.getIncidents(params);
      setIncidents(data || []);
      if (data && data.length > 0) {
        toast.success(`Đã tải ${data.length} báo cáo sự cố thành công`);
      } else {
        toast.info('Không có báo cáo sự cố nào trong hệ thống');
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Không thể tải dữ liệu báo cáo sự cố');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Re-fetch data when filters change
  useEffect(() => {
    fetchIncidents();
  }, [statusFilter]);

  const getIncidentStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'outline', label: 'Chờ xử lý', icon: Clock },
      in_review: { variant: 'default', label: 'Đang xử lý', icon: RefreshCw },
      resolved: { variant: 'secondary', label: 'Đã giải quyết', icon: CheckCircle }
    };

    const config = statusConfig[status] || { variant: 'destructive', label: status, icon: XCircle };
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleViewDetail = (incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setAdminNotes(incident.resolutionNotes || '');
    setShowDetailDialog(true);
    toast.info(`Đang xem chi tiết sự cố #${incident.id}`);
  };

  const handleProcessIncident = () => {
    setShowDetailDialog(false);
    setShowProcessDialog(true);
    toast.info('Đang mở form xử lý sự cố');
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident || !newStatus) {
      toast.error('Vui lòng chọn trạng thái mới');
      return;
    }

    setProcessing(true);
    try {
      await adminService.updateIncident({
        incidentId: selectedIncident.id,
        status: newStatus,
        resolutionNotes: adminNotes.trim() || undefined
      });
      
      toast.success('Cập nhật trạng thái báo cáo sự cố thành công');
      setShowProcessDialog(false);
      setAdminNotes('');
      setNewStatus('');
      setSelectedIncident(null);
      fetchIncidents(); // Refresh data
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Không thể cập nhật trạng thái báo cáo sự cố');
    } finally {
      setProcessing(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.rental?.renter?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.rental?.stationPickup?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Toast when filters are applied and show results
  useEffect(() => {
    if (incidents.length > 0 && (searchTerm || statusFilter !== 'all')) {
      if (filteredIncidents.length === 0) {
        toast.info('Không tìm thấy sự cố nào phù hợp với bộ lọc');
      } else {
        toast.success(`Tìm thấy ${filteredIncidents.length} sự cố phù hợp`);
      }
    }
  }, [searchTerm, statusFilter, incidents.length, filteredIncidents.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm sự cố, người thuê hoặc xe...'
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
          <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
            <SelectItem value='all' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Tất cả trạng thái</SelectItem>
            <SelectItem value='PENDING' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Chờ xử lý</SelectItem>
            <SelectItem value='IN_REVIEW' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đang xử lý</SelectItem>
            <SelectItem value='RESOLVED' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã giải quyết</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Báo cáo sự cố</CardTitle>
          <CardDescription>
            Quản lý và xử lý các báo cáo sự cố từ khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mô tả sự cố</TableHead>
                <TableHead>Người báo cáo</TableHead>
                <TableHead>Xe</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className='font-medium max-w-xs'>
                    <div className="truncate" title={incident.description}>
                      {incident.description || 'Không có mô tả'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {incident.rental?.renter?.fullName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {incident.vehicle?.licensePlate} - {incident.vehicle?.brand} {incident.vehicle?.model}
                  </TableCell>
                  <TableCell>
                    {getIncidentStatusBadge(incident.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(incident.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleViewDetail(incident)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredIncidents.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm || (statusFilter && statusFilter !== 'all') ? 'Không tìm thấy báo cáo sự cố phù hợp' : 'Chưa có báo cáo sự cố nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incident Details Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết sự cố</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về báo cáo sự cố
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className='grid gap-6 py-4 max-h-[70vh] overflow-y-auto'>
              {/* Basic Information */}
              <div className='bg-red-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-red-900 mb-3'>Thông tin sự cố</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-red-700'>ID Sự cố</Label>
                    <p className='text-sm'>#{selectedIncident.id}</p>
                  </div>
                  <div>
                    <Label className='text-red-700'>Trạng thái</Label>
                    <div className='mt-1'>
                      {getIncidentStatusBadge(selectedIncident.status)}
                    </div>
                  </div>
                </div>
                <div className='mt-3'>
                  <Label className='text-red-700'>Mô tả sự cố</Label>
                  <p className='text-sm mt-1'>{selectedIncident.description || 'Không có mô tả'}</p>
                </div>
                <div className='mt-3'>
                  <Label className='text-red-700'>Thời gian báo cáo</Label>
                  <p className='text-sm'>{new Date(selectedIncident.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div className='bg-blue-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-blue-900 mb-3'>Thông tin khách hàng</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-blue-700'>Tên khách hàng</Label>
                    <p className='text-sm'>{selectedIncident.rental?.renter?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className='text-blue-700'>Số điện thoại</Label>
                    <p className='text-sm'>{selectedIncident.rental?.renter?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className='text-blue-700'>Email</Label>
                    <p className='text-sm'>{selectedIncident.rental?.renter?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className='bg-green-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-green-900 mb-3'>Thông tin xe</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-green-700'>Biển số xe</Label>
                    <p className='text-sm'>{selectedIncident.vehicle?.licensePlate || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className='text-green-700'>Loại xe</Label>
                    <p className='text-sm'>{selectedIncident.vehicle?.brand} {selectedIncident.vehicle?.model}</p>
                  </div>
                  <div>
                    <Label className='text-green-700'>Trạm lấy xe</Label>
                    <p className='text-sm'>{selectedIncident.rental?.stationPickup?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className='text-green-700'>Trạm trả xe</Label>
                    <p className='text-sm'>{selectedIncident.rental?.stationReturn?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Resolution Notes */}
              {selectedIncident.resolutionNotes && (
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-900 mb-3'>Ghi chú xử lý</h3>
                  <p className='text-sm'>{selectedIncident.resolutionNotes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
            {selectedIncident?.status !== 'RESOLVED' && (
              <Button onClick={handleProcessIncident}>
                Xử lý sự cố
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Incident Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xử lý sự cố</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái và ghi chú xử lý cho sự cố
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='status'>Trạng thái mới</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PENDING'>Chờ xử lý</SelectItem>
                  <SelectItem value='IN_REVIEW'>Đang xử lý</SelectItem>
                  <SelectItem value='RESOLVED'>Đã giải quyết</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='notes'>Ghi chú xử lý</Label>
              <Textarea
                id='notes'
                placeholder='Nhập ghi chú về cách xử lý sự cố...'
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowProcessDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateIncident} disabled={processing}>
              {processing ? 'Đang xử lý...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentsTab;