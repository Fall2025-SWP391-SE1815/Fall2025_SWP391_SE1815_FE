import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth.jsx';
import { Button } from '@/components/ui/button';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Trash2, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import documentService from '@/services/documents/documentService.js';
import authService from '@/services/auth/authService.js';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const name = user?.fullName || 'Người dùng';
  const email = user?.email || 'Không có email';
  const phone = user?.phone || 'Không có số điện thoại';

  // Documents state (fetched from API)
  const [docs, setDocs] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [uploadNumber, setUploadNumber] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Change password state
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoadingDocs(true);
      setError('');
      const res = await documentService.getAll();
      // API trả về array trực tiếp hoặc trong data property
      const data = Array.isArray(res) ? res : (res?.data || []);
      setDocs(data);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Không thể tải tài liệu.');
      setDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };



  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setError('');
    try {
      const metadata = { type: uploadType || 'CMND', documentNumber: uploadNumber || '' };
      const res = await documentService.upload(uploadFile, metadata);
      const newDoc = res?.data || res;
      
      // API trả về document object, thêm vào đầu danh sách
      if (newDoc) {
        setDocs(prev => [newDoc, ...prev]);
        setUploadFile(null);
        setUploadType('');
        setUploadNumber('');
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Không thể tải tài liệu lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    setError('');
    try {
      await documentService.delete(id);
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
      setError('Không thể xóa tài liệu.');
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    setPasswordError('');
    
    // Validation
    if (!changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmNewPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (changePasswordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (changePasswordData.currentPassword === changePasswordData.newPassword) {
      setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword(
        changePasswordData.currentPassword,
        changePasswordData.newPassword,
        changePasswordData.confirmNewPassword
      );
      
      // Reset form
      setChangePasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Đổi mật khẩu thành công
          </div>
        ),
        description: 'Mật khẩu của bạn đã được cập nhật thành công.',
        className: 'border-l-green-500 border-green-200 bg-green-50',
        duration: 5000
      });
    } catch (err) {
      console.error('Change password error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể đổi mật khẩu';
      setPasswordError(errorMessage);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Đổi mật khẩu thất bại
          </div>
        ),
        description: errorMessage,
        variant: 'destructive',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 5000
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setChangePasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Họ và tên</label>
                    <div className="text-lg font-semibold text-gray-900">{name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Email</label>
                    <div className="text-sm text-gray-700">{email}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Số điện thoại</label>
                    <div className="text-sm text-gray-700">{phone}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-gray-600" />
                  <CardTitle>Đổi mật khẩu</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                      {passwordError}
                    </div>
                  )}
                  
                  {/* Current Password */}
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm font-medium">Mật khẩu hiện tại</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={changePasswordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium">Mật khẩu mới</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={changePasswordData.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <Label htmlFor="confirmNewPassword" className="text-sm font-medium">Xác nhận mật khẩu mới</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmNewPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={changePasswordData.confirmNewPassword}
                        onChange={(e) => handlePasswordInputChange('confirmNewPassword', e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmNewPassword}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Documents Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quản lý Tài liệu</CardTitle>
                  <div className="text-sm text-gray-500">Tải lên và quản lý tài liệu xác thực</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload area */}
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="grid grid-rows-1 sm:grid-rows-2 lg:grid-rows-3 gap-4">
                      <div>
                        <Label htmlFor="docType" className="text-sm font-medium">Loại tài liệu</Label>
                        <Input
                          id="docType"
                          value={uploadType}
                          onChange={(e) => setUploadType(e.target.value)}
                          placeholder="CMND | GPLX | Hộ chiếu"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="docNumber" className="text-sm font-medium">Số tài liệu</Label>
                        <Input
                          id="docNumber"
                          value={uploadNumber}
                          onChange={(e) => setUploadNumber(e.target.value)}
                          placeholder="123456789"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium block mb-1">Chọn tệp</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="text-sm flex-1 p-2 border rounded"
                          />
                          <Button
                            onClick={handleUpload}
                            disabled={!uploadFile || uploading}
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? 'Đang tải...' : 'Tải lên'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Documents list */}
                  <div className="space-y-3">
                    {loadingDocs ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <div>Đang tải tài liệu...</div>
                      </div>
                    ) : docs.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="mx-auto h-10 w-10 mb-2 text-gray-300" />
                        <div>Chưa có tài liệu</div>
                      </div>
                    ) : (
                      docs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {doc.type} {doc.documentNumber ? `- ${doc.documentNumber}` : ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                Tải lên: {new Date(doc.createdAt).toLocaleString('vi-VN')}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  doc.verified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {doc.verified ? '✓ Đã xác thực' : '⏳ Chờ xác thực'}
                                </span>
                                {doc.documentUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${doc.documentUrl}`, '_blank')}
                                    className="text-xs"
                                  >
                                    Xem file
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center ml-4">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(doc.id)}
                              className="flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
