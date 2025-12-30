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

