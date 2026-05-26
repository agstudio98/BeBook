const express = require('express');
const router = express.Router();
const { getSucursales, getProvinces, getSucursalById } = require('../controllers/sucursalController');

/**
 * @route   GET /api/sucursales/provinces
 * @desc    Get all unique provinces
 * @access  Public
 */
router.route('/provinces').get(getProvinces);

/**
 * @route   GET /api/sucursales
 * @desc    Get all sucursales with filters and proximity
 * @access  Public
 */
router.route('/').get(getSucursales);

/**
 * @route   GET /api/sucursales/:id
 * @desc    Get sucursal by ID
 * @access  Public
 */
router.route('/:id').get(getSucursalById);

module.exports = router;
