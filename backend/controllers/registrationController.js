const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Register current participant for a hackathon
 * POST /api/v1/registrations
 */
const registerForHackathon = async (req, res, next) => {
  try {
    const { hackathon_id } = req.body;
    const userId = req.user.user_id;

    if (!hackathon_id) {
      return errorResponse(res, 400, 'hackathon_id is required.');
    }

    // Role check: Only PARTICIPANT can register
    if (req.user.role !== 'PARTICIPANT' && req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Only users with the PARTICIPANT role can register for hackathons.');
    }

    // Check hackathon status and deadline
    const [hackathons] = await pool.query(
      'SELECT hackathon_id, title, status, registration_deadline FROM hackathons WHERE hackathon_id = ?',
      [hackathon_id]
    );

    if (hackathons.length === 0) {
      return errorResponse(res, 404, 'Hackathon not found.');
    }

    const hackathon = hackathons[0];

    if (hackathon.status === 'CANCELLED' || hackathon.status === 'COMPLETED') {
      return errorResponse(res, 400, `Cannot register: This hackathon is marked as ${hackathon.status}.`);
    }

    const now = new Date();
    if (new Date(hackathon.registration_deadline) < now) {
      return errorResponse(res, 400, 'Registration for this hackathon has closed (deadline passed).');
    }

    // Check duplicate registration
    const [existing] = await pool.query(
      'SELECT registration_id, status FROM registrations WHERE hackathon_id = ? AND user_id = ?',
      [hackathon_id, userId]
    );

    if (existing.length > 0) {
      return errorResponse(res, 409, 'You are already registered for this hackathon.');
    }

    // Insert registration
    const [result] = await pool.query(
      'INSERT INTO registrations (hackathon_id, user_id, status) VALUES (?, ?, ?)',
      [hackathon_id, userId, 'CONFIRMED']
    );

    return successResponse(res, 201, `Successfully registered for '${hackathon.title}'.`, {
      registration_id: result.insertId,
      hackathon_id,
      status: 'CONFIRMED'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all registrations for logged-in participant
 * GET /api/v1/registrations/my
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT 
        r.registration_id,
        r.registration_date,
        r.status AS registration_status,
        h.hackathon_id,
        h.title AS hackathon_title,
        h.banner_image,
        h.start_date,
        h.end_date,
        h.status AS hackathon_status,
        h.location,
        tm_info.team_id,
        tm_info.team_name,
        tm_info.role_in_team
      FROM registrations r
      INNER JOIN hackathons h ON r.hackathon_id = h.hackathon_id
      LEFT JOIN (
        SELECT t.hackathon_id, t.team_id, t.team_name, tm.user_id, tm.role_in_team
        FROM teams t
        JOIN team_members tm ON t.team_id = tm.team_id
      ) tm_info ON tm_info.hackathon_id = r.hackathon_id AND tm_info.user_id = r.user_id
      WHERE r.user_id = ?
      ORDER BY r.registration_date DESC`,
      [userId]
    );

    return successResponse(res, 200, 'User registrations retrieved.', rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all registrations for a specific hackathon (Organizer or Admin)
 * GET /api/v1/registrations/hackathon/:hackathonId
 */
const getHackathonRegistrations = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.hackathonId, 10);
    if (isNaN(hackathonId)) {
      return errorResponse(res, 400, 'Invalid hackathon ID.');
    }

    // Authorization: Verify organizer ownership
    const [hackathons] = await pool.query('SELECT organizer_id, title FROM hackathons WHERE hackathon_id = ?', [hackathonId]);
    if (hackathons.length === 0) {
      return errorResponse(res, 404, 'Hackathon not found.');
    }

    if (req.user.role !== 'ADMIN' && hackathons[0].organizer_id !== req.user.user_id) {
      return errorResponse(res, 403, 'Forbidden: You can only view registrations for hackathons you organized.');
    }

    const [rows] = await pool.query(
      `SELECT 
        r.registration_id,
        r.registration_date,
        r.status,
        u.user_id,
        u.full_name,
        u.email,
        u.college_name,
        u.phone,
        t.team_id,
        t.team_name,
        tm.role_in_team
      FROM registrations r
      INNER JOIN users u ON r.user_id = u.user_id
      LEFT JOIN team_members tm ON tm.user_id = u.user_id
      LEFT JOIN teams t ON tm.team_id = t.team_id AND t.hackathon_id = r.hackathon_id
      WHERE r.hackathon_id = ?
      ORDER BY r.registration_date ASC`,
      [hackathonId]
    );

    return successResponse(res, 200, `Registrations for '${hackathons[0].title}' retrieved.`, rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel or delete a registration
 * DELETE /api/v1/registrations/:registrationId
 */
const cancelRegistration = async (req, res, next) => {
  try {
    const registrationId = parseInt(req.params.registrationId, 10);
    if (isNaN(registrationId)) {
      return errorResponse(res, 400, 'Invalid registration ID.');
    }

    const [rows] = await pool.query(
      'SELECT registration_id, user_id, hackathon_id FROM registrations WHERE registration_id = ?',
      [registrationId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, 'Registration not found.');
    }

    const reg = rows[0];

    // Authorization: Must be owner or admin
    if (req.user.role !== 'ADMIN' && reg.user_id !== req.user.user_id) {
      return errorResponse(res, 403, 'Forbidden: You can only cancel your own registration.');
    }

    await pool.query('DELETE FROM registrations WHERE registration_id = ?', [registrationId]);

    return successResponse(res, 200, 'Registration cancelled successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForHackathon,
  getMyRegistrations,
  getHackathonRegistrations,
  cancelRegistration
};
