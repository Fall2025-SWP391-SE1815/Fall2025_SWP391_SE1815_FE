import apiClient, { apiGet, apiPost, apiPut } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS, API_BASE_URL } from '@/lib/api/apiConfig.js';

const staffRentalService = {
  // ==================== RENTAL MANAGEMENT ====================
  
  // Xác nhận đã thanh toán bill
  processPayment: (rentalId, data) => apiPost(`/api/staff/rentals/${rentalId}/payment`, data, 'Không thể xác nhận thanh toán'),

  // Tính tổng bill của rental
  calculateBill: (rentalId, data) => apiPost(`/api/staff/rentals/${rentalId}/bill`, data, 'Không thể tính tổng bill'),

  // Ghi nhận trả cọc cho rental
  returnDeposit: (id, data) => apiPost(`/api/staff/rentals/${id}/return-deposit`, data, 'Không thể ghi nhận trả cọc'),

  // Ghi nhận đặt cọc cho rental
  holdDeposit: (id, data) => apiPost(`/api/staff/rentals/${id}/hold-deposit`, data, 'Không thể ghi nhận đặt cọc'),

  // Hủy thuê xe
  cancelRental: (id, data) => apiPost(`/api/staff/rentals/${id}/cancel`, data, 'Không thể hủy thuê xe'),

  // Xác nhận xe từ khách (confirm return)
  confirmReturn: (data) => apiPost(`/api/staff/rentals/confirm-return`, data, 'Không thể xác nhận xe trả từ khách'),

  // Xác nhận đã giao xe cho khách (confirm pickup) - với FormData cho file upload
  confirmPickup: async (formData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/api/staff/rentals/confirm-pickup`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
        // Don't set Content-Type, let browser set it for FormData
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể xác nhận giao xe cho khách');
    }

    return response.json();
  },

  // Check-in nhận xe (booking hoặc walk-in)
  checkIn: (data) => apiPost(`/api/staff/rentals/check-in`, data, 'Không thể check-in nhận xe'),

  // Thêm phí phạt sinh (violation) cho rental
  addViolation: (data) => apiPost(`/api/staff/rentals/add-violation`, data, 'Không thể thêm vi phạm cho rental'),

  // Lấy danh sách Rental theo bộ lọc
  // Use apiClient.get so query params are appended as a query string
  getRentals: (params = {}) => apiClient.get(`/api/staff/rentals`, params),

  // Lấy danh sách violation của rental
  getViolations: (rentalId) => apiGet(`/api/staff/rentals/${rentalId}/violations`, 'Không thể lấy danh sách vi phạm'),

  // Lấy danh sách Reservation theo bộ lọc
  // Use apiClient.get so query params (status, startFrom, etc.) are sent to backend
  getReservations: (params = {}) => apiClient.get(`/api/staff/rentals/reservations`, params),

  // ==================== RENTER DOCUMENT MANAGEMENT ====================
  
  // Xác thực tài liệu của Renter
  verifyDocument: (documentId) => apiPut(`/api/staff/renter-document/verify/${documentId}`, {}, 'Không thể xác thực tài liệu'),

  // Lấy danh sách tài liệu của Renter theo ID
  getRenterDocuments: (renterId) => apiClient.get(`/api/staff/renter-document/${renterId}`),

  // ==================== INCIDENT REPORT MANAGEMENT ====================
  
  // Tạo báo cáo sự cố mới
  createIncidentReport: (data) => apiPost(`/api/staff/incident-report`, data, 'Không thể tạo báo cáo sự cố'),

  // Lấy danh sách báo cáo sự cố
  getIncidentReports: (params = {}) => apiClient.get(`/api/staff/incident-report`, params),
};

export default staffRentalService;
