const mongoose = require('mongoose');

/**
 * @typedef {Object} ForumTopic
 * @property {import('mongoose').Types.ObjectId} user - User who created the topic.
 * @property {string} title - Title of the topic.
 * @property {string} content - Initial content of the topic.
 * @property {string} category - Category of the topic.
 * @property {number} views - Number of views.
 * @property {number} numReplies - Number of replies.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

const forumTopicSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    views: { type: Number, default: 0 },
    numReplies: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/**
 * @type {import('mongoose').Model<ForumTopic>}
 */
module.exports = mongoose.model('ForumTopic', forumTopicSchema);
