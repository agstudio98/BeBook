const mongoose = require('mongoose');

/**
 * @typedef {Object} IProduct
 * @property {string} name - The name of the product.
 * @property {string} author - The author of the product (e.g., book author).
 * @property {string} image - URL or path to the product image.
 * @property {string} description - Detailed description of the product.
 * @property {string} category - Category the product belongs to.
 * @property {'Libro' | 'Apunte' | 'Producto'} type - Type of product.
 * @property {number} price - Price of the product.
 * @property {number} countInStock - Number of units available in stock.
 * @property {boolean} isFree - Whether the product is free.
 * @property {string} [pdfUrl] - URL to the PDF file (for digital/free items).
 * @property {number} rating - Average rating of the product.
 * @property {number} numReviews - Total number of reviews.
 * @property {Date} createdAt - Timestamp when the product was created.
 * @property {Date} updatedAt - Timestamp when the product was last updated.
 */

/** @type {mongoose.Schema<IProduct>} */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['Libro', 'Apunte', 'Producto'],
      default: 'Libro'
    },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    isFree: { type: Boolean, required: true, default: false },
    pdfUrl: { type: String }, // Only for free/digital items
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

/**
 * Product Model
 * @type {mongoose.Model<IProduct>}
 */
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
