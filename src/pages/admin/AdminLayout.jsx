import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import {
  LayoutDashboard,
  MapPin,
  Car,
  UserCog,
  UserCheck,
  Monitor,
  Users,
  MessageSquare,
  TrendingUp,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      title: 'Quản lý người dùng dùng',
      icon: UserCog,
      path: '/admin/personnel',
      description: 'Quản lý người dùng hệ thống'
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
      title: 'Quản lý khiếu nại',
      icon: MessageSquare,
      path: '/admin/complaints',
      description: 'Xử lý khiếu nại khách hàng'
    },
    {
      title: 'Hiệu suất nhân viên',
      icon: TrendingUp,
      path: '/admin/performance',
      description: 'Theo dõi hiệu suất làm việc nhân viên'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64`}
      >
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin</h1>
                <p className="text-sm text-gray-600">{user?.fullName || user?.full_name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4 border-t bg-white flex-shrink-0">
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

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar with Toggle Button */}
        <div className="bg-white shadow-sm p-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="ml-4 text-lg font-semibold text-gray-800">
            {sidebarItems.find(item => isActive(item.path))?.title || 'Dashboard'}
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminLayout;