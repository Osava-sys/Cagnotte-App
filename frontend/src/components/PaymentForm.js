/**
 * Composant de formulaire de paiement Stripe intégré
 */

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const PaymentForm = ({ 
  clientSecret, 
  amount, 
  onSuccess, 
  onError,
  returnUrl 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    // Vérifier le statut du paiement au chargement
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Paiement réussi !');
          onSuccess?.(paymentIntent);
          break;
        case 'processing':
          setMessage('Votre paiement est en cours de traitement.');
          break;
        case 'requires_payment_method':
          // État initial, rien à faire
          break;
        default:
          setMessage('Une erreur est survenue.');
          break;
      }
    });
  }, [stripe, clientSecret, onSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message);
        } else {
          setMessage('Une erreur inattendue est survenue.');
        }
        onError?.(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Paiement réussi !');
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setMessage('Erreur lors du paiement');
      onError?.(err);
    }

    setIsLoading(false);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-form-header">
        <h3>💳 Paiement sécurisé</h3>
        <p className="payment-amount">Montant : <strong>{formatAmount(amount)}</strong></p>
      </div>

      <div className="payment-element-container">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
          }}
        />
      </div>

      {message && (
        <div className={`payment-message ${message.includes('réussi') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <button 
        type="submit" 
        className="btn-primary btn-full payment-button"
        disabled={isLoading || !stripe || !elements}
      >
        {isLoading ? (
          <>
            <span className="btn-spinner"></span>
            Traitement en cours...
          </>
        ) : (
          <>
            🔒 Payer {formatAmount(amount)}
          </>
        )}
      </button>

      <div className="payment-security-notice">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <span>Paiement sécurisé par Stripe</span>
      </div>
    </form>
  );
};

export default PaymentForm;

