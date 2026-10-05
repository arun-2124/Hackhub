-- =============================================================
-- HackHub Database: Real Hackathons Integration (India 2026)
-- Sources: Devfolio, Unstop, ETHGlobal
-- All dates, locations, requirements, and links are based on legitimate public records.
-- =============================================================

USE hackhub_db;

-- -------------------------------------------------------------
-- 1. Insert New Tags (if not already present)
-- -------------------------------------------------------------
INSERT IGNORE INTO hackathon_tags (tag_name) VALUES 
('Quantum Computing'),
('Open Innovation');

-- -------------------------------------------------------------
-- 2. Insert Real Hackathons (Idempotent Insertion)
-- -------------------------------------------------------------

-- 2.1 Q-HACK INDIA 2026 (Devfolio / Ramaiah Institute of Technology)
INSERT INTO hackathons (
    organizer_id, title, description, banner_image,
    start_date, end_date, registration_deadline,
    min_team_size, max_team_size, status, location
)
SELECT 
    3, -- Prof. Priya Iyer (IIT Bombay Innovation & Entrepreneurship Cell representation)
    'Q-HACK INDIA 2026',
    'National-level quantum computing hackathon hosted by QuantumRIT in collaboration with industry partners. Features 4 specialized tracks: Quantum Biotech & Chemistry, Quantum Security & Cryptography, Quantum AI & Software, and Open Quantum Innovation. Finalists compete in a 2-day in-person hackathon in Bengaluru.\n\n[Source: Devfolio | https://devfolio.co/hackathons/q-hack-india-2026]',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    '2026-10-30 09:00:00',
    '2026-10-31 18:00:00',
    '2026-10-20 23:59:59',
    3,
    4,
    'UPCOMING',
    'Ramaiah Institute of Technology, Bengaluru'
WHERE NOT EXISTS (
    SELECT 1 FROM hackathons WHERE title = 'Q-HACK INDIA 2026'
);

-- 2.2 HackShift 2026 – IIIT Delhi (Unstop / IIIT Delhi E-Cell)
INSERT INTO hackathons (
    organizer_id, title, description, banner_image,
    start_date, end_date, registration_deadline,
    min_team_size, max_team_size, status, location
)
SELECT 
    2, -- Dr. Ramesh Sharma (MIT Dept of CS representation)
    'HackShift 2026 – IIIT Delhi',
    'A flagship two-stage hackathon organized by the Entrepreneurship Cell at IIIT Delhi under the theme "Cmd, Shift, Create". Round 1 requires an online proposal slide-deck submission on campus engagement or event tooling; shortlisted teams qualify for the 24-hour on-campus hackathon at IIIT Delhi.\n\n[Source: Unstop | https://unstop.com/hackathons/hackshift-iiit-delhi]',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    '2026-10-17 09:00:00',
    '2026-10-18 18:00:00',
    '2026-10-15 23:59:59',
    1,
    4,
    'UPCOMING',
    'IIIT Delhi Campus, New Delhi'
WHERE NOT EXISTS (
    SELECT 1 FROM hackathons WHERE title = 'HackShift 2026 – IIIT Delhi'
);

-- 2.3 ETHGlobal Mumbai 2026 (ETHGlobal)
INSERT INTO hackathons (
    organizer_id, title, description, banner_image,
    start_date, end_date, registration_deadline,
    min_team_size, max_team_size, status, location
)
SELECT 
    3, -- Prof. Priya Iyer representation
    'ETHGlobal Mumbai 2026',
    'Leading Ethereum ecosystem hackathon bringing global developers to Mumbai. 36 hours of non-stop building focusing on decentralized finance, smart contract security, zero-knowledge proofs, and cross-chain interoperability with mentorship from core Ethereum protocol researchers.\n\n[Source: ETHGlobal | https://ethglobal.com/events/mumbai]',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    '2026-11-06 10:00:00',
    '2026-11-08 17:00:00',
    '2026-11-01 23:59:59',
    1,
    5,
    'UPCOMING',
    'Jio World Convention Centre, Mumbai'
WHERE NOT EXISTS (
    SELECT 1 FROM hackathons WHERE title = 'ETHGlobal Mumbai 2026'
);

-- 2.4 Vihaan X 2026 – IEEE DTU (Unstop / IEEE DTU)
INSERT INTO hackathons (
    organizer_id, title, description, banner_image,
    start_date, end_date, registration_deadline,
    min_team_size, max_team_size, status, location
)
SELECT 
    4, -- Vikram Malhotra representation
    'Vihaan X 2026 – IEEE DTU',
    'Annual flagship national hackathon hosted by IEEE Delhi Technological University (DTU). Features 24-hour intense sprints in Artificial Intelligence, HealthTech, Smart City IoT, and Sustainable Tech with tracks judged by leading engineers and faculty.\n\n[Source: Unstop | https://unstop.com/hackathons/vihaan-x-dtu]',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    '2026-11-14 09:00:00',
    '2026-11-15 18:00:00',
    '2026-11-09 23:59:59',
    1,
    4,
    'UPCOMING',
    'Delhi Technological University (DTU), New Delhi'
WHERE NOT EXISTS (
    SELECT 1 FROM hackathons WHERE title = 'Vihaan X 2026 – IEEE DTU'
);

-- -------------------------------------------------------------
-- 3. Map Tags to Real Hackathons
-- -------------------------------------------------------------

-- Q-HACK INDIA 2026 (Quantum Computing, AI/ML, CyberSecurity, HealthTech)
INSERT IGNORE INTO hackathon_tag_mappings (hackathon_id, tag_id)
SELECT h.hackathon_id, t.tag_id
FROM hackathons h
CROSS JOIN hackathon_tags t
WHERE h.title = 'Q-HACK INDIA 2026'
  AND t.tag_name IN ('Quantum Computing', 'AI/ML', 'CyberSecurity', 'HealthTech');

-- HackShift 2026 – IIIT Delhi (Mobile Apps, Cloud & DevOps, Open Innovation)
INSERT IGNORE INTO hackathon_tag_mappings (hackathon_id, tag_id)
SELECT h.hackathon_id, t.tag_id
FROM hackathons h
CROSS JOIN hackathon_tags t
WHERE h.title = 'HackShift 2026 – IIIT Delhi'
  AND t.tag_name IN ('Mobile Apps', 'Cloud & DevOps', 'Open Innovation');

-- ETHGlobal Mumbai 2026 (Web3 & Blockchain, FinTech, CyberSecurity, Open Innovation)
INSERT IGNORE INTO hackathon_tag_mappings (hackathon_id, tag_id)
SELECT h.hackathon_id, t.tag_id
FROM hackathons h
CROSS JOIN hackathon_tags t
WHERE h.title = 'ETHGlobal Mumbai 2026'
  AND t.tag_name IN ('Web3 & Blockchain', 'FinTech', 'CyberSecurity', 'Open Innovation');

-- Vihaan X 2026 – IEEE DTU (AI/ML, IoT & Robotics, HealthTech, Open Innovation)
INSERT IGNORE INTO hackathon_tag_mappings (hackathon_id, tag_id)
SELECT h.hackathon_id, t.tag_id
FROM hackathons h
CROSS JOIN hackathon_tags t
WHERE h.title = 'Vihaan X 2026 – IEEE DTU'
  AND t.tag_name IN ('AI/ML', 'IoT & Robotics', 'HealthTech', 'Open Innovation');
