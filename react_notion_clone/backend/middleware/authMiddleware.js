const { verifyToken } = require('../utils/jwt');
// const pool = require('../db'); // Will be used later for fetching user from DB

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      // Attach user to request object
      // In a real app, you'd fetch the user from the database here
      // For now, we'll just attach the decoded ID
      req.user = { id: decoded.id }; 
      // Example: req.user = await pool.query('SELECT id, username FROM users WHERE id = $1', [decoded.id]);
      // if (!req.user.rows[0]) return res.status(401).json({ message: 'User not found' });
      // req.user = req.user.rows[0];


      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
