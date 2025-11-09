// Renter Service - API calls for renter-specific functionality
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/apiClient.js';
import { API_ENDPOINTS } from '@/lib/api/apiConfig.js';

export const renterService = {
  // Document Management
  documents: {
    upload: async (file, metadata = {}) => {
      const formData = new FormData();
      formData.append('file', file);

      // Build URL with metadata as query string per Swagger (metadata passed as JSON string)
      const metadataQuery = metadata && Object.keys(metadata).length ? `?metadata=${encodeURIComponent(JSON.stringify(metadata))}` : '';
      return await apiPost(`${API_ENDPOINTS.RENTER.DOCUMENTS}${metadataQuery}`, formData, 'Không thể upload tài liệu');
    },
    
    // Xem danh sách tài liệu đã upload
    getAll: async (userId) => {
      const query = userId ? `?userId=${userId}` : '';
      return await apiGet(`${API_ENDPOINTS.RENTER.DOCUMENTS}${query}`, 'Không thể lấy danh sách tài liệu');
    },
    
    // Xoá tài liệu
    delete: async (documentId) => {
      return await apiDelete(API_ENDPOINTS.RENTER.DOCUMENT_BY_ID(documentId), 'Không thể xóa tài liệu');
    }
  },

  // Station Management
  stations: {
    // Xem danh sách trạm + vị trí
    getAll: async (params = {}) => {
      const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
      return await apiGet(`${API_ENDPOINTS.RENTER.STATIONS}${query}`, 'Không thể lấy danh sách trạm');
    }
  },

  // Vehicle Management
  vehicles: {
    // Xem danh sách xe đang có sẵn (lọc theo loại, trạm, giá)
    getAvailable: async (params = {}) => {
      const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
      return await apiGet(`${API_ENDPOINTS.RENTER.VEHICLES}${query}`, 'Không thể lấy danh sách xe');
    }
  },

  // Reservation Management
  reservations: {
    // Đặt trước xe
    create: async (reservationData) => {
      return await apiPost(API_ENDPOINTS.RENTER.RESERVATIONS, reservationData, 'Không thể tạo đặt chỗ');
    },
    
    // Xem danh sách booking của mình
    // Accepts either a userId (number/string) or a params object { status, vehicleId, startFrom, startTo, userId, ... }
    getAll: async (queryOrUserId) => {
      let query = '';
      if (queryOrUserId && (typeof queryOrUserId === 'string' || typeof queryOrUserId === 'number')) {
        query = `?userId=${queryOrUserId}`;
      } else if (queryOrUserId && Object.keys(queryOrUserId).length) {
        query = `?${new URLSearchParams(queryOrUserId).toString()}`;
      }
      return await apiGet(`${API_ENDPOINTS.RENTER.RESERVATIONS}${query}`, 'Không thể lấy danh sách đặt chỗ');
    },
    
    // Chi tiết 1 booking
    getById: async (reservationId) => {
      return await apiGet(API_ENDPOINTS.RENTER.RESERVATION_BY_ID(reservationId), 'Không thể lấy chi tiết đặt chỗ');
    },
    
    // Hủy booking
    cancel: async (reservationId, cancelReason) => {
      // PATCH /api/renter/reservations/{id}/cancel { cancelReason }
      const body = cancelReason ? { cancelReason } : {};
      try {
        return await apiPatch(API_ENDPOINTS.RENTER.RESERVATION_CANCEL(reservationId), body, 'Không thể hủy đặt chỗ');
      } catch (e) {
        // fallback legacy DELETE without body
        return await apiDelete(API_ENDPOINTS.RENTER.RESERVATION_BY_ID(reservationId), 'Không thể hủy đặt chỗ');
      }
    }
  },

  // Rental Management
  rentals: {
    // Lấy tất cả rental với filter (status, từ ngày, đến ngày)
    getAll: async (params = {}) => {
      const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
      return apiGet(`${API_ENDPOINTS.RENTER.RENTALS_ALL}${query}`, 'Không thể lấy danh sách chuyến đi');
    },
    
    // Xem biên bản giao/nhận xe
    getChecks: async (rentalId) => {
      return apiGet(API_ENDPOINTS.RENTER.RENTAL_CHECKS(rentalId), 'Không thể lấy biên bản giao/nhận xe');
    },

    // Xác nhận đã nhận xe
    confirmRental: async (rentalId) => {
      return apiPatch(API_ENDPOINTS.RENTER.RENTAL_CONFIRM(rentalId), {}, 'Không thể xác nhận nhận xe');
    }
  },

  // Rating Management
  ratings: {
    // Gửi đánh giá chuyến đi (xe, trải nghiệm)
    submitTrip: async (ratingData) => {
      return await apiPost(API_ENDPOINTS.RENTER.RATING_TRIP, ratingData, 'Không thể gửi đánh giá chuyến đi');
    },
    
    // Gửi đánh giá nhân viên
    submitStaff: async (ratingData) => {
      return await apiPost(API_ENDPOINTS.RENTER.RATING_STAFF, ratingData, 'Không thể gửi đánh giá nhân viên');
    }
  },

  // Complaint Management
  complaints: {
    // Gửi khiếu nại
    submit: async (complaintData) => {
      return await apiPost(API_ENDPOINTS.RENTER.COMPLAINT, complaintData, 'Không thể gửi khiếu nại');
    }
  },


};

export default renterService;