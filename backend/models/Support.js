const mongoose = require('mongoose');

/**
 * @typedef {Object} ISupport
 * @property {string} name - Name of the person requesting support.
 * @property {string} email - Email address of the person.
 * @property {string} subject - Subject of the support request.
 * @property {string} message - Content of the support request.
 * @property {Date} createdAt - Timestamp when the request was created.
 * @property {Date} updatedAt - Timestamp when the request was last updated.
 */

/** @type {mongoose.Schema<ISupport>} */
const supportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

/**
 * Support Model
 * @type {mongoose.Model<ISupport>}
 */
const Support = mongoose.model('Support', supportSchema);

module.exports = Support;
