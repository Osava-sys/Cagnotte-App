const Contribution = require('../models/Contribution');
const Campaign = require('../models/Campaign');
const User = require('../models/User');

// Get all contributions for a campaign
exports.getContributionsByCampaign = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contributions = await Contribution.find({ 
      campaign: req.params.campaignId,
      status: 'confirmed'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Contribution.countDocuments({ 
      campaign: req.params.campaignId,
      status: 'confirmed'
    });

    res.json({
      success: true,
      data: contributions,
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

// Create new contribution
exports.createContribution = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        error: 'Campagne non trouvée' 
      });
    }
    
    // Check if campaign is active
    if (!campaign.isActive()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cette campagne n\'est plus active' 
      });
    }
    
    // Prepare contribution data
    const contributionData = {
      ...req.body,
      campaign: req.params.campaignId
    };

    //  Gestion des champs payment ===
    // Assurer que payment existe
    if (!contributionData.payment) {
      contributionData.payment = {};
    }
    
    // Calculer les frais si non fournis (ex: 2.9% + 0.30€ pour Stripe)
    if (contributionData.payment.fees === undefined) {
      contributionData.payment.fees = (contributionData.amount * 0.029) + 0.30;
    }
    
    // Calculer le montant net si non fourni
    if (contributionData.payment.netAmount === undefined) {
      contributionData.payment.netAmount = contributionData.amount - contributionData.payment.fees;
    }
    
    // Définir les valeurs par défaut pour payment
    // Note: Le statut devrait être 'pending' jusqu'à confirmation du paiement
    // Pour les tests/développement, on peut le mettre à 'completed'
    // En production, intégrer avec Stripe/PayPal et confirmer après paiement réel
    contributionData.payment.method = contributionData.payment.method || 'stripe'; // Valeur par défaut requise par la validation
    contributionData.payment.status = contributionData.payment.status || 'pending';
    contributionData.payment.transactionId = contributionData.payment.transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    contributionData.payment.currency = contributionData.payment.currency || 'EUR';
    
    // Définir le statut de la contribution (pending jusqu'à confirmation du paiement)
    contributionData.status = contributionData.status || 'pending';
    
    // Calculer les frais de plateforme (5%)
    if (contributionData.platformFee === undefined) {
      contributionData.platformFee = contributionData.amount * 0.05;
    }

    // === Gestion du contributor selon les 4 scénarios ===
    
    // Scénario 4 : Invité anonyme
    if (req.body.isAnonymous === true) {
      contributionData.isAnonymous = true;
      // Ne pas définir contributor pour les contributions anonymes
      // Le schéma Mongoose gère cela avec required: function() { return !this.isAnonymous; }
      delete contributionData.contributor;
    }
    // Scénario 1 : Utilisateur connecté (veut utiliser ses infos)
    else if (req.user && !req.body.contributor) {
      contributionData.isAnonymous = false;
      contributionData.contributor = {
        userId: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        message: req.body.message || req.body.contributor?.message || ''
      };
    }
    // Scénario 2 : Utilisateur connecté (veut utiliser d'autres infos)
    else if (req.user && req.body.contributor) {
      contributionData.isAnonymous = false;
      contributionData.contributor = {
        ...req.body.contributor,
        userId: req.user.id, // Ajouter userId même si d'autres infos sont fournies
        message: req.body.contributor.message || req.body.message || ''
      };
    }
    // Scénario 3 : Invité non anonyme
    else if (!req.user && req.body.contributor) {
      contributionData.isAnonymous = false;
      contributionData.contributor = {
        name: req.body.contributor.name,
        email: req.body.contributor.email,
        message: req.body.contributor.message || ''
        // Pas de userId car invité
      };
    }
    // Cas invalide : invité non anonyme sans informations
    else {
      return res.status(400).json({
        success: false,
        error: 'Pour une contribution non anonyme, veuillez fournir vos informations dans le champ "contributor" (name, email) ou définir "isAnonymous" à true'
      });
    }
  
    // Create contribution
    const contribution = new Contribution(contributionData);
    
    await contribution.save();

    res.status(201).json({
      success: true,
      data: contribution,
      message: 'Merci pour votre contribution!'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};
// Get user contributions
exports.getUserContributions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contributions = await Contribution.find({ 
      'contributor.userId': req.user.id,
      status: 'confirmed'
    })
    .populate('campaign', 'title slug images.mainImage goalAmount currentAmount status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Contribution.countDocuments({ 
      'contributor.userId': req.user.id,
      status: 'confirmed'
    });

    res.json({
      success: true,
      data: contributions,
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

// Get contribution statistics
exports.getContributionStats = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const stats = await Contribution.getStatistics(campaignId);
    
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

// Get top contributors
exports.getTopContributors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topContributors = await Contribution.getTopContributors(parseInt(limit));
    
    res.json({
      success: true,
      data: topContributors
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};