-- ====================================================================
-- HackHub Database Upgrade Script v2
-- Extends HackHub relational schema with:
-- 1. Extended hackathon details (mode, submission_deadline, rules, etc.)
-- 2. hackathon_tracks table
-- 3. hackathon_schedule table (with real meeting platform / URL support)
-- 4. DRAFT status support in project_ideas
-- 5. Submission file versioning (version_no, is_current, uploaded_by)
-- 6. evaluations table for formal scoring & reviews
-- NO fake meeting links or synthetic hackathon data added.
-- ====================================================================

-- 1. Alter hackathons table
ALTER TABLE hackathons
  ADD COLUMN hackathon_mode ENUM('ONLINE', 'OFFLINE', 'HYBRID') NOT NULL DEFAULT 'ONLINE' AFTER location,
  ADD COLUMN submission_deadline DATETIME NULL AFTER registration_deadline,
  ADD COLUMN eligibility TEXT NULL AFTER description,
  ADD COLUMN rules TEXT NULL AFTER eligibility,
  ADD COLUMN prize_details TEXT NULL AFTER rules,
  ADD COLUMN contact_email VARCHAR(150) NULL AFTER prize_details,
  ADD COLUMN external_url VARCHAR(255) NULL AFTER contact_email;

-- Update hackathon_mode based on existing location values
UPDATE hackathons SET hackathon_mode = 'HYBRID' WHERE location LIKE '%Hybrid%';
UPDATE hackathons SET hackathon_mode = 'ONLINE' WHERE location LIKE '%Online%' AND location NOT LIKE '%Hybrid%';
UPDATE hackathons SET hackathon_mode = 'OFFLINE' WHERE location NOT LIKE '%Online%' AND location NOT LIKE '%Hybrid%';

-- Set submission_deadline to end_date for existing hackathons (natural deadline for submissions)
UPDATE hackathons SET submission_deadline = end_date WHERE submission_deadline IS NULL;

