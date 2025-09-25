// Statistics Service API
import { mockData } from '../mockData.js';

// Helper functions
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to filter data by date range
const filterByDateRange = (data, startTime, endTime, dateField = 'created_at') => {
  if (!startTime && !endTime) return data;
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    const start = startTime ? new Date(startTime) : new Date(0);
    const end = endTime ? new Date(endTime) : new Date();
    
    return itemDate >= start && itemDate <= end;
  });
};

export const statisticsService = {
  // Admin namespace for statistics and dashboard
  admin: {
    // Get dashboard overview with system-wide statistics
    getDashboard: async (params = {}) => {
      await simulateDelay();
      
      // Admin authentication simulation
      const currentAdminId = 1; // Simulate current admin ID
      if (!currentAdminId) {
        return {
          status: 401,
          error: "Unauthorized",
          message: "Bạn không có quyền thực hiện thao tác này"
        };
      }
      
      const now = new Date();
      const startTime = params.startTime ? new Date(params.startTime) : new Date(now.getFullYear(), 0, 1); // Start of year
      const endTime = params.endTime ? new Date(params.endTime) : now;
      
      // Filter data by date range
      const filteredRentals = filterByDateRange(mockData.rentals, params.startTime, params.endTime);
      const filteredPayments = filterByDateRange(mockData.payments, params.startTime, params.endTime);
      
      // Calculate statistics
      const totalUsers = mockData.users.length;
      const totalRenters = mockData.users.filter(u => u.role === 'renter').length;
      const totalStaff = mockData.users.filter(u => u.role === 'staff').length;
      const totalStations = mockData.stations.length;
      const totalVehicles = mockData.vehicles.length;
      
      // Active rentals (confirmed, picked_up)
      const activeRentals = mockData.rentals.filter(r => 
        ['confirmed', 'picked_up', 'pending_pickup'].includes(r.status)
      ).length;
      
      // Calculate revenue from paid payments in date range
      const revenue = filteredPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      
      return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        total_users: totalUsers,
        total_renters: totalRenters,
        total_staff: totalStaff,
        total_stations: totalStations,
        total_vehicles: totalVehicles,
        active_rentals: activeRentals,
        revenue: revenue
      };
    },

    // Get rental statistics with date filtering
    getRentalStatistics: async (params = {}) => {
      await simulateDelay();
      
      // Admin authentication simulation
      const currentAdminId = 1; // Simulate current admin ID
      if (!currentAdminId) {
        return {
          status: 401,
          error: "Unauthorized",
          message: "Bạn không có quyền thực hiện thao tác này"
        };
      }
      
      const now = new Date();
      const startTime = params.startTime ? new Date(params.startTime) : new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
      const endTime = params.endTime ? new Date(params.endTime) : now;
      
      // Filter rentals by date range
      const filteredRentals = filterByDateRange(mockData.rentals, params.startTime, params.endTime);
      
      // Calculate rental statistics
      const totalRentals = filteredRentals.length;
      const completed = filteredRentals.filter(r => 
        ['completed', 'returned'].includes(r.status)
      ).length;
      const cancelled = filteredRentals.filter(r => r.status === 'cancelled').length;
      
      return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        total_rentals: totalRentals,
        completed: completed,
        cancelled: cancelled
      };
    },

    // Get revenue statistics with date filtering
    getRevenueStatistics: async (params = {}) => {
      await simulateDelay();
      
      // Admin authentication simulation
      const currentAdminId = 1; // Simulate current admin ID
      if (!currentAdminId) {
        return {
          status: 401,
          error: "Unauthorized",
          message: "Bạn không có quyền thực hiện thao tác này"
        };
      }
      
      const now = new Date();
      const startTime = params.startTime ? new Date(params.startTime) : new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
      const endTime = params.endTime ? new Date(params.endTime) : now;
      
      // Filter payments by date range
      const filteredPayments = filterByDateRange(mockData.payments, params.startTime, params.endTime);
      
      // Calculate revenue statistics
      const paidPayments = filteredPayments.filter(p => p.status === 'paid');
      const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
      const rentalsCount = paidPayments.length;
      
      return {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        total_revenue: totalRevenue,
        rentals_count: rentalsCount
      };
    },

    // Get complaint statistics with date filtering
    getComplaintStatistics: async (params = {}) => {
      await simulateDelay();
      
      // Admin authentication simulation
      const currentAdminId = 1; // Simulate current admin ID
      if (!currentAdminId) {
        return {
          status: 401,
          error: "Unauthorized",
          message: "Bạn không có quyền thực hiện thao tác này"
        };
      }
      
      const now = new Date();
      const startTime = params.startTime ? new Date(params.startTime) : new Date(now.getFullYear(), now.getMonth(), 1); // Start of month
      const endTime = params.endTime ? new Date(params.endTime) : now;
      
      // Filter complaints by date range
      const filteredComplaints = filterByDateRange(mockData.complaints, params.startTime, params.endTime);
      
      // Calculate complaint statistics
      const totalComplaints = filteredComplaints.length;
      const pending = filteredComplaints.filter(c => c.status === 'pending').length;
      const inProgress = filteredComplaints.filter(c => c.status === 'in_progress').length;
      const resolved = filteredComplaints.filter(c => c.status === 'resolved').length;
      const rejected = filteredComplaints.filter(c => c.status === 'rejected').length;
      
      return {
        total_complaints: totalComplaints,
        pending: pending,
        in_progress: inProgress,
        resolved: resolved,
        rejected: rejected
      };
    }
  }
};