import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API_BASE_URL } from '@/lib/api/apiConfig';

const PersonnelDetailDialog = ({ isOpen, onClose, user }) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết của người dùng
          </DialogDescription>
        </DialogHeader>
        
        {user && (
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Họ và tên</Label>
                <p className='text-lg font-semibold'>{user.fullName}</p>
              </div>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Email</Label>
                <p className='text-lg'>{user.email}</p>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Số điện thoại</Label>
                <p className='text-lg'>{user.phone}</p>
              </div>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Vai trò</Label>
                <div className='mt-1'>
                  {getRoleBadge(user.role)}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>ID</Label>
                <p className='text-lg'>{user.id}</p>
              </div>
              {user.role === 'renter' && (
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Trạng thái xác minh</Label>
                  <div className='mt-1'>
                    <Badge variant={user.verified === true ? 'default' : user.verified === false ? 'destructive' : 'secondary'}>
                      {user.verified === true ? 'Đã xác minh' : user.verified === false ? 'Từ chối' : 'Chờ xác minh'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Show document information for renters */}
            {user.role === 'renter' && (
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Loại tài liệu</Label>
                  <p className='text-lg'>{user.type || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium text-muted-foreground'>Số tài liệu</Label>
                  <p className='text-lg'>{user.documentNumber || 'Chưa cập nhật'}</p>
                </div>
              </div>
            )}

            {user.role === 'renter' && user.documentUrl && (
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Tài liệu đính kèm</Label>
                <div className='mt-2 space-y-2'>
                  {/* Image preview */}
                  <div className='border rounded-md p-2 bg-gray-50'>
                    <img 
                      src={`${API_BASE_URL}${user.documentUrl}`}
                      alt='Tài liệu xác minh'
                      className='max-w-full h-auto max-h-64 object-contain mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity'
                      onClick={() => window.open(`${API_BASE_URL}${user.documentUrl}`, '_blank')}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    {/* Fallback if image fails to load */}
                    <div 
                      className='text-center py-4 text-gray-500 hidden'
                      style={{display: 'none'}}
                    >
                      <p>Không thể hiển thị ảnh</p>
                      <Button 
                        variant='outline' 
                        size='sm'
                        className='mt-2'
                        onClick={() => window.open(`${API_BASE_URL}${user.documentUrl}`, '_blank')}
                      >
                        Mở file gốc
                      </Button>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className='flex gap-2'>
                    <Button 
                      variant='outline' 
                      size='sm'
                      onClick={() => window.open(`${API_BASE_URL}${user.documentUrl}`, '_blank')}
                    >
                      Xem toàn màn hình
                    </Button>
                    <Button 
                      variant='outline' 
                      size='sm'
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `${API_BASE_URL}${user.documentUrl}`;
                        link.download = `document_${user.documentNumber || user.id}`;
                        link.click();
                      }}
                    >
                      Tải xuống
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Show verification info for renters */}
            {user.role === 'renter' && (user.verifiedAt || user.verifiedBy) && (
              <div className='grid grid-cols-2 gap-4'>
                {user.verifiedAt && (
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Ngày xác minh</Label>
                    <p className='text-lg'>{new Date(user.verifiedAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                )}
                {user.verifiedBy && (
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>Người xác minh</Label>
                    <p className='text-lg'>{user.verifiedBy}</p>
                  </div>
                )}
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Ngày tạo</Label>
                <p className='text-lg'>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Chưa cập nhật'}</p>
              </div>
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Cập nhật lần cuối</Label>
                <p className='text-lg'>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric', 
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PersonnelDetailDialog;