const express = require('express');
const router = express.Router();
const { getMyOrders, addOrderItems } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.route('/').post(protect, addOrderItems);

/**
 * @route   GET /api/orders/myorders
 * @desc    Get logged in user orders
 * @access  Private
 */
router.route('/myorders').get(protect, getMyOrders);

module.exports = router;
