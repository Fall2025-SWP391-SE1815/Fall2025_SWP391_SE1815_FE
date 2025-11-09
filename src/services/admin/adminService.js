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

/**
 * Get incident reports list for admin (with optional status filter)
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by incident status (e.g., PENDING, IN_REVIEW, RESOLVED)
 * @returns {Promise} API response with incidents list
 */
const getIncidents = async (params = {}) => {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiGet(`${API_ENDPOINTS.ADMIN.INCIDENTS}${query}`, 'Không thể lấy danh sách báo cáo sự cố');
};

/**
 * Update incident status (resolve incident report)
 * @param {Object} incidentData - Incident update data
 * @param {number} incidentData.incidentId - ID of the incident to update
 * @param {string} incidentData.status - New status (IN_REVIEW, RESOLVED)
 * @param {string} incidentData.resolutionNotes - Resolution notes (optional)
 * @returns {Promise} API response with updated incident
 */
const updateIncident = async (incidentData) => {
  return apiPut(API_ENDPOINTS.ADMIN.INCIDENTS, incidentData, 'Không thể cập nhật trạng thái báo cáo sự cố');
};

/**
 * Get revenue statistics for admin dashboard
 * @param {Object} params - Required query parameters
 * @param {string} params.startDate - Start date (required)
 * @param {string} params.endDate - End date (required) 
 * @param {number} params.stationId - Station ID (optional, for specific station revenue)
 * @returns {Promise} API response with revenue data
 */
const getDashboardRevenue = async (params) => {
  if (!params.startDate || !params.endDate) {
    throw new Error('Ngày bắt đầu và ngày kết thúc là bắt buộc');
  }
  
  const query = `?${new URLSearchParams(params).toString()}`;
  return apiGet(`${API_ENDPOINTS.ADMIN.DASHBOARD_REVENUE}${query}`, 'Không thể lấy dữ liệu doanh thu');
};

export default {
  getViolations,
  getPerformance,
  getRentals,
  getIncidents,
  updateIncident,
  getDashboardRevenue
};
