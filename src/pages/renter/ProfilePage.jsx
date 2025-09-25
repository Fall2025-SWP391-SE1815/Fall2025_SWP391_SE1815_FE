// Profile Page - User profile management for renter
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import renterService from '@/services/renter/renterService.js';
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  FileText,
  CreditCard,
  Bell,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Star,
  Award,
  Activity,
  Settings,
  LogOut
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    avatar: null
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Documents state
  const [documents, setDocuments] = useState([]);

  // Settings state
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    auto_renewal: false,
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load user data
  useEffect(() => {
    if (isAuthenticated && user) {
      setProfileForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',
        avatar: user.avatar || null
      });
      loadDocuments();
      loadSettings();
    }
  }, [isAuthenticated, user]);

  const loadDocuments = async () => {
    try {
      const response = await renterService.documents.getAll(user.id);
      if (response.success) {
        const documentsData = Array.isArray(response.data) ? response.data : [];
        setDocuments(documentsData);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]); // Set empty array on error
    }
  };

  const loadSettings = async () => {
    // Mock settings for now
    setSettings({
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      auto_renewal: false,
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh'
    });
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await renterService.profile.update(user.id, profileForm);
      if (response.success) {
        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);
        updateUser(response.data);
      } else {
        setError('Không thể cập nhật thông tin. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Có lỗi xảy ra khi cập nhật thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await renterService.profile.changePassword(user.id, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      if (response.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError('Mật khẩu hiện tại không đúng.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (file, type) => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      formData.append('user_id', user.id);

      const response = await renterService.documents.upload(formData);
      if (response.success) {
        setSuccess('Tải tài liệu lên thành công!');
        loadDocuments();
      } else {
        setError('Không thể tải tài liệu lên. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Có lỗi xảy ra khi tải tài liệu lên.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDelete = async (documentId) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;

    setLoading(true);
    try {
      const response = await renterService.documents.delete(documentId);
      if (response.success) {
        setSuccess('Xóa tài liệu thành công!');
        loadDocuments();
      } else {
        setError('Không thể xóa tài liệu. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Có lỗi xảy ra khi xóa tài liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mock API call for settings update
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Cập nhật cài đặt thành công!');
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Có lỗi xảy ra khi cập nhật cài đặt.');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatusBadge = (status) => {
    const statusMap = {
      'verified': { text: 'Đã xác thực', color: 'bg-green-100 text-green-700' },
      'pending': { text: 'Chờ xét duyệt', color: 'bg-yellow-100 text-yellow-700' },
      'rejected': { text: 'Bị từ chối', color: 'bg-red-100 text-red-700' },
      'expired': { text: 'Hết hạn', color: 'bg-gray-100 text-gray-700' }
    };
    const config = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getDocumentTypeLabel = (type) => {
    const typeMap = {
      'identity_card': 'CMND/CCCD',
      'driving_license': 'Bằng lái xe',
      'passport': 'Hộ chiếu',
      'other': 'Khác'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <User className="h-6 w-6 mr-2 text-blue-600" />
                Hồ sơ cá nhân
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý thông tin và cài đặt tài khoản của bạn
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => logout()}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Alerts */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profileForm.avatar} />
                    <AvatarFallback className="text-lg">
                      {profileForm.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => document.getElementById('avatar-upload').click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                      }
                    }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{profileForm.full_name || 'Người dùng'}</h3>
                <p className="text-sm text-gray-600">{profileForm.email}</p>
                <div className="mt-4 space-y-2">
                  <Badge className="bg-blue-100 text-blue-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Tài khoản đã xác thực
                  </Badge>
                  <Badge className="bg-green-100 text-green-700">
                    <Star className="h-3 w-3 mr-1" />
                    Khách hàng VIP
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Thống kê nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Số chuyến đi</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đánh giá TB</span>
                  <span className="font-semibold">4.8 ⭐</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Thành viên từ</span>
                  <span className="font-semibold">03/2024</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Thông tin</TabsTrigger>
                <TabsTrigger value="documents">Tài liệu</TabsTrigger>
                <TabsTrigger value="security">Bảo mật</TabsTrigger>
                <TabsTrigger value="settings">Cài đặt</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Thông tin cá nhân</CardTitle>
                        <CardDescription>
                          Cập nhật thông tin để có trải nghiệm tốt hơn
                        </CardDescription>
                      </div>
                      <Button
                        variant={isEditing ? "destructive" : "outline"}
                        onClick={() => {
                          setIsEditing(!isEditing);
                          setError('');
                          setSuccess('');
                        }}
                      >
                        {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                        {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Họ và tên</Label>
                        <Input
                          id="full_name"
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="date_of_birth">Ngày sinh</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={profileForm.date_of_birth}
                          onChange={(e) => setProfileForm({...profileForm, date_of_birth: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Textarea
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                    {isEditing && (
                      <Button onClick={handleProfileUpdate} disabled={loading}>
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Lưu thay đổi
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tài liệu xác thực</CardTitle>
                    <CardDescription>
                      Tải lên các tài liệu để xác thực tài khoản
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Kéo thả tài liệu vào đây hoặc</p>
                      <Button variant="outline" onClick={() => document.getElementById('document-upload').click()}>
                        Chọn tệp
                      </Button>
                      <input
                        id="document-upload"
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleDocumentUpload(file, 'identity_card');
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Hỗ trợ: JPG, PNG, PDF (tối đa 5MB)
                      </p>
                    </div>

                    {/* Documents List */}
                    <div className="space-y-4">
                      {documents.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Chưa có tài liệu nào</p>
                        </div>
                      ) : (
                        documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-8 w-8 text-blue-600" />
                              <div>
                                <h4 className="font-medium">{getDocumentTypeLabel(doc.type)}</h4>
                                <p className="text-sm text-gray-600">
                                  Tải lên: {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getDocumentStatusBadge(doc.status)}
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDocumentDelete(doc.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Đổi mật khẩu</CardTitle>
                    <CardDescription>
                      Đảm bảo tài khoản của bạn được bảo mật
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="current_password">Mật khẩu hiện tại</Label>
                      <div className="relative">
                        <Input
                          id="current_password"
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new_password">Mật khẩu mới</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm_password">Xác nhận mật khẩu mới</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      />
                    </div>
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={loading || !passwordForm.current_password || !passwordForm.new_password}
                    >
                      {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                      Đổi mật khẩu
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cài đặt thông báo</CardTitle>
                    <CardDescription>
                      Chọn cách bạn muốn nhận thông báo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email thông báo</p>
                        <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                      </div>
                      <Button
                        variant={settings.email_notifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings({...settings, email_notifications: !settings.email_notifications})}
                      >
                        {settings.email_notifications ? 'Bật' : 'Tắt'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS thông báo</p>
                        <p className="text-sm text-gray-600">Nhận thông báo qua tin nhắn</p>
                      </div>
                      <Button
                        variant={settings.sms_notifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings({...settings, sms_notifications: !settings.sms_notifications})}
                      >
                        {settings.sms_notifications ? 'Bật' : 'Tắt'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Thông báo đẩy</p>
                        <p className="text-sm text-gray-600">Nhận thông báo trên trình duyệt</p>
                      </div>
                      <Button
                        variant={settings.push_notifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings({...settings, push_notifications: !settings.push_notifications})}
                      >
                        {settings.push_notifications ? 'Bật' : 'Tắt'}
                      </Button>
                    </div>
                    <Button onClick={handleSettingsUpdate} disabled={loading}>
                      {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
                      Lưu cài đặt
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;