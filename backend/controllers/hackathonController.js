const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

function formatForMySQL(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * List all hackathons with search, status filtering, tag filtering, and pagination
 * GET /api/v1/hackathons
 */
const getAllHackathons = async (req, res, next) => {
  try {
    const { search, status, tag, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = [];
    const queryParams = [];

    if (search) {
      whereClauses.push('(h.title LIKE ? OR h.description LIKE ? OR h.location LIKE ?)');
      const searchPattern = `%${search.trim()}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (status) {
      whereClauses.push('h.status = ?');
      queryParams.push(status.toUpperCase().trim());
    }

    if (tag) {
      whereClauses.push(`h.hackathon_id IN (
        SELECT htm.hackathon_id 
        FROM hackathon_tag_mappings htm
        JOIN hackathon_tags ht ON htm.tag_id = ht.tag_id
        WHERE ht.tag_name = ? OR ht.tag_id = ?
      )`);
      queryParams.push(tag.trim(), isNaN(tag) ? -1 : parseInt(tag, 10));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count query
    const countSql = `SELECT COUNT(*) AS total FROM hackathons h ${whereSql}`;
    const [countRows] = await pool.query(countSql, queryParams);
    const total = countRows[0].total;

    // Main records query
    const dataSql = `
      SELECT 
        h.hackathon_id,
        h.organizer_id,
        u.full_name AS organizer_name,
        u.email AS organizer_email,
        h.title,
        h.description,
        h.banner_image,
        h.start_date,
        h.end_date,
        h.registration_deadline,
        h.min_team_size,
        h.max_team_size,
        h.status,
        h.location,
        h.created_at,
        COUNT(DISTINCT r.registration_id) AS registered_count,
        GROUP_CONCAT(DISTINCT ht.tag_name ORDER BY ht.tag_name SEPARATOR ', ') AS tags
      FROM hackathons h
      INNER JOIN users u ON h.organizer_id = u.user_id
      LEFT JOIN registrations r ON h.hackathon_id = r.hackathon_id
      LEFT JOIN hackathon_tag_mappings htm ON h.hackathon_id = htm.hackathon_id
      LEFT JOIN hackathon_tags ht ON htm.tag_id = ht.tag_id
      ${whereSql}
      GROUP BY h.hackathon_id, u.full_name, u.email
      ORDER BY 
        CASE h.status
          WHEN 'ONGOING' THEN 1
          WHEN 'UPCOMING' THEN 2
          WHEN 'COMPLETED' THEN 3
          ELSE 4
        END,
        h.start_date ASC
      LIMIT ? OFFSET ?;
    `;

    const [rows] = await pool.query(dataSql, [...queryParams, limitNum, offset]);

    // Format tags into arrays
    const formattedRows = rows.map((h) => ({
      ...h,
      tags: h.tags ? h.tags.split(', ') : []
    }));

    return successResponse(res, 200, 'Hackathons retrieved successfully.', formattedRows, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed hackathon by ID
 * GET /api/v1/hackathons/:id
 */
const getHackathonById = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    if (isNaN(hackathonId)) {
      return errorResponse(res, 400, 'Invalid hackathon ID.');
    }

    const [rows] = await pool.query(
      `SELECT 
        h.*,
        u.full_name AS organizer_name,
        u.email AS organizer_email,
        u.college_name AS organizer_organization,
        u.phone AS organizer_phone,
        COUNT(DISTINCT r.registration_id) AS total_registrations,
        COUNT(DISTINCT t.team_id) AS total_teams,
        COUNT(DISTINCT pi.idea_id) AS total_submissions
      FROM hackathons h
      INNER JOIN users u ON h.organizer_id = u.user_id
      LEFT JOIN registrations r ON h.hackathon_id = r.hackathon_id
      LEFT JOIN teams t ON h.hackathon_id = t.hackathon_id
      LEFT JOIN project_ideas pi ON h.hackathon_id = pi.hackathon_id
      WHERE h.hackathon_id = ?
      GROUP BY h.hackathon_id, u.full_name, u.email, u.college_name, u.phone`,
      [hackathonId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, 'Hackathon not found.');
    }

    const hackathon = rows[0];

    // Fetch tags
    const [tagRows] = await pool.query(
      `SELECT ht.tag_id, ht.tag_name 
       FROM hackathon_tag_mappings htm
       JOIN hackathon_tags ht ON htm.tag_id = ht.tag_id
       WHERE htm.hackathon_id = ?
       ORDER BY ht.tag_name ASC`,
      [hackathonId]
    );
    hackathon.tags = tagRows;

    // Fetch tracks
    const [tracks] = await pool.query(
      `SELECT track_id, track_name, description, created_at
       FROM hackathon_tracks
       WHERE hackathon_id = ?
       ORDER BY track_id ASC`,
      [hackathonId]
    );
    hackathon.tracks = tracks;

    // Fetch schedule
    const [schedule] = await pool.query(
      `SELECT schedule_id, event_name, description, start_time, end_time, meeting_platform, meeting_url, created_at
       FROM hackathon_schedule
       WHERE hackathon_id = ?
       ORDER BY start_time ASC`,
      [hackathonId]
    );
    hackathon.schedule = schedule;

    // Fetch announcements
    const [announcements] = await pool.query(
      `SELECT a.announcement_id, a.title, a.content, a.is_pinned, a.created_at, u.full_name AS posted_by_name
       FROM announcements a
       JOIN users u ON a.posted_by = u.user_id
       WHERE a.hackathon_id = ?
       ORDER BY a.is_pinned DESC, a.created_at DESC`,
      [hackathonId]
    );
    hackathon.announcements = announcements;

    return successResponse(res, 200, 'Hackathon details retrieved.', hackathon);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new hackathon (ORGANIZER or ADMIN)
 * POST /api/v1/hackathons
 */
const createHackathon = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const {
      title,
      description,
      banner_image,
      start_date,
      end_date,
      registration_deadline,
      submission_deadline,
      min_team_size = 1,
      max_team_size = 4,
      location = 'Online',
      hackathon_mode = 'ONLINE',
      eligibility,
      rules,
      prize_details,
      contact_email,
      external_url,
      tag_ids = []
    } = req.body;

    if (!title || !description || !start_date || !end_date || !registration_deadline) {
      return errorResponse(res, 400, 'Please provide title, description, start_date, end_date, and registration_deadline.');
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const regDeadline = new Date(registration_deadline);

    if (end < start) {
      return errorResponse(res, 400, 'end_date must be after start_date.');
    }
    if (regDeadline > end) {
      return errorResponse(res, 400, 'registration_deadline cannot be after end_date.');
    }
    if (min_team_size < 1 || max_team_size < min_team_size) {
      return errorResponse(res, 400, 'max_team_size must be greater than or equal to min_team_size (which must be at least 1).');
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO hackathons (
        organizer_id, title, description, banner_image, start_date, end_date,
        registration_deadline, submission_deadline, min_team_size, max_team_size,
        status, location, hackathon_mode, eligibility, rules, prize_details,
        contact_email, external_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPCOMING', ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.user_id,
        title.trim(),
        description.trim(),
        banner_image || null,
        formatForMySQL(start_date),
        formatForMySQL(end_date),
        formatForMySQL(registration_deadline),
        submission_deadline ? formatForMySQL(submission_deadline) : formatForMySQL(end_date),
        min_team_size,
        max_team_size,
        location.trim(),
        hackathon_mode || 'ONLINE',
        eligibility ? eligibility.trim() : null,
        rules ? rules.trim() : null,
        prize_details ? prize_details.trim() : null,
        contact_email ? contact_email.trim() : null,
        external_url ? external_url.trim() : null
      ]
    );

    const newHackathonId = result.insertId;

    // Attach tags if provided (supports tag_ids or tags)
    const rawTags = (Array.isArray(tag_ids) && tag_ids.length > 0) ? tag_ids : (Array.isArray(req.body.tags) ? req.body.tags : []);
    if (rawTags.length > 0) {
      for (const tagId of rawTags) {
        await connection.query(
          'INSERT IGNORE INTO hackathon_tag_mappings (hackathon_id, tag_id) VALUES (?, ?)',
          [newHackathonId, tagId]
        );
      }
    }

    await connection.commit();

    return successResponse(res, 201, 'Hackathon created successfully.', {
      hackathon_id: newHackathonId,
      title,
      status: 'UPCOMING'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update hackathon details (Owner ORGANIZER or ADMIN)
 * PUT /api/v1/hackathons/:id
 */
const updateHackathon = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    if (isNaN(hackathonId)) {
      return errorResponse(res, 400, 'Invalid hackathon ID.');
    }

    // Verify ownership
    const [existing] = await pool.query('SELECT organizer_id FROM hackathons WHERE hackathon_id = ?', [hackathonId]);
    if (existing.length === 0) {
      return errorResponse(res, 404, 'Hackathon not found.');
    }

    if (req.user.role !== 'ADMIN' && existing[0].organizer_id !== req.user.user_id) {
      return errorResponse(res, 403, 'Forbidden: You can only update hackathons that you organized.');
    }

    const {
      title,
      description,
      banner_image,
      start_date,
      end_date,
      registration_deadline,
      submission_deadline,
      min_team_size,
      max_team_size,
      status,
      location,
      hackathon_mode,
      eligibility,
      rules,
      prize_details,
      contact_email,
      external_url
    } = req.body;

    await pool.query(
      `UPDATE hackathons
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           banner_image = COALESCE(?, banner_image),
           start_date = COALESCE(?, start_date),
           end_date = COALESCE(?, end_date),
           registration_deadline = COALESCE(?, registration_deadline),
           submission_deadline = COALESCE(?, submission_deadline),
           min_team_size = COALESCE(?, min_team_size),
           max_team_size = COALESCE(?, max_team_size),
           status = COALESCE(?, status),
           location = COALESCE(?, location),
           hackathon_mode = COALESCE(?, hackathon_mode),
           eligibility = COALESCE(?, eligibility),
           rules = COALESCE(?, rules),
           prize_details = COALESCE(?, prize_details),
           contact_email = COALESCE(?, contact_email),
           external_url = COALESCE(?, external_url)
       WHERE hackathon_id = ?`,
      [
        title || null,
        description || null,
        banner_image || null,
        formatForMySQL(start_date) || null,
        formatForMySQL(end_date) || null,
        formatForMySQL(registration_deadline) || null,
        formatForMySQL(submission_deadline) || null,
        min_team_size || null,
        max_team_size || null,
        status || null,
        location || null,
        hackathon_mode || null,
        eligibility || null,
        rules || null,
        prize_details || null,
        contact_email || null,
        external_url || null,
        hackathonId
      ]
    );

    return successResponse(res, 200, 'Hackathon updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a hackathon (Owner ORGANIZER or ADMIN)
 * DELETE /api/v1/hackathons/:id
 */
const deleteHackathon = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    if (isNaN(hackathonId)) {
      return errorResponse(res, 400, 'Invalid hackathon ID.');
    }

    const [existing] = await pool.query('SELECT organizer_id, title FROM hackathons WHERE hackathon_id = ?', [hackathonId]);
    if (existing.length === 0) {
      return errorResponse(res, 404, 'Hackathon not found.');
    }

    if (req.user.role !== 'ADMIN' && existing[0].organizer_id !== req.user.user_id) {
      return errorResponse(res, 403, 'Forbidden: You can only delete hackathons that you organized.');
    }

    await pool.query('DELETE FROM hackathons WHERE hackathon_id = ?', [hackathonId]);

    return successResponse(res, 200, `Hackathon '${existing[0].title}' and associated records deleted successfully.`);
  } catch (error) {
    next(error);
  }
};

/**
 * Tracks Management Endpoints
 */
const getHackathonTracks = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    if (isNaN(hackathonId)) return errorResponse(res, 400, 'Invalid hackathon ID.');

    const [tracks] = await pool.query(
      'SELECT track_id, hackathon_id, track_name, description, created_at FROM hackathon_tracks WHERE hackathon_id = ? ORDER BY track_id ASC',
      [hackathonId]
    );
    return successResponse(res, 200, 'Tracks retrieved.', tracks);
  } catch (error) {
    next(error);
  }
};

const addHackathonTrack = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    const { track_name, description } = req.body;
    if (isNaN(hackathonId) || !track_name) {
      return errorResponse(res, 400, 'hackathon_id and track_name are required.');
    }

    const [hackathon] = await pool.query('SELECT organizer_id FROM hackathons WHERE hackathon_id = ?', [hackathonId]);
    if (hackathon.length === 0) return errorResponse(res, 404, 'Hackathon not found.');
    if (req.user.role !== 'ADMIN' && hackathon[0].organizer_id !== req.user.user_id) {
      return errorResponse(res, 403, 'Forbidden: You can only add tracks to hackathons you organized.');
    }

    const [result] = await pool.query(
      'INSERT INTO hackathon_tracks (hackathon_id, track_name, description) VALUES (?, ?, ?)',
      [hackathonId, track_name.trim(), description ? description.trim() : null]
    );

    return successResponse(res, 201, 'Track added successfully.', {
      track_id: result.insertId,
      hackathon_id: hackathonId,
      track_name: track_name.trim()
    });
  } catch (error) {
    next(error);
  }
};

const deleteHackathonTrack = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    const trackId = parseInt(req.params.trackId, 10);
    if (isNaN(hackathonId) || isNaN(trackId)) return errorResponse(res, 400, 'Invalid IDs.');

    const [track] = await pool.query(
      'SELECT t.track_id, h.organizer_id FROM hackathon_tracks t JOIN hackathons h ON t.hackathon_id = h.hackathon_id WHERE t.track_id = ? AND t.hackathon_id = ?',
      [trackId, hackathonId]
    );
    if (track.length === 0) return errorResponse(res, 404, 'Track not found.');
    if (req.user.role !== 'ADMIN' && track[0].organizer_id !== req.user.user_id) {
      return errorResponse(res, 403, 'Forbidden: You cannot delete this track.');
    }

    await pool.query('DELETE FROM hackathon_tracks WHERE track_id = ?', [trackId]);
    return successResponse(res, 200, 'Track deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule & Meeting Endpoints
 */
const getHackathonSchedule = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    if (isNaN(hackathonId)) return errorResponse(res, 400, 'Invalid hackathon ID.');

    const [schedule] = await pool.query(
      'SELECT schedule_id, hackathon_id, event_name, description, start_time, end_time, meeting_platform, meeting_url, created_at FROM hackathon_schedule WHERE hackathon_id = ? ORDER BY start_time ASC',
      [hackathonId]
    );
    return successResponse(res, 200, 'Schedule retrieved.', schedule);
  } catch (error) {
    next(error);
  }
};

const addHackathonScheduleEvent = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    const { event_name, description, start_time, end_time, meeting_platform, meeting_url } = req.body;

    if (isNaN(hackathonId) || !event_name || !start_time) {
      return errorResponse(res, 400, 'hackathon_id, event_name, and start_time are required.');
    }

    const [hackathon] = await pool.query('SELECT organizer_id FROM hackathons WHERE hackathon_id = ?', [hackathonId]);
    if (hackathon.length === 0) return errorResponse(res, 404, 'Hackathon not found.');
    if (req.user.role !== 'ADMIN' && hackathon[0].organizer_id !== req.user.user_id) {
      return errorResponse(res, 403, 'Forbidden: You can only add schedule events to hackathons you organized.');
    }

    const [result] = await pool.query(
      `INSERT INTO hackathon_schedule (
        hackathon_id, event_name, description, start_time, end_time, meeting_platform, meeting_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        hackathonId,
        event_name.trim(),
        description ? description.trim() : null,
        formatForMySQL(start_time),
        end_time ? formatForMySQL(end_time) : null,
        meeting_platform ? meeting_platform.trim() : null,
        meeting_url ? meeting_url.trim() : null
      ]
    );

    return successResponse(res, 201, 'Schedule event added successfully.', {
      schedule_id: result.insertId,
      hackathon_id: hackathonId,
      event_name: event_name.trim()
    });
  } catch (error) {
    next(error);
  }
};

const updateHackathonScheduleEvent = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    const scheduleId = parseInt(req.params.scheduleId, 10);
    const { event_name, description, start_time, end_time, meeting_platform, meeting_url } = req.body;

    if (isNaN(hackathonId) || isNaN(scheduleId)) return errorResponse(res, 400, 'Invalid IDs.');

    const [event] = await pool.query(
      'SELECT s.schedule_id, h.organizer_id FROM hackathon_schedule s JOIN hackathons h ON s.hackathon_id = h.hackathon_id WHERE s.schedule_id = ? AND s.hackathon_id = ?',
      [scheduleId, hackathonId]
    );
    if (event.length === 0) return errorResponse(res, 404, 'Schedule event not found.');
    if (req.user.role !== 'ADMIN' && event[0].organizer_id !== req.user.user_id) {
      return errorResponse(res, 403, 'Forbidden: You cannot update this schedule event.');
    }

    await pool.query(
      `UPDATE hackathon_schedule
       SET event_name = COALESCE(?, event_name),
           description = COALESCE(?, description),
           start_time = COALESCE(?, start_time),
           end_time = COALESCE(?, end_time),
           meeting_platform = COALESCE(?, meeting_platform),
           meeting_url = ?
       WHERE schedule_id = ?`,
      [
        event_name ? event_name.trim() : null,
        description ? description.trim() : null,
        start_time ? formatForMySQL(start_time) : null,
        end_time ? formatForMySQL(end_time) : null,
        meeting_platform ? meeting_platform.trim() : null,
        meeting_url !== undefined ? (meeting_url ? meeting_url.trim() : null) : undefined,
        scheduleId
      ]
    );

    return successResponse(res, 200, 'Schedule event updated successfully.');
  } catch (error) {
    next(error);
  }
};

