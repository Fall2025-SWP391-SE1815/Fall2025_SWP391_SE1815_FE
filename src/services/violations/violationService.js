// Violation Service API
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

export const violationService = {
  // Get all violations
  getAll: async (params = {}) => {
    await simulateDelay();
    let violations = [...mockData.violations];
    
    if (params.rental_id) {
      violations = violations.filter(v => v.rental_id === parseInt(params.rental_id));
    }
    
    if (params.staff_id) {
      violations = violations.filter(v => v.staff_id === parseInt(params.staff_id));
    }
    
    // Filter by fine amount range
    if (params.min_fine) {
      violations = violations.filter(v => v.fine_amount >= parseFloat(params.min_fine));
    }
    
    if (params.max_fine) {
      violations = violations.filter(v => v.fine_amount <= parseFloat(params.max_fine));
    }
    
    // Sort by creation date (newest first)
    violations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return createResponse({
      violations,
      total: violations.length,
      totalFines: violations.reduce((sum, v) => sum + v.fine_amount, 0)
    });
  },

  // Get violation by ID
  getById: async (id) => {
    await simulateDelay();
    const violation = mockData.violations.find(v => v.id === parseInt(id));
    if (violation) {
      return createResponse(violation);
    }
    return createErrorResponse("Violation not found", 404);
  },

  // Create violation
  create: async (violationData) => {
    await simulateDelay();
    
    // Validate rental exists
    const rental = mockData.rentals.find(r => r.id === violationData.rental_id);
    if (!rental) {
      return createErrorResponse("Rental not found", 404);
    }
    
    // Validate staff exists
    const staff = mockData.users.find(u => u.id === violationData.staff_id && u.role === 'staff');
    if (!staff) {
      return createErrorResponse("Staff member not found", 404);
    }
    
    const newViolation = {
      id: Math.max(...mockData.violations.map(v => v.id)) + 1,
      ...violationData,
      created_at: new Date().toISOString()
    };
    
    mockData.violations.push(newViolation);
    return createResponse(newViolation);
  },

  // Get violations by rental
  getByRental: async (rentalId) => {
    await simulateDelay();
    const violations = mockData.violations.filter(v => v.rental_id === parseInt(rentalId));
    
    return createResponse({
      violations,
      total: violations.length,
      totalFines: violations.reduce((sum, v) => sum + v.fine_amount, 0)
    });
  },

  // Update violation
  update: async (id, violationData) => {
    await simulateDelay();
    const violationIndex = mockData.violations.findIndex(v => v.id === parseInt(id));
    if (violationIndex === -1) {
      return createErrorResponse("Violation not found", 404);
    }
    
    mockData.violations[violationIndex] = {
      ...mockData.violations[violationIndex],
      ...violationData,
      updated_at: new Date().toISOString()
    };
    
    return createResponse(mockData.violations[violationIndex]);
  },

  // Delete violation
  delete: async (id) => {
    await simulateDelay();
    const violationIndex = mockData.violations.findIndex(v => v.id === parseInt(id));
    if (violationIndex === -1) {
      return createErrorResponse("Violation not found", 404);
    }
    
    mockData.violations.splice(violationIndex, 1);
    return createResponse({ message: "Violation deleted successfully" });
  },

  // Staff API methods - matching exact specification
  staff: {
    // Record violation (POST /api/staff/violations)
    recordViolation: async (violationData) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate staff exists and has proper role
      const staff = mockData.users.find(u => u.id === currentStaffId && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Validate required fields
      if (!violationData.rental_id) {
        return createErrorResponse("Thiếu thông tin rental_id", 400);
      }
      
      if (!violationData.description) {
        return createErrorResponse("Thiếu mô tả vi phạm", 400);
      }
      
      if (!violationData.fine_amount) {
        return createErrorResponse("Thiếu số tiền phạt", 400);
      }
      
      // Validate rental exists
      const rental = mockData.rentals.find(r => r.id === parseInt(violationData.rental_id));
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      // Validate fine amount is positive
      if (violationData.fine_amount <= 0) {
        return createErrorResponse("Số tiền phạt phải lớn hơn 0", 400);
      }
      
      // Create new violation record
      const newViolation = {
        id: Math.max(...mockData.violations.map(v => v.id), 0) + 1,
        rental_id: parseInt(violationData.rental_id),
        staff_id: currentStaffId,
        description: violationData.description,
        fine_amount: parseInt(violationData.fine_amount),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockData.violations.push(newViolation);
      
      return createResponse({
        violation_id: newViolation.id,
        rental_id: newViolation.rental_id,
        staff_id: newViolation.staff_id,
        description: newViolation.description,
        fine_amount: newViolation.fine_amount,
        created_at: newViolation.created_at
      }, true, "Vi phạm đã được ghi nhận.");
    }
  },

  // Admin namespace for violation monitoring
  admin: {
    // Get all violations for admin monitoring
    getViolations: async (params = {}) => {
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
      
      let violations = [...mockData.violations];
      
      // Filter by rental_id if specified
      if (params.rental_id) {
        violations = violations.filter(v => v.rental_id === parseInt(params.rental_id));
      }
      
      // Format response according to API spec
      const formattedViolations = violations.map(violation => {
        // Find rental to get renter_id
        const rental = mockData.rentals.find(r => r.id === violation.rental_id);
        
        return {
          id: violation.id,
          rental_id: violation.rental_id,
          renter_id: rental ? rental.user_id : null,
          type: violation.type,
          description: violation.description,
          penalty_amount: violation.fine_amount,
          created_at: violation.created_at
        };
      });
      
      // Sort by creation date (newest first)
      formattedViolations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return {
        violations: formattedViolations
      };
    },

    // Get violations for specific renter
    getRenterViolations: async (renterId) => {
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
      
      // Validate renter exists
      const renter = mockData.users.find(u => u.id === parseInt(renterId) && u.role === 'renter');
      if (!renter) {
        return {
          status: 404,
          error: "RenterNotFound",
          message: "Không tìm thấy khách hàng"
        };
      }
      
      // Get all violations for this renter through their rentals
      const renterRentals = mockData.rentals.filter(r => r.user_id === parseInt(renterId));
      const rentalIds = renterRentals.map(r => r.id);
      
      const renterViolations = mockData.violations.filter(v => 
        rentalIds.includes(v.rental_id)
      );
      
      // Format violations according to API spec
      const violations = renterViolations.map(violation => ({
        id: violation.id,
        type: violation.type,
        description: violation.description,
        penalty_amount: violation.fine_amount,
        created_at: violation.created_at
      }));
      
      // Sort by creation date (newest first)
      violations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return {
        violations: violations
      };
    }
  }
};