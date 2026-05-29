/**
 * @fileoverview Main application entry point for BeBook API.
 * Sets up Express, middlewares, routes, and starts the server.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const runSeeders = require('./seeders');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const routes = require('./routes');

// Load environment variables
dotenv.config();

/**
 * Validates that required environment variables are present.
 * Exits the process if any are missing.
 * @returns {void}
 */
const validateEnvironment = () => {
  const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
  const missingEnv = requiredEnv.filter(env => !process.env[env]);

  if (missingEnv.length > 0) {
    logger.error(`Faltan variables de entorno: ${missingEnv.join(', ')}`);
    process.exit(1);
  }
};

validateEnvironment();

const app = express();

/**
 * Configures all Express middlewares.
 * 
 * @param {import('express').Application} app - The Express application instance.
 */
const configureMiddlewares = (app) => {
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Serve static files
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

  // Request Logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.api(req.method, req.originalUrl, res.statusCode, duration);
    });
    next();
  });
};

/**
 * Mounts all application routes and error handlers.
 * 
 * @param {import('express').Application} app - The Express application instance.
 */
const configureRoutes = (app) => {
  // Direct API Welcome
  app.get('/api', (req, res) => {
    res.json({ message: 'BeBook API is live' });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Main API Routes
  app.use('/api', routes);

  app.get('/', (req, res) => {
    res.send('BeBook API is running...');
  });

  // Custom Error Middlewares
  app.use(notFound);
  app.use(errorHandler);
};

configureMiddlewares(app);
configureRoutes(app);

const PORT = process.env.PORT || 5000;

/**
 * Initializes database, runs seeders, and starts the Express server.
 * 
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    logger.header('BeBook API - Sistema de Gestión Literaria');
    
    // 1. Start Listening IMMEDIATELY (Crucial for Render/Cloud providers)
    app.listen(PORT, () => {
      logger.success(`Servidor en marcha en puerto ${PORT}`);
      logger.info(`Modo: ${process.env.NODE_ENV || 'development'}`);
      logger.divider();
    });

    // 2. Connect to Database in background
    connectDB().then(() => {
      // 3. Run Seeders only after successful connection
      runSeeders();
    }).catch(err => {
      logger.error(`Error diferido de BD: ${err.message}`);
    });

  } catch (error) {
    logger.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = app;


