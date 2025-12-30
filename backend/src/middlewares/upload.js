/**
 * Middleware d'upload amélioré avec compression et validation
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');
const config = require('../config/env');

// Créer les dossiers uploads s'ils n'existent pas
const uploadsDir = path.join(__dirname, '../../', config.uploadsDir);
const campaignsDir = path.join(uploadsDir, 'campaigns');
const avatarsDir = path.join(uploadsDir, 'avatars');
const tempDir = path.join(uploadsDir, 'temp');

[uploadsDir, campaignsDir, avatarsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage temporaire (on traite ensuite avec sharp)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom unique sécurisé
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    // Nettoyer le nom original
    const baseName = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    cb(null, `${baseName}-${timestamp}-${uniqueId}${ext}`);
  }
});

// Filtre strict pour les types de fichiers
const fileFilter = (req, file, cb) => {
  // Types MIME autorisés
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  // Extensions autorisées
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Types acceptés: JPG, PNG, GIF, WebP`), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB max
    files: 10
  },
  fileFilter: fileFilter
});

// Fonction pour optimiser et redimensionner une image
const processImage = async (inputPath, outputPath, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'jpeg'
  } = options;

  try {
    let sharpInstance = sharp(inputPath);
    
    // Obtenir les métadonnées
    const metadata = await sharpInstance.metadata();
    
    // Redimensionner si nécessaire
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Appliquer la rotation auto basée sur EXIF
    sharpInstance = sharpInstance.rotate();
    
    // Convertir et compresser selon le format
    if (format === 'webp') {
      await sharpInstance
        .webp({ quality: quality })
        .toFile(outputPath);
    } else if (format === 'png') {
      await sharpInstance
        .png({ quality: quality, compressionLevel: 8 })
        .toFile(outputPath);
    } else {
      // JPEG par défaut
      await sharpInstance
        .jpeg({ quality: quality, mozjpeg: true })
        .toFile(outputPath);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image:', error);
    throw error;
  }
};

// Middleware pour traiter l'image après upload
const processUploadedImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const tempPath = req.file.path;
    const ext = path.extname(req.file.filename).toLowerCase();
    
    // Déterminer le format de sortie
    let outputFormat = 'jpeg';
    let outputExt = '.jpg';
    
    if (ext === '.png') {
      outputFormat = 'png';
      outputExt = '.png';
    } else if (ext === '.webp') {
      outputFormat = 'webp';
      outputExt = '.webp';
    } else if (ext === '.gif') {
      // Pour les GIFs, on garde le format pour préserver l'animation
      // Mais on vérifie la taille
      const stats = fs.statSync(tempPath);
      if (stats.size <= config.maxFileSize) {
        const finalFilename = req.file.filename;
        const finalPath = path.join(campaignsDir, finalFilename);
        fs.renameSync(tempPath, finalPath);
        req.file.filename = finalFilename;
        req.file.path = finalPath;
        req.file.processed = true;
        return next();
      }
    }
    
    // Nouveau nom avec extension correcte
    const baseName = path.basename(req.file.filename, ext);
    const finalFilename = `${baseName}${outputExt}`;
    const finalPath = path.join(campaignsDir, finalFilename);
    
    // Traiter l'image
    await processImage(tempPath, finalPath, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: outputFormat
    });
    
    // Supprimer le fichier temporaire
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    // Mettre à jour les infos du fichier
    req.file.filename = finalFilename;
    req.file.path = finalPath;
    req.file.processed = true;
    
    // Obtenir la nouvelle taille
    const stats = fs.statSync(finalPath);
    req.file.size = stats.size;
    
    next();
  } catch (error) {
    // Nettoyer en cas d'erreur
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// Middleware pour traiter plusieurs images
const processUploadedImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const processedFiles = [];
    
    for (const file of req.files) {
      const tempPath = file.path;
      const ext = path.extname(file.filename).toLowerCase();
      
      // Déterminer le format de sortie
      let outputFormat = 'jpeg';
      let outputExt = '.jpg';
      
      if (ext === '.png') {
        outputFormat = 'png';
        outputExt = '.png';
      } else if (ext === '.webp') {
        outputFormat = 'webp';
        outputExt = '.webp';
      }
      
      const baseName = path.basename(file.filename, ext);
      const finalFilename = `${baseName}${outputExt}`;
      const finalPath = path.join(campaignsDir, finalFilename);
      
      await processImage(tempPath, finalPath, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 80,
        format: outputFormat
      });
      
      // Supprimer le fichier temporaire
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      // Mettre à jour les infos
      file.filename = finalFilename;
      file.path = finalPath;
      file.processed = true;
      
      const stats = fs.statSync(finalPath);
      file.size = stats.size;
      
      processedFiles.push(file);
    }
    
    req.files = processedFiles;
    next();
  } catch (error) {
    // Nettoyer en cas d'erreur
    if (req.files) {
      req.files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};

// Middleware pour upload d'une seule image (image principale de campagne)
exports.uploadCampaignImage = [
  upload.single('image'),
  processUploadedImage
];

// Middleware pour upload de plusieurs images (galerie de campagne)
exports.uploadCampaignGallery = [
  upload.array('gallery', 10),
  processUploadedImages
];

// Middleware pour upload d'avatar utilisateur
exports.uploadAvatar = [
  upload.single('avatar'),
  async (req, res, next) => {
    if (!req.file) return next();
    
    try {
      const tempPath = req.file.path;
      const baseName = path.basename(req.file.filename, path.extname(req.file.filename));
      const finalFilename = `${baseName}.jpg`;
      const finalPath = path.join(avatarsDir, finalFilename);
      
      // Pour les avatars, on redimensionne plus petit
      await processImage(tempPath, finalPath, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 90,
        format: 'jpeg'
      });
      
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      req.file.filename = finalFilename;
      req.file.path = finalPath;
      req.file.processed = true;
      
      next();
    } catch (error) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
];

// Middleware pour gérer les erreurs d'upload
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const errorMessages = {
      'LIMIT_FILE_SIZE': `Fichier trop volumineux. Taille maximale: ${(config.maxFileSize || 10 * 1024 * 1024) / (1024 * 1024)}MB`,
      'LIMIT_FILE_COUNT': 'Trop de fichiers. Maximum 10 images autorisées.',
      'LIMIT_UNEXPECTED_FILE': 'Champ de fichier inattendu.',
      'LIMIT_PART_COUNT': 'Trop de parties dans la requête.'
    };
    
    return res.status(400).json({
      success: false,
      error: errorMessages[err.code] || `Erreur d'upload: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Erreur lors de l\'upload'
    });
  }
  
  next();
};

// Fonction utilitaire pour obtenir l'URL d'un fichier uploadé
exports.getFileUrl = (filename, type = 'campaigns') => {
  if (!filename) return null;
  
  // Si c'est déjà une URL complète, la retourner
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Si c'est déjà un chemin relatif complet
  if (filename.startsWith('/uploads/')) {
    return filename;
  }
  
  // Construire l'URL relative
  return `/uploads/${type}/${filename}`;
};

// Fonction pour construire l'URL complète (avec le domaine)
exports.getFullFileUrl = (filename, type = 'campaigns') => {
  const relativePath = exports.getFileUrl(filename, type);
  if (!relativePath || relativePath.startsWith('http')) {
    return relativePath;
  }
  const baseUrl = config.backendUrl || `http://localhost:${config.port}`;
  return `${baseUrl}${relativePath}`;
};

// Fonction pour supprimer un fichier
exports.deleteFile = (filepath) => {
  if (!filepath) return;
  
  try {
    // Si c'est une URL externe, ne rien faire
    if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
      return;
    }
    
    let fullPath;
    
    // Si c'est un chemin absolu
    if (path.isAbsolute(filepath)) {
      fullPath = filepath;
    }
    // Si c'est une URL relative (/uploads/campaigns/filename.jpg)
    else if (filepath.startsWith('/uploads/')) {
      const parts = filepath.split('/');
      if (parts.length >= 4) {
        const type = parts[2];
        const filename = parts.slice(3).join('/');
        fullPath = path.join(uploadsDir, type, filename);
      }
    }
    // Sinon, c'est juste un nom de fichier
    else {
      fullPath = path.join(campaignsDir, filepath);
    }
    
    if (fullPath && fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Fichier supprimé: ${fullPath}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du fichier:', error.message);
  }
};

// Fonction pour nettoyer les fichiers temporaires anciens
exports.cleanupTempFiles = () => {
  try {
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;
      
      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Fichier temporaire nettoyé: ${file}`);
      }
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage des fichiers temporaires:', error);
  }
};

// Nettoyer les fichiers temporaires au démarrage
exports.cleanupTempFiles();
