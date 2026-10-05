const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Participant Dashboard Analytics
 * GET /api/v1/dashboard/participant
 */
const getParticipantDashboard = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // 1. Total registrations count
    const [regCount] = await pool.query(
      'SELECT COUNT(*) AS total_registrations FROM registrations WHERE user_id = ?',
      [userId]
    );

    // 2. Active teams count
    const [teamCount] = await pool.query(
      'SELECT COUNT(*) AS total_teams FROM team_members WHERE user_id = ?',
      [userId]
    );

    // 3. Ideas submitted by user or user's teams
    const [ideas] = await pool.query(
      `SELECT 
        pi.idea_id,
        pi.title,
        pi.domain_track,
        pi.submission_status,
        pi.is_public,
        pi.submitted_at,
        h.hackathon_id,
        h.title AS hackathon_title,
        t.team_name,
        COUNT(sf.file_id) AS file_count
      FROM project_ideas pi
      JOIN hackathons h ON pi.hackathon_id = h.hackathon_id
      LEFT JOIN teams t ON pi.team_id = t.team_id
      LEFT JOIN team_members tm ON t.team_id = tm.team_id AND tm.user_id = ?
      LEFT JOIN submission_files sf ON pi.idea_id = sf.idea_id
      WHERE pi.submitted_by_user_id = ? OR tm.user_id = ?
      GROUP BY pi.idea_id, h.hackathon_id, t.team_name
      ORDER BY pi.submitted_at DESC`,
      [userId, userId, userId]
    );

    // 4. Upcoming registered hackathons
    const [upcomingRegistered] = await pool.query(
      `SELECT 
        h.hackathon_id,
        h.title,
        h.start_date,
        h.end_date,
        h.location,
        h.status,
        t.team_name,
        tm.role_in_team
      FROM registrations r
      JOIN hackathons h ON r.hackathon_id = h.hackathon_id
      LEFT JOIN team_members tm ON tm.user_id = r.user_id
      LEFT JOIN teams t ON tm.team_id = t.team_id AND t.hackathon_id = h.hackathon_id
      WHERE r.user_id = ? AND h.status IN ('UPCOMING', 'ONGOING')
      ORDER BY h.start_date ASC`,
      [userId]
    );

    // 5. Recent announcements for registered hackathons
    const [announcements] = await pool.query(
      `SELECT 
        a.announcement_id,
        a.title,
        a.content,
        a.is_pinned,
        a.created_at,
        h.hackathon_id,
        h.title AS hackathon_title
      FROM announcements a
      JOIN hackathons h ON a.hackathon_id = h.hackathon_id
      JOIN registrations r ON h.hackathon_id = r.hackathon_id
      WHERE r.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 5`,
      [userId]
    );

    return successResponse(res, 200, 'Participant dashboard metrics retrieved.', {
      stats: {
        total_registered_hackathons: regCount[0].total_registrations,
        total_teams: teamCount[0].total_teams,
        total_submissions: ideas.length
      },
      my_submissions: ideas,
      upcoming_hackathons: upcomingRegistered,
      recent_announcements: announcements
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Organizer Dashboard Analytics
 * GET /api/v1/dashboard/organizer
 */
const getOrganizerDashboard = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // 1. Hosted hackathons with breakdown
    const [hackathons] = await pool.query(
      `SELECT 
        h.hackathon_id,
        h.title,
        h.status,
        h.start_date,
        h.end_date,
        h.registration_deadline,
        COUNT(DISTINCT r.registration_id) AS total_registrations,
        COUNT(DISTINCT t.team_id) AS total_teams,
        COUNT(DISTINCT pi.idea_id) AS total_submissions,
        SUM(CASE WHEN pi.submission_status = 'SUBMITTED' THEN 1 ELSE 0 END) AS pending_reviews
      FROM hackathons h
      LEFT JOIN registrations r ON h.hackathon_id = r.hackathon_id
      LEFT JOIN teams t ON h.hackathon_id = t.hackathon_id
      LEFT JOIN project_ideas pi ON h.hackathon_id = pi.hackathon_id
      WHERE h.organizer_id = ?
      GROUP BY h.hackathon_id
      ORDER BY h.created_at DESC`,
      [userId]
    );

    // Aggregate totals
    const totalHosted = hackathons.length;
    let totalParticipants = 0;
    let totalTeams = 0;
    let totalSubmissions = 0;
    let pendingReviews = 0;

    hackathons.forEach((h) => {
      totalParticipants += Number(h.total_registrations);
      totalTeams += Number(h.total_teams);
      totalSubmissions += Number(h.total_submissions);
      pendingReviews += Number(h.pending_reviews || 0);
    });

    return successResponse(res, 200, 'Organizer dashboard metrics retrieved.', {
      stats: {
        total_hosted_hackathons: totalHosted,
        total_participants: totalParticipants,
        total_teams: totalTeams,
        total_submissions: totalSubmissions,
        pending_reviews: pendingReviews
      },
      hackathons
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Dashboard Analytics
 * GET /api/v1/dashboard/admin
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. Users Breakdown
    const [userBreakdown] = await pool.query(
      `SELECT role, COUNT(*) AS count 
       FROM users 
       GROUP BY role`
    );

    // 2. Hackathons Breakdown
    const [hackathonBreakdown] = await pool.query(
      `SELECT status, COUNT(*) AS count 
       FROM hackathons 
       GROUP BY status`
    );

    // 3. Submissions Breakdown
    const [submissionBreakdown] = await pool.query(
      `SELECT submission_status, COUNT(*) AS count 
       FROM project_ideas 
       GROUP BY submission_status`
    );

    // 4. File Storage Statistics
    const [fileStats] = await pool.query(
      `SELECT 
        COUNT(*) AS total_files,
        COALESCE(SUM(file_size_bytes), 0) AS total_storage_bytes
       FROM submission_files`
    );

    // 5. Total Registrations & Teams
    const [regTotal] = await pool.query('SELECT COUNT(*) AS total FROM registrations');
    const [teamTotal] = await pool.query('SELECT COUNT(*) AS total FROM teams');

    return successResponse(res, 200, 'Admin dashboard overview retrieved.', {
      users_by_role: userBreakdown,
      hackathons_by_status: hackathonBreakdown,
      submissions_by_status: submissionBreakdown,
      totals: {
        total_registrations: regTotal[0].total,
        total_teams: teamTotal[0].total,
        total_files_uploaded: fileStats[0].total_files,
        total_storage_bytes: fileStats[0].total_storage_bytes,
        total_storage_mb: (fileStats[0].total_storage_bytes / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParticipantDashboard,
  getOrganizerDashboard,
  getAdminDashboard
};
