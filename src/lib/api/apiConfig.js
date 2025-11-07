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
    LOGOUT: '/api/auth/sign-out'
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
    RENTALS_ALL: '/api/renter/rentals/all',
    RENTAL_CHECKS: (id) => `/api/renter/rentals/${id}/checks`,
    RENTAL_CONFIRM: (id) => `/api/renter/rentals/${id}/confirm`,

    // Ratings and feedback
    RATING_TRIP: '/api/renter/rating/trip',
    RATING_STAFF: '/api/renter/rating/staff',

    // Support
    COMPLAINT: '/api/renter/complaint',
    COMPLAINT_BY_ID: (id) => `/api/renter/complaint/${id}`
  },

  // Staff endpoints
  STAFF: {
    // Vehicle management
    VEHICLES: '/api/staff/vehicle',
    VEHICLE_BY_ID: (id) => `/api/staff/vehicle/${id}`,

    // Document verification
    RENTER_DOCUMENTS_BY_STAFF: (renterId) => `/api/staff/renter-document/${renterId}`,
    RENTER_DOCUMENT_VERIFY: (documentId) => `/api/staff/renter-document/verify/${documentId}`,

    // Rental management
    RENTALS: '/api/staff/rentals',
    RENTAL_PAYMENT: (id) => `/api/staff/rentals/${id}/payment`,
    RENTAL_BILL: (id) => `/api/staff/rentals/${id}/bill`,
    RENTAL_RETURN_DEPOSIT: (id) => `/api/staff/rentals/${id}/return-deposit`,
    RENTAL_HOLD_DEPOSIT: (id) => `/api/staff/rentals/${id}/hold-deposit`,
    RENTAL_CANCEL: (id) => `/api/staff/rentals/${id}/cancel`,
    RENTAL_CONFIRM_RETURN: '/api/staff/rentals/confirm-return',
    RENTAL_CONFIRM_PICKUP: '/api/staff/rentals/confirm-pickup',
    RENTAL_CHECK_IN: '/api/staff/rentals/check-in',
    RENTAL_ADD_VIOLATION: '/api/staff/rentals/add-violation',
    RENTAL_VIOLATIONS: (id) => `/api/staff/rentals/${id}/violations`,
    RESERVATIONS: '/api/staff/rentals/reservations',

    // Incident reporting
    INCIDENT_REPORT: '/api/staff/incident-report'
  },

  // Admin endpoints
  ADMIN: {
    // Vehicle management
    VEHICLES: '/api/admin/vehicles',
    VEHICLE_BY_ID: (id) => `/api/admin/vehicles/${id}`,
    VEHICLES_STATUS: '/api/admin/vehicles/status',

    // Station management
    STATIONS: '/api/admin/stations',
    STATION_BY_ID: (id) => `/api/admin/stations/${id}`,

    // User management
    USERS: '/api/admin/users',
    USER_BY_ID: (id) => `/api/admin/users/${id}`,
    USER_PROFILE: (id) => `/api/admin/users/profile/${id}`,

    // Staff station assignments
    STAFF_STATIONS: '/api/admin/staff-stations',
    STAFF_STATION_DEACTIVATE: (id) => `/api/admin/staff-stations/${id}/deactivate`,

    // Rental management
    RENTALS: '/api/admin/rental',

    // Complaint management
    COMPLAINTS: '/api/admin/complaint',
    COMPLAINT_RESOLVE: '/api/admin/complaint/resolve',

    // Violation management
    VIOLATIONS: '/api/admin/violation',

    // Performance management
    PERFORMANCE: '/api/admin/performance'
  },
  
  // Public endpoints (no authentication required)
  PUBLIC: {
    STATIONS: '/api/public/stations',
    VEHICLES: '/api/public/vehicles'
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