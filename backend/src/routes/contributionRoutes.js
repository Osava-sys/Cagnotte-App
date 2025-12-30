const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const { authenticate } = require('../middlewares/auth');
const { validateContribution } = require('../middlewares/validation');

router.get('/campaign/:campaignId', contributionController.getContributionsByCampaign);
router.get('/user/my-contributions', authenticate, contributionController.getUserContributions);
router.post('/campaign/:campaignId', authenticate, validateContribution, contributionController.createContribution);

module.exports = router;

