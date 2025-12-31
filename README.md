# Cagnotte App

Application de cagnotte en ligne permettant de creer et soutenir des campagnes de financement participatif.

## Fonctionnalites

### Campagnes
- Creation de campagnes avec objectif financier et date de fin
- Sauvegarde en brouillon pour continuer plus tard
- Publication immediate (statut actif par defaut)
- 13 categories disponibles (Medical, Education, Urgence, Communaute, etc.)
- Upload d'images avec compression automatique (WebP)
- Partage sur les reseaux sociaux (Facebook, Twitter, WhatsApp, LinkedIn, Email)
- Suivi des statistiques (vues, partages, contributions)
- Mises a jour pour informer les contributeurs

### Utilisateurs
- Inscription et connexion securisees (JWT)
- Reinitialisation de mot de passe par email
- Tableau de bord personnel
- Gestion des campagnes (creation, edition, suppression)
- Historique des contributions

### Contributions
- Paiement securise via Stripe
- Contributions anonymes possibles
- Messages de soutien optionnels
- Notifications par email

### Administration
- Gestion automatique des campagnes expirees
- Nettoyage periodique des brouillons abandonnes
- Verification et mise en vedette des campagnes

## Stack Technique

### Backend
- **Node.js** avec Express.js
- **MongoDB** avec Mongoose ODM
- **JWT** pour l'authentification
- **Stripe** pour les paiements
- **Nodemailer** pour les emails
- **Sharp** pour le traitement d'images
- **Express-validator** pour la validation

### Frontend
- **React 19** avec React Router v6
- **Material UI** pour les composants
- **Stripe Elements** pour le formulaire de paiement
- CSS personnalise avec variables CSS

## Installation

### Prerequis
- Node.js 18+
- MongoDB 6+
- Compte Stripe (mode test disponible)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

Variables d'environnement requises :
- `MONGODB_URI` - URL de connexion MongoDB
- `JWT_SECRET` - Cle secrete pour les tokens JWT
- `STRIPE_SECRET_KEY` - Cle secrete Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret du webhook Stripe
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Configuration email

### Frontend

```bash
cd frontend
npm install
npm start
```

Variables d'environnement :
- `REACT_APP_API_URL` - URL de l'API backend
- `REACT_APP_STRIPE_PUBLIC_KEY` - Cle publique Stripe

## Structure du Projet

```
cagnotte-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration (DB, Stripe, env)
│   │   ├── controllers/    # Logique metier
│   │   ├── middlewares/    # Auth, validation, upload
│   │   ├── models/         # Schemas Mongoose
│   │   ├── routes/         # Definitions des routes
│   │   ├── utils/          # Services (email, taches planifiees)
│   │   └── server.js       # Point d'entree
│   └── uploads/            # Fichiers uploades
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants reutilisables
│   │   ├── contexts/       # Contextes React (Auth, Toast)
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # API client, Stripe
│   │   ├── styles/         # CSS global
│   │   └── app.js          # Composant principal
│   └── public/
└── README.md
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/forgot-password` - Demande de reinitialisation
- `POST /api/auth/reset-password` - Reinitialisation du mot de passe

### Campagnes
- `GET /api/campaigns` - Liste des campagnes
- `GET /api/campaigns/:id` - Detail d'une campagne
- `POST /api/campaigns` - Creer une campagne
- `PUT /api/campaigns/:id` - Modifier une campagne
- `DELETE /api/campaigns/:id` - Supprimer une campagne
- `POST /api/campaigns/:id/image` - Upload d'image
- `POST /api/campaigns/:id/share` - Tracker un partage
- `POST /api/campaigns/:id/updates` - Ajouter une mise a jour

### Contributions
- `POST /api/contributions/campaign/:id` - Contribuer
- `GET /api/contributions/user/my-contributions` - Mes contributions

### Paiements
- `POST /api/payments/create-intent` - Creer un PaymentIntent
- `POST /api/payments/webhook` - Webhook Stripe

## Categories Disponibles

| Valeur | Label |
|--------|-------|
| medical | Sante & Medical |
| education | Education |
| emergency | Urgence |
| community | Communaute |
| environment | Environnement |
| sports | Sports |
| creative | Projets creatifs |
| memorial | Cagnotte deces |
| wedding | Mariage |
| birthday | Anniversaire |
| baby | Naissance |
| travel | Voyage |
| other | Autres |

## Scripts

### Backend
- `npm run dev` - Demarrer en mode developpement (nodemon)
- `npm start` - Demarrer en production

### Frontend
- `npm start` - Demarrer le serveur de developpement
- `npm run build` - Build de production
- `npm test` - Lancer les tests

## Taches Planifiees

Le backend execute automatiquement :
- **Toutes les 15 min** : Verification des campagnes expirees
- **Toutes les heures** : Nettoyage complet
  - Suppression des campagnes expirees depuis 30+ jours
  - Suppression des brouillons abandonnes depuis 90+ jours

## Securite

- Mots de passe hashes avec bcrypt
- Tokens JWT avec expiration
- Protection CORS configuree
- Helmet pour les headers HTTP
- Rate limiting sur les endpoints sensibles
- Validation des entrees avec express-validator
- Verification des permissions sur les ressources

## Licence

MIT
