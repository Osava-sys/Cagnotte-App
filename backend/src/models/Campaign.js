const mongoose = require('mongoose');
const validator = require('validator');

const campaignSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [5, 'Le titre doit contenir au moins 5 caractères'],
    maxlength: [100, 'Le titre ne peut dépasser 100 caractères']
  },
  
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  description: {
    type: String,
    required: [true, 'La description est requise'],
    minlength: [20, 'La description doit contenir au moins 20 caractères'],
    maxlength: [5000, 'La description ne peut dépasser 5000 caractères']
  },
  
  shortDescription: {
    type: String,
    maxlength: [200, 'La description courte ne peut dépasser 200 caractères']
  },
  
  // Objectifs financiers
  goalAmount: {
    type: Number,
    required: [true, 'L\'objectif financier est requis'],
    min: [1, 'L\'objectif doit être positif']
  },
  
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Le montant actuel ne peut être négatif']
  },
  
  // Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  
  endDate: {
    type: Date,
    required: [true, 'La date de fin est requise'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'La date de fin doit être dans le futur'
    }
  },
  
  // Créateur
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Images et médias
  images: {
    mainImage: {
      type: String,
      default: '/uploads/campaigns/default-campaign.jpg'
    },
    gallery: [{
      url: String,
      caption: String,
      order: Number
    }]
  },
  
  // Catégorie
  category: {
    type: String,
    enum: [
      'sante',
      'education', 
      'projet',
      'urgence',
      'environnement',
      'culture',
      'sport',
      'entrepreneuriat',
      'autre'
    ],
    required: [true, 'La catégorie est requise'],
    default: 'autre'
  },
  
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Localisation
  location: {
    country: String,
    city: String,
    address: String,
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: { 
        type: [Number], 
        default: [0, 0]  // Valeur par défaut
      }
    }
  },
  
  // Détails supplémentaires
  story: {
    type: String,
    maxlength: [10000, 'L\'histoire ne peut dépasser 10000 caractères']
  },
  
  updates: [{
    title: String,
    content: String,
    date: {
      type: Date,
      default: Date.now
    },
    images: [String]
  }],
  
  // Récompenses (rewards) pour les contributeurs
  rewards: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    quantity: {
      type: Number,
      min: 0
    },
    claimed: {
      type: Number,
      default: 0
    },
    deliveryDate: Date
  }],
  
  // Documents justificatifs
  documents: [{
    name: String,
    url: String,
    type: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Statistiques
  stats: {
    contributorsCount: {
      type: Number,
      default: 0
    },
    averageContribution: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  },
  
  // Statut et validation
  status: {
    type: String,
    enum: [
      'draft',      // Brouillon
      'pending',    // En attente de validation
      'active',     // Active
      'successful', // Objectif atteint
      'expired',    // Expirée
      'cancelled',  // Annulée
      'suspended'   // Suspendue
    ],
    default: 'draft'
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationNotes: String,
  
  // Métadonnées
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

// Progression en pourcentage
campaignSchema.virtual('progress').get(function() {
  return Math.min(Math.round((this.currentAmount / this.goalAmount) * 100), 100);
});

// Jours restants
campaignSchema.virtual('daysLeft').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
});

// Montant manquant
campaignSchema.virtual('amountLeft').get(function() {
  return Math.max(this.goalAmount - this.currentAmount, 0);
});

// === Middleware ===

// Générer un slug avant sauvegarde
campaignSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  // Créer slug à partir du titre
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Retirer caractères spéciaux
    .replace(/[\s_-]+/g, '-') // Remplacer espaces par tirets
    .replace(/^-+|-+$/g, '') // Retirer tirets au début/fin
    .substring(0, 50); // Limiter la longueur
  
  // Générer description courte si vide
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 200);
  }
  
  // Mettre à jour le statut si nécessaire
  if (this.currentAmount >= this.goalAmount) {
    this.status = 'successful';
  } else {
    // Calculer les jours restants directement (daysLeft est un virtual non disponible ici)
    const now = new Date();
    const end = new Date(this.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0 && this.status === 'active') {
      this.status = 'expired';
    }
  }
  
  next();
});

// === Indexes pour performance ===
campaignSchema.index({ slug: 1 }, { unique: true });
campaignSchema.index({ creator: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ goalAmount: 1 });
campaignSchema.index({ currentAmount: 1 });
campaignSchema.index({ endDate: 1 });
campaignSchema.index({ 'location.coordinates': '2dsphere' }); // Pour les requêtes géospatiales
campaignSchema.index({ 
  status: 1, 
  isFeatured: 1, 
  currentAmount: -1 
}); // Pour le tri et filtrage

// === Méthodes d'instance ===

// Ajouter une mise à jour
campaignSchema.methods.addUpdate = function(title, content, images = []) {
  this.updates.push({
    title,
    content,
    images,
    date: new Date()
  });
  return this.save();
};

// Ajouter un contributeur
campaignSchema.methods.addContributor = async function(userId, amount) {
  this.stats.contributorsCount += 1;
  this.currentAmount += amount;
  
  // Recalculer la moyenne
  this.stats.averageContribution = this.currentAmount / this.stats.contributorsCount;
  
  // Vérifier si l'objectif est atteint
  if (this.currentAmount >= this.goalAmount && this.status === 'active') {
    this.status = 'successful';
  }
  
  return this.save();
};

// Vérifier si la campagne est active
campaignSchema.methods.isActive = function() {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.startDate <= now &&
    this.endDate > now
  );
};

// === Méthodes statiques ===

// Trouver les campagnes actives
campaignSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gt: now }
  });
};

// Statistiques globales
campaignSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCampaigns: { $sum: 1 },
        activeCampaigns: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0] 
          } 
        },
        successfulCampaigns: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] 
          } 
        },
        totalGoalAmount: { $sum: '$goalAmount' },
        totalCurrentAmount: { $sum: '$currentAmount' },
        averageGoal: { $avg: '$goalAmount' }
      }
    },
    {
      $addFields: {
        overallProgress: {
          $cond: [
            { $eq: ['$totalGoalAmount', 0] },
            0,
            { $multiply: [
              { $divide: ['$totalCurrentAmount', '$totalGoalAmount'] },
              100
            ]}
          ]
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalCampaigns: 0,
    activeCampaigns: 0,
    successfulCampaigns: 0,
    totalGoalAmount: 0,
    totalCurrentAmount: 0,
    averageGoal: 0,
    overallProgress: 0
  };
};

// Recherche avancée
campaignSchema.statics.search = function(query, filters = {}) {
  const pipeline = [];
  
  // Recherche textuelle
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    });
  }
  
  // Filtres
  if (filters.category) {
    pipeline.push({ $match: { category: filters.category } });
  }
  
  if (filters.status) {
    pipeline.push({ $match: { status: filters.status } });
  }
  
  if (filters.minAmount) {
    pipeline.push({ $match: { goalAmount: { $gte: parseInt(filters.minAmount) } } });
  }
  
  if (filters.maxAmount) {
    pipeline.push({ $match: { goalAmount: { $lte: parseInt(filters.maxAmount) } } });
  }
  
  // Trier par popularité (montant collecté) ou date
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
  pipeline.push({ $sort: { [sortBy]: sortOrder } });
  
  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;
  
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Campaign', campaignSchema);