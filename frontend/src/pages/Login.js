import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await auth.login(formData.email, formData.password);
      
      if (response.success && response.token) {
        // Appeler le callback onLogin si fourni
        if (onLogin && response.user) {
          onLogin(response.user);
        }
        
        // Rediriger vers la page d'accueil ou la page précédente
        const from = new URLSearchParams(window.location.search).get('from') || '/';
        navigate(from);
      } else {
        setError(response.error || 'Erreur lors de la connexion');
      }
    } catch (err) {
      const errorMsg = err?.error || err?.message || 'Erreur lors de la connexion';
      setError(errorMsg);
      console.error('Erreur login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Connexion</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              minLength="8"
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="auth-links">
            <p>
              Pas encore de compte ? <Link to="/register">Créer un compte</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
