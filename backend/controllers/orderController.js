const Order = require('../models/Order');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { logActivity } = require('./activityController');

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({ user: userId });
  res.json(orders);
});

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
  } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user || !user.paymentMethods || user.paymentMethods.length === 0) {
    res.status(400);
    throw new Error('No tienes un método de pago configurado.');
  }

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No hay productos en la orden');
  }

  const order = new Order({
    orderItems,
    user: userId,
    shippingAddress,
    paymentMethod,
    totalPrice,
    isPaid: true, // Simulation: assume paid if payment method exists
    paidAt: Date.now()
  });

  const createdOrder = await order.save();
  
  await logActivity(
    userId, 
    'PURCHASE', 
    `Compraste ${orderItems.length} libro(s) por $${totalPrice}`,
    createdOrder._id,
    totalPrice,
    { count: orderItems.length }
  );

  res.status(201).json(createdOrder);
});

module.exports = { 
  getMyOrders, 
  addOrderItems 
};
