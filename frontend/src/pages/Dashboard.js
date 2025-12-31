import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CampaignCard from '../components/CampaignCard';
import { SkeletonDashboard } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useToast } from '../contexts/ToastContext';
import { CATEGORIES } from './Home';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [myDrafts, setMyDrafts] = useState([]);
  const [myContributions, setMyContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  // Modal de confirmation
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null,
    confirmText: 'Confirmer'
  });

  const fetchDashboardData = useCallback(async () => {
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

      // Separer brouillons et campagnes publiees
      const drafts = userCampaigns.filter(c => c.status === 'draft');
      const published = userCampaigns.filter(c => c.status !== 'draft');

      setMyDrafts(drafts);
      setMyCampaigns(published);

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
        console.warn('Endpoint contributions non disponible:', contribErr);
        setMyContributions([]);
      }

      setError(null);
    } catch (err) {
      const errorMsg = err?.error || err?.message || 'Erreur lors du chargement des donnees';
      setError(errorMsg);
      console.error('Erreur fetchDashboardData:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Fermer le modal
  const closeModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Supprimer un brouillon
  const handleDeleteDraft = (campaignId) => {
    const draft = myDrafts.find(d => d._id === campaignId);

    setConfirmModal({
      isOpen: true,
      title: 'Supprimer le brouillon',
      message: `Voulez-vous vraiment supprimer le brouillon "${draft?.title || 'Sans titre'}" ?\n\nCette action est irreversible.`,
      type: 'warning',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        try {
          setDeletingId(campaignId);
          await api.delete(`/campaigns/${campaignId}`);
          toast.success('Brouillon supprime');
          setMyDrafts(prev => prev.filter(d => d._id !== campaignId));
          closeModal();
        } catch (err) {
          const message = err?.error || err?.message || 'Erreur lors de la suppression';
          toast.error(message);
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  // Publier un brouillon
  const handlePublishDraft = async (campaignId) => {
    try {
      setPublishingId(campaignId);
      await api.put(`/campaigns/${campaignId}`, { status: 'active' });
      toast.success('Campagne publiee avec succes !');
      fetchDashboardData();
    } catch (err) {
      const message = err?.error || err?.message || 'Erreur lors de la publication';
      toast.error(message);
    } finally {
      setPublishingId(null);
    }
  };

  // Supprimer une campagne publiee
  const handleDeleteCampaign = (campaign) => {
    const hasContributions = campaign.currentAmount > 0 || campaign.stats?.contributorsCount > 0;

    let message = `Voulez-vous vraiment supprimer la campagne "${campaign.title}" ?`;
    if (hasContributions) {
      message += `\n\nCette campagne a deja collecte ${formatCurrency(campaign.currentAmount)}. Toutes les contributions associees seront egalement supprimees.`;
    }
    message += '\n\nCette action est irreversible.';

    setConfirmModal({
      isOpen: true,
      title: 'Supprimer la campagne',
      message,
      type: hasContributions ? 'danger' : 'warning',
      confirmText: hasContributions ? 'Supprimer definitivement' : 'Supprimer',
      onConfirm: async () => {
        try {
          setDeletingId(campaign._id);
          await api.delete(`/campaigns/${campaign._id}`);
          toast.success('Campagne supprimee avec succes');
          setMyCampaigns(prev => prev.filter(c => c._id !== campaign._id));
          closeModal();
        } catch (err) {
          const message = err?.error || err?.message || 'Erreur lors de la suppression';
          toast.error(message);
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  // Obtenir les infos de categorie
  const getCategoryInfo = (categoryValue) => {
    const cat = CATEGORIES.find(c => c.value === categoryValue);
    return cat || { label: categoryValue || 'Autre', icon: '', color: '#95a5a6' };
  };

  // Obtenir le libelle du statut
  const getStatusLabel = (status) => {
    const statusLabels = {
      draft: { label: 'Brouillon', color: '#6c757d', bg: '#f8f9fa' },
      pending: { label: 'En attente', color: '#f39c12', bg: '#fff8e1' },
      active: { label: 'En cours', color: '#27ae60', bg: '#e8f5e9' },
      successful: { label: 'Objectif atteint', color: '#9b59b6', bg: '#f3e5f5' },
      expired: { label: 'Expiree', color: '#e74c3c', bg: '#ffebee' },
      cancelled: { label: 'Annulee', color: '#95a5a6', bg: '#eceff1' }
    };
    return statusLabels[status] || statusLabels.active;
  };

  if (!user) {
    return (
      <div className="auth-required">
        <p>Vous devez etre connecte pour acceder au tableau de bord.</p>
        <a href="/login">Se connecter</a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
            Tableau de bord
          </h1>
          <SkeletonDashboard />
        </div>
      </div>
    );
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
            <h3>Brouillons</h3>
            <p className="stat-value">{myDrafts.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total contribue</h3>
            <p className="stat-value">{formatCurrency(totalContributed)}</p>
          </div>
          <div className="stat-card">
            <h3>Total collecte</h3>
            <p className="stat-value">{formatCurrency(totalRaised)}</p>
          </div>
        </div>

        {/* Section Brouillons */}
        {myDrafts.length > 0 && (
          <section className="dashboard-section drafts-section">
            <div className="section-header">
              <h2>Mes brouillons</h2>
              <span className="badge-count">{myDrafts.length}</span>
            </div>

            <div className="drafts-list">
              {myDrafts.map(draft => {
                const categoryInfo = getCategoryInfo(draft.category);

                return (
                  <div key={draft._id} className="draft-card">
                    <div className="draft-icon" style={{ backgroundColor: `${categoryInfo.color}20` }}>
                      {categoryInfo.icon || '📝'}
                    </div>

                    <div className="draft-content">
                      <h4>{draft.title}</h4>
                      <p className="draft-meta">
                        <span className="draft-category">{categoryInfo.label}</span>
                        {draft.goal > 0 && (
                          <span className="draft-goal">Objectif: {formatCurrency(draft.goal)}</span>
                        )}
                        {draft.updatedAt && (
                          <span className="draft-date">
                            Modifie le {formatDate(draft.updatedAt)}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="draft-actions">
                      <button
                        className="btn-outline btn-sm"
                        onClick={() => navigate(`/campaigns/${draft._id}`)}
                        title="Voir le brouillon"
                      >
                        Voir
                      </button>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handlePublishDraft(draft._id)}
                        disabled={publishingId === draft._id}
                        title="Publier la campagne"
                      >
                        {publishingId === draft._id ? 'Publication...' : 'Publier'}
                      </button>
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => handleDeleteDraft(draft._id)}
                        disabled={deletingId === draft._id}
                        title="Supprimer le brouillon"
                      >
                        {deletingId === draft._id ? '...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section Campagnes publiees */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Mes campagnes</h2>
            <Link to="/campaigns/create" className="btn-primary">
              Creer une campagne
            </Link>
          </div>

          {myCampaigns.length === 0 ? (
            <div className="no-data-card">
              <div className="no-data-icon">📋</div>
              <p>Vous n'avez pas encore cree de campagne.</p>
              <Link to="/campaigns/create" className="btn-primary">
                Creer ma premiere cagnotte
              </Link>
            </div>
          ) : (
            <div className="campaigns-grid">
              {myCampaigns.map(campaign => (
                <div key={campaign._id} className="campaign-wrapper">
                  <Link to={`/campaigns/${campaign._id}`}>
                    <CampaignCard campaign={campaign} />
                  </Link>
                  <div className="campaign-status-badge" style={{
                    backgroundColor: getStatusLabel(campaign.status).bg,
                    color: getStatusLabel(campaign.status).color
                  }}>
                    {getStatusLabel(campaign.status).label}
                  </div>
                  <div className="campaign-actions-overlay">
                    <button
                      className="btn-icon btn-edit"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/campaigns/${campaign._id}`);
                      }}
                      title="Voir la campagne"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteCampaign(campaign);
                      }}
                      disabled={deletingId === campaign._id}
                      title="Supprimer la campagne"
                    >
                      {deletingId === campaign._id ? (
                        <span className="btn-spinner-small"></span>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section Contributions */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Mes contributions</h2>
          </div>
          {myContributions.length === 0 ? (
            <div className="no-data-card">
              <div className="no-data-icon">💝</div>
              <p>Vous n'avez pas encore fait de contribution.</p>
              <Link to="/" className="btn-secondary">
                Decouvrir les cagnottes
              </Link>
            </div>
          ) : (
            <div className="contributions-list">
              {myContributions.map(contribution => {
                const campaignId = contribution.campaign?._id || contribution.campaign?.id || contribution.campaign;
                const campaignTitle = contribution.campaign?.title || 'Campagne supprimee';

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

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        loading={deletingId !== null}
      />

      <style>{`
        .drafts-section {
          background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
          border: 2px dashed #f39c12;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .drafts-section .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .badge-count {
          background: #f39c12;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .drafts-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .draft-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .draft-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .draft-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .draft-content {
          flex: 1;
          min-width: 0;
        }

        .draft-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .draft-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .draft-category {
          color: var(--primary-color);
          font-weight: 500;
        }

        .draft-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          border-radius: 8px;
        }

        .btn-danger {
          background: #e74c3c;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-danger:hover {
          background: #c0392b;
        }

        .btn-danger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .campaign-wrapper {
          position: relative;
        }

        .campaign-status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 10;
        }

        .campaign-actions-overlay {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 10;
        }

        .campaign-wrapper:hover .campaign-actions-overlay {
          opacity: 1;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .btn-icon:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-edit {
          background: white;
          color: var(--primary-color);
        }

        .btn-edit:hover {
          background: var(--primary-color);
          color: white;
        }

        .btn-delete {
          background: white;
          color: #e74c3c;
        }

        .btn-delete:hover {
          background: #e74c3c;
          color: white;
        }

        .btn-spinner-small {
          width: 14px;
          height: 14px;
          border: 2px solid #e74c3c;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .no-data-card {
          text-align: center;
          padding: 3rem 2rem;
          background: var(--bg-light);
          border-radius: 16px;
          border: 2px dashed var(--border-light);
        }

        .no-data-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .no-data-card p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .draft-card {
            flex-wrap: wrap;
          }

          .draft-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }

          .draft-meta {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
