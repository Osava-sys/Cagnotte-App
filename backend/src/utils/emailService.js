// Email service configuration
// This is a placeholder - implement with your preferred email service (Nodemailer, SendGrid, etc.)

const sendEmail = async (to, subject, html) => {
  try {
    // TODO: Implement email sending logic
    // Example with Nodemailer:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({ to, subject, html });
    
    console.log(`Email would be sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

exports.sendWelcomeEmail = async (user) => {
  const subject = 'Bienvenue sur Cagnotte App';
  const html = `
    <h1>Bienvenue ${user.username}!</h1>
    <p>Merci de vous être inscrit sur notre plateforme.</p>
  `;
  return await sendEmail(user.email, subject, html);
};

exports.sendContributionConfirmation = async (user, campaign, contribution) => {
  const subject = 'Confirmation de votre contribution';
  const html = `
    <h1>Merci pour votre contribution!</h1>
    <p>Vous avez contribué ${contribution.amount}€ à la campagne "${campaign.title}".</p>
  `;
  return await sendEmail(user.email, subject, html);
};

exports.sendCampaignGoalReached = async (creator, campaign) => {
  const subject = 'Objectif atteint!';
  const html = `
    <h1>Félicitations!</h1>
    <p>Votre campagne "${campaign.title}" a atteint son objectif!</p>
  `;
  return await sendEmail(creator.email, subject, html);
};

