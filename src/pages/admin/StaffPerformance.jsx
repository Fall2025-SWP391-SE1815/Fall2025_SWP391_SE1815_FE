import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import adminService from '@/services/admin/adminService';

const StaffPerformance = () => {
    const [loading, setLoading] = useState(false);
    const [performanceData, setPerformanceData] = useState([]);

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            const response = await adminService.getPerformance();
            response ? setPerformanceData(response) : console.log('No data in response');
        } catch (error) {
            console.error('Error fetching staff performance:', error);
            toast.error('Không thể tải dữ liệu hiệu suất nhân viên');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchPerformanceData();
    }, []);

    if (loading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hiệu suất nhân viên</h1>
                    <p className="text-muted-foreground">
                        Theo dõi hiệu suất làm việc của từng nhân viên
                    </p>
                </div>
                <Button variant="outline" onClick={fetchPerformanceData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Làm mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách hiệu suất nhân viên</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Tên nhân viên</TableHead>
                                    <TableHead className="text-center">Lượt giao</TableHead>
                                    <TableHead className="text-center">Lượt nhận</TableHead>
                                    <TableHead className="text-center">Đánh giá trung bình</TableHead>
                                    <TableHead className="text-center">Số khiếu nại</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performanceData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Chưa có dữ liệu hiệu suất nhân viên
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    performanceData.map((staff) => (
                                        <TableRow key={staff.staffId}>
                                            <TableCell className="font-medium">#{staff.staffId}</TableCell>
                                            <TableCell>{staff.staffName}</TableCell>
                                            <TableCell className="text-center">{staff.deliveryCount}</TableCell>
                                            <TableCell className="text-center">{staff.returnCount}</TableCell>
                                            <TableCell className="text-center">
                                                {staff.avgRating > 0 ? staff.avgRating.toFixed(1) : 'Chưa có'}
                                            </TableCell>
                                            <TableCell className="text-center">{staff.complaintCount}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffPerformance;