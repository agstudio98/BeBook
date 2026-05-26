const logger = require('../utils/logger');
const seedProducts = require('./productSeeder');
const seedSucursales = require('./sucursalSeeder');
const seedUsers = require('./userSeeder');
const seedForum = require('./forumSeeder');
const seedComentarios = require('./comentarioSeeder');

const runSeeders = async () => {
  logger.info('Iniciando verificación de integridad de datos...');
  
  try {
    // 1. Users (needed for forum and comments)
    const admin = await seedUsers();
    if (admin) {
      logger.success(`Usuario base creado: ${admin.email}`);
    }

    // 2. Products
    const productCount = await seedProducts();
    if (productCount) {
      logger.success(`${productCount} productos sembrados.`);
    }

    // 3. Sucursales
    const sucursalCount = await seedSucursales();
    if (sucursalCount) {
      logger.success(`${sucursalCount} sucursales sembradas.`);
    }

    // 4. Forum Topics
    const forumCount = await seedForum();
    if (forumCount) {
      logger.success(`${forumCount} temas de foro sembrados.`);
    }

    // 5. Comentarios
    const commentCount = await seedComentarios();
    if (commentCount) {
      logger.success(`${commentCount} comentarios sembrados.`);
    }

    logger.info('Verificación de datos completada.');
  } catch (error) {
    logger.error(`Error durante el sembrado de datos: ${error.message}`);
  }
};

module.exports = runSeeders;
