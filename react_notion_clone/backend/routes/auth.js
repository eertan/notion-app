const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { query } = require('../db'); // Import the query function from db.js

const router = express.Router();

// Placeholder for in-memory user storage (for simulation) - REMOVED
// const users = []; 

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
    // Check if user exists in the database
    const userExistsResult = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Save user to database
    const insertUserResult = await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, password_hash]
    );
    const newUser = insertUserResult.rows[0];

    // Generate JWT
    const token = generateToken(newUser.id.toString());

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        created_at: newUser.created_at,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error.stack);
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
    // Find user by username in the database
    const userResult = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = userResult.rows[0];

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
        created_at: user.created_at,
      },
      message: 'User logged in successfully',
    });
  } catch (error) {
    console.error('Login error:', error.stack);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
