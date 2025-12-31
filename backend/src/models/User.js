const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // Informations de base
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Email invalide']
  },
  
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false // Ne pas renvoyer le mot de passe dans les queries
  },
  
  // Profil utilisateur
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    minlength: [2, 'Le prénom doit contenir au moins 2 caractères']
  },
  
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères']
  },
  
  // Avatar/photo
  avatar: {
    type: String,
    default: '/uploads/avatars/default-avatar.png'
  },
  
  // Adresse
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: {
      type: String,
      default: 'France'
    }
  },
  
  // Contact
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{9,}$/.test(v);
      },
      message: 'Numéro de téléphone invalide'
    }
  },
  
  // Rôle et statut
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Préférences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: false
    }
  },
  
  // Métadonnées
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Réinitialisation de mot de passe
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
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

// === Virtuals (Champs calculés) ===
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// === Middleware (Hooks) ===

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(12);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Mettre à jour updatedAt avant modification
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// === Méthodes d'instance ===

// Comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Vérifier si le compte est verrouillé
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Incrémenter les tentatives de connexion
userSchema.methods.incrementLoginAttempts = function() {
  // Si la période de lock est expirée, réinitialiser
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Incrémenter les tentatives
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Verrouiller le compte après 5 tentatives échouées pendant 2 heures
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 heures
  }
  
  return this.updateOne(updates);
};

// Réinitialiser les tentatives après connexion réussie
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// === Indexes pour performance ===
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// === Méthodes statiques ===
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email }).select('+password');
};

userSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { 
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedUsers: { 
          $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
        },
        admins: { 
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || { totalUsers: 0, activeUsers: 0, verifiedUsers: 0, admins: 0 };
};

module.exports = mongoose.model('User', userSchema);