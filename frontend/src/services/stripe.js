/**
 * Service Stripe - Gestion des paiements côté frontend
 */

import { loadStripe } from '@stripe/stripe-js';
import { api } from './api';

// Variable pour stocker l'instance Stripe
let stripePromise = null;

/**
 * Obtenir l'instance Stripe (lazy loading)
 */
export const getStripe = async () => {
  if (!stripePromise) {
    // Récupérer la clé publique depuis le backend
    const config = await getStripeConfig();
    stripePromise = loadStripe(config.publicKey);
  }
  return stripePromise;
};

/**
 * Obtenir la configuration Stripe depuis le backend
 */
export const getStripeConfig = async () => {
  try {
    const response = await api.get('/payments/config');
    return response.data;
  } catch (error) {
    console.error('Erreur récupération config Stripe:', error);
    // Fallback sur la clé publique de test
    return {
      publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_VOTRE_CLE_PUBLIQUE',
      currency: 'eur',
      isTestMode: true
    };
  }
};

/**
 * Créer une session de checkout et rediriger vers Stripe
 */
export const createCheckoutSession = async (paymentData) => {
  try {
    const response = await api.post('/payments/create-checkout-session', paymentData);
    
    if (response.success && response.data.sessionUrl) {
      // Rediriger vers Stripe Checkout
      window.location.href = response.data.sessionUrl;
      return response.data;
    } else {
      throw new Error('URL de session non reçue');
    }
  } catch (error) {
    console.error('Erreur création session checkout:', error);
    throw error;
  }
};

/**
 * Créer un Payment Intent pour paiement intégré
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const response = await api.post('/payments/create-payment-intent', paymentData);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || 'Erreur création paiement');
    }
  } catch (error) {
    console.error('Erreur création Payment Intent:', error);
    throw error;
  }
};

/**
 * Vérifier le statut d'une session
 */
export const getSessionStatus = async (sessionId) => {
  try {
    const response = await api.get(`/payments/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur vérification session:', error);
    throw error;
  }
};

/**
 * Formater un montant en devise
 */
export const formatAmount = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const stripeService = {
  getStripe,
  getStripeConfig,
  createCheckoutSession,
  createPaymentIntent,
  getSessionStatus,
  formatAmount
};

export default stripeService;

