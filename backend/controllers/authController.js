const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to generate JWT token
const signToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'hackhub_super_secret_jwt_key_2026_academic_dbms',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user (PARTICIPANT or ORGANIZER only)
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, role = 'PARTICIPANT', college_name, phone } = req.body;

    // Validation: Required fields
    if (!full_name || !email || !password) {
      return errorResponse(res, 400, 'Please provide full_name, email, and password.');
    }

    // Role Restriction: ADMIN cannot be registered publicly
    const normalizedRole = role.toUpperCase();
    if (normalizedRole === 'ADMIN') {
      return errorResponse(res, 403, 'Admin registration is not permitted. Admin accounts are managed by system administrators.');
    }

    if (!['PARTICIPANT', 'ORGANIZER'].includes(normalizedRole)) {
      return errorResponse(res, 400, 'Invalid role. Only PARTICIPANT and ORGANIZER roles can register.');
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return errorResponse(res, 409, 'An account with this email address already exists.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, college_name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name.trim(), email.toLowerCase().trim(), password_hash, normalizedRole, college_name || null, phone || null]
    );

    const newUser = {
      user_id: result.insertId,
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      role: normalizedRole,
      college_name: college_name || null,
      phone: phone || null
    };

    const token = signToken(newUser);

    return successResponse(res, 201, 'Registration successful.', { user: newUser, token });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user & return JWT token
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password.');
    }

    // Fetch user with password_hash
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, password_hash, role, college_name, phone FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const user = rows[0];

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Remove password_hash before responding
    delete user.password_hash;

    const token = signToken(user);

    return successResponse(res, 200, 'Login successful.', { user, token });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
  return successResponse(res, 200, 'User profile retrieved.', req.user);
};

/**
 * Update authenticated user profile
 * PUT /api/v1/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, college_name, phone } = req.body;

    await pool.query(
      `UPDATE users 
       SET full_name = COALESCE(?, full_name),
           college_name = COALESCE(?, college_name),
           phone = COALESCE(?, phone)
       WHERE user_id = ?`,
      [full_name || null, college_name || null, phone || null, req.user.user_id]
    );

    const [updated] = await pool.query(
      'SELECT user_id, full_name, email, role, college_name, phone, created_at, updated_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    return successResponse(res, 200, 'Profile updated successfully.', updated[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
