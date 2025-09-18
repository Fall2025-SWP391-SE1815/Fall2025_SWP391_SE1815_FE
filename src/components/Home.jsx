import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  CreditCard
} from 'lucide-react';

const Home = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');
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

  // Featured services
  const services = [
    {
      icon: Clock,
      title: 'Thuê theo giờ',
      description: 'Linh hoạt cho chuyến đi ngắn, tính phí theo giờ sử dụng',
      price: 'Từ 50,000đ/giờ',
      features: ['Check-in nhanh', 'Thanh toán linh hoạt', 'Hủy miễn phí']
    },
    {
      icon: Calendar,
      title: 'Thuê theo ngày',
      description: 'Phù hợp cho du lịch, công tác dài ngày',
      price: 'Từ 800,000đ/ngày',
      features: ['Giá ưu đãi', 'Hỗ trợ 24/7', 'Bảo hiểm toàn diện']
    },
    {
      icon: Battery,
      title: 'Thuê dài hạn',
      description: 'Tiết kiệm cho nhu cầu sử dụng thường xuyên',
      price: 'Từ 15,000,000đ/tháng',
      features: ['Giá tốt nhất', 'Bảo dưỡng miễn phí', 'Thay xe linh hoạt']
    }
  ];

  // How it works steps
  const steps = [
    {
      icon: Search,
      title: 'Tìm kiếm',
      description: 'Chọn điểm thuê và thời gian phù hợp'
    },
    {
      icon: CreditCard,
      title: 'Đặt xe',
      description: 'Chọn xe và thanh toán trực tuyến'
    },
    {
      icon: CheckCircle,
      title: 'Nhận xe',
      description: 'Check-in và bắt đầu hành trình'
    },
    {
      icon: Car,
      title: 'Trải nghiệm',
      description: 'Lái xe an toàn và thân thiện môi trường'
    }
  ];

  // Customer testimonials
  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Doanh nhân',
      content: 'Xe điện rất êm và sạch sẽ. Dịch vụ chuyên nghiệp, hỗ trợ tận tình.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Trần Thị B',
      role: 'Du khách',
      content: 'Đặt xe rất dễ dàng, giá cả hợp lý. Góp phần bảo vệ môi trường.',
      rating: 5,
      avatar: '👩‍🎓'
    },
    {
      name: 'Lê Minh C',
      role: 'Sinh viên',
      content: 'Thuê theo giờ rất tiện lợi cho sinh viên. Ứng dụng dễ sử dụng.',
      rating: 5,
      avatar: '👨‍🎓'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
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
                Trải nghiệm di chuyển xanh, sạch và tiết kiệm với hệ thống xe điện 
                hiện đại nhất Việt Nam. Đặt xe nhanh chóng, sử dụng linh hoạt.
              </p>

              {/* Quick Search */}
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-800 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap className="h-5 w-5 text-green-600 mr-2 animate-pulse" />
                  Đặt xe nhanh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="animate-in fade-in slide-in-from-left duration-500 delay-1000">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm thuê
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-green-600" />
                      <Input 
                        placeholder="Chọn điểm thuê xe"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="pl-10 transition-all duration-300 focus:scale-105"
                      />
                    </div>
                  </div>
                  <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-1200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-green-600" />
                      <Input 
                        type="datetime-local"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="pl-10 transition-all duration-300 focus:scale-105"
                      />
                    </div>
                  </div>
                  <div className="flex items-end animate-in fade-in slide-in-from-right duration-500 delay-1400">
                    <Button className="w-full bg-green-600 hover:bg-green-700 h-10 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      <Search className="h-4 w-4 mr-2 transition-transform duration-300 hover:scale-110" />
                      Tìm xe
                    </Button>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-1600">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Đặt xe ngay
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-105">
                  <Play className="mr-2 h-5 w-5 transition-transform duration-300 hover:scale-110" />
                  Xem demo
                </Button>
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className={`relative transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-8 text-white hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in fade-in slide-in-from-right duration-700 delay-1800">
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
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Dịch vụ cho thuê
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Lựa chọn gói thuê phù hợp với nhu cầu và ngân sách của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${index * 200}ms` }}>
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
                  <Button className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    Chọn gói này
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-xl text-gray-600">
              Chỉ 4 bước đơn giản để bắt đầu hành trình xanh
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

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Khách hàng nói gì
            </h2>
            <p className="text-xl text-gray-600">
              Trải nghiệm thực tế từ cộng đồng EV Rental
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-500 hover:scale-105 hover:-translate-y-2 group animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${index * 200}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current transition-transform duration-300 hover:scale-125 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic transition-colors duration-300 group-hover:text-gray-800">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="text-2xl mr-3 transition-transform duration-300 group-hover:scale-110">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-green-600">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            Sẵn sàng trải nghiệm di chuyển xanh?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            Tham gia cùng hàng nghìn người dùng đã chọn EV Rental 
            để góp phần bảo vệ môi trường
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom duration-700 delay-400">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Đăng ký ngay
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 transition-all duration-300 hover:scale-105">
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;