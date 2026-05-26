const mongoose = require('mongoose');

/**
 * @typedef {Object} Course
 * @property {string} title - Title of the course.
 * @property {string} description - Description of the course.
 * @property {string} instructor - Instructor's name.
 * @property {string} image - URL to the course image.
 * @property {string} category - Course category.
 * @property {number} price - Price of the course.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

const courseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

/**
 * @type {import('mongoose').Model<Course>}
 */
module.exports = mongoose.model('Course', courseSchema);
