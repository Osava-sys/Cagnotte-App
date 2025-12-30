import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CampaignCard from '../components/CampaignCard';
import { api } from '../services/api';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await api.get('/campaigns');
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des campagnes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Créez ou soutenez des campagnes</h1>
        <p>Rejoignez notre communauté et faites la différence</p>
        <Link to="/campaigns/create" className="btn-primary btn-large">
          Créer une campagne
        </Link>
      </section>

      <section className="campaigns-section">
        <h2>Campagnes en cours</h2>
        {campaigns.length === 0 ? (
          <p className="no-campaigns">Aucune campagne disponible pour le moment.</p>
        ) : (
          <div className="campaigns-grid">
            {campaigns.map(campaign => (
              <Link key={campaign._id} to={`/campaigns/${campaign._id}`}>
                <CampaignCard campaign={campaign} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

