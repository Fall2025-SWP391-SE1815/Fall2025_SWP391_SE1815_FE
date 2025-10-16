import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Car, Activity, Clock, Wrench } from "lucide-react";

export default function StationStats({ vehicles = [] }) {
    const available = vehicles.filter((v) => v.status === "available").length;
    const rented = vehicles.filter((v) => v.status === "rented").length;
    const maintenance = vehicles.filter((v) => v.status === "maintenance").length;
    const total = vehicles.length;

    const Stat = ({ title, value, hint, Icon, iconClass }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${iconClass}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Stat title="Tổng số xe" value={total} hint="Xe tại trạm này" Icon={Car} iconClass="text-blue-600" />
            <Stat title="Xe khả dụng" value={available} hint="Sẵn sàng cho thuê" Icon={Activity} iconClass="text-green-600" />
            <Stat title="Đang thuê" value={rented} hint="Xe đang được sử dụng" Icon={Clock} iconClass="text-orange-600" />
            <Stat title="Bảo trì" value={maintenance} hint="Xe cần bảo trì" Icon={Wrench} iconClass="text-red-600" />
        </div>
    );
}
