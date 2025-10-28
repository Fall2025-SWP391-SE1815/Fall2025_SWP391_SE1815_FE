import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import { CheckCircle, Loader2, ShieldAlert, DollarSign, Calendar } from 'lucide-react';

export default function CheckInDialog({ open, onOpenChange, reservation, onSuccess }) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [highRisk, setHighRisk] = useState(false);

    const insurance = reservation?.insurance || 0;

    const formatDateTime = (d) =>
        new Date(d).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    const calcTotalCost = useMemo(() => {
        if (!reservation?.vehicle?.pricePerHour) return 0;
        const s = new Date(reservation?.reservedStartTime);
        const e = new Date(reservation?.reservedEndTime);
        if (isNaN(s) || isNaN(e)) return 0;
        const hours = Math.max(0, (e - s) / 36e5);
        return Math.round(hours * reservation?.vehicle?.pricePerHour);
    }, [reservation]);

    const suggested30 = useMemo(() => Math.round(calcTotalCost * 0.3), [calcTotalCost]);

    const handleSubmit = async () => {
        if (!reservation) return;

        // Cho phép gửi depositAmount (nếu BE bỏ qua thì cũng không sao)
        if (!depositAmount || isNaN(parseFloat(depositAmount))) {
            toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập số tiền đặt cọc hợp lệ', variant: 'destructive' });
            return;
        }

        const vehicleId = reservation?.vehicle?.id;
        const stationId = reservation?.vehicle?.station?.id;

        if (!vehicleId || !stationId) {
            toast({ title: 'Thiếu dữ liệu', description: 'Không có vehicleId/stationId trong reservation.', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                renterId: Number(reservation?.renter?.id),
                reservationId: Number(reservation?.id),
                vehicleId: Number(vehicleId),
                stationId: Number(stationId),
                startTime: reservation?.reservedStartTime,
                endTime: reservation?.reservedEndTime,
                insurance: Number(insurance) || 0,
                highRisk: Boolean(highRisk),
                depositAmount: Number(depositAmount) || 0, // tuỳ BE dùng hay bỏ qua
            };

            await staffRentalService.checkIn(payload);

            toast({
                title: 'Check-in thành công',
                description: highRisk
                    ? 'Khách high-risk: cọc theo quy tắc đặc biệt (≥10 triệu).'
                    : 'Cọc 30% tổng tiền thuê đã áp dụng.',
            });

            onSuccess?.();
            onOpenChange(false);
        } catch (e) {
            toast({ title: 'Lỗi check-in', description: e?.message || 'Không thể check-in', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Check-in khách hàng
                    </DialogTitle>
                    <DialogDescription>
                        Xác nhận check-in cho: {reservation?.renter?.fullName} - {reservation?.vehicle?.licensePlate}
                    </DialogDescription>
                </DialogHeader>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Thông tin đặt chỗ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <Label className="text-muted-foreground">Biển số</Label>
                                <p className="font-medium">{reservation?.vehicle?.licensePlate}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Khách hàng</Label>
                                <p className="font-medium">{reservation?.renter?.fullName}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Bắt đầu</Label>
                                <p className="font-medium">{formatDateTime(reservation?.reservedStartTime)}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Kết thúc</Label>
                                <p className="font-medium">{formatDateTime(reservation?.reservedEndTime)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200 mt-4">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <span className="text-sm font-medium text-gray-700">Chi phí thuê</span>
                                <div className="text-lg font-bold text-blue-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calcTotalCost)}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Phí bảo hiểm</span>
                                <div className="text-lg font-bold text-orange-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(insurance || 0)}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700">Đề xuất cọc (30%)</span>
                                <div className="text-lg font-bold text-green-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(suggested30)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t text-center">
                            <span className="text-sm font-medium text-gray-700">Tổng dự kiến</span>
                            <div className="text-xl font-bold text-purple-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calcTotalCost + (insurance || 0))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2 mt-4">
                    <Label htmlFor="deposit-amount">Số tiền đặt cọc (VND) *</Label>
                    <div className="flex gap-2">
                        <DollarSign className="h-4 w-4 mt-3 text-muted-foreground" />
                        <Input
                            id="deposit-amount"
                            type="number"
                            placeholder="500000"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => setDepositAmount(String(suggested30))}>
                            Áp dụng 30%
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between border rounded-md p-3 mt-3">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-yellow-600" />
                        <Label htmlFor="highRisk">Khách hàng rủi ro cao (High-risk)</Label>
                    </div>
                    <Switch id="highRisk" checked={highRisk} onCheckedChange={setHighRisk} />
                </div>

                <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
                    💡 Quy tắc cọc: bình thường = 30% tổng tiền; high-risk: nếu 30% &lt; 10 triệu → lấy 10 triệu; nếu ≥ 10 triệu → 30% + 10 triệu.
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...</> : <><CheckCircle className="h-4 w-4 mr-2" /> Xác nhận Check-in</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
