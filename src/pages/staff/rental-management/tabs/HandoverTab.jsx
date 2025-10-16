import React, { useMemo, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Car, Calendar, Clock, User, Phone, MapPin, DollarSign, CheckCircle } from "lucide-react";

import staffRentalService from "@/services/staff/staffRentalService";
import PickupDialog from "../dialogs/PickupDialog";
import CheckInDialog from "../dialogs/CheckInDialog"; // (sẽ gửi ở phần 2)

export default function HandoverTab({
    reservations = [],
    pendingRentals = [],
    fetchReservations,
    fetchPendingRentals,
    fetchInUseRentals,
    toast,
    loading,
    searchTerm,
}) {
    // dialogs state
    const [pickupOpen, setPickupOpen] = useState(false);
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount ?? 0);

    const formatDateTime = (dateString) =>
        new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

    // --- Filters ---
    const filteredReservations = useMemo(() => {
        const base = reservations.filter((r) => r?.status === "pending");
        const notCheckedIn = base.filter((rs) => {
            // loại bỏ reservation đã có rental tương ứng
            return !pendingRentals.some(
                (rent) =>
                    rent?.reservationId === rs?.id ||
                    (rent?.vehicle?.id === rs?.vehicle?.id &&
                        rent?.renter?.id === rs?.renter?.id &&
                        rent?.rentalType === "booking")
            );
        });
        if (!searchTerm) return notCheckedIn;
        const q = searchTerm.toLowerCase();
        return notCheckedIn.filter(
            (r) =>
                r?.renter?.fullName?.toLowerCase().includes(q) ||
                r?.renter?.phone?.includes(searchTerm) ||
                r?.vehicle?.licensePlate?.toLowerCase().includes(q) ||
                String(r?.id || "").includes(searchTerm)
        );
    }, [reservations, pendingRentals, searchTerm]);

    const filteredPendingRentals = useMemo(() => {
        if (!searchTerm) return pendingRentals;
        const q = searchTerm.toLowerCase();
        return pendingRentals.filter(
            (r) =>
                r?.renter?.fullName?.toLowerCase().includes(q) ||
                r?.renter?.phone?.includes(searchTerm) ||
                r?.vehicle?.licensePlate?.toLowerCase().includes(q) ||
                String(r?.id || "").includes(searchTerm)
        );
    }, [pendingRentals, searchTerm]);

    // --- Handlers ---
    const openPickup = (rental) => {
        setSelectedRental(rental);
        setPickupOpen(true);
    };

    const openCheckIn = (reservation) => {
        setSelectedReservation(reservation);
        setCheckInOpen(true);
    };

    const handleHoldDeposit = async (rentalId, depositAmount) => {
        try {
            const res = await staffRentalService.holdDeposit(rentalId, { amount: depositAmount });
            toast({ title: "Thành công", description: "Đã ghi nhận đặt cọc" });
            fetchPendingRentals?.();
        } catch (err) {
            toast({
                title: "Lỗi",
                description: err?.message || "Không thể ghi nhận đặt cọc",
                variant: "destructive",
            });
        }
    };

    const handlePickupSuccess = async () => {
        setPickupOpen(false);
        setSelectedRental(null);
        await Promise.all([fetchPendingRentals?.(), fetchInUseRentals?.()]);
    };

    const handleCheckInSuccess = async () => {
        setCheckInOpen(false);
        setSelectedReservation(null);
        await Promise.all([fetchReservations?.(), fetchPendingRentals?.(), fetchInUseRentals?.()]);
    };

    return (
        <div className="space-y-4">
            {/* Reservations Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Danh sách đặt chỗ chờ check-in
                    </CardTitle>
                    <CardDescription>Các đặt chỗ từ khách hàng cần xác nhận và giao xe</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredReservations.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm ? "Không tìm thấy đặt chỗ nào phù hợp" : "Không có đặt chỗ nào chờ check-in"}
                            </p>
                            {!searchTerm && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Các đặt chỗ đã được check-in sẽ xuất hiện ở phần “Danh sách xe cần giao” bên dưới
                                </p>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thông tin xe</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Thời gian đặt</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReservations.map((reservation) => (
                                    <TableRow key={reservation.id}>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    <Car className="h-4 w-4" />
                                                    {reservation?.vehicle?.licensePlate}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {reservation?.vehicle?.brand} {reservation?.vehicle?.model}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{reservation?.vehicle?.type}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {reservation?.renter?.fullName}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Phone className="h-3 w-3" />
                                                    {reservation?.renter?.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium text-sm">
                                                        Bắt đầu: {formatDateTime(reservation?.reservedStartTime)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-sm text-muted-foreground">
                                                        Kết thúc: {formatDateTime(reservation?.reservedEndTime)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Đặt lúc: {formatDateTime(reservation?.createdAt)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={reservation?.status === "cancelled" ? "destructive" : "default"}>
                                                {reservation?.status === "cancelled"
                                                    ? "Đã hủy"
                                                    : reservation?.status === "confirmed"
                                                        ? "Đã xác nhận"
                                                        : reservation?.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {(reservation?.status === "confirmed" || reservation?.status === "pending") && (
                                                <Button size="sm" onClick={() => openCheckIn(reservation)} disabled={loading} className="w-full">
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Check-in
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pending Rentals Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Danh sách xe cần giao
                    </CardTitle>
                    <CardDescription>
                        Các lượt thuê đã được check-in và sẵn sàng giao xe cho khách hàng. Ghi nhận đặt cọc trước khi giao xe.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredPendingRentals.length === 0 ? (
                        <div className="text-center py-8">
                            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">{searchTerm ? "Không tìm thấy xe nào phù hợp" : "Không có xe nào cần giao"}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thông tin xe</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Thời gian giao</TableHead>
                                    <TableHead>Đặt cọc</TableHead>
                                    <TableHead>Tổng tiền</TableHead>
                                    <TableHead>Trạng thái cọc</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPendingRentals.map((rental) => (
                                    <TableRow key={rental.id}>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    <Car className="h-4 w-4" />
                                                    {rental?.vehicle?.licensePlate}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {rental?.vehicle?.brand} {rental?.vehicle?.model}
                                                </div>
                                                {rental?.rentalType === "booking" && (
                                                    <Badge variant="outline" className="w-fit">
                                                        Đặt trước
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {rental?.renter?.fullName}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Phone className="h-3 w-3" />
                                                    {rental?.renter?.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium">{formatDateTime(rental?.startTime)}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <MapPin className="h-3 w-3" />
                                                    {rental?.stationPickup?.name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="font-medium">{formatCurrency(rental?.depositAmount)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="font-medium">{formatCurrency(rental?.totalCost)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    rental?.depositStatus === "held"
                                                        ? "default"
                                                        : rental?.depositStatus === "pending"
                                                            ? "secondary"
                                                            : rental?.depositStatus === "returned"
                                                                ? "outline"
                                                                : "destructive"
                                                }
                                            >
                                                {rental?.depositStatus === "held"
                                                    ? "Đã nhận cọc"
                                                    : rental?.depositStatus === "pending"
                                                        ? "Chờ nhận cọc"
                                                        : rental?.depositStatus === "returned"
                                                            ? "Đã trả cọc"
                                                            : rental?.depositStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                {rental?.depositStatus === "pending" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleHoldDeposit(rental.id, rental.depositAmount)}
                                                        disabled={loading}
                                                        className="w-full"
                                                    >
                                                        <DollarSign className="h-4 w-4 mr-2" />
                                                        Ghi nhận cọc
                                                    </Button>
                                                )}
                                                {rental?.depositStatus === "held" && (
                                                    <Button size="sm" onClick={() => openPickup(rental)} disabled={loading} className="w-full">
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Xác nhận giao xe
                                                    </Button>
                                                )}
                                                {rental?.depositStatus === "pending" && (
                                                    <div className="text-center py-2">
                                                        <p className="text-xs text-muted-foreground">Ghi nhận cọc trước khi giao xe</p>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <PickupDialog
                open={pickupOpen}
                onOpenChange={setPickupOpen}
                rental={selectedRental}
                toast={toast}
                onSuccess={handlePickupSuccess}
            />

            <CheckInDialog
                open={checkInOpen}
                onOpenChange={setCheckInOpen}
                reservation={selectedReservation}
                toast={toast}
                onSuccess={handleCheckInSuccess}
            />
        </div>
    );
}
