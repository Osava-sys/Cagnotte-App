/**
 * Page de succès de paiement
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSessionStatus } from '../services/stripe';
import { formatCurrency } from '../utils/helpers';
import ShareButtons from '../components/ShareButtons';
import { api } from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getSessionStatus(sessionId);
        setPaymentDetails(data);
      } catch (err) {
        console.error('Erreur récupération statut:', err);
        setError('Impossible de récupérer les détails du paiement');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="payment-result-page">
        <div className="payment-result-container">
          <div className="loading">
            Vérification du paiement...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page success">
      <div className="payment-result-container">
        <div className="result-icon success">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>

        <h1>Merci pour votre contribution ! 🎉</h1>
        
        <p className="result-message">
          Votre paiement a été traité avec succès. Un email de confirmation 
          vous sera envoyé prochainement.
        </p>

        {paymentDetails && (
          <div className="payment-details-card">
            <h3>Détails de la contribution</h3>
            <div className="detail-row">
              <span className="detail-label">Montant</span>
              <span className="detail-value">
                {formatCurrency(paymentDetails.amountTotal || 0)}
              </span>
            </div>
            {paymentDetails.contribution?.campaign && (
              <div className="detail-row">
                <span className="detail-label">Campagne</span>
                <span className="detail-value">
                  {paymentDetails.contribution.campaign.title}
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Statut</span>
              <span className="detail-value status-badge success">
                ✓ Confirmé
              </span>
            </div>
          </div>
        )}

        <div className="result-actions">
          {paymentDetails?.contribution?.campaign?.slug ? (
            <Link 
              to={`/campaigns/${paymentDetails.contribution.campaign.slug}`}
              className="btn-primary"
            >
              Voir la campagne
            </Link>
          ) : (
            <Link to="/" className="btn-primary">
              Retour à l'accueil
            </Link>
          )}
          
          <Link to="/" className="btn-secondary">
            Découvrir d'autres cagnottes
          </Link>
        </div>

        {paymentDetails?.contribution?.campaign && (
          <div className="share-section">
            <p>Partagez cette cagnotte pour aider encore plus !</p>
            <ShareButtons
              url={`${window.location.origin}/campaigns/${paymentDetails.contribution.campaign.slug || paymentDetails.contribution.campaign._id}`}
              title={`${paymentDetails.contribution.campaign.title} - J'ai contribué à cette cagnotte !`}
              description="Rejoignez-moi pour soutenir cette cause !"
              hashtags={['cagnotte', 'solidarité', 'contribution']}
              onShare={async (platform) => {
                try {
                  await api.post(`/campaigns/${paymentDetails.contribution.campaign._id}/share`, { platform });
                } catch (err) {
                  console.log('Tracking du partage échoué:', err);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;

