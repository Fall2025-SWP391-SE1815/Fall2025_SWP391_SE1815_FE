'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Filter } from 'lucide-react';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
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
      const response = await userService.admin.createUser(values);
      const created = response?.user || response?.data || response;
      toast({ title: 'Thành công', description: 'Đã tạo tài khoản mới thành công' });
      setShowCreateDialog(false);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Lỗi',
        description: error?.message || error?.response?.data?.message || 'Không thể tạo tài khoản mới',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      // Remove password from payload when updating
      const { password, ...updateData } = values;
      await userService.admin.updateUser(selectedUser.id, updateData);
      toast({ title: 'Thành công', description: 'Đã cập nhật thông tin thành công' });
      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = (userId) => {
    // Find user to get more info for confirmation
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    const userName = userToDelete.fullName || userToDelete.email || `User ID ${userToDelete.id}`;

    try {
      console.log('Deleting user with ID:', userToDelete.id);
      await userService.admin.deleteUser(userToDelete.id);
      toast({
        title: 'Thành công',
        description: `Đã xóa tài khoản "${userName}" thành công`
      });
      await fetchUsers();
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);

      let errorMessage = 'Không thể xóa tài khoản';

      // Handle specific error cases
      if (error?.response?.data?.message) {
        const serverMessage = error.response.data.message.toLowerCase();
        if (serverMessage.includes('reference constraint') || serverMessage.includes('foreign key')) {
          errorMessage = 'Không thể xóa tài khoản này vì còn dữ liệu liên quan (đơn thuê, thanh toán, v.v.). Vui lòng xử lý dữ liệu liên quan trước khi xóa.';
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Không thể xóa tài khoản',
        description: errorMessage,
        variant: 'destructive'
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản "{userToDelete?.fullName || userToDelete?.email}"?
              <br />
              <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
              <br />
              <span className="text-orange-600 text-sm">
                Lưu ý: Tài khoản không thể xóa nếu trong thời gian phân công
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa tài khoản
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}