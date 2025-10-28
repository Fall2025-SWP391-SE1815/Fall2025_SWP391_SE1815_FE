import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import { Car, Clock, User, MapPin, CheckCircle, RefreshCw, Phone, Calendar, DollarSign } from 'lucide-react';

import ReturnDialog from '../dialogs/ReturnDialog';

export default function VehicleReturn() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [returningRentals, setReturningRentals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [openReturn, setOpenReturn] = useState(false);
    const [selectedReturnRental, setSelectedReturnRental] = useState(null);

    useEffect(() => {
        fetchReturningRentals();
    }, []);

    const fetchReturningRentals = async () => {
        try {
            setLoading(true);
            const response = await staffRentalService.getRentals({ status: 'in_use' });
            setReturningRentals(response || []);
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể tải danh sách xe cần nhận',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    const formatDateTime = (d) =>
        new Date(d).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    const getVehicleTypeName = (type) => {
        const types = { car: 'Ô tô', motorbike: 'Xe máy', bicycle: 'Xe đạp', scooter: 'Xe scooter' };
        return types[type?.toLowerCase()] || type;
    };

    const filterRentals = (list) => {
        if (!searchTerm) return list;
        const q = searchTerm.toLowerCase();
        return list.filter((rental) =>
            rental?.renter?.fullName?.toLowerCase()?.includes(q) ||
            rental?.renter?.phone?.includes(searchTerm) ||
            rental?.vehicle?.licensePlate?.toLowerCase()?.includes(q) ||
            String(rental?.id).includes(searchTerm)
        );
    };

    const items = filterRentals(returningRentals);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nhận xe từ khách hàng</h1>
                    <p className="text-muted-foreground">Xác nhận nhận xe và lập biên bản trả xe</p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Tìm khách hàng, SĐT, biển số..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-80"
                    />
                    <Button onClick={fetchReturningRentals} disabled={loading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Làm mới
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Danh sách xe đang cho thuê
                    </CardTitle>
                    <CardDescription>Các xe đang được thuê và có thể trả bất cứ lúc nào</CardDescription>
                </CardHeader>
                <CardContent>
                    {items.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm ? 'Không tìm thấy xe nào phù hợp' : 'Không có xe nào đang được thuê'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thông tin xe</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Thời gian thuê</TableHead>
                                    <TableHead>Tài chính</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    <Car className="h-4 w-4" />
                                                    {r.vehicle.licensePlate}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {r.vehicle.brand} {r.vehicle.model}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{getVehicleTypeName(r.vehicle.type)}</div>
                                                <Badge variant="outline" className="w-fit text-xs">
                                                    {r.rentalType === 'booking' ? 'Đặt trước' : 'Walk-in'}
                                                </Badge>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {r.renter.fullName}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Phone className="h-3 w-3" />
                                                    {r.renter.phone}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{r.renter.email}</div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-sm">Bắt đầu: {formatDateTime(r.startTime)}</span>
                                                </div>
                                                {r.endTime && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-orange-500" />
                                                        <span className="text-sm text-orange-600">Dự kiến: {formatDateTime(r.endTime)}</span>
                                                    </div>
                                                )}
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <MapPin className="h-3 w-3" />
                                                    {r.stationReturn?.name || r.stationPickup?.name}
                                                </div>
                                                {r.totalDistance && <div className="text-xs text-blue-600 font-medium">Đã đi: {r.totalDistance} km</div>}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">Tổng tiền</span>
                                                        <span className="font-medium text-sm">{formatCurrency(r.totalCost)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">Đặt cọc</span>
                                                        <span className="font-medium text-sm text-green-600">
                                                            {formatCurrency(r.depositAmount)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge variant={r.depositStatus === 'held' ? 'default' : 'secondary'} className="w-fit text-xs">
                                                    {r.depositStatus === 'held' ? 'Đã giữ cọc' : r.depositStatus}
                                                </Badge>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedReturnRental(r);
                                                    setOpenReturn(true);
                                                }}
                                                disabled={loading}
                                                className="w-full"
                                            >
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

            {/* ✅ Dialog RETURN */}
            {openReturn && selectedReturnRental && (
                <ReturnDialog
                    open={openReturn}
                    onOpenChange={setOpenReturn}
                    rental={selectedReturnRental}
                    onSuccess={fetchReturningRentals}
                />
            )}
        </div>
    );
}
