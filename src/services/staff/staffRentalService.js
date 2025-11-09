import apiClient, { apiGet, apiPost, apiPut } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS, API_BASE_URL } from '@/lib/api/apiConfig.js';

const staffRentalService = {
  // ==================== VEHICLE MANAGEMENT ====================
  
  // Xác nhận kiểm tra xe (chuyển từ AWAITING_INSPECTION sang AVAILABLE)
  confirmVehicleInspection: (plateNumber) =>
    apiPost(API_ENDPOINTS.STAFF.VEHICLE_CONFIRM_INSPECTION(plateNumber), {}, 'Không thể xác nhận kiểm tra xe'),

  // ==================== RENTAL MANAGEMENT ====================

  // ✅ Lấy thông tin chi tiết 1 lượt thuê (bổ sung để fix lỗi tiền không khớp)
  getRentalById: (rentalId) =>
    apiGet(API_ENDPOINTS.STAFF.RENTAL_BY_ID(rentalId), 'Không thể lấy thông tin lượt thuê'),

  // Xác nhận đã thanh toán bill
  processPayment: (rentalId, data) =>
    apiPost(API_ENDPOINTS.STAFF.RENTAL_PAYMENT(rentalId), data, 'Không thể xác nhận thanh toán'),

  // Tính tổng bill của rental
  calculateBill: (rentalId, data) =>
    apiPost(API_ENDPOINTS.STAFF.RENTAL_BILL(rentalId), data, 'Không thể tính tổng bill'),

  // Ghi nhận trả cọc cho rental
  returnDeposit: (id, data) =>
    apiPost(API_ENDPOINTS.STAFF.RENTAL_RETURN_DEPOSIT(id), data, 'Không thể ghi nhận trả cọc'),

  // Ghi nhận đặt cọc cho rental
  holdDeposit: (id, data) =>
    apiPost(API_ENDPOINTS.STAFF.RENTAL_HOLD_DEPOSIT(id), data, 'Không thể ghi nhận đặt cọc'),

  // Hủy thuê xe
  cancelRental: (id, data) =>
    apiPost(API_ENDPOINTS.STAFF.RENTAL_CANCEL(id), data, 'Không thể hủy thuê xe'),

  // Xác nhận xe trả từ khách (confirm return) - có upload ảnh
  confirmReturn: async (formData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STAFF.RENTAL_CONFIRM_RETURN}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể xác nhận xe trả từ khách');
    }

    return response.json();
  },

  // Xác nhận giao xe cho khách (confirm pickup) - có upload ảnh
  confirmPickup: async (formData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STAFF.RENTAL_CONFIRM_PICKUP}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể xác nhận giao xe cho khách');
    }

    return response.json();
  },

  // Check-in nhận xe (booking hoặc walk-in)
  checkIn: (data) =>
    apiPost(API_ENDPOINTS.STAFF.RENTAL_CHECK_IN, data, 'Không thể check-in nhận xe'),

  // Thêm phí phạt sinh (violation) cho rental
  addViolation: (data) =>
    apiPost(API_ENDPOINTS.STAFF.RENTAL_ADD_VIOLATION, data, 'Không thể thêm vi phạm cho rental'),

  // Lấy danh sách Rental theo bộ lọc
  getRentals: (params = {}) => apiClient.get(API_ENDPOINTS.STAFF.RENTALS, params),

  // Lấy danh sách violation của rental
  getViolations: (rentalId) =>
    apiGet(API_ENDPOINTS.STAFF.RENTAL_VIOLATIONS(rentalId), 'Không thể lấy danh sách vi phạm'),

  // Lấy danh sách Reservation theo bộ lọc
  getReservations: (params = {}) =>
    apiClient.get(API_ENDPOINTS.STAFF.RESERVATIONS, params),

  // ==================== RENTER DOCUMENT MANAGEMENT ====================

  // Xác thực tài liệu của Renter
  verifyDocument: (documentId) =>
    apiPut(API_ENDPOINTS.STAFF.RENTER_DOCUMENT_VERIFY(documentId), {}, 'Không thể xác thực tài liệu'),

  // Lấy danh sách tài liệu của Renter theo ID
  getRenterDocuments: (renterId) =>
    apiClient.get(API_ENDPOINTS.STAFF.RENTER_DOCUMENTS_BY_STAFF(renterId)),

  // Lấy danh sách tất cả user (renter) theo phone (hoặc tất cả nếu không có)
  getRenters: (phone) => {
    const params = phone ? { phone } : {};
    return apiClient.get(API_ENDPOINTS.STAFF.RENTER_DOCUMENTS, params);
  },

  // ==================== INCIDENT REPORT MANAGEMENT ====================

  // Lấy danh sách tất cả báo cáo sự cố
  getIncidentReports: () =>
    apiGet(API_ENDPOINTS.STAFF.INCIDENT_REPORTS, 'Không thể tải danh sách báo cáo sự cố'),

  // Tạo báo cáo sự cố mới
  createIncidentReport: (data) =>
    apiPost(API_ENDPOINTS.STAFF.INCIDENT_REPORTS, data, 'Không thể tạo báo cáo sự cố'),

  // Lấy chi tiết một báo cáo sự cố
  getIncidentReportById: (id) =>
    apiGet(API_ENDPOINTS.STAFF.INCIDENT_REPORT_BY_ID(id), 'Không thể lấy chi tiết báo cáo sự cố'),
};

export default staffRentalService;