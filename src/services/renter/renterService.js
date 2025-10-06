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
    // Check-in nhận xe (theo booking hoặc walk-in)
    checkIn: async (checkInData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.RENTAL_CHECKIN, checkInData);
    },
    
    // Xem lượt thuê đang hoạt động
    getCurrent: async (userId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.RENTAL_CURRENT, { userId });
    },
    
    // Xem biên bản giao xe (ảnh, tình trạng)
    getChecks: async (rentalId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.RENTAL_CHECKS(rentalId));
    },
    
    // Trả xe tại trạm
    returnVehicle: async (rentalId, returnData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.RENTAL_RETURN(rentalId), returnData);
    },
    
    // Thanh toán chi phí phát sinh (tiền thuê, phụ phí, vi phạm)
    processPayment: async (rentalId, paymentData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.RENTAL_PAYMENT(rentalId), paymentData);
    },
    
    // Xem tóm tắt lượt thuê (thời gian, chi phí, quãng đường, tình trạng xe)
    getSummary: async (rentalId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.RENTAL_SUMMARY(rentalId));
    },
    
    // Xem lịch sử thuê xe
    getHistory: async (userId, params = {}) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.RENTALS, { userId, ...params });
    },
    
    // Chi tiết lượt thuê cụ thể
    getById: async (rentalId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.RENTAL_BY_ID(rentalId));
    }
  },

  // Payment Management
  payments: {
    // Danh sách giao dịch thanh toán
    getAll: async (userId, params = {}) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.PAYMENTS, { userId, ...params });
    },
    
    // Chi tiết 1 giao dịch
    getById: async (paymentId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.PAYMENT_BY_ID(paymentId));
    }
  },

  // Rating Management
  ratings: {
    // Gửi đánh giá dịch vụ (xe, trải nghiệm)
    submit: async (ratingData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.RATINGS, ratingData);
    },
    
    // Xem đánh giá đã gửi
    getAll: async (userId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.RATINGS, { userId });
    }
  },

  // Staff Rating Management
  staffRatings: {
    // Gửi đánh giá nhân viên giao/nhận
    submit: async (ratingData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.STAFF_RATINGS, ratingData);
    },
    
    // Xem đánh giá nhân viên đã gửi
    getAll: async (userId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.STAFF_RATINGS, { userId });
    }
  },

  // Complaint Management
  complaints: {
    // Gửi khiếu nại
    submit: async (complaintData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.COMPLAINTS, complaintData);
    },
    
    // Xem danh sách khiếu nại mình đã gửi
    getAll: async (userId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.COMPLAINTS, { userId });
    },
    
    // Chi tiết khiếu nại
    getById: async (complaintId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.COMPLAINT_BY_ID(complaintId));
    }
  },

  // Incident Management
  incidents: {
    // Gửi báo cáo sự cố về xe trong lúc thuê
    report: async (incidentData) => {
      return await apiClient.post(API_ENDPOINTS.RENTER.INCIDENTS, incidentData);
    },
    
    // Xem các báo cáo sự cố
    getAll: async (userId) => {
      return await apiClient.get(API_ENDPOINTS.RENTER.INCIDENTS, { userId });
    }
  },

};

export default renterService;