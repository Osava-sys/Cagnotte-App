# API d'Upload d'Images pour les Campagnes

Cette documentation explique comment utiliser l'API d'upload d'images pour les campagnes.

## Endpoints disponibles

### 1. Upload d'image principale

**POST** `/api/campaigns/:id/image`

Upload une image principale pour une campagne.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `image` (file): Le fichier image à uploader (JPEG, PNG, GIF)
  - Taille maximale: 5MB par défaut
  - Types acceptés: image/jpeg, image/png, image/gif

**Exemple avec curl:**
```bash
curl -X POST http://localhost:5000/api/campaigns/60d5ec49f1b2c72b8c8e4f1a/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/campaigns/image-1234567890-987654321.jpg",
    "campaign": { ... }
  },
  "message": "Image principale uploadée avec succès"
}
```

### 2. Upload de galerie d'images

**POST** `/api/campaigns/:id/gallery`

Upload plusieurs images pour la galerie d'une campagne (maximum 10 images).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `gallery` (files): Les fichiers images à uploader (tableau)
- `captions` (optional): Tableau de légendes pour chaque image (JSON string)

**Exemple avec curl:**
```bash
curl -X POST http://localhost:5000/api/campaigns/60d5ec49f1b2c72b8c8e4f1a/gallery \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "gallery=@/path/to/image1.jpg" \
  -F "gallery=@/path/to/image2.jpg" \
  -F "captions=[\"Légende 1\", \"Légende 2\"]"
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "/uploads/campaigns/image1-1234567890.jpg",
        "caption": "Légende 1",
        "order": 0
      },
      {
        "url": "/uploads/campaigns/image2-1234567890.jpg",
        "caption": "Légende 2",
        "order": 1
      }
    ],
    "campaign": { ... }
  },
  "message": "2 image(s) ajoutée(s) à la galerie avec succès"
}
```

### 3. Supprimer l'image principale

**DELETE** `/api/campaigns/:id/image`

Supprime l'image principale d'une campagne et la remplace par l'image par défaut.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "message": "Image principale supprimée avec succès",
  "data": { ... }
}
```

### 4. Supprimer une image de la galerie

**DELETE** `/api/campaigns/:campaignId/gallery/:imageId`

Supprime une image spécifique de la galerie d'une campagne.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "message": "Image supprimée de la galerie avec succès",
  "data": { ... }
}
```

## Exemple d'utilisation avec JavaScript (FormData)

```javascript
// Upload d'image principale
const uploadMainImage = async (campaignId, imageFile, token) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};

// Upload de galerie
const uploadGallery = async (campaignId, imageFiles, captions = [], token) => {
  const formData = new FormData();
  
  // Ajouter les fichiers
  imageFiles.forEach(file => {
    formData.append('gallery', file);
  });
  
  // Ajouter les légendes si fournies
  if (captions.length > 0) {
    formData.append('captions', JSON.stringify(captions));
  }

  const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}/gallery`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

## Exemple avec React

```jsx
import { useState } from 'react';
import { api } from '../services/api';

const CampaignImageUpload = ({ campaignId }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(
        `/campaigns/${campaignId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Image uploadée:', response.data);
      alert('Image uploadée avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && <p>Upload en cours...</p>}
    </div>
  );
};
```

## Configuration

Les paramètres d'upload peuvent être configurés dans le fichier `.env`:

```env
# Dossier d'upload (relatif au dossier backend)
UPLOADS_DIR=uploads

# Taille maximale des fichiers (en bytes)
MAX_FILE_SIZE=5242880  # 5MB

# Types de fichiers autorisés (séparés par des virgules)
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
```

## Structure des dossiers

Les fichiers uploadés sont stockés dans la structure suivante:

```
backend/
  uploads/
    campaigns/
      image-1234567890-987654321.jpg
      image-1234567891-987654322.png
    avatars/
      avatar-1234567890.jpg
```

## Accès aux fichiers

Les fichiers uploadés sont accessibles via l'URL:

```
http://localhost:5000/uploads/campaigns/filename.jpg
```

## Permissions

- Seul le créateur de la campagne ou un administrateur peut uploader/supprimer des images
- L'authentification est requise pour tous les endpoints d'upload

## Erreurs possibles

- `400`: Fichier trop volumineux, type non autorisé, ou aucun fichier fourni
- `401`: Non authentifié
- `403`: Non autorisé (pas le créateur de la campagne)
- `404`: Campagne non trouvée
- `500`: Erreur serveur
