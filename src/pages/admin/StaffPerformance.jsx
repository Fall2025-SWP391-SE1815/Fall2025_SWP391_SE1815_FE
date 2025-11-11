import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
    RefreshCw, 
    Users, 
    AlertCircle,
    Star,
    Package,
    Search,
    Filter,
    Eye,
    CheckCircle
} from 'lucide-react';
import adminService from '@/services/admin/adminService';

const StaffPerformance = () => {
    const [loading, setLoading] = useState(false);
    const [performanceData, setPerformanceData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [performanceFilter, setPerformanceFilter] = useState('all');
    const { toast } = useToast();

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            const response = await adminService.getPerformance();
            response ? setPerformanceData(response) : console.log('No data in response');
        } catch (error) {
            console.error('Error fetching staff performance:', error);
            toast({
                title: (
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Tải dữ liệu hiệu suất thất bại
                    </div>
                ),
                description: 'Không thể tải dữ liệu hiệu suất nhân viên. Vui lòng thử lại',
                className: 'border-l-red-500 border-red-200 bg-red-50',
                duration: 4000
            });
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
        if (rating >= 4.5) return { variant: 'default', label: 'Xuất sắc', icon: CheckCircle };
        if (rating >= 4.0) return { variant: 'secondary', label: 'Tốt', icon: Star };
        if (rating >= 3.0) return { variant: 'outline', label: 'Trung bình', icon: AlertCircle };
        return { variant: 'destructive', label: 'Cần cải thiện', icon: AlertCircle };
    };

    // Filter functions
    const filteredPerformanceData = performanceData.filter(staff => {
        const matchesSearch = 
            staff.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.staffId?.toString().includes(searchTerm);
        
        const matchesPerformance = performanceFilter === 'all' || 
            (performanceFilter === 'excellent' && staff.avgRating >= 4.5) ||
            (performanceFilter === 'good' && staff.avgRating >= 4.0 && staff.avgRating < 4.5) ||
            (performanceFilter === 'average' && staff.avgRating >= 3.0 && staff.avgRating < 4.0) ||
            (performanceFilter === 'poor' && staff.avgRating < 3.0);
        
        return matchesSearch && matchesPerformance;
    });

    const stats = calculateStats();

    if (loading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight'>Hiệu suất nhân viên</h1>
                    <p className='text-muted-foreground'>
                        Theo dõi và đánh giá hiệu suất làm việc của từng nhân viên
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => {
                        fetchPerformanceData();
                        toast({
                            title: (
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="h-5 w-5 text-blue-600" />
                                    Đã làm mới dữ liệu
                                </div>
                            ),
                            description: 'Dữ liệu hiệu suất nhân viên đã được cập nhật',
                            className: 'border-l-blue-500 border-blue-200 bg-blue-50',
                            duration: 2000
                        });
                    }}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className='grid gap-4 md:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Tổng nhân viên</CardTitle>
                        <Users className='h-4 w-4 text-blue-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stats.totalStaff}</div>
                        <p className="text-xs text-muted-foreground">
                            Đang hoạt động
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Đánh giá TB</CardTitle>
                        <Star className='h-4 w-4 text-yellow-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stats.avgRating}/5</div>
                        <p className="text-xs text-muted-foreground">
                            Điểm trung bình
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Tổng giao dịch</CardTitle>
                        <Package className='h-4 w-4 text-green-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stats.totalDeliveries}</div>
                        <p className="text-xs text-muted-foreground">
                            Hoàn thành
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Khiếu nại</CardTitle>
                        <AlertCircle className='h-4 w-4 text-red-600' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stats.totalComplaints}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng số khiếu nại
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className='flex items-center gap-4'>
                <div className='relative flex-1 max-w-sm'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Tìm kiếm nhân viên...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-8'
                    />
                </div>
                
                <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                    <SelectTrigger className='w-48'>
                        <Filter className='h-4 w-4 mr-2' />
                        <SelectValue placeholder='Lọc theo hiệu suất' />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
                        <SelectItem value='all' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Tất cả hiệu suất</SelectItem>
                        <SelectItem value='excellent' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Xuất sắc (4.5+)</SelectItem>
                        <SelectItem value='good' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Tốt (4.0-4.4)</SelectItem>
                        <SelectItem value='average' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Trung bình (3.0-3.9)</SelectItem>
                        <SelectItem value='poor' className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Cần cải thiện (&lt;3.0)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Hiệu suất nhân viên</CardTitle>
                    <CardDescription>
                        Theo dõi và đánh giá hiệu suất làm việc của từng nhân viên
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nhân viên</TableHead>
                                <TableHead className="text-center">Lượt giao</TableHead>
                                <TableHead className="text-center">Lượt nhận</TableHead>
                                <TableHead className="text-center">Đánh giá</TableHead>
                                <TableHead className="text-center">Hiệu suất</TableHead>
                                <TableHead className="text-center">Khiếu nại</TableHead>
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
                                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                                            <TableCell key={cellIndex} className="text-center">
                                                <div className="w-12 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredPerformanceData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className='flex flex-col items-center space-y-3 text-muted-foreground'>
                                            <Users className='h-12 w-12 text-gray-300' />
                                            <div className='text-lg font-medium'>
                                                {searchTerm || performanceFilter !== 'all' ? 
                                                    'Không tìm thấy nhân viên phù hợp' : 'Chưa có dữ liệu'}
                                            </div>
                                            <div className='text-sm'>
                                                {searchTerm || performanceFilter !== 'all' ? 
                                                    'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 
                                                    'Chưa có dữ liệu hiệu suất nhân viên'}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPerformanceData.map((staff, index) => {
                                    const performanceBadge = getPerformanceBadge(staff.avgRating || 0);
                                    const Icon = performanceBadge.icon;
                                    const initials = staff.staffName 
                                        ? staff.staffName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                        : 'NV';
                                    
                                    return (
                                        <TableRow 
                                            key={staff.staffId} 
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {staff.staffName || `Nhân viên #${staff.staffId}`}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            ID: #{staff.staffId}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="text-lg font-semibold">
                                                    {staff.deliveryCount || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="text-lg font-semibold">
                                                    {staff.returnCount || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="text-lg font-semibold">
                                                        {staff.avgRating > 0 ? staff.avgRating.toFixed(1) : '0.0'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={performanceBadge.variant} className='flex items-center gap-1 w-fit mx-auto'>
                                                    <Icon className='h-3 w-3' />
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
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffPerformance;