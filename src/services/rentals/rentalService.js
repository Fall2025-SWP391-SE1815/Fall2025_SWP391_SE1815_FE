// Rental Service API
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

export const rentalService = {
  // Get all rentals with filtering
  getAll: async (params = {}) => {
    await simulateDelay();
    let rentals = [...mockData.rentals];
    
    // Filter by renter
    if (params.renter_id) {
      rentals = rentals.filter(r => r.renter_id === parseInt(params.renter_id));
    }
    
    // Filter by status
    if (params.status) {
      rentals = rentals.filter(r => r.status === params.status);
    }
    
    // Filter by vehicle
    if (params.vehicle_id) {
      rentals = rentals.filter(r => r.vehicle_id === parseInt(params.vehicle_id));
    }
    
    // Filter by station
    if (params.station_pickup_id) {
      rentals = rentals.filter(r => r.station_pickup_id === parseInt(params.station_pickup_id));
    }
    
    if (params.station_return_id) {
      rentals = rentals.filter(r => r.station_return_id === parseInt(params.station_return_id));
    }
    
    // Filter by rental type
    if (params.rental_type) {
      rentals = rentals.filter(r => r.rental_type === params.rental_type);
    }
    
    // Filter by date range
    if (params.start_date) {
      rentals = rentals.filter(r => 
        r.start_time && new Date(r.start_time) >= new Date(params.start_date)
      );
    }
    
    if (params.end_date) {
      rentals = rentals.filter(r => 
        r.start_time && new Date(r.start_time) <= new Date(params.end_date)
      );
    }
    
    // Sort by creation date (newest first)
    rentals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return createResponse({
      rentals: rentals.slice(startIndex, endIndex),
      total: rentals.length,
      page,
      limit,
      totalPages: Math.ceil(rentals.length / limit)
    });
  },

  // Get rental by ID
  getById: async (id) => {
    await simulateDelay();
    const rental = mockData.rentals.find(r => r.id === parseInt(id));
    if (rental) {
      return createResponse(rental);
    }
    return createErrorResponse("Rental not found", 404);
  },

  // Check-in method for API compatibility
  checkin: async (checkInData) => {
    await simulateDelay();
    
    let vehicle = null;
    
    // Handle reservation-based checkin
    if (checkInData.reservation_id) {
      const reservation = mockData.reservations.find(r => r.id === checkInData.reservation_id);
      if (!reservation) {
        return createErrorResponse("Không thể check-in cho booking này", 400);
      }
      
      if (reservation.status !== 'confirmed' && reservation.status !== 'pending') {
        return createErrorResponse("Không thể check-in cho booking này", 400);
      }
      
      vehicle = mockData.vehicles.find(v => v.id === reservation.vehicle_id);
      if (!vehicle) {
        return createErrorResponse("Không thể check-in cho booking này", 400);
      }
    } 
    // Handle walk-in checkin
    else if (checkInData.vehicle_id) {
      vehicle = mockData.vehicles.find(v => v.id === checkInData.vehicle_id);
      if (!vehicle || vehicle.status !== 'available') {
        return createErrorResponse("Không thể check-in cho booking này", 400);
      }
    } else {
      return createErrorResponse("Không thể check-in cho booking này", 400);
    }
    
    // Update vehicle status
    vehicle.status = 'rented';
    
    // Create new rental
    const newRental = {
      id: Math.max(...mockData.rentals.map(r => r.id)) + 1,
      renter_id: checkInData.renter_id,
      vehicle_id: vehicle.id,
      station_pickup_id: checkInData.station_id,
      staff_pickup_id: checkInData.staff_id || 2, // Default staff
      start_time: new Date().toISOString(),
      rental_type: checkInData.reservation_id ? 'booking' : 'walk-in',
      deposit_amount: vehicle.type === 'ô tô' ? 500000 : 300000,
      deposit_status: 'held',
      status: 'in_use',
      end_time: null,
      total_distance: null,
      total_cost: null,
      created_at: new Date().toISOString()
    };
    
    mockData.rentals.push(newRental);
    
    // Update reservation if exists
    if (checkInData.reservation_id) {
      const reservation = mockData.reservations.find(r => r.id === checkInData.reservation_id);
      if (reservation) {
        reservation.status = 'completed';
      }
    }
    
    return createResponse({
      rental: newRental
    });
  },

  // Get current active rental
  getCurrent: async (userId) => {
    await simulateDelay();
    const rental = mockData.rentals.find(r => 
      r.renter_id === parseInt(userId) && r.status === 'in_use'
    );
    
    if (rental) {
      return createResponse({
        rental: rental
      });
    }
    
    return createErrorResponse("Bạn không có lượt thuê nào đang hoạt động", 404);
  },

  // Start rental (pickup)
  startRental: async (id, staffId, checkData = {}) => {
    await simulateDelay();
    const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(id));
    if (rentalIndex === -1) {
      return createErrorResponse("Rental not found", 404);
    }
    
    const rental = mockData.rentals[rentalIndex];
    
    if (rental.status !== 'booked') {
      return createErrorResponse("Rental cannot be started", 400);
    }
    
    mockData.rentals[rentalIndex] = {
      ...rental,
      status: 'in_use',
      start_time: new Date().toISOString(),
      staff_pickup_id: staffId
    };
    
    // Create pickup check record if check data provided
    if (Object.keys(checkData).length > 0) {
      const newCheck = {
        id: Math.max(...mockData.rentalChecks.map(c => c.id)) + 1,
        rental_id: parseInt(id),
        staff_id: staffId,
        check_type: 'pickup',
        ...checkData,
        created_at: new Date().toISOString()
      };
      mockData.rentalChecks.push(newCheck);
    }
    
    return createResponse(mockData.rentals[rentalIndex]);
  },

  // End rental (return)
  endRental: async (id, endData) => {
    await simulateDelay();
    const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(id));
    if (rentalIndex === -1) {
      return createErrorResponse("Rental not found", 404);
    }
    
    const rental = mockData.rentals[rentalIndex];
    
    if (rental.status !== 'in_use') {
      return createErrorResponse("Rental is not in use", 400);
    }
    
    // Calculate total cost based on time
    const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
    const startTime = new Date(rental.start_time);
    const endTime = new Date();
    const hours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    const baseCost = hours * vehicle.price_per_hour;
    
    // Add any additional costs from violations
    const violations = mockData.violations.filter(v => v.rental_id === parseInt(id));
    const violationCosts = violations.reduce((sum, v) => sum + v.fine_amount, 0);
    
    const totalCost = baseCost + violationCosts;
    
    // Update vehicle status back to available
    vehicle.status = 'available';
    
    // Update rental
    mockData.rentals[rentalIndex] = {
      ...rental,
      ...endData,
      status: 'returned',
      end_time: endTime.toISOString(),
      total_cost: totalCost
    };
    
    // Create return check record if provided
    if (endData.checkData) {
      const newCheck = {
        id: Math.max(...mockData.rentalChecks.map(c => c.id)) + 1,
        rental_id: parseInt(id),
        staff_id: endData.staff_return_id,
        check_type: 'return',
        ...endData.checkData,
        created_at: new Date().toISOString()
      };
      mockData.rentalChecks.push(newCheck);
    }
    
    // Create payment record
    const newPayment = {
      id: Math.max(...mockData.payments.map(p => p.id)) + 1,
      rental_id: parseInt(id),
      amount: totalCost,
      method: endData.payment_method || 'card',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    mockData.payments.push(newPayment);
    
    return createResponse({
      rental: mockData.rentals[rentalIndex],
      payment: newPayment
    });
  },

  // Return vehicle (API-compatible)
  returnVehicle: async (id, returnData) => {
    await simulateDelay();
    const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(id));
    if (rentalIndex === -1) {
      return createErrorResponse("Rental not found", 404);
    }
    
    const rental = mockData.rentals[rentalIndex];
    
    if (rental.status !== 'in_use') {
      return createErrorResponse("Rental is not in use", 400);
    }
    
    // Calculate total cost based on time
    const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
    const startTime = new Date(rental.start_time);
    const endTime = new Date();
    const hours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    const baseCost = hours * vehicle.price_per_hour;
    
    // Add any additional costs from violations
    const violations = mockData.violations.filter(v => v.rental_id === parseInt(id));
    const violationCosts = violations.reduce((sum, v) => sum + v.fine_amount, 0);
    
    const totalCost = baseCost + violationCosts;
    
    // Update vehicle status back to available
    vehicle.status = 'available';
    
    // Update rental
    mockData.rentals[rentalIndex] = {
      ...rental,
      station_return_id: returnData.station_return_id,
      staff_return_id: returnData.staff_return_id || 2,
      end_time: endTime.toISOString(),
      total_distance: returnData.total_distance || Math.random() * 50 + 10, // Mock distance
      total_cost: totalCost,
      status: 'returned'
    };
    
    return createResponse({
      status: 200,
      message: "Trả xe thành công",
      rental: mockData.rentals[rentalIndex]
    });
  },

  // Process payment for rental
  processPayment: async (id, paymentData) => {
    await simulateDelay();
    const rental = mockData.rentals.find(r => r.id === parseInt(id));
    if (!rental) {
      return createErrorResponse("Rental not found", 404);
    }
    
    // Create payment record
    const newPayment = {
      id: Math.max(...mockData.payments.map(p => p.id)) + 1,
      rental_id: parseInt(id),
      amount: rental.total_cost || 0,
      method: paymentData.method,
      status: 'paid',
      created_at: new Date().toISOString()
    };
    
    mockData.payments.push(newPayment);
    
    return createResponse({
      payment: newPayment
    });
  },

  // Get rental summary
  getSummary: async (id) => {
    await simulateDelay();
    const rental = mockData.rentals.find(r => r.id === parseInt(id));
    if (!rental) {
      return createErrorResponse("Rental not found", 404);
    }
    
    const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
    
    return createResponse({
      summary: {
        rental_id: rental.id,
        start_time: rental.start_time,
        end_time: rental.end_time,
        total_distance: rental.total_distance,
        total_cost: rental.total_cost,
        status: rental.status,
        vehicle: {
          id: vehicle.id,
          license_plate: vehicle.license_plate,
          type: vehicle.type
        }
      }
    });
  },

  // Cancel rental
  cancel: async (id, reason, cancelledBy) => {
    await simulateDelay();
    const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(id));
    if (rentalIndex === -1) {
      return createErrorResponse("Rental not found", 404);
    }
    
    const rental = mockData.rentals[rentalIndex];
    
    if (rental.status === 'in_use') {
      return createErrorResponse("Cannot cancel rental that is in use", 400);
    }
    
    if (rental.status === 'returned' || rental.status === 'cancelled') {
      return createErrorResponse("Rental already completed or cancelled", 400);
    }
    
    // Free up the vehicle
    const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
    if (vehicle) {
      vehicle.status = 'available';
    }
    
    mockData.rentals[rentalIndex] = {
      ...rental,
      status: 'cancelled',
      cancelled_reason: reason,
      cancelled_by: cancelledBy
    };
    
    return createResponse(mockData.rentals[rentalIndex]);
  },

  // Get user's rentals
  getByUser: async (userId, params = {}) => {
    await simulateDelay();
    
    let rentals = mockData.rentals.filter(r => r.renter_id === parseInt(userId));
    
    // Enrich rental data with vehicle and station information
    rentals = rentals.map(rental => {
      const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
      const pickupStation = mockData.stations.find(s => s.id === rental.station_pickup_id);
      const returnStation = mockData.stations.find(s => s.id === rental.station_return_id);
      
      return {
        ...rental,
        vehicle: vehicle ? {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          image: vehicle.image
        } : null,
        station: pickupStation ? {
          id: pickupStation.id,
          name: pickupStation.name,
          address: pickupStation.address
        } : null,
        pickup_station: pickupStation,
        return_station: returnStation,
        distance: rental.total_distance || 0
      };
    });
    
    if (params.status) {
      rentals = rentals.filter(r => r.status === params.status);
    }
    
    // Sort by creation date (newest first)
    rentals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return createResponse({
      rentals: rentals
    });
  },

  // Get active rentals
  getActive: async () => {
    await simulateDelay();
    const activeRentals = mockData.rentals.filter(r => 
      r.status === 'in_use' || r.status === 'booked'
    );
    
    return createResponse(activeRentals);
  },

  // Get rental statistics
  getStats: async (params = {}) => {
    await simulateDelay();
    let rentals = [...mockData.rentals];
    
    // Filter by date range if provided
    if (params.start_date) {
      rentals = rentals.filter(r => 
        r.created_at && new Date(r.created_at) >= new Date(params.start_date)
      );
    }
    
    if (params.end_date) {
      rentals = rentals.filter(r => 
        r.created_at && new Date(r.created_at) <= new Date(params.end_date)
      );
    }
    
    const totalRentals = rentals.length;
    const completedRentals = rentals.filter(r => r.status === 'returned').length;
    const activeRentals = rentals.filter(r => r.status === 'in_use').length;
    const cancelledRentals = rentals.filter(r => r.status === 'cancelled').length;
    
    const totalRevenue = rentals
      .filter(r => r.total_cost)
      .reduce((sum, r) => sum + r.total_cost, 0);
    
    const averageRentalDuration = completedRentals.length > 0 ? 
      rentals
        .filter(r => r.start_time && r.end_time)
        .reduce((sum, r) => {
          const hours = (new Date(r.end_time) - new Date(r.start_time)) / (1000 * 60 * 60);
          return sum + hours;
        }, 0) / completedRentals.length : 0;
    
    return createResponse({
      totalRentals,
      completedRentals,
      activeRentals,
      cancelledRentals,
      totalRevenue,
      averageRentalDuration: Math.round(averageRentalDuration * 100) / 100,
      completionRate: totalRentals > 0 ? 
        Math.round((completedRentals / totalRentals) * 100) : 0
    });
  },

  // Renter API methods - matching exact specification
  renter: {
    // Check-in rental (POST /api/renter/rentals/checkin)
    checkin: async (checkInData) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      let vehicle = null;
      
      // Handle reservation-based checkin
      if (checkInData.reservation_id) {
        const reservation = mockData.reservations.find(r => 
          r.id === checkInData.reservation_id && r.renter_id === currentUserId
        );
        
        if (!reservation) {
          return createErrorResponse("Không thể check-in cho booking này", 400);
        }
        
        if (reservation.status !== 'confirmed' && reservation.status !== 'pending') {
          return createErrorResponse("Không thể check-in cho booking này", 400);
        }
        
        vehicle = mockData.vehicles.find(v => v.id === reservation.vehicle_id);
        if (!vehicle) {
          return createErrorResponse("Không thể check-in cho booking này", 400);
        }
      } 
      // Handle walk-in checkin
      else if (checkInData.vehicle_id) {
        vehicle = mockData.vehicles.find(v => v.id === checkInData.vehicle_id);
        if (!vehicle || vehicle.status !== 'available') {
          return createErrorResponse("Không thể check-in cho booking này", 400);
        }
      } else {
        return createErrorResponse("Không thể check-in cho booking này", 400);
      }
      
      // Validate station
      if (!checkInData.station_id) {
        return createErrorResponse("Thiếu thông tin trạm", 400);
      }
      
      const station = mockData.stations.find(s => s.id === checkInData.station_id);
      if (!station) {
        return createErrorResponse("Trạm không tồn tại", 400);
      }
      
      // Update vehicle status
      vehicle.status = 'rented';
      
      // Create new rental
      const newRental = {
        id: Math.max(...mockData.rentals.map(r => r.id), 0) + 1,
        renter_id: currentUserId,
        vehicle_id: vehicle.id,
        station_pickup_id: checkInData.station_id,
        staff_pickup_id: 2, // Default staff for pickup
        start_time: new Date().toISOString(),
        rental_type: checkInData.reservation_id ? 'booking' : 'walk-in',
        deposit_amount: vehicle.type === 'car' ? 500000 : 300000,
        deposit_status: 'held',
        status: 'in_use',
        end_time: null,
        total_distance: null,
        total_cost: null,
        created_at: new Date().toISOString()
      };
      
      mockData.rentals.push(newRental);
      
      // Update reservation if exists
      if (checkInData.reservation_id) {
        const reservation = mockData.reservations.find(r => r.id === checkInData.reservation_id);
        if (reservation) {
          reservation.status = 'completed';
        }
      }
      
      return createResponse({
        rental: {
          id: newRental.id,
          renter_id: newRental.renter_id,
          vehicle_id: newRental.vehicle_id,
          station_pickup_id: newRental.station_pickup_id,
          staff_pickup_id: newRental.staff_pickup_id,
          start_time: newRental.start_time,
          rental_type: newRental.rental_type,
          deposit_amount: newRental.deposit_amount,
          deposit_status: newRental.deposit_status,
          status: newRental.status
        }
      });
    },

    // Get current active rental (GET /api/renter/rentals/current)
    getCurrent: async () => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      const rental = mockData.rentals.find(r => 
        r.renter_id === currentUserId && r.status === 'in_use'
      );
      
      if (!rental) {
        return createErrorResponse("Bạn không có lượt thuê nào đang hoạt động", 404);
      }
      
      return createResponse({
        rental: {
          id: rental.id,
          vehicle_id: rental.vehicle_id,
          station_pickup_id: rental.station_pickup_id,
          start_time: rental.start_time,
          deposit_amount: rental.deposit_amount,
          status: rental.status
        }
      });
    },

    // Get rental checks (GET /api/renter/rentals/:id/checks)
    getChecks: async (rentalId) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Verify rental ownership
      const rental = mockData.rentals.find(r => 
        r.id === parseInt(rentalId) && r.renter_id === currentUserId
      );
      
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      const checks = mockData.rentalChecks.filter(c => c.rental_id === parseInt(rentalId));
      
      // Return checks with required fields
      const formattedChecks = checks.map(check => ({
        id: check.id,
        check_type: check.check_type,
        condition_report: check.condition_report,
        photo_url: check.photo_url,
        customer_signature_url: check.customer_signature_url,
        staff_signature_url: check.staff_signature_url,
        created_at: check.created_at
      }));
      
      return createResponse({
        checks: formattedChecks
      });
    },

    // Return vehicle (POST /api/renter/rentals/:id/return)
    returnVehicle: async (rentalId, returnData) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Verify rental ownership and status
      const rental = mockData.rentals.find(r => 
        r.id === parseInt(rentalId) && r.renter_id === currentUserId
      );
      
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      if (rental.status !== 'in_use') {
        return createErrorResponse("Lượt thuê này không thể trả xe", 400);
      }
      
      // Validate return station
      if (!returnData.station_return_id) {
        return createErrorResponse("Thiếu thông tin trạm trả xe", 400);
      }
      
      const returnStation = mockData.stations.find(s => s.id === returnData.station_return_id);
      if (!returnStation) {
        return createErrorResponse("Trạm trả xe không tồn tại", 400);
      }
      
      // Update rental record
      const endTime = new Date().toISOString();
      const startTime = new Date(rental.start_time);
      const durationHours = Math.ceil((new Date(endTime) - startTime) / (1000 * 60 * 60));
      
      // Get vehicle for pricing
      const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
      const totalCost = durationHours * (vehicle?.price_per_hour || 50000);
      
      // Update rental
      const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(rentalId));
      mockData.rentals[rentalIndex] = {
        ...rental,
        end_time: endTime,
        station_return_id: returnData.station_return_id,
        staff_return_id: 3, // Default staff for return
        status: 'returned',
        total_distance: Math.round(Math.random() * 50 + 10), // Simulate distance
        total_cost: totalCost
      };
      
      // Update vehicle status back to available
      if (vehicle) {
        vehicle.status = 'available';
      }
      
      const updatedRental = mockData.rentals[rentalIndex];
      
      return createResponse({
        status: 200,
        message: "Trả xe thành công",
        rental: {
          id: updatedRental.id,
          end_time: updatedRental.end_time,
          station_return_id: updatedRental.station_return_id,
          staff_return_id: updatedRental.staff_return_id,
          status: updatedRental.status
        }
      });
    },

    // Process payment (POST /api/renter/rentals/:id/payment)
    processPayment: async (rentalId, paymentData) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Verify rental ownership
      const rental = mockData.rentals.find(r => 
        r.id === parseInt(rentalId) && r.renter_id === currentUserId
      );
      
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      if (rental.status !== 'returned') {
        return createErrorResponse("Chỉ có thể thanh toán sau khi trả xe", 400);
      }
      
      // Validate payment method
      const validMethods = ['cash', 'card', 'e-wallet'];
      if (!paymentData.method || !validMethods.includes(paymentData.method)) {
        return createErrorResponse("Phương thức thanh toán không hợp lệ", 400);
      }
      
      // Simulate payment failure (5% chance)
      if (Math.random() < 0.05) {
        return createErrorResponse("Thanh toán thất bại", 402);
      }
      
      // Create payment record
      const newPayment = {
        id: Math.max(...mockData.payments.map(p => p.id), 0) + 1,
        rental_id: parseInt(rentalId),
        renter_id: currentUserId,
        amount: rental.total_cost || 100000,
        method: paymentData.method,
        status: 'paid',
        payment_type: 'rental_fee',
        created_at: new Date().toISOString()
      };
      
      mockData.payments.push(newPayment);
      
      // Update rental payment status
      const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(rentalId));
      if (rentalIndex !== -1) {
        mockData.rentals[rentalIndex].payment_status = 'paid';
      }
      
      return createResponse({
        payment: {
          id: newPayment.id,
          rental_id: newPayment.rental_id,
          amount: newPayment.amount,
          method: newPayment.method,
          status: newPayment.status,
          created_at: newPayment.created_at
        }
      });
    },

    // Get rental summary (GET /api/renter/rentals/:id/summary)
    getSummary: async (rentalId) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Verify rental ownership
      const rental = mockData.rentals.find(r => 
        r.id === parseInt(rentalId) && r.renter_id === currentUserId
      );
      
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      // Get vehicle information
      const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
      if (!vehicle) {
        return createErrorResponse("Không tìm thấy thông tin xe", 404);
      }
      
      return createResponse({
        summary: {
          rental_id: rental.id,
          start_time: rental.start_time,
          end_time: rental.end_time,
          total_distance: rental.total_distance || 0,
          total_cost: rental.total_cost || 0,
          status: rental.status,
          vehicle: {
            id: vehicle.id,
            license_plate: vehicle.license_plate,
            type: vehicle.type
          }
        }
      });
    },

    // Get rental history (GET /api/renter/rentals)
    getRentals: async () => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      const rentals = mockData.rentals.filter(r => r.renter_id === currentUserId);
      
      // Return rentals with required fields
      const formattedRentals = rentals.map(rental => ({
        id: rental.id,
        vehicle_id: rental.vehicle_id,
        start_time: rental.start_time,
        end_time: rental.end_time,
        status: rental.status
      }));
      
      // Sort by creation date (newest first)
      formattedRentals.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      
      return createResponse({
        rentals: formattedRentals
      });
    },

    // Get specific rental detail (GET /api/renter/rentals/:id)
    getRentalById: async (rentalId) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Verify rental ownership
      const rental = mockData.rentals.find(r => 
        r.id === parseInt(rentalId) && r.renter_id === currentUserId
      );
      
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      return createResponse({
        rental: {
          id: rental.id,
          renter_id: rental.renter_id,
          vehicle_id: rental.vehicle_id,
          start_time: rental.start_time,
          end_time: rental.end_time,
          total_distance: rental.total_distance,
          total_cost: rental.total_cost,
          deposit_amount: rental.deposit_amount,
          deposit_status: rental.deposit_status,
          status: rental.status
        }
      });
    }
  },

  // Staff API methods - matching exact specification
  staff: {
    // Get pending rentals for pickup (GET /api/staff/rentals/pending)
    getPendingRentals: async () => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Check if staff is assigned to a station
      const staffStation = mockData.staffStations.find(ss => 
        ss.staff_id === currentStaffId && ss.is_active
      );
      
      if (!staffStation) {
        return {
          success: false,
          status: 403,
          error: "StationNotAssigned",
          message: "Nhân viên chưa được phân công trạm làm việc"
        };
      }
      
      // Get rentals that need pickup at this staff's station
      const pendingRentals = mockData.rentals.filter(rental => 
        rental.status === 'confirmed' && 
        rental.station_pickup_id === staffStation.station_id
      );
      
      // Format response data
      const formattedRentals = pendingRentals.map(rental => {
        const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
        const renter = mockData.users.find(u => u.id === rental.renter_id);
        const station = mockData.stations.find(s => s.id === rental.station_pickup_id);
        const reservation = mockData.reservations.find(r => r.id === rental.reservation_id);
        
        return {
          rental_id: rental.id,
          reservation_id: reservation?.id || null,
          vehicle: {
            id: vehicle.id,
            license_plate: vehicle.license_plate,
            type: vehicle.type,
            brand: vehicle.brand,
            model: vehicle.model
          },
          renter: {
            id: renter.id,
            full_name: renter.full_name,
            phone: renter.phone
          },
          pickup_station: {
            id: station.id,
            name: station.name,
            address: station.address
          },
          start_time: rental.start_time,
          deposit_amount: rental.deposit_amount,
          deposit_status: rental.deposit_status
        };
      });
      
      return createResponse(formattedRentals);
    },

    // Get returning rentals (GET /api/staff/rentals/returning)
    getReturningRentals: async () => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Check if staff is assigned to a station
      const staffStation = mockData.staffStations.find(ss => 
        ss.staff_id === currentStaffId && ss.is_active
      );
      
      if (!staffStation) {
        return {
          success: false,
          status: 403,
          error: "StationNotAssigned",
          message: "Nhân viên chưa được phân công trạm làm việc"
        };
      }
      
      // Get rentals that need return at this staff's station
      const returningRentals = mockData.rentals.filter(rental => 
        rental.status === 'in_use' && 
        rental.station_return_id === staffStation.station_id
      );
      
      // Format response data
      const formattedRentals = returningRentals.map(rental => {
        const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
        const renter = mockData.users.find(u => u.id === rental.renter_id);
        const station = mockData.stations.find(s => s.id === rental.station_return_id);
        
        return {
          rental_id: rental.id,
          vehicle: {
            id: vehicle.id,
            license_plate: vehicle.license_plate,
            type: vehicle.type
          },
          renter: {
            id: renter.id,
            full_name: renter.full_name,
            phone: renter.phone
          },
          return_station: {
            id: station.id,
            name: station.name,
            address: station.address
          },
          expected_end_time: rental.end_time
        };
      });
      
      return createResponse(formattedRentals);
    },

    // Create pickup check (POST /api/staff/rentals/:id/pickup-check)
    createPickupCheck: async (rentalId, checkData) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate rental exists and status
      const rental = mockData.rentals.find(r => r.id === parseInt(rentalId));
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      if (rental.status !== 'confirmed') {
        return {
          success: false,
          status: 400,
          error: "InvalidRentalStatus",
          message: "Lượt thuê không hợp lệ để lập biên bản pickup"
        };
      }
      
      // Validate required fields
      if (!checkData.condition_report || !checkData.photo_url || 
          !checkData.customer_signature_url || !checkData.staff_signature_url) {
        return createErrorResponse("Thiếu thông tin biên bản bàn giao", 400);
      }
      
      // Create new check
      const newCheck = {
        id: Math.max(...mockData.rentalChecks.map(c => c.id), 0) + 1,
        rental_id: parseInt(rentalId),
        staff_id: currentStaffId,
        check_type: 'pickup',
        condition_report: checkData.condition_report,
        photo_url: checkData.photo_url,
        customer_signature_url: checkData.customer_signature_url,
        staff_signature_url: checkData.staff_signature_url,
        created_at: new Date().toISOString()
      };
      
      mockData.rentalChecks.push(newCheck);
      
      return createResponse({
        check_id: newCheck.id,
        rental_id: newCheck.rental_id,
        staff_id: newCheck.staff_id,
        check_type: newCheck.check_type,
        condition_report: newCheck.condition_report,
        photo_url: newCheck.photo_url,
        customer_signature_url: newCheck.customer_signature_url,
        staff_signature_url: newCheck.staff_signature_url,
        created_at: newCheck.created_at
      }, true, "Biên bản bàn giao xe đã được lưu.");
    },

    // Create return check (POST /api/staff/rentals/:id/return-check)
    createReturnCheck: async (rentalId, checkData) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate rental exists and status
      const rental = mockData.rentals.find(r => r.id === parseInt(rentalId));
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      if (rental.status !== 'in_use') {
        return {
          success: false,
          status: 400,
          error: "InvalidRentalStatus",
          message: "Lượt thuê không hợp lệ để lập biên bản return"
        };
      }
      
      // Validate required fields
      if (!checkData.condition_report || !checkData.photo_url || 
          !checkData.customer_signature_url || !checkData.staff_signature_url) {
        return createErrorResponse("Thiếu thông tin biên bản nhận xe", 400);
      }
      
      // Create new check
      const newCheck = {
        id: Math.max(...mockData.rentalChecks.map(c => c.id), 0) + 1,
        rental_id: parseInt(rentalId),
        staff_id: currentStaffId,
        check_type: 'return',
        condition_report: checkData.condition_report,
        photo_url: checkData.photo_url,
        customer_signature_url: checkData.customer_signature_url,
        staff_signature_url: checkData.staff_signature_url,
        created_at: new Date().toISOString()
      };
      
      mockData.rentalChecks.push(newCheck);
      
      return createResponse({
        check_id: newCheck.id,
        rental_id: newCheck.rental_id,
        staff_id: newCheck.staff_id,
        check_type: newCheck.check_type,
        condition_report: newCheck.condition_report,
        photo_url: newCheck.photo_url,
        customer_signature_url: newCheck.customer_signature_url,
        staff_signature_url: newCheck.staff_signature_url,
        created_at: newCheck.created_at
      }, true, "Biên bản nhận xe đã được lưu.");
    },

    // Confirm pickup completion (POST /api/staff/rentals/:id/confirm-pickup)
    confirmPickup: async (rentalId) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate rental exists
      const rental = mockData.rentals.find(r => r.id === parseInt(rentalId));
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      // Check if pickup check exists
      const pickupCheck = mockData.rentalChecks.find(c => 
        c.rental_id === parseInt(rentalId) && 
        c.check_type === 'pickup'
      );
      
      if (!pickupCheck) {
        return {
          success: false,
          status: 400,
          error: "PickupCheckRequired",
          message: "Cần lập biên bản bàn giao trước khi xác nhận"
        };
      }
      
      // Update rental status
      const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(rentalId));
      mockData.rentals[rentalIndex] = {
        ...mockData.rentals[rentalIndex],
        status: 'in_use',
        staff_pickup_id: currentStaffId,
        actual_start_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return createResponse({}, true, "Giao xe thành công. Rental đã chuyển sang trạng thái in_use.");
    },

    // Confirm return completion (POST /api/staff/rentals/:id/confirm-return)
    confirmReturn: async (rentalId) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate rental exists
      const rental = mockData.rentals.find(r => r.id === parseInt(rentalId));
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      // Check if return check exists
      const returnCheck = mockData.rentalChecks.find(c => 
        c.rental_id === parseInt(rentalId) && 
        c.check_type === 'return'
      );
      
      if (!returnCheck) {
        return {
          success: false,
          status: 400,
          error: "ReturnCheckRequired",
          message: "Cần lập biên bản nhận xe trước khi xác nhận"
        };
      }
      
      // Update rental status
      const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(rentalId));
      mockData.rentals[rentalIndex] = {
        ...mockData.rentals[rentalIndex],
        status: 'returned',
        staff_return_id: currentStaffId,
        actual_end_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Update vehicle status to available
      const vehicleIndex = mockData.vehicles.findIndex(v => v.id === rental.vehicle_id);
      if (vehicleIndex !== -1) {
        mockData.vehicles[vehicleIndex] = {
          ...mockData.vehicles[vehicleIndex],
          status: 'available',
          updated_at: new Date().toISOString()
        };
      }
      
      return createResponse({}, true, "Xe đã được trả thành công. Rental đã chuyển sang trạng thái returned.");
    },

    // Get current rentals at station (GET /api/staff/rentals/current)
    getCurrentRentals: async () => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Check if staff is assigned to a station
      const staffStation = mockData.staffStations.find(ss => 
        ss.staff_id === currentStaffId && ss.is_active
      );
      
      if (!staffStation) {
        return {
          success: false,
          status: 403,
          error: "StationNotAssigned",
          message: "Nhân viên chưa được phân công trạm làm việc"
        };
      }
      
      // Get rentals currently in use at this staff's station
      const currentRentals = mockData.rentals.filter(rental => 
        rental.status === 'in_use' && 
        (rental.station_pickup_id === staffStation.station_id || 
         rental.station_return_id === staffStation.station_id)
      );
      
      // Format response data
      const formattedRentals = currentRentals.map(rental => {
        const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
        const renter = mockData.users.find(u => u.id === rental.renter_id);
        
        return {
          rental_id: rental.id,
          vehicle: {
            id: vehicle.id,
            license_plate: vehicle.license_plate,
            type: vehicle.type
          },
          renter: {
            id: renter.id,
            full_name: renter.full_name,
            phone: renter.phone
          },
          start_time: rental.start_time,
          expected_end_time: rental.end_time,
          status: rental.status
        };
      });
      
      // Sort by start time (newest first)
      formattedRentals.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      
      return createResponse(formattedRentals);
    }
  },

  // Admin namespace for rental monitoring
  admin: {
    // Get all rentals with filtering for admin monitoring
    getRentals: async (params = {}) => {
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
      
      let rentals = [...mockData.rentals];
      
      // Filter by status - map from API spec to internal status
      if (params.status) {
        const statusMapping = {
          'booked': ['confirmed', 'pending_pickup'],
          'in_use': ['picked_up'],
          'returned': ['returned', 'completed'],
          'cancelled': ['cancelled']
        };
        
        if (statusMapping[params.status]) {
          rentals = rentals.filter(r => statusMapping[params.status].includes(r.status));
        }
      }
      
      // Filter by renter
      if (params.renter_id) {
        rentals = rentals.filter(r => r.user_id === parseInt(params.renter_id));
      }
      
      // Filter by vehicle
      if (params.vehicle_id) {
        rentals = rentals.filter(r => r.vehicle_id === parseInt(params.vehicle_id));
      }
      
      // Format response according to API spec
      const formattedRentals = rentals.map(rental => {
        // Map internal status to API status
        let apiStatus = 'ongoing';
        if (['returned', 'completed'].includes(rental.status)) {
          apiStatus = 'completed';
        } else if (rental.status === 'cancelled') {
          apiStatus = 'cancelled';
        }
        
        return {
          id: rental.id,
          renter_id: rental.user_id,
          vehicle_id: rental.vehicle_id,
          start_time: rental.start_time,
          end_time: rental.end_time || null,
          status: apiStatus,
          total_cost: rental.total_cost || 0
        };
      });
      
      return {
        rentals: formattedRentals
      };
    },

    // Get rental by ID for admin monitoring
    getRentalById: async (id) => {
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
      
      const rental = mockData.rentals.find(r => r.id === parseInt(id));
      if (!rental) {
        return {
          status: 404,
          error: "RentalNotFound",
          message: "Không tìm thấy đơn thuê"
        };
      }
      
      // Map internal status to API status
      let apiStatus = 'ongoing';
      if (['returned', 'completed'].includes(rental.status)) {
        apiStatus = 'completed';
      } else if (rental.status === 'cancelled') {
        apiStatus = 'cancelled';
      }
      
      return {
        id: rental.id,
        renter_id: rental.user_id,
        vehicle_id: rental.vehicle_id,
        start_time: rental.start_time,
        end_time: rental.end_time || null,
        status: apiStatus,
        total_cost: rental.total_cost || 0,
        created_at: rental.created_at
      };
    },

    // Get rental history for specific renter
    getRenterHistory: async (renterId) => {
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
      
      // Get all rentals for this renter
      const renterRentals = mockData.rentals.filter(r => r.user_id === parseInt(renterId));
      
      // Format rental history according to API spec
      const history = renterRentals.map(rental => ({
        rental_id: rental.id,
        vehicle_id: rental.vehicle_id,
        start_time: rental.start_time,
        end_time: rental.end_time || null,
        status: rental.status,
        cost: rental.total_cost || 0
      }));
      
      // Sort by start time (newest first)
      history.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      
      return {
        history: history
      };
    }
  }
};