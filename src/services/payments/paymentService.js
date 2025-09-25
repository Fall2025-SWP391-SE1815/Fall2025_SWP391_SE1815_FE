// Payment Service API
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

export const paymentService = {
  // Get all payments with filtering
  getAll: async (params = {}) => {
    await simulateDelay();
    let payments = [...mockData.payments];
    
    // Filter by rental
    if (params.rental_id) {
      payments = payments.filter(p => p.rental_id === parseInt(params.rental_id));
    }
    
    // Filter by status
    if (params.status) {
      payments = payments.filter(p => p.status === params.status);
    }
    
    // Filter by payment method
    if (params.method) {
      payments = payments.filter(p => p.method === params.method);
    }
    
    // Filter by date range
    if (params.start_date) {
      payments = payments.filter(p => 
        new Date(p.created_at) >= new Date(params.start_date)
      );
    }
    
    if (params.end_date) {
      payments = payments.filter(p => 
        new Date(p.created_at) <= new Date(params.end_date)
      );
    }
    
    // Filter by amount range
    if (params.min_amount) {
      payments = payments.filter(p => p.amount >= parseFloat(params.min_amount));
    }
    
    if (params.max_amount) {
      payments = payments.filter(p => p.amount <= parseFloat(params.max_amount));
    }
    
    // Sort by creation date (newest first)
    payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return createResponse({
      payments: payments.slice(startIndex, endIndex),
      total: payments.length,
      page,
      limit,
      totalPages: Math.ceil(payments.length / limit)
    });
  },

  // Get payment by ID
  getById: async (id) => {
    await simulateDelay();
    const payment = mockData.payments.find(p => p.id === parseInt(id));
    if (payment) {
      return createResponse(payment);
    }
    return createErrorResponse("Payment not found", 404);
  },

  // Get payments by user ID
  getByUser: async (userId) => {
    await simulateDelay();
    const userRentals = mockData.rentals.filter(r => r.renter_id === parseInt(userId));
    const rentalIds = userRentals.map(r => r.id);
    const userPayments = mockData.payments.filter(p => rentalIds.includes(p.rental_id));
    
    // Sort by creation date (newest first)
    userPayments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return createResponse(userPayments);
  },

  // Create new payment
  create: async (paymentData) => {
    await simulateDelay();
    
    // Validate rental exists
    if (paymentData.rental_id) {
      const rental = mockData.rentals.find(r => r.id === paymentData.rental_id);
      if (!rental) {
        return createErrorResponse("Rental not found", 404);
      }
    }
    
    // Validate payment method
    const validMethods = ['cash', 'card', 'e-wallet', 'bank_transfer'];
    if (!validMethods.includes(paymentData.method)) {
      return createErrorResponse("Invalid payment method", 400);
    }
    
    // Validate amount
    if (paymentData.amount <= 0) {
      return createErrorResponse("Payment amount must be greater than 0", 400);
    }
    
    const newPayment = {
      id: Math.max(...mockData.payments.map(p => p.id)) + 1,
      ...paymentData,
      status: paymentData.status || 'pending',
      created_at: new Date().toISOString()
    };
    
    mockData.payments.push(newPayment);
    return createResponse(newPayment);
  },

  // Process payment
  processPayment: async (id, paymentDetails = {}) => {
    await simulateDelay();
    const paymentIndex = mockData.payments.findIndex(p => p.id === parseInt(id));
    if (paymentIndex === -1) {
      return createErrorResponse("Payment not found", 404);
    }
    
    const payment = mockData.payments[paymentIndex];
    
    if (payment.status !== 'pending') {
      return createErrorResponse("Payment is not pending", 400);
    }
    
    // Simulate payment processing (90% success rate)
    const success = Math.random() > 0.1;
    
    mockData.payments[paymentIndex] = {
      ...payment,
      ...paymentDetails,
      status: success ? 'paid' : 'failed',
      processed_at: new Date().toISOString()
    };
    
    // If payment failed, generate failure reason
    if (!success) {
      const failureReasons = [
        'Insufficient funds',
        'Card declined',
        'Network timeout',
        'Invalid card details',
        'Transaction limit exceeded'
      ];
      mockData.payments[paymentIndex].failure_reason = 
        failureReasons[Math.floor(Math.random() * failureReasons.length)];
    }
    
    return createResponse({
      ...mockData.payments[paymentIndex],
      processed: true,
      success
    });
  },

  // Refund payment
  refund: async (id, refundAmount = null, reason = '') => {
    await simulateDelay();
    const paymentIndex = mockData.payments.findIndex(p => p.id === parseInt(id));
    if (paymentIndex === -1) {
      return createErrorResponse("Payment not found", 404);
    }
    
    const payment = mockData.payments[paymentIndex];
    
    if (payment.status !== 'paid') {
      return createErrorResponse("Can only refund paid payments", 400);
    }
    
    const refundAmountFinal = refundAmount || payment.amount;
    
    if (refundAmountFinal > payment.amount) {
      return createErrorResponse("Refund amount cannot exceed payment amount", 400);
    }
    
    // Create refund record (as a negative payment)
    const refundPayment = {
      id: Math.max(...mockData.payments.map(p => p.id)) + 1,
      rental_id: payment.rental_id,
      amount: -refundAmountFinal,
      method: payment.method,
      status: 'paid',
      payment_type: 'refund',
      original_payment_id: payment.id,
      refund_reason: reason,
      created_at: new Date().toISOString()
    };
    
    mockData.payments.push(refundPayment);
    
    // Update original payment status
    if (refundAmountFinal === payment.amount) {
      mockData.payments[paymentIndex].status = 'refunded';
    } else {
      mockData.payments[paymentIndex].status = 'partially_refunded';
    }
    
    mockData.payments[paymentIndex].refunded_amount = 
      (mockData.payments[paymentIndex].refunded_amount || 0) + refundAmountFinal;
    
    return createResponse({
      originalPayment: mockData.payments[paymentIndex],
      refundPayment
    });
  },

  // Get payments by rental
  getByRental: async (rentalId) => {
    await simulateDelay();
    const payments = mockData.payments.filter(p => p.rental_id === parseInt(rentalId));
    
    const totalPaid = payments
      .filter(p => p.status === 'paid' && p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalRefunded = payments
      .filter(p => p.status === 'paid' && p.amount < 0)
      .reduce((sum, p) => sum + Math.abs(p.amount), 0);
    
    return createResponse({
      payments,
      summary: {
        totalPaid,
        totalRefunded,
        netAmount: totalPaid - totalRefunded
      }
    });
  },

  // Get payment statistics
  getStats: async (params = {}) => {
    await simulateDelay();
    let payments = [...mockData.payments];
    
    // Filter by date range if provided
    if (params.start_date) {
      payments = payments.filter(p => 
        new Date(p.created_at) >= new Date(params.start_date)
      );
    }
    
    if (params.end_date) {
      payments = payments.filter(p => 
        new Date(p.created_at) <= new Date(params.end_date)
      );
    }
    
    const totalPayments = payments.length;
    const paidPayments = payments.filter(p => p.status === 'paid' && p.amount > 0);
    const failedPayments = payments.filter(p => p.status === 'failed');
    const refundPayments = payments.filter(p => p.amount < 0);
    
    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunded = refundPayments.reduce((sum, p) => sum + Math.abs(p.amount), 0);
    const netRevenue = totalRevenue - totalRefunded;
    
    // Payment methods breakdown
    const paymentMethods = {};
    paidPayments.forEach(p => {
      paymentMethods[p.method] = (paymentMethods[p.method] || 0) + p.amount;
    });
    
    // Success rate
    const processedPayments = payments.filter(p => 
      p.status === 'paid' || p.status === 'failed'
    );
    const successRate = processedPayments.length > 0 ? 
      (paidPayments.length / processedPayments.length) * 100 : 0;
    
    return createResponse({
      totalPayments,
      paidCount: paidPayments.length,
      failedCount: failedPayments.length,
      refundCount: refundPayments.length,
      totalRevenue,
      totalRefunded,
      netRevenue,
      averagePayment: paidPayments.length > 0 ? 
        totalRevenue / paidPayments.length : 0,
      successRate: Math.round(successRate * 100) / 100,
      paymentMethods
    });
  },

  // Retry failed payment
  retry: async (id) => {
    await simulateDelay();
    const paymentIndex = mockData.payments.findIndex(p => p.id === parseInt(id));
    if (paymentIndex === -1) {
      return createErrorResponse("Payment not found", 404);
    }
    
    const payment = mockData.payments[paymentIndex];
    
    if (payment.status !== 'failed') {
      return createErrorResponse("Can only retry failed payments", 400);
    }
    
    // Reset to pending status
    mockData.payments[paymentIndex].status = 'pending';
    delete mockData.payments[paymentIndex].failure_reason;
    delete mockData.payments[paymentIndex].processed_at;
    
    return createResponse(mockData.payments[paymentIndex]);
  },

  // Get pending payments
  getPending: async () => {
    await simulateDelay();
    const pendingPayments = mockData.payments.filter(p => p.status === 'pending');
    
    return createResponse(pendingPayments);
  },

  // Renter API methods - matching exact specification
  renter: {
    // Get payment transaction history (GET /api/renter/payments)
    getPayments: async () => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Get user's rentals first
      const userRentals = mockData.rentals.filter(r => r.renter_id === currentUserId);
      const rentalIds = userRentals.map(r => r.id);
      
      // Get payments for user's rentals
      const userPayments = mockData.payments.filter(p => rentalIds.includes(p.rental_id));
      
      // Return payments with required fields
      const formattedPayments = userPayments.map(payment => ({
        id: payment.id,
        rental_id: payment.rental_id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        created_at: payment.created_at
      }));
      
      // Sort by creation date (newest first)
      formattedPayments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return createResponse({
        payments: formattedPayments
      });
    },

    // Get specific payment detail (GET /api/renter/payments/:id)
    getPaymentById: async (paymentId) => {
      await simulateDelay();
      
      // Get current user (simulate from token)
      const currentUserId = 1; // This would come from JWT token in real implementation
      
      // Find the payment
      const payment = mockData.payments.find(p => p.id === parseInt(paymentId));
      
      if (!payment) {
        return createErrorResponse("Không tìm thấy giao dịch", 404);
      }
      
      // Verify payment ownership through rental
      const rental = mockData.rentals.find(r => 
        r.id === payment.rental_id && r.renter_id === currentUserId
      );
      
      if (!rental) {
        return createErrorResponse("Không tìm thấy giao dịch", 404);
      }
      
      return createResponse({
        payment: {
          id: payment.id,
          rental_id: payment.rental_id,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          created_at: payment.created_at
        }
      });
    }
  },

  // Staff API methods - matching exact specification
  staff: {
    // Record payment at station (POST /api/staff/rentals/:id/payment)
    recordPayment: async (rentalId, paymentData) => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate staff exists and has proper role
      const staff = mockData.users.find(u => u.id === currentStaffId && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Validate rental exists
      const rental = mockData.rentals.find(r => r.id === parseInt(rentalId));
      if (!rental) {
        return createErrorResponse("Không tìm thấy lượt thuê", 404);
      }
      
      // Validate required fields
      if (!paymentData.amount) {
        return createErrorResponse("Thiếu thông tin số tiền", 400);
      }
      
      if (!paymentData.method) {
        return createErrorResponse("Thiếu phương thức thanh toán", 400);
      }
      
      // Validate payment method
      const validMethods = ['cash', 'card', 'e-wallet'];
      if (!validMethods.includes(paymentData.method)) {
        return createErrorResponse("Phương thức thanh toán không hợp lệ", 400);
      }
      
      // Validate amount is positive
      if (paymentData.amount <= 0) {
        return createErrorResponse("Số tiền phải lớn hơn 0", 400);
      }
      
      // Create new payment record
      const newPayment = {
        id: Math.max(...mockData.payments.map(p => p.id), 0) + 1,
        rental_id: parseInt(rentalId),
        amount: parseInt(paymentData.amount),
        method: paymentData.method,
        status: 'completed',
        transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        processed_by: currentStaffId,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockData.payments.push(newPayment);
      
      return createResponse({
        payment_id: newPayment.id,
        rental_id: newPayment.rental_id,
        amount: newPayment.amount,
        method: newPayment.method,
        status: newPayment.status,
        created_at: newPayment.created_at
      }, true, "Thanh toán đã được ghi nhận.");
    },

    // Get pending payments (GET /api/staff/payments/pending)
    getPendingPayments: async () => {
      await simulateDelay();
      
      // Get current staff (simulate from token)
      const currentStaffId = 2; // This would come from JWT token in real implementation
      
      // Validate staff exists and has proper role
      const staff = mockData.users.find(u => u.id === currentStaffId && u.role === 'staff');
      if (!staff) {
        return createErrorResponse("Không có quyền truy cập", 403);
      }
      
      // Get pending payments
      const pendingPayments = mockData.payments.filter(p => p.status === 'pending');
      
      // Format response data with renter information
      const formattedPayments = pendingPayments.map(payment => {
        const rental = mockData.rentals.find(r => r.id === payment.rental_id);
        const renter = rental ? mockData.users.find(u => u.id === rental.renter_id) : null;
        
        return {
          payment_id: payment.id,
          rental_id: payment.rental_id,
          renter_name: renter ? renter.full_name : 'Unknown',
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          created_at: payment.created_at
        };
      });
      
      // Sort by creation date (oldest first for processing priority)
      formattedPayments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      return createResponse(formattedPayments);
    }
  },

  // Admin namespace for payment monitoring and statistics
  admin: {
    // Get all payments with filtering for admin monitoring
    getPayments: async (params = {}) => {
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
      
      let payments = [...mockData.payments];
      
      // Filter by status
      if (params.status && ['pending', 'paid', 'failed'].includes(params.status)) {
        payments = payments.filter(p => p.status === params.status);
      }
      
      // Filter by renter
      if (params.renter_id) {
        payments = payments.filter(p => {
          // Find rental to get renter_id
          const rental = mockData.rentals.find(r => r.id === p.rental_id);
          return rental && rental.user_id === parseInt(params.renter_id);
        });
      }
      
      // Format response according to API spec
      const formattedPayments = payments.map(payment => {
        // Find rental to get renter_id
        const rental = mockData.rentals.find(r => r.id === payment.rental_id);
        
        return {
          id: payment.id,
          rental_id: payment.rental_id,
          renter_id: rental ? rental.user_id : null,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          created_at: payment.created_at
        };
      });
      
      return {
        payments: formattedPayments
      };
    },

    // Get payment statistics for admin dashboard
    getPaymentStats: async () => {
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
      
      const payments = [...mockData.payments];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Calculate total revenue (all paid payments)
      const paidPayments = payments.filter(p => p.status === 'paid');
      const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Calculate today's revenue
      const todayPayments = paidPayments.filter(p => 
        new Date(p.created_at) >= today
      );
      const revenueToday = todayPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Calculate this month's revenue
      const monthPayments = paidPayments.filter(p => 
        new Date(p.created_at) >= thisMonth
      );
      const revenueMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Count successful and failed payments
      const successfulPayments = payments.filter(p => p.status === 'paid').length;
      const failedPayments = payments.filter(p => p.status === 'failed').length;
      
      return {
        total_revenue: totalRevenue,
        revenue_today: revenueToday,
        revenue_month: revenueMonth,
        successful_payments: successfulPayments,
        failed_payments: failedPayments
      };
    }
  }
};