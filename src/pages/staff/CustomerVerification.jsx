import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalToast } from '@/components/ui/global-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import { API_BASE_URL } from '@/lib/api/apiConfig';
import {
  FileText,
  Shield,
  ShieldCheck,
  Search,
  Eye,
  User,
  CreditCard,
  Car,
  AlertTriangle,
} from 'lucide-react';
import CustomerDocumentsDialog from './documents/CustomerDocumentsDialog.jsx';

const CustomerVerification = () => {
  const { success, warning } = useGlobalToast();
  const [loading, setLoading] = useState(false);
  const [rentersList, setRentersList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDocuments, setCustomerDocuments] = useState([]);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);

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
      const rentersData = Array.isArray(response) ? response : response?.data || [];
      if (rentersData.length > 0) {
        // For each renter, fetch their documents and determine verification status
        const rentersWithStatus = await Promise.all(rentersData.map(async (renter) => {
          let verification_status = 'pending';
          try {
            const docs = await staffRentalService.getRenterDocuments(renter.id);
            if (Array.isArray(docs) && docs.length > 0) {
              const verifiedCount = docs.filter(doc => doc.verified).length;
              if (verifiedCount === 0) verification_status = 'pending';
              else if (verifiedCount < docs.length) verification_status = 'partial';
              else verification_status = 'verified';
            }
          } catch (e) {
            // If error fetching documents, keep as pending
          }
          return {
            id: renter.id,
            full_name: renter.fullName,
            phone: renter.phone,
            email: renter.email,
            registration_date: renter.createdAt || new Date().toISOString(),
            verification_status
          };
        }));
        setRentersList(rentersWithStatus);
      } else {
        setRentersList([]);
      }
    } catch (error) {
      console.error('Error loading renters:', error);
      error(error.message || "Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
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

        success(`Tìm thấy ${documents.length} tài liệu của ${tempCustomer.full_name}`);
      } else {
        warning("Không tìm thấy tài liệu nào cho Renter ID này");
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

        success(`Tài liệu ${response.type || 'CMND'} đã được xác thực thành công`);

        // Refresh documents to show updated status
        if (selectedCustomer?.id) {
          await refreshDocuments(selectedCustomer.id);
        }
      } else {
        // For "Từ chối", we don't call API since there's no "reject" endpoint
        // Just show a message to user
        warning("Tài liệu không được xác thực. Vui lòng liên hệ khách hàng...");
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
            <div className="text-2xl font-bold text-orange-600">
              {rentersList.filter(renter => renter.verification_status !== 'verified').length}
            </div>
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
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rentersList.map((renter) => (
                    <TableRow key={renter.id} className="hover:bg-muted/30">
                      {/* ID */}
                      <TableCell className="font-medium">#{renter.id}</TableCell>

                      {/* Họ tên */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{renter.full_name}</span>
                        </div>
                      </TableCell>

                      {/* SĐT */}
                      <TableCell>{renter.phone}</TableCell>

                      {/* Email */}
                      <TableCell className="text-muted-foreground">{renter.email}</TableCell>

                      {/* Ngày đăng ký */}
                      <TableCell className="text-muted-foreground">
                        {new Date(renter.registration_date).toLocaleDateString('vi-VN')}
                      </TableCell>

                      {/* ✅ Nút Xem tài liệu */}
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleViewDocuments(renter.id)}
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
      <CustomerDocumentsDialog
        open={documentsDialogOpen}
        onClose={() => setDocumentsDialogOpen(false)}
        customer={selectedCustomer}
        documents={customerDocuments}
        loading={loading}
        onVerifyDocument={verifyDocument}
        getVerificationStatusBadge={getVerificationStatusBadge}
        getDocumentTypeBadge={getDocumentTypeBadge}
        formatDateTime={formatDateTime}
      />
    </div>
  );
};

export default CustomerVerification;