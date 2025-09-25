import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  MessageSquare,
  Send,
  RefreshCw,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Car
} from 'lucide-react';

const ComplaintsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Complaints list states
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form states for new complaint
  const [availableRentals, setAvailableRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [description, setDescription] = useState('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  useEffect(() => {
    loadComplaints();
    loadAvailableRentals();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock GET /api/renter/complaints
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockComplaints = [
        {
          id: 1,
          description: 'Xe bị hỏng giữa đường, không thể tiếp tục chuyến đi',
          status: 'resolved',
          created_at: '2024-09-20T10:30:00Z',
          resolved_at: '2024-09-22T14:20:00Z',
          rental_id: 1,
          staff_id: 2
        },
        {
          id: 2,
          description: 'Nhân viên giao xe không đúng thời gian đã hẹn',
          status: 'in_progress',
          created_at: '2024-09-21T08:15:00Z',
          resolved_at: null,
          rental_id: 2,
          staff_id: 1
        },
        {
          id: 3,
          description: 'Pin xe không đủ như thông báo ban đầu',
          status: 'pending',
          created_at: '2024-09-22T16:45:00Z',
          resolved_at: null,
          rental_id: 3,
          staff_id: null
        },
        {
          id: 4,
          description: 'Phí thuê không đúng như báo giá',
          status: 'rejected',
          created_at: '2024-09-18T11:20:00Z',
          resolved_at: '2024-09-19T09:10:00Z',
          rental_id: 4,
          staff_id: null
        }
      ];
      
      setComplaints(mockComplaints);
    } catch (err) {
      setError('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRentals = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock rentals that can be complained about
      const mockRentals = [
        {
          id: 1,
          vehicleModel: 'VinFast Klara S',
          licensePlate: '51F-12345',
          startTime: '2024-09-20T08:00:00Z',
          endTime: '2024-09-20T18:30:00Z',
          status: 'completed',
          staff: {
            id: 1,
            name: 'Nguyễn Văn A',
            role: 'Nhân viên giao xe'
          }
        },
        {
          id: 2,
          vehicleModel: 'VinFast Theon S',
          licensePlate: '51F-67890',
          startTime: '2024-09-18T09:00:00Z',
          endTime: '2024-09-18T17:00:00Z',
          status: 'completed',
          staff: {
            id: 2,
            name: 'Trần Thị B',
            role: 'Nhân viên nhận xe'
          }
        },
        {
          id: 3,
          vehicleModel: 'VinFast Evo 200',
          licensePlate: '51F-11111',
          startTime: '2024-09-15T10:00:00Z',
          endTime: '2024-09-15T19:00:00Z',
          status: 'completed',
          staff: {
            id: 3,
            name: 'Lê Văn C',
            role: 'Nhân viên giao xe'
          }
        }
      ];
      
      setAvailableRentals(mockRentals);
    } catch (err) {
      setError('Không thể tải danh sách chuyến đi');
    }
  };

  const submitComplaint = async () => {
    if (!selectedRental || !description.trim()) {
      setError('Vui lòng chọn chuyến đi và mô tả vấn đề');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Mock POST /api/renter/complaints
      const requestBody = {
        rental_id: parseInt(selectedRental),
        staff_id: selectedStaff && selectedStaff !== 'none' ? parseInt(selectedStaff) : null,
        description: description.trim()
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const response = {
        complaint: {
          id: Date.now(),
          rental_id: parseInt(selectedRental),
          renter_id: 1,
          staff_id: selectedStaff && selectedStaff !== 'none' ? parseInt(selectedStaff) : null,
          description: description.trim(),
          status: 'pending',
          created_at: new Date().toISOString()
        }
      };
      
      // Reset form
      setSelectedRental('');
      setSelectedStaff('');
      setDescription('');
      setShowSubmitDialog(false);
      
      // Reload complaints list
      await loadComplaints();
      
      setSuccess('Khiếu nại đã được gửi thành công! Chúng tôi sẽ xử lý trong thời gian sớm nhất.');
      setActiveTab('list');
    } catch (err) {
      setError('Không thể gửi khiếu nại. Vui lòng thử lại.');
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

  const getSelectedRentalInfo = () => {
    return availableRentals.find(r => r.id.toString() === selectedRental);
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = searchTerm === '' || 
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (complaintId) => {
    navigate(`/complaint-detail/${complaintId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="h-8 w-8 mr-3 text-red-600" />
            Khiếu nại & Hỗ trợ
          </h1>
          <p className="text-gray-600 mt-2">
            Gửi khiếu nại và theo dõi tiến trình xử lý
          </p>
        </div>
        
        <Button
          onClick={loadComplaints}
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
            <MessageSquare className="h-4 w-4 mr-2" />
            Danh sách khiếu nại
          </TabsTrigger>
          <TabsTrigger value="submit" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Gửi khiếu nại mới
          </TabsTrigger>
        </TabsList>

        {/* Complaints List Tab */}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Tìm theo mã, nội dung..."
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
                
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  variant="outline"
                >
                  Xóa lọc
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Complaints List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Danh sách khiếu nại ({filteredComplaints.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không có khiếu nại nào
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Không tìm thấy khiếu nại nào phù hợp với điều kiện lọc.'
                      : 'Bạn chưa gửi khiếu nại nào.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredComplaints.map((complaint) => (
                    <div key={complaint.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className="text-xs">
                            #{complaint.id}
                          </Badge>
                          {getStatusBadge(complaint.status)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(complaint.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-gray-800 line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Mã chuyến:</p>
                          <p className="font-medium">#{complaint.rental_id}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ngày gửi:</p>
                          <p className="font-medium">
                            {new Date(complaint.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ngày giải quyết:</p>
                          <p className="font-medium">
                            {complaint.resolved_at 
                              ? new Date(complaint.resolved_at).toLocaleDateString('vi-VN')
                              : 'Chưa giải quyết'}
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

        {/* Submit Complaint Tab */}
        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Gửi khiếu nại mới
              </CardTitle>
              <CardDescription>
                Mô tả vấn đề bạn gặp phải để chúng tôi có thể hỗ trợ tốt nhất
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Chọn chuyến đi liên quan *
                </label>
                <Select value={selectedRental} onValueChange={setSelectedRental}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chuyến đi cần khiếu nại" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRentals.map(rental => (
                      <SelectItem key={rental.id} value={rental.id.toString()}>
                        #{rental.id} - {rental.licensePlate} ({rental.vehicleModel})
                        - {new Date(rental.startTime).toLocaleDateString('vi-VN')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRental && getSelectedRentalInfo() && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Thông tin chuyến đi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Xe:</p>
                      <p className="font-medium text-blue-900">
                        {getSelectedRentalInfo().vehicleModel} - {getSelectedRentalInfo().licensePlate}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">Nhân viên phụ trách:</p>
                      <p className="font-medium text-blue-900">
                        {getSelectedRentalInfo().staff.name} ({getSelectedRentalInfo().staff.role})
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">Thời gian:</p>
                      <p className="font-medium text-blue-900">
                        {new Date(getSelectedRentalInfo().startTime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">Trạng thái:</p>
                      <Badge className="bg-green-100 text-green-800">
                        {getSelectedRentalInfo().status === 'completed' ? 'Đã hoàn thành' : 'Đang diễn ra'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {selectedRental && getSelectedRentalInfo() && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Khiếu nại liên quan đến nhân viên (tùy chọn)
                  </label>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhân viên nếu khiếu nại liên quan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không liên quan đến nhân viên</SelectItem>
                      <SelectItem value={getSelectedRentalInfo().staff.id.toString()}>
                        {getSelectedRentalInfo().staff.name} - {getSelectedRentalInfo().staff.role}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Mô tả vấn đề *
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải, thời gian xảy ra, và tác động..."
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/1000 ký tự
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Lưu ý</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Vui lòng mô tả vấn đề một cách chi tiết và rõ ràng</li>
                  <li>• Chúng tôi sẽ xử lý khiếu nại trong vòng 24-48 giờ</li>
                  <li>• Bạn có thể theo dõi tiến trình xử lý trong tab "Danh sách khiếu nại"</li>
                </ul>
              </div>

              <Button 
                onClick={submitComplaint}
                disabled={loading || !selectedRental || !description.trim()}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Đang gửi...' : 'Gửi khiếu nại'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplaintsPage;