const mongoose = require('mongoose');

/**
 * @typedef {Object} IPromotion
 * @property {string} code - Unique promotional code.
 * @property {string} description - Description of the promotion.
 * @property {number} discountPercentage - Discount percentage to be applied.
 * @property {Date} expiryDate - Expiration date of the promotion.
 * @property {boolean} isActive - Whether the promotion is currently active.
 * @property {Date} createdAt - Timestamp when the promotion was created.
 * @property {Date} updatedAt - Timestamp when the promotion was last updated.
 */

/** @type {mongoose.Schema<IPromotion>} */
const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    discountPercentage: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Promotion Model
 * @type {mongoose.Model<IPromotion>}
 */
const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
