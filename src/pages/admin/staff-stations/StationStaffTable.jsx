import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, Trash2 } from "lucide-react";

const StationStaffTable = ({ 
  assignments = [], 
  stationsList = [], 
  onViewAssignment, 
  onDeactivateAssignment,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStationId, setSelectedStationId] = useState('all');

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { label: 'Hoạt động', variant: 'default' },
      'inactive': { label: 'Kết thúc', variant: 'secondary' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };

    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = searchTerm === '' || 
      assignment.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.stationName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    
    const matchesStation = selectedStationId === 'all' || 
      String(assignment.stationId) === String(selectedStationId);

    return matchesSearch && matchesStatus && matchesStation;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách phân công</CardTitle>
        <CardDescription>
          Quản lý phân công nhân viên tại các trạm
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-end gap-4 mb-6 relative z-10">
          <div className="flex flex-col gap-1 flex-1 max-w-sm">
            <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhân viên hoặc trạm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-white border border-gray-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Trạm</label>
            <Select value={selectedStationId} onValueChange={setSelectedStationId}>
              <SelectTrigger className="w-56 bg-white border border-gray-300 shadow-sm">
                <SelectValue placeholder="Chọn trạm" />
              </SelectTrigger>
              <SelectContent className="z-50 max-h-64 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md">
                <SelectItem value="all" className="font-medium py-2 px-3 hover:bg-gray-100">
                  Tất cả trạm
                </SelectItem>
                {stationsList.map((station) => (
                  <SelectItem key={station.id} value={String(station.id)} className="py-2 px-3 hover:bg-gray-100">
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Trạng thái</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-52 bg-white border border-gray-300 shadow-sm">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg rounded-md">
                <SelectItem value="all" className="font-medium py-2 px-3 hover:bg-gray-100">
                  Tất cả trạng thái
                </SelectItem>
                <SelectItem value="active" className="py-2 px-3 hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Đang hoạt động</span>
                  </div>
                </SelectItem>
                <SelectItem value="inactive" className="py-2 px-3 hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>Đã kết thúc</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Trạm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày phân công</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {assignment.staffName}
                </TableCell>
                <TableCell>{assignment.stationName}</TableCell>
                <TableCell>
                  {getStatusBadge(assignment.status)}
                </TableCell>
                <TableCell>
                  {new Date(assignment.assignedAt).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  {assignment.updatedAt
                    ? new Date(assignment.updatedAt).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : 'Chưa kết thúc'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewAssignment(assignment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {assignment.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeactivateAssignment(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAssignments.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || (statusFilter && statusFilter !== 'all') || (selectedStationId && selectedStationId !== 'all') 
              ? 'Không tìm thấy phân công phù hợp' 
              : 'Chưa có phân công nào'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StationStaffTable;