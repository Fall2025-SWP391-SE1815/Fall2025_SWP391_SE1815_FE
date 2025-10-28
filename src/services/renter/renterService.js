// Renter Service - API calls for renter-specific functionality
import apiClient from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

export const renterService = {
  // Document Management
  documents: {
    upload: async (file, metadata = {}) => {
      const formData = new FormData();
      formData.append('file', file);

      // Build URL with metadata as query string per Swagger (metadata passed as JSON string)
      const metadataQuery = metadata && Object.keys(metadata).length ? `?metadata=${encodeURIComponent(JSON.stringify(metadata))}` : '';
      return await apiClient.post(`${API_ENDPOINTS.RENTER.DOCUMENTS}${metadataQuery}`, formData);
    },
    
    // Xem danh sách tài liệu đã upload
    getAll: async (userId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.DOCUMENTS, { userId });
    },
    
    // Xoá tài liệu
    delete: async (documentId) => {
      return await apiClient.delete(API_ENDPOINTS.RENTER.DOCUMENT_BY_ID(documentId));
    }
  },

  // Station Management
  stations: {
    // Xem danh sách trạm + vị trí
    getAll: async (params = {}) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.STATIONS, params);
    }
  },

  // Vehicle Management
  vehicles: {
    // Xem danh sách xe đang có sẵn (lọc theo loại, trạm, giá)
    getAvailable: async (params = {}) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.VEHICLES, params);
    }
  },

  // Reservation Management
  reservations: {
    // Đặt trước xe
    create: async (reservationData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.RESERVATIONS, reservationData);
    },
    
    // Xem danh sách booking của mình
    // Accepts either a userId (number/string) or a params object { status, vehicleId, startFrom, startTo, userId, ... }
    getAll: async (queryOrUserId) => {
      if (queryOrUserId && (typeof queryOrUserId === 'string' || typeof queryOrUserId === 'number')) {
        return await apiClient.get(API_ENDPOINTS.RENTER.RESERVATIONS, { userId: queryOrUserId });
      }
      const params = queryOrUserId || {};
      return await apiClient.get(API_ENDPOINTS.RENTER.RESERVATIONS, params);
    },
    
    // Chi tiết 1 booking
    getById: async (reservationId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.RESERVATION_BY_ID(reservationId));
    },
    
    // Hủy booking
    cancel: async (reservationId, cancelReason) => {
      // PATCH /api/renter/reservations/{id}/cancel { cancelReason }
      const body = cancelReason ? { cancelReason } : {};
      try {
        return await apiClient.patch(API_ENDPOINTS.RENTER.RESERVATION_CANCEL(reservationId), body);
      } catch (e) {
        // fallback legacy DELETE without body
        return await apiClient.delete(API_ENDPOINTS.RENTER.RESERVATION_BY_ID(reservationId));
      }
    }
  },

  // Rental Management
  rentals: {
    // Lấy tất cả rental với filter (status, từ ngày, đến ngày)
    getAll: async (params = {}) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.RENTALS_ALL, params);
    },
    
    // Xem biên bản giao/nhận xe
    getChecks: async (rentalId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.RENTAL_CHECKS(rentalId));
    },

    // Xác nhận đã nhận xe
    confirmRental: async (rentalId) => {
      return await apiClient.patch(API_ENDPOINTS.RENTER.RENTAL_CONFIRM(rentalId));
    }
  },

  // Rating Management
  ratings: {
    // Gửi đánh giá chuyến đi (xe, trải nghiệm)
    submitTrip: async (ratingData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.RATING_TRIP, ratingData);
    },
    
    // Gửi đánh giá nhân viên
    submitStaff: async (ratingData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.RATING_STAFF, ratingData);
    }
  },

  // Complaint Management
  complaints: {
    // Gửi khiếu nại
    submit: async (complaintData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.COMPLAINT, complaintData);
    }
  },


};

export default renterService;