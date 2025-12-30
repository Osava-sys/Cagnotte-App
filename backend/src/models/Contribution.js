const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  // Montant
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [1, 'Le montant doit être au moins 1']
  },
  
  // Contribution anonyme ou publique
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Informations du contributeur
  contributor: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optionnel : présent seulement pour les utilisateurs connectés
    },
    name: {
      type: String,
      required: function() {
        return !this.isAnonymous;
      },
      trim: true
    },
    email: {
      type: String,
      required: function() {
        return !this.isAnonymous;
      },
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Si anonyme, pas de validation d'email
          if (this.isAnonymous) {
            return true;
          }
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Email invalide'
      }
    },
    message: {
      type: String,
      default: ''
    }
  },
  
  // Campagne associée
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  
  // Récompense choisie (si applicable)
  reward: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  // Paiement
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer', 'cash'],
      required: true
    },
    transactionId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    fees: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    }
  },
  
  // Frais de plateforme
  platformFee: {
    type: Number,
    default: function() {
      // Exemple: 5% de frais de plateforme
      return this.amount * 0.05;
    }
  },
  
  // Statut de la contribution
  status: {
    type: String,
    enum: [
      'pending',      // En attente de paiement
      'confirmed',    // Paiement confirmé
      'failed',       // Échec du paiement
      'refunded',     // Remboursée
      'cancelled'    // Annulée
    ],
    default: 'pending'
  },
  
  // Données pour les taxes
  taxReceipt: {
    eligible: {
      type: Boolean,
      default: false
    },
    issued: {
      type: Boolean,
      default: false
    },
    receiptNumber: String,
    issueDate: Date
  },
  
  // Stripe IDs
  stripeSessionId: {
    type: String
  },
  stripePaymentIntentId: {
    type: String
  },
  stripeChargeId: {
    type: String
  },
  
  // En cas d'échec
  failureReason: String,
  
  // Date de remboursement
  refundedAt: Date,
  
  // Métadonnées
  ipAddress: String,
  userAgent: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// === Virtuals ===

// Montant reçu par la campagne (après frais)
contributionSchema.virtual('campaignAmount').get(function() {
  return this.amount - this.platformFee;
});

// === Middleware ===

// Avant sauvegarde
contributionSchema.pre('save', function(next) {
  // S'assurer que payment existe
  if (!this.payment) {
    this.payment = {};
  }
  
  // Calculer le montant net (si amount ou fees sont modifiés)
  if (this.isModified('amount') || this.isModified('payment.fees')) {
    // S'assurer que fees existe, sinon 0
    const fees = this.payment.fees || 0;
    this.payment.netAmount = this.amount - fees;
  }
  
  // Vérifier l'éligibilité au reçu fiscal (> 50€)
  if (this.isModified('amount')) {
    if (!this.taxReceipt) {
      this.taxReceipt = {};
    }
    this.taxReceipt.eligible = this.amount >= 50;
  }
  
  next();
});

// === Middleware pour mettre à jour les stats de la campagne ===
// Après sauvegarde - mettre à jour les stats de la campagne
contributionSchema.post('save', async function() {
  const Campaign = mongoose.model('Campaign');
  const User = mongoose.model('User');
  
  // Seulement si la contribution est confirmée
  if (this.status === 'confirmed') {
    try {
      // 1. Recalculer le montant total des contributions confirmées
      const contributions = await this.constructor.find({
        campaign: this.campaign,
        status: 'confirmed'
      });
      
      // 2. Calculer le montant total
      const totalAmount = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
      
      // 3. Calculer le nombre de contributeurs UNIQUES
      const uniqueContributors = new Set();
      contributions.forEach(contrib => {
        if (contrib.contributor && contrib.contributor.userId) {
          uniqueContributors.add(contrib.contributor.userId.toString());
        }
      });
      
      // 4. Calculer la moyenne par contribution
      const averageContribution = contributions.length > 0 
        ? totalAmount / contributions.length 
        : 0;
      
      // 5. Mettre à jour la campagne
      await Campaign.findByIdAndUpdate(this.campaign, {
        currentAmount: totalAmount,
        'stats.contributorsCount': uniqueContributors.size,
        'stats.averageContribution': averageContribution
      }, { new: true });
      
      // 6. Mettre à jour les stats de l'utilisateur (si connecté)
      // Note: Le champ totalContributions n'existe pas dans le modèle User actuel
      // Si nécessaire, ajouter ce champ au modèle User ou utiliser une agrégation
      // if (this.contributor && this.contributor.userId) {
      //   await User.findByIdAndUpdate(this.contributor.userId, {
      //     $inc: { 'totalContributions': 1 }
      //   });
      // }
      
    } catch (error) {
      console.error('❌ Erreur dans le middleware post-save Contribution:', error.message);
    }
  }
});

