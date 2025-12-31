const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const uploadController = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateCampaign } = require('../middlewares/validation');
const { uploadCampaignImage, uploadCampaignGallery, handleUploadError } = require('../middlewares/upload');

// Public routes
router.get('/', campaignController.getAllCampaigns);
router.get('/search', campaignController.searchCampaigns);
router.get('/stats', campaignController.getCampaignStats);
router.get('/:id', campaignController.getCampaignById);

// Track campaign share (public - no auth required)
router.post('/:id/share', campaignController.trackShare);

// Protected routes
router.post('/', authenticate, validateCampaign, campaignController.createCampaign);
router.put('/:id', authenticate, campaignController.updateCampaign);
router.delete('/:id', authenticate, campaignController.deleteCampaign);

// Campaign updates (notify contributors)
router.post('/:id/updates', authenticate, campaignController.addCampaignUpdate);

// ===========================================
// UPLOAD ROUTES
// ===========================================

// Upload temporaire d'image (avant création de campagne)
// Retourne une URL temporaire qui sera utilisée lors de la création
router.post(
  '/upload/temp',
  authenticate,
  uploadCampaignImage,
  handleUploadError,
  uploadController.uploadTempImage
);

// Upload d'image principale pour une campagne existante
router.post(
  '/:id/image',
  authenticate,
  uploadCampaignImage,
  handleUploadError,
  uploadController.uploadCampaignMainImage
);

// Upload de galerie pour une campagne existante
router.post(
  '/:id/gallery',
  authenticate,
  uploadCampaignGallery,
  handleUploadError,
  uploadController.uploadCampaignGallery
);

// Supprimer une image de la galerie
router.delete(
  '/:campaignId/gallery/:imageId',
  authenticate,
  uploadController.deleteGalleryImage
);

// Supprimer l'image principale
router.delete(
  '/:id/image',
  authenticate,
  uploadController.deleteMainImage
);

// ===========================================
// ADMIN ROUTES
// ===========================================
router.put('/:id/feature', authenticate, authorize('admin', 'moderator'), campaignController.featureCampaign);
router.put('/:id/verify', authenticate, authorize('admin', 'moderator'), campaignController.verifyCampaign);

module.exports = router;