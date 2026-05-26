const express = require('express');
const router = express.Router();
const {
  getTopics,
  getTopicById,
  createTopic,
  addReply,
  updateReply,
  deleteReply,
} = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/forum/topics
 * @route   POST /api/forum/topics
 * @desc    Get all topics or create a new topic
 * @access  Public/Private
 */
router.route('/topics')
  .get(getTopics)
  .post(protect, createTopic);

/**
 * @route   GET /api/forum/topics/:id
 * @desc    Get topic details by ID
 * @access  Public
 */
router.route('/topics/:id')
  .get(getTopicById);

/**
 * @route   POST /api/forum/topics/:id/replies
 * @desc    Add a reply to a topic
 * @access  Private
 */
router.route('/topics/:id/replies')
  .post(protect, addReply);

/**
 * @route   PUT /api/forum/replies/:id
 * @route   DELETE /api/forum/replies/:id
 * @desc    Update or delete a reply
 * @access  Private
 */
router.route('/replies/:id')
  .put(protect, updateReply)
  .delete(protect, deleteReply);

module.exports = router;