const deleteHackathonScheduleEvent = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.id, 10);
    const scheduleId = parseInt(req.params.scheduleId, 10);
    if (isNaN(hackathonId) || isNaN(scheduleId)) return errorResponse(res, 400, 'Invalid IDs.');

    const [event] = await pool.query(
      'SELECT s.schedule_id, h.organizer_id FROM hackathon_schedule s JOIN hackathons h ON s.hackathon_id = h.hackathon_id WHERE s.schedule_id = ? AND s.hackathon_id = ?',
      [scheduleId, hackathonId]
    );
    if (event.length === 0) return errorResponse(res, 404, 'Schedule event not found.');
    if (req.user.role !== 'ADMIN' && event[0].organizer_id !== req.user.user_id) {
      return errorResponse(res, 403, 'Forbidden: You cannot delete this schedule event.');
    }

    await pool.query('DELETE FROM hackathon_schedule WHERE schedule_id = ?', [scheduleId]);
    return successResponse(res, 200, 'Schedule event deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * List all available tags
 * GET /api/v1/hackathons/tags
 */
const getTags = async (req, res, next) => {
  try {
    const [tags] = await pool.query('SELECT tag_id, tag_name FROM hackathon_tags ORDER BY tag_name ASC');
    return successResponse(res, 200, 'Tags retrieved.', tags);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  getHackathonTracks,
  addHackathonTrack,
  deleteHackathonTrack,
  getHackathonSchedule,
  addHackathonScheduleEvent,
  updateHackathonScheduleEvent,
  deleteHackathonScheduleEvent,
  getTags
};
