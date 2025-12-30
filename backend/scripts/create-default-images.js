/**
 * Script pour créer les images par défaut
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
const campaignsDir = path.join(uploadsDir, 'campaigns');
const avatarsDir = path.join(uploadsDir, 'avatars');

// Créer les dossiers si nécessaire
[uploadsDir, campaignsDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function createDefaultCampaignImage() {
  const width = 800;
  const height = 500;
  
  // Créer une image avec un dégradé vert
  const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0B4B36;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0D5A42;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dy="0.35em">🎁</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle" dy="0.35em">Image de campagne</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svgImage))
    .jpeg({ quality: 90 })
    .toFile(path.join(campaignsDir, 'default-campaign.jpg'));
  
  console.log('✅ Image par défaut de campagne créée: default-campaign.jpg');
}

async function createDefaultAvatarImage() {
  const size = 200;
  
  // Créer un avatar par défaut
  const svgImage = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0B4B36;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2A9D8F;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#avatarGrad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" fill="white" text-anchor="middle" dy="0.35em">👤</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svgImage))
    .png()
    .toFile(path.join(avatarsDir, 'default-avatar.png'));
  
  console.log('✅ Avatar par défaut créé: default-avatar.png');
}

async function main() {
  try {
    console.log('🖼️  Création des images par défaut...\n');
    await createDefaultCampaignImage();
    await createDefaultAvatarImage();
    console.log('\n✨ Toutes les images par défaut ont été créées!');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();

