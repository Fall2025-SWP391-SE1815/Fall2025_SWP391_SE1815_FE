import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  BarChart3, TrendingUp, Download, Calendar, DollarSign, Users, Car, MapPin,
  Activity, RefreshCw, FileText, PieChart, LineChart, TrendingDown,
  Clock, CheckCircle, AlertTriangle, X, MessageSquare
} from 'lucide-react';

const ReportsAndStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dateRange, setDateRange] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // State for different statistics
  const [dashboardStats, setDashboardStats] = useState({});
  const [rentalStats, setRentalStats] = useState({});
  const [revenueStats, setRevenueStats] = useState({});
  const [complaintStats, setComplaintStats] = useState({});

  // Mock data for dashboard overview
  const mockDashboardStats = {
    startTime: '2024-01-01T00:00:00Z',
    endTime: '2024-01-31T23:59:59Z',
    total_users: 2543,
    total_renters: 2156,
    total_staff: 87,
    total_stations: 25,
    total_vehicles: 320,
    active_rentals: 45,
    revenue: 2450000000
  };

  // Mock data for rental statistics
  const mockRentalStats = {
    startTime: '2024-01-01T00:00:00Z',
    endTime: '2024-01-31T23:59:59Z',
    total_rentals: 1234,
    completed: 1156,
    cancelled: 78
  };

  // Mock data for revenue statistics
  const mockRevenueStats = {
    startTime: '2024-01-01T00:00:00Z',
    endTime: '2024-01-31T23:59:59Z',
    total_revenue: 2450000000,
    rentals_count: 1234
  };

  // Mock data for complaint statistics
  const mockComplaintStats = {
    total_complaints: 67,
    pending: 12,
    in_progress: 18,
    resolved: 32,
    rejected: 5
  };

  // Mock historical data for charts
  const mockHistoricalData = {
    daily_revenue: [
      { date: '2024-01-01', revenue: 78000000, rentals: 45 },
      { date: '2024-01-02', revenue: 82000000, rentals: 52 },
      { date: '2024-01-03', revenue: 76000000, rentals: 48 },
      { date: '2024-01-04', revenue: 89000000, rentals: 56 },
      { date: '2024-01-05', revenue: 95000000, rentals: 61 },
      { date: '2024-01-06', revenue: 105000000, rentals: 68 },
      { date: '2024-01-07', revenue: 98000000, rentals: 62 }
    ],
    station_performance: [
      { station: 'Trạm Quận 1', rentals: 234, revenue: 450000000, utilization: 87 },
      { station: 'Trạm Quận 2', rentals: 198, revenue: 380000000, utilization: 76 },
      { station: 'Trạm Quận 3', rentals: 156, revenue: 290000000, utilization: 65 },
      { station: 'Trạm Quận 4', rentals: 189, revenue: 360000000, utilization: 82 },
      { station: 'Trạm Quận 5', rentals: 145, revenue: 270000000, utilization: 71 }
    ],
    vehicle_stats: {
      active: 285,
      maintenance: 23,
      repair: 8,
      out_of_service: 4,
      avg_usage_hours: 8.2,
      avg_battery_life: 92.5
    }
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDateRange = () => {
    const now = new Date();
    let startTime, endTime;

    switch (dateRange) {
      case 'today':
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'this_week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        startTime = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        endTime = new Date();
        break;
      case 'this_month':
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
        endTime = new Date();
        break;
      case 'last_month':
        startTime = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endTime = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'custom':
        startTime = new Date(customStartDate);
        endTime = new Date(customEndDate);
        break;
      default:
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
        endTime = new Date();
    }

    return {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
  };

  // Fetch functions (using mock data)
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const { startTime, endTime } = getDateRange();
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/dashboard?startTime=${startTime}&endTime=${endTime}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      setDashboardStats({
        ...mockDashboardStats,
        startTime,
        endTime
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Không thể tải thống kê tổng quan');
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalStats = async () => {
    try {
      const { startTime, endTime } = getDateRange();
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/statistics/rentals?startTime=${startTime}&endTime=${endTime}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setRentalStats({
        ...mockRentalStats,
        startTime,
        endTime
      });
    } catch (error) {
      console.error('Error fetching rental stats:', error);
      toast.error('Không thể tải thống kê thuê xe');
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const { startTime, endTime } = getDateRange();
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/statistics/revenue?startTime=${startTime}&endTime=${endTime}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setRevenueStats({
        ...mockRevenueStats,
        startTime,
        endTime
      });
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      toast.error('Không thể tải thống kê doanh thu');
    }
  };

  const fetchComplaintStats = async () => {
    try {
      const { startTime, endTime } = getDateRange();
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/statistics/complaints?startTime=${startTime}&endTime=${endTime}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setComplaintStats(mockComplaintStats);
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
      toast.error('Không thể tải thống kê khiếu nại');
    }
  };

  const fetchAllStats = async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchRentalStats(),
      fetchRevenueStats(),
      fetchComplaintStats()
    ]);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    toast.success('Đang chuẩn bị xuất báo cáo...');
  };

  // Calculate performance metrics
  const performanceMetrics = {
    rentalSuccessRate: rentalStats.total_rentals ? 
      Math.round((rentalStats.completed / rentalStats.total_rentals) * 100) : 0,
    avgRevenuePerRental: revenueStats.rentals_count ? 
      Math.round(revenueStats.total_revenue / revenueStats.rentals_count) : 0,
    complaintResolutionRate: complaintStats.total_complaints ? 
      Math.round(((complaintStats.resolved + complaintStats.rejected) / complaintStats.total_complaints) * 100) : 0,
    vehicleUtilizationRate: dashboardStats.total_vehicles ? 
      Math.round((dashboardStats.active_rentals / dashboardStats.total_vehicles) * 100) : 0
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  // Re-fetch data when date range changes
  useEffect(() => {
    if (dateRange !== 'custom' || (customStartDate && customEndDate)) {
      fetchAllStats();
    }
  }, [dateRange, customStartDate, customEndDate]);

  if (loading && Object.keys(dashboardStats).length === 0) {
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
          <h1 className="text-3xl font-bold tracking-tight">Thống kê & Báo cáo</h1>
          <p className="text-muted-foreground">
            Xem báo cáo doanh thu, hiệu suất và thống kê hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAllStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn thời gian báo cáo</CardTitle>
          <CardDescription>
            Lọc dữ liệu theo khoảng thời gian mong muốn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="this_week">Tuần này</SelectItem>
                <SelectItem value="this_month">Tháng này</SelectItem>
                <SelectItem value="last_month">Tháng trước</SelectItem>
                <SelectItem value="custom">Tùy chọn</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <Label>Từ:</Label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-40"
                />
                <Label>Đến:</Label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="rentals">Thuê xe</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="complaints">Khiếu nại</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Overview Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.total_users}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.total_renters} khách thuê, {dashboardStats.total_staff} nhân viên
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hệ thống</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.total_stations}</div>
                <p className="text-xs text-muted-foreground">
                  Trạm với {dashboardStats.total_vehicles} xe
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                <Car className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.active_rentals}</div>
                <p className="text-xs text-muted-foreground">
                  Lượt thuê đang diễn ra
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardStats.revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Trong khoảng thời gian đã chọn
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.rentalSuccessRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Lượt thuê hoàn thành
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu TB/lượt</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(performanceMetrics.avgRevenuePerRental)}</div>
                <p className="text-xs text-muted-foreground">
                  Trung bình mỗi lượt thuê
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Giải quyết khiếu nại</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.complaintResolutionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Tỷ lệ xử lý thành công
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sử dụng xe</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.vehicleUtilizationRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Tỷ lệ xe đang hoạt động
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Station Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất theo trạm</CardTitle>
              <CardDescription>
                Thống kê lượt thuê và doanh thu theo từng trạm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockHistoricalData.station_performance.map((station, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{station.station}</div>
                        <div className="text-sm text-muted-foreground">
                          Sử dụng {station.utilization}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{station.rentals} lượt thuê</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(station.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rentals Tab */}
        <TabsContent value="rentals" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng lượt thuê</CardTitle>
                <Car className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentalStats.total_rentals}</div>
                <p className="text-xs text-muted-foreground">
                  Trong khoảng thời gian đã chọn
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentalStats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {rentalStats.total_rentals ? Math.round((rentalStats.completed / rentalStats.total_rentals) * 100) : 0}% tổng số
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                <X className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentalStats.cancelled}</div>
                <p className="text-xs text-muted-foreground">
                  {rentalStats.total_rentals ? Math.round((rentalStats.cancelled / rentalStats.total_rentals) * 100) : 0}% tổng số
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Xu hướng thuê xe theo ngày</CardTitle>
              <CardDescription>
                Biểu đồ lượt thuê và doanh thu 7 ngày gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Biểu đồ xu hướng sẽ hiển thị ở đây</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    {mockHistoricalData.daily_revenue.slice(0, 3).map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="font-medium">{new Date(day.date).toLocaleDateString('vi-VN')}</div>
                        <div className="text-muted-foreground">{day.rentals} lượt</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueStats.total_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Từ {revenueStats.rentals_count} lượt thuê
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu trung bình</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(revenueStats.rentals_count ? revenueStats.total_revenue / revenueStats.rentals_count : 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Mỗi lượt thuê
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Phân tích doanh thu</CardTitle>
              <CardDescription>
                Chi tiết doanh thu theo thời gian và khu vực
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(mockHistoricalData.daily_revenue.reduce((sum, day) => sum + day.revenue, 0) / 7)}
                    </div>
                    <div className="text-sm text-muted-foreground">Doanh thu TB/ngày</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(mockHistoricalData.daily_revenue.reduce((sum, day) => sum + day.rentals, 0) / 7)}
                    </div>
                    <div className="text-sm text-muted-foreground">Lượt thuê TB/ngày</div>
                  </div>
                </div>
                
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Biểu đồ doanh thu sẽ hiển thị ở đây</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng khiếu nại</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complaintStats.total_complaints}</div>
                <p className="text-xs text-muted-foreground">
                  Trong khoảng thời gian
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                <Clock className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complaintStats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Cần xử lý ngay
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complaintStats.in_progress}</div>
                <p className="text-xs text-muted-foreground">
                  Đang được xem xét
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã xử lý</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complaintStats.resolved + complaintStats.rejected}</div>
                <p className="text-xs text-muted-foreground">
                  {complaintStats.resolved} giải quyết, {complaintStats.rejected} từ chối
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố trạng thái</CardTitle>
                <CardDescription>
                  Tỷ lệ các trạng thái khiếu nại
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      <span>Chờ xử lý</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{complaintStats.pending}</span>
                      <Badge variant="destructive">
                        {complaintStats.total_complaints ? Math.round((complaintStats.pending / complaintStats.total_complaints) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span>Đang xử lý</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{complaintStats.in_progress}</span>
                      <Badge variant="outline">
                        {complaintStats.total_complaints ? Math.round((complaintStats.in_progress / complaintStats.total_complaints) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Đã giải quyết</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{complaintStats.resolved}</span>
                      <Badge variant="default">
                        {complaintStats.total_complaints ? Math.round((complaintStats.resolved / complaintStats.total_complaints) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-gray-600" />
                      <span>Từ chối</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{complaintStats.rejected}</span>
                      <Badge variant="secondary">
                        {complaintStats.total_complaints ? Math.round((complaintStats.rejected / complaintStats.total_complaints) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiệu suất xử lý</CardTitle>
                <CardDescription>
                  Đánh giá chất lượng xử lý khiếu nại
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {performanceMetrics.complaintResolutionRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Tỷ lệ giải quyết thành công</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-700">{complaintStats.resolved}</div>
                      <div className="text-green-600">Giải quyết</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-gray-700">{complaintStats.rejected}</div>
                      <div className="text-gray-600">Từ chối</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAndStatistics;