import React, { useState, useEffect } from 'react';
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
import staffRentalService from '@/services/staff/staffRentalService';
import vehicleService from '@/services/vehicles/vehicleService';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayStats, setTodayStats] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [maintenanceVehicles, setMaintenanceVehicles] = useState([]);

  useEffect(() => {
    // Fetch dashboard stats and tasks for staff
    const fetchDashboard = async () => {
      try {
  let stats = {};
  let pendingPaymentsArr = [];
  let maintenanceVehiclesArr = [];

        // Tính documentsToVerify
        try {
          const rentersRes = await staffRentalService.getRenters();
          const renters = Array.isArray(rentersRes) ? rentersRes : rentersRes?.data || [];
          let totalDocsToVerify = 0;
          let totalPendingPayments = 0;
          let totalVehiclesChecked = 0;
          let totalVehiclesMaintenance = 0;
          for (const renter of renters) {
            try {
              const docs = await staffRentalService.getRenterDocuments(renter.id);
              if (Array.isArray(docs) && docs.length > 0) {
                totalDocsToVerify += docs.filter(doc => !doc.verified).length;
              }
            } catch {}
          }
          // Lấy danh sách rentals để tính toán các chỉ số khác
          try {
            const rentalsRes = await staffRentalService.getRentals();
            const rentals = Array.isArray(rentalsRes) ? rentalsRes : rentalsRes?.data || [];
            // Thanh toán chờ xử lý: chỉ tính các rental có status 'waiting_for_payment'
            const pending = rentals.filter(r => r.status === 'waiting_for_payment');
            totalPendingPayments = pending.length;
            pendingPaymentsArr = pending;
            // Xe đã kiểm tra
            totalVehiclesChecked = rentals.length;
          } catch {}
          // Lấy danh sách xe staff quản lý để đếm số xe đang bảo trì
          try {
            const vehiclesRes = await vehicleService.staff.getAllStaffVehicles();
            const vehicles = Array.isArray(vehiclesRes) ? vehiclesRes : vehiclesRes?.data || [];
            const maintenance = vehicles.filter(v => v.status === 'maintenance');
            totalVehiclesMaintenance = maintenance.length;
            maintenanceVehiclesArr = maintenance;
          } catch {}
          stats.documentsToVerify = totalDocsToVerify;
          stats.pendingPayments = totalPendingPayments;
          stats.vehiclesChecked = totalVehiclesChecked;
          stats.vehiclesMaintenance = totalVehiclesMaintenance;
        } catch {}

  setTodayStats(stats);
  setPendingPayments(pendingPaymentsArr);
  setMaintenanceVehicles(maintenanceVehiclesArr);
      } catch (error) {
        setTodayStats({});
        setTaskList([]);
      }
    };
    fetchDashboard();
  }, []);

  // Staff management functions
  const staffFunctions = [
    {
      title: 'Quản lý giao - nhận xe',
      description: 'Xử lý giao xe và nhận xe từ khách hàng, lập biên bản',
      icon: Car,
      color: 'bg-blue-500',
      stats: todayStats ? `${todayStats.pendingPickups || 0} giao xe, ${todayStats.pendingReturns || 0} nhận xe` : '',
      path: '/staff/rental-management',
      urgent: todayStats ? (todayStats.pendingPickups || 0) > 5 : false
    },
    {
      title: 'Xác thực khách hàng',
      description: 'Xem và xác thực tài liệu CCCD/GPLX của khách hàng',
      icon: Shield,
      color: 'bg-green-500',
      stats: todayStats ? `${todayStats.documentsToVerify || 0} tài liệu chờ xác thực` : '',
      path: '/staff/customer-verification',
      urgent: todayStats ? (todayStats.documentsToVerify || 0) > 10 : false
    },
    {
      title: 'Thanh toán tại trạm',
      description: 'Ghi nhận thanh toán trực tiếp (tiền mặt, thẻ, ví điện tử)',
      icon: CreditCard,
      color: 'bg-purple-500',
      stats: todayStats ? `${todayStats.pendingPayments || 0} giao dịch chờ xử lý` : '',
      path: '/staff/payment-management',
      urgent: todayStats ? (todayStats.pendingPayments || 0) > 7 : false
    },
    {
      title: 'Quản lý tại điểm',
      description: 'Quản lý xe, vi phạm, sự cố và lượt thuê tại trạm',
      icon: MapPin,
      color: 'bg-orange-500',
      stats: todayStats ? `${todayStats.vehiclesChecked || 0} xe đã kiểm tra, ${todayStats.vehiclesMaintenance || 0} bảo trì` : '',
      path: '/staff/station-management',
      urgent: todayStats ? (todayStats.vehiclesMaintenance || 0) > 2 : false
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
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giao - nhận xe</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(todayStats?.pendingPickups || 0) + (todayStats?.pendingReturns || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {(todayStats?.pendingPickups || 0)} giao, {(todayStats?.pendingReturns || 0)} nhận
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xác thực tài liệu</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats?.documentsToVerify || 0}</div>
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
            <div className="text-2xl font-bold">{todayStats?.pendingPayments || 0}</div>
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
            <div className="text-2xl font-bold">{todayStats?.vehiclesChecked || 0}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats?.vehiclesMaintenance || 0} xe cần bảo trì
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Nhiệm vụ cần xử lý</CardTitle>
              <CardDescription>
                Danh sách các nhiệm vụ phát sinh từ dữ liệu thực tế
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.length === 0 && maintenanceVehicles.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Không có nhiệm vụ nào cho hôm nay.</div>
                ) : (
                  <>
                    {pendingPayments.length > 0 && (
                      <>
                        <div className="font-semibold text-base text-purple-700 mb-2">Các giao dịch chờ xử lý thanh toán</div>
                        {pendingPayments.map((rental) => (
                          <div key={rental.id} className="p-4 border rounded-lg flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">Mã giao dịch: {rental.id}</div>
                              {rental.customer && <div>Khách hàng: <span className="font-medium">{rental.customer.name || rental.customer.fullName || rental.customer.phone}</span></div>}
                              {rental.vehicle && <div>Xe: <span className="font-medium">{rental.vehicle.licensePlate || rental.vehicle.name}</span></div>}
                            </div>
                            <Button size="sm" variant="outline" onClick={() => navigate('/staff/payment-management')}>Xử lý thanh toán</Button>
                          </div>
                        ))}
                      </>
                    )}
                    {maintenanceVehicles.length > 0 && (
                      <>
                        <div className="font-semibold text-base text-orange-700 mt-6 mb-2">Các xe cần bảo trì</div>
                        {maintenanceVehicles.map((vehicle) => (
                          <div key={vehicle.id} className="p-4 border rounded-lg flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">Xe: {vehicle.licensePlate || vehicle.name}</div>
                              {vehicle.type && <div>Loại: <span className="font-medium">{vehicle.type}</span></div>}
                              {vehicle.station && <div>Trạm: <span className="font-medium">{vehicle.station.name}</span></div>}
                            </div>
                            <Button size="sm" variant="outline" onClick={() => navigate('/staff/station-management')}>Xử lý bảo trì</Button>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default StaffDashboard;