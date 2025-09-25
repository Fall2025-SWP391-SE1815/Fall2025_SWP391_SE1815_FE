import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  MapPin,
  Car,
  UserCog,
  UserCheck,
  Monitor,
  Users,
  MessageSquare,
  BarChart3,
  LogOut
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      description: 'Tổng quan hệ thống'
    },
    {
      title: 'Quản lý trạm xe & điểm thuê',
      icon: MapPin,
      path: '/admin/stations',
      description: 'Quản lý trạm xe và điểm thuê'
    },
    {
      title: 'Quản lý phương tiện',
      icon: Car,
      path: '/admin/vehicles',
      description: 'Quản lý đội xe điện'
    },
    {
      title: 'Quản lý nhân sự',
      icon: UserCog,
      path: '/admin/personnel',
      description: 'Quản lý nhân viên hệ thống'
    },
    {
      title: 'Quản lý nhân viên trạm',
      icon: UserCheck,
      path: '/admin/station-staff',
      description: 'Phân công nhân viên trạm'
    },
    {
      title: 'Giám sát hệ thống',
      icon: Monitor,
      path: '/admin/monitoring',
      description: 'Theo dõi tình trạng hệ thống'
    },
    {
      title: 'Quản lý khách hàng',
      icon: Users,
      path: '/admin/customers',
      description: 'Quản lý thông tin khách hàng'
    },
    {
      title: 'Quản lý khiếu nại',
      icon: MessageSquare,
      path: '/admin/complaints',
      description: 'Xử lý khiếu nại khách hàng'
    },
    {
      title: 'Thống kê & Báo cáo',
      icon: BarChart3,
      path: '/admin/reports',
      description: 'Báo cáo và thống kê'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quản trị hệ thống</h1>
              <p className="text-sm text-gray-600">{user?.full_name}</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t bg-white">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;