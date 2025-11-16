import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Wallet,
    Eye,
    User,
    Car,
    MapPin,
    Phone,
    DollarSign,
    Flag,
    CheckCircle,
} from "lucide-react";

const PaymentDialogs = (props) => {
    const {
        paymentDialogOpen,
        setPaymentDialogOpen,
        detailDialogOpen,
        setDetailDialogOpen,
        violationDialogOpen,
        setViolationDialogOpen,
        selectedPayment,
        selectedDetail,
        paymentForm,
        setPaymentForm,
        rentalBill,
        loading,
        processPayment,
        violationForm,
        setViolationForm,
        submitViolation,
        handleProcessPayment,
        formatCurrency,
        formatDateTime,
        getPaymentTypeBadge,
        parseNumber,
        manualReturnTime,
        setManualReturnTime,
        onRecalcBill,
    } = props;

    const mapVehicleTypeToVietnamese = (type) => {
        if (!type) return "Không xác định";

        const map = {
            motorbike: "Xe máy",
            car: "Ô tô",
        };

        return map[type.toLowerCase()] || type;
    };

    return (
        <>
            {/* Dialog xử lý thanh toán */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            <Wallet className="h-5 w-5 inline mr-2" /> Xử lý thanh toán
                        </DialogTitle>
                        <DialogDescription>
                            Ghi nhận thanh toán cho: {selectedPayment?.renter_name}
                        </DialogDescription>
                    </DialogHeader>

                    {rentalBill && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Tổng hóa đơn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Chi phí thuê theo hoá đơn:</span>
                                        <span>{formatCurrency(rentalBill.rentalCost || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Bảo hiểm:</span>
                                        <span>{formatCurrency(rentalBill.insurance || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phí vi phạm:</span>
                                        <span className="text-red-600">
                                            {formatCurrency(rentalBill.violationCost || 0)}
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between font-bold text-green-600">
                                        <span>Tổng tiền thực tế:</span>
                                        <span>{formatCurrency(rentalBill.totalBill || 0)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Thời gian thuê */}
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle className="text-sm">Thời gian thuê</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                // ✅ Gom logic xử lý dữ liệu ở đây
                                const start = selectedPayment?.start_time;
                                const end = selectedPayment?.end_time;
                                const returned =
                                    manualReturnTime ||
                                    selectedPayment?.returnTime ||
                                    selectedPayment?.return_time;

                                return (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Thời gian bắt đầu:</span>
                                            <span className="font-medium">
                                                {start ? formatDateTime(start) : "-"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Thời gian kết thúc:</span>
                                            <span className="font-medium">
                                                {end ? formatDateTime(end) : "-"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Thời gian trả thực tế:</span>
                                            <span className="font-medium">
                                                {returned ? formatDateTime(returned) : "Chưa được cập nhật"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>

                    <div className="space-y-2 mt-4">
                        {/* Nhập thời gian trả xe */}
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="return-time">Thời gian trả xe *</Label>
                            <Input
                                id="return-time"
                                type="datetime-local"
                                value={manualReturnTime}
                                onChange={(e) => setManualReturnTime(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Nhập thời gian khách thực tế trả xe để tính đúng tiền (sớm/trễ/đúng giờ)
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onRecalcBill}
                                    disabled={!manualReturnTime}
                                >
                                    Tính lại hóa đơn
                                </Button>
                            </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-center">
                            <p className="text-xs text-emerald-600 uppercase tracking-wide">Tổng cần thanh toán</p>
                            <p className="text-2xl font-bold text-emerald-700 mt-1">
                                {formatCurrency(parseNumber(paymentForm.amount))}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={processPayment} disabled={loading}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Xác nhận
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Chi tiết thanh toán - {selectedDetail?.payment_id}
                        </DialogTitle>
                        <DialogDescription>
                            Thông tin đầy đủ về lượt thuê và thanh toán
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDetail && (
                        <div className="space-y-4">
                            {/* Renter Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Thông tin khách hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-muted-foreground">ID</Label>
                                            <p className="font-medium">#{selectedDetail.renter_id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Họ tên</Label>
                                            <p className="font-medium">{selectedDetail.renter_name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Email</Label>
                                            <p className="font-medium">{selectedDetail.renter_email}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Số điện thoại</Label>
                                            <p className="font-medium flex items-center gap-2">
                                                <Phone className="h-3 w-3" />
                                                {selectedDetail.renter_phone}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Vehicle Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Car className="h-4 w-4" />
                                        Thông tin xe
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-muted-foreground">ID Xe</Label>
                                            <p className="font-medium">#{selectedDetail.vehicle_id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Biển số</Label>
                                            <p className="font-medium text-lg">{selectedDetail.vehicle_license}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Loại xe</Label>
                                            <p className="font-medium">{mapVehicleTypeToVietnamese(selectedDetail.vehicle_type)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Loại pin</Label>
                                            <p className="font-medium capitalize">{selectedDetail.batteryType}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Pin ban đầu</Label>
                                            <p className="font-medium capitalize">{selectedDetail.batteryLevelStart}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Pin còn lại</Label>
                                            <p className="font-medium capitalize">{selectedDetail.batteryLevelEnd}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Hãng xe</Label>
                                            <p className="font-medium">{selectedDetail.vehicle_brand} {selectedDetail.vehicle_model}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Giá thuê</Label>
                                            <p className="font-medium text-green-600">
                                                {formatCurrency(selectedDetail.pricePerHour)}/giờ
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Station Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Thông tin trạm
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-muted-foreground">Trạm lấy xe</Label>
                                            <p className="font-medium">{selectedDetail.station_pickup_name}</p>
                                            <p className="text-xs text-muted-foreground">{selectedDetail.station_pickup_address}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Trạm trả xe</Label>
                                            <p className="font-medium">
                                                {selectedDetail.station_return_name || 'Chưa trả xe'}
                                            </p>
                                            {selectedDetail.station_return_address && (
                                                <p className="text-xs text-muted-foreground">{selectedDetail.station_return_address}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Staff Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Thông tin nhân viên
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-muted-foreground">NV giao xe</Label>
                                            <p className="font-medium">{selectedDetail.staff_pickup_name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {selectedDetail.staff_pickup_phone}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">NV nhận xe</Label>
                                            <p className="font-medium">{selectedDetail.staff_return_name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {selectedDetail.staff_return_phone}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rental Details */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Wallet className="h-4 w-4" />
                                        Chi tiết thuê xe
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-muted-foreground">Mã thuê</Label>
                                            <p className="font-medium">#{selectedDetail.rental_id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Loại thuê</Label>
                                            <p className="font-medium capitalize">{selectedDetail.rental_type}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Thời gian bắt đầu</Label>
                                            <p className="font-medium">{formatDateTime(selectedDetail.start_time)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Thời gian kết thúc</Label>
                                            <p className="font-medium">{formatDateTime(selectedDetail.end_time)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Trạng thái</Label>
                                            <Badge variant="secondary" className="capitalize">
                                                {selectedDetail.rental_status}
                                            </Badge>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">Quãng đường</Label>
                                            <p className="font-medium">
                                                {selectedDetail.odoEnd && selectedDetail.odoStart ? `${selectedDetail.odoEnd - selectedDetail.odoStart} km` : 'Chưa có'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Summary */}
                            <Card className="border-green-200 bg-green-50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2 text-green-900">
                                        <DollarSign className="h-4 w-4" />
                                        Tổng kết thanh toán
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-800">Tổng chi phí:</span>
                                            <span className="font-bold text-lg text-green-900">
                                                {formatCurrency(selectedDetail.total_cost)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-800">Tiền cọc:</span>
                                            <span className="font-medium text-green-900">
                                                {formatCurrency(selectedDetail.deposit_amount)}
                                            </span>
                                        </div>
                                        <hr className="border-green-200" />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-800">Tiền thuê:</span>
                                            <span className="font-medium text-green-900">
                                                {formatCurrency(selectedDetail.rentalCost)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-800">Tiền bảo hiểm:</span>
                                            <span className="font-medium text-green-900">
                                                {formatCurrency(selectedDetail.insurance)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-800">Trạng thái cọc:</span>
                                            <Badge variant="outline" className="capitalize">
                                                {selectedDetail.deposit_status === "held"
                                                    ? "Đang giữ"
                                                    : selectedDetail.deposit_status === "returned"
                                                        ? "Đã trả"
                                                        : "Không xác định"}
                                            </Badge>
                                        </div>
                                        <hr className="border-green-200" />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-800">Loại thanh toán:</span>
                                            {getPaymentTypeBadge(selectedDetail.payment_type)}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-800">Ngày tạo:</span>
                                            <span className="font-medium text-green-900">
                                                {formatDateTime(selectedDetail.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                            Đóng
                        </Button>
                        <Button onClick={() => {
                            setDetailDialogOpen(false);
                            handleProcessPayment(selectedDetail);
                        }}>
                            <Wallet className="h-4 w-4 mr-2" />
                            Xử lý thanh toán
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Violation Dialog */}
            <Dialog open={violationDialogOpen} onOpenChange={setViolationDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Flag className="h-5 w-5" />
                            Ghi nhận vi phạm
                        </DialogTitle>
                        <DialogDescription>
                            Ghi nhận vi phạm khi khách hàng trả xe
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rental-id">Mã lượt thuê *</Label>
                            <Input
                                id="rental-id"
                                type="number"
                                min="0"
                                placeholder="Nhập mã lượt thuê"
                                value={violationForm.rental_id}
                                onChange={(e) => {
                                    let val = e.target.value;

                                    // Case user cố gõ âm (-1) bằng copy/paste
                                    if (val < 0) val = 0;

                                    setViolationForm(prev => ({
                                        ...prev,
                                        rental_id: val
                                    }));
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="violation-description">Mô tả vi phạm *</Label>
                            <Textarea
                                id="violation-description"
                                placeholder="Mô tả chi tiết vi phạm (ví dụ: làm xước xe, mất đồ, v.v.)"
                                value={violationForm.description}
                                onChange={(e) => setViolationForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fine-amount">Số tiền phạt (VND) *</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="fine-amount"
                                    type="text"
                                    placeholder="Nhập số tiền phạt"
                                    value={violationForm.fine_amount}
                                    onChange={(e) => {
                                        let raw = e.target.value;

                                        // Bỏ ký tự không phải số
                                        raw = raw.replace(/[^\d]/g, "");

                                        // Chặn số âm (dù user cố tình)
                                        if (!raw || Number(raw) < 0) raw = "0";

                                        // Format hiển thị: 1.000.000
                                        const formatted = Number(raw).toLocaleString("vi-VN");

                                        setViolationForm(prev => ({
                                            ...prev,
                                            fine_amount: formatted,   // hiển thị có dấu chấm
                                            fine_amount_raw: raw      // lưu số thật để gửi BE
                                        }));
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Vi phạm sẽ được tính vào hóa đơn thanh toán
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViolationDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={submitViolation} disabled={loading}>
                            <Flag className="h-4 w-4 mr-2" />
                            Ghi nhận vi phạm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PaymentDialogs;