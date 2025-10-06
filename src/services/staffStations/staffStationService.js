// Staff Station Service - use real API client
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const base = `${API_ENDPOINTS.ADMIN.STAFF_STATIONS}`;

const getAll = async (params = {}) => {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiGet(`${base}${query}`, 'Không thể lấy phân công nhân viên');
};

const create = async (data) => {
  return apiPost(base, data, 'Không thể phân công nhân viên');
};

const update = async (id, data) => {
  return apiPut(`${base}/${id}`, data, 'Không thể cập nhật phân công');
};

const getByStaff = async (staffId) => {
  const query = `?${new URLSearchParams({ staff_id: staffId }).toString()}`;
  return apiGet(`${base}${query}`, 'Không thể lấy phân công của nhân viên');
};

const getStaffAtStation = async (stationId) => {
  const query = `?${new URLSearchParams({ station_id: stationId }).toString()}`;
  return apiGet(`${base}${query}`, 'Không thể lấy nhân viên tại trạm');
};

const admin = {
  createAssignment: async (assignmentData) => apiPost(base, assignmentData, 'Không thể phân công nhân viên'),
  deactivateAssignment: async (id) => apiPut(`${base}/${id}/deactivate`, null, 'Không thể kết thúc phân công'),
  getAssignments: async (params = {}) => {
    const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
    return apiGet(`${base}${query}`, 'Không thể lấy danh sách phân công');
  }
};

export default {
  getAll,
  create,
  update,
  getByStaff,
  getStaffAtStation,
  admin
};