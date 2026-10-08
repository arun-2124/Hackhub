const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Browse all publicly shared project ideas
 * GET /api/v1/ideas/public
 */
const getPublicIdeas = async (req, res, next) => {
  try {
    const { search, domain_track, hackathon_id, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = ['pi.is_public = TRUE'];
    const queryParams = [];

    if (search) {
      whereClauses.push('(pi.title LIKE ? OR pi.abstract LIKE ? OR pi.tech_stack LIKE ?)');
      const pattern = `%${search.trim()}%`;
      queryParams.push(pattern, pattern, pattern);
    }

    if (domain_track) {
      whereClauses.push('pi.domain_track = ?');
      queryParams.push(domain_track.trim());
    }

    if (hackathon_id) {
      whereClauses.push('pi.hackathon_id = ?');
      queryParams.push(parseInt(hackathon_id, 10));
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    // Total count query
    const countSql = `SELECT COUNT(*) AS total FROM project_ideas pi ${whereSql}`;
    const [countRows] = await pool.query(countSql, queryParams);
    const total = countRows[0].total;

    // Data query
    const dataSql = `
      SELECT 
        pi.idea_id,
        pi.hackathon_id,
        h.title AS hackathon_title,
        pi.submitted_by_user_id,
        u.full_name AS submitter_name,
        pi.team_id,
        t.team_name,
        pi.title,
        pi.abstract,
        pi.domain_track,
        pi.tech_stack,
        pi.demo_url,
        pi.repo_url,
        pi.submission_status,
        pi.submitted_at,
        COUNT(sf.file_id) AS attachments_count
      FROM project_ideas pi
      INNER JOIN hackathons h ON pi.hackathon_id = h.hackathon_id
      INNER JOIN users u ON pi.submitted_by_user_id = u.user_id
      LEFT JOIN teams t ON pi.team_id = t.team_id
      LEFT JOIN submission_files sf ON pi.idea_id = sf.idea_id
      ${whereSql}
      GROUP BY pi.idea_id, h.title, u.full_name, t.team_name
      ORDER BY pi.submitted_at DESC
      LIMIT ? OFFSET ?;
    `;

    const [rows] = await pool.query(dataSql, [...queryParams, limitNum, offset]);

    return successResponse(res, 200, 'Public project ideas retrieved.', rows, {
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
 * Get project idea details by ID
 * GET /api/v1/ideas/:id
 */
const getIdeaById = async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id, 10);
    if (isNaN(ideaId)) {
      return errorResponse(res, 400, 'Invalid idea ID.');
    }

    const [rows] = await pool.query(
      `SELECT 
        pi.*,
        h.title AS hackathon_title,
        h.organizer_id AS hackathon_organizer_id,
        u.full_name AS submitter_name,
        u.email AS submitter_email,
        u.college_name AS submitter_college,
        t.team_name,
        t.team_code
      FROM project_ideas pi
      JOIN hackathons h ON pi.hackathon_id = h.hackathon_id
      JOIN users u ON pi.submitted_by_user_id = u.user_id
      LEFT JOIN teams t ON pi.team_id = t.team_id
      WHERE pi.idea_id = ?`,
      [ideaId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, 'Project idea not found.');
    }

    const idea = rows[0];

    // Access control: If idea is private, check permissions
    if (!idea.is_public) {
      if (!req.user) {
        return errorResponse(res, 403, 'This project idea is private. Please authenticate to view.');
      }

      const userId = req.user.user_id;
      const isAuthor = idea.submitted_by_user_id === userId;
      const isOrganizer = idea.hackathon_organizer_id === userId;
      const isAdmin = req.user.role === 'ADMIN';

      let isTeamMember = false;
      if (idea.team_id) {
        const [tm] = await pool.query(
          'SELECT membership_id FROM team_members WHERE team_id = ? AND user_id = ?',
          [idea.team_id, userId]
        );
        isTeamMember = tm.length > 0;
      }

      if (!isAuthor && !isOrganizer && !isAdmin && !isTeamMember) {
        return errorResponse(res, 403, 'Forbidden: You do not have permission to view this private project idea.');
      }
    }

    // Fetch attached files (all versions, current indicated)
    const [files] = await pool.query(
      `SELECT sf.file_id, sf.file_type, sf.original_name, sf.file_size_bytes, sf.version_no, sf.is_current, sf.uploaded_by, sf.uploaded_at, u.full_name AS uploaded_by_name
       FROM submission_files sf
       LEFT JOIN users u ON sf.uploaded_by = u.user_id
       WHERE sf.idea_id = ? 
       ORDER BY sf.version_no DESC`,
      [ideaId]
    );
    idea.files = files;
    idea.status = idea.submission_status;

    // Fetch evaluations if organizer or admin
    if (req.user && (req.user.role === 'ADMIN' || idea.hackathon_organizer_id === req.user.user_id)) {
      const [evaluations] = await pool.query(
        `SELECT e.evaluation_id, e.score, e.comments, e.decision, e.evaluated_at, u.full_name AS evaluator_name
         FROM evaluations e
         JOIN users u ON e.evaluator_id = u.user_id
         WHERE e.idea_id = ?
         ORDER BY e.evaluated_at DESC`,
        [ideaId]
      );
      idea.evaluations = evaluations;
    }

    return successResponse(res, 200, 'Project idea retrieved.', idea);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a project idea (Team or Solo, DRAFT or SUBMITTED)
 * POST /api/v1/ideas
 */
const submitIdea = async (req, res, next) => {
  try {
    const {
      hackathon_id,
      team_id,
      title,
      abstract,
      domain_track,
      tech_stack,
      demo_url,
      repo_url,
      is_public = false,
      submission_status = 'SUBMITTED'
    } = req.body;

    const userId = req.user.user_id;

    if (!hackathon_id || !title || !abstract) {
      return errorResponse(res, 400, 'hackathon_id, title, and abstract are required.');
    }

    const initialStatus = submission_status && submission_status.toUpperCase() === 'DRAFT' ? 'DRAFT' : 'SUBMITTED';

    // 1. Check hackathon existence, status, and submission deadline
    const [hackathons] = await pool.query(
      'SELECT hackathon_id, title, status, min_team_size, submission_deadline, end_date FROM hackathons WHERE hackathon_id = ?',
      [hackathon_id]
    );

    if (hackathons.length === 0) {
      return errorResponse(res, 404, 'Hackathon not found.');
    }

    const hackathon = hackathons[0];
    if (hackathon.status === 'COMPLETED' || hackathon.status === 'CANCELLED') {
      return errorResponse(res, 400, `Cannot submit ideas: Hackathon status is ${hackathon.status}.`);
    }

    const deadline = hackathon.submission_deadline || hackathon.end_date;
    if (deadline && new Date(deadline) < new Date()) {
      return errorResponse(res, 400, 'Submission deadline has passed for this hackathon.');
    }

    // 2. Verify submitter is registered for the hackathon
    const [regs] = await pool.query(
      'SELECT registration_id FROM registrations WHERE hackathon_id = ? AND user_id = ? AND status = "CONFIRMED"',
      [hackathon_id, userId]
    );

    if (regs.length === 0) {
      return errorResponse(
        res,
        403,
        'Registration required: You must be registered for this hackathon before submitting a project idea.'
      );
    }

    // 3. Handle Team Submission vs. Solo Submission
    let finalTeamId = null;

    if (team_id) {
      finalTeamId = parseInt(team_id, 10);

      // Verify team belongs to the SAME hackathon
      const [teamRows] = await pool.query('SELECT hackathon_id, team_name FROM teams WHERE team_id = ?', [finalTeamId]);
      if (teamRows.length === 0) {
        return errorResponse(res, 404, 'Team not found.');
      }
      if (teamRows[0].hackathon_id !== parseInt(hackathon_id, 10)) {
        return errorResponse(res, 400, 'Invalid team: Team does not belong to the specified hackathon.');
      }

      // Verify submitter belongs to the team
      const [memberRows] = await pool.query(
        'SELECT role_in_team FROM team_members WHERE team_id = ? AND user_id = ?',
        [finalTeamId, userId]
      );
      if (memberRows.length === 0) {
        return errorResponse(res, 403, 'Forbidden: You must be a member of the team to submit on its behalf.');
      }

      // Check if team already submitted an idea
      const [existingTeamIdea] = await pool.query(
        'SELECT idea_id, title FROM project_ideas WHERE hackathon_id = ? AND team_id = ?',
        [hackathon_id, finalTeamId]
      );
      if (existingTeamIdea.length > 0) {
        return errorResponse(
          res,
          409,
          `Team '${teamRows[0].team_name}' has already submitted an idea ('${existingTeamIdea[0].title}') for this hackathon.`
        );
      }
    } else {
      // Solo Submission
      // Check min_team_size rule
      if (hackathon.min_team_size > 1) {
        return errorResponse(
          res,
          400,
          `Solo submissions are not allowed for this hackathon. You must create or join a team (Minimum team size: ${hackathon.min_team_size}).`
        );
      }

      // Check if user is in a team for this hackathon
      const [userTeam] = await pool.query(
        `SELECT t.team_id, t.team_name 
         FROM team_members tm
         JOIN teams t ON tm.team_id = t.team_id
         WHERE t.hackathon_id = ? AND tm.user_id = ?`,
        [hackathon_id, userId]
      );

      if (userTeam.length > 0) {
        return errorResponse(
          res,
          400,
          `You are a member of team '${userTeam[0].team_name}'. Please submit your project on behalf of your team.`
        );
      }

      // Check if user already submitted solo for this hackathon
      const [existingSoloIdea] = await pool.query(
        'SELECT idea_id FROM project_ideas WHERE hackathon_id = ? AND submitted_by_user_id = ? AND team_id IS NULL',
        [hackathon_id, userId]
      );
      if (existingSoloIdea.length > 0) {
        return errorResponse(res, 409, 'You have already submitted a solo project idea for this hackathon.');
      }
    }

    // Insert idea
    const [result] = await pool.query(
      `INSERT INTO project_ideas (
        hackathon_id, submitted_by_user_id, team_id, title, abstract,
        domain_track, tech_stack, demo_url, repo_url, is_public, submission_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hackathon_id,
        userId,
        finalTeamId,
        title.trim(),
        abstract.trim(),
        domain_track ? domain_track.trim() : null,
        tech_stack ? tech_stack.trim() : null,
        demo_url ? demo_url.trim() : null,
        repo_url ? repo_url.trim() : null,
        Boolean(is_public),
        initialStatus
      ]
    );

    return successResponse(res, 201, `Project idea ${initialStatus === 'DRAFT' ? 'saved as draft' : 'submitted successfully'}.`, {
      idea_id: result.insertId,
      hackathon_id,
      team_id: finalTeamId,
      title: title.trim(),
      is_public: Boolean(is_public),
      submission_status: initialStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload PPT/PDF document for an idea (Transactional Multi-versioning)
 * POST /api/v1/ideas/:id/upload
 */
const uploadSubmissionFile = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const ideaId = parseInt(req.params.id, 10);
    const userId = req.user.user_id;

    if (isNaN(ideaId)) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, 'Invalid idea ID.');
    }

    if (!req.file) {
      return errorResponse(res, 400, 'No file uploaded. Please upload a PDF or PowerPoint (.ppt, .pptx) file.');
    }

    // Check idea existence and permissions + deadline check
    const [ideas] = await connection.query(
      `SELECT pi.idea_id, pi.submitted_by_user_id, pi.team_id, pi.title, pi.submission_status,
              h.submission_deadline, h.end_date, h.status AS hackathon_status
       FROM project_ideas pi
       JOIN hackathons h ON pi.hackathon_id = h.hackathon_id
       WHERE pi.idea_id = ?`,
      [ideaId]
    );

    if (ideas.length === 0) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 404, 'Project idea not found.');
    }

    const idea = ideas[0];

    // Enforce submission deadline
    const deadline = idea.submission_deadline || idea.end_date;
    if (deadline && new Date(deadline) < new Date()) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 400, 'Submission deadline has passed. File uploads are locked.');
    }

    let isAuthorized = idea.submitted_by_user_id === userId || req.user.role === 'ADMIN';

    if (!isAuthorized && idea.team_id) {
      const [members] = await connection.query(
        'SELECT membership_id FROM team_members WHERE team_id = ? AND user_id = ?',
        [idea.team_id, userId]
      );
      isAuthorized = members.length > 0;
    }

    if (!isAuthorized) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return errorResponse(res, 403, 'Forbidden: You do not have permission to attach files to this project idea.');
    }

    await connection.beginTransaction();

    // Query highest version_no for this idea
    const [verRows] = await connection.query(
      'SELECT COALESCE(MAX(version_no), 0) AS max_version FROM submission_files WHERE idea_id = ?',
      [ideaId]
    );
    const nextVersion = verRows[0].max_version + 1;

    // Atomically mark prior files as is_current = 0 without deleting them
    await connection.query(
      'UPDATE submission_files SET is_current = 0 WHERE idea_id = ?',
      [ideaId]
    );

    // Determine file_type enum
    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileType = ext === '.pdf' ? 'PDF' : 'PPT';

    // Insert new version
    const [result] = await connection.query(
      `INSERT INTO submission_files (
        idea_id, file_type, file_name, original_name, file_path, file_size_bytes, version_no, is_current, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        ideaId,
        fileType,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        req.file.size,
        nextVersion,
        userId
      ]
    );

    await connection.commit();

    return successResponse(res, 201, `File uploaded successfully as Version ${nextVersion}.`, {
      file_id: result.insertId,
      idea_id: ideaId,
      version_no: nextVersion,
      is_current: 1,
      file_type: fileType,
      original_name: req.file.originalname,
      file_size_bytes: req.file.size,
      uploaded_at: new Date()
    });
  } catch (error) {
    await connection.rollback();
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Download a file version by fileId (or by ideaId/versionId)
 * GET /api/v1/ideas/files/:fileId/download
 * GET /api/v1/ideas/:id/files/:fileId/download
 */
const downloadFile = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.fileId, 10);
    if (isNaN(fileId)) {
      return errorResponse(res, 400, 'Invalid file ID.');
    }

    const [rows] = await pool.query(
      `SELECT 
        sf.*, 
        pi.is_public, 
        pi.submitted_by_user_id, 
        pi.team_id, 
        h.organizer_id 
       FROM submission_files sf
       JOIN project_ideas pi ON sf.idea_id = pi.idea_id
       JOIN hackathons h ON pi.hackathon_id = h.hackathon_id
       WHERE sf.file_id = ?`,
      [fileId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, 'File not found.');
    }

    const fileRecord = rows[0];

    // Check specific idea match if :id parameter is present in URL
    if (req.params.id && parseInt(req.params.id, 10) !== fileRecord.idea_id) {
      return errorResponse(res, 400, 'File does not belong to the specified idea.');
    }

    // If idea is private, verify user access
    if (!fileRecord.is_public) {
      if (!req.user) {
        return errorResponse(res, 401, 'Authentication required to download private attachments.');
      }

      const userId = req.user.user_id;
      const isAuthor = fileRecord.submitted_by_user_id === userId;
      const isOrganizer = fileRecord.organizer_id === userId;
      const isAdmin = req.user.role === 'ADMIN';

      let isTeamMember = false;
      if (fileRecord.team_id) {
        const [tm] = await pool.query(
          'SELECT membership_id FROM team_members WHERE team_id = ? AND user_id = ?',
          [fileRecord.team_id, userId]
        );
        isTeamMember = tm.length > 0;
      }

      if (!isAuthor && !isOrganizer && !isAdmin && !isTeamMember) {
        return errorResponse(res, 403, 'Forbidden: You do not have permission to download this file.');
      }
    }

    // Resolve absolute path
    const resolvedPath = path.isAbsolute(fileRecord.file_path)
      ? fileRecord.file_path
      : path.join(__dirname, '..', fileRecord.file_path);

    if (!fs.existsSync(resolvedPath)) {
      return errorResponse(res, 404, 'Physical file not found on server storage.');
    }

    return res.download(resolvedPath, fileRecord.original_name);
  } catch (error) {
    next(error);
  }
};

/**
 * Get file version history for an idea
 * GET /api/v1/ideas/:id/versions
 */
const getFileVersions = async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id, 10);
    if (isNaN(ideaId)) return errorResponse(res, 400, 'Invalid idea ID.');

    const [rows] = await pool.query(
      `SELECT sf.file_id, sf.idea_id, sf.version_no, sf.is_current, sf.file_type,
              sf.original_name, sf.file_size_bytes, sf.uploaded_at, sf.uploaded_by,
              u.full_name AS uploaded_by_name
       FROM submission_files sf
       LEFT JOIN users u ON sf.uploaded_by = u.user_id
       WHERE sf.idea_id = ?
       ORDER BY sf.version_no DESC`,
      [ideaId]
    );

    return successResponse(res, 200, 'Version history retrieved.', rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Update project idea details (Submitter or Team Leader)
 * PUT /api/v1/ideas/:id
 */
const updateIdea = async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id, 10);
    const userId = req.user.user_id;

    if (isNaN(ideaId)) {
      return errorResponse(res, 400, 'Invalid idea ID.');
    }

    const [rows] = await pool.query(
      `SELECT pi.idea_id, pi.submitted_by_user_id, pi.team_id, pi.submission_status,
              h.submission_deadline, h.end_date
       FROM project_ideas pi
       JOIN hackathons h ON pi.hackathon_id = h.hackathon_id
       WHERE pi.idea_id = ?`,
      [ideaId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, 'Project idea not found.');
    }

    const idea = rows[0];

    // Enforce submission deadline
    const deadline = idea.submission_deadline || idea.end_date;
    if (deadline && new Date(deadline) < new Date()) {
      return errorResponse(res, 400, 'Submission deadline has passed. Edits are locked.');
    }

    let isAuthorized = idea.submitted_by_user_id === userId || req.user.role === 'ADMIN';

    if (!isAuthorized && idea.team_id) {
      const [leadRows] = await pool.query(
        'SELECT leader_id FROM teams WHERE team_id = ?',
        [idea.team_id]
      );
      if (leadRows.length > 0 && leadRows[0].leader_id === userId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return errorResponse(res, 403, 'Forbidden: You are not authorized to update this project idea.');
    }

    const { title, abstract, domain_track, tech_stack, demo_url, repo_url, is_public, submission_status } = req.body;

    let targetStatus = undefined;
    if (submission_status) {
      const st = submission_status.toUpperCase();
      if (['DRAFT', 'SUBMITTED'].includes(st)) {
        targetStatus = st;
      }
    }

    await pool.query(
      `UPDATE project_ideas
       SET title = COALESCE(?, title),
           abstract = COALESCE(?, abstract),
           domain_track = COALESCE(?, domain_track),
           tech_stack = COALESCE(?, tech_stack),
           demo_url = COALESCE(?, demo_url),
           repo_url = COALESCE(?, repo_url),
           is_public = COALESCE(?, is_public),
           submission_status = COALESCE(?, submission_status)
       WHERE idea_id = ?`,
      [
        title ? title.trim() : null,
        abstract ? abstract.trim() : null,
        domain_track ? domain_track.trim() : null,
        tech_stack ? tech_stack.trim() : null,
        demo_url !== undefined ? demo_url : null,
        repo_url !== undefined ? repo_url : null,
        is_public !== undefined ? Boolean(is_public) : null,
        targetStatus !== undefined ? targetStatus : null,
        ideaId
      ]
    );

    return successResponse(res, 200, 'Project idea updated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Evaluate a submission (Organizer or Admin)
 * POST /api/v1/ideas/:id/evaluate
 */
const evaluateSubmission = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const ideaId = parseInt(req.params.id, 10);
    const { score, comments, decision } = req.body;
    const userId = req.user.user_id;

    if (isNaN(ideaId) || !decision) {
      return errorResponse(res, 400, 'idea_id and decision (ACCEPTED, REJECTED, UNDER_REVIEW) are required.');
    }

    const validDecisions = ['ACCEPTED', 'REJECTED', 'UNDER_REVIEW'];
    const normDecision = decision.toUpperCase().trim();
    if (!validDecisions.includes(normDecision)) {
      return errorResponse(res, 400, `Invalid decision. Must be one of: ${validDecisions.join(', ')}`);
    }

    const [rows] = await connection.query(
      `SELECT pi.idea_id, h.organizer_id, pi.title
       FROM project_ideas pi
       JOIN hackathons h ON pi.hackathon_id = h.hackathon_id
       WHERE pi.idea_id = ?`,
      [ideaId]
    );

    if (rows.length === 0) return errorResponse(res, 404, 'Project idea not found.');

    if (req.user.role !== 'ADMIN' && rows[0].organizer_id !== userId) {
      return errorResponse(res, 403, 'Forbidden: Only the hackathon organizer or admin can evaluate submissions.');
    }

    await connection.beginTransaction();

    const [evalResult] = await connection.query(
      `INSERT INTO evaluations (idea_id, evaluator_id, score, comments, decision)
       VALUES (?, ?, ?, ?, ?)`,
      [
        ideaId,
        userId,
        score !== undefined && score !== null ? parseFloat(score) : null,
        comments ? comments.trim() : null,
        normDecision
      ]
    );

    // Atomically update project_ideas status
    await connection.query(
      'UPDATE project_ideas SET submission_status = ? WHERE idea_id = ?',
      [normDecision, ideaId]
    );

    await connection.commit();

    return successResponse(res, 201, `Evaluation recorded for '${rows[0].title}'.`, {
      evaluation_id: evalResult.insertId,
      idea_id: ideaId,
      decision: normDecision,
      score,
      comments
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update submission evaluation status (Organizer or Admin)
 * PUT /api/v1/ideas/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id, 10);
    const rawStatus = req.body.submission_status || req.body.status;
    const userId = req.user.user_id;

    if (isNaN(ideaId) || !rawStatus) {
      return errorResponse(res, 400, 'Invalid parameters. submission_status is required.');
    }

    const validStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'];
    let normalizedStatus = rawStatus.toUpperCase().trim();
    if (normalizedStatus === 'PENDING') normalizedStatus = 'SUBMITTED';

    if (!validStatuses.includes(normalizedStatus)) {
      return errorResponse(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Verify organizer of hackathon or Admin
    const [rows] = await pool.query(
      `SELECT pi.idea_id, h.organizer_id, pi.title 
       FROM project_ideas pi
       JOIN hackathons h ON pi.hackathon_id = h.hackathon_id
       WHERE pi.idea_id = ?`,
      [ideaId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, 'Project idea not found.');
    }

    if (req.user.role !== 'ADMIN' && rows[0].organizer_id !== userId) {
      return errorResponse(res, 403, 'Forbidden: Only the hackathon organizer can evaluate submissions.');
    }

    await pool.query(
      'UPDATE project_ideas SET submission_status = ? WHERE idea_id = ?',
      [normalizedStatus, ideaId]
    );

    return successResponse(res, 200, `Submission status for '${rows[0].title}' updated to ${normalizedStatus}.`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all submissions for a hackathon (Organizer or Admin)
 * GET /api/v1/ideas/hackathon/:hackathonId
 */
const getHackathonSubmissions = async (req, res, next) => {
  try {
    const hackathonId = parseInt(req.params.hackathonId, 10);
    const userId = req.user.user_id;

    if (isNaN(hackathonId)) {
      return errorResponse(res, 400, 'Invalid hackathon ID.');
    }

    const [hackathons] = await pool.query('SELECT organizer_id, title FROM hackathons WHERE hackathon_id = ?', [hackathonId]);
    if (hackathons.length === 0) {
      return errorResponse(res, 404, 'Hackathon not found.');
    }

    if (req.user.role !== 'ADMIN' && hackathons[0].organizer_id !== userId) {
      return errorResponse(res, 403, 'Forbidden: You can only view submissions for hackathons you organized.');
    }

    const [rows] = await pool.query(
      `SELECT 
        pi.idea_id,
        pi.title,
        pi.abstract,
        pi.domain_track,
        pi.tech_stack,
        pi.demo_url,
        pi.repo_url,
        pi.is_public,
        pi.submission_status,
        pi.submitted_at,
        u.user_id AS submitter_id,
        u.full_name AS submitter_name,
        u.email AS submitter_email,
        u.college_name AS submitter_college,
        t.team_id,
        t.team_name,
        COUNT(sf.file_id) AS file_count,
        MAX(sf.version_no) AS latest_version
      FROM project_ideas pi
      JOIN users u ON pi.submitted_by_user_id = u.user_id
      LEFT JOIN teams t ON pi.team_id = t.team_id
      LEFT JOIN submission_files sf ON pi.idea_id = sf.idea_id
      WHERE pi.hackathon_id = ?
      GROUP BY pi.idea_id, u.user_id, t.team_id
      ORDER BY pi.submitted_at DESC`,
      [hackathonId]
    );

    return successResponse(res, 200, `Submissions for '${hackathons[0].title}' retrieved.`, rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project idea (Author or Admin)
 * DELETE /api/v1/ideas/:id
 */
const deleteIdea = async (req, res, next) => {
  try {
    const ideaId = parseInt(req.params.id, 10);
    const userId = req.user.user_id;

    if (isNaN(ideaId)) {
      return errorResponse(res, 400, 'Invalid idea ID.');
    }

    const [ideas] = await pool.query(
      'SELECT idea_id, submitted_by_user_id FROM project_ideas WHERE idea_id = ?',
      [ideaId]
    );

    if (ideas.length === 0) {
      return errorResponse(res, 404, 'Project idea not found.');
    }

    if (ideas[0].submitted_by_user_id !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 403, 'Forbidden: You do not have permission to delete this project idea.');
    }

    // Clean up physical file artifacts if present
    const [files] = await pool.query('SELECT file_path FROM submission_files WHERE idea_id = ?', [ideaId]);
    for (const f of files) {
      if (f.file_path && fs.existsSync(f.file_path)) {
        try { fs.unlinkSync(f.file_path); } catch (_) {}
      }
    }

    await pool.query('DELETE FROM project_ideas WHERE idea_id = ?', [ideaId]);
    return successResponse(res, 200, 'Project idea deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicIdeas,
  getIdeaById,
  submitIdea,
  uploadSubmissionFile,
  downloadFile,
  getFileVersions,
  updateIdea,
  evaluateSubmission,
  updateStatus,
  getHackathonSubmissions,
  deleteIdea
};
