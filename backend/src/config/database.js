const mongoose = require('mongoose');
const logger = require('./logger');
const config = require('./env');

const connectDB = async () => {
  try {
    if (!config.mongoURI) {
      throw new Error('MONGODB_URI manquant. Vérifiez votre fichier .env');
    }

    const conn = await mongoose.connect(config.mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(` MongoDB Connecté: ${conn.connection.host}`);
    logger.info(` Base de données: ${conn.connection.name}`);

    // Événements de connexion
    mongoose.connection.on('error', (err) => {
      logger.error(` Erreur MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn(' MongoDB déconnecté');
    });

    // Gestion de la fermeture propre
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info(' MongoDB déconnecté (SIGINT)');
      process.exit(0);
    });

  } catch (error) {
    logger.error(`Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;