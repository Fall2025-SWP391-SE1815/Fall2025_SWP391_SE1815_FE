'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import StationStatsCard from './stations/StationStatsCard';
import StationForm from './stations/StationForm';
import StationTable from './stations/StationTable';
import StationDetailDialog from './stations/StationDetailDialog';
import stationService from '@/services/stations/stationService.js';

export default function StationsManagement() {
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState({ totalStations: 0, activeStations: 0, maintenanceStations: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [viewStation, setViewStation] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const stationsRes = await stationService.admin.getStations();
      
      // Parse response data
      const stationsData = stationsRes?.stations || stationsRes?.data || stationsRes || [];
      
      setStations(Array.isArray(stationsData) ? stationsData : []);
      
      // Calculate stats
      setStats({
        totalStations: stationsData.length,
        activeStations: stationsData.filter((s) => s.status === 'active').length,
        maintenanceStations: stationsData.filter((s) => s.status === 'maintenance').length
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
        name: values.name,
        address: values.address,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        status: values.status
      };

      console.log('Sending payload:', payload);

      if (selectedStation) {
        await stationService.admin.updateStation(selectedStation.id, payload);
        toast.success('Cập nhật trạm thành công');
      } else {
        await stationService.admin.createStation(payload);
        toast.success('Thêm trạm thành công');
      }
      setIsDialogOpen(false);
      setSelectedStation(null);
      fetchData();
    } catch (error) {
      console.error('Error saving station:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Lỗi khi lưu dữ liệu';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (station) => {
    if (!confirm(`Xóa trạm ${station.name}?`)) return;
    try {
      await stationService.admin.deleteStation(station.id);
      toast.success('Xóa trạm thành công');
      fetchData();
    } catch (error) {
      console.error('Error deleting station:', error);
      toast.error('Lỗi khi xóa trạm');
    }
  };

  return (
    <div className="p-4">
      <StationStatsCard stats={stats} />

      <div className="flex gap-2 mb-4">
        <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => { setSelectedStation(null); setIsDialogOpen(true); }}>+ Thêm trạm mới</Button>
      </div>

      <StationTable
        stations={stations.filter((s) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.address?.toLowerCase().includes(search.toLowerCase())
        )}
        onEdit={(s) => { setSelectedStation(s); setIsDialogOpen(true); }}
        onDelete={handleDelete}
        onView={async (s) => {
          try {
            const res = await stationService.admin.getStationById(s.id);
            const stationData = res?.station || res?.data || res || s;
            setViewStation(stationData);
            setIsDetailDialogOpen(true);
          } catch (error) {
            console.error('Error fetching station details:', error);
            toast.error('Không thể tải thông tin chi tiết');
          }
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStation ? 'Chỉnh sửa trạm' : 'Thêm trạm mới'}</DialogTitle>
          </DialogHeader>
          <StationForm
            initialValues={selectedStation || {
              name: '',
              address: '',
              latitude: '',
              longitude: '',
              status: 'active'
            }}
            onSubmit={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <StationDetailDialog
        station={viewStation}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </div>
  );
}