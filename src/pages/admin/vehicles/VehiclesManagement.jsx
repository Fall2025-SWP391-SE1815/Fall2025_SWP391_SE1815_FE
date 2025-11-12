'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Car, CheckCircle, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import VehicleStatsCard from './VehicleStatsCard';
import VehicleForm from './VehicleForm';
import VehicleTable from './VehicleTable';
import VehicleDetailDialog from './VehicleDetailDialog';
import vehicleService from '@/services/vehicles/vehicleService.js';
import stationService from '@/services/stations/stationService.js';

export default function VehiclesManagement() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState({ totalVehicles: 0, activeVehicles: 0, monthlyRevenue: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, stationsRes, statsRes] = await Promise.all([
        vehicleService.admin.getVehicles(),
        stationService.admin.getStations(),
        vehicleService.admin.getVehicleStats()
      ]);

      const vehiclesData = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
      const stationsData = Array.isArray(stationsRes) ? stationsRes : (stationsRes?.data || []);
      const statsData = statsRes?.data || statsRes || {};

      setVehicles(vehiclesData);
      setStations(stationsData);

      // Calculate stats from actual data
      const statusCounts = vehiclesData.reduce((acc, vehicle) => {
        acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
        return acc;
      }, {});

      const totalVehicles = vehiclesData.length;
      const monthlyRevenue = vehiclesData.reduce((acc, cur) => acc + (cur.pricePerHour || 0), 0);

      setStats({
        totalVehicles,
        available: statusCounts.available || 0,
        reserved: statusCounts.reserved || 0,
        rented: statusCounts.rented || 0,
        maintenance: statusCounts.maintenance || 0,
        deleted: statusCounts.deleted || 0,
        awaiting_inspection: statusCounts.awaiting_inspection || 0,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tải dữ liệu thất bại
          </div>
        ),
        description: 'Không thể tải danh sách phương tiện. Vui lòng thử lại.',
        variant: 'destructive',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 5000
      });
    }
  };

  const handleSave = async (values, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('licensePlate', values.licensePlate);
      formData.append('type', values.type);
      formData.append('brand', values.brand);
      formData.append('model', values.model);
      formData.append('capacity', Number(values.capacity));
      formData.append('rangePerFullCharge', Number(values.rangePerFullCharge));
      formData.append('status', values.status);
      formData.append('pricePerHour', Number(values.pricePerHour));
      formData.append('stationId', Number(values.stationId));
      formData.append('batteryType', values.batteryType);
      formData.append('batteryLevel', Number(values.batteryLevel));
      formData.append('odo', Number(values.odo));
      formData.append('numberSeat', Number(values.numberSeat));
      if (imageFile) formData.append('image', imageFile);

      if (selectedVehicle) {
        await vehicleService.admin.updateVehicle(selectedVehicle.id, formData);
        toast({
          title: (
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Cập nhật phương tiện thành công!
            </div>
          ),
          description: `Đã cập nhật thông tin xe "${values.licensePlate}" - ${values.brand} ${values.model}`,
          className: 'border-l-blue-500 border-blue-200 bg-blue-50',
          duration: 3000
        });
      } else {
        await vehicleService.admin.createVehicle(formData);
        toast({
          title: (
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-green-600" />
              Thêm phương tiện thành công!
            </div>
          ),
          description: `Đã thêm xe mới "${values.licensePlate}" - ${values.brand} ${values.model}`,
          className: 'border-l-green-500 border-green-200 bg-green-50',
          duration: 4000
        });
      }

      setIsDialogOpen(false);
      setSelectedVehicle(null);
      fetchData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Lưu phương tiện thất bại
          </div>
        ),
        description: error?.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin phương tiện',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
      });
    }
  };

  const handleDelete = async (v) => {
    if (!confirm(`Xóa phương tiện ${v.licensePlate}?`)) return;
    try {
      await vehicleService.admin.deleteVehicle(v.id);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Xóa phương tiện thành công!
          </div>
        ),
        description: `Đã xóa xe "${v.licensePlate}" - ${v.brand} ${v.model} khỏi hệ thống`,
        className: 'border-l-green-500 border-green-200 bg-green-50',
        duration: 3000
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Xóa phương tiện thất bại
          </div>
        ),
        description: 'Có lỗi xảy ra khi xóa phương tiện. Vui lòng thử lại',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
      });
    }
  };

  return (
    <div className="p-4">
      <VehicleStatsCard stats={stats} />

      <div className="flex gap-2 mb-4">
        <Input placeholder="Tìm kiếm theo biển số, hãng xe, số ghế..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="available">Có sẵn</SelectItem>
            <SelectItem value="reserved">Đã đặt</SelectItem>
            <SelectItem value="rented">Đang thuê</SelectItem>
            <SelectItem value="maintenance">Bảo trì</SelectItem>
            <SelectItem value="deleted">Đã xóa</SelectItem>
            <SelectItem value="awaiting_inspection">Đang chờ kiểm tra</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => { setSelectedVehicle(null); setIsDialogOpen(true); }}>+ Thêm phương tiện</Button>
      </div>

      <VehicleTable
        vehicles={vehicles.filter((v) => {
          const searchLower = search.toLowerCase();
          const matchesSearch = (
            v.licensePlate?.toLowerCase().includes(searchLower) ||
            v.brand?.toLowerCase().includes(searchLower) ||
            v.numberSeat?.toString().includes(search) ||
            v.model?.toLowerCase().includes(searchLower) ||
            v.type?.toLowerCase().includes(searchLower)
          );

          const matchesStatus = statusFilter === 'all' || v.status === statusFilter;

          return matchesSearch && matchesStatus;
        })}
        onEdit={(v) => {
          if (v.status === 'deleted') {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Không thể chỉnh sửa
                </div>
              ),
              description: 'Không thể chỉnh sửa phương tiện đã xóa.',
              variant: 'destructive',
              className: 'border-l-yellow-500 border-yellow-200 bg-yellow-50',
              duration: 3000
            });
            return;
          }
          setSelectedVehicle(v);
          setIsDialogOpen(true);
        }}
        onDelete={(v) => {
          if (v.status === 'deleted') {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Không thể xóa
                </div>
              ),
              description: 'Phương tiện đã được xóa trước đó.',
              variant: 'destructive',
              className: 'border-l-yellow-500 border-yellow-200 bg-yellow-50',
              duration: 3000
            });
            return;
          }
          handleDelete(v);
        }}
        onView={async (v) => {
          try {
            const res = await vehicleService.admin.getVehicleById(v.id);
            setViewVehicle(res?.data || res);
            setIsDetailDialogOpen(true);
          } catch (error) {
            console.error('Error fetching vehicle details:', error);
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Tải chi tiết thất bại
                </div>
              ),
              description: 'Không thể tải thông tin chi tiết phương tiện. Vui lòng thử lại',
              className: 'border-l-red-500 border-red-200 bg-red-50',
              duration: 3000
            });
          }
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedVehicle ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</DialogTitle>
          </DialogHeader>
          <VehicleForm
            initialValues={selectedVehicle ? {
              ...selectedVehicle,
              stationId: selectedVehicle.station?.id || selectedVehicle.stationId || '',
              batteryType: selectedVehicle.batteryType || '',
              batteryLevel: selectedVehicle.batteryLevel || '',
              odo: selectedVehicle.odo || '',
              numberSeat: selectedVehicle.numberSeat || (selectedVehicle.type === 'motorbike' ? 2 : '')
            } : {
              licensePlate: '',
              brand: '',
              model: '',
              type: '',
              status: 'available',
              capacity: '',
              rangePerFullCharge: '',
              pricePerHour: '',
              stationId: '',
              batteryType: '',
              batteryLevel: 100,
              odo: 0,
              numberSeat: '',
              image: null
            }}
            onSubmit={handleSave}
            onCancel={() => setIsDialogOpen(false)}
            stations={stations}
          />
        </DialogContent>
      </Dialog>

      <VehicleDetailDialog
        vehicle={viewVehicle}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </div>
  );
}
