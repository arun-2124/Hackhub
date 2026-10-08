-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: hackhub_db
-- ------------------------------------------------------
-- Server version	8.4.11-0ubuntu0.26.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `announcement_id` int unsigned NOT NULL AUTO_INCREMENT,
  `hackathon_id` int unsigned NOT NULL,
  `posted_by` int unsigned NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`announcement_id`),
  KEY `fk_ann_poster` (`posted_by`),
  KEY `idx_ann_hackathon` (`hackathon_id`,`is_pinned`),
  CONSTRAINT `fk_ann_hackathon` FOREIGN KEY (`hackathon_id`) REFERENCES `hackathons` (`hackathon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ann_poster` FOREIGN KEY (`posted_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,1,2,'Welcome to AI Genesis Hackathon 2026!','We are thrilled to welcome all participants. Mentor matching sessions will commence on Discord at 11:00 AM on Day 1.',1,'2026-10-05 11:04:57'),(2,1,2,'API Credits & Cloud Sandboxes Released','Check your registered emails for free access keys to our cloud GPU clusters and LLM model sandbox endpoints.',0,'2026-10-05 11:04:57'),(3,2,3,'Smart Contract Audit Office Hours','Web3 security specialists will host live smart contract code review office hours in the discord channel from 4 PM to 7 PM.',1,'2026-10-05 11:04:57'),(4,3,2,'Wearable Hardware Kit Distribution','Teams registered for the on-campus hardware track may collect their IoT sensor kits from Lab 402 starting at 9 AM.',1,'2026-10-05 11:04:57'),(5,4,4,'CyberShield Capture-The-Flag Round Starts','The preliminary vulnerability assessment challenge has officially commenced. Flag submissions close at 22:00 IST.',1,'2026-10-05 11:04:57'),(6,5,3,'Q-HACK INDIA 2026 Track Guidelines Released','Detailed evaluation rubrics for Quantum Biotech, Cryptography, and Quantum AI are now available under the event resources tab.',0,'2026-10-05 11:04:57');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hackathon_tag_mappings`
--

DROP TABLE IF EXISTS `hackathon_tag_mappings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hackathon_tag_mappings` (
  `hackathon_id` int unsigned NOT NULL,
  `tag_id` int unsigned NOT NULL,
  PRIMARY KEY (`hackathon_id`,`tag_id`),
  KEY `fk_htm_tag` (`tag_id`),
  CONSTRAINT `fk_htm_hackathon` FOREIGN KEY (`hackathon_id`) REFERENCES `hackathons` (`hackathon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_htm_tag` FOREIGN KEY (`tag_id`) REFERENCES `hackathon_tags` (`tag_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hackathon_tag_mappings`
--

LOCK TABLES `hackathon_tag_mappings` WRITE;
/*!40000 ALTER TABLE `hackathon_tag_mappings` DISABLE KEYS */;
INSERT INTO `hackathon_tag_mappings` VALUES (1,1),(3,1),(6,1),(18,1),(21,1),(22,1),(2,2),(20,2),(2,3),(20,3),(3,4),(18,4),(21,4),(22,4),(2,5),(4,5),(18,5),(20,5),(1,6),(3,6),(5,6),(21,6),(22,6),(6,7),(5,8),(1,9),(4,9),(19,9),(6,10),(19,10),(18,11),(19,12),(20,12),(21,12),(22,12);
/*!40000 ALTER TABLE `hackathon_tag_mappings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hackathon_tags`
--

DROP TABLE IF EXISTS `hackathon_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hackathon_tags` (
  `tag_id` int unsigned NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_name` (`tag_name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hackathon_tags`
--

LOCK TABLES `hackathon_tags` WRITE;
/*!40000 ALTER TABLE `hackathon_tags` DISABLE KEYS */;
INSERT INTO `hackathon_tags` VALUES (1,'AI/ML'),(8,'CleanTech & Energy'),(9,'Cloud & DevOps'),(5,'CyberSecurity'),(7,'EdTech'),(3,'FinTech'),(4,'HealthTech'),(6,'IoT & Robotics'),(10,'Mobile Apps'),(12,'Open Innovation'),(11,'Quantum Computing'),(2,'Web3 & Blockchain');
/*!40000 ALTER TABLE `hackathon_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hackathons`
--

DROP TABLE IF EXISTS `hackathons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hackathons` (
  `hackathon_id` int unsigned NOT NULL AUTO_INCREMENT,
  `organizer_id` int unsigned NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `banner_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `registration_deadline` datetime NOT NULL,
  `min_team_size` tinyint unsigned NOT NULL DEFAULT '1',
  `max_team_size` tinyint unsigned NOT NULL DEFAULT '4',
  `status` enum('UPCOMING','ONGOING','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPCOMING',
  `location` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Online',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`hackathon_id`),
  KEY `fk_hackathon_organizer` (`organizer_id`),
  KEY `idx_hackathon_status` (`status`),
  KEY `idx_hackathon_dates` (`start_date`,`end_date`),
  CONSTRAINT `fk_hackathon_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_dates` CHECK (((`end_date` >= `start_date`) and (`registration_deadline` <= `end_date`))),
  CONSTRAINT `chk_team_sizes` CHECK (((`min_team_size` > 0) and (`max_team_size` >= `min_team_size`)))
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hackathons`
--

LOCK TABLES `hackathons` WRITE;
/*!40000 ALTER TABLE `hackathons` DISABLE KEYS */;
INSERT INTO `hackathons` VALUES (1,2,'AI Genesis Hackathon 2026','Build next-generation generative AI and intelligent agent applications solving real-world challenges.','https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80','2026-11-15 09:00:00','2026-11-17 18:00:00','2026-11-10 23:59:59',2,4,'UPCOMING','Hybrid - MIT Campus & Online','2026-10-05 11:04:57','2026-10-05 11:04:57'),(2,3,'Web3 & FinTech Revolution','Decentralized finance, smart contract security, cross-border payments, and Web3 identity protocols.','https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80','2026-12-01 10:00:00','2026-12-03 20:00:00','2026-11-25 23:59:59',1,3,'UPCOMING','Online (Discord & GitHub)','2026-10-05 11:04:57','2026-10-05 11:04:57'),(3,2,'Smart Health & BioTech Sprint','Leverage predictive AI, wearable sensors, and telemedicine to transform preventive digital healthcare.','https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80','2026-10-01 09:00:00','2026-10-10 18:00:00','2026-09-28 23:59:59',2,4,'ONGOING','IIT Bombay Research Labs','2026-10-05 11:04:57','2026-10-05 11:04:57'),(4,4,'CyberShield National Hackathon','Offensive and defensive security tooling, zero-trust architectures, and automated vulnerability detection.','https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80','2026-10-03 08:00:00','2026-10-08 22:00:00','2026-09-30 23:59:59',1,4,'ONGOING','Online','2026-10-05 11:04:57','2026-10-05 11:04:57'),(5,3,'GreenTech Clean Energy Challenge','Develop IoT and AI solutions for smart grids, carbon tracking, and renewable energy distribution.','https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80','2026-08-10 09:00:00','2026-08-12 18:00:00','2026-08-05 23:59:59',2,5,'COMPLETED','Bengaluru Innovation Center','2026-10-05 11:04:57','2026-10-05 11:04:57'),(6,4,'EdTech Odyssey 2026','Reinvent digital learning, accessibility tools, and interactive STEM education platforms.','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80','2026-12-15 09:00:00','2026-12-17 18:00:00','2026-12-10 23:59:59',1,3,'UPCOMING','Online','2026-10-05 11:04:57','2026-10-05 11:04:57'),(18,3,'Q-HACK INDIA 2026','National-level quantum computing hackathon hosted by QuantumRIT in collaboration with industry partners. Features 4 specialized tracks: Quantum Biotech & Chemistry, Quantum Security & Cryptography, Quantum AI & Software, and Open Quantum Innovation. Finalists compete in a 2-day in-person hackathon in Bengaluru.\n\n[Source: Devfolio | https://devfolio.co/hackathons/q-hack-india-2026]','https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80','2026-10-30 09:00:00','2026-10-31 18:00:00','2026-10-20 23:59:59',3,4,'UPCOMING','Ramaiah Institute of Technology, Bengaluru','2026-10-05 13:05:46','2026-10-05 13:05:46'),(19,2,'HackShift 2026 – IIIT Delhi','A flagship two-stage hackathon organized by the Entrepreneurship Cell at IIIT Delhi under the theme \"Cmd, Shift, Create\". Round 1 requires an online proposal slide-deck submission on campus engagement or event tooling; shortlisted teams qualify for the 24-hour on-campus hackathon at IIIT Delhi.\n\n[Source: Unstop | https://unstop.com/hackathons/hackshift-iiit-delhi]','https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80','2026-10-17 09:00:00','2026-10-18 18:00:00','2026-10-15 23:59:59',1,4,'UPCOMING','IIIT Delhi Campus, New Delhi','2026-10-05 13:05:46','2026-10-05 13:05:46'),(20,3,'ETHGlobal Mumbai 2026','Leading Ethereum ecosystem hackathon bringing global developers to Mumbai. 36 hours of non-stop building focusing on decentralized finance, smart contract security, zero-knowledge proofs, and cross-chain interoperability with mentorship from core Ethereum protocol researchers.\n\n[Source: ETHGlobal | https://ethglobal.com/events/mumbai]','https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80','2026-11-06 10:00:00','2026-11-08 17:00:00','2026-11-01 23:59:59',1,5,'UPCOMING','Jio World Convention Centre, Mumbai','2026-10-05 13:05:46','2026-10-05 13:05:46'),(21,4,'Vihaan X 2026 – IEEE DTU','Annual flagship national hackathon hosted by IEEE Delhi Technological University (DTU). Features 24-hour intense sprints in Artificial Intelligence, HealthTech, Smart City IoT, and Sustainable Tech with tracks judged by leading engineers and faculty.\n\n[Source: Unstop | https://unstop.com/hackathons/vihaan-x-dtu]','https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80','2026-11-14 09:00:00','2026-11-15 18:00:00','2026-11-09 23:59:59',1,4,'UPCOMING','Delhi Technological University (DTU), New Delhi','2026-10-05 13:05:46','2026-10-05 13:05:46'),(22,2,'Innohack 2.0 – National Innovation Sprint','Premier national innovation hackathon hosted at VIT Vellore. Bringing multidisciplinary student innovators together across HealthTech, AgriTech, and Digital Systems with industry mentorship and prototype incubation.\n\n[Source: VIT Vellore | https://vit.ac.in/events/innohack2026]','https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80','2026-11-20 09:00:00','2026-11-22 18:00:00','2026-11-12 23:59:59',2,4,'UPCOMING','VIT Vellore Campus & Online','2026-10-05 15:44:47','2026-10-05 15:44:47');
/*!40000 ALTER TABLE `hackathons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_ideas`
--

DROP TABLE IF EXISTS `project_ideas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_ideas` (
  `idea_id` int unsigned NOT NULL AUTO_INCREMENT,
  `hackathon_id` int unsigned NOT NULL,
  `submitted_by_user_id` int unsigned NOT NULL,
  `team_id` int unsigned DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abstract` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain_track` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tech_stack` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `demo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `submission_status` enum('SUBMITTED','UNDER_REVIEW','ACCEPTED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUBMITTED',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idea_id`),
  UNIQUE KEY `uq_hackathon_team_idea` (`hackathon_id`,`team_id`),
  KEY `fk_idea_submitter` (`submitted_by_user_id`),
  KEY `fk_idea_team` (`team_id`),
  KEY `idx_idea_public` (`is_public`),
  KEY `idx_idea_status` (`submission_status`),
  KEY `idx_idea_hackathon` (`hackathon_id`),
  CONSTRAINT `fk_idea_hackathon` FOREIGN KEY (`hackathon_id`) REFERENCES `hackathons` (`hackathon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_idea_submitter` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_idea_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_ideas`
--

LOCK TABLES `project_ideas` WRITE;
/*!40000 ALTER TABLE `project_ideas` DISABLE KEYS */;
INSERT INTO `project_ideas` VALUES (1,1,5,1,'NeuroScribe – Automated Clinical Notes via Whisper & LLMs','NeuroScribe uses fine-tuned speech recognition and LLMs to transcribe doctor-patient conversations into structured EHR notes in real time, reducing physician documentation burnout by 70%.','AI/ML','Python, PyTorch, Whisper, React, FastAPI','https://neuroscribe-demo.vercel.app','https://github.com/aaravpatel/neuroscribe',1,'ACCEPTED','2026-10-05 11:04:57','2026-10-05 11:04:57'),(2,2,8,2,'DecentraPay – Cross-Border Micropayments on Layer-2','A high-throughput, low-fee remittance protocol utilizing zero-knowledge rollups and decentralized liquidity pools for instant cross-border worker remittances.','FinTech','Solidity, Polygon zkEVM, Next.js, Node.js','https://decentrapay.finance','https://github.com/ananyasen/decentrapay',1,'UNDER_REVIEW','2026-10-05 11:04:57','2026-10-05 11:04:57'),(3,3,6,3,'CardioVision – Real-Time Arrhythmia Detection with Edge IoT','An ultra-low-power wearable ECG patch paired with on-device quantized neural networks for real-time arrhythmia prediction and automated emergency ambulance alerts.','HealthTech','TensorFlow Lite, C++, Flutter, Raspberry Pi Pico',NULL,'https://github.com/sneha-reddy/cardiovision',0,'SUBMITTED','2026-10-05 11:04:57','2026-10-05 11:04:57'),(4,4,13,NULL,'PhishGuard – Zero-Day Email Threat Engine','A behavioral analysis engine that detects sophisticated spear-phishing and business email compromise by evaluating syntactic intent and domain entropy.','CyberSecurity','Python, Rust, Scikit-learn, Docker','https://phishguard.security.io','https://github.com/kabirdas/phishguard',1,'SUBMITTED','2026-10-05 11:04:57','2026-10-05 11:04:57'),(5,5,14,NULL,'SolarSync – Peer-to-Peer Solar Surplus Energy Exchange','A localized energy trading platform that allows households with solar rooftop panels to trade excess kilowatt-hours with neighbors over an automated smart microgrid.','CleanTech & Energy','React, Express, ESP32, MQTT, MySQL','https://solarsync.energy','https://github.com/tanvihegde/solarsync',1,'ACCEPTED','2026-10-05 11:04:57','2026-10-05 11:04:57'),(6,6,14,NULL,'CampusLearn – Collaborative Peer Learning & Knowledge Graph','An adaptive study platform that clusters lecture concepts into interactive knowledge graphs and pairs students for targeted peer tutoring based on syllabus weaknesses.','EdTech','React, Node.js, WebSockets, Neo4j, MySQL',NULL,'https://github.com/tanvihegde/campuslearn',0,'UNDER_REVIEW','2026-10-05 11:04:57','2026-10-05 11:04:57'),(7,3,9,NULL,'BioSentinel – Non-Invasive Early Sepsis Warning Monitor','Continuous vital signs monitoring and multivariate regression alerting clinical ICU teams 6 hours prior to overt septic shock manifestation.','HealthTech','Python, XGBoost, Docker, Flask',NULL,'https://github.com/karanjoshi/biosentinel',1,'REJECTED','2026-10-05 11:04:57','2026-10-05 11:04:57'),(8,18,5,5,'PRISM-Rx – Evidence-Grounded Drug Repurposing Intelligence Platform','A biomedical intelligence engine that looks across clinical studies, drug-target databases, and literature to discover, prioritize, and explain evidence-grounded therapeutic repurposing signals.','HealthTech','Python, FastAPI, React, Graph, Scikit-learn, MySQL','https://prism-rx.ai','https://github.com/arun-2124/PRISM-Rx',1,'ACCEPTED','2026-10-05 15:44:47','2026-10-05 15:44:47'),(9,6,15,NULL,'AI Campus Assistant – Intelligent Conversational Student Hub','An AI-driven conversational assistant designed for university portals to resolve course queries, campus administrative navigation, and scheduling via localized retrieval.','AI/ML','Node.js, Express, React, OpenAI API, MySQL','https://campus-ai.edu','https://github.com/arun-balaji/campus-assistant',1,'ACCEPTED','2026-10-05 15:44:47','2026-10-05 15:44:47'),(10,5,16,NULL,'Smart Irrigation Network – IoT Automated Soil Moisture Optimization','An automated micro-irrigation system leveraging IoT soil moisture and ambient temperature sensors to optimize agricultural water distribution and conserve up to 40% water.','CleanTech & Energy','ESP32, C++, MQTT, React, MySQL','https://smart-irrigation.io','https://github.com/rahul-sharma/smart-irrigation',1,'UNDER_REVIEW','2026-10-05 15:44:47','2026-10-05 15:44:47'),(11,22,15,6,'InnoMed – Smart Triage Tele-ICU Coordination Hub','A real-time remote triage and bed-management dashboard connecting tier-2 hospitals with tertiary medical specialists during acute emergency surges.','HealthTech','React, WebRTC, Node.js, Tailwind, MySQL','https://innomed-teleicu.org','https://github.com/arun-2124/innomed',1,'SUBMITTED','2026-10-05 15:44:47','2026-10-05 15:44:47');
/*!40000 ALTER TABLE `project_ideas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `registration_id` int unsigned NOT NULL AUTO_INCREMENT,
  `hackathon_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `registration_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('REGISTERED','CONFIRMED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REGISTERED',
  PRIMARY KEY (`registration_id`),
  UNIQUE KEY `uq_user_hackathon_reg` (`hackathon_id`,`user_id`),
  KEY `idx_reg_user` (`user_id`),
  KEY `idx_reg_hackathon` (`hackathon_id`),
  CONSTRAINT `fk_reg_hackathon` FOREIGN KEY (`hackathon_id`) REFERENCES `hackathons` (`hackathon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reg_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrations`
--

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` VALUES (1,1,5,'2026-10-05 11:04:57','CONFIRMED'),(2,1,6,'2026-10-05 11:04:57','CONFIRMED'),(3,1,7,'2026-10-05 11:04:57','CONFIRMED'),(4,1,8,'2026-10-05 11:04:57','CONFIRMED'),(5,2,5,'2026-10-05 11:04:57','CONFIRMED'),(6,2,8,'2026-10-05 11:04:57','CONFIRMED'),(7,2,9,'2026-10-05 11:04:57','CONFIRMED'),(8,2,10,'2026-10-05 11:04:57','CONFIRMED'),(9,3,5,'2026-10-05 11:04:57','CONFIRMED'),(10,3,6,'2026-10-05 11:04:57','CONFIRMED'),(11,3,9,'2026-10-05 11:04:57','CONFIRMED'),(12,3,11,'2026-10-05 11:04:57','CONFIRMED'),(13,3,12,'2026-10-05 11:04:57','CONFIRMED'),(14,4,7,'2026-10-05 11:04:57','CONFIRMED'),(15,4,8,'2026-10-05 11:04:57','CONFIRMED'),(16,4,10,'2026-10-05 11:04:57','CONFIRMED'),(17,4,11,'2026-10-05 11:04:57','CONFIRMED'),(18,4,13,'2026-10-05 11:04:57','CONFIRMED'),(19,5,12,'2026-10-05 11:04:57','CONFIRMED'),(20,5,14,'2026-10-05 11:04:57','CONFIRMED'),(21,6,14,'2026-10-05 11:04:57','CONFIRMED'),(23,6,15,'2026-10-05 15:44:47','CONFIRMED'),(25,18,6,'2026-10-05 15:44:47','CONFIRMED'),(26,18,15,'2026-10-05 15:44:47','CONFIRMED'),(27,22,15,'2026-10-05 15:44:47','CONFIRMED'),(28,22,16,'2026-10-05 15:44:47','CONFIRMED'),(29,22,7,'2026-10-05 15:44:47','CONFIRMED'),(92,18,5,'2026-10-05 15:17:00','CONFIRMED');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submission_files`
--

DROP TABLE IF EXISTS `submission_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submission_files` (
  `file_id` int unsigned NOT NULL AUTO_INCREMENT,
  `idea_id` int unsigned NOT NULL,
  `file_type` enum('PPT','PDF') COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_bytes` int unsigned NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`file_id`),
  KEY `idx_file_idea` (`idea_id`),
  CONSTRAINT `fk_sf_idea` FOREIGN KEY (`idea_id`) REFERENCES `project_ideas` (`idea_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submission_files`
--

LOCK TABLES `submission_files` WRITE;
/*!40000 ALTER TABLE `submission_files` DISABLE KEYS */;
INSERT INTO `submission_files` VALUES (1,1,'PPT','idea_1_1728000001_pitch.pptx','NeuroScribe_Pitch_Deck.pptx','uploads/submissions/idea_1_1728000001_pitch.pptx',3450000,'2026-10-05 11:04:57'),(2,1,'PDF','idea_1_1728000002_paper.pdf','NeuroScribe_Technical_Architecture.pdf','uploads/submissions/idea_1_1728000002_paper.pdf',1890000,'2026-10-05 11:04:57'),(3,2,'PDF','idea_2_1728000003_whitepaper.pdf','DecentraPay_ZK_Whitepaper.pdf','uploads/submissions/idea_2_1728000003_whitepaper.pdf',2450000,'2026-10-05 11:04:57'),(4,3,'PPT','idea_3_1728000004_slides.pptx','CardioVision_Hardware_Slides.pptx','uploads/submissions/idea_3_1728000004_slides.pptx',4520000,'2026-10-05 11:04:57'),(5,4,'PDF','idea_4_1728000005_report.pdf','PhishGuard_Model_Benchmark_Report.pdf','uploads/submissions/idea_4_1728000005_report.pdf',1230000,'2026-10-05 11:04:57'),(6,5,'PPT','idea_5_1728000006_presentation.pptx','SolarSync_CleanTech_Presentation.pptx','uploads/submissions/idea_5_1728000006_presentation.pptx',5120000,'2026-10-05 11:04:57'),(7,5,'PDF','idea_5_1728000007_schematic.pdf','SolarSync_Hardware_Schematic.pdf','uploads/submissions/idea_5_1728000007_schematic.pdf',3890000,'2026-10-05 11:04:57'),(8,7,'PDF','PRISM-Rx_Complete_Idea_and_Video_Summary.pdf','PRISM-Rx_Complete_Idea_and_Video_Summary.pdf','uploads/submissions/sub_1791213420952_ac3442c0.pdf',146800,'2026-10-05 11:04:57'),(9,9,'PDF','AI_Campus_Assistant_Architecture.pdf','AI_Campus_Assistant_Architecture.pdf','uploads/submissions/idea_1_1728000002_paper.pdf',1890000,'2026-10-05 15:44:47'),(10,10,'PPT','Smart_Irrigation_IoT_Deck.pptx','Smart_Irrigation_IoT_Deck.pptx','uploads/submissions/idea_5_1728000006_presentation.pptx',5120000,'2026-10-05 15:44:47'),(11,11,'PDF','InnoMed_Triage_Proposal.pdf','InnoMed_Triage_Proposal.pdf','uploads/submissions/idea_2_1728000003_whitepaper.pdf',2450000,'2026-10-05 15:44:47');
/*!40000 ALTER TABLE `submission_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `membership_id` int unsigned NOT NULL AUTO_INCREMENT,
  `team_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `role_in_team` enum('LEADER','MEMBER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`membership_id`),
  UNIQUE KEY `uq_team_member` (`team_id`,`user_id`),
  KEY `idx_tm_user` (`user_id`),
  KEY `idx_tm_team` (`team_id`),
  CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (1,1,5,'LEADER','2026-10-05 11:04:57'),(2,1,6,'MEMBER','2026-10-05 11:04:57'),(3,1,7,'MEMBER','2026-10-05 11:04:57'),(4,2,8,'LEADER','2026-10-05 11:04:57'),(5,2,9,'MEMBER','2026-10-05 11:04:57'),(6,3,6,'LEADER','2026-10-05 11:04:57'),(7,3,11,'MEMBER','2026-10-05 11:04:57'),(8,3,12,'MEMBER','2026-10-05 11:04:57'),(9,4,7,'LEADER','2026-10-05 11:04:57'),(10,4,10,'MEMBER','2026-10-05 11:04:57'),(71,5,5,'LEADER','2026-10-05 15:44:47'),(72,5,6,'MEMBER','2026-10-05 15:44:47'),(73,6,15,'LEADER','2026-10-05 15:44:47'),(74,6,16,'MEMBER','2026-10-05 15:44:47'),(145,44,5,'LEADER','2026-10-05 16:03:37');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `team_id` int unsigned NOT NULL AUTO_INCREMENT,
  `hackathon_id` int unsigned NOT NULL,
  `leader_id` int unsigned NOT NULL,
  `team_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_code` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_id`),
  UNIQUE KEY `team_code` (`team_code`),
  UNIQUE KEY `uq_hackathon_team_name` (`hackathon_id`,`team_name`),
  KEY `fk_team_leader` (`leader_id`),
  KEY `idx_team_hackathon` (`hackathon_id`),
  CONSTRAINT `fk_team_hackathon` FOREIGN KEY (`hackathon_id`) REFERENCES `hackathons` (`hackathon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_team_leader` FOREIGN KEY (`leader_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,1,5,'NeuralKnights','NK-AI2026','2026-10-05 11:04:57'),(2,2,8,'BlockBusters','BB-W32026','2026-10-05 11:04:57'),(3,3,6,'MediPulse','MP-HT2026','2026-10-05 11:04:57'),(4,4,7,'CyberSentinels','CS-SEC2026','2026-10-05 11:04:57'),(5,18,5,'QuantumPioneers','QP-QH2026','2026-10-05 15:44:47'),(6,22,15,'InnoForge','IF-IH2026','2026-10-05 15:44:47'),(44,2,5,'87','TM-PZ9HFS','2026-10-05 16:03:37');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('PARTICIPANT','ORGANIZER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PARTICIPANT',
  `college_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Arjun Admin','admin@hackhub.com','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','ADMIN','HackHub Central Administration','+91 9800000001','2026-10-05 11:04:57','2026-10-05 11:17:16'),(2,'Dr. Ramesh Sharma','ramesh.sharma@mit.edu','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','ORGANIZER','MIT Department of Computer Science','+91 9876543210','2026-10-05 11:04:57','2026-10-05 11:17:16'),(3,'Prof. Priya Iyer','priya.iyer@iitb.ac.in','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','ORGANIZER','IIT Bombay Innovation & Entrepreneurship Cell','+91 9876543211','2026-10-05 11:04:57','2026-10-05 11:17:16'),(4,'Vikram Malhotra','vikram@techhub.org','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','ORGANIZER','National Coding Consortium','+91 9876543212','2026-10-05 11:04:57','2026-10-05 11:17:16'),(5,'Aarav Patel','aarav.patel@student.mit.edu','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','MIT Pune','+91 9123456701','2026-10-05 11:04:57','2026-10-05 11:17:16'),(6,'Sneha Reddy','sneha.reddy@student.iitb.ac.in','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','IIT Bombay','+91 9123456702','2026-10-05 11:04:57','2026-10-05 11:17:16'),(7,'Rohan Verma','rohan.v@vit.ac.in','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','VIT Vellore','+91 9123456703','2026-10-05 11:04:57','2026-10-05 11:17:16'),(8,'Ananya Sen','ananya.sen@bits.ac.in','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','BITS Pilani','+91 9123456704','2026-10-05 11:04:57','2026-10-05 11:17:16'),(9,'Karan Joshi','karan.j@dtu.ac.in','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','Delhi Technological University','+91 9123456705','2026-10-05 11:04:57','2026-10-05 11:17:16'),(10,'Diya Nair','diya.nair@nitc.ac.in','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','NIT Calicut','+91 9123456706','2026-10-05 11:04:57','2026-10-05 11:17:16'),(11,'Siddharth Rao','sid.rao@iiit.ac.in','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','IIIT Hyderabad','+91 9123456707','2026-10-05 11:04:57','2026-10-05 11:17:16'),(12,'Meera Krishnan','meera.k@pes.edu','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','PES University Bengaluru','+91 9123456708','2026-10-05 11:04:57','2026-10-05 11:17:16'),(13,'Kabir Das','kabir.das@srmist.edu.in','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','SRM University Chennai','+91 9123456709','2026-10-05 11:04:57','2026-10-05 11:17:16'),(14,'Tanvi Hegde','tanvi.h@manipal.edu','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','Manipal Institute of Technology','+91 9123456710','2026-10-05 11:04:57','2026-10-05 11:17:16'),(15,'Arun Balaji','arun@gmail.com','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','VIT Vellore','+91 9876500001','2026-10-05 15:44:47','2026-10-05 15:44:47'),(16,'Rahul Sharma','rahul@gmail.com','$2a$10$SL/0MKW1a8o6z7patl1PSuadrV0S9TAFiPgEMNgqzMJimFhlIa9iW','PARTICIPANT','VIT Vellore','+91 9876500002','2026-10-05 15:44:47','2026-10-05 15:44:47');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08 14:05:31
