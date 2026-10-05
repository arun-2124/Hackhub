const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all announcements for a specific hackathon
 * GET /api/v1/announcements/hackathon/:hackathonId
 */
const getAnnouncementsByHackathon = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.hackathonId, 10);
    if (isNaN(hackathonId)) {
      return errorResponse(res, 400, 'Invalid hackathon ID.');
    }

    const [rows] = await pool.query(
      `SELECT 
        a.announcement_id,
        a.hackathon_id,
        a.title,
        a.content,
        a.is_pinned,
        a.created_at,
        u.user_id AS poster_id,
        u.full_name AS poster_name,
        u.email AS poster_email,
        u.role AS poster_role
      FROM announcements a
      JOIN users u ON a.posted_by = u.user_id
      WHERE a.hackathon_id = ?
      ORDER BY a.is_pinned DESC, a.created_at DESC`,
      [hackathonId]
    );

    return successResponse(res, 200, 'Announcements retrieved.', rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Post an announcement for a hackathon (Organizer or Admin)
 * POST /api/v1/announcements/hackathon/:hackathonId
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.hackathonId, 10);
    const { title, content, is_pinned = false } = req.body;
    const userId = req.user.user_id;

    if (isNaN(hackathonId) || !title || !content) {
      return errorResponse(res, 400, 'hackathonId, title, and content are required.');
    }

    // Verify hackathon ownership or Admin
    const [hackathons] = await pool.query('SELECT organizer_id, title FROM hackathons WHERE hackathon_id = ?', [hackathonId]);
    if (hackathons.length === 0) {
      return errorResponse(res, 404, 'Hackathon not found.');
    }

    if (req.user.role !== 'ADMIN' && hackathons[0].organizer_id !== userId) {
      return errorResponse(res, 403, 'Forbidden: You can only post announcements for hackathons you organized.');
    }

    const [result] = await pool.query(
      `INSERT INTO announcements (hackathon_id, posted_by, title, content, is_pinned)
       VALUES (?, ?, ?, ?, ?)`,
      [hackathonId, userId, title.trim(), content.trim(), Boolean(is_pinned)]
    );

    return successResponse(res, 201, 'Announcement posted successfully.', {
      announcement_id: result.insertId,
      hackathon_id: hackathonId,
      title: title.trim(),
      is_pinned: Boolean(is_pinned),
      created_at: new Date()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an announcement (Organizer or Admin)
 * DELETE /api/v1/announcements/:id
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcementId = parseInt(req.params.id, 10);
    const userId = req.user.user_id;

    if (isNaN(announcementId)) {
      return errorResponse(res, 400, 'Invalid announcement ID.');
    }

    const [rows] = await pool.query(
      `SELECT a.announcement_id, a.posted_by, h.organizer_id 
       FROM announcements a
       JOIN hackathons h ON a.hackathon_id = h.hackathon_id
       WHERE a.announcement_id = ?`,
      [announcementId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, 'Announcement not found.');
    }

    const ann = rows[0];
    const isPoster = ann.posted_by === userId;
    const isOrganizer = ann.organizer_id === userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPoster && !isOrganizer && !isAdmin) {
      return errorResponse(res, 403, 'Forbidden: You do not have permission to delete this announcement.');
    }

    await pool.query('DELETE FROM announcements WHERE announcement_id = ?', [announcementId]);

    return successResponse(res, 200, 'Announcement deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncementsByHackathon,
  createAnnouncement,
  deleteAnnouncement
};
