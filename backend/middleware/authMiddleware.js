const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

/**
 * Middleware to protect routes and ensure the user is authenticated.
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @throws {Error} 401 - If token is missing, invalid, or user is not found.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('No autorizado, usuario no encontrado');
      }
      
      return next();
    } catch (error) {
      console.error('Authentication Error:', error.message);
      res.status(401);
      throw new Error('No autorizado, token fallido');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, sin token');
  }
});

/**
 * Middleware to restrict access to admin-only routes.
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @throws {Error} 401 - If user is not an admin.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  
  res.status(401);
  throw new Error('No autorizado como administrador');
};

module.exports = { protect, admin };
