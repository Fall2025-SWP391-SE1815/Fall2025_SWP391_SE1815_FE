import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, RefreshCw } from 'lucide-react';
import adminService from '@/services/admin/adminService';

const ViolationsTab = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch violations data
  const fetchViolations = async () => {
    setLoading(true);
    try {
      const data = await adminService.getViolations();
      setViolations(data || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
      toast.error('Không thể tải dữ liệu vi phạm');
      setViolations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchViolations();
  }, []);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Danh sách vi phạm</CardTitle>
            <CardDescription>
              Theo dõi các vi phạm và phạt tiền trong hệ thống
            </CardDescription>
          </div>
          <Button variant="outline" onClick={fetchViolations} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {violations.length > 0 ? violations.map((violation) => (
            <div key={violation.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <span className="font-medium">{violation.renter_name}</span>
                  <Badge variant="outline">{violation.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{violation.description}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(violation.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(violation.penalty_amount)}
                </div>
                <Badge variant="destructive">Phạt tiền</Badge>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có vi phạm nào
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ViolationsTab;
