// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Calculate percentage
export const calculatePercentage = (current, goal) => {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// Format date short
export const formatDateShort = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

// Check if campaign is expired
export const isExpired = (deadline) => {
  return new Date(deadline) < new Date();
};

// Truncate text
export const truncate = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get full image URL - handles relative and absolute URLs
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE_URL.replace('/api', '');

export const getImageUrl = (imageUrl, fallback = null) => {
  if (!imageUrl) return fallback;

  // If it's already a full URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative path starting with /uploads, prepend backend URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  // If it's just a filename, assume it's in campaigns folder
  if (!imageUrl.includes('/')) {
    return `${BACKEND_URL}/uploads/campaigns/${imageUrl}`;
  }

  // Otherwise return as-is
  return imageUrl;
};

// Default placeholder image as data URL
export const DEFAULT_CAMPAIGN_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f7f9" width="400" height="300"/%3E%3Cg fill="%23b8bcc8"%3E%3Crect x="170" y="120" width="60" height="60" rx="5"/%3E%3Ccircle cx="185" cy="135" r="8"/%3E%3Cpath d="M175 165 L195 145 L215 165 L175 165"/%3E%3C/g%3E%3C/svg%3E';

