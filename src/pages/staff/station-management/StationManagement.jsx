import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Car, Activity, Clock, Wrench, RefreshCw, Flag, AlertTriangle } from "lucide-react";
import VehicleTable from "./VehicleTable";
import RentalTable from "./RentalTable";
import VehicleStatusDialog from "./dialogs/VehicleStatusDialog";
import ViolationDialog from "./dialogs/ViolationDialog";
import IncidentDialog from "./dialogs/IncidentDialog";
import apiClient from "@/lib/api/apiClient";
import { useToast } from "@/hooks/use-toast";

export default function StationManagement() {
  const { toast } = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [currentRentals, setCurrentRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("vehicles");

  const [vehicleDialog, setVehicleDialog] = useState({ open: false, vehicle: null });
  const [violationDialog, setViolationDialog] = useState({ open: false, rental: null });
  const [incidentDialog, setIncidentDialog] = useState({ open: false, rental: null });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/station/vehicles");
      setVehicles(res.data || []);
    } catch {
      toast({ variant: "destructive", title: "Lỗi tải danh sách xe" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentRentals = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/station/rentals/current");
      setCurrentRentals(res.data || []);
    } catch {
      toast({ variant: "destructive", title: "Lỗi tải danh sách lượt thuê" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchCurrentRentals();
  }, []);

  const handleRefresh = async () => {
    if (activeTab === "vehicles") await fetchVehicles();
    else await fetchCurrentRentals();
    toast({ title: "Dữ liệu đã được làm mới" });
  };

  const handleOpenVehicleDialog = (vehicle) => setVehicleDialog({ open: true, vehicle });
  const handleOpenViolationDialog = (rental) => setViolationDialog({ open: true, rental });
  const handleOpenIncidentDialog = (rental) => setIncidentDialog({ open: true, rental });

  // ---- Thống kê đơn giản ----
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === "AVAILABLE").length;
  const rentingVehicles = currentRentals.length;
  const maintenanceVehicles = vehicles.filter(v => v.status === "MAINTENANCE").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tại điểm</h1>
          <p className="text-gray-600">
            Quản lý xe, vi phạm, sự cố và lượt thuê tại trạm
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setViolationDialog({ open: true })}>
            <Flag className="mr-2 h-4 w-4" /> Ghi nhận vi phạm
          </Button>
          <Button variant="outline" onClick={() => setIncidentDialog({ open: true })}>
            <AlertTriangle className="mr-2 h-4 w-4" /> Báo cáo sự cố
          </Button>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
          </Button>
        </div>
      </div>

      {/* Cards thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số xe</CardTitle>
            <Car className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Xe tại trạm này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Xe khả dụng</CardTitle>
            <Activity className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableVehicles}</div>
            <p className="text-xs text-muted-foreground">Sẵn sàng cho thuê</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đang thuê</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentingVehicles}</div>
            <p className="text-xs text-muted-foreground">Xe đang được sử dụng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bảo trì</CardTitle>
            <Wrench className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceVehicles}</div>
            <p className="text-xs text-muted-foreground">Xe cần bảo trì</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">
            🚗 Xe tại trạm ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="rentals">
            ⏱️ Lượt thuê hiện tại ({currentRentals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <VehicleTable
            vehicles={vehicles}
            loading={loading}
            onUpdateStatus={handleOpenVehicleDialog}
          />
        </TabsContent>

        <TabsContent value="rentals">
          <RentalTable
            rentals={currentRentals}
            loading={loading}
            onReportViolation={handleOpenViolationDialog}
            onReportIncident={handleOpenIncidentDialog}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <VehicleStatusDialog
        open={vehicleDialog.open}
        vehicle={vehicleDialog.vehicle}
        setOpen={(open) => setVehicleDialog({ ...vehicleDialog, open })}
        refresh={fetchVehicles}
      />

      <ViolationDialog
        open={violationDialog.open}
        rental={violationDialog.rental}
        setOpen={(open) => setViolationDialog({ ...violationDialog, open })}
        refresh={fetchCurrentRentals}
      />

      <IncidentDialog
        open={incidentDialog.open}
        rental={incidentDialog.rental}
        setOpen={(open) => setIncidentDialog({ ...incidentDialog, open })}
        refresh={fetchCurrentRentals}
      />
    </div>
  );
}
