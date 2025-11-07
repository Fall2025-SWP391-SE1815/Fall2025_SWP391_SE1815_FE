import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StationStaffForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  staffList = [], 
  stationsList = [], 
  assignments = [] 
}) => {
  const [formData, setFormData] = useState({
    staffId: '',
    stationId: ''
  });

  const handleSubmit = () => {
    if (formData.staffId && formData.stationId) {
      onSubmit(formData);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      staffId: '',
      stationId: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Filter out staff that are already assigned to active stations
  const availableStaff = staffList.filter(staff => 
    !assignments.some(assignment => 
      assignment.staffId === staff.id && assignment.status === 'active'
    )
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Phân công nhân viên</DialogTitle>
          <DialogDescription>
            Gán nhân viên vào trạm làm việc
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="staffId" className="text-sm font-medium text-gray-700">Chọn nhân viên</Label>
            <Select 
              value={formData.staffId} 
              onValueChange={(value) => setFormData({ ...formData, staffId: value })}
            >
              <SelectTrigger className="bg-white border border-gray-300 shadow-sm">
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg rounded-md max-h-64 overflow-y-auto">
                {availableStaff.length === 0 ? (
                  <div className="py-4 px-3 text-sm text-gray-500 text-center">
                    Không có nhân viên rảnh
                  </div>
                ) : (
                  availableStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()} className="py-3 px-3 hover:bg-gray-100 cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">{staff.name}</span>
                        <span className="text-sm text-gray-500">{staff.phone}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {availableStaff.length === 0 && (
              <p className="text-sm text-red-500">
                Không có nhân viên rảnh để phân công
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stationId" className="text-sm font-medium text-gray-700">Chọn trạm</Label>
            <Select 
              value={formData.stationId} 
              onValueChange={(value) => setFormData({ ...formData, stationId: value })}
            >
              <SelectTrigger className="bg-white border border-gray-300 shadow-sm">
                <SelectValue placeholder="Chọn trạm" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg rounded-md max-h-64 overflow-y-auto">
                {stationsList.length === 0 ? (
                  <div className="py-4 px-3 text-sm text-gray-500 text-center">
                    Không có trạm hoạt động
                  </div>
                ) : (
                  stationsList.map((station) => (
                    <SelectItem key={station.id} value={station.id.toString()} className="py-3 px-3 hover:bg-gray-100 cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">{station.name}</span>
                        <span className="text-sm text-gray-500">{station.address}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {stationsList.length === 0 && (
              <p className="text-sm text-red-500">
                Không có trạm nào đang hoạt động để phân công
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.staffId || !formData.stationId || availableStaff.length === 0 || stationsList.length === 0}
          >
            Phân công
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StationStaffForm;