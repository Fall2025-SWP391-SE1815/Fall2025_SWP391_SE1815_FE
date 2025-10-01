'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import userService from '@/services/users/userService.js';
import { Users, UserPlus, Search, Filter, Phone, Mail, Eye, RefreshCw } from 'lucide-react';

const CustomersManagement = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [renterProfile, setRenterProfile] = useState(null);
  const [renterProfileLoading, setRenterProfileLoading] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  // Fetch danh sách khách hàng (role=renter)
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await userService.admin.getRenters();
      const list = Array.isArray(res) ? res : [];
      const norm = list.map(u => ({
        id: u.id,
        full_name: u.fullName,
        phone: u.phone,
        email: u.email,
        created_at: u.createdAt,
        verified: false,
      }));
      setCustomers(norm);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Không thể tải dữ liệu khách hàng');
    } finally {
      setLoading(false);
    }
  };

  // Fetch hồ sơ giấy tờ của khách hàng
  const fetchRenterProfile = async (customerId) => {
    try {
      setRenterProfileLoading(true);
      const res = await userService.admin.getRenterProfile(customerId);
      const profile = Array.isArray(res) && res.length > 0 ? res[0] : null;

      if (profile) {
        setRenterProfile({
          documentUrl: profile.documentUrl || null,
          type: profile.type || null,
          documentNumber: profile.documentNumber || null,
          verified: profile.verified ?? false,
          user: profile.user || {},
        });
      } else {
        setRenterProfile(null);
      }
    } catch (error) {
      console.error('Error fetching renter profile:', error);
      setRenterProfile(null);
    } finally {
      setRenterProfileLoading(false);
    }
  };

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDialog(true);
    await fetchRenterProfile(customer.id);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && customers.length === 0) {
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý khách hàng</h1>
          <p className="text-muted-foreground">Quản lý thông tin và hồ sơ khách hàng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCustomers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {/* Danh sách khách hàng */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
          <CardDescription>Danh sách người thuê xe trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4 mb-4'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm khách hàng...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map(customer => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.full_name}</div>
                    <div className="text-sm text-muted-foreground">ID: {customer.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {customer.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              {searchTerm ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng nào'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popup chi tiết khách hàng */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
            <DialogDescription>Thông tin giấy tờ và tài khoản</DialogDescription>
          </DialogHeader>

          {renterProfileLoading && <p className="text-sm text-muted-foreground">Đang tải hồ sơ...</p>}

          {renterProfile && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {renterProfile.documentUrl ? (
                  <img
                    src={`http://localhost:8080${renterProfile.documentUrl}`}
                    alt="document"
                    className="w-48 h-32 object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-48 h-32 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">No document</div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Loại giấy tờ</div>
                  <div className="font-medium">{renterProfile.type || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground mt-2">Số giấy tờ</div>
                  <div className="font-medium">{renterProfile.documentNumber || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground mt-2">Xác thực</div>
                  <div className="font-medium">{renterProfile.verified ? 'Đã xác thực' : 'Chưa xác thực'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Họ tên</Label>
                  <p className="text-lg font-semibold">{renterProfile.user.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">SĐT</Label>
                  <p className="text-lg">{renterProfile.user.phone}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="text-lg">{renterProfile.user.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Vai trò</Label>
                  <p className="text-lg">{renterProfile.user.role}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersManagement;
