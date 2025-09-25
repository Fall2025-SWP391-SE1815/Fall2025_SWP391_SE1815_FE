// API Client - Unified interface that switches between mock and real APIs
import axios from 'axios';
import { API_CONFIG, getApiUrl, HTTP_METHODS, STATUS_CODES } from './apiConfig.js';
import { ResponseTransformer } from './responseTransformer.js';
import { ApiErrorHandler } from './errorHandler.js';

// Import all mock services
import { authService } from '../../services/auth/authService.js';
import { userService } from '../../services/users/userService.js';
import { stationService } from '../../services/stations/stationService.js';
import { vehicleService } from '../../services/vehicles/vehicleService.js';
import { reservationService } from '../../services/reservations/reservationService.js';
import { rentalService } from '../../services/rentals/rentalService.js';
import { paymentService } from '../../services/payments/paymentService.js';
import { documentService } from '../../services/documents/documentService.js';
import { staffStationService } from '../../services/staffStations/staffStationService.js';
import { rentalCheckService } from '../../services/rentalChecks/rentalCheckService.js';
import { violationService } from '../../services/violations/violationService.js';
import { ratingService } from '../../services/ratings/ratingService.js';
import { staffRatingService } from '../../services/staffRatings/staffRatingService.js';
import { complaintService } from '../../services/complaints/complaintService.js';
import { incidentReportService } from '../../services/incidentReports/incidentReportService.js';
import { statisticsService } from '../../services/statistics/statisticsService.js';

