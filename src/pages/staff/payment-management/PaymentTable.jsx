import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Receipt, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PaymentTable = ({ payments, searchTerm, loading, onViewDetail, onProcess }) => {
    const filtered = payments.filter(
        (p) =>
            !searchTerm ||
            p.renter?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading)
        return (
            <Card>
                <CardContent className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </CardContent>
            </Card>
        );

    return (
        <Card className="rounded-2xl shadow-md border border-gray-100">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Danh sách thanh toán ({filtered.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {filtered.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        Không có thanh toán nào phù hợp.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 text-gray-600">
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Xe</TableHead>
                                    <TableHead>Số tiền</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((p) => (
                                    <TableRow key={p.id} className="hover:bg-primary/5">
                                        <TableCell>{p.renter?.fullName}</TableCell>
                                        <TableCell>{p.vehicle?.licensePlate}</TableCell>
                                        <TableCell>
                                            {(p.totalCost || 0).toLocaleString("vi-VN")}₫
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="destructive">Chờ thanh toán</Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex gap-2 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onViewDetail(p)}
                                                className="hover:bg-primary/10 rounded-xl"
                                            >
                                                <Eye className="h-4 w-4 mr-2 text-primary" />
                                                Xem
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => onProcess(p)}
                                                className="bg-primary text-white rounded-xl hover:bg-primary/90"
                                            >
                                                <Receipt className="h-4 w-4 mr-2" />
                                                Xử lý
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PaymentTable;
