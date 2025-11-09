import React, { useEffect, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useGlobalToast } from "@/components/ui/global-toast";
import staffRentalService from "@/services/staff/staffRentalService";
import {
  AlertTriangle, FileText, Plus, Car, Calendar, Shield, Flame, CheckCircle, User, Clock, Search,
} from "lucide-react";

const IncidentReportManagement = () => {
  const toast = useGlobalToast();

  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [incidentForm, setIncidentForm] = useState({
    vehicleId: "",
    description: "",
    severity: "low",
  });

  // ---------- Helper ----------
  const formatDateTime = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "N/A");

  const getSeverityBadge = (s) => {
    const cfg =
      {
        LOW: { label: "Thấp", variant: "secondary", icon: Shield },
        MEDIUM: { label: "Trung bình", variant: "outline", icon: AlertTriangle },
        HIGH: { label: "Cao", variant: "destructive", icon: Flame },
      }[s?.toUpperCase()] || { label: s || "-", variant: "outline", icon: Shield };
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="h-3 w-3" /> {cfg.label}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return { label: "Đang xử lý", variant: "secondary", icon: Clock };
      case "IN_REVIEW":
        return { label: "Đang xem xét", variant: "outline", icon: Search };
      case "RESOLVED":
        return { label: "Đã xử lý", variant: "default", icon: CheckCircle };
      default:
        return { label: s || "Không xác định", variant: "outline", icon: AlertTriangle };
    }
  };

  // ---------- Xử lý lỗi API ----------
  const handleApiError = (error, fallbackMsg = "Đã xảy ra lỗi. Vui lòng thử lại.") => {
    if (!error?.response) {
      const msg = error?.message?.toLowerCase?.().includes("network")
        ? "Không thể kết nối máy chủ. Kiểm tra mạng của bạn."
        : fallbackMsg;
      toast.error(msg, "Lỗi kết nối");
      return;
    }

    const { status, data } = error.response || {};
    const serverMsg = data?.message || data?.error || "";

    switch (status) {
      case 400:
        toast.error(serverMsg || "Dữ liệu gửi không hợp lệ. Vui lòng kiểm tra lại.", "Lỗi dữ liệu");
        break;
      case 401:
        toast.error("Phiên đăng nhập đã hết hạn hoặc không hợp lệ.", "Cần đăng nhập");
        break;
      case 403:
        toast.error("Bạn không có quyền thực hiện thao tác này.", "Bị từ chối");
        break;
      case 404:
        toast.error(serverMsg || "Không tìm thấy tài nguyên yêu cầu.", "Không tìm thấy");
        break;
      case 409: {
        const isDuplicate = /exist|duplicate|already/i.test(serverMsg || "");
        const vehicleHint = incidentForm.vehicleId
          ? `Xe ID ${incidentForm.vehicleId} `
          : "Xe này ";
        const msg = isDuplicate
          ? `${vehicleHint}đã có báo cáo sự cố chưa được xử lý.`
          : `${vehicleHint}đã có báo cáo sự cố đang tồn tại.`;
        toast.warning(msg, "Xung đột dữ liệu");
        break;
      }
      case 500:
        toast.error(serverMsg || "Máy chủ gặp sự cố khi xử lý yêu cầu.", "Lỗi hệ thống");
        break;
      default:
        toast.error(serverMsg || fallbackMsg, "Lỗi không xác định");
        break;
    }
  };

  // ---------- Data ----------
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await staffRentalService.getIncidentReports();
      const data = Array.isArray(response) ? response : response?.data || [];
      setIncidents(data);
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách sự cố.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Actions ----------
  const handleCreateIncident = async () => {
    const vehicleIdNum = Number.parseInt((incidentForm.vehicleId || "").trim(), 10);
    const description = (incidentForm.description || "").trim();

    if (!vehicleIdNum || Number.isNaN(vehicleIdNum)) {
      toast.warning("Vui lòng nhập đúng định dạng mã xe (số).", "Thiếu thông tin");
      return;
    }
    if (!description) {
      toast.warning("Vui lòng nhập mô tả sự cố.", "Thiếu thông tin");
      return;
    }

    const payload = {
      vehicleId: vehicleIdNum,
      description,
      severity: (incidentForm.severity || "low").toUpperCase(),
    };

    try {
      setLoading(true);
      await staffRentalService.createIncidentReport(payload);
      toast.success("Đã tạo báo cáo sự cố.");
      setCreateDialogOpen(false);
      setIncidentForm({ vehicleId: "", description: "", severity: "low" });
      await fetchIncidents();
    } catch (error) {
      handleApiError(error, "Không thể tạo báo cáo sự cố.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-yellow-500 h-6 w-6" />
            Báo cáo Sự cố
          </h2>
          <p className="text-gray-600">Danh sách và tạo mới báo cáo sự cố</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Tạo Báo cáo
        </Button>
      </div>

      {/* Danh sách sự cố */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Danh sách Báo cáo Sự cố ({incidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Đang tải...</p>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-6 h-6 mx-auto mb-2" />
              Không có báo cáo sự cố nào.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-center">ID</TableHead>
                    <TableHead>Xe</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-center">Mức độ</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-center">Ngày tạo</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => {
                    const cfg = getStatusBadge(incident.status);
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={incident.id}>
                        <TableCell className="text-center font-medium">
                          #{incident.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Car className="w-4 h-4 text-gray-500" />
                            {incident.vehicle?.licensePlate ||
                              incident.vehicle?.license_plate ||
                              "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>{incident.description}</TableCell>
                        <TableCell className="text-center">
                          {getSeverityBadge(incident.severity)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={cfg.variant} className="gap-1">
                            <Icon className="h-3 w-3" /> {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-gray-600 text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDateTime(incident.createdAt || incident.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setDetailDialogOpen(true);
                            }}
                          >
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog tạo báo cáo */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo Báo cáo Sự cố</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về sự cố đã xảy ra.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="vehicleId">Mã xe *</Label>
              <Input
                id="vehicleId"
                inputMode="numeric"
                value={incidentForm.vehicleId}
                onChange={(e) =>
                  setIncidentForm({ ...incidentForm, vehicleId: e.target.value })
                }
                placeholder="Nhập ID xe (số)"
              />
            </div>

            <div>
              <Label htmlFor="severity">Mức độ nghiêm trọng *</Label>
              <select
                id="severity"
                className="w-full px-3 py-2 border rounded-md"
                value={incidentForm.severity}
                onChange={(e) =>
                  setIncidentForm({ ...incidentForm, severity: e.target.value })
                }
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Nhập mô tả chi tiết sự cố..."
                value={incidentForm.description}
                onChange={(e) =>
                  setIncidentForm({ ...incidentForm, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={loading}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateIncident}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Đang gửi..." : "Tạo Báo Cáo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Chi tiết */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Chi tiết báo cáo sự cố #{selectedIncident?.id}
            </DialogTitle>
            <DialogDescription>Thông tin chi tiết về sự cố</DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-4">
              {/* Thông tin cơ bản */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Mức độ nghiêm trọng</Label>
                    {getSeverityBadge(selectedIncident.severity)}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Trạng thái</Label>
                    {(() => {
                      const cfg = getStatusBadge(selectedIncident.status);
                      const Icon = cfg.icon;
                      return (
                        <Badge variant={cfg.variant} className="gap-1 mt-1">
                          <Icon className="h-3 w-3" /> {cfg.label}
                        </Badge>
                      );
                    })()}
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Ngày tạo</Label>
                    <p className="font-medium">
                      {formatDateTime(selectedIncident.createdAt || selectedIncident.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Xe */}
              {selectedIncident.vehicle && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Xe liên quan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Biển số</Label>
                      <p className="font-medium">
                        {selectedIncident.vehicle.licensePlate ||
                          selectedIncident.vehicle.license_plate}
                      </p>
                    </div>
                    <div>
                      <Label>Model</Label>
                      <p className="font-medium">
                        {selectedIncident.vehicle.brand} {selectedIncident.vehicle.model}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mô tả */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Mô tả sự cố</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    {selectedIncident.description}
                  </div>
                </CardContent>
              </Card>

              {/* Nhân viên báo cáo */}
              {selectedIncident.staff && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nhân viên báo cáo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Tên</Label>
                      <p className="font-medium">{selectedIncident.staff.fullName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{selectedIncident.staff.email}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ghi chú xử lý */}
              {selectedIncident.resolutionNotes && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-900">
                      <CheckCircle className="h-4 w-4" />
                      Ghi chú xử lý
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-900 whitespace-pre-wrap">
                      {selectedIncident.resolutionNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentReportManagement;