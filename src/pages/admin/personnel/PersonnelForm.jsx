import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PersonnelForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  mode = 'create', // 'create' or 'edit'
  allowedRoles = ['staff', 'admin'] // roles that can be created/edited
}) => {
  const title = mode === 'create' ? 'Thêm nhân viên mới' : 'Cập nhật thông tin';
  const description = mode === 'create' 
    ? 'Tạo tài khoản mới cho nhân viên hoặc quản trị viên'
    : 'Chỉnh sửa thông tin nhân viên';
  const buttonText = mode === 'create' ? 'Tạo tài khoản' : 'Cập nhật';

  // Validation schema
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required('Họ tên là bắt buộc')
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(50, 'Họ tên không được quá 50 ký tự'),
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Email là bắt buộc'),
    phone: Yup.string()
      .required('Số điện thoại là bắt buộc')
      .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
    password: mode === 'create' 
      ? Yup.string()
          .required('Mật khẩu là bắt buộc')
          .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
          .matches(/^(?=.*[A-Za-z])(?=.*\d)/, 'Mật khẩu phải bao gồm chữ cái và số')
          .matches(/^[A-Za-z\d@$!%*?&]*$/, 'Mật khẩu chỉ được chứa chữ cái, số và ký tự đặc biệt (@$!%*?&)')
      : Yup.string(),
    role: Yup.string()
      .required('Vai trò là bắt buộc')
      .oneOf(['admin', 'staff', 'renter'], 'Vai trò không hợp lệ')
  });

  const formik = useFormik({
    initialValues: formData,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      await onSubmit(values);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={formik.handleSubmit} className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Họ và tên</Label>
              <Input
                id='fullName'
                name='fullName'
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder='Nguyễn Văn A'
                className={formik.touched.fullName && formik.errors.fullName ? 'border-red-500' : ''}
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.fullName}</p>
              )}
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder='user@company.com'
                className={formik.touched.email && formik.errors.email ? 'border-red-500' : ''}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.email}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Số điện thoại</Label>
              <Input
                id='phone'
                name='phone'
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder='0901234567'
                className={formik.touched.phone && formik.errors.phone ? 'border-red-500' : ''}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.phone}</p>
              )}
            </div>
            
            {mode === 'create' && (
              <div className='space-y-2'>
                <Label htmlFor='password'>Mật khẩu</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder='Ít nhất 8 ký tự, bao gồm chữ cái, số và có thể chứa ký tự đặc biệt'
                  className={formik.touched.password && formik.errors.password ? 'border-red-500' : ''}
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.password}</p>
                )}
              </div>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='role'>Vai trò</Label>
              <Select 
                value={formik.values.role} 
                onValueChange={(value) => formik.setFieldValue('role', value)}
              >
                <SelectTrigger className={formik.touched.role && formik.errors.role ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                  {allowedRoles.includes('staff') && <SelectItem value='staff'>Nhân viên</SelectItem>}
                  {allowedRoles.includes('admin') && <SelectItem value='admin'>Quản trị viên</SelectItem>}
                </SelectContent>
              </Select>
              {formik.touched.role && formik.errors.role && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.role}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button type='submit' disabled={formik.isSubmitting || !formik.isValid}>
              {buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonnelForm;