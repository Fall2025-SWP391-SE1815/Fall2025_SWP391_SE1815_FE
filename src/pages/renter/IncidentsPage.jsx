import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  AlertTriangle,
  Send,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Calendar,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Eye,
  Shield
} from 'lucide-react';

const IncidentsPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Incidents list states
  const [incidents, setIncidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  // Form states for new incident
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [currentRentals, setCurrentRentals] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedRental, setSelectedRental] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');

  useEffect(() => {
    loadIncidents();
    loadAvailableVehicles();
    loadCurrentRentals();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock GET /api/renter/incidents
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockIncidents = [
        {
          id: 1,
          vehicle_id: 1,
          rental_id: 1,
          description: 'Xe bị hỏng phanh đột ngột khi đang di chuyển trên đường',
          severity: 'high',
          status: 'resolved',
          created_at: '2024-09-20T14:30:00Z',
          resolved_at: '2024-09-22T10:15:00Z',
          vehicle_info: {
            model: 'VinFast Klara S',
            license_plate: '51F-12345'
          }
        },
        {
          id: 2,
          vehicle_id: 2,
          rental_id: 2,
          description: 'Pin xe tụt nhanh hơn bình thường, chỉ đi được 20km thay vì 50km như quảng cáo',
          severity: 'medium',
          status: 'in_progress',
          created_at: '2024-09-21T09:45:00Z',
          resolved_at: null,
          vehicle_info: {
            model: 'VinFast Theon S',
            license_plate: '51F-67890'
          }
        },
        {
          id: 3,
          vehicle_id: 3,
          rental_id: null,
          description: 'Màn hình hiển thị bị lỗi, không thể xem thông tin pin và tốc độ',
          severity: 'low',
          status: 'pending',
          created_at: '2024-09-22T16:20:00Z',
          resolved_at: null,
          vehicle_info: {
            model: 'VinFast Evo 200',
            license_plate: '51F-11111'
          }
        },
        {
          id: 4,
          vehicle_id: 1,
          rental_id: 4,
          description: 'Bánh xe bị thủng khi đang chạy, có thể do đinh hoặc vật sắc nhọn',
          severity: 'medium',
          status: 'rejected',
          created_at: '2024-09-18T11:30:00Z',
          resolved_at: '2024-09-19T14:20:00Z',
          vehicle_info: {
            model: 'VinFast Klara S',
            license_plate: '51F-12345'
          }
        }
      ];
      
      setIncidents(mockIncidents);
    } catch (err) {
      setError('Không thể tải danh sách báo cáo sự cố');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableVehicles = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock vehicles that can be reported
      const mockVehicles = [
        {
          id: 1,
          model: 'VinFast Klara S',
          license_plate: '51F-12345',
          status: 'available'
        },
        {
          id: 2,
          model: 'VinFast Theon S',
          license_plate: '51F-67890',
          status: 'rented'
        },
        {
          id: 3,
          model: 'VinFast Evo 200',
          license_plate: '51F-11111',
          status: 'available'
        },
        {
          id: 4,
          model: 'VinFast Klara S',
          license_plate: '51F-22222',
          status: 'rented'
        }
      ];
      
      setAvailableVehicles(mockVehicles);
    } catch (err) {
      setError('Không thể tải danh sách xe');
    }
  };

  const loadCurrentRentals = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock current active rentals
      const mockRentals = [
        {
          id: 1,
          vehicle_id: 2,
          vehicle_model: 'VinFast Theon S',
          license_plate: '51F-67890',
          start_time: '2024-09-24T08:00:00Z',
          status: 'active'
        },
        {
          id: 2,
          vehicle_id: 4,
          vehicle_model: 'VinFast Klara S',
          license_plate: '51F-22222',
          start_time: '2024-09-24T10:30:00Z',
          status: 'active'
        }
      ];
      
      setCurrentRentals(mockRentals);
    } catch (err) {
      setError('Không thể tải danh sách chuyến đi hiện tại');
    }
  };

  const submitIncident = async () => {
    if (!selectedVehicle || !description.trim()) {
      setError('Vui lòng chọn xe và mô tả sự cố');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Mock POST /api/renter/incidents
      const requestBody = {
        vehicle_id: parseInt(selectedVehicle),
        rental_id: selectedRental ? parseInt(selectedRental) : null,
        description: description.trim(),
        severity: severity
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const response = {
        incident: {
          id: Date.now(),
          vehicle_id: parseInt(selectedVehicle),
          rental_id: selectedRental ? parseInt(selectedRental) : null,
          description: description.trim(),
          severity: severity,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      };
      
      // Reset form
      setSelectedVehicle('');
      setSelectedRental('');
      setDescription('');
      setSeverity('medium');
      
      // Reload incidents list
      await loadIncidents();
      
      setSuccess('Báo cáo sự cố đã được gửi thành công! Chúng tôi sẽ xử lý trong thời gian sớm nhất.');
      setActiveTab('list');
    } catch (err) {
      setError('Không thể gửi báo cáo sự cố. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xử lý', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'Đang xử lý', icon: RefreshCw },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Đã giải quyết', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Từ chối', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center space-x-1">
        <IconComponent className="h-4 w-4" />
        <Badge className={config.color}>
          {config.label}
        </Badge>
      </div>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Thấp', icon: Shield },
      medium: { color: 'bg-orange-100 text-orange-800', label: 'Trung bình', icon: AlertTriangle },
      high: { color: 'bg-red-100 text-red-800', label: 'Cao', icon: Zap }
    };
    
    const config = severityConfig[severity] || severityConfig.medium;
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center space-x-1">
        <IconComponent className="h-4 w-4" />
        <Badge className={config.color}>
          {config.label}
        </Badge>
      </div>
    );
  };

  const getSelectedVehicleInfo = () => {
    return availableVehicles.find(v => v.id.toString() === selectedVehicle);
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = searchTerm === '' || 
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.vehicle_info.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.vehicle_info.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="h-8 w-8 mr-3 text-red-600" />
            Báo cáo sự cố
          </h1>
          <p className="text-gray-600 mt-2">
            Báo cáo các sự cố về xe và theo dõi tiến trình xử lý
          </p>
        </div>
        
        <Button
          onClick={loadIncidents}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Danh sách báo cáo
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Báo cáo sự cố mới
          </TabsTrigger>
        </TabsList>

        {/* Incidents List Tab */}
        <TabsContent value="list" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Tìm kiếm và lọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Tìm theo mã, xe, nội dung..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="in_progress">Đang xử lý</SelectItem>
                    <SelectItem value="resolved">Đã giải quyết</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mức độ nghiêm trọng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả mức độ</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSeverityFilter('all');
                  }}
                  variant="outline"
                >
                  Xóa lọc
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Incidents List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Danh sách báo cáo sự cố ({filteredIncidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có báo cáo sự cố nào
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                      ? 'Không tìm thấy báo cáo nào phù hợp với điều kiện lọc.'
                      : 'Bạn chưa gửi báo cáo sự cố nào.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIncidents.map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className="text-xs">
                            #{incident.id}
                          </Badge>
                          {getStatusBadge(incident.status)}
                          {getSeverityBadge(incident.severity)}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(incident.created_at).toLocaleDateString('vi-VN')}
                          </p>
                          {incident.resolved_at && (
                            <p className="text-xs text-green-600">
                              Giải quyết: {new Date(incident.resolved_at).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-gray-800 line-clamp-2">
                          {incident.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Xe:</p>
                          <p className="font-medium">
                            {incident.vehicle_info.model} - {incident.vehicle_info.license_plate}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mã chuyến:</p>
                          <p className="font-medium">
                            {incident.rental_id ? `#${incident.rental_id}` : 'Không có'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Thời gian báo cáo:</p>
                          <p className="font-medium">
                            {new Date(incident.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit Incident Tab */}
        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Báo cáo sự cố mới
              </CardTitle>
              <CardDescription>
                Mô tả chi tiết sự cố để chúng tôi có thể xử lý kịp thời
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Chọn xe gặp sự cố *
                </label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn xe cần báo cáo sự cố" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.license_plate} - {vehicle.model} 
                        ({vehicle.status === 'rented' ? 'Đang thuê' : 'Có sẵn'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Chuyến đi liên quan (nếu có)
                </label>
                <Select value={selectedRental} onValueChange={setSelectedRental}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chuyến đi (tùy chọn)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không liên quan đến chuyến đi</SelectItem>
                    {currentRentals.map(rental => (
                      <SelectItem key={rental.id} value={rental.id.toString()}>
                        #{rental.id} - {rental.license_plate} ({rental.vehicle_model})
                        - Bắt đầu: {new Date(rental.start_time).toLocaleDateString('vi-VN')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedVehicle && getSelectedVehicleInfo() && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Thông tin xe được chọn</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Biển số:</p>
                      <p className="font-medium text-blue-900">
                        {getSelectedVehicleInfo().license_plate}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">Loại xe:</p>
                      <p className="font-medium text-blue-900">
                        {getSelectedVehicleInfo().model}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">Trạng thái:</p>
                      <Badge className={getSelectedVehicleInfo().status === 'rented' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'}>
                        {getSelectedVehicleInfo().status === 'rented' ? 'Đang thuê' : 'Có sẵn'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Mức độ nghiêm trọng *
                </label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mức độ nghiêm trọng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp - Không ảnh hưởng đến an toàn</SelectItem>
                    <SelectItem value="medium">Trung bình - Ảnh hưởng đến trải nghiệm</SelectItem>
                    <SelectItem value="high">Cao - Nguy hiểm, cần xử lý ngay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Mô tả sự cố *
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết sự cố: vị trí xảy ra, thời gian, hiện tượng, mức độ ảnh hưởng..."
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/1000 ký tự
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Lưu ý quan trọng
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• <strong>Sự cố nghiêm trọng:</strong> Vui lòng gọi hotline ngay: <strong>1900-1234</strong></li>
                  <li>• <strong>An toàn:</strong> Dừng xe ở nơi an toàn nếu xe có vấn đề kỹ thuật</li>
                  <li>• <strong>Thông tin:</strong> Cung cấp vị trí chính xác để hỗ trợ nhanh chóng</li>
                  <li>• <strong>Xử lý:</strong> Báo cáo sẽ được xử lý trong vòng 30 phút đến 2 giờ</li>
                </ul>
              </div>

              <Button 
                onClick={submitIncident}
                disabled={loading || !selectedVehicle || !description.trim()}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Đang gửi...' : 'Gửi báo cáo sự cố'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentsPage;