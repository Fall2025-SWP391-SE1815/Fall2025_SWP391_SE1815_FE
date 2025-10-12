// Complaints Service - API wrapper for complaint management
import { apiGet, apiPost } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const adminBase = `${API_ENDPOINTS.ADMIN.COMPLAINTS}`;

/**
 * Get all complaints with optional filtering by status
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (pending, resolved, rejected)
 * @returns {Promise} API response with complaints list
 */
const getAll = async (params = {}) => {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiGet(`${adminBase}${query}`, 'Không thể lấy danh sách khiếu nại');
};

/**
 * Get complaint by ID
 * @param {number} id - Complaint ID
 * @returns {Promise} API response with complaint details
 */
const getById = async (id) => {
  return apiGet(`${adminBase}/${id}`, 'Không thể lấy chi tiết khiếu nại');
};

/**
 * Resolve or reject a complaint
 * @param {Object} resolutionData - Resolution data
 * @param {number} resolutionData.complaintId - Complaint ID to resolve
 * @param {string} resolutionData.status - New status (resolved, rejected)
 * @param {string} resolutionData.resolution - Resolution message
 * @returns {Promise} API response with updated complaint
 */
const resolve = async (resolutionData) => {
  return apiPost(`${API_ENDPOINTS.ADMIN.COMPLAINT_RESOLVE}`, resolutionData, 'Không thể cập nhật trạng thái khiếu nại');
};

export default {
  getAll,
  getById,
  resolve
};