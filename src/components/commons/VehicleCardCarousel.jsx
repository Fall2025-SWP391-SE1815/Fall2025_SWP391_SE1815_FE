import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Car,
    ArrowLeft,
    ArrowRight,
    MapPin,
    Battery,
    Gauge,
    CreditCard,
    Tag,
} from "lucide-react";
import publicVehicleService from "@/services/public/publicVehicleService";

const VehicleCardCarousel = () => {
    const [vehicles, setVehicles] = useState([]);
    const [index, setIndex] = useState(0);
    const intervalRef = useRef(null);

    // ✅ Gọi API khi mount
    useEffect(() => {
        const fetched = { current: false };
        (async () => {
            if (fetched.current) return;
            fetched.current = true;
            const data = await publicVehicleService.getVehicles();
            setVehicles(data || []);
        })();
    }, []);

    // 🔁 Auto slide mỗi 5s
    useEffect(() => {
        if (vehicles.length <= 5) return;
        intervalRef.current = setInterval(() => {
            setIndex((prev) => (prev + 5 >= vehicles.length ? 0 : prev + 5));
        }, 5000);
        return () => clearInterval(intervalRef.current);
    }, [vehicles]);

    const pause = () => clearInterval(intervalRef.current);
    const resume = () => {
        if (vehicles.length <= 5) return;
        intervalRef.current = setInterval(() => {
            setIndex((prev) => (prev + 5 >= vehicles.length ? 0 : prev + 5));
        }, 5000);
    };

    const next = () => setIndex((i) => (i + 5 < vehicles.length ? i + 5 : 0));
    const prev = () =>
        setIndex((i) => (i - 5 >= 0 ? i - 5 : Math.max(vehicles.length - 5, 0)));

    const visible = vehicles.slice(index, index + 5);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount || 0);

    return (
        <section
            className="py-20 bg-gray-50 relative"
            onMouseEnter={pause}
            onMouseLeave={resume}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                {/* Header */}
                <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center gap-2">
                    <Car className="h-7 w-7 text-green-600" />
                    Dòng xe nổi bật
                </h2>

                {/* Khung chính chứa carousel */}
                <div className="relative flex justify-center items-center">
                    {/* Nút trái – giãn theo vùng card */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={prev}
                        className="absolute -left-10 z-10 rounded-full bg-white shadow-md hover:bg-green-100 transition-all duration-300"
                    >
                        <ArrowLeft className="h-5 w-5 text-green-600" />
                    </Button>

                    {/* Container carousel căn giữa */}
                    <div className="flex justify-center items-center gap-6 overflow-hidden transition-all duration-700 ease-in-out max-w-[85%]">
                        {visible.length > 0 ? (
                            visible.map((v) => (
                                <Card
                                    key={v.id}
                                    className="min-w-[240px] max-w-[260px] flex-shrink-0 hover:shadow-lg rounded-2xl transition-all duration-300 bg-white border border-gray-100 hover:-translate-y-1"
                                >
                                    <CardContent className="p-4 space-y-3">
                                        {/* Ảnh xe */}
                                        <div className="relative">
                                            <img
                                                src={
                                                    v.imageUrl ||
                                                    "https://placehold.co/300x180?text=EV+Vehicle"
                                                }
                                                alt={`${v.brand} ${v.model}`}
                                                className="w-full h-36 object-cover rounded-xl"
                                                onError={(e) =>
                                                (e.currentTarget.src =
                                                    "https://placehold.co/300x180?text=EV+Vehicle")
                                                }
                                            />
                                            <span
                                                className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${v.status?.toLowerCase() === "available"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {v.status?.toLowerCase() === "available"
                                                    ? "Sẵn sàng"
                                                    : "Không khả dụng"}
                                            </span>
                                        </div>

                                        {/* Tên xe */}
                                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                                            {v.brand} {v.model}
                                        </h3>

                                        {/* Biển số */}
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Tag className="h-4 w-4 mr-1 text-green-600" />
                                            {v.licensePlate || "Chưa cập nhật"}
                                        </div>

                                        {/* Trạm */}
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="h-4 w-4 mr-1 text-green-600" />
                                            {v.station?.name || "Không rõ trạm"}
                                        </div>

                                        {/* Pin & quãng đường */}
                                        <div className="flex justify-between items-center text-gray-700 text-sm mt-2">
                                            <div className="flex items-center gap-1">
                                                <Battery className="h-4 w-4 text-green-500" />
                                                {v.batteryLevel || 100}%
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Gauge className="h-4 w-4 text-blue-500" />
                                                {v.rangePerFullCharge || 120} km
                                            </div>
                                        </div>

                                        {/* Giá thuê */}
                                        <div className="flex items-center justify-between mt-2 border-t pt-2">
                                            <div className="flex items-center text-green-600 font-semibold text-sm">
                                                <CreditCard className="h-4 w-4 mr-1" />
                                                {formatCurrency(v.pricePerHour)} /giờ
                                            </div>
                                        </div>

                                        {/* Nút hành động */}
                                        <div className="pt-3">
                                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl">
                                                Thuê ngay
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="w-full text-center text-muted-foreground py-12">
                                Đang tải danh sách xe...
                            </div>
                        )}
                    </div>

                    {/* Nút phải */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={next}
                        className="absolute -right-10 z-10 rounded-full bg-white shadow-md hover:bg-green-100 transition-all duration-300"
                    >
                        <ArrowRight className="h-5 w-5 text-green-600" />
                    </Button>
                </div>

                {/* Indicator */}
                {vehicles.length > 5 && (
                    <div className="flex justify-center mt-8 gap-2">
                        {Array.from({ length: Math.ceil(vehicles.length / 5) }).map(
                            (_, i) => (
                                <span
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${i === Math.floor(index / 5)
                                        ? "bg-green-600"
                                        : "bg-gray-300"
                                        }`}
                                ></span>
                            )
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default VehicleCardCarousel;
