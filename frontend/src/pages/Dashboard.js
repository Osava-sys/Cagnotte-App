import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CampaignCard from '../components/CampaignCard';
import { api } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const Dashboard = ({ user }) => {
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [myContributions, setMyContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's campaigns
      const campaignsResponse = await api.get('/campaigns');
      const campaignsList = Array.isArray(campaignsResponse)
        ? campaignsResponse
        : Array.isArray(campaignsResponse?.data)
          ? campaignsResponse.data
          : [];
      
      // Filtrer les campagnes de l'utilisateur et normaliser
      const userId = user.id || user._id;
      const userCampaigns = campaignsList
        .filter(c => {
          const creatorId = c.creator?._id || c.creator?.id || c.creator;
          return creatorId?.toString() === userId?.toString();
        })
        .map(c => ({
          ...c,
          goal: c.goal ?? c.goalAmount ?? 0,
          deadline: c.deadline ?? c.endDate,
          imageUrl: c.imageUrl ?? c.images?.mainImage ?? null,
          currentAmount: c.currentAmount ?? c.stats?.totalRaised ?? 0,
          status: c.status || 'active',
        }));
      
      setMyCampaigns(userCampaigns);
      
      // Fetch user's contributions
      try {
        const contributionsResponse = await api.get('/contributions/user/my-contributions');
        const contributionsList = Array.isArray(contributionsResponse)
          ? contributionsResponse
          : Array.isArray(contributionsResponse?.data)
            ? contributionsResponse.data
            : [];
        setMyContributions(contributionsList);
      } catch (contribErr) {
        // Si l'endpoint n'existe pas, utiliser une liste vide
        console.warn('Endpoint contributions non disponible:', contribErr);
        setMyContributions([]);
      }
      
      setError(null);
    } catch (err) {
      const errorMsg = err?.error || err?.message || 'Erreur lors du chargement des données';
      setError(errorMsg);
      console.error('Erreur fetchDashboardData:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-required">
        <p>Vous devez être connecté pour accéder au tableau de bord.</p>
        <a href="/login">Se connecter</a>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  const totalContributed = myContributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalRaised = myCampaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
          Tableau de bord
        </h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Mes campagnes</h3>
            <p className="stat-value">{myCampaigns.length}</p>
          </div>
          <div className="stat-card">
            <h3>Mes contributions</h3>
            <p className="stat-value">{myContributions.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total contribué</h3>
            <p className="stat-value">{formatCurrency(totalContributed)}</p>
          </div>
          <div className="stat-card">
            <h3>Total collecté</h3>
            <p className="stat-value">{formatCurrency(totalRaised)}</p>
          </div>
        </div>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Mes campagnes</h2>
            <Link to="/campaigns/create" className="btn-primary">
              Créer une campagne
            </Link>
          </div>
          
          {myCampaigns.length === 0 ? (
            <p className="no-data">Vous n'avez pas encore créé de campagne.</p>
          ) : (
            <div className="campaigns-grid">
              {myCampaigns.map(campaign => (
                <Link key={campaign._id} to={`/campaigns/${campaign._id}`}>
                  <CampaignCard campaign={campaign} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Mes contributions</h2>
          </div>
          {myContributions.length === 0 ? (
            <p className="no-data">Vous n'avez pas encore fait de contribution.</p>
          ) : (
            <div className="contributions-list">
              {myContributions.map(contribution => {
                const campaignId = contribution.campaign?._id || contribution.campaign?.id || contribution.campaign;
                const campaignTitle = contribution.campaign?.title || 'Campagne supprimée';
                
                return (
                  <div key={contribution._id || contribution.id} className="contribution-item">
                    <div className="contribution-header">
                      {campaignId ? (
                        <Link to={`/campaigns/${campaignId}`} style={{ textDecoration: 'none' }}>
                          <span className="contributor-name">{campaignTitle}</span>
                        </Link>
                      ) : (
                        <span className="contributor-name">{campaignTitle}</span>
                      )}
                      <span className="contribution-amount">
                        {formatCurrency(contribution.amount || 0)}
                      </span>
                    </div>
                    {contribution.message && (
                      <p className="contribution-message">"{contribution.message}"</p>
                    )}
                    {contribution.createdAt && (
                      <span className="contribution-date">
                        {new Date(contribution.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

