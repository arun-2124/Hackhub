const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Public routes
router.get('/tags', hackathonController.getTags);
router.get('/', hackathonController.getAllHackathons);
router.get('/:id', hackathonController.getHackathonById);

// Protected routes (Organizer / Admin only)
router.post('/', verifyToken, checkRole('ORGANIZER', 'ADMIN'), hackathonController.createHackathon);
router.put('/:id', verifyToken, checkRole('ORGANIZER', 'ADMIN'), hackathonController.updateHackathon);
router.delete('/:id', verifyToken, checkRole('ORGANIZER', 'ADMIN'), hackathonController.deleteHackathon);

module.exports = router;
