const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth');
const { validateContribution } = require('../middlewares/validation');

// Public routes
router.get('/campaign/:campaignId', contributionController.getContributionsByCampaign);
router.get('/stats/:campaignId', contributionController.getContributionStats);
router.get('/top-contributors', contributionController.getTopContributors);

// Protected routes (nécessite authentification)
router.get('/user/my-contributions', authenticate, contributionController.getUserContributions);

// Route de contribution (authentification optionnelle)
router.post('/campaign/:campaignId', optionalAuthenticate, validateContribution, contributionController.createContribution);

module.exports = router;