import React, { useMemo } from "react";
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
import { CheckCircle, Car, User, Phone, Clock, MapPin } from "lucide-react";
import staffRentalService from "@/services/staff/staffRentalService";

export default function ReturnTab({ rentals = [], fetchReturningRentals, toast, searchTerm, loading }) {
    const formatDateTime = (dateString) =>
        new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

    const filteredRentals = useMemo(() => {
        if (!searchTerm) return rentals;
        const q = searchTerm.toLowerCase();
        return rentals.filter(
            (r) =>
                r?.renter?.fullName?.toLowerCase().includes(q) ||
                r?.renter?.phone?.includes(searchTerm) ||
                r?.vehicle?.licensePlate?.toLowerCase().includes(q)
        );
    }, [rentals, searchTerm]);

    const handleConfirmReturn = async (rental) => {
        try {
            const formData = new FormData();
            formData.append(
                "data",
                JSON.stringify({
                    rentalId: rental?.id,
                    checkType: "return",
                    conditionReport: "Xe được trả về trong tình trạng bình thường",
                })
            );

            const blob = new Blob(["placeholder"], { type: "text/plain" });
            formData.append("photo", blob, "photo.txt");
            formData.append("staff_signature", blob, "staff.txt");
            formData.append("customer_signature", blob, "customer.txt");

            await staffRentalService.confirmReturn(formData);

            toast({ title: "Thành công", description: "Xác nhận nhận xe thành công!" });
            fetchReturningRentals?.();
        } catch (err) {
            toast({
                title: "Lỗi",
                description: err?.message || "Không thể xác nhận nhận xe",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Nhận xe (khách trả)
                </CardTitle>
                <CardDescription>Danh sách xe đang được thuê và sẵn sàng trả</CardDescription>
            </CardHeader>
            <CardContent>
                {filteredRentals.length === 0 ? (
                    <div className="text-center py-8">
                        <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {searchTerm ? "Không tìm thấy xe nào phù hợp" : "Không có xe nào cần nhận"}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Thông tin xe</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Thời gian thuê</TableHead>
                                <TableHead>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRentals.map((rental) => (
                                <TableRow key={rental.id}>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1">
                                            <div className="font-medium flex items-center gap-2">
                                                <Car className="h-4 w-4" />
                                                {rental?.vehicle?.licensePlate}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{rental?.vehicle?.type}</div>
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
                                                <Clock className="h-4 w-4" />
                                                <span className="text-sm">Bắt đầu: {formatDateTime(rental?.startTime)}</span>
                                            </div>
                                            {rental?.endTime && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-orange-500" />
                                                    <span className="text-sm text-orange-600">
                                                        Dự kiến: {formatDateTime(rental?.endTime)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <MapPin className="h-3 w-3" />
                                                {rental?.stationReturn?.name || rental?.stationPickup?.name}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" onClick={() => handleConfirmReturn(rental)} disabled={loading} className="w-full">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Xác nhận nhận xe
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
