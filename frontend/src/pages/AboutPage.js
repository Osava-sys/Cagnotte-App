import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Marie Dupont',
      role: 'Fondatrice & CEO',
      image: null,
      bio: 'Passionnée par l\'entraide et l\'innovation sociale'
    },
    {
      name: 'Pierre Martin',
      role: 'Directeur Technique',
      image: null,
      bio: 'Expert en sécurité des paiements en ligne'
    },
    {
      name: 'Sophie Bernard',
      role: 'Responsable Communauté',
      image: null,
      bio: 'Dédiée à accompagner chaque porteur de projet'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Cagnottes créées' },
    { value: '2M€', label: 'Collectés' },
    { value: '50K+', label: 'Contributeurs' },
    { value: '98%', label: 'Satisfaction' }
  ];

  const values = [
    {
      icon: '🤝',
      title: 'Solidarité',
      description: 'Nous croyons en la force de l\'entraide et de la générosité collective.'
    },
    {
      icon: '🔒',
      title: 'Sécurité',
      description: 'Vos transactions sont 100% sécurisées grâce à notre partenariat avec Stripe.'
    },
    {
      icon: '💚',
      title: 'Transparence',
      description: 'Chaque euro collecté est tracé et reversé intégralement au bénéficiaire.'
    },
    {
      icon: '🚀',
      title: 'Simplicité',
      description: 'Créez votre cagnotte en moins de 5 minutes, sans frais cachés.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>Notre mission : faciliter l'entraide</h1>
          <p className="hero-subtitle">
            Cagnotte est la plateforme française de collecte de fonds qui permet à chacun
            de concrétiser ses projets grâce à la générosité de sa communauté.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Notre histoire</h2>
              <p>
                Fondée en 2024, Cagnotte est née d'une conviction simple : tout le monde
                devrait pouvoir bénéficier de la solidarité de sa communauté pour réaliser
                ses projets, qu'ils soient personnels, associatifs ou entrepreneuriaux.
              </p>
              <p>
                Face aux plateformes complexes et coûteuses, nous avons créé une solution
                simple, transparente et accessible à tous. Aujourd'hui, des milliers de
                personnes font confiance à Cagnotte pour leurs collectes de fonds.
              </p>
              <p>
                Notre équipe passionnée travaille chaque jour pour améliorer l'expérience
                de nos utilisateurs et accompagner chaque projet vers le succès.
              </p>
            </div>
            <div className="story-image">
              <div className="image-placeholder">
                <span>🎯</span>
                <p>L'entraide à portée de clic</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <h2>Nos valeurs</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <span className="value-icon">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="container">
          <h2>Notre équipe</h2>
          <p className="team-intro">
            Une équipe passionnée au service de vos projets
          </p>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <div className="member-avatar">
                  {member.image ? (
                    <img src={member.image} alt={member.name} />
                  ) : (
                    <span>{member.name.split(' ').map(n => n[0]).join('')}</span>
                  )}
                </div>
                <h3>{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Prêt à lancer votre cagnotte ?</h2>
          <p>Rejoignez les milliers de personnes qui font confiance à Cagnotte</p>
          <div className="cta-buttons">
            <Link to="/campaigns/create" className="btn-primary">
              Créer ma cagnotte
            </Link>
            <Link to="/contact" className="btn-secondary">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .about-page {
          padding-top: 0;
        }

        .about-hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, #0d5c42 100%);
          color: white;
          padding: 5rem 0;
          text-align: center;
        }

        .about-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: white;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .about-stats {
          background: white;
          padding: 3rem 0;
          margin-top: -2rem;
          border-radius: 20px 20px 0 0;
          position: relative;
          z-index: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          text-align: center;
        }

        .stat-item {
          padding: 1.5rem;
        }

        .stat-value {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .about-story {
          padding: 5rem 0;
          background: var(--bg-light);
        }

        .story-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .story-text h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .story-text p {
          color: var(--text-secondary);
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .story-image {
          display: flex;
          justify-content: center;
        }

        .image-placeholder {
          background: linear-gradient(135deg, var(--primary-color) 0%, #0d5c42 100%);
          color: white;
          padding: 4rem;
          border-radius: 20px;
          text-align: center;
        }

        .image-placeholder span {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .image-placeholder p {
          font-size: 1.25rem;
          font-weight: 500;
        }

        .about-values {
          padding: 5rem 0;
          background: white;
        }

        .about-values h2 {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 3rem;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .value-card {
          text-align: center;
          padding: 2rem;
          border-radius: 16px;
          background: var(--bg-light);
          transition: all 0.3s ease;
        }

        .value-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .value-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }

        .value-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .value-card p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .about-team {
          padding: 5rem 0;
          background: var(--bg-light);
        }

        .about-team h2 {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .team-intro {
          text-align: center;
          color: var(--text-secondary);
          margin-bottom: 3rem;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .team-member {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .member-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
          margin: 0 auto 1.5rem;
        }

        .member-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .team-member h3 {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
        }

        .member-role {
          color: var(--primary-color);
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .member-bio {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .about-cta {
          padding: 5rem 0;
          background: linear-gradient(135deg, var(--primary-color) 0%, #0d5c42 100%);
          color: white;
          text-align: center;
        }

        .about-cta h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: white;
        }

        .about-cta p {
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .cta-buttons .btn-primary {
          background: white;
          color: var(--primary-color);
        }

        .cta-buttons .btn-primary:hover {
          background: #f0f0f0;
        }

        .cta-buttons .btn-secondary {
          background: transparent;
          border: 2px solid white;
          color: white;
          padding: 0.875rem 2rem;
          border-radius: 25px;
          font-weight: 500;
        }

        .cta-buttons .btn-secondary:hover {
          background: white;
          color: var(--primary-color);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .values-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .about-hero h1 {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .story-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .stat-value {
            font-size: 2rem;
          }

          .values-grid {
            grid-template-columns: 1fr;
          }

          .team-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
