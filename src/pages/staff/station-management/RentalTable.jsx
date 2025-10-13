import React from "react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Wrench } from "lucide-react";

export default function RentalTable({
    rentals,
    loading,
    onReportViolation,
    onReportIncident,
}) {
    return (
        <div className="mt-4">
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    <span className="ml-2 text-sm text-gray-500">
                        Đang tải danh sách lượt thuê...
                    </span>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Người thuê</TableHead>
                            <TableHead>Xe</TableHead>
                            <TableHead>Ngày bắt đầu</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Hành động</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {rentals.length > 0 ? (
                            rentals.map((rental) => (
                                <TableRow key={rental.id}>
                                    <TableCell>{rental.id}</TableCell>
                                    <TableCell>{rental.userName}</TableCell>
                                    <TableCell>{rental.vehicleName}</TableCell>
                                    <TableCell>
                                        {new Date(rental.startDate).toLocaleString("vi-VN")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                rental.status === "ACTIVE"
                                                    ? "success"
                                                    : rental.status === "PENDING"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                        >
                                            {rental.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onReportViolation(rental)}
                                        >
                                            <AlertTriangle className="h-4 w-4 mr-1" />
                                            Vi phạm
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onReportIncident(rental)}
                                        >
                                            <Wrench className="h-4 w-4 mr-1" />
                                            Sự cố
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-6">
                                    Không có lượt thuê nào
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
