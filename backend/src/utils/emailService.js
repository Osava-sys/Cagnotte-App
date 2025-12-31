/**
 * Service d'envoi d'emails avec Nodemailer
 * Gère toutes les notifications par email de l'application
 *
 * En développement : Utilise automatiquement Ethereal (service de test)
 * En production : Utilise les credentials SMTP configurés
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');

// Créer le transporteur email
let transporter = null;
let etherealAccount = null;

/**
 * Créer un compte Ethereal pour les tests en développement
 * Ethereal capture les emails et permet de les visualiser sans les envoyer réellement
 */
const createEtherealAccount = async () => {
  if (etherealAccount) return etherealAccount;

  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealAccount = testAccount;

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  📧 COMPTE ETHEREAL CRÉÉ POUR LES TESTS                     ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Email: ${testAccount.user.padEnd(48)}║`);
    console.log(`║  Pass:  ${testAccount.pass.padEnd(48)}║`);
    console.log('║                                                            ║');
    console.log('║  🌐 Voir les emails: https://ethereal.email/login          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    return testAccount;
  } catch (error) {
    console.error('[EMAIL] Erreur création compte Ethereal:', error.message);
    return null;
  }
};

/**
 * Initialiser le transporteur email
 * - En production : utilise les credentials SMTP configurés
 * - En développement : utilise Ethereal si SMTP non configuré
 */
const initTransporter = async () => {
  if (transporter) return transporter;

  const isSmtpConfigured = config.smtp.user && config.smtp.pass;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isSmtpConfigured) {
    // Utiliser les credentials SMTP configurés
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
      tls: {
        rejectUnauthorized: isProduction
      }
    });
    console.log('[EMAIL] Transporteur SMTP initialisé avec les credentials configurés');
  } else if (!isProduction) {
    // En développement, créer un compte Ethereal automatiquement
    const testAccount = await createEtherealAccount();

    if (testAccount) {
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('[EMAIL] Transporteur Ethereal initialisé (mode développement)');
    }
  }

  return transporter;
};

/**
 * Fonction générique d'envoi d'email
 * Gère automatiquement le mode développement avec Ethereal
 */
const sendEmail = async (options) => {
  try {
    const transport = await initTransporter();
    const isProduction = process.env.NODE_ENV === 'production';

    // Si pas de transporteur en production, c'est une erreur
    if (!transport && isProduction) {
      console.error('[EMAIL] ERREUR: SMTP non configuré en production!');
      return { success: false, error: 'SMTP non configuré' };
    }

    // Si pas de transporteur en dev, simuler l'envoi
    if (!transport) {
      console.log('\n[EMAIL] 📧 Email simulé (pas de transporteur):');
      console.log(`  → Destinataire: ${options.to}`);
      console.log(`  → Sujet: ${options.subject}`);
      console.log('  → Contenu: [HTML généré]\n');
      return { success: true, simulated: true };
    }

    const mailOptions = {
      from: config.smtp.from || '"Cagnotte App" <noreply@cagnotte-app.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
    };

    const info = await transport.sendMail(mailOptions);

    // En mode développement avec Ethereal, afficher le lien de prévisualisation
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║  📧 EMAIL ENVOYÉ (MODE TEST)                                ║');
      console.log('╠════════════════════════════════════════════════════════════╣');
      console.log(`║  Destinataire: ${options.to.padEnd(42)}║`);
      console.log(`║  Sujet: ${options.subject.substring(0, 48).padEnd(50)}║`);
      console.log('║                                                            ║');
      console.log('║  🔗 PRÉVISUALISER L\'EMAIL:                                  ║');
      console.log(`║  ${previewUrl.padEnd(57)}║`);
      console.log('╚════════════════════════════════════════════════════════════╝\n');
    } else {
      console.log(`[EMAIL] ✅ Email envoyé à ${options.to} - ID: ${info.messageId}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null
    };
  } catch (error) {
    console.error('[EMAIL] ❌ Erreur envoi:', error.message);
    return { success: false, error: error.message };
  }
};

