// Staff Rating Service API
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

export const staffRatingService = {
  // Get all staff ratings
  getAll: async (params = {}) => {
    await simulateDelay();
    let staffRatings = [...mockData.staffRatings];
    
    if (params.staff_id) {
      staffRatings = staffRatings.filter(sr => sr.staff_id === parseInt(params.staff_id));
    }
    
    if (params.rental_id) {
      staffRatings = staffRatings.filter(sr => sr.rental_id === parseInt(params.rental_id));
    }
    
    if (params.renter_id) {
      staffRatings = staffRatings.filter(sr => sr.renter_id === parseInt(params.renter_id));
    }
    
    if (params.min_rating) {
      staffRatings = staffRatings.filter(sr => sr.rating >= parseInt(params.min_rating));
    }
    
    // Sort by creation date (newest first)
    staffRatings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return createResponse({
      staffRatings,
      total: staffRatings.length,
      averageRating: staffRatings.length > 0 ? 
        staffRatings.reduce((sum, sr) => sum + sr.rating, 0) / staffRatings.length : 0
    });
  },

  // Get staff rating by ID
  getById: async (id) => {
    await simulateDelay();
    const staffRating = mockData.staffRatings.find(sr => sr.id === parseInt(id));
    if (staffRating) {
      return createResponse(staffRating);
    }
    return createErrorResponse("Staff rating not found", 404);
  },

  // Create staff rating
  create: async (staffRatingData) => {
    await simulateDelay();
    
    // Validate rental exists and belongs to renter
    const rental = mockData.rentals.find(r => 
      r.id === staffRatingData.rental_id && 
      r.renter_id === staffRatingData.renter_id &&
      r.status === 'returned'
    );
    
    if (!rental) {
      return createErrorResponse("Rental not found or not completed", 404);
    }
    
    // Validate staff exists and was involved in the rental
    const staff = mockData.users.find(u => u.id === staffRatingData.staff_id && u.role === 'staff');
    if (!staff) {
      return createErrorResponse("Staff member not found", 404);
    }
    
    // Check if staff was involved in this rental
    if (rental.staff_pickup_id !== staffRatingData.staff_id && 
        rental.staff_return_id !== staffRatingData.staff_id) {
      return createErrorResponse("Staff member was not involved in this rental", 400);
    }
    
    // Check if rating already exists
    const existingRating = mockData.staffRatings.find(sr => 
      sr.rental_id === staffRatingData.rental_id && 
      sr.renter_id === staffRatingData.renter_id &&
      sr.staff_id === staffRatingData.staff_id
    );
    
    if (existingRating) {
      return createErrorResponse("Staff rating already exists for this rental", 409);
    }
    
    // Validate rating value
    if (staffRatingData.rating < 1 || staffRatingData.rating > 5) {
      return createErrorResponse("Rating must be between 1 and 5", 400);
    }
    
    const newStaffRating = {
      id: Math.max(...mockData.staffRatings.map(sr => sr.id)) + 1,
      ...staffRatingData,
      created_at: new Date().toISOString()
    };
    
    mockData.staffRatings.push(newStaffRating);
    return createResponse(newStaffRating);
  },

  // Update staff rating
  update: async (id, staffRatingData) => {
    await simulateDelay();
    const staffRatingIndex = mockData.staffRatings.findIndex(sr => sr.id === parseInt(id));
    if (staffRatingIndex === -1) {
      return createErrorResponse("Staff rating not found", 404);
    }
    
    // Validate rating value if provided
    if (staffRatingData.rating && (staffRatingData.rating < 1 || staffRatingData.rating > 5)) {
      return createErrorResponse("Rating must be between 1 and 5", 400);
    }
    
    mockData.staffRatings[staffRatingIndex] = {
      ...mockData.staffRatings[staffRatingIndex],
      ...staffRatingData,
      updated_at: new Date().toISOString()
    };
    
    return createResponse(mockData.staffRatings[staffRatingIndex]);
  },

  // Delete staff rating
  delete: async (id) => {
    await simulateDelay();
    const staffRatingIndex = mockData.staffRatings.findIndex(sr => sr.id === parseInt(id));
    if (staffRatingIndex === -1) {
      return createErrorResponse("Staff rating not found", 404);
    }
    
    mockData.staffRatings.splice(staffRatingIndex, 1);
    return createResponse({ message: "Staff rating deleted successfully" });
  },

  // Get ratings for specific staff member
  getByStaff: async (staffId) => {
    await simulateDelay();
    const staffRatings = mockData.staffRatings.filter(sr => sr.staff_id === parseInt(staffId));
    
    const averageRating = staffRatings.length > 0 ? 
      staffRatings.reduce((sum, sr) => sum + sr.rating, 0) / staffRatings.length : 0;
    
    // Rating distribution
    const distribution = {
      1: staffRatings.filter(sr => sr.rating === 1).length,
      2: staffRatings.filter(sr => sr.rating === 2).length,
      3: staffRatings.filter(sr => sr.rating === 3).length,
      4: staffRatings.filter(sr => sr.rating === 4).length,
      5: staffRatings.filter(sr => sr.rating === 5).length
    };
    
    return createResponse({
      staffRatings,
      total: staffRatings.length,
      averageRating: Math.round(averageRating * 100) / 100,
      distribution,
      satisfactionRate: staffRatings.length > 0 ? 
        Math.round(((staffRatings.filter(sr => sr.rating >= 4).length / staffRatings.length) * 100)) : 0
    });
  },

  // Get staff performance summary
  getStaffPerformance: async () => {
    await simulateDelay();
    const staffMembers = mockData.users.filter(u => u.role === 'staff');
    
    const performanceData = staffMembers.map(staff => {
      const ratings = mockData.staffRatings.filter(sr => sr.staff_id === staff.id);
      const averageRating = ratings.length > 0 ? 
        ratings.reduce((sum, sr) => sum + sr.rating, 0) / ratings.length : 0;
      
      return {
        staff,
        totalRatings: ratings.length,
        averageRating: Math.round(averageRating * 100) / 100,
        satisfactionRate: ratings.length > 0 ? 
          Math.round(((ratings.filter(sr => sr.rating >= 4).length / ratings.length) * 100)) : 0
      };
    });
    
    // Sort by average rating (highest first)
    performanceData.sort((a, b) => b.averageRating - a.averageRating);
    
    return createResponse(performanceData);
  },

  // Renter API methods - matching exact specification
  renter: {
    // Submit staff rating (POST /api/renter/staff-ratings)
    submitStaffRating: async (ratingData) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Validate required fields
      if (!ratingData.rental_id) {
        return createErrorResponse("Thiếu thông tin rental_id", 400);
      }
      
      if (!ratingData.staff_id) {
        return createErrorResponse("Thiếu thông tin staff_id", 400);
      }
      
      if (!ratingData.rating) {
        return createErrorResponse("Thiếu thông tin đánh giá", 400);
      }
      
      // Validate rating value
      if (ratingData.rating < 1 || ratingData.rating > 5) {
        return createErrorResponse("Đánh giá phải từ 1 đến 5", 400);
      }
      
      // Validate rental exists and belongs to renter
      const rental = mockData.rentals.find(r => 
        r.id === parseInt(ratingData.rental_id) && 
        r.renter_id === currentUserId &&
        r.status === 'returned'
      );
      
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê hoặc chưa hoàn thành", 404);
      }
      
      // Validate staff exists and was involved in the rental
      const staff = mockData.users.find(u => u.id === parseInt(ratingData.staff_id) && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Không tìm thấy nhân viên", 404);
      }
      
      // Check if staff was involved in this rental
      if (rental.staff_pickup_id !== parseInt(ratingData.staff_id) && 
          rental.staff_return_id !== parseInt(ratingData.staff_id)) {
        return createErrorResponse("Nhân viên này không tham gia vào lượt thuê", 400);
      }
      
      // Check if rating already exists
      const existingRating = mockData.staffRatings.find(sr => 
        sr.rental_id === parseInt(ratingData.rental_id) && 
        sr.renter_id === currentUserId &&
        sr.staff_id === parseInt(ratingData.staff_id)
      );
      
      if (existingRating) {
        return createErrorResponse("Bạn đã đánh giá nhân viên này", 409);
      }
      
      const newStaffRating = {
        id: Math.max(...mockData.staffRatings.map(sr => sr.id), 0) + 1,
        rental_id: parseInt(ratingData.rental_id),
        staff_id: parseInt(ratingData.staff_id),
        renter_id: currentUserId,
        rating: parseInt(ratingData.rating),
        comment: ratingData.comment || null,
        created_at: new Date().toISOString()
      };
      
      mockData.staffRatings.push(newStaffRating);
      
      return createResponse({
        status: 200,
        message: "Đánh giá nhân viên thành công"
      });
    }
  }
};