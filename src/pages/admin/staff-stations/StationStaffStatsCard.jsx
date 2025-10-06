import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Clock, AlertCircle } from "lucide-react";

const StationStaffStatsCard = ({ assignments = [], stationsList = [], staffList = [] }) => {
  const getStationStaffCount = (stationId) => {
    return assignments.filter(a => String(a.stationId) === String(stationId) && a.status === 'active').length;
  };

  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  const inactiveAssignments = assignments.filter(a => a.status === 'inactive').length;
  const freeStaff = staffList.length - activeAssignments;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Assignments by Station */}
      <Card>
        <CardHeader>
          <CardTitle>Phân công theo trạm</CardTitle>
          <CardDescription>
            Tình trạng nhân viên tại các trạm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stationsList.map((station) => {
              const staffCount = getStationStaffCount(station.id);
              return (
                <div key={station.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{station.name}</h4>
                    <p className="text-sm text-muted-foreground">{station.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {staffCount} nhân viên
                    </span>
                    <Badge variant={staffCount > 0 ? 'default' : 'secondary'}>
                      {staffCount > 0 ? 'Có nhân viên' : 'Trống'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo trạng thái</CardTitle>
          <CardDescription>
            Phân bố phân công nhân viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="font-medium">Đang hoạt động</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {activeAssignments} phân công
                </span>
                <Badge variant="default">Hoạt động</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Đã kết thúc</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {inactiveAssignments} phân công
                </span>
                <Badge variant="secondary">Kết thúc</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Nhân viên rảnh</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {freeStaff} người
                </span>
                <Badge variant="outline">Sẵn sàng</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationStaffStatsCard;