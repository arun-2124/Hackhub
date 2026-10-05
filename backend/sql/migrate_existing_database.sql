-- =============================================================
-- HackHub Database: Migration & Data Merge Script
-- File: backend/sql/migrate_existing_database.sql
-- Merges foundational seed data, real hackathons, and authentic
-- project ideas while purging temporary test artifacts.
-- =============================================================

USE hackhub_db;

SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- 1. PURGE TEMPORARY TEST ARTIFACTS
-- Remove test-generated hackathons, ideas, teams, and registrations
-- -------------------------------------------------------------

-- 1.1 Remove test project ideas created by test suites (matching timestamp pattern or test titles)
DELETE sf FROM submission_files sf
JOIN project_ideas pi ON sf.idea_id = pi.idea_id
WHERE pi.title REGEXP '17912[0-9]{8}' 
   OR pi.title LIKE 'Test Web3 Submission with PDF%'
   OR pi.title IN ('KubeGuard – Automated Cluster Security Scanner', 'Q-Shield – Advanced Post-Quantum Cryptography Engine');

DELETE FROM project_ideas 
WHERE title REGEXP '17912[0-9]{8}'
   OR title LIKE 'Test Web3 Submission with PDF%'
   OR title IN ('KubeGuard – Automated Cluster Security Scanner', 'Q-Shield – Advanced Post-Quantum Cryptography Engine');

-- 1.2 Remove test hackathons created during test runs (timestamps or test titles)
DELETE htm FROM hackathon_tag_mappings htm
JOIN hackathons h ON htm.hackathon_id = h.hackathon_id
WHERE h.title REGEXP '17912[0-9]{8}'
   OR h.title IN ('Cloud Native & DevOps Sprint 2026', 'Quantum Computing & Algorithms Hackathon 2026', 'innohack', 'dsf');

DELETE a FROM announcements a
JOIN hackathons h ON a.hackathon_id = h.hackathon_id
WHERE h.title REGEXP '17912[0-9]{8}'
   OR h.title IN ('Cloud Native & DevOps Sprint 2026', 'Quantum Computing & Algorithms Hackathon 2026', 'innohack', 'dsf');

DELETE tm FROM team_members tm
JOIN teams t ON tm.team_id = t.team_id
JOIN hackathons h ON t.hackathon_id = h.hackathon_id
WHERE h.title REGEXP '17912[0-9]{8}'
   OR h.title IN ('Cloud Native & DevOps Sprint 2026', 'Quantum Computing & Algorithms Hackathon 2026', 'innohack', 'dsf');

DELETE t FROM teams t
JOIN hackathons h ON t.hackathon_id = h.hackathon_id
WHERE h.title REGEXP '17912[0-9]{8}'
   OR h.title IN ('Cloud Native & DevOps Sprint 2026', 'Quantum Computing & Algorithms Hackathon 2026', 'innohack', 'dsf');

DELETE r FROM registrations r
JOIN hackathons h ON r.hackathon_id = h.hackathon_id
WHERE h.title REGEXP '17912[0-9]{8}'
   OR h.title IN ('Cloud Native & DevOps Sprint 2026', 'Quantum Computing & Algorithms Hackathon 2026', 'innohack', 'dsf');

DELETE FROM hackathons 
WHERE title REGEXP '17912[0-9]{8}'
   OR title IN ('Cloud Native & DevOps Sprint 2026', 'Quantum Computing & Algorithms Hackathon 2026', 'innohack', 'dsf');

-- 1.3 Remove temporary test teams that have no ideas and are from test runs
DELETE tm FROM team_members tm
JOIN teams t ON tm.team_id = t.team_id
WHERE t.team_name REGEXP '17912[0-9]{8}' OR t.team_name = 'Test Team 99';

DELETE FROM teams 
WHERE team_name REGEXP '17912[0-9]{8}' OR team_name = 'Test Team 99';

