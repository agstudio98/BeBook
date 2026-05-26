const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token for a given user ID.
 * 
 * @param {string|import('mongoose').Types.ObjectId} id - The user ID to encode in the token.
 * @returns {string} The signed JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