// Configure axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await apiClient.auth.refreshToken(refreshToken);
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } else {
          // No refresh token available, clear storage and redirect
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to make API calls
const makeRequest = async (method, endpoint, data = null, params = null) => {
  if (API_CONFIG.USE_MOCK) {
    // Route to appropriate mock service based on endpoint
    return routeMockRequest(method, endpoint, data, params);
  }
  
  try {
    // Make real API call
    const config = {
      method,
      url: endpoint,
      ...(data && { data }),
      ...(params && { params })
    };
    
    const response = await axiosInstance(config);
    
    // Transform real API response to match mock format
    return ResponseTransformer.transformToMockFormat(response.data, method);
  } catch (error) {
    // Handle and transform error using enhanced error handler
    const handledError = ApiErrorHandler.handleError(error);
    const customError = new Error(handledError.message);
    customError.response = { data: handledError };
    throw customError;
  }
};

// Route mock requests to appropriate service
const routeMockRequest = async (method, endpoint, data, params) => {
  // Add artificial delay to simulate network
  await new Promise(resolve => setTimeout(resolve, API_CONFIG.MOCK_DELAY));
  
  // Parse endpoint to determine which service to use
  const pathParts = endpoint.split('/').filter(part => part);
  const [scope, resource] = pathParts;
  
  try {
    switch (scope) {
      case 'auth':
        return handleAuthRequests(method, resource, data, params);
      case 'renter':
        return handleRenterRequests(method, resource, pathParts, data, params);
      case 'staff':
        return handleStaffRequests(method, resource, pathParts, data, params);
      case 'admin':
        return handleAdminRequests(method, resource, pathParts, data, params);
      default:
        throw new Error(`Unknown API scope: ${scope}`);
    }
  } catch (error) {
    throw {
      response: {
        status: error.statusCode || 500,
        data: {
          success: false,
          message: error.message || 'Internal server error'
        }
      }
    };
  }
};

// Auth request handler
const handleAuthRequests = async (method, resource, data, params) => {
  switch (resource) {
    case 'login':
      return authService.login(data.email, data.password);
    case 'register':
      return authService.register(data);
    case 'refresh-token':
      return authService.refreshToken(data.refreshToken);
    default:
      throw new Error(`Unknown auth endpoint: ${resource}`);
  }
};

// Renter request handler
const handleRenterRequests = async (method, resource, pathParts, data, params) => {
  const id = pathParts[2]; // For endpoints like /renter/documents/:id
  
  // Extract actual params if they're nested under 'params' key
  const actualParams = params?.params || params || {};
  
  switch (resource) {
    case 'documents':
      if (method === 'GET' && id) return documentService.getById(id);
      if (method === 'GET') return documentService.renter.getDocuments();
      if (method === 'POST') return documentService.renter.uploadDocument(data);
      if (method === 'DELETE' && id) return documentService.renter.deleteDocument(id);
      break;
      
    case 'stations':
      if (method === 'GET') return stationService.renter.getStations();
      break;
      
    case 'vehicles':
      if (method === 'GET') return vehicleService.renter.getAvailableVehicles(actualParams);
      break;
      
    case 'reservations':
      if (method === 'GET' && id) return reservationService.renter.getReservationById(id);
      if (method === 'GET') return reservationService.renter.getReservations();
      if (method === 'POST') return reservationService.renter.createReservation(data);
      if (method === 'DELETE' && id) return reservationService.renter.cancelReservation(id);
      break;
      
    case 'rentals':
      const action = pathParts[3]; // For endpoints like /renter/rentals/:id/return
      if (action === 'checkin' && method === 'POST') return rentalService.renter.checkin(data);
      if (action === 'current' && method === 'GET') return rentalService.renter.getCurrent();
      if (id && action === 'checks' && method === 'GET') return rentalService.renter.getChecks(id);
      if (id && action === 'return' && method === 'POST') return rentalService.renter.returnVehicle(id, data);
      if (id && action === 'payment' && method === 'POST') return rentalService.renter.processPayment(id, data);
      if (id && action === 'summary' && method === 'GET') return rentalService.renter.getSummary(id);
      if (method === 'GET' && id) return rentalService.renter.getRentalById(id);
      if (method === 'GET') return rentalService.renter.getRentals();
      break;
      
    case 'payments':
      if (method === 'GET' && id) return paymentService.renter.getPaymentById(id);
      if (method === 'GET') return paymentService.renter.getPayments();
      break;
      
    case 'ratings':
      if (method === 'POST') return ratingService.renter.submitRating(data);
      break;
      
    case 'staff-ratings':
      if (method === 'POST') return staffRatingService.renter.submitStaffRating(data);
      break;
      
    case 'complaints':
      if (method === 'GET' && id) return complaintService.renter.getComplaintById(id);
      if (method === 'GET') return complaintService.renter.getComplaints();
      if (method === 'POST') return complaintService.renter.submitComplaint(data);
      break;
      
    case 'incidents':
      if (method === 'GET') return incidentReportService.renter.getIncidents();
      if (method === 'POST') return incidentReportService.renter.submitIncident(data);
      break;
  }
  
  throw new Error(`Unknown renter endpoint: ${resource}`);
};

// Staff request handler
const handleStaffRequests = async (method, resource, pathParts, data, params) => {
  const id = pathParts[2];
  const action = pathParts[3];
  
  switch (resource) {
    case 'rentals':
      if (action === 'pending' && method === 'GET') return rentalService.staff.getPendingRentals();
      if (action === 'returning' && method === 'GET') return rentalService.staff.getReturningRentals();
      if (action === 'current' && method === 'GET') return rentalService.staff.getCurrentRentals();
      if (id && action === 'pickup-check' && method === 'POST') return rentalService.staff.createPickupCheck(id, data);
      if (id && action === 'return-check' && method === 'POST') return rentalService.staff.createReturnCheck(id, data);
      if (id && action === 'confirm-pickup' && method === 'POST') return rentalService.staff.confirmPickup(id);
      if (id && action === 'confirm-return' && method === 'POST') return rentalService.staff.confirmReturn(id);
      if (id && action === 'payment' && method === 'POST') return paymentService.staff.recordPayment(id, data);
      if (id && action === 'payment' && method === 'GET') return paymentService.getByRental(id);
      break;
      
    case 'renters':
      if (id && action === 'verify-documents' && method === 'POST') return documentService.staff.verifyDocument(id, data);
      if (id && action === 'documents' && method === 'GET') return documentService.staff.getCustomerDocuments(id);
      break;
      
    case 'payments':
      if (action === 'pending' && method === 'GET') return paymentService.staff.getPendingPayments();
      break;
      
    case 'stations':
      if (id && action === 'vehicles' && method === 'GET') return vehicleService.staff.getStationVehicles(id);
      break;
      
    case 'vehicles':
      if (id && action === 'status' && method === 'PUT') return vehicleService.staff.updateVehicleStatus(id, data);
      break;
      
    case 'violations':
      if (method === 'GET') return violationService.getAll(params);
      if (method === 'POST') return violationService.staff.recordViolation(data);
      break;
      
    case 'incidents':
      if (method === 'GET') return incidentReportService.getAll(params);
      if (method === 'POST') return incidentReportService.staff.reportIncident(data);
      break;
  }
  
  throw new Error(`Unknown staff endpoint: ${resource}`);
};

// Admin request handler
const handleAdminRequests = async (method, resource, pathParts, data, params) => {
  const id = pathParts[2];
  const action = pathParts[3];
  
  switch (resource) {
    case 'stations':
      if (method === 'GET' && id) return stationService.admin.getStationById(id);
      if (method === 'GET') return stationService.admin.getStations();
      if (method === 'POST') return stationService.admin.createStation(data);
      if (method === 'PUT') return stationService.admin.updateStation(id, data);
      if (method === 'DELETE') return stationService.admin.deleteStation(id);
      break;
      
    case 'vehicles':
      if (action === 'status' && method === 'GET') return vehicleService.admin.getVehicleStats();
      if (method === 'GET' && id) return vehicleService.admin.getVehicleById(id);
      if (method === 'GET') return vehicleService.admin.getVehicles(params);
      if (method === 'POST') return vehicleService.admin.createVehicle(data);
      if (method === 'PUT') return vehicleService.admin.updateVehicle(id, data);
      if (method === 'DELETE') return vehicleService.admin.deleteVehicle(id);
      break;
      
    case 'users':
      if (method === 'GET' && id) return userService.admin.getUserById(id);
      if (method === 'GET') return userService.admin.getUsers(params);
      if (method === 'POST') return userService.admin.createUser(data);
      if (method === 'PUT') return userService.admin.updateUser(id, data);
      if (method === 'DELETE') return userService.admin.deleteUser(id);
      break;
      
    case 'staff-stations':
      if (id && action === 'deactivate' && method === 'PUT') return staffStationService.admin.deactivateAssignment(id);
      if (method === 'GET') return staffStationService.admin.getAssignments(params);
      if (method === 'POST') return staffStationService.admin.createAssignment(data);
      break;
      
    case 'rentals':
      if (method === 'GET' && id) return rentalService.admin.getRentalById(id);
      if (method === 'GET') return rentalService.admin.getRentals(params);
      break;
      
    case 'payments':
      if (action === 'stats' && method === 'GET') return paymentService.admin.getPaymentStats();
      if (method === 'GET') return paymentService.admin.getPayments(params);
      break;
      
    case 'violations':
      if (method === 'GET') return violationService.admin.getViolations(params);
      break;
      
    case 'incidents':
      if (method === 'GET' && id) return incidentReportService.admin.getIncidentById(id);
      if (method === 'GET') return incidentReportService.admin.getIncidents(params);
      if (method === 'PUT') return incidentReportService.admin.updateIncident(id, data);
      break;
      
    case 'renters':
      if (id && action === 'history' && method === 'GET') return rentalService.admin.getRenterHistory(id);
      if (id && action === 'violations' && method === 'GET') return violationService.admin.getRenterViolations(id);
      if (id && action === 'incidents' && method === 'GET') return incidentReportService.admin.getRenterIncidents(id);
      if (method === 'GET') return userService.admin.getRenters(params);
      break;
      
    case 'complaints':
      if (method === 'GET' && id) return complaintService.admin.getComplaintById(id);
      if (method === 'GET') return complaintService.admin.getComplaints(params);
      if (method === 'PUT') return complaintService.admin.updateComplaint(id, data);
      break;
      
    case 'dashboard':
      if (method === 'GET') return statisticsService.admin.getDashboard(params);
      break;
      
    case 'statistics':
      if (action === 'rentals' && method === 'GET') return statisticsService.admin.getRentalStatistics(params);
      if (action === 'revenue' && method === 'GET') return statisticsService.admin.getRevenueStatistics(params);
      if (action === 'complaints' && method === 'GET') return statisticsService.admin.getComplaintStatistics(params);
      break;
      
    case 'dashboard':
      if (method === 'GET') return getDashboardData();
      break;
      
    case 'statistics':
      if (action === 'rentals' && method === 'GET') return rentalService.getStats(params);
      if (action === 'revenue' && method === 'GET') return paymentService.getStats(params);
      if (action === 'complaints' && method === 'GET') return complaintService.getStats(params);
      break;
  }
  
  throw new Error(`Unknown admin endpoint: ${resource}`);
};

// Dashboard data aggregation
const getDashboardData = async () => {
  const [rentalStats, paymentStats, complaintStats, vehicleStats] = await Promise.all([
    rentalService.getStats(),
    paymentService.getStats(),
    complaintService.getStats(),
    vehicleService.getStats()
  ]);
  
  return {
    success: true,
    data: {
      rentals: rentalStats.data,
      payments: paymentStats.data,
      complaints: complaintStats.data,
      vehicles: vehicleStats.data
    }
  };
};

// Public API client interface
export const apiClient = {
  // Authentication
  auth: {
    login: (email, password) => makeRequest('POST', '/auth/login', { email, password }),
    register: (userData) => makeRequest('POST', '/auth/register', userData),
    refreshToken: (refreshToken) => makeRequest('POST', '/auth/refresh-token', { refreshToken })
  },
  
  // Generic HTTP methods
  get: (endpoint, params) => makeRequest('GET', endpoint, null, params),
  post: (endpoint, data) => makeRequest('POST', endpoint, data),
  put: (endpoint, data) => makeRequest('PUT', endpoint, data),
  patch: (endpoint, data) => makeRequest('PATCH', endpoint, data),
  delete: (endpoint) => makeRequest('DELETE', endpoint),
  
  // Helper to switch between mock and real API
  setMockMode: (useMock) => {
    API_CONFIG.USE_MOCK = useMock;
  },
  
  // Get current mode
  isMockMode: () => API_CONFIG.USE_MOCK
};

export default apiClient;