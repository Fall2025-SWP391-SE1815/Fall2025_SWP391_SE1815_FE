import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const validationSchema = Yup.object({
  licensePlate: Yup.string().required('Biển số xe bắt buộc'),
  brand: Yup.string().required('Thương hiệu bắt buộc'),
  model: Yup.string().required('Mẫu xe bắt buộc'),
  type: Yup.string().required('Loại xe bắt buộc'),
  status: Yup.string().required('Trạng thái bắt buộc'),
  capacity: Yup.number().required('Dung lượng bắt buộc').min(1, 'Dung lượng phải lớn hơn 0'),
  rangePerFullCharge: Yup.number().required('Quãng đường bắt buộc').min(0),
  pricePerHour: Yup.number().required('Giá theo giờ bắt buộc').min(0),
  stationId: Yup.number().required('Trạm bắt buộc')
});

export default function VehicleForm({ initialValues, onSubmit, onCancel, stations }) {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Biển số xe</label>
        <Input {...formik.getFieldProps('licensePlate')} placeholder="VD: 30A-12345" />
        {formik.touched.licensePlate && formik.errors.licensePlate && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.licensePlate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thương hiệu</label>
        <Input {...formik.getFieldProps('brand')} placeholder="VD: Toyota, Honda..." />
        {formik.touched.brand && formik.errors.brand && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.brand}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mẫu xe</label>
        <Input {...formik.getFieldProps('model')} placeholder="VD: Vios, Civic..." />
        {formik.touched.model && formik.errors.model && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.model}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Loại xe</label>
        <Select
          value={formik.values.type || ''}
          onValueChange={(value) => formik.setFieldValue('type', value)}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Chọn loại xe">
              {formik.values.type === 'car' ? 'Ô tô' : formik.values.type === 'motorbike' ? 'Xe máy' : 'Chọn loại xe'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
            <SelectItem value="car" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Ô tô</SelectItem>
            <SelectItem value="motorbike" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Xe máy</SelectItem>
          </SelectContent>
        </Select>
        {formik.touched.type && formik.errors.type && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.type}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Trạng thái</label>
        <Select
          value={formik.values.status || ''}
          onValueChange={(value) => formik.setFieldValue('status', value)}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Chọn trạng thái">
              {formik.values.status === 'available' ? 'Có sẵn' : 
               formik.values.status === 'rented' ? 'Đang thuê' :
               formik.values.status === 'maintenance' ? 'Bảo trì' :
               formik.values.status === 'reserved' ? 'Đã đặt' : 'Chọn trạng thái'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 min-w-[var(--radix-select-trigger-width)]">
            <SelectItem value="available" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Có sẵn</SelectItem>
            <SelectItem value="rented" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đang thuê</SelectItem>
            <SelectItem value="maintenance" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Bảo trì</SelectItem>
            <SelectItem value="reserved" className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">Đã đặt</SelectItem>
          </SelectContent>
        </Select>
        {formik.touched.status && formik.errors.status && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.status}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dung lượng pin (kWh)</label>
          <Input 
            type="number" 
            {...formik.getFieldProps('capacity')} 
            placeholder="VD: 4, 7..."
          />
          {formik.touched.capacity && formik.errors.capacity && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.capacity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quãng đường/sạc đầy (km)</label>
          <Input 
            type="number" 
            {...formik.getFieldProps('rangePerFullCharge')} 
            placeholder="VD: 250"
          />
          {formik.touched.rangePerFullCharge && formik.errors.rangePerFullCharge && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.rangePerFullCharge}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Giá theo giờ (VND)</label>
        <Input 
          type="number" 
          {...formik.getFieldProps('pricePerHour')} 
          placeholder="VD: 150000"
        />
        {formik.touched.pricePerHour && formik.errors.pricePerHour && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.pricePerHour}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Trạm</label>
        <Select
          value={formik.values.stationId ? String(formik.values.stationId) : ''}
          onValueChange={(value) => formik.setFieldValue('stationId', Number(value))}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Chọn trạm">
              {formik.values.stationId 
                ? stations.find(s => s.id === formik.values.stationId)?.name || 'Chọn trạm'
                : 'Chọn trạm'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md p-1 max-h-[300px] overflow-y-auto min-w-[var(--radix-select-trigger-width)]">
            {stations.map((s) => (
              <SelectItem key={s.id} value={String(s.id)} className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm text-gray-900">
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formik.touched.stationId && formik.errors.stationId && (
          <p className="text-sm text-red-500 mt-1">{formik.errors.stationId}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">Hủy</Button>
        <Button type="submit">Lưu</Button>
      </div>
    </form>
  );
}
