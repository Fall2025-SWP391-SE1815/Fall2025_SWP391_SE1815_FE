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
import { Loader2, Wrench } from "lucide-react";

export default function VehicleTable({ vehicles, loading, onUpdateStatus }) {
    return (
        <div className="mt-4">
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    <span className="ml-2 text-sm text-gray-500">
                        Đang tải danh sách xe...
                    </span>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tên xe</TableHead>
                            <TableHead>Loại xe</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Vị trí</TableHead>
                            <TableHead>Hành động</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {vehicles.length > 0 ? (
                            vehicles.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell>{vehicle.id}</TableCell>
                                    <TableCell>{vehicle.name}</TableCell>
                                    <TableCell>{vehicle.type}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                vehicle.status === "AVAILABLE"
                                                    ? "success"
                                                    : vehicle.status === "IN_USE"
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                        >
                                            {vehicle.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{vehicle.stationName || "N/A"}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onUpdateStatus(vehicle)}
                                        >
                                            <Wrench className="h-4 w-4 mr-1" />
                                            Cập nhật
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-6">
                                    Không có xe nào trong trạm
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
