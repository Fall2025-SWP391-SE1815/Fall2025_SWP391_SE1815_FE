import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, ArrowRight, Car, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import staffRentalService from "@/services/staff/staffRentalService";

import HandoverTab from "./tabs/HandoverTab";
import InUseTab from "./tabs/InUseTab";
import ReturnTab from "./tabs/ReturnTab";

export default function RentalManagement() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("handover");
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [pendingRentals, setPendingRentals] = useState([]);
  const [inUseRentals, setInUseRentals] = useState([]);
  const [returningRentals, setReturningRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    refreshAll();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getReservations();
      setReservations(res?.data || res || []);
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể tải danh sách đặt chỗ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRentals = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getRentals({ status: "booked" });
      setPendingRentals(res?.data || res || []);
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể tải danh sách xe cần giao", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchInUseRentals = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getRentals({ status: "in_use" });
      setInUseRentals(res?.data || res || []);
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể tải xe đang cho thuê", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchReturningRentals = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getRentals({ status: "in_use" });
      setReturningRentals(res?.data || res || []);
    } catch (err) {
      toast({ title: "Lỗi", description: "Không thể tải danh sách xe cần nhận", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = () => {
    fetchReservations();
    fetchPendingRentals();
    fetchInUseRentals();
    fetchReturningRentals();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý giao - nhận xe</h1>
          <p className="text-muted-foreground">Xử lý các yêu cầu giao xe và nhận xe từ khách hàng</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm khách hàng, SĐT, biển số..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Button onClick={refreshAll} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Làm mới
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="handover" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" /> Đặt chỗ & Giao xe ({reservations.length + pendingRentals.length})
          </TabsTrigger>
          <TabsTrigger value="in-use" className="flex items-center gap-2">
            <Car className="h-4 w-4" /> Đang cho thuê ({inUseRentals.length})
          </TabsTrigger>
          <TabsTrigger value="return" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Nhận xe ({returningRentals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="handover">
          <HandoverTab
            reservations={reservations}
            pendingRentals={pendingRentals}
            fetchReservations={fetchReservations}
            fetchPendingRentals={fetchPendingRentals}
            fetchInUseRentals={fetchInUseRentals}
            toast={toast}
            loading={loading}
            searchTerm={searchTerm}
          />
        </TabsContent>

        <TabsContent value="in-use">
          <InUseTab rentals={inUseRentals} searchTerm={searchTerm} loading={loading} />
        </TabsContent>

        <TabsContent value="return">
          <ReturnTab rentals={returningRentals} fetchReturningRentals={fetchReturningRentals} toast={toast} searchTerm={searchTerm} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
