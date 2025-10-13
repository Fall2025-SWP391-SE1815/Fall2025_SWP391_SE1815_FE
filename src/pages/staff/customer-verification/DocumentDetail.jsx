import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    XCircle,
    FileText,
    Image as ImageIcon,
} from "lucide-react";

// =====================================================
// Component chính: DocumentDetail
// =====================================================
const DocumentDetail = ({
    open,
    onOpenChange,
    customer,
    documents,
    verifyDocument,
    getDocumentTypeBadge,
    formatDateTime,
}) => {
    // State popup xem ảnh
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleViewImage = (doc) => {
        setSelectedImage({
            type: doc.type,
            number: doc.document_number,
            url: doc.image_url,
        });
        setImageDialogOpen(true);
    };

    return (
        <>
            {/* Popup chi tiết tài liệu */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Tài liệu của {customer.full_name}
                        </DialogTitle>
                        <DialogDescription>
                            Xem chi tiết và xác thực các tài liệu đã tải lên
                        </DialogDescription>
                    </DialogHeader>

                    {/* Thông tin khách hàng */}
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle className="text-sm">Thông tin khách hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <Label className="text-muted-foreground">Họ tên</Label>
                                <p className="font-medium">{customer.full_name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Số điện thoại</Label>
                                <p className="font-medium">{customer.phone}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <p className="font-medium">{customer.email}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Trạng thái</Label>
                                <Badge variant="outline" className="capitalize">
                                    {customer.verification_status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danh sách tài liệu */}
                    {documents.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">
                            Khách hàng chưa tải lên tài liệu nào
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="border rounded-lg p-4 flex justify-between items-center"
                                >
                                    <div className="space-y-1">
                                        {getDocumentTypeBadge(doc.type)}
                                        <div className="text-sm font-medium">
                                            Số: {doc.document_number}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Tải lên: {formatDateTime(doc.upload_date)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewImage(doc)}
                                        >
                                            <ImageIcon className="h-4 w-4 mr-1" /> Xem ảnh
                                        </Button>

                                        {doc.verified ? (
                                            <Badge variant="default" className="gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Đã xác thực
                                            </Badge>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => verifyDocument(customer.id, doc.id, false)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" /> Từ chối
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => verifyDocument(customer.id, doc.id, true)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Xác thực
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Popup xem ảnh tài liệu (gộp vào cùng file) */}
            {selectedImage && (
                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                {selectedImage.type} - {selectedImage.number}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="border rounded-lg p-6 text-center space-y-3 bg-muted/20">
                            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                                {selectedImage.url ? (
                                    <img
                                        src={selectedImage.url}
                                        alt="Document preview"
                                        className="max-h-60 mx-auto rounded-lg object-contain"
                                    />
                                ) : (
                                    <>
                                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Xem trước ảnh tài liệu
                                        </p>
                                    </>
                                )}
                            </div>

                            {selectedImage.url && (
                                <>
                                    <p className="text-sm text-muted-foreground break-all">
                                        URL: {selectedImage.url}
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(selectedImage.url, "_blank")}
                                    >
                                        Mở ảnh trong tab mới
                                    </Button>
                                </>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                                Đóng
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default DocumentDetail;
