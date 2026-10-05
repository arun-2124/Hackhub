const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/hackathon/:hackathonId', announcementController.getAnnouncementsByHackathon);
router.post('/hackathon/:hackathonId', verifyToken, checkRole('ORGANIZER', 'ADMIN'), announcementController.createAnnouncement);
router.delete('/:id', verifyToken, checkRole('ORGANIZER', 'ADMIN'), announcementController.deleteAnnouncement);

module.exports = router;
