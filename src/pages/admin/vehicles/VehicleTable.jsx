import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function VehicleTable({ vehicles, onEdit, onDelete, onView }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Thương hiệu</TableHead>
                        <TableHead>Trạm</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Giá/giờ</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vehicles.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                                Không có phương tiện
                            </TableCell>
                        </TableRow>
                    ) : (
                        vehicles.map((v) => (
                            <TableRow key={v.id}>
                                <TableCell>{v.licensePlate}</TableCell>
                                <TableCell>{v.type}</TableCell>
                                <TableCell>{v.brand}</TableCell>
                                <TableCell>{v.station?.name || 'Chưa phân bổ'}</TableCell>
                                <TableCell>
                                    <Badge variant={v.status === 'available' ? 'default' : 'secondary'}>
                                        {v.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{(v.pricePerHour || 0).toLocaleString()}₫</TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => onView(v)}><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(v)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(v)}><Trash className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
