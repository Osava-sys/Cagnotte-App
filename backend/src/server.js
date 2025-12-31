const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');
const config = require('./config/env');

// Import routes
const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import Stripe pour le webhook
const { stripe, stripeConfig } = require('./config/stripe');
const stripeController = require('./controllers/stripeController');

// Import scheduled tasks
const { startScheduledTasks, stopScheduledTasks } = require('./utils/scheduledTasks');

// Import email service
const { initEmailService } = require('./utils/emailService');

// Connect to database
connectDB().then(async () => {
  // Démarrer les tâches planifiées après connexion à la DB
  startScheduledTasks();

  // Initialiser le service email (crée un compte Ethereal en dev si SMTP non configuré)
  await initEmailService();
});

// Initialize app
const app = express();

// ====================
// SECURITY MIDDLEWARE
// ====================
app.use(helmet({
  // Désactiver crossOriginResourcePolicy pour permettre les images cross-origin
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Désactiver crossOriginEmbedderPolicy qui peut aussi bloquer les images
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: config.isProduction() ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", config.backendUrl || "http://localhost:5000"],
      connectSrc: ["'self'", config.frontendUrl, "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"]
    }
  } : false
}));

// ====================
// CORS CONFIGURATION
// ====================
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ====================
// WEBHOOK STRIPE (avant body parsers - nécessite raw body)
// ====================
app.post('/api/payments/webhook', 
  express.raw({ type: 'application/json' }), 
  stripeController.handleWebhook
);

// ====================
// BODY PARSERS
// ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ====================
// LOGGING
// ====================
if (config.isDevelopment()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ====================
// STATIC FILES
// ====================
// Servir les fichiers uploadés (images, etc.) avec headers CORS appropriés
app.use('/uploads', (req, res, next) => {
  // Ajouter les headers pour permettre l'accès cross-origin aux images
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
  next();
}, express.static(path.join(__dirname, '../', config.uploadsDir), {
  // Options pour optimiser le serving des fichiers statiques
  maxAge: '1y',
  etag: true,
  lastModified: true,
  index: false,
  // Ajouter les headers de type MIME corrects
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  }
}));

// Servir le frontend en production
if (config.isProduction()) {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
}

// ====================
// API ROUTES
// ====================
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/payments', paymentRoutes);

// ====================
// HEALTH & INFO ENDPOINTS
// ====================
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'cagnotte-api',
    version: '1.0.0',
    environment: config.nodeEnv,
    database: dbStatus,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Cagnotte API',
    version: '1.0.0',
    description: 'API backend pour la plateforme de cagnotte en ligne',
    environment: config.nodeEnv,
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh-token'
      },
      campaigns: {
        list: 'GET /api/campaigns',
        search: 'GET /api/campaigns/search',
        stats: 'GET /api/campaigns/stats',
        get: 'GET /api/campaigns/:id',
        create: 'POST /api/campaigns',
        update: 'PUT /api/campaigns/:id',
        delete: 'DELETE /api/campaigns/:id'
      },
      contributions: {
        byCampaign: 'GET /api/contributions/campaign/:campaignId',
        stats: 'GET /api/contributions/stats/:campaignId',
        topContributors: 'GET /api/contributions/top-contributors',
        userContributions: 'GET /api/contributions/user/my-contributions',
        create: 'POST /api/contributions/campaign/:campaignId'
      }
    }
  });
});

// ====================
// FRONTEND ROUTING (for production)
// ====================
if (config.isProduction()) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

// ====================
// 404 HANDLER
// ====================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: '/api/info'
  });
});

// ====================
// ERROR HANDLER
// ====================
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: `Le ${field} est déjà utilisé`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expiré'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = config.isProduction() && statusCode === 500 
    ? 'Erreur serveur interne' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.isDevelopment() && { stack: err.stack })
  });
});

// ====================
// GRACEFUL SHUTDOWN
// ====================
const gracefulShutdown = () => {
  console.log('\n⚠️  Début de l\'arrêt gracieux...');

  const mongoose = require('mongoose');

  // Arrêter les tâches planifiées
  stopScheduledTasks();

  // Fermer le serveur HTTP
  server.close(async () => {
    console.log('📴 Serveur HTTP fermé');

    // Fermer la connexion MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📴 Connexion MongoDB fermée');
    }

    console.log('👋 Arrêt complet');
    process.exit(0);
  });

  // Forcer l'arrêt après 10 secondes
  setTimeout(() => {
    console.error('⏰ Timeout, fermeture forcée');
    process.exit(1);
  }, 10000);
};

// ====================
// START SERVER
// ====================
const server = app.listen(config.port, config.host, () => {
  console.log(`
  🚀 CAGNOTTE API DÉMARRÉE AVEC SUCCÈS!
  ========================================
  📍 Environnement: ${config.nodeEnv}
  🌐 URL: http://${config.host || 'localhost'}:${config.port}
  📁 Base de données: ${config.mongoURI.split('@')[1] || config.mongoURI}
  🔒 CORS Origins: ${config.corsOrigins.join(', ')}
  ⏰ ${new Date().toLocaleString()}
  ========================================
  
  📍 Points de terminaison:
  - Health:    http://localhost:${config.port}/api/health
  - Info:      http://localhost:${config.port}/api/info
  - Register:  POST http://localhost:${config.port}/api/auth/register
  - Login:     POST http://localhost:${config.port}/api/auth/login
  - Campaigns: GET http://localhost:${config.port}/api/campaigns
  
  💡 Frontend: ${config.frontendUrl}
  ========================================
  `);
});

// Écouter les signaux d'arrêt
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

module.exports = { app, server };