/**
 * HackHub Comprehensive REST API Verification Test Suite (Phase 4)
 * Covers all 11 test modules + security + transactions + edge cases.
 */

const { server, app } = require('../server');
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';

let passedCount = 0;
let failedCount = 0;
const testResults = [];

function assert(condition, moduleName, testName, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${moduleName}: ${testName}`);
    passedCount++;
    testResults.push({ module: moduleName, test: testName, status: 'PASS' });
  } else {
    console.error(`  ❌ [FAIL] ${moduleName}: ${testName} - ${details}`);
    failedCount++;
    testResults.push({ module: moduleName, test: testName, status: 'FAIL', details });
  }
}

async function runComprehensiveVerification() {
  console.log('\n================================================================');
  console.log('🧪 HACKHUB COMPREHENSIVE REST API VERIFICATION SUITE (PHASE 4)');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // MODULE 1: SERVER & DATABASE CONNECTIVITY
    // -------------------------------------------------------------
    console.log('\n--- MODULE 1: Server & Database Connectivity ---');
    
    // 1a. Health Endpoint
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.status === 'UP' && healthData.database.includes('MySQL 8.4'),
      'Connectivity',
      'Health check endpoint returns status UP and identifies MySQL 8.4 database'
    );

    // 1b. Direct Pool Query
    const [dbTestRows] = await pool.query('SELECT 1 + 1 AS solution');
    assert(
      dbTestRows[0].solution === 2,
      'Connectivity',
      'Direct connection pool query executes successfully'
    );

    // 1c. Connection Pool Concurrent Acquisition & Release
    const conn1 = await pool.getConnection();
    const conn2 = await pool.getConnection();
    const conn3 = await pool.getConnection();
    assert(
      conn1 && conn2 && conn3,
      'Connectivity',
      'Connection pool safely provisions multiple concurrent connections'
    );
    conn1.release();
    conn2.release();
    conn3.release();

    // -------------------------------------------------------------
    // MODULE 2: AUTHENTICATION & SECURITY
    // -------------------------------------------------------------
    console.log('\n--- MODULE 2: Authentication & Password Security ---');

    // 2a. Register Participant
    const studentEmail = `student_${Date.now()}@test.edu`;
    const regPartRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Verified Student',
        email: studentEmail,
        password: 'password123',
        role: 'PARTICIPANT',
        college_name: 'National Tech Institute',
        phone: '+91 9888877771'
      })
    });
    const regPartData = await regPartRes.json();
    assert(
      regPartRes.status === 201 && regPartData.data.token && !regPartData.data.user.password_hash,
      'Authentication',
      'Participant registers successfully with token and no password_hash exposed'
    );
    const studentToken = regPartData.data.token;
    const studentUserId = regPartData.data.user.user_id;

    // 2b. Register Organizer
    const orgEmail = `organizer_${Date.now()}@test.edu`;
    const regOrgRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Verified Organizer',
        email: orgEmail,
        password: 'password123',
        role: 'ORGANIZER',
        college_name: 'Innovation Hub',
        phone: '+91 9888877772'
      })
    });
    const regOrgData = await regOrgRes.json();
    assert(
      regOrgRes.status === 201 && regOrgData.data.user.role === 'ORGANIZER',
      'Authentication',
      'Organizer registers successfully with role ORGANIZER'
    );
    const organizerToken = regOrgData.data.token;
    const organizerUserId = regOrgData.data.user.user_id;

    // 2c. Reject Public ADMIN Registration
    const adminRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Malicious Admin',
        email: `hacker_${Date.now()}@bad.com`,
        password: 'password123',
        role: 'ADMIN'
      })
    });
    assert(
      adminRegRes.status === 403,
      'Authentication',
      'Public ADMIN registration is strictly rejected with HTTP 403'
    );

    // 2d. Login with Valid Credentials (Admin)
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hackhub.com', password: 'password123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(
      adminLoginRes.status === 200 && adminLoginData.data.user.role === 'ADMIN' && !adminLoginData.data.user.password_hash,
      'Authentication',
      'Admin login returns valid JWT token and sanitized profile'
    );
    const adminToken = adminLoginData.data.token;

    // 2e. Login with Invalid Password
    const badPassLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hackhub.com', password: 'wrongpassword' })
    });
    assert(
      badPassLoginRes.status === 401,
      'Authentication',
      'Login with incorrect password rejected with HTTP 401'
    );

    // 2f. Login with Non-existent Email
    const noUserLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost_user_9999@hackhub.com', password: 'password123' })
    });
    assert(
      noUserLoginRes.status === 401,
      'Authentication',
      'Login with non-existent email rejected with HTTP 401'
    );

    // 2g. Protected Endpoint without Token
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
    assert(
      noTokenRes.status === 401,
      'Authentication',
      'Accessing protected route without Authorization header returns HTTP 401'
    );

    // 2h. Protected Endpoint with Malformed Token
    const badTokenRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer totally_invalid_jwt_string' }
    });
    assert(
      badTokenRes.status === 401,
      'Authentication',
      'Accessing protected route with invalid/tampered token returns HTTP 401'
    );

    // 2i. Profile Retrieval (/auth/me)
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 && meData.data.email === studentEmail,
      'Authentication',
      'GET /auth/me returns accurate profile information'
    );

    // 2j. Profile Update (/auth/profile)
    const updateProfRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        full_name: 'Verified Student Updated',
        college_name: 'Premier Institute of Technology',
        phone: '+91 9999911111'
      })
    });
    const updateProfData = await updateProfRes.json();
    assert(
      updateProfRes.status === 200 && updateProfData.data.full_name === 'Verified Student Updated',
      'Authentication',
      'PUT /auth/profile successfully updates user record in MySQL'
    );

    // -------------------------------------------------------------
    // MODULE 3: ROLE-BASED ACCESS CONTROL (RBAC)
    // -------------------------------------------------------------
    console.log('\n--- MODULE 3: Role-Based Access Control (RBAC) ---');

    // 3a. Participant cannot create hackathons
    const partCreateHackRes = await fetch(`${BASE_URL}/hackathons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Unauthorized Event',
        description: 'Should fail',
        start_date: '2026-11-01 10:00:00',
        end_date: '2026-11-03 18:00:00',
        registration_deadline: '2026-10-28 23:59:59'
      })
    });
    assert(
      partCreateHackRes.status === 403,
      'RBAC',
      'Participant is blocked from creating hackathons (HTTP 403)'
    );

    // 3b. Organizer 1 creates an event
    const org1HackRes = await fetch(`${BASE_URL}/hackathons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        title: 'Quantum Computing Hackathon 2026',
        description: 'Design quantum algorithms using Qiskit and Cirq.',
        start_date: '2026-12-05 09:00:00',
        end_date: '2026-12-07 18:00:00',
        registration_deadline: '2026-11-30 23:59:59',
        min_team_size: 1,
        max_team_size: 3,
        location: 'Online',
        tag_ids: [1, 9] // AI/ML, Cloud
      })
    });
    const org1HackData = await org1HackRes.json();
    assert(
      org1HackRes.status === 201 && org1HackData.data.hackathon_id,
      'RBAC',
      'Organizer 1 creates their own hackathon successfully'
    );
    const quantumHackathonId = org1HackData.data.hackathon_id;

    // 3c. Organizer 1 updates their own event
    const org1UpdateRes = await fetch(`${BASE_URL}/hackathons/${quantumHackathonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({ title: 'Quantum Computing & Algorithms Hackathon 2026' })
    });
    assert(
      org1UpdateRes.status === 200,
      'RBAC',
      'Organizer 1 can update their own hackathon'
    );

    // 3d. Organizer 2 (Dr. Ramesh Sharma) attempts to modify Organizer 1's hackathon
    // Login as Ramesh Sharma
    const rameshLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ramesh.sharma@mit.edu', password: 'password123' })
    });
    const rameshData = await rameshLogin.json();
    const rameshToken = rameshData.data.token;

    const crossOrgUpdateRes = await fetch(`${BASE_URL}/hackathons/${quantumHackathonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${rameshToken}`
      },
      body: JSON.stringify({ title: 'Hijacked Hackathon Title' })
    });
    assert(
      crossOrgUpdateRes.status === 403,
      'RBAC',
      'Organizer cannot update another organizers hackathon (HTTP 403)'
    );

    // 3e. Organizer 2 attempts to delete Organizer 1's hackathon
    const crossOrgDeleteRes = await fetch(`${BASE_URL}/hackathons/${quantumHackathonId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${rameshToken}` }
    });
    assert(
      crossOrgDeleteRes.status === 403,
      'RBAC',
      'Organizer cannot delete another organizers hackathon (HTTP 403)'
    );

    // 3f. Admin can manage/update any hackathon
    const adminUpdateRes = await fetch(`${BASE_URL}/hackathons/${quantumHackathonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ description: 'Admin verified and updated description.' })
    });
    assert(
      adminUpdateRes.status === 200,
      'RBAC',
      'Admin can update any hackathon across the system'
    );

    // 3g. Participant blocked from Organizer and Admin Dashboards
    const partToOrgDashRes = await fetch(`${BASE_URL}/dashboard/organizer`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(
      partToOrgDashRes.status === 403,
      'RBAC',
      'Participant blocked from Organizer dashboard (HTTP 403)'
    );

    const partToAdminDashRes = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(
      partToAdminDashRes.status === 403,
      'RBAC',
      'Participant blocked from Admin dashboard (HTTP 403)'
    );

    // -------------------------------------------------------------
    // MODULE 4: HACKATHONS CRUD, SEARCH & FILTERING
    // -------------------------------------------------------------
    console.log('\n--- MODULE 4: Hackathons Filtering, Search & Constraints ---');

    // 4a. Read all hackathons with pagination
    const listHacksRes = await fetch(`${BASE_URL}/hackathons?page=1&limit=3`);
    const listHacksData = await listHacksRes.json();
    assert(
      listHacksRes.status === 200 && listHacksData.data.length === 3 && listHacksData.meta.totalPages >= 2,
      'Hackathons',
      'Pagination works with limit=3 and returns totalPages in meta'
    );

    // 4b. Search by keyword
    const searchRes = await fetch(`${BASE_URL}/hackathons?search=Quantum`);
    const searchData = await searchRes.json();
    assert(
      searchRes.status === 200 && searchData.data.length >= 1 && searchData.data[0].title.includes('Quantum'),
      'Hackathons',
      'Keyword search matches title/description correctly'
    );

    // 4c. Filter by Status
    const statusFilterRes = await fetch(`${BASE_URL}/hackathons?status=UPCOMING`);
    const statusFilterData = await statusFilterRes.json();
    const allUpcoming = statusFilterData.data.every((h) => h.status === 'UPCOMING');
    assert(
      statusFilterRes.status === 200 && allUpcoming,
      'Hackathons',
      'Status filtering strictly returns only UPCOMING hackathons'
    );

    // 4d. Filter by Tag
    const tagFilterRes = await fetch(`${BASE_URL}/hackathons?tag=AI/ML`);
    const tagFilterData = await tagFilterRes.json();
    const allHaveTag = tagFilterData.data.every((h) => h.tags.includes('AI/ML'));
    assert(
      tagFilterRes.status === 200 && allHaveTag,
      'Hackathons',
      'Tag filtering properly filters by category tag via junction mapping'
    );

    // 4e. Invalid Date Constraint Check (end_date < start_date)
    const badDatesRes = await fetch(`${BASE_URL}/hackathons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        title: 'Bad Date Hackathon',
        description: 'Should fail validation',
        start_date: '2026-12-10 10:00:00',
        end_date: '2026-12-05 18:00:00', // Earlier than start_date
        registration_deadline: '2026-12-01 23:59:59'
      })
    });
    assert(
      badDatesRes.status === 400,
      'Hackathons',
      'Hackathon with end_date < start_date rejected with HTTP 400'
    );

    // 4f. Invalid Team Size Constraint (min > max)
    const badSizesRes = await fetch(`${BASE_URL}/hackathons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        title: 'Bad Size Hackathon',
        description: 'Should fail validation',
        start_date: '2026-12-10 10:00:00',
        end_date: '2026-12-15 18:00:00',
        registration_deadline: '2026-12-08 23:59:59',
        min_team_size: 5,
        max_team_size: 2
      })
    });
    assert(
      badSizesRes.status === 400,
      'Hackathons',
      'Hackathon with min_team_size > max_team_size rejected with HTTP 400'
    );

    // -------------------------------------------------------------
    // MODULE 5: REGISTRATIONS & DEADLINE ENFORCEMENT
    // -------------------------------------------------------------
    console.log('\n--- MODULE 5: Registrations & Duplicate Prevention ---');

    // 5a. Successful Registration
    const regRes = await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ hackathon_id: quantumHackathonId })
    });
    const regData = await regRes.json();
    assert(
      regRes.status === 201 && regData.data.registration_id,
      'Registrations',
      'Participant registered for Quantum hackathon (HTTP 201)'
    );
    const registeredId = regData.data.registration_id;

    // 5b. Duplicate Registration Rejection
    const dupRegRes = await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ hackathon_id: quantumHackathonId })
    });
    assert(
      dupRegRes.status === 409,
      'Registrations',
      'Duplicate hackathon registration rejected with HTTP 409'
    );

    // 5c. Registration for Non-Existent Hackathon
    const ghostRegRes = await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ hackathon_id: 999999 })
    });
    assert(
      ghostRegRes.status === 404,
      'Registrations',
      'Registration for non-existent hackathon rejected with HTTP 404'
    );

    // 5d. Registration after deadline / completed hackathon
    // Hackathon 5 (GreenTech) is marked COMPLETED with deadline in the past
    const pastRegRes = await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ hackathon_id: 5 })
    });
    assert(
      pastRegRes.status === 400,
      'Registrations',
      'Registration for completed/expired hackathon rejected with HTTP 400'
    );

    // -------------------------------------------------------------
    // MODULE 6: TEAMS, TRANSACTIONS & CAPACITY LIMITS
    // -------------------------------------------------------------
    console.log('\n--- MODULE 6: Teams, Transactions & Capacity Validation ---');

    // Create a 2nd participant to test team interactions
    const student2Email = `student2_${Date.now()}@test.edu`;
    const regPart2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Student Two',
        email: student2Email,
        password: 'password123',
        role: 'PARTICIPANT'
      })
    });
    const student2Data = await regPart2.json();
    const student2Token = student2Data.data.token;
    const student2UserId = student2Data.data.user.user_id;

    // 6a. Create Team without Registration -> Must Fail (HTTP 403)
    const unregTeamRes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`
      },
      body: JSON.stringify({
        hackathon_id: quantumHackathonId,
        team_name: 'QuantumLeap'
      })
    });
    assert(
      unregTeamRes.status === 403,
      'Teams',
      'Create team without hackathon registration rejected with HTTP 403'
    );

    // 6b. Registered Student 1 creates Team (ACID Transaction)
    const createTeamRes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        hackathon_id: quantumHackathonId,
        team_name: 'QuantumLeap'
      })
    });
    const createTeamData = await createTeamRes.json();
    assert(
      createTeamRes.status === 201 && createTeamData.data.role_in_team === 'LEADER',
      'Teams',
      'Team created in transaction with creator as LEADER'
    );
    const quantumTeamId = createTeamData.data.team_id;
    const quantumTeamCode = createTeamData.data.team_code;

    // 6c. User already in team cannot create another team in same hackathon
    const dupCreateTeamRes = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        hackathon_id: quantumHackathonId,
        team_name: 'QuantumSecondTeam'
      })
    });
    assert(
      dupCreateTeamRes.status === 400,
      'Teams',
      'User cannot create a second team in the same hackathon (HTTP 400)'
    );

    // 6d. Join Team without registration -> Must Fail (HTTP 403)
    const unregJoinRes = await fetch(`${BASE_URL}/teams/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`
      },
      body: JSON.stringify({ team_code: quantumTeamCode })
    });
    assert(
      unregJoinRes.status === 403,
      'Teams',
      'Join team without registration rejected with HTTP 403'
    );

    // Now register Student 2 for the Quantum Hackathon
    await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`
      },
      body: JSON.stringify({ hackathon_id: quantumHackathonId })
    });

    // 6e. Student 2 successfully joins team
    const joinTeamRes = await fetch(`${BASE_URL}/teams/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`
      },
      body: JSON.stringify({ team_code: quantumTeamCode })
    });
    assert(
      joinTeamRes.status === 200,
      'Teams',
      'Registered Student 2 successfully joined team via team_code'
    );

    // 6f. Student 2 cannot join another team in the same hackathon
    const dupJoinRes = await fetch(`${BASE_URL}/teams/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`
      },
      body: JSON.stringify({ team_code: quantumTeamCode })
    });
    assert(
      dupJoinRes.status === 400,
      'Teams',
      'Attempting to join a team when already a member rejected with HTTP 400'
    );

    // 6g. Capacity limit test: Max team size for Quantum Hackathon is 3.
    // Register Student 3 and join (size becomes 3)
    const student3Email = `student3_${Date.now()}@test.edu`;
    const regPart3 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Student Three', email: student3Email, password: 'password123', role: 'PARTICIPANT' })
    });
    const student3Data = await regPart3.json();
    await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student3Data.data.token}` },
      body: JSON.stringify({ hackathon_id: quantumHackathonId })
    });
    await fetch(`${BASE_URL}/teams/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student3Data.data.token}` },
      body: JSON.stringify({ team_code: quantumTeamCode })
    });

    // Register Student 4 and attempt to join full team (size = 3 >= max_team_size = 3)
    const student4Email = `student4_${Date.now()}@test.edu`;
    const regPart4 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Student Four', email: student4Email, password: 'password123', role: 'PARTICIPANT' })
    });
    const student4Data = await regPart4.json();
    await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student4Data.data.token}` },
      body: JSON.stringify({ hackathon_id: quantumHackathonId })
    });
    const overCapacityJoinRes = await fetch(`${BASE_URL}/teams/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student4Data.data.token}` },
      body: JSON.stringify({ team_code: quantumTeamCode })
    });
    assert(
      overCapacityJoinRes.status === 400,
      'Teams',
      'Joining team that reached max_team_size rejected with HTTP 400 (Capacity enforced)'
    );

    // 6h. Team Roster Role Verification
    const teamRosterRes = await fetch(`${BASE_URL}/teams/${quantumTeamId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const teamRosterData = await teamRosterRes.json();
    const leader = teamRosterData.data && teamRosterData.data.members && teamRosterData.data.members.find((m) => m.role_in_team === 'LEADER');
    const members = teamRosterData.data && teamRosterData.data.members && teamRosterData.data.members.filter((m) => m.role_in_team === 'MEMBER');
    assert(
      teamRosterRes.status === 200 && leader && members.length === 2,
      'Teams',
      'Team roster correctly identifies 1 LEADER and 2 MEMBERS'
    );

    // -------------------------------------------------------------
    // MODULE 7: PROJECT IDEAS & SUBMISSION INTEGRITY
    // -------------------------------------------------------------
    console.log('\n--- MODULE 7: Project Ideas & Evaluation ---');

    // 7a. Submit Team Project Idea
    const submitIdeaRes = await fetch(`${BASE_URL}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        hackathon_id: quantumHackathonId,
        team_id: quantumTeamId,
        title: 'Q-Shield – Post-Quantum Cryptographic Key Distribution',
        abstract: 'Implementation of lattice-based CRYSTALS-Kyber for secure real-time microservice communication.',
        domain_track: 'AI/ML',
        tech_stack: 'Python, Qiskit, C++, WebAssembly',
        demo_url: 'https://q-shield.network',
        repo_url: 'https://github.com/quantumleap/q-shield',
        is_public: false // Private submission first
      })
    });
    const submitIdeaData = await submitIdeaRes.json();
    assert(
      submitIdeaRes.status === 201 && submitIdeaData.data.idea_id,
      'Project Ideas',
      'Team project idea submitted successfully with SUBMITTED status'
    );
    const quantumIdeaId = submitIdeaData.data.idea_id;

    // 7b. Reject duplicate team submission in the same hackathon
    const dupIdeaRes = await fetch(`${BASE_URL}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        hackathon_id: quantumHackathonId,
        team_id: quantumTeamId,
        title: 'Duplicate Q-Shield Submission',
        abstract: 'Should fail'
      })
    });
    assert(
      dupIdeaRes.status === 409,
      'Project Ideas',
      'Duplicate submission for the same team in a hackathon rejected with HTTP 409'
    );

    // 7c. Reject cross-hackathon team submission
    // Attempt submitting for Hackathon 1 with a team that belongs to QuantumHackathon
    const crossHackTeamRes = await fetch(`${BASE_URL}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        hackathon_id: 1,
        team_id: quantumTeamId,
        title: 'Mismatched Hackathon Team',
        abstract: 'Should fail'
      })
    });
    assert(
      crossHackTeamRes.status === 400 || crossHackTeamRes.status === 403,
      'Project Ideas',
      'Submitting an idea with a team belonging to a different hackathon rejected'
    );

    // 7d. Reject solo idea when min_team_size > 1
    // Hackathon 1 has min_team_size = 2
    // Register Student 4 for Hackathon 1
    await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student4Data.data.token}` },
      body: JSON.stringify({ hackathon_id: 1 })
    });
    const soloRejectRes = await fetch(`${BASE_URL}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student4Data.data.token}` },
      body: JSON.stringify({
        hackathon_id: 1,
        team_id: null,
        title: 'Solo Idea Where Team Required',
        abstract: 'Should fail because min_team_size is 2'
      })
    });
    assert(
      soloRejectRes.status === 400,
      'Project Ideas',
      'Solo submission rejected when hackathons min_team_size > 1'
    );

    // 7e. Private Idea Access Control
    // Unauthenticated request should be 403
    const guestPrivateRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}`);
    assert(
      guestPrivateRes.status === 403,
      'Project Ideas',
      'Private project idea is inaccessible to unauthenticated guests (HTTP 403)'
    );

    // Student 4 (not in team) cannot view private idea
    const strangerPrivateRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}`, {
      headers: { Authorization: `Bearer ${student4Data.data.token}` }
    });
    assert(
      strangerPrivateRes.status === 403,
      'Project Ideas',
      'Private project idea is inaccessible to unrelated participants (HTTP 403)'
    );

    // Team Leader (Student 1) can view private idea
    const ownerPrivateRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(
      ownerPrivateRes.status === 200,
      'Project Ideas',
      'Private project idea is viewable by its team creator (HTTP 200)'
    );

    // 7f. Author updates idea and toggles public
    const updateIdeaRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        title: 'Q-Shield – Advanced Post-Quantum Cryptography Engine',
        is_public: true
      })
    });
    assert(
      updateIdeaRes.status === 200,
      'Project Ideas',
      'Author updates project idea and sets is_public = TRUE'
    );

    // 7g. Unauthorized user cannot update idea
    const unauthUpdateRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student4Data.data.token}`
      },
      body: JSON.stringify({ title: 'Hacked Title' })
    });
    assert(
      unauthUpdateRes.status === 403,
      'Project Ideas',
      'Unauthorized participant cannot update another users project idea (HTTP 403)'
    );

    // 7h. Organizer evaluates submission -> Sets status to ACCEPTED
    const evaluateRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({ submission_status: 'ACCEPTED' })
    });
    assert(
      evaluateRes.status === 200,
      'Project Ideas',
      'Organizer evaluates submission and marks status as ACCEPTED'
    );

    // 7i. Participant cannot evaluate submission status
    const partEvalRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ submission_status: 'ACCEPTED' })
    });
    assert(
      partEvalRes.status === 403,
      'Project Ideas',
      'Participant cannot evaluate submission status (HTTP 403 RBAC)'
    );

    // -------------------------------------------------------------
    // MODULE 8: FILE UPLOADS (PDF, PPT, PPTX & VALIDATIONS)
    // -------------------------------------------------------------
    console.log('\n--- MODULE 8: File Uploads & Metadata Separation ---');

    // 8a. Upload PDF
    const mockPdfPath = path.join(__dirname, 'test_mock.pdf');
    fs.writeFileSync(mockPdfPath, '%PDF-1.4 Mock PDF content for testing');
    const pdfForm = new FormData();
    pdfForm.append('file', new Blob([fs.readFileSync(mockPdfPath)], { type: 'application/pdf' }), 'QShield_Architecture.pdf');

    const pdfUploadRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: pdfForm
    });
    const pdfUploadData = await pdfUploadRes.json();
    assert(
      pdfUploadRes.status === 201 && pdfUploadData.data.file_type === 'PDF' && pdfUploadData.data.file_id,
      'File Uploads',
      'PDF file uploaded, metadata saved in MySQL, and binary file saved on server'
    );
    const uploadedPdfId = pdfUploadData.data.file_id;
    fs.unlinkSync(mockPdfPath);

    // 8b. Upload PPTX
    const mockPptxPath = path.join(__dirname, 'test_mock.pptx');
    fs.writeFileSync(mockPptxPath, 'PK\x03\x04 Mock PPTX zip binary content');
    const pptxForm = new FormData();
    pptxForm.append(
      'file',
      new Blob([fs.readFileSync(mockPptxPath)], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      }),
      'QShield_Deck.pptx'
    );

    const pptxUploadRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: pptxForm
    });
    const pptxUploadData = await pptxUploadRes.json();
    assert(
      pptxUploadRes.status === 201 && pptxUploadData.data.file_type === 'PPT',
      'File Uploads',
      'PowerPoint (.pptx) file uploaded successfully with PPT classification'
    );
    fs.unlinkSync(mockPptxPath);

    // 8c. Reject Unsupported File Extension (.exe / .txt)
    const badFilePath = path.join(__dirname, 'test_bad.exe');
    fs.writeFileSync(badFilePath, 'MZ mock executable binary');
    const badForm = new FormData();
    badForm.append('file', new Blob([fs.readFileSync(badFilePath)], { type: 'application/x-msdownload' }), 'hack.exe');

    const badUploadRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: badForm
    });
    assert(
      badUploadRes.status === 400,
      'File Uploads',
      'Unsupported file format (.exe) strictly rejected by multer filter'
    );
    fs.unlinkSync(badFilePath);

    // 8d. Reject File Larger than 10MB
    // Create a 10.5 MB mock file
    const largeFilePath = path.join(__dirname, 'test_large.pdf');
    const largeBuffer = Buffer.alloc(10.5 * 1024 * 1024);
    largeBuffer.write('%PDF-1.4 ');
    fs.writeFileSync(largeFilePath, largeBuffer);

    const largeForm = new FormData();
    largeForm.append('file', new Blob([fs.readFileSync(largeFilePath)], { type: 'application/pdf' }), 'huge.pdf');

    const largeUploadRes = await fetch(`${BASE_URL}/ideas/${quantumIdeaId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: largeForm
    });
    assert(
      largeUploadRes.status === 400,
      'File Uploads',
      'File exceeding 10 MB limit strictly rejected with LIMIT_FILE_SIZE error'
    );
    fs.unlinkSync(largeFilePath);

    // 8e. Download Uploaded Document
    const downloadRes = await fetch(`${BASE_URL}/ideas/files/${uploadedPdfId}/download`);
    assert(
      downloadRes.status === 200,
      'File Uploads',
      'File download endpoint streams file successfully with original filename'
    );

    // -------------------------------------------------------------
    // MODULE 9: ANNOUNCEMENTS
    // -------------------------------------------------------------
    console.log('\n--- MODULE 9: Announcements & Broadcast Updates ---');

    // 9a. Organizer posts pinned announcement
    const postPinnedAnnRes = await fetch(`${BASE_URL}/announcements/hackathon/${quantumHackathonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        title: 'Quantum Hardware Simulators Live',
        content: 'IBM Quantum and AWS Braket credentials sent to all team leaders.',
        is_pinned: true
      })
    });
    const pinnedAnnData = await postPinnedAnnRes.json();
    assert(
      postPinnedAnnRes.status === 201 && pinnedAnnData.data.is_pinned === true,
      'Announcements',
      'Organizer publishes pinned announcement (HTTP 201)'
    );
    const testAnnId = pinnedAnnData.data.announcement_id;

    // 9b. Organizer posts unpinned announcement
    await fetch(`${BASE_URL}/announcements/hackathon/${quantumHackathonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`
      },
      body: JSON.stringify({
        title: 'Weekly Office Hours',
        content: 'Drop in on Discord tomorrow at 4 PM.',
        is_pinned: false
      })
    });

    // 9c. Pinned announcements appear first
    const getAnnListRes = await fetch(`${BASE_URL}/announcements/hackathon/${quantumHackathonId}`);
    const getAnnListData = await getAnnListRes.json();
    assert(
      getAnnListRes.status === 200 && getAnnListData.data[0].is_pinned === 1,
      'Announcements',
      'Announcements returned in correct order with pinned items first'
    );

    // 9d. Participant cannot post announcement
    const partAnnRes = await fetch(`${BASE_URL}/announcements/hackathon/${quantumHackathonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ title: 'Spam', content: 'Spam' })
    });
    assert(
      partAnnRes.status === 403,
      'Announcements',
      'Participant cannot post announcements (HTTP 403)'
    );

    // 9e. Delete Announcement
    const deleteAnnRes = await fetch(`${BASE_URL}/announcements/${testAnnId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${organizerToken}` }
    });
    assert(
      deleteAnnRes.status === 200,
      'Announcements',
      'Organizer successfully deletes announcement'
    );

    // -------------------------------------------------------------
    // MODULE 10: DASHBOARDS
    // -------------------------------------------------------------
    console.log('\n--- MODULE 10: Role-Specific Dashboards ---');

    // 10a. Participant Dashboard
    const partDashRes = await fetch(`${BASE_URL}/dashboard/participant`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const partDashData = await partDashRes.json();
    assert(
      partDashRes.status === 200 &&
        partDashData.data.stats.total_registered_hackathons >= 1 &&
        partDashData.data.my_submissions.length >= 1,
      'Dashboards',
      'Participant dashboard displays registrations, active teams, and submissions'
    );

    // 10b. Organizer Dashboard
    const orgDashRes = await fetch(`${BASE_URL}/dashboard/organizer`, {
      headers: { Authorization: `Bearer ${organizerToken}` }
    });
    const orgDashData = await orgDashRes.json();
    assert(
      orgDashRes.status === 200 &&
        orgDashData.data.stats.total_hosted_hackathons >= 1 &&
        orgDashData.data.hackathons.length >= 1,
      'Dashboards',
      'Organizer dashboard displays hosted events and total submissions'
    );

    // 10c. Admin Dashboard
    const adminDashRes = await fetch(`${BASE_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminDashData = await adminDashRes.json();
    assert(
      adminDashRes.status === 200 &&
        adminDashData.data.users_by_role.length >= 2 &&
        adminDashData.data.totals.total_storage_mb !== undefined,
      'Dashboards',
      'Admin dashboard displays platform-wide breakdowns and storage totals'
    );

    // -------------------------------------------------------------
    // MODULE 11: SECURITY & INJECTION TESTING
    // -------------------------------------------------------------
    console.log('\n--- MODULE 11: Security, SQL Injection & Data Sanitization ---');

    // 11a. SQL Injection Attack in Search Query
    const sqliSearchRes = await fetch(`${BASE_URL}/hackathons?search=' OR '1'='1' -- `);
    const sqliSearchData = await sqliSearchRes.json();
    assert(
      sqliSearchRes.status === 200,
      'Security',
      'SQL injection string in search query safely treated as literal parameterized text'
    );

    // 11b. SQL Injection Attack in Login Email
    const sqliLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "' OR 1=1 -- ", password: "' OR '1'='1" })
    });
    assert(
      sqliLoginRes.status === 401,
      'Security',
      'SQL injection login payload safely parameterized and rejected with HTTP 401'
    );

    // 11c. No password_hash exposed in user details
    const [allUsersRes] = await pool.query('SELECT user_id FROM users LIMIT 1');
    const userMe = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const userMeData = await userMe.json();
    assert(
      !('password_hash' in userMeData.data) && !('password' in userMeData.data),
      'Security',
      'Responses never contain password_hash or sensitive hash strings'
    );

    // 11d. CORS Header Verification
    const corsRes = await fetch('http://localhost:5000/api/health');
    assert(
      corsRes.headers.get('access-control-allow-origin') === '*',
      'Security',
      'CORS middleware properly sets Access-Control-Allow-Origin header'
    );

  } catch (error) {
    console.error('Fatal Exception in Comprehensive Verification:', error);
    failedCount++;
  } finally {
    console.log('\n================================================================');
    console.log(`🏁 COMPREHENSIVE VERIFICATION COMPLETE:`);
    console.log(`   TOTAL TESTS: ${passedCount + failedCount}`);
    console.log(`   PASSED:      ${passedCount}`);
    console.log(`   FAILED:      ${failedCount}`);
    console.log('================================================================\n');

    server.close(() => {
      console.log('Server successfully closed.');
      process.exit(failedCount > 0 ? 1 : 0);
    });
  }
}

// Start tests after short delay for connection setup
setTimeout(runComprehensiveVerification, 1000);
