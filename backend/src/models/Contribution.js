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
      required: function() {
        return !this.isAnonymous;
      }
    },
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Email invalide'
      }
    },
    message: {
      type: String,
      maxlength: [500, 'Le message ne peut dépasser 500 caractères']
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
  // Calculer le montant net
  if (this.isModified('amount')) {
    this.payment.netAmount = this.amount - this.payment.fees;
  }
  
  // Vérifier l'éligibilité au reçu fiscal (> 50€)
  if (this.isModified('amount')) {
    this.taxReceipt.eligible = this.amount >= 50;
  }
  
  next();
});

// Après sauvegarde
contributionSchema.post('save', async function() {
  const Campaign = mongoose.model('Campaign');
  const User = mongoose.model('User');
  
  if (this.status === 'confirmed') {
    // Mettre à jour la campagne
    await Campaign.findByIdAndUpdate(this.campaign, {
      $inc: { 
        'currentAmount': this.amount,
        'stats.contributorsCount': 1
      }
    });
    
    // Mettre à jour les statistiques du contributeur (si connecté)
    if (this.contributor.userId) {
      await User.findByIdAndUpdate(this.contributor.userId, {
        $inc: { 'totalContributions': 1 }
      });
    }
  }
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
  const matchStage = campaignId ? { campaign: mongoose.Types.ObjectId(campaignId) } : {};
  
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
