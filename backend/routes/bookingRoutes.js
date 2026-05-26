const express = require('express');
const router = express.Router();
const {
  getOccupiedSlots,
  createBooking,
  getMyBookings,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.route('/').post(protect, createBooking);

/**
 * @route   GET /api/bookings/mybookings
 * @desc    Get logged in user's bookings
 * @access  Private
 */
router.route('/mybookings').get(protect, getMyBookings);

/**
 * @route   GET /api/bookings/sucursal/:sucursalId
 * @desc    Get occupied slots for a specific sucursal
 * @access  Public
 */
router.route('/sucursal/:sucursalId').get(getOccupiedSlots);

/**
 * @route   PUT /api/bookings/:id
 * @route   DELETE /api/bookings/:id
 * @desc    Update or delete a booking
 * @access  Private
 */
router.route('/:id')
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

module.exports = router;
