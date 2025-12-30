const mongoose = require('mongoose');
const { User, Campaign, Contribution } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB pour le seeding');

    // Nettoyer les collections
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Contribution.deleteMany({});
    console.log('🗑️  Collections nettoyées');

    // Créer un admin
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await User.create({
      email: 'admin@cagnotte.fr',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    console.log('👑 Admin créé');

    // Créer des utilisateurs test
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const password = await bcrypt.hash(`User${i}123!`, 12);
      const user = await User.create({
        email: `user${i}@test.fr`,
        password,
        firstName: `Prénom${i}`,
        lastName: `Nom${i}`,
        role: 'user',
        isVerified: Math.random() > 0.5,
        address: {
          city: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux'][i % 5],
          country: 'France'
        }
      });
      users.push(user);
    }
    console.log(`👥 ${users.length} utilisateurs créés`);

    // Créer des campagnes test
    const categories = ['sante', 'education', 'projet', 'urgence', 'environnement', 'culture', 'sport'];
    const campaigns = [];

    for (let i = 1; i <= 10; i++) {
      const creator = users[Math.floor(Math.random() * users.length)];
      const goalAmount = Math.floor(Math.random() * 10000) + 1000;
      const currentAmount = Math.floor(Math.random() * goalAmount);
      
      const campaign = await Campaign.create({
        title: `Campagne de test ${i} - ${categories[i % categories.length]}`,
        slug: `campagne-test-${i}`,
        description: `Description détaillée de la campagne test ${i}. Ce projet vise à soutenir une cause importante dans la catégorie ${categories[i % categories.length]}.`,
        shortDescription: `Soutenez notre projet ${i}`,
        goalAmount,
        currentAmount,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        creator: creator._id,
        category: categories[i % categories.length],
        tags: ['solidarité', 'entraide', 'test'],
        location: {
          city: creator.address.city,
          country: 'France'
        },
        status: ['draft', 'pending', 'active', 'successful'][Math.floor(Math.random() * 4)],
        isFeatured: i <= 3,
        stats: {
          contributorsCount: Math.floor(Math.random() * 100),
          views: Math.floor(Math.random() * 1000)
        }
      });
      campaigns.push(campaign);
    }
    console.log(`🎯 ${campaigns.length} campagnes créées`);

    // Créer des contributions test
    const contributions = [];
    for (let i = 1; i <= 50; i++) {
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const contributor = users[Math.floor(Math.random() * users.length)];
      const amount = Math.floor(Math.random() * 500) + 10;
      
      const contribution = await Contribution.create({
        amount,
        isAnonymous: Math.random() > 0.7,
        contributor: {
          userId: contributor._id,
          name: `${contributor.firstName} ${contributor.lastName}`,
          email: contributor.email,
          message: `Message de soutien ${i}`
        },
        campaign: campaign._id,
        payment: {
          method: ['stripe', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 3)],
          transactionId: `txn_${Date.now()}_${i}`,
          status: 'completed',
          fees: amount * 0.03,
          netAmount: amount * 0.97
        },
        status: 'confirmed',
        platformFee: amount * 0.05
      });
      contributions.push(contribution);
    }
    console.log(`💰 ${contributions.length} contributions créées`);

    // Mettre à jour les montants des campagnes
    for (const campaign of campaigns) {
      const campaignContributions = contributions.filter(c => 
        c.campaign.toString() === campaign._id.toString()
      );
      const totalAmount = campaignContributions.reduce((sum, c) => sum + c.amount, 0);
      const contributorsCount = new Set(
        campaignContributions.map(c => c.contributor.userId.toString())
      ).size;
      
      await Campaign.findByIdAndUpdate(campaign._id, {
        currentAmount: totalAmount,
        'stats.contributorsCount': contributorsCount,
        'stats.averageContribution': totalAmount / (contributorsCount || 1)
      });
    }
    console.log('📊 Campagnes mises à jour avec les contributions');

    // Afficher les statistiques finales
    const userStats = await User.getStatistics();
    const campaignStats = await Campaign.getStatistics();
    const contributionStats = await Contribution.getStatistics();

    console.log('\n📈 Statistiques Finales:');
    console.log('=====================');
    console.log(`Utilisateurs: ${userStats.totalUsers}`);
    console.log(`Campagnes: ${campaignStats.totalCampaigns}`);
    console.log(`Campagnes actives: ${campaignStats.activeCampaigns}`);
    console.log(`Campagnes réussies: ${campaignStats.successfulCampaigns}`);
    console.log(`Montant total collecté: ${campaignStats.totalCurrentAmount}€`);
    console.log(`Objectif total: ${campaignStats.totalGoalAmount}€`);
    console.log(`Progression globale: ${campaignStats.overallProgress.toFixed(2)}%`);
    console.log(`Contributions: ${contributionStats.totalContributions}`);
    console.log(`Montant total des contributions: ${contributionStats.totalAmount}€`);
    console.log(`Frais de plateforme: ${contributionStats.totalPlatformFees.toFixed(2)}€`);

    console.log('\n✅ Base de données seedée avec succès!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

// Exécuter le seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;