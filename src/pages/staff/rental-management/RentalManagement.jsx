import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import PickupTab from "./PickupTab";
import ReturnTab from "./ReturnTab";

export default function RentalManagement() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("pickup");
  const [loading, setLoading] = useState(false);
  const [pendingRentals, setPendingRentals] = useState([]);
  const [returningRentals, setReturningRentals] = useState([]);

  // Mock data (bạn thay bằng API thật sau)
  const mockPendingRentals = [
    {
      rental_id: 1,
      vehicle: { license_plate: "51A-12345", brand: "Toyota", model: "Vios" },
      renter: { full_name: "Nguyễn Văn A", phone: "0901234567" },
      pickup_station: { name: "Trạm A" },
      deposit_amount: 2000000,
      deposit_status: "Đã cọc",
      start_time: "2025-10-13T09:00:00",
    },
  ];

  const mockReturningRentals = [
    {
      rental_id: 2,
      vehicle: { license_plate: "51B-67890", brand: "Honda", model: "City" },
      renter: { full_name: "Trần Thị B", phone: "0939876543" },
      return_station: { name: "Trạm B" },
      end_time: "2025-10-14T10:00:00",
    },
  ];

  const fetchPendingRentals = async () => {
    setLoading(true);
    setTimeout(() => {
      setPendingRentals(mockPendingRentals);
      setLoading(false);
    }, 500);
  };

  const fetchReturningRentals = async () => {
    setLoading(true);
    setTimeout(() => {
      setReturningRentals(mockReturningRentals);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchPendingRentals();
    fetchReturningRentals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý giao - nhận xe
          </h1>
          <p className="text-muted-foreground">
            Xử lý các yêu cầu giao xe và nhận xe từ khách hàng
          </p>
        </div>
        <Button
          onClick={() => {
            fetchPendingRentals();
            fetchReturningRentals();
          }}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Làm mới
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pickup" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" /> Giao xe ({pendingRentals.length})
          </TabsTrigger>
          <TabsTrigger value="return" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Nhận xe ({returningRentals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pickup">
          <PickupTab
            rentals={pendingRentals}
            loading={loading}
            toast={toast}
            onRefresh={fetchPendingRentals}
          />
        </TabsContent>

        <TabsContent value="return">
          <ReturnTab
            rentals={returningRentals}
            loading={loading}
            toast={toast}
            onRefresh={fetchReturningRentals}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
