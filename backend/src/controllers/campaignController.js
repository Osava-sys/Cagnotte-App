const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');
const { sendCampaignApproved, sendCampaignUpdateNotification } = require('../utils/emailService');

// Utilitaire pour trouver une campagne par ID ou slug
const findCampaignByIdOrSlug = async (idOrSlug, populateOptions = null) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  let query;

  if (isObjectId) {
    query = Campaign.findById(idOrSlug);
  } else {
    query = Campaign.findOne({ slug: idOrSlug });
  }

  if (populateOptions) {
    query = query.populate(populateOptions);
  }

  return query;
};

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
    const campaign = await findCampaignByIdOrSlug(
      req.params.id,
      { path: 'creator', select: 'firstName lastName email avatar' }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    // Get recent contributions with populated contributor info
    const contributions = await Contribution.find({
      campaign: campaign._id,
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
    console.log('[CAMPAIGN] Création - Données reçues:', JSON.stringify(req.body, null, 2));

    // Le créateur peut choisir: 'draft' (brouillon) ou 'active' (publié directement)
    // Par défaut, la campagne est active
    const allowedStatuses = ['draft', 'active'];
    const requestedStatus = req.body.status;
    const finalStatus = allowedStatuses.includes(requestedStatus) ? requestedStatus : 'active';

    const campaignData = {
      ...req.body,
      creator: req.user.id,
      status: finalStatus
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

    console.log('[CAMPAIGN] Création réussie:', campaign._id);

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('[CAMPAIGN] Erreur création:', error.message);
    console.error('[CAMPAIGN] Détails:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await findCampaignByIdOrSlug(req.params.id);

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
    const campaign = await findCampaignByIdOrSlug(req.params.id);

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
    await Contribution.deleteMany({ campaign: campaign._id });

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
    const campaign = await findCampaignByIdOrSlug(req.params.id);

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
    const campaign = await findCampaignByIdOrSlug(
      req.params.id,
      { path: 'creator', select: 'email firstName lastName username preferences' }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    const wasActive = campaign.status === 'active';
    campaign.isVerified = !campaign.isVerified;
    campaign.verificationNotes = req.body.notes || campaign.verificationNotes;

    // Si vérifiée et en attente, passer à active
    if (campaign.isVerified && campaign.status === 'pending') {
      campaign.status = 'active';
    }

    await campaign.save();

    // Envoyer un email au créateur si la campagne vient d'être approuvée
    if (!wasActive && campaign.status === 'active' && campaign.creator?.email) {
      if (campaign.creator?.preferences?.emailNotifications !== false) {
        sendCampaignApproved(campaign.creator, campaign)
          .catch(err => console.error('[CAMPAIGN] Erreur email approbation:', err.message));
      }
    }

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

// Track campaign share on social media
exports.trackShare = async (req, res) => {
  try {
    const { platform } = req.body;
    const validPlatforms = ['facebook', 'twitter', 'whatsapp', 'linkedin', 'email', 'copy', 'native'];

    if (!platform || !validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Plateforme de partage invalide'
      });
    }

    const campaign = await findCampaignByIdOrSlug(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    // Incrémenter le compteur de partages
    if (!campaign.stats) {
      campaign.stats = {};
    }
    campaign.stats.shares = (campaign.stats.shares || 0) + 1;

    // Optionnel: tracker par plateforme
    if (!campaign.stats.sharesByPlatform) {
      campaign.stats.sharesByPlatform = {};
    }
    campaign.stats.sharesByPlatform[platform] = (campaign.stats.sharesByPlatform[platform] || 0) + 1;

    await campaign.save();

    res.json({
      success: true,
      data: {
        totalShares: campaign.stats.shares,
        platform
      },
      message: 'Partage enregistré'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add campaign update and notify contributors
exports.addCampaignUpdate = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Le titre et le contenu sont requis'
      });
    }

    const campaign = await findCampaignByIdOrSlug(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    // Vérifier les permissions
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé'
      });
    }

    // Ajouter la mise à jour
    const update = {
      title,
      content,
      date: new Date(),
      images: req.body.images || []
    };

    campaign.updates.push(update);
    await campaign.save();

    // Envoyer les notifications aux contributeurs (en arrière-plan)
    const notifyContributors = async () => {
      try {
        // Récupérer tous les contributeurs uniques avec leurs emails
        const contributions = await Contribution.find({
          campaign: campaign._id,
          status: 'confirmed',
          'contributor.email': { $exists: true, $ne: '' }
        });

        // Créer un set d'emails uniques
        const emailsSent = new Set();

        for (const contribution of contributions) {
          const email = contribution.contributor?.email;
          if (email && !emailsSent.has(email)) {
            emailsSent.add(email);

            const contributor = {
              email,
              firstName: contribution.contributor?.name?.split(' ')[0] || '',
              name: contribution.contributor?.name || ''
            };

            await sendCampaignUpdateNotification(contributor, campaign, update);
          }
        }

        console.log(`[CAMPAIGN] ${emailsSent.size} contributeurs notifiés de la mise à jour`);
      } catch (err) {
        console.error('[CAMPAIGN] Erreur notification contributeurs:', err.message);
      }
    };

    // Lancer les notifications en arrière-plan
    if (req.body.notifyContributors !== false) {
      notifyContributors();
    }

    res.json({
      success: true,
      data: {
        update,
        campaign
      },
      message: 'Mise à jour publiée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};