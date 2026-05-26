const Activity = require('../models/Activity');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Comentario = require('../models/Comentario');
const ForumTopic = require('../models/ForumTopic');
const ForumReply = require('../models/ForumReply');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get user activities (History)
 * @route   GET /api/users/activities
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getUserActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(activities);
});

/**
 * @desc    Get user stats for dashboard
 * @route   GET /api/users/stats
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [activityCounts, spendingStats, bookingStats, counts] = await Promise.all([
    getActivityTypeCounts(userId),
    getSpendingOverTime(userId),
    getBookingStatsByMonth(userId),
    getContentCounts(userId)
  ]);

  res.json({
    activityCounts: activityCounts || [],
    spendingStats: spendingStats || [],
    bookingStats: bookingStats || [],
    counts
  });
});

/**
 * Aggregates activity counts by type for a user.
 * @param {string} userId - The user ID.
 * @returns {Promise<Array>}
 */
const getActivityTypeCounts = async (userId) => {
  return await Activity.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
};

/**
 * Aggregates spending over time for a user.
 * @param {string} userId - The user ID.
 * @returns {Promise<Array>}
 */
const getSpendingOverTime = async (userId) => {
  return await Order.aggregate([
    { $match: { user: userId, isPaid: true, createdAt: { $exists: true } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        total: { $sum: '$totalPrice' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

/**
 * Aggregates booking statistics by month for a user.
 * @param {string} userId - The user ID.
 * @returns {Promise<Array>}
 */
const getBookingStatsByMonth = async (userId) => {
  return await Booking.aggregate([
    { $match: { user: userId, date: { $exists: true, $type: 'string' } } },
    {
      $group: {
        _id: { $substr: ['$date', 0, 7] }, // Group by YYYY-MM from the date string
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

/**
 * Gets counts of various content types for a user.
 * @param {string} userId - The user ID.
 * @returns {Promise<Object>}
 */
const getContentCounts = async (userId) => {
  const [orders, bookings, comments, topics, replies] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Booking.countDocuments({ user: userId }),
    Comentario.countDocuments({ user: userId }),
    ForumTopic.countDocuments({ user: userId }),
    ForumReply.countDocuments({ user: userId })
  ]);

  return {
    orders,
    bookings,
    comments,
    forumPosts: topics + replies
  };
};

/**
 * @desc    Sync user activities from existing data
 * @route   POST /api/users/activities/sync
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const syncUserActivities = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [orders, bookings, comments, topics, replies] = await Promise.all([
    Order.find({ user: userId }),
    Booking.find({ user: userId }),
    Comentario.find({ user: userId }),
    ForumTopic.find({ user: userId }),
    ForumReply.find({ user: userId })
  ]);

  // Sync Orders
  for (const order of orders) {
    await logActivity(
      userId, 
      'PURCHASE', 
      `Compraste ${order.orderItems.length} libro(s) por $${order.totalPrice}`,
      order._id,
      order.totalPrice,
      { count: order.orderItems.length }
    );
  }

  // Sync Bookings
  for (const booking of bookings) {
    await logActivity(
      userId,
      'BOOKING',
      `Reservaste un turno para el ${booking.date} a las ${booking.timeSlot}`,
      booking._id,
      null,
      { date: booking.date, time: booking.timeSlot }
    );
  }

  // Sync Comments
  for (const comment of comments) {
    await logActivity(
      userId,
      'COMMENT',
      `Dejaste un comentario con una valoración de ${comment.rating} estrellas`,
      comment._id,
      null,
      { rating: comment.rating }
    );
  }

  // Sync Forum Topics
  for (const topic of topics) {
    await logActivity(
      userId,
      'FORUM_TOPIC',
      `Creaste un nuevo tema: "${topic.title}"`,
      topic._id,
      null,
      { title: topic.title }
    );
  }

  // Sync Forum Replies
  for (const reply of replies) {
    const topic = await ForumTopic.findById(reply.topic);
    await logActivity(
      userId,
      'FORUM_REPLY',
      `Respondiste al tema "${topic ? topic.title : 'Desconocido'}"`,
      reply._id,
      null,
      { topicTitle: topic ? topic.title : 'Desconocido' }
    );
  }

  res.json({ message: 'Historial sincronizado exitosamente' });
});

/**
 * Helper function to log activity (to be used in other controllers)
 * @param {string} userId - The user ID.
 * @param {string} type - Activity type.
 * @param {string} description - Activity description.
 * @param {string} [relatedId] - Related object ID.
 * @param {number} [amount] - Related amount (e.g., price).
 * @param {Object} [metadata] - Additional metadata.
 */
const logActivity = async (userId, type, description, relatedId = null, amount = null, metadata = {}) => {
  try {
    if (relatedId) {
      const exists = await Activity.findOne({ user: userId, type, relatedId });
      if (exists) return;
    }

    await Activity.create({
      user: userId,
      type,
      description,
      relatedId,
      amount,
      metadata
    });
  } catch (error) {
    console.error(`Error logging activity (${type}):`, error.message);
  }
};

module.exports = {
  getUserActivities,
  getUserStats,
  syncUserActivities,
  logActivity
};
