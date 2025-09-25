// Vehicle Service API
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

export const vehicleService = {
  // Get all vehicles with filtering
  getAll: async (params = {}) => {
    await simulateDelay();
    let vehicles = [...mockData.vehicles];
    
    // Filter by station
    if (params.station_id) {
      vehicles = vehicles.filter(v => v.station_id === parseInt(params.station_id));
    }
    
    // Filter by type
    if (params.type) {
      vehicles = vehicles.filter(v => v.type === params.type);
    }
    
    // Filter by status
    if (params.status) {
      vehicles = vehicles.filter(v => v.status === params.status);
    }
    
    // Filter by brand
    if (params.brand) {
      vehicles = vehicles.filter(v => v.brand.toLowerCase().includes(params.brand.toLowerCase()));
    }
    
    // Search by license plate
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      vehicles = vehicles.filter(v => 
        v.license_plate.toLowerCase().includes(searchTerm) ||
        v.brand.toLowerCase().includes(searchTerm) ||
        v.model.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return createResponse({
      vehicles: vehicles.slice(startIndex, endIndex),
      total: vehicles.length,
      page,
      limit,
      totalPages: Math.ceil(vehicles.length / limit)
    });
  },

  // Get vehicle by ID
  getById: async (id) => {
    await simulateDelay();
    const vehicle = mockData.vehicles.find(v => v.id === parseInt(id));
    if (vehicle) {
      return createResponse(vehicle);
    }
    return createErrorResponse("Vehicle not found", 404);
  },

  // Get available vehicles
  getAvailable: async (params = {}) => {
    await simulateDelay();
    let vehicles = mockData.vehicles.filter(v => v.status === 'available');
    
    if (params.type) {
      vehicles = vehicles.filter(v => v.type === params.type);
    }
    
    if (params.station_id) {
      vehicles = vehicles.filter(v => v.station_id === parseInt(params.station_id));
    }
    
    // Sort by price if requested
    if (params.sort_by_price) {
      vehicles.sort((a, b) => {
        return params.sort_by_price === 'asc' ? 
          a.price_per_hour - b.price_per_hour : 
          b.price_per_hour - a.price_per_hour;
      });
    }
    
    return createResponse(vehicles);
  },

  // Create new vehicle
  create: async (vehicleData) => {
    await simulateDelay();
    const existingVehicle = mockData.vehicles.find(v => v.license_plate === vehicleData.license_plate);
    if (existingVehicle) {
      return createErrorResponse("License plate already exists", 409);
    }
    
    const newVehicle = {
      id: Math.max(...mockData.vehicles.map(v => v.id)) + 1,
      ...vehicleData,
      status: vehicleData.status || 'available'
    };
    
    mockData.vehicles.push(newVehicle);
    return createResponse(newVehicle);
  },

  // Update vehicle
  update: async (id, vehicleData) => {
    await simulateDelay();
    const vehicleIndex = mockData.vehicles.findIndex(v => v.id === parseInt(id));
    if (vehicleIndex === -1) {
      return createErrorResponse("Vehicle not found", 404);
    }
    
    // Check if license plate is being changed and already exists
    if (vehicleData.license_plate && vehicleData.license_plate !== mockData.vehicles[vehicleIndex].license_plate) {
      const existingVehicle = mockData.vehicles.find(v => v.license_plate === vehicleData.license_plate);
      if (existingVehicle) {
        return createErrorResponse("License plate already exists", 409);
      }
    }
    
    mockData.vehicles[vehicleIndex] = {
      ...mockData.vehicles[vehicleIndex],
      ...vehicleData
    };
    
    return createResponse(mockData.vehicles[vehicleIndex]);
  },

  // Delete vehicle
  delete: async (id) => {
    await simulateDelay();
    const vehicleIndex = mockData.vehicles.findIndex(v => v.id === parseInt(id));
    if (vehicleIndex === -1) {
      return createErrorResponse("Vehicle not found", 404);
    }
    
    // Check if vehicle is currently rented
    const activeRental = mockData.rentals.find(r => 
      r.vehicle_id === parseInt(id) && 
      (r.status === 'in_use' || r.status === 'booked')
    );
    
    if (activeRental) {
      return createErrorResponse("Cannot delete vehicle with active rental", 409);
    }
    
    mockData.vehicles.splice(vehicleIndex, 1);
    return createResponse({ message: "Vehicle deleted successfully" });
  },

  // Update vehicle status
  updateStatus: async (id, status) => {
    await simulateDelay();
    const vehicleIndex = mockData.vehicles.findIndex(v => v.id === parseInt(id));
    if (vehicleIndex === -1) {
      return createErrorResponse("Vehicle not found", 404);
    }
    
    const validStatuses = ['available', 'rented', 'reserved', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return createErrorResponse("Invalid status", 400);
    }
    
    mockData.vehicles[vehicleIndex].status = status;
    
    return createResponse(mockData.vehicles[vehicleIndex]);
  },

  // Get vehicle usage statistics
  getUsageStats: async (id) => {
    await simulateDelay();
    const vehicle = mockData.vehicles.find(v => v.id === parseInt(id));
    if (!vehicle) {
      return createErrorResponse("Vehicle not found", 404);
    }
    
    const rentals = mockData.rentals.filter(r => r.vehicle_id === parseInt(id));
    const totalRentals = rentals.length;
    const completedRentals = rentals.filter(r => r.status === 'returned');
    
    const totalHours = completedRentals.reduce((sum, rental) => {
      if (rental.start_time && rental.end_time) {
        const hours = (new Date(rental.end_time) - new Date(rental.start_time)) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    const totalRevenue = completedRentals.reduce((sum, r) => sum + (r.total_cost || 0), 0);
    const totalDistance = completedRentals.reduce((sum, r) => sum + (r.total_distance || 0), 0);
    
    return createResponse({
      vehicle,
      stats: {
        totalRentals,
        completedRentals: completedRentals.length,
        totalHours: Math.round(totalHours * 100) / 100,
        totalRevenue,
        totalDistance: Math.round(totalDistance * 100) / 100,
        averageRentalDuration: completedRentals.length > 0 ? 
          Math.round((totalHours / completedRentals.length) * 100) / 100 : 0
      }
    });
  },

  // Get vehicles by type and capacity
  getByTypeAndCapacity: async (type, minCapacity = 1) => {
    await simulateDelay();
    const vehicles = mockData.vehicles.filter(v => 
      v.type === type && 
      v.capacity >= minCapacity &&
      v.status === 'available'
    );
    
    return createResponse(vehicles);
  },

  // Renter API methods - matching exact specification
  renter: {
    // Get available vehicles for booking (GET /api/renter/vehicles)
    getAvailableVehicles: async (params = {}) => {
      await simulateDelay();
      
      // Start with available vehicles only
      let vehicles = mockData.vehicles.filter(v => v.status === 'available');
      
      // Filter by type
      if (params.type) {
        vehicles = vehicles.filter(v => v.type === params.type);
      }
      
      // Filter by station
      if (params.station_id) {
        vehicles = vehicles.filter(v => v.station_id === parseInt(params.station_id));
      }
      
      // Filter by price range
      if (params.price_min) {
        vehicles = vehicles.filter(v => v.price_per_hour >= parseFloat(params.price_min));
      }
      
      if (params.price_max) {
        vehicles = vehicles.filter(v => v.price_per_hour <= parseFloat(params.price_max));
      }
      
      // Return only required fields for renter
      const availableVehicles = vehicles.map(vehicle => ({
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        capacity: vehicle.capacity,
        status: vehicle.status,
        price_per_hour: vehicle.price_per_hour,
        station_id: vehicle.station_id
      }));

      return createResponse({
        vehicles: availableVehicles
      });
    }
  },

  // Staff API methods - matching exact specification
  staff: {
    // Get vehicles at station (GET /api/staff/stations/:id/vehicles)
    getStationVehicles: async (stationId) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate staff exists and has proper role
      const staff = mockData.users.find(u => u.id === currentStaffId && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Validate station exists
      const station = mockData.stations.find(s => s.id === parseInt(stationId));
      if (!station) {
        return createErrorResponse("Không tìm thấy trạm", 404);
      }
      
      // Get vehicles at the specified station
      const stationVehicles = mockData.vehicles.filter(v => v.station_id === parseInt(stationId));
      
      // Format response data
      const formattedVehicles = stationVehicles.map(vehicle => ({
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        status: vehicle.status,
        price_per_hour: vehicle.price_per_hour
      }));
      
      // Sort by license plate for consistent ordering
      formattedVehicles.sort((a, b) => a.license_plate.localeCompare(b.license_plate));
      
      return createResponse({
        vehicles: formattedVehicles
      });
    },

    // Update vehicle status (PUT /api/staff/vehicles/:id/status)
    updateVehicleStatus: async (vehicleId, statusData) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate staff exists and has proper role
      const staff = mockData.users.find(u => u.id === currentStaffId && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Validate vehicle exists
      const vehicle = mockData.vehicles.find(v => v.id === parseInt(vehicleId));
      if (!vehicle) {
        return createErrorResponse("Không tìm thấy xe", 404);
      }
      
      // Validate required fields
      if (!statusData.status) {
        return createErrorResponse("Thiếu thông tin trạng thái", 400);
      }
      
      // Validate status values
      const validStatuses = ['available', 'rented', 'maintenance'];
      if (!validStatuses.includes(statusData.status)) {
        return createErrorResponse("Trạng thái không hợp lệ", 400);
      }
      
      // Update vehicle status
      const vehicleIndex = mockData.vehicles.findIndex(v => v.id === parseInt(vehicleId));
      mockData.vehicles[vehicleIndex] = {
        ...mockData.vehicles[vehicleIndex],
        status: statusData.status,
        updated_at: new Date().toISOString(),
        updated_by: currentStaffId
      };
      
      return createResponse({
        vehicle_id: parseInt(vehicleId),
        status: statusData.status
      }, true, "Cập nhật trạng thái xe thành công.");
    }
  },

  // Admin API methods - matching exact specification
  admin: {
    // Create vehicle (POST /api/admin/vehicles)
    createVehicle: async (vehicleData) => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Validate required fields
      if (!vehicleData.license_plate || !vehicleData.type || !vehicleData.brand || 
          !vehicleData.model || !vehicleData.capacity || !vehicleData.status || 
          !vehicleData.price_per_hour || !vehicleData.station_id) {
        return createErrorResponse("Thiếu thông tin bắt buộc", 400);
      }
      
      // Validate license plate uniqueness
      const existingVehicle = mockData.vehicles.find(v => 
        v.license_plate.toLowerCase() === vehicleData.license_plate.toLowerCase()
      );
      
      if (existingVehicle) {
        return {
          success: false,
          status: 400,
          error: "DuplicateLicensePlate",
          message: "Biển số phương tiện đã tồn tại"
        };
      }
      
      // Validate vehicle type
      const validTypes = ['car', 'motorbike'];
      if (!validTypes.includes(vehicleData.type)) {
        return createErrorResponse("Loại xe không hợp lệ", 400);
      }
      
      // Validate status
      const validStatuses = ['available', 'reserved', 'maintenance'];
      if (!validStatuses.includes(vehicleData.status)) {
        return createErrorResponse("Trạng thái không hợp lệ", 400);
      }
      
      // Validate station exists
      const station = mockData.stations.find(s => s.id === parseInt(vehicleData.station_id));
      if (!station) {
        return createErrorResponse("Không tìm thấy trạm", 404);
      }
      
      // Validate positive values
      if (vehicleData.capacity <= 0 || vehicleData.price_per_hour <= 0) {
        return createErrorResponse("Sức chứa và giá thuê phải lớn hơn 0", 400);
      }
      
      // Create new vehicle
      const newVehicle = {
        id: Math.max(...mockData.vehicles.map(v => v.id), 0) + 1,
        license_plate: vehicleData.license_plate,
        type: vehicleData.type,
        brand: vehicleData.brand,
        model: vehicleData.model,
        capacity: parseInt(vehicleData.capacity),
        status: vehicleData.status,
        price_per_hour: parseFloat(vehicleData.price_per_hour),
        station_id: parseInt(vehicleData.station_id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockData.vehicles.push(newVehicle);
      
      return createResponse({
        id: newVehicle.id,
        license_plate: newVehicle.license_plate,
        type: newVehicle.type,
        brand: newVehicle.brand,
        model: newVehicle.model,
        capacity: newVehicle.capacity,
        status: newVehicle.status,
        price_per_hour: newVehicle.price_per_hour,
        station_id: newVehicle.station_id,
        created_at: newVehicle.created_at
      });
    },

    // Get all vehicles (GET /api/admin/vehicles)
    getVehicles: async (params = {}) => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      let vehicles = [...mockData.vehicles];
      
      // Filter by status
      if (params.status) {
        vehicles = vehicles.filter(v => v.status === params.status);
      }
      
      // Filter by license plate (plate_number in query params)
      if (params.plate_number) {
        vehicles = vehicles.filter(v => 
          v.license_plate.toLowerCase().includes(params.plate_number.toLowerCase())
        );
      }
      
      // Format response data
      const formattedVehicles = vehicles.map(vehicle => ({
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        status: vehicle.status,
        station_id: vehicle.station_id
      }));
      
      // Sort by license plate for consistent ordering
      formattedVehicles.sort((a, b) => a.license_plate.localeCompare(b.license_plate));
      
      return createResponse({
        vehicles: formattedVehicles
      });
    },

    // Get vehicle by ID (GET /api/admin/vehicles/:id)
    getVehicleById: async (vehicleId) => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      const vehicle = mockData.vehicles.find(v => v.id === parseInt(vehicleId));
      
      if (!vehicle) {
        return createErrorResponse("Không tìm thấy xe", 404);
      }
      
      return createResponse({
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        capacity: vehicle.capacity,
        status: vehicle.status,
        price_per_hour: vehicle.price_per_hour,
        station_id: vehicle.station_id
      });
    },

    // Update vehicle (PUT /api/admin/vehicles/:id)
    updateVehicle: async (vehicleId, updateData) => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      const vehicleIndex = mockData.vehicles.findIndex(v => v.id === parseInt(vehicleId));
      
      if (vehicleIndex === -1) {
        return createErrorResponse("Không tìm thấy xe", 404);
      }
      
      // Validate license plate uniqueness if provided
      if (updateData.license_plate) {
        const existingVehicle = mockData.vehicles.find(v => 
          v.license_plate.toLowerCase() === updateData.license_plate.toLowerCase() && 
          v.id !== parseInt(vehicleId)
        );
        
        if (existingVehicle) {
          return {
            success: false,
            status: 400,
            error: "DuplicateLicensePlate",
            message: "Biển số phương tiện đã tồn tại"
          };
        }
      }
      
      // Validate type if provided
      if (updateData.type) {
        const validTypes = ['car', 'motorbike'];
        if (!validTypes.includes(updateData.type)) {
          return createErrorResponse("Loại xe không hợp lệ", 400);
        }
      }
      
      // Validate status if provided
      if (updateData.status) {
        const validStatuses = ['available', 'reserved', 'maintenance', 'rented'];
        if (!validStatuses.includes(updateData.status)) {
          return createErrorResponse("Trạng thái không hợp lệ", 400);
        }
      }
      
      // Validate station if provided
      if (updateData.station_id) {
        const station = mockData.stations.find(s => s.id === parseInt(updateData.station_id));
        if (!station) {
          return createErrorResponse("Không tìm thấy trạm", 404);
        }
      }
      
      // Validate positive values if provided
      if (updateData.capacity && updateData.capacity <= 0) {
        return createErrorResponse("Sức chứa phải lớn hơn 0", 400);
      }
      
      if (updateData.price_per_hour && updateData.price_per_hour <= 0) {
        return createErrorResponse("Giá thuê phải lớn hơn 0", 400);
      }
      
      // Update vehicle
      const updatedData = {};
      if (updateData.license_plate) updatedData.license_plate = updateData.license_plate;
      if (updateData.type) updatedData.type = updateData.type;
      if (updateData.brand) updatedData.brand = updateData.brand;
      if (updateData.model) updatedData.model = updateData.model;
      if (updateData.capacity) updatedData.capacity = parseInt(updateData.capacity);
      if (updateData.status) updatedData.status = updateData.status;
      if (updateData.price_per_hour) updatedData.price_per_hour = parseFloat(updateData.price_per_hour);
      if (updateData.station_id) updatedData.station_id = parseInt(updateData.station_id);
      
      mockData.vehicles[vehicleIndex] = {
        ...mockData.vehicles[vehicleIndex],
        ...updatedData,
        updated_at: new Date().toISOString()
      };
      
      const updatedVehicle = mockData.vehicles[vehicleIndex];
      
      return createResponse({
        id: updatedVehicle.id,
        license_plate: updatedVehicle.license_plate,
        type: updatedVehicle.type,
        brand: updatedVehicle.brand,
        model: updatedVehicle.model,
        capacity: updatedVehicle.capacity,
        status: updatedVehicle.status,
        price_per_hour: updatedVehicle.price_per_hour,
        station_id: updatedVehicle.station_id,
        updated_at: updatedVehicle.updated_at
      });
    },

    // Delete vehicle (DELETE /api/admin/vehicles/:id)
    deleteVehicle: async (vehicleId) => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      const vehicleIndex = mockData.vehicles.findIndex(v => v.id === parseInt(vehicleId));
      
      if (vehicleIndex === -1) {
        return createErrorResponse("Không tìm thấy xe", 404);
      }
      
      // Check if vehicle has active rentals
      const activeRentals = mockData.rentals.filter(r => 
        r.vehicle_id === parseInt(vehicleId) && 
        (r.status === 'confirmed' || r.status === 'in_use')
      );
      
      if (activeRentals.length > 0) {
        return createErrorResponse("Không thể xóa xe có lượt thuê đang hoạt động", 409);
      }
      
      mockData.vehicles.splice(vehicleIndex, 1);
      
      return createResponse({
        status: "success",
        message: "Đã xóa xe thành công"
      });
    },

    // Get vehicle status statistics (GET /api/admin/vehicles/status)
    getVehicleStats: async () => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      const vehicles = mockData.vehicles;
      
      const stats = {
        available: vehicles.filter(v => v.status === 'available').length,
        rented: vehicles.filter(v => v.status === 'rented').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length,
        reserved: vehicles.filter(v => v.status === 'reserved').length
      };
      
      return createResponse(stats);
    }
  }
};