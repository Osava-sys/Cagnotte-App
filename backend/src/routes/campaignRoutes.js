const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { authenticate } = require('../middlewares/auth');
const { validateCampaign } = require('../middlewares/validation');

router.get('/', campaignController.getAllCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/', authenticate, validateCampaign, campaignController.createCampaign);
router.put('/:id', authenticate, campaignController.updateCampaign);
router.delete('/:id', authenticate, campaignController.deleteCampaign);

module.exports = router;

