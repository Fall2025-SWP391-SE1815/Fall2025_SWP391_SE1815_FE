import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCog, Plus, Search, Filter, Edit, Trash2, Eye, Users, UserCheck, Shield } from 'lucide-react';
import userService from '@/services/users/userService.js';
import { useToast } from '@/hooks/use-toast';

const PersonnelManagement = () => {
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

  // real user data fetched from API via userService

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
  if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
  if (searchTerm) params.phone = searchTerm;
      const response = await userService.admin.getUsers(params);
      const list = response?.users || response?.data?.users || response || [];
      setUsers(list);
      // compute statistics from fetched list
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

  const fetchStatistics = async () => {
    try {
      const stats = users.reduce((acc, user) => {
        acc.total += 1;
        if (user.role === 'admin') acc.admin += 1;
        if (user.role === 'staff') acc.staff += 1;
        if (user.role === 'renter') acc.renter += 1;
        return acc;
      }, { total: 0, admin: 0, staff: 0, renter: 0 });
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
  const response = await userService.admin.createUser(formData);
      const created = response?.user || response?.data || response;
      toast({ title: 'Thành công', description: 'Đã tạo tài khoản mới thành công' });
      setShowCreateDialog(false);
      resetForm();
      await fetchUsers();
      await fetchStatistics();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Lỗi',
        description: error?.message || error?.response?.data?.message || 'Không thể tạo tài khoản mới',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateUser = async () => {
    try {
      await userService.admin.updateUser(selectedUser.id, formData);
      toast({ title: 'Thành công', description: 'Đã cập nhật thông tin thành công' });
      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
      await fetchUsers();
      await fetchStatistics();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      return;
    }

    try {
      await userService.admin.deleteUser(userId);
      toast({ title: 'Thành công', description: 'Đã xóa tài khoản thành công' });
      await fetchUsers();
      await fetchStatistics();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài khoản',
        variant: 'destructive'
      });
    }
  };

  const handleViewUser = async (user) => {
    try {
      const response = await userService.admin.getUserById(user.id);
      const payload = response?.user || response?.data || response || user;
      setSelectedUser(payload);
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

  const openEditDialog = (user) => {
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
      password: '', // Don't prefill password for security
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      'admin': { label: 'Quản trị viên', variant: 'destructive' },
      'staff': { label: 'Nhân viên', variant: 'default' },
      'renter': { label: 'Khách hàng', variant: 'secondary' }
    };
    
    const roleInfo = roleMap[role] || { label: role, variant: 'outline' };
    
    return (
      <Badge variant={roleInfo.variant}>
        {roleInfo.label}
      </Badge>
    );
  };

  // status removed from UI

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  // Re-fetch data when filters change
  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm]);

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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý nhân sự</h1>
          <p className="text-muted-foreground">
            Quản lý nhân viên và phân quyền trong hệ thống
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total}</div>
                <p className="text-xs text-muted-foreground">
                  Tất cả tài khoản
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.admin}</div>
                <p className="text-xs text-muted-foreground">
                  Cấp quản lý
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
                <UserCog className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.staff}</div>
                <p className="text-xs text-muted-foreground">
                  Nhân viên vận hành
                </p>
              </CardContent>
            </Card>
          </div>

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
          <SelectContent>
            <SelectItem value='all'>Tất cả vai trò</SelectItem>
            <SelectItem value='admin'>Quản trị viên</SelectItem>
            <SelectItem value='staff'>Nhân viên</SelectItem>
            <SelectItem value='renter'>Khách hàng</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>
                    {user.fullName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                          onClick={() => openEditDialog(user)}
                          disabled={user.role === 'renter'}
                          className={user.role === 'renter' ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && !loading && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm || (roleFilter && roleFilter !== 'all') ? 'Không tìm thấy nhân viên phù hợp' : 'Không có nhân viên nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản mới cho nhân viên hoặc quản trị viên
            </DialogDescription>
          </DialogHeader>
          
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='fullName'>Họ và tên</Label>
                <Input
                  id='fullName'
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder='Nguyễn Văn A'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder='user@company.com'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Số điện thoại</Label>
                <Input
                  id='phone'
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder='0901234567'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='password'>Mật khẩu</Label>
                <Input
                  id='password'
                  type='password'
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder='Nhập mật khẩu'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='role'>Vai trò</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='staff'>Nhân viên</SelectItem>
                    <SelectItem value='admin'>Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateUser}>
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin nhân viên
            </DialogDescription>
          </DialogHeader>
          
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='fullName'>Họ và tên</Label>
                <Input
                  id='fullName'
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder='Nguyễn Văn A'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='edit_email'>Email</Label>
                <Input
                  id='edit_email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder='user@company.com'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_phone'>Số điện thoại</Label>
                <Input
                  id='edit_phone'
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder='0901234567'
                />
              </div>
              
              <div className='space-y-2'>
                <Label htmlFor='edit_password'>Mật khẩu mới (để trống nếu không đổi)</Label>
                <Input
                  id='edit_password'
                  type='password'
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder='Nhập mật khẩu mới'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit_role'>Vai trò</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='staff'>Nhân viên</SelectItem>
                    <SelectItem value='admin'>Quản trị viên</SelectItem>
                    <SelectItem value='renter'>Khách hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowEditDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateUser}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết nhân viên</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của nhân viên
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Họ và tên</Label>
                  <p className='text-lg font-semibold'>{selectedUser.fullName}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Email</Label>
                  <p className='text-lg'>{selectedUser.email}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Số điện thoại</Label>
                  <p className='text-lg'>{selectedUser.phone}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Vai trò</Label>
                  <div className='mt-1'>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                {/* status removed */}
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>ID</Label>
                  <p className='text-lg'>{selectedUser.id}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Ngày tạo</Label>
                  <p className='text-lg'>{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Cập nhật lần cuối</Label>
                  <p className='text-lg'>{new Date(selectedUser.updatedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowViewDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonnelManagement;