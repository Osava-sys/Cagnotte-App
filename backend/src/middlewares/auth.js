const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Accès non autorisé. Token manquant.' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        error: 'Compte désactivé' 
      });
    }
    
    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token invalide' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expiré' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Erreur d\'authentification' 
    });
  }
};

// Middleware d'authentification optionnel (ne renvoie pas d'erreur si pas de token)
exports.optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    // Si pas de token, on continue sans erreur
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // En cas d'erreur (token invalide, expiré, etc.), on continue sans utilisateur
    // Cela permet aux invités de contribuer
    next();
  }
};

// Middleware pour vérifier le rôle
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès interdit. Rôle insuffisant.' 
      });
    }
    next();
  };
};

// Alias pour compatibilité
exports.protect = exports.authenticate;
exports.optionalAuth = exports.optionalAuthenticate;