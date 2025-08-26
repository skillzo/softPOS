// Jest setup file for global test configuration

// Extend Jest matchers if needed
// require('jest-extended');

// Set up test environment variables
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "error"; // Reduce log noise during tests
process.env.DB_PATH = ":memory:"; // Use in-memory database for tests

// Global test utilities or mocks can be set up here
global.console = {
  ...console,
  // Suppress console.log during tests unless needed
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
