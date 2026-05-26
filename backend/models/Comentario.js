const mongoose = require('mongoose');

/**
 * @typedef {Object} Comentario
 * @property {import('mongoose').Types.ObjectId} user - User who wrote the comment.
 * @property {import('mongoose').Types.ObjectId} [product] - Related product.
 * @property {import('mongoose').Types.ObjectId} [sucursal] - Related branch.
 * @property {import('mongoose').Types.ObjectId} [course] - Related course.
 * @property {string} text - Comment content.
 * @property {number} rating - Rating given (1-5).
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

const comentarioSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sucursal: { type: mongoose.Schema.Types.ObjectId, ref: 'Sucursal' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    text: { type: String, required: true },
    rating: { type: Number, required: true, default: 0, min: 1, max: 5 },
  },
  { timestamps: true }
);

/**
 * @type {import('mongoose').Model<Comentario>}
 */
module.exports = mongoose.model('Comentario', comentarioSchema);
