import React, { useEffect, useState } from 'react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import {
    Car, Clock, User, MapPin, CheckCircle, RefreshCw, Phone, Calendar, DollarSign, Eye, Gauge, Battery, Shield,
} from 'lucide-react';

import CheckInDialog from '../dialogs/CheckInDialog';
import PickupDialog from '../dialogs/PickupDialog';

export default function HandoverTab() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [reservations, setReservations] = useState([]);
    const [pendingRentals, setPendingRentals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // dialogs
    const [openDetails, setOpenDetails] = useState(false);
    const [openCheckIn, setOpenCheckIn] = useState(false);
    const [openPickup, setOpenPickup] = useState(false);

    const [selectedReservation, setSelectedReservation] = useState(null);
    const [selectedRental, setSelectedRental] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([fetchReservations(), fetchPendingRentals()]);
    };

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const res = await staffRentalService.getReservations({ status: 'pending' });
            setReservations(res || []);
        } catch (e) {
            toast({ title: 'Lỗi', description: e?.message || 'Không thể tải danh sách đặt chỗ', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRentals = async () => {
        try {
            setLoading(true);
            const res = await staffRentalService.getRentals({ status: 'booked' });
            setPendingRentals(res || []);
        } catch (e) {
            toast({ title: 'Lỗi', description: e?.message || 'Không thể tải danh sách xe cần giao', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (n) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

    const formatDateTime = (d) =>
        new Date(d).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    const calculateTotalCost = (item) => {
        if (item?.totalCost && typeof item.totalCost === 'number') return item.totalCost;
        if (!item || !item.vehicle || !item.reservedStartTime || !item.reservedEndTime) return 0;
        const start = new Date(item.reservedStartTime);
        const end = new Date(item.reservedEndTime);
        if (isNaN(start) || isNaN(end)) return 0;
        const hours = Math.max(0, (end - start) / 36e5);
        return Math.round(hours * (item.vehicle.pricePerHour || 0));
    };

    const filterReservations = (list) => {
        if (!searchTerm) return list;
        const q = searchTerm.toLowerCase();
        return list.filter((x) =>
            x?.renter?.fullName?.toLowerCase()?.includes(q) ||
            x?.renter?.phone?.includes(searchTerm) ||
            x?.vehicle?.licensePlate?.toLowerCase()?.includes(q) ||
            String(x?.id).includes(searchTerm)
        );
    };

    const filterRentals = (list) => {
        if (!searchTerm) return list;
        const q = searchTerm.toLowerCase();
        return list.filter((x) =>
            x?.renter?.fullName?.toLowerCase()?.includes(q) ||
            x?.renter?.phone?.includes(searchTerm) ||
            x?.vehicle?.licensePlate?.toLowerCase()?.includes(q) ||
            String(x?.id).includes(searchTerm)
        );
    };

    const onClickDetails = (reservation) => {
        setSelectedReservation(reservation);
        setOpenDetails(true);
    };

    const onClickCheckIn = (reservation) => {
        setSelectedReservation(reservation);
        setOpenCheckIn(true);
    };

    const onClickPickup = (rental) => {
        setSelectedRental(rental);
        setOpenPickup(true);
    };

    const holdDeposit = async (rentalId, amount) => {
        try {
            setLoading(true);
            await staffRentalService.holdDeposit(rentalId, { amount });
            toast({ title: 'Thành công', description: 'Đã ghi nhận đặt cọc.' });
            fetchPendingRentals();
        } catch (e) {
            toast({ title: 'Lỗi', description: e?.message || 'Không thể ghi nhận đặt cọc', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* header + search */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Đặt chỗ & Giao xe</h1>
                    <p className="text-muted-foreground">Quản lý check-in đặt chỗ và giao xe cho khách hàng</p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Tìm khách hàng, SĐT, biển số..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-80"
                    />
                    <Button onClick={loadData} disabled={loading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Reservations pending */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Danh sách đặt chỗ chờ check-in
                    </CardTitle>
                    <CardDescription>Các đặt chỗ cần xác nhận và check-in</CardDescription>
                </CardHeader>
                <CardContent>
                    {filterReservations(reservations).length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm ? 'Không tìm thấy đặt chỗ phù hợp' : 'Không có đặt chỗ nào chờ check-in'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thông tin xe</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Thời gian đặt</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filterReservations(reservations).map((r) => (
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
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium text-sm">{formatDateTime(r.reservedStartTime)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-sm text-muted-foreground">{formatDateTime(r.reservedEndTime)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="default">{r.status === 'pending' ? 'Chờ check-in' : r.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => onClickDetails(r)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Xem chi tiết
                                                </Button>
                                                <Button size="sm" onClick={() => onClickCheckIn(r)}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Check-in
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Rentals booked (ready to pickup) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Danh sách xe cần giao
                    </CardTitle>
                    <CardDescription>Các lượt thuê đã check-in, sẵn sàng giao</CardDescription>
                </CardHeader>
                <CardContent>
                    {filterRentals(pendingRentals).length === 0 ? (
                        <div className="text-center py-8">
                            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">{searchTerm ? 'Không tìm thấy xe phù hợp' : 'Không có xe nào cần giao'}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thông tin xe</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Thời gian giao</TableHead>
                                    <TableHead>Đặt cọc</TableHead>
                                    <TableHead>Tổng tiền</TableHead>
                                    <TableHead>Trạng thái cọc</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filterRentals(pendingRentals).map((r) => (
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
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium">{formatDateTime(r.startTime)}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <MapPin className="h-3 w-3" />
                                                    {r.stationPickup?.name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="font-medium">{formatCurrency(r.depositAmount)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="font-medium">{formatCurrency(r.totalCost)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    r.depositStatus === 'held' ? 'default' : r.depositStatus === 'pending' ? 'secondary' : 'outline'
                                                }
                                            >
                                                {r.depositStatus === 'held'
                                                    ? 'Đã nhận cọc'
                                                    : r.depositStatus === 'pending'
                                                        ? 'Chờ nhận cọc'
                                                        : r.depositStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                {r.depositStatus === 'pending' && (
                                                    <Button size="sm" variant="outline" onClick={() => holdDeposit(r.id, r.depositAmount)} disabled={loading}>
                                                        <DollarSign className="h-4 w-4 mr-2" />
                                                        Ghi nhận cọc
                                                    </Button>
                                                )}
                                                {r.depositStatus === 'held' && (
                                                    <Button size="sm" onClick={() => onClickPickup(r)} disabled={loading}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Xác nhận giao xe
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* ✅ Dialog: XEM CHI TIẾT (giữ lại theo yêu cầu) */}
            <Dialog open={openDetails} onOpenChange={setOpenDetails}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" /> Chi tiết đặt chỗ #{selectedReservation?.id}
                        </DialogTitle>
                        <DialogDescription>
                            Thông tin chi tiết đặt chỗ của khách {selectedReservation?.renter?.fullName}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Cards tổng hợp (giống code cũ của bạn) */}
                    <div className="space-y-6">
                        {/* Customer */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" /> Thông tin khách hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Mã KH</Label>
                                            <p className="font-medium">{selectedReservation?.renter?.id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Họ tên</Label>
                                            <p className="font-medium">{selectedReservation?.renter?.fullName}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Email</Label>
                                            <p className="font-medium">{selectedReservation?.renter?.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">SĐT</Label>
                                            <p className="font-medium">{selectedReservation?.renter?.phone}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Vai trò</Label>
                                            <Badge variant="outline">{selectedReservation?.renter?.role}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Car className="h-5 w-5" /> Thông tin xe
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Mã xe</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Biển số</Label>
                                            <p className="font-medium text-lg">{selectedReservation?.vehicle?.licensePlate}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Loại</Label>
                                            <Badge variant="secondary">{selectedReservation?.vehicle?.type}</Badge>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Hãng</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.brand}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Model</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.model}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Trạng thái</Label>
                                            <Badge variant={selectedReservation?.vehicle?.status === 'RESERVED' ? 'default' : 'outline'}>
                                                {selectedReservation?.vehicle?.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Dung lượng pin (kWh)</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.capacity}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Tầm hoạt động / sạc</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.rangePerFullCharge}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Giá/giờ</Label>
                                            <p className="font-medium text-green-600">{formatCurrency(selectedReservation?.vehicle?.pricePerHour)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Mức pin hiện tại</Label>
                                            <p className="font-medium flex items-center gap-2">
                                                <Battery className="h-4 w-4" />
                                                {selectedReservation?.vehicle?.batteryLevel}%
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Số km đã đi</Label>
                                            <p className="font-medium flex items-center gap-2">
                                                <Gauge className="h-4 w-4" />
                                                {selectedReservation?.vehicle?.odo?.toLocaleString()} km
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {selectedReservation?.vehicle?.imageUrl && (
                                    <div className="mt-4">
                                        <Label className="text-muted-foreground text-sm">Hình ảnh xe</Label>
                                        <div className="mt-2">
                                            <img
                                                src={selectedReservation?.vehicle?.imageUrl}
                                                alt={`${selectedReservation?.vehicle?.brand} ${selectedReservation?.vehicle?.model}`}
                                                className="w-48 h-32 object-cover rounded-lg border"
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Station */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5" /> Thông tin trạm
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Mã trạm</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.station?.id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Tên trạm</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.station?.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Địa chỉ</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.station?.address}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Trạng thái</Label>
                                            <Badge variant={selectedReservation?.vehicle?.station?.status === 'active' ? 'default' : 'secondary'}>
                                                {selectedReservation?.vehicle?.station?.status}
                                            </Badge>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Vĩ độ</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.station?.latitude}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Kinh độ</Label>
                                            <p className="font-medium">{selectedReservation?.vehicle?.station?.longitude}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reservation */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5" /> Thông tin đặt chỗ
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Mã đặt chỗ</Label>
                                            <p className="font-medium text-lg">#{selectedReservation?.id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Bắt đầu</Label>
                                            <p className="font-medium flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {formatDateTime(selectedReservation?.reservedStartTime)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Kết thúc</Label>
                                            <p className="font-medium flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {formatDateTime(selectedReservation?.reservedEndTime)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Trạng thái</Label>
                                            <Badge variant="default">{selectedReservation?.status}</Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Ngày tạo</Label>
                                            <p className="font-medium">{formatDateTime(selectedReservation?.createdAt)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Phí bảo hiểm</Label>
                                            <p className="font-medium flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                {formatCurrency(selectedReservation?.insurance || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Người hủy</Label>
                                            <p className="font-medium">{selectedReservation?.cancelledBy || 'Không có'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-sm">Lý do hủy</Label>
                                            <p className="font-medium">{selectedReservation?.cancelledReason || 'Không có'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cost summary */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Tổng kết chi phí
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Chi phí thuê xe</span>
                                        <div className="text-lg font-bold text-blue-600">{formatCurrency(calculateTotalCost(selectedReservation))}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Phí bảo hiểm</span>
                                        <div className="text-lg font-bold text-orange-600">{formatCurrency(selectedReservation?.insurance || 0)}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Tổng cộng</span>
                                        <div className="text-xl font-bold text-green-600">
                                            {formatCurrency((calculateTotalCost(selectedReservation) || 0) + (selectedReservation?.insurance || 0))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDetails(false)}>Đóng</Button>
                        <Button
                            onClick={() => {
                                setOpenDetails(false);
                                onClickCheckIn(selectedReservation);
                            }}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Tiến hành Check-in
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ✅ Dialog: CHECK-IN */}
            {openCheckIn && selectedReservation && (
                <CheckInDialog
                    open={openCheckIn}
                    onOpenChange={setOpenCheckIn}
                    reservation={selectedReservation}
                    onSuccess={loadData}
                />
            )}

            {/* ✅ Dialog: PICKUP */}
            {openPickup && selectedRental && (
                <PickupDialog
                    open={openPickup}
                    onOpenChange={setOpenPickup}
                    rental={selectedRental}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}
