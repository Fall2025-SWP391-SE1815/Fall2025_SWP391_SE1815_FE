import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    RefreshCw,
    Car,
    Gauge,
    CheckCircle2,
    AlertTriangle,
    Warehouse,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import staffVehicleService from "@/services/staff/staffVehicleService";

export default function VehicleManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const result = await staffVehicleService.getVehicles();

            if (result.success) {
                setVehicles(result.data);
            } else {
                throw new Error(result.message || "Không thể tải danh sách xe.");
            }
        } catch (error) {
            toast({
                title: "Lỗi tải dữ liệu",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    // ✅ Thống kê số lượng xe (sử dụng status chữ thường)
    const totalVehicles = vehicles.length;
    const available = vehicles.filter((v) => v.status?.toLowerCase() === "available").length;
    const rented = vehicles.filter((v) => v.status?.toLowerCase() === "rented" || v.status?.toLowerCase() === "in_use").length;
    const maintenance = vehicles.filter((v) => v.status?.toLowerCase() === "maintenance").length;

    // ✅ Badge hiển thị trạng thái rõ ràng
    const getStatusBadge = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case "available":
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Sẵn sàng
                    </span>
                );
            case "rented":
            case "in_use":
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Đang thuê
                    </span>
                );
            case "maintenance":
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        Bảo trì
                    </span>
                );
            case "reserved":
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        Đã đặt trước
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Không xác định
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold text-primary">Quản lý xe</h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi và quản lý toàn bộ xe trong hệ thống
                    </p>
                </div>
                <Button onClick={fetchVehicles} disabled={loading} className="rounded-xl">
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    Làm mới
                </Button>
            </header>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng số xe"
                    value={totalVehicles}
                    icon={<Gauge className="h-5 w-5 text-indigo-600" />}
                    note="Tổng xe trong hệ thống"
                />
                <StatCard
                    title="Xe khả dụng"
                    value={available}
                    icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                    note="Sẵn sàng cho thuê"
                />
                <StatCard
                    title="Đang thuê"
                    value={rented}
                    icon={<Car className="h-5 w-5 text-blue-600" />}
                    note="Xe đang được sử dụng"
                />
                <StatCard
                    title="Đang bảo trì"
                    value={maintenance}
                    icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
                    note="Xe đang được sửa chữa"
                />
            </div>

            {/* Table */}
            <Card className="rounded-2xl border border-gray-100 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <Warehouse className="h-5 w-5 text-primary" />
                        Danh sách xe ({vehicles.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 text-gray-600">
                                    <TableHead>Biển số</TableHead>
                                    <TableHead>Hãng xe</TableHead>
                                    <TableHead>Mẫu xe</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Trạm</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles.length > 0 ? (
                                    vehicles.map((v) => (
                                        <TableRow
                                            key={v.id}
                                            className="hover:bg-primary/5 transition-colors"
                                        >
                                            <TableCell className="font-medium">
                                                {v.licensePlate || v.license_plate || "—"}
                                            </TableCell>
                                            <TableCell>{v.brand || "—"}</TableCell>
                                            <TableCell>{v.model || "—"}</TableCell>
                                            <TableCell>{getStatusBadge(v.status)}</TableCell>
                                            <TableCell>{v.station?.name || "—"}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            {loading
                                                ? "Đang tải dữ liệu..."
                                                : "Không có xe nào trong hệ thống."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/* --- Component thống kê --- */
const StatCard = ({ title, value, icon, note }) => (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{note}</p>
        </CardContent>
    </Card>
);
