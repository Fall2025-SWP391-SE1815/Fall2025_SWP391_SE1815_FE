import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import staffStationService from '@/services/staffStations/staffStationService.js';
import userService from '@/services/users/userService.js';
import stationService from '@/services/stations/stationService.js';
import { useToast } from '@/hooks/use-toast';
import StationStaffStatsCard from './staff-stations/StationStaffStatsCard';
import StationStaffTable from './staff-stations/StationStaffTable';
import StationStaffForm from './staff-stations/StationStaffForm';
import StationStaffDetailDialog from './staff-stations/StationStaffDetailDialog';

const StationStaffManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [stationsList, setStationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAssignments(),
          fetchStationsList(), 
          fetchStaffList()
        ]);
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, []);

  const fetchStaffList = async () => {
    try {
      const res = await userService.admin.getUsers({ role: 'staff' });
      // response may be shaped as { users: [...] } or an array
      const raw = res?.users || res?.data?.users || res || [];
      let list = [];
      if (Array.isArray(raw) && raw.length > 0) {
        list = raw.map((u) => ({
          id: u.id ?? u._id ?? u.userId,
          name: u.fullName ?? u.name ?? `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          phone: u.phone ?? u.mobile ?? ''
        }));
      } else if (raw.users && Array.isArray(raw.users)) {
        list = raw.users.map((u) => ({
          id: u.id ?? u._id ?? u.userId,
          name: u.fullName ?? u.name ?? `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          phone: u.phone ?? u.mobile ?? ''
        }));
      }

      setStaffList(list);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      setStaffList([]);
    }
  };

  // real data will be fetched via services
  const fetchAssignments = async () => {
    try {
      const params = {};
      // Note: don't send status to API (server may not support it); apply status filter client-side

      const res = await staffStationService.admin.getAssignments(params);
      const rawList = res?.assignments || res?.data || res || [];

      let list = [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        list = rawList.map((item) => ({
          id: item.id,
          staffId: item.staff?.id,
          staffName: item.staff?.fullName,
          stationId: item.station?.id,
          stationName: item.station?.name,
          assignedAt: item.assignedAt,
          updatedAt: item.updatedAt ?? item.deactivatedAt,
          status: item.isActive ? 'active' : 'inactive'
        }));
      }

      setAssignments(list);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Set empty array on error
      setAssignments([]);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phân công',
        variant: 'destructive'
      });
    }
  };

  const fetchStationsList = async () => {
    try {
      const res = await stationService.admin.getStations();
      const raw = res?.stations || res || [];
      let list = [];
      if (Array.isArray(raw) && raw.length > 0) {
        list = raw.map((st) => ({
          id: st.id ?? st._id ?? st.stationId,
          name: st.name ?? st.stationName,
          address: st.address ?? st.location ?? st.addr
        }));
      }

      setStationsList(list);
    } catch (error) {
      console.error('Error fetching stations list:', error);
      setStationsList([]);
    }
  };

  // Note: statistics removed to simplify to 3 APIs: assignments, staff, stations

  const handleAssignStaff = async (formData) => {
    try {
      const payload = {
        staffId: parseInt(formData.staffId),
        stationId: parseInt(formData.stationId)
      };
      await staffStationService.admin.createAssignment(payload);
      toast({ title: 'Thành công', description: 'Đã phân công nhân viên thành công' });
      setShowAssignDialog(false);
      await fetchAssignments();
      await fetchStaffList();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể phân công nhân viên',
        variant: 'destructive'
      });
    }
  };

  const handleDeactivateAssignment = async (assignmentId) => {
    if (!confirm('Bạn có chắc chắn muốn kết thúc phân công này?')) {
      return;
    }

    try {
      await staffStationService.admin.deactivateAssignment(assignmentId);
      toast({ title: 'Thành công', description: 'Đã kết thúc phân công thành công' });
      await fetchAssignments();
      await fetchStaffList();
    } catch (error) {
      console.error('Error deactivating assignment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kết thúc phân công',
        variant: 'destructive'
      });
    }
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowViewDialog(true);
  };

  const openAssignDialog = () => {
    setShowAssignDialog(true);
  };



  if (loading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý nhân viên trạm</h1>
          <p className="text-muted-foreground">
            Phân công và giám sát nhân viên tại các trạm xe
          </p>
        </div>
        <Button onClick={openAssignDialog}>
          <UserCheck className="h-4 w-4 mr-2" />
          Phân công nhân viên
        </Button>
      </div>

      {/* Statistics Cards */}
      <StationStaffStatsCard 
        assignments={assignments}
        stationsList={stationsList}
        staffList={staffList}
      />

      {/* Assignment Table with Filters */}
      <StationStaffTable 
        assignments={assignments}
        stationsList={stationsList}
        onViewAssignment={handleViewAssignment}
        onDeactivateAssignment={handleDeactivateAssignment}
        loading={loading}
      />

      {/* Assign Staff Form */}
      <StationStaffForm 
        isOpen={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        onSubmit={handleAssignStaff}
        staffList={staffList}
        stationsList={stationsList}
        assignments={assignments}
      />

      {/* View Assignment Details */}
      <StationStaffDetailDialog 
        isOpen={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        assignment={selectedAssignment}
      />
    </div>
  );
};

export default StationStaffManagement;