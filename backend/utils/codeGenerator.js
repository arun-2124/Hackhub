const crypto = require('crypto');

/**
 * Generate a unique, human-friendly team invitation code
 * Format: 8-10 alphanumeric characters (e.g. TM-4K9E2X)
 */
const generateTeamCode = (prefix = 'TM') => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude visually ambiguous characters (0, O, 1, I)
  let result = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return `${prefix}-${result}`;
};

module.exports = {
  generateTeamCode
};
