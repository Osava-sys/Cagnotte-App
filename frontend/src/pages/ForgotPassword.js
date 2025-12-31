import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });

      if (response.success !== false) {
        setSuccess(true);
      } else {
        setError(response.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError(err?.error || err?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

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
            <h1>Email envoy</h1>
            <p className="auth-subtitle">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec les instructions pour reinitialiser votre mot de passe.
            </p>
            <p className="auth-subtitle" style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              N'oubliez pas de verifier vos spams si vous ne recevez pas l'email dans les prochaines minutes.
            </p>
            <Link to="/login" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
              Retour a la connexion
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
          <h1>Mot de passe oubli</h1>
          <p className="auth-subtitle">
            Entrez votre adresse email et nous vous enverrons un lien pour reinitialiser votre mot de passe.
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>

          <p className="auth-footer">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
