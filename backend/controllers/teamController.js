const pool = require('../config/db');
const { generateTeamCode } = require('../utils/codeGenerator');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Create a new team for a registered hackathon
 * Multi-table transaction: INSERT INTO teams + INSERT INTO team_members (leader)
 * POST /api/v1/teams
 */
const createTeam = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { hackathon_id, team_name } = req.body;
    const userId = req.user.user_id;

    if (!hackathon_id || !team_name) {
      return errorResponse(res, 400, 'hackathon_id and team_name are required.');
    }

    // 1. Validation: Verify user is registered for the hackathon
    const [regs] = await pool.query(
      'SELECT registration_id FROM registrations WHERE hackathon_id = ? AND user_id = ? AND status = "CONFIRMED"',
      [hackathon_id, userId]
    );

    if (regs.length === 0) {
      return errorResponse(
        res,
        403,
        'Registration required: You must be registered for this hackathon before creating a team.'
      );
    }

    // 2. Validation: Verify user is not already part of any team for this hackathon
    const [existingMemberships] = await pool.query(
      `SELECT tm.membership_id, t.team_name 
       FROM team_members tm
       JOIN teams t ON tm.team_id = t.team_id
       WHERE t.hackathon_id = ? AND tm.user_id = ?`,
      [hackathon_id, userId]
    );

    if (existingMemberships.length > 0) {
      return errorResponse(
        res,
        400,
        `You are already a member of team '${existingMemberships[0].team_name}' in this hackathon.`
      );
    }

    // 3. Validation: Verify team_name is not already taken in this hackathon
    const [existingName] = await pool.query(
      'SELECT team_id FROM teams WHERE hackathon_id = ? AND team_name = ?',
      [hackathon_id, team_name.trim()]
    );

    if (existingName.length > 0) {
      return errorResponse(res, 409, `A team named '${team_name.trim()}' already exists in this hackathon.`);
    }

    // 4. Generate unique invite code
    let teamCode = generateTeamCode();
    let isCodeUnique = false;
    while (!isCodeUnique) {
      const [codeCheck] = await pool.query('SELECT team_id FROM teams WHERE team_code = ?', [teamCode]);
      if (codeCheck.length === 0) {
        isCodeUnique = true;
      } else {
        teamCode = generateTeamCode();
      }
    }

    // 5. Transaction: Create team and assign creator as LEADER
    await connection.beginTransaction();

    const [teamResult] = await connection.query(
      'INSERT INTO teams (hackathon_id, leader_id, team_name, team_code) VALUES (?, ?, ?, ?)',
      [hackathon_id, userId, team_name.trim(), teamCode]
    );

    const teamId = teamResult.insertId;

    await connection.query(
      'INSERT INTO team_members (team_id, user_id, role_in_team) VALUES (?, ?, "LEADER")',
      [teamId, userId]
    );

    await connection.commit();

    return successResponse(res, 201, `Team '${team_name.trim()}' created successfully.`, {
      team_id: teamId,
      hackathon_id,
      team_name: team_name.trim(),
      team_code: teamCode,
      role_in_team: 'LEADER'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Join an existing team using team_code
 * Multi-table transaction with row locking (SELECT ... FOR UPDATE) to prevent race conditions
 * POST /api/v1/teams/join
 */
const joinTeam = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { team_code } = req.body;
    const userId = req.user.user_id;

    if (!team_code) {
      return errorResponse(res, 400, 'team_code is required.');
    }

    await connection.beginTransaction();

    // 1. Lock team record
    const [teams] = await connection.query(
      `SELECT t.team_id, t.team_name, t.hackathon_id, h.max_team_size, h.title AS hackathon_title
       FROM teams t
       JOIN hackathons h ON t.hackathon_id = h.hackathon_id
       WHERE t.team_code = ?
       FOR UPDATE`,
      [team_code.trim()]
    );

    if (teams.length === 0) {
      await connection.rollback();
      return errorResponse(res, 404, 'Invalid team code. No matching team found.');
    }

    const team = teams[0];

    // 2. Validation: Verify user is registered for the hackathon
    const [regs] = await connection.query(
      'SELECT registration_id FROM registrations WHERE hackathon_id = ? AND user_id = ? AND status = "CONFIRMED"',
      [team.hackathon_id, userId]
    );

    if (regs.length === 0) {
      await connection.rollback();
      return errorResponse(
        res,
        403,
        `You must be registered for '${team.hackathon_title}' before joining a team.`
      );
    }

    // 3. Validation: Verify user is not already part of any team in this hackathon
    const [existingMemberships] = await connection.query(
      `SELECT tm.membership_id, t.team_name 
       FROM team_members tm
       JOIN teams t ON tm.team_id = t.team_id
       WHERE t.hackathon_id = ? AND tm.user_id = ?`,
      [team.hackathon_id, userId]
    );

    if (existingMemberships.length > 0) {
      await connection.rollback();
      return errorResponse(
        res,
        400,
        `You are already a member of team '${existingMemberships[0].team_name}' for this hackathon.`
      );
    }

    // 4. Validation: Check current team size against max_team_size
    const [memberCountRows] = await connection.query(
      'SELECT COUNT(*) AS current_count FROM team_members WHERE team_id = ?',
      [team.team_id]
    );

    const currentCount = memberCountRows[0].current_count;
    if (currentCount >= team.max_team_size) {
      await connection.rollback();
      return errorResponse(
        res,
        400,
        `Team '${team.team_name}' is already at maximum capacity (${team.max_team_size} members).`
      );
    }

    // 5. Add user to team_members as MEMBER
    await connection.query(
      'INSERT INTO team_members (team_id, user_id, role_in_team) VALUES (?, ?, "MEMBER")',
      [team.team_id, userId]
    );

    await connection.commit();

    return successResponse(res, 200, `Successfully joined team '${team.team_name}'.`, {
      team_id: team.team_id,
      team_name: team.team_name,
      hackathon_id: team.hackathon_id,
      role_in_team: 'MEMBER'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get team details by ID (including members and submission status)
 * GET /api/v1/teams/:id
 */
const getTeamById = async (req, res, next) => {
  try {
    const teamId = parseInt(req.params.id, 10);
    if (isNaN(teamId)) {
      return errorResponse(res, 400, 'Invalid team ID.');
    }

    const [teams] = await pool.query(
      `SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        t.created_at,
        t.hackathon_id,
        h.title AS hackathon_title,
        h.min_team_size,
        h.max_team_size,
        h.status AS hackathon_status,
        t.leader_id,
        u.full_name AS leader_name,
        u.email AS leader_email
      FROM teams t
      JOIN hackathons h ON t.hackathon_id = h.hackathon_id
      JOIN users u ON t.leader_id = u.user_id
      WHERE t.team_id = ?`,
      [teamId]
    );

    if (teams.length === 0) {
      return errorResponse(res, 404, 'Team not found.');
    }

    const team = teams[0];

    // Fetch team members
    const [members] = await pool.query(
      `SELECT 
        tm.membership_id,
        tm.user_id,
        u.full_name,
        u.email,
        u.college_name,
        tm.role_in_team,
        tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.user_id
      WHERE tm.team_id = ?
      ORDER BY tm.role_in_team DESC, tm.joined_at ASC`,
      [teamId]
    );
    team.members = members;

    // Check project idea submission
    const [ideaRows] = await pool.query(
      `SELECT idea_id, title, submission_status, is_public, submitted_at 
       FROM project_ideas 
       WHERE team_id = ?`,
      [teamId]
    );
    team.project_idea = ideaRows.length > 0 ? ideaRows[0] : null;

    return successResponse(res, 200, 'Team details retrieved.', team);
  } catch (error) {
    next(error);
  }
};

/**
 * Get active team of logged-in user for a specific hackathon
 * GET /api/v1/teams/hackathon/:hackathonId/my-team
 */
const getMyTeamForHackathon = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.hackathonId, 10);
    const userId = req.user.user_id;

    if (isNaN(hackathonId)) {
      return errorResponse(res, 400, 'Invalid hackathon ID.');
    }

    const [rows] = await pool.query(
      `SELECT t.team_id 
       FROM team_members tm
       JOIN teams t ON tm.team_id = t.team_id
       WHERE t.hackathon_id = ? AND tm.user_id = ?`,
      [hackathonId, userId]
    );

    if (rows.length === 0) {
      return successResponse(res, 200, 'User does not belong to any team in this hackathon.', null);
    }

    // Call getTeamById logic with the found team_id
    req.params.id = rows[0].team_id;
    return getTeamById(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Leave team or remove member from team
 * DELETE /api/v1/teams/:id/members/:userId
 */
const removeMember = async (req, res, next) => {
  try {
    const teamId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);
    const requesterId = req.user.user_id;

    if (isNaN(teamId) || isNaN(targetUserId)) {
      return errorResponse(res, 400, 'Invalid parameters.');
    }

    const [teamRows] = await pool.query('SELECT leader_id FROM teams WHERE team_id = ?', [teamId]);
    if (teamRows.length === 0) {
      return errorResponse(res, 404, 'Team not found.');
    }

    const leaderId = teamRows[0].leader_id;

    // Check permissions: Requester must be leader, the member themselves, or Admin
    const isLeader = leaderId === requesterId;
    const isSelf = targetUserId === requesterId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isLeader && !isSelf && !isAdmin) {
      return errorResponse(res, 403, 'Forbidden: You do not have permission to remove this member.');
    }

    // Cannot remove leader unless disbanding team (if target is leader and other members exist)
    if (targetUserId === leaderId) {
      const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM team_members WHERE team_id = ?', [teamId]);
      if (countRows[0].total > 1) {
        return errorResponse(
          res,
          400,
          'Team leader cannot leave while other members remain. Transfer leadership or have members leave first.'
        );
      }
      // If sole member is leader, delete the team completely
      await pool.query('DELETE FROM teams WHERE team_id = ?', [teamId]);
      return successResponse(res, 200, 'Team disbanded successfully.');
    }

    await pool.query('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, targetUserId]);

    return successResponse(res, 200, 'Member removed from team successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getTeamById,
  getMyTeamForHackathon,
  removeMember
};
