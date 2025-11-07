import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, ToggleLeft, ToggleRight, Eye } from 'lucide-react';

const PersonnelTable = ({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser,
  loading,
  searchTerm,
  roleFilter,
  permissions = { view: true, edit: true, delete: true }
}) => {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Họ tên</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Số điện thoại</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead>Trạng thái</TableHead>
          {(permissions.view || permissions.edit || permissions.delete) && (
            <TableHead className='text-right'>Thao tác</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
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
            <TableCell>
              {user.isActive ? (
                <Badge variant='success'>Hoạt động</Badge>
              ) : (
                <Badge variant='destructive'>Ngừng hoạt động</Badge>
              )}
            </TableCell>
            {(permissions.view || permissions.edit || permissions.delete) && (
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  {permissions.view && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onViewUser(user)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  )}
                  {permissions.edit && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onEditUser(user)}
                      disabled={user.role === 'renter'}
                      className={user.role === 'renter' ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  )}
                  {permissions.delete && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onDeleteUser(user.id)}
                      className={user.isActive ? 'hover:bg-orange-50 hover:text-orange-600' : 'hover:bg-green-50 hover:text-green-600'}
                      title={user.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                    >
                      {user.isActive ? (
                        <ToggleRight className='h-4 w-4 text-green-600' />
                      ) : (
                        <ToggleLeft className='h-4 w-4 text-orange-400' />
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PersonnelTable;