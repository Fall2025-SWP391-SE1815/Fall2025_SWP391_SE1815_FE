import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGlobalToast } from '@/components/ui/global-toast';
import staffRentalService from '@/services/staff/staffRentalService';
import { formatCurrency } from '@/utils/pricing';
import { Search, RefreshCw } from 'lucide-react';

const RentalHistory = () => {
    const { success, error } = useGlobalToast();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [search, setSearch] = useState('');

    const STATUS_VI = {
        returned: 'Đã trả xe',
        waiting_for_payment: 'Chờ thanh toán',
        booked: 'Đã đặt chỗ',
        in_use: 'Đang thuê',
        wait_confirm: 'Chờ xác nhận',
        cancelled: 'Đã huỷ',
    };

    const getStatusVI = (status) => STATUS_VI[status] || status;

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
        setFetchError(null);
        try {
            const response = await staffRentalService.getRentals();
            setHistory(Array.isArray(response) ? response : response?.data || []);
        } catch (err) {
            setFetchError(err.message || 'Không thể tải lịch sử thuê');
            error('Không thể tải lịch sử thuê', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReturnDeposit = async (rentalId) => {
        try {
            setLoading(true);
            await staffRentalService.returnDeposit(rentalId);
            success('Trả cọc thành công', 'Đã hoàn tiền cọc cho khách hàng.');
            await fetchHistory();
        } catch (err) {
            console.error('Error returning deposit:', err);
            const message =
                err.response?.data?.message ||
                'Không thể trả lại tiền cọc. Vui lòng kiểm tra trạng thái thuê.';
            error('Không thể trả lại tiền cọc', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lịch sử thuê xe</h1>
                    <p className="text-muted-foreground">
                        Theo dõi các chuyến thuê và trạng thái hoàn cọc
                    </p>
                </div>

                <div className="flex w-full sm:w-auto gap-2">
                    <div className="relative w-full sm:w-80">
                        <Input
                            placeholder="Tìm kiếm khách hàng, SĐT, biển số..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchHistory}
                        disabled={loading}
                        className="flex items-center gap-1"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <Card className="shadow-md border rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg font-semibold">
                        Danh sách chuyến thuê ({filteredHistory.length})
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-6 text-muted-foreground">Đang tải dữ liệu...</div>
                    ) : fetchError ? (
                        <div className="text-center text-red-500 py-6">{fetchError}</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            Không có dữ liệu lịch sử thuê.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border-collapse">
                                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 border-b text-center">Mã thuê</th>
                                        <th className="px-4 py-3 border-b text-center">Khách hàng</th>
                                        <th className="px-4 py-3 border-b text-center">Xe</th>
                                        <th className="px-4 py-3 border-b text-center">Trạm nhận</th>
                                        <th className="px-4 py-3 border-b text-center">Thời gian</th>
                                        <th className="px-4 py-3 border-b text-center">Trạng thái</th>
                                        <th className="px-4 py-3 border-b text-center">Cọc</th>
                                        <th className="px-4 py-3 border-b text-center">Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredHistory.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50 border-b last:border-none transition-colors text-center"
                                        >
                                            <td className="px-4 py-3 font-semibold text-blue-700">{item.id}</td>

                                            <td className="px-4 py-3">
                                                <div className="font-medium">{item.renter?.fullName}</div>
                                                <div className="text-xs text-gray-500">{item.renter?.phone}</div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="font-medium">{item.vehicle?.licensePlate}</div>
                                                <div className="text-xs text-gray-500">
                                                    {item.vehicle?.brand} {item.vehicle?.model}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">{item.stationPickup?.name}</td>

                                            <td className="px-4 py-3 text-xs">
                                                <div>
                                                    <span className="font-medium text-gray-700">Thuê:</span>{' '}
                                                    {item.startTime?.slice(0, 10)}{' '}
                                                    <span className="text-gray-400">{item.startTime?.slice(11, 16)}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Trả:</span>{' '}
                                                    {item.endTime?.slice(0, 10)}{' '}
                                                    <span className="text-gray-400">{item.endTime?.slice(11, 16)}</span>
                                                </div>
                                            </td>

                                            {/* Trạng thái thuê */}
                                            <td className="px-4 py-3">
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

                                            {/* Trạng thái cọc */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${item.depositStatus === 'refunded'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    {item.depositStatus === 'refunded' ? 'Đã trả' : 'Giữ cọc'}
                                                </span>
                                            </td>

                                            {/* Thao tác */}
                                            <td className="px-4 py-3 space-x-2">
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

            {/* Dialog giữ nguyên UI */}
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

                        {/* giữ nguyên phần detail */}
                        <div className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col gap-2">
                                <div className="font-semibold text-blue-700 mb-2">Khách hàng</div>
                                <div>
                                    <span className="font-medium">Họ tên:</span> {selected.renter?.fullName}
                                </div>
                                <div>
                                    <span className="font-medium">SĐT:</span> {selected.renter?.phone}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col gap-2">
                                <div className="font-semibold text-blue-700 mb-2">Thông tin xe</div>
                                <div>
                                    <span className="font-medium">Biển số:</span> {selected.vehicle?.licensePlate}
                                </div>
                                <div>
                                    <span className="font-medium">Hãng/Model:</span>{' '}
                                    {selected.vehicle?.brand} {selected.vehicle?.model}
                                </div>
                                <div>
                                    <span className="font-medium">Loại xe:</span> {selected.vehicle?.type}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col gap-2 md:col-span-2">
                                <div className="font-semibold text-blue-700 mb-2">Thông tin thuê</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div>Trạm nhận:</div>
                                    <div>
                                        {selected.stationPickup?.name} - {selected.stationPickup?.address}
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
                                            {getStatusVI(selected.status)}
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

                            <div className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col gap-2 md:col-span-2">
                                <div className="font-semibold text-blue-700 mb-2">Tài chính</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div>Tiền thuê:</div>
                                    <div>{formatCurrency(selected.rentalCost || 0)}</div>
                                    <div>Bảo hiểm:</div>
                                    <div>{selected.insurance?.toLocaleString()} VND</div>
                                    <div>Tiền cọc:</div>
                                    <div>
                                        {selected.depositAmount?.toLocaleString()} VND ({selected.depositStatus})
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