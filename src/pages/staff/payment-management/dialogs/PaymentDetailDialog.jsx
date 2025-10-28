import React, { useEffect, useState } from "react";
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
import {
    Eye,
    Phone,
    Car,
    MapPin,
    DollarSign,
    Calculator,
} from "lucide-react";
import staffRentalService from "@/services/staff/staffRentalService";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api/apiConfig";

const PaymentDetailDialog = ({ open, onOpenChange, payment, onProcess }) => {
    const { toast } = useToast();
    const [loadingBill, setLoadingBill] = useState(false);
    const [bill, setBill] = useState(null);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(value || 0);

    const formatDateTime = (dateString) =>
        new Date(dateString).toLocaleString("vi-VN");

    // 🧮 Gọi API tính bill khi mở dialog
    useEffect(() => {
        const fetchBill = async () => {
            const rentalId = payment?.rental_id || payment?.id;
            if (!rentalId) return;

            try {
                setLoadingBill(true);
                const res = await staffRentalService.calculateBill(rentalId, {
                    returnTime: new Date().toISOString(),
                });
                setBill(res);
            } catch (err) {
                toast({
                    title: "Lỗi khi tính bill",
                    description: err.message || "Không thể lấy tổng bill.",
                    variant: "destructive",
                });
            } finally {
                setLoadingBill(false);
            }
        };
        if (open && payment) fetchBill();
    }, [open, payment]);

    if (!payment) return null;

    const rental = bill?.rental;
    const rentalCost = bill?.rentalCost ?? 0;
    const violationCost = bill?.violationCost ?? 0;
    const totalBill = bill?.totalBill ?? 0;

    const imageSrc =
        rental?.vehicle?.imageUrl &&
        (rental.vehicle.imageUrl.startsWith("http")
            ? rental.vehicle.imageUrl
            : `${API_BASE_URL}${rental.vehicle.imageUrl}`);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-0">
                <DialogHeader className="p-5 border-b">
                    <DialogTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Chi tiết thanh toán #{payment.rental_id || payment.id}
                    </DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết lượt thuê và tổng chi phí
                    </DialogDescription>
                </DialogHeader>

                {/* Nội dung có thanh cuộn */}
                <div className="max-h-[650px] overflow-y-auto px-6 py-4 space-y-4">
                    {/* Khách hàng */}
                    <Card className="rounded-xl border border-primary/10 bg-primary/5">
                        <CardHeader className="pb-2 flex flex-row justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-800 text-lg">
                                    {rental?.renter?.fullName || payment.renter?.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {rental?.renter?.phone || payment.renter?.phone}
                                </p>
                            </div>
                            <Badge variant="outline">
                                ID #{rental?.renter?.id || payment.renter?.id}
                            </Badge>
                        </CardHeader>
                    </Card>

                    {/* Xe */}
                    <Card>
                        <CardHeader className="pb-2 flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            <p className="font-semibold">Thông tin xe</p>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3 text-sm">
                            <p>
                                <span className="text-muted-foreground">Biển số:</span>{" "}
                                <strong>
                                    {rental?.vehicle?.licensePlate || payment.vehicle?.licensePlate}
                                </strong>
                            </p>
                            <p>
                                <span className="text-muted-foreground">Hãng xe:</span>{" "}
                                {rental?.vehicle?.brand || payment.vehicle?.brand}{" "}
                                {rental?.vehicle?.model || payment.vehicle?.model}
                            </p>
                            <p>
                                <span className="text-muted-foreground">Loại xe:</span>{" "}
                                {rental?.vehicle?.type || payment.vehicle?.type}
                            </p>
                            <p>
                                <span className="text-muted-foreground">Giá thuê:</span>{" "}
                                {formatCurrency(
                                    rental?.vehicle?.pricePerHour || payment.vehicle?.pricePerHour
                                )}
                                /giờ
                            </p>

                            {/* Ảnh xe */}
                            {imageSrc && (
                                <div className="col-span-2 flex justify-center">
                                    <img
                                        src={imageSrc}
                                        alt="Xe"
                                        className="w-64 h-40 object-cover rounded-lg border shadow-sm"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Trạm */}
                    <Card>
                        <CardHeader className="pb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <p className="font-semibold">Thông tin trạm</p>
                        </CardHeader>
                        <CardContent className="text-sm grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-muted-foreground">Trạm nhận xe</p>
                                <p className="font-medium text-gray-800">
                                    {rental?.stationPickup?.name || "Không rõ"}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Trạm trả xe</p>
                                <p className="font-medium text-gray-800">
                                    {rental?.stationReturn
                                        ? rental.stationReturn.name
                                        : "Chưa trả xe"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tổng kết */}
                    <Card className="border-green-200 bg-green-50 rounded-xl">
                        <CardHeader className="pb-2 flex items-center gap-2 text-green-700">
                            <DollarSign className="h-4 w-4" />
                            <p className="font-semibold">Tổng kết thanh toán</p>
                            {loadingBill && (
                                <span className="text-xs text-muted-foreground">(Đang tính...)</span>
                            )}
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>Chi phí thuê xe:</span>
                                <span>{formatCurrency(rentalCost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vi phạm:</span>
                                <span>{formatCurrency(violationCost)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2">
                                <span className="font-semibold">Tổng cộng:</span>
                                <span className="font-bold text-green-700">
                                    {formatCurrency(totalBill)}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Tiền cọc:</span>
                                <span>{formatCurrency(rental?.depositAmount || 0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Ngày tạo:</span>
                                <span>{formatDateTime(rental?.createdAt)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <DialogFooter className="p-5 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button
                        onClick={onProcess}
                        className="bg-primary text-white"
                        disabled={loadingBill}
                    >
                        {loadingBill ? (
                            <>
                                <Calculator className="h-4 w-4 mr-2 animate-spin" />
                                Đang tính bill...
                            </>
                        ) : (
                            "Xử lý thanh toán"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentDetailDialog;