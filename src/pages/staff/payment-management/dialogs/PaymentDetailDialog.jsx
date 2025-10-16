import React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Eye, User, Car, MapPin, DollarSign, Phone } from "lucide-react";

const PaymentDetailDialog = ({ open, onOpenChange, payment, onProcess }) => {
    if (!payment) return null;

    const formatCurrency = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);

    const formatDateTime = (dateString) =>
        new Date(dateString).toLocaleString("vi-VN");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Chi tiết thanh toán #{payment.payment_id}
                    </DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết lượt thuê và khách hàng
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    <Card className="rounded-xl border border-primary/10 bg-primary/5">
                        <CardHeader className="pb-2 flex flex-row justify-between">
                            <div>
                                <p className="font-medium text-gray-800">
                                    {payment.renter_name}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {payment.renter_phone}
                                </p>
                            </div>
                            <Badge variant="outline">ID #{payment.renter_id}</Badge>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-primary" />
                                <p className="font-semibold">Thông tin xe</p>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <p>
                                <span className="text-muted-foreground">Biển số:</span>{" "}
                                <strong>{payment.vehicle_license}</strong>
                            </p>
                            <p>
                                <span className="text-muted-foreground">Hãng xe:</span>{" "}
                                {payment.vehicle_brand} {payment.vehicle_model}
                            </p>
                            <p>
                                <span className="text-muted-foreground">Loại xe:</span>{" "}
                                {payment.vehicle_type}
                            </p>
                            <p>
                                <span className="text-muted-foreground">Giá thuê:</span>{" "}
                                {formatCurrency(payment.vehicle_price_per_hour)}/giờ
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <p className="font-semibold">Thông tin trạm</p>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-muted-foreground">Trạm nhận xe</p>
                                <p className="font-medium">{payment.station_pickup_name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Trạm trả xe</p>
                                <p className="font-medium">
                                    {payment.station_return_name || "Chưa có"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardHeader className="pb-2 flex items-center gap-2 text-green-700">
                            <DollarSign className="h-4 w-4" />
                            <p className="font-semibold">Tổng kết thanh toán</p>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>Tổng chi phí:</span>
                                <span className="font-semibold text-green-700">
                                    {formatCurrency(payment.total_cost)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tiền cọc:</span>
                                <span>{formatCurrency(payment.deposit_amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ngày tạo:</span>
                                <span>{formatDateTime(payment.created_at)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button onClick={onProcess} className="bg-primary text-white">
                        Xử lý thanh toán
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentDetailDialog;
