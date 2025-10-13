import React, { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Car,
    FileText,
    CheckCircle,
    User,
    Phone,
    Calendar,
    DollarSign,
    MapPin,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PickupTab({ rentals, loading, toast, onRefresh }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);
    const [note, setNote] = useState("");
    const [odo, setOdo] = useState("");

    const handlePickupCheck = (r) => {
        setSelectedRental(r);
        setDialogOpen(true);
    };

    const handleSave = () => {
        toast({ title: "Đã lưu biên bản", description: "Xe đã được kiểm tra" });
        setDialogOpen(false);
    };

    const confirmPickup = (id) => {
        toast({ title: "Thành công", description: "Đã giao xe" });
        onRefresh();
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" /> Danh sách xe cần giao
                    </CardTitle>
                    <CardDescription>Các lượt thuê sẵn sàng giao xe</CardDescription>
                </CardHeader>
                <CardContent>
                    {rentals.length === 0 ? (
                        <div className="text-center text-muted-foreground py-6">
                            Không có xe nào cần giao
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Xe</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Đặt cọc</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rentals.map((r) => (
                                    <TableRow key={r.rental_id}>
                                        <TableCell>
                                            <div>{r.vehicle.license_plate}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {r.vehicle.brand} {r.vehicle.model}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" /> {r.renter.full_name}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {r.renter.phone}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Calendar className="h-4 w-4 inline mr-1" />
                                            {new Date(r.start_time).toLocaleString("vi-VN")}
                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {r.pickup_station.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DollarSign className="h-4 w-4 inline mr-1" />
                                            {r.deposit_amount.toLocaleString()}₫
                                            <Badge variant="outline" className="ml-2">
                                                {r.deposit_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex flex-col gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePickupCheck(r)}
                                            >
                                                <FileText className="h-4 w-4 mr-2" /> Biên bản
                                            </Button>
                                            <Button size="sm" onClick={() => confirmPickup(r.rental_id)}>
                                                <CheckCircle className="h-4 w-4 mr-2" /> Giao xe
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Dialog trong Tab */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Biên bản giao xe</DialogTitle>
                        <DialogDescription>
                            Kiểm tra tình trạng xe trước khi giao
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRental && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Biển số</Label>
                                    <Input value={selectedRental.vehicle.license_plate} disabled />
                                </div>
                                <div>
                                    <Label>Khách hàng</Label>
                                    <Input value={selectedRental.renter.full_name} disabled />
                                </div>
                                <div>
                                    <Label>Odo hiện tại</Label>
                                    <Input
                                        value={odo}
                                        onChange={(e) => setOdo(e.target.value)}
                                        placeholder="Nhập km"
                                    />
                                </div>
                                <div>
                                    <Label>Trạm giao</Label>
                                    <Input value={selectedRental.pickup_station.name} disabled />
                                </div>
                            </div>

                            <div>
                                <Label>Ghi chú</Label>
                                <Textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Tình trạng xe, nội thất..."
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSave}>Lưu biên bản</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
