import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import {
  AlertTriangle,
  FileText,
  Plus,
  Calendar,
  User,
  Car,
  MapPin
} from 'lucide-react';

const IncidentReportManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [incidentForm, setIncidentForm] = useState({
    rental_id: '',
    incident_type: '',
    description: '',
    location: '',
    severity: 'low',
    reported_by_staff: true
  });

  // Fetch incident reports
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await staffRentalService.getIncidentReports();
      console.log('Incident reports response:', response);
      setIncidents(response || []); // Response is directly an array, not nested in data
    } catch (error) {
      console.error('Error fetching incident reports:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách báo cáo sự cố"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Handle create incident report
  const handleCreateIncident = async () => {
    try {
      if (!incidentForm.rental_id || !incidentForm.incident_type || !incidentForm.description) {
        toast({
          variant: "destructive",
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin bắt buộc"
        });
        return;
      }

      setLoading(true);
      const response = await staffRentalService.createIncidentReport(incidentForm);
      console.log('Create incident response:', response);
      
      toast({
        title: "Thành công",
        description: "Đã tạo báo cáo sự cố mới thành công"
      });
      
      setCreateDialogOpen(false);
      setIncidentForm({
        rental_id: '',
        incident_type: '',
        description: '',
        location: '',
        severity: 'low',
        reported_by_staff: true
      });
      
      await fetchIncidents();
    } catch (error) {
      console.error('Error creating incident report:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể tạo báo cáo sự cố"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      low: 'default',
      medium: 'secondary', 
      high: 'destructive'
    };
    
    const labels = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao'
    };
    
    return (
      <Badge variant={variants[severity]}>
        {labels[severity]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Báo cáo Sự cố</h2>
          <p className="text-gray-600">Tạo và quản lý các báo cáo sự cố</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Báo cáo Sự cố
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danh sách Báo cáo Sự cố
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Mã Thuê</TableHead>
                <TableHead>Loại Sự cố</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <span className="text-gray-500">Chưa có báo cáo sự cố nào</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>{incident.id}</TableCell>
                    <TableCell>{incident.rental_id}</TableCell>
                    <TableCell>{incident.incident_type}</TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell>{incident.location}</TableCell>
                    <TableCell>
                      {new Date(incident.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {incident.status || 'Đang xử lý'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Incident Dialog */}
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
                onChange={(e) => setIncidentForm({...incidentForm, rental_id: e.target.value})}
                placeholder="Nhập mã thuê xe"
              />
            </div>
            
            <div>
              <Label htmlFor="incident_type">Loại sự cố</Label>
              <Input
                id="incident_type"
                value={incidentForm.incident_type}
                onChange={(e) => setIncidentForm({...incidentForm, incident_type: e.target.value})}
                placeholder="VD: Hỏng xe, tai nạn, mất trộm..."
              />
            </div>
            
            <div>
              <Label htmlFor="location">Địa điểm</Label>
              <Input
                id="location"
                value={incidentForm.location}
                onChange={(e) => setIncidentForm({...incidentForm, location: e.target.value})}
                placeholder="Địa điểm xảy ra sự cố"
              />
            </div>
            
            <div>
              <Label htmlFor="severity">Mức độ nghiêm trọng</Label>
              <select
                id="severity"
                className="w-full px-3 py-2 border rounded-md"
                value={incidentForm.severity}
                onChange={(e) => setIncidentForm({...incidentForm, severity: e.target.value})}
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
                onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
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