-- =============================================================
-- HackHub – Hackathon Management & Idea Sharing Platform
-- Relational Database DDL Schema (MySQL 8.0 / InnoDB)
-- =============================================================

CREATE DATABASE IF NOT EXISTS hackhub_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hackhub_db;

-- Drop tables in reverse order of foreign key dependencies to allow clean re-runs
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS submission_files;
DROP TABLE IF EXISTS project_ideas;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS hackathon_tag_mappings;
DROP TABLE IF EXISTS hackathon_tags;
DROP TABLE IF EXISTS hackathons;
DROP TABLE IF EXISTS users;

-- -------------------------------------------------------------
-- 1. USERS TABLE
-- -------------------------------------------------------------
CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('PARTICIPANT', 'ORGANIZER', 'ADMIN') NOT NULL DEFAULT 'PARTICIPANT',
    college_name VARCHAR(150) NULL,
    phone VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 2. HACKATHONS TABLE
-- -------------------------------------------------------------
CREATE TABLE hackathons (
    hackathon_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organizer_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    banner_image VARCHAR(255) NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    registration_deadline DATETIME NOT NULL,
    min_team_size TINYINT UNSIGNED NOT NULL DEFAULT 1,
    max_team_size TINYINT UNSIGNED NOT NULL DEFAULT 4,
    status ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING',
    location VARCHAR(150) NOT NULL DEFAULT 'Online',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hackathon_organizer 
        FOREIGN KEY (organizer_id) REFERENCES users(user_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_team_sizes 
        CHECK (min_team_size > 0 AND max_team_size >= min_team_size),
    CONSTRAINT chk_dates 
        CHECK (end_date >= start_date AND registration_deadline <= end_date),
    INDEX idx_hackathon_status (status),
    INDEX idx_hackathon_dates (start_date, end_date)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 3. HACKATHON TAGS TABLE (Lookup)
-- -------------------------------------------------------------
CREATE TABLE hackathon_tags (
    tag_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 4. HACKATHON TAG MAPPINGS (M:N Junction)
-- -------------------------------------------------------------
CREATE TABLE hackathon_tag_mappings (
    hackathon_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (hackathon_id, tag_id),
    CONSTRAINT fk_htm_hackathon 
        FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_htm_tag 
        FOREIGN KEY (tag_id) REFERENCES hackathon_tags(tag_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 5. REGISTRATIONS TABLE
-- -------------------------------------------------------------
CREATE TABLE registrations (
    registration_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hackathon_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('REGISTERED', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'REGISTERED',
    UNIQUE KEY uq_user_hackathon_reg (hackathon_id, user_id),
    CONSTRAINT fk_reg_hackathon 
        FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reg_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_reg_user (user_id),
    INDEX idx_reg_hackathon (hackathon_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 6. TEAMS TABLE
-- -------------------------------------------------------------
CREATE TABLE teams (
    team_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hackathon_id INT UNSIGNED NOT NULL,
    leader_id INT UNSIGNED NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    team_code VARCHAR(12) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_hackathon_team_name (hackathon_id, team_name),
    CONSTRAINT fk_team_hackathon 
        FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_team_leader 
        FOREIGN KEY (leader_id) REFERENCES users(user_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_team_hackathon (hackathon_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 7. TEAM MEMBERS TABLE (M:N Junction)
-- -------------------------------------------------------------
CREATE TABLE team_members (
    membership_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    role_in_team ENUM('LEADER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_team_member (team_id, user_id),
    CONSTRAINT fk_tm_team 
        FOREIGN KEY (team_id) REFERENCES teams(team_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tm_user 
        FOREIGN KEY (user_id) REFERENCES users(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tm_user (user_id),
    INDEX idx_tm_team (team_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 8. PROJECT IDEAS TABLE
-- -------------------------------------------------------------
CREATE TABLE project_ideas (
    idea_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hackathon_id INT UNSIGNED NOT NULL,
    submitted_by_user_id INT UNSIGNED NOT NULL,
    team_id INT UNSIGNED NULL,
    title VARCHAR(200) NOT NULL,
    abstract TEXT NOT NULL,
    domain_track VARCHAR(100) NULL,
    tech_stack VARCHAR(255) NULL,
    demo_url VARCHAR(255) NULL,
    repo_url VARCHAR(255) NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    submission_status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_hackathon_team_idea (hackathon_id, team_id),
    CONSTRAINT fk_idea_hackathon 
        FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_idea_submitter 
        FOREIGN KEY (submitted_by_user_id) REFERENCES users(user_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_idea_team 
        FOREIGN KEY (team_id) REFERENCES teams(team_id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_idea_public (is_public),
    INDEX idx_idea_status (submission_status),
    INDEX idx_idea_hackathon (hackathon_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 9. SUBMISSION FILES TABLE (Metadata Only)
-- -------------------------------------------------------------
CREATE TABLE submission_files (
    file_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    idea_id INT UNSIGNED NOT NULL,
    file_type ENUM('PPT', 'PDF') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size_bytes INT UNSIGNED NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sf_idea 
        FOREIGN KEY (idea_id) REFERENCES project_ideas(idea_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_file_idea (idea_id)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 10. ANNOUNCEMENTS TABLE
-- -------------------------------------------------------------
CREATE TABLE announcements (
    announcement_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hackathon_id INT UNSIGNED NOT NULL,
    posted_by INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ann_hackathon 
        FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ann_poster 
        FOREIGN KEY (posted_by) REFERENCES users(user_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_ann_hackathon (hackathon_id, is_pinned)
) ENGINE=InnoDB;
