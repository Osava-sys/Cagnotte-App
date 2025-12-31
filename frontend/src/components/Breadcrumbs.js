import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = ({ items, className = '' }) => {
  const location = useLocation();

  // Si aucun item n'est fourni, générer automatiquement
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname);

  if (breadcrumbItems.length <= 1) {
    return null; // Ne pas afficher si on est sur la page d'accueil uniquement
  }

  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Fil d'Ariane">
      <div className="container">
        <ol className="breadcrumbs-list">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <li key={index} className={`breadcrumbs-item ${isLast ? 'active' : ''}`}>
                {!isLast && item.path ? (
                  <>
                    <Link to={item.path} className="breadcrumbs-link">
                      {item.icon && <span className="breadcrumbs-icon">{item.icon}</span>}
                      {item.label}
                    </Link>
                    <span className="breadcrumbs-separator">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </span>
                  </>
                ) : (
                  <span className="breadcrumbs-current">
                    {item.icon && <span className="breadcrumbs-icon">{item.icon}</span>}
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <style>{`
        .breadcrumbs {
          background: var(--bg-light);
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-light);
        }

        .breadcrumbs-list {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .breadcrumbs-item {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
        }

        .breadcrumbs-link {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .breadcrumbs-link:hover {
          color: var(--primary-color);
          background: rgba(11, 75, 54, 0.08);
        }

        .breadcrumbs-separator {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          margin: 0 0.25rem;
        }

        .breadcrumbs-separator svg {
          opacity: 0.5;
        }

        .breadcrumbs-current {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-primary);
          font-weight: 500;
          padding: 0.25rem 0.5rem;
        }

        .breadcrumbs-icon {
          font-size: 1rem;
        }

        .breadcrumbs-item.active .breadcrumbs-current {
          color: var(--primary-color);
        }

        @media (max-width: 768px) {
          .breadcrumbs {
            padding: 0.5rem 0;
          }

          .breadcrumbs-item {
            font-size: 0.8rem;
          }

          .breadcrumbs-link,
          .breadcrumbs-current {
            padding: 0.25rem;
          }
        }
      `}</style>
    </nav>
  );
};

// Générer automatiquement les breadcrumbs basés sur l'URL
const generateBreadcrumbs = (pathname) => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Accueil', path: '/', icon: '🏠' }];

  // Mapping des routes vers des labels lisibles
  const routeLabels = {
    'campaigns': 'Cagnottes',
    'create': 'Créer',
    'dashboard': 'Tableau de bord',
    'login': 'Connexion',
    'register': 'Inscription',
    'about': 'À propos',
    'faq': 'FAQ',
    'contact': 'Contact',
    'terms': 'Conditions d\'utilisation',
    'privacy': 'Politique de confidentialité',
    'admin': 'Administration',
    'profile': 'Mon profil',
    'settings': 'Paramètres',
    'payment': 'Paiement',
    'success': 'Succès'
  };

  let currentPath = '';

  paths.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === paths.length - 1;

    // Ignorer les IDs MongoDB (24 caractères hexadécimaux)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(segment);

    // Ignorer les slugs qui ressemblent à des titres de campagne (contiennent des tirets)
    const isSlug = segment.includes('-') && segment.length > 10;

    if (isMongoId || isSlug) {
      // Pour les campagnes, on ajoute juste "Détails"
      breadcrumbs.push({
        label: 'Détails de la cagnotte',
        path: isLast ? null : currentPath
      });
    } else {
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({
        label,
        path: isLast ? null : currentPath
      });
    }
  });

  return breadcrumbs;
};

export default Breadcrumbs;
