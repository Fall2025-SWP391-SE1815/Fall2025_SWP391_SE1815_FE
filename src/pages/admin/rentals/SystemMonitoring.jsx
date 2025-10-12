import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Car, Shield } from 'lucide-react';

// Import components
import SystemStatsCards from '@/pages/admin/rentals/SystemStatsCards';
import RentalsTab from '@/pages/admin/rentals/RentalsTab';
import ViolationsTab from '@/pages/admin/rentals/ViolationsTab';

const SystemMonitoring = () => {
  const [selectedTab, setSelectedTab] = useState('rentals');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giám sát hệ thống</h1>
          <p className="text-muted-foreground">
            Theo dõi tình trạng hoạt động và hiệu suất hệ thống
          </p>
        </div>
      </div>

      {/* System Overview Statistics */}
      <SystemStatsCards />

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'rentals', label: 'Thuê xe', icon: Car },
          { id: 'violations', label: 'Vi phạm', icon: Shield }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={selectedTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'rentals' && (
        <RentalsTab />
      )}

      {selectedTab === 'violations' && (
        <ViolationsTab />
      )}
    </div>
  );
};

export default SystemMonitoring;