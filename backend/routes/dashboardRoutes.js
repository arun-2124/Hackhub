const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/participant', verifyToken, checkRole('PARTICIPANT', 'ADMIN'), dashboardController.getParticipantDashboard);
router.get('/organizer', verifyToken, checkRole('ORGANIZER', 'ADMIN'), dashboardController.getOrganizerDashboard);
router.get('/admin', verifyToken, checkRole('ADMIN'), dashboardController.getAdminDashboard);

module.exports = router;
