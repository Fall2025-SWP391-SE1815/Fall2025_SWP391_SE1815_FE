import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import staffRentalService from "@/services/staff/staffRentalService";
import { Search, AlertTriangle, FileText, Plus, Car, Calendar } from "lucide-react";

const IncidentReportManagement = () => {
  const { toast } = useToast();
  const [rentalId, setRentalId] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    description: "",
    fineAmount: "",
  });

  // Tìm kiếm theo rental_id
  const fetchIncidents = async () => {
    if (!rentalId) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mã thuê xe để tìm kiếm.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await staffRentalService.getIncidentReports(rentalId);
      setIncidents(response || []);
      toast({
        title: "Thành công",
        description: `Đã tải ${response?.length || 0} báo cáo sự cố.`,
      });
    } catch (error) {
      console.error("Error fetching incident reports:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách sự cố.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Khi tạo báo cáo
  const handleCreateIncident = async () => {
    if (!rentalId || !incidentForm.description || !incidentForm.fineAmount) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đủ thông tin trước khi tạo báo cáo.",
      });
      return;
    }

    try {
      setLoading(true);
      await staffRentalService.createIncidentReport(rentalId, incidentForm);
      toast({ title: "Thành công", description: "Đã tạo báo cáo sự cố mới." });
      setCreateDialogOpen(false);
      setIncidentForm({ description: "", fineAmount: "" });
      await fetchIncidents();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể tạo báo cáo sự cố.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-yellow-500 h-6 w-6" />
            Báo cáo Sự cố / Vi phạm
          </h2>
          <p className="text-gray-600">Tìm kiếm và tạo báo cáo vi phạm thuê xe</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Tạo Báo cáo Sự cố
        </Button>
      </div>

      {/* Search bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" /> Tìm kiếm theo mã thuê xe
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Nhập mã thuê xe (VD: 17)"
            value={rentalId}
            onChange={(e) => setRentalId(e.target.value)}
          />
          <Button onClick={fetchIncidents} disabled={loading}>
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
        </CardContent>
      </Card>

      {/* Danh sách sự cố */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-700">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Danh sách Báo cáo Sự cố
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[80px] text-center">ID</TableHead>
                  <TableHead className="text-center">Mã Thuê Xe</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-center">Tiền phạt</TableHead>
                  <TableHead className="text-center">Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <FileText className="w-6 h-6" />
                        Không có báo cáo sự cố nào.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  incidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      className="hover:bg-gray-50 transition-all"
                    >
                      <TableCell className="text-center font-medium">
                        {incident.id}
                      </TableCell>
                      <TableCell className="text-center text-gray-700">
                        <div className="flex items-center justify-center gap-1">
                          <Car className="w-4 h-4 text-gray-500" />
                          {incident.rental?.id || rentalId}
                        </div>
                      </TableCell>
                      <TableCell>{incident.description}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {Number(incident.fineAmount).toLocaleString()} đ
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-gray-600 text-sm">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(incident.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog tạo báo cáo */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo Báo cáo Sự cố Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết về sự cố đã xảy ra
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rental_id">Mã thuê xe</Label>
              <Input
                id="rental_id"
                value={incidentForm.rental_id}
                onChange={(e) => setIncidentForm({ ...incidentForm, rental_id: e.target.value })}
                placeholder="Nhập mã thuê xe"
              />
            </div>

            <div>
              <Label htmlFor="incident_type">Loại sự cố</Label>
              <Input
                id="incident_type"
                value={incidentForm.incident_type}
                onChange={(e) => setIncidentForm({ ...incidentForm, incident_type: e.target.value })}
                placeholder="VD: Hỏng xe, tai nạn, mất trộm..."
              />
            </div>

            <div>
              <Label htmlFor="location">Địa điểm</Label>
              <Input
                id="location"
                value={incidentForm.location}
                onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
                placeholder="Địa điểm xảy ra sự cố"
              />
            </div>

            <div>
              <Label htmlFor="severity">Mức độ nghiêm trọng</Label>
              <select
                id="severity"
                className="w-full px-3 py-2 border rounded-md"
                value={incidentForm.severity}
                onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <Textarea
                id="description"
                value={incidentForm.description}
                onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                placeholder="Mô tả chi tiết về sự cố..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateIncident}
              disabled={loading || !incidentForm.incident_type || !incidentForm.description}
            >
              {loading ? "Đang tạo..." : "Tạo Báo cáo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentReportManagement;