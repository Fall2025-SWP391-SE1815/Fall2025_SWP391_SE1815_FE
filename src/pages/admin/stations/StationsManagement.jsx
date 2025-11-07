'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, MapPin, CheckCircle, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import StationStatsCard from './StationStatsCard';
import StationForm from './StationForm';
import StationTable from './StationTable';
import StationDetailDialog from './StationDetailDialog';
import stationService from '@/services/stations/stationService.js';

export default function StationsManagement() {
  const { toast } = useToast();
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
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tải dữ liệu thất bại
          </div>
        ),
        description: 'Không thể tải danh sách trạm xe. Vui lòng thử lại.',
        variant: 'destructive',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 5000
      });
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

      if (selectedStation) {
        await stationService.admin.updateStation(selectedStation.id, payload);
        toast({
          title: (
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Cập nhật trạm thành công!
            </div>
          ),
          description: `Đã cập nhật thông tin trạm "${values.name}"`,
          className: 'border-l-blue-500 border-blue-200 bg-blue-50',
          duration: 3000
        });
      } else {
        await stationService.admin.createStation(payload);
        toast({
          title: (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Thêm trạm thành công!
            </div>
          ),
          description: `Đã thêm trạm mới "${values.name}" tại ${values.address}`,
          className: 'border-l-green-500 border-green-200 bg-green-50',
          duration: 4000
        });
      }
      setIsDialogOpen(false);
      setSelectedStation(null);
      fetchData();
    } catch (error) {
      console.error('Error saving station:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Lỗi khi lưu dữ liệu trạm';
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {selectedStation ? 'Cập nhật trạm thất bại' : 'Thêm trạm thất bại'}
          </div>
        ),
        description: errorMsg,
        variant: 'destructive',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 5000
      });
    }
  };

  const handleDelete = async (station) => {
    if (!confirm(`Xóa trạm ${station.name}?`)) return;
    try {
      await stationService.admin.deleteStation(station.id);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-orange-600" />
            Xóa trạm thành công!
          </div>
        ),
        description: `Đã xóa trạm "${station.name}" khỏi hệ thống`,
        className: 'border-l-orange-500 border-orange-200 bg-orange-50',
        duration: 3000
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting station:', error);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Xóa trạm thất bại
          </div>
        ),
        description: error?.response?.data?.message || 'Không thể xóa trạm. Vui lòng thử lại.',
        variant: 'destructive',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 5000
      });
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
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Tải chi tiết thất bại
                </div>
              ),
              description: 'Không thể tải thông tin chi tiết trạm. Vui lòng thử lại.',
              variant: 'destructive',
              className: 'border-l-red-500 border-red-200 bg-red-50',
              duration: 4000
            });
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