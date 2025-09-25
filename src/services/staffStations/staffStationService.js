// Staff Station Service API
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

export const staffStationService = {
  // Get all staff station assignments
  getAll: async (params = {}) => {
    await simulateDelay();
    let staffStations = [...mockData.staffStations];
    
    if (params.staff_id) {
      staffStations = staffStations.filter(ss => ss.staff_id === parseInt(params.staff_id));
    }
    
    if (params.station_id) {
      staffStations = staffStations.filter(ss => ss.station_id === parseInt(params.station_id));
    }
    
    if (params.is_active !== undefined) {
      staffStations = staffStations.filter(ss => ss.is_active === (params.is_active === 'true'));
    }
    
    return createResponse({
      staffStations,
      total: staffStations.length
    });
  },

  // Create staff station assignment
  create: async (staffStationData) => {
    await simulateDelay();
    
    // Validate staff exists and is staff role
    const staff = mockData.users.find(u => u.id === staffStationData.staff_id && u.role === 'staff');
    if (!staff) {
      return createErrorResponse("Staff member not found", 404);
    }
    
    // Validate station exists
    const station = mockData.stations.find(s => s.id === staffStationData.station_id);
    if (!station) {
      return createErrorResponse("Station not found", 404);
    }
    
    const newStaffStation = {
      id: Math.max(...mockData.staffStations.map(ss => ss.id)) + 1,
      ...staffStationData,
      assigned_at: new Date().toISOString()
    };
    
    mockData.staffStations.push(newStaffStation);
    return createResponse(newStaffStation);
  },

  // Update assignment
  update: async (id, staffStationData) => {
    await simulateDelay();
    const staffStationIndex = mockData.staffStations.findIndex(ss => ss.id === parseInt(id));
    if (staffStationIndex === -1) {
      return createErrorResponse("Staff station assignment not found", 404);
    }
    
    mockData.staffStations[staffStationIndex] = {
      ...mockData.staffStations[staffStationIndex],
      ...staffStationData
    };
    
    return createResponse(mockData.staffStations[staffStationIndex]);
  },

  // Get active assignments by staff
  getByStaff: async (staffId) => {
    await simulateDelay();
    const assignments = mockData.staffStations.filter(ss => 
      ss.staff_id === parseInt(staffId) && ss.is_active
    );
    
    return createResponse(assignments);
  },

  // Get staff at station
  getStaffAtStation: async (stationId) => {
    await simulateDelay();
    const assignments = mockData.staffStations.filter(ss => 
      ss.station_id === parseInt(stationId) && ss.is_active
    );
    
    return createResponse(assignments);
  },

  // Admin namespace for staff-station management
  admin: {
    // Create staff station assignment
    createAssignment: async (assignmentData) => {
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
      
      // Validate required fields
      if (!assignmentData.staff_id || !assignmentData.station_id) {
        return {
          status: 400,
          error: "ValidationError",
          message: "Vui lòng cung cấp staff_id và station_id"
        };
      }
      
      // Validate staff exists and is staff role
      const staff = mockData.users.find(u => u.id === parseInt(assignmentData.staff_id) && u.role === 'staff');
      if (!staff) {
        return {
          status: 400,
          error: "ValidationError",
          message: "Không tìm thấy nhân viên hoặc người dùng không phải là staff"
        };
      }
      
      // Validate station exists
      const station = mockData.stations.find(s => s.id === parseInt(assignmentData.station_id));
      if (!station) {
        return {
          status: 400,
          error: "ValidationError",
          message: "Không tìm thấy trạm"
        };
      }
      
      // Check if staff is already assigned to this station and active
      const existingAssignment = mockData.staffStations.find(ss => 
        ss.staff_id === parseInt(assignmentData.staff_id) && 
        ss.station_id === parseInt(assignmentData.station_id) && 
        ss.status === 'active'
      );
      
      if (existingAssignment) {
        return {
          status: 400,
          error: "ConflictError",
          message: "Nhân viên đã được phân công tại trạm này"
        };
      }
      
      // Create new assignment
      const newAssignment = {
        id: Math.max(...mockData.staffStations.map(ss => ss.id)) + 1,
        staff_id: parseInt(assignmentData.staff_id),
        station_id: parseInt(assignmentData.station_id),
        assigned_at: new Date().toISOString(),
        status: 'active'
      };
      
      mockData.staffStations.push(newAssignment);
      
      return {
        assignment: newAssignment
      };
    },

    // Deactivate staff station assignment
    deactivateAssignment: async (id) => {
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
      
      const assignmentIndex = mockData.staffStations.findIndex(ss => ss.id === parseInt(id));
      if (assignmentIndex === -1) {
        return {
          status: 404,
          error: "AssignmentNotFound",
          message: "Không tìm thấy phân công"
        };
      }
      
      const assignment = mockData.staffStations[assignmentIndex];
      
      // Check if assignment is already inactive
      if (assignment.status === 'inactive') {
        return {
          status: 400,
          error: "ConflictError",
          message: "Phân công đã được kết thúc trước đó"
        };
      }
      
      // Update assignment status
      mockData.staffStations[assignmentIndex] = {
        ...assignment,
        status: 'inactive',
        updated_at: new Date().toISOString()
      };
      
      return {
        message: "Đã kết thúc phân công",
        assignment: {
          id: mockData.staffStations[assignmentIndex].id,
          status: 'inactive',
          updated_at: mockData.staffStations[assignmentIndex].updated_at
        }
      };
    },

    // Get all staff station assignments
    getAssignments: async (params = {}) => {
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
      
      let assignments = [...mockData.staffStations];
      
      // Filter by station if specified
      if (params.station_id) {
        assignments = assignments.filter(ss => ss.station_id === parseInt(params.station_id));
      }
      
      // Filter by status if specified
      if (params.status) {
        assignments = assignments.filter(ss => ss.status === params.status);
      }
      
      // Enrich with staff and station information
      const enrichedAssignments = assignments.map(assignment => {
        const staff = mockData.users.find(u => u.id === assignment.staff_id);
        const station = mockData.stations.find(s => s.id === assignment.station_id);
        
        return {
          id: assignment.id,
          staff_id: assignment.staff_id,
          staff_name: staff ? staff.full_name : 'Unknown Staff',
          station_id: assignment.station_id,
          station_name: station ? station.name : 'Unknown Station',
          status: assignment.status,
          assigned_at: assignment.assigned_at
        };
      });
      
      return {
        assignments: enrichedAssignments
      };
    }
  }
};