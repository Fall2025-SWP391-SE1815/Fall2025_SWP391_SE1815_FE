import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    User,
    Shield,
    CreditCard,
    CheckCircle,
    XCircle,
    Eye,
    Image as ImageIcon,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/apiConfig';

const CustomerDocumentsDialog = ({
    open,
    onClose,
    customer,
    documents,
    loading,
    onVerifyDocument,
    getVerificationStatusBadge,
    getDocumentTypeBadge,
    formatDateTime,
}) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [viewImageDialogOpen, setViewImageDialogOpen] = useState(false);

    const handleViewImage = (url, type, number) => {
        setSelectedImage({
            url: url ? `${API_BASE_URL}${url}` : null,
            type,
            number,
        });
        setImageLoading(true);
        setImageError(false);
        setViewImageDialogOpen(true);
    };

    if (!customer) return null;

    return (
        <>
            {/* 📄 Dialog chính hiển thị danh sách tài liệu */}
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div>Tài liệu của {customer.full_name}</div>
                                <p className="text-sm font-normal text-muted-foreground">
                                    ID: #{customer.id} • {customer.phone}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* 🧍 Thông tin khách hàng */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="border-l-4 border-l-blue-500">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Họ và tên</p>
                                            <p className="font-semibold">{customer.full_name}</p>
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
                                            <p className="font-semibold">{customer.phone}</p>
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
                                            <p className="font-semibold">{documents.length}</p>
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
                                                {getVerificationStatusBadge(customer.verification_status)}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 📄 Danh sách tài liệu */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Danh sách tài liệu ({documents.length})
                                </CardTitle>
                                <CardDescription>
                                    Xem và xác thực các tài liệu đã tải lên
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {documents.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">Chưa có tài liệu</h3>
                                        <p className="text-muted-foreground">Khách hàng chưa tải lên tài liệu nào</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <CreditCard className="h-6 w-6 text-primary" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {getDocumentTypeBadge(doc.type)}
                                                                {doc.verified && (
                                                                    <Badge variant="default" className="gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Đã xác thực
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-semibold mb-1">Số: {doc.document_number}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Tải lên: {formatDateTime(doc.upload_date)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewImage(doc.document_url, doc.type, doc.document_number)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Xem ảnh
                                                        </Button>

                                                        {!doc.verified && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    disabled={loading}
                                                                    className="text-red-600 hover:text-red-700"
                                                                    onClick={() => onVerifyDocument(doc.id, false)}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    Từ chối
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    disabled={loading}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                    onClick={() => onVerifyDocument(doc.id, true)}
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
                        <Button variant="outline" onClick={onClose}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Popup xem ảnh */}
            {/* Popup xem ảnh */}
            <Dialog open={viewImageDialogOpen} onOpenChange={setViewImageDialogOpen}>
                <DialogContent
                    hideCloseButton
                    className="max-w-5xl w-full bg-white p-5 rounded-xl shadow-xl"
                >
                    {/* Header */}
                    <DialogHeader className="pb-2 mb-3 border-b">
                        <DialogTitle className="flex items-center gap-3 text-base font-semibold text-gray-800">
                            <ImageIcon className="h-5 w-5 text-primary" />
                            <div className="flex items-center gap-2">
                                {selectedImage?.type && getDocumentTypeBadge(selectedImage.type)}
                                <span className="text-muted-foreground">•</span>
                                <span className="text-base text-gray-700">{selectedImage?.number}</span>
                            </div>
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-1">
                            Xem trước hình ảnh tài liệu khách hàng đã tải lên
                        </DialogDescription>
                    </DialogHeader>

                    {/* Nội dung hiển thị ảnh */}
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="bg-muted/20 rounded-lg border border-muted/40 flex items-center justify-center w-full h-[70vh] overflow-hidden">
                            {selectedImage?.url ? (
                                <img
                                    src={selectedImage.url}
                                    alt={`${selectedImage.type}-${selectedImage.number}`}
                                    className="max-h-full max-w-full object-contain rounded-md shadow-md transition-transform duration-300 hover:scale-[1.02]"
                                    onLoad={() => setImageLoading(false)}
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    Không có hình ảnh
                                </div>
                            )}
                        </div>

                        {/* Nút mở tab */}
                        {selectedImage?.url && (
                            <div className="flex justify-center mt-1">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="text-primary border-primary/30 hover:bg-primary/5"
                                >
                                    <a
                                        href={selectedImage.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Mở hình trong tab mới
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CustomerDocumentsDialog;