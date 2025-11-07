// Renter Complaints Service - API wrapper for renter complaint management
import { apiGet, apiPost } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const renterBase = API_ENDPOINTS.RENTER.COMPLAINT;

/**
 * Get all complaints for the current renter
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (pending, resolved, rejected)
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of items per page
 * @returns {Promise} API response with renter's complaints list
 */
const getAll = async (params = {}) => {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
  return apiGet(`${renterBase}${query}`, 'Không thể lấy danh sách khiếu nại');
};

/**
 * Get complaint details by ID
 * @param {number} id - Complaint ID
 * @returns {Promise} API response with complaint details
 */
const getById = async (id) => {
  return apiGet(API_ENDPOINTS.RENTER.COMPLAINT_BY_ID(id), 'Không thể lấy chi tiết khiếu nại');
};

/**
 * Create a new complaint
 * @param {Object} complaintData - Complaint data
 * @param {number} complaintData.rentalId - Related rental ID
 * @param {string} complaintData.description - Complaint description
 * @param {number} complaintData.staffId - Related staff ID (optional)
 * @returns {Promise} API response with created complaint
 */
const create = async (complaintData) => {
  return apiPost(renterBase, complaintData, 'Không thể tạo khiếu nại');
};

export default {
  getAll,
  getById,
  create
};