// Utilitaire pour convertir HTML en texte brut
const stripHtml = (html) => {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Template de base pour les emails
const baseTemplate = (content, preheader = '') => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cagnotte App</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1A1F2C;
      margin: 0;
      padding: 0;
      background-color: #F8F9FA;
    }
    .preheader {
      display: none !important;
      visibility: hidden;
      opacity: 0;
      color: transparent;
      height: 0;
      width: 0;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #0B4B36 0%, #0D6B4A 100%);
      padding: 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      background: white;
      padding: 40px 30px;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #0B4B36;
      margin-bottom: 20px;
    }
    .message {
      color: #5A6378;
      font-size: 16px;
      margin-bottom: 25px;
    }
    .highlight-box {
      background: #F0F7F4;
      border-left: 4px solid #0B4B36;
      padding: 20px;
      margin: 25px 0;
      border-radius: 0 8px 8px 0;
    }
    .highlight-box .label {
      font-size: 12px;
      color: #5A6378;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .highlight-box .value {
      font-size: 24px;
      font-weight: 700;
      color: #0B4B36;
    }
    .btn {
      display: inline-block;
      background: #0B4B36;
      color: white !important;
      padding: 14px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .btn:hover {
      background: #0D6B4A;
    }
    .stats-grid {
      display: table;
      width: 100%;
      margin: 20px 0;
    }
    .stat-item {
      display: table-cell;
      text-align: center;
      padding: 15px;
      background: #F8F9FA;
      border-radius: 8px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #0B4B36;
    }
    .stat-label {
      font-size: 12px;
      color: #5A6378;
      text-transform: uppercase;
    }
    .footer {
      text-align: center;
      padding: 30px;
      color: #8F96A3;
      font-size: 13px;
    }
    .footer a {
      color: #0B4B36;
      text-decoration: none;
    }
    .social-links {
      margin: 15px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #5A6378;
    }
    .divider {
      border: none;
      border-top: 1px solid #E5E7EB;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  <div class="wrapper">
    <div class="header">
      <h1>🎯 Cagnotte App</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Cet email a été envoyé par Cagnotte App</p>
      <p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visiter le site</a> |
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings">Gérer mes notifications</a>
      </p>
      <hr class="divider">
      <p>© ${new Date().getFullYear()} Cagnotte App. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// EMAILS D'AUTHENTIFICATION
// ============================================

/**
 * Email de bienvenue après inscription
 */
exports.sendWelcomeEmail = async (user) => {
  const firstName = user.firstName || user.username || 'Nouveau membre';

  const content = `
    <p class="greeting">Bienvenue ${firstName} ! 🎉</p>
    <p class="message">
      Nous sommes ravis de vous accueillir sur Cagnotte App, la plateforme de financement participatif
      qui vous permet de donner vie à vos projets et de soutenir les causes qui vous tiennent à cœur.
    </p>

    <div class="highlight-box">
      <p style="margin: 0;">Avec Cagnotte App, vous pouvez :</p>
      <ul style="color: #5A6378; margin-top: 10px;">
        <li>Créer une cagnotte pour votre projet</li>
        <li>Soutenir des causes qui vous inspirent</li>
        <li>Partager et faire connaître vos campagnes</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/campaigns/create" class="btn">
        Créer ma première cagnotte
      </a>
    </div>

    <hr class="divider">

    <p class="message" style="font-size: 14px;">
      Si vous avez des questions, n'hésitez pas à nous contacter. Notre équipe est là pour vous aider !
    </p>
  `;

  return sendEmail({
    to: user.email,
    subject: '🎉 Bienvenue sur Cagnotte App !',
    html: baseTemplate(content, 'Bienvenue sur Cagnotte App ! Commencez à créer votre première cagnotte.')
  });
};

/**
 * Email de réinitialisation de mot de passe
 */
exports.sendPasswordResetEmail = async (user, resetToken, resetUrl) => {
  const firstName = user.firstName || user.username || 'Utilisateur';

  const content = `
    <p class="greeting">Bonjour ${firstName},</p>
    <p class="message">
      Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous
      pour créer un nouveau mot de passe.
    </p>

    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">
        Réinitialiser mon mot de passe
      </a>
    </div>

    <p class="message" style="font-size: 14px; color: #8F96A3;">
      Ce lien est valable pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation,
      vous pouvez ignorer cet email en toute sécurité.
    </p>

    <hr class="divider">

    <p class="message" style="font-size: 13px; color: #8F96A3;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
      <a href="${resetUrl}" style="word-break: break-all;">${resetUrl}</a>
    </p>
  `;

  return sendEmail({
    to: user.email,
    subject: '🔐 Réinitialisation de votre mot de passe',
    html: baseTemplate(content, 'Réinitialisez votre mot de passe Cagnotte App')
  });
};

// ============================================
// EMAILS DE CONTRIBUTION
// ============================================

/**
 * Confirmation de contribution au contributeur
 */
exports.sendContributionConfirmation = async (contributor, campaign, contribution) => {
  const firstName = contributor.firstName || contributor.name || 'Généreux donateur';
  const amount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(contribution.amount);
  const progress = Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100);

  const content = `
    <p class="greeting">Merci ${firstName} ! 💚</p>
    <p class="message">
      Votre générosité fait la différence ! Grâce à vous, la campagne
      <strong>"${campaign.title}"</strong> se rapproche de son objectif.
    </p>

    <div class="highlight-box">
      <div class="label">Votre contribution</div>
      <div class="value">${amount}</div>
    </div>

    <table style="width: 100%; margin: 20px 0; border-collapse: separate; border-spacing: 10px 0;">
      <tr>
        <td style="background: #F8F9FA; padding: 15px; border-radius: 8px; text-align: center; width: 50%;">
          <div style="font-size: 24px; font-weight: 700; color: #0B4B36;">${progress}%</div>
          <div style="font-size: 12px; color: #5A6378; text-transform: uppercase;">Progression</div>
        </td>
        <td style="background: #F8F9FA; padding: 15px; border-radius: 8px; text-align: center; width: 50%;">
          <div style="font-size: 24px; font-weight: 700; color: #0B4B36;">${campaign.stats?.contributorsCount || 1}</div>
          <div style="font-size: 12px; color: #5A6378; text-transform: uppercase;">Contributeurs</div>
        </td>
      </tr>
    </table>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/campaigns/${campaign.slug || campaign._id}" class="btn">
        Voir la campagne
      </a>
    </div>

    <hr class="divider">

    <p class="message" style="font-size: 14px; text-align: center;">
      🔗 Partagez cette campagne pour l'aider à atteindre son objectif !
    </p>
  `;

  return sendEmail({
    to: contributor.email,
    subject: `💚 Merci pour votre contribution à "${campaign.title}"`,
    html: baseTemplate(content, `Vous avez contribué ${amount} à "${campaign.title}"`)
  });
};

/**
 * Notification au créateur d'une nouvelle contribution
 */
exports.sendNewContributionNotification = async (creator, campaign, contribution, contributor) => {
  const firstName = creator.firstName || creator.username || 'Créateur';
  const amount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(contribution.amount);
  const contributorName = contribution.anonymous ? 'Un donateur anonyme' :
    (contributor?.firstName || contributor?.name || 'Un généreux donateur');
  const totalCollected = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(campaign.currentAmount);
  const progress = Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100);

  const content = `
    <p class="greeting">Bonne nouvelle ${firstName} ! 🎊</p>
    <p class="message">
      ${contributorName} vient de contribuer à votre campagne
      <strong>"${campaign.title}"</strong> !
    </p>

    <div class="highlight-box">
      <div class="label">Nouvelle contribution</div>
      <div class="value">${amount}</div>
    </div>

    ${contribution.message ? `
      <div style="background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-style: italic; color: #5A6378;">
          "${contribution.message}"
        </p>
        <p style="margin: 10px 0 0; font-size: 13px; color: #8F96A3;">
          — ${contributorName}
        </p>
      </div>
    ` : ''}

    <table style="width: 100%; margin: 20px 0; border-collapse: separate; border-spacing: 10px 0;">
      <tr>
        <td style="background: #F8F9FA; padding: 15px; border-radius: 8px; text-align: center; width: 50%;">
          <div style="font-size: 24px; font-weight: 700; color: #0B4B36;">${totalCollected}</div>
          <div style="font-size: 12px; color: #5A6378; text-transform: uppercase;">Total collecté</div>
        </td>
        <td style="background: #F8F9FA; padding: 15px; border-radius: 8px; text-align: center; width: 50%;">
          <div style="font-size: 24px; font-weight: 700; color: #0B4B36;">${progress}%</div>
          <div style="font-size: 12px; color: #5A6378; text-transform: uppercase;">De l'objectif</div>
        </td>
      </tr>
    </table>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">
        Voir mon tableau de bord
      </a>
    </div>
  `;

  return sendEmail({
    to: creator.email,
    subject: `🎉 Nouvelle contribution de ${amount} sur "${campaign.title}"`,
    html: baseTemplate(content, `${contributorName} a contribué ${amount} à votre campagne`)
  });
};

