import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { useToast } from "@/hooks/use-toast";
import staffRentalService from "@/services/staff/staffRentalService";
import DocumentDetailDialog from "./DocumentDetail";
import { Search, User, Eye } from "lucide-react";

const CustomerVerification = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [renters, setRenters] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchRenters();
  }, []);

  const fetchRenters = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getRenters();
      const data = Array.isArray(res) ? res : res?.data || [];
      setRenters(
        data.map((r) => ({
          id: r.id,
          name: r.fullName,
          phone: r.phone,
          email: r.email,
          createdAt: r.createdAt,
        }))
      );
    } catch (err) {
      toast({
        title: "Lỗi tải dữ liệu",
        description: err.message || "Không thể tải danh sách khách hàng.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = renters.filter(
    (r) =>
      r.name?.toLowerCase().includes(query.toLowerCase()) ||
      r.phone?.includes(query)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold text-primary tracking-tight">
            Xác thực tài liệu khách hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và xác thực thông tin người dùng trong hệ thống
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Tìm kiếm khách hàng..."
            className="w-[240px] bg-white/80 backdrop-blur-sm rounded-xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            onClick={fetchRenters}
            disabled={loading}
            className="rounded-xl bg-primary text-white hover:bg-primary/90"
          >
            <Search className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </header>

      {/* Table */}
      <Card className="rounded-2xl shadow-md border border-gray-100 bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800 font-semibold">
            Danh sách khách hàng
          </CardTitle>
          <CardDescription>
            Tổng số khách hàng: {filtered.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-gray-600">
                  <TableHead>ID</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead className="text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    className="hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <TableCell className="font-semibold text-primary">
                      #{r.id}
                    </TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 rounded-xl"
                        onClick={() => {
                          setSelectedId(r.id);
                          setOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2 text-primary" />
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filtered.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <User className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">
                        Không tìm thấy khách hàng phù hợp.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DocumentDetailDialog
        open={open}
        onOpenChange={setOpen}
        renterId={selectedId}
      />
    </div>
  );
};

export default CustomerVerification;
