/**
 * Page de contribution avec paiement Stripe
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { api } from '../services/api';
import { getStripe, createPaymentIntent, formatAmount } from '../services/stripe';
import PaymentForm from '../components/PaymentForm';
import CheckoutButton from '../components/CheckoutButton';

const ContributePage = ({ user }) => {
  const { id: campaignId } = useParams(); // Le paramètre est 'id' dans la route App.js
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État du formulaire
  const [step, setStep] = useState(1); // 1: montant, 2: infos, 3: paiement
  const [amount, setAmount] = useState('');
  const [contributorName, setContributorName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [contributorEmail, setContributorEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('checkout'); // 'checkout' ou 'elements'
  
  // État Stripe
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  // Montants suggérés
  const suggestedAmounts = [10, 25, 50, 100, 250];

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
      initStripe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/campaigns/${campaignId}`);
      // La réponse peut être dans response.data ou response directement
      const campaignData = response?.data?.campaign || response?.campaign || response?.data || response;
      setCampaign(campaignData);
    } catch (err) {
      setError('Campagne non trouvée');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const initStripe = async () => {
    const stripe = await getStripe();
    setStripePromise(stripe);
  };

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const handleNextStep = async () => {
    if (step === 1 && parseFloat(amount) >= 1) {
      setStep(2);
    } else if (step === 2) {
      if (!isAnonymous && (!contributorName || !contributorEmail)) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Si on utilise les Elements Stripe, créer le Payment Intent
      if (paymentMethod === 'elements') {
        try {
          const data = await createPaymentIntent({
            campaignId,
            amount: parseFloat(amount),
            contributorName,
            contributorEmail,
            message,
            isAnonymous
          });
          setClientSecret(data.clientSecret);
        } catch (err) {
          setError(err.error || 'Erreur lors de la préparation du paiement');
          return;
        }
      }
      
      setStep(3);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/payment/success');
  };

  const handlePaymentError = (err) => {
    setError(err.message || 'Erreur lors du paiement');
  };

  if (loading) {
    return (
      <div className="contribute-page">
        <div className="container">
          <div className="loading">Chargement de la campagne...</div>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="contribute-page">
        <div className="container">
          <div className="error">{error}</div>
          <Link to="/" className="btn-primary">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="contribute-page">
      <div className="contribute-container">
        {/* Section gauche - Formulaire */}
        <div className="contribute-form-section">
          {/* Header avec étapes */}
          <div className="form-header">
            <button 
              className="back-button" 
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            
            <div className="steps-indicator">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className="step-line"></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
              <div className="step-line"></div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
            </div>
          </div>

          {/* Étape 1: Montant */}
          {step === 1 && (
            <div className="step-content">
              <div className="step-header">
                <h1>Choisissez votre montant</h1>
                <p>Contribuez au succès de cette cagnotte</p>
              </div>

              <div className="amount-section">
                <div className="suggested-amounts">
                  {suggestedAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`amount-btn ${amount === value.toString() ? 'selected' : ''}`}
                      onClick={() => handleAmountSelect(value)}
                    >
                      {value} €
                    </button>
                  ))}
                </div>

                <div className="custom-amount">
                  <label>Ou entrez un montant personnalisé</label>
                  <div className="input-with-suffix">
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="amount-input"
                    />
                    <span className="input-suffix">€</span>
                  </div>
                </div>
              </div>

              <button
                className="btn-primary btn-full"
                onClick={handleNextStep}
                disabled={!amount || parseFloat(amount) < 1}
              >
                Continuer
              </button>
            </div>
          )}

          {/* Étape 2: Informations */}
          {step === 2 && (
            <div className="step-content">
              <div className="step-header">
                <h1>Vos informations</h1>
                <p>Dites-nous qui vous êtes</p>
              </div>

              <div className="form-fields">
                <div className="toggle-option" onClick={() => setIsAnonymous(!isAnonymous)}>
                  <div className="toggle-content">
                    <span className="toggle-title">Contribution anonyme</span>
                    <span className="toggle-description">
                      Votre nom ne sera pas affiché publiquement
                    </span>
                  </div>
                  <div className={`toggle-switch ${isAnonymous ? 'active' : ''}`}>
                    <div className="toggle-handle"></div>
                  </div>
                </div>

                {!isAnonymous && (
                  <>
                    <div className="form-group">
                      <label>Votre nom <span className="required">*</span></label>
                      <input
                        type="text"
                        value={contributorName}
                        onChange={(e) => setContributorName(e.target.value)}
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Votre email <span className="required">*</span></label>
                      <input
                        type="email"
                        value={contributorEmail}
                        onChange={(e) => setContributorEmail(e.target.value)}
                        placeholder="jean@exemple.fr"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Message (optionnel)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Laissez un message de soutien..."
                    rows={3}
                  />
                </div>

                {/* Choix du mode de paiement */}
                <div className="payment-method-choice">
                  <label>Mode de paiement</label>
                  <div className="payment-method-options">
                    <button
                      type="button"
                      className={`method-option ${paymentMethod === 'checkout' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('checkout')}
                    >
                      <span className="method-icon">🔗</span>
                      <span className="method-name">Stripe Checkout</span>
                      <span className="method-desc">Redirection sécurisée</span>
                    </button>
                    <button
                      type="button"
                      className={`method-option ${paymentMethod === 'elements' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('elements')}
                    >
                      <span className="method-icon">💳</span>
                      <span className="method-name">Carte bancaire</span>
                      <span className="method-desc">Paiement intégré</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="btn-primary btn-full"
                onClick={handleNextStep}
                disabled={!isAnonymous && (!contributorName || !contributorEmail)}
              >
                Continuer vers le paiement
              </button>
            </div>
          )}

          {/* Étape 3: Paiement */}
          {step === 3 && (
            <div className="step-content">
              <div className="step-header">
                <h1>Finaliser le paiement</h1>
                <p>Paiement 100% sécurisé</p>
              </div>

              {/* Récapitulatif */}
              <div className="payment-summary">
                <h4>Récapitulatif</h4>
                <div className="summary-row">
                  <span>Montant</span>
                  <span className="summary-amount">{formatAmount(parseFloat(amount))}</span>
                </div>
                <div className="summary-row">
                  <span>Campagne</span>
                  <span>{campaign?.title}</span>
                </div>
                {!isAnonymous && (
                  <div className="summary-row">
                    <span>Contributeur</span>
                    <span>{contributorName}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="error-message">{error}</div>
              )}

              {paymentMethod === 'checkout' ? (
                <CheckoutButton
                  campaignId={campaignId}
                  amount={amount}
                  contributorName={contributorName}
                  contributorEmail={contributorEmail}
                  message={message}
                  isAnonymous={isAnonymous}
                >
                  💳 Payer {formatAmount(parseFloat(amount))}
                </CheckoutButton>
              ) : (
                clientSecret && stripePromise && (
                  <Elements 
                    stripe={stripePromise} 
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#0B4B36',
                          colorBackground: '#ffffff',
                          colorText: '#1A1F2C',
                          colorDanger: '#E85D5D',
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          borderRadius: '10px',
                        },
                      },
                    }}
                  >
                    <PaymentForm
                      clientSecret={clientSecret}
                      amount={parseFloat(amount)}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                )
              )}
            </div>
          )}
        </div>

        {/* Section droite - Visuel */}
        <div className="contribute-visual">
          <div className="visual-content">
            {campaign?.images?.mainImage && (
              <img 
                src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${campaign.images.mainImage}`}
                alt={campaign.title}
                className="campaign-preview-image"
              />
            )}
            <div className="campaign-info">
              <h2>{campaign?.title}</h2>
              <p>{campaign?.description?.substring(0, 150)}...</p>
              
              <div className="campaign-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${Math.min((campaign?.currentAmount / campaign?.goalAmount) * 100, 100)}%` }}
                  />
                </div>
                <div className="progress-info">
                  <span className="current-amount">{formatAmount(campaign?.currentAmount || 0)}</span>
                  <span className="goal-amount">sur {formatAmount(campaign?.goalAmount || 0)}</span>
                </div>
              </div>

              <div className="campaign-stats">
                <div className="stat">
                  <span className="stat-value">{campaign?.stats?.contributorsCount || 0}</span>
                  <span className="stat-label">contributeurs</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {Math.round((campaign?.currentAmount / campaign?.goalAmount) * 100)}%
                  </span>
                  <span className="stat-label">atteint</span>
                </div>
              </div>
            </div>

            <div className="security-badges">
              <div className="badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <span>Paiement sécurisé</span>
              </div>
              <div className="badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Données protégées</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributePage;

