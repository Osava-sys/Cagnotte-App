import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { CATEGORIES as HOME_CATEGORIES } from './Home';

// Catégories organisées par groupe (utilisant les catégories standardisées)
const CATEGORY_GROUPS = {
  events: {
    title: 'Événements & Fêtes',
    items: HOME_CATEGORIES.filter(c => ['birthday', 'wedding', 'baby', 'travel'].includes(c.value))
  },
  solidarity: {
    title: 'Solidarité & Projets',
    items: HOME_CATEGORIES.filter(c => ['medical', 'education', 'emergency', 'community', 'environment', 'sports', 'creative', 'memorial', 'other'].includes(c.value))
  }
};

const CreateCampaign = ({ user }) => {
  const navigate = useNavigate();
  const toast = useToast();

  // État du formulaire par étapes
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    deadline: '',
    hasGoal: true,
    hideAmounts: false,
  });

  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep(2);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format non supporté. Utilisez JPG, PNG, GIF ou WebP.');
        return;
      }
      
      // Vérifier la taille (10MB max - sera compressée côté serveur)
      if (file.size > 10 * 1024 * 1024) {
        setError('L\'image est trop volumineuse (max 10MB)');
        return;
      }

      setSelectedImage(file);
      setError(null); // Effacer les erreurs précédentes
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (campaignId) => {
    if (!selectedImage) return null;

    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('image', selectedImage);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/campaigns/${campaignId}/image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formDataUpload
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erreur upload' }));
        throw err;
      }

      const result = await response.json();
      return result.data?.imageUrl || result.data?.campaign?.images?.mainImage;
    } catch (err) {
      console.error('Erreur upload image:', err);
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  // Sauvegarder en brouillon
  const handleSaveDraft = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Validation minimale pour un brouillon
    if (!formData.title.trim()) {
      setError('Le titre est requis pour sauvegarder un brouillon');
      return;
    }

    try {
      setSavingDraft(true);
      setError(null);

      const payload = {
        title: formData.title,
        description: formData.description || 'Brouillon en cours...',
        goalAmount: formData.hasGoal && formData.goal ? parseFloat(formData.goal) : 100,
        endDate: formData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: selectedCategory || 'other',
        shortDescription: formData.description?.slice(0, 200) || '',
        status: 'draft'
      };

      const response = await api.post('/campaigns', payload);
      const created = response?.data || response;
      const campaignId = created?._id || created?.id;

      if (!campaignId) {
        throw new Error('Impossible de sauvegarder le brouillon');
      }

      if (selectedImage) {
        try {
          await uploadImage(campaignId);
        } catch (uploadErr) {
          console.warn('Erreur upload image:', uploadErr);
        }
      }

      toast.success('Brouillon sauvegarde !');
      navigate('/dashboard');
    } catch (err) {
      const message = err?.error || err?.message || 'Erreur lors de la sauvegarde';
      setError(message);
      toast.error(message);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e, asDraft = false) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        title: formData.title,
        description: formData.description,
        goalAmount: formData.hasGoal ? parseFloat(formData.goal) : 0,
        endDate: formData.deadline,
        category: selectedCategory || 'other',
        shortDescription: formData.description?.slice(0, 200),
        status: asDraft ? 'draft' : 'active',
        settings: {
          hideAmounts: formData.hideAmounts
        }
      };

      const response = await api.post('/campaigns', payload);
      const created = response?.data || response;
      const campaignId = created?._id || created?.id;

      if (!campaignId) {
        throw new Error('Impossible de recuperer l\'ID de la campagne creee');
      }

      if (selectedImage) {
        try {
          await uploadImage(campaignId);
        } catch (uploadErr) {
          console.warn('Erreur upload image:', uploadErr);
        }
      }

      toast.success('Cagnotte creee avec succes !');
      navigate(`/campaigns/${campaignId}`);
    } catch (err) {
      const message = err?.error || err?.message || 'Erreur lors de la creation';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  // Page non connectée
  if (!user) {
    return (
      <div className="create-campaign-page">
        <div className="create-campaign-container">
          <div className="create-campaign-form-section">
            <div className="auth-required-card">
              <div className="auth-icon">🔐</div>
              <h2>Connexion requise</h2>
              <p>Vous devez être connecté pour créer une cagnotte.</p>
              <div className="auth-buttons">
                <a href="/login" className="btn-primary">Se connecter</a>
                <a href="/register" className="btn-secondary">Créer un compte</a>
              </div>
            </div>
          </div>
          <div className="create-campaign-visual">
            <div className="visual-content">
              <h2>Donnez vie à vos projets</h2>
              <p>Créez votre cagnotte en quelques clics et mobilisez votre entourage.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-campaign-page">
      
      <div className="create-campaign-container">
        {/* Formulaire à gauche */}
        <div className="create-campaign-form-section">
          <div className="form-header">
            <button className="back-button" onClick={goBack} aria-label="Retour">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            
            {/* Indicateur d'étapes */}
            <div className="steps-indicator">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <span>1</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <span>2</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <span>3</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Étape 1: Sélection de catégorie */}
          {currentStep === 1 && (
            <div className="step-content">
              <div className="step-header">
                <h1>Créer une cagnotte</h1>
                <p>Choisissez le type de cagnotte qui correspond à votre projet</p>
              </div>

              <div className="category-section">
                <h3>🎉 {CATEGORY_GROUPS.events.title}</h3>
                <div className="category-grid">
                  {CATEGORY_GROUPS.events.items.map(cat => (
                    <button
                      key={cat.value}
                      className={`category-card ${selectedCategory === cat.value ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(cat.value)}
                      style={{ '--card-bg': cat.color ? `${cat.color}20` : '#f5f5f5' }}
                    >
                      <div className="category-emoji">{cat.icon}</div>
                      <span className="category-label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="category-section">
                <h3>💚 {CATEGORY_GROUPS.solidarity.title}</h3>
                <div className="category-grid">
                  {CATEGORY_GROUPS.solidarity.items.map(cat => (
                    <button
                      key={cat.value}
                      className={`category-card ${selectedCategory === cat.value ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(cat.value)}
                      style={{ '--card-bg': cat.color ? `${cat.color}20` : '#f5f5f5' }}
                    >
                      <div className="category-emoji">{cat.icon}</div>
                      <span className="category-label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Présenter le projet */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="step-header">
                <h1>Présenter mon projet 📝</h1>
                <p>Décrivez votre cagnotte pour convaincre vos proches</p>
              </div>

              <div className="form-fields">
                <div className="form-group">
                  <label htmlFor="title">Titre de la cagnotte</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Anniversaire surprise de Marie"
                    maxLength="80"
                    required
                  />
                  <div className="char-counter">
                    <span>{formData.title.length}</span>/80
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Expliquez votre projet, votre histoire, vos besoins..."
                    rows="5"
                    maxLength="2000"
                    required
                  />
                  <div className="char-counter">
                    <span>{formData.description.length}</span>/2000
                  </div>
                </div>

                {/* Toggle options */}
                <div className="toggle-option" onClick={() => setFormData(prev => ({ ...prev, hasGoal: !prev.hasGoal }))}>
                  <div className="toggle-content">
                    <span className="toggle-title">Définir un montant à atteindre</span>
                    <span className="toggle-description">Vous pourrez toujours modifier votre objectif plus tard.</span>
                  </div>
                  <div className={`toggle-switch ${formData.hasGoal ? 'active' : ''}`}>
                    <div className="toggle-handle"></div>
                  </div>
                </div>

                {formData.hasGoal && (
                  <div className="form-group goal-input">
                    <label htmlFor="goal">Objectif</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        id="goal"
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        placeholder="1000"
                        min="1"
                        step="1"
                        required={formData.hasGoal}
                      />
                      <span className="input-suffix">€</span>
                    </div>
                  </div>
                )}

                <div className="toggle-option" onClick={() => setFormData(prev => ({ ...prev, hideAmounts: !prev.hideAmounts }))}>
                  <div className="toggle-content">
                    <span className="toggle-title">Cacher le montant des participations</span>
                    <span className="toggle-description">Les montants individuels seront masqués.</span>
                  </div>
                  <div className={`toggle-switch ${formData.hideAmounts ? 'active' : ''}`}>
                    <div className="toggle-handle"></div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary btn-full"
                  onClick={() => setCurrentStep(3)}
                  disabled={!formData.title.trim() || !formData.description.trim()}
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Finaliser */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="step-header">
                <h1>Finaliser ma cagnotte 🚀</h1>
                <p>Plus que quelques détails avant de lancer votre cagnotte</p>
              </div>

              <form onSubmit={handleSubmit} className="form-fields">
                <div className="form-group">
                  <label htmlFor="deadline">Date de fin</label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <small>Votre cagnotte sera active jusqu'à cette date</small>
                </div>

                <div className="form-group">
                  <label htmlFor="image">Image de couverture (optionnel)</label>
                  <div className="image-upload-zone">
                    {!imagePreview ? (
                      <label htmlFor="image-input" className="upload-placeholder">
                        <div className="upload-icon">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21,15 16,10 5,21"/>
                          </svg>
                        </div>
                        <span className="upload-text">Cliquez pour ajouter une image</span>
                        <span className="upload-hint">JPG, PNG, GIF ou WebP • Max 10MB • Compression automatique</span>
                        <input
                          type="file"
                          id="image-input"
                          accept="image/*"
                          onChange={handleImageSelect}
                          hidden
                        />
                      </label>
                    ) : (
                      <div className="image-preview-container">
                        <img src={imagePreview} alt="Aperçu" className="preview-image" />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="campaign-summary">
                  <h4>Recapitulatif</h4>
                  <div className="summary-item">
                    <span className="summary-label">Categorie</span>
                    <span className="summary-value">
                      {HOME_CATEGORIES.find(c => c.value === selectedCategory)?.label || 'Non defini'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Titre</span>
                    <span className="summary-value">{formData.title || 'Non défini'}</span>
                  </div>
                  {formData.hasGoal && formData.goal && (
                    <div className="summary-item">
                      <span className="summary-label">Objectif</span>
                      <span className="summary-value">{formData.goal} €</span>
                    </div>
                  )}
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    className="btn-secondary btn-full"
                    onClick={handleSaveDraft}
                    disabled={loading || uploadingImage || savingDraft || !formData.title.trim()}
                  >
                    {savingDraft ? (
                      <>
                        <span className="btn-spinner"></span>
                        Sauvegarde...
                      </>
                    ) : (
                      '📝 Sauvegarder en brouillon'
                    )}
                  </button>

                  <button
                    type="submit"
                    className="btn-primary btn-full btn-large"
                    disabled={loading || uploadingImage || savingDraft}
                  >
                    {loading || uploadingImage ? (
                      <>
                        <span className="btn-spinner"></span>
                        {uploadingImage ? 'Upload en cours...' : 'Creation...'}
                      </>
                    ) : (
                      '🎉 Creer ma cagnotte'
                    )}
                  </button>
                </div>

                <p className="draft-hint">
                  Vous pouvez sauvegarder en brouillon et continuer plus tard depuis votre tableau de bord.
                </p>
              </form>
            </div>
          )}
        </div>

        {/* Visuel à droite */}
        <div className="create-campaign-visual">
          <div className="visual-content">
            {currentStep === 1 && (
              <>
                <div className="visual-emoji">🎁</div>
                <h2>Donnez vie à vos projets</h2>
                <p>Créez votre cagnotte gratuitement et partagez-la avec vos proches en quelques clics.</p>
              </>
            )}
            {currentStep === 2 && (
              <>
                <div className="visual-emoji">✨</div>
                <h2>Un titre accrocheur</h2>
                <p>Un bon titre et une description claire augmentent vos chances de succès.</p>
              </>
            )}
            {currentStep === 3 && (
              <>
                <div className="visual-emoji">🚀</div>
                <h2>Prêt à lancer !</h2>
                <p>Votre cagnotte sera visible immédiatement après sa création.</p>
              </>
            )}
            
            <div className="visual-features">
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>100% Gratuit</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Paiement sécurisé</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Partage facile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CreateCampaign;
