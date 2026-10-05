const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, teamController.createTeam);
router.post('/join', verifyToken, teamController.joinTeam);
router.get('/hackathon/:hackathonId/my-team', verifyToken, teamController.getMyTeamForHackathon);
router.get('/:id', verifyToken, teamController.getTeamById);
router.delete('/:id/members/:userId', verifyToken, teamController.removeMember);

module.exports = router;
