import '@testing-library/jest-dom';
// Optional: if you need 'whatwg-fetch' for MSW and it's not picked up automatically
// import 'whatwg-fetch'; // Usually not needed with modern jsdom via Vitest

// MSW setup
import { server } from '../mocks/server.js'; // Path to your msw server

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
