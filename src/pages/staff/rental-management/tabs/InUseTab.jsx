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
import { Badge } from "@/components/ui/badge";
import { Car, User, Phone, Calendar, Clock, MapPin, DollarSign } from "lucide-react";

export default function InUseTab({ rentals = [], searchTerm, loading }) {
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

    const filteredRentals = useMemo(() => {
        if (!searchTerm) return rentals;
        const q = searchTerm.toLowerCase();
        return rentals.filter(
            (r) =>
                r?.renter?.fullName?.toLowerCase().includes(q) ||
                r?.renter?.phone?.includes(searchTerm) ||
                r?.vehicle?.licensePlate?.toLowerCase().includes(q) ||
                String(r?.id || "").includes(searchTerm)
        );
    }, [rentals, searchTerm]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Danh sách xe đang cho thuê
                </CardTitle>
                <CardDescription>
                    Các xe hiện đang được khách hàng sử dụng (status: in_use)
                </CardDescription>
            </CardHeader>
            <CardContent>
                {filteredRentals.length === 0 ? (
                    <div className="text-center py-8">
                        <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {searchTerm ? "Không tìm thấy xe nào phù hợp" : "Không có xe nào đang được cho thuê"}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Thông tin xe</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Thời gian thuê</TableHead>
                                <TableHead>Đặt cọc</TableHead>
                                <TableHead>Tổng tiền</TableHead>
                                <TableHead>Trạng thái</TableHead>
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
                                                <span className="font-medium text-sm">
                                                    Bắt đầu: {formatDateTime(rental?.startTime)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span className="text-sm text-muted-foreground">
                                                    Kết thúc: {formatDateTime(rental?.endTime)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <MapPin className="h-3 w-3" />
                                                {rental?.stationPickup?.name}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="font-medium">{formatCurrency(rental?.depositAmount)}</span>
                                            </div>
                                            <Badge variant="default" className="w-fit">
                                                {rental?.depositStatus === "held" ? "Đã nhận cọc" : rental?.depositStatus}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span className="font-medium">{formatCurrency(rental?.totalCost)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                            Đang sử dụng
                                        </Badge>
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
