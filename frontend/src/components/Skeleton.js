import React from 'react';

const Skeleton = ({ width, height, borderRadius, className = '', style = {} }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || '8px',
        ...style
      }}
      aria-hidden="true"
    />
  );
};

// Skeleton pour une carte de campagne
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton height="200px" borderRadius="16px 16px 0 0" />
    <div style={{ padding: '1.25rem' }}>
      <Skeleton width="30%" height="24px" style={{ marginBottom: '0.75rem' }} />
      <Skeleton width="90%" height="1.25rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="100%" height="1rem" style={{ marginBottom: '0.25rem' }} />
      <Skeleton width="70%" height="1rem" style={{ marginBottom: '1rem' }} />
      <Skeleton width="100%" height="8px" borderRadius="4px" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="35%" height="1.25rem" />
        <Skeleton width="25%" height="1rem" />
      </div>
    </div>
  </div>
);

// Grille de skeletons pour les campagnes
export const SkeletonGrid = ({ count = 6 }) => (
  <div className="campaigns-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Skeleton pour le texte (paragraphes)
export const SkeletonText = ({ lines = 3 }) => (
  <div className="skeleton-text-container">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 ? '60%' : '100%'}
        height="1rem"
        style={{ marginBottom: i < lines - 1 ? '0.5rem' : 0 }}
      />
    ))}
  </div>
);

// Skeleton pour le détail d'une campagne
export const SkeletonCampaignDetail = () => (
  <div className="skeleton-campaign-detail">
    <div className="skeleton-detail-header">
      <Skeleton width="60%" height="2.5rem" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <Skeleton width="100px" height="32px" borderRadius="16px" />
        <Skeleton width="120px" height="32px" borderRadius="16px" />
      </div>
    </div>
    <div className="skeleton-detail-content" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <div>
        <Skeleton height="400px" borderRadius="16px" style={{ marginBottom: '1.5rem' }} />
        <SkeletonText lines={5} />
      </div>
      <div>
        <div style={{ background: '#f5f7f9', padding: '1.5rem', borderRadius: '16px' }}>
          <Skeleton width="50%" height="2rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="80%" height="1rem" style={{ marginBottom: '1rem' }} />
          <Skeleton height="10px" borderRadius="5px" style={{ marginBottom: '1.5rem' }} />
          <Skeleton height="48px" borderRadius="24px" style={{ marginBottom: '1rem' }} />
          <Skeleton height="48px" borderRadius="24px" />
        </div>
      </div>
    </div>

    <style>{`
      @media (max-width: 768px) {
        .skeleton-detail-content {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
  </div>
);

// Skeleton pour le dashboard
export const SkeletonDashboard = () => (
  <div className="skeleton-dashboard">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ background: '#f5f7f9', padding: '1.5rem', borderRadius: '16px' }}>
          <Skeleton width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="60%" height="2rem" />
        </div>
      ))}
    </div>
    <Skeleton width="200px" height="1.5rem" style={{ marginBottom: '1rem' }} />
    <SkeletonGrid count={3} />
  </div>
);

// Skeleton pour un élément de liste
export const SkeletonListItem = () => (
  <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f5f7f9', borderRadius: '12px' }}>
    <Skeleton width="48px" height="48px" borderRadius="50%" />
    <div style={{ flex: 1 }}>
      <Skeleton width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="70%" height="0.875rem" />
    </div>
    <Skeleton width="80px" height="1.5rem" />
  </div>
);

// Skeleton pour la liste des contributions
export const SkeletonContributionList = ({ count = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonListItem key={i} />
    ))}
  </div>
);

export default Skeleton;
