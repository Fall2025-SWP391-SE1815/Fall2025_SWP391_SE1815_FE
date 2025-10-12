// API Configuration - Central place to manage all endpoints
// This makes it easy to switch between mock API and real Swagger API

// Environment configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API Endpoints mapping based on the provided list
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    // Swagger backend uses /api/auth/* paths (see backend swagger UI)
    LOGIN: '/api/auth/sign-in',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/sign-out',
    REFRESH_TOKEN: '/api/auth/refresh-token'
  },

  // Renter endpoints
  RENTER: {
    // Document management
    DOCUMENTS: '/api/renter/documents',
    DOCUMENT_BY_ID: (id) => `/api/renter/documents/${id}`,
    
    // Station and vehicle discovery  
    STATIONS: '/api/renter/booking/stations',
    VEHICLES: '/api/renter/booking/vehicles',
    
    // Booking/Reservations
    RESERVATIONS: '/api/renter/booking/reservations',
    RESERVATION_BY_ID: (id) => `/api/renter/booking/reservations/${id}`,
    RESERVATION_CANCEL: (id) => `/api/renter/booking/reservations/${id}/cancel`,
    
    // Rentals
    RENTALS: '/api/renter/rentals',
    RENTAL_BY_ID: (id) => `/api/renter/rentals/${id}`,
    RENTAL_CHECKIN: '/api/renter/rentals/checkin',
    RENTAL_CURRENT: '/api/renter/rentals/current',
    RENTAL_CHECKS: (id) => `/api/renter/rentals/${id}/checks`,
    RENTAL_RETURN: (id) => `/api/renter/rentals/${id}/return`,
    RENTAL_PAYMENT: (id) => `/api/renter/rentals/${id}/payment`,
    RENTAL_SUMMARY: (id) => `/api/renter/rentals/${id}/summary`,
    
    // Payments
    PAYMENTS: '/api/renter/payments',
    PAYMENT_BY_ID: (id) => `/api/renter/payments/${id}`,
    
    // Ratings and feedback
    RATING_TRIP: '/api/renter/rating/trip',
    RATING_STAFF: '/api/renter/rating/staff',
    
    // Support
    COMPLAINT: '/api/renter/complaint',
    INCIDENTS: '/api/renter/incidents'
  },

  // Staff endpoints
  STAFF: {
    // Rental management
    RENTALS_PENDING: '/api/staff/rentals/pending',
    RENTALS_RETURNING: '/api/staff/rentals/returning',
    RENTALS_CURRENT: '/api/staff/rentals/current',
    RENTALS: '/api/staff/rentals',
    RESERVATIONS: '/api/staff/rentals/reservations',
    
    RENTAL_PICKUP_CHECK: (id) => `/api/staff/rentals/${id}/pickup-check`,
    RENTAL_RETURN_CHECK: (id) => `/api/staff/rentals/${id}/return-check`,
    RENTAL_CONFIRM_PICKUP: '/api/staff/rentals/confirm-pickup',
    RENTAL_CONFIRM_RETURN: '/api/staff/rentals/confirm-return',
    RENTAL_PAYMENT: (id) => `/api/staff/rentals/${id}/payment`,
    RENTAL_BILL: (id) => `/api/staff/rentals/${id}/bill`,
    RENTAL_RETURN_DEPOSIT: (id) => `/api/staff/rentals/${id}/return-deposit`,
    RENTAL_HOLD_DEPOSIT: (id) => `/api/staff/rentals/${id}/hold-deposit`,
    RENTAL_CANCEL: (id) => `/api/staff/rentals/${id}/cancel`,
    RENTAL_CHECK_IN: '/api/staff/rentals/check-in',
    RENTAL_ADD_VIOLATION: '/api/staff/rentals/add-violation',
    RENTAL_VIOLATIONS: (id) => `/api/staff/rentals/${id}/violations`,
    
    // Document verification
    VERIFY_DOCUMENTS: (id) => `/api/staff/renters/${id}/verify-documents`,
    RENTER_DOCUMENTS: (id) => `/api/staff/renters/${id}/documents`,
    RENTER_DOCUMENTS_BY_STAFF: (renterId) => `/api/staff/renter-document/${renterId}`,
    RENTER_DOCUMENT_VERIFY: (documentId) => `/api/staff/renter-document/verify/${documentId}`,
    
    // Payment management
    PAYMENTS_PENDING: '/api/staff/payments/pending',
    
    // Station and vehicle management
    STATION_VEHICLES: (id) => `/api/staff/stations/${id}/vehicles`,
    VEHICLES: '/api/staff/vehicle',
    VEHICLE_BY_ID: (id) => `/api/staff/vehicles/${id}`,
    VEHICLE_STATUS: (id) => `/api/staff/vehicles/${id}/status`,
    
    // Violations and incidents
    VIOLATIONS: '/api/staff/violations',
    INCIDENTS: '/api/staff/incidents',
    INCIDENT_REPORT: '/api/staff/incident-report'
  },

  // Admin endpoints
  ADMIN: {
    // Station management
    STATIONS: '/api/admin/stations',
    STATION_BY_ID: (id) => `/api/admin/stations/${id}`,
    
    // Vehicle management
    VEHICLES: '/api/admin/vehicles',
    VEHICLE_BY_ID: (id) => `/api/admin/vehicles/${id}`,
    VEHICLES_STATUS: '/api/admin/vehicles/status',
    
    // User management
    USERS: '/api/admin/users',
    USER_BY_ID: (id) => `/api/admin/users/${id}`,
    USER_PROFILE: (id) => `/api/admin/users/profile/${id}`,
    
    // Staff station assignments
    STAFF_STATIONS: '/api/admin/staff-stations',
    STAFF_STATION_DEACTIVATE: (id) => `/api/admin/staff-stations/${id}/deactivate`,
    
    // Rental oversight
    RENTALS: '/api/admin/rentals',
    RENTAL_BY_ID: (id) => `/api/admin/rentals/${id}`,
    
    // Payment management
    PAYMENTS: '/api/admin/payments',
    PAYMENTS_STATS: '/api/admin/payments/stats',
    
    // Violations and incidents
    VIOLATIONS: '/api/admin/violations',
    INCIDENTS: '/api/admin/incidents',
    INCIDENT_BY_ID: (id) => `/api/admin/incidents/${id}`,
    
    // Renter management
    RENTERS: '/api/admin/renters',
    RENTER_HISTORY: (id) => `/api/admin/renters/${id}/history`,
    RENTER_VIOLATIONS: (id) => `/api/admin/renters/${id}/violations`,
    RENTER_INCIDENTS: (id) => `/api/admin/renters/${id}/incidents`,
    
    // Complaint management
    COMPLAINTS: '/api/admin/complaints',
    COMPLAINT_BY_ID: (id) => `/api/admin/complaints/${id}`,
    COMPLAINT_RESOLVE: '/api/admin/complaint/resolve',
    
    // Dashboard and analytics
    DASHBOARD: '/api/admin/dashboard',
    STATS_RENTALS: '/api/admin/statistics/rentals',
    STATS_REVENUE: '/api/admin/statistics/revenue',
    STATS_COMPLAINTS: '/api/admin/statistics/complaints'
  }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  // If endpoint already starts with 'http', assume absolute
  if (endpoint.startsWith('http')) return endpoint;
  return `${API_BASE_URL.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Helper function to build endpoint with parameters
export const buildEndpoint = (endpointFunction, ...params) => {
  if (typeof endpointFunction === 'function') {
    return endpointFunction(...params);
  }
  return endpointFunction;
};

// HTTP Methods mapping
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

// Response status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Common request headers
export const HEADERS = {
  CONTENT_TYPE_JSON: 'application/json',
  AUTHORIZATION: 'Authorization'
};