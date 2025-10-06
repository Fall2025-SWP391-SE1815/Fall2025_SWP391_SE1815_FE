import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Car, MapPin, Battery, DollarSign, Users, Gauge } from 'lucide-react';

export default function VehicleDetailDialog({ vehicle, open, onOpenChange }) {
    if (!vehicle) return null;

    const getStatusBadge = (status) => {
        const statusMap = {
            'available': { label: 'Có sẵn', variant: 'default' },
            'rented': { label: 'Đang thuê', variant: 'secondary' },
            'maintenance': { label: 'Bảo trì', variant: 'destructive' },
            'reserved': { label: 'Đã đặt', variant: 'outline' }
        };

        const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    };

    const getVehicleTypeLabel = (type) => {
        return type === 'car' ? 'Ô tô' : 'Xe máy';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Chi tiết phương tiện
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header với biển số và trạng thái */}
                    <div className="flex items-center justify-between pb-4 border-b">
                        <div>
                            <h3 className="text-2xl font-bold">{vehicle.licensePlate}</h3>
                            <p className="text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                        </div>
                        <div>
                            {getStatusBadge(vehicle.status)}
                        </div>
                    </div>

                    {/* Grid thông tin chi tiết */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Loại xe</p>
                                    <p className="font-medium">{getVehicleTypeLabel(vehicle.type)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Dung lượng pin</p>
                                    <p className="font-medium">{vehicle.capacity} kWh</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Battery className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Quãng đường/sạc đầy</p>
                                    <p className="font-medium">{vehicle.rangePerFullCharge} km</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Giá thuê</p>
                                    <p className="font-medium text-lg">{formatCurrency(vehicle.pricePerHour)}/giờ</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Trạm</p>
                                    <p className="font-medium">{vehicle.station?.name || 'Chưa phân bổ'}</p>
                                    {vehicle.station?.address && (
                                        <p className="text-sm text-muted-foreground mt-1">{vehicle.station.address}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin trạm chi tiết */}
                    {vehicle.station && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <h4 className="font-semibold text-sm">Thông tin trạm</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">ID Trạm:</span>
                                    <span className="ml-2 font-medium">{vehicle.station.id}</span>
                                </div>
                                {vehicle.station.latitude && vehicle.station.longitude && (
                                    <div>
                                        <span className="text-muted-foreground">Tọa độ:</span>
                                        <span className="ml-2 font-medium">
                                            {vehicle.station.latitude.toFixed(5)}, {vehicle.station.longitude.toFixed(5)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Thông tin bổ sung */}
                    <div className="pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">ID Phương tiện:</span>
                                <span className="ml-2 font-medium">{vehicle.id}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Hãng xe:</span>
                                <span className="ml-2 font-medium">{vehicle.brand}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
