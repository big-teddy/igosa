const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
    displayName: 'integration',
    testEnvironment: 'node', // Node environment for API tests
    setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: [
        '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
    ],
    // Run tests serially for DB operations
    maxWorkers: 1,
    // Longer timeout for API calls
    testTimeout: 30000,
    // Clear mocks between tests
    clearMocks: true,
    // Coverage
    collectCoverageFrom: [
        'src/app/api/**/*.{js,ts}',
        'src/lib/services/**/*.{js,ts}',
        '!src/**/*.d.ts',
    ],
    coverageDirectory: 'coverage/integration',
}

module.exports = createJestConfig(customJestConfig)
