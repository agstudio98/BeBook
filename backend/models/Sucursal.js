const mongoose = require('mongoose');

/**
 * @typedef {Object} ISucursal
 * @property {string} name - Name of the branch.
 * @property {string} address - Street address.
 * @property {string} city - City where the branch is located.
 * @property {string} province - Province/State.
 * @property {string} [postalCode] - Postal code.
 * @property {string} country - Country (defaults to Argentina).
 * @property {string} [phone] - Contact phone number.
 * @property {string} [email] - Contact email address.
 * @property {Object} location - Geospatial location.
 * @property {string} location.type - Type of geometry (Point).
 * @property {number[]} location.coordinates - [longitude, latitude] coordinates.
 * @property {string[]} services - List of services offered at this branch.
 * @property {string} [image] - URL or path to the branch image.
 * @property {number} rating - Average rating of the branch.
 * @property {number} numReviews - Total number of reviews.
 * @property {Date} createdAt - Timestamp when the entry was created.
 * @property {Date} updatedAt - Timestamp when the entry was last updated.
 */

/** @type {mongoose.Schema<ISucursal>} */
const sucursalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, required: true, default: 'Argentina' },
    phone: { type: String },
    email: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    services: [{ type: String }],
    image: { type: String },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Create geospatial index
sucursalSchema.index({ location: '2dsphere' });

/**
 * Sucursal Model
 * @type {mongoose.Model<ISucursal>}
 */
const Sucursal = mongoose.model('Sucursal', sucursalSchema);

module.exports = Sucursal;
