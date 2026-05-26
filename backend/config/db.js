/**
 * @fileoverview Database configuration and connection logic.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Sleeps for a specified number of milliseconds.
 * 
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Connects to the MongoDB database with retry logic.
 * 
 * @param {number} retries - Number of connection attempts before failing.
 * @returns {Promise<void>}
 */
const connectDB = async (retries = 5) => {
  logger.info('Conectando a MongoDB...');
  
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      logger.success(`MongoDB Conectado: ${conn.connection.host}`);
      return;
    } catch (error) {
      logger.error(`Error de Conexión: ${error.message}`);
      retries -= 1;
      
      if (retries === 0) {
        logger.error('No se pudo conectar a la base de datos tras varios intentos. Abortando.');
        process.exit(1);
      }
      
      logger.warn(`Reintentos restantes: ${retries}`);
      await sleep(5000);
    }
  }
};

module.exports = connectDB;
