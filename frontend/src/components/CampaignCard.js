import React from 'react';
import { formatCurrency, calculatePercentage, formatDate } from '../utils/helpers';

const CampaignCard = ({ campaign, onClick }) => {
  const progress = calculatePercentage(campaign.currentAmount, campaign.goal);
  const isExpired = new Date(campaign.deadline) < new Date();

  return (
    <div className="campaign-card" onClick={onClick}>
      {campaign.imageUrl && (
        <div className="campaign-image">
          <img src={campaign.imageUrl} alt={campaign.title} />
        </div>
      )}
      <div className="campaign-content">
        <h3>{campaign.title}</h3>
        <p className="campaign-description">{campaign.description.substring(0, 150)}...</p>
        <div className="campaign-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-info">
            <span className="current-amount">{formatCurrency(campaign.currentAmount)}</span>
            <span className="goal-amount">sur {formatCurrency(campaign.goal)}</span>
          </div>
        </div>
        <div className="campaign-footer">
          <span className={`status ${campaign.status}`}>{campaign.status}</span>
          <span className="deadline">
            {isExpired ? 'Expiré' : `Expire le ${formatDate(campaign.deadline)}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;

