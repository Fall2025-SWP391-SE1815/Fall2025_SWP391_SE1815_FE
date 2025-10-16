import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import staffRentalService from "@/services/staff/staffRentalService";
import { Banknote, CreditCard, CheckCircle } from "lucide-react";

const PaymentProcessDialog = ({ open, onOpenChange, payment, refresh }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("");

    useEffect(() => {
        if (payment) setAmount(payment.total_cost?.toString() || "");
    }, [payment]);

    const handleSubmit = async () => {
        if (!payment || !amount || !method) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập đủ thông tin thanh toán",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            await staffRentalService.processPayment(payment.rental_id, {
                amount: parseFloat(amount),
                paymentMethod: method,
                notes: `Thanh toán ${method} tại trạm`,
            });
            toast({ title: "Đã xác nhận thanh toán thành công." });
            onOpenChange(false);
            refresh?.();
        } catch (err) {
            toast({
                title: "Lỗi thanh toán",
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
                    <DialogTitle className="text-xl font-semibold text-primary">
                        Xử lý thanh toán
                    </DialogTitle>
                    <DialogDescription>
                        Ghi nhận thanh toán cho {payment?.renter_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    <Card>
                        <CardContent className="pt-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span>Mã thuê:</span>
                                <span className="font-medium">#{payment?.rental_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Khách hàng:</span>
                                <span>{payment?.renter_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tổng cần thanh toán:</span>
                                <span className="font-semibold text-green-600">
                                    {(payment?.total_cost || 0).toLocaleString("vi-VN")}₫
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <Label>Số tiền thanh toán *</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nhập số tiền"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Phương thức thanh toán *</Label>
                        <Select onValueChange={setMethod} value={method}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn phương thức" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">
                                    <div className="flex items-center gap-2">
                                        <Banknote className="h-4 w-4" /> Tiền mặt
                                    </div>
                                </SelectItem>
                                <SelectItem value="payos">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" /> PayOS
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-primary text-white"
                    >
                        {loading ? "Đang xử lý..." : <><CheckCircle className="h-4 w-4 mr-2" /> Xác nhận</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentProcessDialog;
