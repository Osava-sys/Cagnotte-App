import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../pages/Home';

const Header = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Utiliser les catégories standardisées (exclure "Toutes les catégories")
  const categories = CATEGORIES.filter(cat => cat.value !== '').map(cat => ({
    id: cat.value,
    name: cat.label,
    icon: cat.icon,
    color: cat.color || '#95a5a6'
  }));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus lors du changement de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoriesOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Fermer les dropdowns en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && !event.target.closest('.search-toggle')) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return 'Utilisateur';
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/?category=${categoryId}`);
    setIsCategoriesOpen(false);
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

        {/* Search Bar - Desktop */}
        <div className={`search-container ${isSearchOpen ? 'open' : ''}`} ref={searchRef}>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Rechercher une cagnotte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-submit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Search Toggle - Mobile */}
        <button
          className="search-toggle"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Rechercher"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>

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

          {/* Categories Dropdown */}
          <div className="dropdown" ref={categoriesRef}>
            <button
              className={`dropdown-toggle ${isCategoriesOpen ? 'active' : ''}`}
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            >
              Catégories
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {isCategoriesOpen && (
              <div className="dropdown-menu categories-menu">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className="dropdown-item"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <span className="category-icon" style={{ backgroundColor: category.color + '20' }}>
                      {category.icon}
                    </span>
                    <span className="category-name">{category.name}</span>
                  </button>
                ))}
                <div className="dropdown-divider"></div>
                <Link to="/" className="dropdown-item view-all">
                  Voir toutes les cagnottes
                </Link>
              </div>
            )}
          </div>

          <Link to="/campaigns/create" className={`btn-create ${isActive('/campaigns/create')}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Créer une cagnotte
          </Link>

          {user ? (
            <div className="dropdown user-dropdown" ref={userMenuRef}>
              <button
                className={`user-menu-toggle ${isUserMenuOpen ? 'active' : ''}`}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="user-avatar" />
                ) : (
                  <div className="user-avatar-placeholder">
                    {getUserInitials()}
                  </div>
                )}
                <span className="user-name">{getUserDisplayName()}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {isUserMenuOpen && (
                <div className="dropdown-menu user-menu">
                  <div className="user-menu-header">
                    <div className="user-menu-info">
                      <strong>{getUserDisplayName()}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/dashboard" className="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="9"/>
                      <rect x="14" y="3" width="7" height="5"/>
                      <rect x="14" y="12" width="7" height="9"/>
                      <rect x="3" y="16" width="7" height="5"/>
                    </svg>
                    Tableau de bord
                  </Link>
                  <Link to="/dashboard" className="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Mon profil
                  </Link>
                  <Link to="/dashboard" className="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Mes cagnottes
                  </Link>
                  <Link to="/dashboard" className="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    Mes contributions
                  </Link>
                  <div className="dropdown-divider"></div>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item admin-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                      Administration
                    </Link>
                  )}
                  <button onClick={onLogout} className="dropdown-item logout-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className={`btn-login ${isActive('/login')}`}>
                Connexion
              </Link>
              <Link to="/register" className="btn-primary btn-register">
                S'inscrire
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="mobile-search-overlay">
          <form onSubmit={handleSearch} className="mobile-search-form">
            <input
              type="text"
              placeholder="Rechercher une cagnotte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="button" className="close-search" onClick={() => setIsSearchOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      <style>{`
        .header .container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* Search Container */
        .search-container {
          flex: 1;
          max-width: 400px;
          margin: 0 1rem;
        }

        .search-form {
          display: flex;
          align-items: center;
          background: var(--bg-light);
          border-radius: 25px;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .search-form:focus-within {
          background: white;
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(11, 75, 54, 0.15);
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.5rem;
          font-size: 0.9rem;
          outline: none;
        }

        .search-submit {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .search-submit:hover {
          color: var(--primary-color);
        }

        .search-toggle {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .search-toggle:hover {
          background: var(--bg-light);
        }

        /* Dropdown Styles */
        .dropdown {
          position: relative;
        }

        .dropdown-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .dropdown-toggle:hover,
        .dropdown-toggle.active {
          background: var(--bg-light);
          color: var(--primary-color);
        }

        .dropdown-toggle svg {
          transition: transform 0.2s ease;
        }

        .dropdown-toggle.active svg {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          min-width: 220px;
          padding: 0.5rem;
          z-index: 1000;
          animation: dropdownFadeIn 0.2s ease;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: var(--text-primary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          text-align: left;
        }

        .dropdown-item:hover {
          background: var(--bg-light);
          color: var(--primary-color);
        }

        .dropdown-item svg {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .dropdown-item:hover svg {
          color: var(--primary-color);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-light);
          margin: 0.5rem 0;
        }

        /* Categories Menu */
        .categories-menu {
          min-width: 260px;
        }

        .category-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-size: 1.1rem;
        }

        .category-name {
          flex: 1;
        }

        .view-all {
          color: var(--primary-color);
          font-weight: 500;
        }

        /* User Menu */
        .user-dropdown {
          margin-left: auto;
        }

        .user-menu-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.375rem 0.75rem;
          border-radius: 25px;
          transition: all 0.2s ease;
        }

        .user-menu-toggle:hover {
          background: var(--bg-light);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .user-name {
          font-weight: 500;
          color: var(--text-primary);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-menu {
          right: 0;
          left: auto;
          min-width: 240px;
        }

        .user-menu-header {
          padding: 0.75rem 1rem;
        }

        .user-menu-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-menu-info strong {
          color: var(--text-primary);
        }

        .user-menu-info span {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .admin-link {
          color: var(--primary-color);
        }

        .logout-item {
          color: #e74c3c;
        }

        .logout-item:hover {
          background: #ffeaea;
          color: #c0392b;
        }

        .logout-item svg {
          color: #e74c3c;
        }

        /* Create Button */
        .btn-create {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary-color);
          color: white;
          padding: 0.625rem 1rem;
          border-radius: 25px;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-create:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(11, 75, 54, 0.3);
        }

        /* Auth Buttons */
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-left: auto;
        }

        .btn-login {
          color: var(--text-primary);
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .btn-login:hover {
          background: var(--bg-light);
          color: var(--primary-color);
        }

        .btn-register {
          padding: 0.625rem 1.25rem;
          border-radius: 25px;
          font-size: 0.9rem;
        }

        /* Mobile Menu Toggle */
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

        /* Mobile Search Overlay */
        .mobile-search-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 1rem;
          z-index: 1001;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .mobile-search-form {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mobile-search-form input {
          flex: 1;
          padding: 0.875rem 1rem;
          border: 2px solid var(--border-light);
          border-radius: 12px;
          font-size: 1rem;
          outline: none;
        }

        .mobile-search-form input:focus {
          border-color: var(--primary-color);
        }

        .close-search {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
        }

        @media (max-width: 1024px) {
          .search-container {
            display: none;
          }

          .search-toggle {
            display: flex;
          }
        }

        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .search-toggle {
            display: flex;
          }

          .mobile-search-overlay {
            display: flex;
          }

          .mobile-search-overlay.hidden {
            display: none;
          }

          .nav {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            flex-direction: column;
            padding: 1.5rem;
            gap: 0.5rem;
            overflow-y: auto;
            transform: translateX(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }

          .nav.open {
            transform: translateX(0);
            opacity: 1;
            visibility: visible;
          }

          .nav > a,
          .nav .dropdown-toggle,
          .nav .btn-create {
            padding: 0.875rem 1rem;
            text-align: left;
            width: 100%;
            border-radius: 10px;
            justify-content: flex-start;
          }

          .nav .btn-create {
            background: var(--primary-color);
            color: white;
            justify-content: center;
            margin-top: 0.5rem;
          }

          .dropdown-menu {
            position: static;
            box-shadow: none;
            background: var(--bg-light);
            margin-top: 0.5rem;
          }

          .user-dropdown {
            margin-left: 0;
            width: 100%;
          }

          .user-menu-toggle {
            width: 100%;
            padding: 0.875rem 1rem;
            border-radius: 10px;
          }

          .user-menu {
            position: static;
            width: 100%;
          }

          .auth-buttons {
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
            margin-left: 0;
            margin-top: 1rem;
          }

          .btn-login, .btn-register {
            width: 100%;
            text-align: center;
            padding: 0.875rem 1rem;
          }

          .user-info {
            width: 100%;
            justify-content: center;
          }

          .user-name {
            display: block;
          }
        }

        @media (min-width: 769px) {
          .mobile-search-overlay {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
