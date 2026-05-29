const express = require('express');
const router = express.Router();

/**
 * Main routes router
 * Mounts all sub-routes to the main API path
 */
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to BeBook API v1' });
});

router.use('/users', require('./userRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/support', require('./supportRoutes'));
router.use('/sucursales', require('./sucursalRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/comentarios', require('./comentarioRoutes'));
router.use('/forum', require('./forumRoutes'));

module.exports = router;
