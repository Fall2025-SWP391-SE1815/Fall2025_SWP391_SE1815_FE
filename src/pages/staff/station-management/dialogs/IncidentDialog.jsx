import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AlertTriangle, Shield, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import staffRentalService from "@/services/staff/staffRentalService";

export default function IncidentDialog({ open, onOpenChange, vehicles = [] }) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ vehicle_id: "", rental_id: "", description: "", severity: "" });

    const submit = async () => {
        if (!form.vehicle_id || !form.description || !form.severity) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng điền đầy đủ thông tin sự cố", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            // Lưu ý: cần có hàm createIncidentReport trong staffRentalService
            await staffRentalService.createIncidentReport({
                vehicleId: parseInt(form.vehicle_id),
                rentalId: form.rental_id ? parseInt(form.rental_id) : null,
                description: form.description,
                severity: form.severity,
            });
            toast({ title: "Thành công", description: "Sự cố đã được ghi nhận." });
            setForm({ vehicle_id: "", rental_id: "", description: "", severity: "" });
            onOpenChange?.(false);
        } catch (e) {
            toast({ title: "Lỗi", description: e?.message || "Không thể báo cáo sự cố", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Báo cáo sự cố
                    </DialogTitle>
                    <DialogDescription>Báo cáo sự cố về xe tại trạm (hỏng hóc, tai nạn, cháy nổ)</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Mã xe *</Label>
                        <Select value={form.vehicle_id} onValueChange={(v) => setForm((p) => ({ ...p, vehicle_id: v }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn xe" />
                            </SelectTrigger>
                            <SelectContent>
                                {vehicles.map((v) => (
                                    <SelectItem key={v.id} value={v.id.toString()}>
                                        {(v.licensePlate || v.license_plate || "N/A") + " - " + v.brand + " " + v.model}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Mã lượt thuê (tùy chọn)</Label>
                        <Input
                            type="number"
                            placeholder="Nhập mã lượt thuê (nếu có)"
                            value={form.rental_id}
                            onChange={(e) => setForm((p) => ({ ...p, rental_id: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả sự cố *</Label>
                        <Textarea
                            rows={4}
                            placeholder="Mô tả chi tiết sự cố (hỏng hóc, tai nạn, cháy nổ, ...)"
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mức độ nghiêm trọng *</Label>
                        <Select value={form.severity} onValueChange={(v) => setForm((p) => ({ ...p, severity: v }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn mức độ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" /> Thấp
                                    </div>
                                </SelectItem>
                                <SelectItem value="medium">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Trung bình
                                    </div>
                                </SelectItem>
                                <SelectItem value="high">
                                    <div className="flex items-center gap-2">
                                        <Flame className="h-4 w-4" /> Cao
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange?.(false)}>
                        Hủy
                    </Button>
                    <Button onClick={submit} disabled={saving}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {saving ? "Đang gửi..." : "Báo cáo sự cố"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
