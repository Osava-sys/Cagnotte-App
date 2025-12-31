/**
 * Tâches planifiées pour la gestion automatique des campagnes
 */

const Campaign = require('../models/Campaign');
const Contribution = require('../models/Contribution');

// Configuration
const CLEANUP_CONFIG = {
  // Délai avant suppression des campagnes expirées (en jours)
  EXPIRED_CAMPAIGN_RETENTION_DAYS: 30,
  // Délai avant suppression des brouillons abandonnés (en jours)
  ABANDONED_DRAFT_DAYS: 90,
  // Intervalle d'exécution (en millisecondes) - 1 heure
  CLEANUP_INTERVAL: 60 * 60 * 1000,
  // Intervalle de vérification des expirations (en millisecondes) - 15 minutes
  EXPIRATION_CHECK_INTERVAL: 15 * 60 * 1000
};

/**
 * Marquer les campagnes expirées
 * Met à jour le statut des campagnes actives dont la date de fin est passée
 */
const markExpiredCampaigns = async () => {
  try {
    const now = new Date();

    const result = await Campaign.updateMany(
      {
        status: 'active',
        endDate: { $lt: now }
      },
      {
        $set: {
          status: 'expired',
          updatedAt: now
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[SCHEDULER] ${result.modifiedCount} campagne(s) marquée(s) comme expirée(s)`);
    }

    return result.modifiedCount;
  } catch (error) {
    console.error('[SCHEDULER] Erreur lors du marquage des campagnes expirées:', error.message);
    return 0;
  }
};

/**
 * Supprimer les campagnes expirées anciennes
 * Supprime les campagnes expirées depuis plus de X jours (configurable)
 */
const deleteOldExpiredCampaigns = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_CONFIG.EXPIRED_CAMPAIGN_RETENTION_DAYS);

    // Trouver les campagnes à supprimer
    const campaignsToDelete = await Campaign.find({
      status: 'expired',
      endDate: { $lt: cutoffDate },
      // Ne pas supprimer les campagnes qui ont collecté des fonds
      currentAmount: { $lte: 0 }
    }).select('_id title');

    if (campaignsToDelete.length === 0) {
      return 0;
    }

    const campaignIds = campaignsToDelete.map(c => c._id);

    // Supprimer les contributions associées
    await Contribution.deleteMany({ campaign: { $in: campaignIds } });

    // Supprimer les campagnes
    const result = await Campaign.deleteMany({ _id: { $in: campaignIds } });

    console.log(`[SCHEDULER] ${result.deletedCount} campagne(s) expirée(s) supprimée(s) (sans fonds collectés, expirées depuis ${CLEANUP_CONFIG.EXPIRED_CAMPAIGN_RETENTION_DAYS} jours)`);

    return result.deletedCount;
  } catch (error) {
    console.error('[SCHEDULER] Erreur lors de la suppression des campagnes expirées:', error.message);
    return 0;
  }
};

/**
 * Supprimer les brouillons abandonnés
 * Supprime les brouillons non modifiés depuis X jours
 */
const deleteAbandonedDrafts = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_CONFIG.ABANDONED_DRAFT_DAYS);

    const result = await Campaign.deleteMany({
      status: 'draft',
      updatedAt: { $lt: cutoffDate }
    });

    if (result.deletedCount > 0) {
      console.log(`[SCHEDULER] ${result.deletedCount} brouillon(s) abandonné(s) supprimé(s) (non modifiés depuis ${CLEANUP_CONFIG.ABANDONED_DRAFT_DAYS} jours)`);
    }

    return result.deletedCount;
  } catch (error) {
    console.error('[SCHEDULER] Erreur lors de la suppression des brouillons abandonnés:', error.message);
    return 0;
  }
};

/**
 * Exécuter toutes les tâches de nettoyage
 */
const runCleanupTasks = async () => {
  console.log('[SCHEDULER] Début du nettoyage automatique...');

  const expiredMarked = await markExpiredCampaigns();
  const expiredDeleted = await deleteOldExpiredCampaigns();
  const draftsDeleted = await deleteAbandonedDrafts();

  const totalActions = expiredMarked + expiredDeleted + draftsDeleted;

  if (totalActions > 0) {
    console.log(`[SCHEDULER] Nettoyage terminé: ${expiredMarked} expirées, ${expiredDeleted} supprimées, ${draftsDeleted} brouillons supprimés`);
  }

  return {
    expiredMarked,
    expiredDeleted,
    draftsDeleted
  };
};

/**
 * Obtenir les statistiques de nettoyage
 */
const getCleanupStats = async () => {
  try {
    const now = new Date();
    const retentionCutoff = new Date();
    retentionCutoff.setDate(retentionCutoff.getDate() - CLEANUP_CONFIG.EXPIRED_CAMPAIGN_RETENTION_DAYS);

    const draftCutoff = new Date();
    draftCutoff.setDate(draftCutoff.getDate() - CLEANUP_CONFIG.ABANDONED_DRAFT_DAYS);

    const [
      activeCampaigns,
      expiredCampaigns,
      draftCampaigns,
      pendingExpiration,
      scheduledForDeletion,
      abandonedDrafts
    ] = await Promise.all([
      Campaign.countDocuments({ status: 'active' }),
      Campaign.countDocuments({ status: 'expired' }),
      Campaign.countDocuments({ status: 'draft' }),
      Campaign.countDocuments({ status: 'active', endDate: { $lt: now } }),
      Campaign.countDocuments({
        status: 'expired',
        endDate: { $lt: retentionCutoff },
        currentAmount: { $lte: 0 }
      }),
      Campaign.countDocuments({ status: 'draft', updatedAt: { $lt: draftCutoff } })
    ]);

    return {
      activeCampaigns,
      expiredCampaigns,
      draftCampaigns,
      pendingExpiration,
      scheduledForDeletion,
      abandonedDrafts,
      config: {
        retentionDays: CLEANUP_CONFIG.EXPIRED_CAMPAIGN_RETENTION_DAYS,
        draftRetentionDays: CLEANUP_CONFIG.ABANDONED_DRAFT_DAYS
      }
    };
  } catch (error) {
    console.error('[SCHEDULER] Erreur lors de la récupération des stats:', error.message);
    return null;
  }
};

// Variables pour stocker les intervalles
let cleanupInterval = null;
let expirationInterval = null;

/**
 * Démarrer les tâches planifiées
 */
const startScheduledTasks = () => {
  console.log('[SCHEDULER] Démarrage des tâches planifiées...');

  // Exécuter immédiatement au démarrage
  markExpiredCampaigns();

  // Vérification des expirations toutes les 15 minutes
  expirationInterval = setInterval(markExpiredCampaigns, CLEANUP_CONFIG.EXPIRATION_CHECK_INTERVAL);

  // Nettoyage complet toutes les heures
  cleanupInterval = setInterval(runCleanupTasks, CLEANUP_CONFIG.CLEANUP_INTERVAL);

  console.log(`[SCHEDULER] Tâches planifiées démarrées:
  - Vérification expirations: toutes les ${CLEANUP_CONFIG.EXPIRATION_CHECK_INTERVAL / 60000} minutes
  - Nettoyage complet: toutes les ${CLEANUP_CONFIG.CLEANUP_INTERVAL / 60000} minutes
  - Rétention campagnes expirées: ${CLEANUP_CONFIG.EXPIRED_CAMPAIGN_RETENTION_DAYS} jours
  - Rétention brouillons: ${CLEANUP_CONFIG.ABANDONED_DRAFT_DAYS} jours`);
};

/**
 * Arrêter les tâches planifiées
 */
const stopScheduledTasks = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  if (expirationInterval) {
    clearInterval(expirationInterval);
    expirationInterval = null;
  }
  console.log('[SCHEDULER] Tâches planifiées arrêtées');
};

module.exports = {
  startScheduledTasks,
  stopScheduledTasks,
  markExpiredCampaigns,
  deleteOldExpiredCampaigns,
  deleteAbandonedDrafts,
  runCleanupTasks,
  getCleanupStats,
  CLEANUP_CONFIG
};
