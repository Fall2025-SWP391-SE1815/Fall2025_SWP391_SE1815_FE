import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Calendar,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Wallet,
  AlertCircle,
  Receipt,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, methodFilter, dateFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, methodFilter, dateFilter]);

  const loadPaymentHistory = async () => {
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock GET /api/renter/payments response
      const mockResponse = {
        payments: [
          {
            id: 1,
            rental_id: 1,
            amount: 45000,
            method: 'credit_card',
            status: 'completed',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            rental_info: { vehicle_model: 'VinFast Klara S', license_plate: '51F-12345' }
          },
          {
            id: 2,
            rental_id: 2,
            amount: 37500,
            method: 'e_wallet',
            status: 'completed',
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            rental_info: { vehicle_model: 'VinFast Theon S', license_plate: '51F-67890' }
          },
          {
            id: 3,
            rental_id: 4,
            amount: 67500,
            method: 'bank_transfer',
            status: 'completed',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            rental_info: { vehicle_model: 'VinFast Evo 200', license_plate: '51F-11111' }
          },
          {
            id: 4,
            rental_id: 5,
            amount: 25000,
            method: 'credit_card',
            status: 'failed',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            rental_info: { vehicle_model: 'VinFast Klara S', license_plate: '51F-12345' }
          },
          {
            id: 5,
            rental_id: 6,
            amount: 52000,
            method: 'e_wallet',
            status: 'pending',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            rental_info: { vehicle_model: 'VinFast Theon S', license_plate: '51F-67890' }
          }
        ]
      };

      setPayments(mockResponse.payments.map(payment => ({
        ...payment,
        vehicleLicensePlate: payment.rental_info.license_plate,
        vehicleModel: payment.rental_info.vehicle_model,
        timestamp: payment.created_at,
        paymentMethod: payment.method,
        description: `Thanh toán thuê xe ${payment.rental_info.vehicle_model}`
      })));
    } catch (err) {
      console.error('Error loading payment history:', err);
      setError('Có lỗi xảy ra khi tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.rental_info.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.rental_info.vehicle_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toString().includes(searchTerm) ||
        payment.rental_id.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.method === methodFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        const diffDays = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          case 'quarter': return diffDays <= 90;
          default: return true;
        }
      });
    }

    setFilteredPayments(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Thành công</Badge>;
      case 'failed':
        return <Badge variant="destructive">Thất bại</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Đang xử lý</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'credit_card': return 'Thẻ tín dụng';
      case 'e_wallet': return 'Ví điện tử';
      case 'bank_transfer': return 'Chuyển khoản';
      default: return method;
    }
  };

  const handleViewDetail = (paymentId) => {
    navigate(`/payment-detail/${paymentId}`);
  };

  const handleDownloadReceipt = (paymentId) => {
    // Mock download functionality
    console.log('Downloading receipt for payment', paymentId);
    alert('Tính năng tải hóa đơn sẽ được triển khai sớm');
  };

  // Computed values
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wallet className="h-8 w-8 mr-3 text-green-600" />
            Lịch sử giao dịch
          </h1>
          <p className="text-gray-600 mt-2">
            Xem lại các giao dịch thanh toán đã thực hiện
          </p>
        </div>

        <Button
          onClick={loadPaymentHistory}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Tìm kiếm và lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Tìm theo ID, biển số..."
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
                <SelectItem value="completed">Thành công</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phương thức</SelectItem>
                <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                <SelectItem value="e_wallet">Ví điện tử</SelectItem>
                <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
                <SelectItem value="week">7 ngày qua</SelectItem>
                <SelectItem value="month">30 ngày qua</SelectItem>
                <SelectItem value="quarter">3 tháng qua</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setMethodFilter('all');
                setDateFilter('all');
              }}
              variant="outline"
            >
              Xóa lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <p>Payment content coming soon...</p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thành công</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thất bại</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng tiền</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    payments
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách giao dịch ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có giao dịch nào
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
                  ? 'Không tìm thấy giao dịch nào phù hợp với điều kiện lọc.'
                  : 'Bạn chưa thực hiện giao dịch thanh toán nào.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedPayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className="text-xs">
                          #{payment.id}
                        </Badge>
                        {getStatusBadge(payment.status)}
                        <span className="text-sm text-gray-500">
                          {payment.vehicleLicensePlate}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Số tiền:</p>
                          <p className="font-semibold text-lg">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Phương thức:</p>
                          <p className="font-medium">
                            {getMethodLabel(payment.paymentMethod)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Thời gian:</p>
                          <p className="font-medium">
                            {new Date(payment.timestamp).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mô tả:</p>
                          <p className="font-medium">
                            {payment.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(payment.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>

                      {payment.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReceipt(payment.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Hóa đơn
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredPayments.length)} trong tổng số {filteredPayments.length} giao dịch
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>

            <span className="text-sm font-medium">
              Trang {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
