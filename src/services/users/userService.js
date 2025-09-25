// User Service API
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

export const userService = {
  // Get all users with filtering and pagination
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

    // Search by name or email
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      users = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
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

  // Get user by ID
  getById: async (id) => {
    await simulateDelay();
    const user = mockData.users.find(u => u.id === parseInt(id));
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return createResponse(userWithoutPassword);
    }
    return createErrorResponse("User not found", 404);
  },

  // Create new user
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockData.users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return createResponse(userWithoutPassword);
  },

  // Update user
  update: async (id, userData) => {
    await simulateDelay();
    const userIndex = mockData.users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return createErrorResponse("User not found", 404);
    }

    // Check if email is being changed and already exists
    if (userData.email && userData.email !== mockData.users[userIndex].email) {
      const existingUser = mockData.users.find(u => u.email === userData.email);
      if (existingUser) {
        return createErrorResponse("Email already exists", 409);
      }
    }

    mockData.users[userIndex] = {
      ...mockData.users[userIndex],
      ...userData,
      updated_at: new Date().toISOString()
    };

    const { password, ...userWithoutPassword } = mockData.users[userIndex];
    return createResponse(userWithoutPassword);
  },

  // Delete user
  delete: async (id) => {
    await simulateDelay();
    const userIndex = mockData.users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return createErrorResponse("User not found", 404);
    }

    mockData.users.splice(userIndex, 1);
    return createResponse({ message: "User deleted successfully" });
  },

  // Get users by role
  getByRole: async (role) => {
    await simulateDelay();
    const users = mockData.users
      .filter(u => u.role === role)
      .map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

    return createResponse(users);
  },

  // Change password
  changePassword: async (id, currentPassword, newPassword) => {
    await simulateDelay();
    const user = mockData.users.find(u => u.id === parseInt(id));
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    if (user.password !== currentPassword) {
      return createErrorResponse("Current password is incorrect", 400);
    }

    user.password = newPassword;
    user.updated_at = new Date().toISOString();

    return createResponse({ message: "Password changed successfully" });
  },

  // Admin namespace for user management
  admin: {
    // Create new user (staff or admin)
    createUser: async (userData) => {
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
      if (!userData.full_name || !userData.email || !userData.phone || !userData.password || !userData.role) {
        return {
          status: 400,
          error: "ValidationError",
          message: "Vui lòng điền đầy đủ thông tin"
        };
      }

      // Validate role
      if (!['staff', 'admin'].includes(userData.role)) {
        return {
          status: 400,
          error: "ValidationError",
          message: "Role chỉ có thể là staff hoặc admin"
        };
      }

      // Check for duplicate email
      const existingEmailUser = mockData.users.find(u => u.email === userData.email);
      if (existingEmailUser) {
        return {
          status: 400,
          error: "DuplicateUser",
          message: "Email hoặc số điện thoại đã tồn tại"
        };
      }

      // Check for duplicate phone
      const existingPhoneUser = mockData.users.find(u => u.phone === userData.phone);
      if (existingPhoneUser) {
        return {
          status: 400,
          error: "DuplicateUser",
          message: "Email hoặc số điện thoại đã tồn tại"
        };
      }

      // Create new user
      const newUser = {
        id: Math.max(...mockData.users.map(u => u.id)) + 1,
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role,
        status: 'active',
        refresh_token: `refresh_token_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockData.users.push(newUser);

      // Return response without password
      const { password, refresh_token, ...userResponse } = newUser;
      return {
        user: userResponse
      };
    },

    // Get all users with filtering
    getUsers: async (params = {}) => {
      await simulateDelay();
      
      console.log('userService.admin.getUsers called with params:', params);
      console.log('mockData.users length:', mockData.users.length);
      console.log('First user:', mockData.users[0]);

      // Admin authentication simulation
      const currentAdminId = 1; // Simulate current admin ID
      if (!currentAdminId) {
        return {
          status: 401,
          error: "Unauthorized",
          message: "Bạn không có quyền thực hiện thao tác này"
        };
      }

      let users = [...mockData.users].map(user => {
        if (!user) {
          console.log('Found null user in mockData');
          return null;
        }
        const { password, refresh_token, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
      }).filter(user => user !== null);
      
      console.log('Processed users length:', users.length);
      console.log('Processed users:', users);
      
      // Additional check for any null users that might have slipped through
      users = users.filter(user => {
        if (!user) {
          console.log('Found null user in processed array');
          return false;
        }
        if (!user.role) {
          console.log('Found user without role:', user);
          return false;
        }
        return true;
      });

      // Filter by role if specified
      if (params.role && ['renter', 'staff', 'admin', 'moderator'].includes(params.role)) {
        users = users.filter(user => {
          if (!user) {
            console.log('Found null user during role filtering');
            return false;
          }
          if (!user.role) {
            console.log('Found user without role during role filtering:', user);
            return false;
          }
          return user.role === params.role;
        });
      }

      // Filter by phone if specified
      if (params.phone) {
        users = users.filter(user => {
          if (!user) {
            console.log('Found null user during phone filtering');
            return false;
          }
          if (!user.phone) {
            console.log('Found user without phone during phone filtering:', user);
            return false;
          }
          return user.phone.includes(params.phone);
        });
      }

      const result = {
        users: users
      };
      
      console.log('Final result:', result);
      return result;
    },

    // Get user by ID
    getUserById: async (id) => {
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

      const user = mockData.users.find(u => u.id === parseInt(id));
      if (!user) {
        return {
          status: 404,
          error: "UserNotFound",
          message: "Không tìm thấy user"
        };
      }

      const { password, refresh_token, ...userResponse } = user;
      return userResponse;
    },

    // Update user
    updateUser: async (id, userData) => {
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

      const userIndex = mockData.users.findIndex(u => u.id === parseInt(id));
      if (userIndex === -1) {
        return {
          status: 404,
          error: "UserNotFound",
          message: "Không tìm thấy user"
        };
      }

      const currentUser = mockData.users[userIndex];

      // Check for duplicate email if email is being updated
      if (userData.email && userData.email !== currentUser.email) {
        const existingEmailUser = mockData.users.find(u => u.email === userData.email && u.id !== parseInt(id));
        if (existingEmailUser) {
          return {
            status: 400,
            error: "DuplicateUser",
            message: "Email hoặc số điện thoại đã tồn tại"
          };
        }
      }

      // Check for duplicate phone if phone is being updated
      if (userData.phone && userData.phone !== currentUser.phone) {
        const existingPhoneUser = mockData.users.find(u => u.phone === userData.phone && u.id !== parseInt(id));
        if (existingPhoneUser) {
          return {
            status: 400,
            error: "DuplicateUser",
            message: "Email hoặc số điện thoại đã tồn tại"
          };
        }
      }

      // Validate role if being updated
      if (userData.role && !['renter', 'staff', 'admin'].includes(userData.role)) {
        return {
          status: 400,
          error: "ValidationError",
          message: "Role không hợp lệ"
        };
      }

      // Validate status if being updated
      if (userData.status && !['active', 'inactive'].includes(userData.status)) {
        return {
          status: 400,
          error: "ValidationError",
          message: "Status không hợp lệ"
        };
      }

      // Update user
      const updatedUser = {
        ...currentUser,
        ...userData,
        updated_at: new Date().toISOString()
      };

      mockData.users[userIndex] = updatedUser;

      const { password, refresh_token, ...userResponse } = updatedUser;
      return {
        message: "Cập nhật thành công",
        user: userResponse
      };
    },

    // Delete user
    deleteUser: async (id) => {
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

      const userIndex = mockData.users.findIndex(u => u.id === parseInt(id));
      if (userIndex === -1) {
        return {
          status: 404,
          error: "UserNotFound",
          message: "Không tìm thấy user"
        };
      }

      // Check if user has active rentals (prevent deletion if so)
      const hasActiveRentals = mockData.rentals.some(r =>
        r.user_id === parseInt(id) && ['confirmed', 'picked_up'].includes(r.status)
      );

      if (hasActiveRentals) {
        return {
          status: 400,
          error: "ConflictError",
          message: "Không thể xóa user có đơn thuê đang hoạt động"
        };
      }

      // Remove user
      mockData.users.splice(userIndex, 1);

      return {
        message: "Xóa user thành công"
      };
    },

    // Get all renters with statistics
    getRenters: async (params = {}) => {
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

      // Get all users with renter role
      let renters = mockData.users.filter(u => u.role === 'renter');

      // Filter by verified status if specified
      if (params.verified !== undefined) {
        const isVerified = params.verified === 'true';
        renters = renters.filter(r => {
          // Check if renter has verified documents or completed rentals
          const hasCompletedRentals = mockData.rentals.some(rental =>
            rental.user_id === r.id && ['completed', 'returned'].includes(rental.status)
          );
          return isVerified ? hasCompletedRentals : !hasCompletedRentals;
        });
      }

      // Calculate statistics for each renter
      const enrichedRenters = renters.map(renter => {
        // Count total rentals
        const totalRentals = mockData.rentals.filter(r => r.user_id === renter.id).length;

        // Calculate total payments
        const renterPayments = mockData.payments.filter(p => {
          const rental = mockData.rentals.find(r => r.id === p.rental_id);
          return rental && rental.user_id === renter.id && p.status === 'paid';
        });
        const totalPayments = renterPayments.reduce((sum, p) => sum + p.amount, 0);

        return {
          id: renter.id,
          full_name: renter.full_name,
          phone: renter.phone,
          email: renter.email || null,
          total_rentals: totalRentals,
          total_payments: totalPayments
        };
      });

      // Sort by total rentals (most active first)
      enrichedRenters.sort((a, b) => b.total_rentals - a.total_rentals);

      return {
        renters: enrichedRenters
      };
    }
  }
};