// Middleware pour supprimer une contribution (Mongoose 5.x+)
// Utiliser findOneAndDelete et deleteOne au lieu de remove (obsolète)
contributionSchema.post('findOneAndDelete', async function(doc) {
  if (!doc || doc.status !== 'confirmed') return;
  
  const Campaign = mongoose.model('Campaign');
  
  try {
    // Recalculer après suppression
    const contributions = await this.model.find({
      campaign: doc.campaign,
      status: 'confirmed'
    });
    
    const totalAmount = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
    const uniqueContributors = new Set();
    
    contributions.forEach(contrib => {
      if (contrib.contributor && contrib.contributor.userId) {
        uniqueContributors.add(contrib.contributor.userId.toString());
      }
    });
    
    const averageContribution = contributions.length > 0 
      ? totalAmount / contributions.length 
      : 0;
    
    await Campaign.findByIdAndUpdate(doc.campaign, {
      currentAmount: totalAmount,
      'stats.contributorsCount': uniqueContributors.size,
      'stats.averageContribution': averageContribution
    });
    
  } catch (error) {
    console.error('❌ Erreur dans le middleware post-findOneAndDelete Contribution:', error.message);
  }
});

contributionSchema.post('deleteOne', async function() {
  // Note: deleteOne ne fournit pas le document dans le hook
  // Cette logique est gérée dans le contrôleur ou via findOneAndDelete
});

// === Indexes pour performance ===
contributionSchema.index({ campaign: 1 });
contributionSchema.index({ 'contributor.userId': 1 });
contributionSchema.index({ 'payment.transactionId': 1 });
contributionSchema.index({ createdAt: -1 });
contributionSchema.index({ status: 1 });
contributionSchema.index({ amount: 1 });
contributionSchema.index({ 
  campaign: 1, 
  status: 1, 
  createdAt: -1 
});
// Index pour Stripe
contributionSchema.index({ stripeSessionId: 1 }, { sparse: true });
contributionSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
contributionSchema.index({ stripeChargeId: 1 }, { sparse: true });

// === Méthodes d'instance ===

// Confirmer le paiement
contributionSchema.methods.confirmPayment = function(transactionId) {
  this.payment.status = 'completed';
  this.payment.transactionId = transactionId;
  this.status = 'confirmed';
  return this.save();
};

// Rembourser la contribution
contributionSchema.methods.refund = function(reason) {
  this.payment.status = 'refunded';
  this.status = 'refunded';
  this.refundReason = reason;
  return this.save();
};

// === Méthodes statiques ===

// Obtenir les statistiques
contributionSchema.statics.getStatistics = async function(campaignId = null) {
  const matchStage = campaignId ? { campaign: new mongoose.Types.ObjectId(campaignId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    { $match: { status: 'confirmed' } },
    {
      $group: {
        _id: null,
        totalContributions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageContribution: { $avg: '$amount' },
        maxContribution: { $max: '$amount' },
        minContribution: { $min: '$amount' },
        totalPlatformFees: { $sum: '$platformFee' },
        totalNetAmount: { $sum: { $subtract: ['$amount', '$platformFee'] } }
      }
    }
  ]);
  
  return stats[0] || {
    totalContributions: 0,
    totalAmount: 0,
    averageContribution: 0,
    maxContribution: 0,
    minContribution: 0,
    totalPlatformFees: 0,
    totalNetAmount: 0
  };
};

// Obtenir les top contributeurs
contributionSchema.statics.getTopContributors = async function(limit = 10) {
  return this.aggregate([
    { $match: { status: 'confirmed' } },
    { $match: { isAnonymous: false } },
    {
      $group: {
        _id: '$contributor.userId',
        totalAmount: { $sum: '$amount' },
        contributionsCount: { $sum: 1 },
        firstName: { $first: '$contributor.name' },
        email: { $first: '$contributor.email' }
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: limit },
    {
      $project: {
        userId: '$_id',
        totalAmount: 1,
        contributionsCount: 1,
        firstName: 1,
        email: 1
      }
    }
  ]);
};

// Obtenir l'historique des contributions pour un utilisateur
contributionSchema.statics.getUserContributions = async function(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  
  return this.find({
    'contributor.userId': userId,
    status: 'confirmed'
  })
  .populate('campaign', 'title slug mainImage')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
};

module.exports = mongoose.model('Contribution', contributionSchema);
