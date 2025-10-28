import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Battery, Camera, CheckCircle, Gauge, Loader2, PenTool } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import staffRentalService from '@/services/staff/staffRentalService';

export default function ReturnDialog({ open, onOpenChange, rental, onSuccess }) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        condition_report: '',
        odo: '',
        batteryLevel: '',
        photo_url: null,
        customer_signature_url: null,
        staff_signature_url: null,
    });

    const validateFile = (file, label) => {
        if (!(file instanceof File)) {
            toast({ title: 'Lỗi file', description: `${label} phải là file ảnh`, variant: 'destructive' });
            return false;
        }
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Lỗi định dạng', description: `${label} phải là ảnh (JPG/PNG/...)`, variant: 'destructive' });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (
            !form.condition_report ||
            !form.odo ||
            !form.batteryLevel ||
            !form.photo_url ||
            !form.customer_signature_url ||
            !form.staff_signature_url
        ) {
            toast({
                title: 'Thiếu thông tin',
                description: 'Điền biên bản, số km, mức pin và chọn đủ 3 ảnh (xe, chữ ký khách, chữ ký NV)',
                variant: 'destructive',
            });
            return;
        }

        if (
            !validateFile(form.photo_url, 'Ảnh xe') ||
            !validateFile(form.customer_signature_url, 'Chữ ký khách hàng') ||
            !validateFile(form.staff_signature_url, 'Chữ ký nhân viên')
        ) {
            return;
        }

        setSaving(true);
        try {
            const data = {
                rentalId: rental?.id,
                checkType: 'return',
                conditionReport: form.condition_report,
                odo: parseInt(form.odo),
                batteryLevel: parseInt(form.batteryLevel),
            };

            const fd = new FormData();
            fd.append('data', JSON.stringify(data));
            fd.append('photo', form.photo_url);
            fd.append('staff_signature', form.staff_signature_url);
            fd.append('customer_signature', form.customer_signature_url);

            await staffRentalService.confirmReturn(fd);
            toast({ title: 'Trả xe thành công', description: 'Xe đã được xác nhận trả.' });
            onSuccess?.();
            onOpenChange(false);
        } catch (e) {
            toast({ title: 'Lỗi trả xe', description: e?.message || 'Không thể xác nhận', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Xác nhận nhận xe</DialogTitle>
                    <DialogDescription>
                        Nhận xe từ: {rental?.renter?.fullName} - {rental?.vehicle?.licensePlate}
                    </DialogDescription>
                </DialogHeader>

                {/* Vehicle summary */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Thông tin xe trả</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Biển số xe</p>
                                <p className="font-medium">{rental?.vehicle?.licensePlate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Khách hàng</p>
                                <p className="font-medium">{rental?.renter?.fullName}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form */}
                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="condition">Báo cáo tình trạng xe *</Label>
                        <Textarea
                            id="condition"
                            placeholder="Mô tả chi tiết tình trạng xe khi trả..."
                            value={form.condition_report}
                            onChange={(e) => setForm((p) => ({ ...p, condition_report: e.target.value }))}
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="odo">Số km hiện tại *</Label>
                            <div className="flex gap-2">
                                <Gauge className="h-4 w-4 mt-3 text-muted-foreground" />
                                <Input
                                    id="odo"
                                    type="number"
                                    placeholder="12000"
                                    value={form.odo}
                                    onChange={(e) => setForm((p) => ({ ...p, odo: e.target.value }))}
                                />
                                <span className="text-sm text-muted-foreground mt-3">km</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="battery">Mức pin hiện tại *</Label>
                            <div className="flex gap-2">
                                <Battery className="h-4 w-4 mt-3 text-muted-foreground" />
                                <Input
                                    id="battery"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="95"
                                    value={form.batteryLevel}
                                    onChange={(e) => setForm((p) => ({ ...p, batteryLevel: e.target.value }))}
                                />
                                <span className="text-sm text-muted-foreground mt-3">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ảnh xe khi nhận lại *</Label>
                        <div className="flex gap-2 items-center">
                            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setForm((p) => ({ ...p, photo_url: e.target.files[0] }))} className="flex-1" />
                            <Button variant="outline" size="icon" disabled><Camera className="h-4 w-4" /></Button>
                        </div>
                        {form.photo_url && <p className="text-sm text-green-600">✓ Đã chọn: {form.photo_url.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Chữ ký khách hàng *</Label>
                            <div className="flex gap-2 items-center">
                                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setForm((p) => ({ ...p, customer_signature_url: e.target.files[0] }))} className="flex-1" />
                                <Button variant="outline" size="icon" disabled><PenTool className="h-4 w-4" /></Button>
                            </div>
                            {form.customer_signature_url && <p className="text-sm text-green-600">✓ Đã chọn: {form.customer_signature_url.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Chữ ký nhân viên *</Label>
                            <div className="flex gap-2 items-center">
                                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setForm((p) => ({ ...p, staff_signature_url: e.target.files[0] }))} className="flex-1" />
                                <Button variant="outline" size="icon" disabled><PenTool className="h-4 w-4" /></Button>
                            </div>
                            {form.staff_signature_url && <p className="text-sm text-green-600">✓ Đã chọn: {form.staff_signature_url.name}</p>}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...</> : <><CheckCircle className="h-4 w-4 mr-2" /> Xác nhận nhận xe</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}