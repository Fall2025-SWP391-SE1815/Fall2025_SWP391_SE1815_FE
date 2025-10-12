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
  Download, Calendar, Car, Activity, RefreshCw, 
  Clock, CheckCircle, AlertTriangle, X, MessageSquare
} from 'lucide-react';
import adminService from '@/services/admin/adminService';
import complaintsService from '@/services/complaints/complaintsService';

const ReportsAndStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('rentals');
  const [dateRange, setDateRange] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // State for different statistics
  const [rentalStats, setRentalStats] = useState({});
  const [complaintStats, setComplaintStats] = useState({});





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

  // Fetch functions using real APIs
  const fetchRentalStats = async () => {
    try {
      const { startTime, endTime } = getDateRange();
      const params = { startTime, endTime };
      
      const response = await adminService.getRentals(params);
      if (response?.data) {
        // Process rental data to create statistics
        const rentals = response.data;
        const stats = {
          total_rentals: rentals.length,
          completed: rentals.filter(r => r.status === 'completed').length,
          cancelled: rentals.filter(r => r.status === 'cancelled').length,
          active: rentals.filter(r => r.status === 'active').length,
          startTime,
          endTime
        };
        setRentalStats(stats);
      }
    } catch (error) {
      console.error('Error fetching rental stats:', error);
      toast.error('Không thể tải thống kê thuê xe');
    }
  };

  const fetchComplaintStats = async () => {
    try {
      const response = await complaintsService.getAll();
      if (response?.data) {
        const complaints = response.data;
        const stats = {
          total_complaints: complaints.length,
          pending: complaints.filter(c => c.status === 'pending').length,
          in_progress: complaints.filter(c => c.status === 'in_progress').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
          rejected: complaints.filter(c => c.status === 'rejected').length
        };
        setComplaintStats(stats);
      }
    } catch (error) {
      console.error('Error fetching complaint stats:', error);
      toast.error('Không thể tải thống kê khiếu nại');
    }
  };

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRentalStats(),
        fetchComplaintStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!rentalStats.total_rentals && !complaintStats.total_complaints) {
      toast.error('Không có dữ liệu để xuất báo cáo');
      return;
    }
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Loại thống kê,Giá trị\n";
    
    if (rentalStats.total_rentals) {
      csvContent += `Tổng lượt thuê,${rentalStats.total_rentals}\n`;
      csvContent += `Hoàn thành,${rentalStats.completed || 0}\n`;
      csvContent += `Đang hoạt động,${rentalStats.active || 0}\n`;
      csvContent += `Đã hủy,${rentalStats.cancelled || 0}\n`;
      csvContent += `Tỷ lệ thành công,${performanceMetrics.rentalSuccessRate}%\n`;
    }
    
    if (complaintStats.total_complaints) {
      csvContent += `Tổng khiếu nại,${complaintStats.total_complaints}\n`;
      csvContent += `Chờ xử lý,${complaintStats.pending || 0}\n`;
      csvContent += `Đang xử lý,${complaintStats.in_progress || 0}\n`;
      csvContent += `Đã giải quyết,${complaintStats.resolved || 0}\n`;
      csvContent += `Đã từ chối,${complaintStats.rejected || 0}\n`;
      csvContent += `Tỷ lệ giải quyết,${performanceMetrics.complaintResolutionRate}%\n`;
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Đã xuất báo cáo thành công');
  };

  // Calculate performance metrics
  const performanceMetrics = {
    rentalSuccessRate: rentalStats.total_rentals ? 
      Math.round((rentalStats.completed / rentalStats.total_rentals) * 100) : 0,
    complaintResolutionRate: complaintStats.total_complaints ? 
      Math.round(((complaintStats.resolved + complaintStats.rejected) / complaintStats.total_complaints) * 100) : 0
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rentals">Thuê xe</TabsTrigger>
          <TabsTrigger value="complaints">Khiếu nại</TabsTrigger>
        </TabsList>



        {/* Rentals Tab */}
        <TabsContent value="rentals" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng lượt thuê</CardTitle>
                <Car className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentalStats.total_rentals || 0}</div>
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
                <div className="text-2xl font-bold">{rentalStats.completed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {rentalStats.total_rentals ? Math.round((rentalStats.completed / rentalStats.total_rentals) * 100) : 0}% tổng số
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentalStats.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {rentalStats.total_rentals ? Math.round((rentalStats.active / rentalStats.total_rentals) * 100) : 0}% tổng số
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
                <X className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentalStats.cancelled || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {rentalStats.total_rentals ? Math.round((rentalStats.cancelled / rentalStats.total_rentals) * 100) : 0}% tổng số
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê hiệu suất</CardTitle>
              <CardDescription>
                Tỷ lệ thành công của các lượt thuê xe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {performanceMetrics.rentalSuccessRate}%
                </div>
                <div className="text-muted-foreground">Tỷ lệ hoàn thành thành công</div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-700">{rentalStats.completed || 0}</div>
                    <div className="text-green-600">Hoàn thành</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="font-bold text-orange-700">{rentalStats.active || 0}</div>
                    <div className="text-orange-600">Đang thuê</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="font-bold text-red-700">{rentalStats.cancelled || 0}</div>
                    <div className="text-red-600">Đã hủy</div>
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