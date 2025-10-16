import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Car, User, Phone, Clock } from "lucide-react";

const fmt = (d) =>
    d ? new Date(d).toLocaleString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export default function CurrentRentalsList({ rentals = [], loading }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Lượt thuê đang diễn ra
                </CardTitle>
                <CardDescription>Các lượt thuê xe hiện tại tại trạm</CardDescription>
            </CardHeader>
            <CardContent>
                {rentals.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Không có lượt thuê nào đang diễn ra</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã thuê</TableHead>
                                <TableHead>Thông tin xe</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Trạng thái</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rentals.map((r) => (
                                <TableRow key={r.id || r.rental_id}>
                                    <TableCell className="font-medium">#{r.id || r.rental_id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1">
                                            <div className="font-medium flex items-center gap-2">
                                                <Car className="h-4 w-4" />
                                                {r.vehicle?.licensePlate || r.vehicle?.license_plate || "N/A"}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{r.vehicle?.type || "N/A"}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1">
                                            <div className="font-medium flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                {r.renter?.fullName || r.renter?.full_name || "N/A"}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Phone className="h-3 w-3" />
                                                {r.renter?.phone || "N/A"}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1 text-sm">
                                            <div>
                                                <strong>Bắt đầu:</strong> {fmt(r.startTime || r.start_time)}
                                            </div>
                                            <div>
                                                <strong>Dự kiến kết thúc:</strong> {fmt(r.endTime || r.end_time)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="gap-1">
                                            <Clock className="h-3 w-3" />
                                            {r.status === "active" ? "Đang sử dụng" : r.status}
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
