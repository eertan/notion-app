const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const { query } = require('../db'); // We will mock this
const bcrypt = require('bcryptjs'); // We might need to mock this for predictable hash
const jwt = require('jsonwebtoken'); // We might need to mock or use actual for token generation

// Mock the db module
jest.mock('../db', () => ({
  query: jest.fn(),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  ...jest.requireActual('bcryptjs'), // Import and retain default behavior
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

// Optional: Mock JWT if you want to control token generation/verification during tests
// jest.mock('jsonwebtoken', () => ({
//   ...jest.requireActual('jsonwebtoken'),
//   sign: jest.fn().mockReturnValue('mocked_jwt_token'),
// }));


describe('Auth API', () => {
  beforeEach(() => {
    // Clear all mock implementations and calls before each test
    query.mockClear();
    bcrypt.compare.mockClear();
    bcrypt.hash.mockClear();
    bcrypt.genSalt.mockClear();
    // if (jwt.sign.mockClear) jwt.sign.mockClear(); // if JWT is mocked
  });

  // Test Suite for POST /api/auth/register
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock DB query for checking if user exists (user does not exist)
      query.mockResolvedValueOnce({ rows: [] });
      // Mock bcrypt hashing
      bcrypt.genSalt.mockResolvedValueOnce('somesalt');
      bcrypt.hash.mockResolvedValueOnce('hashedpassword');
      // Mock DB query for inserting the new user
      const mockNewUser = { id: 1, username: 'testuser', created_at: new Date().toISOString() };
      query.mockResolvedValueOnce({ rows: [mockNewUser] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('testuser');
      expect(query).toHaveBeenCalledTimes(2); // Once for check, once for insert
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'somesalt');
    });

    it('should return 400 if username already exists', async () => {
      // Mock DB query for checking if user exists (user does exist)
      query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'existinguser' }] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'existinguser', password: 'password123' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('User already exists');
      expect(query).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if username or password is not provided', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' }); // Missing password

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Please provide username and password');
    });
     it('should return 400 if password is less than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', password: '123' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Password must be at least 6 characters long');
    });
  });

  // Test Suite for POST /api/auth/login
  describe('POST /api/auth/login', () => {
    it('should login an existing user successfully', async () => {
      const mockUser = { id: 1, username: 'testuser', password_hash: 'hashedpassword', created_at: new Date().toISOString() };
      // Mock DB query to find the user
      query.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock bcrypt.compare to return true (passwords match)
      bcrypt.compare.mockResolvedValueOnce(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('testuser');
      expect(query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = $1', ['testuser']);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
    });

    it('should return 400 if user does not exist', async () => {
      // Mock DB query to find the user (user not found)
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistentuser', password: 'password123' });

      expect(response.statusCode).toBe(400); // Changed from 401 to 400 as per route logic for "Invalid credentials"
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 if password does not match', async () => {
      const mockUser = { id: 1, username: 'testuser', password_hash: 'hashedpassword' };
      // Mock DB query to find the user
      query.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock bcrypt.compare to return false (passwords do not match)
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.statusCode).toBe(400); // Changed from 401 to 400
      expect(response.body.message).toBe('Invalid credentials');
    });
     it('should return 400 if username or password is not provided for login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' }); // Missing password

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Please provide username and password');
    });
  });
});
