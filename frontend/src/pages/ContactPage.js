import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const subjects = [
    { value: '', label: 'Choisir un sujet' },
    { value: 'general', label: 'Question générale' },
    { value: 'technical', label: 'Problème technique' },
    { value: 'payment', label: 'Question sur un paiement' },
    { value: 'campaign', label: 'Question sur une cagnotte' },
    { value: 'partnership', label: 'Partenariat' },
    { value: 'press', label: 'Presse' },
    { value: 'other', label: 'Autre' }
  ];

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      value: 'contact@cagnotte.com',
      link: 'mailto:contact@cagnotte.fr'
    },
    {
      icon: '📞',
      title: 'Téléphone',
      value: '01 23 45 67 89',
      link: 'tel:+22675530021',
      hours: 'Lun-Ven, 9h-18h'
    },
    {
      icon: '📍',
      title: 'Adresse',
      value: '123 Rue de l\'Entraide\n75001 Paris, France',
      link: null
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulation d'envoi (à remplacer par un vrai appel API)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <h1>Contactez-nous</h1>
          <p>Notre équipe est là pour répondre à toutes vos questions</p>
        </div>
      </section>

      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Envoyez-nous un message</h2>
              <p>Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.</p>

              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Votre message a été envoyé avec succès ! Nous vous répondrons sous 24-48h.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="alert alert-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>Une erreur est survenue. Veuillez réessayer ou nous contacter par email.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nom complet *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="jean@exemple.fr"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Sujet *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    {subjects.map(subject => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <aside className="contact-info-section">
              <div className="contact-info-cards">
                {contactInfo.map((info, index) => (
                  <div key={index} className="contact-info-card">
                    <span className="info-icon">{info.icon}</span>
                    <div className="info-content">
                      <h3>{info.title}</h3>
                      {info.link ? (
                        <a href={info.link}>{info.value}</a>
                      ) : (
                        <p style={{ whiteSpace: 'pre-line' }}>{info.value}</p>
                      )}
                      {info.hours && <span className="info-hours">{info.hours}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="faq-card">
                <h3>Questions fréquentes</h3>
                <p>Consultez notre FAQ pour trouver rapidement des réponses à vos questions.</p>
                <Link to="/faq" className="btn-secondary">
                  Voir la FAQ
                </Link>
              </div>

              <div className="social-card">
                <h3>Suivez-nous</h3>
                <div className="social-links">
                  <a href="#" className="social-link" aria-label="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                  <a href="#" className="social-link" aria-label="Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                    </svg>
                  </a>
                  <a href="#" className="social-link" aria-label="LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>
                  <a href="#" className="social-link" aria-label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <style>{`
        .contact-page {
          padding-top: 0;
        }

        .contact-hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, #0d5c42 100%);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .contact-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: white;
        }

        .contact-hero p {
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .contact-content {
          padding: 4rem 0;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 3rem;
        }

        .contact-form-section h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .contact-form-section > p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.875rem 1rem;
          border: 2px solid var(--border-light);
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(11, 75, 54, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 150px;
        }

        .btn-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          font-size: 1rem;
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .contact-info-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-info-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-info-card {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .contact-info-card:hover {
          border-color: var(--primary-color);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .info-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .info-content h3 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .info-content a,
        .info-content p {
          color: var(--text-primary);
          font-weight: 500;
        }

        .info-content a:hover {
          color: var(--primary-color);
        }

        .info-hours {
          display: block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .faq-card,
        .social-card {
          padding: 1.5rem;
          background: var(--bg-light);
          border-radius: 12px;
        }

        .faq-card h3,
        .social-card h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .faq-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .faq-card .btn-secondary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          background: white;
          border: 2px solid var(--primary-color);
          color: var(--primary-color);
          border-radius: 10px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .faq-card .btn-secondary:hover {
          background: var(--primary-color);
          color: white;
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: white;
          border-radius: 10px;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .social-link:hover {
          background: var(--primary-color);
          color: white;
        }

        @media (max-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .contact-info-section {
            order: -1;
          }

          .contact-info-cards {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .contact-info-card {
            flex: 1;
            min-width: 200px;
          }
        }

        @media (max-width: 768px) {
          .contact-hero h1 {
            font-size: 2rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .contact-info-cards {
            flex-direction: column;
          }

          .contact-info-card {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
