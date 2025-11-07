import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserCheck, CheckCircle, AlertTriangle, UserX } from 'lucide-react';
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
      // Chỉ lấy nhân viên có isActive: true
      const list = staffData
        .filter((u) => u.isActive === true)
        .map((u) => ({
          id: u.id,
          name: u.fullName,
          phone: u.phone
        }));
      setStaffList(list);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      setStaffList([]);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tải danh sách nhân viên thất bại
          </div>
        ),
        description: 'Không thể tải danh sách nhân viên. Vui lòng thử lại',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
      });
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
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tải danh sách phân công thất bại
          </div>
        ),
        description: 'Không thể tải danh sách phân công. Vui lòng thử lại',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
      });
    }
  };

  const fetchStationsList = async () => {
    try {
      const res = await stationService.admin.getStations();
      const stationsData = Array.isArray(res) ? res : (res?.data || []);
      // Chỉ lấy các trạm có status: 'active'
      const list = stationsData
        .filter((st) => st.status === 'active')
        .map((st) => ({
          id: st.id,
          name: st.name,
          address: st.address,
          status: st.status
        }));
      setStationsList(list);
    } catch (error) {
      console.error('Error fetching stations list:', error);
      setStationsList([]);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Tải danh sách trạm thất bại
          </div>
        ),
        description: 'Không thể tải danh sách trạm. Vui lòng thử lại',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
      });
    }
  };

  const handleAssignStaff = async (formData) => {
    try {
      await staffStationService.admin.createAssignment({
        staffId: Number(formData.staffId),
        stationId: Number(formData.stationId)
      });
      
      // Tìm thông tin staff và station để hiển thị trong toast
      const assignedStaff = staffList.find(s => s.id === Number(formData.staffId));
      const assignedStation = stationsList.find(s => s.id === Number(formData.stationId));
      
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Phân công nhân viên thành công!
          </div>
        ),
        description: `Đã phân công ${assignedStaff?.name || 'nhân viên'} vào trạm ${assignedStation?.name || 'được chọn'}`,
        className: 'border-l-green-500 border-green-200 bg-green-50',
        duration: 4000
      });
      setShowAssignDialog(false);
      await fetchAssignments();
      await fetchStaffList();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Phân công nhân viên thất bại
          </div>
        ),
        description: error?.response?.data?.message || 'Không thể phân công nhân viên. Vui lòng thử lại',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
      });
    }
  };

  const handleDeactivateAssignment = async (assignmentId) => {
    if (!confirm('Bạn có chắc chắn muốn kết thúc phân công này?')) {
      return;
    }

    try {
      // Tìm thông tin assignment để hiển thị trong toast
      const assignment = assignments.find(a => a.id === assignmentId);
      
      await staffStationService.admin.deactivateAssignment(assignmentId);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-blue-600" />
            Kết thúc phân công thành công!
          </div>
        ),
        description: `Đã kết thúc phân công của ${assignment?.staffName || 'nhân viên'} tại trạm ${assignment?.stationName || 'được chọn'}`,
        className: 'border-l-blue-500 border-blue-200 bg-blue-50',
        duration: 3000
      });
      await fetchAssignments();
      await fetchStaffList();
    } catch (error) {
      console.error('Error deactivating assignment:', error);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Kết thúc phân công thất bại
          </div>
        ),
        description: error?.response?.data?.message || 'Không thể kết thúc phân công. Vui lòng thử lại',
        className: 'border-l-red-500 border-red-200 bg-red-50',
        duration: 4000
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