import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import { formatCurrency } from '@/utils/pricing';

const RentalHistory = () => {
    const { toast } = useToast();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [search, setSearch] = useState('');

    // Mapping trạng thái sang tiếng Việt
    const STATUS_VI = {
        returned: 'Đã trả xe',
        waiting_for_payment: 'Chờ thanh toán',
        booked: 'Đã đặt chỗ',
        in_use: 'Đang thuê',
        wait_confirm: 'Chờ xác nhận',
        cancelled: 'Đã huỷ',
    };

    const getStatusVI = (status) => STATUS_VI[status] || status;

    // Lọc theo từ khóa tìm kiếm
    const filteredHistory = history.filter((item) => {
        const searchText = search.trim().toLowerCase();
        return (
            !searchText ||
            item.renter?.fullName?.toLowerCase().includes(searchText) ||
            item.renter?.phone?.toLowerCase().includes(searchText) ||
            item.vehicle?.licensePlate?.toLowerCase().includes(searchText)
        );
    });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await staffRentalService.getRentals();
            setHistory(Array.isArray(response) ? response : response?.data || []);
        } catch (err) {
            setError(err.message || 'Không thể tải lịch sử thuê');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Hàm xử lý trả cọc
    const handleReturnDeposit = async (rentalId) => {
        try {
            setLoading(true);
            await staffRentalService.returnDeposit(rentalId);
            toast({
                title: 'Thành công',
                description: 'Đã trả lại tiền cọc cho khách hàng.',
            });
            await fetchHistory();
        } catch (error) {
            console.error('Error returning deposit:', error);
            const message =
                error.response?.data?.message ||
                'Không thể trả lại tiền cọc. Vui lòng kiểm tra trạng thái thuê.';
            toast({
                title: 'Lỗi',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lịch sử thuê</h1>
                    <p className="text-muted-foreground">
                        Danh sách xe đã được khách hàng sử dụng
                    </p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Tìm kiếm khách hàng, SĐT, biển số..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-80"
                    />
                </div>
            </div>

            <Card>
                <CardContent>
                    {loading ? (
                        <div>Đang tải dữ liệu...</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : history.length === 0 ? (
                        <div>Không có dữ liệu lịch sử thuê.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border rounded-lg shadow-sm bg-white">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700 uppercase text-xs">
                                        <th className="px-4 py-2 border-b text-center">Mã thuê</th>
                                        <th className="px-4 py-2 border-b text-center">Khách hàng</th>
                                        <th className="px-4 py-2 border-b text-center">Xe</th>
                                        <th className="px-4 py-2 border-b text-center">Trạm nhận</th>
                                        <th className="px-4 py-2 border-b text-center">Thời gian</th>
                                        <th className="px-4 py-2 border-b text-center">Trạng thái</th>
                                        <th className="px-4 py-2 border-b text-center">Trạng thái cọc</th>
                                        <th className="px-4 py-2 border-b text-center">Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-100 transition">
                                            <td className="border-b px-4 py-2 font-semibold text-blue-700 text-center">
                                                {item.id}
                                            </td>

                                            <td className="border-b px-4 py-2 text-center">
                                                <div className="font-medium">
                                                    {item.renter?.fullName || item.renter?.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.renter?.phone}
                                                </div>
                                            </td>

                                            <td className="border-b px-4 py-2 text-center">
                                                <div className="font-medium">
                                                    {item.vehicle?.licensePlate}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.vehicle?.brand} {item.vehicle?.model}
                                                </div>
                                            </td>

                                            <td className="border-b px-4 py-2 text-center">
                                                {item.stationPickup?.name}
                                            </td>

                                            <td className="border-b px-4 py-2 align-middle text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div>
                                                        <span className="font-semibold">Ngày thuê:</span>{' '}
                                                        {item.startTime?.slice(0, 10)}
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            {item.startTime?.slice(11, 19)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">Ngày trả:</span>{' '}
                                                        {item.endTime?.slice(0, 10)}
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            {item.endTime?.slice(11, 19)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Trạng thái thuê */}
                                            <td className="border-b px-4 py-2 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.status === 'returned'
                                                        ? 'bg-green-100 text-green-700'
                                                        : item.status === 'waiting_for_payment'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : item.status === 'cancelled'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {getStatusVI(item.status)}
                                                </span>
                                            </td>

                                            {/* ✅ Trạng thái cọc */}
                                            <td className="border-b px-4 py-2 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.depositStatus === 'refunded'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    {item.depositStatus === 'refunded'
                                                        ? 'Đã trả cọc'
                                                        : 'Đang giữ cọc'}
                                                </span>
                                            </td>

                                            {/* ✅ Cột Thao tác */}
                                            <td className="border-b px-4 py-2 text-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelected(item);
                                                        setShowDialog(true);
                                                    }}
                                                >
                                                    Xem
                                                </Button>

                                                {item.status?.toLowerCase() === 'returned' &&
                                                    item.depositStatus?.toLowerCase() === 'held' && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleReturnDeposit(item.id)}
                                                            disabled={loading}
                                                        >
                                                            Trả cọc
                                                        </Button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog chi tiết */}
            {showDialog && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 relative animate-fade-in">
                        <button
                            className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-black"
                            onClick={() => setShowDialog(false)}
                        >
                            &times;
                        </button>

                        <div className="p-8 pb-4 border-b">
                            <h2 className="text-2xl font-bold text-blue-700 mb-1">
                                Chi tiết thuê xe #{selected.id}
                            </h2>
                            <div className="text-gray-500 text-sm">
                                {selected.startTime} → {selected.endTime}
                            </div>
                        </div>

                        <div className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                            {/* Khách hàng */}
                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col gap-2">
                                <div className="font-semibold text-blue-700 mb-2">Khách hàng</div>
                                <div>
                                    <span className="font-medium">Họ tên:</span>{' '}
                                    {selected.renter?.fullName}
                                </div>
                                <div>
                                    <span className="font-medium">SĐT:</span>{' '}
                                    {selected.renter?.phone}
                                </div>
                            </div>

                            {/* Xe */}
                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col gap-2">
                                <div className="font-semibold text-blue-700 mb-2">Thông tin xe</div>
                                <div>
                                    <span className="font-medium">Biển số:</span>{' '}
                                    {selected.vehicle?.licensePlate}
                                </div>
                                <div>
                                    <span className="font-medium">Hãng/Model:</span>{' '}
                                    {selected.vehicle?.brand} {selected.vehicle?.model}
                                </div>
                                <div>
                                    <span className="font-medium">Loại xe:</span>{' '}
                                    {selected.vehicle?.type}
                                </div>
                            </div>

                            {/* Thông tin thuê */}
                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col gap-2 md:col-span-2">
                                <div className="font-semibold text-blue-700 mb-2">
                                    Thông tin thuê
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div>Trạm nhận:</div>
                                    <div>
                                        {selected.stationPickup?.name} -{' '}
                                        {selected.stationPickup?.address}
                                    </div>
                                    <div>Nhân viên giao xe:</div>
                                    <div>{selected.staffPickup?.fullName || '-'}</div>
                                    <div>Nhân viên nhận xe:</div>
                                    <div>{selected.staffReturn?.fullName || '-'}</div>
                                    <div>Loại thuê:</div>
                                    <div>{selected.rentalType}</div>
                                    <div>Trạng thái:</div>
                                    <div>
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${selected.status === 'returned'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            {selected.status}
                                        </span>
                                    </div>
                                    <div>ODO đầu/cuối:</div>
                                    <div>
                                        {selected.odoStart} km / {selected.odoEnd} km
                                    </div>
                                    <div>Pin đầu/cuối:</div>
                                    <div>
                                        {selected.batteryLevelStart}% / {selected.batteryLevelEnd}%
                                    </div>
                                </div>
                            </div>

                            {/* Tài chính */}
                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col gap-2 md:col-span-2">
                                <div className="font-semibold text-blue-700 mb-2">Tài chính</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div>Tiền thuê:</div>
                                    <div>{formatCurrency(selected.rentalCost || 0)}</div>
                                    <div>Bảo hiểm:</div>
                                    <div>{selected.insurance?.toLocaleString()} VND</div>
                                    <div>Tiền cọc:</div>
                                    <div>
                                        {selected.depositAmount?.toLocaleString()} VND (
                                        {selected.depositStatus})
                                    </div>
                                    <div>Tổng chi phí:</div>
                                    <div>{formatCurrency(selected.totalCost || 0)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RentalHistory;
