import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import staffStationService from '@/services/staffStations/staffStationService.js';
import userService from '@/services/users/userService.js';
import stationService from '@/services/stations/stationService.js';
import { useToast } from '@/hooks/use-toast';
import StationStaffStatsCard from './StationStaffStatsCard';
import StationStaffTable from './StationStaffTable';
import StationStaffForm from './StationStaffForm';
import StationStaffDetailDialog from './StationStaffDetailDialog';

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
      const staffData = Array.isArray(res) ? res : (res?.data || []);
      const list = staffData.map((u) => ({
        id: u.id,
        name: u.fullName,
        phone: u.phone
      }));
      setStaffList(list);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      setStaffList([]);
    }
  };

  // real data will be fetched via services
  const fetchAssignments = async () => {
    try {
      const res = await staffStationService.admin.getAssignments();
      const assignmentsData = Array.isArray(res) ? res : (res?.data || []);
      const list = assignmentsData.map((item) => ({
        id: item.id,
        staffId: item.staff?.id,
        staffName: item.staff?.fullName,
        stationId: item.station?.id,
        stationName: item.station?.name,
        assignedAt: item.assignedAt,
        updatedAt: item.updatedAt || item.deactivatedAt,
        status: item.isActive ? 'active' : 'inactive'
      }));
      setAssignments(list);
    } catch (error) {
      console.error('Error fetching assignments:', error);
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
      const stationsData = Array.isArray(res) ? res : (res?.data || []);
      const list = stationsData.map((st) => ({
        id: st.id,
        name: st.name,
        address: st.address
      }));
      setStationsList(list);
    } catch (error) {
      console.error('Error fetching stations list:', error);
      setStationsList([]);
    }
  };

  const handleAssignStaff = async (formData) => {
    try {
      await staffStationService.admin.createAssignment({
        staffId: Number(formData.staffId),
        stationId: Number(formData.stationId)
      });
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
        <Button onClick={() => setShowAssignDialog(true)}>
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