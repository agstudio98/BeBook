const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories } = require('../controllers/productController');

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories
 * @access  Public
 */
router.route('/categories').get(getCategories);

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.route('/').get(getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.route('/:id').get(getProductById);

module.exports = router;
