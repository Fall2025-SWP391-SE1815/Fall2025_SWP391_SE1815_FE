// Analytics Page - Statistics and reports for renter
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import renterService from '@/services/renter/renterService.js';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Car,
  Clock,
  MapPin,
  Calendar,
  Target,
  Award,
  Leaf,
  Zap,
  RefreshCw,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  Users,
  Navigation,
  Battery,
  Star,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRentals: 0,
      totalSpent: 0,
      totalDistance: 0,
      totalHours: 0,
      avgRating: 0,
      co2Saved: 0
    },
    trends: {
      monthlyRentals: [],
      monthlySpending: [],
      monthlyDistance: []
    },
    patterns: {
      favoriteHours: [],
      favoriteStations: [],
      favoriteVehicleTypes: [],
      weekdayUsage: []
    },
    achievements: [],
    comparisons: {
      vsLastMonth: {},
      vsAverage: {}
    }
  });

  const [timeRange, setTimeRange] = useState('last_6_months');
  
  // Time range options
  const timeRangeOptions = [
    { value: 'last_month', label: 'Tháng qua' },
    { value: 'last_3_months', label: '3 tháng qua' },
    { value: 'last_6_months', label: '6 tháng qua' },
    { value: 'last_year', label: 'Năm qua' },
    { value: 'all_time', label: 'Toàn thời gian' }
  ];

  // Load analytics data
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadAnalytics();
    }
  }, [isAuthenticated, user, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      // Load rental history for analysis
      const response = await renterService.rentals.getHistory(user.id);
      if (response.success) {
        processAnalytics(response.data);
      } else {
        setError('Không thể tải dữ liệu phân tích. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (rentalData) => {
    // Filter data based on time range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'last_3_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'last_6_months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = null;
    }

    const filteredData = startDate 
      ? rentalData.filter(rental => new Date(rental.start_time) >= startDate)
      : rentalData;

    // Calculate overview stats
    const overview = {
      totalRentals: filteredData.length,
      totalSpent: filteredData.reduce((sum, r) => sum + (r.total_cost || 0), 0),
      totalDistance: filteredData.reduce((sum, r) => sum + (r.distance || 0), 0),
      totalHours: filteredData.reduce((sum, r) => {
        if (r.start_time && r.end_time) {
          const start = new Date(r.start_time);
          const end = new Date(r.end_time);
          return sum + (end - start) / (1000 * 60 * 60);
        }
        return sum;
      }, 0),
      avgRating: filteredData.length > 0 
        ? filteredData.reduce((sum, r) => sum + (r.rating || 0), 0) / filteredData.length 
        : 0,
      co2Saved: filteredData.reduce((sum, r) => sum + (r.distance || 0), 0) * 0.2 // Estimate: 0.2kg CO2 per km saved
    };

    // Calculate monthly trends
    const monthlyStats = {};
    filteredData.forEach(rental => {
      const month = new Date(rental.start_time).toISOString().slice(0, 7); // YYYY-MM format
      if (!monthlyStats[month]) {
        monthlyStats[month] = { rentals: 0, spending: 0, distance: 0 };
      }
      monthlyStats[month].rentals += 1;
      monthlyStats[month].spending += rental.total_cost || 0;
      monthlyStats[month].distance += rental.distance || 0;
    });

    const trends = {
      monthlyRentals: Object.entries(monthlyStats).map(([month, stats]) => ({
        month,
        value: stats.rentals
      })),
      monthlySpending: Object.entries(monthlyStats).map(([month, stats]) => ({
        month,
        value: stats.spending
      })),
      monthlyDistance: Object.entries(monthlyStats).map(([month, stats]) => ({
        month,
        value: stats.distance
      }))
    };

    // Calculate usage patterns
    const hourlyUsage = {};
    const stationUsage = {};
    const vehicleTypeUsage = {};
    const weekdayUsage = Array(7).fill(0);

    filteredData.forEach(rental => {
      // Hour pattern
      const hour = new Date(rental.start_time).getHours();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;

      // Station pattern
      if (rental.station?.name) {
        stationUsage[rental.station.name] = (stationUsage[rental.station.name] || 0) + 1;
      }

      // Vehicle type pattern
      if (rental.vehicle?.type) {
        vehicleTypeUsage[rental.vehicle.type] = (vehicleTypeUsage[rental.vehicle.type] || 0) + 1;
      }

      // Weekday pattern
      const weekday = new Date(rental.start_time).getDay();
      weekdayUsage[weekday] += 1;
    });

    const patterns = {
      favoriteHours: Object.entries(hourlyUsage)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      favoriteStations: Object.entries(stationUsage)
        .map(([station, count]) => ({ station, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      favoriteVehicleTypes: Object.entries(vehicleTypeUsage)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      weekdayUsage: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => ({
        day,
        count: weekdayUsage[index]
      }))
    };

    // Generate achievements
    const achievements = [];
    if (overview.totalRentals >= 10) {
      achievements.push({
        title: 'Người dùng tích cực',
        description: `Đã hoàn thành ${overview.totalRentals} chuyến đi`,
        icon: '🏆',
        color: 'bg-yellow-100 text-yellow-700'
      });
    }
    if (overview.co2Saved >= 50) {
      achievements.push({
        title: 'Bảo vệ môi trường',
        description: `Đã tiết kiệm ${overview.co2Saved.toFixed(1)}kg CO₂`,
        icon: '🌱',
        color: 'bg-green-100 text-green-700'
      });
    }
    if (overview.avgRating >= 4.5) {
      achievements.push({
        title: 'Khách hàng uy tín',
        description: `Đánh giá trung bình ${overview.avgRating.toFixed(1)} sao`,
        icon: '⭐',
        color: 'bg-blue-100 text-blue-700'
      });
    }

    setAnalytics({
      overview,
      trends,
      patterns,
      achievements,
      comparisons: { vsLastMonth: {}, vsAverage: {} } // Simplified for now
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getHourLabel = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const handleExportReport = () => {
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-purple-600" />
                Thống kê & Phân tích
              </h1>
              <p className="text-gray-600 mt-1">
                Theo dõi thói quen sử dụng và hiệu quả thuê xe của bạn
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
              <Button
                variant="outline"
                onClick={loadAnalytics}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Đang tải dữ liệu thống kê...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tổng chuyến đi</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalRentals}</p>
                      <p className="text-xs text-gray-500 mt-1">Trong {timeRangeOptions.find(o => o.value === timeRange)?.label.toLowerCase()}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(analytics.overview.totalSpent)}</p>
                      <p className="text-xs text-gray-500 mt-1">Tiết kiệm so với taxi</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Quãng đường</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.overview.totalDistance)} km</p>
                      <p className="text-xs text-gray-500 mt-1">Tương đương Sài Gòn - Hà Nội</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Navigation className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Thời gian thuê</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.overview.totalHours)}h</p>
                      <p className="text-xs text-gray-500 mt-1">Trung bình {analytics.overview.totalRentals > 0 ? (analytics.overview.totalHours / analytics.overview.totalRentals).toFixed(1) : 0}h/chuyến</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">CO₂ tiết kiệm</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.overview.co2Saved.toFixed(1)} kg</p>
                      <p className="text-xs text-gray-500 mt-1">Tương đương trồng {Math.round(analytics.overview.co2Saved / 22)} cây</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Leaf className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgRating.toFixed(1)} ⭐</p>
                      <p className="text-xs text-gray-500 mt-1">Khách hàng uy tín</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            {analytics.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gold-600" />
                    Thành tích đạt được
                  </CardTitle>
                  <CardDescription>
                    Những cột mốc quan trọng trong hành trình sử dụng dịch vụ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analytics.achievements.map((achievement, index) => (
                      <div key={index} className={`p-4 rounded-lg ${achievement.color}`}>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <h3 className="font-semibold">{achievement.title}</h3>
                            <p className="text-sm opacity-80">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usage Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Favorite Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Giờ thuê xe yêu thích
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.patterns.favoriteHours.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.patterns.favoriteHours.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{getHourLabel(item.hour)}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(item.count / analytics.patterns.favoriteHours[0].count) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{item.count} lần</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                  )}
                </CardContent>
              </Card>

              {/* Favorite Stations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Trạm yêu thích
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.patterns.favoriteStations.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.patterns.favoriteStations.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{item.station}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${(item.count / analytics.patterns.favoriteStations[0].count) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Loại xe ưa dùng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.patterns.favoriteVehicleTypes.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.patterns.favoriteVehicleTypes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{item.type}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${(item.count / analytics.patterns.favoriteVehicleTypes[0].count) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                  )}
                </CardContent>
              </Card>

              {/* Weekday Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Thói quen theo ngày trong tuần
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.patterns.weekdayUsage.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.day}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ 
                                width: analytics.patterns.weekdayUsage.length > 0 
                                  ? `${(item.count / Math.max(...analytics.patterns.weekdayUsage.map(w => w.count), 1)) * 100}%` 
                                  : '0%' 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-green-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Tiếp tục hành trình xanh!</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Bạn đã có một hành trình tuyệt vời với xe điện. Hãy tiếp tục để tạo ra tác động tích cực hơn cho môi trường.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => navigate('/rental')}>
                    <Car className="h-4 w-4 mr-2" />
                    Thuê xe tiếp theo
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/renter/history')}>
                    <Activity className="h-4 w-4 mr-2" />
                    Xem lịch sử
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;