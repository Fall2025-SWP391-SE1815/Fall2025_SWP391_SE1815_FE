import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, CheckCircle, ArrowRight } from 'lucide-react';
import HandoverTab from './tabs/HandoverTab';
import InUseTab from './tabs/InUseTab';
import VehicleReturn from './tabs/VehicleReturn';

export default function RentalManagement() {
  const [selectedTab, setSelectedTab] = useState(
    localStorage.getItem('rentalManagementTab') || 'handover'
  );

  useEffect(() => {
    localStorage.setItem('rentalManagementTab', selectedTab);
  }, [selectedTab]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý giao - nhận xe</h1>
          <p className="text-muted-foreground">Xử lý các yêu cầu giao xe và nhận xe từ khách hàng</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="handover" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" /> Đặt chỗ & Giao xe
          </TabsTrigger>
          <TabsTrigger value="in-use" className="flex items-center gap-2">
            <Car className="h-4 w-4" /> Đang cho thuê
          </TabsTrigger>
          <TabsTrigger value="return" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Nhận xe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="handover" className="space-y-4">
          <HandoverTab />
        </TabsContent>

        <TabsContent value="in-use" className="space-y-4">
          <InUseTab />
        </TabsContent>

        <TabsContent value="return" className="space-y-4">
          <VehicleReturn />
        </TabsContent>
      </Tabs>
    </div>
  );
}
