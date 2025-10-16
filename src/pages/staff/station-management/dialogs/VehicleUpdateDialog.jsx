import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit, Zap, Gauge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import staffVehicleService from "@/services/staff/staffVehicleService";

/**
 * Dialog cập nhật thông tin xe
 * Props:
 * - open: boolean
 * - onOpenChange: function
 * - vehicle: object
 * - onUpdated: callback sau khi cập nhật thành công
 */
export default function VehicleUpdateDialog({ open, onOpenChange, vehicle, onUpdated }) {
    const { toast } = useToast();
    const [form, setForm] = useState({ brand: "", model: "", capacity: "", rangePerFullCharge: "" });
    const [saving, setSaving] = useState(false);

    // Khi mở dialog -> đổ dữ liệu xe vào form
    useEffect(() => {
        if (vehicle) {
            setForm({
                brand: vehicle.brand || "",
                model: vehicle.model || "",
                capacity: vehicle.capacity?.toString() || "",
                rangePerFullCharge: vehicle.rangePerFullCharge?.toString() || "",
            });
        }
    }, [vehicle]);

    // Submit cập nhật
    const handleSubmit = async () => {
        if (!vehicle) return;

        if (!form.brand || !form.model || !form.capacity || !form.rangePerFullCharge) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng nhập đầy đủ thông tin.", variant: "destructive" });
            return;
        }

        const capacity = parseInt(form.capacity);
        const range = parseInt(form.rangePerFullCharge);
        if (isNaN(capacity) || capacity <= 0 || isNaN(range) || range <= 0) {
            toast({
                title: "Thông tin không hợp lệ",
                description: "Dung lượng pin và quãng đường phải là số hợp lệ.",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        const result = await staffVehicleService.updateVehicle(vehicle.id, {
            brand: form.brand,
            model: form.model,
            capacity,
            rangePerFullCharge: range,
        });

        if (result.success) {
            toast({ title: "Cập nhật thành công", description: "Xe đã được cập nhật thông tin." });
            onUpdated?.();
            onOpenChange(false);
        } else {
            toast({ title: "Lỗi", description: result.message, variant: "destructive" });
        }

        setSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Edit className="h-5 w-5" /> Cập nhật thông tin xe
                    </DialogTitle>
                    <DialogDescription>
                        Cập nhật thông số kỹ thuật xe {vehicle?.licensePlate && `- ${vehicle.licensePlate}`}
                    </DialogDescription>
                </DialogHeader>

                {/* Form cập nhật */}
                <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label>Hãng xe *</Label>
                        <Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Model *</Label>
                        <Input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Dung lượng pin (Ah) *
                        </Label>
                        <Input
                            type="number"
                            value={form.capacity}
                            onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                            placeholder="VD: 20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                            <Gauge className="h-3 w-3" /> Quãng đường/lần sạc (km) *
                        </Label>
                        <Input
                            type="number"
                            value={form.rangePerFullCharge}
                            onChange={(e) => setForm((f) => ({ ...f, rangePerFullCharge: e.target.value }))}
                            placeholder="VD: 200"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 p-2">
                        <strong>Lưu ý:</strong> Biển số và giá thuê không thể thay đổi.
                        Chỉ được phép chỉnh thông số kỹ thuật.
                    </div>
                </div>

                <DialogFooter className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        <Edit className="h-4 w-4 mr-1" />
                        {saving ? "Đang cập nhật..." : "Cập nhật"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
