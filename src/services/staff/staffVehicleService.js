import apiClient from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';
import ApiErrorHandler from '@/lib/api/errorHandler.js';

/**
 * Service quản lý xe cho nhân viên (Staff)
 * Tích hợp fetch-based apiClient + chuẩn hóa lỗi bằng ApiErrorHandler
 */
const staffVehicleService = {
  /**
   * Lấy danh sách xe của staff
   * @param {Object} [filters] - Tham số lọc
   * @returns {Promise<Object>} - Danh sách xe hoặc thông tin lỗi
   */
  async getVehicles(filters = {}) {
    try {
      const data = await apiClient.get(API_ENDPOINTS.STAFF.VEHICLES, filters);
      return { success: true, data };
    } catch (error) {
      const handled = ApiErrorHandler.handleError(error);
      return { success: false, error: handled, message: ApiErrorHandler.getUserMessage(handled) };
    }
  },

  /**
   * Lấy thông tin chi tiết 1 xe
   * @param {string|number} id
   * @returns {Promise<Object>}
   */
  async getVehicleById(id) {
    try {
      const data = await apiClient.get(API_ENDPOINTS.STAFF.VEHICLE_BY_ID(id));
      return { success: true, data };
    } catch (error) {
      const handled = ApiErrorHandler.handleError(error);
      return { success: false, error: handled, message: ApiErrorHandler.getUserMessage(handled) };
    }
  },

  /**
   * Cập nhật trạng thái xe (available, maintenance, rented,...)
   * @param {string|number} id
   * @param {string} status
   */
  async updateVehicleStatus(id, status) {
    try {
      const data = await apiClient.patch(API_ENDPOINTS.STAFF.VEHICLE_STATUS(id), { status });
      return { success: true, data };
    } catch (error) {
      const handled = ApiErrorHandler.handleError(error);
      return { success: false, error: handled, message: ApiErrorHandler.getUserMessage(handled) };
    }
  },

  /**
   * 🆕 Cập nhật thông tin kỹ thuật xe
   * Endpoint: PUT /api/staff/vehicle/{id}
   * @param {number} id - ID của xe
   * @param {Object} payload - Dữ liệu cập nhật {brand, model, capacity, rangePerFullCharge}
   */
  async updateVehicle(id, payload) {
    try {
      const data = await apiClient.put(API_ENDPOINTS.STAFF.VEHICLE_BY_ID(id), payload);
      return { success: true, data };
    } catch (error) {
      const handled = ApiErrorHandler.handleError(error);
      return { success: false, error: handled, message: ApiErrorHandler.getUserMessage(handled) };
    }
  },
};

export default staffVehicleService;
