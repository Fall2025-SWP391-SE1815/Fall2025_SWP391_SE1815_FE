'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import VehicleStatsCard from './vehicles/VehicleStatsCard';
import VehicleForm from './vehicles/VehicleForm';
import VehicleTable from './vehicles/VehicleTable';
import VehicleDetailDialog from './vehicles/VehicleDetailDialog';
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
      
      // Parse response data
      const vehiclesData = vehiclesRes?.vehicles || vehiclesRes?.data || vehiclesRes || [];
      const stationsData = stationsRes?.stations || stationsRes?.data || stationsRes || [];
      const statsData = statsRes?.data || statsRes || {};
      
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setStations(Array.isArray(stationsData) ? stationsData : []);
      
      // Use API stats instead of calculating manually
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

  const handleSave = async (values) => {
    try {
      // Format data theo API requirements
      const payload = {
        licensePlate: values.licensePlate,
        type: values.type,
        brand: values.brand,
        model: values.model,
        capacity: Number(values.capacity),
        rangePerFullCharge: Number(values.rangePerFullCharge),
        status: values.status,
        pricePerHour: Number(values.pricePerHour),
        stationId: Number(values.stationId)
      };

      console.log('Sending payload:', payload);

      if (selectedVehicle) {
        await vehicleService.admin.updateVehicle(selectedVehicle.id, payload);
        toast.success('Cập nhật phương tiện thành công');
      } else {
        await vehicleService.admin.createVehicle(payload);
        toast.success('Thêm phương tiện thành công');
      }
      setIsDialogOpen(false);
      setSelectedVehicle(null);
      fetchData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Lỗi khi lưu dữ liệu';
      toast.error(errorMsg);
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
            const vehicleData = res?.vehicle || res?.data || res || v;
            setViewVehicle(vehicleData);
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
            initialValues={selectedVehicle || {
              licensePlate: '',
              brand: '',
              model: '',
              type: '',
              status: 'available',
              capacity: '',
              rangePerFullCharge: '',
              pricePerHour: '',
              stationId: ''
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
