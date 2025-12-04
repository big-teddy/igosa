/**
 * Integration Test Setup
 * Runs before all integration tests
 */

// Load environment variables
require('dotenv').config({ path: '.env.test' })

// Global test timeout
jest.setTimeout(30000)

// Suppress console logs in tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
    }
}

// Global test utilities
global.testUtils = {
    // Generate unique test email
    generateTestEmail: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,

    // Generate test user data
    generateTestUser: () => ({
        email: global.testUtils.generateTestEmail(),
        password: 'TestPassword123!',
    }),

    // Wait helper
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
}

// Cleanup function (runs after all tests)
afterAll(async () => {
    // Close any open connections
    // await closeRedisConnection()
    // await closeDatabaseConnection()
})
