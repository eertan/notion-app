const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
// const pool = require('../db'); // Will be used later for DB interactions

const router = express.Router();

// Placeholder for in-memory user storage (for simulation)
const users = []; // In a real app, this would be your database

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Simulate checking if user exists
    // In a real app: const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    // if (userExists.rows.length > 0) {
    //   return res.status(400).json({ message: 'User already exists' });
    // }
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists (simulated)' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Simulate saving user to database
    const newUser = {
      id: users.length + 1, // Simple ID generation for simulation
      username,
      password_hash, // In a real app, this is stored in the DB
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    // In a real app: const result = await pool.query(
    //   'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
    //   [username, password_hash]
    // );
    // const dbUser = result.rows[0];

    // Generate JWT
    const token = generateToken(newUser.id.toString()); // Use simulated user ID

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        // created_at: dbUser.created_at // from DB
      },
      message: 'User registered successfully (simulated)',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    // Simulate finding user by username
    // In a real app: const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    // if (result.rows.length === 0) {
    //   return res.status(400).json({ message: 'Invalid credentials' });
    // }
    // const user = result.rows[0];
    
    let user = users.find(u => u.username === username);

    // For testing, if user 'testuser' is not in the simulated DB, add them
    if (username === 'testuser' && !user) {
        const salt = await bcrypt.genSalt(10);
        const testPasswordHash = await bcrypt.hash('password123', salt);
        user = { id: 'test_id_001', username: 'testuser', password_hash: testPasswordHash };
        users.push(user); // Add to simulated users
    } else if (!user) {
        return res.status(400).json({ message: 'Invalid credentials (simulated user not found)' });
    }


    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user.id.toString());

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        // created_at: user.created_at // from DB
      },
      message: 'User logged in successfully (simulated)',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
