import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  const lastUpdated = '15 décembre 2024';

  const sections = [
    {
      title: '1. Responsable du traitement',
      content: `Cagnotte SAS, société par actions simplifiée au capital de 10 000 euros, immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro XXX XXX XXX, dont le siège social est situé au 123 Rue de l'Entraide, 75001 Paris, France.

**Contact DPO** : dpo@cagnotte.fr`
    },
    {
      title: '2. Données collectées',
      content: `Nous collectons les données suivantes :

**Données d'identification** :
- Nom et prénom
- Adresse email
- Numéro de téléphone (optionnel)
- Photo de profil (optionnel)

**Données de paiement** :
- Les données de paiement sont traitées directement par notre prestataire Stripe et ne sont pas stockées sur nos serveurs.

**Données de connexion** :
- Adresse IP
- Type de navigateur
- Pages visitées
- Date et heure de connexion

**Données relatives aux cagnottes** :
- Titre et description des cagnottes
- Montants collectés et contributions`
    },
    {
      title: '3. Finalités du traitement',
      content: `Vos données personnelles sont collectées pour les finalités suivantes :

- **Gestion de votre compte** : création, authentification et gestion de votre compte utilisateur
- **Fourniture des services** : création de cagnottes, traitement des contributions, envoi des notifications
- **Communication** : envoi d'emails relatifs à vos cagnottes et contributions
- **Amélioration des services** : analyse statistique anonymisée pour améliorer notre plateforme
- **Sécurité** : prévention et détection de la fraude
- **Obligations légales** : respect des obligations légales et réglementaires`
    },
    {
      title: '4. Base légale du traitement',
      content: `Le traitement de vos données repose sur les bases légales suivantes :

- **Exécution du contrat** : les traitements nécessaires à la fourniture de nos services
- **Intérêt légitime** : amélioration de nos services, prévention de la fraude
- **Consentement** : pour l'envoi de communications marketing
- **Obligation légale** : conservation des données de transaction`
    },
    {
      title: '5. Destinataires des données',
      content: `Vos données peuvent être partagées avec :

- **Notre prestataire de paiement** : Stripe, pour le traitement sécurisé des paiements
- **Nos prestataires techniques** : hébergement, maintenance, envoi d'emails
- **Les autorités compétentes** : en cas d'obligation légale

Nous ne vendons jamais vos données personnelles à des tiers.`
    },
    {
      title: '6. Durée de conservation',
      content: `Vos données sont conservées pendant les durées suivantes :

- **Données de compte** : pendant toute la durée de votre inscription, puis 3 ans après votre dernière activité
- **Données de transaction** : 10 ans conformément aux obligations comptables
- **Données de connexion** : 1 an
- **Cookies** : durée maximale de 13 mois`
    },
    {
      title: '7. Vos droits',
      content: `Conformément au RGPD, vous disposez des droits suivants :

- **Droit d'accès** : obtenir une copie de vos données personnelles
- **Droit de rectification** : corriger des données inexactes
- **Droit à l'effacement** : demander la suppression de vos données
- **Droit à la limitation** : limiter le traitement de vos données
- **Droit à la portabilité** : recevoir vos données dans un format structuré
- **Droit d'opposition** : vous opposer au traitement de vos données

Pour exercer ces droits, contactez-nous à : dpo@cagnotte.fr

Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).`
    },
    {
      title: '8. Cookies',
      content: `Notre site utilise des cookies pour :

**Cookies essentiels** :
- Authentification et session utilisateur
- Sécurité et prévention de la fraude

**Cookies analytiques** :
- Mesure d'audience anonymisée
- Amélioration de l'expérience utilisateur

**Cookies marketing** (avec votre consentement) :
- Personnalisation des publicités
- Suivi des conversions

Vous pouvez gérer vos préférences de cookies à tout moment via le bandeau de consentement ou les paramètres de votre navigateur.`
    },
    {
      title: '9. Sécurité des données',
      content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :

- Chiffrement des données en transit (HTTPS/TLS)
- Chiffrement des mots de passe
- Accès restreint aux données personnelles
- Surveillance continue de la sécurité
- Formation régulière de nos équipes

En cas de violation de données susceptible d'engendrer un risque pour vos droits et libertés, nous vous en informerons dans les meilleurs délais.`
    },
    {
      title: '10. Transferts internationaux',
      content: `Vos données sont principalement stockées en France et dans l'Union Européenne.

Dans le cas où des données seraient transférées hors de l'UE, nous nous assurons que des garanties appropriées sont en place (décision d'adéquation, clauses contractuelles types de la Commission européenne).`
    },
    {
      title: '11. Modifications',
      content: `Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications entreront en vigueur dès leur publication sur cette page.

En cas de modification substantielle, nous vous en informerons par email ou via une notification sur la plateforme.`
    }
  ];

  return (
    <div className="privacy-page">
      <section className="privacy-hero">
        <div className="container">
          <h1>Politique de Confidentialité</h1>
          <p>Dernière mise à jour : {lastUpdated}</p>
        </div>
      </section>

      <section className="privacy-content">
        <div className="container">
          <div className="privacy-layout">
            <nav className="privacy-nav">
              <h3>Sommaire</h3>
              <ul>
                {sections.map((section, index) => (
                  <li key={index}>
                    <a href={`#section-${index}`}>{section.title}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="privacy-main">
              <div className="privacy-intro">
                <p>
                  Chez Cagnotte, nous accordons une grande importance à la protection de vos données
                  personnelles. Cette politique de confidentialité vous informe sur la manière dont
                  nous collectons, utilisons et protégeons vos données.
                </p>
              </div>

              {sections.map((section, index) => (
                <article key={index} id={`section-${index}`} className="privacy-section">
                  <h2>{section.title}</h2>
                  <div className="privacy-text">
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex} dangerouslySetInnerHTML={{
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n- /g, '<br/>• ')
                          .replace(/\n/g, '<br/>')
                      }} />
                    ))}
                  </div>
                </article>
              ))}

              <div className="privacy-footer">
                <h3>Questions ?</h3>
                <p>
                  Pour toute question concernant cette politique ou vos données personnelles,
                  contactez notre Délégué à la Protection des Données :
                </p>
                <div className="contact-info">
                  <a href="mailto:dpo@cagnotte.fr">dpo@cagnotte.fr</a>
                  <span>ou</span>
                  <Link to="/contact">formulaire de contact</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .privacy-page {
          padding-top: 0;
        }

        .privacy-hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, #0d5c42 100%);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .privacy-hero h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: white;
        }

        .privacy-hero p {
          opacity: 0.9;
        }

        .privacy-content {
          padding: 3rem 0;
        }

        .privacy-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
        }

        .privacy-nav {
          position: sticky;
          top: 100px;
          height: fit-content;
          background: var(--bg-light);
          padding: 1.5rem;
          border-radius: 12px;
        }

        .privacy-nav h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }

        .privacy-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .privacy-nav li {
          margin-bottom: 0.5rem;
        }

        .privacy-nav a {
          color: var(--text-primary);
          font-size: 0.9rem;
          line-height: 1.4;
          display: block;
          padding: 0.5rem 0;
          border-left: 2px solid transparent;
          padding-left: 0.75rem;
          transition: all 0.2s ease;
        }

        .privacy-nav a:hover {
          color: var(--primary-color);
          border-left-color: var(--primary-color);
        }

        .privacy-intro {
          background: var(--bg-light);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .privacy-intro p {
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.7;
        }

        .privacy-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid var(--border-light);
        }

        .privacy-section:last-of-type {
          border-bottom: none;
        }

        .privacy-section h2 {
          font-size: 1.5rem;
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .privacy-text p {
          color: var(--text-secondary);
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .privacy-text p:last-child {
          margin-bottom: 0;
        }

        .privacy-text strong {
          color: var(--text-primary);
        }

        .privacy-footer {
          background: linear-gradient(135deg, var(--primary-color) 0%, #0d5c42 100%);
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          color: white;
        }

        .privacy-footer h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: white;
        }

        .privacy-footer p {
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }

        .contact-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .contact-info a {
          background: white;
          color: var(--primary-color);
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .contact-info a:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .contact-info span {
          opacity: 0.8;
        }

        @media (max-width: 1024px) {
          .privacy-layout {
            grid-template-columns: 1fr;
          }

          .privacy-nav {
            position: static;
            display: none;
          }
        }

        @media (max-width: 768px) {
          .privacy-hero h1 {
            font-size: 2rem;
          }

          .privacy-section h2 {
            font-size: 1.25rem;
          }

          .contact-info {
            flex-direction: column;
            gap: 0.75rem;
          }

          .contact-info span {
            display: none;
          }

          .contact-info a {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPage;
