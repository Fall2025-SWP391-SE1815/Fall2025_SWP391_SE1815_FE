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
import { Flag, Calculator } from "lucide-react";
import staffRentalService from "@/services/staff/staffRentalService";

const ViolationDialog = ({ open, onOpenChange, refresh }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        rental_id: "",
        description: "",
        fine_amount: "",
    });
    const [bill, setBill] = useState(null);

    // ✅ Định dạng tiền có dấu chấm ngăn cách
    const handleFineChange = (e) => {
        let rawValue = e.target.value.replace(/\./g, ""); // bỏ dấu chấm
        if (!/^\d*$/.test(rawValue)) return; // chỉ cho nhập số
        if (rawValue.startsWith("0") && rawValue.length > 1)
            rawValue = rawValue.replace(/^0+/, "");

        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setForm({ ...form, fine_amount: formatted });
    };

    // ✅ Hàm xử lý thêm vi phạm
    const handleSubmit = async () => {
        const cleanFine = Number(form.fine_amount.replace(/\./g, ""));

        if (!form.rental_id || !form.description || !form.fine_amount) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng điền đầy đủ thông tin vi phạm",
                variant: "destructive",
            });
            return;
        }

        if (cleanFine <= 0) {
            toast({
                title: "Số tiền không hợp lệ",
                description: "Tiền phạt phải lớn hơn 0.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            // 🟢 Bước 1: Ghi nhận vi phạm
            await staffRentalService.addViolation({
                rentalId: parseInt(form.rental_id),
                description: form.description,
                fineAmount: cleanFine,
            });

            // 🟢 Bước 2: Tính lại bill sau khi có vi phạm
            const res = await staffRentalService.calculateBill(form.rental_id, {
                returnTime: new Date().toISOString(),
            });
            setBill(res);

            // 🟢 Bước 3: Thông báo thành công
            toast({
                title: "Đã ghi nhận vi phạm.",
                description: `Tổng bill mới: ${res.totalBill?.toLocaleString("vi-VN")}₫`,
            });

            // Reset form và đóng dialog
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
                    {/* Mã lượt thuê */}
                    <div className="space-y-2">
                        <Label>Mã lượt thuê *</Label>
                        <Input
                            type="number"
                            value={form.rental_id}
                            onChange={(e) => setForm({ ...form, rental_id: e.target.value })}
                            placeholder="Nhập mã lượt thuê"
                        />
                    </div>

                    {/* Mô tả vi phạm */}
                    <div className="space-y-2">
                        <Label>Mô tả vi phạm *</Label>
                        <Textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            placeholder="Ví dụ: Trả xe trễ, xe bị trầy xước..."
                        />
                    </div>

                    {/* Số tiền phạt */}
                    <div className="space-y-2">
                        <Label>Số tiền phạt *</Label>
                        <Input
                            value={form.fine_amount}
                            onChange={handleFineChange}
                            placeholder="Nhập số tiền phạt (VD: 500.000)"
                        />
                    </div>

                    {/* Hiển thị tổng bill mới nếu có */}
                    {bill && (
                        <div className="mt-4 border-t border-gray-200 pt-3 text-sm">
                            <p className="flex justify-between">
                                <span>Chi phí thuê xe:</span>
                                <span>{bill.rentalCost?.toLocaleString("vi-VN")}₫</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Phí vi phạm:</span>
                                <span>{bill.violationCost?.toLocaleString("vi-VN")}₫</span>
                            </p>
                            <p className="flex justify-between font-semibold text-green-700">
                                <span>Tổng cộng:</span>
                                <span>{bill.totalBill?.toLocaleString("vi-VN")}₫</span>
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-primary text-white"
                    >
                        {loading ? (
                            <>
                                <Calculator className="h-4 w-4 mr-2 animate-spin" />
                                Đang ghi nhận...
                            </>
                        ) : (
                            "Ghi nhận"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViolationDialog;
