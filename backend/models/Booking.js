const mongoose = require('mongoose');

/**
 * @typedef {Object} Booking
 * @property {import('mongoose').Types.ObjectId} user - User who made the booking.
 * @property {import('mongoose').Types.ObjectId} sucursal - Branch where the booking is made.
 * @property {string} date - Date of the booking (YYYY-MM-DD).
 * @property {string} timeSlot - Time slot of the booking (e.g., "10:00").
 * @property {string} status - Status of the booking.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

const bookingSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    sucursal: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Sucursal' },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    timeSlot: { type: String, required: true }, // e.g., "10:00"
    status: { type: String, default: 'Confirmed' }
  },
  { timestamps: true }
);

// Ensure a user doesn't book the same slot twice, 
// and a slot isn't double-booked for the same branch
bookingSchema.index({ sucursal: 1, date: 1, timeSlot: 1 }, { unique: true });

/**
 * @type {import('mongoose').Model<Booking>}
 */
module.exports = mongoose.model('Booking', bookingSchema);
