// Rental Check Service API
import { mockData } from '../mockData.js';

// Helper functions
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const createResponse = (data, success = true, message = "Success") => ({
  success,
  message,
  data,
  timestamp: new Date().toISOString()
});

const createErrorResponse = (message, statusCode = 400) => ({
  success: false,
  message,
  statusCode,
  timestamp: new Date().toISOString()
});

export const rentalCheckService = {
  // Get all rental checks
  getAll: async (params = {}) => {
    await simulateDelay();
    let checks = [...mockData.rentalChecks];
    
    if (params.rental_id) {
      checks = checks.filter(c => c.rental_id === parseInt(params.rental_id));
    }
    
    if (params.check_type) {
      checks = checks.filter(c => c.check_type === params.check_type);
    }
    
    if (params.staff_id) {
      checks = checks.filter(c => c.staff_id === parseInt(params.staff_id));
    }
    
    // Sort by creation date (newest first)
    checks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return createResponse({
      checks,
      total: checks.length
    });
  },

  // Get check by ID
  getById: async (id) => {
    await simulateDelay();
    const check = mockData.rentalChecks.find(c => c.id === parseInt(id));
    if (check) {
      return createResponse(check);
    }
    return createErrorResponse("Rental check not found", 404);
  },

  // Create rental check
  create: async (checkData) => {
    await simulateDelay();
    
    // Validate rental exists
    const rental = mockData.rentals.find(r => r.id === checkData.rental_id);
    if (!rental) {
      return createErrorResponse("Rental not found", 404);
    }
    
    // Validate staff exists
    const staff = mockData.users.find(u => u.id === checkData.staff_id && u.role === 'staff');
    if (!staff) {
      return createErrorResponse("Staff member not found", 404);
    }
    
    // Validate check type
    if (!['pickup', 'return'].includes(checkData.check_type)) {
      return createErrorResponse("Invalid check type", 400);
    }
    
    const newCheck = {
      id: Math.max(...mockData.rentalChecks.map(c => c.id)) + 1,
      ...checkData,
      created_at: new Date().toISOString()
    };
    
    mockData.rentalChecks.push(newCheck);
    return createResponse(newCheck);
  },

  // Get checks by rental
  getByRental: async (rentalId) => {
    await simulateDelay();
    const checks = mockData.rentalChecks.filter(c => c.rental_id === parseInt(rentalId));
    
    const pickupCheck = checks.find(c => c.check_type === 'pickup');
    const returnCheck = checks.find(c => c.check_type === 'return');
    
    return createResponse({
      checks,
      pickupCheck,
      returnCheck,
      isComplete: !!(pickupCheck && returnCheck)
    });
  },

  // Update check
  update: async (id, checkData) => {
    await simulateDelay();
    const checkIndex = mockData.rentalChecks.findIndex(c => c.id === parseInt(id));
    if (checkIndex === -1) {
      return createErrorResponse("Rental check not found", 404);
    }
    
    mockData.rentalChecks[checkIndex] = {
      ...mockData.rentalChecks[checkIndex],
      ...checkData,
      updated_at: new Date().toISOString()
    };
    
    return createResponse(mockData.rentalChecks[checkIndex]);
  }
};