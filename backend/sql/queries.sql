-- =============================================================
-- HackHub – Hackathon Management & Idea Sharing Platform
-- Academic DBMS Demonstration Queries (queries.sql)
-- =============================================================

USE hackhub_db;

-- -------------------------------------------------------------
-- Query 1: Basic SELECT, WHERE, and ORDER BY
-- List all active organizers ordered alphabetically by name
-- -------------------------------------------------------------
SELECT 
    user_id, 
    full_name, 
    email, 
    college_name, 
    phone
FROM users
WHERE role = 'ORGANIZER'
ORDER BY full_name ASC;

-- -------------------------------------------------------------
-- Query 2: Pattern Matching with LIKE
-- Search for hackathons mentioning 'AI', 'Smart', or 'Cyber' in title or description
-- -------------------------------------------------------------
SELECT 
    hackathon_id, 
    title, 
    status, 
    location, 
    registration_deadline
FROM hackathons
WHERE title LIKE '%AI%' OR title LIKE '%Cyber%' OR description LIKE '%intelligent%'
ORDER BY start_date ASC;

-- -------------------------------------------------------------
-- Query 3: Finding Upcoming Hackathons with Organizer Details
-- INNER JOIN between hackathons and users
-- -------------------------------------------------------------
SELECT 
    h.hackathon_id,
    h.title AS hackathon_title,
    h.start_date,
    h.end_date,
    h.location,
    u.full_name AS organizer_name,
    u.email AS organizer_email
FROM hackathons h
INNER JOIN users u ON h.organizer_id = u.user_id
WHERE h.status = 'UPCOMING'
ORDER BY h.start_date ASC;

-- -------------------------------------------------------------
-- Query 4: Multiple-Table JOIN (Hackathons + Tags M:N Mapping)
-- Retrieve each hackathon along with its comma-aggregated tags
-- -------------------------------------------------------------
SELECT 
    h.hackathon_id,
    h.title AS hackathon_title,
    h.status,
    GROUP_CONCAT(t.tag_name ORDER BY t.tag_name SEPARATOR ', ') AS tags
FROM hackathons h
INNER JOIN hackathon_tag_mappings htm ON h.hackathon_id = htm.hackathon_id
INNER JOIN hackathon_tags t ON htm.tag_id = t.tag_id
GROUP BY h.hackathon_id, h.title, h.status
ORDER BY h.hackathon_id ASC;

-- -------------------------------------------------------------
-- Query 5: Counting Participants per Hackathon (Aggregates & LEFT JOIN)
-- Demonstrates LEFT JOIN + COUNT()
-- -------------------------------------------------------------
SELECT 
    h.hackathon_id,
    h.title AS hackathon_title,
    h.status,
    COUNT(r.registration_id) AS total_registered_participants
FROM hackathons h
LEFT JOIN registrations r ON h.hackathon_id = r.hackathon_id
GROUP BY h.hackathon_id, h.title, h.status
ORDER BY total_registered_participants DESC;

-- -------------------------------------------------------------
-- Query 6: Finding the Most Popular Hackathons
-- Filter using HAVING clause for hackathons with >= 4 registrations
-- -------------------------------------------------------------
SELECT 
    h.hackathon_id,
    h.title AS hackathon_title,
    COUNT(r.registration_id) AS registration_count
FROM hackathons h
INNER JOIN registrations r ON h.hackathon_id = r.hackathon_id
GROUP BY h.hackathon_id, h.title
HAVING COUNT(r.registration_id) >= 4
ORDER BY registration_count DESC;

-- -------------------------------------------------------------
-- Query 7: Aggregate Statistics (MIN, MAX, AVG)
-- Compute minimum, maximum, and average team size limits across hackathons
-- -------------------------------------------------------------
SELECT 
    COUNT(*) AS total_hackathons,
    MIN(min_team_size) AS absolute_min_team_size,
    MAX(max_team_size) AS absolute_max_team_size,
    ROUND(AVG(max_team_size), 2) AS average_max_team_size
FROM hackathons;

-- -------------------------------------------------------------
-- Query 8: Finding Teams and Their Members
-- Multiple-Table JOIN (teams + team_members + users + hackathons)
-- -------------------------------------------------------------
SELECT 
    t.team_name,
    t.team_code,
    h.title AS hackathon_name,
    u.full_name AS member_name,
    u.email AS member_email,
    tm.role_in_team,
    tm.joined_at
FROM teams t
INNER JOIN hackathons h ON t.hackathon_id = h.hackathon_id
INNER JOIN team_members tm ON t.team_id = tm.team_id
INNER JOIN users u ON tm.user_id = u.user_id
ORDER BY t.team_name, tm.role_in_team DESC, u.full_name ASC;

