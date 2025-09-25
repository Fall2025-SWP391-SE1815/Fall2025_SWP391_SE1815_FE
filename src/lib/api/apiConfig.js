// API Configuration - Central place to manage all endpoints
// This makes it easy to switch between mock API and real Swagger API

// Environment configuration
export const API_CONFIG = {
  USE_MOCK: import.meta.env.VITE_USE_MOCK_API === 'true', 
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5174/api',
  MOCK_DELAY: parseInt(import.meta.env.VITE_MOCK_DELAY) || 500,
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000
};

// API Endpoints mapping based on the provided list
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token'
  },

  // Renter endpoints
  RENTER: {
    // Document management
    DOCUMENTS: '/renter/documents',
    DOCUMENT_BY_ID: (id) => `/renter/documents/${id}`,
    
    // Station and vehicle discovery
    STATIONS: '/renter/stations',
    VEHICLES: '/renter/vehicles',
    
    // Reservations
    RESERVATIONS: '/renter/reservations',
    RESERVATION_BY_ID: (id) => `/renter/reservations/${id}`,
    
    // Rentals
    RENTALS: '/renter/rentals',
    RENTAL_BY_ID: (id) => `/renter/rentals/${id}`,
    RENTAL_CHECKIN: '/renter/rentals/checkin',
    RENTAL_CURRENT: '/renter/rentals/current',
    RENTAL_CHECKS: (id) => `/renter/rentals/${id}/checks`,
    RENTAL_RETURN: (id) => `/renter/rentals/${id}/return`,
    RENTAL_PAYMENT: (id) => `/renter/rentals/${id}/payment`,
    RENTAL_SUMMARY: (id) => `/renter/rentals/${id}/summary`,
    
    // Payments
    PAYMENTS: '/renter/payments',
    PAYMENT_BY_ID: (id) => `/renter/payments/${id}`,
    
    // Ratings and feedback
    RATINGS: '/renter/ratings',
    STAFF_RATINGS: '/renter/staff-ratings',
    
    // Support
    COMPLAINTS: '/renter/complaints',
    COMPLAINT_BY_ID: (id) => `/renter/complaints/${id}`,
    INCIDENTS: '/renter/incidents'
  },

  // Staff endpoints
  STAFF: {
    // Rental management
    RENTALS_PENDING: '/staff/rentals/pending',
    RENTALS_RETURNING: '/staff/rentals/returning',
    RENTALS_CURRENT: '/staff/rentals/current',
    RENTAL_PICKUP_CHECK: (id) => `/staff/rentals/${id}/pickup-check`,
    RENTAL_RETURN_CHECK: (id) => `/staff/rentals/${id}/return-check`,
    RENTAL_CONFIRM_PICKUP: (id) => `/staff/rentals/${id}/confirm-pickup`,
    RENTAL_CONFIRM_RETURN: (id) => `/staff/rentals/${id}/confirm-return`,
    RENTAL_PAYMENT: (id) => `/staff/rentals/${id}/payment`,
    
    // Document verification
    VERIFY_DOCUMENTS: (id) => `/staff/renters/${id}/verify-documents`,
    RENTER_DOCUMENTS: (id) => `/staff/renters/${id}/documents`,
    
    // Payment management
    PAYMENTS_PENDING: '/staff/payments/pending',
    
    // Station and vehicle management
    STATION_VEHICLES: (id) => `/staff/stations/${id}/vehicles`,
    VEHICLE_STATUS: (id) => `/staff/vehicles/${id}/status`,
    
    // Violations and incidents
    VIOLATIONS: '/staff/violations',
    INCIDENTS: '/staff/incidents'
  },

  // Admin endpoints
  ADMIN: {
    // Station management
    STATIONS: '/admin/stations',
    STATION_BY_ID: (id) => `/admin/stations/${id}`,
    
    // Vehicle management
    VEHICLES: '/admin/vehicles',
    VEHICLE_BY_ID: (id) => `/admin/vehicles/${id}`,
    VEHICLES_STATUS: '/admin/vehicles/status',
    
    // User management
    USERS: '/admin/users',
    USER_BY_ID: (id) => `/admin/users/${id}`,
    
    // Staff station assignments
    STAFF_STATIONS: '/admin/staff-stations',
    STAFF_STATION_DEACTIVATE: (id) => `/admin/staff-stations/${id}/deactivate`,
    
    // Rental oversight
    RENTALS: '/admin/rentals',
    RENTAL_BY_ID: (id) => `/admin/rentals/${id}`,
    
    // Payment management
    PAYMENTS: '/admin/payments',
    PAYMENTS_STATS: '/admin/payments/stats',
    
    // Violations and incidents
    VIOLATIONS: '/admin/violations',
    INCIDENTS: '/admin/incidents',
    INCIDENT_BY_ID: (id) => `/admin/incidents/${id}`,
    
    // Renter management
    RENTERS: '/admin/renters',
    RENTER_HISTORY: (id) => `/admin/renters/${id}/history`,
    RENTER_VIOLATIONS: (id) => `/admin/renters/${id}/violations`,
    RENTER_INCIDENTS: (id) => `/admin/renters/${id}/incidents`,
    
    // Complaint management
    COMPLAINTS: '/admin/complaints',
    COMPLAINT_BY_ID: (id) => `/admin/complaints/${id}`,
    
    // Dashboard and analytics
    DASHBOARD: '/admin/dashboard',
    STATS_RENTALS: '/admin/statistics/rentals',
    STATS_REVENUE: '/admin/statistics/revenue',
    STATS_COMPLAINTS: '/admin/statistics/complaints'
  }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  if (API_CONFIG.USE_MOCK) {
    // For mock APIs, we don't need the base URL since they're local functions
    return endpoint;
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`;
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