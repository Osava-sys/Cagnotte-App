const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');

// Get all campaigns with filters and pagination
exports.getAllCampaigns = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status, 
      minAmount, 
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (minAmount) filter.goalAmount = { $gte: parseFloat(minAmount) };
    if (maxAmount) filter.goalAmount = { ...filter.goalAmount, $lte: parseFloat(maxAmount) };

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const campaigns = await Campaign.find(filter)
      .populate('creator', 'firstName lastName email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Campaign.countDocuments(filter);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get single campaign with contributions
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'firstName lastName email avatar');
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        error: 'Campagne non trouvée' 
      });
    }

    // Get recent contributions with populated contributor info
    const contributions = await Contribution.find({ 
      campaign: req.params.id,
      status: 'confirmed'
    })
    .populate('contributor.userId', 'firstName lastName email avatar')
    .sort({ createdAt: -1 })
    .limit(50);

    // Increment view count
    campaign.stats.views += 1;
    await campaign.save();

    res.json({
      success: true,
      data: {
        campaign,
        contributions
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Create new campaign
exports.createCampaign = async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      creator: req.user.id,
      // Garde le statut envoyé dans le body, sinon 'pending' par défaut
      status: req.body.status || 'pending'
    };

    // Gérer l'image principale si fournie via URL (pour compatibilité)
    // Note: Pour upload de fichier, utiliser l'endpoint POST /api/campaigns/:id/image
    if (req.body.imageUrl && !campaignData.images) {
      campaignData.images = {
        mainImage: req.body.imageUrl
      };
    } else if (req.body.imageUrl && campaignData.images) {
      campaignData.images.mainImage = req.body.imageUrl;
    }

    const campaign = new Campaign(campaignData);
    await campaign.save();

    await campaign.populate('creator', 'firstName lastName email avatar');

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        error: 'Campagne non trouvée' 
      });
    }
    
    // Check permissions
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Non autorisé' 
      });
    }
    
   // Only allow certain fields to be updated
const allowedUpdates = [
  'title', 'description', 'shortDescription', 'images', 
  'category', 'tags', 'story', 'updates', 'rewards', 'status'
];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        campaign[field] = req.body[field];
      }
    });
    
    campaign.updatedAt = new Date();
    await campaign.save();
    
    await campaign.populate('creator', 'firstName lastName email avatar');
    
    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        error: 'Campagne non trouvée' 
      });
    }
    
    // Check permissions
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Non autorisé' 
      });
    }
    
    // Delete associated contributions
    await Contribution.deleteMany({ campaign: req.params.id });
    
    // Delete campaign
    await campaign.deleteOne();
    
    res.json({
      success: true,
      message: 'Campagne supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get campaign statistics
exports.getCampaignStats = async (req, res) => {
  try {
    const stats = await Campaign.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Search campaigns
exports.searchCampaigns = async (req, res) => {
  try {
    const { q: query, ...filters } = req.query;
    
    const campaigns = await Campaign.search(query, filters);
    
    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Feature campaign (admin/moderator only)
exports.featureCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        error: 'Campagne non trouvée' 
      });
    }
    
    campaign.isFeatured = !campaign.isFeatured;
    await campaign.save();
    
    res.json({
      success: true,
      data: campaign,
      message: campaign.isFeatured 
        ? 'Campagne mise en vedette' 
        : 'Campagne retirée de la vedette'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Verify campaign (admin/moderator only)
exports.verifyCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        error: 'Campagne non trouvée' 
      });
    }
    
    campaign.isVerified = !campaign.isVerified;
    campaign.verificationNotes = req.body.notes || campaign.verificationNotes;
    
    // Si vérifiée et en attente, passer à active
    if (campaign.isVerified && campaign.status === 'pending') {
      campaign.status = 'active';
    }
    
    await campaign.save();
    
    res.json({
      success: true,
      data: campaign,
      message: campaign.isVerified 
        ? 'Campagne vérifiée' 
        : 'Vérification retirée'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};