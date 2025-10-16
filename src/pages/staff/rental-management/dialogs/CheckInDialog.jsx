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
import { Button } from "@/components/ui/button";
import { CheckCircle, DollarSign } from "lucide-react";
import staffRentalService from "@/services/staff/staffRentalService";

export default function CheckInDialog({ open, onOpenChange, reservation, toast, onSuccess }) {
    const [deposit, setDeposit] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) setDeposit("");
    }, [open]);

    const formatDateTime = (dateString) =>
        new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

    const handleSubmit = async () => {
        if (!reservation) return;

        if (!deposit || isNaN(parseFloat(deposit))) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập số tiền cọc hợp lệ",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);

        try {
            const stationId = reservation?.vehicle?.station?.id;
            const request = {
                renterId: parseInt(reservation?.renter?.id),
                reservationId: parseInt(reservation?.id),
                stationId: parseInt(stationId),
                startTime: reservation?.reservedStartTime,
                endTime: reservation?.reservedEndTime,
                depositAmount: parseFloat(deposit),
            };

            // 🟢 Log chi tiết để debug
            console.log("========================================");
            console.log("🪪 Reservation data:", reservation);
            console.log("🚗 Vehicle data:", reservation?.vehicle);
            console.log("👤 Renter data:", reservation?.renter);
            console.log("📦 Check-in request payload:", request);
            console.log("========================================");

            const result = await staffRentalService.checkIn(request);
            console.log("✅ API Response:", result);

            toast({
                title: "Thành công",
                description: "Check-in thành công. Đã ghi nhận cọc khách hàng.",
            });
            onSuccess?.();

        } catch (err) {
            console.error("❌ Check-in error:", err);
            toast({
                title: "Lỗi",
                description: err?.message || "Không thể thực hiện check-in",
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
                        Check-in khách hàng
                    </DialogTitle>
                    <DialogDescription>
                        Xác nhận giao xe và nhận cọc từ: {reservation?.renter?.fullName} -{" "}
                        {reservation?.vehicle?.licensePlate}
                    </DialogDescription>
                </DialogHeader>

                {/* Reservation Info */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Thông tin đặt chỗ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>Biển số: {reservation?.vehicle?.licensePlate}</p>
                        <p>Khách hàng: {reservation?.renter?.fullName}</p>
                        <p>Thời gian: {formatDateTime(reservation?.reservedStartTime)} → {formatDateTime(reservation?.reservedEndTime)}</p>
                    </CardContent>
                </Card>

                {/* Deposit */}
                <div className="space-y-2 mt-4">
                    <Label htmlFor="deposit">Số tiền đặt cọc (VND) *</Label>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                            id="deposit"
                            type="number"
                            placeholder="500000"
                            value={deposit}
                            onChange={(e) => setDeposit(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {saving ? "Đang xử lý..." : "Xác nhận Check-in"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
