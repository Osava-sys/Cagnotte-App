import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  const lastUpdated = '15 décembre 2024';

  const sections = [
    {
      title: '1. Objet',
      content: `Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation des services proposés sur le site Cagnotte (ci-après "la Plateforme"), ainsi que de définir les droits et obligations des parties dans ce cadre.

L'utilisation de la Plateforme implique l'acceptation entière et sans réserve des présentes CGU.`
    },
    {
      title: '2. Définitions',
      content: `**"Utilisateur"** : toute personne qui accède et navigue sur la Plateforme.

**"Organisateur"** : toute personne physique ou morale qui crée une cagnotte sur la Plateforme.

**"Contributeur"** : toute personne qui effectue une contribution financière à une cagnotte.

**"Cagnotte"** : collecte de fonds créée sur la Plateforme par un Organisateur.

**"Contribution"** : somme d'argent versée par un Contributeur à une cagnotte.`
    },
    {
      title: '3. Accès à la Plateforme',
      content: `La Plateforme est accessible gratuitement à tout Utilisateur disposant d'un accès à Internet. Tous les coûts afférents à l'accès à la Plateforme, que ce soient les frais matériels, logiciels ou d'accès à Internet sont exclusivement à la charge de l'Utilisateur.

La Plateforme peut être accessible 24 heures sur 24, 7 jours sur 7. Toutefois, Cagnotte se réserve le droit, sans préavis ni indemnité, de fermer temporairement ou définitivement la Plateforme pour effectuer des mises à jour ou des modifications.`
    },
    {
      title: '4. Inscription et compte utilisateur',
      content: `L'inscription sur la Plateforme est gratuite. Pour créer un compte, l'Utilisateur doit fournir des informations exactes et complètes. Il s'engage à mettre à jour ces informations en cas de changement.

L'Utilisateur est seul responsable de la confidentialité de son mot de passe et de son compte. Toute utilisation de son compte sera réputée avoir été faite par lui.

Cagnotte se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes CGU.`
    },
    {
      title: '5. Création d\'une cagnotte',
      content: `Pour créer une cagnotte, l'Organisateur doit :
- Être majeur ou disposer de l'autorisation de son représentant légal
- Fournir des informations exactes sur l'objet de la collecte
- S'engager à utiliser les fonds conformément à l'objet déclaré

Cagnotte se réserve le droit de refuser ou de supprimer toute cagnotte qui :
- Contreviendrait aux lois et règlements en vigueur
- Aurait un caractère frauduleux, mensonger ou trompeur
- Porterait atteinte aux droits des tiers
- Serait contraire aux bonnes mœurs`
    },
    {
      title: '6. Contributions',
      content: `Les contributions sont définitives et ne peuvent être annulées ou remboursées, sauf en cas de fraude avérée.

Le Contributeur reconnaît effectuer sa contribution en toute connaissance de cause et assume les risques inhérents à toute collecte de fonds.

Cagnotte ne peut être tenu responsable de l'utilisation qui est faite des fonds par l'Organisateur.`
    },
    {
      title: '7. Frais et commissions',
      content: `La création d'une cagnotte est gratuite. Cagnotte prélève une commission de 3% sur chaque contribution reçue, qui couvre les frais de traitement des paiements et les frais de fonctionnement de la Plateforme.

Les Organisateurs peuvent retirer les fonds collectés à tout moment, sous réserve d'un montant minimum de 20€.`
    },
    {
      title: '8. Propriété intellectuelle',
      content: `L'ensemble des éléments composant la Plateforme (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) est protégé par les lois relatives à la propriété intellectuelle.

Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle de la Plateforme ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit est interdite.`
    },
    {
      title: '9. Responsabilité',
      content: `Cagnotte s'engage à mettre en œuvre tous les moyens nécessaires pour assurer au mieux la fourniture des services proposés. Toutefois, Cagnotte ne saurait être tenu responsable :
- Des dommages résultant de l'utilisation ou de l'impossibilité d'utiliser la Plateforme
- Des dommages causés par des tiers ou par des événements échappant à son contrôle
- De l'utilisation frauduleuse des fonds collectés par un Organisateur
- Du non-respect par un Organisateur de ses engagements`
    },
    {
      title: '10. Protection des données personnelles',
      content: `Cagnotte s'engage à respecter la réglementation en vigueur applicable au traitement de données personnelles, et notamment le Règlement Général sur la Protection des Données (RGPD).

Pour plus d'informations sur la collecte et le traitement des données personnelles, veuillez consulter notre Politique de Confidentialité.`
    },
    {
      title: '11. Modification des CGU',
      content: `Cagnotte se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entreront en vigueur dès leur publication sur la Plateforme.

L'utilisation continue de la Plateforme après la publication des modifications constitue l'acceptation de ces modifications.`
    },
    {
      title: '12. Droit applicable et juridiction',
      content: `Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.

À défaut d'accord amiable, les tribunaux français seront seuls compétents pour connaître du litige.`
    }
  ];

  return (
    <div className="terms-page">
      <section className="terms-hero">
        <div className="container">
          <h1>Conditions Générales d'Utilisation</h1>
          <p>Dernière mise à jour : {lastUpdated}</p>
        </div>
      </section>

      <section className="terms-content">
        <div className="container">
          <div className="terms-layout">
            <nav className="terms-nav">
              <h3>Sommaire</h3>
              <ul>
                {sections.map((section, index) => (
                  <li key={index}>
                    <a href={`#section-${index}`}>{section.title}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="terms-main">
              <div className="terms-intro">
                <p>
                  Bienvenue sur Cagnotte. En utilisant notre plateforme, vous acceptez les présentes
                  Conditions Générales d'Utilisation. Veuillez les lire attentivement.
                </p>
              </div>

              {sections.map((section, index) => (
                <article key={index} id={`section-${index}`} className="terms-section">
                  <h2>{section.title}</h2>
                  <div className="terms-text">
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex} dangerouslySetInnerHTML={{
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>')
                      }} />
                    ))}
                  </div>
                </article>
              ))}

              <div className="terms-footer">
                <p>
                  Pour toute question concernant ces conditions, n'hésitez pas à{' '}
                  <Link to="/contact">nous contacter</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .terms-page {
          padding-top: 0;
        }

        .terms-hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, #0d5c42 100%);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .terms-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: white;
        }

        .terms-hero p {
          opacity: 0.9;
        }

        .terms-content {
          padding: 3rem 0;
        }

        .terms-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
        }

        .terms-nav {
          position: sticky;
          top: 100px;
          height: fit-content;
          background: var(--bg-light);
          padding: 1.5rem;
          border-radius: 12px;
        }

        .terms-nav h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }

        .terms-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .terms-nav li {
          margin-bottom: 0.5rem;
        }

        .terms-nav a {
          color: var(--text-primary);
          font-size: 0.9rem;
          line-height: 1.4;
          display: block;
          padding: 0.5rem 0;
          border-left: 2px solid transparent;
          padding-left: 0.75rem;
          transition: all 0.2s ease;
        }

        .terms-nav a:hover {
          color: var(--primary-color);
          border-left-color: var(--primary-color);
        }

        .terms-intro {
          background: var(--bg-light);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .terms-intro p {
          color: var(--text-secondary);
          margin: 0;
        }

        .terms-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid var(--border-light);
        }

        .terms-section:last-of-type {
          border-bottom: none;
        }

        .terms-section h2 {
          font-size: 1.5rem;
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .terms-text p {
          color: var(--text-secondary);
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .terms-text p:last-child {
          margin-bottom: 0;
        }

        .terms-text strong {
          color: var(--text-primary);
        }

        .terms-footer {
          background: var(--bg-light);
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
        }

        .terms-footer p {
          margin: 0;
          color: var(--text-secondary);
        }

        .terms-footer a {
          color: var(--primary-color);
          font-weight: 500;
        }

        .terms-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 1024px) {
          .terms-layout {
            grid-template-columns: 1fr;
          }

          .terms-nav {
            position: static;
            display: none;
          }
        }

        @media (max-width: 768px) {
          .terms-hero h1 {
            font-size: 2rem;
          }

          .terms-section h2 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TermsPage;
