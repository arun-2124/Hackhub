const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const hackathonRoutes = require('./hackathonRoutes');
const registrationRoutes = require('./registrationRoutes');
const teamRoutes = require('./teamRoutes');
const ideaRoutes = require('./ideaRoutes');
const announcementRoutes = require('./announcementRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/auth', authRoutes);
router.use('/hackathons', hackathonRoutes);
router.use('/registrations', registrationRoutes);
router.use('/teams', teamRoutes);
router.use('/ideas', ideaRoutes);
router.use('/announcements', announcementRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
