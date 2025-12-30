import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContributionForm from '../components/ContributionForm';
import { api } from '../services/api';
import { formatCurrency, calculatePercentage, formatDate } from '../utils/helpers';

const CampaignDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      const data = await api.get(`/campaigns/${id}`);
      setCampaign(data.campaign);
      setContributions(data.contributions || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de la campagne');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (contributionData) => {
    try {
      await api.post(`/contributions/campaign/${id}`, contributionData);
      setShowForm(false);
      fetchCampaignDetails();
    } catch (err) {
      alert('Erreur lors de la contribution');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error || !campaign) {
    return <div className="error">{error || 'Campagne non trouvée'}</div>;
  }

  const progress = calculatePercentage(campaign.currentAmount, campaign.goal);

  return (
    <div className="campaign-detail-page">
      {campaign.imageUrl && (
        <div className="campaign-header-image">
          <img src={campaign.imageUrl} alt={campaign.title} />
        </div>
      )}
      
      <div className="container">
        <div className="campaign-detail">
          <div className="campaign-main">
            <h1>{campaign.title}</h1>
            <p className="campaign-description">{campaign.description}</p>
            
            <div className="campaign-progress-section">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-stats">
                <div>
                  <span className="stat-value">{formatCurrency(campaign.currentAmount)}</span>
                  <span className="stat-label">Collecté</span>
                </div>
                <div>
                  <span className="stat-value">{formatCurrency(campaign.goal)}</span>
                  <span className="stat-label">Objectif</span>
                </div>
                <div>
                  <span className="stat-value">{progress.toFixed(1)}%</span>
                  <span className="stat-label">Progression</span>
                </div>
              </div>
            </div>

            {campaign.status === 'active' && user && (
              <div className="contribute-section">
                {!showForm ? (
                  <button 
                    className="btn-primary btn-large"
                    onClick={() => setShowForm(true)}
                  >
                    Contribuer maintenant
                  </button>
                ) : (
                  <ContributionForm
                    campaignId={id}
                    onSubmit={handleContribute}
                    onCancel={() => setShowForm(false)}
                  />
                )}
              </div>
            )}

            {!user && campaign.status === 'active' && (
              <p className="login-prompt">
                <a href="/login">Connectez-vous</a> pour contribuer à cette campagne
              </p>
            )}
          </div>

          <div className="campaign-sidebar">
            <div className="campaign-info-card">
              <h3>Informations</h3>
              <p><strong>Créateur:</strong> {campaign.creator?.username || 'Anonyme'}</p>
              <p><strong>Date limite:</strong> {formatDate(campaign.deadline)}</p>
              <p><strong>Statut:</strong> <span className={`status ${campaign.status}`}>{campaign.status}</span></p>
              <p><strong>Contributeurs:</strong> {campaign.contributors?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="contributions-section">
          <h2>Contributions ({contributions.length})</h2>
          {contributions.length === 0 ? (
            <p>Aucune contribution pour le moment.</p>
          ) : (
            <div className="contributions-list">
              {contributions.map(contribution => (
                <div key={contribution._id} className="contribution-item">
                  <div className="contribution-header">
                    <span className="contributor-name">
                      {contribution.anonymous ? 'Anonyme' : contribution.contributor?.username || 'Utilisateur'}
                    </span>
                    <span className="contribution-amount">
                      {formatCurrency(contribution.amount)}
                    </span>
                  </div>
                  {contribution.message && (
                    <p className="contribution-message">{contribution.message}</p>
                  )}
                  <span className="contribution-date">
                    {formatDate(contribution.createdAt)}
                  </span>
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

