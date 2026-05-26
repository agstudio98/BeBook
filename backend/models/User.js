const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @typedef {Object} IReadingStats
 * @property {number} timeRead - Time read in minutes.
 * @property {number} booksFinished - Number of books finished.
 * @property {string[]} preferredGenres - List of preferred genres.
 */

/**
 * @typedef {Object} ISubscription
 * @property {string} plan - Name of the subscription plan.
 * @property {string} status - Status of the subscription.
 * @property {Date} [expiresAt] - Expiration date of the subscription.
 */

/**
 * @typedef {Object} IPaymentMethod
 * @property {'CARD' | 'MERCADO_PAGO'} methodType - Type of payment method.
 * @property {string} [cardType] - Type of card (e.g., Visa, Mastercard).
 * @property {string} [cardNumber] - Full card number (sensitive).
 * @property {string} [expiry] - Card expiration date.
 * @property {string} [cvv] - Card CVV (sensitive).
 * @property {string} [holderName] - Name of the card holder.
 * @property {string} [lastFour] - Last four digits of the card.
 * @property {boolean} isDefault - Whether this is the default payment method.
 * @property {string} [emailMP] - Email for Mercado Pago.
 */

/**
 * @typedef {Object} IUserPromotion
 * @property {string} code - Promotional code.
 * @property {string} description - Description of the promotion.
 * @property {number} discount - Discount amount/percentage.
 * @property {boolean} isUsed - Whether the promotion has been used.
 */

/**
 * @typedef {Object} IUser
 * @property {string} name - Name of the user.
 * @property {string} email - Email address (unique).
 * @property {string} [password] - Hashed password.
 * @property {string} [googleId] - Google ID for OAuth.
 * @property {string} avatar - URL to user's avatar.
 * @property {boolean} isAdmin - Whether the user has admin privileges.
 * @property {IReadingStats} readingStats - Statistics about user's reading.
 * @property {ISubscription} subscription - Subscription details.
 * @property {IPaymentMethod[]} paymentMethods - List of user's payment methods.
 * @property {IUserPromotion[]} promotions - List of promotions assigned to the user.
 * @property {Date} createdAt - Timestamp when the user was created.
 * @property {Date} updatedAt - Timestamp when the user was last updated.
 * @property {function(string): Promise<boolean>} matchPassword - Compares entered password with hashed password.
 */

/** @type {mongoose.Schema<IUser>} */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String, default: '' },
    isAdmin: { type: Boolean, required: true, default: false },
    readingStats: {
      timeRead: { type: Number, default: 0 }, // in minutes
      booksFinished: { type: Number, default: 0 },
      preferredGenres: [{ type: String }],
    },
    subscription: {
      plan: { type: String, default: 'Gratis' },
      status: { type: String, default: 'Inactivo' },
      expiresAt: { type: Date },
    },
    paymentMethods: [
      {
        methodType: { type: String, enum: ['CARD', 'MERCADO_PAGO'], default: 'CARD' },
        cardType: { type: String }, // Visa, Mastercard, Naranja
        cardNumber: { type: String },
        expiry: { type: String },
        cvv: { type: String },
        holderName: { type: String },
        lastFour: { type: String },
        isDefault: { type: Boolean, default: false },
        emailMP: { type: String }, // For Mercado Pago
      }
    ],
    promotions: [
      {
        code: { type: String },
        description: { type: String },
        discount: { type: Number },
        isUsed: { type: Boolean, default: false },
      }
    ]
  },
  { timestamps: true }
);

/**
 * Compares entered password with the hashed password in the database.
 * @param {string} enteredPassword - The plain text password to compare.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Pre-save middleware to hash password before saving to the database.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * User Model
 * @type {mongoose.Model<IUser>}
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