-- -------------------------------------------------------------
-- Query 9: Finding Ideas Submitted for a Particular Hackathon (Hackathon ID = 1)
-- Demonstrating JOIN with teams and submitter
-- -------------------------------------------------------------
SELECT 
    pi.idea_id,
    pi.title AS idea_title,
    pi.domain_track,
    pi.tech_stack,
    pi.submission_status,
    COALESCE(t.team_name, 'Solo Submission') AS submitted_by_entity,
    u.full_name AS submitter_name,
    COUNT(sf.file_id) AS total_files_attached
FROM project_ideas pi
INNER JOIN users u ON pi.submitted_by_user_id = u.user_id
LEFT JOIN teams t ON pi.team_id = t.team_id
LEFT JOIN submission_files sf ON pi.idea_id = sf.idea_id
WHERE pi.hackathon_id = 1
GROUP BY pi.idea_id, pi.title, pi.domain_track, pi.tech_stack, pi.submission_status, t.team_name, u.full_name;

-- -------------------------------------------------------------
-- Query 10: Finding Public Ideas with Attachment Counts
-- Public discovery gallery query
-- -------------------------------------------------------------
SELECT 
    pi.idea_id,
    pi.title,
    pi.domain_track,
    pi.tech_stack,
    h.title AS hackathon_title,
    COALESCE(t.team_name, u.full_name) AS author_or_team,
    COUNT(sf.file_id) AS attachments_count
FROM project_ideas pi
INNER JOIN hackathons h ON pi.hackathon_id = h.hackathon_id
INNER JOIN users u ON pi.submitted_by_user_id = u.user_id
LEFT JOIN teams t ON pi.team_id = t.team_id
LEFT JOIN submission_files sf ON pi.idea_id = sf.idea_id
WHERE pi.is_public = TRUE
GROUP BY pi.idea_id, pi.title, pi.domain_track, pi.tech_stack, h.title, t.team_name, u.full_name
ORDER BY pi.idea_id ASC;

-- -------------------------------------------------------------
-- Query 11: Finding Teams That Have NOT Submitted an Idea
-- Using NOT EXISTS correlated subquery
-- -------------------------------------------------------------
SELECT 
    t.team_id,
    t.team_name,
    t.team_code,
    h.title AS hackathon_name,
    u.full_name AS leader_name
FROM teams t
INNER JOIN hackathons h ON t.hackathon_id = h.hackathon_id
INNER JOIN users u ON t.leader_id = u.user_id
WHERE NOT EXISTS (
    SELECT 1 
    FROM project_ideas pi 
    WHERE pi.team_id = t.team_id
);

-- -------------------------------------------------------------
-- Query 12: Finding Participants Registered for Multiple Hackathons
-- GROUP BY + HAVING COUNT(*) > 1
-- -------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.college_name,
    COUNT(r.hackathon_id) AS total_hackathons_registered
FROM users u
INNER JOIN registrations r ON u.user_id = r.user_id
GROUP BY u.user_id, u.full_name, u.email, u.college_name
HAVING COUNT(r.hackathon_id) > 1
ORDER BY total_hackathons_registered DESC, u.full_name ASC;

-- -------------------------------------------------------------
-- Query 13: Correlated Subquery with EXISTS
-- Find all organizers who have at least one hackathon with >= 4 registrations
-- -------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.college_name
FROM users u
WHERE u.role = 'ORGANIZER'
  AND EXISTS (
      SELECT 1 
      FROM hackathons h
      INNER JOIN registrations r ON h.hackathon_id = r.hackathon_id
      WHERE h.organizer_id = u.user_id
      GROUP BY h.hackathon_id
      HAVING COUNT(r.registration_id) >= 4
  );

-- -------------------------------------------------------------
-- Query 14: Scalar Subquery
-- Find hackathons that have more registrations than the average across all hackathons
-- -------------------------------------------------------------
SELECT 
    h.hackathon_id,
    h.title,
    COUNT(r.registration_id) AS registrations
FROM hackathons h
LEFT JOIN registrations r ON h.hackathon_id = r.hackathon_id
GROUP BY h.hackathon_id, h.title
HAVING COUNT(r.registration_id) > (
    SELECT AVG(reg_count)
    FROM (
        SELECT COUNT(registration_id) AS reg_count
        FROM hackathons h2
        LEFT JOIN registrations r2 ON h2.hackathon_id = r2.hackathon_id
        GROUP BY h2.hackathon_id
    ) AS sub
)
ORDER BY registrations DESC;
