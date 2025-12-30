/**
 * Page d'annulation de paiement
 */

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign_id');

  return (
    <div className="payment-result-page cancel">
      <div className="payment-result-container">
        <div className="result-icon cancel">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        </div>

        <h1>Paiement annulé</h1>
        
        <p className="result-message">
          Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
        </p>

        <div className="cancel-info">
          <h3>Que s'est-il passé ?</h3>
          <p>
            Vous avez annulé le processus de paiement ou celui-ci a expiré. 
            Pas de souci, vous pouvez réessayer quand vous le souhaitez !
          </p>
        </div>

        <div className="result-actions">
          {campaignId ? (
            <Link to={`/campaigns/${campaignId}`} className="btn-primary">
              Retourner à la campagne
            </Link>
          ) : (
            <Link to="/" className="btn-primary">
              Retour à l'accueil
            </Link>
          )}
          
          <Link to="/" className="btn-secondary">
            Explorer d'autres cagnottes
          </Link>
        </div>

        <div className="help-section">
          <h4>Besoin d'aide ?</h4>
          <p>
            Si vous rencontrez des difficultés lors du paiement, 
            n'hésitez pas à nous contacter.
          </p>
          <a href="mailto:support@cagnotte.fr" className="help-link">
            📧 support@cagnotte.fr
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;

