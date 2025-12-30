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
      const campaigns = await api.get('/campaigns');
      const userCampaigns = campaigns.filter(c => c.creator._id === user.id);
      setMyCampaigns(userCampaigns);
      
      // Fetch user's contributions
      const contributions = await api.get('/contributions/user/my-contributions');
      setMyContributions(contributions);
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
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

  const totalContributed = myContributions.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Tableau de bord</h1>
        
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
          <h2>Mes contributions</h2>
          {myContributions.length === 0 ? (
            <p className="no-data">Vous n'avez pas encore fait de contribution.</p>
          ) : (
            <div className="contributions-list">
              {myContributions.map(contribution => (
                <div key={contribution._id} className="contribution-item">
                  <div className="contribution-header">
                    <Link to={`/campaigns/${contribution.campaign._id}`}>
                      <h4>{contribution.campaign.title}</h4>
                    </Link>
                    <span className="contribution-amount">
                      {formatCurrency(contribution.amount)}
                    </span>
                  </div>
                  {contribution.message && (
                    <p className="contribution-message">{contribution.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

