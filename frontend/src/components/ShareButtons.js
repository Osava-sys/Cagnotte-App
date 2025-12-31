/**
 * Composant de partage sur réseaux sociaux
 * Permet de partager une campagne sur Facebook, Twitter/X, WhatsApp, LinkedIn, Email
 * et de copier le lien
 */

import React, { useState } from 'react';

const ShareButtons = ({
  url,
  title,
  description,
  hashtags = ['cagnotte', 'solidarité'],
  onShare,
  showLabel = false,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  // URL et texte à partager
  const shareUrl = url || window.location.href;
  const shareTitle = title || 'Soutenez cette cagnotte !';
  const shareDescription = description || 'Aidez-nous à atteindre notre objectif de collecte.';
  const hashtagsStr = hashtags.join(',');

  // URLs de partage pour chaque réseau
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}&hashtags=${hashtagsStr}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n\n${shareDescription}\n\n${shareUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\nDécouvrez cette cagnotte : ${shareUrl}`)}`
  };

  // Gérer le partage
  const handleShare = (platform) => {
    if (platform === 'copy') {
      handleCopyLink();
      return;
    }

    // Ouvrir dans une popup pour meilleure UX
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      shareLinks[platform],
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );

    // Callback pour tracking
    if (onShare) {
      onShare(platform);
    }

    setShareCount(prev => prev + 1);
  };

  // Copier le lien dans le presse-papier
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      if (onShare) {
        onShare('copy');
      }

      setShareCount(prev => prev + 1);

      // Reset après 2 secondes
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback pour navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Utiliser l'API Web Share si disponible (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl
        });

        if (onShare) {
          onShare('native');
        }

        setShareCount(prev => prev + 1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Erreur lors du partage:', err);
        }
      }
    }
  };

  // Classes CSS selon la taille
  const sizeClasses = {
    small: 'share-btn-small',
    medium: '',
    large: 'share-btn-large'
  };

  return (
    <div className="share-buttons-container">
      {/* Bouton de partage natif (mobile) */}
      {navigator.share && (
        <button
          className={`share-btn native ${sizeClasses[size]}`}
          onClick={handleNativeShare}
          title="Partager"
          aria-label="Partager via le menu natif"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          {showLabel && <span>Partager</span>}
        </button>
      )}

      {/* Facebook */}
      <button
        className={`share-btn facebook ${sizeClasses[size]}`}
        onClick={() => handleShare('facebook')}
        title="Partager sur Facebook"
        aria-label="Partager sur Facebook"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
        </svg>
        {showLabel && <span>Facebook</span>}
      </button>

      {/* Twitter/X */}
      <button
        className={`share-btn twitter ${sizeClasses[size]}`}
        onClick={() => handleShare('twitter')}
        title="Partager sur X (Twitter)"
        aria-label="Partager sur X (Twitter)"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        {showLabel && <span>X</span>}
      </button>

      {/* WhatsApp */}
      <button
        className={`share-btn whatsapp ${sizeClasses[size]}`}
        onClick={() => handleShare('whatsapp')}
        title="Partager sur WhatsApp"
        aria-label="Partager sur WhatsApp"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        {showLabel && <span>WhatsApp</span>}
      </button>

      {/* LinkedIn */}
      <button
        className={`share-btn linkedin ${sizeClasses[size]}`}
        onClick={() => handleShare('linkedin')}
        title="Partager sur LinkedIn"
        aria-label="Partager sur LinkedIn"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        {showLabel && <span>LinkedIn</span>}
      </button>

      {/* Email */}
      <button
        className={`share-btn email ${sizeClasses[size]}`}
        onClick={() => handleShare('email')}
        title="Partager par email"
        aria-label="Partager par email"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        {showLabel && <span>Email</span>}
      </button>

      {/* Copier le lien */}
      <button
        className={`share-btn copy ${copied ? 'copied' : ''} ${sizeClasses[size]}`}
        onClick={handleCopyLink}
        title={copied ? 'Lien copié !' : 'Copier le lien'}
        aria-label={copied ? 'Lien copié !' : 'Copier le lien'}
      >
        {copied ? (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        )}
        {showLabel && <span>{copied ? 'Copié !' : 'Copier'}</span>}
      </button>
    </div>
  );
};

export default ShareButtons;
