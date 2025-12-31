import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Verifier le token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify-reset-token/${token}`);
        if (response.success !== false) {
          setTokenValid(true);
        } else {
          setError('Ce lien est invalide ou a expire.');
        }
      } catch (err) {
        setError('Ce lien est invalide ou a expire. Veuillez refaire une demande de reinitialisation.');
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setError('Token manquant');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password
      });

      if (response.success !== false) {
        setSuccess(true);
        // Rediriger vers login apres 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError(err?.error || err?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="loading">Verification du lien...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid && !success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1>Lien invalide</h1>
            <p className="auth-subtitle">
              {error || 'Ce lien de reinitialisation est invalide ou a expire.'}
            </p>
            <Link to="/forgot-password" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
              Demander un nouveau lien
            </Link>
          </div>
        </div>

        <style>{`
          .error-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
            color: #e74c3c;
          }
        `}</style>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h1>Mot de passe reinitialise</h1>
            <p className="auth-subtitle">
              Votre mot de passe a ete reinitialise avec succes. Vous allez etre redirige vers la page de connexion...
            </p>
            <Link to="/login" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
              Se connecter maintenant
            </Link>
          </div>
        </div>

        <style>{`
          .success-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
            color: var(--primary-color);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Nouveau mot de passe</h1>
          <p className="auth-subtitle">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Nouveau mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 8 caracteres"
                required
                minLength={8}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Reinitialisation...' : 'Reinitialiser le mot de passe'}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/login">Retour a la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
