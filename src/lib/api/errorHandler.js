// Enhanced Error Handler for Real API Integration
export class ApiErrorHandler {
  
  /**
   * Handle different types of API errors
   * @param {Error} error - Error object from axios or custom error
   * @returns {Object} - Standardized error response
   */
  static handleError(error) {
    // Network errors (no response)
    if (!error.response) {
      return {
        success: false,
        message: 'Network error. Please check your internet connection.',
        statusCode: 0,
        type: 'NETWORK_ERROR',
        timestamp: new Date().toISOString()
      };
    }

    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return this.handleBadRequest(data);
      case 401:
        return this.handleUnauthorized(data);
      case 403:
        return this.handleForbidden(data);
      case 404:
        return this.handleNotFound(data);
      case 409:
        return this.handleConflict(data);
      case 422:
        return this.handleValidationError(data);
      case 429:
        return this.handleRateLimit(data);
      case 500:
        return this.handleServerError(data);
      case 502:
      case 503:
      case 504:
        return this.handleServiceUnavailable(data);
      default:
        return this.handleGenericError(status, data);
    }
  }

  static handleBadRequest(data) {
    return {
      success: false,
      message: data?.message || 'Invalid request. Please check your input.',
      statusCode: 400,
      type: 'BAD_REQUEST',
      errors: data?.errors || null,
      timestamp: new Date().toISOString()
    };
  }

  static handleUnauthorized(data) {
    // Clear stored tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    return {
      success: false,
      message: data?.message || 'Session expired. Please login again.',
      statusCode: 401,
      type: 'UNAUTHORIZED',
      timestamp: new Date().toISOString()
    };
  }

  static handleForbidden(data) {
    return {
      success: false,
      message: data?.message || 'You do not have permission to perform this action.',
      statusCode: 403,
      type: 'FORBIDDEN',
      timestamp: new Date().toISOString()
    };
  }

  static handleNotFound(data) {
    return {
      success: false,
      message: data?.message || 'The requested resource was not found.',
      statusCode: 404,
      type: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    };
  }

  static handleConflict(data) {
    return {
      success: false,
      message: data?.message || 'A conflict occurred. The resource may already exist.',
      statusCode: 409,
      type: 'CONFLICT',
      timestamp: new Date().toISOString()
    };
  }

  static handleValidationError(data) {
    return {
      success: false,
      message: data?.message || 'Validation failed. Please check your input.',
      statusCode: 422,
      type: 'VALIDATION_ERROR',
      errors: data?.errors || data?.details || null,
      timestamp: new Date().toISOString()
    };
  }

  static handleRateLimit(data) {
    return {
      success: false,
      message: data?.message || 'Too many requests. Please try again later.',
      statusCode: 429,
      type: 'RATE_LIMIT',
      retryAfter: data?.retryAfter || null,
      timestamp: new Date().toISOString()
    };
  }

  static handleServerError(data) {
    return {
      success: false,
      message: 'Internal server error. Please try again later.',
      statusCode: 500,
      type: 'SERVER_ERROR',
      timestamp: new Date().toISOString()
    };
  }

  static handleServiceUnavailable(data) {
    return {
      success: false,
      message: 'Service temporarily unavailable. Please try again later.',
      statusCode: data?.status || 503,
      type: 'SERVICE_UNAVAILABLE',
      timestamp: new Date().toISOString()
    };
  }

  static handleGenericError(status, data) {
    return {
      success: false,
      message: data?.message || `An error occurred (${status})`,
      statusCode: status,
      type: 'GENERIC_ERROR',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if error requires user logout
   * @param {Object} error - Error object
   * @returns {boolean}
   */
  static shouldLogout(error) {
    return error.statusCode === 401 || error.type === 'UNAUTHORIZED';
  }

  /**
   * Check if error is retryable
   * @param {Object} error - Error object  
   * @returns {boolean}
   */
  static isRetryable(error) {
    const retryableErrors = ['NETWORK_ERROR', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE'];
    return retryableErrors.includes(error.type);
  }

  /**
   * Get user-friendly error message
   * @param {Object} error - Error object
   * @returns {string}
   */
  static getUserMessage(error) {
    const userMessages = {
      NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.',
      UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
      NOT_FOUND: 'Không tìm thấy thông tin yêu cầu.',
      VALIDATION_ERROR: 'Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại.',
      CONFLICT: 'Thông tin đã tồn tại hoặc xung đột.',
      RATE_LIMIT: 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.',
      SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.'
    };

    return userMessages[error.type] || error.message;
  }
}

export default ApiErrorHandler;