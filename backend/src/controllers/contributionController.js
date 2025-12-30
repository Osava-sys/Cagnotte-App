const Contribution = require('../models/Contribution');
const Campaign = require('../models/Campaign');

// Get all contributions for a campaign
exports.getContributionsByCampaign = async (req, res) => {
  try {
    const contributions = await Contribution.find({ campaign: req.params.campaignId })
      .populate('contributor', 'username firstName lastName')
      .sort({ createdAt: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new contribution
exports.createContribution = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    if (campaign.status !== 'active') {
      return res.status(400).json({ error: 'Campaign is not active' });
    }
    
    const contribution = new Contribution({
      ...req.body,
      contributor: req.user.id,
      campaign: req.params.campaignId
    });
    
    await contribution.save();
    
    // Update campaign amount and contributors
    campaign.currentAmount += contribution.amount;
    if (!campaign.contributors.includes(req.user.id)) {
      campaign.contributors.push(req.user.id);
    }
    
    // Check if goal is reached
    if (campaign.currentAmount >= campaign.goal) {
      campaign.status = 'completed';
    }
    
    await campaign.save();
    
    await contribution.populate('contributor', 'username firstName lastName');
    res.status(201).json(contribution);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user contributions
exports.getUserContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ contributor: req.user.id })
      .populate('campaign', 'title goal currentAmount')
      .sort({ createdAt: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

