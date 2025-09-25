import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Car, 
  MapPin, 
  DollarSign, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Calendar,
  UserCheck,
  BarChart3,
  Monitor,
  Shield,
  UserCog
} from 'lucide-react';
import { apiClient } from '@/lib/api/apiClient';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const { toast } = useToast();
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Quick action cards configuration
  const quickActions = [
    {
      title: 'Quản lý trạm xe & điểm thuê',
      description: 'Quản lý vị trí trạm xe và điểm thuê xe trên toàn hệ thống',
      icon: MapPin,
      color: 'bg-blue-500',
      path: '/admin/stations',
      stats: dashboardData?.total_stations || 0,
      label: 'trạm hoạt động'
    },
    {
      title: 'Quản lý phương tiện',
      description: 'Quản lý đội xe điện, tình trạng và bảo trì',
      icon: Car,
      color: 'bg-green-500',
      path: '/admin/vehicles',
      stats: dashboardData?.total_vehicles || 0,
      label: 'xe trong hệ thống'
    },
    {
      title: 'Quản lý nhân sự',
      description: 'Quản lý nhân viên và phân quyền trong hệ thống',
      icon: UserCog,
      color: 'bg-purple-500',
      path: '/admin/personnel',
      stats: dashboardData?.total_staff || 0,
      label: 'nhân viên'
    },
    {
      title: 'Quản lý nhân viên trạm',
      description: 'Phân công và giám sát nhân viên tại các trạm',
      icon: UserCheck,
      color: 'bg-orange-500',
      path: '/admin/station-staff',
      stats: dashboardData?.station_staff || 0,
      label: 'nhân viên trạm'
    },
    {
      title: 'Giám sát hệ thống',
      description: 'Theo dõi tình trạng hoạt động và hiệu suất hệ thống',
      icon: Monitor,
      color: 'bg-cyan-500',
      path: '/admin/monitoring',
      stats: dashboardData?.system_status || 'Tốt',
      label: 'trạng thái hệ thống'
    },
    {
      title: 'Quản lý khách hàng',
      description: 'Quản lý thông tin và hoạt động của khách hàng',
      icon: Users,
      color: 'bg-indigo-500',
      path: '/admin/customers',
      stats: dashboardData?.total_customers || 0,
      label: 'khách hàng'
    },
    {
      title: 'Quản lý khiếu nại',
      description: 'Xử lý và theo dõi khiếu nại từ khách hàng',
      icon: MessageSquare,
      color: 'bg-red-500',
      path: '/admin/complaints',
      stats: dashboardData?.pending_complaints || 0,
      label: 'khiếu nại chờ xử lý'
    },
    {
      title: 'Thống kê & Báo cáo',
      description: 'Xem báo cáo doanh thu, hiệu suất và thống kê hệ thống',
      icon: BarChart3,
      color: 'bg-teal-500',
      path: '/admin/reports',
      stats: formatCurrency(dashboardData?.revenue || 0),
      label: 'doanh thu tháng này'
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      let startTime, endTime = now.toISOString();
      
      switch (timeRange) {
        case 'week':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'month':
          startTime = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          break;
        case 'year':
          startTime = new Date(now.getFullYear(), 0, 1).toISOString();
          break;
        default:
          startTime = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      }

      const response = await apiClient.get('/admin/dashboard', {
        params: { startTime, endTime }
      });

      setDashboardData(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'Tuần này';
      case 'month': return 'Tháng này';
      case 'year': return 'Năm này';
      default: return 'Tháng này';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Quản trị</h1>
          <p className="text-muted-foreground">
            Hệ thống quản lý xe điện - Tổng quan điều hành
          </p>
        </div>
        
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : 'Năm'}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng trạm xe</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_stations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.active_stations || 0} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng xe điện</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_vehicles || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.available_vehicles || 0} sẵn sàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.active_customers || 0} hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu {getTimeRangeLabel()}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% so với kỳ trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Functions Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Chức năng quản lý</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(action.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {action.stats}
                  </Badge>
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {action.description}
                </p>
                <p className="text-xs font-medium text-primary">
                  {action.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Status and Alerts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hoạt động hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Thuê xe mới hôm nay</span>
                <Badge variant="default">+{dashboardData?.today_rentals || 15}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Xe đang thuê</span>
                <Badge variant="secondary">{dashboardData?.active_rentals || 48}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Trả xe hôm nay</span>
                <Badge variant="outline">+{dashboardData?.today_returns || 12}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Cảnh báo hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Xe cần bảo trì</span>
                <Badge variant="destructive">{dashboardData?.maintenance_needed || 3}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Khiếu nại chưa xử lý</span>
                <Badge variant="destructive">{dashboardData?.pending_complaints || 5}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Trạm có vấn đề</span>
                <Badge variant="destructive">{dashboardData?.problematic_stations || 1}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Thống kê nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/reports')}
              >
                Xem báo cáo chi tiết
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/monitoring')}
              >
                Giám sát thời gian thực
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/complaints')}
              >
                Xử lý khiếu nại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Hoạt động gần đây
          </CardTitle>
          <CardDescription>
            Các sự kiện quan trọng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '10:30', action: 'Khách hàng thuê xe BMW i3 tại Trạm Quận 1', type: 'rental', status: 'success' },
              { time: '10:15', action: 'Nhân viên xác nhận trả xe #VN001 tại Trạm Quận 2', type: 'return', status: 'success' },
              { time: '09:45', action: 'Cảnh báo: Xe #VN045 cần bảo trì định kỳ', type: 'maintenance', status: 'warning' },
              { time: '09:30', action: 'Khiếu nại mới: Xe bị hỏng pin tại Trạm Quận 3', type: 'complaint', status: 'error' },
              { time: '09:00', action: 'Thêm 5 xe mới vào Trạm Quận 4', type: 'vehicle', status: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                <div className="text-sm text-muted-foreground min-w-[50px]">
                  {activity.time}
                </div>
                <div className="flex-1 text-sm">
                  {activity.action}
                </div>
                <Badge 
                  variant={
                    activity.status === 'error' ? 'destructive' : 
                    activity.status === 'warning' ? 'outline' : 'default'
                  }
                  className="text-xs"
                >
                  {activity.type === 'rental' ? 'Thuê xe' :
                   activity.type === 'return' ? 'Trả xe' :
                   activity.type === 'maintenance' ? 'Bảo trì' :
                   activity.type === 'complaint' ? 'Khiếu nại' : 'Phương tiện'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;