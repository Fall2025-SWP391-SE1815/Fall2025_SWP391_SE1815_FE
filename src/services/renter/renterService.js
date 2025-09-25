// Renter Service - API calls for renter-specific functionality
import apiClient from '@/lib/api/apiClient.js';

export const renterService = {
  // Document Management
  documents: {
    // Upload tài liệu (ảnh CCCD, GPLX...)
    upload: async (formData) => {
      return await apiClient.post('/renter/documents', formData);
    },
    
    // Xem danh sách tài liệu đã upload
    getAll: async (userId) => {
      return await apiClient.get('/renter/documents', { params: { userId } });
    },
    
    // Xoá tài liệu
    delete: async (documentId) => {
      return await apiClient.delete(`/renter/documents/${documentId}`);
    }
  },

  // Station Management
  stations: {
    // Xem danh sách trạm + vị trí
    getAll: async (params = {}) => {
      return await apiClient.get('/renter/stations', { params });
    }
  },

  // Vehicle Management
  vehicles: {
    // Xem danh sách xe đang có sẵn (lọc theo loại, trạm, giá)
    getAvailable: async (params = {}) => {
      return await apiClient.get('/renter/vehicles', { params });
    }
  },

  // Reservation Management
  reservations: {
    // Đặt trước xe
    create: async (reservationData) => {
      return await apiClient.post('/renter/reservations', reservationData);
    },
    
    // Xem danh sách booking của mình
    getAll: async (userId) => {
      return await apiClient.get('/renter/reservations', { params: { userId } });
    },
    
    // Chi tiết 1 booking
    getById: async (reservationId) => {
      return await apiClient.get(`/renter/reservations/${reservationId}`);
    },
    
    // Hủy booking
    cancel: async (reservationId) => {
      return await apiClient.delete(`/renter/reservations/${reservationId}`);
    }
  },

  // Rental Management
  rentals: {
    // Check-in nhận xe (theo booking hoặc walk-in)
    checkIn: async (checkInData) => {
      return await apiClient.post('/renter/rentals/checkin', checkInData);
    },
    
    // Xem lượt thuê đang hoạt động
    getCurrent: async (userId) => {
      return await apiClient.get('/renter/rentals/current', { params: { userId } });
    },
    
    // Xem biên bản giao xe (ảnh, tình trạng)
    getChecks: async (rentalId) => {
      return await apiClient.get(`/renter/rentals/${rentalId}/checks`);
    },
    
    // Trả xe tại trạm
    returnVehicle: async (rentalId, returnData) => {
      return await apiClient.post(`/renter/rentals/${rentalId}/return`, returnData);
    },
    
    // Thanh toán chi phí phát sinh (tiền thuê, phụ phí, vi phạm)
    processPayment: async (rentalId, paymentData) => {
      return await apiClient.post(`/renter/rentals/${rentalId}/payment`, paymentData);
    },
    
    // Xem tóm tắt lượt thuê (thời gian, chi phí, quãng đường, tình trạng xe)
    getSummary: async (rentalId) => {
      return await apiClient.get(`/renter/rentals/${rentalId}/summary`);
    },
    
    // Xem lịch sử thuê xe
    getHistory: async (userId, params = {}) => {
      return await apiClient.get('/renter/rentals', { params: { userId, ...params } });
    },
    
    // Chi tiết lượt thuê cụ thể
    getById: async (rentalId) => {
      return await apiClient.get(`/renter/rentals/${rentalId}`);
    }
  },

  // Payment Management
  payments: {
    // Danh sách giao dịch thanh toán
    getAll: async (userId, params = {}) => {
      return await apiClient.get('/renter/payments', { params: { userId, ...params } });
    },
    
    // Chi tiết 1 giao dịch
    getById: async (paymentId) => {
      return await apiClient.get(`/renter/payments/${paymentId}`);
    }
  },

  // Rating Management
  ratings: {
    // Gửi đánh giá dịch vụ (xe, trải nghiệm)
    submit: async (ratingData) => {
      return await apiClient.post('/renter/ratings', ratingData);
    },
    
    // Xem đánh giá đã gửi
    getAll: async (userId) => {
      return await apiClient.get('/renter/ratings', { params: { userId } });
    }
  },

  // Staff Rating Management
  staffRatings: {
    // Gửi đánh giá nhân viên giao/nhận
    submit: async (ratingData) => {
      return await apiClient.post('/renter/staff-ratings', ratingData);
    },
    
    // Xem đánh giá nhân viên đã gửi
    getAll: async (userId) => {
      return await apiClient.get('/renter/staff-ratings', { params: { userId } });
    }
  },

  // Complaint Management
  complaints: {
    // Gửi khiếu nại
    submit: async (complaintData) => {
      return await apiClient.post('/renter/complaints', complaintData);
    },
    
    // Xem danh sách khiếu nại mình đã gửi
    getAll: async (userId) => {
      return await apiClient.get('/renter/complaints', { params: { userId } });
    },
    
    // Chi tiết khiếu nại
    getById: async (complaintId) => {
      return await apiClient.get(`/renter/complaints/${complaintId}`);
    }
  },

  // Incident Management
  incidents: {
    // Gửi báo cáo sự cố về xe trong lúc thuê
    report: async (incidentData) => {
      return await apiClient.post('/renter/incidents', incidentData);
    },
    
    // Xem các báo cáo sự cố
    getAll: async (userId) => {
      return await apiClient.get('/renter/incidents', { params: { userId } });
    }
  },

};

export default renterService;