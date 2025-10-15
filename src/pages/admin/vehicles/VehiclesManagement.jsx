'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import VehicleStatsCard from './VehicleStatsCard';
import VehicleForm from './VehicleForm';
import VehicleTable from './VehicleTable';
import VehicleDetailDialog from './VehicleDetailDialog';
import vehicleService from '@/services/vehicles/vehicleService.js';
import stationService from '@/services/stations/stationService.js';

export default function VehiclesManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState({ totalVehicles: 0, activeVehicles: 0, monthlyRevenue: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [viewVehicle, setViewVehicle] = useState(null);
  const [search, setSearch] = useState('');

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
      
      const totalVehicles = (statsData.available || 0) + (statsData.reserved || 0) + (statsData.rented || 0) + (statsData.maintenance || 0);
      const monthlyRevenue = vehiclesData.reduce((acc, cur) => acc + (cur.pricePerHour || 0), 0);
      
      setStats({
        totalVehicles,
        available: statsData.available || 0,
        reserved: statsData.reserved || 0,
        rented: statsData.rented || 0,
        maintenance: statsData.maintenance || 0,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
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
      if (imageFile) formData.append('image', imageFile);

      if (selectedVehicle) {
        await vehicleService.admin.updateVehicle(selectedVehicle.id, formData);
        toast.success('Cập nhật phương tiện thành công');
      } else {
        await vehicleService.admin.createVehicle(formData);
        toast.success('Thêm phương tiện thành công');
      }
      
      setIsDialogOpen(false);
      setSelectedVehicle(null);
      fetchData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    }
  };

  const handleDelete = async (v) => {
    if (!confirm(`Xóa phương tiện ${v.licensePlate}?`)) return;
    try {
      await vehicleService.admin.deleteVehicle(v.id);
      toast.success('Xóa phương tiện thành công');
      fetchData();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Lỗi khi xóa phương tiện');
    }
  };

  return (
    <div className="p-4">
      <VehicleStatsCard stats={stats} />

      <div className="flex gap-2 mb-4">
        <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => { setSelectedVehicle(null); setIsDialogOpen(true); }}>+ Thêm phương tiện</Button>
      </div>

      <VehicleTable
        vehicles={vehicles.filter((v) =>
          v.licensePlate.toLowerCase().includes(search.toLowerCase())
        )}
        onEdit={(v) => { setSelectedVehicle(v); setIsDialogOpen(true); }}
        onDelete={handleDelete}
        onView={async (v) => {
          try {
            const res = await vehicleService.admin.getVehicleById(v.id);
            setViewVehicle(res?.data || res);
            setIsDetailDialogOpen(true);
          } catch (error) {
            console.error('Error fetching vehicle details:', error);
            toast.error('Không thể tải thông tin chi tiết');
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
              stationId: selectedVehicle.station?.id || selectedVehicle.stationId || ''
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
