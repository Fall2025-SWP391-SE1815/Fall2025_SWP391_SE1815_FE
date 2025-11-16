import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import {
  Zap,
  MapPin,
  Calendar,
  Clock,
  Battery,
  Shield,
  Heart,
  Leaf,
  Users,
  Star,
  ArrowRight,
  Search,
  Play,
  CheckCircle,
  TrendingUp,
  Award,
  Car,
  CreditCard,
  LogIn,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Statistics data
  const stats = [
    { icon: Car, number: '500+', label: 'Xe điện', color: 'text-green-600' },
    { icon: Users, number: '10K+', label: 'Khách hàng', color: 'text-blue-600' },
    { icon: MapPin, number: '50+', label: 'Điểm thuê', color: 'text-purple-600' },
    { icon: Leaf, number: '100%', label: 'Xanh sạch', color: 'text-emerald-600' }
  ];

  // Featured services - Chỉ cho thuê theo giờ
  const services = [
    {
      icon: Clock,
      title: 'Thuê xe máy điện',
      description: 'Xe máy điện thân thiện môi trường, phù hợp di chuyển trong thành phố',
      price: 'Từ 25,000đ/giờ',
      features: ['Tiết kiệm nhiên liệu', 'Di chuyển linh hoạt', 'Dễ dàng đỗ xe']
    },
    {
      icon: Car,
      title: 'Thuê ô tô điện',
      description: 'Ô tô điện cao cấp, thoải mái cho gia đình và nhóm bạn',
      price: 'Từ 80,000đ/giờ',
      features: ['Rộng rãi thoải mái', 'Công nghệ hiện đại', 'An toàn cao']
    }
  ];

  // How it works steps - Thuê theo giờ
  const steps = [
    {
      icon: Search,
      title: 'Chọn xe & thời gian',
      description: 'Tìm xe có sẵn và đặt lịch theo giờ mong muốn'
    },
    {
      icon: CreditCard,
      title: 'Đặt cọc',
      description: 'Thanh toán tiền cọc để giữ xe'
    },
    {
      icon: CheckCircle,
      title: 'Nhận xe & sử dụng',
      description: 'Check-in tại trạm và sử dụng xe theo thời gian đã đặt'
    },
    {
      icon: Clock,
      title: 'Trả xe & thanh toán',
      description: 'Trả xe đúng giờ và thanh toán chính xác theo thời gian sử dụng'
    }
  ];

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/public/vehicles");
        const data = await res.json();
        setVehicles(data);
      } catch (error) {
        console.error("Fetch vehicles failed:", error);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleBookVehicleHome = (vehicle) => {
    const url = `/reservations?vehicle_id=${vehicle.id}&station_id=${vehicle.station?.id}`;
    window.location.href = url;

    toast.success(`Chuyển đến trang đặt chỗ cho xe ${vehicle.brand} ${vehicle.model}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Notification Section for authenticated users */}
      {isAuthenticated && (
        <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Tài khoản của bạn đã được xác thực ✓
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-white text-black hover:bg-white hover:text-blue-600"
                onClick={() => navigate('/profile')}
              >
                Quản lý tài khoản
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 py-20 lg:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center space-x-2 mb-6 animate-in fade-in slide-in-from-left duration-700">
                <Leaf className="h-6 w-6 text-green-600 animate-bounce" />
                <span className="text-green-600 font-medium">Tương lai xanh</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 animate-in fade-in slide-in-from-left duration-700 delay-200">
                Thuê xe điện
                <span className="text-green-600 block animate-in fade-in slide-in-from-left duration-700 delay-400">thông minh</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-in fade-in slide-in-from-left duration-700 delay-600">
                Thuê xe điện theo giờ - linh hoạt, tiện lợi và thân thiện môi trường.
                Tính phí chính xác theo thời gian sử dụng, phù hợp mọi chuyến đi.
              </p>

              {/* Main CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-in fade-in slide-in-from-bottom duration-700 delay-800">
                {isAuthenticated ? (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate('/reservations')}
                      className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Đặt xe ngay
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/rentals/current')}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                    >
                      <Car className="mr-2 h-5 w-5" />
                      Xe đang thuê
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate('/login')}
                      className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Đăng nhập để thuê xe
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/register')}
                      className="border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-105"
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Đăng ký tài khoản
                    </Button>
                  </>
                )}
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-3 mb-6 animate-in fade-in slide-in-from-bottom duration-700 delay-1000">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/public/stations')}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Xem trạm xe
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/public/vehicles')}
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:scale-105"
                >
                  <Car className="mr-2 h-4 w-4" />
                  Xem xe có sẵn
                </Button>
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className={`relative transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-8 text-white hover:shadow-2xl transition-all hover:scale-105 animate-in fade-in slide-in-from-right duration-700 delay-1800">
                <div className="absolute top-4 right-4 animate-bounce">
                  <Battery className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 animate-in fade-in duration-700 delay-2000">Pin đầy 24/7</h3>
                <p className="text-green-100 mb-6 animate-in fade-in duration-700 delay-2200">
                  Tất cả xe điện luôn sẵn sàng với pin đầy,
                  hệ thống sạc nhanh tại mọi điểm thuê.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-center animate-in fade-in slide-in-from-left duration-700 delay-2400">
                    <div className="text-3xl font-bold animate-pulse">100%</div>
                    <div className="text-sm text-green-100">Pin đầy</div>
                  </div>
                  <div className="text-center animate-in fade-in slide-in-from-right duration-700 delay-2600">
                    <div className="text-3xl font-bold animate-pulse">24/7</div>
                    <div className="text-sm text-green-100">Sẵn sàng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isAuthenticated && user && (
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Xin chào, {user.fullName || 'Bạn'}! 👋
              </h2>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${index * 200}ms` }}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}>
                  <stat.icon className={`h-8 w-8 ${stat.color} transition-transform duration-500 group-hover:scale-125`} />
                </div>
                <div className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-2 transition-all duration-500 group-hover:scale-110`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium transition-colors duration-300 group-hover:text-gray-800">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions for authenticated users */}
          {isAuthenticated && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => navigate('/reservations')}>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Đặt xe mới</h3>
                  <p className="text-sm text-gray-600">Tạo lịch hẹn thuê xe điện</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => navigate('/rentals/current')}>
                <CardContent className="p-6 text-center">
                  <Car className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Xe đang thuê</h3>
                  <p className="text-sm text-gray-600">Quản lý xe hiện tại</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => navigate('/history')}>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Lịch sử thuê</h3>
                  <p className="text-sm text-gray-600">Xem các chuyến đi trước</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Thuê xe điện theo giờ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tính phí chính xác theo thời gian sử dụng - linh hoạt, minh bạch và tiết kiệm
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-2 group animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${index * 200}ms` }}>
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-lg transition-all duration-300 group-hover:bg-green-200 group-hover:scale-110">
                      <service.icon className="h-6 w-6 text-green-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div>
                      <CardTitle className="text-xl transition-colors duration-300 group-hover:text-green-600">{service.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-4 transition-all duration-300 group-hover:scale-105">
                    {service.price}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 transition-all duration-300 hover:translate-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('/reservations');
                      } else {
                        navigate('/login');
                      }
                    }}
                  >
                    {isAuthenticated ? 'Đặt xe ngay' : 'Đăng nhập để thuê'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Listing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Xe có sẵn tại hệ thống
            </h2>
            <p className="text-lg text-gray-600">
              Danh sách xe đang trống – sẵn sàng cho bạn thuê ngay
            </p>
          </div>

          {loadingVehicles ? (
            <p className="text-center text-gray-500">Đang tải danh sách xe...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((v) => {
                const imgSrc = `http://localhost:8080${v.imageUrl}`;

                return (
                  <Card className="hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col">
                    {/* IMAGE FIXED */}
                    <div className="w-full aspect-[16/9] overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                      <img
                        src={imgSrc}
                        onError={(e) => { e.target.src = "/fallback.jpg"; }}
                        alt={v.model}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <CardContent className="p-4 flex flex-col gap-3 flex-grow">

                      {/* Title */}
                      <div className="font-semibold text-gray-900 text-lg">
                        {v.brand} {v.model}
                      </div>

                      <div className="text-gray-600 text-sm">
                        Biển số: <span className="font-medium">{v.licensePlate || v.license_plate}</span>
                      </div>

                      {/* Price */}
                      <div className="text-green-600 font-bold text-xl">
                        {v.pricePerHour.toLocaleString("vi-VN")} VNĐ/giờ
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Car size={14} />
                          {v.numberSeat} chỗ
                        </div>
                        <div className="flex items-center gap-1">
                          <Battery size={14} />
                          {v.batteryLevel}%
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {v.station?.name}
                        </div>
                      </div>

                      {/* 🔥 PUSH NÚT XUỐNG DƯỚI */}
                      <div className="mt-auto pt-2">
                        <Button
                          className="w-full bg-green-600 text-white hover:bg-green-700 transition-all hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();   // tránh click trúng card
                            handleBookVehicleHome(v);
                          }}
                        >
                          Đặt xe
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Thuê xe theo giờ đơn giản
            </h2>
            <p className="text-xl text-gray-600">
              4 bước để thuê xe điện theo giờ - thanh toán chính xác theo thời gian sử dụng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative group animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${index * 200}ms` }}>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-200 transform -translate-y-1/2 transition-all duration-500 group-hover:bg-green-400" />
                )}
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4 relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:bg-green-700 group-hover:shadow-lg">
                    <step.icon className="h-8 w-8 transition-transform duration-500 group-hover:scale-125" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-green-600">{step.title}</h3>
                  <p className="text-gray-600 transition-colors duration-300 group-hover:text-gray-800">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-600 to-blue-600 animate-pulse"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Zap className="h-16 w-16 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 animate-in fade-in slide-in-from-top duration-700">
            Sẵn sàng thuê xe điện theo giờ?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            Tham gia cùng hàng nghìn người dùng đã chọn thuê xe điện theo giờ -
            linh hoạt, tiết kiệm và thân thiện môi trường
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom duration-700 delay-400">
            {isAuthenticated ? (
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => navigate('/reservations')}
              >
                Bắt đầu thuê xe
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 hover:translate-x-1" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => navigate('/register')}
                >
                  Đăng ký ngay
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-green-600 hover:bg-white hover:text-green-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => navigate('/login')}
                >
                  Đã có tài khoản
                  <LogIn className="ml-2 h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;