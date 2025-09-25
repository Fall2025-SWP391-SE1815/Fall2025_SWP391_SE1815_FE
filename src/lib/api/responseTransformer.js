// Response Transformer - Handle different response formats between Mock and Real API
export class ResponseTransformer {
  
  /**
   * Transform Real API response to match Mock API format
   * @param {Object} realApiResponse - Response from real API
   * @param {string} operation - Type of operation (get, post, put, delete)
   * @returns {Object} - Transformed response matching mock format
   */
  static transformToMockFormat(realApiResponse, operation = 'get') {
    // If response is already in mock format, return as is
    if (realApiResponse.success !== undefined && realApiResponse.data !== undefined) {
      return realApiResponse;
    }

    // Handle different real API response structures
    const transformedResponse = {
      success: true,
      message: this.getSuccessMessage(operation),
      data: null,
      timestamp: new Date().toISOString()
    };

    // Common real API response patterns:
    
    // Pattern 1: { status: "success", result: {...} }
    if (realApiResponse.status === 'success' && realApiResponse.result) {
      transformedResponse.data = realApiResponse.result;
      return transformedResponse;
    }

    // Pattern 2: { data: {...}, message: "..." }
    if (realApiResponse.data !== undefined) {
      transformedResponse.data = realApiResponse.data;
      transformedResponse.message = realApiResponse.message || transformedResponse.message;
      return transformedResponse;
    }

    // Pattern 3: Direct data response {...}
    if (typeof realApiResponse === 'object' && realApiResponse !== null) {
      transformedResponse.data = realApiResponse;
      return transformedResponse;
    }

    // Pattern 4: Array response [...]
    if (Array.isArray(realApiResponse)) {
      transformedResponse.data = realApiResponse;
      return transformedResponse;
    }

    // Fallback: primitive types
    transformedResponse.data = realApiResponse;
    return transformedResponse;
  }

  /**
   * Transform error response to mock format
   * @param {Object} error - Error from real API
   * @returns {Object} - Error response in mock format
   */
  static transformErrorResponse(error) {
    const errorResponse = {
      success: false,
      message: 'An error occurred',
      statusCode: error.response?.status || 500,
      timestamp: new Date().toISOString()
    };

    // Extract error message from different patterns
    if (error.response?.data?.message) {
      errorResponse.message = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorResponse.message = error.response.data.error;
    } else if (error.message) {
      errorResponse.message = error.message;
    }

    // Add additional error details if available
    if (error.response?.data?.errors) {
      errorResponse.errors = error.response.data.errors;
    }

    if (error.response?.data?.details) {
      errorResponse.details = error.response.data.details;
    }

    return errorResponse;
  }

  /**
   * Get success message based on operation type
   * @param {string} operation - HTTP operation
   * @returns {string} - Success message
   */
  static getSuccessMessage(operation) {
    const messages = {
      get: 'Data retrieved successfully',
      post: 'Resource created successfully', 
      put: 'Resource updated successfully',
      patch: 'Resource updated successfully',
      delete: 'Resource deleted successfully'
    };

    return messages[operation.toLowerCase()] || 'Operation completed successfully';
  }

  /**
   * Handle pagination response transformation
   * @param {Object} paginationResponse - Paginated response from real API
   * @returns {Object} - Transformed pagination response
   */
  static transformPaginationResponse(paginationResponse) {
    // Real API pagination patterns:
    // Pattern 1: { data: [...], total: 100, page: 1, limit: 10 }
    // Pattern 2: { items: [...], totalCount: 100, currentPage: 1, pageSize: 10 }
    // Pattern 3: { content: [...], totalElements: 100, number: 0, size: 10 }

    const transformed = {
      success: true,
      message: 'Data retrieved successfully',
      data: {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      },
      timestamp: new Date().toISOString()
    };

    // Pattern 1
    if (paginationResponse.data && paginationResponse.total !== undefined) {
      transformed.data.items = paginationResponse.data;
      transformed.data.pagination = {
        page: paginationResponse.page || 1,
        limit: paginationResponse.limit || 10,
        total: paginationResponse.total,
        totalPages: Math.ceil(paginationResponse.total / (paginationResponse.limit || 10))
      };
    }
    // Pattern 2  
    else if (paginationResponse.items && paginationResponse.totalCount !== undefined) {
      transformed.data.items = paginationResponse.items;
      transformed.data.pagination = {
        page: paginationResponse.currentPage || 1,
        limit: paginationResponse.pageSize || 10,
        total: paginationResponse.totalCount,
        totalPages: Math.ceil(paginationResponse.totalCount / (paginationResponse.pageSize || 10))
      };
    }
    // Pattern 3 (Spring Boot style)
    else if (paginationResponse.content && paginationResponse.totalElements !== undefined) {
      transformed.data.items = paginationResponse.content;
      transformed.data.pagination = {
        page: (paginationResponse.number || 0) + 1, // Spring uses 0-based page numbers
        limit: paginationResponse.size || 10,
        total: paginationResponse.totalElements,
        totalPages: paginationResponse.totalPages || 1
      };
    }
    // Fallback: assume it's just an array
    else if (Array.isArray(paginationResponse)) {
      transformed.data.items = paginationResponse;
      transformed.data.pagination = {
        page: 1,
        limit: paginationResponse.length,
        total: paginationResponse.length,
        totalPages: 1
      };
    }

    return transformed;
  }
}

export default ResponseTransformer;