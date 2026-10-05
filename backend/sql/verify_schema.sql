USE hackhub_db;

SHOW TABLES;

-- DESCRIBE ALL TABLES
DESCRIBE users;
DESCRIBE hackathons;
DESCRIBE hackathon_tags;
DESCRIBE hackathon_tag_mappings;
DESCRIBE registrations;
DESCRIBE teams;
DESCRIBE team_members;
DESCRIBE project_ideas;
DESCRIBE submission_files;
DESCRIBE announcements;

-- SHOW CREATE TABLE FOR ALL TABLES
SHOW CREATE TABLE users\G
SHOW CREATE TABLE hackathons\G
SHOW CREATE TABLE hackathon_tags\G
SHOW CREATE TABLE hackathon_tag_mappings\G
SHOW CREATE TABLE registrations\G
SHOW CREATE TABLE teams\G
SHOW CREATE TABLE team_members\G
SHOW CREATE TABLE project_ideas\G
SHOW CREATE TABLE submission_files\G
SHOW CREATE TABLE announcements\G
