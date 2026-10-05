const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.post('/', verifyToken, registrationController.registerForHackathon);
router.get('/my', verifyToken, registrationController.getMyRegistrations);
router.get('/hackathon/:hackathonId', verifyToken, checkRole('ORGANIZER', 'ADMIN'), registrationController.getHackathonRegistrations);
router.delete('/:registrationId', verifyToken, registrationController.cancelRegistration);

module.exports = router;