-- 1.4 Remove temporary test users (user_id > 16)
DELETE FROM registrations WHERE user_id > 16;
DELETE FROM users WHERE user_id > 16;

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------
-- 2. ENSURE FOUNDATIONAL HACKATHON TAGS EXIST
-- -------------------------------------------------------------
INSERT IGNORE INTO hackathon_tags (tag_id, tag_name) VALUES
(1, 'AI/ML'),
(2, 'Web3 & Blockchain'),
(3, 'FinTech'),
(4, 'HealthTech'),
(5, 'CyberSecurity'),
(6, 'IoT & Robotics'),
(7, 'EdTech'),
(8, 'CleanTech & Energy'),
(9, 'Cloud & DevOps'),
(10, 'Mobile Apps'),
(11, 'Quantum Computing'),
(12, 'Open Innovation');

-- -------------------------------------------------------------
-- 3. ENSURE FOUNDATIONAL ORGANIZERS & USERS EXIST
-- -------------------------------------------------------------
INSERT INTO users (user_id, full_name, email, password_hash, role, college_name, phone) VALUES
(1, 'Arjun Admin', 'admin@hackhub.com', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'ADMIN', 'HackHub Central Administration', '+91 9800000001'),
(2, 'Dr. Ramesh Sharma', 'ramesh.sharma@mit.edu', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'ORGANIZER', 'MIT Department of Computer Science', '+91 9876543210'),
(3, 'Prof. Priya Iyer', 'priya.iyer@iitb.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'ORGANIZER', 'IIT Bombay Innovation & Entrepreneurship Cell', '+91 9876543211'),
(4, 'Vikram Malhotra', 'vikram@techhub.org', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'ORGANIZER', 'National Coding Consortium', '+91 9876543212'),
(5, 'Aarav Patel', 'aarav.patel@student.mit.edu', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'MIT Pune', '+91 9123456701'),
(6, 'Sneha Reddy', 'sneha.reddy@student.iitb.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'IIT Bombay', '+91 9123456702'),
(7, 'Rohan Verma', 'rohan.v@vit.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'VIT Vellore', '+91 9123456703'),
(8, 'Ananya Sen', 'ananya.sen@bits.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'BITS Pilani', '+91 9123456704'),
(9, 'Karan Joshi', 'karan.j@dtu.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'Delhi Technological University', '+91 9123456705'),
(10, 'Diya Nair', 'diya.nair@nitc.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'NIT Calicut', '+91 9123456706'),
(11, 'Siddharth Rao', 'sid.rao@iiit.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'IIIT Hyderabad', '+91 9123456707'),
(12, 'Meera Krishnan', 'meera.k@pes.edu', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'PES University Bengaluru', '+91 9123456708'),
(13, 'Kabir Das', 'kabir.das@srmist.edu.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'SRM University Chennai', '+91 9123456709'),
(14, 'Tanvi Hegde', 'tanvi.h@manipal.edu', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'Manipal Institute of Technology', '+91 9123456710')
ON DUPLICATE KEY UPDATE 
  full_name = VALUES(full_name),
  college_name = VALUES(college_name),
  phone = VALUES(phone);

-- Also add sample users Arun and Rahul from Hackathon Database Design Summary
INSERT INTO users (user_id, full_name, email, password_hash, role, college_name, phone) VALUES
(15, 'Arun Balaji', 'arun@gmail.com', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'VIT Vellore', '+91 9876500001'),
(16, 'Rahul Sharma', 'rahul@gmail.com', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'VIT Vellore', '+91 9876500002')
ON DUPLICATE KEY UPDATE 
  full_name = VALUES(full_name);

-- -------------------------------------------------------------
-- 4. MERGE CANONICAL HACKATHONS
-- Foundational 6 + 4 Real Indian Events + Innohack 2.0
-- -------------------------------------------------------------
INSERT INTO hackathons (hackathon_id, organizer_id, title, description, banner_image, start_date, end_date, registration_deadline, min_team_size, max_team_size, status, location) VALUES
(1, 2, 'AI Genesis Hackathon 2026', 'Build next-generation generative AI and intelligent agent applications solving real-world challenges.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', '2026-11-15 09:00:00', '2026-11-17 18:00:00', '2026-11-10 23:59:59', 2, 4, 'UPCOMING', 'Hybrid - MIT Campus & Online'),
(2, 3, 'Web3 & FinTech Revolution', 'Decentralized finance, smart contract security, cross-border payments, and Web3 identity protocols.', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80', '2026-12-01 10:00:00', '2026-12-03 20:00:00', '2026-11-25 23:59:59', 1, 3, 'UPCOMING', 'Online (Discord & GitHub)'),
(3, 2, 'Smart Health & BioTech Sprint', 'Leverage predictive AI, wearable sensors, and telemedicine to transform preventive digital healthcare.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', '2026-10-01 09:00:00', '2026-10-10 18:00:00', '2026-09-28 23:59:59', 2, 4, 'ONGOING', 'IIT Bombay Research Labs'),
(4, 4, 'CyberShield National Hackathon', 'Offensive and defensive security tooling, zero-trust architectures, and automated vulnerability detection.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', '2026-10-03 08:00:00', '2026-10-08 22:00:00', '2026-09-30 23:59:59', 1, 4, 'ONGOING', 'Online'),
(5, 3, 'GreenTech Clean Energy Challenge', 'Develop IoT and AI solutions for smart grids, carbon tracking, and renewable energy distribution.', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80', '2026-08-10 09:00:00', '2026-08-12 18:00:00', '2026-08-05 23:59:59', 2, 5, 'COMPLETED', 'Bengaluru Innovation Center'),
(6, 4, 'EdTech Odyssey 2026', 'Reinvent digital learning, accessibility tools, and interactive STEM education platforms.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', '2026-12-15 09:00:00', '2026-12-17 18:00:00', '2026-12-10 23:59:59', 1, 3, 'UPCOMING', 'Online'),
(18, 3, 'Q-HACK INDIA 2026', 'National-level quantum computing hackathon hosted by QuantumRIT in collaboration with industry partners. Features 4 specialized tracks: Quantum Biotech & Chemistry, Quantum Security & Cryptography, Quantum AI & Software, and Open Quantum Innovation. Finalists compete in a 2-day in-person hackathon in Bengaluru.\n\n[Source: Devfolio | https://devfolio.co/hackathons/q-hack-india-2026]', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80', '2026-10-30 09:00:00', '2026-10-31 18:00:00', '2026-10-20 23:59:59', 2, 4, 'UPCOMING', 'Ramaiah Institute of Technology, Bengaluru'),
(19, 2, 'HackShift 2026 – IIIT Delhi', 'A flagship two-stage hackathon organized by the Entrepreneurship Cell at IIIT Delhi under the theme "Cmd, Shift, Create". Round 1 requires an online proposal slide-deck submission on campus engagement or event tooling; shortlisted teams qualify for the 24-hour on-campus hackathon at IIIT Delhi.\n\n[Source: Unstop | https://unstop.com/hackathons/hackshift-iiit-delhi]', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', '2026-10-17 09:00:00', '2026-10-18 18:00:00', '2026-10-15 23:59:59', 1, 4, 'UPCOMING', 'IIIT Delhi Campus, New Delhi'),
(20, 3, 'ETHGlobal Mumbai 2026', 'Leading Ethereum ecosystem hackathon bringing global developers to Mumbai. 36 hours of non-stop building focusing on decentralized finance, smart contract security, zero-knowledge proofs, and cross-chain interoperability with mentorship from core Ethereum protocol researchers.\n\n[Source: ETHGlobal | https://ethglobal.com/events/mumbai]', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80', '2026-11-06 10:00:00', '2026-11-08 17:00:00', '2026-11-01 23:59:59', 1, 5, 'UPCOMING', 'Jio World Convention Centre, Mumbai'),
(21, 4, 'Vihaan X 2026 – IEEE DTU', 'Annual flagship national hackathon hosted by IEEE Delhi Technological University (DTU). Features 24-hour intense sprints in Artificial Intelligence, HealthTech, Smart City IoT, and Sustainable Tech with tracks judged by leading engineers and faculty.\n\n[Source: Unstop | https://unstop.com/hackathons/vihaan-x-dtu]', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', '2026-11-14 09:00:00', '2026-11-15 18:00:00', '2026-11-09 23:59:59', 1, 4, 'UPCOMING', 'Delhi Technological University (DTU), New Delhi'),
(22, 2, 'Innohack 2.0 – National Innovation Sprint', 'Premier national innovation hackathon hosted at VIT Vellore. Bringing multidisciplinary student innovators together across HealthTech, AgriTech, and Digital Systems with industry mentorship and prototype incubation.\n\n[Source: VIT Vellore | https://vit.ac.in/events/innohack2026]', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', '2026-11-20 09:00:00', '2026-11-22 18:00:00', '2026-11-12 23:59:59', 2, 4, 'UPCOMING', 'VIT Vellore Campus & Online')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  location = VALUES(location),
  status = VALUES(status);

-- -------------------------------------------------------------
-- 5. ENSURE HACKATHON-TAG MAPPINGS
-- -------------------------------------------------------------
INSERT IGNORE INTO hackathon_tag_mappings (hackathon_id, tag_id) VALUES
-- H1: AI Genesis
(1, 1), (1, 9), (1, 6),
-- H2: Web3
(2, 2), (2, 3), (2, 5),
-- H3: Smart Health
(3, 4), (3, 1), (3, 6),
-- H4: CyberShield
(4, 5), (4, 9),
-- H5: GreenTech
(5, 8), (5, 6),
-- H6: EdTech
(6, 7), (6, 1), (6, 10),
-- H18: Q-HACK INDIA 2026
(18, 11), (18, 1), (18, 5), (18, 4),
-- H19: HackShift 2026
(19, 10), (19, 9), (19, 12),
-- H20: ETHGlobal Mumbai 2026
(20, 2), (20, 3), (20, 5), (20, 12),
-- H21: Vihaan X 2026
(21, 1), (21, 6), (21, 4), (21, 12),
-- H22: Innohack 2.0
(22, 4), (22, 1), (22, 6), (22, 12);

-- -------------------------------------------------------------
-- 6. ENSURE CANONICAL REGISTRATIONS
-- -------------------------------------------------------------
INSERT IGNORE INTO registrations (registration_id, hackathon_id, user_id, status) VALUES
-- H1: AI Genesis
(1, 1, 5, 'CONFIRMED'),
(2, 1, 6, 'CONFIRMED'),
(3, 1, 7, 'CONFIRMED'),
(4, 1, 8, 'CONFIRMED'),
-- H2: Web3
(5, 2, 5, 'CONFIRMED'),
(6, 2, 8, 'CONFIRMED'),
(7, 2, 9, 'CONFIRMED'),
(8, 2, 10, 'CONFIRMED'),
-- H3: Smart Health
(9, 3, 5, 'CONFIRMED'),
(10, 3, 6, 'CONFIRMED'),
(11, 3, 9, 'CONFIRMED'),
(12, 3, 11, 'CONFIRMED'),
(13, 3, 12, 'CONFIRMED'),
-- H4: CyberShield
(14, 4, 7, 'CONFIRMED'),
(15, 4, 8, 'CONFIRMED'),
(16, 4, 10, 'CONFIRMED'),
(17, 4, 11, 'CONFIRMED'),
(18, 4, 13, 'CONFIRMED'),
-- H5: GreenTech
(19, 5, 12, 'CONFIRMED'),
(20, 5, 14, 'CONFIRMED'),
(21, 5, 16, 'CONFIRMED'),
-- H6: EdTech
(22, 6, 14, 'CONFIRMED'),
(23, 6, 15, 'CONFIRMED'),
-- H18: Q-HACK INDIA 2026
(24, 18, 5, 'CONFIRMED'),
(25, 18, 6, 'CONFIRMED'),
(26, 18, 15, 'CONFIRMED'),
-- H22: Innohack 2.0
(27, 22, 15, 'CONFIRMED'),
(28, 22, 16, 'CONFIRMED'),
(29, 22, 7, 'CONFIRMED');

-- -------------------------------------------------------------
-- 7. ENSURE CANONICAL TEAMS & TEAM MEMBERS
-- -------------------------------------------------------------
INSERT INTO teams (team_id, hackathon_id, leader_id, team_name, team_code) VALUES
(1, 1, 5, 'NeuralKnights', 'NK-AI2026'),
(2, 2, 8, 'BlockBusters', 'BB-W32026'),
(3, 3, 6, 'MediPulse', 'MP-HT2026'),
(4, 4, 7, 'CyberSentinels', 'CS-SEC2026'),
(5, 18, 5, 'QuantumPioneers', 'QP-QH2026'),
(6, 22, 15, 'InnoForge', 'IF-IH2026')
ON DUPLICATE KEY UPDATE
  team_name = VALUES(team_name),
  team_code = VALUES(team_code);

INSERT IGNORE INTO team_members (team_id, user_id, role_in_team) VALUES
-- Team 1: NeuralKnights (H1)
(1, 5, 'LEADER'),
(1, 6, 'MEMBER'),
(1, 7, 'MEMBER'),
-- Team 2: BlockBusters (H2)
(2, 8, 'LEADER'),
(2, 9, 'MEMBER'),
-- Team 3: MediPulse (H3)
(3, 6, 'LEADER'),
(3, 11, 'MEMBER'),
(3, 12, 'MEMBER'),
-- Team 4: CyberSentinels (H4)
(4, 7, 'LEADER'),
(4, 10, 'MEMBER'),
-- Team 5: QuantumPioneers (H18)
(5, 5, 'LEADER'),
(5, 6, 'MEMBER'),
-- Team 6: InnoForge (H22)
(6, 15, 'LEADER'),
(6, 16, 'MEMBER');

-- -------------------------------------------------------------
-- 8. ENSURE MEANINGFUL CANONICAL PROJECT IDEAS
-- -------------------------------------------------------------
INSERT INTO project_ideas (idea_id, hackathon_id, submitted_by_user_id, team_id, title, abstract, domain_track, tech_stack, demo_url, repo_url, is_public, submission_status) VALUES
-- 1. Team Submission: NeuroScribe
(1, 1, 5, 1, 'NeuroScribe – Automated Clinical Notes via Whisper & LLMs', 'NeuroScribe uses fine-tuned speech recognition and LLMs to transcribe doctor-patient conversations into structured EHR notes in real time, reducing physician documentation burnout by 70%.', 'AI/ML', 'Python, PyTorch, Whisper, React, FastAPI', 'https://neuroscribe-demo.vercel.app', 'https://github.com/aaravpatel/neuroscribe', TRUE, 'ACCEPTED'),

-- 2. Team Submission: DecentraPay
(2, 2, 8, 2, 'DecentraPay – Cross-Border Micropayments on Layer-2', 'A high-throughput, low-fee remittance protocol utilizing zero-knowledge rollups and decentralized liquidity pools for instant cross-border worker remittances.', 'FinTech', 'Solidity, Polygon zkEVM, Next.js, Node.js', 'https://decentrapay.finance', 'https://github.com/ananyasen/decentrapay', TRUE, 'UNDER_REVIEW'),

-- 3. Team Submission: CardioVision
(3, 3, 6, 3, 'CardioVision – Real-Time Arrhythmia Detection with Edge IoT', 'An ultra-low-power wearable ECG patch paired with on-device quantized neural networks for real-time arrhythmia prediction and automated emergency ambulance alerts.', 'HealthTech', 'TensorFlow Lite, C++, Flutter, Raspberry Pi Pico', NULL, 'https://github.com/sneha-reddy/cardiovision', FALSE, 'SUBMITTED'),

-- 4. Solo Submission: PhishGuard
(4, 4, 13, NULL, 'PhishGuard – Zero-Day Email Threat Engine', 'A behavioral analysis engine that detects sophisticated spear-phishing and business email compromise by evaluating syntactic intent and domain entropy.', 'CyberSecurity', 'Python, Rust, Scikit-learn, Docker', 'https://phishguard.security.io', 'https://github.com/kabirdas/phishguard', TRUE, 'SUBMITTED'),

-- 5. Solo Submission: SolarSync
(5, 5, 14, NULL, 'SolarSync – Peer-to-Peer Solar Surplus Energy Exchange', 'A localized energy trading platform that allows households with solar rooftop panels to trade excess kilowatt-hours with neighbors over an automated smart microgrid.', 'CleanTech & Energy', 'React, Express, ESP32, MQTT, MySQL', 'https://solarsync.energy', 'https://github.com/tanvihegde/solarsync', TRUE, 'ACCEPTED'),

-- 6. Solo Submission: CampusLearn
(6, 6, 14, NULL, 'CampusLearn – Collaborative Peer Learning & Knowledge Graph', 'An adaptive study platform that clusters lecture concepts into interactive knowledge graphs and pairs students for targeted peer tutoring based on syllabus weaknesses.', 'EdTech', 'React, Node.js, WebSockets, Neo4j, MySQL', NULL, 'https://github.com/tanvihegde/campuslearn', FALSE, 'UNDER_REVIEW'),

-- 7. Solo Submission: BioSentinel
(7, 3, 9, NULL, 'BioSentinel – Non-Invasive Early Sepsis Warning Monitor', 'Continuous vital signs monitoring and multivariate regression alerting clinical ICU teams 6 hours prior to overt septic shock manifestation.', 'HealthTech', 'Python, XGBoost, Docker, Flask', NULL, 'https://github.com/karanjoshi/biosentinel', TRUE, 'REJECTED'),

-- 8. PRISM-Rx: Drug Repurposing Intelligence Platform (HealthTech / AI/ML)
(8, 18, 5, 5, 'PRISM-Rx – Evidence-Grounded Drug Repurposing Intelligence Platform', 'A biomedical intelligence engine that looks across clinical studies, drug-target databases, and literature to discover, prioritize, and explain evidence-grounded therapeutic repurposing signals.', 'HealthTech', 'Python, FastAPI, React, Graph, Scikit-learn, MySQL', 'https://prism-rx.ai', 'https://github.com/arun-2124/PRISM-Rx', TRUE, 'ACCEPTED'),

-- 9. AI Campus Assistant (from Hackathon Design Summary)
(9, 6, 15, NULL, 'AI Campus Assistant – Intelligent Conversational Student Hub', 'An AI-driven conversational assistant designed for university portals to resolve course queries, campus administrative navigation, and scheduling via localized retrieval.', 'AI/ML', 'Node.js, Express, React, OpenAI API, MySQL', 'https://campus-ai.edu', 'https://github.com/arun-balaji/campus-assistant', TRUE, 'ACCEPTED'),

-- 10. Smart Irrigation Network (from Hackathon Design Summary)
(10, 5, 16, NULL, 'Smart Irrigation Network – IoT Automated Soil Moisture Optimization', 'An automated micro-irrigation system leveraging IoT soil moisture and ambient temperature sensors to optimize agricultural water distribution and conserve up to 40% water.', 'CleanTech & Energy', 'ESP32, C++, MQTT, React, MySQL', 'https://smart-irrigation.io', 'https://github.com/rahul-sharma/smart-irrigation', TRUE, 'UNDER_REVIEW'),

-- 11. InnoMed – Emergency Triage & Tele-ICU (for Innohack 2.0)
(11, 22, 15, 6, 'InnoMed – Smart Triage Tele-ICU Coordination Hub', 'A real-time remote triage and bed-management dashboard connecting tier-2 hospitals with tertiary medical specialists during acute emergency surges.', 'HealthTech', 'React, WebRTC, Node.js, Tailwind, MySQL', 'https://innomed-teleicu.org', 'https://github.com/arun-2124/innomed', TRUE, 'SUBMITTED')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  abstract = VALUES(abstract),
  tech_stack = VALUES(tech_stack),
  domain_track = VALUES(domain_track),
  is_public = VALUES(is_public),
  submission_status = VALUES(submission_status);

-- -------------------------------------------------------------
-- 9. ENSURE CANONICAL SUBMISSION FILES
-- -------------------------------------------------------------
INSERT INTO submission_files (file_id, idea_id, file_type, file_name, original_name, file_path, file_size_bytes) VALUES
(1, 1, 'PPT', 'idea_1_1728000001_pitch.pptx', 'NeuroScribe_Pitch_Deck.pptx', 'uploads/submissions/idea_1_1728000001_pitch.pptx', 3450000),
(2, 1, 'PDF', 'idea_1_1728000002_paper.pdf', 'NeuroScribe_Technical_Architecture.pdf', 'uploads/submissions/idea_1_1728000002_paper.pdf', 1890000),
(3, 2, 'PDF', 'idea_2_1728000003_whitepaper.pdf', 'DecentraPay_ZK_Whitepaper.pdf', 'uploads/submissions/idea_2_1728000003_whitepaper.pdf', 2450000),
(4, 3, 'PPT', 'idea_3_1728000004_slides.pptx', 'CardioVision_Hardware_Slides.pptx', 'uploads/submissions/idea_3_1728000004_slides.pptx', 4520000),
(5, 4, 'PDF', 'idea_4_1728000005_report.pdf', 'PhishGuard_Model_Benchmark_Report.pdf', 'uploads/submissions/idea_4_1728000005_report.pdf', 1230000),
(6, 5, 'PPT', 'idea_5_1728000006_presentation.pptx', 'SolarSync_CleanTech_Presentation.pptx', 'uploads/submissions/idea_5_1728000006_presentation.pptx', 5120000),
(7, 5, 'PDF', 'idea_5_1728000007_schematic.pdf', 'SolarSync_Hardware_Schematic.pdf', 'uploads/submissions/idea_5_1728000007_schematic.pdf', 3890000),
(8, 8, 'PDF', 'PRISM-Rx_Complete_Idea_and_Video_Summary.pdf', 'PRISM-Rx_Complete_Idea_and_Video_Summary.pdf', 'uploads/submissions/sub_1791213420952_ac3442c0.pdf', 146800),
(9, 9, 'PDF', 'AI_Campus_Assistant_Architecture.pdf', 'AI_Campus_Assistant_Architecture.pdf', 'uploads/submissions/idea_1_1728000002_paper.pdf', 1890000),
(10, 10, 'PPT', 'Smart_Irrigation_IoT_Deck.pptx', 'Smart_Irrigation_IoT_Deck.pptx', 'uploads/submissions/idea_5_1728000006_presentation.pptx', 5120000),
(11, 11, 'PDF', 'InnoMed_Triage_Proposal.pdf', 'InnoMed_Triage_Proposal.pdf', 'uploads/submissions/idea_2_1728000003_whitepaper.pdf', 2450000)
ON DUPLICATE KEY UPDATE
  file_name = VALUES(file_name),
  original_name = VALUES(original_name),
  file_path = VALUES(file_path),
  file_size_bytes = VALUES(file_size_bytes);

-- -------------------------------------------------------------
-- 10. ENSURE CANONICAL ANNOUNCEMENTS
-- -------------------------------------------------------------
INSERT INTO announcements (announcement_id, hackathon_id, posted_by, title, content, is_pinned, created_at) VALUES
(1, 1, 2, 'Welcome to AI Genesis Hackathon 2026!', 'We are thrilled to welcome all participants. Mentor matching sessions will commence on Discord at 11:00 AM on Day 1.', TRUE, '2026-10-01 10:00:00'),
(2, 1, 2, 'API Credits & Cloud Sandboxes Released', 'Check your registered emails for free access keys to our cloud GPU clusters and LLM model sandbox endpoints.', FALSE, '2026-10-02 14:30:00'),
(3, 2, 3, 'Smart Contract Audit Office Hours', 'Web3 security specialists will host live smart contract code review office hours in the discord channel from 4 PM to 7 PM.', TRUE, '2026-10-03 09:15:00'),
(4, 3, 2, 'Wearable Hardware Kit Distribution', 'Teams registered for the on-campus hardware track may collect their IoT sensor kits from Lab 402 starting at 9 AM.', TRUE, '2026-10-01 08:30:00'),
(5, 4, 4, 'CyberShield Capture-The-Flag Round Starts', 'The preliminary vulnerability assessment challenge has officially commenced. Flag submissions close at 22:00 IST.', TRUE, '2026-10-03 08:00:00'),
(6, 18, 3, 'Q-HACK INDIA 2026 Track Guidelines Released', 'Detailed evaluation rubrics for Quantum Biotech, Cryptography, and Quantum AI are now available under the event resources tab.', TRUE, '2026-10-04 11:00:00')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  content = VALUES(content);
