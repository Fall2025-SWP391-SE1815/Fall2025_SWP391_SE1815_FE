// Mock Data for Electric Vehicle Rental System
// This file provides comprehensive mock data and API endpoints for frontend testing

// Helper function to generate random IDs
let idCounter = 1;
const generateId = () => idCounter++;

// Helper function to generate timestamps
const generateTimestamp = (daysAgo = 0, hoursAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

// Helper function to generate random data
const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Mock Data Storage
export const mockData = {
  // Users table - người dùng hệ thống
  users: [
    {
      id: 1,
      full_name: "Nguyễn Văn Admin",
      email: "admin@evrent.com",
      phone: "0901234567",
      password: "admin123", // In real app, this would be hashed
      role: "admin",
      status: "active",
      refresh_token: "refresh_token_admin_123",
      created_at: generateTimestamp(30),
      updated_at: generateTimestamp(1)
    },
    {
      id: 2,
      full_name: "Trần Thị Lan",
      email: "staff1@evrent.com",
      phone: "0902345678",
      password: "staff123",
      role: "staff",
      status: "active",
      refresh_token: "refresh_token_staff_123",
      created_at: generateTimestamp(25),
      updated_at: generateTimestamp(2)
    },
    {
      id: 3,
      full_name: "Lê Văn Minh",
      email: "staff2@evrent.com",
      phone: "0903456789",
      password: "staff123",
      role: "staff",
      status: "active",
      refresh_token: "refresh_token_staff_456",
      created_at: generateTimestamp(20),
      updated_at: generateTimestamp(1)
    },
    {
      id: 4,
      full_name: "Phạm Thị Hoa",
      email: "user1@gmail.com",
      phone: "0904567890",
      password: "user123",
      role: "renter",
      status: "active",
      refresh_token: "refresh_token_user_789",
      created_at: generateTimestamp(15),
      updated_at: generateTimestamp(0, 2)
    },
    {
      id: 5,
      full_name: "Hoàng Văn Đức",
      email: "user2@gmail.com",
      phone: "0905678901",
      password: "user123",
      role: "renter",
      status: "active",
      refresh_token: "refresh_token_user_101",
      created_at: generateTimestamp(10),
      updated_at: generateTimestamp(0, 1)
    },
    {
      id: 6,
      full_name: "Võ Thị Mai",
      email: "user3@gmail.com",
      phone: "0906789012",
      password: "user123",
      role: "renter",
      status: "inactive",
      refresh_token: "refresh_token_user_102",
      created_at: generateTimestamp(8),
      updated_at: generateTimestamp(0, 3)
    },
    {
      id: 7,
      full_name: "Demo User",
      email: "user@evrent.com",
      phone: "0907890123",
      password: "user123",
      role: "renter",
      status: "active",
      refresh_token: "refresh_token_user_103",
      created_at: generateTimestamp(5),
      updated_at: generateTimestamp(0, 1)
    },
    {
      id: 8,
      full_name: "Nguyễn Thị Staff",
      email: "staff3@evrent.com",
      phone: "0908901234",
      password: "staff123",
      role: "staff",
      status: "active",
      refresh_token: "refresh_token_staff_104",
      created_at: generateTimestamp(12),
      updated_at: generateTimestamp(0, 4)
    },
    {
      id: 9,
      full_name: "Trần Văn Customer",
      email: "customer1@gmail.com",
      phone: "0909012345",
      password: "user123",
      role: "renter",
      status: "active",
      refresh_token: "refresh_token_user_105",
      created_at: generateTimestamp(7),
      updated_at: generateTimestamp(0, 2)
    },
    {
      id: 10,
      full_name: "Lê Thị Inactive",
      email: "inactive@gmail.com",
      phone: "0900123456",
      password: "user123",
      role: "renter",
      status: "suspended",
      refresh_token: "refresh_token_user_106",
      created_at: generateTimestamp(3),
      updated_at: generateTimestamp(0, 1)
    }
  ],

  // Stations table - trạm giao nhận xe
  stations: [
    {
      id: 1,
      name: "Trạm Quận 1 - Nguyễn Huệ",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      latitude: 10.7763897,
      longitude: 106.7011391
    },
    {
      id: 2,
      name: "Trạm Quận 3 - Võ Văn Tần",
      address: "456 Võ Văn Tần, Quận 3, TP.HCM",
      latitude: 10.7829954,
      longitude: 106.6934446,
      status: "active",

    },
    {
      id: 3,
      name: "Trạm Bình Thạnh - Xô Viết Nghệ Tĩnh",
      address: "789 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM",
      latitude: 10.8017654,
      longitude: 106.7148641
    },
    {
      id: 4,
      name: "Trạm Tân Bình - Cộng Hòa",
      address: "321 Cộng Hòa, Tân Bình, TP.HCM",
      latitude: 10.8012158,
      longitude: 106.6525850
    },
    {
      id: 5,
      name: "Trạm Gò Vấp - Quang Trung",
      address: "654 Quang Trung, Gò Vấp, TP.HCM",
      latitude: 10.8371624,
      longitude: 106.6752209
    }
  ],

  // StaffStations table - liên kết nhân viên với trạm
  staffStations: [
    {
      id: 1,
      staff_id: 2,
      station_id: 1,
      assigned_at: generateTimestamp(25),
      is_active: true
    },
    {
      id: 2,
      staff_id: 2,
      station_id: 2,
      assigned_at: generateTimestamp(20),
      is_active: false
    },
    {
      id: 3,
      staff_id: 3,
      station_id: 3,
      assigned_at: generateTimestamp(18),
      is_active: true
    },
    {
      id: 4,
      staff_id: 3,
      station_id: 4,
      assigned_at: generateTimestamp(15),
      is_active: true
    }
  ],

  // Documents table - tài liệu cá nhân
  documents: [
    {
      id: 1,
      user_id: 4,
      type: "CCCD",
      document_number: "079123456789",
      document_url: "https://storage.evrent.com/docs/cccd_4_front.jpg",
      verified: true,
      verified_by: 1,
      created_at: generateTimestamp(14)
    },
    {
      id: 2,
      user_id: 4,
      type: "GPLX",
      document_number: "A1234567890",
      document_url: "https://storage.evrent.com/docs/gplx_4.jpg",
      verified: true,
      verified_by: 1,
      created_at: generateTimestamp(14)
    },
    {
      id: 3,
      user_id: 5,
      type: "CCCD",
      document_number: "079987654321",
      document_url: "https://storage.evrent.com/docs/cccd_5_front.jpg",
      verified: true,
      verified_by: 2,
      created_at: generateTimestamp(9)
    },
    {
      id: 4,
      user_id: 6,
      type: "CCCD",
      document_number: "079456789123",
      document_url: "https://storage.evrent.com/docs/cccd_6_front.jpg",
      verified: false,
      verified_by: null,
      created_at: generateTimestamp(7)
    }
  ],

  // Vehicles table - phương tiện cho thuê
  vehicles: [
    {
      id: 1,
      license_plate: "59E1-12345",
      type: "xe máy",
      brand: "VinFast",
      model: "Klara A2",
      energy_type: "electric",
      capacity: 2,
      status: "available",
      price_per_hour: 15000,
      station_id: 1
    },
    {
      id: 2,
      license_plate: "59E1-23456",
      type: "xe máy",
      brand: "VinFast",
      model: "Impes",
      energy_type: "electric",
      capacity: 2,
      status: "rented",
      price_per_hour: 25000,
      station_id: 1
    },
    {
      id: 3,
      license_plate: "59A-34567",
      type: "ô tô",
      brand: "VinFast",
      model: "VF e34",
      energy_type: "electric",
      capacity: 5,
      status: "available",
      price_per_hour: 80000,
      station_id: 2
    },
    {
      id: 4,
      license_plate: "59B-45678",
      type: "ô tô",
      brand: "VinFast",
      model: "VF 8",
      energy_type: "electric",
      capacity: 7,
      status: "maintenance",
      price_per_hour: 120000,
      station_id: 2
    },
    {
      id: 5,
      license_plate: "59E2-56789",
      type: "xe máy",
      brand: "VinFast",
      model: "Klara S",
      energy_type: "electric",
      capacity: 2,
      status: "available",
      price_per_hour: 20000,
      station_id: 3
    },
    {
      id: 6,
      license_plate: "59C-67890",
      type: "ô tô",
      brand: "VinFast",
      model: "VF 9",
      energy_type: "electric",
      capacity: 7,
      status: "reserved",
      price_per_hour: 150000,
      station_id: 4
    }
  ],

  // Reservations table - đặt xe trước
  reservations: [
    {
      id: 1,
      renter_id: 4,
      vehicle_id: 6,
      vehicle_type: "ô tô",
      station_id: 4,
      reserved_start_time: generateTimestamp(0, -2), // 2 hours from now
      reserved_end_time: generateTimestamp(0, -6), // 6 hours from now
      cancelled_by: null,
      cancelled_reason: null,
      status: "confirmed",
      created_at: generateTimestamp(1)
    },
    {
      id: 2,
      renter_id: 5,
      vehicle_id: null,
      vehicle_type: "xe máy",
      station_id: 1,
      reserved_start_time: generateTimestamp(0, -1),
      reserved_end_time: generateTimestamp(0, -3),
      cancelled_by: null,
      cancelled_reason: null,
      status: "pending",
      created_at: generateTimestamp(0, 2)
    },
    {
      id: 3,
      renter_id: 6,
      vehicle_id: 3,
      vehicle_type: "ô tô",
      station_id: 2,
      reserved_start_time: generateTimestamp(2),
      reserved_end_time: generateTimestamp(2, -4),
      cancelled_by: 6,
      cancelled_reason: "Thay đổi kế hoạch",
      status: "cancelled",
      created_at: generateTimestamp(3)
    }
  ],

  // Rentals table - lượt thuê xe thực tế
  rentals: [
    {
      id: 1,
      renter_id: 4,
      vehicle_id: 2,
      station_pickup_id: 1,
      station_return_id: 1,
      staff_pickup_id: 2,
      staff_return_id: 2,
      start_time: generateTimestamp(1, 2),
      end_time: generateTimestamp(1, -2),
      total_distance: 25.5,
      total_cost: 100000,
      rental_type: "walk-in",
      deposit_amount: 500000,
      deposit_status: "refunded",
      status: "returned",
      created_at: generateTimestamp(1, 3)
    },
    {
      id: 2,
      renter_id: 5,
      vehicle_id: 1,
      station_pickup_id: 1,
      station_return_id: 2,
      staff_pickup_id: 2,
      staff_return_id: null,
      start_time: generateTimestamp(0, 3),
      end_time: null,
      total_distance: null,
      total_cost: null,
      rental_type: "booking",
      deposit_amount: 300000,
      deposit_status: "held",
      status: "in_use",
      created_at: generateTimestamp(0, 4)
    },
    {
      id: 3,
      renter_id: 3, // User hiện tại
      vehicle_id: 1,
      station_pickup_id: 2,
      station_return_id: 2,
      staff_pickup_id: 2,
      staff_return_id: 2,
      start_time: generateTimestamp(3, 0),
      end_time: generateTimestamp(2, 0),
      total_distance: 15.2,
      total_cost: 75000,
      rental_type: "booking",
      deposit_amount: 300000,
      deposit_status: "refunded",
      status: "returned",
      created_at: generateTimestamp(3, 0)
    },
    {
      id: 4,
      renter_id: 3, // User hiện tại
      vehicle_id: 3,
      station_pickup_id: 1,
      station_return_id: 3,
      staff_pickup_id: 2,
      staff_return_id: 2,
      start_time: generateTimestamp(7, 0),
      end_time: generateTimestamp(7, -5),
      total_distance: 32.8,
      total_cost: 150000,
      rental_type: "walk-in",
      deposit_amount: 500000,
      deposit_status: "refunded",
      status: "returned",
      created_at: generateTimestamp(7, 0)
    },
    {
      id: 5,
      renter_id: 3, // User hiện tại
      vehicle_id: 2,
      station_pickup_id: 3,
      station_return_id: 1,
      staff_pickup_id: 2,
      staff_return_id: 2,
      start_time: generateTimestamp(14, 0),
      end_time: generateTimestamp(14, -3),
      total_distance: 18.7,
      total_cost: 90000,
      rental_type: "booking",
      deposit_amount: 300000,
      deposit_status: "refunded",
      status: "returned",
      created_at: generateTimestamp(14, 0)
    },
    {
      id: 6,
      renter_id: 4, // User hiện tại
      vehicle_id: 1,
      station_pickup_id: 1,
      station_return_id: 1,
      staff_pickup_id: 2,
      staff_return_id: 2,
      start_time: generateTimestamp(2, 0),
      end_time: generateTimestamp(2, -4),
      total_distance: 22.3,
      total_cost: 120000,
      rental_type: "booking",
      deposit_amount: 300000,
      deposit_status: "refunded",
      status: "returned",
      created_at: generateTimestamp(2, 0)
    },
    {
      id: 7,
      renter_id: 4, // User hiện tại
      vehicle_id: 2,
      station_pickup_id: 2,
      station_return_id: 3,
      staff_pickup_id: 2,
      staff_return_id: 2,
      start_time: generateTimestamp(5, 0),
      end_time: generateTimestamp(5, -2),
      total_distance: 12.8,
      total_cost: 65000,
      rental_type: "walk-in",
      deposit_amount: 500000,
      deposit_status: "refunded",
      status: "returned",
      created_at: generateTimestamp(5, 0)
    },
    {
      id: 8,
      renter_id: 4, // User hiện tại
      vehicle_id: 3,
      station_pickup_id: 3,
      station_return_id: 2,
      staff_pickup_id: 2,
      staff_return_id: null,
      start_time: generateTimestamp(0, 1),
      end_time: null,
      total_distance: null,
      total_cost: null,
      rental_type: "booking",
      deposit_amount: 300000,
      deposit_status: "held",
      status: "in_use",
      created_at: generateTimestamp(0, 2)
    }
  ],

  // RentalChecks table - ghi nhận tình trạng xe
  rentalChecks: [
    {
      id: 1,
      rental_id: 1,
      staff_id: 2,
      check_type: "pickup",
      condition_report: "Xe trong tình trạng tốt, không có vết xước",
      photo_url: "https://storage.evrent.com/checks/rental_1_pickup.jpg",
      customer_signature_url: "https://storage.evrent.com/signatures/customer_1_pickup.png",
      staff_signature_url: "https://storage.evrent.com/signatures/staff_2_pickup.png",
      created_at: generateTimestamp(1, 2)
    },
    {
      id: 2,
      rental_id: 1,
      staff_id: 2,
      check_type: "return",
      condition_report: "Xe trả về trong tình trạng bình thường",
      photo_url: "https://storage.evrent.com/checks/rental_1_return.jpg",
      customer_signature_url: "https://storage.evrent.com/signatures/customer_1_return.png",
      staff_signature_url: "https://storage.evrent.com/signatures/staff_2_return.png",
      created_at: generateTimestamp(1, -2)
    },
    {
      id: 3,
      rental_id: 2,
      staff_id: 2,
      check_type: "pickup",
      condition_report: "Xe mới, tình trạng hoàn hảo",
      photo_url: "https://storage.evrent.com/checks/rental_2_pickup.jpg",
      customer_signature_url: "https://storage.evrent.com/signatures/customer_2_pickup.png",
      staff_signature_url: "https://storage.evrent.com/signatures/staff_2_pickup.png",
      created_at: generateTimestamp(0, 3)
    }
  ],

  // Payments table - giao dịch thanh toán
  payments: [
    {
      id: 1,
      rental_id: 1,
      amount: 100000,
      method: "e-wallet",
      status: "paid",
      created_at: generateTimestamp(1, -1)
    },
    {
      id: 2,
      rental_id: 1,
      amount: 500000, // deposit refund
      method: "e-wallet",
      status: "paid",
      created_at: generateTimestamp(1, -1)
    },
    {
      id: 3,
      rental_id: 2,
      amount: 300000, // deposit
      method: "card",
      status: "paid",
      created_at: generateTimestamp(0, 3)
    }
  ],

  // Violations table - vi phạm
  violations: [
    {
      id: 1,
      rental_id: 1,
      staff_id: 2,
      description: "Vượt quá giới hạn tốc độ trong khu vực trạm",
      fine_amount: 50000,
      created_at: generateTimestamp(1, 1)
    }
  ],

  // Ratings table - đánh giá chung
  ratings: [
    {
      id: 1,
      rental_id: 1,
      renter_id: 4,
      rating: 5,
      comment: "Dịch vụ rất tốt, xe chất lượng cao",
      created_at: generateTimestamp(1, -1)
    }
  ],

  // StaffRatings table - đánh giá nhân viên
  staffRatings: [
    {
      id: 1,
      rental_id: 1,
      renter_id: 4,
      staff_id: 2,
      rating: 5,
      comment: "Nhân viên nhiệt tình, hướng dẫn rõ ràng",
      created_at: generateTimestamp(1, -1)
    }
  ],

  // Complaints table - khiếu nại
  complaints: [
    {
      id: 1,
      rental_id: 1,
      renter_id: 4,
      staff_id: null,
      admin_id: 1,
      description: "Xe có mùi lạ trong khoang",
      status: "resolved",
      resolution: "Đã vệ sinh và khử mùi xe",
      created_at: generateTimestamp(2),
      resolved_at: generateTimestamp(1)
    }
  ],

  // IncidentReports table - báo cáo sự cố
  incidentReports: [
    {
      id: 1,
      vehicle_id: 4,
      staff_id: 3,
      rental_id: null,
      description: "Hệ thống sạc gặp sự cố, cần bảo trì",
      severity: "medium",
      status: "resolved",
      admin_id: 1,
      created_at: generateTimestamp(5),
      resolved_at: generateTimestamp(3)
    },
    {
      id: 2,
      vehicle_id: 2,
      staff_id: 2,
      rental_id: 2,
      description: "Khách hàng báo cáo tiếng ồn bất thường từ động cơ",
      severity: "low",
      status: "in_review",
      admin_id: null,
      created_at: generateTimestamp(0, 1),
      resolved_at: null
    }
  ]
};

// Authentication state
export let currentUser = null;
export let authToken = null;

// Mock API Response Helper
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

// Simulate API delay
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Functions
export const mockAPI = {
  // Authentication endpoints
  auth: {
    login: async (email, password) => {
      await simulateDelay();
      const user = mockData.users.find(u => u.email === email && u.password === password);
      if (user) {
        currentUser = { ...user };
        delete currentUser.password; // Don't return password
        authToken = `mock_token_${user.id}_${Date.now()}`;
        return createResponse({
          userInfo: currentUser,
          accessToken: authToken,
          refreshToken: user.refresh_token
        });
      }
      return createErrorResponse("Invalid credentials", 401);
    },

    register: async (userData) => {
      await simulateDelay();
      const existingUser = mockData.users.find(u => u.email === userData.email);
      if (existingUser) {
        return createErrorResponse("Email already exists", 409);
      }
      
      const newUser = {
        id: Math.max(...mockData.users.map(u => u.id)) + 1,
        ...userData,
        role: userData.role || "renter",
        refresh_token: `refresh_token_${Date.now()}`,
        created_at: generateTimestamp(),
        updated_at: generateTimestamp()
      };
      
      mockData.users.push(newUser);
      const responseUser = { ...newUser };
      delete responseUser.password;
      
      return createResponse({
        userInfo: responseUser,
        accessToken: `mock_token_${newUser.id}_${Date.now()}`,
        refreshToken: newUser.refresh_token
      });
    },

    refreshToken: async (refreshToken) => {
      await simulateDelay();
      const user = mockData.users.find(u => u.refresh_token === refreshToken);
      if (user) {
        const newToken = `mock_token_${user.id}_${Date.now()}`;
        return createResponse({ accessToken: newToken });
      }
      return createErrorResponse("Token làm mới không hợp lệ", 401);
    },

    logout: async () => {
      await simulateDelay();
      currentUser = null;
      authToken = null;
      return createResponse({ message: "Logged out successfully" });
    },

    me: async () => {
      await simulateDelay();
      if (currentUser) {
        return createResponse(currentUser);
      }
      return createErrorResponse("Not authenticated", 401);
    }
  },

  // Users CRUD
  users: {
    getAll: async (params = {}) => {
      await simulateDelay();
      let users = [...mockData.users].map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      // Filter by role if specified
      if (params.role) {
        users = users.filter(user => user.role === params.role);
      }
      
      // Pagination
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return createResponse({
        users: users.slice(startIndex, endIndex),
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit)
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const user = mockData.users.find(u => u.id === parseInt(id));
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return createResponse(userWithoutPassword);
      }
      return createErrorResponse("User not found", 404);
    },

    create: async (userData) => {
      await simulateDelay();
      const existingUser = mockData.users.find(u => u.email === userData.email);
      if (existingUser) {
        return createErrorResponse("Email already exists", 409);
      }
      
      const newUser = {
        id: Math.max(...mockData.users.map(u => u.id)) + 1,
        ...userData,
        refresh_token: `refresh_token_${Date.now()}`,
        created_at: generateTimestamp(),
        updated_at: generateTimestamp()
      };
      
      mockData.users.push(newUser);
      const { password, ...userWithoutPassword } = newUser;
      return createResponse(userWithoutPassword);
    },

    update: async (id, userData) => {
      await simulateDelay();
      const userIndex = mockData.users.findIndex(u => u.id === parseInt(id));
      if (userIndex === -1) {
        return createErrorResponse("User not found", 404);
      }
      
      mockData.users[userIndex] = {
        ...mockData.users[userIndex],
        ...userData,
        updated_at: generateTimestamp()
      };
      
      const { password, ...userWithoutPassword } = mockData.users[userIndex];
      return createResponse(userWithoutPassword);
    },

    delete: async (id) => {
      await simulateDelay();
      const userIndex = mockData.users.findIndex(u => u.id === parseInt(id));
      if (userIndex === -1) {
        return createErrorResponse("User not found", 404);
      }
      
      mockData.users.splice(userIndex, 1);
      return createResponse({ message: "User deleted successfully" });
    }
  },

  // Vehicles CRUD
  vehicles: {
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

    getById: async (id) => {
      await simulateDelay();
      const vehicle = mockData.vehicles.find(v => v.id === parseInt(id));
      if (vehicle) {
        return createResponse(vehicle);
      }
      return createErrorResponse("Vehicle not found", 404);
    },

    getAvailable: async (params = {}) => {
      await simulateDelay();
      let vehicles = mockData.vehicles.filter(v => v.status === 'available');
      
      if (params.type) {
        vehicles = vehicles.filter(v => v.type === params.type);
      }
      
      if (params.station_id) {
        vehicles = vehicles.filter(v => v.station_id === parseInt(params.station_id));
      }
      
      return createResponse(vehicles);
    },

    create: async (vehicleData) => {
      await simulateDelay();
      const existingVehicle = mockData.vehicles.find(v => v.license_plate === vehicleData.license_plate);
      if (existingVehicle) {
        return createErrorResponse("License plate already exists", 409);
      }
      
      const newVehicle = {
        id: Math.max(...mockData.vehicles.map(v => v.id)) + 1,
        ...vehicleData
      };
      
      mockData.vehicles.push(newVehicle);
      return createResponse(newVehicle);
    },

    update: async (id, vehicleData) => {
      await simulateDelay();
      const vehicleIndex = mockData.vehicles.findIndex(v => v.id === parseInt(id));
      if (vehicleIndex === -1) {
        return createErrorResponse("Vehicle not found", 404);
      }
      
      mockData.vehicles[vehicleIndex] = {
        ...mockData.vehicles[vehicleIndex],
        ...vehicleData
      };
      
      return createResponse(mockData.vehicles[vehicleIndex]);
    },

    delete: async (id) => {
      await simulateDelay();
      const vehicleIndex = mockData.vehicles.findIndex(v => v.id === parseInt(id));
      if (vehicleIndex === -1) {
        return createErrorResponse("Vehicle not found", 404);
      }
      
      mockData.vehicles.splice(vehicleIndex, 1);
      return createResponse({ message: "Vehicle deleted successfully" });
    }
  },


  // Stations CRUD
  stations: {
    getAll: async (params = {}) => {
      await simulateDelay();
      return createResponse({
        stations: mockData.stations,
        total: mockData.stations.length
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const station = mockData.stations.find(s => s.id === parseInt(id));
      if (station) {
        return createResponse(station);
      }
      return createErrorResponse("Station not found", 404);
    },

    create: async (stationData) => {
      await simulateDelay();
      const newStation = {
        id: Math.max(...mockData.stations.map(s => s.id)) + 1,
        ...stationData
      };
      
      mockData.stations.push(newStation);
      return createResponse(newStation);
    },

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

    delete: async (id) => {
      await simulateDelay();
      const stationIndex = mockData.stations.findIndex(s => s.id === parseInt(id));
      if (stationIndex === -1) {
        return createErrorResponse("Station not found", 404);
      }
      
      mockData.stations.splice(stationIndex, 1);
      return createResponse({ message: "Station deleted successfully" });
    }
  },

  // Reservations CRUD and business logic
  reservations: {
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
      
      return createResponse({
        reservations,
        total: reservations.length
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const reservation = mockData.reservations.find(r => r.id === parseInt(id));
      if (reservation) {
        return createResponse(reservation);
      }
      return createErrorResponse("Reservation not found", 404);
    },

    create: async (reservationData) => {
      await simulateDelay();
      
      // Check if vehicle is available (if specific vehicle selected)
      if (reservationData.vehicle_id) {
        const vehicle = mockData.vehicles.find(v => v.id === reservationData.vehicle_id);
        if (!vehicle || vehicle.status !== 'available') {
          return createErrorResponse("Vehicle not available", 409);
        }
        
        // Update vehicle status to reserved
        vehicle.status = 'reserved';
      }
      
      const newReservation = {
        id: Math.max(...mockData.reservations.map(r => r.id)) + 1,
        ...reservationData,
        status: 'pending',
        created_at: generateTimestamp()
      };
      
      mockData.reservations.push(newReservation);
      return createResponse(newReservation);
    },

    update: async (id, reservationData) => {
      await simulateDelay();
      const reservationIndex = mockData.reservations.findIndex(r => r.id === parseInt(id));
      if (reservationIndex === -1) {
        return createErrorResponse("Reservation not found", 404);
      }
      
      mockData.reservations[reservationIndex] = {
        ...mockData.reservations[reservationIndex],
        ...reservationData
      };
      
      return createResponse(mockData.reservations[reservationIndex]);
    },

    cancel: async (id, reason, cancelledBy) => {
      await simulateDelay();
      const reservationIndex = mockData.reservations.findIndex(r => r.id === parseInt(id));
      if (reservationIndex === -1) {
        return createErrorResponse("Reservation not found", 404);
      }
      
      const reservation = mockData.reservations[reservationIndex];
      
      // If vehicle was reserved, make it available again
      if (reservation.vehicle_id) {
        const vehicle = mockData.vehicles.find(v => v.id === reservation.vehicle_id);
        if (vehicle) {
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

    confirm: async (id) => {
      await simulateDelay();
      const reservationIndex = mockData.reservations.findIndex(r => r.id === parseInt(id));
      if (reservationIndex === -1) {
        return createErrorResponse("Reservation not found", 404);
      }
      
      mockData.reservations[reservationIndex].status = 'confirmed';
      return createResponse(mockData.reservations[reservationIndex]);
    }
  },

  // Rentals CRUD and business logic
  rentals: {
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
      
      return createResponse({
        rentals,
        total: rentals.length
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const rental = mockData.rentals.find(r => r.id === parseInt(id));
      if (rental) {
        return createResponse(rental);
      }
      return createErrorResponse("Rental not found", 404);
    },

    create: async (rentalData) => {
      await simulateDelay();
      
      // Check if vehicle is available
      const vehicle = mockData.vehicles.find(v => v.id === rentalData.vehicle_id);
      if (!vehicle || (vehicle.status !== 'available' && vehicle.status !== 'reserved')) {
        return createErrorResponse("Vehicle not available", 409);
      }
      
      // Update vehicle status
      vehicle.status = 'rented';
      
      const newRental = {
        id: Math.max(...mockData.rentals.map(r => r.id)) + 1,
        ...rentalData,
        status: 'booked',
        created_at: generateTimestamp()
      };
      
      mockData.rentals.push(newRental);
      return createResponse(newRental);
    },

    startRental: async (id, staffId) => {
      await simulateDelay();
      const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(id));
      if (rentalIndex === -1) {
        return createErrorResponse("Rental not found", 404);
      }
      
      mockData.rentals[rentalIndex] = {
        ...mockData.rentals[rentalIndex],
        status: 'in_use',
        start_time: generateTimestamp(),
        staff_pickup_id: staffId
      };
      
      return createResponse(mockData.rentals[rentalIndex]);
    },

    endRental: async (id, endData) => {
      await simulateDelay();
      const rentalIndex = mockData.rentals.findIndex(r => r.id === parseInt(id));
      if (rentalIndex === -1) {
        return createErrorResponse("Rental not found", 404);
      }
      
      // Calculate total cost based on time and distance
      const rental = mockData.rentals[rentalIndex];
      const vehicle = mockData.vehicles.find(v => v.id === rental.vehicle_id);
      const startTime = new Date(rental.start_time);
      const endTime = new Date();
      const hours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
      const totalCost = hours * vehicle.price_per_hour;
      
      // Update vehicle status back to available
      vehicle.status = 'available';
      
      mockData.rentals[rentalIndex] = {
        ...rental,
        ...endData,
        status: 'returned',
        end_time: generateTimestamp(),
        total_cost: totalCost
      };
      
      return createResponse(mockData.rentals[rentalIndex]);
    }
  },

  // Payments CRUD
  payments: {
    getAll: async (params = {}) => {
      await simulateDelay();
      let payments = [...mockData.payments];
      
      if (params.rental_id) {
        payments = payments.filter(p => p.rental_id === parseInt(params.rental_id));
      }
      
      if (params.status) {
        payments = payments.filter(p => p.status === params.status);
      }
      
      return createResponse({
        payments,
        total: payments.length
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const payment = mockData.payments.find(p => p.id === parseInt(id));
      if (payment) {
        return createResponse(payment);
      }
      return createErrorResponse("Payment not found", 404);
    },

    create: async (paymentData) => {
      await simulateDelay();
      const newPayment = {
        id: Math.max(...mockData.payments.map(p => p.id)) + 1,
        ...paymentData,
        created_at: generateTimestamp()
      };
      
      mockData.payments.push(newPayment);
      return createResponse(newPayment);
    },

    processPayment: async (id) => {
      await simulateDelay();
      const paymentIndex = mockData.payments.findIndex(p => p.id === parseInt(id));
      if (paymentIndex === -1) {
        return createErrorResponse("Payment not found", 404);
      }
      
      // Simulate payment processing (90% success rate)
      const success = Math.random() > 0.1;
      
      mockData.payments[paymentIndex].status = success ? 'paid' : 'failed';
      
      return createResponse({
        ...mockData.payments[paymentIndex],
        processed: true,
        success
      });
    }
  },

  // Documents CRUD
  documents: {
    getAll: async (params = {}) => {
      await simulateDelay();
      let documents = [...mockData.documents];
      
      if (params.user_id) {
        documents = documents.filter(d => d.user_id === parseInt(params.user_id));
      }
      
      if (params.type) {
        documents = documents.filter(d => d.type === params.type);
      }
      
      if (params.verified !== undefined) {
        documents = documents.filter(d => d.verified === params.verified);
      }
      
      return createResponse({
        documents,
        total: documents.length
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const document = mockData.documents.find(d => d.id === parseInt(id));
      if (document) {
        return createResponse(document);
      }
      return createErrorResponse("Document not found", 404);
    },

    create: async (documentData) => {
      await simulateDelay();
      const newDocument = {
        id: Math.max(...mockData.documents.map(d => d.id)) + 1,
        ...documentData,
        verified: false,
        created_at: generateTimestamp()
      };
      
      mockData.documents.push(newDocument);
      return createResponse(newDocument);
    },

    verify: async (id, verifiedBy) => {
      await simulateDelay();
      const documentIndex = mockData.documents.findIndex(d => d.id === parseInt(id));
      if (documentIndex === -1) {
        return createErrorResponse("Document not found", 404);
      }
      
      mockData.documents[documentIndex] = {
        ...mockData.documents[documentIndex],
        verified: true,
        verified_by: verifiedBy
      };
      
      return createResponse(mockData.documents[documentIndex]);
    }
  },

  // Rental Checks CRUD
  rentalChecks: {
    getAll: async (params = {}) => {
      await simulateDelay();
      let checks = [...mockData.rentalChecks];
      
      if (params.rental_id) {
        checks = checks.filter(c => c.rental_id === parseInt(params.rental_id));
      }
      
      if (params.check_type) {
        checks = checks.filter(c => c.check_type === params.check_type);
      }
      
      return createResponse({
        checks,
        total: checks.length
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const check = mockData.rentalChecks.find(c => c.id === parseInt(id));
      if (check) {
        return createResponse(check);
      }
      return createErrorResponse("Rental check not found", 404);
    },

    create: async (checkData) => {
      await simulateDelay();
      const newCheck = {
        id: Math.max(...mockData.rentalChecks.map(c => c.id)) + 1,
        ...checkData,
        created_at: generateTimestamp()
      };
      
      mockData.rentalChecks.push(newCheck);
      return createResponse(newCheck);
    }
  },

  // Violations CRUD
  violations: {
    getAll: async (params = {}) => {
      await simulateDelay();
      let violations = [...mockData.violations];
      
      if (params.rental_id) {
        violations = violations.filter(v => v.rental_id === parseInt(params.rental_id));
      }
      
      return createResponse({
        violations,
        total: violations.length
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const violation = mockData.violations.find(v => v.id === parseInt(id));
      if (violation) {
        return createResponse(violation);
      }
      return createErrorResponse("Violation not found", 404);
    },

    create: async (violationData) => {
      await simulateDelay();
      const newViolation = {
        id: Math.max(...mockData.violations.map(v => v.id)) + 1,
        ...violationData,
        created_at: generateTimestamp()
      };
      
      mockData.violations.push(newViolation);
      return createResponse(newViolation);
    }
  },

  // Ratings CRUD
  ratings: {
    getAll: async (params = {}) => {
      await simulateDelay();
      let ratings = [...mockData.ratings];
      
      if (params.rental_id) {
        ratings = ratings.filter(r => r.rental_id === parseInt(params.rental_id));
      }
      
      if (params.renter_id) {
        ratings = ratings.filter(r => r.renter_id === parseInt(params.renter_id));
      }
      
      return createResponse({
        ratings,
        total: ratings.length,
        averageRating: ratings.length > 0 ? 
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const rating = mockData.ratings.find(r => r.id === parseInt(id));
      if (rating) {
        return createResponse(rating);
      }
      return createErrorResponse("Rating not found", 404);
    },

    create: async (ratingData) => {
      await simulateDelay();
      // Check if user already rated this rental
      const existingRating = mockData.ratings.find(r => 
        r.rental_id === ratingData.rental_id && r.renter_id === ratingData.renter_id
      );
      
      if (existingRating) {
        return createErrorResponse("Rating already exists for this rental", 409);
      }
      
      const newRating = {
        id: Math.max(...mockData.ratings.map(r => r.id)) + 1,
        ...ratingData,
        created_at: generateTimestamp()
      };
      
      mockData.ratings.push(newRating);
      return createResponse(newRating);
    }
  },

  // Staff Ratings CRUD
  staffRatings: {
    getAll: async (params = {}) => {
      await simulateDelay();
      let staffRatings = [...mockData.staffRatings];
      
      if (params.staff_id) {
        staffRatings = staffRatings.filter(sr => sr.staff_id === parseInt(params.staff_id));
      }
      
      if (params.rental_id) {
        staffRatings = staffRatings.filter(sr => sr.rental_id === parseInt(params.rental_id));
      }
      
      return createResponse({
        staffRatings,
        total: staffRatings.length,
        averageRating: staffRatings.length > 0 ? 
          staffRatings.reduce((sum, sr) => sum + sr.rating, 0) / staffRatings.length : 0
      });
    },

    create: async (staffRatingData) => {
      await simulateDelay();
      const newStaffRating = {
        id: Math.max(...mockData.staffRatings.map(sr => sr.id)) + 1,
        ...staffRatingData,
        created_at: generateTimestamp()
      };
      
      mockData.staffRatings.push(newStaffRating);
      return createResponse(newStaffRating);
    }
  },

  // Complaints CRUD
  complaints: {
    getAll: async (params = {}) => {
      await simulateDelay();
      let complaints = [...mockData.complaints];
      
      if (params.renter_id) {
        complaints = complaints.filter(c => c.renter_id === parseInt(params.renter_id));
      }
      
      if (params.status) {
        complaints = complaints.filter(c => c.status === params.status);
      }
      
      return createResponse({
        complaints,
        total: complaints.length
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const complaint = mockData.complaints.find(c => c.id === parseInt(id));
      if (complaint) {
        return createResponse(complaint);
      }
      return createErrorResponse("Complaint not found", 404);
    },

    create: async (complaintData) => {
      await simulateDelay();
      const newComplaint = {
        id: Math.max(...mockData.complaints.map(c => c.id)) + 1,
        ...complaintData,
        status: 'pending',
        created_at: generateTimestamp()
      };
      
      mockData.complaints.push(newComplaint);
      return createResponse(newComplaint);
    },

    resolve: async (id, resolution, adminId) => {
      await simulateDelay();
      const complaintIndex = mockData.complaints.findIndex(c => c.id === parseInt(id));
      if (complaintIndex === -1) {
        return createErrorResponse("Complaint not found", 404);
      }
      
      mockData.complaints[complaintIndex] = {
        ...mockData.complaints[complaintIndex],
        status: 'resolved',
        resolution,
        admin_id: adminId,
        resolved_at: generateTimestamp()
      };
      
      return createResponse(mockData.complaints[complaintIndex]);
    }
  },

  // Incident Reports CRUD
  incidentReports: {
    getAll: async (params = {}) => {
      await simulateDelay();
      let reports = [...mockData.incidentReports];
      
      if (params.vehicle_id) {
        reports = reports.filter(r => r.vehicle_id === parseInt(params.vehicle_id));
      }
      
      if (params.status) {
        reports = reports.filter(r => r.status === params.status);
      }
      
      if (params.severity) {
        reports = reports.filter(r => r.severity === params.severity);
      }
      
      return createResponse({
        reports,
        total: reports.length
      });
    },

    getById: async (id) => {
      await simulateDelay();
      const report = mockData.incidentReports.find(r => r.id === parseInt(id));
      if (report) {
        return createResponse(report);
      }
      return createErrorResponse("Incident report not found", 404);
    },

    create: async (reportData) => {
      await simulateDelay();
      const newReport = {
        id: Math.max(...mockData.incidentReports.map(r => r.id)) + 1,
        ...reportData,
        status: 'pending',
        created_at: generateTimestamp()
      };
      
      mockData.incidentReports.push(newReport);
      
      // If severity is high, update vehicle status to maintenance
      if (reportData.severity === 'high') {
        const vehicle = mockData.vehicles.find(v => v.id === reportData.vehicle_id);
        if (vehicle) {
          vehicle.status = 'maintenance';
        }
      }
      
      return createResponse(newReport);
    },

    resolve: async (id, adminId) => {
      await simulateDelay();
      const reportIndex = mockData.incidentReports.findIndex(r => r.id === parseInt(id));
      if (reportIndex === -1) {
        return createErrorResponse("Incident report not found", 404);
      }
      
      mockData.incidentReports[reportIndex] = {
        ...mockData.incidentReports[reportIndex],
        status: 'resolved',
        admin_id: adminId,
        resolved_at: generateTimestamp()
      };
      
      return createResponse(mockData.incidentReports[reportIndex]);
    }
  },

  // Staff Stations CRUD
  staffStations: {
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
        staffStations = staffStations.filter(ss => ss.is_active === params.is_active);
      }
      
      return createResponse({
        staffStations,
        total: staffStations.length
      });
    },

    create: async (staffStationData) => {
      await simulateDelay();
      const newStaffStation = {
        id: Math.max(...mockData.staffStations.map(ss => ss.id)) + 1,
        ...staffStationData,
        assigned_at: generateTimestamp()
      };
      
      mockData.staffStations.push(newStaffStation);
      return createResponse(newStaffStation);
    },

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
    }
  },

  // Analytics and Reporting endpoints
  analytics: {
    dashboard: async () => {
      await simulateDelay();
      const totalUsers = mockData.users.length;
      const totalVehicles = mockData.vehicles.length;
      const totalRentals = mockData.rentals.length;
      const activeRentals = mockData.rentals.filter(r => r.status === 'in_use').length;
      const availableVehicles = mockData.vehicles.filter(v => v.status === 'available').length;
      const totalRevenue = mockData.payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      
      return createResponse({
        totalUsers,
        totalVehicles,
        totalRentals,
        activeRentals,
        availableVehicles,
        totalRevenue,
        averageRating: mockData.ratings.length > 0 ? 
          mockData.ratings.reduce((sum, r) => sum + r.rating, 0) / mockData.ratings.length : 0
      });
    },

    vehicleUsage: async () => {
      await simulateDelay();
      const vehicleStats = mockData.vehicles.map(vehicle => {
        const rentals = mockData.rentals.filter(r => r.vehicle_id === vehicle.id);
        const totalHours = rentals.reduce((sum, rental) => {
          if (rental.start_time && rental.end_time) {
            const hours = (new Date(rental.end_time) - new Date(rental.start_time)) / (1000 * 60 * 60);
            return sum + hours;
          }
          return sum;
        }, 0);
        
        return {
          vehicle,
          totalRentals: rentals.length,
          totalHours: Math.round(totalHours * 100) / 100,
          revenue: rentals.reduce((sum, r) => sum + (r.total_cost || 0), 0)
        };
      });
      
      return createResponse(vehicleStats);
    },

    revenueReport: async (startDate, endDate) => {
      await simulateDelay();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const payments = mockData.payments.filter(p => {
        const paymentDate = new Date(p.created_at);
        return paymentDate >= start && paymentDate <= end && p.status === 'paid';
      });
      
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const paymentsByMethod = payments.reduce((acc, p) => {
        acc[p.method] = (acc[p.method] || 0) + p.amount;
        return acc;
      }, {});
      
      return createResponse({
        totalRevenue,
        paymentCount: payments.length,
        paymentsByMethod,
        averagePayment: payments.length > 0 ? totalRevenue / payments.length : 0
      });
    }
  }
};

// Export mock API configuration for easy switching
export const API_CONFIG = {
  IS_MOCK: import.meta.env.VITE_USE_MOCK_API === 'true' || true, // Set to false when backend is ready
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5174/api",
  MOCK_DELAY: parseInt(import.meta.env.VITE_MOCK_DELAY) || 500 // milliseconds
};
