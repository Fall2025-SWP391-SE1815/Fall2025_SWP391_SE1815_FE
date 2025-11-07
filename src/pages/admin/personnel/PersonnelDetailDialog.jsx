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
              <div>
                <Label className='text-sm font-medium text-muted-foreground'>Trạng thái hoạt động</Label>
                <div className='mt-1'>
                  {user.isActive ? (
                    <Badge variant='success'>Hoạt động</Badge>
                  ) : (
                    <Badge variant='destructive'>Ngừng hoạt động</Badge>
                  )}
                </div>
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

            {/* Show all documents for renters */}
            {user.role === 'renter' && user.documents && user.documents.length > 0 && (
              <div className='space-y-4'>
                <Label className='text-sm font-medium text-muted-foreground'>
                  Tài liệu của khách hàng ({user.documents.length})
                </Label>

                {user.documents.map((doc, index) => (
                  <div key={doc.id || index} className='border rounded-lg p-4 space-y-3 bg-gray-50'>
                    {/* Document header */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Badge variant={doc.verified ? 'default' : 'secondary'}>
                          {doc.type}
                        </Badge>
                        <Badge variant={doc.verified ? 'default' : 'destructive'}>
                          {doc.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                        </Badge>
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        ID: {doc.id}
                      </span>
                    </div>

                    {/* Document info */}
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label className='text-xs font-medium text-muted-foreground'>Số tài liệu</Label>
                        <p className='text-sm font-medium'>{doc.documentNumber}</p>
                      </div>
                      {doc.createdAt && (
                        <div>
                          <Label className='text-xs font-medium text-muted-foreground'>Ngày tạo</Label>
                          <p className='text-sm'>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      )}
                    </div>

                    {/* Verified by info */}
                    {doc.verified && doc.verifiedBy && (
                      <div>
                        <Label className='text-xs font-medium text-muted-foreground'>Người xác minh</Label>
                        <p className='text-sm'>
                          {doc.verifiedBy.fullName} ({doc.verifiedBy.email})
                        </p>
                      </div>
                    )}

                    {/* Document image */}
                    {doc.documentUrl && (
                      <div className='space-y-2'>
                        <div className='border rounded-md p-2 bg-white'>
                          <img
                            src={`${API_BASE_URL}${doc.documentUrl}`}
                            alt={`${doc.type} - ${doc.documentNumber}`}
                            className='max-w-full h-auto max-h-48 object-contain mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity'
                            onClick={() => window.open(`${API_BASE_URL}${doc.documentUrl}`, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          {/* Fallback if image fails to load */}
                          <div
                            className='text-center py-4 text-gray-500 hidden'
                            style={{ display: 'none' }}
                          >
                            <p>Không thể hiển thị ảnh</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => window.open(`${API_BASE_URL}${doc.documentUrl}`, '_blank')}
                          >
                            Xem toàn màn hình
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `${API_BASE_URL}${doc.documentUrl}`;
                              link.download = `${doc.type}_${doc.documentNumber}`;
                              link.click();
                            }}
                          >
                            Tải xuống
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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