import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import dashboardService from '@/services/admin/dashboardService.js';
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


const AdminDashboard = () => {
  const navigate = useNavigate();

  // Real data from APIs
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalStations: 0,
    totalStaff: 0,
    activeRentals: 0,
    totalRevenue: 0,
    pendingComplaints: 0,
    systemAlerts: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading dashboard data...');

      const [statsData, activitiesData] = await Promise.all([
        dashboardService.getDashboardStats().catch(err => {
          console.error('Stats error:', err);
          return {
            totalUsers: 0,
            totalVehicles: 0,
            totalStations: 0,
            totalStaff: 0,
            activeRentals: 0,
            totalRevenue: 0,
            pendingComplaints: 0,
            systemAlerts: 0
          };
        })
      ]);

      setStats(statsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(`Không thể tải dữ liệu dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Quản lý Nhân viên",
      description: "Thêm, sửa, xóa thông tin nhân viên",
      icon: Users,
      path: "/admin/personnel",
      color: "bg-blue-500"
    },
    {
      title: "Quản lý Xe",
      description: "Theo dõi và quản lý đội xe",
      icon: Car,
      path: "/admin/vehicles",
      color: "bg-green-500"
    },
    {
      title: "Quản lý Trạm",
      description: "Quản lý các trạm cho thuê",
      icon: MapPin,
      path: "/admin/stations",
      color: "bg-purple-500"
    },
    {
      title: "Phân công Trạm",
      description: "Phân công nhân viên cho trạm",
      icon: UserCog,
      path: "/admin/staff-stations",
      color: "bg-orange-500"
    },
    {
      title: "Theo dõi Thuê xe",
      description: "Giám sát và quản lý các giao dịch thuê",
      icon: Monitor,
      path: "/admin/monitoring",
      color: "bg-indigo-500"
    },
    {
      title: "Khiếu nại",
      description: "Xử lý khiếu nại từ khách hàng",
      icon: MessageSquare,
      path: "/admin/complaints",
      color: "bg-red-500"
    },
    {
      title: "Hiệu suất Nhân viên",
      description: "Đánh giá hiệu suất làm việc",
      icon: BarChart3,
      path: "/admin/performance",
      color: "bg-teal-500"
    }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "text-blue-600" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-600">{title}</div>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : (
                <span>{value.toLocaleString()}</span>
              )}
            </div>
            {trend && (
              <div className={`text-xs flex items-center mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, path, color }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(path)}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{title}</div>
            <div className="text-sm text-gray-600 mt-1">{description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Tổng quan hệ thống quản lý cho thuê xe</p>
            </div>
            <Button onClick={loadDashboardData} disabled={loading} variant="outline">
              {loading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng người dùng"
            value={stats.totalUsers}
            icon={Users}
            trend="up"
            trendValue="+12%"
            color="bg-blue-500"
          />
          <StatCard
            title="Tổng số xe"
            value={stats.totalVehicles}
            icon={Car}
            trend="up"
            trendValue="+5%"
            color="bg-green-500"
          />
          <StatCard
            title="Trạm hoạt động"
            value={stats.totalStations}
            icon={MapPin}
            color="bg-purple-500"
          />
          <StatCard
            title="Nhân viên"
            value={stats.totalStaff}
            icon={UserCheck}
            color="bg-orange-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Đang cho thuê"
            value={stats.activeRentals}
            icon={Activity}
            trend="up"
            trendValue="+8%"
            color="bg-indigo-500"
          />
          <StatCard
            title="Doanh thu (VND)"
            value={stats.totalRevenue}
            icon={DollarSign}
            trend="up"
            trendValue="+15%"
            color="bg-emerald-500"
          />
          <StatCard
            title="Khiếu nại chờ xử lý"
            value={stats.pendingComplaints}
            icon={MessageSquare}
            color="bg-red-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;