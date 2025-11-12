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
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

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
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tải danh sách sự cố thất bại
          </div>
        ),
        description: 'Không thể tải dữ liệu báo cáo sự cố. Vui lòng thử lại',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
      });
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
    const normalizedStatus = status?.toLowerCase();
    const statusConfig = {
      'pending': { variant: 'destructive', label: 'Chờ xử lý', icon: Clock },
      'in_review': { variant: 'default', label: 'Đang xử lý', icon: RefreshCw },
      'resolved': { variant: 'secondary', label: 'Đã giải quyết', icon: CheckCircle }
    };

    const config = statusConfig[normalizedStatus] || { variant: 'outline', label: status, icon: XCircle };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className='flex items-center gap-1'>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleViewDetail = (incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setAdminNotes(incident.resolutionNotes || '');
    setShowDetailDialog(true);
    toast({
      title: (
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Đang xem chi tiết sự cố
        </div>
      ),
      description: `Sự cố #${incident.id}`,
      className: 'border-l-blue-500 border-blue-200 bg-blue-50',
      duration: 2000
    });
  };

  const handleProcessIncident = () => {
    setShowDetailDialog(false);
    setShowProcessDialog(true);
    toast({
      title: (
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-orange-600" />
          Bắt đầu xử lý sự cố
        </div>
      ),
      description: `Đang xử lý sự cố #${selectedIncident.id}`,
      className: 'border-l-orange-500 border-orange-200 bg-orange-50',
      duration: 2000
    });
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident || !newStatus) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Thông tin chưa đầy đủ
          </div>
        ),
        description: 'Vui lòng chọn trạng thái xử lý',
        className: 'border-l-orange-500 border-orange-200 bg-orange-50',
        duration: 3000
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await adminService.updateIncident({
        incidentId: selectedIncident.id,
        status: newStatus,
        resolutionNotes: adminNotes.trim() || undefined
      });

      // Update local state with response data
      setIncidents(prev => prev.map(incident =>
        incident.id === selectedIncident.id
          ? {
            ...incident,
            status: response.status || newStatus,
            resolutionNotes: response.resolutionNotes || adminNotes.trim(),
            updatedAt: response.updatedAt || new Date().toISOString()
          }
          : incident
      ));

      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Cập nhật sự cố thành công!
          </div>
        ),
        description: `Đã ${newStatus === 'RESOLVED' ? 'giải quyết' : 'cập nhật'} sự cố #${selectedIncident.id}`,
        className: 'border-l-green-500 border-green-200 bg-green-50',
        duration: 4000
      });
      setShowProcessDialog(false);
      setAdminNotes('');
      setNewStatus('');
      setSelectedIncident(null);
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Cập nhật sự cố thất bại
          </div>
        ),
        description: error?.response?.data?.message || 'Không thể cập nhật trạng thái sự cố. Vui lòng thử lại',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
      });
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

  // Calculate statistics
  const incidentStats = {
    total: incidents.length,
    pending: incidents.filter(i => i.status?.toLowerCase() === 'pending').length,
    in_review: incidents.filter(i => i.status?.toLowerCase() === 'in_review').length,
    resolved: incidents.filter(i => i.status?.toLowerCase() === 'resolved').length,
    todayIncidents: incidents.filter(i =>
      new Date(i.createdAt).toDateString() === new Date().toDateString()).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Search and Filter */}
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

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sự cố</CardTitle>
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
                  <TableCell className='max-w-md'>
                    <div className="truncate font-medium">
                      {incident.description && incident.description.length > 80
                        ? incident.description.substring(0, 80) + '...'
                        : incident.description || 'Không có mô tả'}
                    </div>
                    {incident.rental && (
                      <div className="text-sm text-muted-foreground">
                        Liên quan đến lượt thuê #{incident.rental.id}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{incident.staff?.fullName || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">
                        {incident.staff?.phone || ''}
                      </div>
                    </div>
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
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleViewDetail(incident)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      {incident.status?.toLowerCase() !== 'resolved' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setSelectedIncident(incident);
                            setNewStatus(incident.status);
                            setAdminNotes(incident.resolutionNotes || '');
                            handleProcessIncident();
                          }}
                        >
                          <RefreshCw className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
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
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết sự cố</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về báo cáo sự cố từ khách hàng
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className='space-y-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Người báo cáo</Label>
                  <p className='text-lg font-semibold'>{selectedIncident.staff?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạng thái</Label>
                  <div className='mt-1'>
                    {getIncidentStatusBadge(selectedIncident.status)}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>ID Sự cố</Label>
                  <p className='text-lg'>#{selectedIncident.id}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Lượt thuê liên quan</Label>
                  <p className='text-lg'>
                    {selectedIncident.rental ? `#${selectedIncident.rental.id}` : 'Không có'}
                  </p>
                </div>
              </div>

              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Mô tả sự cố</Label>
                <div className='mt-2 p-4 bg-muted rounded-lg'>
                  <p className='text-sm'>{selectedIncident.description || 'Không có mô tả'}</p>
                </div>
              </div>

              {selectedIncident.vehicle && (
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Xe liên quan</Label>
                    <p className='text-lg'>{selectedIncident.vehicle.brand} {selectedIncident.vehicle.model}</p>
                    <p className='text-sm text-muted-foreground'>
                      Biển số: {selectedIncident.vehicle.licensePlate}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Trạm lấy xe</Label>
                    <p className='text-lg'>{selectedIncident.vehicle.station?.name || 'N/A'}</p>
                    {selectedIncident.vehicle.station?.address && (
                      <p className='text-sm text-muted-foreground'>{selectedIncident.vehicle.station.address}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedIncident.staff && (
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Thời gian báo cáo</Label>
                    <p className='text-lg'>{new Date(selectedIncident.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Cập nhật lần cuối</Label>
                    <p className='text-lg'>{new Date(selectedIncident.updatedAt || selectedIncident.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              )}

              {selectedIncident.resolutionNotes && (
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Ghi chú xử lý</Label>
                  <div className='mt-2 p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <p className='text-sm text-green-800'>{selectedIncident.resolutionNotes}</p>
                  </div>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>

              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
            {selectedIncident && selectedIncident.status?.toLowerCase() !== 'resolved' && (
              <Button onClick={handleProcessIncident}>
                Xử lý sự cố
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Incident Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Xử lý sự cố</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái và ghi chú xử lý cho sự cố
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className='space-y-4 py-4'>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Người báo cáo</Label>
                <p className='text-lg font-semibold'>{selectedIncident.staff?.fullName || 'N/A'}</p>
              </div>

              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Nội dung sự cố</Label>
                <div className='mt-2 p-3 bg-muted rounded-lg'>
                  <p className='text-sm'>{selectedIncident.description || 'Không có mô tả'}</p>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>Trạng thái xử lý</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn trạng thái' />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                    <SelectItem value='PENDING' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Chờ xử lý</SelectItem>
                    <SelectItem value='IN_REVIEW' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đang xử lý</SelectItem>
                    <SelectItem value='RESOLVED' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã giải quyết</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='notes'>Ghi chú xử lý</Label>
                <Textarea
                  id='notes'
                  placeholder='Nhập ghi chú chi tiết về cách xử lý sự cố...'
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

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