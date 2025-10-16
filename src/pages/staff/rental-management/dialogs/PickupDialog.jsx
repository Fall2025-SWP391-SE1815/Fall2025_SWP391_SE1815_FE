import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Camera, PenTool, CheckCircle } from "lucide-react";
import staffRentalService from "@/services/staff/staffRentalService";

export default function PickupDialog({ open, onOpenChange, rental, toast, onSuccess }) {
    const [note, setNote] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [staffSigFile, setStaffSigFile] = useState(null);
    const [custSigFile, setCustSigFile] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setNote("");
            setPhotoFile(null);
            setStaffSigFile(null);
            setCustSigFile(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!rental) return;

        if (!note?.trim()) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập báo cáo tình trạng xe",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();

            const payload = {
                rentalId: rental?.id ?? rental?.rental_id,
                checkType: "pickup",
                conditionReport: note,
            };

            formData.append("data", JSON.stringify(payload));

            if (photoFile) formData.append("photo", photoFile);
            if (staffSigFile) formData.append("staff_signature", staffSigFile);
            if (custSigFile) formData.append("customer_signature", custSigFile);

            // 🟢 Log dữ liệu gửi lên để debug
            console.log("========================================");
            console.log("🚗 Rental data:", rental);
            console.log("📝 Payload gửi lên:", payload);
            console.log("📎 File đính kèm:", {
                photoFile,
                staffSigFile,
                custSigFile,
            });
            console.log("========================================");

            const result = await staffRentalService.confirmPickup(formData);
            console.log("✅ API Response:", result);

            toast({
                title: "Thành công",
                description: "Xác nhận giao xe thành công!",
            });
            onSuccess?.();
        } catch (err) {
            console.error("❌ Lỗi khi gửi yêu cầu confirmPickup:", err);
            toast({
                title: "Lỗi",
                description: err?.message || "Không thể xác nhận giao xe",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Xác nhận giao xe
                    </DialogTitle>
                    <DialogDescription>
                        {rental
                            ? `Lập biên bản giao xe cho: ${rental?.renter?.fullName || ""} - ${rental?.vehicle?.licensePlate || ""
                            }`
                            : "Lập biên bản giao xe"}
                    </DialogDescription>
                </DialogHeader>

                {/* Vehicle Info */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Thông tin xe</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Biển số</Label>
                                <p className="font-medium">{rental?.vehicle?.licensePlate || ""}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Loại xe</Label>
                                <p className="font-medium">
                                    {rental?.vehicle?.brand} {rental?.vehicle?.model}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Condition Report */}
                <div className="space-y-2 mt-4">
                    <Label htmlFor="condition">Báo cáo tình trạng xe *</Label>
                    <Textarea
                        id="condition"
                        placeholder="Mô tả chi tiết tình trạng xe (vết xước, hỏng hóc, mức pin/nhiên liệu, v.v.)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                    />
                </div>

                {/* Uploads */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                        <Label>Ảnh xe (tuỳ chọn)</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                        />
                        <Button variant="outline" size="sm" type="button" className="w-fit">
                            <Camera className="h-4 w-4 mr-2" />
                            Chụp/Chọn ảnh
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Chữ ký nhân viên (tuỳ chọn)</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setStaffSigFile(e.target.files?.[0] || null)}
                        />
                        <Button variant="outline" size="sm" type="button" className="w-fit">
                            <PenTool className="h-4 w-4 mr-2" />
                            Tải chữ ký
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Chữ ký khách hàng (tuỳ chọn)</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCustSigFile(e.target.files?.[0] || null)}
                        />
                        <Button variant="outline" size="sm" type="button" className="w-fit">
                            <PenTool className="h-4 w-4 mr-2" />
                            Tải chữ ký
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {saving ? "Đang lưu..." : "Xác nhận giao xe"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
