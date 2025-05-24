const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensures .env variables are loaded

// Fallback to a default secret if not set, but log a warning
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.warn(
    'WARNING: JWT_SECRET environment variable is not set. Using a default insecure secret. ' +
    'This is NOT recommended for production. Please set a strong secret in your .env file.'
  );
  jwtSecret = 'YOUR_DEFAULT_INSECURE_SECRET_KEY_CHANGE_ME';
}

const JWT_SECRET = jwtSecret;

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
