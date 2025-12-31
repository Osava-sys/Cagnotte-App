import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Simulation d'inscription à la newsletter
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const categories = [
    { name: 'Santé & Médical', path: '/?category=medical' },
    { name: 'Éducation', path: '/?category=education' },
    { name: 'Urgence', path: '/?category=emergency' },
    { name: 'Communauté', path: '/?category=community' },
    { name: 'Environnement', path: '/?category=environment' }
  ];

  return (
    <footer className="footer">
      <div className="container">
        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3>Restez informé</h3>
            <p>Recevez nos actualités et découvrez des cagnottes inspirantes</p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            {subscribed ? (
              <div className="newsletter-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Merci pour votre inscription !
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">S'inscrire</button>
              </>
            )}
          </form>
        </div>

        <div className="footer-content">
          {/* Logo et description */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="white" fillOpacity="0.2"/>
                <path d="M20 8C13.373 8 8 13.373 8 20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20C32 13.373 26.627 8 20 8ZM25 21H21V25C21 25.553 20.553 26 20 26C19.447 26 19 25.553 19 25V21H15C14.447 21 14 20.553 14 20C14 19.447 14.447 19 15 19H19V15C19 14.447 19.447 14 20 14C20.553 14 21 14.447 21 15V19H25C25.553 19 26 19.447 26 20C26 20.553 25.553 21 25 21Z" fill="white"/>
              </svg>
              <span>Cagnotte</span>
            </Link>
            <p className="footer-tagline">
              La plateforme de cagnotte en ligne sécurisée pour tous vos projets solidaires. Collectez des fonds facilement et en toute confiance.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation links */}
          <div className="footer-nav">
            <div className="footer-col">
              <h4>Navigation</h4>
              <ul>
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/campaigns/create">Créer une cagnotte</Link></li>
                <li><Link to="/dashboard">Mon espace</Link></li>
                <li><Link to="/login">Connexion</Link></li>
                <li><Link to="/register">Inscription</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Catégories</h4>
              <ul>
                {categories.map((cat, index) => (
                  <li key={index}><Link to={cat.path}>{cat.name}</Link></li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>À propos</h4>
              <ul>
                <li><Link to="/about">Qui sommes-nous</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Légal</h4>
              <ul>
                <li><Link to="/terms">Conditions d'utilisation</Link></li>
                <li><Link to="/privacy">Politique de confidentialité</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Cagnotte App. Tous droits réservés.</p>
          <div className="footer-badges">
            <span className="badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              Paiement sécurisé par Stripe
            </span>
            <span className="badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Création gratuite
            </span>
            <span className="badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              3% de commission
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-newsletter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          margin-bottom: 3rem;
        }

        .newsletter-content h3 {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
          color: white;
        }

        .newsletter-content p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .newsletter-form {
          display: flex;
          gap: 0.75rem;
          min-width: 400px;
        }

        .newsletter-form input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          border: none;
          border-radius: 25px;
          font-size: 0.95rem;
          outline: none;
        }

        .newsletter-form input:focus {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }

        .newsletter-form button {
          padding: 0.875rem 1.75rem;
          background: white;
          color: var(--primary-color);
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .newsletter-form button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .newsletter-success {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4ade80;
          font-weight: 500;
          background: rgba(74, 222, 128, 0.1);
          padding: 0.875rem 1.5rem;
          border-radius: 25px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1.2fr 2fr;
          gap: 4rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        .footer-brand {
          max-width: 320px;
        }

        .footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-decoration: none;
          margin-bottom: 1rem;
        }

        .footer-logo:hover {
          opacity: 0.9;
        }

        .footer-tagline {
          color: rgba(255, 255, 255, 0.75);
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .footer-social {
          display: flex;
          gap: 0.75rem;
        }

        .footer-social a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: white;
          transition: all 0.3s ease;
        }

        .footer-social a:hover {
          background: white;
          color: var(--primary-color);
          transform: translateY(-3px);
        }

        .footer-nav {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .footer-col h4 {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-col li {
          margin-bottom: 0.75rem;
        }

        .footer-col a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .footer-col a:hover {
          color: white;
          transform: translateX(4px);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-bottom p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin: 0;
        }

        .footer-badges {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }

        .badge svg {
          opacity: 0.9;
        }

        @media (max-width: 1024px) {
          .footer-newsletter {
            flex-direction: column;
            text-align: center;
          }

          .newsletter-form {
            min-width: 100%;
            max-width: 500px;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .footer-brand {
            max-width: 100%;
            text-align: center;
          }

          .footer-social {
            justify-content: center;
          }

          .footer-nav {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .newsletter-form {
            flex-direction: column;
          }

          .newsletter-form input,
          .newsletter-form button {
            width: 100%;
          }

          .footer-nav {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .footer-col a:hover {
            transform: none;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }

          .footer-badges {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
