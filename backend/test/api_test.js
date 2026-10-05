/**
 * Comprehensive API Test Suite for HackHub REST API
 * Tests all requirements, authentication, role restrictions, transactions, and edge cases.
 */

const { server, app } = require('../server');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';

let adminToken = '';
let organizerToken = '';
let participantToken = '';
let newParticipantToken = '';
let testHackathonId = null;
let testTeamId = null;
let testTeamCode = '';
let testIdeaId = null;
let testFileId = null;

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 STARTING HACKHUB REST API TEST SUITE');
  console.log('======================================================\n');

  try {
    // ---------------------------------------------------------
    // 1. HEALTH CHECK
    // ---------------------------------------------------------
    console.log('--- 1. Health & Server Connectivity ---');
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'UP', 'Health check endpoint returns 200 UP');

    // ---------------------------------------------------------
    // 2. AUTHENTICATION & ROLE RESTRICTIONS
    // ---------------------------------------------------------
    console.log('\n--- 2. Authentication & RBAC Registration Checks ---');

    // 2a. Reject ADMIN registration
    const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Hacker Admin',
        email: 'fakeadmin@hackhub.com',
        password: 'password123',
        role: 'ADMIN'
      })
    });
    assert(adminRegRes.status === 403, 'Public ADMIN registration is rejected (HTTP 403)');

    // 2b. Register new PARTICIPANT
    const uniqueEmail = `testuser_${Date.now()}@college.edu`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Student',
        email: uniqueEmail,
        password: 'password123',
        role: 'PARTICIPANT',
        college_name: 'Test Tech Institute',
        phone: '+91 9999900001'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success && regData.data.token, 'New participant registered successfully (HTTP 201)');
    newParticipantToken = regData.data.token;

    // 2c. Login as Seeded ADMIN
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hackhub.com', password: 'password123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.data.user.role === 'ADMIN', 'Seeded Admin login successful (HTTP 200)');
    adminToken = adminLoginData.data.token;

    // 2d. Login as Seeded ORGANIZER
    const orgLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh.sharma@mit.edu', password: 'password123' })
    });
    const orgLoginData = await orgLoginRes.json();
    assert(orgLoginRes.status === 200 && orgLoginData.data.user.role === 'ORGANIZER', 'Seeded Organizer login successful (HTTP 200)');
    organizerToken = orgLoginData.data.token;

    // 2e. Login as Seeded PARTICIPANT (Aarav Patel)
    const partLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav.patel@student.mit.edu', password: 'password123' })
    });
    const partLoginData = await partLoginRes.json();
    assert(partLoginRes.status === 200 && partLoginData.data.user.role === 'PARTICIPANT', 'Seeded Participant login successful (HTTP 200)');
    participantToken = partLoginData.data.token;

    // 2f. GET /auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${participantToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.data.email === 'aarav.patel@student.mit.edu', 'Protected /auth/me returns authenticated user');

    // ---------------------------------------------------------
    // 3. HACKATHONS API & RBAC
    // ---------------------------------------------------------
    console.log('\n--- 3. Hackathons Catalog, CRUD & Search/Filter ---');

    // 3a. Participant cannot create a hackathon (403 Forbidden)
    const partCreateHackRes = await fetch(`${BASE_URL}/hackathons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${participantToken}`
      },
      body: JSON.stringify({
        title: 'Unauthorized Hackathon',
        description: 'Should fail',
        start_date: '2026-12-01 10:00:00',
        end_date: '2026-12-03 18:00:00',
        registration_deadline: '2026-11-28 23:59:59'
      })
    });
    assert(partCreateHackRes.status === 403, 'Participant cannot create hackathon (HTTP 403 RBAC enforced)');

    // 3b. Organizer creates a new hackathon
    const createHackRes = await fetch(`${BASE_URL}/hackathons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        title: 'Cloud Native & DevOps Sprint 2026',
        description: 'Build automated Kubernetes pipelines and microservices tooling.',
        start_date: '2026-12-20 09:00:00',
        end_date: '2026-12-22 18:00:00',
        registration_deadline: '2026-12-18 23:59:59',
        min_team_size: 1,
        max_team_size: 3,
        location: 'Online',
        tag_ids: [1, 9] // AI/ML, Cloud
      })
    });
    const createHackData = await createHackRes.json();
    assert(createHackRes.status === 201 && createHackData.data.hackathon_id, 'Organizer successfully created hackathon (HTTP 201)');
    testHackathonId = createHackData.data.hackathon_id;

    // 3c. Filter hackathons by tag and search query
    const filterHackRes = await fetch(`${BASE_URL}/hackathons?search=Cloud&status=UPCOMING`);
    const filterHackData = await filterHackRes.json();
    assert(filterHackRes.status === 200 && filterHackData.data.length > 0, 'Hackathon search & status filter working');

    // 3d. Get Hackathon details by ID
    const hackDetailRes = await fetch(`${BASE_URL}/hackathons/${testHackathonId}`);
    const hackDetailData = await hackDetailRes.json();
    assert(hackDetailRes.status === 200 && hackDetailData.data.title === 'Cloud Native & DevOps Sprint 2026', 'Hackathon details retrieved with tags and stats');

    // ---------------------------------------------------------
    // 4. REGISTRATION APIs & VALIDATIONS
    // ---------------------------------------------------------
    console.log('\n--- 4. Registration Flows & Duplicate Prevention ---');

    // 4a. Register new participant for the new hackathon
    const regHackRes = await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newParticipantToken}`
      },
      body: JSON.stringify({ hackathon_id: testHackathonId })
    });
    assert(regHackRes.status === 201, 'Participant registered for hackathon (HTTP 201)');

    // 4b. Duplicate registration rejected
    const dupRegRes = await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newParticipantToken}`
      },
      body: JSON.stringify({ hackathon_id: testHackathonId })
    });
    assert(dupRegRes.status === 409, 'Duplicate hackathon registration rejected (HTTP 409)');

    // 4c. View registered user's list
    const myRegsRes = await fetch(`${BASE_URL}/registrations/my`, {
      headers: { Authorization: `Bearer ${newParticipantToken}` }
    });
    const myRegsData = await myRegsRes.json();
    assert(myRegsRes.status === 200 && myRegsData.data.length > 0, 'User registrations list retrieved');

    // ---------------------------------------------------------
    // 5. TEAMS APIs, TRANSACTIONS & TEAM SIZE LIMITS
    // ---------------------------------------------------------
    console.log('\n--- 5. Team Formation, Transactions & Capacity Validation ---');

    // 5a. Create team without registration fails
    // Create an un-registered user
    const unregUserEmail = `unreg_${Date.now()}@college.edu`;
    const unregUserRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Unregistered Student',
        email: unregUserEmail,
        password: 'password123',
        role: 'PARTICIPANT'
      })
    });
    const unregUserData = await unregUserRes.json();
    const unregToken = unregUserData.data.token;

    const unregTeamRes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unregToken}`
      },
      body: JSON.stringify({
        hackathon_id: testHackathonId,
        team_name: 'Unregistered Team'
      })
    });
    assert(unregTeamRes.status === 403, 'Team creation without hackathon registration rejected (HTTP 403)');

    // 5b. Create team by registered participant (Transaction: team + leader)
    const createTeamRes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newParticipantToken}`
      },
      body: JSON.stringify({
        hackathon_id: testHackathonId,
        team_name: 'CloudVanguard'
      })
    });
    const createTeamData = await createTeamRes.json();
    assert(
      createTeamRes.status === 201 && createTeamData.data.team_id && createTeamData.data.role_in_team === 'LEADER',
      'Team created in transaction with creator as LEADER'
    );
    testTeamId = createTeamData.data.team_id;
    testTeamCode = createTeamData.data.team_code;

    // 5c. User cannot create a second team in the same hackathon
    const dupTeamRes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newParticipantToken}`
      },
      body: JSON.stringify({
        hackathon_id: testHackathonId,
        team_name: 'Second Team'
      })
    });
    assert(dupTeamRes.status === 400, 'User already in a team cannot create another team in same hackathon');

    // 5d. Another user joins team using team_code (must be registered first)
    // Register unregUser for the hackathon
    await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unregToken}`
      },
      body: JSON.stringify({ hackathon_id: testHackathonId })
    });

    const joinTeamRes = await fetch(`${BASE_URL}/teams/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unregToken}`
      },
      body: JSON.stringify({ team_code: testTeamCode })
    });
    assert(joinTeamRes.status === 200, 'Registered participant successfully joined team using team_code');

    // 5e. Inspect team roster and roles
    const teamDetailRes = await fetch(`${BASE_URL}/teams/${testTeamId}`, {
      headers: { Authorization: `Bearer ${newParticipantToken}` }
    });
    const teamDetailData = await teamDetailRes.json();
    assert(
      teamDetailRes.status === 200 && teamDetailData.data.members.length === 2,
      'Team roster retrieved with Leader and Member roles'
    );

    // ---------------------------------------------------------
    // 6. PROJECT IDEAS & SUBMISSIONS
    // ---------------------------------------------------------
    console.log('\n--- 6. Project Ideas & Submission Integrity ---');

    // 6a. Submit team idea for the hackathon
    const submitIdeaRes = await fetch(`${BASE_URL}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newParticipantToken}`
      },
      body: JSON.stringify({
        hackathon_id: testHackathonId,
        team_id: testTeamId,
        title: 'KubeGuard – Automated Cluster Security Scanner',
        abstract: 'An automated Kubernetes admission controller evaluating CIS benchmarks and RBAC misconfigurations.',
        domain_track: 'Cloud & DevOps',
        tech_stack: 'Go, Kubernetes, React, Helm',
        demo_url: 'https://kubeguard.io',
        repo_url: 'https://github.com/cloudvanguard/kubeguard',
        is_public: true
      })
    });
    const submitIdeaData = await submitIdeaRes.json();
    assert(submitIdeaRes.status === 201 && submitIdeaData.data.idea_id, 'Team project idea submitted successfully (HTTP 201)');
    testIdeaId = submitIdeaData.data.idea_id;

    // 6b. Reject duplicate submission from same team
    const dupIdeaRes = await fetch(`${BASE_URL}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newParticipantToken}`
      },
      body: JSON.stringify({
        hackathon_id: testHackathonId,
        team_id: testTeamId,
        title: 'Second Team Idea',
        abstract: 'This should be rejected.'
      })
    });
    assert(dupIdeaRes.status === 409, 'Duplicate idea submission by same team is rejected (HTTP 409)');

    // 6c. Verify idea appears in public gallery
    const publicIdeasRes = await fetch(`${BASE_URL}/ideas/public?search=KubeGuard`);
    const publicIdeasData = await publicIdeasRes.json();
    assert(publicIdeasRes.status === 200 && publicIdeasData.data.length > 0, 'Public ideas gallery lists newly submitted public project');

    // ---------------------------------------------------------
    // 7. FILE UPLOAD (MULTER + METADATA IN MYSQL)
    // ---------------------------------------------------------
    console.log('\n--- 7. Multer Document Upload (PPT/PDF) ---');

    // Create a temporary sample PDF file
    const samplePdfPath = path.join(__dirname, 'sample_test_doc.pdf');
    fs.writeFileSync(samplePdfPath, '%PDF-1.4 Mock PDF Content for testing upload');

    // Upload via FormData
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(samplePdfPath)], { type: 'application/pdf' });
    formData.append('file', fileBlob, 'KubeGuard_Architecture.pdf');

    const uploadRes = await fetch(`${BASE_URL}/ideas/${testIdeaId}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${newParticipantToken}`
      },
      body: formData
    });

    const uploadData = await uploadRes.json();
    assert(
      uploadRes.status === 201 && uploadData.data.file_type === 'PDF' && uploadData.data.file_id,
      'PDF attachment uploaded with metadata saved to MySQL and file stored on disk'
    );
    testFileId = uploadData.data.file_id;

    // Clean up local temp file
    if (fs.existsSync(samplePdfPath)) fs.unlinkSync(samplePdfPath);

    // 7b. Download file test
    const downloadRes = await fetch(`${BASE_URL}/ideas/files/${testFileId}/download`);
    assert(downloadRes.status === 200, 'Attached file downloaded successfully via safe streaming endpoint');

    // ---------------------------------------------------------
    // 8. ORGANIZER EVALUATION & ANNOUNCEMENTS
    // ---------------------------------------------------------
    console.log('\n--- 8. Organizer Evaluation & Hackathon Announcements ---');

    // 8a. Organizer changes submission status to ACCEPTED
    const statusUpdateRes = await fetch(`${BASE_URL}/ideas/${testIdeaId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({ submission_status: 'ACCEPTED' })
    });
    assert(statusUpdateRes.status === 200, 'Organizer successfully evaluated and ACCEPTED submission');

    // 8b. Participant cannot change submission status
    const partStatusRes = await fetch(`${BASE_URL}/ideas/${testIdeaId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newParticipantToken}`
      },
      body: JSON.stringify({ submission_status: 'ACCEPTED' })
    });
    assert(partStatusRes.status === 403, 'Participant cannot evaluate submission status (HTTP 403)');

    // 8c. Organizer posts an announcement
    const postAnnRes = await fetch(`${BASE_URL}/announcements/hackathon/${testHackathonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        title: 'Project Submission Review Complete',
        content: 'All early bird submissions have been evaluated. Check dashboard for feedback.',
        is_pinned: true
      })
    });
    assert(postAnnRes.status === 201, 'Organizer posted announcement with pin flag (HTTP 201)');

    // 8d. Read announcements
    const getAnnRes = await fetch(`${BASE_URL}/announcements/hackathon/${testHackathonId}`);
    const getAnnData = await getAnnRes.json();
    assert(getAnnRes.status === 200 && getAnnData.data.length > 0, 'Announcements retrieved with pinned items first');

    // ---------------------------------------------------------
    // 9. DASHBOARDS (PARTICIPANT, ORGANIZER, ADMIN)
    // ---------------------------------------------------------
    console.log('\n--- 9. Role-Specific Dashboard Metrics ---');

    // 9a. Participant Dashboard
    const partDashRes = await fetch(`${BASE_URL}/dashboard/participant`, {
      headers: { Authorization: `Bearer ${newParticipantToken}` }
    });
    const partDashData = await partDashRes.json();
    assert(
      partDashRes.status === 200 && partDashData.data.stats.total_submissions >= 1,
      'Participant dashboard displays user metrics, submissions, and teams'
    );

    // 9b. Organizer Dashboard
    const orgDashRes = await fetch(`${BASE_URL}/dashboard/organizer`, {
      headers: { Authorization: `Bearer ${organizerToken}` }
    });
    const orgDashData = await orgDashRes.json();
    assert(
      orgDashRes.status === 200 && orgDashData.data.stats.total_hosted_hackathons >= 1,
      'Organizer dashboard displays hosted events, total teams, and review counts'
    );

    // 9c. Admin Dashboard
    const adminDashRes = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminDashData = await adminDashRes.json();
    assert(
      adminDashRes.status === 200 && adminDashData.data.totals.total_files_uploaded >= 1,
      'Admin dashboard displays system overview, user roles breakdown, and storage metrics'
    );

    // 9d. Participant cannot access Admin Dashboard
    const partAdminDashRes = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${newParticipantToken}` }
    });
    assert(partAdminDashRes.status === 403, 'Participant blocked from Admin dashboard (HTTP 403 RBAC)');

  } catch (error) {
    console.error('Fatal Test Exception:', error);
    failed++;
  } finally {
    try {
      const pool = require('../config/db');
      if (testHackathonId) {
        await pool.query('DELETE FROM hackathons WHERE hackathon_id = ?', [testHackathonId]);
      }
      await pool.query("DELETE FROM users WHERE email LIKE 'testuser_%' OR email LIKE 'unreg_%'");
      // Also delete temporary sample pdf
      const samplePdf = path.join(__dirname, 'sample_test_doc.pdf');
      if (fs.existsSync(samplePdf)) fs.unlinkSync(samplePdf);
    } catch (cleanupErr) {
      console.warn('api_test cleanup warning:', cleanupErr.message);
    }

    console.log('\n======================================================');
    console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    server.close(() => {
      console.log('Server stopped after tests.');
      process.exit(failed > 0 ? 1 : 0);
    });
  }
}

// Give server time to connect to MySQL before running tests
setTimeout(runTests, 1500);
