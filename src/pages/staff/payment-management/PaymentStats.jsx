import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Banknote, CreditCard, Receipt } from "lucide-react";

const PaymentStats = ({ payments = [] }) => {
    const total = payments.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const cash = payments.filter((p) => p.method === "cash").length;
    const payos = payments.filter((p) => p.method === "payos").length;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Tổng chờ thanh toán"
                value={total.toLocaleString("vi-VN")}
                icon={<DollarSign className="h-5 w-5 text-orange-600" />}
                note={`${payments.length} giao dịch`}
            />
            <StatCard
                title="Tiền mặt"
                value={cash}
                icon={<Banknote className="h-5 w-5 text-green-600" />}
                note="Giao dịch chờ xử lý"
            />
            <StatCard
                title="PayOS"
                value={payos}
                icon={<CreditCard className="h-5 w-5 text-blue-600" />}
                note="Giao dịch chờ xử lý"
            />
            <StatCard
                title="Tổng số giao dịch"
                value={payments.length}
                icon={<Receipt className="h-5 w-5 text-gray-600" />}
                note="Tất cả thanh toán chờ xử lý"
            />
        </div>
    );
};

const StatCard = ({ title, value, icon, note }) => (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{note}</p>
        </CardContent>
    </Card>
);

export default PaymentStats;
