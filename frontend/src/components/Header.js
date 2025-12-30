import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Cagnotte App</h1>
        </Link>
        
        <nav className="nav">
          <Link to="/">Accueil</Link>
          <Link to="/campaigns/create">Créer une campagne</Link>
          
          {user ? (
            <>
              <Link to="/dashboard">Tableau de bord</Link>
              <span className="user-info">{user.username}</span>
              <button onClick={onLogout} className="btn-logout">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Connexion</Link>
              <Link to="/register" className="btn-primary">
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

