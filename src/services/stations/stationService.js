// Station Service API
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

export const stationService = {
  // Get all stations
  getAll: async (params = {}) => {
    await simulateDelay();
    let stations = [...mockData.stations];
    
    // Search by name or address
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      stations = stations.filter(station => 
        station.name.toLowerCase().includes(searchTerm) ||
        station.address.toLowerCase().includes(searchTerm)
      );
    }
    
    return createResponse(stations);
  },

  // Get station by ID
  getById: async (id) => {
    await simulateDelay();
    const station = mockData.stations.find(s => s.id === parseInt(id));
    if (station) {
      return createResponse(station);
    }
    return createErrorResponse("Station not found", 404);
  },

  // Create new station
  create: async (stationData) => {
    await simulateDelay();
    const newStation = {
      id: Math.max(...mockData.stations.map(s => s.id)) + 1,
      ...stationData
    };
    
    mockData.stations.push(newStation);
    return createResponse(newStation);
  },

  // Update station
  update: async (id, stationData) => {
    await simulateDelay();
    const stationIndex = mockData.stations.findIndex(s => s.id === parseInt(id));
    if (stationIndex === -1) {
      return createErrorResponse("Station not found", 404);
    }
    
    mockData.stations[stationIndex] = {
      ...mockData.stations[stationIndex],
      ...stationData
    };
    
    return createResponse(mockData.stations[stationIndex]);
  },

  // Delete station
  delete: async (id) => {
    await simulateDelay();
    const stationIndex = mockData.stations.findIndex(s => s.id === parseInt(id));
    if (stationIndex === -1) {
      return createErrorResponse("Station not found", 404);
    }
    
    // Check if station has active vehicles
    const vehiclesAtStation = mockData.vehicles.filter(v => v.station_id === parseInt(id));
    if (vehiclesAtStation.length > 0) {
      return createErrorResponse("Cannot delete station with active vehicles", 409);
    }
    
    mockData.stations.splice(stationIndex, 1);
    return createResponse({ message: "Station deleted successfully" });
  },

  // Get stations within radius (for location-based search)
  getByLocation: async (latitude, longitude, radiusKm = 10) => {
    await simulateDelay();
    
    // Simple distance calculation (Haversine formula approximation)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };
    
    const nearbyStations = mockData.stations
      .map(station => ({
        ...station,
        distance: calculateDistance(latitude, longitude, station.latitude, station.longitude)
      }))
      .filter(station => station.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
    
    return createResponse(nearbyStations);
  },

  // Get station statistics
  getStats: async (id) => {
    await simulateDelay();
    const station = mockData.stations.find(s => s.id === parseInt(id));
    if (!station) {
      return createErrorResponse("Station not found", 404);
    }
    
    const vehicles = mockData.vehicles.filter(v => v.station_id === parseInt(id));
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const rentedVehicles = vehicles.filter(v => v.status === 'rented').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    
    // Get rentals from this station
    const rentalsFromStation = mockData.rentals.filter(r => r.station_pickup_id === parseInt(id));
    const totalRentals = rentalsFromStation.length;
    
    return createResponse({
      station,
      vehicleStats: {
        total: totalVehicles,
        available: availableVehicles,
        rented: rentedVehicles,
        maintenance: maintenanceVehicles
      },
      totalRentals
    });
  },

  // Renter API methods - matching exact specification
  renter: {
    // Get stations for booking (GET /api/renter/stations)
    getStations: async () => {
      await simulateDelay();
      
      // Only return active stations with basic info
      const stations = mockData.stations
        .filter(station => station.status === 'active')
        .map(station => ({
          id: station.id,
          name: station.name,
          address: station.address,
          latitude: station.latitude,
          longitude: station.longitude
        }));

      return createResponse({
        stations: stations
      });
    }
  },

  // Admin API methods - matching exact specification
  admin: {
    // Create station (POST /api/admin/stations)
    createStation: async (stationData) => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Validate required fields
      if (!stationData.name) {
        return {
          success: false,
          status: 400,
          error: "ValidationError",
          message: "Tên trạm hoặc địa chỉ không hợp lệ"
        };
      }
      
      if (!stationData.address) {
        return {
          success: false,
          status: 400,
          error: "ValidationError",
          message: "Tên trạm hoặc địa chỉ không hợp lệ"
        };
      }
      
      if (stationData.latitude === undefined || stationData.longitude === undefined) {
        return {
          success: false,
          status: 400,
          error: "ValidationError",
          message: "Tên trạm hoặc địa chỉ không hợp lệ"
        };
      }
      
      // Validate coordinates
      if (stationData.latitude < -90 || stationData.latitude > 90) {
        return {
          success: false,
          status: 400,
          error: "ValidationError",
          message: "Tên trạm hoặc địa chỉ không hợp lệ"
        };
      }
      
      if (stationData.longitude < -180 || stationData.longitude > 180) {
        return {
          success: false,
          status: 400,
          error: "ValidationError",
          message: "Tên trạm hoặc địa chỉ không hợp lệ"
        };
      }
      
      // Check if station with same name already exists
      const existingStation = mockData.stations.find(s => 
        s.name.toLowerCase() === stationData.name.toLowerCase()
      );
      
      if (existingStation) {
        return {
          success: false,
          status: 400,
          error: "ValidationError",
          message: "Tên trạm hoặc địa chỉ không hợp lệ"
        };
      }
      
      // Create new station
      const newStation = {
        id: Math.max(...mockData.stations.map(s => s.id), 0) + 1,
        name: stationData.name,
        address: stationData.address,
        latitude: parseFloat(stationData.latitude),
        longitude: parseFloat(stationData.longitude),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockData.stations.push(newStation);
      
      return createResponse({
        id: newStation.id,
        name: newStation.name,
        address: newStation.address,
        latitude: newStation.latitude,
        longitude: newStation.longitude,
        created_at: newStation.created_at
      });
    },

    // Get all stations (GET /api/admin/stations)
    getStations: async () => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      const stations = mockData.stations.map(station => ({
        id: station.id,
        name: station.name,
        address: station.address,
        latitude: station.latitude,
        longitude: station.longitude
      }));
      
      // Sort by name for consistent ordering
      stations.sort((a, b) => a.name.localeCompare(b.name));
      
      return createResponse({
        stations: stations
      });
    },

    // Get station by ID (GET /api/admin/stations/:id)
    getStationById: async (stationId) => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      const station = mockData.stations.find(s => s.id === parseInt(stationId));
      
      if (!station) {
        return {
          success: false,
          status: 404,
          error: "StationNotFound",
          message: "Không tìm thấy trạm"
        };
      }
      
      return createResponse({
        id: station.id,
        name: station.name,
        address: station.address,
        latitude: station.latitude,
        longitude: station.longitude,
        created_at: station.created_at
      });
    },

    // Update station (PUT /api/admin/stations/:id)
    updateStation: async (stationId, updateData) => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      const stationIndex = mockData.stations.findIndex(s => s.id === parseInt(stationId));
      
      if (stationIndex === -1) {
        return {
          success: false,
          status: 404,
          error: "StationNotFound",
          message: "Không tìm thấy trạm"
        };
      }
      
      // Validate coordinates if provided
      if (updateData.latitude !== undefined) {
        if (updateData.latitude < -90 || updateData.latitude > 90) {
          return createErrorResponse("Tọa độ không hợp lệ", 400);
        }
      }
      
      if (updateData.longitude !== undefined) {
        if (updateData.longitude < -180 || updateData.longitude > 180) {
          return createErrorResponse("Tọa độ không hợp lệ", 400);
        }
      }
      
      // Check if new name conflicts with existing station
      if (updateData.name) {
        const existingStation = mockData.stations.find(s => 
          s.name.toLowerCase() === updateData.name.toLowerCase() && 
          s.id !== parseInt(stationId)
        );
        
        if (existingStation) {
          return createErrorResponse("Tên trạm đã tồn tại", 400);
        }
      }
      
      // Update station
      const updatedData = {};
      if (updateData.name) updatedData.name = updateData.name;
      if (updateData.address) updatedData.address = updateData.address;
      if (updateData.latitude !== undefined) updatedData.latitude = parseFloat(updateData.latitude);
      if (updateData.longitude !== undefined) updatedData.longitude = parseFloat(updateData.longitude);
      
      mockData.stations[stationIndex] = {
        ...mockData.stations[stationIndex],
        ...updatedData,
        updated_at: new Date().toISOString()
      };
      
      const updatedStation = mockData.stations[stationIndex];
      
      return createResponse({
        id: updatedStation.id,
        name: updatedStation.name,
        address: updatedStation.address,
        latitude: updatedStation.latitude,
        longitude: updatedStation.longitude,
        updated_at: updatedStation.updated_at
      });
    },

    // Delete station (DELETE /api/admin/stations/:id)
    deleteStation: async (stationId) => {
      await simulateDelay();
      
      // Get current admin (simulate from token)
      const currentAdminId = 1; // This would come from JWT token in real implementation
      
      // Validate admin exists and has proper role
      const admin = mockData.users.find(u => u.id === currentAdminId && u.role === 'admin');
      if (!admin) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      const stationIndex = mockData.stations.findIndex(s => s.id === parseInt(stationId));
      
      if (stationIndex === -1) {
        return {
          success: false,
          status: 404,
          error: "StationNotFound",
          message: "Không tìm thấy trạm"
        };
      }
      
      // Check if station has active vehicles
      const vehiclesAtStation = mockData.vehicles.filter(v => v.station_id === parseInt(stationId));
      if (vehiclesAtStation.length > 0) {
        return createErrorResponse("Không thể xóa trạm có xe đang hoạt động", 409);
      }
      
      // Check if station has active staff assignments
      const staffAtStation = mockData.staffStations.filter(ss => 
        ss.station_id === parseInt(stationId) && ss.is_active
      );
      if (staffAtStation.length > 0) {
        return createErrorResponse("Không thể xóa trạm có nhân viên đang làm việc", 409);
      }
      
      mockData.stations.splice(stationIndex, 1);
      
      return createResponse({
        status: "success",
        message: "Đã xóa trạm thành công"
      });
    }
  }
};