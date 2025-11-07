import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  BarChart3
} from 'lucide-react';


const AdminDashboard = () => {

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

  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    completedRentals: 0,
    avgRentalValue: 0,
    dailyRevenueChart: [],
    topDays: [],
    topMonths: []
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

      const [statsData, revenueDataResponse] = await Promise.all([
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
        }),
        dashboardService.getRevenueData().catch(err => {
          console.error('Revenue data error:', err);
          return {
            totalRevenue: 0,
            completedRentals: 0,
            avgRentalValue: 0,
            dailyRevenueChart: [],
            topDays: [],
            topMonths: []
          };
        })
      ]);

      setStats(statsData);
      setRevenueData(revenueDataResponse);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(`Không thể tải dữ liệu dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



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

        {/* Revenue Report Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Báo cáo Doanh thu</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Summary Cards */}
            <div className="lg:col-span-1">
              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Tổng Doanh thu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {loading ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
                      ) : (
                        `${revenueData.totalRevenue.toLocaleString()} VNĐ`
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Từ {revenueData.completedRentals} giao dịch hoàn thành
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Giá trị TB/Giao dịch</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {loading ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-28 rounded"></div>
                      ) : (
                        `${Math.round(revenueData.avgRentalValue).toLocaleString()} VNĐ`
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Trung bình mỗi lần thuê xe
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Top Performance Days */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ngày có Doanh thu Cao nhất</CardTitle>
                  <CardDescription>Top 5 ngày có doanh thu tốt nhất</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                          <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : revenueData.topDays.length > 0 ? (
                    <div className="space-y-3">
                      {revenueData.topDays.map((day, index) => (
                        <div key={day.date} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">
                              {new Date(day.date).toLocaleDateString('vi-VN', {
                                weekday: 'short',
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              {day.revenue.toLocaleString()} VNĐ
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có dữ liệu doanh thu</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Monthly Revenue Chart - Placeholder for future chart implementation */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Xu hướng Doanh thu theo Tháng</CardTitle>
              <CardDescription>Doanh thu trong 12 tháng gần nhất</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
                </div>
              ) : revenueData.topMonths.length > 0 ? (
                <div className="h-64">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full">
                    {revenueData.topMonths.slice(0, 6).map((month, index) => (
                      <div key={month.month} className="flex flex-col justify-end">
                        <div className="text-center mb-2">
                          <div className="text-sm font-semibold text-gray-700">
                            {month.revenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">VNĐ</div>
                        </div>
                        <div 
                          className="bg-blue-500 rounded-t-sm flex-shrink-0"
                          style={{ 
                            height: `${Math.max(20, (month.revenue / Math.max(...revenueData.topMonths.map(m => m.revenue))) * 160)}px` 
                          }}
                        ></div>
                        <div className="text-xs text-center mt-2 text-gray-600">
                          {month.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có dữ liệu biểu đồ</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;