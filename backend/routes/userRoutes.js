const express = require('express');
const router = express.Router();
const { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile,
  googleAuth,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} = require('../controllers/userController');
const { getUserActivities, getUserStats, syncUserActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// Debug logging
router.use((req, res, next) => {
  console.log(`[USER ROUTE] ${req.method} ${req.url}`);
  next();
});

// Auth Routes
router.post('/login', authUser);
router.post('/google', googleAuth);
router.post('/', registerUser);

// Payment Routes (Must be before /profile to avoid conflicts if needed, though they are distinct paths)
router.post('/payments', protect, addPaymentMethod);
router.put('/payments/:id', protect, updatePaymentMethod);
router.delete('/payments/:id', protect, deletePaymentMethod);

// Legacy/Compatibility Aliases
router.post('/profile/payment', protect, addPaymentMethod);
router.put('/profile/payment/:id', protect, updatePaymentMethod);
router.delete('/profile/payment/:id', protect, deletePaymentMethod);

// Profile Routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Activity & Stats Routes
router.get('/activities', protect, getUserActivities);
router.post('/activities/sync', protect, syncUserActivities);
router.get('/stats', protect, getUserStats);

module.exports = router;
