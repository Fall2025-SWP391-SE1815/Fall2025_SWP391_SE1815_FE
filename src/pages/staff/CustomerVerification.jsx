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
import staffRentalService from '@/services/staff/staffRentalService';
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
  AlertTriangle,
  Image
} from 'lucide-react';

const CustomerVerification = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [renterIdSearch, setRenterIdSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDocuments, setCustomerDocuments] = useState([]);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [viewImageDialogOpen, setViewImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // All data now comes from real API calls

  // No useEffect needed since we only use API calls on demand

  // Function to refresh documents without showing toast/dialog (for after verification)
  const refreshDocuments = async (renterId) => {
    try {
      const documentsData = await staffRentalService.getRenterDocuments(renterId);
      
      if (documentsData && Array.isArray(documentsData) && documentsData.length > 0) {
        // Update customer verification status based on verified field
        const verifiedCount = documentsData.filter(doc => doc.verified).length;
        const totalCount = documentsData.length;
        
        let verificationStatus;
        if (verifiedCount === 0) {
          verificationStatus = 'pending'; // Chưa xác thực tài liệu nào
        } else if (verifiedCount === totalCount) {
          verificationStatus = 'verified'; // Đã xác thực tất cả
        } else {
          verificationStatus = 'partial'; // Xác thực một phần
        }

        const tempCustomer = {
          ...selectedCustomer,
          verification_status: verificationStatus,
          verified_documents: verifiedCount,
          total_documents: totalCount
        };
        
        setSelectedCustomer(tempCustomer);
        
        // Transform documents to component format
        const documents = documentsData.map(doc => ({
          id: doc.id,
          type: doc.type,
          document_number: doc.documentNumber,
          document_url: doc.documentUrl,
          verified: doc.verified,
          verified_by: doc.verifiedBy?.id || null,
          upload_date: doc.createdAt
        }));
        
        setCustomerDocuments(documents);
      }
    } catch (error) {
      console.error('Error refreshing documents:', error);
    }
  };

  const handleSearchByRenterId = async (renterId) => {
    if (!renterId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập Renter ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Call API to get documents for this specific renter
      const documentsData = await staffRentalService.getRenterDocuments(renterId);
      
      if (documentsData && Array.isArray(documentsData) && documentsData.length > 0) {
        // Create a temporary customer object from the first document's user info
        const firstDoc = documentsData[0];
        const verifiedCount = documentsData.filter(doc => doc.verified).length;
        const totalCount = documentsData.length;
        
        let verificationStatus;
        if (verifiedCount === 0) {
          verificationStatus = 'pending'; // Chưa xác thực tài liệu nào
        } else if (verifiedCount === totalCount) {
          verificationStatus = 'verified'; // Đã xác thực tất cả
        } else {
          verificationStatus = 'partial'; // Xác thực một phần
        }

        const tempCustomer = {
          id: firstDoc.user.id,
          full_name: firstDoc.user.fullName,
          phone: firstDoc.user.phone,
          email: firstDoc.user.email,
          registration_date: firstDoc.user.createdAt || new Date().toISOString(),
          verification_status: verificationStatus,
          total_documents: totalCount,
          verified_documents: verifiedCount
        };
        
        setSelectedCustomer(tempCustomer);
        
        // Transform documents to component format
        const documents = documentsData.map(doc => ({
          id: doc.id,
          type: doc.type,
          document_number: doc.documentNumber,
          document_url: doc.documentUrl,
          verified: doc.verified,
          verified_by: doc.verifiedBy?.id || null,
          upload_date: doc.createdAt
        }));
        
        setCustomerDocuments(documents);
        setDocumentsDialogOpen(true);
        
        toast({
          title: "Thành công",
          description: `Tìm thấy ${documents.length} tài liệu của ${tempCustomer.full_name}`,
        });
      } else {
        console.log('No documents found or invalid response:', documentsData);
        toast({
          title: "Không tìm thấy",
          description: "Không tìm thấy tài liệu nào cho Renter ID này",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error searching by renter ID:', error);
      toast({
        title: "Lỗi", 
        description: error.message || "Không thể tìm kiếm tài liệu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyDocument = async (documentId, verified) => {
    try {
      setLoading(true);
      
      // Call real API to verify document
      // Only send PUT request if verified is true (staff confirms verification)
      if (verified) {
        const response = await staffRentalService.verifyDocument(documentId);
        
        toast({
          title: "Xác thực thành công",
          description: `Tài liệu ${response.type || 'CMND'} đã được xác thực thành công`,
          variant: "default",
        });
        
        // Documents already refreshed above
      } else {
        // For "Từ chối", we don't call API since there's no "reject" endpoint
        // Just show a message to user
        toast({
          title: "Từ chối tài liệu",
          description: "Tài liệu không được xác thực. Vui lòng liên hệ khách hàng để cung cấp tài liệu hợp lệ.",
          variant: "destructive",
        });
      }
      
      // Keep dialog open to see updated status
      
    } catch (error) {
      console.error('Error verifying document:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác thực tài liệu",
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
      pending: { label: 'Chưa xác thực', variant: 'destructive', icon: AlertTriangle },
      partial: { label: 'Xác thực một phần', variant: 'secondary', icon: Shield },
      verified: { label: 'Đã xác thực hoàn tất', variant: 'default', icon: ShieldCheck }
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
      CMND: { label: 'CMND', variant: 'default', icon: CreditCard },
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Xác thực tài liệu khách hàng</h1>
          <p className="text-muted-foreground">
            Tìm kiếm và xác thực tài liệu CCCD/CMND/GPLX của khách hàng theo ID
          </p>
        </div>
      </div>

      {/* Search by Renter ID */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm tài liệu theo Renter ID
          </CardTitle>
          <CardDescription>
            Nhập ID của renter để xem tài liệu cần xác thực
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Nhập Renter ID (ví dụ: 2)"
                value={renterIdSearch}
                onChange={(e) => setRenterIdSearch(e.target.value)}
                type="number"
                className="w-full"
              />
            </div>
            <Button 
              onClick={() => handleSearchByRenterId(renterIdSearch)}
              disabled={loading || !renterIdSearch}
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Hướng dẫn sử dụng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Nhập Renter ID vào ô tìm kiếm phía trên</p>
            <p>• Nhấn "Tìm kiếm" để xem tài liệu của khách hàng</p>
            <p>• Xem và xác thực từng tài liệu một cách cẩn thận</p>
            <p>• Chỉ nhấn "Xác thực" khi tài liệu hợp lệ và chính xác</p>
          </div>
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