// ============================================
// EMAILS DE CAMPAGNE
// ============================================

/**
 * Notification objectif atteint
 */
exports.sendCampaignGoalReached = async (creator, campaign) => {
  const firstName = creator.firstName || creator.username || 'Créateur';
  const totalCollected = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(campaign.currentAmount);

  const content = `
    <p class="greeting">🏆 Félicitations ${firstName} !</p>
    <p class="message" style="font-size: 18px;">
      Votre campagne <strong>"${campaign.title}"</strong> a atteint son objectif !
    </p>

    <div style="background: linear-gradient(135deg, #0B4B36 0%, #10B981 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 25px 0;">
      <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">OBJECTIF ATTEINT</div>
      <div style="font-size: 42px; font-weight: 700;">${totalCollected}</div>
      <div style="font-size: 14px; opacity: 0.9; margin-top: 10px;">
        grâce à ${campaign.stats?.contributorsCount || 0} contributeurs
      </div>
    </div>

    <p class="message">
      C'est un moment formidable ! Grâce à la générosité de tous vos contributeurs,
      vous allez pouvoir réaliser votre projet. N'oubliez pas de les remercier
      et de les tenir informés de la suite.
    </p>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/campaigns/${campaign._id}/update" class="btn">
        Publier une mise à jour
      </a>
    </div>

    <hr class="divider">

    <p class="message" style="font-size: 14px; text-align: center;">
      🙏 Pensez à remercier vos contributeurs avec une mise à jour !
    </p>
  `;

  return sendEmail({
    to: creator.email,
    subject: `🏆 Félicitations ! "${campaign.title}" a atteint son objectif !`,
    html: baseTemplate(content, `Votre campagne "${campaign.title}" a atteint son objectif de ${totalCollected} !`)
  });
};

