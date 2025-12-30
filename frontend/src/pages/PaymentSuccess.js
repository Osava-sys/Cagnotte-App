/**
 * Page de succès de paiement
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSessionStatus } from '../services/stripe';
import { formatCurrency } from '../utils/helpers';

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

        <div className="share-section">
          <p>Partagez cette cagnotte pour aider encore plus !</p>
          <div className="share-buttons">
            <button className="share-btn facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </button>
            <button className="share-btn twitter">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </button>
            <button className="share-btn whatsapp">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </button>
            <button 
              className="share-btn copy"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

