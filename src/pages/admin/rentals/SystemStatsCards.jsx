import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import adminService from '@/services/admin/adminService';

const SystemStatsCards = () => {
  const [stats, setStats] = useState({
    activeRentals: 0,
    completedToday: 0,
    totalViolations: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Rentals
        const rentals = await adminService.getRentals();
        const activeRentals = rentals?.filter(r => r.status === 'ongoing').length || 0;
        const completedToday = rentals?.filter(
          r => (r.status === 'returned' || r.status === 'completed') && r.endTime &&
            new Date(r.endTime).toDateString() === new Date().toDateString()
        ).length || 0;
        
        // Violations
        const violations = await adminService.getViolations();
        const totalViolations = violations?.length || 0;
        
        setStats({
          activeRentals,
          completedToday,
          totalViolations
        });
      } catch (err) {
        setStats({activeRentals: 0, completedToday: 0, totalViolations: 0});
      }
    };
    fetchStats();
  }, []);

  // Card UI
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đang thuê</CardTitle>
          <Car className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeRentals || 0}</div>
          <p className="text-xs text-muted-foreground">Lượt thuê đang diễn ra</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoàn thành hôm nay</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedToday || 0}</div>
          <p className="text-xs text-muted-foreground">Lượt thuê đã hoàn thành hôm nay</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sự cố chờ xử lý</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Không có dữ liệu</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng vi phạm</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalViolations || 0}</div>
          <p className="text-xs text-muted-foreground">Tổng số vi phạm</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatsCards;
