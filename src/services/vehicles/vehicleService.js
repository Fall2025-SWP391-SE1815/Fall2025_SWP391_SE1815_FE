// Vehicle Service - thin wrapper over backend APIs for vehicles
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const renterBase = `${API_ENDPOINTS.RENTER.VEHICLES}`;
const adminBase = `${API_ENDPOINTS.ADMIN.VEHICLES}`;

const buildQuery = (params = {}) => (params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '');

const getAll = async (params = {}) => {
  const query = buildQuery(params);
  return apiGet(`${adminBase}${query}`, 'Không thể lấy danh sách phương tiện');
};

const getById = async (id) => {
  return apiGet(`${adminBase}/${id}`, 'Không thể lấy thông tin phương tiện');
};

const getAvailable = async (params = {}) => {
  const query = buildQuery(params);
  return apiGet(`${renterBase}${query}`, 'Không thể lấy danh sách phương tiện sẵn có');
};

const create = async (vehicleData) => {
  return apiPost(`${adminBase}`, vehicleData, 'Không thể tạo phương tiện');
};

const update = async (id, vehicleData) => {
  return apiPut(`${adminBase}/${id}`, vehicleData, 'Không thể cập nhật phương tiện');
};

const remove = async (id) => {
  return apiDelete(`${adminBase}/${id}`, 'Không thể xóa phương tiện');
};

const updateStatus = async (id, statusData) => {
  // staff endpoint often: PUT /api/staff/vehicles/:id/status
  try {
    return await apiPut(`${API_ENDPOINTS.STAFF.VEHICLE_STATUS(id)}`, statusData, 'Không thể cập nhật trạng thái phương tiện');
  } catch (e) {
    // fallback to admin path if staff path not available
    return apiPut(`${adminBase}/${id}`, statusData, 'Không thể cập nhật trạng thái phương tiện');
  }
};

const getUsageStats = async (id) => {
  return apiGet(`${adminBase}/${id}`, 'Không thể lấy thống kê phương tiện');
};

const getByTypeAndCapacity = async (type, minCapacity = 1) => {
  const query = buildQuery({ type, min_capacity: minCapacity });
  return apiGet(`${renterBase}${query}`, 'Không thể lấy phương tiện theo loại và sức chứa');
};

export default {
  getAll,
  getById,
  getAvailable,
  create,
  update,
  delete: remove,
  updateStatus,
  getUsageStats,
  getByTypeAndCapacity,

  renter: {
    getAvailableVehicles: async (params = {}) => apiGet(`${renterBase}${buildQuery(params)}`, 'Không thể lấy phương tiện sẵn có')
  },

  staff: {
    getStationVehicles: async (stationId) => apiGet(`${API_ENDPOINTS.STAFF.STATION_VEHICLES(stationId)}`, 'Không thể lấy phương tiện tại trạm'),
    updateVehicleStatus: async (vehicleId, statusData) => apiPut(`${API_ENDPOINTS.STAFF.VEHICLE_STATUS(vehicleId)}`, statusData, 'Không thể cập nhật trạng thái phương tiện'),
    getAllStaffVehicles: async (params = {}) => apiGet(`${API_ENDPOINTS.STAFF.VEHICLES}${buildQuery(params)}`, 'Không thể lấy danh sách xe cho staff'),
    getStaffVehicleById: async (id) => apiGet(`${API_ENDPOINTS.STAFF.VEHICLE_BY_ID(id)}`, 'Không thể lấy thông tin xe cho staff')
  },

  admin: {
    createVehicle: async (vehicleData) => apiPost(`${adminBase}`, vehicleData, 'Không thể tạo phương tiện'),
    getVehicles: async (params = {}) => apiGet(`${adminBase}${buildQuery(params)}`, 'Không thể lấy danh sách phương tiện'),
    getVehicleById: async (id) => apiGet(`${adminBase}/${id}`, 'Không thể lấy phương tiện'),
    updateVehicle: async (id, data) => apiPut(`${adminBase}/${id}`, data, 'Không thể cập nhật phương tiện'),
    deleteVehicle: async (id) => apiDelete(`${adminBase}/${id}`, 'Không thể xóa phương tiện'),
    getVehicleStats: async () => apiGet(`${API_ENDPOINTS.ADMIN.VEHICLES_STATUS}`, 'Không thể lấy thống kê phương tiện')
  }
};