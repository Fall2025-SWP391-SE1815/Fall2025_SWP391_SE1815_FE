import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    revenueByStation: []
  });

  // Date range for revenue filtering
  const [dateRange, setDateRange] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Default 30 days

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load revenue data on component mount
  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

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
        dashboardService.getRevenueData(dateRange).catch(err => {
          console.error('Revenue data error:', err);
          console.error('Revenue API Error Details:', err);

          // Return safe fallback data
          const fallbackData = {
            totalRevenue: 0,
            revenueByStation: []
          };

          // If it's an auth error, show specific message
          if (err.message && err.message.includes('403')) {
            setError('Lỗi xác thực: Vui lòng đăng nhập lại');
          }

          return fallbackData;
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

  // Load revenue data separately with date range
  const loadRevenueData = async (customDateRange = null) => {
    try {
      setLoadingRevenue(true);
      const rangeToUse = customDateRange || dateRange;

      const revenueDataResponse = await dashboardService.getRevenueData(rangeToUse);

      setRevenueData(revenueDataResponse);
    } catch (err) {
      console.error('Error loading revenue data:', err);
      setRevenueData({
        totalRevenue: 0,
        revenueByStation: []
      });
    } finally {
      setLoadingRevenue(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (field, value) => {
    const newDateRange = {
      ...dateRange,
      [field]: value
    };
    setDateRange(newDateRange);
  };

  // Apply date filter
  const applyDateFilter = () => {
    loadRevenueData(dateRange);
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
            title="Khiếu nại chờ xử lý"
            value={stats.pendingComplaints}
            icon={MessageSquare}
            color="bg-red-500"
          />
        </div>

        {/* Revenue Report Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Báo cáo Doanh thu</h2>

            {/* Date Range Picker */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="startDate" className="text-sm font-medium">Từ:</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="endDate" className="text-sm font-medium">Đến:</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-36"
                />
              </div>
              <Button
                onClick={applyDateFilter}
                disabled={loadingRevenue}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {loadingRevenue ? 'Đang tải...' : 'Áp dụng'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Revenue Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium text-gray-800">Tổng Doanh thu</CardTitle>
                <CardDescription>Tổng doanh thu từ tất cả các trạm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  {loading || loadingRevenue ? (
                    <div className="animate-pulse bg-gray-200 h-12 w-40 rounded"></div>
                  ) : (
                    `${revenueData.totalRevenue.toLocaleString()} VNĐ`
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  Từ {(revenueData.revenueByStation || []).length} trạm hoạt động
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Station */}
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo Trạm</CardTitle>
                <CardDescription>Chi tiết doanh thu từng trạm</CardDescription>
              </CardHeader>
              <CardContent>
                {loading || loadingRevenue ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                        <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (revenueData.revenueByStation || []).length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {(revenueData.revenueByStation || []).map((station, index) => {
                      const stationName = Object.keys(station)[0];
                      const revenue = station[stationName];
                      const percentage = revenueData.totalRevenue > 0 ? ((revenue / revenueData.totalRevenue) * 100).toFixed(1) : 0;

                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <div>
                              <div className="font-medium text-gray-900">{stationName}</div>
                              <div className="text-xs text-gray-500">{percentage}% tổng doanh thu</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              {revenue.toLocaleString()} VNĐ
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có dữ liệu doanh thu theo trạm</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Revenue Statistics */}
          {(revenueData.revenueByStation || []).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Thống kê Doanh thu</CardTitle>
                <CardDescription>Phân tích chi tiết doanh thu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(revenueData.revenueByStation || []).length}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Trạm có doanh thu</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(revenueData.revenueByStation || []).length > 0
                        ? Math.round(revenueData.totalRevenue / (revenueData.revenueByStation || []).length).toLocaleString()
                        : 0
                      } VNĐ
                    </div>
                    <div className="text-sm text-green-600 font-medium">Doanh thu TB/Trạm</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(revenueData.revenueByStation || []).length > 0
                        ? Math.max(...(revenueData.revenueByStation || []).map(station => Object.values(station)[0] || 0)).toLocaleString()
                        : 0
                      } VNĐ
                    </div>
                    <div className="text-sm text-purple-600 font-medium">Trạm có doanh thu cao nhất</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;