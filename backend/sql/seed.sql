-- =============================================================
-- HackHub – Hackathon Management & Idea Sharing Platform
-- Realistic Seed / Demo Data Script (seed.sql)
-- =============================================================

USE hackhub_db;

-- Disable foreign key checks momentarily to allow clean reload
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE announcements;
TRUNCATE TABLE submission_files;
TRUNCATE TABLE project_ideas;
TRUNCATE TABLE team_members;
TRUNCATE TABLE teams;
TRUNCATE TABLE registrations;
TRUNCATE TABLE hackathon_tag_mappings;
TRUNCATE TABLE hackathon_tags;
TRUNCATE TABLE hackathons;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------
-- 1. SEED USERS (1 Admin, 3 Organizers, 10 Participants)
-- Standard hashed password for all demo accounts: 'password123'
-- -------------------------------------------------------------
INSERT INTO users (user_id, full_name, email, password_hash, role, college_name, phone) VALUES
-- Admin
(1, 'Arjun Admin', 'admin@hackhub.com', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'ADMIN', 'HackHub Central Administration', '+91 9800000001'),

-- Organizers
(2, 'Dr. Ramesh Sharma', 'ramesh.sharma@mit.edu', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'ORGANIZER', 'MIT Department of Computer Science', '+91 9876543210'),
(3, 'Prof. Priya Iyer', 'priya.iyer@iitb.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'ORGANIZER', 'IIT Bombay Innovation & Entrepreneurship Cell', '+91 9876543211'),
(4, 'Vikram Malhotra', 'vikram@techhub.org', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'ORGANIZER', 'National Coding Consortium', '+91 9876543212'),

-- Participants
(5, 'Aarav Patel', 'aarav.patel@student.mit.edu', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'MIT Pune', '+91 9123456701'),
(6, 'Sneha Reddy', 'sneha.reddy@student.iitb.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'IIT Bombay', '+91 9123456702'),
(7, 'Rohan Verma', 'rohan.v@vit.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'VIT Vellore', '+91 9123456703'),
(8, 'Ananya Sen', 'ananya.sen@bits.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'BITS Pilani', '+91 9123456704'),
(9, 'Karan Joshi', 'karan.j@dtu.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'Delhi Technological University', '+91 9123456705'),
(10, 'Diya Nair', 'diya.nair@nitc.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'NIT Calicut', '+91 9123456706'),
(11, 'Siddharth Rao', 'sid.rao@iiit.ac.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'IIIT Hyderabad', '+91 9123456707'),
(12, 'Meera Krishnan', 'meera.k@pes.edu', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'PES University Bengaluru', '+91 9123456708'),
(13, 'Kabir Das', 'kabir.das@srmist.edu.in', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'SRM University Chennai', '+91 9123456709'),
(14, 'Tanvi Hegde', 'tanvi.h@manipal.edu', '$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW', 'PARTICIPANT', 'Manipal Institute of Technology', '+91 9123456710');

-- -------------------------------------------------------------
-- 2. SEED HACKATHONS (6 Hackathons across multiple statuses)
-- -------------------------------------------------------------
INSERT INTO hackathons (hackathon_id, organizer_id, title, description, banner_image, start_date, end_date, registration_deadline, min_team_size, max_team_size, status, location) VALUES
(1, 2, 'AI Genesis Hackathon 2026', 'Build next-generation generative AI and intelligent agent applications solving real-world challenges.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', '2026-11-15 09:00:00', '2026-11-17 18:00:00', '2026-11-10 23:59:59', 2, 4, 'UPCOMING', 'Hybrid - MIT Campus & Online'),
(2, 3, 'Web3 & FinTech Revolution', 'Decentralized finance, smart contract security, cross-border payments, and Web3 identity protocols.', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80', '2026-12-01 10:00:00', '2026-12-03 20:00:00', '2026-11-25 23:59:59', 1, 3, 'UPCOMING', 'Online (Discord & GitHub)'),
(3, 2, 'Smart Health & BioTech Sprint', 'Leverage predictive AI, wearable sensors, and telemedicine to transform preventive digital healthcare.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', '2026-10-01 09:00:00', '2026-10-10 18:00:00', '2026-09-28 23:59:59', 2, 4, 'ONGOING', 'IIT Bombay Research Labs'),
(4, 4, 'CyberShield National Hackathon', 'Offensive and defensive security tooling, zero-trust architectures, and automated vulnerability detection.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', '2026-10-03 08:00:00', '2026-10-08 22:00:00', '2026-09-30 23:59:59', 1, 4, 'ONGOING', 'Online'),
(5, 3, 'GreenTech Clean Energy Challenge', 'Develop IoT and AI solutions for smart grids, carbon tracking, and renewable energy distribution.', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80', '2026-08-10 09:00:00', '2026-08-12 18:00:00', '2026-08-05 23:59:59', 2, 5, 'COMPLETED', 'Bengaluru Innovation Center'),
(6, 4, 'EdTech Odyssey 2026', 'Reinvent digital learning, accessibility tools, and interactive STEM education platforms.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', '2026-12-15 09:00:00', '2026-12-17 18:00:00', '2026-12-10 23:59:59', 1, 3, 'UPCOMING', 'Online');

-- -------------------------------------------------------------
-- 3. SEED HACKATHON TAGS (10 Categories)
-- -------------------------------------------------------------
INSERT INTO hackathon_tags (tag_id, tag_name) VALUES
(1, 'AI/ML'),
(2, 'Web3 & Blockchain'),
(3, 'FinTech'),
(4, 'HealthTech'),
(5, 'CyberSecurity'),
(6, 'IoT & Robotics'),
(7, 'EdTech'),
(8, 'CleanTech & Energy'),
(9, 'Cloud & DevOps'),
(10, 'Mobile Apps');

-- -------------------------------------------------------------
-- 4. SEED HACKATHON-TAG MAPPINGS (M:N)
-- -------------------------------------------------------------
INSERT INTO hackathon_tag_mappings (hackathon_id, tag_id) VALUES
(1, 1), -- AI Genesis -> AI/ML
(1, 9), -- AI Genesis -> Cloud & DevOps
(1, 6), -- AI Genesis -> IoT & Robotics
(2, 2), -- Web3 -> Web3 & Blockchain
(2, 3), -- Web3 -> FinTech
(2, 5), -- Web3 -> CyberSecurity
(3, 4), -- Smart Health -> HealthTech
(3, 1), -- Smart Health -> AI/ML
(3, 6), -- Smart Health -> IoT & Robotics
(4, 5), -- CyberShield -> CyberSecurity
(4, 9), -- CyberShield -> Cloud & DevOps
(5, 8), -- GreenTech -> CleanTech & Energy
(5, 6), -- GreenTech -> IoT & Robotics
(6, 7), -- EdTech -> EdTech
(6, 1), -- EdTech -> AI/ML
(6, 10); -- EdTech -> Mobile Apps

-- -------------------------------------------------------------
-- 5. SEED REGISTRATIONS (20 Individual Registrations)
-- -------------------------------------------------------------
INSERT INTO registrations (registration_id, hackathon_id, user_id, status) VALUES
-- Hackathon 1 (AI Genesis)
(1, 1, 5, 'CONFIRMED'),   -- Aarav
(2, 1, 6, 'CONFIRMED'),   -- Sneha
(3, 1, 7, 'CONFIRMED'),   -- Rohan
(4, 1, 8, 'CONFIRMED'),   -- Ananya

-- Hackathon 2 (Web3 & FinTech)
(5, 2, 5, 'CONFIRMED'),   -- Aarav (registered for multiple!)
(6, 2, 8, 'CONFIRMED'),   -- Ananya (registered for multiple!)
(7, 2, 9, 'CONFIRMED'),   -- Karan
(8, 2, 10, 'CONFIRMED'),  -- Diya

-- Hackathon 3 (Smart Health)
(9, 3, 5, 'CONFIRMED'),   -- Aarav (registered for 3 hackathons!)
(10, 3, 6, 'CONFIRMED'),  -- Sneha
(11, 3, 9, 'CONFIRMED'),  -- Karan
(12, 3, 11, 'CONFIRMED'), -- Siddharth
(13, 3, 12, 'CONFIRMED'), -- Meera

-- Hackathon 4 (CyberShield)
(14, 4, 7, 'CONFIRMED'),  -- Rohan
(15, 4, 8, 'CONFIRMED'),  -- Ananya
(16, 4, 10, 'CONFIRMED'), -- Diya
(17, 4, 11, 'CONFIRMED'), -- Siddharth
(18, 4, 13, 'CONFIRMED'), -- Kabir

-- Hackathon 5 (GreenTech - Completed)
(19, 5, 12, 'CONFIRMED'), -- Meera
(20, 5, 14, 'CONFIRMED'), -- Tanvi

-- Hackathon 6 (EdTech Odyssey)
(21, 6, 14, 'CONFIRMED'); -- Tanvi

-- -------------------------------------------------------------
-- 6. SEED TEAMS (4 Teams across different hackathons)
-- -------------------------------------------------------------
INSERT INTO teams (team_id, hackathon_id, leader_id, team_name, team_code) VALUES
(1, 1, 5, 'NeuralKnights', 'NK-AI2026'),     -- Leader: Aarav (registered in H1)
(2, 2, 8, 'BlockBusters', 'BB-W32026'),      -- Leader: Ananya (registered in H2)
(3, 3, 6, 'MediPulse', 'MP-HT2026'),         -- Leader: Sneha (registered in H3)
(4, 4, 7, 'CyberSentinels', 'CS-SEC2026');   -- Leader: Rohan (registered in H4)

-- -------------------------------------------------------------
-- 7. SEED TEAM MEMBERS (M:N Junction with Roles)
-- Guaranteed: All members are registered for the team's hackathon,
-- team sizes are within max_team_size, and leaders have role = 'LEADER'
-- -------------------------------------------------------------
INSERT INTO team_members (team_id, user_id, role_in_team) VALUES
-- Team 1: NeuralKnights (Hackathon 1: min 2, max 4. Current size: 3)
(1, 5, 'LEADER'),
(1, 6, 'MEMBER'),
(1, 7, 'MEMBER'),

-- Team 2: BlockBusters (Hackathon 2: min 1, max 3. Current size: 2)
(2, 8, 'LEADER'),
(2, 9, 'MEMBER'),

-- Team 3: MediPulse (Hackathon 3: min 2, max 4. Current size: 3)
(3, 6, 'LEADER'),
(3, 11, 'MEMBER'),
(3, 12, 'MEMBER'),

-- Team 4: CyberSentinels (Hackathon 4: min 1, max 4. Current size: 2)
-- Note: Team 4 has NOT submitted an idea yet (used for NOT EXISTS demonstration)
(4, 7, 'LEADER'),
(4, 10, 'MEMBER');

-- -------------------------------------------------------------
-- 8. SEED PROJECT IDEAS (7 Submissions: Team & Solo, Public & Private)
-- -------------------------------------------------------------
INSERT INTO project_ideas (idea_id, hackathon_id, submitted_by_user_id, team_id, title, abstract, domain_track, tech_stack, demo_url, repo_url, is_public, submission_status) VALUES
-- 1. Team Submission (Team 1, Hackathon 1, Public, Accepted)
(1, 1, 5, 1, 'NeuroScribe – Automated Clinical Notes via Whisper & LLMs', 'NeuroScribe uses fine-tuned speech recognition and LLMs to transcribe doctor-patient conversations into structured EHR notes in real time, reducing physician documentation burnout by 70%.', 'AI/ML', 'Python, PyTorch, Whisper, React, FastAPI', 'https://neuroscribe-demo.vercel.app', 'https://github.com/aaravpatel/neuroscribe', TRUE, 'ACCEPTED'),

-- 2. Team Submission (Team 2, Hackathon 2, Public, Under Review)
(2, 2, 8, 2, 'DecentraPay – Cross-Border Micropayments on Layer-2', 'A high-throughput, low-fee remittance protocol utilizing zero-knowledge rollups and decentralized liquidity pools for instant cross-border worker remittances.', 'FinTech', 'Solidity, Polygon zkEVM, Next.js, Node.js', 'https://decentrapay.finance', 'https://github.com/ananyasen/decentrapay', TRUE, 'UNDER_REVIEW'),

-- 3. Team Submission (Team 3, Hackathon 3, Private, Submitted)
(3, 3, 6, 3, 'CardioVision – Real-Time Arrhythmia Detection with Edge IoT', 'An ultra-low-power wearable ECG patch paired with on-device quantized neural networks for real-time arrhythmia prediction and automated emergency ambulance alerts.', 'HealthTech', 'TensorFlow Lite, C++, Flutter, Raspberry Pi Pico', NULL, 'https://github.com/sneha-reddy/cardiovision', FALSE, 'SUBMITTED'),

-- 4. Solo Submission (User 13, Hackathon 4, Public, Submitted)
(4, 4, 13, NULL, 'PhishGuard – Zero-Day Email Threat Engine', 'A behavioral analysis engine that detects sophisticated spear-phishing and business email compromise by evaluating syntactic intent and domain entropy.', 'CyberSecurity', 'Python, Rust, Scikit-learn, Docker', 'https://phishguard.security.io', 'https://github.com/kabirdas/phishguard', TRUE, 'SUBMITTED'),

-- 5. Solo Submission (User 14, Hackathon 5, Public, Accepted)
(5, 5, 14, NULL, 'SolarSync – Peer-to-Peer Solar Surplus Energy Exchange', 'A localized energy trading platform that allows households with solar rooftop panels to trade excess kilowatt-hours with neighbors over an automated smart microgrid.', 'CleanTech & Energy', 'React, Express, ESP32, MQTT, MySQL', 'https://solarsync.energy', 'https://github.com/tanvihegde/solarsync', TRUE, 'ACCEPTED'),

-- 6. Solo Submission (User 14, Hackathon 6, Private, Under Review)
(6, 6, 14, NULL, 'CampusLearn – Collaborative Peer Learning & Knowledge Graph', 'An adaptive study platform that clusters lecture concepts into interactive knowledge graphs and pairs students for targeted peer tutoring based on syllabus weaknesses.', 'EdTech', 'React, Node.js, WebSockets, Neo4j, MySQL', NULL, 'https://github.com/tanvihegde/campuslearn', FALSE, 'UNDER_REVIEW'),

-- 7. Solo Submission (User 9, Hackathon 3, Public, Rejected)
(7, 3, 9, NULL, 'BioSentinel – Non-Invasive Early Sepsis Warning Monitor', 'Continuous vital signs monitoring and multivariate regression alerting clinical ICU teams 6 hours prior to overt septic shock manifestation.', 'HealthTech', 'Python, XGBoost, Docker, Flask', NULL, 'https://github.com/karanjoshi/biosentinel', TRUE, 'REJECTED');

-- -------------------------------------------------------------
-- 9. SEED SUBMISSION FILES (Metadata only, files on server storage)
-- -------------------------------------------------------------
INSERT INTO submission_files (file_id, idea_id, file_type, file_name, original_name, file_path, file_size_bytes) VALUES
(1, 1, 'PPT', 'idea_1_1728000001_pitch.pptx', 'NeuroScribe_Pitch_Deck.pptx', 'uploads/submissions/idea_1_1728000001_pitch.pptx', 3450000),
(2, 1, 'PDF', 'idea_1_1728000002_paper.pdf', 'NeuroScribe_Technical_Architecture.pdf', 'uploads/submissions/idea_1_1728000002_paper.pdf', 1890000),
(3, 2, 'PDF', 'idea_2_1728000003_whitepaper.pdf', 'DecentraPay_ZK_Whitepaper.pdf', 'uploads/submissions/idea_2_1728000003_whitepaper.pdf', 2450000),
(4, 3, 'PPT', 'idea_3_1728000004_slides.pptx', 'CardioVision_Hardware_Slides.pptx', 'uploads/submissions/idea_3_1728000004_slides.pptx', 4520000),
(5, 4, 'PDF', 'idea_4_1728000005_report.pdf', 'PhishGuard_Model_Benchmark_Report.pdf', 'uploads/submissions/idea_4_1728000005_report.pdf', 1230000),
(6, 5, 'PPT', 'idea_5_1728000006_presentation.pptx', 'SolarSync_CleanTech_Presentation.pptx', 'uploads/submissions/idea_5_1728000006_presentation.pptx', 5120000),
(7, 5, 'PDF', 'idea_5_1728000007_schematic.pdf', 'SolarSync_Hardware_Schematic.pdf', 'uploads/submissions/idea_5_1728000007_schematic.pdf', 3890000),
(8, 7, 'PDF', 'idea_7_1728000008_clinical.pdf', 'BioSentinel_Clinical_Data_Report.pdf', 'uploads/submissions/idea_7_1728000008_clinical.pdf', 2140000);

-- -------------------------------------------------------------
-- 10. SEED ANNOUNCEMENTS (6 Broadcasts across Hackathons)
-- -------------------------------------------------------------
INSERT INTO announcements (announcement_id, hackathon_id, posted_by, title, content, is_pinned) VALUES
(1, 1, 2, 'Welcome to AI Genesis 2026!', 'We are thrilled to welcome all participants! Team formation is now open. Make sure to read the problem statements and review guidelines in the dashboard.', TRUE),
(2, 1, 2, 'Mentorship Hours & Cloud Credits Released', 'AWS and Google Cloud credits have been emailed to all confirmed team leaders. Join the mentorship channel for architecture reviews this Friday.', FALSE),
(3, 2, 3, 'Testnet Faucets & Smart Contract Templates', 'Sepolia and Polygon testnet faucets are active. Starter contracts with audited ERC-20 and ERC-4337 account abstraction are linked in the resources page.', TRUE),
(4, 3, 2, 'Medical Datasets & HIPAA Sandbox API Available', 'The anonymized ICU vital signs and synthetic ECG datasets are now accessible for all registered teams. Please comply with our data usage ethics pledge.', TRUE),
(5, 4, 4, 'CTF Qualification Round Starts Tomorrow at 10 AM', 'All registered security teams must check in 15 minutes prior to flag release. Network isolation rules and target VPN credentials have been published.', TRUE),
(6, 5, 3, 'Final Evaluation Results & Winner Ceremony', 'Congratulations to all teams who submitted! Top 3 prototypes for the GreenTech challenge have been selected. Awards ceremony will commence at 5:00 PM.', FALSE);
