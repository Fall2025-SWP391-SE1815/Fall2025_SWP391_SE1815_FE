// StationManagement.jsx (đã sửa)
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RefreshCw, AlertTriangle, Car, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import vehicleService from "@/services/vehicles/vehicleService";
import staffRentalService from "@/services/staff/staffRentalService";

import StationStats from "./StationStats";
import VehicleList from "./VehicleList";
import CurrentRentalsList from "./CurrentRentalsList";
import VehicleDetailDialog from "./dialogs/VehicleDetailDialog";
import VehicleUpdateDialog from "./dialogs/VehicleUpdateDialog";
import IncidentDialog from "./dialogs/IncidentDialog";

export default function StationManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [currentRentals, setCurrentRentals] = useState([]);

  const [dialogs, setDialogs] = useState({
    detail: false,
    update: false,
    incident: false,
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleService.staff.getAllStaffVehicles();
      setVehicles(res?.data || res);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách xe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentRentals = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getRentals({ status: "in_use" });
      setCurrentRentals(res?.data || res);
    } catch (err) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thuê",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchCurrentRentals();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý tại điểm</h1>
          <p className="text-muted-foreground">
            Quản lý xe, vi phạm, sự cố và lượt thuê tại trạm
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDialogs((d) => ({ ...d, incident: true }))}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Báo cáo sự cố
          </Button>
          <Button onClick={() => { fetchVehicles(); fetchCurrentRentals(); }} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StationStats vehicles={vehicles} />

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vehicles">
            <Car className="h-4 w-4 mr-1" /> Xe tại trạm ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="rentals">
            <Clock className="h-4 w-4 mr-1" /> Lượt thuê hiện tại ({currentRentals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <VehicleList
            vehicles={vehicles}
            loading={loading}
            onDetail={(v) => {
              setSelectedVehicle(v);
              setDialogs((d) => ({ ...d, detail: true }));
            }}
            onEdit={(v) => {
              setSelectedVehicle(v);
              setDialogs((d) => ({ ...d, update: true }));
            }}
          />
        </TabsContent>

        <TabsContent value="rentals">
          <CurrentRentalsList rentals={currentRentals} loading={loading} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <VehicleDetailDialog
        open={dialogs.detail}
        onOpenChange={(val) => setDialogs((d) => ({ ...d, detail: val }))}
        vehicle={selectedVehicle}
        onEdit={() =>
          setDialogs((d) => ({ ...d, detail: false, update: true }))
        }
      />

      <VehicleUpdateDialog
        open={dialogs.update}
        onOpenChange={(val) => setDialogs((d) => ({ ...d, update: val }))}
        vehicle={selectedVehicle}
        onUpdated={fetchVehicles}
      />

      <IncidentDialog
        open={dialogs.incident}
        onOpenChange={(val) => setDialogs((d) => ({ ...d, incident: val }))}
        vehicles={vehicles}
      />
    </div>
  );
}
