import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Flag } from "lucide-react";
import staffRentalService from "@/services/staff/staffRentalService";

const ViolationDialog = ({ open, onOpenChange, refresh }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ rental_id: "", description: "", fine_amount: "" });

    const handleSubmit = async () => {
        if (!form.rental_id || !form.description || !form.fine_amount) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng điền đầy đủ thông tin vi phạm",
                variant: "destructive",
            });
            return;
        }
        try {
            setLoading(true);
            await staffRentalService.addViolation({
                rentalId: parseInt(form.rental_id),
                description: form.description,
                fineAmount: parseFloat(form.fine_amount),
            });
            toast({ title: "Đã ghi nhận vi phạm." });
            setForm({ rental_id: "", description: "", fine_amount: "" });
            onOpenChange(false);
            refresh?.();
        } catch (err) {
            toast({
                title: "Lỗi ghi nhận",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                        <Flag className="h-5 w-5 text-primary" /> Ghi nhận vi phạm
                    </DialogTitle>
                    <DialogDescription>
                        Ghi nhận vi phạm phát sinh khi khách hàng trả xe
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Mã lượt thuê *</Label>
                        <Input
                            type="number"
                            value={form.rental_id}
                            onChange={(e) => setForm({ ...form, rental_id: e.target.value })}
                            placeholder="Nhập mã lượt thuê"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Mô tả vi phạm *</Label>
                        <Textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Ví dụ: trả xe trễ, không đội mũ bảo hiểm..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Số tiền phạt *</Label>
                        <Input
                            type="number"
                            value={form.fine_amount}
                            onChange={(e) => setForm({ ...form, fine_amount: e.target.value })}
                            placeholder="Nhập số tiền phạt"
                        />
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-white">
                        {loading ? "Đang lưu..." : "Ghi nhận"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViolationDialog;
