// Station Service - thin wrapper over backend APIs for stations
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const renterBase = `${API_ENDPOINTS.RENTER.STATIONS}`;
const adminBase = `${API_ENDPOINTS.ADMIN.STATIONS}`;

const getAll = async (params = {}) => {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiGet(`${renterBase}${query}`, 'Không thể lấy danh sách trạm');
};

const getById = async (id) => {
  return apiGet(`${renterBase}/${id}`, 'Không thể lấy trạm');
};

const create = async (stationData) => {
  return apiPost(`${adminBase}`, stationData, 'Không thể tạo trạm');
};

const update = async (id, stationData) => {
  return apiPut(`${adminBase}/${id}`, stationData, 'Không thể cập nhật trạm');
};

const remove = async (id) => {
  return apiDelete(`${adminBase}/${id}`, 'Không thể xóa trạm');
};

const getByLocation = async (latitude, longitude, radiusKm = 10) => {
  const params = { latitude, longitude, radiusKm };
  const query = `?${new URLSearchParams(params).toString()}`;
  // try nearby endpoint then fallback to listing with params
  try {
    return apiGet(`${renterBase}/nearby${query}`, 'Không thể lấy trạm theo vị trí');
  } catch (e) {
    return apiGet(`${renterBase}${query}`, 'Không thể lấy trạm theo vị trí');
  }
};

const getStats = async (id) => {
  return apiGet(`${adminBase}/${id}/stats`, 'Không thể lấy thống kê trạm');
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  getByLocation,
  getStats,

  renter: {
    getStations: async () => apiGet(renterBase, 'Không thể lấy danh sách trạm')
  },

  admin: {
    createStation: async (stationData) => apiPost(adminBase, stationData, 'Không thể tạo trạm'),
    getStations: async () => apiGet(adminBase, 'Không thể lấy danh sách trạm'),
    getStationById: async (stationId) => apiGet(`${adminBase}/${stationId}`, 'Không thể lấy trạm'),
    updateStation: async (stationId, updateData) => apiPut(`${adminBase}/${stationId}`, updateData, 'Không thể cập nhật trạm'),
    deleteStation: async (stationId) => apiDelete(`${adminBase}/${stationId}`, 'Không thể xóa trạm')
  }
};