import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CampaignCard from '../components/CampaignCard';
import { api } from '../services/api';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns, searchQuery, categoryFilter, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/campaigns');

      const rawList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const normalizedList = rawList.map(c => ({
        ...c,
        goal: c.goal ?? c.goalAmount ?? 0,
        deadline: c.deadline ?? c.endDate,
        imageUrl: c.imageUrl ?? c.images?.mainImage ?? null,
        currentAmount: c.currentAmount ?? c.stats?.totalRaised ?? 0,
        status: c.status || 'active',
      }));

      setCampaigns(normalizedList);
      setFilteredCampaigns(normalizedList);
    } catch (err) {
      const errorMsg = err?.error || err?.message || 'Erreur lors du chargement des campagnes';
      setError(errorMsg);
      console.error('Erreur fetchCampaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title?.toLowerCase().includes(query) ||
        campaign.description?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(campaign => campaign.category === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    setFilteredCampaigns(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterCampaigns();
  };

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'sante', label: '🏥 Santé' },
    { value: 'education', label: '📚 Éducation' },
    { value: 'projet', label: '💡 Projet' },
    { value: 'urgence', label: '🚨 Urgence' },
    { value: 'environnement', label: '🌱 Environnement' },
    { value: 'culture', label: '🎭 Culture' },
    { value: 'sport', label: '⚽ Sport' },
    { value: 'entrepreneuriat', label: '🚀 Entrepreneuriat' },
    { value: 'autre', label: '📦 Autre' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">🎁 Plateforme de cagnotte solidaire</span>
            <h1>Donnez vie à vos projets<br />avec la force du collectif</h1>
            <p>
              Créez votre cagnotte en quelques clics et mobilisez votre entourage 
              pour financer vos projets, événements ou causes qui vous tiennent à cœur.
            </p>
            <div className="hero-buttons">
              <Link to="/campaigns/create" className="btn-primary btn-large">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Créer ma cagnotte
              </Link>
              <a href="#campaigns" className="btn-secondary btn-large">
                Explorer les cagnottes
              </a>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">100%</span>
              <span className="hero-stat-label">Gratuit</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">🔒</span>
              <span className="hero-stat-label">Sécurisé</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">⚡</span>
              <span className="hero-stat-label">Instantané</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Paiement sécurisé</h3>
              <p>Transactions cryptées et protégées par les meilleurs standards de sécurité.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 8l-4 4-4-4"/>
                  <path d="M12 12v6"/>
                </svg>
              </div>
              <h3>Retrait simple</h3>
              <p>Récupérez vos fonds quand vous le souhaitez, sans frais cachés.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Partage facile</h3>
              <p>Partagez votre cagnotte en un clic sur les réseaux sociaux.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="campaigns-section">
        <div className="container">
          {/* Search Section */}
          <div className="search-section">
            <div className="search-header">
              <h2>Découvrez les cagnottes du moment</h2>
              <p>Soutenez les projets qui vous inspirent</p>
            </div>
            
            <form onSubmit={handleSearch} className="search-bar">
              <div className="search-input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher une cagnotte..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                Rechercher
              </button>
            </form>
            
            <div className="filters">
              <div className="filter-group">
                <label htmlFor="category">Catégorie</label>
                <select
                  id="category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="status">Statut</label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">🟢 En cours</option>
                  <option value="completed">🔵 Terminées</option>
                  <option value="pending">🟡 En attente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results header */}
          <div className="results-header">
            <h2>
              {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'cagnotte' : 'cagnottes'} 
              {statusFilter === 'active' ? ' en cours' : ''}
            </h2>
            {(searchQuery || categoryFilter) && (
              <button 
                className="btn-outline" 
                onClick={() => { setSearchQuery(''); setCategoryFilter(''); }}
              >
                Effacer les filtres
              </button>
            )}
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="loading">
              <span>Chargement des cagnottes...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="error">
              {error}
              <button onClick={fetchCampaigns} className="btn-secondary" style={{ marginTop: '1rem' }}>
                Réessayer
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredCampaigns.length === 0 && (
            <div className="no-campaigns">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <h3>Aucune cagnotte trouvée</h3>
              <p>
                {searchQuery || categoryFilter || statusFilter
                  ? 'Aucune cagnotte ne correspond à vos critères de recherche.'
                  : 'Soyez le premier à créer une cagnotte !'}
              </p>
              <Link to="/campaigns/create" className="btn-primary">
                Créer une cagnotte
              </Link>
            </div>
          )}

          {/* Campaigns Grid */}
          {!loading && !error && filteredCampaigns.length > 0 && (
            <div className="campaigns-grid">
              {filteredCampaigns.map(campaign => (
                <Link key={campaign._id} to={`/campaigns/${campaign._id}`}>
                  <CampaignCard campaign={campaign} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à lancer votre cagnotte ?</h2>
            <p>
              Rejoignez des milliers de personnes qui ont déjà réalisé leurs projets 
              grâce à la générosité de leur entourage.
            </p>
            <Link to="/campaigns/create" className="btn-primary btn-large">
              Créer ma cagnotte gratuitement
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .home-page {
          overflow-x: hidden;
        }
        
        /* Hero improvements */
        .hero-content {
          max-width: 700px;
          margin: 0 auto;
        }
        
        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 2rem;
        }
        
        .hero-buttons .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .hero-buttons .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
        }
        
        .hero-buttons .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: white;
        }
        
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .hero-stat {
          text-align: center;
        }
        
        .hero-stat-value {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .hero-stat-label {
          font-size: 0.85rem;
          opacity: 0.8;
        }
        
        /* Features Section */
        .features-section {
          padding: 4rem 0;
          background: white;
          margin-top: -2rem;
          position: relative;
          z-index: 2;
          border-radius: 24px 24px 0 0;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }
        
        .feature-card {
          text-align: center;
          padding: 2rem;
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          background: #f5f7f9;
          transform: translateY(-4px);
        }
        
        .feature-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #E8F5F0 0%, #fff 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #0B4B36;
        }
        
        .feature-card h3 {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: #1A1F2C;
        }
        
        .feature-card p {
          color: #5A6378;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        
        /* Search improvements */
        .search-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .search-header h2 {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1A1F2C;
          margin-bottom: 0.5rem;
        }
        
        .search-header h2::before {
          display: none;
        }
        
        .search-header p {
          color: #5A6378;
        }
        
        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-input-wrapper svg {
          position: absolute;
          left: 1rem;
          color: #8F96A3;
          pointer-events: none;
        }
        
        .search-input-wrapper input {
          padding-left: 3rem;
          width: 100%;
        }
        
        /* Results header */
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .results-header h2 {
          margin-bottom: 0;
        }
        
        /* Empty state */
        .no-campaigns {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 20px;
          border: 2px dashed #e8ecf0;
        }
        
        .empty-icon {
          color: #b8bcc8;
          margin-bottom: 1.5rem;
        }
        
        .no-campaigns h3 {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1A1F2C;
          margin-bottom: 0.75rem;
        }
        
        .no-campaigns p {
          color: #5A6378;
          margin-bottom: 1.5rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* CTA Section */
        .cta-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, #0B4B36 0%, #0D5A42 100%);
          margin-top: 4rem;
        }
        
        .cta-content {
          text-align: center;
          color: white;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .cta-content h2 {
          font-family: 'DM Sans', sans-serif;
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .cta-content p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.7;
        }
        
        .cta-content .btn-primary {
          background: white;
          color: #0B4B36;
        }
        
        .cta-content .btn-primary:hover {
          background: #f5f7f9;
          transform: translateY(-3px);
        }
        
        @media (max-width: 768px) {
          .hero-stats {
            gap: 1.5rem;
          }
          
          .hero-stat-value {
            font-size: 1.25rem;
          }
          
          .features-section {
            padding: 2rem 0;
            margin-top: 0;
            border-radius: 0;
          }
          
          .cta-content h2 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
