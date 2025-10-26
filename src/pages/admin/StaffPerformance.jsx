import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { 
    RefreshCw, 
    Users, 
    AlertCircle,
    Star,
    Package
} from 'lucide-react';
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

    // Calculate summary statistics
    const calculateStats = () => {
        if (performanceData.length === 0) {
            return {
                totalStaff: 0,
                avgRating: 0,
                totalDeliveries: 0,
                totalComplaints: 0
            };
        }

        const totalDeliveries = performanceData.reduce((sum, staff) => sum + (staff.deliveryCount || 0), 0);
        const totalComplaints = performanceData.reduce((sum, staff) => sum + (staff.complaintCount || 0), 0);
        const avgRating = performanceData.reduce((sum, staff) => sum + (staff.avgRating || 0), 0) / performanceData.length;

        return {
            totalStaff: performanceData.length,
            avgRating: avgRating.toFixed(1),
            totalDeliveries,
            totalComplaints
        };
    };



    // Get performance badge
    const getPerformanceBadge = (rating) => {
        if (rating >= 4.5) return { variant: 'default', label: 'Xuất sắc', color: 'bg-green-500' };
        if (rating >= 4.0) return { variant: 'secondary', label: 'Tốt', color: 'bg-blue-500' };
        if (rating >= 3.0) return { variant: 'outline', label: 'Trung bình', color: 'bg-yellow-500' };
        return { variant: 'destructive', label: 'Cần cải thiện', color: 'bg-red-500' };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hiệu suất nhân viên</h1>
                        <p className="text-gray-600 mt-2">
                            Theo dõi và đánh giá hiệu suất làm việc của từng nhân viên
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={fetchPerformanceData}
                        disabled={loading}
                        className="shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Tổng nhân viên</p>
                                    <p className="text-3xl font-bold">{stats.totalStaff}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Đánh giá TB</p>
                                    <p className="text-3xl font-bold">{stats.avgRating}/5</p>
                                </div>
                                <Star className="h-8 w-8 text-emerald-200" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Tổng giao dịch</p>
                                    <p className="text-3xl font-bold">{stats.totalDeliveries}</p>
                                </div>
                                <Package className="h-8 w-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Khiếu nại</p>
                                    <p className="text-3xl font-bold">{stats.totalComplaints}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Table */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-white border-b border-gray-200">
                        <CardTitle className="text-xl font-semibold text-gray-900">
                            Danh sách hiệu suất nhân viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">Nhân viên</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-700">Lượt giao</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-700">Lượt nhận</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-700">Đánh giá</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-700">Hiệu suất</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-700">Khiếu nại</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3 animate-pulse">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                                        <div className="space-y-2">
                                                            <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                                            <div className="w-16 h-3 bg-gray-200 rounded"></div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                {Array.from({ length: 5 }).map((_, cellIndex) => (
                                                    <TableCell key={cellIndex} className="text-center">
                                                        <div className="w-12 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : performanceData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <div className="flex flex-col items-center space-y-3 text-gray-500">
                                                    <Users className="h-12 w-12 text-gray-300" />
                                                    <div className="text-lg font-medium">Chưa có dữ liệu</div>
                                                    <div className="text-sm">Chưa có dữ liệu hiệu suất nhân viên</div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        performanceData.map((staff, index) => {
                                            const performanceBadge = getPerformanceBadge(staff.avgRating || 0);
                                            const initials = staff.staffName 
                                                ? staff.staffName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                                : 'NV';
                                            
                                            return (
                                                <TableRow 
                                                    key={staff.staffId} 
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                                                    {initials}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {staff.staffName || `Nhân viên #${staff.staffId}`}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    ID: #{staff.staffId}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="text-lg font-semibold text-gray-900">
                                                            {staff.deliveryCount || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="text-lg font-semibold text-gray-900">
                                                            {staff.returnCount || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center space-x-1">
                                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                            <span className="text-lg font-semibold text-gray-900">
                                                                {staff.avgRating > 0 ? staff.avgRating.toFixed(1) : '0.0'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={performanceBadge.variant} className="font-medium">
                                                            {performanceBadge.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className={`text-lg font-semibold ${
                                                            (staff.complaintCount || 0) > 5 ? 'text-red-600' :
                                                            (staff.complaintCount || 0) > 2 ? 'text-yellow-600' : 'text-green-600'
                                                        }`}>
                                                            {staff.complaintCount || 0}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StaffPerformance;