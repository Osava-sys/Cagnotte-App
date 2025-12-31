import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', name: 'Général', icon: '📋' },
    { id: 'creation', name: 'Créer une cagnotte', icon: '✨' },
    { id: 'contribution', name: 'Contribuer', icon: '💳' },
    { id: 'security', name: 'Sécurité', icon: '🔒' },
    { id: 'withdrawal', name: 'Retrait des fonds', icon: '💰' }
  ];

  const faqData = {
    general: [
      {
        question: 'Qu\'est-ce que Cagnotte ?',
        answer: 'Cagnotte est une plateforme française de collecte de fonds en ligne qui permet à chacun de créer une cagnotte pour financer ses projets personnels, associatifs ou professionnels. Notre mission est de faciliter l\'entraide et la solidarité.'
      },
      {
        question: 'Cagnotte est-il gratuit ?',
        answer: 'La création d\'une cagnotte est entièrement gratuite. Nous prélevons une commission de 3% uniquement sur les montants collectés, ce qui nous permet de maintenir la plateforme et d\'assurer la sécurité des transactions.'
      },
      {
        question: 'Dans quels pays Cagnotte est-il disponible ?',
        answer: 'Cagnotte est actuellement disponible en France métropolitaine et dans les DOM-TOM. Nous travaillons à étendre notre service à d\'autres pays européens.'
      },
      {
        question: 'Dois-je créer un compte pour participer ?',
        answer: 'Non, vous pouvez contribuer à une cagnotte sans créer de compte. Cependant, avoir un compte vous permet de suivre vos contributions, de recevoir des notifications et de créer vos propres cagnottes.'
      }
    ],
    creation: [
      {
        question: 'Comment créer une cagnotte ?',
        answer: 'C\'est très simple ! Cliquez sur "Créer une cagnotte", remplissez le formulaire avec le titre, la description et l\'objectif de votre collecte, ajoutez une photo attractive, et publiez. Votre cagnotte sera en ligne en quelques minutes.'
      },
      {
        question: 'Quels types de projets puis-je financer ?',
        answer: 'Vous pouvez créer une cagnotte pour de nombreux projets : frais médicaux, événements (anniversaire, mariage), projets associatifs, études, projets créatifs, urgences... Toute cause légale et légitime est acceptée.'
      },
      {
        question: 'Y a-t-il un montant minimum ou maximum ?',
        answer: 'Le montant minimum pour une cagnotte est de 50€. Il n\'y a pas de maximum, mais nous vous conseillons de fixer un objectif réaliste pour votre projet.'
      },
      {
        question: 'Puis-je modifier ma cagnotte après publication ?',
        answer: 'Oui, vous pouvez modifier le titre, la description, les images et l\'objectif à tout moment depuis votre tableau de bord. Les contributions déjà reçues restent acquises.'
      },
      {
        question: 'Combien de temps dure une cagnotte ?',
        answer: 'Par défaut, une cagnotte dure 60 jours. Vous pouvez choisir une durée plus courte ou la prolonger si nécessaire depuis votre tableau de bord.'
      }
    ],
    contribution: [
      {
        question: 'Comment contribuer à une cagnotte ?',
        answer: 'Rendez-vous sur la page de la cagnotte, cliquez sur "Participer", choisissez le montant de votre contribution et procédez au paiement par carte bancaire. C\'est sécurisé et ne prend que quelques secondes.'
      },
      {
        question: 'Quels moyens de paiement sont acceptés ?',
        answer: 'Nous acceptons les cartes bancaires Visa, Mastercard et American Express. Les paiements sont traités de manière sécurisée par Stripe.'
      },
      {
        question: 'Puis-je contribuer de manière anonyme ?',
        answer: 'Oui, lors de votre contribution, vous pouvez choisir de rester anonyme. Votre nom n\'apparaîtra pas dans la liste des contributeurs visible publiquement.'
      },
      {
        question: 'Ma contribution est-elle déductible des impôts ?',
        answer: 'Seules les contributions aux cagnottes créées par des associations reconnues d\'utilité publique peuvent être déductibles. Vérifiez le statut de l\'organisateur avant de contribuer.'
      },
      {
        question: 'Puis-je annuler ma contribution ?',
        answer: 'Une fois la contribution confirmée, elle ne peut pas être annulée. En cas de fraude avérée sur une cagnotte, nous pouvons procéder au remboursement des contributeurs.'
      }
    ],
    security: [
      {
        question: 'Mes paiements sont-ils sécurisés ?',
        answer: 'Absolument. Tous les paiements sont traités par Stripe, leader mondial du paiement en ligne. Nous utilisons le cryptage SSL et ne stockons jamais vos données bancaires.'
      },
      {
        question: 'Comment vérifiez-vous les cagnottes ?',
        answer: 'Notre équipe vérifie chaque cagnotte avant publication pour s\'assurer de sa légitimité. Nous vérifions également l\'identité des organisateurs pour les collectes importantes.'
      },
      {
        question: 'Que faire si je suspecte une fraude ?',
        answer: 'Si vous avez des doutes sur une cagnotte, utilisez le bouton "Signaler" sur la page de la cagnotte ou contactez-nous directement. Nous enquêtons sur chaque signalement.'
      },
      {
        question: 'Mes données personnelles sont-elles protégées ?',
        answer: 'Oui, nous respectons le RGPD et ne partageons jamais vos données avec des tiers sans votre consentement. Consultez notre politique de confidentialité pour plus de détails.'
      }
    ],
    withdrawal: [
      {
        question: 'Comment retirer les fonds collectés ?',
        answer: 'Rendez-vous dans votre tableau de bord, section "Mes cagnottes". Cliquez sur "Retirer les fonds" et renseignez votre IBAN. Le virement sera effectué sous 3-5 jours ouvrés.'
      },
      {
        question: 'Y a-t-il un montant minimum pour retirer ?',
        answer: 'Oui, le montant minimum de retrait est de 20€. Les frais de traitement sont inclus dans notre commission de 3%.'
      },
      {
        question: 'Que se passe-t-il si je n\'atteins pas mon objectif ?',
        answer: 'Contrairement à certaines plateformes, chez Cagnotte vous gardez toutes les contributions reçues, même si l\'objectif n\'est pas atteint. Pas de système "tout ou rien".'
      },
      {
        question: 'Dans quel délai puis-je retirer les fonds ?',
        answer: 'Vous pouvez demander un retrait dès que vous avez collecté au moins 20€. Il n\'est pas nécessaire d\'attendre la fin de votre cagnotte.'
      },
      {
        question: 'Quels sont les frais prélevés ?',
        answer: 'Nous prélevons une commission de 3% sur chaque contribution. Par exemple, pour une contribution de 100€, vous recevrez 97€. Il n\'y a pas de frais cachés.'
      }
    ]
  };

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <div className="container">
          <h1>Questions fréquentes</h1>
          <p>Trouvez rapidement les réponses à vos questions</p>
        </div>
      </section>

      <section className="faq-content">
        <div className="container">
          <div className="faq-layout">
            {/* Categories Sidebar */}
            <aside className="faq-sidebar">
              <nav className="faq-categories">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setOpenIndex(null);
                    }}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </button>
                ))}
              </nav>

              <div className="faq-contact-card">
                <h3>Besoin d'aide ?</h3>
                <p>Notre équipe est là pour vous aider</p>
                <Link to="/contact" className="btn-primary">
                  Nous contacter
                </Link>
              </div>
            </aside>

            {/* FAQ Items */}
            <div className="faq-main">
              <h2>
                {categories.find(c => c.id === activeCategory)?.icon}{' '}
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>

              <div className="faq-list">
                {faqData[activeCategory]?.map((faq, index) => (
                  <div
                    key={index}
                    className={`faq-item ${openIndex === index ? 'open' : ''}`}
                  >
                    <button
                      className="faq-question"
                      onClick={() => toggleQuestion(index)}
                    >
                      <span>{faq.question}</span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="faq-chevron"
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .faq-page {
          padding-top: 0;
        }

        .faq-hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, #0d5c42 100%);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .faq-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: white;
        }

        .faq-hero p {
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .faq-content {
          padding: 3rem 0;
        }

        .faq-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
        }

        .faq-sidebar {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .faq-categories {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: white;
          border: 2px solid var(--border-light);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .category-btn:hover {
          border-color: var(--primary-color);
          background: var(--bg-light);
        }

        .category-btn.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
        }

        .category-icon {
          font-size: 1.25rem;
        }

        .category-name {
          font-weight: 500;
        }

        .faq-contact-card {
          background: var(--bg-light);
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
        }

        .faq-contact-card h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .faq-contact-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .faq-contact-card .btn-primary {
          width: 100%;
        }

        .faq-main h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-item {
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .faq-item:hover {
          border-color: var(--primary-color);
        }

        .faq-item.open {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 1.25rem;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .faq-question span {
          flex: 1;
          padding-right: 1rem;
        }

        .faq-chevron {
          flex-shrink: 0;
          color: var(--text-secondary);
          transition: transform 0.3s ease;
        }

        .faq-item.open .faq-chevron {
          transform: rotate(180deg);
          color: var(--primary-color);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .faq-item.open .faq-answer {
          max-height: 500px;
        }

        .faq-answer p {
          padding: 0 1.25rem 1.25rem;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        @media (max-width: 1024px) {
          .faq-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .faq-sidebar {
            position: static;
          }

          .faq-categories {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .category-btn {
            flex: 1;
            min-width: 150px;
            justify-content: center;
          }

          .faq-contact-card {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .faq-hero h1 {
            font-size: 2rem;
          }

          .category-btn {
            min-width: calc(50% - 0.25rem);
            padding: 0.875rem 1rem;
          }

          .category-icon {
            font-size: 1rem;
          }

          .category-name {
            font-size: 0.9rem;
          }

          .faq-question {
            padding: 1rem;
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
