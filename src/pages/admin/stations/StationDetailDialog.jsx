import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Activity } from 'lucide-react';

export default function StationDetailDialog({ station, open, onOpenChange }) {
  if (!station) return null;

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { label: 'Hoạt động', variant: 'default' },
      'inactive': { label: 'Không hoạt động', variant: 'secondary' },
      'maintenance': { label: 'Bảo trì', variant: 'destructive' }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Chi tiết trạm xe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header với tên trạm và trạng thái */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="text-2xl font-bold">{station.name}</h3>
              <p className="text-muted-foreground">{station.address}</p>
            </div>
            <div>
              {getStatusBadge(station.status)}
            </div>
          </div>

          {/* Grid thông tin chi tiết */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Địa chỉ</p>
                  <p className="font-medium">{station.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Tọa độ GPS</p>
                  {station.latitude && station.longitude ? (
                    <div>
                      <p className="font-medium">
                        Lat: {Number(station.latitude).toFixed(6)}
                      </p>
                      <p className="font-medium">
                        Lng: {Number(station.longitude).toFixed(6)}
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium text-muted-foreground">Chưa có tọa độ</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <div className="mt-1">
                    {getStatusBadge(station.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID Trạm:</span>
                <span className="ml-2 font-medium">{station.id}</span>
              </div>
              {station.latitude && station.longitude && (
                <div>
                  <span className="text-muted-foreground">
                    <a 
                      href={`https://maps.google.com/?q=${station.latitude},${station.longitude}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Xem trên Google Maps
                    </a>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}