import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Users, UserPlus, Search, Filter, Phone, Mail, Eye, 
  History, AlertTriangle, Shield, Calendar, Car, 
  DollarSign, TrendingUp, Activity, Clock, RefreshCw
} from 'lucide-react';

const CustomersManagement = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  
  // State for customer data
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerViolations, setCustomerViolations] = useState([]);
  const [customerIncidents, setCustomerIncidents] = useState([]);
  
  // Dialog states
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Mock data for customers
  const mockCustomers = [
    {
      id: 1,
      full_name: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'an.nguyen@email.com',
      total_rentals: 15,
      total_payments: 450000,
      verified: true,
      created_at: '2024-01-10T08:00:00Z',
      last_rental: '2024-01-15T14:30:00Z',
      status: 'active'
    },
    {
      id: 2,
      full_name: 'Trần Thị Bình',
      phone: '0902345678',
      email: 'binh.tran@email.com',
      total_rentals: 8,
      total_payments: 240000,
      verified: true,
      created_at: '2024-01-05T10:15:00Z',
      last_rental: '2024-01-14T16:20:00Z',
      status: 'active'
    },
    {
      id: 3,
      full_name: 'Lê Minh Cường',
      phone: '0903456789',
      email: 'cuong.le@email.com',
      total_rentals: 2,
      total_payments: 60000,
      verified: false,
      created_at: '2024-01-12T09:30:00Z',
      last_rental: '2024-01-13T11:45:00Z',
      status: 'suspended'
    },
    {
      id: 4,
      full_name: 'Phạm Thu Dung',
      phone: '0904567890',
      email: 'dung.pham@email.com',
      total_rentals: 25,
      total_payments: 750000,
      verified: true,
      created_at: '2023-12-20T07:45:00Z',
      last_rental: '2024-01-15T18:10:00Z',
      status: 'vip'
    },
    {
      id: 5,
      full_name: 'Hoàng Văn Em',
      phone: '0905678901',
      email: 'em.hoang@email.com',
      total_rentals: 12,
      total_payments: 360000,
      verified: true,
      created_at: '2024-01-08T13:20:00Z',
      last_rental: '2024-01-15T12:00:00Z',
      status: 'active'
    },
    {
      id: 6,
      full_name: 'Nguyễn Thị Phương',
      phone: '0906789012',
      email: null,
      total_rentals: 1,
      total_payments: 30000,
      verified: false,
      created_at: '2024-01-15T16:30:00Z',
      last_rental: '2024-01-15T17:00:00Z',
      status: 'new'
    }
  ];

  // Mock rental history
  const mockRentalHistory = {
    1: [
      {
        rental_id: 101,
        vehicle_id: 201,
        start_time: '2024-01-15T14:30:00Z',
        end_time: '2024-01-15T16:30:00Z',
        status: 'completed',
        cost: 60000,
        vehicle_name: 'Xe đạp điện VinFast Klara'
      },
      {
        rental_id: 102,
        vehicle_id: 202,
        start_time: '2024-01-14T09:00:00Z',
        end_time: '2024-01-14T11:00:00Z',
        status: 'completed',
        cost: 45000,
        vehicle_name: 'Xe đạp điện Yadea'
      },
      {
        rental_id: 103,
        vehicle_id: 203,
        start_time: '2024-01-13T16:15:00Z',
        end_time: '2024-01-13T18:15:00Z',
        status: 'completed',
        cost: 50000,
        vehicle_name: 'Xe máy điện Pega'
      }
    ],
    2: [
      {
        rental_id: 201,
        vehicle_id: 204,
        start_time: '2024-01-14T16:20:00Z',
        end_time: '2024-01-14T18:20:00Z',
        status: 'completed',
        cost: 40000,
        vehicle_name: 'Xe đạp điện Giant'
      },
      {
        rental_id: 202,
        vehicle_id: 205,
        start_time: '2024-01-12T10:30:00Z',
        end_time: '2024-01-12T12:30:00Z',
        status: 'completed',
        cost: 35000,
        vehicle_name: 'Xe máy điện VinFast Impes'
      }
    ]
  };

  // Mock violations
  const mockViolations = {
    3: [
      {
        id: 1,
        type: 'speeding',
        description: 'Vượt quá tốc độ cho phép 15km/h',
        penalty_amount: 50000,
        created_at: '2024-01-13T17:30:00Z'
      },
      {
        id: 2,
        type: 'parking_violation',
        description: 'Đậu xe sai quy định tại khu vực cấm',
        penalty_amount: 30000,
        created_at: '2024-01-10T14:20:00Z'
      }
    ]
  };

  // Mock incidents
  const mockIncidents = {
    1: [
      {
        id: 1,
        description: 'Pin xe bị hỏng đột ngột trong quá trình sử dụng',
        severity: 'medium',
        status: 'resolved',
        created_at: '2024-01-12T15:45:00Z'
      }
    ],
    3: [
      {
        id: 2,
        description: 'Phanh xe không hoạt động hiệu quả',
        severity: 'high',
        status: 'pending',
        created_at: '2024-01-13T12:20:00Z'
      }
    ]
  };

  // Fetch functions (using mock data)
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/renters');
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Không thể tải dữ liệu khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerHistory = async (customerId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/renters/${customerId}/history`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setCustomerHistory(mockRentalHistory[customerId] || []);
    } catch (error) {
      console.error('Error fetching customer history:', error);
      toast.error('Không thể tải lịch sử thuê xe');
    }
  };

  const fetchCustomerViolations = async (customerId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/renters/${customerId}/violations`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setCustomerViolations(mockViolations[customerId] || []);
    } catch (error) {
      console.error('Error fetching customer violations:', error);
      toast.error('Không thể tải lịch sử vi phạm');
    }
  };

  const fetchCustomerIncidents = async (customerId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/renters/${customerId}/incidents`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setCustomerIncidents(mockIncidents[customerId] || []);
    } catch (error) {
      console.error('Error fetching customer incidents:', error);
      toast.error('Không thể tải lịch sử sự cố');
    }
  };

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setActiveTab('info');
    setShowCustomerDialog(true);
    
    // Fetch all customer data
    await Promise.all([
      fetchCustomerHistory(customer.id),
      fetchCustomerViolations(customer.id),
      fetchCustomerIncidents(customer.id)
    ]);
  };

  // Helper functions
  const getCustomerStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'default', label: 'Hoạt động' },
      vip: { variant: 'secondary', label: 'VIP' },
      suspended: { variant: 'destructive', label: 'Tạm khóa' },
      new: { variant: 'outline', label: 'Mới' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRentalStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'default', label: 'Hoàn thành' },
      ongoing: { variant: 'secondary', label: 'Đang thuê' },
      cancelled: { variant: 'destructive', label: 'Đã hủy' }
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
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerified = verifiedFilter === 'all' || 
                           (verifiedFilter === 'verified' && customer.verified) ||
                           (verifiedFilter === 'unverified' && !customer.verified);
    return matchesSearch && matchesVerified;
  });

  // Calculate statistics
  const customerStats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    vip: customers.filter(c => c.status === 'vip').length,
    newThisWeek: customers.filter(c => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(c.created_at) > weekAgo;
    }).length,
    verified: customers.filter(c => c.verified).length,
    currentlyRenting: customers.filter(c => c.last_rental && 
      new Date(c.last_rental).toDateString() === new Date().toDateString()).length,
    needSupport: customers.filter(c => c.status === 'suspended').length
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Re-fetch data when filters change
  useEffect(() => {
    fetchCustomers();
  }, [verifiedFilter]);

  if (loading && customers.length === 0) {
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý khách hàng</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin và hoạt động của khách hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCustomers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {customerStats.verified} đã xác thực
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {customerStats.currentlyRenting} đang thuê xe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.vip}</div>
            <p className="text-xs text-muted-foreground">
              Khách hàng VIP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mới trong tuần</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.newThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Đăng ký mới
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm khách hàng...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>
        
        <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
          <SelectTrigger className='w-48'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Lọc theo xác thực' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả</SelectItem>
            <SelectItem value='verified'>Đã xác thực</SelectItem>
            <SelectItem value='unverified'>Chưa xác thực</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Customer List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Danh sách khách hàng</CardTitle>
            <CardDescription>
              Quản lý thông tin và hoạt động của tất cả khách hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {customer.full_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{customer.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {customer.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {customer.total_rentals} lần thuê
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(customer.total_payments)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getCustomerStatusBadge(customer.status)}
                        {customer.verified && (
                          <Badge variant="outline" className="ml-1">
                            Đã xác thực
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredCustomers.length === 0 && (
              <div className='text-center py-8 text-muted-foreground'>
                {searchTerm || (verifiedFilter && verifiedFilter !== 'all') ? 
                  'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng nào'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Statistics Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê khách hàng</CardTitle>
            <CardDescription>
              Tình hình hoạt động khách hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Mới hôm nay</span>
                </div>
                <Badge variant="default">
                  {customers.filter(c => 
                    new Date(c.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Đang thuê xe</span>
                </div>
                <Badge variant="secondary">{customerStats.currentlyRenting}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Chưa xác thực</span>
                </div>
                <Badge variant="outline">
                  {customers.filter(c => !c.verified).length}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Cần hỗ trợ</span>
                </div>
                <Badge variant="destructive">{customerStats.needSupport}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Tổng doanh thu</span>
                </div>
                <span className="text-sm font-bold">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.total_payments, 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và lịch sử hoạt động của khách hàng
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="history">Lịch sử thuê</TabsTrigger>
                <TabsTrigger value="violations">Vi phạm</TabsTrigger>
                <TabsTrigger value="incidents">Sự cố</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Họ và tên</Label>
                    <p className='text-lg font-semibold'>{selectedCustomer.full_name}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Số điện thoại</Label>
                    <p className='text-lg'>{selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Email</Label>
                    <p className='text-lg'>{selectedCustomer.email || 'Chưa cung cấp'}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Trạng thái</Label>
                    <div className='mt-1'>
                      {getCustomerStatusBadge(selectedCustomer.status)}
                      {selectedCustomer.verified && (
                        <Badge variant="outline" className="ml-2">
                          Đã xác thực
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Tổng lượt thuê</Label>
                    <p className='text-lg font-bold'>{selectedCustomer.total_rentals}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Tổng chi tiêu</Label>
                    <p className='text-lg font-bold'>{formatCurrency(selectedCustomer.total_payments)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Ngày đăng ký</Label>
                    <p className='text-lg'>{new Date(selectedCustomer.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Lần thuê cuối</Label>
                    <p className='text-lg'>
                      {selectedCustomer.last_rental ? 
                        new Date(selectedCustomer.last_rental).toLocaleDateString('vi-VN') : 
                        'Chưa có'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  {customerHistory.length > 0 ? (
                    customerHistory.map((rental) => (
                      <div key={rental.rental_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Car className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{rental.vehicle_name}</span>
                            {getRentalStatusBadge(rental.status)}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Từ: {new Date(rental.start_time).toLocaleString('vi-VN')}</div>
                            <div>Đến: {new Date(rental.end_time).toLocaleString('vi-VN')}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(rental.cost)}</div>
                          <div className="text-sm text-muted-foreground">ID: {rental.rental_id}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <History className="h-12 w-12 mx-auto mb-4" />
                      <p>Chưa có lịch sử thuê xe</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="violations" className="space-y-4">
                <div className="space-y-3">
                  {customerViolations.length > 0 ? (
                    customerViolations.map((violation) => (
                      <div key={violation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-red-600" />
                            <span className="font-medium">{violation.type}</span>
                            <Badge variant="destructive">Vi phạm</Badge>
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
                          <div className="text-sm text-muted-foreground">Phạt tiền</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <Shield className="h-12 w-12 mx-auto mb-4" />
                      <p>Không có vi phạm nào</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="incidents" className="space-y-4">
                <div className="space-y-3">
                  {customerIncidents.length > 0 ? (
                    customerIncidents.map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              incident.severity === 'high' ? 'text-red-600' :
                              incident.severity === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                            }`} />
                            <span className="font-medium">Sự cố #{incident.id}</span>
                            {getSeverityBadge(incident.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(incident.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="text-right">
                          {getIncidentStatusBadge(incident.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                      <p>Không có sự cố nào</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowCustomerDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersManagement;