const logger = require('../utils/logger');

/**
 * Middleware to handle 404 Not Found errors.
 * 
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handling middleware.
 * 
 * @param {Error} error - The error object.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error for debugging
  logger.error(`${req.method} ${req.originalUrl}: ${error.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(error.stack);
  }

  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack,
  });
};

module.exports = { notFound, errorHandler };
