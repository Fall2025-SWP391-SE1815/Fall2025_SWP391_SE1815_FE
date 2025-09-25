// API Testing Utilities for Mock to Real API Migration
import { apiClient } from '../lib/api/apiClient.js';

export class ApiTester {
  constructor() {
    this.results = [];
  }

  /**
   * Test a single API endpoint
   * @param {string} name - Test name
   * @param {Function} apiCall - Function that makes the API call
   * @param {Object} expectedFormat - Expected response format
   */
  async testEndpoint(name, apiCall, expectedFormat = null) {
    console.log(`🧪 Testing: ${name}`);
    
    try {
      const startTime = Date.now();
      const response = await apiCall();
      const endTime = Date.now();
      
      const result = {
        name,
        status: 'PASS',
        response,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      };

      // Validate response format if provided
      if (expectedFormat) {
        const validation = this.validateResponseFormat(response, expectedFormat);
        result.validation = validation;
        if (!validation.isValid) {
          result.status = 'FAIL';
          result.error = 'Response format validation failed';
        }
      }

      this.results.push(result);
      console.log(`✅ ${name} - ${result.duration}ms`);
      return result;
      
    } catch (error) {
      const result = {
        name,
        status: 'FAIL',
        error: error.message,
        response: error.response?.data || null,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(result);
      console.log(`❌ ${name} - Error: ${error.message}`);
      return result;
    }
  }

  /**
   * Validate response format matches expected structure
   */
  validateResponseFormat(response, expected) {
    const validation = {
      isValid: true,
      missingFields: [],
      typeErrors: []
    };

    // Check required fields
    for (const field in expected) {
      if (!(field in response)) {
        validation.missingFields.push(field);
        validation.isValid = false;
      } else if (expected[field] !== null && typeof response[field] !== typeof expected[field]) {
        validation.typeErrors.push({
          field,
          expected: typeof expected[field],
          actual: typeof response[field]
        });
        validation.isValid = false;
      }
    }

    return validation;
  }

  /**
   * Run comprehensive API tests
   */
  async runComprehensiveTests() {
    console.log('🚀 Starting comprehensive API tests...\n');

    // Authentication Tests
    await this.testAuthenticationFlow();
    
    // CRUD Tests for major entities
    await this.testCrudOperations();
    
    // Error Handling Tests
    await this.testErrorHandling();
    
    // Performance Tests
    await this.testPerformance();

    this.printSummary();
    return this.results;
  }

  async testAuthenticationFlow() {
    console.log('🔐 Testing Authentication Flow...');
    
    // Test login
    await this.testEndpoint(
      'Login with valid credentials',
      () => apiClient.auth.login('admin@example.com', 'admin123'),
      { success: true, data: { userInfo: {}, accessToken: '', refreshToken: '' } }
    );

    // Test login with invalid credentials
    await this.testEndpoint(
      'Login with invalid credentials',
      () => apiClient.auth.login('invalid@example.com', 'wrongpassword')
    );

    // Test token refresh
    await this.testEndpoint(
      'Refresh token',
      () => apiClient.auth.refreshToken('test_refresh_token')
    );
  }

  async testCrudOperations() {
    console.log('🔧 Testing CRUD Operations...');

    // Test GET operations
    await this.testEndpoint(
      'Get all vehicles',
      () => apiClient.vehicles.getAll(),
      { success: true, data: [] }
    );

    await this.testEndpoint(
      'Get all stations',
      () => apiClient.stations.getAll(),
      { success: true, data: [] }
    );

    await this.testEndpoint(
      'Get user rentals',
      () => apiClient.rentals.getUserRentals(),
      { success: true, data: [] }
    );

    // Test CREATE operations
    await this.testEndpoint(
      'Create reservation',
      () => apiClient.reservations.create({
        stationId: 1,
        vehicleId: 1,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString()
      })
    );
  }

  async testErrorHandling() {
    console.log('⚠️ Testing Error Handling...');

    // Test 404 errors
    await this.testEndpoint(
      'Get non-existent vehicle',
      () => apiClient.vehicles.getById(99999)
    );

    // Test unauthorized access
    await this.testEndpoint(
      'Access admin endpoint without permission',
      () => apiClient.admin.getUsers()
    );
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');

    // Test multiple concurrent requests
    const concurrentTests = [];
    for (let i = 0; i < 5; i++) {
      concurrentTests.push(
        this.testEndpoint(
          `Concurrent request ${i + 1}`,
          () => apiClient.stations.getAll()
        )
      );
    }

    await Promise.all(concurrentTests);
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`);
        });
    }

    // Performance summary
    const durations = this.results
      .filter(r => r.duration)
      .map(r => r.duration);
    
    if (durations.length > 0) {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      console.log(`\n⚡ Performance:`);
      console.log(`  - Average Response Time: ${avgDuration.toFixed(0)}ms`);
      console.log(`  - Slowest Response: ${maxDuration}ms`);
    }
  }

  exportResults() {
    const report = {
      testRun: {
        timestamp: new Date().toISOString(),
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'PASS').length,
        failed: this.results.filter(r => r.status === 'FAIL').length
      },
      results: this.results
    };

    console.log('\n📋 Detailed Results:');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }
}

// Quick test functions for manual testing
export const quickTests = {
  async testAuth() {
    const tester = new ApiTester();
    await tester.testAuthenticationFlow();
    return tester.results;
  },

  async testBasicCrud() {
    const tester = new ApiTester();
    await tester.testCrudOperations();
    return tester.results;
  },

  async testAll() {
    const tester = new ApiTester();
    return await tester.runComprehensiveTests();
  }
};

export default ApiTester;