import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Monitor, Activity, AlertTriangle, CheckCircle, Wifi, Server, 
  DollarSign, TrendingUp, Users, Car, FileText, Eye, Edit, 
  Calendar, Clock, Search, Filter, Zap, CreditCard, Shield, AlertCircle,
  RefreshCw, Settings, BarChart3
} from 'lucide-react';

const SystemMonitoring = () => {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  // State for different data types
  const [rentals, setRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({});
  const [violations, setViolations] = useState([]);
  const [incidents, setIncidents] = useState([]);
  
  // Dialog states
  const [showRentalDialog, setShowRentalDialog] = useState(false);
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentUpdateData, setIncidentUpdateData] = useState({ status: '' });

  // Mock data for rentals
  const mockRentals = [
    {
      id: 1,
      renter_id: 101,
      vehicle_id: 201,
      start_time: '2024-01-15T08:00:00Z',
      end_time: '2024-01-15T10:30:00Z',
      status: 'completed',
      total_cost: 45000,
      created_at: '2024-01-15T07:55:00Z',
      renter_name: 'Nguyễn Văn An',
      vehicle_name: 'Xe đạp điện VinFast Klara'
    },
    {
      id: 2,
      renter_id: 102,
      vehicle_id: 202,
      start_time: '2024-01-15T14:20:00Z',
      end_time: null,
      status: 'ongoing',
      total_cost: 0,
      created_at: '2024-01-15T14:15:00Z',
      renter_name: 'Trần Thị Bình',
      vehicle_name: 'Xe đạp điện Yadea'
    },
    {
      id: 3,
      renter_id: 103,
      vehicle_id: 203,
      start_time: '2024-01-15T09:00:00Z',
      end_time: null,
      status: 'cancelled',
      total_cost: 0,
      created_at: '2024-01-15T08:55:00Z',
      renter_name: 'Lê Minh Cường',
      vehicle_name: 'Xe máy điện Pega'
    },
    {
      id: 4,
      renter_id: 104,
      vehicle_id: 204,
      start_time: '2024-01-15T11:00:00Z',
      end_time: '2024-01-15T13:00:00Z',
      status: 'completed',
      total_cost: 60000,
      created_at: '2024-01-15T10:55:00Z',
      renter_name: 'Phạm Thu Dung',
      vehicle_name: 'Xe đạp điện Giant'
    },
    {
      id: 5,
      renter_id: 105,
      vehicle_id: 205,
      start_time: '2024-01-15T16:00:00Z',
      end_time: null,
      status: 'ongoing',
      total_cost: 0,
      created_at: '2024-01-15T15:55:00Z',
      renter_name: 'Hoàng Văn Em',
      vehicle_name: 'Xe máy điện VinFast Impes'
    }
  ];

  // Mock payment statistics
  const mockPaymentStats = {
    total_revenue: 2450000,
    revenue_today: 185000,
    revenue_month: 1250000,
    successful_payments: 156,
    failed_payments: 8
  };

  // Mock payments data
  const mockPayments = [
    {
      id: 1,
      rental_id: 1,
      renter_id: 101,
      amount: 45000,
      method: 'credit_card',
      status: 'paid',
      created_at: '2024-01-15T10:35:00Z',
      renter_name: 'Nguyễn Văn An'
    },
    {
      id: 2,
      rental_id: 4,
      renter_id: 104,
      amount: 60000,
      method: 'e_wallet',
      status: 'paid',
      created_at: '2024-01-15T13:05:00Z',
      renter_name: 'Phạm Thu Dung'
    },
    {
      id: 3,
      rental_id: 6,
      renter_id: 106,
      amount: 25000,
      method: 'bank_transfer',
      status: 'pending',
      created_at: '2024-01-15T15:20:00Z',
      renter_name: 'Nguyễn Thị Phương'
    },
    {
      id: 4,
      rental_id: 7,
      renter_id: 107,
      amount: 35000,
      method: 'credit_card',
      status: 'failed',
      created_at: '2024-01-15T16:45:00Z',
      renter_name: 'Lê Đức Quang'
    }
  ];

  // Mock violations data
  const mockViolations = [
    {
      id: 1,
      rental_id: 8,
      renter_id: 108,
      type: 'speeding',
      description: 'Vượt quá tốc độ cho phép 15km/h',
      penalty_amount: 50000,
      created_at: '2024-01-15T14:30:00Z',
      renter_name: 'Trần Văn Huy'
    },
    {
      id: 2,
      rental_id: 9,
      renter_id: 109,
      type: 'parking_violation',
      description: 'Đậu xe sai quy định tại khu vực cấm',
      penalty_amount: 30000,
      created_at: '2024-01-15T16:15:00Z',
      renter_name: 'Nguyễn Thị Lan'
    },
    {
      id: 3,
      rental_id: 10,
      renter_id: 110,
      type: 'damage',
      description: 'Làm hỏng gương chiếu hậu',
      penalty_amount: 150000,
      created_at: '2024-01-15T18:20:00Z',
      renter_name: 'Phạm Minh Tuấn'
    }
  ];

  // Mock incidents data
  const mockIncidents = [
    {
      id: 1,
      rental_id: 11,
      vehicle_id: 206,
      station_id: null,
      description: 'Pin xe bị hỏng đột ngột trong quá trình sử dụng',
      severity: 'high',
      status: 'pending',
      created_at: '2024-01-15T12:30:00Z',
      updated_at: '2024-01-15T12:30:00Z',
      reporter_name: 'Lê Thị Mai'
    },
    {
      id: 2,
      rental_id: null,
      vehicle_id: null,
      station_id: 301,
      description: 'Trạm sạc bị lỗi, không thể sạc xe',
      severity: 'medium',
      status: 'in_review',
      created_at: '2024-01-15T09:45:00Z',
      updated_at: '2024-01-15T11:20:00Z',
      station_name: 'Trạm Quận 1'
    },
    {
      id: 3,
      rental_id: 12,
      vehicle_id: 207,
      station_id: null,
      description: 'Phanh xe không hoạt động hiệu quả',
      severity: 'high',
      status: 'resolved',
      created_at: '2024-01-14T16:20:00Z',
      updated_at: '2024-01-15T08:30:00Z',
      reporter_name: 'Nguyễn Văn Đức'
    },
    {
      id: 4,
      rental_id: null,
      vehicle_id: 208,
      station_id: null,
      description: 'Xe bị trầy xước ở phần thân',
      severity: 'low',
      status: 'pending',
      created_at: '2024-01-15T17:10:00Z',
      updated_at: '2024-01-15T17:10:00Z',
      reporter_name: 'Hệ thống'
    }
  ];

  // Fetch functions (using mock data)
  const fetchRentals = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/rentals');
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      setRentals(mockRentals);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast.error('Không thể tải dữ liệu thuê xe');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/payments/stats');
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setPaymentStats(mockPaymentStats);
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      toast.error('Không thể tải thống kê thanh toán');
    }
  };

  const fetchViolations = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/violations');
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setViolations(mockViolations);
    } catch (error) {
      console.error('Error fetching violations:', error);
      toast.error('Không thể tải dữ liệu vi phạm');
    }
  };

  const fetchIncidents = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/incidents');
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 400));
      setIncidents(mockIncidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Không thể tải dữ liệu sự cố');
    }
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident || !incidentUpdateData.status) {
      toast.error('Vui lòng chọn trạng thái cập nhật');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/incidents/${selectedIncident.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: incidentUpdateData.status })
      // });

      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setIncidents(prev => prev.map(incident => 
        incident.id === selectedIncident.id 
          ? { ...incident, status: incidentUpdateData.status, updated_at: new Date().toISOString() }
          : incident
      ));

      toast.success('Cập nhật trạng thái sự cố thành công');
      setShowIncidentDialog(false);
      setSelectedIncident(null);
      setIncidentUpdateData({ status: '' });
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Không thể cập nhật trạng thái sự cố');
    }
  };

  // Helper functions
  const getRentalStatusBadge = (status) => {
    const statusConfig = {
      ongoing: { variant: 'default', label: 'Đang thuê' },
      completed: { variant: 'secondary', label: 'Hoàn thành' },
      cancelled: { variant: 'destructive', label: 'Đã hủy' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { variant: 'default', label: 'Đã thanh toán' },
      pending: { variant: 'outline', label: 'Chờ thanh toán' },
      failed: { variant: 'destructive', label: 'Thất bại' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getIncidentStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'destructive', label: 'Chờ xử lý' },
      in_review: { variant: 'outline', label: 'Đang xem xét' },
      resolved: { variant: 'default', label: 'Đã giải quyết' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { variant: 'secondary', label: 'Thấp' },
      medium: { variant: 'outline', label: 'Trung bình' },
      high: { variant: 'destructive', label: 'Cao' }
    };
    
    const config = severityConfig[severity] || { variant: 'outline', label: severity };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Filter functions
  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.renter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.station_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Calculate real-time statistics
  const systemStats = {
    activeRentals: rentals.filter(r => r.status === 'ongoing').length,
    completedToday: rentals.filter(r => r.status === 'completed' && 
      new Date(r.end_time).toDateString() === new Date().toDateString()).length,
    pendingIncidents: incidents.filter(i => i.status === 'pending').length,
    totalViolations: violations.length,
    revenueToday: paymentStats.revenue_today || 0,
    successRate: paymentStats.successful_payments ? 
      Math.round((paymentStats.successful_payments / (paymentStats.successful_payments + paymentStats.failed_payments)) * 100) : 0
  };

  useEffect(() => {
    fetchRentals();
    fetchPaymentStats();
    fetchViolations();
    fetchIncidents();
  }, []);

  // Re-fetch data when filters change
  useEffect(() => {
    if (selectedTab === 'rentals') {
      fetchRentals();
    } else if (selectedTab === 'incidents') {
      fetchIncidents();
    }
  }, [selectedTab, statusFilter, severityFilter]);

  if (loading && rentals.length === 0) {
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
          <h1 className="text-3xl font-bold tracking-tight">Giám sát hệ thống</h1>
          <p className="text-muted-foreground">
            Theo dõi tình trạng hoạt động và hiệu suất hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            fetchRentals();
            fetchPaymentStats();
            fetchViolations();
            fetchIncidents();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Cấu hình
          </Button>
        </div>
      </div>

      {/* System Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang thuê</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeRentals}</div>
            <p className="text-xs text-muted-foreground">
              Lượt thuê đang diễn ra
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(systemStats.revenueToday)}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.completedToday} lượt hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sự cố chờ xử lý</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.pendingIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Cần xử lý ngay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ thanh toán</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Thành công trong tháng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Tổng quan', icon: Monitor },
          { id: 'rentals', label: 'Thuê xe', icon: Car },
          { id: 'payments', label: 'Thanh toán', icon: CreditCard },
          { id: 'violations', label: 'Vi phạm', icon: Shield },
          { id: 'incidents', label: 'Sự cố', icon: AlertCircle }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={selectedTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê thanh toán</CardTitle>
              <CardDescription>
                Tình hình doanh thu và giao dịch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Tổng doanh thu</span>
                  </div>
                  <span className="text-lg font-bold">{formatCurrency(paymentStats.total_revenue)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Doanh thu tháng</span>
                  </div>
                  <span className="text-lg font-bold">{formatCurrency(paymentStats.revenue_month)}</span>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Giao dịch thành công</span>
                  </div>
                  <span className="text-lg font-bold">{paymentStats.successful_payments}</span>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Giao dịch thất bại</span>
                  </div>
                  <span className="text-lg font-bold">{paymentStats.failed_payments}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hoạt động hệ thống</CardTitle>
              <CardDescription>
                Tình trạng các dịch vụ và thành phần
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { service: 'API Server', status: 'online', response: '45ms' },
                  { service: 'Database', status: 'online', response: '12ms' },
                  { service: 'Payment Gateway', status: 'online', response: '89ms' },
                  { service: 'Notification Service', status: 'warning', response: '234ms' },
                  { service: 'File Storage', status: 'online', response: '67ms' }
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'online' ? 'bg-green-500' : 
                        service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium">{service.service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{service.response}</span>
                      <Badge variant={
                        service.status === 'online' ? 'default' : 
                        service.status === 'warning' ? 'outline' : 'destructive'
                      }>
                        {service.status === 'online' ? 'Hoạt động' : 
                         service.status === 'warning' ? 'Chậm' : 'Lỗi'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'rentals' && (
        <div className="space-y-4">
          <div className='flex items-center gap-4'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm lượt thuê...'
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
                <SelectItem value='ongoing'>Đang thuê</SelectItem>
                <SelectItem value='completed'>Hoàn thành</SelectItem>
                <SelectItem value='cancelled'>Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách lượt thuê</CardTitle>
              <CardDescription>
                Theo dõi tất cả các lượt thuê xe trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người thuê</TableHead>
                    <TableHead>Xe</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian bắt đầu</TableHead>
                    <TableHead>Chi phí</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRentals.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className='font-medium'>
                        {rental.renter_name}
                      </TableCell>
                      <TableCell>{rental.vehicle_name}</TableCell>
                      <TableCell>
                        {getRentalStatusBadge(rental.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(rental.start_time).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        {rental.total_cost > 0 ? formatCurrency(rental.total_cost) : 'Chưa tính'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button 
                          variant='ghost' 
                          size='sm'
                          onClick={() => {
                            setSelectedRental(rental);
                            setShowRentalDialog(true);
                          }}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredRentals.length === 0 && (
                <div className='text-center py-8 text-muted-foreground'>
                  {searchTerm || (statusFilter && statusFilter !== 'all') ? 'Không tìm thấy lượt thuê phù hợp' : 'Chưa có lượt thuê nào'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'payments' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Giao dịch gần đây</CardTitle>
              <CardDescription>
                Danh sách các giao dịch thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{payment.renter_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.method === 'credit_card' ? 'Thẻ tín dụng' :
                         payment.method === 'e_wallet' ? 'Ví điện tử' : 'Chuyển khoản'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(payment.amount)}</div>
                      <div className="mt-1">
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu</CardTitle>
              <CardDescription>
                Xu hướng doanh thu theo thời gian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Biểu đồ doanh thu đang được phát triển
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'violations' && (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách vi phạm</CardTitle>
            <CardDescription>
              Theo dõi các vi phạm và phạt tiền trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {violations.map((violation) => (
                <div key={violation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-red-600" />
                      <span className="font-medium">{violation.renter_name}</span>
                      <Badge variant="outline">{violation.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{violation.description}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(violation.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(violation.penalty_amount)}
                    </div>
                    <Badge variant="destructive">Phạt tiền</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'incidents' && (
        <div className="space-y-4">
          <div className='flex items-center gap-4'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm sự cố...'
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
                <SelectItem value='in_review'>Đang xem xét</SelectItem>
                <SelectItem value='resolved'>Đã giải quyết</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className='w-48'>
                <AlertTriangle className='h-4 w-4 mr-2' />
                <SelectValue placeholder='Lọc theo mức độ' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả mức độ</SelectItem>
                <SelectItem value='low'>Thấp</SelectItem>
                <SelectItem value='medium'>Trung bình</SelectItem>
                <SelectItem value='high'>Cao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách sự cố</CardTitle>
              <CardDescription>
                Quản lý và xử lý các sự cố trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className={`h-4 w-4 ${
                          incident.severity === 'high' ? 'text-red-600' :
                          incident.severity === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                        }`} />
                        <span className="font-medium">
                          {incident.reporter_name || incident.station_name || `Sự cố #${incident.id}`}
                        </span>
                        {getSeverityBadge(incident.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(incident.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getIncidentStatusBadge(incident.status)}
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => {
                          setSelectedIncident(incident);
                          setIncidentUpdateData({ status: incident.status });
                          setShowIncidentDialog(true);
                        }}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredIncidents.length === 0 && (
                <div className='text-center py-8 text-muted-foreground'>
                  {searchTerm || (statusFilter && statusFilter !== 'all') || (severityFilter && severityFilter !== 'all') ? 
                    'Không tìm thấy sự cố phù hợp' : 'Chưa có sự cố nào'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rental Details Dialog */}
      <Dialog open={showRentalDialog} onOpenChange={setShowRentalDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết lượt thuê</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về lượt thuê xe
            </DialogDescription>
          </DialogHeader>
          
          {selectedRental && (
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Người thuê</Label>
                  <p className='text-lg font-semibold'>{selectedRental.renter_name}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Xe</Label>
                  <p className='text-lg'>{selectedRental.vehicle_name}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạng thái</Label>
                  <div className='mt-1'>
                    {getRentalStatusBadge(selectedRental.status)}
                  </div>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Chi phí</Label>
                  <p className='text-lg font-bold'>
                    {selectedRental.total_cost > 0 ? formatCurrency(selectedRental.total_cost) : 'Chưa tính'}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Thời gian bắt đầu</Label>
                  <p className='text-lg'>{new Date(selectedRental.start_time).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Thời gian kết thúc</Label>
                  <p className='text-lg'>
                    {selectedRental.end_time ? 
                      new Date(selectedRental.end_time).toLocaleString('vi-VN') : 
                      'Chưa kết thúc'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowRentalDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Incident Update Dialog */}
      <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Cập nhật sự cố</DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái xử lý sự cố
            </DialogDescription>
          </DialogHeader>
          
          {selectedIncident && (
            <div className='space-y-4 py-4'>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Mô tả sự cố</Label>
                <p className='text-lg'>{selectedIncident.description}</p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Mức độ nghiêm trọng</Label>
                  <div className='mt-1'>
                    {getSeverityBadge(selectedIncident.severity)}
                  </div>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạng thái hiện tại</Label>
                  <div className='mt-1'>
                    {getIncidentStatusBadge(selectedIncident.status)}
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='status'>Trạng thái mới</Label>
                <Select 
                  value={incidentUpdateData.status} 
                  onValueChange={(value) => setIncidentUpdateData({...incidentUpdateData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn trạng thái' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Chờ xử lý</SelectItem>
                    <SelectItem value='in_review'>Đang xem xét</SelectItem>
                    <SelectItem value='resolved'>Đã giải quyết</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowIncidentDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateIncident}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemMonitoring;