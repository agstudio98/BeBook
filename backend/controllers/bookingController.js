const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');
const { logActivity } = require('./activityController');

/**
 * @desc    Get occupied slots for a sucursal on a specific date
 * @route   GET /api/bookings/sucursal/:sucursalId
 * @access  Public
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getOccupiedSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;

  const bookings = await Booking.find({ 
    sucursal: req.params.sucursalId,
    date: date
  });

  const occupiedSlots = bookings.map(booking => booking.timeSlot);
  res.json(occupiedSlots);
});

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const createBooking = asyncHandler(async (req, res) => {
  try {
    const { sucursalId, date, timeSlot } = req.body;
    const userId = req.user._id;

    const userHasBooking = await Booking.findOne({ 
      user: userId,
      date: date
    });

    if (userHasBooking) {
      res.status(400);
      throw new Error('Ya tienes un turno reservado para este día.');
    }

    const booking = new Booking({
      user: userId,
      sucursal: sucursalId,
      date,
      timeSlot
    });

    const createdBooking = await booking.save();

    await logActivity(
      userId,
      'BOOKING',
      `Reservaste un turno para el ${date} a las ${timeSlot}`,
      createdBooking._id,
      null,
      { date, time: timeSlot }
    );

    res.status(201).json(createdBooking);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('Este turno ya ha sido reservado por otro usuario.');
    }
    throw error;
  }
});

/**
 * @desc    Update an existing booking
 * @route   PUT /api/bookings/:id
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const updateBooking = asyncHandler(async (req, res) => {
  const { date, timeSlot } = req.body;
  const bookingId = req.params.id;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    res.status(404);
    throw new Error('Reserva no encontrada');
  }

  if (booking.user.toString() !== userId.toString()) {
    res.status(401);
    throw new Error('No autorizado para modificar esta reserva');
  }

  // Check if new slot is occupied
  const slotTaken = await Booking.findOne({
    sucursal: booking.sucursal,
    date: date || booking.date,
    timeSlot: timeSlot || booking.timeSlot,
    _id: { $ne: booking._id }
  });

  if (slotTaken) {
    res.status(400);
    throw new Error('El nuevo turno seleccionado ya está ocupado.');
  }

  booking.date = date || booking.date;
  booking.timeSlot = timeSlot || booking.timeSlot;

  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});

/**
 * @desc    Delete a booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const deleteBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    res.status(404);
    throw new Error('Reserva no encontrada');
  }

  if (booking.user.toString() !== userId.toString()) {
    res.status(401);
    throw new Error('No autorizado para cancelar esta reserva');
  }

  await booking.deleteOne();

  await logActivity(
    userId,
    'BOOKING',
    `Cancelaste tu turno del ${booking.date}`,
    booking._id
  );

  res.json({ message: 'Reserva cancelada exitosamente' });
});

/**
 * @desc    Get logged in user bookings
 * @route   GET /api/bookings/mybookings
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('sucursal', 'name address city');
  
  res.json(bookings);
});

module.exports = { 
  getOccupiedSlots, 
  createBooking, 
  updateBooking, 
  deleteBooking, 
  getMyBookings 
};
