import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, AlertTriangle, Car } from 'lucide-react';
import staffRentalService from '@/services/staff/staffRentalService';

const IncidentViolationManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [violations, setViolations] = useState([]);
  const [rentalId, setRentalId] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    rentalId: '',
    description: '',
    fineAmount: ''
  });

  // 🟢 Lấy danh sách vi phạm theo rentalId
  const handleFetchViolations = async () => {
    if (!rentalId) {
      toast({
        variant: 'destructive',
        title: 'Thiếu ID',
        description: 'Vui lòng nhập mã thuê xe cần xem vi phạm.',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await staffRentalService.getViolations(rentalId);
      setViolations(response || []);
      if (response.length === 0) {
        toast({
          title: 'Không có vi phạm',
          description: `Không có vi phạm nào cho mã thuê xe #${rentalId}`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Lỗi tải dữ liệu',
        description: error.message || 'Không thể tải danh sách vi phạm',
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Xử lý nhập tiền phạt
  const handleFineChange = (e) => {
    let rawValue = e.target.value.replace(/\./g, ''); // bỏ dấu chấm
    if (!/^\d*$/.test(rawValue)) return; // chỉ cho số
    if (rawValue.startsWith('0') && rawValue.length > 1) rawValue = rawValue.replace(/^0+/, '');

    // format tiền có dấu chấm ngăn cách
    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setFormData({ ...formData, fineAmount: formatted });
  };

  // 🟢 Tạo mới vi phạm
  const handleCreateViolation = async () => {
    const cleanFine = Number(formData.fineAmount.replace(/\./g, '')); // bỏ dấu chấm

    if (!formData.rentalId || !formData.description || !formData.fineAmount) {
      toast({
        variant: 'destructive',
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập đầy đủ thông tin vi phạm.',
      });
      return;
    }

    if (cleanFine <= 0) {
      toast({
        variant: 'destructive',
        title: 'Số tiền không hợp lệ',
        description: 'Tiền phạt phải lớn hơn 0.',
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        rentalId: Number(formData.rentalId),
        description: formData.description,
        fineAmount: cleanFine,
      };

      await staffRentalService.addViolation(payload);

      toast({
        title: 'Thành công',
        description: 'Đã thêm vi phạm mới.',
      });

      setCreateDialogOpen(false);
      setFormData({ rentalId: '', description: '', fineAmount: '' });

      // Reload nếu đang xem cùng rental
      if (rentalId && rentalId == payload.rentalId) {
        await handleFetchViolations();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi tạo vi phạm',
        description: error.message || 'Không thể thêm vi phạm mới.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Vi Phạm Thuê Xe</h2>
          <p className="text-gray-600">
            Nhập mã thuê xe để xem và thêm vi phạm
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Thêm Vi Phạm
        </Button>
      </div>

      {/* Ô nhập rentalId */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Label htmlFor="rentalId">Nhập Mã Thuê Xe</Label>
          <Input
            id="rentalId"
            placeholder="VD: 1"
            value={rentalId}
            onChange={(e) => setRentalId(e.target.value)}
          />
        </div>
        <Button onClick={handleFetchViolations} disabled={loading}>
          {loading ? 'Đang tải...' : 'Xem Vi Phạm'}
        </Button>
      </div>

      {/* Danh sách vi phạm */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danh sách Vi Phạm {rentalId && <span className="text-sm text-gray-500">(# {rentalId})</span>}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Tiền phạt</TableHead>
                <TableHead>Xe / Biển số</TableHead>
                <TableHead>Nhân viên ghi nhận</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {violations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <span className="text-gray-500">
                        Chưa có vi phạm nào cho thuê xe này
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                violations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.id}</TableCell>
                    <TableCell>{v.description}</TableCell>
                    <TableCell>{v.fineAmount?.toLocaleString()} ₫</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        {v.rental?.vehicle?.licensePlate || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{v.staff?.fullName || '—'}</TableCell>
                    <TableCell>
                      {new Date(v.createdAt).toLocaleString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog tạo vi phạm */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Vi Phạm Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về vi phạm
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rentalIdInput">Mã Thuê Xe</Label>
              <Input
                id="rentalIdInput"
                value={formData.rentalId}
                onChange={(e) => setFormData({ ...formData, rentalId: e.target.value })}
                placeholder="VD: 1"
              />
            </div>

            <div>
              <Label htmlFor="description">Mô Tả Vi Phạm</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="VD: Xe bị xước nhẹ..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="fineAmount">Tiền Phạt (VNĐ)</Label>
              <Input
                id="fineAmount"
                value={formData.fineAmount}
                onChange={handleFineChange}
                placeholder="VD: 500.000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateViolation} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo Vi Phạm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentViolationManagement;
