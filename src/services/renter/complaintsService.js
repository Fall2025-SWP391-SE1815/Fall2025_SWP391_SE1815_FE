// Renter Complaints Service - API wrapper for renter complaint management
import { apiGet, apiPost } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

/**
 * Get all complaints for the current renter
 * API: GET /api/renter/complaint
 * @returns {Promise} API response with renter's complaints list
 */
const getAll = async () => {
  return apiGet(API_ENDPOINTS.RENTER.COMPLAINT, 'Không thể lấy danh sách khiếu nại');
};

/**
 * Get complaint details by ID  
 * API: GET /api/renter/complaint/{complaintId}
 * @param {number} complaintId - Complaint ID
 * @returns {Promise} API response with complaint details
 */
const getById = async (complaintId) => {
  return apiGet(API_ENDPOINTS.RENTER.COMPLAINT_BY_ID(complaintId), 'Không thể lấy chi tiết khiếu nại');
};

/**
 * Create a new complaint
 * API: POST /api/renter/complaint
 * @param {Object} complaintData - Complaint data
 * @param {number} complaintData.rentalId - Related rental ID
 * @param {string} complaintData.description - Complaint description
 * @param {number} complaintData.staffId - Related staff ID (optional)
 * @returns {Promise} API response with created complaint
 */
const create = async (complaintData) => {
  return apiPost(API_ENDPOINTS.RENTER.COMPLAINT, complaintData, 'Không thể tạo khiếu nại');
};

export default {
  getAll,
  getById,
  create
};