import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Eye, Car } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/lib/api/apiConfig';

export default function VehicleTable({ vehicles, onEdit, onDelete, onView }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Hình ảnh</TableHead>
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
                            <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                                Không có phương tiện
                            </TableCell>
                        </TableRow>
                    ) : (
                        vehicles.map((v) => {
                            const imageUrl = v.imageUrl ? `${API_BASE_URL}${v.imageUrl}` : null;
                            return (
                                <TableRow key={v.id}>
                                    <TableCell>
                                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={v.licensePlate}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>';
                                                    }}
                                                />
                                            ) : (
                                                <Car className="h-8 w-8 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
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
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
