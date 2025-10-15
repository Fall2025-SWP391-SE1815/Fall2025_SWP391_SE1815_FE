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
import { API_BASE_URL } from '@/lib/api/apiConfig';
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
  const [rentersList, setRentersList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDocuments, setCustomerDocuments] = useState([]);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [viewImageDialogOpen, setViewImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Load all renters when component mounts
  useEffect(() => {
    loadAllRenters();
  }, []);

  // Load all renters from API
  const loadAllRenters = async () => {
    try {
      setLoading(true);
      
      // Call API without phone parameter to get all renters
      const response = await staffRentalService.getRenters();
      
      // API returns array of renters
      const rentersData = Array.isArray(response) ? response : response?.data || [];
      
      if (rentersData.length > 0) {
        // Transform to component format
        const renters = rentersData.map(renter => ({
          id: renter.id,
          full_name: renter.fullName,
          phone: renter.phone,
          email: renter.email,
          registration_date: renter.createdAt || new Date().toISOString()
        }));
        
        setRentersList(renters);
      } else {
        setRentersList([]);
      }
      
    } catch (error) {
      console.error('Error loading renters:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách khách hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewDocuments = async (renterId) => {
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
        
        // Refresh documents to show updated status
        if (selectedCustomer?.id) {
          await refreshDocuments(selectedCustomer.id);
        }
      } else {
        // For "Từ chối", we don't call API since there's no "reject" endpoint
        // Just show a message to user
        toast({
          title: "Từ chối tài liệu",
          description: "Tài liệu không được xác thực. Vui lòng liên hệ khách hàng để cung cấp tài liệu hợp lệ.",
          variant: "destructive",
        });
      }
      
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
    // Build full URL like in VehicleTable
    const fullImageUrl = imageUrl ? `${API_BASE_URL}${imageUrl}` : null;
    
    setSelectedImage({
      url: fullImageUrl,
      type: documentType,
      number: documentNumber
    });
    setImageLoading(true);
    setImageError(false);
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
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Xác thực tài liệu khách hàng</h1>
          <p className="text-muted-foreground mt-2">
            Danh sách tất cả khách hàng và tài liệu cần xác thực
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAllRenters} disabled={loading} variant="outline" size="default">
            <Search className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentersList.length}</div>
            <p className="text-xs text-muted-foreground">Khách hàng trong hệ thống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{rentersList.length}</div>
            <p className="text-xs text-muted-foreground">Tài khoản hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cần xác thực</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">-</div>
            <p className="text-xs text-muted-foreground">Tài liệu chờ xác thực</p>
          </CardContent>
        </Card>
      </div>

      {/* Renters Table */}
      {loading && rentersList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Đang tải danh sách khách hàng...</p>
            </div>
          </CardContent>
        </Card>
      ) : rentersList.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Danh sách khách hàng ({rentersList.length})
            </CardTitle>
            <CardDescription>
              Nhấn vào hàng để xem chi tiết tài liệu của khách hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentersList.map((renter) => (
                    <TableRow 
                      key={renter.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDocuments(renter.id)}
                    >
                      <TableCell className="font-medium">#{renter.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{renter.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renter.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{renter.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(renter.registration_date).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocuments(renter.id);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem tài liệu
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Chưa có khách hàng</h3>
            <p className="text-muted-foreground mb-4">Không có khách hàng nào trong hệ thống</p>
            <Button onClick={loadAllRenters} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Tải lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Documents Dialog */}
      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div>Tài liệu của {selectedCustomer?.full_name}</div>
                <p className="text-sm font-normal text-muted-foreground">
                  ID: #{selectedCustomer?.id} • {selectedCustomer?.phone}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Customer Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Họ và tên</p>
                      <p className="font-semibold">{selectedCustomer?.full_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Số điện thoại</p>
                      <p className="font-semibold">{selectedCustomer?.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Số tài liệu</p>
                      <p className="font-semibold">{customerDocuments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Trạng thái</p>
                      <div className="mt-1">
                        {selectedCustomer && getVerificationStatusBadge(selectedCustomer.verification_status)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Danh sách tài liệu ({customerDocuments.length})
                </CardTitle>
                <CardDescription>
                  Xem và xác thực các tài liệu đã tải lên
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customerDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Chưa có tài liệu</h3>
                    <p className="text-muted-foreground">Khách hàng chưa tải lên tài liệu nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerDocuments.map((document) => (
                      <div 
                        key={document.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CreditCard className="h-6 w-6 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {getDocumentTypeBadge(document.type)}
                                {document.verified && (
                                  <Badge variant="default" className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Đã xác thực
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-semibold mb-1">
                                Số: {document.document_number}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Tải lên: {formatDateTime(document.upload_date)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewImage(
                                document.document_url,
                                document.type,
                                document.document_number
                              )}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem ảnh
                            </Button>
                            
                            {!document.verified && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => verifyDocument(document.id, false)}
                                  disabled={loading}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Từ chối
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => verifyDocument(document.id, true)}
                                  disabled={loading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Xác thực
                                </Button>
                              </>
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

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDocumentsDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image View Dialog */}
      <Dialog open={viewImageDialogOpen} onOpenChange={setViewImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Image className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {selectedImage?.type && getDocumentTypeBadge(selectedImage.type)}
                  <span className="text-muted-foreground">•</span>
                  <span className="font-normal text-base">{selectedImage?.number}</span>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Xem trước hình ảnh tài liệu đã tải lên
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="bg-muted rounded-lg overflow-hidden">
                  {selectedImage?.url ? (
                    <div className="min-h-[400px] flex items-center justify-center border-2 border-muted-foreground/25 rounded-lg bg-background p-4">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      )}
                      {imageError ? (
                        <div className="text-center p-8">
                          <Image className="h-16 w-16 mx-auto text-red-500 mb-4 opacity-50" />
                          <p className="text-red-600 font-semibold mb-2">Không thể tải hình ảnh</p>
                          <p className="text-xs text-muted-foreground mb-4">URL có thể không hợp lệ hoặc file không tồn tại</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setImageError(false);
                              setImageLoading(true);
                            }}
                          >
                            Thử lại
                          </Button>
                        </div>
                      ) : (
                        <img 
                          src={selectedImage.url} 
                          alt={`${selectedImage.type} - ${selectedImage.number}`}
                          className="max-w-full max-h-[600px] object-contain rounded-lg"
                          onLoad={() => setImageLoading(false)}
                          onError={() => {
                            setImageLoading(false);
                            setImageError(true);
                          }}
                          style={{ display: imageError ? 'none' : 'block' }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-background">
                      <div className="text-center p-8">
                        <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">Không có hình ảnh</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      <p className="text-xs font-semibold text-muted-foreground">URL:</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono break-all">{selectedImage?.url || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewImageDialogOpen(false)}>
              Đóng
            </Button>
            <Button asChild>
              <a href={selectedImage?.url} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                Mở trong tab mới
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerVerification;