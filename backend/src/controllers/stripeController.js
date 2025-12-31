/**
 * Contrôleur Stripe - Gestion des paiements
 */

const { stripe, stripeConfig } = require('../config/stripe');
const Contribution = require('../models/Contribution');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const config = require('../config/env');
const {
  sendContributionConfirmation,
  sendNewContributionNotification,
  sendCampaignGoalReached
} = require('../utils/emailService');

/**
 * Créer une session de checkout Stripe
 * POST /api/payments/create-checkout-session
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { 
      campaignId, 
      amount, 
      contributorName, 
      contributorEmail, 
      message,
      isAnonymous 
    } = req.body;

    // Validation du montant
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Le montant doit être d\'au moins 1€'
      });
    }

    // Vérifier que la campagne existe et est active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    if (!campaign.isActive()) {
      return res.status(400).json({
        success: false,
        error: 'Cette campagne n\'est plus active'
      });
    }

    // Préparer les métadonnées
    const metadata = {
      campaignId: campaignId,
      campaignTitle: campaign.title,
      contributorName: isAnonymous ? 'Anonyme' : (contributorName || ''),
      contributorEmail: contributorEmail || '',
      message: message || '',
      isAnonymous: isAnonymous ? 'true' : 'false',
      userId: req.user?.id || ''
    };

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: stripeConfig.currency,
            product_data: {
              name: `Contribution à: ${campaign.title}`,
              description: `Soutien à la cagnotte "${campaign.title}"`,
              images: campaign.images?.mainImage 
                ? [`${config.backendUrl}${campaign.images.mainImage}`] 
                : []
            },
            unit_amount: Math.round(amount * 100), // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      metadata,
      customer_email: contributorEmail || undefined,
      success_url: `${config.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/payment/cancel?campaign_id=${campaignId}`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Expire dans 30 minutes
    });

    // Créer une contribution en statut pending
    const contributionData = {
      amount,
      campaign: campaignId,
      isAnonymous: isAnonymous || false,
      status: 'pending',
      payment: {
        method: 'stripe',
        transactionId: session.id,
        status: 'pending',
        currency: stripeConfig.currency.toUpperCase(),
        fees: (amount * 0.029) + 0.30, // Estimation des frais Stripe
        netAmount: amount - ((amount * 0.029) + 0.30)
      },
      platformFee: amount * 0.05,
      stripeSessionId: session.id
    };

    // Ajouter les infos du contributeur
    if (!isAnonymous) {
      contributionData.contributor = {
        name: contributorName || (req.user ? `${req.user.firstName} ${req.user.lastName}` : ''),
        email: contributorEmail || req.user?.email || '',
        message: message || ''
      };
      
      if (req.user) {
        contributionData.contributor.userId = req.user.id;
      }
    }

    const contribution = new Contribution(contributionData);
    await contribution.save();

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        sessionUrl: session.url,
        contributionId: contribution._id
      }
    });

  } catch (error) {
    console.error('❌ Erreur création session Stripe:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la session de paiement',
      details: config.isDevelopment() ? error.message : undefined
    });
  }
};

/**
 * Créer un Payment Intent (pour paiement intégré)
 * POST /api/payments/create-payment-intent
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { 
      campaignId, 
      amount, 
      contributorName, 
      contributorEmail, 
      message,
      isAnonymous 
    } = req.body;

    // Validation
    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Le montant doit être d\'au moins 1€'
      });
    }

    // Vérifier la campagne
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    if (!campaign.isActive()) {
      return res.status(400).json({
        success: false,
        error: 'Cette campagne n\'est plus active'
      });
    }

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // En centimes
      currency: stripeConfig.currency,
      metadata: {
        campaignId,
        campaignTitle: campaign.title,
        contributorName: isAnonymous ? 'Anonyme' : (contributorName || ''),
        contributorEmail: contributorEmail || '',
        message: message || '',
        isAnonymous: isAnonymous ? 'true' : 'false',
        userId: req.user?.id || ''
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Créer la contribution en pending
    const contributionData = {
      amount,
      campaign: campaignId,
      isAnonymous: isAnonymous || false,
      status: 'pending',
      payment: {
        method: 'stripe',
        transactionId: paymentIntent.id,
        status: 'pending',
        currency: stripeConfig.currency.toUpperCase(),
        fees: (amount * 0.029) + 0.30,
        netAmount: amount - ((amount * 0.029) + 0.30)
      },
      platformFee: amount * 0.05,
      stripePaymentIntentId: paymentIntent.id
    };

    if (!isAnonymous) {
      contributionData.contributor = {
        name: contributorName || (req.user ? `${req.user.firstName} ${req.user.lastName}` : ''),
        email: contributorEmail || req.user?.email || '',
        message: message || ''
      };
      
      if (req.user) {
        contributionData.contributor.userId = req.user.id;
      }
    }

    const contribution = new Contribution(contributionData);
    await contribution.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        contributionId: contribution._id
      }
    });

  } catch (error) {
    console.error('❌ Erreur création Payment Intent:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du paiement',
      details: config.isDevelopment() ? error.message : undefined
    });
  }
};

/**
 * Vérifier le statut d'une session Checkout
 * GET /api/payments/session/:sessionId
 */
exports.getSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Trouver la contribution associée
    const contribution = await Contribution.findOne({
      'payment.transactionId': sessionId
    }).populate('campaign', 'title slug');

    res.json({
      success: true,
      data: {
        status: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total / 100,
        currency: session.currency,
        contribution: contribution || null
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération session:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du paiement'
    });
  }
};

/**
 * Webhook Stripe - Gérer les événements
 * POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      req.body, // Raw body
      sig,
      stripeConfig.webhookSecret
    );
  } catch (err) {
    console.error('❌ Erreur signature webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📩 Webhook Stripe reçu: ${event.type}`);

  // Gérer les différents types d'événements
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`⚠️ Événement non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur traitement webhook:', error);
    res.status(500).json({ error: 'Erreur traitement webhook' });
  }
};

/**
 * Gérer une session checkout complétée
 */
async function handleCheckoutSessionCompleted(session) {
  console.log(`✅ Session checkout complétée: ${session.id}`);

  // Trouver et mettre à jour la contribution
  const contribution = await Contribution.findOne({
    'payment.transactionId': session.id
  }).populate('campaign');

  if (!contribution) {
    console.error(`❌ Contribution non trouvée pour session: ${session.id}`);
    return;
  }

  // Récupérer la campagne avec le créateur
  const campaign = await Campaign.findById(contribution.campaign._id || contribution.campaign)
    .populate('creator', 'email firstName lastName username preferences');

  // Stocker l'état précédent pour détecter si l'objectif vient d'être atteint
  const previousAmount = campaign.currentAmount;
  const wasGoalReached = previousAmount >= campaign.goalAmount;

  // Mettre à jour la contribution
  contribution.status = 'confirmed';
  contribution.payment.status = 'completed';
  contribution.stripePaymentIntentId = session.payment_intent;

  // Mettre à jour les frais réels si disponibles
  if (session.amount_total) {
    const actualAmount = session.amount_total / 100;
    contribution.payment.netAmount = actualAmount - contribution.payment.fees;
  }

  await contribution.save();
  console.log(`✅ Contribution ${contribution._id} confirmée`);

  // === ENVOI DES EMAILS DE NOTIFICATION ===

  // 1. Email de confirmation au contributeur
  const contributorEmail = contribution.contributor?.email || session.customer_email;
  if (contributorEmail) {
    const contributorData = {
      email: contributorEmail,
      firstName: contribution.contributor?.name?.split(' ')[0] || '',
      name: contribution.contributor?.name || ''
    };

    sendContributionConfirmation(contributorData, campaign, contribution)
      .catch(err => console.error('[STRIPE] Erreur email confirmation contributeur:', err.message));
  }

  // 2. Email de notification au créateur de la campagne
  if (campaign.creator?.email && campaign.creator?.preferences?.emailNotifications !== false) {
    const contributorInfo = contribution.isAnonymous
      ? null
      : { firstName: contribution.contributor?.name, name: contribution.contributor?.name };

    sendNewContributionNotification(campaign.creator, campaign, contribution, contributorInfo)
      .catch(err => console.error('[STRIPE] Erreur email notification créateur:', err.message));
  }

  // 3. Si l'objectif vient d'être atteint, envoyer un email spécial
  // Recharger la campagne pour avoir le montant mis à jour
  const updatedCampaign = await Campaign.findById(campaign._id)
    .populate('creator', 'email firstName lastName username preferences');

  if (!wasGoalReached && updatedCampaign.currentAmount >= updatedCampaign.goalAmount) {
    if (updatedCampaign.creator?.email && updatedCampaign.creator?.preferences?.emailNotifications !== false) {
      sendCampaignGoalReached(updatedCampaign.creator, updatedCampaign)
        .catch(err => console.error('[STRIPE] Erreur email objectif atteint:', err.message));
    }
  }
}

