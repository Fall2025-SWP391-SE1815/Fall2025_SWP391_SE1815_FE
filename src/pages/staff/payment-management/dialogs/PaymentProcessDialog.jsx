import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import staffRentalService from "@/services/staff/staffRentalService";
import { Banknote, CreditCard, CheckCircle, Calculator } from "lucide-react";

const PaymentProcessDialog = ({ open, onOpenChange, payment, refresh }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("");

    // ✅ Tự động tính lại bill khi mở dialog
    useEffect(() => {
        const fetchBill = async () => {
            if (!open || !payment) return;

            const rentalId = payment?.rental_id || payment?.id;
            if (!rentalId) {
                toast({
                    title: "Thiếu mã thuê xe",
                    description: "Không thể tính bill vì thiếu rental_id.",
                    variant: "destructive",
                });
                return;
            }

            try {
                setCalculating(true);
                const res = await staffRentalService.calculateBill(rentalId, {
                    returnTime: new Date().toISOString(),
                });
                setAmount(res.totalBill.toLocaleString("vi-VN"));
                toast({
                    title: "Đã tính tổng bill",
                    description: `Tổng tiền: ${res.totalBill.toLocaleString("vi-VN")}₫`,
                });
            } catch (err) {
                toast({
                    title: "Lỗi khi tính bill",
                    description: err.message || "Không thể lấy tổng bill.",
                    variant: "destructive",
                });
            } finally {
                setCalculating(false);
            }
        };

        fetchBill();
    }, [open, payment]);

    // ✅ Format tiền: tự thêm dấu chấm hàng nghìn
    const handleAmountChange = (e) => {
        let rawValue = e.target.value.replace(/\./g, "");
        if (!/^\d*$/.test(rawValue)) return;
        if (rawValue.startsWith("0") && rawValue.length > 1)
            rawValue = rawValue.replace(/^0+/, "");
        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setAmount(formatted);
    };

    // 💳 Ghi nhận thanh toán
    const handleSubmit = async () => {
        const cleanAmount = Number(amount.replace(/\./g, ""));
        const rentalId = payment?.rental_id || payment?.id;

        if (!rentalId) {
            toast({
                title: "Thiếu mã thuê xe",
                description: "Không thể xử lý thanh toán.",
                variant: "destructive",
            });
            return;
        }

        if (!cleanAmount || cleanAmount <= 0) {
            toast({
                title: "Số tiền không hợp lệ",
                description: "Vui lòng nhập số tiền lớn hơn 0.",
                variant: "destructive",
            });
            return;
        }

        if (!method) {
            toast({
                title: "Thiếu phương thức thanh toán",
                description: "Vui lòng chọn phương thức thanh toán.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            await staffRentalService.processPayment(rentalId, {
                amount: cleanAmount,
                paymentMethod: method,
                notes: `Thanh toán ${method === "cash" ? "tiền mặt" : "PayOS"
                    } tại trạm`,
            });

            toast({
                title: "Thanh toán thành công",
                description: `Đã xác nhận thanh toán cho lượt thuê #${rentalId}.`,
            });

            onOpenChange(false);
            refresh?.();
        } catch (err) {
            toast({
                title: "Lỗi thanh toán",
                description: err.message || "Không thể xử lý thanh toán.",
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
                        Ghi nhận thanh toán cho{" "}
                        <span className="font-medium">
                            {payment?.renter_name || payment?.renter?.fullName}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Thông tin lượt thuê */}
                    <Card>
                        <CardContent className="pt-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span>Mã thuê:</span>
                                <span className="font-medium">
                                    #{payment?.rental_id || payment?.id}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Khách hàng:</span>
                                <span>{payment?.renter_name || payment?.renter?.fullName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tổng cần thanh toán:</span>
                                <span className="font-semibold text-green-600">
                                    {amount || "0"}₫
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nhập tiền */}
                    <div className="space-y-2">
                        <Label>Số tiền thanh toán *</Label>
                        <Input
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="VD: 500.000"
                        />
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="space-y-2">
                        <Label>Phương thức thanh toán *</Label>
                        <Select value={method} onValueChange={setMethod}>
                            <SelectTrigger className="w-full flex items-center justify-between">
                                <SelectValue placeholder="Chọn phương thức" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border shadow-md rounded-xl">
                                <SelectItem value="cash">
                                    <div className="flex items-center gap-2">
                                        <Banknote className="h-4 w-4 text-green-600" />
                                        <span className="text-gray-800 font-medium">Tiền mặt</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="payos">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                        <span className="text-gray-800 font-medium">PayOS</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || calculating}
                        className="bg-primary text-white"
                    >
                        {loading || calculating ? (
                            <>
                                <Calculator className="h-4 w-4 mr-2 animate-spin" />
                                {calculating ? "Đang tính bill..." : "Đang xử lý..."}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Xác nhận
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentProcessDialog;