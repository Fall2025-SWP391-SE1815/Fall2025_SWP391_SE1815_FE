import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  MapPin, 
  Users, 
  Calendar,
  Battery,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  UserCheck,
  ArrowRight,
  FileText,
  CreditCard,
  Shield,
  Activity
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayStats, setTodayStats] = useState({
    assignedTasks: 12,
    completedTasks: 8,
    pendingMaintenance: 3,
    customerSupport: 5,
    vehiclesChecked: 15,
    stationVisits: 4,
    pendingPickups: 6,
    pendingReturns: 4,
    pendingPayments: 8,
    documentsToVerify: 12
  });

  // Staff management functions
  const staffFunctions = [
    {
      title: 'Quản lý giao - nhận xe',
      description: 'Xử lý giao xe và nhận xe từ khách hàng, lập biên bản',
      icon: Car,
      color: 'bg-blue-500',
      stats: `${todayStats.pendingPickups} giao xe, ${todayStats.pendingReturns} nhận xe`,
      path: '/staff/rental-management',
      urgent: todayStats.pendingPickups > 5
    },
    {
      title: 'Xác thực khách hàng',
      description: 'Xem và xác thực tài liệu CCCD/GPLX của khách hàng',
      icon: Shield,
      color: 'bg-green-500',
      stats: `${todayStats.documentsToVerify} tài liệu chờ xác thực`,
      path: '/staff/customer-verification',
      urgent: todayStats.documentsToVerify > 10
    },
    {
      title: 'Thanh toán tại trạm',
      description: 'Ghi nhận thanh toán trực tiếp (tiền mặt, thẻ, ví điện tử)',
      icon: CreditCard,
      color: 'bg-purple-500',
      stats: `${todayStats.pendingPayments} giao dịch chờ xử lý`,
      path: '/staff/payment-management',
      urgent: todayStats.pendingPayments > 7
    },
    {
      title: 'Quản lý tại điểm',
      description: 'Quản lý xe, vi phạm, sự cố và lượt thuê tại trạm',
      icon: MapPin,
      color: 'bg-orange-500',
      stats: `${todayStats.vehiclesChecked} xe, ${todayStats.pendingMaintenance} bảo trì`,
      path: '/staff/station-management',
      urgent: todayStats.pendingMaintenance > 2
    }
  ];

  const taskList = [
    { id: 1, type: 'maintenance', vehicle: 'EV-001', station: 'Quận 1', priority: 'high', status: 'pending' },
    { id: 2, type: 'inspection', vehicle: 'EV-023', station: 'Quận 3', priority: 'medium', status: 'in-progress' },
    { id: 3, type: 'customer-support', customer: 'Nguyễn Văn A', issue: 'Xe không khởi động', priority: 'high', status: 'pending' },
    { id: 4, type: 'cleaning', vehicle: 'EV-045', station: 'Quận 7', priority: 'low', status: 'completed' },
  ];

  const quickActions = [
    { 
      title: 'Giao xe khẩn cấp',
      description: 'Xử lý các lượt giao xe ưu tiên',
      icon: Car,
      color: 'bg-red-500',
      action: () => navigate('/staff/rental-management')
    },
    { 
      title: 'Xác thực tài liệu',
      description: 'Xác thực CCCD/GPLX khách hàng',
      icon: Shield,
      color: 'bg-blue-500',
      action: () => navigate('/staff/customer-verification')
    },
    { 
      title: 'Thanh toán chờ xử lý',
      description: 'Ghi nhận thanh toán tại trạm',
      icon: CreditCard,
      color: 'bg-green-500',
      action: () => navigate('/staff/payment-management')
    },
    { 
      title: 'Báo cáo sự cố',
      description: 'Báo cáo sự cố xe hoặc trạm',
      icon: AlertCircle,
      color: 'bg-purple-500',
      action: () => navigate('/staff/station-management')
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Nhân viên
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Chào mừng, {user?.full_name || 'Staff'} - Ca làm hôm nay
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Lịch làm việc
          </Button>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Báo cáo ca
          </Button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giao - nhận xe</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.pendingPickups + todayStats.pendingReturns}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.pendingPickups} giao, {todayStats.pendingReturns} nhận
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xác thực tài liệu</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.documentsToVerify}</div>
            <p className="text-xs text-muted-foreground">
              Tài liệu chờ xác thực
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thanh toán chờ xử lý</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Giao dịch cần ghi nhận
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xe đã kiểm tra</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.vehiclesChecked}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.pendingMaintenance} xe cần bảo trì
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Functions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chức năng quản lý</h2>
            <p className="text-gray-600">Các chức năng chính của nhân viên trạm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffFunctions.map((func, index) => (
            <Card key={index} className="relative hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(func.path)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 ${func.color} rounded-lg`}>
                    <func.icon className="h-6 w-6 text-white" />
                  </div>
                  {func.urgent && (
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {func.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {func.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{func.stats}</p>
                    {func.urgent && (
                      <p className="text-xs text-red-600 font-medium">Cần xử lý khẩn cấp</p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
              <CardDescription>
                Chức năng thường dùng trong ca làm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={action.action}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 ${action.color} rounded-lg`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Nhiệm vụ cần xử lý</CardTitle>
              <CardDescription>
                Danh sách công việc được giao trong ngày
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taskList.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(task.status)}
                          <h3 className="font-medium text-gray-900">
                            {task.type === 'maintenance' && 'Bảo trì xe'}
                            {task.type === 'inspection' && 'Kiểm tra xe'}
                            {task.type === 'customer-support' && 'Hỗ trợ khách hàng'}
                            {task.type === 'cleaning' && 'Vệ sinh xe'}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' && 'Khẩn cấp'}
                            {task.priority === 'medium' && 'Trung bình'}
                            {task.priority === 'low' && 'Thấp'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          {task.vehicle && (
                            <p>Xe: <span className="font-medium">{task.vehicle}</span></p>
                          )}
                          {task.station && (
                            <p>Trạm: <span className="font-medium">{task.station}</span></p>
                          )}
                          {task.customer && (
                            <p>Khách hàng: <span className="font-medium">{task.customer}</span></p>
                          )}
                          {task.issue && (
                            <p>Vấn đề: <span className="font-medium">{task.issue}</span></p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {task.status === 'pending' && (
                          <Button size="sm" variant="outline">
                            Bắt đầu
                          </Button>
                        )}
                        {task.status === 'in-progress' && (
                          <Button size="sm">
                            Hoàn thành
                          </Button>
                        )}
                        {task.status === 'completed' && (
                          <Button size="sm" variant="ghost" disabled>
                            Đã xong
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default StaffDashboard;