import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const StationStaffDetailDialog = ({ 
  isOpen, 
  onClose, 
  assignment 
}) => {
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

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết phân công</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về phân công nhân viên
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nhân viên</Label>
              <p className="text-lg font-semibold">{assignment.staffName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Trạm</Label>
              <p className="text-lg">{assignment.stationName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Trạng thái</Label>
              <div className="mt-1">
                {getStatusBadge(assignment.status)}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">ID Phân công</Label>
              <p className="text-lg">{assignment.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Ngày phân công</Label>
              <p className="text-lg">
                {new Date(assignment.assignedAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {assignment.updatedAt && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</Label>
                <p className="text-lg">
                  {new Date(assignment.updatedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Additional information */}
          {assignment.staffId && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">ID Nhân viên</Label>
              <p className="text-lg">{assignment.staffId}</p>
            </div>
          )}

          {assignment.stationId && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">ID Trạm</Label>
              <p className="text-lg">{assignment.stationId}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StationStaffDetailDialog;