/**
 * Gérer un Payment Intent réussi
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log(`✅ Payment Intent réussi: ${paymentIntent.id}`);

  const contribution = await Contribution.findOne({
    $or: [
      { 'payment.transactionId': paymentIntent.id },
      { stripePaymentIntentId: paymentIntent.id }
    ]
  });

  if (!contribution) {
    console.error(`❌ Contribution non trouvée pour PI: ${paymentIntent.id}`);
    return;
  }

  // Éviter le double envoi si déjà confirmé (via checkout.session.completed)
  if (contribution.status === 'confirmed') {
    console.log(`⚠️ Contribution ${contribution._id} déjà confirmée, skip`);
    return;
  }

  // Récupérer la campagne avec le créateur
  const campaign = await Campaign.findById(contribution.campaign)
    .populate('creator', 'email firstName lastName username preferences');

  // Stocker l'état précédent pour détecter si l'objectif vient d'être atteint
  const previousAmount = campaign.currentAmount;
  const wasGoalReached = previousAmount >= campaign.goalAmount;

  contribution.status = 'confirmed';
  contribution.payment.status = 'completed';
  contribution.stripePaymentIntentId = paymentIntent.id;
  contribution.stripeChargeId = paymentIntent.latest_charge;

  await contribution.save();
  console.log(`✅ Contribution ${contribution._id} confirmée via PI`);

  // === ENVOI DES EMAILS DE NOTIFICATION ===

  // 1. Email de confirmation au contributeur
  const contributorEmail = contribution.contributor?.email || paymentIntent.metadata?.contributorEmail;
  if (contributorEmail) {
    const contributorData = {
      email: contributorEmail,
      firstName: contribution.contributor?.name?.split(' ')[0] || '',
      name: contribution.contributor?.name || ''
    };

    sendContributionConfirmation(contributorData, campaign, contribution)
      .catch(err => console.error('[STRIPE] Erreur email confirmation contributeur:', err.message));
  }

  // 2. Email de notification au créateur de la campagne
  if (campaign.creator?.email && campaign.creator?.preferences?.emailNotifications !== false) {
    const contributorInfo = contribution.isAnonymous
      ? null
      : { firstName: contribution.contributor?.name, name: contribution.contributor?.name };

    sendNewContributionNotification(campaign.creator, campaign, contribution, contributorInfo)
      .catch(err => console.error('[STRIPE] Erreur email notification créateur:', err.message));
  }

  // 3. Si l'objectif vient d'être atteint, envoyer un email spécial
  const updatedCampaign = await Campaign.findById(campaign._id)
    .populate('creator', 'email firstName lastName username preferences');

  if (!wasGoalReached && updatedCampaign.currentAmount >= updatedCampaign.goalAmount) {
    if (updatedCampaign.creator?.email && updatedCampaign.creator?.preferences?.emailNotifications !== false) {
      sendCampaignGoalReached(updatedCampaign.creator, updatedCampaign)
        .catch(err => console.error('[STRIPE] Erreur email objectif atteint:', err.message));
    }
  }
}

/**
 * Gérer un Payment Intent échoué
 */
async function handlePaymentIntentFailed(paymentIntent) {
  console.log(`❌ Payment Intent échoué: ${paymentIntent.id}`);

  const contribution = await Contribution.findOne({
    $or: [
      { 'payment.transactionId': paymentIntent.id },
      { stripePaymentIntentId: paymentIntent.id }
    ]
  });

  if (!contribution) {
    return;
  }

  contribution.status = 'failed';
  contribution.payment.status = 'failed';
  contribution.failureReason = paymentIntent.last_payment_error?.message || 'Paiement échoué';

  await contribution.save();
  console.log(`❌ Contribution ${contribution._id} marquée comme échouée`);
}

/**
 * Gérer un remboursement
 */
async function handleChargeRefunded(charge) {
  console.log(`💰 Charge remboursée: ${charge.id}`);

  const contribution = await Contribution.findOne({
    stripeChargeId: charge.id
  });

  if (!contribution) {
    console.log(`⚠️ Contribution non trouvée pour charge: ${charge.id}`);
    return;
  }

  contribution.status = 'refunded';
  contribution.payment.status = 'refunded';
  contribution.refundedAt = new Date();

  await contribution.save();
  console.log(`💰 Contribution ${contribution._id} remboursée`);

  // Recalculer les stats de la campagne
  await recalculateCampaignStats(contribution.campaign);
}

/**
 * Recalculer les statistiques d'une campagne
 */
async function recalculateCampaignStats(campaignId) {
  const contributions = await Contribution.find({
    campaign: campaignId,
    status: 'confirmed'
  });

  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
  const uniqueContributors = new Set();
  
  contributions.forEach(c => {
    if (c.contributor?.userId) {
      uniqueContributors.add(c.contributor.userId.toString());
    }
  });

  const averageContribution = contributions.length > 0 
    ? totalAmount / contributions.length 
    : 0;

  await Campaign.findByIdAndUpdate(campaignId, {
    currentAmount: totalAmount,
    'stats.contributorsCount': uniqueContributors.size,
    'stats.averageContribution': averageContribution
  });

  console.log(`📊 Stats campagne ${campaignId} recalculées: ${totalAmount}€`);
}

/**
 * Obtenir la clé publique Stripe
 * GET /api/payments/config
 */
exports.getStripeConfig = async (req, res) => {
  res.json({
    success: true,
    data: {
      publicKey: stripeConfig.publicKey,
      currency: stripeConfig.currency,
      isTestMode: stripeConfig.isTestMode()
    }
  });
};

