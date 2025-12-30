const Campaign = require('../models/Campaign');
const { getFileUrl, getFullFileUrl, deleteFile } = require('../middlewares/upload');
const path = require('path');

// Upload d'image temporaire (avant création de campagne)
// L'image est uploadée et retourne une URL qui peut être utilisée dans le formulaire de création
exports.uploadTempImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    // Construire l'URL de l'image
    const imageUrl = getFileUrl(req.file.filename, 'campaigns');
    const fullUrl = getFullFileUrl(req.file.filename, 'campaigns');

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        imageUrl: imageUrl,
        fullUrl: fullUrl,
        size: req.file.size,
        processed: req.file.processed || false
      },
      message: 'Image uploadée avec succès'
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (req.file) {
      deleteFile(req.file.filename);
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Upload d'image principale pour une campagne existante
exports.uploadCampaignMainImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      // Supprimer le fichier uploadé si la campagne n'existe pas
      deleteFile(req.file.filename);
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    // Vérifier les permissions
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      // Supprimer le fichier uploadé si non autorisé
      deleteFile(req.file.filename);
      return res.status(403).json({
        success: false,
        error: 'Non autorisé'
      });
    }

    // Supprimer l'ancienne image si elle existe
    if (campaign.images && campaign.images.mainImage) {
      const oldImage = campaign.images.mainImage;
      // Ne supprimer que si c'est un fichier local (pas une URL externe)
      if (!oldImage.startsWith('http://') && !oldImage.startsWith('https://')) {
        deleteFile(oldImage);
      }
    }

    // Mettre à jour l'image principale
    const imageUrl = getFileUrl(req.file.filename, 'campaigns');
    campaign.images = campaign.images || {};
    campaign.images.mainImage = imageUrl;
    
    await campaign.save();

    res.json({
      success: true,
      data: {
        imageUrl: imageUrl,
        campaign: campaign
      },
      message: 'Image principale uploadée avec succès'
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (req.file) {
      deleteFile(req.file.filename);
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Upload de plusieurs images pour la galerie d'une campagne
exports.uploadCampaignGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      // Supprimer tous les fichiers uploadés
      req.files.forEach(file => deleteFile(file.filename));
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    // Vérifier les permissions
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      // Supprimer tous les fichiers uploadés
      req.files.forEach(file => deleteFile(file.filename));
      return res.status(403).json({
        success: false,
        error: 'Non autorisé'
      });
    }

    // Initialiser la galerie si elle n'existe pas
    if (!campaign.images) {
      campaign.images = {};
    }
    if (!campaign.images.gallery) {
      campaign.images.gallery = [];
    }

    // Ajouter les nouvelles images à la galerie
    const uploadedImages = req.files.map((file, index) => ({
      url: getFileUrl(file.filename, 'campaigns'),
      caption: req.body.captions && req.body.captions[index] ? req.body.captions[index] : '',
      order: campaign.images.gallery.length + index
    }));

    campaign.images.gallery = [...campaign.images.gallery, ...uploadedImages];
    await campaign.save();

    res.json({
      success: true,
      data: {
        images: uploadedImages,
        campaign: campaign
      },
      message: `${uploadedImages.length} image(s) ajoutée(s) à la galerie avec succès`
    });
  } catch (error) {
    // Supprimer tous les fichiers en cas d'erreur
    if (req.files) {
      req.files.forEach(file => deleteFile(file.filename));
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Supprimer une image de la galerie
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { campaignId, imageId } = req.params;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    // Vérifier les permissions
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé'
      });
    }

    if (!campaign.images || !campaign.images.gallery) {
      return res.status(404).json({
        success: false,
        error: 'Galerie non trouvée'
      });
    }

    // Trouver l'image à supprimer
    const imageIndex = campaign.images.gallery.findIndex(
      img => img._id && img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Image non trouvée dans la galerie'
      });
    }

    const imageToDelete = campaign.images.gallery[imageIndex];
    
    // Supprimer le fichier du système de fichiers
    if (imageToDelete.url) {
      deleteFile(imageToDelete.url);
    }

    // Supprimer l'image de la galerie
    campaign.images.gallery.splice(imageIndex, 1);
    
    // Réorganiser les ordres
    campaign.images.gallery.forEach((img, index) => {
      img.order = index;
    });

    await campaign.save();

    res.json({
      success: true,
      message: 'Image supprimée de la galerie avec succès',
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Supprimer l'image principale
exports.deleteMainImage = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campagne non trouvée'
      });
    }

    // Vérifier les permissions
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé'
      });
    }

    if (!campaign.images || !campaign.images.mainImage) {
      return res.status(404).json({
        success: false,
        error: 'Image principale non trouvée'
      });
    }

    // Supprimer le fichier
    deleteFile(campaign.images.mainImage);

    // Réinitialiser à l'image par défaut
    campaign.images.mainImage = '/uploads/campaigns/default-campaign.jpg';
    await campaign.save();

    res.json({
      success: true,
      message: 'Image principale supprimée avec succès',
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
