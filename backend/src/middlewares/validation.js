// backend/src/middlewares/validation.js
const { validationResult, body } = require('express-validator');
const User = require('../models/User');

// Validation des résultats
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

// Validation pour l'inscription
exports.validateRegister = [
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error('Email déjà utilisé');
      }
    }),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule'),
  
  body('firstName')
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
  
  body('lastName')
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  
  body('phone').optional().isMobilePhone().withMessage('Numéro de téléphone invalide'),
  
  exports.validate
];

// Validation pour la connexion
exports.validateLogin = [
  body('email')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis'),
  
  exports.validate
];

// Validation pour les campagnes
exports.validateCampaign = [
  body('title')
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 5, max: 100 }).withMessage('Le titre doit contenir entre 5 et 100 caractères'),
  
  body('description')
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 20, max: 5000 }).withMessage('La description doit contenir entre 20 et 5000 caractères'),
  
  body('goalAmount')
    .isFloat({ min: 1 }).withMessage('L\'objectif doit être un nombre positif'),
  
  body('endDate')
    .isISO8601().withMessage('Date invalide')
    .custom((value) => {
      const endDate = new Date(value);
      const now = new Date();
      if (endDate <= now) {
        throw new Error('La date de fin doit être dans le futur');
      }
      return true;
    }),
  
  body('category')
    .isIn(['sante', 'education', 'projet', 'urgence', 'environnement', 'culture', 'sport', 'entrepreneuriat', 'autre'])
    .withMessage('Catégorie invalide'),
  
  exports.validate
];

// Validation pour les contributions
exports.validateContribution = [
  body('amount')
    .isFloat({ min: 1 }).withMessage('Le montant doit être au moins 1€'),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous doit être un booléen'),

  // Validation conditionnelle pour contributor
  // Si isAnonymous est false/undefined ET pas d'utilisateur connecté, contributor est requis
  body('contributor.name')
    .if((value, { req }) => {
      // Requis seulement si : pas anonyme ET pas d'utilisateur connecté
      return !req.body.isAnonymous && !req.user;
    })
    .notEmpty().withMessage('Le nom est requis pour une contribution non anonyme sans authentification'),
  
  body('contributor.email')
    .if((value, { req }) => {
      // Requis seulement si : pas anonyme ET pas d'utilisateur connecté
      return !req.body.isAnonymous && !req.user;
    })
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  // Si contributor est fourni, valider ses champs
  body('contributor.name')
    .if((value, { req }) => req.body.contributor)
    .notEmpty().withMessage('Le nom du contributeur est requis'),
  
  body('contributor.email')
    .if((value, { req }) => req.body.contributor)
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('payment.method')
    .notEmpty()
    .withMessage('La méthode de paiement est requise')
    .isIn(['stripe', 'paypal', 'bank_transfer', 'cash'])
    .withMessage('Méthode de paiement invalide'),
  
  exports.validate
];