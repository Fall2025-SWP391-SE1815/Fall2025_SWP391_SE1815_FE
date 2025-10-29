import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Car,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import ReservationHandover from './rentals/ReservationHandover';
import InUseRentals from './rentals/InUseRentals';
import VehicleReturn from './rentals/VehicleReturn';
import RentalHistory from './rentals/RentalHistory';

const RentalManagement = () => {
  // Load saved tab from localStorage, default to 'handover' if not found
  const [selectedTab, setSelectedTab] = useState(() => {
    return localStorage.getItem('rentalManagementTab') || 'handover';
  });

  // Save tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rentalManagementTab', selectedTab);
  }, [selectedTab]);

 
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý giao - nhận xe</h1>
          <p className='text-muted-foreground'>
            Xử lý các yêu cầu giao xe và nhận xe từ khách hàng
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='handover' className='flex items-center gap-2'>
            <ArrowRight className='h-4 w-4' />
            Đặt chỗ & Giao xe
          </TabsTrigger>
          <TabsTrigger value='in-use' className='flex items-center gap-2'>
            <Car className='h-4 w-4' />
            Đang cho thuê
          </TabsTrigger>
          <TabsTrigger value='return' className='flex items-center gap-2'>
            <CheckCircle className='h-4 w-4' />
            Nhận xe
          </TabsTrigger>
          <TabsTrigger value='history' className='flex items-center gap-2'>
            <Car className='h-4 w-4' />
            Lịch sử thuê
          </TabsTrigger>
        </TabsList>

        <TabsContent value='handover' className='space-y-4'>
          <ReservationHandover />
        </TabsContent>

        <TabsContent value='in-use' className='space-y-4'>
          <InUseRentals />
        </TabsContent>

        <TabsContent value='return' className='space-y-4'>
          <VehicleReturn />
        </TabsContent>

        <TabsContent value='history' className='space-y-4'>
          <RentalHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RentalManagement;
