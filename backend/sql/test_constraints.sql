-- =============================================================
-- HackHub – Hackathon Management & Idea Sharing Platform
-- Constraint Verification Tests (test_constraints.sql)
-- Each test is designed to trigger and demonstrate database-level rejection.
-- =============================================================

USE hackhub_db;

-- -------------------------------------------------------------
-- TEST 1: Duplicate Registration Test
-- Expected Error: ER_DUP_ENTRY (Duplicate entry for key 'uq_user_hackathon_reg')
-- -------------------------------------------------------------
SELECT '>>> RUNNING TEST 1: Duplicate Registration (User 5 in Hackathon 1)' AS test_name;
-- User 5 is already registered in Hackathon 1 in seed data
INSERT INTO registrations (hackathon_id, user_id, status)
VALUES (1, 5, 'REGISTERED');

-- -------------------------------------------------------------
-- TEST 2: Duplicate Team Membership Test
-- Expected Error: ER_DUP_ENTRY (Duplicate entry for key 'uq_team_member')
-- -------------------------------------------------------------
SELECT '>>> RUNNING TEST 2: Duplicate Team Membership (User 5 in Team 1)' AS test_name;
-- User 5 is already leader of Team 1
INSERT INTO team_members (team_id, user_id, role_in_team)
VALUES (1, 5, 'MEMBER');

-- -------------------------------------------------------------
-- TEST 3: Invalid Team Size CHECK Constraint Test
-- Expected Error: ER_CHECK_CONSTRAINT_VIOLATED ('chk_team_sizes' is violated)
-- -------------------------------------------------------------
SELECT '>>> RUNNING TEST 3: Invalid Team Sizes (min_team_size > max_team_size)' AS test_name;
INSERT INTO hackathons (organizer_id, title, description, start_date, end_date, registration_deadline, min_team_size, max_team_size, status)
VALUES (2, 'Invalid Hackathon Sizes', 'Testing check constraint', '2026-11-01 09:00:00', '2026-11-03 18:00:00', '2026-10-25 23:59:59', 5, 2, 'UPCOMING');

-- -------------------------------------------------------------
-- TEST 4: Invalid Date Range CHECK Constraint Test
-- Expected Error: ER_CHECK_CONSTRAINT_VIOLATED ('chk_dates' is violated)
-- -------------------------------------------------------------
SELECT '>>> RUNNING TEST 4: Invalid Date Range (end_date < start_date)' AS test_name;
INSERT INTO hackathons (organizer_id, title, description, start_date, end_date, registration_deadline, min_team_size, max_team_size, status)
VALUES (2, 'Invalid Hackathon Dates', 'Testing check constraint', '2026-11-10 09:00:00', '2026-11-05 18:00:00', '2026-11-02 23:59:59', 1, 4, 'UPCOMING');

-- -------------------------------------------------------------
-- TEST 5: Foreign Key Violation Test
-- Expected Error: ER_NO_REFERENCED_ROW_2 (Cannot add or update child row: foreign key constraint fails)
-- -------------------------------------------------------------
SELECT '>>> RUNNING TEST 5: Foreign Key Violation (Non-existent user 99999)' AS test_name;
INSERT INTO registrations (hackathon_id, user_id, status)
VALUES (1, 99999, 'REGISTERED');

-- -------------------------------------------------------------
-- TEST 6: Duplicate Team Project Idea Submission Test
-- Expected Error: ER_DUP_ENTRY (Duplicate entry for key 'uq_hackathon_team_idea')
-- -------------------------------------------------------------
SELECT '>>> RUNNING TEST 6: Duplicate Team Submission (Team 1 submitting a 2nd idea to Hackathon 1)' AS test_name;
-- Team 1 already submitted Idea 1 for Hackathon 1
INSERT INTO project_ideas (hackathon_id, submitted_by_user_id, team_id, title, abstract, is_public, submission_status)
VALUES (1, 5, 1, 'Duplicate Team Project', 'Attempting second submission for the same team in Hackathon 1', TRUE, 'SUBMITTED');
