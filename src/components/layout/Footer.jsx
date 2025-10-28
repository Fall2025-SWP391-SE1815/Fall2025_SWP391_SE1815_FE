import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  MapPin,
  Phone,
  Mail,
  Zap,
  Clock,
  Shield,
  Heart,
  Leaf,
  Battery,
  Users,
  Award,
  FileText,
  HelpCircle,
  CreditCard,
  History,
  BarChart3
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Dịch vụ cho thuê',
      links: [
        { name: 'Thuê xe điện theo giờ', href: '#hourly-rental', icon: Clock },
        { name: 'Thuê xe điện theo ngày', href: '#daily-rental', icon: Clock },
        { name: 'Thuê xe dài hạn', href: '#long-term', icon: History },
        { name: 'Thuê xe du lịch', href: '#tourism', icon: MapPin }
      ]
    },
    {
      title: 'Tài khoản & Hỗ trợ',
      links: [
        { name: 'Đăng ký tài khoản', href: '#register', icon: Users },
        { name: 'Xác thực giấy tờ', href: '#verification', icon: FileText },
        { name: 'Lịch sử thuê xe', href: '#history', icon: History },
        { name: 'Thống kê cá nhân', href: '#analytics', icon: BarChart3 },
        { name: 'Câu hỏi thường gặp', href: '#faq', icon: HelpCircle }
      ]
    },
    {
      title: 'Về EV Rental',
      links: [
        { name: 'Giới thiệu', href: '#about', icon: Award },
        { name: 'Cam kết xanh', href: '#green-commitment', icon: Leaf },
        { name: 'Tin tức', href: '#news', icon: FileText },
        { name: 'Tuyển dụng', href: '#career', icon: Users },
        { name: 'Đối tác', href: '#partners', icon: Users }
      ]
    }
  ];

  const features = [
    { icon: Zap, text: '100% xe điện', description: 'Thân thiện môi trường' },
    { icon: Battery, text: 'Pin đầy 24/7', description: 'Sẵn sàng mọi lúc' },
    { icon: Shield, text: 'Bảo hiểm toàn diện', description: 'An toàn tuyệt đối' },
    { icon: Heart, text: 'Hỗ trợ tận tâm', description: 'Phục vụ chuyên nghiệp' }
  ];

  return (
    <footer className="bg-gray-900 text-white animate-in slide-in-from-bottom duration-1000">
      {/* Features Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 group animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-green-400 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white transition-colors duration-300 group-hover:text-green-400">{feature.text}</p>
                  <p className="text-xs text-gray-400 mt-1 transition-colors duration-300 group-hover:text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-left duration-700 delay-200">
            <div className="flex items-center mb-4 group">
              <Zap className="h-8 w-8 text-green-400 mr-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
              <span className="text-xl font-bold transition-colors duration-300 group-hover:text-green-400">EV Rental</span>
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed transition-colors duration-300 hover:text-gray-200">
              Hệ thống cho thuê xe điện hàng đầu Việt Nam. Chúng tôi cam kết mang đến 
              trải nghiệm di chuyển xanh, sạch và thông minh với đội xe điện hiện đại, 
              dịch vụ chuyên nghiệp 24/7.
            </p>
            
            {/* Green Commitment */}
            <div className="flex items-center mb-4 p-3 bg-green-900/30 rounded-lg border border-green-800 transition-all duration-500 hover:bg-green-900/50 hover:scale-105 hover:shadow-lg group">
              <Leaf className="h-5 w-5 text-green-400 mr-2 animate-pulse group-hover:animate-bounce" />
              <span className="text-sm text-green-300 transition-colors duration-300 group-hover:text-green-200">Cam kết 100% xe điện - Vì môi trường xanh</span>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 text-sm group transition-all duration-300 hover:translate-x-2">
                <MapPin className="h-4 w-4 mr-3 text-green-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="transition-colors duration-300 group-hover:text-white">123 Đường Lê Lợi, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center text-gray-300 text-sm group transition-all duration-300 hover:translate-x-2">
                <Phone className="h-4 w-4 mr-3 text-green-400 animate-pulse transition-transform duration-300 group-hover:scale-110" />
                <span className="transition-colors duration-300 group-hover:text-white">Hotline: 1900-1234 (24/7)</span>
              </div>
              <div className="flex items-center text-gray-300 text-sm group transition-all duration-300 hover:translate-x-2">
                <Mail className="h-4 w-4 mr-3 text-green-400 transition-transform duration-300 group-hover:scale-110" />
                <span className="transition-colors duration-300 group-hover:text-white">support@evrental.vn</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${(index + 1) * 200}ms` }}>
              <h3 className="text-white font-semibold mb-4 transition-colors duration-300 hover:text-green-400">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="flex items-center text-gray-300 hover:text-green-400 text-sm transition-all duration-300 group hover:translate-x-2"
                    >
                      <link.icon className="h-4 w-4 mr-2 text-gray-400 group-hover:text-green-400 transition-all duration-300 group-hover:scale-110" />
                      <span className="transition-colors duration-300">{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media */}
        <div className="mt-8 pt-8 border-t border-gray-800 animate-in fade-in slide-in-from-bottom duration-700 delay-1000">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-125 hover:-translate-y-1"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6 transition-transform duration-300 hover:rotate-12" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-125 hover:-translate-y-1"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6 transition-transform duration-300 hover:rotate-12" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-125 hover:-translate-y-1"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6 transition-transform duration-300 hover:rotate-12" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-125 hover:-translate-y-1"
                aria-label="Youtube"
              >
                <Youtube className="h-6 w-6 transition-transform duration-300 hover:rotate-12" />
              </a>
            </div>

            <div className="text-center md:text-right">
              <div className="text-gray-400 text-sm mb-1 transition-colors duration-300 hover:text-gray-300">
                © {currentYear} EV Rental. Tất cả quyền được bảo lưu.
              </div>
              <div className="flex items-center justify-center md:justify-end text-xs text-gray-500 group transition-all duration-300 hover:text-gray-400">
                <Leaf className="h-3 w-3 mr-1 animate-pulse group-hover:animate-bounce transition-transform duration-300 group-hover:scale-110" />
                <span>Góp phần bảo vệ môi trường</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;