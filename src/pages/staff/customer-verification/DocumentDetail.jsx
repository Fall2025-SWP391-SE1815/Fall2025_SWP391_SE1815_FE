import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import staffRentalService from "@/services/staff/staffRentalService";
import { API_BASE_URL } from "@/lib/api/apiConfig";
import { Eye, CheckCircle, CreditCard, User } from "lucide-react";

const DocumentDetailDialog = ({ open, onOpenChange, renterId }) => {
    const { toast } = useToast();
    const [customer, setCustomer] = useState(null);
    const [docs, setDocs] = useState([]);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && renterId) loadDocs();
    }, [open, renterId]);

    const loadDocs = async () => {
        try {
            setLoading(true);
            const res = await staffRentalService.getRenterDocuments(renterId);
            if (!res?.length) {
                toast({
                    title: "Không có tài liệu",
                    description: "Khách hàng chưa tải tài liệu lên.",
                });
                return;
            }
            setCustomer(res[0].user);
            setDocs(res);
        } catch (err) {
            toast({
                title: "Lỗi tải tài liệu",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            setLoading(true);
            await staffRentalService.verifyDocument(id);
            toast({ title: "Đã xác thực tài liệu." });
            loadDocs();
        } catch (err) {
            toast({
                title: "Lỗi",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
          max-w-4xl 
          bg-white 
          rounded-2xl 
          shadow-xl 
          border 
          border-gray-100 
          p-6
        "
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Tài liệu khách hàng
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Xem, kiểm tra và xác thực tài liệu của khách hàng
                    </DialogDescription>
                </DialogHeader>

                {customer && (
                    <Card className="rounded-xl bg-primary/5 border border-primary/10 mb-6">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-gray-800">
                                    {customer.fullName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {customer.phone}
                                </p>
                            </div>
                            <Badge variant="outline">ID #{customer.id}</Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Danh sách tài liệu */}
                <div className="space-y-3">
                    {docs.map((d) => (
                        <Card
                            key={d.id}
                            className="rounded-xl border border-gray-100 hover:shadow-sm transition-all"
                        >
                            <CardHeader className="flex flex-row justify-between items-center p-4">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        {d.type}
                                    </Badge>
                                    <span className="text-sm font-medium text-gray-700">
                                        {d.documentNumber}
                                    </span>
                                    {d.verified && (
                                        <Badge variant="default" className="gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Đã xác thực
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setPreviewUrl(`${API_BASE_URL}${d.documentUrl}`)
                                        }
                                        className="rounded-xl"
                                    >
                                        <Eye className="h-4 w-4 mr-2 text-primary" />
                                        Xem ảnh
                                    </Button>
                                    {!d.verified && (
                                        <Button
                                            onClick={() => handleVerify(d.id)}
                                            size="sm"
                                            className="bg-primary hover:bg-primary/90 rounded-xl"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Xác thực
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    ))}

                    {!docs.length && !loading && (
                        <p className="text-center text-muted-foreground py-10">
                            Không có tài liệu hiển thị
                        </p>
                    )}
                </div>

                {/* Khung hiển thị ảnh — rõ ràng, tỉ lệ hợp lý */}
                {previewUrl && (
                    <div className="mt-8">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                            Ảnh tài liệu
                        </h3>
                        <div
                            className="
                relative 
                rounded-2xl 
                border 
                border-gray-200 
                bg-gray-50 
                overflow-hidden 
                flex 
                justify-center 
                items-center 
                shadow-inner
              "
                        >
                            <img
                                src={previewUrl}
                                alt="document preview"
                                className="
                  max-h-[600px] 
                  w-auto 
                  object-contain 
                  transition-transform 
                  duration-300 
                  hover:scale-[1.02]
                "
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="pt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl"
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentDetailDialog;
