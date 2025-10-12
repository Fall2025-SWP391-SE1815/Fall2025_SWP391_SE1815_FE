// Admin Service - API wrapper for admin-specific functionality
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

/**
 * Get violation list for admin
 * @param {Object} params - Query parameters
 * @returns {Promise} API response with violations list
 */
const getViolations = async (params = {}) => {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiGet(`${API_ENDPOINTS.ADMIN.VIOLATIONS}${query}`, 'Không thể lấy danh sách vi phạm');
};

/**
 * Get performance statistics for all staff
 * @param {Object} params - Query parameters
 * @returns {Promise} API response with performance data
 */
const getPerformance = async (params = {}) => {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiGet(`${API_ENDPOINTS.ADMIN.PERFORMANCE}${query}`, 'Không thể lấy hiệu suất nhân viên');
};

/**
 * Get rental list with filters for admin
 * @param {Object} params - Query parameters
 * @returns {Promise} API response with rentals list
 */
const getRentals = async (params = {}) => {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiGet(`${API_ENDPOINTS.ADMIN.RENTALS}${query}`, 'Không thể lấy danh sách đơn thuê');
};

export default {
  getViolations,
  getPerformance,
  getRentals
};
