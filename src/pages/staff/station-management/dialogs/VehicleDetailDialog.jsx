import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Car,
    MapPin,
    DollarSign,
    Zap,
    Gauge,
    Edit,
    Wrench,
    Clock,
    Activity,
} from "lucide-react";

const StatusBadge = ({ status }) => {
    const config = {
        available: { label: "Khả dụng", color: "bg-green-100 text-green-800" },
        rented: { label: "Đang thuê", color: "bg-amber-100 text-amber-800" },
        maintenance: { label: "Bảo trì", color: "bg-red-100 text-red-800" },
    }[status] || { label: status || "Không xác định", color: "bg-gray-100 text-gray-800" };

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
        >
            {config.label}
        </span>
    );
};

const currency = (v) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(v ?? 0);

export default function VehicleDetailDialog({ open, onOpenChange, vehicle, onEdit }) {
    if (!vehicle) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Car className="h-5 w-5 text-primary" />
                        Chi tiết xe - {vehicle.licensePlate}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Thông tin chi tiết của xe tại trạm
                    </DialogDescription>
                </DialogHeader>

                {/* Nội dung chi tiết */}
                <div className="space-y-6 mt-2 text-sm">
                    {/* Thông tin cơ bản */}
                    <section className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold text-gray-800 mb-3">Thông tin cơ bản</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-muted-foreground text-xs">ID xe</Label>
                                <p className="font-medium">#{vehicle.id}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Biển số</Label>
                                <p className="font-semibold text-base">{vehicle.licensePlate}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Loại xe</Label>
                                <p className="font-medium capitalize">{vehicle.type}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Trạng thái</Label>
                                <div className="mt-1">
                                    <StatusBadge status={vehicle.status} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Thông số kỹ thuật */}
                    <section className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold text-gray-800 mb-3">Thông số kỹ thuật</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-muted-foreground text-xs">Hãng xe</Label>
                                <p className="font-medium">{vehicle.brand}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Model</Label>
                                <p className="font-medium">{vehicle.model}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                                    <Zap className="h-3 w-3" /> Dung lượng pin (Ah)
                                </Label>
                                <p className="font-medium">{vehicle.capacity}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                                    <Gauge className="h-3 w-3" /> Quãng đường/lần sạc (km)
                                </Label>
                                <p className="font-medium">{vehicle.rangePerFullCharge}</p>
                            </div>
                        </div>
                    </section>

                    {/* Giá thuê */}
                    <section className="border rounded-lg p-4 bg-green-50">
                        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-1">
                            <DollarSign className="h-4 w-4" /> Giá thuê
                        </h3>
                        <p className="text-lg font-bold text-green-900">
                            {currency(vehicle.pricePerHour)}/giờ
                        </p>
                    </section>

                    {/* Thông tin trạm */}
                    {vehicle.station && (
                        <section className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> Thông tin trạm
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-muted-foreground text-xs">Tên trạm</Label>
                                    <p className="font-medium">{vehicle.station.name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Địa chỉ</Label>
                                    <p className="font-medium">{vehicle.station.address}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Trạng thái</Label>
                                    <StatusBadge
                                        status={
                                            vehicle.station.status === "active"
                                                ? "available"
                                                : "maintenance"
                                        }
                                    />
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <DialogFooter className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button onClick={() => onEdit?.()}>
                        <Edit className="h-4 w-4 mr-1" /> Chỉnh sửa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
