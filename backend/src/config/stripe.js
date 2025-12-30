/**
 * Configuration Stripe
 * 
 * Variables d'environnement requises :
 * - STRIPE_SECRET_KEY: Clé secrète Stripe (sk_test_... ou sk_live_...)
 * - STRIPE_WEBHOOK_SECRET: Secret du webhook Stripe (whsec_...)
 * - STRIPE_PUBLIC_KEY: Clé publique Stripe (pk_test_... ou pk_live_...)
 */

const config = require('./env');

const stripeConfig = {
  // Clé secrète Stripe
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_VOTRE_CLE_SECRETE',
  
  // Clé publique Stripe (pour le frontend)
  publicKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_VOTRE_CLE_PUBLIQUE',
  
  // Secret du webhook
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_VOTRE_WEBHOOK_SECRET',
  
  // Currency par défaut
  currency: 'eur',
  
  // URLs de redirection
  successUrl: `${config.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${config.frontendUrl}/payment/cancel`,
  
  // Métadonnées de l'application
  appName: 'Cagnotte App',
  
  // Mode test
  isTestMode: () => stripeConfig.secretKey.startsWith('sk_test_'),
};

// Initialiser Stripe
const stripe = require('stripe')(stripeConfig.secretKey, {
  apiVersion: '2023-10-16',
  appInfo: {
    name: stripeConfig.appName,
    version: '1.0.0',
  },
});

// Validation au démarrage
const validateStripeConfig = () => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_VOTRE_CLE_SECRETE') {
    console.warn('⚠️  STRIPE_SECRET_KEY non configurée - utilisation des valeurs par défaut (tests uniquement)');
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === 'whsec_VOTRE_WEBHOOK_SECRET') {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET non configurée - les webhooks ne fonctionneront pas');
  }
  
  if (config.isProduction() && stripeConfig.isTestMode()) {
    console.error('❌ ATTENTION: Clés Stripe de test utilisées en PRODUCTION!');
  }
  
  console.log(`💳 Stripe configuré en mode ${stripeConfig.isTestMode() ? 'TEST' : 'LIVE'}`);
};

// Valider la configuration
validateStripeConfig();

module.exports = {
  stripe,
  stripeConfig,
};

