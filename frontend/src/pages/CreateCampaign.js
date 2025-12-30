import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const CreateCampaign = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    imageUrl: ''
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
    
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const campaign = await api.post('/campaigns', {
        ...formData,
        goal: parseFloat(formData.goal)
      });
      
      navigate(`/campaigns/${campaign._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création de la campagne');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-required">
        <p>Vous devez être connecté pour créer une campagne.</p>
        <a href="/login">Se connecter</a>
      </div>
    );
  }

  return (
    <div className="create-campaign-page">
      <div className="container">
        <h1>Créer une nouvelle campagne</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="campaign-form">
          <div className="form-group">
            <label htmlFor="title">Titre de la campagne *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength="3"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              minLength="10"
              rows="6"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="goal">Objectif (€) *</label>
              <input
                type="number"
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Date limite *</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">URL de l'image (optionnel)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer la campagne'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;