/**
 * Notification campagne approuvée
 */
exports.sendCampaignApproved = async (creator, campaign) => {
  const firstName = creator.firstName || creator.username || 'Créateur';

  const content = `
    <p class="greeting">Bonne nouvelle ${firstName} ! ✅</p>
    <p class="message">
      Votre campagne <strong>"${campaign.title}"</strong> a été approuvée
      et est maintenant visible par tous !
    </p>

    <div class="highlight-box">
      <p style="margin: 0;">Votre campagne est maintenant active. Voici quelques conseils pour maximiser son succès :</p>
      <ul style="color: #5A6378; margin-top: 10px;">
        <li>Partagez-la sur vos réseaux sociaux</li>
        <li>Envoyez le lien à vos proches</li>
        <li>Publiez des mises à jour régulières</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/campaigns/${campaign.slug || campaign._id}" class="btn">
        Voir ma campagne
      </a>
    </div>
  `;

  return sendEmail({
    to: creator.email,
    subject: `✅ Votre campagne "${campaign.title}" est maintenant en ligne !`,
    html: baseTemplate(content, `Votre campagne "${campaign.title}" a été approuvée`)
  });
};

/**
 * Notification campagne expire bientôt
 */
exports.sendCampaignExpiringSoon = async (creator, campaign, daysLeft) => {
  const firstName = creator.firstName || creator.username || 'Créateur';
  const totalCollected = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(campaign.currentAmount);
  const goal = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(campaign.goalAmount);
  const remaining = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(campaign.goalAmount - campaign.currentAmount);

  const content = `
    <p class="greeting">⏰ Rappel important ${firstName}</p>
    <p class="message">
      Votre campagne <strong>"${campaign.title}"</strong> se termine dans
      <strong>${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong> !
    </p>

    <table style="width: 100%; margin: 20px 0; border-collapse: separate; border-spacing: 10px 0;">
      <tr>
        <td style="background: #F8F9FA; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: #0B4B36;">${totalCollected}</div>
          <div style="font-size: 12px; color: #5A6378;">Collectés sur ${goal}</div>
        </td>
        <td style="background: #FEF3CD; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: 700; color: #856404;">${remaining}</div>
          <div style="font-size: 12px; color: #856404;">Restants</div>
        </td>
      </tr>
    </table>

    <p class="message">
      C'est le moment de faire un dernier effort ! Partagez votre campagne
      une dernière fois pour atteindre votre objectif.
    </p>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/campaigns/${campaign.slug || campaign._id}" class="btn">
        Partager ma campagne
      </a>
    </div>
  `;

  return sendEmail({
    to: creator.email,
    subject: `⏰ Plus que ${daysLeft} jour${daysLeft > 1 ? 's' : ''} pour "${campaign.title}"`,
    html: baseTemplate(content, `Votre campagne "${campaign.title}" expire dans ${daysLeft} jours`)
  });
};

/**
 * Notification campagne terminée
 */
