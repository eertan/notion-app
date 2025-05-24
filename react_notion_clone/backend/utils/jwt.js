const jwt = require('jsonwebtoken');
require('dotenv').config(); // To potentially use process.env.JWT_SECRET later

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECRET_KEY'; // Use environment variable or a placeholder

/**
 * Generates a JWT for a given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {string} The generated JWT.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {object|null} The decoded token payload if valid, otherwise null.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
