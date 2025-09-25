// Incident Report Service API
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

export const incidentReportService = {
  // Get all incident reports
  getAll: async (params = {}) => {
    await simulateDelay();
    let incidents = [...mockData.incidentReports];
    
    if (params.rental_id) {
      incidents = incidents.filter(i => i.rental_id === parseInt(params.rental_id));
    }
    
    if (params.renter_id) {
      incidents = incidents.filter(i => i.renter_id === parseInt(params.renter_id));
    }
    
    if (params.staff_id) {
      incidents = incidents.filter(i => i.staff_id === parseInt(params.staff_id));
    }
    
    if (params.status) {
      incidents = incidents.filter(i => i.status === params.status);
    }
    
    if (params.severity) {
      incidents = incidents.filter(i => i.severity === params.severity);
    }
    
    // Sort by incident date (newest first)
    incidents.sort((a, b) => new Date(b.incident_date) - new Date(a.incident_date));
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return createResponse({
      incidents: incidents.slice(startIndex, endIndex),
      total: incidents.length,
      page,
      limit,
      totalPages: Math.ceil(incidents.length / limit)
    });
  },

  // Get incident report by ID
  getById: async (id) => {
    await simulateDelay();
    const incident = mockData.incidentReports.find(i => i.id === parseInt(id));
    if (incident) {
      return createResponse(incident);
    }
    return createErrorResponse("Incident report not found", 404);
  },

  // Create incident report
  create: async (incidentData) => {
    await simulateDelay();
    
    // Validate rental exists and belongs to renter
    const rental = mockData.rentals.find(r => 
      r.id === incidentData.rental_id && 
      r.renter_id === incidentData.renter_id
    );
    
    if (!rental) {
      return createErrorResponse("Rental not found or doesn't belong to user", 404);
    }
    
    // Validate staff if provided
    if (incidentData.staff_id) {
      const staff = mockData.users.find(u => u.id === incidentData.staff_id && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Staff member not found", 404);
      }
    }
    
    const newIncident = {
      id: Math.max(...mockData.incidentReports.map(i => i.id)) + 1,
      ...incidentData,
      status: 'pending',
      repair_cost: null,
      insurance_covered: false,
      resolved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockData.incidentReports.push(newIncident);
    return createResponse(newIncident);
  },

  // Update incident report
  update: async (id, incidentData) => {
    await simulateDelay();
    const incidentIndex = mockData.incidentReports.findIndex(i => i.id === parseInt(id));
    if (incidentIndex === -1) {
      return createErrorResponse("Incident report not found", 404);
    }
    
    mockData.incidentReports[incidentIndex] = {
      ...mockData.incidentReports[incidentIndex],
      ...incidentData,
      updated_at: new Date().toISOString()
    };
    
    return createResponse(mockData.incidentReports[incidentIndex]);
  },

  // Assign staff to incident
  assignStaff: async (id, staffId) => {
    await simulateDelay();
    const incidentIndex = mockData.incidentReports.findIndex(i => i.id === parseInt(id));
    if (incidentIndex === -1) {
      return createErrorResponse("Incident report not found", 404);
    }
    
    // Validate staff exists
    const staff = mockData.users.find(u => u.id === staffId && u.role === 'staff');
    if (!staff) {
      return createErrorResponse("Staff member not found", 404);
    }
    
    mockData.incidentReports[incidentIndex] = {
      ...mockData.incidentReports[incidentIndex],
      staff_id: staffId,
      status: 'in_progress',
      updated_at: new Date().toISOString()
    };
    
    return createResponse(mockData.incidentReports[incidentIndex]);
  },

  // Update repair cost
  updateRepairCost: async (id, repairCost, insuranceCovered = false) => {
    await simulateDelay();
    const incidentIndex = mockData.incidentReports.findIndex(i => i.id === parseInt(id));
    if (incidentIndex === -1) {
      return createErrorResponse("Incident report not found", 404);
    }
    
    mockData.incidentReports[incidentIndex] = {
      ...mockData.incidentReports[incidentIndex],
      repair_cost: repairCost,
      insurance_covered: insuranceCovered,
      updated_at: new Date().toISOString()
    };
    
    return createResponse(mockData.incidentReports[incidentIndex]);
  },

  // Close incident report
  close: async (id, staffId, notes = null) => {
    await simulateDelay();
    const incidentIndex = mockData.incidentReports.findIndex(i => i.id === parseInt(id));
    if (incidentIndex === -1) {
      return createErrorResponse("Incident report not found", 404);
    }
    
    const incident = mockData.incidentReports[incidentIndex];
    
    if (incident.status === 'closed') {
      return createErrorResponse("Incident already closed", 400);
    }
    
    mockData.incidentReports[incidentIndex] = {
      ...incident,
      status: 'closed',
      staff_id: staffId,
      notes: notes || incident.notes,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return createResponse(mockData.incidentReports[incidentIndex]);
  },

  // Get incidents by user
  getByUser: async (userId) => {
    await simulateDelay();
    const incidents = mockData.incidentReports.filter(i => i.renter_id === parseInt(userId));
    
    return createResponse({
      incidents,
      total: incidents.length,
      statusSummary: {
        pending: incidents.filter(i => i.status === 'pending').length,
        in_progress: incidents.filter(i => i.status === 'in_progress').length,
        closed: incidents.filter(i => i.status === 'closed').length
      },
      severitySummary: {
        low: incidents.filter(i => i.severity === 'low').length,
        medium: incidents.filter(i => i.severity === 'medium').length,
        high: incidents.filter(i => i.severity === 'high').length,
        critical: incidents.filter(i => i.severity === 'critical').length
      }
    });
  },

  // Get incidents by rental
  getByRental: async (rentalId) => {
    await simulateDelay();
    const incidents = mockData.incidentReports.filter(i => i.rental_id === parseInt(rentalId));
    
    return createResponse(incidents);
  },

  // Get pending incidents
  getPending: async () => {
    await simulateDelay();
    const pendingIncidents = mockData.incidentReports.filter(i => i.status === 'pending');
    
    return createResponse(pendingIncidents);
  },

  // Get incident statistics
  getStats: async (params = {}) => {
    await simulateDelay();
    let incidents = [...mockData.incidentReports];
    
    // Filter by date range if provided
    if (params.start_date) {
      incidents = incidents.filter(i => 
        new Date(i.incident_date) >= new Date(params.start_date)
      );
    }
    
    if (params.end_date) {
      incidents = incidents.filter(i => 
        new Date(i.incident_date) <= new Date(params.end_date)
      );
    }
    
    const total = incidents.length;
    const pending = incidents.filter(i => i.status === 'pending').length;
    const inProgress = incidents.filter(i => i.status === 'in_progress').length;
    const closed = incidents.filter(i => i.status === 'closed').length;
    
    // Severity breakdown
    const low = incidents.filter(i => i.severity === 'low').length;
    const medium = incidents.filter(i => i.severity === 'medium').length;
    const high = incidents.filter(i => i.severity === 'high').length;
    const critical = incidents.filter(i => i.severity === 'critical').length;
    
    // Calculate total repair costs
    const incidentsWithCosts = incidents.filter(i => i.repair_cost !== null);
    const totalRepairCost = incidentsWithCosts.reduce((sum, i) => sum + i.repair_cost, 0);
    const insuranceCovered = incidents.filter(i => i.insurance_covered).length;
    
    // Calculate average resolution time
    const closedIncidents = incidents.filter(i => i.resolved_at);
    const avgResolutionTime = closedIncidents.length > 0 ? 
      closedIncidents.reduce((sum, i) => {
        const incidentDate = new Date(i.incident_date);
        const resolvedAt = new Date(i.resolved_at);
        const hours = (resolvedAt - incidentDate) / (1000 * 60 * 60);
        return sum + hours;
      }, 0) / closedIncidents.length : 0;
    
    return createResponse({
      total,
      statusBreakdown: {
        pending,
        inProgress,
        closed
      },
      severityBreakdown: {
        low,
        medium,
        high,
        critical
      },
      financial: {
        totalRepairCost,
        averageRepairCost: incidentsWithCosts.length > 0 ? totalRepairCost / incidentsWithCosts.length : 0,
        insuranceCovered,
        insuranceCoverage: total > 0 ? Math.round((insuranceCovered / total) * 100) : 0
      },
      averageResolutionTime: Math.round(avgResolutionTime * 100) / 100
    });
  },

  // Get high severity incidents
  getHighSeverity: async () => {
    await simulateDelay();
    const highSeverityIncidents = mockData.incidentReports.filter(i => 
      i.severity === 'high' || i.severity === 'critical'
    );
    
    return createResponse(highSeverityIncidents);
  },

  // Search incidents by description
  search: async (searchTerm) => {
    await simulateDelay();
    const searchLower = searchTerm.toLowerCase();
    const matchingIncidents = mockData.incidentReports.filter(i => 
      i.description.toLowerCase().includes(searchLower) ||
      i.notes?.toLowerCase().includes(searchLower)
    );
    
    return createResponse(matchingIncidents);
  },

  // Renter API methods - matching exact specification
  renter: {
    // Submit incident report (POST /api/renter/incidents)
    submitIncident: async (incidentData) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Validate required fields
      if (!incidentData.vehicle_id) {
        return createErrorResponse("Thiếu thông tin vehicle_id", 400);
      }
      
      if (!incidentData.description) {
        return createErrorResponse("Thiếu mô tả sự cố", 400);
      }
      
      if (!incidentData.severity) {
        return createErrorResponse("Thiếu mức độ nghiêm trọng", 400);
      }
      
      // Validate severity values
      const validSeverities = ['low', 'medium', 'high'];
      if (!validSeverities.includes(incidentData.severity)) {
        return createErrorResponse("Mức độ nghiêm trọng không hợp lệ", 400);
      }
      
      // Validate vehicle exists
      const vehicle = mockData.vehicles.find(v => v.id === parseInt(incidentData.vehicle_id));
      if (!vehicle) {
        return createErrorResponse("Không tìm thấy xe", 404);
      }
      
      // Validate rental if provided
      if (incidentData.rental_id) {
        const rental = mockData.rentals.find(r => 
          r.id === parseInt(incidentData.rental_id) && 
          r.renter_id === currentUserId
        );
        
        if (!rental) {
          return createErrorResponse("Không tìm thấy lượt thuê", 404);
        }
      }
      
      const newIncident = {
        id: Math.max(...mockData.incidentReports.map(i => i.id), 0) + 1,
        vehicle_id: parseInt(incidentData.vehicle_id),
        rental_id: incidentData.rental_id ? parseInt(incidentData.rental_id) : null,
        renter_id: currentUserId,
        description: incidentData.description,
        severity: incidentData.severity,
        status: 'pending',
        staff_id: null,
        repair_cost: null,
        insurance_covered: false,
        notes: null,
        resolved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockData.incidentReports.push(newIncident);
      
      return createResponse({
        incident: {
          id: newIncident.id,
          vehicle_id: newIncident.vehicle_id,
          rental_id: newIncident.rental_id,
          description: newIncident.description,
          severity: newIncident.severity,
          status: newIncident.status,
          created_at: newIncident.created_at
        }
      });
    },

    // Get incident reports (GET /api/renter/incidents)
    getIncidents: async () => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      const incidents = mockData.incidentReports.filter(i => i.renter_id === currentUserId);
      
      // Return incidents with required fields for list view
      const formattedIncidents = incidents.map(incident => ({
        id: incident.id,
        vehicle_id: incident.vehicle_id,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        created_at: incident.created_at,
        resolved_at: incident.resolved_at
      }));
      
      // Sort by creation date (newest first)
      formattedIncidents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return createResponse({
        incidents: formattedIncidents
      });
    }
  },

  // Staff API methods - matching exact specification
  staff: {
    // Report incident at station (POST /api/staff/incidents)
    reportIncident: async (incidentData) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate staff exists and has proper role
      const staff = mockData.users.find(u => u.id === currentStaffId && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Validate required fields
      if (!incidentData.vehicle_id) {
        return createErrorResponse("Thiếu thông tin vehicle_id", 400);
      }
      
      if (!incidentData.description) {
        return createErrorResponse("Thiếu mô tả sự cố", 400);
      }
      
      if (!incidentData.severity) {
        return createErrorResponse("Thiếu mức độ nghiêm trọng", 400);
      }
      
      // Validate severity values
      const validSeverities = ['low', 'medium', 'high'];
      if (!validSeverities.includes(incidentData.severity)) {
        return createErrorResponse("Mức độ nghiêm trọng không hợp lệ", 400);
      }
      
      // Validate vehicle exists
      const vehicle = mockData.vehicles.find(v => v.id === parseInt(incidentData.vehicle_id));
      if (!vehicle) {
        return createErrorResponse("Không tìm thấy xe", 404);
      }
      
      // Validate rental if provided
      if (incidentData.rental_id) {
        const rental = mockData.rentals.find(r => r.id === parseInt(incidentData.rental_id));
        if (!rental) {
          return createErrorResponse("Không tìm thấy lượt thuê", 404);
        }
      }
      
      // Create new incident record
      const newIncident = {
        id: Math.max(...mockData.incidentReports.map(i => i.id), 0) + 1,
        vehicle_id: parseInt(incidentData.vehicle_id),
        rental_id: incidentData.rental_id ? parseInt(incidentData.rental_id) : null,
        renter_id: null, // Staff report, not renter report
        staff_id: currentStaffId,
        description: incidentData.description,
        severity: incidentData.severity,
        status: 'pending',
        repair_cost: null,
        insurance_covered: false,
        notes: null,
        resolved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockData.incidentReports.push(newIncident);
      
      return createResponse({
        incident_id: newIncident.id,
        vehicle_id: newIncident.vehicle_id,
        rental_id: newIncident.rental_id,
        staff_id: newIncident.staff_id,
        description: newIncident.description,
        severity: newIncident.severity,
        status: newIncident.status,
        created_at: newIncident.created_at
      }, true, "Sự cố đã được ghi nhận.");
    }
  },

  // Admin namespace for incident monitoring
  admin: {
    // Get all incidents for admin monitoring
    getIncidents: async (params = {}) => {
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
      
      let incidents = [...mockData.incidentReports];
      
      // Filter by rental_id if specified
      if (params.rental_id) {
        incidents = incidents.filter(i => i.rental_id === parseInt(params.rental_id));
      }
      
      // Filter by status if specified
      if (params.status && ['pending', 'in_review', 'resolved'].includes(params.status)) {
        incidents = incidents.filter(i => i.status === params.status);
      }
      
      // Format response according to API spec
      const formattedIncidents = incidents.map(incident => ({
        id: incident.id,
        rental_id: incident.rental_id || null,
        vehicle_id: incident.vehicle_id || null,
        station_id: incident.station_id || null,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        created_at: incident.created_at
      }));
      
      // Sort by creation date (newest first)
      formattedIncidents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return {
        incidents: formattedIncidents
      };
    },

    // Get incident by ID for admin monitoring
    getIncidentById: async (id) => {
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
      
      const incident = mockData.incidentReports.find(i => i.id === parseInt(id));
      if (!incident) {
        return {
          status: 404,
          error: "IncidentNotFound",
          message: "Không tìm thấy báo cáo sự cố"
        };
      }
      
      return {
        id: incident.id,
        rental_id: incident.rental_id || null,
        vehicle_id: incident.vehicle_id || null,
        station_id: incident.station_id || null,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        created_at: incident.created_at,
        updated_at: incident.updated_at
      };
    },

    // Update incident status
    updateIncident: async (id, updateData) => {
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
      
      const incidentIndex = mockData.incidentReports.findIndex(i => i.id === parseInt(id));
      if (incidentIndex === -1) {
        return {
          status: 404,
          error: "IncidentNotFound",
          message: "Không tìm thấy báo cáo sự cố"
        };
      }
      
      // Validate status
      if (updateData.status && !['in_review', 'resolved'].includes(updateData.status)) {
        return {
          status: 400,
          error: "ValidationError",
          message: "Trạng thái không hợp lệ"
        };
      }
      
      // Update incident
      const updatedIncident = {
        ...mockData.incidentReports[incidentIndex],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      mockData.incidentReports[incidentIndex] = updatedIncident;
      
      return {
        message: "Cập nhật sự cố thành công",
        incident: {
          id: updatedIncident.id,
          status: updatedIncident.status,
          updated_at: updatedIncident.updated_at
        }
      };
    },

    // Get incidents for specific renter
    getRenterIncidents: async (renterId) => {
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
      
      // Get all incidents for this renter through their rentals
      const renterRentals = mockData.rentals.filter(r => r.user_id === parseInt(renterId));
      const rentalIds = renterRentals.map(r => r.id);
      
      const renterIncidents = mockData.incidentReports.filter(i => 
        i.rental_id && rentalIds.includes(i.rental_id)
      );
      
      // Format incidents according to API spec
      const incidents = renterIncidents.map(incident => ({
        id: incident.id,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        created_at: incident.created_at
      }));
      
      // Sort by creation date (newest first)
      incidents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return {
        incidents: incidents
      };
    }
  }
};