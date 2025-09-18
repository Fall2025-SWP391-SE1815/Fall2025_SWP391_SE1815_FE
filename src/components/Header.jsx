import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Car, 
  MapPin, 
  Calendar,
  History,
  User, 
  Settings,
  Menu,
  X,
  Phone,
  Mail,
  LogIn,
  UserPlus,
  BarChart3,
  CreditCard,
  Zap
} from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock authentication state

  const navigationItems = [
    { name: 'Trang chủ', icon: Home, href: '#home' },
    { name: 'Tìm điểm thuê', icon: MapPin, href: '#locations' },
    { name: 'Đặt xe', icon: Car, href: '#booking' },
    { name: 'Lịch sử thuê', icon: History, href: '#history' },
    { name: 'Thống kê', icon: BarChart3, href: '#analytics' }
  ];

  const userMenuItems = [
    { name: 'Hồ sơ cá nhân', icon: User, href: '#profile' },
    { name: 'Thanh toán', icon: CreditCard, href: '#payment' }
  ];

  return (
    <header className="bg-white shadow-md border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95 animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center group">
              <Zap className="h-8 w-8 text-green-600 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <span className="text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-600">EV Rental</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigationItems.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-all duration-300 hover:scale-105 transform animate-in fade-in slide-in-from-top"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                {item.name}
              </a>
            ))}
          </nav>

          {/* User Actions & Contact Info */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Emergency Contact */}
            <div className="flex items-center text-sm text-gray-600 border-r pr-4 animate-in fade-in slide-in-from-right duration-700 delay-500">
              <Phone className="h-4 w-4 mr-1 animate-pulse" />
              <span>Hotline: 1900-1234</span>
            </div>

            {/* User Authentication */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right duration-700 delay-700">
                {/* User Menu Dropdown */}
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 transition-all duration-300 hover:scale-105">
                    <User className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    <span>Tài khoản</span>
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                    <div className="py-1">
                      {userMenuItems.map((item, index) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <item.icon className="h-4 w-4 mr-3 transition-transform duration-200 hover:scale-110" />
                          {item.name}
                        </a>
                      ))}
                      <div className="border-t">
                        <button 
                          onClick={() => setIsLoggedIn(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
                        >
                          <LogIn className="h-4 w-4 mr-3 transition-transform duration-200 hover:scale-110" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right duration-700 delay-700">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsLoggedIn(true)}
                  className="flex items-center space-x-2 transition-all duration-300 hover:scale-105 hover:bg-green-50"
                >
                  <LogIn className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                  <span>Đăng nhập</span>
                </Button>
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <UserPlus className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                  <span>Đăng ký</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-600 transition-all duration-300 hover:scale-110"
            >
              <div className="relative w-6 h-6">
                <Menu className={`h-6 w-6 absolute transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`} />
                <X className={`h-6 w-6 absolute transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`} />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {/* Main Navigation */}
              {navigationItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-all duration-300 hover:translate-x-2 animate-in fade-in slide-in-from-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3 transition-transform duration-300 hover:scale-110" />
                  {item.name}
                </a>
              ))}
              
              {/* User Menu Items (when logged in) */}
              {isLoggedIn && (
                <>
                  <div className="border-t pt-3 mt-3 animate-in fade-in slide-in-from-bottom duration-500 delay-500">
                    <div className="px-3 py-2 text-sm font-medium text-gray-500">
                      Tài khoản
                    </div>
                    {userMenuItems.map((item, index) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-all duration-300 hover:translate-x-2 animate-in fade-in slide-in-from-left"
                        style={{ animationDelay: `${(index + 5) * 100}ms` }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-3 transition-transform duration-300 hover:scale-110" />
                        {item.name}
                      </a>
                    ))}
                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50 rounded-md transition-all duration-300 hover:translate-x-2 animate-in fade-in slide-in-from-left delay-700"
                    >
                      <LogIn className="h-5 w-5 mr-3 transition-transform duration-300 hover:scale-110" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}

              {/* Login/Register buttons for mobile (when not logged in) */}
              {!isLoggedIn && (
                <div className="border-t pt-3 mt-3 space-y-2 animate-in fade-in slide-in-from-bottom duration-500 delay-500">
                  <button
                    onClick={() => {
                      setIsLoggedIn(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-all duration-300 hover:translate-x-2 animate-in fade-in slide-in-from-left delay-600"
                  >
                    <LogIn className="h-5 w-5 mr-3 transition-transform duration-300 hover:scale-110" />
                    Đăng nhập
                  </button>
                  <button className="flex items-center w-full px-3 py-2 text-base font-medium bg-green-600 text-white hover:bg-green-700 rounded-md transition-all duration-300 hover:translate-x-2 hover:shadow-lg animate-in fade-in slide-in-from-left delay-700">
                    <UserPlus className="h-5 w-5 mr-3 transition-transform duration-300 hover:scale-110" />
                    Đăng ký
                  </button>
                </div>
              )}

              {/* Contact Info */}
              <div className="pt-3 border-t mt-3 animate-in fade-in slide-in-from-bottom duration-500 delay-800">
                <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Hotline: 1900-1234</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;