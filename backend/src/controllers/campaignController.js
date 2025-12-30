const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');

// Get all campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('creator', 'username firstName lastName')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single campaign
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'username firstName lastName')
      .populate('contributors', 'username firstName lastName');
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const contributions = await Contribution.find({ campaign: req.params.id })
      .populate('contributor', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ campaign, contributions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new campaign
exports.createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign({
      ...req.body,
      creator: req.user.id
    });
    await campaign.save();
    await campaign.populate('creator', 'username firstName lastName');
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    Object.assign(campaign, req.body);
    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await Contribution.deleteMany({ campaign: req.params.id });
    await campaign.deleteOne();
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

