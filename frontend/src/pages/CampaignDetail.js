import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ContributionForm from '../components/ContributionForm';
import { api } from '../services/api';
import { formatCurrency, calculatePercentage, formatDate } from '../utils/helpers';

const CampaignDetail = ({ user }) => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/campaigns/${id}`);
      
      // Normaliser la réponse (peut être data.campaign ou directement campaign)
      const campaignData = response?.data?.campaign || response?.campaign || response?.data || response;
      const contributionsData = response?.data?.contributions || response?.contributions || [];
      
      // Normaliser les champs
      const normalizedCampaign = {
        ...campaignData,
        goal: campaignData.goal ?? campaignData.goalAmount ?? 0,
        deadline: campaignData.deadline ?? campaignData.endDate,
        imageUrl: campaignData.imageUrl ?? campaignData.images?.mainImage ?? null,
        currentAmount: campaignData.currentAmount ?? campaignData.stats?.totalRaised ?? 0,
        status: campaignData.status || 'active',
      };
      
      setCampaign(normalizedCampaign);
      setContributions(contributionsData);
      setError(null);
    } catch (err) {
      const errorMsg = err?.error || err?.message || 'Erreur lors du chargement de la campagne';
      setError(errorMsg);
      console.error('Erreur fetchCampaignDetails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (contributionData) => {
    try {
      const response = await api.post(`/contributions/campaign/${id}`, contributionData);
      
      if (response.success !== false) {
        setShowForm(false);
        // Recharger les détails de la campagne pour mettre à jour les montants
        await fetchCampaignDetails();
        alert('Merci pour votre contribution !');
      } else {
        throw new Error(response.error || 'Erreur lors de la contribution');
      }
    } catch (err) {
      const errorMsg = err?.error || err?.message || 'Erreur lors de la contribution';
      alert(errorMsg);
      console.error('Erreur contribution:', err);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error || !campaign) {
    return <div className="error">{error || 'Campagne non trouvée'}</div>;
  }

  const progress = calculatePercentage(campaign.currentAmount || 0, campaign.goal || 1);
  const contributorsCount = campaign.contributors?.length || 
                            campaign.stats?.contributors || 
                            contributions.length || 0;
  const creatorName = campaign.creator?.firstName && campaign.creator?.lastName
    ? `${campaign.creator.firstName} ${campaign.creator.lastName}`
    : campaign.creator?.username || campaign.creator?.email || 'Anonyme';

  return (
    <div className="campaign-detail-page">
      {campaign.imageUrl && (
        <div className="campaign-header-image">
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title || 'Campagne'} 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="container">
        <div className="campaign-detail">
          <div className="campaign-main">
            <h1>{campaign.title || 'Sans titre'}</h1>
            {(campaign.description || campaign.shortDescription) && (
              <p className="campaign-description">
                {campaign.description || campaign.shortDescription}
              </p>
            )}
            
            <div className="campaign-progress-section">
              <div className="progress-bar" style={{ height: '16px', marginBottom: '1rem' }}>
                <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
              </div>
              <div className="progress-stats">
                <div>
                  <span className="stat-value">{formatCurrency(campaign.currentAmount || 0)}</span>
                  <span className="stat-label">Collecté</span>
                </div>
                <div>
                  <span className="stat-value">{formatCurrency(campaign.goal || 0)}</span>
                  <span className="stat-label">Objectif</span>
                </div>
                <div>
                  <span className="stat-value">{progress.toFixed(1)}%</span>
                  <span className="stat-label">Progression</span>
                </div>
              </div>
            </div>

            {campaign.status === 'active' && (
              <div className="contribute-section">
                <div className="contribute-buttons">
                  {/* Bouton principal - Paiement Stripe */}
                  <Link 
                    to={`/campaigns/${campaign._id || id}/contribute`}
                    className="btn-primary btn-large"
                  >
                    💳 Contribuer avec paiement sécurisé
                  </Link>
                  
                  {/* Option alternative pour utilisateurs connectés */}
                  {user && (
                    <>
                      {!showForm ? (
                        <button 
                          className="btn-secondary"
                          onClick={() => setShowForm(true)}
                        >
                          Contribuer (mode classique)
                        </button>
                      ) : (
                        <ContributionForm
                          campaignId={id}
                          onSubmit={handleContribute}
                          onCancel={() => setShowForm(false)}
                        />
                      )}
                    </>
                  )}
                </div>
                
                {!user && (
                  <p className="contribute-note">
                    Vous pouvez contribuer en tant qu'invité ou <Link to="/login">vous connecter</Link> pour un suivi personnalisé.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="campaign-sidebar">
            <div className="campaign-info-card">
              <h3>Informations</h3>
              <p>
                <strong>Créateur:</strong> {creatorName}
              </p>
              {campaign.deadline && (
                <p>
                  <strong>Date limite:</strong> {formatDate(campaign.deadline)}
                </p>
              )}
              <p>
                <strong>Statut:</strong>{' '}
                <span className={`status ${campaign.status || 'active'}`}>
                  {campaign.status === 'active' ? 'En cours' : 
                   campaign.status === 'completed' ? 'Terminée' :
                   campaign.status === 'pending' ? 'En attente' :
                   campaign.status || 'Active'}
                </span>
              </p>
              {campaign.category && (
                <p>
                  <strong>Catégorie:</strong> {campaign.category}
                </p>
              )}
              <p>
                <strong>Contributeurs:</strong> {contributorsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="contributions-section">
          <h2>Contributions ({contributions.length})</h2>
          {contributions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              Aucune contribution pour le moment. Soyez le premier à contribuer !
            </p>
          ) : (
            <div className="contributions-list">
              {contributions.map(contribution => (
                <div key={contribution._id} className="contribution-item">
                  <div className="contribution-header">
                    <span className="contributor-name">
                      {contribution.anonymous ? 'Anonyme' : 
                       contribution.contributor?.firstName && contribution.contributor?.lastName
                         ? `${contribution.contributor.firstName} ${contribution.contributor.lastName}`
                         : contribution.contributor?.username || 
                           contribution.contributor?.email || 
                           'Utilisateur'}
                    </span>
                    <span className="contribution-amount">
                      {formatCurrency(contribution.amount || 0)}
                    </span>
                  </div>
                  {contribution.message && (
                    <p className="contribution-message">"{contribution.message}"</p>
                  )}
                  {contribution.createdAt && (
                    <span className="contribution-date">
                      {formatDate(contribution.createdAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;

