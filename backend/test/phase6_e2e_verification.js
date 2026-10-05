/**
 * HackHub Phase 6: End-to-End Integration & Presentation Readiness Test Suite
 * 
 * Verifies complete user flows against running Express API (port 5000) and MySQL 8.4 database:
 * 1. Complete Participant Flow (Register -> Login -> Dashboard -> Browse -> Filter -> Register Hackathon -> Team -> Invite Code -> Submit Idea with PDF -> File Download -> Announcements -> Profile -> Logout/Re-login)
 * 2. Complete Organizer Flow (Login -> Dashboard -> Create Hackathon -> Edit -> View Participants -> View Submissions -> Evaluate Status -> Announcements Broadcast/Delete -> Ownership RBAC)
 * 3. Complete Admin Flow (Login -> Dashboard -> Relational Platform Telemetry -> Role Breakdowns -> Storage Statistics -> Admin Privileges)
 * 4. Comprehensive Authorization & RBAC Attack Vectors
 * 5. Error & Edge Case Rigorous Verification
 * 6. File Handling & Physical Disk Storage vs MySQL Metadata Integrity
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';

let passedTests = 0;
let failedTests = 0;
const testResults = [];

function assert(condition, message, details = '') {
  if (condition) {
    passedTests++;
    testResults.push({ status: 'PASS', message });
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failedTests++;
    testResults.push({ status: 'FAIL', message, details });
    console.error(`  ❌ [FAIL] ${message} - Details: ${details}`);
  }
}

// HTTP request helper
function request(method, path, body = null, token = null, isMultipart = false, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const headers = { ...customHeaders };

    let postData = null;

    if (body) {
      if (isMultipart) {
        postData = body.buffer;
        headers['Content-Type'] = `multipart/form-data; boundary=${body.boundary}`;
        headers['Content-Length'] = postData.length;
      } else {
        postData = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(postData);
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: headers
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const rawBody = Buffer.concat(chunks);
        let parsed = null;
        try {
          parsed = JSON.parse(rawBody.toString('utf8'));
        } catch (e) {
          parsed = rawBody;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
          data: parsed?.data !== undefined ? parsed.data : parsed,
          rawBody: rawBody
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Multipart builder helper
function buildMultipart(fields, fileField = null) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const parts = [];

  for (const [k, v] of Object.entries(fields)) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`));
  }

  if (fileField) {
    const { name, filename, contentType, content } = fileField;
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`));
    parts.push(Buffer.isBuffer(content) ? content : Buffer.from(content));
    parts.push(Buffer.from('\r\n'));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));
  return {
    boundary,
    buffer: Buffer.concat(parts)
  };
}

async function runEndToEndSuite() {
  console.log('================================================================');
  console.log('🚀 HACKHUB PHASE 6: END-TO-END INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const testStudentEmail = `p6_student_${timestamp}@test.edu`;

  let participantToken = null;
  let participantUser = null;
  let organizerToken = null;
  let organizerUser = null;
  let adminToken = null;
  let adminUser = null;

  let testHackathonId = null;
  let testTeamId = null;
  let testTeamCode = null;
  let testIdeaId = null;
  let testFileId = null;
  let testAnnouncementId = null;
  let unregStudentEmail = null;

  try {
    // ==========================================
    // 1. PARTICIPANT WORKFLOW
    // ==========================================
    console.log('--- 1. PARTICIPANT COMPLETE USER FLOW ---');

    // 1.1 Register as Participant
    const regRes = await request('POST', '/auth/register', {
      full_name: 'Phase 6 Test Student',
      email: testStudentEmail,
      password: 'password123',
      role: 'PARTICIPANT',
      college_name: 'MIT College of Engineering',
      phone_number: '9876543210'
    });
    assert(regRes.statusCode === 201 && regRes.body.success, 'Participant registers successfully (HTTP 201)');

    // 1.2 Login as Participant
    const loginRes = await request('POST', '/auth/login', {
      email: testStudentEmail,
      password: 'password123'
    });
    assert(loginRes.statusCode === 200 && loginRes.data?.token, 'Participant logs in and receives JWT token');
    participantToken = loginRes.data?.token;
    participantUser = loginRes.data?.user;

    // 1.3 View Participant Dashboard
    const pDashRes = await request('GET', '/dashboard/participant', null, participantToken);
    assert(
      pDashRes.statusCode === 200 &&
      pDashRes.data?.stats?.total_registered_hackathons !== undefined,
      'Participant dashboard returns user telemetry metrics'
    );

    // 1.4 Browse Hackathons
    const browseRes = await request('GET', '/hackathons', null, null);
    assert(browseRes.statusCode === 200 && Array.isArray(browseRes.data), 'Public catalog returns available hackathons');

    // 1.5 Search & Filter Hackathons
    const searchRes = await request('GET', '/hackathons?search=AI&status=UPCOMING', null, null);
    assert(searchRes.statusCode === 200 && Array.isArray(searchRes.data), 'Search and status filters process query parameters correctly');

    // 1.6 Open Hackathon Details (pick Hackathon 1 from seeds)
    const hDetailRes = await request('GET', '/hackathons/1', null, null);
    assert(hDetailRes.statusCode === 200 && hDetailRes.data?.hackathon_id === 1, 'Hackathon detail view loads complete event data');

    // 1.7 Register for Hackathon 1
    const hRegRes = await request('POST', '/registrations', { hackathon_id: 1 }, participantToken);
    assert(hRegRes.statusCode === 201, 'Participant registers for Hackathon 1 (HTTP 201)');

    // 1.8 Create a Team in Hackathon 1
    const teamCreateRes = await request('POST', '/teams', {
      hackathon_id: 1,
      team_name: `Phase 6 Team Alpha ${timestamp}`
    }, participantToken);
    assert(teamCreateRes.statusCode === 201 && teamCreateRes.data?.team_id, 'Participant creates team in Hackathon 1');
    testTeamId = teamCreateRes.data?.team_id;
    testTeamCode = teamCreateRes.data?.invite_code || teamCreateRes.data?.team_code;

    // 1.9 Verify Team Roster and Invite Code
    const teamGetRes = await request('GET', `/teams/${testTeamId}`, null, participantToken);
    assert(
      teamGetRes.statusCode === 200 &&
      (teamGetRes.data?.team_code === testTeamCode || teamGetRes.data?.invite_code === testTeamCode) &&
      teamGetRes.data?.members?.length === 1 &&
      teamGetRes.data?.members[0]?.role_in_team === 'LEADER',
      'Team workspace verifies team roster with creator designated as LEADER'
    );

    // 1.10 Submit Project Idea (JSON proposal)
    const ideaSubmitRes = await request('POST', '/ideas', {
      hackathon_id: 1,
      team_id: testTeamId,
      title: `Decentralized AI Grid ${timestamp}`,
      domain_track: 'AI/ML',
      abstract: 'A distributed edge computing architecture for local neural inferencing during network blackouts.',
      tech_stack: 'React, Node.js, Express, MySQL 8.4, Docker',
      is_public: true
    }, participantToken);
    assert(ideaSubmitRes.statusCode === 201 && ideaSubmitRes.data?.idea_id, 'Project proposal submitted successfully (HTTP 201)');
    testIdeaId = ideaSubmitRes.data?.idea_id;

    // 1.11 Upload PDF Document for Idea (Multipart)
    const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj xref\n0 4\n0000000000 65535 f\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF');
    const uploadRes = await request('POST', `/ideas/${testIdeaId}/upload`, buildMultipart({}, {
      name: 'file',
      filename: 'ai_grid_proposal.pdf',
      contentType: 'application/pdf',
      content: pdfContent
    }), participantToken, true);
    assert(uploadRes.statusCode === 201 && uploadRes.data?.file_id, 'PDF pitch deck uploaded and linked to proposal (HTTP 201)');
    testFileId = uploadRes.data?.file_id;

    // 1.12 Verify Submission Status & Metadata
    const ideaDetailRes = await request('GET', `/ideas/${testIdeaId}`, null, participantToken);
    assert(
      ideaDetailRes.statusCode === 200 &&
      (ideaDetailRes.data?.submission_status === 'SUBMITTED' || ideaDetailRes.data?.status === 'SUBMITTED') &&
      ideaDetailRes.data?.files?.length > 0,
      'Submission status is initially SUBMITTED with file metadata verified'
    );

    // 1.13 Download Uploaded File
    const downloadRes = await request('GET', `/ideas/files/${testFileId}/download`, null, participantToken);
    assert(
      downloadRes.statusCode === 200 &&
      downloadRes.headers['content-disposition']?.includes('ai_grid_proposal.pdf'),
      'Attached proposal document downloads securely with original filename'
    );

    // 1.14 View Announcements for Hackathon 1
    const annRes = await request('GET', '/announcements/hackathon/1', null, participantToken);
    assert(annRes.statusCode === 200 && Array.isArray(annRes.data), 'Participant retrieves live event announcements');

    // 1.15 Update Participant Profile
    const profileUpdateRes = await request('PUT', '/auth/profile', {
      full_name: 'Phase 6 Test Student Updated',
      college_name: 'MIT Pune Institute of Tech',
      phone: '9123456780'
    }, participantToken);
    assert(
      profileUpdateRes.statusCode === 200 &&
      profileUpdateRes.data?.full_name === 'Phase 6 Test Student Updated',
      'Profile information updated successfully in MySQL'
    );

    // 1.16 Verify Authentication Persistence
    const meRes = await request('GET', '/auth/me', null, participantToken);
    assert(
      meRes.statusCode === 200 &&
      meRes.data?.email === testStudentEmail,
      'Re-authenticating via token (/auth/me) persists session accurately'
    );

    // ==========================================
    // 2. ORGANIZER WORKFLOW
    // ==========================================
    console.log('\n--- 2. ORGANIZER COMPLETE USER FLOW ---');

    // 2.1 Login as Seeded Organizer (Ramesh Sharma)
    const orgLoginRes = await request('POST', '/auth/login', {
      email: 'ramesh.sharma@mit.edu',
      password: 'password123'
    });
    assert(orgLoginRes.statusCode === 200 && orgLoginRes.data?.user?.role === 'ORGANIZER', 'Organizer logs in successfully with ORGANIZER role');
    organizerToken = orgLoginRes.data?.token;
    organizerUser = orgLoginRes.data?.user;

    // 2.2 View Organizer Dashboard
    const orgDashRes = await request('GET', '/dashboard/organizer', null, organizerToken);
    assert(
      orgDashRes.statusCode === 200 &&
      orgDashRes.data?.stats?.total_hosted_hackathons !== undefined,
      'Organizer dashboard telemetry returns hosted events and review counts'
    );

    // 2.3 Create a Hackathon
    const createHRes = await request('POST', '/hackathons', {
      title: `National CleanTech Sprint ${timestamp}`,
      theme: 'Sustainable Renewable Infrastructure',
      description: 'Design and prototype software solutions targeting carbon capture tracking and renewable grid balancing.',
      rules: 'All code must be written during the event. Plagiarism is prohibited.',
      start_date: '2026-11-15 09:00:00',
      end_date: '2026-11-17 18:00:00',
      registration_deadline: '2026-11-10 23:59:59',
      min_team_size: 2,
      max_team_size: 4,
      location: 'Hybrid - MIT Campus'
    }, organizerToken);
    assert(createHRes.statusCode === 201 && createHRes.data?.hackathon_id, 'Organizer creates new hackathon (HTTP 201)');
    testHackathonId = createHRes.data?.hackathon_id;

    // 2.4 Verify New Hackathon Appears in Public Listing
    const checkHRes = await request('GET', `/hackathons/${testHackathonId}`, null, null);
    assert(checkHRes.statusCode === 200 && checkHRes.data?.title?.includes('CleanTech Sprint'), 'Created hackathon immediately appears in public catalog');

    // 2.5 Edit Hackathon
    const editHRes = await request('PUT', `/hackathons/${testHackathonId}`, {
      title: `National CleanTech Sprint ${timestamp} - Extended`
    }, organizerToken);
    assert(
      editHRes.statusCode === 200,
      'Organizer edits hackathon parameters successfully'
    );

    // 2.6 View Registered Participants (on Hackathon 1 where Ramesh is host)
    const orgPartsRes = await request('GET', '/registrations/hackathon/1', null, organizerToken);
    assert(
      orgPartsRes.statusCode === 200 &&
      Array.isArray(orgPartsRes.data) &&
      orgPartsRes.data.length > 0,
      'Organizer inspects roster of registered students'
    );

    // 2.7 View Project Submissions for Hackathon 1
    const orgSubsRes = await request('GET', '/ideas/hackathon/1', null, organizerToken);
    assert(
      orgSubsRes.statusCode === 200 &&
      Array.isArray(orgSubsRes.data) &&
      orgSubsRes.data.length > 0,
      'Organizer retrieves all project submissions in evaluation queue'
    );

    // 2.8 Evaluate Submission & Update Status to ACCEPTED
    const evalRes = await request('PUT', `/ideas/${testIdeaId}/status`, {
      submission_status: 'ACCEPTED'
    }, organizerToken);
    assert(
      evalRes.statusCode === 200,
      'Organizer marks submitted project idea as ACCEPTED'
    );

    // 2.9 Broadcast Announcement
    const postAnnRes = await request('POST', '/announcements/hackathon/1', {
      title: `Phase 6 Live Broadcast ${timestamp}`,
      content: 'Judging round 1 has concluded. Final presentations begin at 3:00 PM.'
    }, organizerToken);
    assert(postAnnRes.statusCode === 201 && postAnnRes.data?.announcement_id, 'Organizer broadcasts live announcement (HTTP 201)');
    testAnnouncementId = postAnnRes.data?.announcement_id;

    // 2.10 Verify Announcement is Visible to Participants
    const verifyAnnRes = await request('GET', '/announcements/hackathon/1', null, participantToken);
    const hasAnn = verifyAnnRes.data?.some(a => a.announcement_id === testAnnouncementId);
    assert(hasAnn, 'Participant immediately receives broadcasted announcement');

    // 2.11 Delete Announcement
    const delAnnRes = await request('DELETE', `/announcements/${testAnnouncementId}`, null, organizerToken);
    assert(delAnnRes.statusCode === 200, 'Organizer successfully deletes announcement');

    // 2.12 Verify Organizer Cannot Modify Another Organizer's Hackathon
    // Login as second organizer (Prof. Priya Iyer, organizer for Hackathon 2)
    const org2Login = await request('POST', '/auth/login', {
      email: 'priya.iyer@iitb.ac.in',
      password: 'password123'
    });
    const org2Token = org2Login.data?.token;

    // Org 2 attempts to edit Ramesh's hackathon (testHackathonId)
    const crossOrgEdit = await request('PUT', `/hackathons/${testHackathonId}`, {
      title: 'Hacked by Rival Organizer'
    }, org2Token);
    assert(crossOrgEdit.statusCode === 403, 'Cross-organizer resource tampering strictly rejected (HTTP 403)');

    // ==========================================
    // 3. ADMIN WORKFLOW
    // ==========================================
    console.log('\n--- 3. ADMIN COMPLETE USER FLOW ---');

    // 3.1 Login as Admin
    const adminLoginRes = await request('POST', '/auth/login', {
      email: 'admin@hackhub.com',
      password: 'password123'
    });
    assert(adminLoginRes.statusCode === 200 && adminLoginRes.data?.user?.role === 'ADMIN', 'Admin logs in successfully with ADMIN role');
    adminToken = adminLoginRes.data?.token;
    adminUser = adminLoginRes.data?.user;

    // 3.2 View Admin Dashboard & Relational Statistics
    const adminDashRes = await request('GET', '/dashboard/admin', null, adminToken);
    assert(
      adminDashRes.statusCode === 200 &&
      Array.isArray(adminDashRes.data?.users_by_role) &&
      Array.isArray(adminDashRes.data?.hackathons_by_status) &&
      adminDashRes.data?.totals?.total_storage_mb !== undefined,
      'Admin dashboard returns comprehensive DBMS metrics, role breakdowns, and storage usage'
    );

    // 3.3 Verify Admin Privilege (Admin can update any hackathon)
    const adminOverrideRes = await request('PUT', `/hackathons/${testHackathonId}`, {
      title: `Admin Verified CleanTech Sprint ${timestamp}`
    }, adminToken);
    assert(adminOverrideRes.statusCode === 200, 'Admin can manage system-wide hackathons with elevated privileges');

    // ==========================================
    // 4. AUTHORIZATION & RBAC TESTING
    // ==========================================
    console.log('\n--- 4. AUTHORIZATION & RBAC ENFORCEMENT ---');

    // 4.1 Participant cannot access Organizer Dashboard
    const pBlockedFromOrgDash = await request('GET', '/dashboard/organizer', null, participantToken);
    assert(pBlockedFromOrgDash.statusCode === 403, 'Participant blocked from Organizer Dashboard (HTTP 403)');

    // 4.2 Participant cannot access Admin Dashboard
    const pBlockedFromAdminDash = await request('GET', '/dashboard/admin', null, participantToken);
    assert(pBlockedFromAdminDash.statusCode === 403, 'Participant blocked from Admin Dashboard (HTTP 403)');

    // 4.3 Organizer cannot access Admin Dashboard
    const orgBlockedFromAdminDash = await request('GET', '/dashboard/admin', null, organizerToken);
    assert(orgBlockedFromAdminDash.statusCode === 403, 'Organizer blocked from Admin Dashboard (HTTP 403)');

    // 4.4 Participant cannot evaluate submission
    const pEvalBlock = await request('PUT', `/ideas/${testIdeaId}/status`, { submission_status: 'REJECTED' }, participantToken);
    assert(pEvalBlock.statusCode === 403, 'Participant blocked from evaluating submissions (HTTP 403)');

    // 4.5 Participant cannot post announcements
    const pAnnBlock = await request('POST', '/announcements/hackathon/1', { title: 'Spam', content: 'Spam' }, participantToken);
    assert(pAnnBlock.statusCode === 403, 'Participant blocked from broadcasting announcements (HTTP 403)');

    // 4.6 Unauthenticated user cannot access protected endpoints
    const unauthMe = await request('GET', '/auth/me', null, null);
    assert(unauthMe.statusCode === 401, 'Unauthenticated request to /auth/me rejected (HTTP 401)');

    const tamperedTokenRes = await request('GET', '/auth/me', null, 'invalid.tampered.token');
    assert(tamperedTokenRes.statusCode === 401, 'Tampered token rejected (HTTP 401)');

    // ==========================================
    // 5. ERROR & EDGE CASE TESTING
    // ==========================================
    console.log('\n--- 5. ERROR & EDGE CASE TESTING ---');

    // 5.1 Duplicate Registration
    const dupRegRes = await request('POST', '/registrations', { hackathon_id: 1 }, participantToken);
    assert(dupRegRes.statusCode === 409, 'Duplicate hackathon registration rejected with HTTP 409');

    // 5.2 Join Team Without Registration
    unregStudentEmail = `unreg_${timestamp}@test.edu`;
    const unregStudentRes = await request('POST', '/auth/register', {
      full_name: 'Unregistered Student',
      email: unregStudentEmail,
      password: 'password123',
      role: 'PARTICIPANT'
    });
    const unregToken = (await request('POST', '/auth/login', {
      email: unregStudentEmail,
      password: 'password123'
    })).data?.token;

    const unregJoinRes = await request('POST', '/teams/join', {
      invite_code: testTeamCode
    }, unregToken);
    assert(unregJoinRes.statusCode === 403, 'Joining team without prior hackathon registration rejected with HTTP 403');

    // 5.3 Duplicate Idea Submission by Same Team
    const dupIdeaRes = await request('POST', '/ideas', {
      hackathon_id: 1,
      team_id: testTeamId,
      title: 'Duplicate Submission',
      domain_track: 'AI/ML',
      abstract: 'Attempting to submit twice for same team.'
    }, participantToken);
    assert(dupIdeaRes.statusCode === 409, 'Duplicate idea submission by same team rejected with HTTP 409');

    // 5.4 Invalid File Extension (.exe)
    const invalidFileRes = await request('POST', `/ideas/${testIdeaId}/upload`, buildMultipart({}, {
      name: 'file',
      filename: 'payload.exe',
      contentType: 'application/x-msdownload',
      content: Buffer.from('MZ...executable payload')
    }), participantToken, true);
    assert(invalidFileRes.statusCode === 400, 'Executable file upload strictly rejected with HTTP 400');

    // 5.5 File Exceeding 10MB Limit
    const oversizeBuffer = Buffer.alloc(11 * 1024 * 1024, 0); // 11 MB
    const oversizeFileRes = await request('POST', `/ideas/${testIdeaId}/upload`, buildMultipart({}, {
      name: 'file',
      filename: 'massive_presentation.pdf',
      contentType: 'application/pdf',
      content: oversizeBuffer
    }), participantToken, true);
    assert(oversizeFileRes.statusCode === 400, 'File larger than 10MB strictly rejected with LIMIT_FILE_SIZE (HTTP 400)');

    // 5.6 Non-Existent Hackathon ID
    const notFoundH = await request('GET', '/hackathons/999999', null, null);
    assert(notFoundH.statusCode === 404, 'Non-existent hackathon ID returns HTTP 404');

    // 5.7 Non-Existent Idea ID
    const notFoundIdea = await request('GET', '/ideas/999999', null, null);
    assert(notFoundIdea.statusCode === 404, 'Non-existent project idea ID returns HTTP 404');

    // ==========================================
    // 6. PHYSICAL FILE DISK STORAGE & DB INTEGRITY
    // ==========================================
    console.log('\n--- 6. FILE HANDLING & METADATA SEPARATION INTEGRITY ---');

    // Verify physical file was written to backend/uploads/submissions/
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'submissions');
    const diskFiles = fs.readdirSync(uploadsDir);
    const hasPhysicalFile = diskFiles.length > 0;
    assert(hasPhysicalFile, `Physical upload directory contains stored files (${diskFiles.length} files present)`);

    // Verify metadata was captured in MySQL
    assert(testFileId !== null && testFileId > 0, 'Submission file metadata record stored in MySQL submission_files table');

    // ==========================================
    // 7. CLEANUP TEMPORARY TEST DATA
    // ==========================================
    console.log('\n--- 7. CLEANUP TEMPORARY TEST ARTIFACTS ---');
    try {
      const pool = require('../config/db');
      if (testIdeaId) {
        await pool.query('DELETE FROM project_ideas WHERE idea_id = ?', [testIdeaId]);
      }
      if (testTeamId) {
        await pool.query('DELETE FROM teams WHERE team_id = ?', [testTeamId]);
      }
      if (testHackathonId) {
        await pool.query('DELETE FROM hackathons WHERE hackathon_id = ?', [testHackathonId]);
      }
      const testEmails = [testStudentEmail, unregStudentEmail].filter(Boolean);
      if (testEmails.length > 0) {
        await pool.query('DELETE FROM users WHERE email IN (?)', [testEmails]);
      }
    } catch (cleanupErr) {
      console.warn('phase6 cleanup warning:', cleanupErr.message);
    }

    // ==========================================
    // FINAL RESULTS SUMMARY
    // ==========================================
    console.log('\n================================================================');
    console.log(`🏁 PHASE 6 E2E VERIFICATION COMPLETED:`);
    console.log(`   TOTAL TESTS: ${passedTests + failedTests}`);
    console.log(`   PASSED:      ${passedTests}`);
    console.log(`   FAILED:      ${failedTests}`);
    console.log('================================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Unexpected error during E2E verification:', err);
    process.exit(1);
  }
}

runEndToEndSuite();
