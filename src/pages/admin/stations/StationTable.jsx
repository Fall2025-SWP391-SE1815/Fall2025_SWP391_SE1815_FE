import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StationTable({ stations, onEdit, onDelete, onView }) {
    const getStatusBadge = (status) => {
        const statusMap = {
            'active': { label: 'Hoạt động', variant: 'default' },
            'inactive': { label: 'Không hoạt động', variant: 'secondary' },
            'maintenance': { label: 'Bảo trì', variant: 'destructive' }
        };
        
        const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tên trạm</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead>Tọa độ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                                Không có trạm nào
                            </TableCell>
                        </TableRow>
                    ) : (
                        stations.map((station) => (
                            <TableRow key={station.id}>
                                <TableCell className="font-medium">{station.name}</TableCell>
                                <TableCell>{station.address}</TableCell>
                                <TableCell>
                                    {station.latitude && station.longitude ? (
                                        <span className="text-sm text-muted-foreground">
                                            {Number(station.latitude).toFixed(5)}, {Number(station.longitude).toFixed(5)}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Chưa có</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(station.status)}
                                </TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => onView(station)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(station)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(station)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}