require('dotenv').config();

/**
 * Configuration des variables d'environnement avec validation
 * et valeurs par défaut appropriées
 */

// Liste des variables requises pour chaque environnement
const REQUIRED_VARS = {
  development: ['MONGODB_URI'],
  production: ['MONGODB_URI', 'JWT_SECRET'],
  test: ['MONGODB_URI'],
};

class ConfigValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Valide les variables d'environnement requises
 */
const validateEnv = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const required = REQUIRED_VARS[nodeEnv] || [];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new ConfigValidationError(
      `❌ Variables d'environnement manquantes pour ${nodeEnv.toUpperCase()}:\n` +
        missing.map((key) => `  - ${key}`).join('\n') +
        '\n\n💡 Ajoutez-les dans le fichier .env'
    );
  }

  // Validation supplémentaire pour certaines variables
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    console.warn('⚠️  MONGODB_URI ne semble pas être une URI MongoDB valide');
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET est trop court (minimum 32 caractères recommandés)');
  }
};

/**
 * Configuration principale exportée
 */
const config = {
  // Environnement
  nodeEnv: process.env.NODE_ENV || 'development',

  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  host: process.env.HOST || 'localhost',

  // MongoDB
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cagnotte-app',

  // JWT Authentication
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-char',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',

  // Email (optionnel en développement)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '"Cagnotte App" <noreply@cagnotte.fr>',
  },

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',

  // CORS
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:8080'],

  // Uploads
  uploadsDir: process.env.UPLOADS_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logToFile: process.env.LOG_TO_FILE === 'true',

  // Rate limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  // Cache
  cacheTtl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutes
};

/**
 * Méthodes utilitaires
 */
config.isDevelopment = () => config.nodeEnv === 'development';
config.isProduction = () => config.nodeEnv === 'production';
config.isTest = () => config.nodeEnv === 'test';

/**
 * Validation à l'initialisation
 */
try {
  validateEnv();

  if (config.isDevelopment()) {
    console.log('⚙️  Configuration chargée (DÉVELOPPEMENT)');
    console.log('📁 Base de données:', config.mongoURI);
    console.log('🌐 Frontend URL:', config.frontendUrl);
    console.log('🔧 Port serveur:', config.port);
  }
} catch (error) {
  console.error('\n' + '='.repeat(60));
  console.error('❌ ERREUR DE CONFIGURATION');
  console.error('='.repeat(60));
  console.error(error.message);
  console.error('\n💡 Créez un fichier .env à la racine du dossier backend');
  console.error('💡 Exemple de contenu (.env.example) :');
  console.error(`
# ========================================
# CONFIGURATION CAGNOTTE APP - DÉVELOPPEMENT
# ========================================

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cagnotte-app

# Serveur
PORT=5000
NODE_ENV=development

# Sécurité
JWT_SECRET=votre_super_secret_jwt_min_32_caracteres
JWT_EXPIRE=7d

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# ========================================
  `);
  console.error('='.repeat(60));

  // En production, on arrête le processus
  if (config.isProduction()) {
    process.exit(1);
  }
}

module.exports = config;