exports.sendCampaignEnded = async (creator, campaign) => {
  const firstName = creator.firstName || creator.username || 'Créateur';
  const totalCollected = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(campaign.currentAmount);
  const goal = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(campaign.goalAmount);
  const isSuccessful = campaign.currentAmount >= campaign.goalAmount;

  const content = `
    <p class="greeting">${isSuccessful ? '🎉' : '📊'} ${firstName},</p>
    <p class="message">
      Votre campagne <strong>"${campaign.title}"</strong> est maintenant terminée.
    </p>

    <div style="background: ${isSuccessful ? 'linear-gradient(135deg, #0B4B36 0%, #10B981 100%)' : '#F8F9FA'};
                color: ${isSuccessful ? 'white' : '#1A1F2C'};
                padding: 30px; border-radius: 12px; text-align: center; margin: 25px 0;">
      <div style="font-size: 14px; ${isSuccessful ? 'opacity: 0.9;' : 'color: #5A6378;'} margin-bottom: 10px;">
        ${isSuccessful ? 'OBJECTIF ATTEINT' : 'RÉSULTAT FINAL'}
      </div>
      <div style="font-size: 42px; font-weight: 700;">${totalCollected}</div>
      <div style="font-size: 14px; ${isSuccessful ? 'opacity: 0.9;' : 'color: #5A6378;'} margin-top: 10px;">
        sur ${goal} · ${campaign.stats?.contributorsCount || 0} contributeurs
      </div>
    </div>

    ${isSuccessful ? `
      <p class="message">
        Félicitations ! Vous avez atteint votre objectif grâce à la générosité de vos contributeurs.
        N'oubliez pas de les remercier et de les tenir informés de l'avancement de votre projet.
      </p>
    ` : `
      <p class="message">
        Même si l'objectif n'a pas été atteint, chaque contribution compte !
        Vous pouvez contacter notre équipe pour discuter des options disponibles.
      </p>
    `}

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">
        Voir mon tableau de bord
      </a>
    </div>
  `;

  return sendEmail({
    to: creator.email,
    subject: `${isSuccessful ? '🎉' : '📊'} Votre campagne "${campaign.title}" est terminée`,
    html: baseTemplate(content, `Votre campagne "${campaign.title}" a collecté ${totalCollected}`)
  });
};

// ============================================
// EMAILS DE MISE À JOUR
// ============================================

/**
 * Notification nouvelle mise à jour aux contributeurs
 */
exports.sendCampaignUpdateNotification = async (contributor, campaign, update) => {
  const firstName = contributor.firstName || contributor.name || 'Contributeur';

  const content = `
    <p class="greeting">Bonjour ${firstName} ! 📢</p>
    <p class="message">
      Le créateur de la campagne <strong>"${campaign.title}"</strong>
      que vous avez soutenue vient de publier une mise à jour.
    </p>

    <div style="background: #F8F9FA; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin: 0 0 10px; color: #0B4B36;">${update.title || 'Nouvelle mise à jour'}</h3>
      <p style="margin: 0; color: #5A6378;">
        ${update.content ? update.content.substring(0, 200) + (update.content.length > 200 ? '...' : '') : ''}
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/campaigns/${campaign.slug || campaign._id}" class="btn">
        Lire la mise à jour complète
      </a>
    </div>
  `;

  return sendEmail({
    to: contributor.email,
    subject: `📢 Nouvelle mise à jour sur "${campaign.title}"`,
    html: baseTemplate(content, `Nouvelle mise à jour sur la campagne "${campaign.title}"`)
  });
};

/**
 * Initialiser le service email au démarrage
 * Permet de créer le compte Ethereal une seule fois
 */
const initEmailService = async () => {
  await initTransporter();
};

/**
 * Obtenir les informations du compte de test (Ethereal)
 * Utile pour le debugging
 */
const getTestAccountInfo = () => {
  if (etherealAccount) {
    return {
      user: etherealAccount.user,
      pass: etherealAccount.pass,
      webUrl: 'https://ethereal.email/login'
    };
  }
  return null;
};

module.exports = {
  initEmailService,
  getTestAccountInfo,
  sendEmail,
  sendWelcomeEmail: exports.sendWelcomeEmail,
  sendPasswordResetEmail: exports.sendPasswordResetEmail,
  sendContributionConfirmation: exports.sendContributionConfirmation,
  sendNewContributionNotification: exports.sendNewContributionNotification,
  sendCampaignGoalReached: exports.sendCampaignGoalReached,
  sendCampaignApproved: exports.sendCampaignApproved,
  sendCampaignExpiringSoon: exports.sendCampaignExpiringSoon,
  sendCampaignEnded: exports.sendCampaignEnded,
  sendCampaignUpdateNotification: exports.sendCampaignUpdateNotification
};
