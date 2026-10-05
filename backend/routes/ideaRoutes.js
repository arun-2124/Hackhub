const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');
const { verifyToken, optionalAuth } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public and discoverable routes
router.get('/public', ideaController.getPublicIdeas);
router.get('/files/:fileId/download', optionalAuth, ideaController.downloadFile);
router.get('/:id', optionalAuth, ideaController.getIdeaById);

// Submissions by participants
router.post('/', verifyToken, ideaController.submitIdea);
router.post('/:id/upload', verifyToken, upload.single('file'), ideaController.uploadSubmissionFile);
router.put('/:id', verifyToken, ideaController.updateIdea);
router.delete('/:id', verifyToken, ideaController.deleteIdea);

// Review & Evaluation routes (Organizer or Admin)
router.put('/:id/status', verifyToken, checkRole('ORGANIZER', 'ADMIN'), ideaController.updateStatus);
router.get('/hackathon/:hackathonId', verifyToken, checkRole('ORGANIZER', 'ADMIN'), ideaController.getHackathonSubmissions);

module.exports = router;
