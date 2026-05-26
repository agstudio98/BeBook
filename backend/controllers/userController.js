const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../middleware/asyncHandler');
const { logActivity } = require('./activityController');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Auth user with Google
 */
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email: rawEmail, name, picture: avatar } = payload;
  const email = rawEmail.toLowerCase();

  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = avatar;
      await user.save();
    }
  } else {
    user = await User.create({ name, email, googleId, avatar });
  }

  res.json(formatUserResponse(user));
});

/**
 * @desc    Auth user & get token
 */
const authUser = asyncHandler(async (req, res) => {
  const email = req.body.email ? req.body.email.toLowerCase() : '';
  const { password } = req.body;
  
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json(formatUserResponse(user));
  } else {
    res.status(401);
    throw new Error('Email o contraseña inválidos');
  }
});

/**
 * @desc    Register a new user
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase() : '';
  
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  const user = await User.create({ name, email, password });
  res.status(201).json(formatUserResponse(user));
});

/**
 * @desc    Get user profile
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    avatar: user.avatar,
    readingStats: user.readingStats,
    subscription: user.subscription,
    paymentMethods: user.paymentMethods,
  });
});

/**
 * @desc    Update user profile
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email ? req.body.email.toLowerCase() : user.email;
  user.avatar = req.body.avatar || user.avatar;
  
  if (req.body.password) {
    user.password = req.body.password;
  }
  
  if (req.body.subscription) {
    const oldPlan = user.subscription.plan;
    user.subscription = req.body.subscription;
    if (oldPlan !== user.subscription.plan) {
      await logActivity(user._id, 'SUBSCRIPTION_UPDATE', `Actualizaste tu suscripción al plan: ${user.subscription.plan}`, null, null, { plan: user.subscription.plan });
    }
  }

  const updatedUser = await user.save();
  res.json({
    ...formatUserResponse(updatedUser),
    readingStats: updatedUser.readingStats,
    subscription: updatedUser.subscription,
    paymentMethods: updatedUser.paymentMethods,
  });
});

/**
 * @desc    Add payment method
 */
const addPaymentMethod = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  const newMethod = req.body;
  if (user.paymentMethods.length === 0) {
    newMethod.isDefault = true;
  } else if (newMethod.isDefault) {
    user.paymentMethods.forEach(m => m.isDefault = false);
  }

  user.paymentMethods.push(newMethod);
  await user.save();
  res.status(201).json(user.paymentMethods);
});

/**
 * @desc    Update payment method
 */
const updatePaymentMethod = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  const method = user.paymentMethods.find(m => m._id.toString() === req.params.id);
  if (!method) {
    res.status(404);
    throw new Error('Método de pago no encontrado');
  }

  Object.assign(method, req.body);

  if (req.body.isDefault) {
    user.paymentMethods.forEach(m => {
      if (m._id.toString() !== req.params.id) m.isDefault = false;
    });
  }

  await user.save();
  res.json(user.paymentMethods);
});

/**
 * @desc    Delete payment method
 */
const deletePaymentMethod = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  const methodIndex = user.paymentMethods.findIndex(m => m._id.toString() === req.params.id);
  if (methodIndex === -1) {
    res.status(404);
    throw new Error('Método de pago no encontrado');
  }

  const wasDefault = user.paymentMethods[methodIndex].isDefault;
  user.paymentMethods.splice(methodIndex, 1);

  if (wasDefault && user.paymentMethods.length > 0) {
    user.paymentMethods[0].isDefault = true;
  }

  await user.save();
  res.json(user.paymentMethods);
});

// Helpers
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  avatar: user.avatar,
  token: generateToken(user._id),
});

module.exports = { 
  authUser, registerUser, getUserProfile, updateUserProfile, 
  googleAuth, addPaymentMethod, updatePaymentMethod, deletePaymentMethod 
};
