// Reservation Service API
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

export const reservationService = {
  // Get all reservations with filtering
  getAll: async (params = {}) => {
    await simulateDelay();
    let reservations = [...mockData.reservations];
    
    // Filter by renter
    if (params.renter_id) {
      reservations = reservations.filter(r => r.renter_id === parseInt(params.renter_id));
    }
    
    // Filter by status
    if (params.status) {
      reservations = reservations.filter(r => r.status === params.status);
    }
    
    // Filter by station
    if (params.station_id) {
      reservations = reservations.filter(r => r.station_id === parseInt(params.station_id));
    }
    
    // Filter by vehicle type
    if (params.vehicle_type) {
      reservations = reservations.filter(r => r.vehicle_type === params.vehicle_type);
    }
    
    // Filter by date range
    if (params.start_date) {
      reservations = reservations.filter(r => 
        new Date(r.reserved_start_time) >= new Date(params.start_date)
      );
    }
    
    if (params.end_date) {
      reservations = reservations.filter(r => 
        new Date(r.reserved_end_time) <= new Date(params.end_date)
      );
    }
    
    // Sort by creation date (newest first) by default
    reservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return createResponse({
      reservations: reservations.slice(startIndex, endIndex),
      total: reservations.length,
      page,
      limit,
      totalPages: Math.ceil(reservations.length / limit)
    });
  },

  // Get reservation by ID
  getById: async (id) => {
    await simulateDelay();
    const reservation = mockData.reservations.find(r => r.id === parseInt(id));
    if (reservation) {
      return createResponse({
        reservation: reservation
      });
    }
    return createErrorResponse("Không tìm thấy booking", 404);
  },

  // Create new reservation
  create: async (reservationData) => {
    await simulateDelay();
    
    // Validate reservation times
    const startTime = new Date(reservationData.reserved_start_time);
    const endTime = new Date(reservationData.reserved_end_time);
    const now = new Date();
    
    if (startTime <= now) {
      return createErrorResponse("Thời gian không hợp lệ", 400);
    }
    
    if (endTime <= startTime) {
      return createErrorResponse("Thời gian không hợp lệ", 400);
    }
    
    // Check if specific vehicle is selected and available
    if (reservationData.vehicle_id) {
      const vehicle = mockData.vehicles.find(v => v.id === reservationData.vehicle_id);
      if (!vehicle) {
        return createErrorResponse("Vehicle not found", 404);
      }
      
      if (vehicle.status !== 'available') {
        return createErrorResponse("Xe đã được đặt trước", 409);
      }
      
      // Check for conflicting reservations
      const conflictingReservation = mockData.reservations.find(r => 
        r.vehicle_id === reservationData.vehicle_id &&
        r.status !== 'cancelled' &&
        (
          (startTime >= new Date(r.reserved_start_time) && startTime < new Date(r.reserved_end_time)) ||
          (endTime > new Date(r.reserved_start_time) && endTime <= new Date(r.reserved_end_time)) ||
          (startTime <= new Date(r.reserved_start_time) && endTime >= new Date(r.reserved_end_time))
        )
      );
      
      if (conflictingReservation) {
        return createErrorResponse("Xe đã được đặt trước", 409);
      }
      
      // Update vehicle status to reserved
      vehicle.status = 'reserved';
    }
    
    const newReservation = {
      id: Math.max(...mockData.reservations.map(r => r.id)) + 1,
      renter_id: reservationData.renter_id,
      vehicle_id: reservationData.vehicle_id || null,
      vehicle_type: reservationData.vehicle_type || null,
      station_id: reservationData.station_id,
      reserved_start_time: reservationData.reserved_start_time,
      reserved_end_time: reservationData.reserved_end_time,
      status: 'pending',
      cancelled_by: null,
      cancelled_reason: null,
      created_at: new Date().toISOString()
    };
    
    mockData.reservations.push(newReservation);
    return createResponse({
      reservation: newReservation
    });
  },

  // Update reservation
  update: async (id, reservationData) => {
    await simulateDelay();
    const reservationIndex = mockData.reservations.findIndex(r => r.id === parseInt(id));
    if (reservationIndex === -1) {
      return createErrorResponse("Reservation not found", 404);
    }
    
    const currentReservation = mockData.reservations[reservationIndex];
    
    // Cannot update cancelled or expired reservations
    if (currentReservation.status === 'cancelled' || currentReservation.status === 'expired') {
      return createErrorResponse("Cannot update cancelled or expired reservation", 400);
    }
    
    mockData.reservations[reservationIndex] = {
      ...currentReservation,
      ...reservationData
    };
    
    return createResponse(mockData.reservations[reservationIndex]);
  },

  // Cancel reservation
  cancel: async (id, reason, cancelledBy) => {
    await simulateDelay();
    const reservationIndex = mockData.reservations.findIndex(r => r.id === parseInt(id));
    if (reservationIndex === -1) {
      return createErrorResponse("Reservation not found", 404);
    }
    
    const reservation = mockData.reservations[reservationIndex];
    
    if (reservation.status === 'cancelled') {
      return createErrorResponse("Reservation already cancelled", 400);
    }
    
    // If vehicle was reserved, make it available again
    if (reservation.vehicle_id) {
      const vehicle = mockData.vehicles.find(v => v.id === reservation.vehicle_id);
      if (vehicle && vehicle.status === 'reserved') {
        vehicle.status = 'available';
      }
    }
    
    mockData.reservations[reservationIndex] = {
      ...reservation,
      status: 'cancelled',
      cancelled_by: cancelledBy,
      cancelled_reason: reason
    };
    
    return createResponse(mockData.reservations[reservationIndex]);
  },

  // Confirm reservation
  confirm: async (id, vehicleId = null) => {
    await simulateDelay();
    const reservationIndex = mockData.reservations.findIndex(r => r.id === parseInt(id));
    if (reservationIndex === -1) {
      return createErrorResponse("Reservation not found", 404);
    }
    
    const reservation = mockData.reservations[reservationIndex];
    
    if (reservation.status !== 'pending') {
      return createErrorResponse("Only pending reservations can be confirmed", 400);
    }
    
    // If vehicle ID is provided and different from current, update it
    if (vehicleId && vehicleId !== reservation.vehicle_id) {
      const vehicle = mockData.vehicles.find(v => v.id === parseInt(vehicleId));
      if (!vehicle || vehicle.status !== 'available') {
        return createErrorResponse("Selected vehicle not available", 409);
      }
      
      // Free up the previous vehicle if any
      if (reservation.vehicle_id) {
        const previousVehicle = mockData.vehicles.find(v => v.id === reservation.vehicle_id);
        if (previousVehicle) {
          previousVehicle.status = 'available';
        }
      }
      
      // Reserve the new vehicle
      vehicle.status = 'reserved';
      reservation.vehicle_id = parseInt(vehicleId);
    }
    
    mockData.reservations[reservationIndex].status = 'confirmed';
    return createResponse(mockData.reservations[reservationIndex]);
  },

  // Get user's reservations
  getByUser: async (userId, params = {}) => {
    await simulateDelay();
    let reservations = mockData.reservations.filter(r => r.renter_id === parseInt(userId));
    
    if (params.status) {
      reservations = reservations.filter(r => r.status === params.status);
    }
    
    // Sort by creation date (newest first)
    reservations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return createResponse(reservations);
  },

  // Check for expired reservations and update them
  checkExpired: async () => {
    await simulateDelay();
    const now = new Date();
    let updatedCount = 0;
    
    mockData.reservations.forEach(reservation => {
      if (
        reservation.status === 'confirmed' && 
        new Date(reservation.reserved_start_time) < now
      ) {
        reservation.status = 'expired';
        
        // Free up the vehicle
        if (reservation.vehicle_id) {
          const vehicle = mockData.vehicles.find(v => v.id === reservation.vehicle_id);
          if (vehicle && vehicle.status === 'reserved') {
            vehicle.status = 'available';
          }
        }
        
        updatedCount++;
      }
    });
    
    return createResponse({
      message: `Updated ${updatedCount} expired reservations`,
      updatedCount
    });
  },

  // Renter API methods - matching exact specification
  renter: {
    // Create reservation (POST /api/renter/reservations)
    createReservation: async (reservationData) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Validate required fields
      if (!reservationData.station_id) {
        return createErrorResponse("Thiếu thông tin trạm", 400);
      }
      
      if (!reservationData.reserved_start_time || !reservationData.reserved_end_time) {
        return createErrorResponse("Thời gian không hợp lệ", 400);
      }
      
      // Validate time logic
      const startTime = new Date(reservationData.reserved_start_time);
      const endTime = new Date(reservationData.reserved_end_time);
      const now = new Date();
      
      if (startTime <= now) {
        return createErrorResponse("Thời gian bắt đầu phải sau thời gian hiện tại", 400);
      }
      
      if (endTime <= startTime) {
        return createErrorResponse("Thời gian kết thúc phải sau thời gian bắt đầu", 400);
      }
      
      // Must have either vehicle_id or vehicle_type
      if (!reservationData.vehicle_id && !reservationData.vehicle_type) {
        return createErrorResponse("Phải chọn xe cụ thể hoặc loại xe", 400);
      }
      
      // Check if specific vehicle is available
      if (reservationData.vehicle_id) {
        const vehicle = mockData.vehicles.find(v => v.id === reservationData.vehicle_id);
        if (!vehicle) {
          return createErrorResponse("Không tìm thấy xe", 404);
        }
        
        if (vehicle.status !== 'available') {
          return createErrorResponse("Xe không khả dụng", 409);
        }
        
        // Check for overlapping reservations
        const overlappingReservation = mockData.reservations.find(r =>
          r.vehicle_id === reservationData.vehicle_id &&
          r.status === 'pending' &&
          (
            (startTime >= new Date(r.reserved_start_time) && startTime < new Date(r.reserved_end_time)) ||
            (endTime > new Date(r.reserved_start_time) && endTime <= new Date(r.reserved_end_time)) ||
            (startTime <= new Date(r.reserved_start_time) && endTime >= new Date(r.reserved_end_time))
          )
        );
        
        if (overlappingReservation) {
          return createErrorResponse("Xe đã được đặt trước", 409);
        }
      }
      
      // Create new reservation
      const newReservation = {
        id: Math.max(...mockData.reservations.map(r => r.id), 0) + 1,
        renter_id: currentUserId,
        vehicle_id: reservationData.vehicle_id || null,
        vehicle_type: reservationData.vehicle_type || null,
        station_id: reservationData.station_id,
        reserved_start_time: reservationData.reserved_start_time,
        reserved_end_time: reservationData.reserved_end_time,
        status: 'pending',
        created_at: new Date().toISOString(),
        cancelled_by: null,
        cancelled_reason: null
      };
      
      mockData.reservations.push(newReservation);
      
      // Update vehicle status if specific vehicle selected
      if (reservationData.vehicle_id) {
        const vehicle = mockData.vehicles.find(v => v.id === reservationData.vehicle_id);
        if (vehicle) {
          vehicle.status = 'reserved';
        }
      }
      
      return createResponse({
        reservation: newReservation
      });
    },

    // Get renter's reservations (GET /api/renter/reservations)
    getReservations: async () => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      const userReservations = mockData.reservations
        .filter(r => r.renter_id === currentUserId)
        .map(reservation => ({
          id: reservation.id,
          vehicle_id: reservation.vehicle_id,
          vehicle_type: reservation.vehicle_type,
          station_id: reservation.station_id,
          reserved_start_time: reservation.reserved_start_time,
          reserved_end_time: reservation.reserved_end_time,
          status: reservation.status,
          created_at: reservation.created_at
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return createResponse({
        reservations: userReservations
      });
    },

    // Get reservation details (GET /api/renter/reservations/:id)
    getReservationById: async (id) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      const reservation = mockData.reservations.find(r => 
        r.id === parseInt(id) && r.renter_id === currentUserId
      );
      
      if (!reservation) {
        return createErrorResponse("Không tìm thấy booking", 404);
      }
      
      return createResponse({
        reservation: {
          id: reservation.id,
          renter_id: reservation.renter_id,
          vehicle_id: reservation.vehicle_id,
          vehicle_type: reservation.vehicle_type,
          station_id: reservation.station_id,
          reserved_start_time: reservation.reserved_start_time,
          reserved_end_time: reservation.reserved_end_time,
          cancelled_by: reservation.cancelled_by,
          cancelled_reason: reservation.cancelled_reason,
          status: reservation.status,
          created_at: reservation.created_at
        }
      });
    },

    // Cancel reservation (DELETE /api/renter/reservations/:id)
    cancelReservation: async (id) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      const reservation = mockData.reservations.find(r => 
        r.id === parseInt(id) && r.renter_id === currentUserId
      );
      
      if (!reservation) {
        return createErrorResponse("Không tìm thấy booking", 404);
      }
      
      if (reservation.status === 'cancelled') {
        return createErrorResponse("Booking đã được hủy", 400);
      }
      
      if (reservation.status === 'expired') {
        return createErrorResponse("Booking đã hết hạn", 400);
      }
      
      // Check if user owns this reservation
      if (reservation.renter_id !== currentUserId) {
        return createErrorResponse("Bạn không có quyền hủy booking này", 403);
      }
      
      // Update reservation
      const reservationIndex = mockData.reservations.findIndex(r => r.id === parseInt(id));
      mockData.reservations[reservationIndex] = {
        ...reservation,
        status: 'cancelled',
        cancelled_by: currentUserId,
        cancelled_reason: 'Hủy bởi người dùng'
      };
      
      // Update vehicle status if specific vehicle was reserved
      if (reservation.vehicle_id) {
        const vehicle = mockData.vehicles.find(v => v.id === reservation.vehicle_id);
        if (vehicle) {
          vehicle.status = 'available';
        }
      }
      
      return createResponse({
        status: 200,
        message: "Hủy booking thành công"
      });
    }
  }
};