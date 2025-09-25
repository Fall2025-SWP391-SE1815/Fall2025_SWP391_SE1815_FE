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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Shield,
  ShieldCheck,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  User,
  CreditCard,
  Car,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Image
} from 'lucide-react';

const CustomerVerification = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDocuments, setCustomerDocuments] = useState([]);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [viewImageDialogOpen, setViewImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Mock data for customers needing verification
  const mockCustomers = [
    {
      id: 1,
      full_name: "Nguyễn Văn Minh",
      phone: "0909123456",
      email: "minh.nguyen@email.com",
      registration_date: "2025-09-20T10:30:00Z",
      verification_status: "pending",
      total_documents: 2,
      verified_documents: 0
    },
    {
      id: 2,
      full_name: "Trần Thị Lan",
      phone: "0912345678",
      email: "lan.tran@email.com",
      registration_date: "2025-09-21T14:15:00Z",
      verification_status: "partial",
      total_documents: 2,
      verified_documents: 1
    },
    {
      id: 3,
      full_name: "Lê Hoàng Nam",
      phone: "0987654321",
      email: "nam.le@email.com",
      registration_date: "2025-09-22T09:45:00Z",
      verification_status: "pending",
      total_documents: 3,
      verified_documents: 0
    },
    {
      id: 4,
      full_name: "Phạm Văn Đức",
      phone: "0901234567",
      email: "duc.pham@email.com",
      registration_date: "2025-09-18T16:20:00Z",
      verification_status: "verified",
      total_documents: 2,
      verified_documents: 2
    },
    {
      id: 5,
      full_name: "Võ Thị Mai",
      phone: "0913456789",
      email: "mai.vo@email.com",
      registration_date: "2025-09-19T11:10:00Z",
      verification_status: "partial",
      total_documents: 3,
      verified_documents: 2
    }
  ];

  // Mock documents data
  const mockDocuments = {
    1: [
      {
        id: 101,
        type: "CCCD",
        document_number: "024123456789",
        document_url: "https://example.com/cccd1.jpg",
        verified: false,
        verified_by: null,
        upload_date: "2025-09-20T10:35:00Z"
      },
      {
        id: 102,
        type: "GPLX",
        document_number: "B124567890",
        document_url: "https://example.com/gplx1.jpg",
        verified: false,
        verified_by: null,
        upload_date: "2025-09-20T10:40:00Z"
      }
    ],
    2: [
      {
        id: 103,
        type: "CCCD",
        document_number: "024987654321",
        document_url: "https://example.com/cccd2.jpg",
        verified: true,
        verified_by: 1,
        upload_date: "2025-09-21T14:20:00Z"
      },
      {
        id: 104,
        type: "GPLX",
        document_number: "A234567890",
        document_url: "https://example.com/gplx2.jpg",
        verified: false,
        verified_by: null,
        upload_date: "2025-09-21T14:25:00Z"
      }
    ],
    3: [
      {
        id: 105,
        type: "CCCD",
        document_number: "024555666777",
        document_url: "https://example.com/cccd3.jpg",
        verified: false,
        verified_by: null,
        upload_date: "2025-09-22T09:50:00Z"
      },
      {
        id: 106,
        type: "GPLX",
        document_number: "B345678901",
        document_url: "https://example.com/gplx3.jpg",
        verified: false,
        verified_by: null,
        upload_date: "2025-09-22T09:55:00Z"
      },
      {
        id: 107,
        type: "Passport",
        document_number: "P123456789",
        document_url: "https://example.com/passport3.jpg",
        verified: false,
        verified_by: null,
        upload_date: "2025-09-22T10:00:00Z"
      }
    ],
    4: [
      {
        id: 108,
        type: "CCCD",
        document_number: "024111222333",
        document_url: "https://example.com/cccd4.jpg",
        verified: true,
        verified_by: 1,
        upload_date: "2025-09-18T16:25:00Z"
      },
      {
        id: 109,
        type: "GPLX",
        document_number: "A456789012",
        document_url: "https://example.com/gplx4.jpg",
        verified: true,
        verified_by: 1,
        upload_date: "2025-09-18T16:30:00Z"
      }
    ],
    5: [
      {
        id: 110,
        type: "CCCD",
        document_number: "024444555666",
        document_url: "https://example.com/cccd5.jpg",
        verified: true,
        verified_by: 1,
        upload_date: "2025-09-19T11:15:00Z"
      },
      {
        id: 111,
        type: "GPLX",
        document_number: "B567890123",
        document_url: "https://example.com/gplx5.jpg",
        verified: true,
        verified_by: 1,
        upload_date: "2025-09-19T11:20:00Z"
      },
      {
        id: 112,
        type: "Passport",
        document_number: "P987654321",
        document_url: "https://example.com/passport5.jpg",
        verified: false,
        verified_by: null,
        upload_date: "2025-09-19T11:25:00Z"
      }
    ]
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/api/staff/customers/verification-pending');
      
      // Using mock data for now
      setCustomers(mockCustomers);
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khách hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDocuments = async (customerId) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/api/staff/renters/${customerId}/documents`);
      // setCustomerDocuments(response.data.documents);
      
      // Using mock data for now
      const documents = mockDocuments[customerId] || [];
      setCustomerDocuments(documents);
      
    } catch (error) {
      console.error('Error fetching customer documents:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải tài liệu khách hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocuments = async (customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerDocuments(customer.id);
    setDocumentsDialogOpen(true);
  };

  const verifyDocument = async (documentId, verified) => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.post(`/api/staff/renters/${selectedCustomer.id}/verify-documents`, {
      //   document_id: documentId,
      //   verified: verified
      // });
      
      // Mock success response
      const mockResponse = {
        success: true,
        message: "Tài liệu đã được xác thực.",
        data: {
          document_id: documentId,
          user_id: selectedCustomer.id,
          type: "CCCD", // This would come from the actual document
          document_number: "024123456789",
          document_url: "https://example.com/document.jpg",
          verified: verified,
          verified_by: 1 // Current staff ID
        }
      };

      toast({
        title: verified ? "Xác thực thành công" : "Từ chối tài liệu",
        description: mockResponse.message,
        variant: verified ? "default" : "destructive",
      });

      // Refresh documents
      await fetchCustomerDocuments(selectedCustomer.id);
      
      // Refresh customers list to update verification status
      fetchCustomers();
      
    } catch (error) {
      console.error('Error verifying document:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xác thực tài liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewImage = (imageUrl, documentType, documentNumber) => {
    setSelectedImage({
      url: imageUrl,
      type: documentType,
      number: documentNumber
    });
    setViewImageDialogOpen(true);
  };

  const getVerificationStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xác thực', variant: 'destructive', icon: AlertTriangle },
      partial: { label: 'Một phần', variant: 'outline', icon: Shield },
      verified: { label: 'Đã xác thực', variant: 'default', icon: ShieldCheck }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'outline', icon: AlertTriangle };
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDocumentTypeBadge = (type) => {
    const typeConfig = {
      CCCD: { label: 'CCCD', variant: 'default', icon: CreditCard },
      GPLX: { label: 'GPLX', variant: 'secondary', icon: Car },
      Passport: { label: 'Hộ chiếu', variant: 'outline', icon: FileText }
    };
    
    const config = typeConfig[type] || { label: type, variant: 'outline', icon: FileText };
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Xác thực khách hàng</h1>
          <p className="text-muted-foreground">
            Xem và xác thực tài liệu CCCD/GPLX của khách hàng
          </p>
        </div>
        <Button onClick={fetchCustomers} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm khách hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm theo tên, số điện thoại hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Danh sách khách hàng ({filteredCustomers.length})
          </CardTitle>
          <CardDescription>
            Khách hàng cần xác thực tài liệu hoặc đã hoàn thành xác thực
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Không tìm thấy khách hàng phù hợp' : 'Không có khách hàng nào'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thông tin khách hàng</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Tài liệu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {customer.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.phone}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {formatDateTime(customer.registration_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm">
                          Tổng: {customer.total_documents} tài liệu
                        </div>
                        <div className="text-sm text-green-600">
                          Đã xác thực: {customer.verified_documents}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVerificationStatusBadge(customer.verification_status)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocuments(customer)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem tài liệu
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Documents Dialog */}
      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tài liệu của {selectedCustomer?.full_name}
            </DialogTitle>
            <DialogDescription>
              Xem chi tiết và xác thực các tài liệu đã tải lên
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Customer Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Họ tên</Label>
                    <p className="font-medium">{selectedCustomer?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Số điện thoại</Label>
                    <p className="font-medium">{selectedCustomer?.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedCustomer?.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Trạng thái</Label>
                    <div className="mt-1">
                      {selectedCustomer && getVerificationStatusBadge(selectedCustomer.verification_status)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Danh sách tài liệu</CardTitle>
              </CardHeader>
              <CardContent>
                {customerDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Khách hàng chưa tải lên tài liệu nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerDocuments.map((document) => (
                      <div key={document.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col space-y-2">
                              {getDocumentTypeBadge(document.type)}
                              <div className="text-sm font-medium">
                                Số: {document.document_number}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Tải lên: {formatDateTime(document.upload_date)}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewImage(
                                  document.document_url,
                                  document.type,
                                  document.document_number
                                )}
                              >
                                <Image className="h-4 w-4 mr-2" />
                                Xem ảnh
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {document.verified ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Đã xác thực
                              </Badge>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => verifyDocument(document.id, false)}
                                  disabled={loading}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Từ chối
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => verifyDocument(document.id, true)}
                                  disabled={loading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Xác thực
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentsDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image View Dialog */}
      <Dialog open={viewImageDialogOpen} onOpenChange={setViewImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              {selectedImage?.type} - {selectedImage?.number}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-center">
                <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Xem trước ảnh tài liệu</p>
                    <p className="text-sm text-muted-foreground">URL: {selectedImage?.url}</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <a href={selectedImage?.url} target="_blank" rel="noopener noreferrer">
                        Mở ảnh trong tab mới
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewImageDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerVerification;