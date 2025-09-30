// User Service - thin wrapper over admin user APIs
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const basePath = `/api${API_ENDPOINTS.ADMIN.USERS}`;

const buildQuery = (params = {}) => (params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '');

const getAll = async (params = {}) => {
  const query = buildQuery(params);
  return apiGet(`${basePath}${query}`, 'Không thể lấy danh sách người dùng');
};

const getById = async (id) => {
  return apiGet(`${basePath}/${id}`, 'Không thể lấy thông tin người dùng');
};

const create = async (userData) => {
  return apiPost(basePath, userData, 'Không thể tạo người dùng');
};

const update = async (id, userData) => {
  return apiPut(`${basePath}/${id}`, userData, 'Không thể cập nhật người dùng');
};

const remove = async (id) => {
  return apiDelete(`${basePath}/${id}`, 'Không thể xóa người dùng');
};

const getByRole = async (role) => {
  const query = buildQuery({ role });
  return apiGet(`${basePath}${query}`, 'Không thể lấy người dùng theo role');
};

const changePassword = async (id, currentPassword, newPassword) => {
  // Prefer a dedicated endpoint if the backend exposes it, otherwise fallback to generic update
  try {
    return await apiPut(`${basePath}/${id}/change-password`, { currentPassword, newPassword }, 'Không thể thay đổi mật khẩu');
  } catch (err) {
    return await apiPut(`${basePath}/${id}`, { password: newPassword }, 'Không thể thay đổi mật khẩu');
  }
};

// Admin helpers
const admin = {
  createUser: async (userData) => create(userData),
  getUsers: async (params = {}) => getAll(params),
  getUserById: async (id) => getById(id),
  updateUser: async (id, userData) => update(id, userData),
  deleteUser: async (id) => remove(id),
  getRenters: async (params = {}) => getAll({ ...params, role: 'renter' }),
  getRenterProfile: async (renterId) => apiGet(`/api${API_ENDPOINTS.ADMIN.USER_BY_ID(renterId).replace(/\/users\/${renterId}$/, '/users/profile/' + renterId)}`, 'Không thể lấy hồ sơ khách hàng')
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  getByRole,
  changePassword,
  admin
};