const mongoose = require('mongoose');

/**
 * @typedef {Object} ForumReply
 * @property {import('mongoose').Types.ObjectId} user - User who wrote the reply.
 * @property {import('mongoose').Types.ObjectId} topic - Topic this reply belongs to.
 * @property {import('mongoose').Types.ObjectId|null} parentReply - Parent reply if this is a nested reply.
 * @property {string} content - Reply content.
 * @property {boolean} isEdited - Whether the reply has been edited.
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */

const forumReplySchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    topic: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ForumTopic' },
    parentReply: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumReply', default: null },
    content: { type: String, required: true },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * @type {import('mongoose').Model<ForumReply>}
 */
module.exports = mongoose.model('ForumReply', forumReplySchema);
