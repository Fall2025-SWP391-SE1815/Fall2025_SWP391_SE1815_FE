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
import { useGlobalToast } from '@/components/ui/global-toast';
import staffRentalService from "@/services/staff/staffRentalService";
import PaymentDialogs from "./payment-dialogs/PaymentDialogs.jsx";
import {
  Banknote,
  DollarSign,
  Clock,
  Receipt,
  RefreshCw,
  User,
  Car,
  Flag,
  Eye,
  MapPin,
  Phone,
  CheckCircle,
  Wallet,
} from "lucide-react";

const PaymentManagement = () => {
  const { success, error, warning, info } = useGlobalToast();
  // Trạng thái (state) quản lý toàn bộ dữ liệu và giao diện
  const [loading, setLoading] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "cash" });
  const [rentalViolations, setRentalViolations] = useState([]);
  const [rentalBill, setRentalBill] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);
  const [violationForm, setViolationForm] = useState({
    rental_id: "",
    description: "",
    fine_amount: "",
  });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [manualReturnTime, setManualReturnTime] = useState("");

  // Tự động tải danh sách thanh toán khi component được mount
  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // Lấy danh sách thanh toán chờ xử lý
  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await staffRentalService.getRentals({
        status: "waiting_for_payment",
      });

      // Chuyển đổi dữ liệu thuê xe thành dữ liệu thanh toán hiển thị trong bảng
      const data =
        response?.map((rental) => ({
          payment_id: `PAY-${rental.id}`,
          rental_id: rental.id,

          // Thông tin khách hàng
          renter_id: rental.renter.id,
          renter_name: rental.renter.fullName,
          renter_email: rental.renter.email,
          renter_phone: rental.renter.phone,

          // Thông tin xe
          vehicle_id: rental.vehicle.id,
          vehicle_license: rental.vehicle.licensePlate,
          vehicle_type: rental.vehicle.type,
          vehicle_brand: rental.vehicle.brand,
          vehicle_model: rental.vehicle.model,
          batteryType: rental.vehicle.batteryType,
          batteryLevelStart: rental.batteryLevelStart,
          batteryLevelEnd: rental.batteryLevelEnd,
          odoStart: rental.odoStart,
          odoEnd: rental.odoEnd,
          pricePerHour: rental.vehicle.pricePerHour,

          // Thông tin trạm
          station_pickup_name: rental.stationPickup?.name,
          station_pickup_address: rental.stationPickup?.address,
          station_return_name: rental.stationReturn?.name,
          station_return_address: rental.stationReturn?.address,

          // Thông tin nhân viên giao/nhận xe
          staff_pickup_name: rental.staffPickup?.fullName,
          staff_pickup_phone: rental.staffPickup?.phone,
          staff_return_name: rental.staffReturn?.fullName,
          staff_return_phone: rental.staffReturn?.phone,

          // Chi tiết lượt thuê
          start_time: rental.startTime,
          end_time: rental.endTime,
          total_cost: rental.totalCost,
          rentalCost: rental.rentalCost,
          deposit_amount: rental.depositAmount,
          deposit_status: rental.depositStatus,
          insurance: rental.insurance,

          // Thông tin thanh toán
          amount: rental.totalCost || rental.depositAmount,
          payment_type:
            rental.depositStatus === "pending" ? "Đặt cọc" : "Phí thuê",
          created_at: rental.createdAt,
          due_date: rental.endTime,
        })) || [];
      setPendingPayments(data);
    } catch {
      // Xử lý lỗi khi tải dữ liệu
      error("Không thể tải danh sách thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ HÀM BỔ SUNG — để hiển thị loại thanh toán đẹp hơn
  const getPaymentTypeBadge = (type) => {
    if (!type) return <Badge variant="outline">Không xác định</Badge>;
    const lower = type.toLowerCase();
    if (lower.includes("đặt cọc"))
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          Đặt cọc
        </Badge>
      );
    if (lower.includes("thuê"))
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Phí thuê
        </Badge>
      );
    return <Badge variant="outline">Khác</Badge>;
  };

  // Định dạng
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);

  const formatDateTime = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatNumber = (num) =>
    num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const parseNumber = (str) => parseFloat(str.replace(/\./g, ""));

  const handleViewDetail = (p) => {
    setSelectedDetail(p);
    setDetailDialogOpen(true);
  };

  const handleProcessPayment = async (p) => {
    setSelectedPayment(p);
    setPaymentForm({ amount: "", method: "cash" });
    setManualReturnTime(""); // reset về trống mỗi lần mở
    setPaymentDialogOpen(true);
    await loadPaymentDetails(p.rental_id);
  };

  const loadPaymentDetails = async (rentalId) => {
    try {
      setLoadingDetails(true);

      // ✅ Không dùng new Date() nữa — backend đã có endTime thực tế
      const rentalList = await staffRentalService.getRentals();
      const rental = rentalList?.find((r) => r.id === rentalId);

      // Nếu không tìm thấy rental, fallback về giờ hiện tại
      const returnTime = manualReturnTime
        ? new Date(manualReturnTime).toISOString()
        : (rental?.endTime || rental?.end_time || new Date().toISOString());

      // 🔹 Lấy danh sách vi phạm (nếu có)
      const violationsResponse = await staffRentalService.getViolations(rentalId);
      setRentalViolations(
        Array.isArray(violationsResponse)
          ? violationsResponse
          : violationsResponse?.data || []
      );

      // 🔹 Gọi API tính tổng bill (theo endTime thật)
      const billResponse = await staffRentalService.calculateBill(rentalId, {
        returnTime,
      });

      const bill = billResponse?.data || billResponse;
      setRentalBill(bill);

      // 🔹 Gán tiền thanh toán vào form, ưu tiên bill.totalBill, fallback rental.totalCost
      const finalAmount =
        bill?.totalBill || rental?.totalCost || rental?.rentalCost || 0;

      setPaymentForm((prev) => ({
        ...prev,
        amount: formatNumber(finalAmount),
      }));
    } catch (err) {
      console.error(err);
      error("Không thể tải chi tiết thanh toán hoặc tính tổng bill.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const submitViolation = async () => {
    const fine = parseNumber(violationForm.fine_amount);
    if (
      !violationForm.rental_id ||
      !violationForm.description ||
      isNaN(fine) ||
      fine <= 0
    ) {
      warning("Vui lòng điền đầy đủ và đúng định dạng.", "Thiếu thông tin");
      return;
    }

    try {
      setLoading(true);
      await staffRentalService.addViolation({
        rentalId: parseInt(violationForm.rental_id),
        description: violationForm.description,
        fineAmount: fine,
      });
      success("Đã ghi nhận vi phạm.");
      setViolationDialogOpen(false);
      setViolationForm({ rental_id: "", description: "", fine_amount: "" });
      fetchPendingPayments();
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    const amount = parseNumber(paymentForm.amount);
    if (!amount || amount <= 0) {
      warning("Nhập số tiền hợp lệ.", "Số tiền không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      await staffRentalService.processPayment(selectedPayment.rental_id, {
        paymentMethod: "cash",
        amount,
        notes: "Thanh toán tiền mặt tại trạm",
      });
      success("Đã xác nhận thanh toán tiền mặt.");
      setPaymentDialogOpen(false);
      fetchPendingPayments();
    } finally {
      setLoading(false);
    }
  };

  const filtered = pendingPayments.filter(
    (p) =>
      !searchTerm ||
      p.renter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vehicle_license?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rental_id?.toString().includes(searchTerm)
  );

  const totalPendingAmount = pendingPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  const isOverdue = (d) => new Date(d) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Thanh toán tại trạm</h1>
          <p className="text-muted-foreground">
            Ghi nhận thanh toán tiền mặt từ khách hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm tên khách hàng"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setViolationDialogOpen(true)} variant="outline">
            <Flag className="h-4 w-4 mr-2" /> Ghi nhận vi phạm
          </Button>
          <Button onClick={fetchPendingPayments} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Làm mới
          </Button>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              Tổng tiền chờ thanh toán
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-1">
              Tổng giá trị cần xử lý
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalPendingAmount)}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              Tổng số giao dịch
              <Receipt className="h-4 w-4 text-emerald-600" />
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-1">
              Số lượt thanh toán cần xử lý
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {pendingPayments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách thanh toán */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Danh sách thanh toán ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có thanh toán nào chờ xử lý
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã GD</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Hạn</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow
                    key={p.payment_id}
                    className={isOverdue(p.due_date) ? "bg-red-50" : ""}
                  >
                    <TableCell>#{p.payment_id}</TableCell>
                    <TableCell>
                      <div>{p.renter_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {p.renter_phone}
                      </div>
                    </TableCell>
                    <TableCell>{p.vehicle_license}</TableCell>
                    <TableCell>
                      <div className="inline-block px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 font-semibold text-sm shadow-sm">
                        {formatCurrency(p.amount)}
                      </div>
                    </TableCell>
                    <TableCell
                      className={isOverdue(p.due_date) ? "text-red-600" : ""}
                    >
                      {formatDateTime(p.due_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(p)}
                        >
                          <Eye className="h-4 w-4 mr-2" /> Chi tiết
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleProcessPayment(p)}
                        >
                          <Wallet className="h-4 w-4 mr-2" /> Thanh toán
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <PaymentDialogs
        paymentDialogOpen={paymentDialogOpen}
        setPaymentDialogOpen={setPaymentDialogOpen}
        detailDialogOpen={detailDialogOpen}
        setDetailDialogOpen={setDetailDialogOpen}
        violationDialogOpen={violationDialogOpen}
        setViolationDialogOpen={setViolationDialogOpen}
        selectedPayment={selectedPayment}
        selectedDetail={selectedDetail}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        rentalBill={rentalBill}
        loading={loading}
        processPayment={processPayment}
        violationForm={violationForm}
        setViolationForm={setViolationForm}
        submitViolation={submitViolation}
        handleProcessPayment={handleProcessPayment}
        formatCurrency={formatCurrency}
        formatDateTime={formatDateTime}
        getPaymentTypeBadge={getPaymentTypeBadge}
        parseNumber={parseNumber}
        manualReturnTime={manualReturnTime}
        setManualReturnTime={setManualReturnTime}
        onRecalcBill={async () => {
          if (!selectedPayment || !manualReturnTime) return;

          try {
            const rentalId = selectedPayment.rental_id;
            const localDate = new Date(manualReturnTime);
            const returnTimeISO = new Date(
              localDate.getTime() - localDate.getTimezoneOffset() * 60000
            ).toISOString();

            console.log("📤 Gửi tính bill:", {
              url: `/api/staff/rentals/${rentalId}/bill`,
              body: { returnTime: returnTimeISO },
            });

            const billResponse = await staffRentalService.calculateBill(rentalId, {
              returnTime: returnTimeISO, // ✅ chỉ gửi returnTime
            });

            const bill = billResponse?.data || billResponse;
            setRentalBill(bill);

            const finalAmount = bill?.totalBill || 0;
            setPaymentForm((prev) => ({
              ...prev,
              amount: finalAmount.toLocaleString("vi-VN"),
            }));

            success("Đã tính lại hóa đơn theo thời gian trả mới!");
          } catch (err) {
            console.error("❌ Lỗi tính bill:", err);
            error("Không thể tính lại hóa đơn. Kiểm tra thời gian trả xe.");
          }
        }}
      />

    </div>
  );
};
export default PaymentManagement;