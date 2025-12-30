// Simple logger basé sur console, permet de remplacer facilement par un logger tiers
const formatMessage = (level, message) => `[${level.toUpperCase()}] ${message}`;

module.exports = {
  info: (msg) => console.log(formatMessage('info', msg)),
  warn: (msg) => console.warn(formatMessage('warn', msg)),
  error: (msg) => console.error(formatMessage('error', msg)),
};

