/**
 * Routes de paiement Stripe
 */

const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { protect, optionalAuth } = require('../middlewares/auth');

// Configuration Stripe (public)
router.get('/config', stripeController.getStripeConfig);

// Créer une session Checkout (authentification optionnelle)
router.post('/create-checkout-session', optionalAuth, stripeController.createCheckoutSession);

// Créer un Payment Intent (authentification optionnelle)
router.post('/create-payment-intent', optionalAuth, stripeController.createPaymentIntent);

// Vérifier le statut d'une session
router.get('/session/:sessionId', stripeController.getSessionStatus);

// Note: Le webhook est monté séparément dans server.js pour avoir accès au raw body

module.exports = router;

