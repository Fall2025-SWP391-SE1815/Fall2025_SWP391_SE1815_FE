// Rating Service API
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

export const ratingService = {
  // Get all ratings
  getAll: async (params = {}) => {
    await simulateDelay();
    let ratings = [...mockData.ratings];
    
    if (params.rental_id) {
      ratings = ratings.filter(r => r.rental_id === parseInt(params.rental_id));
    }
    
    if (params.renter_id) {
      ratings = ratings.filter(r => r.renter_id === parseInt(params.renter_id));
    }
    
    if (params.min_rating) {
      ratings = ratings.filter(r => r.rating >= parseInt(params.min_rating));
    }
    
    if (params.max_rating) {
      ratings = ratings.filter(r => r.rating <= parseInt(params.max_rating));
    }
    
    // Sort by creation date (newest first)
    ratings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return createResponse({
      ratings,
      total: ratings.length,
      averageRating: ratings.length > 0 ? 
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0
    });
  },

  // Get rating by ID
  getById: async (id) => {
    await simulateDelay();
    const rating = mockData.ratings.find(r => r.id === parseInt(id));
    if (rating) {
      return createResponse(rating);
    }
    return createErrorResponse("Rating not found", 404);
  },

  // Create rating
  create: async (ratingData) => {
    await simulateDelay();
    
    // Check if user already rated this rental
    const existingRating = mockData.ratings.find(r => 
      r.rental_id === ratingData.rental_id && r.renter_id === ratingData.renter_id
    );
    
    if (existingRating) {
      return createErrorResponse("Rating already exists for this rental", 409);
    }
    
    // Validate rental exists and belongs to renter
    const rental = mockData.rentals.find(r => 
      r.id === ratingData.rental_id && 
      r.renter_id === ratingData.renter_id &&
      r.status === 'returned'
    );
    
    if (!rental) {
      return createErrorResponse("Rental not found or not completed", 404);
    }
    
    // Validate rating value
    if (ratingData.rating < 1 || ratingData.rating > 5) {
      return createErrorResponse("Rating must be between 1 and 5", 400);
    }
    
    const newRating = {
      id: Math.max(...mockData.ratings.map(r => r.id)) + 1,
      ...ratingData,
      created_at: new Date().toISOString()
    };
    
    mockData.ratings.push(newRating);
    return createResponse(newRating);
  },

  // Update rating
  update: async (id, ratingData) => {
    await simulateDelay();
    const ratingIndex = mockData.ratings.findIndex(r => r.id === parseInt(id));
    if (ratingIndex === -1) {
      return createErrorResponse("Rating not found", 404);
    }
    
    // Validate rating value if provided
    if (ratingData.rating && (ratingData.rating < 1 || ratingData.rating > 5)) {
      return createErrorResponse("Rating must be between 1 and 5", 400);
    }
    
    mockData.ratings[ratingIndex] = {
      ...mockData.ratings[ratingIndex],
      ...ratingData,
      updated_at: new Date().toISOString()
    };
    
    return createResponse(mockData.ratings[ratingIndex]);
  },

  // Delete rating
  delete: async (id) => {
    await simulateDelay();
    const ratingIndex = mockData.ratings.findIndex(r => r.id === parseInt(id));
    if (ratingIndex === -1) {
      return createErrorResponse("Rating not found", 404);
    }
    
    mockData.ratings.splice(ratingIndex, 1);
    return createResponse({ message: "Rating deleted successfully" });
  },

  // Get rating statistics
  getStats: async (params = {}) => {
    await simulateDelay();
    let ratings = [...mockData.ratings];
    
    // Filter by date range if provided
    if (params.start_date) {
      ratings = ratings.filter(r => 
        new Date(r.created_at) >= new Date(params.start_date)
      );
    }
    
    if (params.end_date) {
      ratings = ratings.filter(r => 
        new Date(r.created_at) <= new Date(params.end_date)
      );
    }
    
    const total = ratings.length;
    const averageRating = total > 0 ? 
      ratings.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    
    // Rating distribution
    const distribution = {
      1: ratings.filter(r => r.rating === 1).length,
      2: ratings.filter(r => r.rating === 2).length,
      3: ratings.filter(r => r.rating === 3).length,
      4: ratings.filter(r => r.rating === 4).length,
      5: ratings.filter(r => r.rating === 5).length
    };
    
    return createResponse({
      total,
      averageRating: Math.round(averageRating * 100) / 100,
      distribution,
      satisfactionRate: total > 0 ? 
        Math.round(((ratings.filter(r => r.rating >= 4).length / total) * 100)) : 0
    });
  },

  // Renter API methods - matching exact specification
  renter: {
    // Submit service rating (POST /api/renter/ratings)
    submitRating: async (ratingData) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Validate required fields
      if (!ratingData.rental_id) {
        return createErrorResponse("Thiếu thông tin rental_id", 400);
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
      
      // Check if user already rated this rental
      const existingRating = mockData.ratings.find(r => 
        r.rental_id === parseInt(ratingData.rental_id) && r.renter_id === currentUserId
      );
      
      if (existingRating) {
        return createErrorResponse("Bạn đã đánh giá lượt thuê này", 409);
      }
      
      const newRating = {
        id: Math.max(...mockData.ratings.map(r => r.id), 0) + 1,
        rental_id: parseInt(ratingData.rental_id),
        renter_id: currentUserId,
        rating: parseInt(ratingData.rating),
        comment: ratingData.comment || null,
        created_at: new Date().toISOString()
      };
      
      mockData.ratings.push(newRating);
      
      return createResponse({
        status: 200,
        message: "Đánh giá thành công"
      });
    }
  }
};