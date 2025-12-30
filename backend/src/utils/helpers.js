// Format currency
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Calculate percentage
exports.calculatePercentage = (current, goal) => {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
};

// Format date
exports.formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// Check if campaign is expired
exports.isExpired = (deadline) => {
  return new Date(deadline) < new Date();
};

