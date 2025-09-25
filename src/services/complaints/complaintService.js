// Complaint Service API
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

export const complaintService = {
  // Get all complaints
  getAll: async (params = {}) => {
    await simulateDelay();
    let complaints = [...mockData.complaints];
    
    if (params.renter_id) {
      complaints = complaints.filter(c => c.renter_id === parseInt(params.renter_id));
    }
    
    if (params.status) {
      complaints = complaints.filter(c => c.status === params.status);
    }
    
    if (params.staff_id) {
      complaints = complaints.filter(c => c.staff_id === parseInt(params.staff_id));
    }
    
    if (params.admin_id) {
      complaints = complaints.filter(c => c.admin_id === parseInt(params.admin_id));
    }
    
    // Sort by creation date (newest first)
    complaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return createResponse({
      complaints: complaints.slice(startIndex, endIndex),
      total: complaints.length,
      page,
      limit,
      totalPages: Math.ceil(complaints.length / limit)
    });
  },

  // Get complaint by ID
  getById: async (id) => {
    await simulateDelay();
    const complaint = mockData.complaints.find(c => c.id === parseInt(id));
    if (complaint) {
      return createResponse(complaint);
    }
    return createErrorResponse("Complaint not found", 404);
  },

  // Create complaint
  create: async (complaintData) => {
    await simulateDelay();
    
    // Validate rental exists and belongs to renter
    const rental = mockData.rentals.find(r => 
      r.id === complaintData.rental_id && 
      r.renter_id === complaintData.renter_id
    );
    
    if (!rental) {
      return createErrorResponse("Rental not found or doesn't belong to user", 404);
    }
    
    // Validate staff if provided
    if (complaintData.staff_id) {
      const staff = mockData.users.find(u => u.id === complaintData.staff_id && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Staff member not found", 404);
      }
    }
    
    const newComplaint = {
      id: Math.max(...mockData.complaints.map(c => c.id)) + 1,
      ...complaintData,
      status: 'pending',
      admin_id: null,
      resolution: null,
      resolved_at: null,
      created_at: new Date().toISOString()
    };
    
    mockData.complaints.push(newComplaint);
    return createResponse(newComplaint);
  },

  // Update complaint
  update: async (id, complaintData) => {
    await simulateDelay();
    const complaintIndex = mockData.complaints.findIndex(c => c.id === parseInt(id));
    if (complaintIndex === -1) {
      return createErrorResponse("Complaint not found", 404);
    }
    
    mockData.complaints[complaintIndex] = {
      ...mockData.complaints[complaintIndex],
      ...complaintData,
      updated_at: new Date().toISOString()
    };
    
    return createResponse(mockData.complaints[complaintIndex]);
  },

  // Assign complaint to admin
  assign: async (id, adminId) => {
    await simulateDelay();
    const complaintIndex = mockData.complaints.findIndex(c => c.id === parseInt(id));
    if (complaintIndex === -1) {
      return createErrorResponse("Complaint not found", 404);
    }
    
    // Validate admin exists
    const admin = mockData.users.find(u => u.id === adminId && u.role === 'admin');
    if (!admin) {
      return createErrorResponse("Admin not found", 404);
    }
    
    mockData.complaints[complaintIndex] = {
      ...mockData.complaints[complaintIndex],
      admin_id: adminId,
      status: 'in_review'
    };
    
    return createResponse(mockData.complaints[complaintIndex]);
  },

  // Resolve complaint
  resolve: async (id, resolution, adminId) => {
    await simulateDelay();
    const complaintIndex = mockData.complaints.findIndex(c => c.id === parseInt(id));
    if (complaintIndex === -1) {
      return createErrorResponse("Complaint not found", 404);
    }
    
    const complaint = mockData.complaints[complaintIndex];
    
    if (complaint.status === 'resolved') {
      return createErrorResponse("Complaint already resolved", 400);
    }
    
    // Validate admin exists
    const admin = mockData.users.find(u => u.id === adminId && u.role === 'admin');
    if (!admin) {
      return createErrorResponse("Admin not found", 404);
    }
    
    mockData.complaints[complaintIndex] = {
      ...complaint,
      status: 'resolved',
      resolution,
      admin_id: adminId,
      resolved_at: new Date().toISOString()
    };
    
    return createResponse(mockData.complaints[complaintIndex]);
  },

  // Reject complaint
  reject: async (id, reason, adminId) => {
    await simulateDelay();
    const complaintIndex = mockData.complaints.findIndex(c => c.id === parseInt(id));
    if (complaintIndex === -1) {
      return createErrorResponse("Complaint not found", 404);
    }
    
    const complaint = mockData.complaints[complaintIndex];
    
    if (complaint.status === 'resolved' || complaint.status === 'rejected') {
      return createErrorResponse("Complaint already processed", 400);
    }
    
    // Validate admin exists
    const admin = mockData.users.find(u => u.id === adminId && u.role === 'admin');
    if (!admin) {
      return createErrorResponse("Admin not found", 404);
    }
    
    mockData.complaints[complaintIndex] = {
      ...complaint,
      status: 'rejected',
      resolution: reason,
      admin_id: adminId,
      resolved_at: new Date().toISOString()
    };
    
    return createResponse(mockData.complaints[complaintIndex]);
  },

  // Get complaints by user
  getByUser: async (userId) => {
    await simulateDelay();
    const complaints = mockData.complaints.filter(c => c.renter_id === parseInt(userId));
    
    return createResponse({
      complaints,
      total: complaints.length,
      statusSummary: {
        pending: complaints.filter(c => c.status === 'pending').length,
        in_review: complaints.filter(c => c.status === 'in_review').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        rejected: complaints.filter(c => c.status === 'rejected').length
      }
    });
  },

  // Get pending complaints
  getPending: async () => {
    await simulateDelay();
    const pendingComplaints = mockData.complaints.filter(c => c.status === 'pending');
    
    return createResponse(pendingComplaints);
  },

  // Get complaint statistics
  getStats: async (params = {}) => {
    await simulateDelay();
    let complaints = [...mockData.complaints];
    
    // Filter by date range if provided
    if (params.start_date) {
      complaints = complaints.filter(c => 
        new Date(c.created_at) >= new Date(params.start_date)
      );
    }
    
    if (params.end_date) {
      complaints = complaints.filter(c => 
        new Date(c.created_at) <= new Date(params.end_date)
      );
    }
    
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inReview = complaints.filter(c => c.status === 'in_review').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const rejected = complaints.filter(c => c.status === 'rejected').length;
    
    // Calculate average resolution time
    const resolvedComplaints = complaints.filter(c => c.resolved_at);
    const avgResolutionTime = resolvedComplaints.length > 0 ? 
      resolvedComplaints.reduce((sum, c) => {
        const createdAt = new Date(c.created_at);
        const resolvedAt = new Date(c.resolved_at);
        const hours = (resolvedAt - createdAt) / (1000 * 60 * 60);
        return sum + hours;
      }, 0) / resolvedComplaints.length : 0;
    
    return createResponse({
      total,
      pending,
      inReview,
      resolved,
      rejected,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      averageResolutionTime: Math.round(avgResolutionTime * 100) / 100
    });
  },

  // Renter API methods - matching exact specification
  renter: {
    // Submit complaint (POST /api/renter/complaints)
    submitComplaint: async (complaintData) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Validate required fields
      if (!complaintData.rental_id) {
        return createErrorResponse("Thiếu thông tin rental_id", 400);
      }
      
      if (!complaintData.description) {
        return createErrorResponse("Thiếu mô tả khiếu nại", 400);
      }
      
      // Validate rental exists and belongs to renter
      const rental = mockData.rentals.find(r => 
        r.id === parseInt(complaintData.rental_id) && 
        r.renter_id === currentUserId
      );
      
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      // Validate staff if provided
      if (complaintData.staff_id) {
        const staff = mockData.users.find(u => u.id === parseInt(complaintData.staff_id) && u.role === 'staff');
        if (!staff) {
          return createErrorResponse("Không tìm thấy nhân viên", 404);
        }
      }
      
      const newComplaint = {
        id: Math.max(...mockData.complaints.map(c => c.id), 0) + 1,
        rental_id: parseInt(complaintData.rental_id),
        renter_id: currentUserId,
        staff_id: complaintData.staff_id ? parseInt(complaintData.staff_id) : null,
        description: complaintData.description,
        status: 'pending',
        admin_id: null,
        resolution: null,
        resolved_at: null,
        created_at: new Date().toISOString()
      };
      
      mockData.complaints.push(newComplaint);
      
      return createResponse({
        complaint: {
          id: newComplaint.id,
          rental_id: newComplaint.rental_id,
          renter_id: newComplaint.renter_id,
          staff_id: newComplaint.staff_id,
          description: newComplaint.description,
          status: newComplaint.status,
          created_at: newComplaint.created_at
        }
      });
    },

    // Get complaint list (GET /api/renter/complaints)
    getComplaints: async () => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      const complaints = mockData.complaints.filter(c => c.renter_id === currentUserId);
      
      // Return complaints with required fields for list view
      const formattedComplaints = complaints.map(complaint => ({
        id: complaint.id,
        description: complaint.description,
        status: complaint.status,
        created_at: complaint.created_at,
        resolved_at: complaint.resolved_at
      }));
      
      // Sort by creation date (newest first)
      formattedComplaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return createResponse({
        complaints: formattedComplaints
      });
    },

    // Get specific complaint detail (GET /api/renter/complaints/:id)
    getComplaintById: async (complaintId) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Verify complaint ownership
      const complaint = mockData.complaints.find(c => 
        c.id === parseInt(complaintId) && c.renter_id === currentUserId
      );
      
      if (!complaint) {
        return createErrorResponse("Không tìm thấy khiếu nại", 404);
      }
      
      return createResponse({
        complaint: {
          id: complaint.id,
          rental_id: complaint.rental_id,
          staff_id: complaint.staff_id,
          description: complaint.description,
          status: complaint.status,
          resolution: complaint.resolution,
          admin_id: complaint.admin_id,
          created_at: complaint.created_at,
          resolved_at: complaint.resolved_at
        }
      });
    }
  },

  // Admin namespace for complaint management
  admin: {
    // Get all complaints for admin management
    getComplaints: async (params = {}) => {
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
      
      let complaints = [...mockData.complaints];
      
      // Filter by status - map API status to internal status
      if (params.status) {
        const statusMapping = {
          'pending': ['pending'],
          'in_review': ['in_progress'],
          'resolved': ['resolved', 'rejected']
        };
        
        if (statusMapping[params.status]) {
          complaints = complaints.filter(c => statusMapping[params.status].includes(c.status));
        }
      }
      
      // Filter by renter
      if (params.renter_id) {
        complaints = complaints.filter(c => c.renter_id === parseInt(params.renter_id));
      }
      
      // Format response according to API spec
      const formattedComplaints = complaints.map(complaint => ({
        id: complaint.id,
        renter_id: complaint.renter_id,
        message: complaint.description,
        status: complaint.status,
        created_at: complaint.created_at
      }));
      
      // Sort by creation date (newest first)
      formattedComplaints.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return {
        complaints: formattedComplaints
      };
    },

    // Get complaint by ID for admin management
    getComplaintById: async (id) => {
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
      
      const complaint = mockData.complaints.find(c => c.id === parseInt(id));
      if (!complaint) {
        return {
          status: 404,
          error: "ComplaintNotFound",
          message: "Không tìm thấy khiếu nại"
        };
      }
      
      return {
        id: complaint.id,
        renter_id: complaint.renter_id,
        rental_id: complaint.rental_id || null,
        message: complaint.description,
        status: complaint.status,
        resolution: complaint.resolution || null,
        created_at: complaint.created_at,
        updated_at: complaint.updated_at
      };
    },

    // Update complaint status and resolution
    updateComplaint: async (id, updateData) => {
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
      
      const complaintIndex = mockData.complaints.findIndex(c => c.id === parseInt(id));
      if (complaintIndex === -1) {
        return {
          status: 404,
          error: "ComplaintNotFound",
          message: "Không tìm thấy khiếu nại"
        };
      }
      
      const complaint = mockData.complaints[complaintIndex];
      
      // Validate status
      if (updateData.status && !['resolved', 'rejected'].includes(updateData.status)) {
        return {
          status: 400,
          error: "ValidationError",
          message: "Trạng thái chỉ có thể là resolved hoặc rejected"
        };
      }
      
      // Check if complaint is already resolved/rejected
      if (['resolved', 'rejected'].includes(complaint.status)) {
        return {
          status: 400,
          error: "ConflictError",
          message: "Khiếu nại đã được xử lý"
        };
      }
      
      // Update complaint
      const updatedComplaint = {
        ...complaint,
        ...updateData,
        admin_id: currentAdminId,
        updated_at: new Date().toISOString()
      };
      
      // Add resolved_at timestamp if status is resolved or rejected
      if (updateData.status && ['resolved', 'rejected'].includes(updateData.status)) {
        updatedComplaint.resolved_at = new Date().toISOString();
      }
      
      mockData.complaints[complaintIndex] = updatedComplaint;
      
      return {
        message: "Cập nhật khiếu nại thành công",
        complaint: {
          id: updatedComplaint.id,
          status: updatedComplaint.status,
          resolution: updatedComplaint.resolution || null,
          updated_at: updatedComplaint.updated_at
        }
      };
    }
  }
};