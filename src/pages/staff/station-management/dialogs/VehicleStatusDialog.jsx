import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api/apiClient";


export default function VehicleStatusDialog({ open, setOpen, vehicle, refresh }) {
    const { toast } = useToast();
    const [status, setStatus] = useState(vehicle?.status || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!vehicle) return;
        try {
            setLoading(true);
            await apiClient.put(`/api/station/vehicles/${vehicle.id}/status`, { status });
            toast({ title: "Cập nhật trạng thái xe thành công" });
            refresh();
            setOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Cập nhật thất bại" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cập nhật trạng thái xe</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        Xe: <strong>{vehicle?.name}</strong> ({vehicle?.type})
                    </p>

                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                            <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                            <SelectItem value="IN_USE">Đang sử dụng</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
