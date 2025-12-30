# Guide de Configuration du Webhook Stripe

Ce guide vous explique comment configurer un endpoint webhook Stripe pour votre application de cagnotte.

## 📋 Prérequis

1. Un compte Stripe (gratuit) : https://stripe.com
2. Votre application backend en cours d'exécution
3. Un outil de tunneling local (pour le développement) comme **ngrok** ou **Stripe CLI**

---

## 🚀 Étape 1 : Installer Stripe CLI (Recommandé pour le développement)

### Windows

1. Téléchargez Stripe CLI depuis : https://github.com/stripe/stripe-cli/releases
2. Extrayez l'archive et ajoutez le dossier au PATH
3. Ou utilisez **Scoop** :
   ```powershell
   scoop install stripe
   ```

### macOS
```bash
brew install stripe/stripe-cli/stripe
```

### Linux
```bash
# Téléchargez depuis https://github.com/stripe/stripe-cli/releases
# Ou utilisez votre gestionnaire de paquets
```

---

## 🔐 Étape 2 : Se connecter à Stripe CLI

1. Ouvrez un terminal
2. Connectez-vous à votre compte Stripe :
   ```bash
   stripe login
   ```
3. Suivez les instructions pour autoriser l'accès

---

## 🌐 Étape 3 : Exposer votre serveur local (Développement)

### Option A : Utiliser Stripe CLI (Recommandé)

Stripe CLI peut créer un tunnel automatiquement :

```bash
# Dans le dossier backend
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Cette commande :
- Crée un tunnel sécurisé vers votre serveur local
- Affiche un **webhook signing secret** (commence par `whsec_...`)
- Forward automatiquement les événements Stripe vers votre endpoint

**Copiez le secret affiché** et ajoutez-le à votre `.env` :
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Option B : Utiliser ngrok

1. Installez ngrok : https://ngrok.com/download
2. Démarrez votre serveur backend (port 5000)
3. Dans un autre terminal, créez un tunnel :
   ```bash
   ngrok http 5000
   ```
4. Copiez l'URL HTTPS générée (ex: `https://abc123.ngrok.io`)
5. Utilisez cette URL dans l'étape suivante

---

## 📡 Étape 4 : Créer l'endpoint webhook dans Stripe Dashboard

### Méthode 1 : Via Stripe Dashboard (Production)

1. Connectez-vous à https://dashboard.stripe.com
2. Allez dans **Developers** → **Webhooks**
3. Cliquez sur **Add endpoint**
4. Remplissez le formulaire :
   - **Endpoint URL** : 
     - Développement : `https://votre-url-ngrok.io/api/payments/webhook`
     - Production : `https://votre-domaine.com/api/payments/webhook`
   - **Description** : `Cagnotte App - Webhook de paiement`
   - **Events to send** : Sélectionnez les événements suivants :
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
     - ✅ `charge.refunded`
5. Cliquez sur **Add endpoint**
6. **Copiez le "Signing secret"** (commence par `whsec_...`)
7. Ajoutez-le à votre fichier `.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Méthode 2 : Via Stripe CLI (Développement - Automatique)

Si vous utilisez `stripe listen`, le webhook est automatiquement configuré et le secret est affiché dans le terminal.

---

## ✅ Étape 5 : Tester le webhook

### Avec Stripe CLI

1. Démarrez votre serveur backend
2. Dans un autre terminal, lancez :
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```
3. Dans un troisième terminal, déclenchez un événement de test :
   ```bash
   stripe trigger checkout.session.completed
   ```
4. Vérifiez les logs de votre serveur backend pour voir si l'événement a été reçu

### Via Stripe Dashboard

1. Allez dans **Developers** → **Webhooks**
2. Cliquez sur votre endpoint
3. Cliquez sur **Send test webhook**
4. Sélectionnez un événement (ex: `checkout.session.completed`)
5. Cliquez sur **Send test webhook**
6. Vérifiez les logs de votre serveur

---

## 🔧 Étape 6 : Configurer votre fichier .env

Ajoutez les variables suivantes dans `backend/.env` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# URLs (pour les redirections après paiement)
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

**Important** : 
- En développement, utilisez les clés de **test** (commencent par `sk_test_` et `pk_test_`)
- En production, utilisez les clés **live** (commencent par `sk_live_` et `pk_live_`)

---

## 🧪 Étape 7 : Vérifier que tout fonctionne

1. Redémarrez votre serveur backend
2. Créez une contribution de test sur votre application
3. Utilisez une carte de test Stripe :
   - Numéro : `4242 4242 4242 4242`
   - Date d'expiration : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres
   - Code postal : n'importe quel code postal
4. Complétez le paiement
5. Vérifiez dans votre base de données que la contribution a été mise à jour avec le statut `confirmed`

---

## 📝 Événements Stripe gérés par l'application

Votre application gère actuellement ces événements :

| Événement | Description | Action |
|-----------|-------------|--------|
| `checkout.session.completed` | Session de checkout complétée | Marque la contribution comme confirmée |
| `payment_intent.succeeded` | Paiement réussi | Marque la contribution comme confirmée |
| `payment_intent.payment_failed` | Paiement échoué | Marque la contribution comme échouée |
| `charge.refunded` | Remboursement effectué | Marque la contribution comme remboursée |

---

## 🐛 Dépannage

### Le webhook n'est pas reçu

1. Vérifiez que votre serveur backend est en cours d'exécution
2. Vérifiez que l'URL du webhook est correcte
3. Vérifiez les logs de votre serveur backend
4. Utilisez Stripe CLI pour voir les événements en temps réel :
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

### Erreur de signature

1. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct dans votre `.env`
2. Assurez-vous que le secret correspond à l'endpoint webhook
3. Redémarrez votre serveur après avoir modifié `.env`

### Les contributions ne sont pas mises à jour

1. Vérifiez les logs du serveur pour voir si le webhook est reçu
2. Vérifiez que la fonction `handleWebhook` dans `stripeController.js` est appelée
3. Vérifiez les logs MongoDB pour voir si les documents sont mis à jour

---

## 🔒 Sécurité

⚠️ **Important** :
- Ne partagez jamais vos clés secrètes
- Ne commitez jamais votre fichier `.env` dans Git
- Utilisez des clés de test en développement
- Utilisez HTTPS en production
- Validez toujours les signatures des webhooks

---

## 📚 Ressources

- Documentation Stripe Webhooks : https://stripe.com/docs/webhooks
- Stripe CLI Documentation : https://stripe.com/docs/stripe-cli
- Cartes de test Stripe : https://stripe.com/docs/testing
- Guide ngrok : https://ngrok.com/docs

---

## 🎯 Résumé rapide

1. Installez Stripe CLI
2. Lancez : `stripe listen --forward-to localhost:5000/api/payments/webhook`
3. Copiez le secret affiché (`whsec_...`)
4. Ajoutez-le à `backend/.env` : `STRIPE_WEBHOOK_SECRET=whsec_...`
5. Redémarrez votre serveur
6. Testez avec une contribution de test

C'est tout ! 🎉

