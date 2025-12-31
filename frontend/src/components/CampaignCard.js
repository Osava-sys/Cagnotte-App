import React, { useState } from 'react';
import { formatCurrency, calculatePercentage, isExpired, getImageUrl } from '../utils/helpers';
import { CATEGORIES } from '../pages/Home';

const CampaignCard = ({ campaign, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const progress = calculatePercentage(campaign.currentAmount || 0, campaign.goal || 1);
  const expired = campaign.deadline ? isExpired(campaign.deadline) : false;
  const description = campaign.description || campaign.shortDescription || '';
  const truncatedDescription = description.length > 100
    ? description.substring(0, 100) + '...'
    : description;

  // Obtenir le nombre de contributeurs
  const contributorsCount = campaign.contributors?.length ||
                            campaign.stats?.contributors ||
                            campaign.contributionsCount || 0;

  // Obtenir l'URL de l'image avec gestion des URLs relatives
  const imageUrl = getImageUrl(
    campaign.imageUrl || campaign.images?.mainImage,
    null
  );

  // Categorie avec label et icone depuis CATEGORIES standardisees
  const getCategoryInfo = (categoryValue) => {
    const cat = CATEGORIES.find(c => c.value === categoryValue);
    return cat || { label: categoryValue || 'Projet', icon: '', color: '#95a5a6' };
  };

  const categoryInfo = getCategoryInfo(campaign.category);

  // Jours restants
  const getDaysRemaining = () => {
    if (!campaign.deadline) return null;
    const deadline = new Date(campaign.deadline);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <article className="campaign-card" onClick={onClick} tabIndex="0" role="button">
      {/* Image */}
      <div className={`campaign-image ${!imageUrl || imageError ? 'no-image' : ''}`}>
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={campaign.title || 'Campagne'}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="placeholder-image">
            <span className="placeholder-emoji">{categoryInfo.icon || '🎯'}</span>
          </div>
        )}

        {/* Category badge */}
        {campaign.category && (
          <span className="category-badge" style={{ backgroundColor: `${categoryInfo.color}15`, color: categoryInfo.color }}>
            {categoryInfo.icon} {categoryInfo.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="campaign-content">
        <h3>{campaign.title || 'Sans titre'}</h3>
        
        {truncatedDescription && (
          <p className="campaign-description">{truncatedDescription}</p>
        )}
        
        {/* Progress bar */}
        <div className="campaign-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(progress, 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.min(progress, 100)}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
          <div className="progress-info">
            <span className="current-amount">
              {formatCurrency(campaign.currentAmount || 0)}
            </span>
            <span className="goal-amount">
              sur {formatCurrency(campaign.goal || 0)}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="campaign-stats">
          <div className="stat">
            <span className="stat-number">{Math.round(progress)}%</span>
            <span className="stat-label">collectés</span>
          </div>
          {contributorsCount > 0 && (
            <div className="stat">
              <span className="stat-number">{contributorsCount}</span>
              <span className="stat-label">
                {contributorsCount === 1 ? 'donateur' : 'donateurs'}
              </span>
            </div>
          )}
          {daysRemaining !== null && daysRemaining > 0 && !expired && (
            <div className="stat">
              <span className="stat-number">{daysRemaining}</span>
              <span className="stat-label">
                {daysRemaining === 1 ? 'jour restant' : 'jours restants'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="campaign-footer">
          <span className={`status ${campaign.status || 'active'}`}>
            {campaign.status === 'active' ? '● En cours' : 
             campaign.status === 'completed' ? '✓ Terminée' :
             campaign.status === 'pending' ? '○ En attente' :
             campaign.status || '● Active'}
          </span>
          {expired && <span className="expired-badge">Expiré</span>}
        </div>
      </div>

      <style>{`
        .campaign-card {
          position: relative;
        }
        
        .campaign-image {
          position: relative;
        }
        
        .campaign-image.no-image {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7f9 0%, #e8ecf0 100%);
        }
        
        .placeholder-image {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          min-height: 180px;
          color: #b8bcc8;
          background: linear-gradient(135deg, #f5f7f9 0%, #e8ecf0 100%);
        }

        .placeholder-emoji {
          font-size: 3rem;
          opacity: 0.6;
        }
        
        .category-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #0B4B36;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .campaign-stats {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e8ecf0;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        
        .stat-number {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #1A1F2C;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #8F96A3;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .expired-badge {
          background: #FFEBEE;
          color: #C62828;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .campaign-card:focus-visible {
          outline: 2px solid #0B4B36;
          outline-offset: 4px;
        }
        
        @media (hover: hover) {
          .campaign-card:hover .category-badge {
            background: #0B4B36;
            color: white;
          }
        }
      `}</style>
    </article>
  );
};

export default CampaignCard;
