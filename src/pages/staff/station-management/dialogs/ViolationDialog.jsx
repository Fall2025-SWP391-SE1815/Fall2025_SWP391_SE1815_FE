import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api/apiClient";


export default function ViolationDialog({ open, setOpen, rental, refresh }) {
    const { toast } = useToast();
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!rental) return;
        try {
            setLoading(true);
            await apiClient.post(`/api/station/rentals/${rental.id}/violations`, { description });
            toast({ title: "Đã ghi nhận vi phạm" });
            refresh();
            setOpen(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Ghi nhận thất bại" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ghi nhận vi phạm</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        Người thuê: <strong>{rental?.userName}</strong> <br />
                        Xe: <strong>{rental?.vehicleName}</strong>
                    </p>

                    <Textarea
                        placeholder="Mô tả vi phạm..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Đang lưu..." : "Xác nhận"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
