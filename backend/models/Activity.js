const mongoose = require('mongoose');

/**
 * @typedef {Object} Activity
 * @property {import('mongoose').Types.ObjectId} user - User who performed the activity.
 * @property {string} type - Type of activity (COMMENT, PURCHASE, etc.).
 * @property {string} description - Description of the activity.
 * @property {import('mongoose').Types.ObjectId} [relatedId] - ID of related entity.
 * @property {number} [amount] - Amount involved if it's a purchase.
 * @property {Object} [metadata] - Additional metadata.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

const activitySchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    type: { 
      type: String, 
      required: true, 
      enum: ['COMMENT', 'PURCHASE', 'BOOKING', 'FORUM_TOPIC', 'FORUM_REPLY', 'SUBSCRIPTION_UPDATE'] 
    },
    description: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of the comment, order, or booking
    amount: { type: Number }, // For purchases
    metadata: { type: Object }, // Any extra info
  },
  { timestamps: true }
);

/**
 * @type {import('mongoose').Model<Activity>}
 */
module.exports = mongoose.model('Activity', activitySchema);
