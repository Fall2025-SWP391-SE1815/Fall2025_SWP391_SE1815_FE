// Public Service - API calls that don't require authentication
import { apiGetPublic } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const buildQuery = (params = {}) => {
  return params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
};

const getPublicVehicles = async (params = {}) => {
  const query = buildQuery(params);
  return apiGetPublic(`${API_ENDPOINTS.PUBLIC.VEHICLES}${query}`, 'Không thể lấy danh sách xe công khai');
};

const getPublicStations = async (params = {}) => {
  const query = buildQuery(params);
  return apiGetPublic(`${API_ENDPOINTS.PUBLIC.STATIONS}${query}`, 'Không thể lấy danh sách trạm công khai');
};

export default {
  getPublicVehicles,
  getPublicStations
};
