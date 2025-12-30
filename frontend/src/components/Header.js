import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return 'Utilisateur';
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="logo">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#0B4B36"/>
            <path d="M20 8C13.373 8 8 13.373 8 20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20C32 13.373 26.627 8 20 8ZM25 21H21V25C21 25.553 20.553 26 20 26C19.447 26 19 25.553 19 25V21H15C14.447 21 14 20.553 14 20C14 19.447 14.447 19 15 19H19V15C19 14.447 19.447 14 20 14C20.553 14 21 14.447 21 15V19H25C25.553 19 26 19.447 26 20C26 20.553 25.553 21 25 21Z" fill="white"/>
          </svg>
          <h1>Cagnotte</h1>
        </Link>
        
        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')}>
            Accueil
          </Link>
          <Link to="/campaigns/create" className={isActive('/campaigns/create')}>
            Créer une cagnotte
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                Mon espace
              </Link>
              <span className="user-info">
                {getUserDisplayName()}
              </span>
              <button onClick={onLogout} className="btn-logout">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>
                Connexion
              </Link>
              <Link to="/register" className="btn-primary">
                S'inscrire gratuitement
              </Link>
            </>
          )}
        </nav>
      </div>

      <style>{`
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }
        
        .mobile-menu-toggle:hover {
          background: var(--bg-light);
        }
        
        .mobile-menu-toggle span {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        
        .mobile-menu-toggle.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.open span:nth-child(2) {
          opacity: 0;
        }
        
        .mobile-menu-toggle.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .logo svg {
          transition: transform 0.3s ease;
        }
        
        .logo:hover svg {
          transform: rotate(10deg) scale(1.05);
        }
        
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
          }
          
          .nav {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 1.5rem;
            gap: 0.5rem;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            border-bottom: 1px solid var(--border-light);
          }
          
          .nav.open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }
          
          .nav a, .nav .btn-logout {
            padding: 0.875rem 1rem;
            text-align: left;
            width: 100%;
            border-radius: 10px;
          }
          
          .nav .btn-primary {
            text-align: center;
            margin-top: 0.5rem;
          }
          
          .user-info {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
