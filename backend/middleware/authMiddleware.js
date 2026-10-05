const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { errorResponse } = require('../utils/apiResponse');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Authentication failed: No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hackhub_super_secret_jwt_key_2026_academic_dbms');

    // Fetch fresh user record from database
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role, college_name, phone FROM users WHERE user_id = ?',
      [decoded.user_id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 401, 'Authentication failed: User no longer exists.');
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Authentication failed: Token has expired.');
    }
    return errorResponse(res, 401, 'Authentication failed: Invalid token.');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hackhub_super_secret_jwt_key_2026_academic_dbms');
      const [rows] = await pool.query(
        'SELECT user_id, full_name, email, role, college_name, phone FROM users WHERE user_id = ?',
        [decoded.user_id]
      );
      if (rows.length > 0) {
        req.user = rows[0];
      }
    }
    next();
  } catch (err) {
    // If token invalid, proceed as guest
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth
};
