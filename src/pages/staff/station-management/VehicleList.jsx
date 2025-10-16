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
import { Loader2, Eye, Edit, Car } from "lucide-react";

export default function VehicleList({ vehicles = [], loading, onDetail, onEdit }) {
    const getStatusBadge = (status) => {
        const map = {
            available: { label: "Khả dụng", variant: "default", tone: "bg-green-50 text-green-800" },
            rented: { label: "Đang thuê", variant: "secondary", tone: "bg-amber-50 text-amber-800" },
            maintenance: { label: "Bảo trì", variant: "destructive", tone: "bg-red-50 text-red-800" },
        };
        const cfg = map[status] || { label: status, variant: "outline", tone: "bg-gray-50 text-gray-700" };
        return (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${cfg.tone}`}>
                {cfg.label}
            </span>
        );
    };

    return (
        <div className="mt-4 bg-surfaceContainer rounded-2xl shadow-sm border border-outlineVariant p-4 transition-colors">
            {loading ? (
                <div className="flex items-center justify-center py-10 text-onSurfaceVariant">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 text-sm">Đang tải danh sách xe...</span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table className="min-w-full text-sm">
                        <TableHeader>
                            <TableRow className="bg-surfaceContainerHigh text-onSurfaceVariant">
                                <TableHead className="font-medium">Biển số</TableHead>
                                <TableHead>Hãng / Model</TableHead>
                                <TableHead>Loại xe</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Trạm</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.length > 0 ? (
                                vehicles.map((v) => (
                                    <TableRow
                                        key={v.id}
                                        className="hover:bg-surfaceContainerLow transition-all rounded-lg"
                                    >
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Car className="h-4 w-4 text-primary" />
                                            {v.licensePlate || v.license_plate || "N/A"}
                                        </TableCell>
                                        <TableCell>{v.brand} {v.model}</TableCell>
                                        <TableCell>{v.type}</TableCell>
                                        <TableCell>{getStatusBadge(v.status)}</TableCell>
                                        <TableCell>{v.station?.name || "N/A"}</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full border-outlineVariant hover:bg-surfaceContainerHigh"
                                                onClick={() => onDetail(v)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" /> Xem
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                                                onClick={() => onEdit(v)}
                                            >
                                                <Edit className="h-4 w-4 mr-1" /> Sửa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-sm text-onSurfaceVariant py-6"
                                    >
                                        Không có xe nào trong trạm
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
