/**
 * Bouton de checkout Stripe - Redirige vers Stripe Checkout
 */

import React, { useState } from 'react';
import { createCheckoutSession } from '../services/stripe';

const CheckoutButton = ({ 
  campaignId,
  amount,
  contributorName,
  contributorEmail,
  message,
  isAnonymous,
  disabled,
  className,
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await createCheckoutSession({
        campaignId,
        amount: parseFloat(amount),
        contributorName,
        contributorEmail,
        message,
        isAnonymous
      });
      // La redirection vers Stripe est gérée dans createCheckoutSession
    } catch (err) {
      console.error('Erreur checkout:', err);
      setError(err.error || 'Erreur lors de la création du paiement');
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-button-container">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        className={`btn-primary btn-full ${className || ''}`}
      >
        {isLoading ? (
          <>
            <span className="btn-spinner"></span>
            Redirection vers le paiement...
          </>
        ) : (
          children || '💳 Procéder au paiement'
        )}
      </button>

      {error && (
        <div className="checkout-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default CheckoutButton;

