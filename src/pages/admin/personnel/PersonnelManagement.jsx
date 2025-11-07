'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Filter, CheckCircle, AlertTriangle, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import userService from '@/services/users/userService.js';
import PersonnelStatsCard from './PersonnelStatsCard';
import PersonnelTable from './PersonnelTable';
import PersonnelForm from './PersonnelForm';
import PersonnelDetailDialog from './PersonnelDetailDialog';

export default function PersonnelManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    admin: 0,
    staff: 0,
    renter: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter && roleFilter !== 'all') params.role = roleFilter;

      const response = await userService.admin.getUsers(params);
      const list = response?.users || response?.data?.users || response || [];
      setUsers(list);

      // Calculate statistics from fetched list
      const stats = list.reduce((acc, user) => {
        acc.total += 1;
        if (user.role === 'admin') acc.admin += 1;
        if (user.role === 'staff') acc.staff += 1;
        if (user.role === 'renter') acc.renter += 1;
        return acc;
      }, { total: 0, admin: 0, staff: 0, renter: 0 });
      setStatistics(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách nhân viên',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleCreateUser = async (values) => {
    try {
      // Check for duplicate email
      const existingEmailUser = users.find(user => 
        user.email?.toLowerCase() === values.email?.toLowerCase()
      );
      
      if (existingEmailUser) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Email đã tồn tại
            </div>
          ),
          description: `Email "${values.email}" đã được sử dụng bởi tài khoản khác. Vui lòng sử dụng email khác.`,
          variant: 'destructive',
          className: 'border-l-red-500 border-red-200 bg-red-50',
          duration: 5000
        });
        return;
      }

      // Check for duplicate phone
      const existingPhoneUser = users.find(user => 
        user.phone === values.phone
      );
      
      if (existingPhoneUser) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Số điện thoại đã tồn tại
            </div>
          ),
          description: `Số điện thoại "${values.phone}" đã được sử dụng bởi tài khoản khác. Vui lòng sử dụng số khác.`,
          variant: 'destructive',
          className: 'border-l-red-500 border-red-200 bg-red-50',
          duration: 5000
        });
        return;
      }

      const response = await userService.admin.createUser(values);
      const created = response?.user || response?.data || response;
      toast({ 
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Tạo tài khoản thành công!
          </div>
        ), 
        description: `Đã tạo tài khoản mới cho ${values.fullName} với vai trò ${values.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}`,
        className: 'border-l-green-500 border-green-200 bg-green-50',
        duration: 4000
      });
      setShowCreateDialog(false);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      
      let errorTitle = 'Tạo tài khoản thất bại';
      let errorDescription = 'Không thể tạo tài khoản mới. Vui lòng kiểm tra thông tin và thử lại.';
      
      // Check for specific duplicate errors from server
      const serverMessage = error?.response?.data?.message || error?.message || '';
      const lowerMessage = serverMessage ? serverMessage.toLowerCase() : '';
      
      if (lowerMessage.includes('email') && (lowerMessage.includes('duplicate') || lowerMessage.includes('unique') || lowerMessage.includes('already exists'))) {
        errorTitle = 'Email đã tồn tại';
        errorDescription = `Email "${values.email}" đã được sử dụng. Vui lòng chọn email khác.`;
      } else if (lowerMessage.includes('phone') && (lowerMessage.includes('duplicate') || lowerMessage.includes('unique') || lowerMessage.includes('already exists'))) {
        errorTitle = 'Số điện thoại đã tồn tại';
        errorDescription = `Số điện thoại "${values.phone}" đã được sử dụng. Vui lòng chọn số khác.`;
      } else if (serverMessage) {
        errorDescription = serverMessage;
      }
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {errorTitle}
          </div>
        ),
        description: errorDescription,
        variant: 'destructive',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 5000
      });
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      // Remove password from payload when updating
      const { password, ...updateData } = values;
      
      // Check for duplicate email (excluding current user)
      const existingEmailUser = users.find(user => 
        user.email?.toLowerCase() === updateData.email?.toLowerCase() && 
        user.id !== selectedUser.id
      );
      
      if (existingEmailUser) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Email đã tồn tại
            </div>
          ),
          description: `Email "${updateData.email}" đã được sử dụng bởi tài khoản khác. Vui lòng sử dụng email khác.`,
          variant: 'destructive',
          className: 'border-l-red-500 border-red-200 bg-red-50',
          duration: 5000
        });
        return;
      }

      // Check for duplicate phone (excluding current user)
      const existingPhoneUser = users.find(user => 
        user.phone === updateData.phone && 
        user.id !== selectedUser.id
      );
      
      if (existingPhoneUser) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Số điện thoại đã tồn tại
            </div>
          ),
          description: `Số điện thoại "${updateData.phone}" đã được sử dụng bởi tài khoản khác. Vui lòng sử dụng số khác.`,
          variant: 'destructive',
          className: 'border-l-red-500 border-red-200 bg-red-50',
          duration: 5000
        });
        return;
      }

      await userService.admin.updateUser(selectedUser.id, updateData);
      toast({ 
        title: (
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Cập nhật thành công!
          </div>
        ), 
        description: `Đã cập nhật thông tin của ${updateData.fullName}`,
        className: 'border-l-blue-500 border-blue-200 bg-blue-50',
        duration: 3000
      });
      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      
      let errorTitle = 'Cập nhật thất bại';
      let errorDescription = 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      
      // Check for specific duplicate errors from server
      const serverMessage = error?.response?.data?.message || error?.message || '';
      const lowerMessage = serverMessage ? serverMessage.toLowerCase() : '';
      
      if (lowerMessage.includes('email') && (lowerMessage.includes('duplicate') || lowerMessage.includes('unique') || lowerMessage.includes('already exists'))) {
        errorTitle = 'Email đã tồn tại';
        errorDescription = `Email "${updateData.email}" đã được sử dụng bởi tài khoản khác. Vui lòng chọn email khác.`;
      } else if (lowerMessage.includes('phone') && (lowerMessage.includes('duplicate') || lowerMessage.includes('unique') || lowerMessage.includes('already exists'))) {
        errorTitle = 'Số điện thoại đã tồn tại';
        errorDescription = `Số điện thoại "${updateData.phone}" đã được sử dụng bởi tài khoản khác. Vui lòng chọn số khác.`;
      } else if (serverMessage) {
        errorDescription = serverMessage;
      }
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {errorTitle}
          </div>
        ),
        description: errorDescription,
        variant: 'destructive',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 5000
      });
    }
  };

  const handleDeleteUser = (userId) => {
    // Find user and toggle their status instead of deleting
    const user = users.find(u => u.id === userId);
    if (user) {
      handleToggleUserStatus(user);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const userName = user.fullName || user.email || `User ID ${user.id}`;
    const currentStatus = user.isActive;
    const action = currentStatus ? 'vô hiệu hóa' : 'kích hoạt';

    try {
      console.log('Toggling user status for ID:', user.id);
      const response = await userService.admin.toggleUserStatus(user.id);
      
      // Update local state immediately with the response
      const updatedUser = response?.user || response?.data || { ...user, isActive: !currentStatus };
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? { ...u, isActive: updatedUser.isActive } : u)
      );

      toast({
        title: (
          <div className="flex items-center gap-2">
            {!currentStatus ? (
              <ToggleRight className="h-5 w-5 text-green-600" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-orange-600" />
            )}
            {!currentStatus ? 'Kích hoạt tài khoản thành công!' : 'Vô hiệu hóa tài khoản thành công!'}
          </div>
        ),
        description: `Đã ${action} tài khoản "${userName}"`,
        className: !currentStatus 
          ? 'border-l-green-500 border-green-200 bg-green-50'
          : 'border-l-orange-500 border-orange-200 bg-orange-50',
        duration: 3000
      });
    } catch (error) {
      console.error('Error toggling user status:', error);

      let errorMessage = `Không thể ${action} tài khoản`;

      // Handle specific error cases
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {`Không thể ${action} tài khoản`}
          </div>
        ),
        description: errorMessage,
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
      });
    }
  };

  const handleViewUser = async (user) => {
    try {
      // Gọi API để lấy chi tiết user
      const response = await userService.admin.getUserById(user.id);
      const userData = response?.user || response?.data || response || user;
      
      // Nếu là renter, gọi thêm API profile để lấy thông tin document
      if (user.role === 'renter') {
        try {
          const profileResponse = await userService.admin.getRenterProfile(user.id);
          
          // API trả về array các documents
          if (Array.isArray(profileResponse) && profileResponse.length > 0) {
            // Lưu toàn bộ array documents
            userData.documents = profileResponse;
            
            // Để tương thích với code cũ, set document đầu tiên (hoặc document đã verified) làm primary
            const verifiedDoc = profileResponse.find(doc => doc.verified === true);
            const primaryDoc = verifiedDoc || profileResponse[0];
            
            userData.type = primaryDoc.type;
            userData.documentNumber = primaryDoc.documentNumber;
            userData.documentUrl = primaryDoc.documentUrl;
            userData.verified = primaryDoc.verified;
            userData.verifiedBy = primaryDoc.verifiedBy;
            userData.verifiedAt = primaryDoc.createdAt;
          }
        } catch (profileError) {
          console.warn('Could not fetch renter profile, showing basic info only:', profileError);
          // Không throw error, chỉ hiển thị thông tin cơ bản
        }
      }
      
      setSelectedUser(userData);
      setShowViewDialog(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin chi tiết',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = (user) => {
    // Do not allow editing renters
    if (user.role === 'renter') {
      toast({ title: 'Không cho phép', description: 'Không thể chỉnh sửa khách hàng', variant: 'warning' });
      return;
    }

    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff'
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const filteredUsers = users.filter(user => {
    // Client-side search without delay
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.phone?.includes(searchTerm)
    );
  });

  // Re-fetch data when filters change (excluding searchTerm as it's client-side)
  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý người dùng và phân quyền trong hệ thống
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      <PersonnelStatsCard statistics={statistics} />

      <div className='flex items-center gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm kiếm nhân viên...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className='w-48'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Lọc theo vai trò' />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
            <SelectItem value='all' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Tất cả vai trò</SelectItem>
            <SelectItem value='admin' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Quản trị viên</SelectItem>
            <SelectItem value='staff' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Nhân viên</SelectItem>
            <SelectItem value='renter' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Khách hàng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
          <CardDescription>
            Quản lý thông tin nhân viên và phân quyền
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonnelTable
            users={filteredUsers}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            loading={loading}
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            permissions={{ view: true, edit: true, delete: true }}
          />

          {filteredUsers.length === 0 && !loading && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm || (roleFilter && roleFilter !== 'all') ? 'Không tìm thấy nhân viên phù hợp' : 'Không có nhân viên nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <PersonnelForm
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateUser}
        formData={formData}
        setFormData={setFormData}
        mode="create"
        allowedRoles={['staff', 'admin']}
      />

      {/* Edit User Dialog */}
      <PersonnelForm
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleUpdateUser}
        formData={formData}
        setFormData={setFormData}
        mode="edit"
        allowedRoles={['staff', 'admin', 'renter']}
      />

      {/* View User Dialog */}
      <PersonnelDetailDialog
        isOpen={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        user={selectedUser}
      />


    </div>
  );
}