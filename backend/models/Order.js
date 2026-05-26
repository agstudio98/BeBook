const mongoose = require('mongoose');

/**
 * @typedef {Object} OrderItem
 * @property {string} name - Product name.
 * @property {number} qty - Quantity.
 * @property {string} image - Product image URL.
 * @property {number} price - Product price at time of purchase.
 * @property {import('mongoose').Types.ObjectId} product - Related product.
 */

/**
 * @typedef {Object} ShippingAddress
 * @property {string} address - Street address.
 * @property {string} city - City.
 * @property {string} postalCode - Postal/Zip code.
 * @property {string} country - Country.
 */

/**
 * @typedef {Object} Order
 * @property {import('mongoose').Types.ObjectId} user - User who placed the order.
 * @property {OrderItem[]} orderItems - List of items ordered.
 * @property {ShippingAddress} shippingAddress - Delivery address.
 * @property {string} paymentMethod - Method of payment.
 * @property {number} totalPrice - Total order price.
 * @property {boolean} isPaid - Whether the order is paid.
 * @property {Date} [paidAt] - Timestamp of payment.
 * @property {boolean} isDelivered - Whether the order is delivered.
 * @property {Date} [deliveredAt] - Timestamp of delivery.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

/**
 * @type {import('mongoose').Model<Order>}
 */
module.exports = mongoose.model('Order', orderSchema);
