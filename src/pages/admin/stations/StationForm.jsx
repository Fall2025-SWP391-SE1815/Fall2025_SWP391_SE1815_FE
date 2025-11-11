import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import stationService from '@/services/stations/stationService.js';

const createValidationSchema = (initialStationId = null) => Yup.object({
  name: Yup.string()
    .required('Tên trạm bắt buộc')
    .test('unique-name', 'Tên trạm đã tồn tại', async function(value) {
      if (!value) return true;
      
      try {
        const response = await stationService.admin.getStations();
        const stations = response?.stations || response?.data || response || [];
        
        // Kiểm tra trùng lặp, loại bỏ trạm hiện tại nếu đang sửa
        const duplicateStation = stations.find(station => 
          station.name.toLowerCase() === value.toLowerCase() && 
          station.id !== initialStationId
        );
        
        return !duplicateStation;
      } catch (error) {
        console.error('Error checking station name:', error);
        return true; // Nếu lỗi API thì cho phép tiếp tục
      }
    }),
  address: Yup.string().required('Địa chỉ bắt buộc'),
  latitude: Yup.number().required('Vĩ độ bắt buộc').min(-90).max(90),
  longitude: Yup.number().required('Kinh độ bắt buộc').min(-180).max(180),
  status: Yup.string().required('Trạng thái bắt buộc')
});

export default function StationForm({ initialValues, onSubmit, onCancel }) {
  const validationSchema = createValidationSchema(initialValues?.id);
  
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tên trạm</label>
        <Input 
          {...formik.getFieldProps('name')} 
          placeholder="VD: Trạm Nguyễn Văn Cừ" 
        />
        {formik.touched.name && formik.errors.name && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Địa chỉ</label>
        <Input 
          {...formik.getFieldProps('address')} 
          placeholder="VD: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM" 
        />
        {formik.touched.address && formik.errors.address && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Vĩ độ (Latitude)</label>
          <Input 
            type="number" 
            step="any"
            {...formik.getFieldProps('latitude')} 
            placeholder="VD: 10.762622"
          />
          {formik.touched.latitude && formik.errors.latitude && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.latitude}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Kinh độ (Longitude)</label>
          <Input 
            type="number" 
            step="any"
            {...formik.getFieldProps('longitude')} 
            placeholder="VD: 106.660172"
          />
          {formik.touched.longitude && formik.errors.longitude && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.longitude}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Trạng thái</label>
        <Select
          value={formik.values.status || ''}
          onValueChange={(value) => formik.setFieldValue('status', value)}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Chọn trạng thái">
              {formik.values.status === 'active' ? 'Hoạt động' : 
               formik.values.status === 'inactive' ? 'Không hoạt động' :
               formik.values.status === 'maintenance' ? 'Bảo trì' : 'Chọn trạng thái'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
            <SelectItem value="active" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Hoạt động</SelectItem>
            <SelectItem value="inactive" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Không hoạt động</SelectItem>
            <SelectItem value="maintenance" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Bảo trì</SelectItem>
          </SelectContent>
        </Select>
        {formik.touched.status && formik.errors.status && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.status}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">Hủy</Button>
        <Button type="submit">Lưu</Button>
      </div>
    </form>
  );
}