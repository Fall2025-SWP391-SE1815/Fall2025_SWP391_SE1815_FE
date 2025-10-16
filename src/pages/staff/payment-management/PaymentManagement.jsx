import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import staffRentalService from "@/services/staff/staffRentalService";
import PaymentStats from "./PaymentStats";
import PaymentTable from "./PaymentTable";
import PaymentDetailDialog from "./dialogs/PaymentDetailDialog";
import PaymentProcessDialog from "./dialogs/PaymentProcessDialog";
import ViolationDialog from "./dialogs/ViolationDialog";

const PaymentManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openProcess, setOpenProcess] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openViolation, setOpenViolation] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await staffRentalService.getRentals({
        status: "waiting_for_payment",
      });
      setPayments(res || []);
    } catch (err) {
      toast({
        title: "Lỗi tải dữ liệu",
        description: err.message || "Không thể tải danh sách thanh toán.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold text-primary">
            Thanh toán tại trạm
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và xác nhận thanh toán trực tiếp từ khách hàng
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <Input
            placeholder="Tìm kiếm tên, SĐT, biển số..."
            className="w-[260px] bg-white/80 backdrop-blur-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            onClick={() => setOpenViolation(true)}
            variant="outline"
            className="rounded-xl"
          >
            <Flag className="h-4 w-4 mr-2" />
            Ghi nhận vi phạm
          </Button>
          <Button
            onClick={fetchPayments}
            disabled={loading}
            className="rounded-xl"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </header>

      <PaymentStats payments={payments} />

      <PaymentTable
        payments={payments}
        searchTerm={searchTerm}
        loading={loading}
        onViewDetail={(p) => {
          setSelectedPayment(p);
          setOpenDetail(true);
        }}
        onProcess={(p) => {
          setSelectedPayment(p);
          setOpenProcess(true);
        }}
      />

      <PaymentDetailDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        payment={selectedPayment}
        onProcess={() => {
          setOpenDetail(false);
          setOpenProcess(true);
        }}
      />

      <PaymentProcessDialog
        open={openProcess}
        onOpenChange={setOpenProcess}
        payment={selectedPayment}
        refresh={fetchPayments}
      />

      <ViolationDialog
        open={openViolation}
        onOpenChange={setOpenViolation}
        refresh={fetchPayments}
      />
    </div>
  );
};

export default PaymentManagement;
