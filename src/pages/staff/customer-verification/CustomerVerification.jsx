import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Shield,
  ShieldCheck,
  Search,
  Eye,
  RefreshCw,
  User,
  Calendar,
  AlertTriangle,
  CreditCard,
  Car,
} from "lucide-react";

import DocumentDetail from "./DocumentDetail";

const CustomerVerification = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);

  // ===== MOCK DATA =====
  const mockCustomers = [
    {
      id: 1,
      full_name: "Nguyễn Văn Minh",
      phone: "0909123456",
      email: "minh.nguyen@email.com",
      registration_date: "2025-09-20T10:30:00Z",
      verification_status: "pending",
      total_documents: 2,
      verified_documents: 0,
    },
    {
      id: 2,
      full_name: "Trần Thị Lan",
      phone: "0912345678",
      email: "lan.tran@email.com",
      registration_date: "2025-09-21T14:15:00Z",
      verification_status: "partial",
      total_documents: 2,
      verified_documents: 1,
    },
  ];

  const mockDocuments = {
    1: [
      {
        id: 101,
        type: "CCCD",
        document_number: "024123456789",
        document_url: "https://example.com/cccd1.jpg",
        verified: false,
        upload_date: "2025-09-20T10:35:00Z",
      },
      {
        id: 102,
        type: "GPLX",
        document_number: "B124567890",
        document_url: "https://example.com/gplx1.jpg",
        verified: false,
        upload_date: "2025-09-20T10:40:00Z",
      },
    ],
    2: [
      {
        id: 103,
        type: "CCCD",
        document_number: "024987654321",
        document_url: "https://example.com/cccd2.jpg",
        verified: true,
        upload_date: "2025-09-21T14:20:00Z",
      },
      {
        id: 104,
        type: "GPLX",
        document_number: "A234567890",
        document_url: "https://example.com/gplx2.jpg",
        verified: false,
        upload_date: "2025-09-21T14:25:00Z",
      },
    ],
  };

  // ===== LIFECYCLE =====
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 500);
  };

  // ===== LOGIC =====
  const handleViewDocuments = (customer) => {
    setSelectedCustomer(customer);
    setDocumentsDialogOpen(true);
  };

  const verifyDocument = (customerId, documentId, verified) => {
    const updatedDocs = mockDocuments[customerId].map((doc) =>
      doc.id === documentId ? { ...doc, verified } : doc
    );

    mockDocuments[customerId] = updatedDocs;
    toast({
      title: verified ? "Xác thực thành công" : "Từ chối tài liệu",
      description: `Tài liệu ID ${documentId} đã được ${verified ? "xác thực" : "từ chối"
        }.`,
      variant: verified ? "default" : "destructive",
    });

    // Cập nhật trạng thái khách hàng mock
    const allVerified = updatedDocs.every((d) => d.verified);
    const verifiedCount = updatedDocs.filter((d) => d.verified).length;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
            ...c,
            verification_status: allVerified
              ? "verified"
              : verifiedCount > 0
                ? "partial"
                : "pending",
            verified_documents: verifiedCount,
          }
          : c
      )
    );
  };

  // ===== HELPER UI =====
  const getVerificationStatusBadge = (status) => {
    const map = {
      pending: { label: "Chờ xác thực", variant: "destructive", icon: AlertTriangle },
      partial: { label: "Một phần", variant: "outline", icon: Shield },
      verified: { label: "Đã xác thực", variant: "default", icon: ShieldCheck },
    };
    const cfg = map[status] || map.pending;
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  const getDocumentTypeBadge = (type) => {
    const map = {
      CCCD: { label: "CCCD", icon: CreditCard, variant: "default" },
      GPLX: { label: "GPLX", icon: Car, variant: "secondary" },
      Passport: { label: "Hộ chiếu", icon: FileText, variant: "outline" },
    };
    const cfg = map[type] || map.Passport;
    const Icon = cfg.icon;
    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  };

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ===== FILTER =====
  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== RENDER =====
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Xác thực khách hàng</h1>
          <p className="text-muted-foreground">
            Quản lý và xác thực tài liệu CCCD / GPLX của khách hàng
          </p>
        </div>
        <Button onClick={fetchCustomers} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm khách hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Nhập tên, số điện thoại hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Danh sách khách hàng ({filtered.length})
          </CardTitle>
          <CardDescription>
            Khách hàng đang chờ hoặc đã xác thực tài liệu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              Không tìm thấy khách hàng nào
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Tài liệu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.phone}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {c.email}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(c.registration_date)}</TableCell>
                    <TableCell>
                      Tổng {c.total_documents} / Đã xác thực {c.verified_documents}
                    </TableCell>
                    <TableCell>{getVerificationStatusBadge(c.verification_status)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocuments(c)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Xem tài liệu
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCustomer && (
        <DocumentDetail
          open={documentsDialogOpen}
          onOpenChange={setDocumentsDialogOpen}
          customer={selectedCustomer}
          documents={mockDocuments[selectedCustomer.id] || []}
          verifyDocument={verifyDocument}
          getDocumentTypeBadge={getDocumentTypeBadge}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
};

export default CustomerVerification;