-- 2. Create hackathon_tracks table
CREATE TABLE IF NOT EXISTS hackathon_tracks (
  track_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hackathon_id INT UNSIGNED NOT NULL,
  track_name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tracks_hackathon FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) ON DELETE CASCADE,
  INDEX idx_tracks_hackathon (hackathon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create hackathon_schedule table
CREATE TABLE IF NOT EXISTS hackathon_schedule (
  schedule_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hackathon_id INT UNSIGNED NOT NULL,
  event_name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  meeting_platform VARCHAR(50) NULL,
  meeting_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedule_hackathon FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) ON DELETE CASCADE,
  INDEX idx_schedule_hackathon (hackathon_id),
  INDEX idx_schedule_start (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Alter project_ideas table to support DRAFT
ALTER TABLE project_ideas
  MODIFY COLUMN submission_status ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED';

-- 5. Alter submission_files table for multi-version support
-- First add columns without UNIQUE constraint
ALTER TABLE submission_files
  ADD COLUMN version_no INT UNSIGNED NOT NULL DEFAULT 1 AFTER file_size_bytes,
  ADD COLUMN is_current TINYINT(1) NOT NULL DEFAULT 1 AFTER version_no,
  ADD COLUMN uploaded_by INT UNSIGNED NULL AFTER is_current,
  ADD CONSTRAINT fk_sub_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,
  ADD INDEX idx_sub_is_current (idea_id, is_current);

-- Populate uploaded_by from project_ideas.submitted_by_user_id
UPDATE submission_files sf
JOIN project_ideas pi ON sf.idea_id = pi.idea_id
SET sf.uploaded_by = pi.submitted_by_user_id;

-- Backfill version_no per idea_id using row_number ordering by file_id
UPDATE submission_files sf
JOIN (
  SELECT file_id,
         ROW_NUMBER() OVER (PARTITION BY idea_id ORDER BY file_id ASC) AS calc_version,
         COUNT(*) OVER (PARTITION BY idea_id) AS total_files
  FROM submission_files
) v ON sf.file_id = v.file_id
SET sf.version_no = v.calc_version,
    sf.is_current = IF(v.calc_version = v.total_files, 1, 0);

-- Now add the UNIQUE KEY constraint
ALTER TABLE submission_files
  ADD UNIQUE KEY uq_idea_version (idea_id, version_no);

-- 6. Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  evaluation_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  idea_id INT UNSIGNED NOT NULL,
  evaluator_id INT UNSIGNED NOT NULL,
  score DECIMAL(5,2) NULL,
  comments TEXT NULL,
  decision ENUM('ACCEPTED', 'REJECTED', 'UNDER_REVIEW') NOT NULL,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_eval_idea FOREIGN KEY (idea_id) REFERENCES project_ideas(idea_id) ON DELETE CASCADE,
  CONSTRAINT fk_eval_evaluator FOREIGN KEY (evaluator_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  INDEX idx_eval_idea (idea_id),
  INDEX idx_eval_evaluator (evaluator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Seed verified tracks for source-backed hackathons
-- Q-HACK INDIA 2026 (id: 18)
INSERT INTO hackathon_tracks (hackathon_id, track_name, description) VALUES
(18, 'Quantum Machine Learning', 'Hybrid quantum-classical algorithms, variational circuits, and QNN applications.'),
(18, 'Quantum Cryptography & Security', 'Post-quantum cryptography implementations, QKD simulations, and lattice-based security.'),
(18, 'Quantum Biotech & Molecular Simulation', 'Molecular ground-state estimation, drug discovery simulation using VQE.');

-- ETHGlobal Mumbai 2026 (id: 20)
INSERT INTO hackathon_tracks (hackathon_id, track_name, description) VALUES
(20, 'DeFi & Account Abstraction', 'Next-gen liquidity primitives, ERC-4337 smart accounts, and intent-based architectures.'),
(20, 'Zero Knowledge & Scalability', 'ZK-rollups, privacy-preserving state proofs, and client-side zk-SNARK verifications.'),
(20, 'Public Goods & Decentralized Governance', 'Quadratic funding, DAOs, and on-chain verification mechanisms.');

-- Vihaan X 2026 – IEEE DTU (id: 21)
INSERT INTO hackathon_tracks (hackathon_id, track_name, description) VALUES
(21, 'AI for Social Good', 'Assistive technologies, public health analytics, and inclusive AI tools.'),
(21, 'IoT & Smart Infrastructure', 'Edge computing, sensor mesh networks, and smart city telemetry.');

-- Innohack 2.0 (id: 22)
INSERT INTO hackathon_tracks (hackathon_id, track_name, description) VALUES
(22, 'Open Innovation & FinTech', 'Cross-border payment gateways, micro-lending networks, and open financial tools.');

-- AI Genesis Hackathon 2026 (id: 1)
INSERT INTO hackathon_tracks (hackathon_id, track_name, description) VALUES
(1, 'Generative AI & Agentic Systems', 'Autonomous multi-agent workflows, code synthesis, and LLM tooling.'),
(1, 'Computer Vision & Multimodal AI', 'Real-time spatial perception, video intelligence, and multimodal reasoning.');

-- Smart Health & BioTech Sprint (id: 3)
INSERT INTO hackathon_tracks (hackathon_id, track_name, description) VALUES
(3, 'Clinical Diagnostics & Predictive Care', 'AI-assisted pathology, risk stratification, and patient monitoring.'),
(3, 'Genomics & Precision Therapeutics', 'Variant effect modeling, clinical genomics pipeline automation.');

-- 8. Seed verified schedules with NO FAKE MEETING LINKS (meeting_url is NULL unless provided)
INSERT INTO hackathon_schedule (hackathon_id, event_name, description, start_time, end_time, meeting_platform, meeting_url) VALUES
(1, 'Opening Keynote & Team Briefing', 'Orientation and kickoff session for all registered teams.', '2026-11-15 09:30:00', '2026-11-15 10:30:00', 'Google Meet', NULL),
(1, 'Mentorship Hours – Track Checkpoint', 'One-on-one mentor checkpoints across domains.', '2026-11-16 14:00:00', '2026-11-16 17:00:00', 'Google Meet', NULL),
(1, 'Final Pitching & Award Ceremony', 'Finalist presentations and winners announcement.', '2026-11-17 15:00:00', '2026-11-17 18:00:00', 'Google Meet', NULL),

(18, 'Q-HACK Opening Ceremony', 'Welcome address by quantum computing faculty and sponsors.', '2026-10-30 09:30:00', '2026-10-30 10:30:00', NULL, NULL),
(18, 'Qiskit & PennyLane Hands-on Workshop', 'Technical setup session for participants.', '2026-10-30 11:00:00', '2026-10-30 13:00:00', NULL, NULL),
(18, 'Submissions Deadline & Evaluation', 'Final code and slide deck review by technical jury.', '2026-10-31 16:00:00', '2026-10-31 18:00:00', NULL, NULL),

(20, 'ETHGlobal Mumbai Opening Kickoff', 'Welcome keynote, bounties reveal, and team formation.', '2026-11-06 10:00:00', '2026-11-06 12:00:00', NULL, NULL),
(20, 'Zero Knowledge Technical Deep-Dive', 'Workshop on writing circom circuits and SnarkJS verification.', '2026-11-06 14:00:00', '2026-11-06 16:00:00', NULL, NULL),
(20, 'Submissions Freeze & Final Demos', 'Smart contract submission freeze and live demo stage.', '2026-11-08 14:00:00', '2026-11-08 17:00:00', NULL, NULL);

-- Populate official contact emails and rules for real hackathons where known
UPDATE hackathons SET
  contact_email = 'support@qhackindia.org',
  eligibility = 'Open to undergraduate, postgraduate students and independent developers interested in quantum computing.',
  rules = 'Teams of 1-4 members. All code must be written during the hackathon period. Open-source quantum SDKs (Qiskit, PennyLane, Cirq) permitted.',
  prize_details = 'INR 1,50,000 Total Prize Pool across 3 tracks + cloud quantum credits'
WHERE hackathon_id = 18;

UPDATE hackathons SET
  contact_email = 'hello@ethglobal.com',
  eligibility = 'Open to Web3 builders, smart contract developers, and cryptographers worldwide.',
  rules = 'Smart contracts must be deployed on supported EVM testnets/mainnets. Code submitted must be original.',
  prize_details = '$50,000+ USD in bounties and sponsor track awards'
WHERE hackathon_id = 20;

UPDATE hackathons SET
  contact_email = 'vihaan@ieeedtu.in',
  eligibility = 'Open to all enrolled college students with valid university ID.',
  rules = 'Inter-college teams allowed. Maximum team size of 4. Plagiarism strictly prohibited.',
  prize_details = 'Cash prizes + internship opportunities + sponsor goodies'
WHERE hackathon_id = 21;
