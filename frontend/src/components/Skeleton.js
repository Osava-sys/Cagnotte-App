import React from 'react';

const Skeleton = ({ width, height, borderRadius, className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || 'var(--radius-md)',
      }}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton width="100%" height="220px" borderRadius="var(--radius-lg) var(--radius-lg) 0 0" />
    <div style={{ padding: 'var(--spacing-md)' }}>
      <Skeleton width="80%" height="1.5rem" className="skeleton-title" />
      <Skeleton width="100%" height="1rem" className="skeleton-text" />
      <Skeleton width="60%" height="1rem" className="skeleton-text" />
      <Skeleton width="100%" height="10px" className="skeleton-progress" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <Skeleton width="40%" height="1rem" />
        <Skeleton width="30%" height="1rem" />
      </div>
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="skeleton-text-container">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 ? '60%' : '100%'}
        height="1rem"
        className="skeleton-line"
      />
    ))}
  </div>
);

export default Skeleton;

