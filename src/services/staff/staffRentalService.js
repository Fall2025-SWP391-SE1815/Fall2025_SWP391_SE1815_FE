import apiClient, { apiGet, apiPost } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

const staffRentalService = {
  // Ghi nhận đặt cọc cho rental
  holdDeposit: (id, data) => apiPost(`/api/staff/rentals/${id}/hold-deposit`, data, 'Không thể ghi nhận đặt cọc'),

  // Hủy thuê xe
  cancelRental: (id, data) => apiPost(`/api/staff/rentals/${id}/cancel`, data, 'Không thể hủy thuê xe'),

  // Xác nhận đã giao xe cho khách
  confirmPickup: (data) => apiPost(`/api/staff/rentals/confirm-pickup`, data, 'Không thể xác nhận giao xe'),

  // Check-in nhận xe (booking hoặc walk-in)
  checkIn: (data) => apiPost(`/api/staff/rentals/check-in`, data, 'Không thể check-in nhận xe'),

  // Lấy danh sách Rental theo bộ lọc
  // Use apiClient.get so query params are appended as a query string
  getRentals: (params = {}) => apiClient.get(`/api/staff/rentals`, params),

  // Lấy danh sách Reservation theo bộ lọc
  // Use apiClient.get so query params (status, startFrom, etc.) are sent to backend
  getReservations: (params = {}) => apiClient.get(`/api/staff/rentals/reservations`, params),
};

export default staffRentalService;
