# HackHub – Hackathon Management & Idea Sharing Platform

HackHub is a full-stack DBMS platform for academic evaluation and production-grade hackathon management. It allows students to discover hackathons, register, create/join teams, submit project ideas with presentation documents (PPT/PDF), and explore publicly shared projects.

---

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Axios
- **Backend**: Node.js + Express.js REST API
- **Database**: MySQL 8.4 (InnoDB engine, 3NF normalized)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **File Storage**: Local filesystem (`backend/uploads/submissions/`) with metadata stored in MySQL

---

## System Architecture & Features
- **Role-Based Access Control (RBAC)**: Distinct permissions for `PARTICIPANT`, `ORGANIZER`, and `ADMIN`.
- **Database Schema**: 10 normalized tables with primary keys, foreign keys (`ON DELETE`/`ON UPDATE` policies), composite unique constraints, `CHECK` constraints, and performance indexes.
- **ACID Transactions**: Multi-table transactions for team formation, team joining (with row locking to avoid overbooking), and submissions.
- **RESTful Endpoints**: Full CRUD operations across authentication, hackathons, registrations, teams, project ideas, announcements, and role-specific dashboards.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server 8.0+

### Database Setup
1. Execute `backend/sql/schema.sql` to initialize `hackhub_db` and tables.
2. Execute `backend/sql/seed.sql` to populate sample data.

### Backend Setup
1. `cd backend`
2. `cp .env.example .env` (Configure your database credentials)
3. `npm install`
4. `npm start`
5. Run automated tests: `npm test`
